"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNestedValidationMessages = void 0;
var hescore_json_schema_js_1 = require("../schema/hescore_json.schema.js");
var ajv_1 = require("ajv");
var ajv_formats_1 = require("ajv-formats");
var ajv = new ajv_1.default({ allErrors: true, strictTypes: false, strictSchema: false });
(0, ajv_formats_1.default)(ajv);
// Add the schema to the validator
ajv.addSchema(hescore_json_schema_js_1.default);
// Add the custom keyword "error_msg" to the validator
ajv.addKeyword('error_msg');
var nullOrUndefined = [null, undefined];
var mandatoryMessage = "Missing value for mandatory field";
/**
 * Perform the HES validation for the nested JSON format. Uses the JSON Schema for initial required field and field
 * limit validations (e.g. enums, within bounds, etc) and then performs secondary cross validation across the building
 * as a whole (e.g. the roof area is large enough to cover the floor area)
 * @param {object} homeValues - JSON object which follows the HES Nested JSON Schema
 * @return Error messages
 * for the homeValues object, grouped by severity (blocker, error, warning). Messages in each severity group are grouped by
 * path in the JSON Schema to the error, and can contain multiple errors for a single item in the JSON Schema.
 */
var _errorMessages = {};
function getNestedValidationMessages(homeValues) {
    _errorMessages = {};
    if (!ajv.validate(hescore_json_schema_js_1.default, homeValues)) {
        ajv.errors.forEach(function (error) {
            var instancePath = error.instancePath, missingProperty = error.params.missingProperty;
            var errorPath = missingProperty ? "".concat(instancePath, "/").concat(missingProperty) : instancePath;
            addErrorMessage(errorPath, convertAJVError(error));
        });
    }
    getCrossValidationMessages(homeValues);
    return _errorMessages;
}
exports.getNestedValidationMessages = getNestedValidationMessages;
/**
 * Convert the AJV error into an intelligible error message that the HES system knows how to display
 * @param {AjvErrorObject} errorObj
 * @return {string|undefined}
 */
function convertAJVError(errorObj) {
    var keyword = errorObj.keyword, message = errorObj.message, schemaPath = errorObj.schemaPath;
    var keyArr = schemaPath.split('/');
    keyArr.shift(); // remove '#'
    // If it's a keyword that's too deep we should pop it to get the right
    // level for the error message
    if (['required', 'const'].includes(keyword)) {
        keyArr.pop();
    }
    var error_leaf = keyArr.reduce(function (acc, key) { return acc[key]; }, hescore_json_schema_js_1.default);
    if (error_leaf.error_msg) {
        return error_leaf.error_msg;
    }
    switch (keyword) {
        case 'required':
            return mandatoryMessage;
        case 'enum':
            return "".concat(message, ": '").concat(error_leaf.join('\', \''), "'");
        case 'if':
        case 'not':
        case 'additionalProperties':
            // Some keywords indicate errors that we don't want to include in our output
            return undefined;
        default:
            return message;
    }
}
/**
 * Get Cross Validation messages for the building to check for other errors.
 * @param {object} homeValues
 */
function getCrossValidationMessages(homeValues) {
    getAboutObjectCrossValidationMessages(homeValues);
    getZoneCrossValidationMessages(homeValues.zone, homeValues.about);
    getSystemCrossValidation(homeValues.systems);
}
/**
 * Helper function to add the validation messages easily to the object
 * @param {string} path Path in the nested schema to the error area in the building object
 * @param {string} message Validation error message
 */
function addErrorMessage(path, message) {
    if (message) {
        if (!(path in _errorMessages)) {
            _errorMessages[path] = [];
        }
        _errorMessages[path].push(message);
    }
}
/**
 * Cross validations for the "About" object in the nested JSON Schema
 */
