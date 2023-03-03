/**
 * required_fields.node.js - Validates that required home audit fields have a value.
 */
let TypeRules = require('./type_rules.node');
let validationRules = require('./validation_rules');
const ENUMS = require('./validation_enums.node')
const NestedBuildingSchema = require('./nested_building_schema');
const Ajv = require("ajv");
const addFormats = require('ajv-formats');
const ajv = new Ajv({allErrors: true, strictTypes: false, strictSchema: false})
addFormats(ajv);

/**
 * Casts string to matching boolean, or null if no exact match
 * @param {string|int|bool|null} value
 */
function castBool(value) {
    const trueOptions = [1, '1', true, 'true'];
    const falseOptions = [0, '0', false, 'false'];
    if(trueOptions.indexOf(value) > -1) {
        return true;
    } else if(falseOptions.indexOf(value) > -1) {
        return false;
    } else {
        return null;
    }
}

nullOrUndefined = [null, undefined];

mandatoryMessage = "Missing value for mandatory field";

flatRequiredFields = {
    assessment_date : mandatoryMessage,
    blower_door_test : mandatoryMessage,
    conditioned_floor_area : mandatoryMessage,
    floor_to_ceiling_height : mandatoryMessage,
    num_floor_above_grade : mandatoryMessage,
    number_bedrooms : mandatoryMessage,
    orientation : mandatoryMessage,
    shape : mandatoryMessage,
    year_built : mandatoryMessage,
    hot_water_type : mandatoryMessage,
    hvac_fraction_1 : mandatoryMessage,
    heating_type_1 : mandatoryMessage,
    heating_fuel_1 : mandatoryMessage,
    cooling_type_1 : mandatoryMessage,
    roof_type_1 : mandatoryMessage,
    floor_area_1 : mandatoryMessage,
    wall_construction_same : mandatoryMessage,
    window_construction_same : mandatoryMessage
};

module.exports = function (homeValues) {
    // If we are given the new version of the home object, we need to validate the nested version instead
    /* To handle the update where all building information is inside the `building_unit` property and then `building` inside
    return homeValues.building_unit ? getNestedRequiredFields(homeValues.building_unit) : getFlatRequiredFields(homeValues);
     */
    return homeValues.building ? getNestedRequiredFields(homeValues) : getFlatRequiredFields(homeValues);
}

function setupAJV () {
    ajv.addSchema(NestedBuildingSchema);
    // Add the custom keywords "error_msg"
    ajv.addKeyword('error_msg');
    // const schema = ajv.getSchema("https://github.com/NREL/hescore-hpxml/blob/master/hescorehpxml/schemas/hescore_json.schema.json")
    // return ajv.compile(NestedBuildingSchema)
    return ajv;
}

function getNestedRequiredFields (homeValues) {
    const errorMessages = {}
    errorMessages[ENUMS.BLOCKER] = {};
    errorMessages[ENUMS.ERROR] = {};
    errorMessages[ENUMS.MANDATORY] = {};

    const nested_validate = setupAJV();
    const valid=nested_validate.validate(NestedBuildingSchema, homeValues);
    if(!valid) {
        nested_validate.errors.forEach((error) => {
            const {instancePath, params} = error;
            const errorPath = params.missingProperty ? `${instancePath}/${params.missingProperty}` : instancePath;
            addErrorMessage(errorMessages[ENUMS.BLOCKER], errorPath, convertAJVError(error))
        })
    }
    getCrossValidationMessages(homeValues.building, errorMessages);
    return errorMessages
}

function convertAJVError(errorObj) {
    const {keyword, schemaPath, instancePath, params, message} = errorObj;
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
    // first = false;
    const returnObj = {
        schemaPath, instancePath, keyword, message
    }
    if(error_msg) {
        return error_msg;
    }
    switch(keyword) {
        case 'minimum':
        case 'maximum':
            return returnObj.message; // = message;
        case 'required':
            return mandatoryMessage; // returnObj.message = mandatoryMessage;
        case 'enum':
            return `${returnObj.message}: '${error_leaf.join('\', \'')}'`;
        default:
            returnObj.message = undefined;
            return undefined;
    }
}

