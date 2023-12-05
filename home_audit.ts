/**
 * required_fields.node.js - Validates that required home audit fields have a value.
 */
let TypeRules = require('./type_rules.node');
const Validation = require("./validation.node");
const ENUMS = require('./validation_enums.node');

const ERROR = ENUMS.ERROR;
const BLOCKER = ENUMS.BLOCKER;
const MANDATORY = ENUMS.MANDATORY;

const NestedBuildingSchema = require('./hescore_json_schema.js');
const Ajv = require("ajv");
const addFormats = require('ajv-formats');
const ajv = new Ajv({allErrors: true, strictTypes: false, strictSchema: false})
addFormats(ajv);
// Add the schema to the validator.
ajv.addSchema(NestedBuildingSchema);
// Add the custom keywords "error_msg" to the validator
ajv.addKeyword('error_msg');

const nullOrUndefined = [null, undefined];

const mandatoryMessage = "Missing value for mandatory field";

module.exports = getNestedValidationMessages;

/**
 * Perform the HES validation for the nested JSON format. Uses the JSON Schema for initial required field and field
 * limit validations (e.g. enums, within bounds, etc) and then performs secondary cross validation across the building
 * as a whole (e.g. the roof area is large enough to cover the floor area)
 * @param {object} homeValues - JSON object which follows the HES Nested JSON Schema
 * @return {{blocker: [{string, [string]}], error: [{string, [string]}], warning: [{string, [string]}]}} - Error messages
 * for the homeValues object, grouped by severity (blocker, error, warning). Messages in each severity group are grouped by
 * path in the JSON Schema to the error, and can contain multiple errors for a single item in the JSON Schema.
 */
function getNestedValidationMessages (homeValues) {
    const errorMessages = {}
    errorMessages[ENUMS.BLOCKER] = {};
    errorMessages[ENUMS.ERROR] = {};
    errorMessages[ENUMS.MANDATORY] = {};

    const nested_validate = ajv;
    const valid=nested_validate.validate(NestedBuildingSchema, homeValues);
    if(!valid) {
        nested_validate.errors.forEach((error) => {
            const {instancePath, params} = error;
            const errorPath = params.missingProperty ? `${instancePath}/${params.missingProperty}` : instancePath;
            addErrorMessage(errorMessages[ENUMS.ERROR], errorPath, convertAJVError(error))
        })
    }
    getCrossValidationMessages(homeValues, errorMessages);
    return errorMessages
}


/**
 * Convert the AJV error into an intelligible error message that the HES system knows how to display
 * @param {object} errorObj
 * @return {string|undefined|*}
 */
function convertAJVError(errorObj) {
    const {keyword, schemaPath, instancePath, message} = errorObj;
    const keyArr = errorObj.schemaPath.split('/');
    keyArr.shift(); // remove '#'
    const keywords_to_pop = ['required', 'const'];
    // If it's a keyword that's too deep (e.g. const, required) we should pop it to get the right level for the error message
    if(keywords_to_pop.includes(keyword)) {
        keyArr.pop();
    }
    const error_leaf = keyArr.reduce((acc, key) => {
        return acc[key]
    }, NestedBuildingSchema);

    const error_msg = error_leaf.error_msg
    const returnObj = {
        schemaPath, instancePath, keyword, message
    }
    if(error_msg) {
        return error_msg;
    }
    switch(keyword) {
        case 'minimum':
        case 'maximum':
            return returnObj.message;
        case 'required':
            return mandatoryMessage;
        case 'enum':
            return `${returnObj.message}: '${error_leaf.join('\', \'')}'`;
        default:
            returnObj.message = undefined;
            return undefined;
    }
}

/**
 * Get Cross Validation messages for the building to check for other errors.
 * @param {object} homeValues
 * @param {object} errorMessages
 */
function getCrossValidationMessages (homeValues, errorMessages) {
    getAboutObjectCrossValidationMessages(homeValues, errorMessages)
    getZoneCrossValidationMessages(homeValues.zone, homeValues.about, errorMessages);
    getSystemCrossValidation(homeValues.systems, errorMessages)
}