function getAboutObjectCrossValidationMessages(building) {
    var _a = building.about, assessmentDate = _a.assessment_date, yearBuilt = _a.year_built;
    var today = new Date();
    // The JSON schema ensures that the assessment date is a valid date string, but since it can't validate
    // minimum or maximum values, we have to do that validation in JavaScript
    var MIN_ASSESSMENT_DATE = '2010-01-01';
    var assessmentDateMs = Date.parse(assessmentDate);
    var minDateMs = Date.parse(MIN_ASSESSMENT_DATE);
    var todayMs = Date.now();
    if (assessmentDateMs < minDateMs || assessmentDateMs > todayMs) {
        var todayFormatted = today.toISOString().split('T')[0];
        addErrorMessage("/about/assessment_date", "".concat(assessmentDate, " is outside the allowed range ").concat(MIN_ASSESSMENT_DATE, " - ").concat(todayFormatted));
    }
    var maxYear = today.getFullYear();
    if (yearBuilt > maxYear) {
        addErrorMessage("/about/year_built", "".concat(yearBuilt, " is greater than the maximum of ").concat(maxYear));
    }
}
/**
 * Cross validation for the "Zone" object in the nested JSON Schema
 */
function getZoneCrossValidationMessages(zone, about) {
    checkWindowSidesValid(zone.zone_wall);
    checkWindowAreaValid(zone, about);
    getAdditionalRoofZoneValidations(zone, about);
    getAdditionalFloorZoneValidations(zone, about);
}
function checkWindowSidesValid(zone_wall) {
    var sides = zone_wall.map(function (wall) { return wall.side; });
    var duplicateSides = sides.filter(function (side, index) { return sides.indexOf(side) !== index; });
    duplicateSides.forEach(function (side) {
        return addErrorMessage('/zone/zone_wall', "Duplicate wall side \"".concat(side, "\" detected. Ensure that each zone wall has a unique side"));
    });
}
/**
 * Zone window must be smaller than the wall area
 */
function checkWindowAreaValid(zone, about) {
    var zone_wall = zone.zone_wall;
    zone_wall.forEach(function (wall, index) {
        var side = wall.side, zone_window = wall.zone_window;
        var wall_area = getWallArea(zone, about, ['front', 'back'].includes(side));
        if (zone_window && wall_area) {
            var window_area = zone_window.window_area;
            if (window_area && window_area > wall_area) {
                addErrorMessage("zone/zone_wall/".concat(index, "/zone_window/window_area"), "Window area too large for wall.");
            }
        }
    });
}
/**
 * Wall must be appropriate length for the conditioned footprint of the building
 */
function getWallLength(zone, about, is_front_back) {
    var conditioned_footprint = getBuildingConditionedFootprint(about, zone);
    if (conditioned_footprint) {
        return Math.floor((is_front_back
            ? Math.sqrt((5 * conditioned_footprint) / 3)
            : Math.sqrt((3 * conditioned_footprint) / 5)));
    }
    return false;
}
/**
 * Checks if the wall area is too bit for the building
 */
function getWallArea(zone, about, is_front_back) {
    var length = getWallLength(zone, about, is_front_back);
    var height = about.floor_to_ceiling_height || false;
    var stories = about.num_floor_above_grade || false;
    if (length && height && stories) {
        var one_story_area = length * height;
        if (is_front_back) {
            one_story_area -= 20;
        }
        return Math.floor(one_story_area * stories);
    }
    return false;
}
/**
 * Do the cross validations for the zone roof
 */
function getAdditionalRoofZoneValidations(zone, about) {
    var conditioned_footprint = getBuildingConditionedFootprint(about, zone);
    var zone_roof = zone.zone_roof;
    // Roof area
    checkRoofArea(zone, conditioned_footprint, 'roof_area');
    // Ceiling area
    checkRoofArea(zone, conditioned_footprint, 'ceiling_area');
    // Knee wall area
    checkKneeWallArea(zone_roof, conditioned_footprint);
    // Skylight area
    checkSkylightArea(zone_roof, conditioned_footprint);
}
/**
 * Check that the skylight isn't too big for the roof
 */