function getCrossValidationMessages (homeValues, errorMessages) {
    const CrossValidator = new validationRules(homeValues);
    getAboutObjectCrossValidationMessages(homeValues, errorMessages, CrossValidator)
    getZoneCrossValidationMessages(homeValues, errorMessages);
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
function getAboutObjectCrossValidationMessages(building, errorMessages, CrossValidator) {
    const {about} = building;
    // Since we need to make sure the year built and the assessment date aren't in the future, JS validation here.
    const fields = ['year_built', 'assessment_date'];
    for(const index in fields) {
        const field = fields[index]
        if(![null, undefined].includes(about[field])) {
            const validationResult = CrossValidator[field](about[field])
            if(validationResult && validationResult['message']) {
                addErrorMessage(errorMessages[validationResult['type']], `/building/about/${field}`, validationResult['message']);
            }
        }
    }
}

function getZoneCrossValidationMessages(homeValues, errorMessages) {
    additionalZoneCrossValidation(homeValues.zone, homeValues.about, errorMessages);
    additionalSystemCrossValidation(homeValues.systems, errorMessages)
}

function additionalZoneCrossValidation (zone, about, errorMessages) {
    // zone wall
    getAdditionalWallZoneValidations(zone, about, errorMessages);

    // zone roof
    getAdditionalRoofZoneValidations(zone, about, errorMessages);

    // zone floor
    getAdditionalFloorZoneValidations(zone, about, errorMessages);
}

function getAdditionalWallZoneValidations(zone, about, errorMessages) {
    const {zone_wall} = zone;
    // First, we need to verify that all the walls are in a different position
    const sides = zone_wall.map(wall => wall.side);
    const duplicate_sides = sides.filter((side, i) => sides.indexOf(side) !== i);
    if(duplicate_sides.length !== 0) {
        duplicate_sides.forEach((side) => (
            addErrorMessage(errorMessages[ENUMS.BLOCKER], '/building/zone/zone_wall', `Duplicate wall side "${side}" detected. Ensure that each zone wall has a unique side`)
        ));
    }

    // Window validations
    checkWindowAreaValid(zone, about, errorMessages);

}

function checkWindowAreaValid(zone, about, errorMessages) {
    const {zone_wall} = zone
    zone_wall.forEach((wall, index) => {
        const {side, zone_window} = wall;
        const wall_area = getWallArea(zone, about, ['front', 'back'].includes(side))
        if(zone_window && wall_area) {
            const {window_area} = zone_window;
            if(window_area && window_area > wall_area) {
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `building/zone/zone_wall/${index}/zone_window/window_area`, `Window area too large for wall.`);
            }
        }
    })
}

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
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `building/zone/zone_roof/${index}/zone_skylight/skylight_area`, `Total skylight area exceeds the maximum allowed ${conditioned_footprint} sqft`)
            }
        })
    }
}

function checkKneeWallArea(zone_roof, conditioned_footprint, errorMessages) {
    const max_knee_wall_area = (2 * conditioned_footprint) / 3;
    const combined_knee_wall_area = getCombinedArea(zone_roof.map((roof) => (roof.knee_wall)), 'area');
    if(combined_knee_wall_area > max_knee_wall_area) {
        zone_roof.forEach((roof, index) => {
            if(roof.knee_wall && roof.knee_wall.area) {
                addErrorMessage(errorMessages[ENUMS.ERROR], `building/zone/zone_roof/${index}/knee_wall/area`, `Total knee wall area exceeds the maximum allowed ${Math.ceil(max_knee_wall_area)} sqft (2/3 the footprint area).`);
            }
        })
    }
}

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
                    addErrorMessage(errorMessages[ENUMS.ERROR], `/zone/zone_roof/${index}/${type}`, conditioned_area_invalid);
                }
            })
        }
    }
    else {
        zone_roof.forEach((roof, index) => {
            if(roof.roof_type === roof_type) {
                addErrorMessage(errorMessages[ENUMS.ERROR], `/zone/zone_roof/${index}/${type}`, combined_area_invalid);
            }
        })
    }
}