/**
 * Helper function to add the validation messages easily to the object
 * @param {object} errorMessageObj Container for the validation messages of a certain type (e.g. Blocker)
 * @param {string} path Path in the nested schema to the error area in the building object
 * @param {string} message Validation error message
 */
function addErrorMessage(errorMessageObj, path, message) {
    if(message) {
        if (errorMessageObj[path] === undefined) {
            errorMessageObj[path] = [];
        }
        errorMessageObj[path].push(message);
    }
}

/**
 * Cross validations for the "About" object in the nested JSON Schema
 */
function getAboutObjectCrossValidationMessages(building, errorMessages) {
    const {about} = building;
    // Since we need to make sure the year built and the assessment date aren't in the future, JS validation here.
    const fields = ['year_built', 'assessment_date'];
    const assessmentDateValidation = new Validation(TypeRules._date(about[fields[1]], Date.parse('2010-01-01'), Date.now()), BLOCKER);
    const yearValidation = new Validation(TypeRules._int(about[fields[0]], 1600, (new Date()).getFullYear()), BLOCKER);
    if(assessmentDateValidation && assessmentDateValidation['message']){
        addErrorMessage(errorMessages[assessmentDateValidation['type']], `/about/${about[fields[1]]}`, assessmentDateValidation['message']);
    }
    if(yearValidation && yearValidation['message']){
        addErrorMessage(errorMessages[yearValidation['type']], `/about/${about[fields[0]]}`, yearValidation['message']);
    }
}


/**
 * Cross validation for the "Zone" object in the nested JSON Schema
 */
function getZoneCrossValidationMessages (zone, about, errorMessages) {
    // zone wall
    getAdditionalWallZoneValidations(zone, about, errorMessages);

    // zone roof
    getAdditionalRoofZoneValidations(zone, about, errorMessages);

    // zone floor
    getAdditionalFloorZoneValidations(zone, about, errorMessages);
}

/**
 * Cross validation for zone walls
 * @param zone
 * @param about
 * @param errorMessages
 */
function getAdditionalWallZoneValidations(zone, about, errorMessages) {
    const {zone_wall} = zone;
    // First, we need to verify that all the walls are in a different position
    const sides = zone_wall.map(wall => wall.side);
    const duplicate_sides = sides.filter((side, i) => sides.indexOf(side) !== i);
    if(duplicate_sides.length !== 0) {
        duplicate_sides.forEach((side) => (
            addErrorMessage(errorMessages[ENUMS.BLOCKER], '/zone/zone_wall', `Duplicate wall side "${side}" detected. Ensure that each zone wall has a unique side`)
        ));
    }

    // Window validations
    checkWindowAreaValid(zone, about, errorMessages);

}

/**
 * Zone window must be smaller than the wall area
 */
function checkWindowAreaValid(zone, about, errorMessages) {
    const {zone_wall} = zone
    zone_wall.forEach((wall, index) => {
        const {side, zone_window} = wall;
        const wall_area = getWallArea(zone, about, ['front', 'back'].includes(side))
        if(zone_window && wall_area) {
            const {window_area} = zone_window;
            if(window_area && window_area > wall_area) {
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `zone/zone_wall/${index}/zone_window/window_area`, `Window area too large for wall.`);
            }
        }
    })
}

/**
 * Wall must be appropriate length for the conditioned footprint of the building
 */
function getWallLength(zone, about, is_front_back) {
    const conditioned_footprint = getBuildingConditionedFootprint(about, zone);
    if(conditioned_footprint) {
        return Math.floor(
            (is_front_back
                ? Math.sqrt((5 * conditioned_footprint) / 3)
                : Math.sqrt((3 * conditioned_footprint) / 5)
            )
        );
    }
    return false;
}

/**
 * Checks if the wall area is too bit for the building
 */