function checkSkylightArea(zone_roof_array, conditioned_footprint) {
    // Skylights must be smaller than the conditioned footprint
    var zone_skylight_area = 0;
    zone_roof_array.forEach(function (roof) {
        var zone_skylight = roof.zone_skylight;
        if (zone_skylight && zone_skylight.skylight_area) {
            zone_skylight_area += zone_skylight.skylight_area;
        }
    });
    if (zone_skylight_area > conditioned_footprint) {
        zone_roof_array.forEach(function (roof, index) {
            if (roof.zone_skylight && roof.zone_skylight.skylight_area) {
                addErrorMessage("zone/zone_roof/".concat(index, "/zone_skylight/skylight_area"), "Total skylight area exceeds the maximum allowed ".concat(conditioned_footprint, " sqft"));
            }
        });
    }
}
/**
 * Check that the knee wall is not too big for the attic
 */
function checkKneeWallArea(zone_roof, conditioned_footprint) {
    var max_knee_wall_area = (2 * conditioned_footprint) / 3;
    var combined_knee_wall_area = getCombinedArea(zone_roof.map(function (roof) { return (roof.knee_wall); }), 'area');
    if (combined_knee_wall_area > max_knee_wall_area) {
        zone_roof.forEach(function (roof, index) {
            if (roof.knee_wall && roof.knee_wall.area) {
                addErrorMessage("zone/zone_roof/".concat(index, "/knee_wall/area"), "Total knee wall area exceeds the maximum allowed ".concat(Math.ceil(max_knee_wall_area), " sqft (2/3 the footprint area)."));
            }
        });
    }
}
/**
 * Check that the roof area isn't too big for the roof type
 */
function checkRoofArea(zone, conditioned_footprint, type) {
    var roof_type = type === 'roof_area' ? 'cath_ceiling' : 'vented_attic';
    var combined_type = type === 'roof_area' ? 'roof' : 'ceiling';
    var zone_roof = zone.zone_roof;
    var combined_area_invalid = checkCombinedAreaInvalid(zone);
    if (!combined_area_invalid) {
        var combinedRoofCeilArea = getCombinedRoofCeilingArea(zone_roof);
        var conditioned_area_invalid_1 = checkConditionedAreaValid(combinedRoofCeilArea, conditioned_footprint, combined_type);
        if (conditioned_area_invalid_1) {
            zone_roof.forEach(function (roof, index) {
                if (roof.roof_type === roof_type) {
                    addErrorMessage("/zone/zone_roof/".concat(index, "/").concat(type), conditioned_area_invalid_1);
                }
            });
        }
    }
    else {
        zone_roof.forEach(function (roof, index) {
            if (roof.roof_type === roof_type) {
                addErrorMessage("/zone/zone_roof/".concat(index, "/").concat(type), combined_area_invalid);
            }
        });
    }
}
/**
 * Check that the floor isn't too small for the combined area
 */
function checkFloorArea(zone, conditioned_footprint) {
    var zone_floor = zone.zone_floor;
    var combined_area_invalid = checkCombinedAreaInvalid(zone);
    if (!combined_area_invalid) {
        var combined_floor_area = getCombinedFloorArea(zone_floor);
        var conditioned_area_invalid_2 = checkConditionedAreaValid(combined_floor_area, conditioned_footprint, 'floor');
        if (conditioned_area_invalid_2) {
            zone_floor.forEach(function (floor, index) {
                addErrorMessage("/zone/zone_floor/".concat(index, "/floor_area"), conditioned_area_invalid_2);
            });
        }
    }
    else {
        zone_floor.forEach(function (roof, index) {
            addErrorMessage("/zone/zone_floor/".concat(index, "/floor_area"), combined_area_invalid);
        });
    }
}
/**
 * Check that the insulation level is appropriate for the foundation type
 */