function checkFloorArea(zone, conditioned_footprint, errorMessages) {
    const {zone_floor} = zone;
    const combined_area_invalid = checkCombinedAreaInvalid(zone);
    if(!combined_area_invalid) {
        const combined_floor_area = getCombinedFloorArea(zone_floor);
        const conditioned_area_invalid = checkConditionedAreaValid(combined_floor_area, conditioned_footprint, 'floor');
        if(conditioned_area_invalid) {
            zone_floor.forEach((floor, index) => {
                addErrorMessage(errorMessages[ENUMS.ERROR], `/zone/zone_floor/${index}/floor_area`, conditioned_area_invalid);
            })
        }
    }
    else {
        zone_floor.forEach((roof, index) => {
            addErrorMessage(errorMessages[ENUMS.ERROR], `/zone/zone_floor/${index}/floor_area`, combined_area_invalid);
        })
    }
}

function checkFoundationLevel(zone_floor_array, errorMessages) {
    zone_floor_array.forEach((floor, index) => {
        const {foundation_type, foundation_insulation_level} = floor;
        if(!nullOrUndefined.includes(foundation_type) && !nullOrUndefined.includes(foundation_insulation_level)) {
            if(foundation_type === 'slab_on_grade' && ![0, 5].includes(foundation_insulation_level)) {
                addErrorMessage(errorMessages[ENUMS.ERROR], `/zone/zone_floor/${index}/foundation_insulation_level`, 'Insulation must be R-0 or R-5 for Slab on Grade Foundation');
            } else if(![0, 11, 19].includes(foundation_insulation_level)) {
                addErrorMessage(errorMessages[ENUMS.ERROR], `/zone/zone_floor/${index}/foundation_insulation_level`, 'Insulation must be R-0, R-11, or R-19 for current foundation type');
            }
        }
    });
}

function checkConditionedAreaValid(combined_area, conditioned_footprint, area_type) {
    const min = conditioned_footprint * 0.95;
    const max = conditioned_footprint * 2.5;
    if(!((min < combined_area) && (combined_area < max))) {
        return `
            This home's minimum footprint is approximately ${conditioned_footprint}sqft, but you
            have specified ${combined_area}sqft of total ${area_type} area. The allowed range
            is (${Math.ceil(min)}sqft - ${Math.floor(max)}sqft).
            Please adjust any incorrect values. *The footprint is calculated as
            (<total area> - <conditioned basement area>) / <number of floors>
        `;
    }
}

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

function additionalSystemCrossValidation(systems, errorMessages) {
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
                addErrorMessage(errorMessages[ENUMS.BLOCKER], `building/systems/hvac/${index}/hvac_fraction`, `Total HVAC Fraction must equal 100%`);
            }
        });
    }
}