function getWallArea(zone, about, is_front_back) {
    const length = getWallLength(zone, about, is_front_back);
    const height = about.floor_to_ceiling_height || false;
    const stories = about.num_floor_above_grade || false;
    if(length && height && stories) {
        let one_story_area = length * height;
        if(is_front_back) {
            one_story_area -= 20;
        }
        return Math.floor(one_story_area * stories);
    }
    return false;


}

/**
 * Do the cross validations for the zone roof
 */
function getAdditionalRoofZoneValidations(zone, about, errorMessages) {
    const conditioned_footprint = getBuildingConditionedFootprint(about, zone);
    const {zone_roof} = zone;

    // Roof area
    checkRoofArea(zone, conditioned_footprint, errorMessages, 'roof_area');
    // Ceiling area
    checkRoofArea(zone, conditioned_footprint, errorMessages, 'ceiling_area');
    // Knee wall area
    checkKneeWallArea(zone_roof, conditioned_footprint, errorMessages);
    // Skylight area
    checkSkylightArea(zone_roof, conditioned_footprint, errorMessages);
}

/**
 * Check that the skylight isn't too big for the roof
 */
function checkSkylightArea(zone_roof_array, conditioned_footprint, errorMessages) {
    // Skylights must be smaller than the conditioned footprint
    let zone_skylight_area = 0
    zone_roof_array.forEach((roof) => {
        const {zone_skylight} = roof;
        if(zone_skylight && zone_skylight.skylight_area) {
            zone_skylight_area += zone_skylight.skylight_area
        }
    });
    if(zone_skylight_area > conditioned_footprint) {
        zone_roof_array.forEach((roof, index) => {
            if(roof.zone_skylight && roof.zone_skylight.skylight_area) {
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `zone/zone_roof/${index}/zone_skylight/skylight_area`, `Total skylight area exceeds the maximum allowed ${conditioned_footprint} sqft`)
            }
        })
    }
}

/**
 * Check that the knee wall is not too big for the attic
 */
function checkKneeWallArea(zone_roof, conditioned_footprint, errorMessages) {
    const max_knee_wall_area = (2 * conditioned_footprint) / 3;
    const combined_knee_wall_area = getCombinedArea(zone_roof.map((roof) => (roof.knee_wall)), 'area');
    if(combined_knee_wall_area > max_knee_wall_area) {
        zone_roof.forEach((roof, index) => {
            if(roof.knee_wall && roof.knee_wall.area) {
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `zone/zone_roof/${index}/knee_wall/area`, `Total knee wall area exceeds the maximum allowed ${Math.ceil(max_knee_wall_area)} sqft (2/3 the footprint area).`);
            }
        })
    }
}

/**
 * Check that the roof area isn't too big for the roof type
 */
function checkRoofArea(zone, conditioned_footprint, errorMessages, type) {
    const roof_type = type === 'roof_area' ? 'cath_ceiling' : 'vented_attic';
    const combined_type = type === 'roof_area' ? 'roof' : 'ceiling';
    const {zone_roof} = zone;
    const combined_area_invalid = checkCombinedAreaInvalid(zone);
    if(!combined_area_invalid) {
        const combinedRoofCeilArea = getCombinedRoofCeilingArea(zone_roof);
        const conditioned_area_invalid = checkConditionedAreaValid(combinedRoofCeilArea, conditioned_footprint, combined_type);
        if(conditioned_area_invalid) {
            zone_roof.forEach((roof, index) => {
                if(roof.roof_type === roof_type) {
                    addErrorMessage(errorMessages[ENUMS.BLOCKER], `/zone/zone_roof/${index}/${type}`, conditioned_area_invalid);
                }
            })
        }
    }
    else {
        zone_roof.forEach((roof, index) => {
            if(roof.roof_type === roof_type) {
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `/zone/zone_roof/${index}/${type}`, combined_area_invalid);
            }
        })
    }
}

/**
 * Check that the floor isn't too small for the combined area
 */