function checkFoundationLevel(zone_floor_array) {
    zone_floor_array.forEach(function (floor, index) {
        var foundation_type = floor.foundation_type, foundation_insulation_level = floor.foundation_insulation_level;
        if (!nullOrUndefined.includes(foundation_type) && !nullOrUndefined.includes(foundation_insulation_level)) {
            if (foundation_type === 'slab_on_grade' && ![0, 5].includes(foundation_insulation_level)) {
                addErrorMessage("/zone/zone_floor/".concat(index, "/foundation_insulation_level"), 'Insulation must be R-0 or R-5 for Slab on Grade Foundation');
            }
            else if (![0, 11, 19].includes(foundation_insulation_level)) {
                addErrorMessage("/zone/zone_floor/".concat(index, "/foundation_insulation_level"), 'Insulation must be R-0, R-11, or R-19 for current foundation type');
            }
        }
    });
}
/**
 * Check that the conditioned area is within the bounds for the building footprint
 */
function checkConditionedAreaValid(combined_area, conditioned_footprint, area_type) {
    var min = conditioned_footprint * 0.95;
    var max = conditioned_footprint * 2.5;
    if (!((min < combined_area) && (combined_area < max))) {
        return "This home's minimum footprint is approximately ".concat(conditioned_footprint, "sqft, but you have specified ").concat(combined_area, "sqft of total ").concat(area_type, " area. The allowed range is (").concat(Math.ceil(min), "sqft - ").concat(Math.floor(max), "sqft). Please adjust any incorrect values. *The footprint is calculated as (<total area> - <conditioned basement area>) / <number of floors>");
    }
}
/**
 * Do the additional validations for the zone floors
 */
function getAdditionalFloorZoneValidations(zone, about) {
    var conditioned_footprint = getBuildingConditionedFootprint(about, zone);
    // Conditioned Footprint for home must be greater than 250 sq ft.
    if (conditioned_footprint < 250) {
        addErrorMessage('/about/conditioned_floor_area', "Home footprint must be greater than 250 sq ft. Current footprint is ".concat(conditioned_footprint, " sq ft."));
    }
    // Floor area is within bounds of conditioned floor area
    checkFloorArea(zone, conditioned_footprint);
    // Validate foundation insulation level is correct for foundation type
    checkFoundationLevel(zone.zone_floor);
}
/**
 * Helper to get the conditioned area of a particular field for a building
 */