function checkHeatingCoolingTypeValid(hvac_system, index, errorMessages) {
    const {heating, cooling} = hvac_system;
    if(heating && cooling) {
        const heating_type = heating.type;
        const heating_fuel = heating.fuel_primary;
        const cooling_type = cooling.type;
        // At least one needs to have a type set.
        if((heating_type === 'none') && (cooling_type === 'none')) {
            addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/hvac/${index}/heating/type`, `Heating Type is required if there is no Cooling type`);
            addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/hvac/${index}/cooling/type`, `Cooling Type is required if there is no Heating type`);
        }
        // Validate that the fuel type is correct for the heating type
        if((!heating_type || heating_type === 'none') && !heating_fuel) {
            addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/hvac/${index}/heating/fuel_primary`, `Cannot enter heating type without fuel`);
        }
        else if(ENUMS.heatingFuelToType[heating_fuel] && !ENUMS.heatingFuelToType[heating_fuel].includes(heating_type)) {
            addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/hvac/${index}/heating/fuel_primary`, `${heating_fuel} is not an appropriate fuel for heating type ${heating_type}`);
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
            addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/hvac/${index}/heating/type`, `${heating_type} is not an appropriate heating type with cooling type ${cooling_type}`);
        }
    }
}

function checkHeatingEfficiencyValid(hvac_system, index, errorMessages) {
    const {heating} = hvac_system;
    if(heating) {
        const {type, primary_fuel, efficiency_method} = heating;
        if(efficiency_method &&
            ([...nullOrUndefined, 'baseboard', 'wood_stove', 'none'].includes(type) ||
            (type === 'central_furnace' && primary_fuel === 'electric'))
        ) {
            addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/hvac/${index}/heating/efficiency_method`, `Efficiency method should not be set if heating type is "central furnace" and fuel is "electric", or if heating type is "baseboard", "wood stove", "none", or empty`);
        }
        if(efficiency_method === 'shipment_weighted') {
            if(type === 'wall_furnace' && primary_fuel !== 'natural_gas') {
                addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/hvac/${index}/heating/efficiency_method`, `Efficiency method must be "user" if heating type is "wall_furnace" and fuel is not "natural_gas"`)
            }
            if(['mini_split', 'gchp'].includes(type)) {
                addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/hvac/${index}/heating/efficiency_method`, `Heating efficiency method must be "user" when heating type is "${type}"`)
            }
        }
    }
}

function checkCoolingEfficiencyValid(hvac_system, index, errorMessages) {
    const {cooling} = hvac_system;
    if(cooling) {
        const {type, efficiency_method} = cooling;
        if(efficiency_method && [...nullOrUndefined, 'none', 'dec'].includes(type)) {
            addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/hvac/${index}/cooling/efficiency_method`, `Efficiency method should not be set if cooling type is "none", "direct evaporative cooler", or empty`);
        }
        if(efficiency_method !== 'user' && ['mini_split', 'gchp'].includes(type)) {
            addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/hvac/${index}/cooling/efficiency_method`, `Cooling efficiency must be 'user' when type is '${type}'`);
        }
    }
}

function checkSystemYearValid(hvac_system, index, errorMessages) {
    ['heating', 'cooling'].forEach((accessor) => {
        const item = hvac_system[accessor];
        if(item && item.year && (1970 > item.year || (new Date()).getFullYear() < item.year)) {
            addErrorMessage(errorMessages[ENUMS.BLOCKER], `building/systems/hvac/${index}/${accessor}/year`, `Invalid year, must be between 1970 and ${(new Date()).getFullYear()}`)
        }
    })
}

function checkHvacDistribution(hvac_system, index, errorMessages) {
    const {hvac_distribution} = hvac_system;
    if(hvac_distribution) {
        const {leakage_method, leakage_to_outside, duct} = hvac_distribution;
        if(leakage_to_outside && leakage_method === 'qualitative') {
            addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/hvac/${index}/hvac_distribution/leakage_to_outside`, "Leakage should not be passed for your system if the method is 'qualitative'");
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
                        addErrorMessage(errorMessages[ENUMS.BLOCKER], `building/systems/hvac/${index}/hvac_distribution/duct/${sub_i}/fraction`, `Total Duct Fraction must equal 100%`);
                    }
                })
            }
        }
    }
}

function checkHotWaterCategoryValid(hot_water, hvac, errorMessages) {
    const {category} = hot_water;
    const hvac_types = [];
    hvac.forEach((system) => {
        const {heating, cooling} = system;
        heating && hvac_types.push(heating.type);
        cooling && hvac_types.push(cooling.type);
    });
    if(!hvac_types.includes('boiler') && category === 'combined') {
        addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/domestic_hot_water/category`, 'Must have a boiler for combined hot water category');
    }
}