function checkFloorArea(zone, conditioned_footprint, errorMessages) {
    const {zone_floor} = zone;
    const combined_area_invalid = checkCombinedAreaInvalid(zone);
    if(!combined_area_invalid) {
        const combined_floor_area = getCombinedFloorArea(zone_floor);
        const conditioned_area_invalid = checkConditionedAreaValid(combined_floor_area, conditioned_footprint, 'floor');
        if(conditioned_area_invalid) {
            zone_floor.forEach((floor, index) => {
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `/zone/zone_floor/${index}/floor_area`, conditioned_area_invalid);
            })
        }
    }
    else {
        zone_floor.forEach((roof, index) => {
            addErrorMessage(errorMessages[ENUMS.BLOCKER], `/zone/zone_floor/${index}/floor_area`, combined_area_invalid);
        })
    }
}

/**
 * Check that the insulation level is appropriate for the foundation type
 */
function checkFoundationLevel(zone_floor_array, errorMessages) {
    zone_floor_array.forEach((floor, index) => {
        const {foundation_type, foundation_insulation_level} = floor;
        if(!nullOrUndefined.includes(foundation_type) && !nullOrUndefined.includes(foundation_insulation_level)) {
            if(foundation_type === 'slab_on_grade' && ![0, 5].includes(foundation_insulation_level)) {
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `/zone/zone_floor/${index}/foundation_insulation_level`, 'Insulation must be R-0 or R-5 for Slab on Grade Foundation');
            } else if(![0, 11, 19].includes(foundation_insulation_level)) {
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `/zone/zone_floor/${index}/foundation_insulation_level`, 'Insulation must be R-0, R-11, or R-19 for current foundation type');
            }
        }
    });
}

/**
 * Check that the conditioned area is within the bounds for the building footprint
 */
function checkConditionedAreaValid(combined_area, conditioned_footprint, area_type) {
    const min = conditioned_footprint * 0.95;
    const max = conditioned_footprint * 2.5;
    if(!((min < combined_area) && (combined_area < max))) {
        return `This home's minimum footprint is approximately ${conditioned_footprint}sqft, but you have specified ${combined_area}sqft of total ${area_type} area. The allowed range is (${Math.ceil(min)}sqft - ${Math.floor(max)}sqft). Please adjust any incorrect values. *The footprint is calculated as (<total area> - <conditioned basement area>) / <number of floors>`;
    }
}

/**
 * Do the additional validations for the zone floors
 */
function getAdditionalFloorZoneValidations(zone, about, errorMessages) {
    const conditioned_footprint = getBuildingConditionedFootprint(about, zone);

    // Conditioned Footprint for home must be greater than 250 sq ft.
    if(conditioned_footprint < 250) {
        addErrorMessage(errorMessages[ENUMS.BLOCKER], '/about/conditioned_floor_area', `Home footprint must be greater than 250 sq ft. Current footprint is ${conditioned_footprint} sq ft.`);
    }

    // Floor area is within bounds of conditioned floor area
    checkFloorArea(zone, conditioned_footprint, errorMessages);

    // Validate foundation insulation level is correct for foundation type
    checkFoundationLevel(zone.zone_floor, errorMessages);
}

/**
 * Helper to get the conditioned area of a particular field for a building
 */
function getCombinedArea(array_obj, field_name) {
    let combined_area = 0;
    array_obj.filter((obj) => (!nullOrUndefined.includes(obj))).forEach((obj) => {
        if(!nullOrUndefined.includes(obj[field_name])) {
            combined_area += obj[field_name]
        }
    });
    return Math.floor(combined_area);
}

function getCombinedFloorArea(zone_floor_array) {
    return getCombinedArea(zone_floor_array, 'floor_area');
}

function getCombinedCeilingArea(zone_roof_array) {
    return getCombinedArea(zone_roof_array, 'ceiling_area');
}

function getCombinedRoofArea(zone_roof_array) {
    return getCombinedArea(zone_roof_array, 'roof_area');
}