function getCombinedArea(array_obj, field_name) {
    var combined_area = 0;
    array_obj.filter(function (obj) { return (!nullOrUndefined.includes(obj)); }).forEach(function (obj) {
        if (!nullOrUndefined.includes(obj[field_name])) {
            combined_area += obj[field_name];
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
    var combined_floor = getCombinedFloorArea(zone.zone_floor);
    var combined_roof_ceiling = getCombinedRoofCeilingArea(zone.zone_roof);
    return (combined_roof_ceiling <= (combined_floor * .95)) ? "The roof does not cover the floor" : false;
}
function getBuildingConditionedFootprint(about, zone) {
    var zone_floor = zone.zone_floor;
    var conditioned_floor_area = about.conditioned_floor_area, num_floor_above_grade = about.num_floor_above_grade;
    var conditioned_basement_area = 0;
    // For conditioned footprint, we need to subtract the area of any conditioned basement floors
    zone_floor.filter(function (floor) { return (floor.foundation_type === 'cond_basement'); }).forEach(function (floor) { return (conditioned_basement_area += floor.floor_area); });
    var footprint_area = conditioned_floor_area - conditioned_basement_area;
    return Math.floor(footprint_area / num_floor_above_grade);
}
/**
 * Get the Cross validation messages for the system of the JSON Schema
 * @param {object} systems
 */
function getSystemCrossValidation(systems) {
    var hvac = systems.hvac, domestic_hot_water = systems.domestic_hot_water, generation = systems.generation;
    if (hvac) {
        checkHvacFraction(hvac);
        hvac.forEach(function (hvac_system, index) {
            checkHeatingCoolingTypeValid(hvac_system, index);
            checkHeatingEfficiencyValid(hvac_system, index);
            checkCoolingEfficiencyValid(hvac_system, index);
            checkSystemYearValid(hvac_system, index);
            checkHvacDistribution(hvac_system, index);
        });
    }
    if (domestic_hot_water) {
        checkHotWaterCategoryValid(domestic_hot_water, hvac);
        checkHotWaterFuelValid(domestic_hot_water);
        checkHotWaterEfficiencyValid(domestic_hot_water);
        checkHotWaterYearValid(domestic_hot_water);
        checkHotWaterEnergyFactorValid(domestic_hot_water);
    }
    if (generation && generation.solar_electric) {
        checkSolarElectricYearValid(generation.solar_electric);
    }
}
/**
 * Check that the HVAC fraction is equal to 1 (100%)
 */
function checkHvacFraction(hvac) {
    var total_fraction = 0;
    hvac.forEach(function (hvac_system) {
        if (hvac_system.hvac_fraction) {
            total_fraction += hvac_system.hvac_fraction;
        }
    });
    if (total_fraction !== 1) {
        hvac.forEach(function (hvac_system, index) {
            if (hvac_system.hvac_fraction) {
                addErrorMessage("systems/hvac/".concat(index, "/hvac_fraction"), "Total HVAC Fraction must equal 100%");
            }
        });
    }
}
/**
 * Check that the heating and cooling methods are compatible
 */
var HEATING_FUEL_TO_TYPE = {
    'natural_gas': [
        'central_furnace',
        'wall_furnace',
        'boiler'
    ],
    'lpg': [
        'central_furnace',
        'wall_furnace',
        'boiler'
    ],
    'fuel_oil': [
        'central_furnace',
        'wall_furnace',
        'boiler'
    ],
    'electric': [
        'central_furnace',
        'heat_pump',
        'mini_split',
        'gchp',
        'baseboard',
        'boiler'
    ],
    'cord_wood': ['wood_stove'],
    'pellet_wood': ['wood_stove'],
};
function checkHeatingCoolingTypeValid(hvac_system, index) {
    var heating = hvac_system.heating, cooling = hvac_system.cooling;
    if (heating && cooling) {
        var heating_type = heating.type;
        var heating_fuel = heating.fuel_primary;
        var cooling_type = cooling.type;
        if (HEATING_FUEL_TO_TYPE[heating_fuel] && !HEATING_FUEL_TO_TYPE[heating_fuel].includes(heating_type)) {
            addErrorMessage("systems/hvac/".concat(index, "/heating/fuel_primary"), "".concat(heating_fuel, " is not an appropriate fuel for heating type ").concat(heating_type));
        }
        // Validate the cooling type is valid for the heating type
        var heat_cool_valid = true;
        switch (cooling_type) {
            // If cooling is heat_pump or gchp, heating type must match, be wood_stove, or be none
            case 'heat_pump':
            case 'gchp':
                if (![cooling_type, 'wood_stove', 'none'].includes(heating_type)) {
                    heat_cool_valid = false;
                }
                break;
            case 'mini_split':
                if (['heat_pump', 'gchp'].includes(heating_type)) {
                    heat_cool_valid = false;
                }
                break;
            case 'split_dx':
                if (['heat_pump', 'gchp', 'mini_split'].includes(heating_type)) {
                    heat_cool_valid = false;
                }
                break;
            case 'dec':
                if (['gchp'].includes(heating_type)) {
                    heat_cool_valid = false;
                }
                break;
        }
        if (!heat_cool_valid) {
            addErrorMessage("systems/hvac/".concat(index, "/heating/type"), "".concat(heating_type, " is not an appropriate heating type with cooling type ").concat(cooling_type));
        }
    }
}
/**
 * Check that the efficiency method is valid for the heating type
 */
function checkHeatingEfficiencyValid(hvac_system, index) {
    var heating = hvac_system.heating;
    if (heating) {
        var type = heating.type, primary_fuel = heating.primary_fuel, efficiency_method = heating.efficiency_method;
        if (efficiency_method &&
            (__spreadArray(__spreadArray([], nullOrUndefined, true), ['baseboard', 'wood_stove', 'none'], false).includes(type) ||
                (type === 'central_furnace' && primary_fuel === 'electric'))) {
            addErrorMessage("systems/hvac/".concat(index, "/heating/efficiency_method"), "Efficiency method should not be set if heating type is \"central furnace\" and fuel is \"electric\", or if heating type is \"baseboard\", \"wood stove\", \"none\", or empty");
        }
        if (efficiency_method === 'shipment_weighted') {
            if (type === 'wall_furnace' && primary_fuel !== 'natural_gas') {
                addErrorMessage("systems/hvac/".concat(index, "/heating/efficiency_method"), "Efficiency method must be \"user\" if heating type is \"wall_furnace\" and fuel is not \"natural_gas\"");
            }
            if (['mini_split', 'gchp'].includes(type)) {
                addErrorMessage("systems/hvac/".concat(index, "/heating/efficiency_method"), "Heating efficiency method must be \"user\" when heating type is \"".concat(type, "\""));
            }
        }
    }
}
/**
 * Check that the efficiency method is valid for the cooling type
 */
function checkCoolingEfficiencyValid(hvac_system, index) {
    var cooling = hvac_system.cooling;
    if (cooling) {
        var type = cooling.type, efficiency_method = cooling.efficiency_method;
        if (efficiency_method && __spreadArray(__spreadArray([], nullOrUndefined, true), ['none', 'dec'], false).includes(type)) {
            addErrorMessage("systems/hvac/".concat(index, "/cooling/efficiency_method"), "Efficiency method should not be set if cooling type is \"none\", \"direct evaporative cooler\", or empty");
        }
        if (efficiency_method !== 'user' && ['mini_split', 'gchp'].includes(type)) {
            addErrorMessage("systems/hvac/".concat(index, "/cooling/efficiency_method"), "Cooling efficiency must be 'user' when type is '".concat(type, "'"));
        }
    }
}
/**
 * Check that the HVAC system is of a valid year
 */
function checkSystemYearValid(hvac_system, index) {
    ['heating', 'cooling'].forEach(function (accessor) {
        var item = hvac_system[accessor];
        if (item && item.year && (1970 > item.year || (new Date()).getFullYear() < item.year)) {
            addErrorMessage("systems/hvac/".concat(index, "/").concat(accessor, "/year"), "Invalid year, must be between 1970 and ".concat((new Date()).getFullYear()));
        }
    });
}
/**
 * Check that the total HVAC distribution is 1 (100%)
 */
function checkHvacDistribution(hvac_system, index) {
    var hvac_distribution = hvac_system.hvac_distribution;
    if (hvac_distribution) {
        var leakage_method = hvac_distribution.leakage_method, leakage_to_outside = hvac_distribution.leakage_to_outside, duct = hvac_distribution.duct;
        if (leakage_to_outside && leakage_method === 'qualitative') {
            addErrorMessage("systems/hvac/".concat(index, "/hvac_distribution/leakage_to_outside"), "Leakage should not be passed for your system if the method is 'qualitative'");
        }
        // If we have ducts, we need to ensure the fraction is 100%
        if (duct) {
            var total_fraction_1 = 0;
            duct.forEach(function (duct_item) {
                if (duct_item.fraction) {
                    total_fraction_1 += duct_item.fraction;
                }
            });
            if (total_fraction_1 !== 1) {
                duct.forEach(function (duct_item, sub_i) {
                    if (duct_item.fraction) {
                        addErrorMessage("systems/hvac/".concat(index, "/hvac_distribution/duct/").concat(sub_i, "/fraction"), "Total Duct Fraction must equal 100%");
                    }
                });
            }
        }
    }
}
/**
 * Check that if the hot water is 'combined' the HVAC system has a boiler
 */
function checkHotWaterCategoryValid(hot_water, hvac) {
    var category = hot_water.category;
    var hvac_types = [];
    hvac.forEach(function (system) {
        var heating = system.heating, cooling = system.cooling;
        heating && hvac_types.push(heating.type);
        cooling && hvac_types.push(cooling.type);
    });
    if (!hvac_types.includes('boiler') && category === 'combined') {
        addErrorMessage("systems/domestic_hot_water/category", 'Must have a boiler for combined hot water category');
    }
}
/**
 * Check that fuel is appropriate for the hot water system
 */
function checkHotWaterFuelValid(hot_water) {
    var type = hot_water.type, fuel_primary = hot_water.fuel_primary;
    if (['tankless_coil', 'indirect'].includes(type) && !nullOrUndefined.includes(fuel_primary)) {
        addErrorMessage("systems/domestic_hot_water/fuel_primary", 'Fuel is only used if type is set to storage or heat pump');
    }
    else if (type === 'heat_pump' && fuel_primary !== 'electric') {
        addErrorMessage("systems/domestic_hot_water/fuel_primary", 'Fuel must be electric if type is heat pump');
    }
}
/**
 * Check that efficiency is appropriate for the hot water system
 */
function checkHotWaterEfficiencyValid(hot_water) {
    var type = hot_water.type, efficiency_method = hot_water.efficiency_method;
    if (['heat_pump', 'tankless', 'tankless_coil'].includes(type) && efficiency_method === 'shipment_weighted') {
        addErrorMessage("systems/domestic_hot_water/efficiency_method", 'Invalid Efficiency Method for entered Hot Water Type');
    }
}
/**
 * Check that the year is appropriate for the hot water system
 */
function checkHotWaterYearValid(hot_water) {
    var year = hot_water.year;
    if (year && (1972 > year || (new Date()).getFullYear() < year)) {
        addErrorMessage("systems/domestic_hot_water/year", "Invalid year, must be between 1972 and ".concat((new Date()).getFullYear()));
    }
}
/**
 * Check that the energy factor is valid for the hot water system
 */
function checkHotWaterEnergyFactorValid(hot_water) {
    var _a, _b, _c;
    var type = hot_water.type, energy_factor = hot_water.energy_factor;
    if (["indirect", "tankless_coil"].includes(type) && !nullOrUndefined.includes(energy_factor)) {
        addErrorMessage("systems/domestic_hot_water/energy_factor", "Energy Factor not valid for selected Hot Water Type");
    }
    var min, max;
    if (type === 'storage') {
        _a = [0.45, 0.95], min = _a[0], max = _a[1];
    }
    else if (type === 'tankless') {
        _b = [0.45, 0.99], min = _b[0], max = _b[1];
    }
    else if (type === 'heat_pump') {
        _c = [1, 4], min = _c[0], max = _c[1];
    }
    if (energy_factor && (energy_factor < min || energy_factor > max)) {
        addErrorMessage("systems/domestic_hot_water/energy_factor", "".concat(energy_factor, " is outside the allowed range (").concat(min, " - ").concat(max, ")"));
    }
}
/**
 * Check that the solar electric system is of a valid year
 */
function checkSolarElectricYearValid(solar_electric) {
    var year = solar_electric.year;
    if (year && (2000 > year || (new Date()).getFullYear() < year)) {
        addErrorMessage("systems/generation/solar_electric/year", "Invalid year, must be between 2000 and ".concat((new Date()).getFullYear()));
    }
}