function checkHotWaterFuelValid(hot_water, errorMessages) {
    const {type, fuel_primary} = hot_water;
    if(['tankless_coil', 'indirect'].includes(type) && !nullOrUndefined.includes(fuel_primary)) {
        addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/domestic_hot_water/fuel_primary`, 'Fuel is only used if type is set to storage or heat pump');
    } else if(type === 'heat_pump' && fuel_primary !== 'electric') {
        addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/domestic_hot_water/fuel_primary`, 'Fuel must be electric if type is heat pump');
    }
}

function checkHotWaterEfficiencyValid(hot_water, errorMessages) {
    const {type, efficiency_method} = hot_water;
    if(['heat_pump', 'tankless', 'tankless_coil'].includes(type) && efficiency_method === 'shipment_weighted') {
        addErrorMessage(errorMessages[ENUMS.ERROR], `building/systems/domestic_hot_water/efficiency_method`, 'Invalid Efficiency Method for entered Hot Water Type');
    }
}

function checkHotWaterYearValid(hot_water, errorMessages) {
    const {year} = hot_water;
    if(year && (1972 > year || (new Date()).getFullYear() < year)) {
        addErrorMessage(errorMessages[ENUMS.BLOCKER], `building/systems/domestic_hot_water/year`, `Invalid year, must be between 1972 and ${(new Date()).getFullYear()}`)
    }
}

function checkHotWaterEnergyFactorValid(hot_water, errorMessages) {
    const {type, energy_factor} = hot_water;
    if(["indirect", "tankless_coil"].includes(type) && !nullOrUndefined.includes(energy_factor)) {
        addErrorMessage(errorMessages[ENUMS.BLOCKER], `building/systems/domestic_hot_water/energy_factor`, `Energy Factor not valid for selected Hot Water Type`);
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
        addErrorMessage(errorMessages[ENUMS.BLOCKER], `building/systems/domestic_hot_water/energy_factor`, `${energy_factor} is outside the allowed range (${min} - ${max})`);
    }
}

function checkSolarElectricYearValid(solar_electric, errorMessages) {
    const {year} = solar_electric;
    if(year && (2000 > year || (new Date()).getFullYear() < year)) {
        addErrorMessage(errorMessages[ENUMS.BLOCKER], `building/systems/generation/solar_electric/year`, `Invalid year, must be between 2000 and ${(new Date()).getFullYear()}`)
    }
}