function getCombinedRoofCeilingArea(zone_roof_array) {
    return getCombinedRoofArea(zone_roof_array) + getCombinedCeilingArea(zone_roof_array);
}

/**
 * Check that the roof is large enough to cover the floor area
 */
function checkCombinedAreaInvalid(zone) {
    const combined_floor = getCombinedFloorArea(zone.zone_floor);
    const combined_roof_ceiling = getCombinedRoofCeilingArea(zone.zone_roof);
    return (combined_roof_ceiling <= (combined_floor * .95)) ? "The roof does not cover the floor" : false;
}

function getBuildingConditionedFootprint(about, zone) {
    const {zone_floor} = zone;
    const {conditioned_floor_area, num_floor_above_grade} = about;
    let conditioned_basement_area = 0;
    // For conditioned footprint, we need to subtract the area of any conditioned basement floors
    zone_floor.filter((floor) => (
        floor.foundation_type === 'cond_basement'
    )).forEach((floor) => (
        conditioned_basement_area += floor.floor_area
    ));
    const footprint_area = conditioned_floor_area - conditioned_basement_area;
    return Math.floor(footprint_area / num_floor_above_grade);
}

/**
 * Get the Cross validation messages for the system of the JSON Schema
 * @param {object} systems
 * @param {object} errorMessages
 */
function getSystemCrossValidation(systems, errorMessages) {
    const {hvac, domestic_hot_water, generation} = systems;
    if(hvac) {
        checkHvacFraction(hvac, errorMessages);
        hvac.forEach((hvac_system, index) => {
            checkHeatingCoolingTypeValid(hvac_system, index, errorMessages);
            checkHeatingEfficiencyValid(hvac_system, index, errorMessages);
            checkCoolingEfficiencyValid(hvac_system, index, errorMessages);
            checkSystemYearValid(hvac_system, index, errorMessages);
            checkHvacDistribution(hvac_system, index, errorMessages);
        });
    }
    if(domestic_hot_water) {
        checkHotWaterCategoryValid(domestic_hot_water, hvac, errorMessages);
        checkHotWaterFuelValid(domestic_hot_water, errorMessages);
        checkHotWaterEfficiencyValid(domestic_hot_water, errorMessages);
        checkHotWaterYearValid(domestic_hot_water, errorMessages);
        checkHotWaterEnergyFactorValid(domestic_hot_water, errorMessages);
    }
    if(generation && generation.solar_electric) {
        checkSolarElectricYearValid(generation.solar_electric, errorMessages);
    }
}

/**
 * Check that the HVAC fraction is equal to 1 (100%)
 */
function checkHvacFraction(hvac, errorMessages) {
    let total_fraction = 0;
    hvac.forEach((hvac_system) => {
        if(hvac_system.hvac_fraction) {
            total_fraction += hvac_system.hvac_fraction;
        }
    });
    if(total_fraction !== 1) {
        hvac.forEach((hvac_system, index) => {
            if (hvac_system.hvac_fraction) {
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/hvac_fraction`, `Total HVAC Fraction must equal 100%`);
            }
        });
    }
}

/**
 * Check that the heating and cooling methods are compatible
 */
function checkHeatingCoolingTypeValid(hvac_system, index, errorMessages) {
    const {heating, cooling} = hvac_system;
    if(heating && cooling) {
        const heating_type = heating.type;
        const heating_fuel = heating.fuel_primary;
        const cooling_type = cooling.type;
        // At least one needs to have a type set.
        if((heating_type === 'none') && (cooling_type === 'none')) {
            addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/heating/type`, `Heating Type is required if there is no Cooling type`);
            addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/cooling/type`, `Cooling Type is required if there is no Heating type`);
        }
        // Validate that the fuel type is correct for the heating type
        if((!heating_type || heating_type === 'none') && !heating_fuel) {
            addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/heating/fuel_primary`, `Cannot enter heating type without fuel`);
        }
        else if(ENUMS.heatingFuelToType[heating_fuel] && !ENUMS.heatingFuelToType[heating_fuel].includes(heating_type)) {
            addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/heating/fuel_primary`, `${heating_fuel} is not an appropriate fuel for heating type ${heating_type}`);
        }

        // Validate the cooling type is valid for the heating type
        let heat_cool_valid = true
        switch(cooling_type) {
            // If cooling is heat_pump or gchp, heating type must match, be wood_stove, or be none
            case 'heat_pump':
            case 'gchp':
                if(![cooling_type, 'wood_stove', 'none'].includes(heating_type)) {
                    heat_cool_valid = false;
                }
                break;
            case 'mini_split':
                if(['heat_pump', 'gchp'].includes(heating_type)){
                    heat_cool_valid = false;
                }
                break;
            case 'split_dx':
                if(['heat_pump', 'gchp', 'mini_split'].includes(heating_type)){
                    heat_cool_valid = false;
                }
                break;
            case 'dec':
                if(['gchp'].includes(heating_type)){
                    heat_cool_valid = false;
                }
                break;
        }
        if(!heat_cool_valid) {
            addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/heating/type`, `${heating_type} is not an appropriate heating type with cooling type ${cooling_type}`);
        }
    }
}

/**
 * Check that the efficiency method is valid for the heating type
 */
function checkHeatingEfficiencyValid(hvac_system, index, errorMessages) {
    const {heating} = hvac_system;
    if(heating) {
        const {type, primary_fuel, efficiency_method} = heating;
        if(efficiency_method &&
            ([...nullOrUndefined, 'baseboard', 'wood_stove', 'none'].includes(type) ||
            (type === 'central_furnace' && primary_fuel === 'electric'))
        ) {
            addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/heating/efficiency_method`, `Efficiency method should not be set if heating type is "central furnace" and fuel is "electric", or if heating type is "baseboard", "wood stove", "none", or empty`);
        }
        if(efficiency_method === 'shipment_weighted') {
            if(type === 'wall_furnace' && primary_fuel !== 'natural_gas') {
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/heating/efficiency_method`, `Efficiency method must be "user" if heating type is "wall_furnace" and fuel is not "natural_gas"`)
            }
            if(['mini_split', 'gchp'].includes(type)) {
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/heating/efficiency_method`, `Heating efficiency method must be "user" when heating type is "${type}"`)
            }
        }
    }
}

/**
 * Check that the efficiency method is valid for the cooling type
 */
function checkCoolingEfficiencyValid(hvac_system, index, errorMessages) {
    const {cooling} = hvac_system;
    if(cooling) {
        const {type, efficiency_method} = cooling;
        if(efficiency_method && [...nullOrUndefined, 'none', 'dec'].includes(type)) {
            addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/cooling/efficiency_method`, `Efficiency method should not be set if cooling type is "none", "direct evaporative cooler", or empty`);
        }
        if(efficiency_method !== 'user' && ['mini_split', 'gchp'].includes(type)) {
            addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/cooling/efficiency_method`, `Cooling efficiency must be 'user' when type is '${type}'`);
        }
    }
}

/**
 * Check that the HVAC system is of a valid year
 */
function checkSystemYearValid(hvac_system, index, errorMessages) {
    ['heating', 'cooling'].forEach((accessor) => {
        const item = hvac_system[accessor];
        if(item && item.year && (1970 > item.year || (new Date()).getFullYear() < item.year)) {
            addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/${accessor}/year`, `Invalid year, must be between 1970 and ${(new Date()).getFullYear()}`)
        }
    })
}

/**
 * Check that the total HVAC distribution is 1 (100%)
 */