function getFlatRequiredFields (homeValues) {
    // If we are given the new version of the home object, we need to validate the nested version instead

    // Define values that are always required
    let requiredFields = flatRequiredFields;
    
    let positions = [];

    //////////////////////////////////////////////////////////////////////////////
    // Add any fields that are required due to the values of other fields       //
    //////////////////////////////////////////////////////////////////////////////
    
    /*
     * About conitional validations
     */
    //If blower door test conducted, require envelope_leakage, else air_sealing_present
    if (castBool(homeValues['blower_door_test'])) {
        requiredFields['envelope_leakage'] = 'Air Leakage Rate is required if a Blower Door test was conducted';
    } else if (castBool(homeValues['blower_door_test']) === false) {
        requiredFields['air_sealing_present'] = 'This information is required if a Blower Door test was not conducted';
    }

    /*
     * Roof/Attic conditional validations
     */
    for (let roofNumber of [1, 2]) {
        // If the roof type is entered, require roof contents
        const mandatoryRoofMessage = ' is a required roof value';
        if (homeValues['roof_type_'+roofNumber]) {
            requiredFields['roof_assembly_code_'+roofNumber] = 'Roof Assembly' + mandatoryRoofMessage;
            requiredFields['roof_color_'+roofNumber] = 'Roof Color' + mandatoryRoofMessage;
            // The "cool_color" option for roof color requires an additional "absorptance" value to be set
            if (homeValues['roof_color_' + roofNumber] === 'cool_color') {
                requiredFields['roof_absorptance_' + roofNumber] = 'Roof absortance is required when Roof Color is Cool';
            }
            const mandatoryRoofTypeMessage = ' is required for this roof type';
            // If "vented_attic", require ceiling fields
            if (homeValues['roof_type_'+roofNumber] === 'vented_attic') {
                requiredFields['ceiling_area_'+roofNumber] = 'Attic floor area' + mandatoryRoofTypeMessage;
                requiredFields['ceiling_assembly_code_'+roofNumber] = 'Attic floor insulation' + mandatoryRoofTypeMessage;
                if(homeValues['knee_wall_area_'+roofNumber] > 0){
                    requiredFields['knee_wall_assembly_code_'+roofNumber] = 'Knee wall assembly' + mandatoryRoofTypeMessage;
                }
            } else if(homeValues['roof_type_' + roofNumber] === 'cath_ceiling') {
                requiredFields['roof_area_'+roofNumber] = 'Ceiling area' + mandatoryRoofTypeMessage;
            }
        }
    }
    /*
     * Foundation conditional validations
     */
    for (let floorNumber of [1, 2]) {
        //If floor area entered, require other foundation elements
        let mandatoryFloorMessage = ' is a required floor value';
        if (parseInt(homeValues['floor_area_'+floorNumber]) > 0) {
            requiredFields['foundation_type_'+floorNumber] = 'Foundation Type' + mandatoryFloorMessage;
            requiredFields['foundation_insulation_level_'+floorNumber] = 'Foundation Type' + mandatoryFloorMessage;
            requiredFields['floor_assembly_code_'+floorNumber] = 'Foundation Type' + mandatoryFloorMessage;
        }
        //If the foundation type is 'slab_on_grade', don't require 'floor_assembly_code'
        if (homeValues['foundation_type_'+floorNumber] === 'slab_on_grade') {
            delete requiredFields['floor_assembly_code_'+floorNumber];
        }
    }

    /*
     * Walls conditional validations
     */
    //If house is townhouse, require position
    if (homeValues['shape'] === 'town_house') {
        requiredFields['town_house_walls'] = 'Position is required if home is a Townhouse or Duplex';
    }
    //If wall construction is same on all sides, only require one side
    let mandatoryWallMessage = 'Wall assembly is a mandatory wall field';
    if (castBool(homeValues['wall_construction_same'])) {
        requiredFields['wall_assembly_code_front'] = mandatoryWallMessage;
        //otherwise check them based on position
    } else if (castBool(homeValues['wall_construction_same']) === false) {
        if (homeValues['shape'] === 'rectangle') {
            positions = ['front', 'back', 'right', 'left'];
        } else {
            if(homeValues['town_house_walls']) {
                positions = homeValues['town_house_walls'].split('_');
            }
        }
        for (let position of positions) {
            requiredFields['wall_assembly_code_'+position] = mandatoryWallMessage;
        }
    }

    //Require window area per required walls
    positions = homeValues['town_house_walls'] ? homeValues['town_house_walls'].split('_') : ['front', 'back', 'right', 'left'];
    for (let position of positions) {
        // Only check for actual window positions in event of incorrect town_house_walls entry
        if(['front', 'back', 'right', 'left'].indexOf(position) > -1) {
            requiredFields['window_area_'+position] = 'Window area '+position+' is required';
        }
    }

    /*
     * Windows conditional validations
     */
    //If skylights, require area and skylight_method
    //If skylight specs are known, require U-Factor and SHGC, else require assembly code
    if (parseInt(homeValues['skylight_area']) > parseInt(0)) {
        requiredFields['skylight_method'] = 'This is a required skylight field';
        if(homeValues['skylight_method'] === 'code') {
            requiredFields['skylight_code'] = 'Skylight specs are required if known';
        } else if (homeValues['skylight_method'] === 'custom') {
            requiredFields['skylight_u_value'] = 'Field is required if skylight specs unknown';
            requiredFields['skylight_shgc'] = 'Field is required if skylight specs unknown';
        }
    }

    //Check if window construction is same on all sides and require appropriate elements
    //If window specs are known, require U-Factor and SHGC, else require assembly code
    let mandatoryWindowMessage = 'This is a required window field';
    let windowSpecsKnownMessage = 'Window specs are required if known';
    let windowSpecsUnknownMessage = 'Required if window specs unknown';
    if (castBool(homeValues['window_construction_same'])) {
        positions = ['front'];
    } else if (castBool(homeValues['window_construction_same']) === false) {
        positions = homeValues['town_house_walls'] ? homeValues['town_house_walls'].split('_') : ['front', 'back', 'right', 'left'];
    }
    for (let position of positions) {
        if(['front', 'back', 'right', 'left'].indexOf(position) > -1) {
            requiredFields['window_method_'+position] = mandatoryWindowMessage;
            if (homeValues['window_method_'+position] === 'code') {
                requiredFields['window_code_'+position] = windowSpecsKnownMessage;
            } else if (homeValues['window_method_'+position] === 'custom') {
                requiredFields['window_u_value_'+position] = windowSpecsUnknownMessage;
                requiredFields['window_shgc_'+position] = windowSpecsUnknownMessage;
            }
        }
    }

    /*
     * Systems coniditional validations
     */
    //If second system is heating percentage of house, require
    if (parseFloat(homeValues['hvac_fraction_2']) > 0){
        ['heating_type_2', 'heating_fuel_2', 'cooling_type_2'].forEach(function(key) {
            requiredFields[key] = 'This is a required system field';
        });
    }
    for (let system of ['1', '2']) {
        let heatingType = homeValues['heating_type_'+system];
        let heatingFuel = homeValues['heating_fuel_'+system];
        let heatingEfficiencyMethod = homeValues['heating_efficiency_method_'+system];

        if (![null, undefined, ''].includes(heatingFuel) &&
            !['', 'none', null, undefined, 'baseboard', 'wood_stove'].includes(heatingType) &&
            !(heatingFuel === 'electric' && ['central_furnace', 'boiler'].includes(heatingType))
        ){
            requiredFields['heating_efficiency_method_'+system] = 'Field is required when Heating Type has variable efficiency';
            if(heatingEfficiencyMethod === 'user') {
                requiredFields['heating_efficiency_'+system] = 'Efficiency Value is required when known';
            } else if(heatingEfficiencyMethod === 'shipment_weighted') {
                requiredFields['heating_year_'+system] = 'Installation year is required when efficiency value is unknown';
            }
        }
        if (['', 'none', 'dec', null, undefined].indexOf(homeValues['cooling_type_'+system]) === -1) {
            requiredFields['cooling_efficiency_method_'+system] = 'Field is required when Cooling Type has variable efficiency';
            if(homeValues['cooling_efficiency_method_'+system] === 'user') {
                requiredFields['cooling_efficiency_'+system] = 'Cooling Efficiency is required when known';
            } else if(homeValues['cooling_efficiency_method_'+system] === 'shipment_weighted') {
                requiredFields['cooling_year_'+system] = 'Year Installed is required when efficiency value is unknown';
            }
        }
        //Require ducts for heating/cooling types with ducts
        let ductTypes = ['central_furnace', 'heat_pump', 'gchp', 'split_dx'];
        if (ductTypes.indexOf(heatingType) > -1  ||
            ductTypes.indexOf(homeValues['cooling_type_'+system]) > -1)
        {
            requiredFields['hvac_distribution_leakage_method_'+system] = 'Duct leakage is required for your system type selections';
            if(homeValues['hvac_distribution_leakage_method_'+system] === 'quantitative') {
                requiredFields['hvac_distribution_leakage_to_outside_'+system] = 'Duct leakage is required when known';
            } else if(homeValues['hvac_distribution_leakage_method_'+system] === 'qualitative') {
                requiredFields['hvac_distribution_sealed_'+system] = 'Duct information is required for your system type selections';
            }
            requiredFields['duct_fraction_1_'+system] = 'Duct percentage is required when they exist';
        }
        let ductPercent = (parseFloat(homeValues['duct_fraction_1_'+system]) || 0 )+(parseFloat(homeValues['duct_fraction_2_'+system]) || 0 )+(parseFloat(homeValues['duct_fraction_3_'+system]) || 0 );
        if(ductPercent === 1) {
            //Do nothing
        } else if((parseFloat(homeValues['duct_fraction_1_'+system]) > 0) && (parseFloat(homeValues['duct_fraction_2_'+system]) > 0) && ductPercent < 1) {
            requiredFields['duct_fraction_3_'+system] = 'Duct percentage is required when they exist';
        } else if(parseFloat(homeValues['duct_fraction_1_'+system]) > 0 && ductPercent < 1) {
            requiredFields['duct_fraction_2_'+system] = 'Duct percentage is required when they exist';
        }
        for (let duct of ['1', '2', '3']) {
            //If duct percentage entered, require rest of ducts
            let mandatoryDuctMessage = 'This is a mandatory duct field';
            if(parseFloat(homeValues['duct_fraction_'+duct+'_'+system]) > 0){
                requiredFields['duct_location_'+duct+'_'+system] = mandatoryDuctMessage;
                requiredFields['duct_insulated_'+duct+'_'+system] = mandatoryDuctMessage;
            }
        }
    }

    /*
     * Hot Water
     */
    if (['', 'tankless_coil', 'indirect', null, undefined].indexOf(homeValues['hot_water_type']) === -1) {
        requiredFields['hot_water_fuel'] = 'Required for non-boiler water heaters';
        requiredFields['hot_water_efficiency_method'] = 'Required for non-boiler water heaters';
        if (['user', 'uef'].indexOf(homeValues['hot_water_efficiency_method']) > -1) {
            requiredFields['hot_water_energy_factor'] = mandatoryMessage;
        } else if (homeValues['hot_water_efficiency_method'] === 'shipment_weighted') {
            requiredFields['hot_water_year'] = 'Year Installed is required when energy factor is unknown';
        }
    }

    /*
     * PV System
     */
    let mandatoryPVMessage = 'This is a mandatory PV field';
    // Check whether there are any PV entries
    const pvNotEmpty = [
        "solar_electric_year",
        "solar_electric_array_azimuth",
        "solar_electric_capacity_known",
        "solar_electric_system_capacity",
        "solar_electric_num_panels",
        "solar_electric_array_tilt"
    ].some((field) => !TypeRules._is_empty(homeValues[field]));
    // If so, require and validate
    if (pvNotEmpty) {
        requiredFields['solar_electric_capacity_known'] = mandatoryPVMessage;
        requiredFields['solar_electric_year'] = mandatoryPVMessage;
        requiredFields['solar_electric_array_azimuth'] = mandatoryPVMessage;
        requiredFields['solar_electric_array_tilt'] = mandatoryPVMessage;
        if (homeValues['solar_electric_capacity_known'] === '1' || homeValues['solar_electric_capacity_known'] === 1) {
            requiredFields['solar_electric_system_capacity'] = 'System Capacity is required when known';
        } else if (homeValues['solar_electric_capacity_known'] === '0' || homeValues['solar_electric_capacity_known'] === 0) {
            requiredFields['solar_electric_num_panels'] = 'Number of panels is required when system capacity is unknown';
        }
    }

    /*
     * HPwES
     */
    let mandatoryHPwESMessage = 'This is a required HPwES field';
    if (homeValues['improvement_installation_start_date'] ||
        homeValues['improvement_installation_completion_date'] ||
        homeValues['contractor_business_name'] ||
        homeValues['contractor_zip_code'])
    {
        requiredFields['improvement_installation_start_date'] = mandatoryHPwESMessage;
        requiredFields['improvement_installation_completion_date'] = mandatoryHPwESMessage;
        requiredFields['contractor_business_name'] = mandatoryHPwESMessage;
        requiredFields['contractor_zip_code'] = mandatoryHPwESMessage;
    }

    return requiredFields;
};