function checkHvacDistribution(hvac_system, index, errorMessages) {
    const {hvac_distribution} = hvac_system;
    if(hvac_distribution) {
        const {leakage_method, leakage_to_outside, duct} = hvac_distribution;
        if(leakage_to_outside && leakage_method === 'qualitative') {
            addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/hvac_distribution/leakage_to_outside`, "Leakage should not be passed for your system if the method is 'qualitative'");
        }
        // If we have ducts, we need to ensure the fraction is 100%
        if(duct) {
            let total_fraction = 0;
            duct.forEach((duct_item) => {
                if(duct_item.fraction) {
                    total_fraction += duct_item.fraction;
                }
            });
            if(total_fraction !== 1) {
                duct.forEach((duct_item, sub_i) => {
                    if(duct_item.fraction) {
                        addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/hvac/${index}/hvac_distribution/duct/${sub_i}/fraction`, `Total Duct Fraction must equal 100%`);
                    }
                })
            }
        }
    }
}

/**
 * Check that if the hot water is 'combined' the HVAC system has a boiler
 */
function checkHotWaterCategoryValid(hot_water, hvac, errorMessages) {
    const {category} = hot_water;
    const hvac_types = [];
    hvac.forEach((system) => {
        const {heating, cooling} = system;
        heating && hvac_types.push(heating.type);
        cooling && hvac_types.push(cooling.type);
    });
    if(!hvac_types.includes('boiler') && category === 'combined') {
        addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/domestic_hot_water/category`, 'Must have a boiler for combined hot water category');
    }
}

/**
 * Check that fuel is appropriate for the hot water system
 */
function checkHotWaterFuelValid(hot_water, errorMessages) {
    const {type, fuel_primary} = hot_water;
    if(['tankless_coil', 'indirect'].includes(type) && !nullOrUndefined.includes(fuel_primary)) {
        addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/domestic_hot_water/fuel_primary`, 'Fuel is only used if type is set to storage or heat pump');
    } else if(type === 'heat_pump' && fuel_primary !== 'electric') {
        addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/domestic_hot_water/fuel_primary`, 'Fuel must be electric if type is heat pump');
    }
}

/**
 * Check that efficiency is appropriate for the hot water system
 */
function checkHotWaterEfficiencyValid(hot_water, errorMessages) {
    const {type, efficiency_method} = hot_water;
    if(['heat_pump', 'tankless', 'tankless_coil'].includes(type) && efficiency_method === 'shipment_weighted') {
        addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/domestic_hot_water/efficiency_method`, 'Invalid Efficiency Method for entered Hot Water Type');
    }
}

/**
 * Check that the year is appropriate for the hot water system
 */
function checkHotWaterYearValid(hot_water, errorMessages) {
    const {year} = hot_water;
    if(year && (1972 > year || (new Date()).getFullYear() < year)) {
        addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/domestic_hot_water/year`, `Invalid year, must be between 1972 and ${(new Date()).getFullYear()}`)
    }
}

/**
 * Check that the energy factor is valid for the hot water system
 */
function checkHotWaterEnergyFactorValid(hot_water, errorMessages) {
    const {type, energy_factor} = hot_water;
    if(["indirect", "tankless_coil"].includes(type) && !nullOrUndefined.includes(energy_factor)) {
        addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/domestic_hot_water/energy_factor`, `Energy Factor not valid for selected Hot Water Type`);
    }
    let min,max;
    if (type === 'storage') {
        [min, max] = [0.45, 0.95];
    } else if (type === 'tankless') {
        [min, max] = [0.45, 0.99];
    } else if (type === 'heat_pump') {
        [min, max] = [1, 4];
    }
    if(energy_factor && (energy_factor < min || energy_factor > max)) {
        addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/domestic_hot_water/energy_factor`, `${energy_factor} is outside the allowed range (${min} - ${max})`);
    }
}

/**
 * Check that the solar electric system is of a valid year
 */
function checkSolarElectricYearValid(solar_electric, errorMessages) {
    const {year} = solar_electric;
    if(year && (2000 > year || (new Date()).getFullYear() < year)) {
        addErrorMessage(errorMessages[ENUMS.BLOCKER], `systems/generation/solar_electric/year`, `Invalid year, must be between 2000 and ${(new Date()).getFullYear()}`)
    }
}
