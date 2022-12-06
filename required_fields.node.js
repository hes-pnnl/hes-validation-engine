/**
 * required_fields.node.js - Validates that required home audit fields have a value.
 */
let TypeRules = require('./type_rules.node');
let validationRules = require('./validation_rules');
const ENUMS = require('./validation_enums.node')
const Ajv = require("ajv");
const addFormats = require('ajv-formats');
const ajv = new Ajv({allErrors: true})
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

nestedRequiredFields = {
    type: "object",
    properties: {
        about: {
            type: "object",
            properties: {
                air_sealing_present: {type: "boolean"},
                assessment_date: {type: "string", format: "date"},
                blower_door_test: {type: "boolean"},
                comment_api_only: {type: "string"}, // schema
                comments: {type: "string"}, // schema
                conditioned_floor_area: {type: "integer", minimum: 250, maximum: 25000},
                envelope_leakage: {type: "integer", minimum: 0, maximum: 25000},
                floor_to_ceiling_height: {type: "integer", minimum: 6, maximum: 12},
                number_bedrooms: {type: "integer", minimum: 1, maximum: 10},
                num_floor_above_grade: {type: "integer", minimum: 1, maximum: 4},
                orientation: {type: "string", enum: ENUMS.orientationArray},
                shape: {type: "string", enum: ENUMS.buildingShapes},
                town_house_walls: {type: "string", enum: ENUMS.townHouseWallOrientations},
                year_built: {type: "integer", minimum: 1600, maximum: (new Date().getFullYear())},
            },
            // If blower door test conducted, require envelope_leakage, else air_sealing_present
            if: {properties: {blower_door_test: {const: true}}},
            then: {required: ['envelope_leakage']},
            else: {required: ['air_sealing_present']},

            required: [
                "assessment_date",
                "shape",
                "year_built",
                "number_bedrooms",
                "num_floor_above_grade",
                "floor_to_ceiling_height",
                "conditioned_floor_area",
                "orientation",
                "blower_door_test"
            ],
            additionalProperties: false
        },
        systems: {
            type: "object",
            properties: {
                domestic_hot_water: {
                    type: "object",
                    properties: {
                        category: {type: "string", enum: ENUMS.hotWaterCategories},
                        type: {type: "string", enum: ENUMS.hotWaterType}
                    }
                },
                generation: {
                    type: "object",
                    properties: {
                        solar_electric: {
                            type: "object",
                            properties: {
                                array_azimuth: {type: "string", enum: ENUMS.orientationArray},
                                array_tilt: {type: "string", enum: ENUMS.tiltArray},
                                capacity_known: {type: "boolean"},
                                system_capacity: {type: "number", minimum: 0.05, maximum: 100},
                                year: {type: "integer", minimum: 2000, maximum: (new Date().getFullYear())}
                            }
                        }
                    }
                },
                hvac: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            cooling: {
                                type: "object",
                                properties: {
                                    efficiency: {type: "number", minimum: 8, maximum: 40},
                                    efficiency_method: {type: "string", enum: ENUMS.hvacEfficiencyOptions},
                                    type: {type: "string", enum: ENUMS.coolingTypeOptions},
                                }
                            },
                            heating: {
                                type: "object",
                                properties: {
                                    efficiency: {type: "number", minimum: 0.6, maximum: 20},
                                    efficiency_method: {type: "string", enum: ENUMS.hvacEfficiencyOptions},
                                    fuel_primary: {type: "string", enum: ENUMS.heatingFuelOptions},
                                    type: {type: "string", enum: ENUMS.heatingTypeOptions}
                                }
                            },
                            hvac_fraction: {},
                            hvac_name: {type: "string"},
                        }
                    }
                },
            }
        },
        zone: {
            type: "object",
            properties: {
                wall_construction_same: {
                    type: "boolean"
                },
                window_construction_same: {
                    type: "boolean"
                },
                zone_floor: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            floor_area: {type: "number", minimum: 4, maximum: 25000 },
                            floor_assembly_code: {type: "string", enum: ENUMS.floorAssemblyCode },
                            floor_name: {type: "string"},
                            foundation_insulation_level: {type: "number", enum: ENUMS.foundationInsulationLevels },
                            foundation_type: {type: "string", enum: ENUMS.foundationType },
                        },
                        additionalProperties: false
                    },
                },
                zone_roof: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            ceiling_assembly_code: {type: "string", enum: ENUMS.ceilingAssemblyCode},
                            ceiling_area: {type: "number", minimum: 4, maximum: 25000},
                            roof_assembly_code: {type: "string", enum: ENUMS.roofAssemblyCode},
                            roof_color: {type: "string", enum: ENUMS.roofColor},
                            roof_name: {type: "string"},
                            roof_type: {type: "string", enum: ENUMS.roofType},
                            zone_skylight: {
                                type: "object",
                                properties: {
                                    skylight_area: {type: "number", minimum: 0, maximum: 300},
                                    skylight_u_value: {type: "number", minimum: 0.01, maximum: 5},
                                    skylight_shqc: {type: "number", minimum: 0, maximum: 1},
                                    solar_screen: {type: "boolean"}
                                }
                            },
                        },
                        // If roof_type entered, require roof contents
                        if: { properties: {roof_type: {enum: ENUMS.roofType}}},
                        then: {
                            required: ['roof_assembly_code', 'roof_color'],
                            // If roof_type is vented_attic, require ceiling fields
                            if: { properties: {roof_type: {const: 'vented_attic'}}},
                            then: {
                                required: ['ceiling_area', 'ceiling_assembly_code']
                            },
                            else: {
                                if: {properties: {roof_type: {const: 'cath_ceiling'}}},
                                then: {required: ['roof_area']}
                            },
                        },
                    }
                },
                zone_wall: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            side: {type: "string", enum: ENUMS.zoneWallSides},
                            wall_assembly_code: {type: "string", enum: ENUMS.wallAssemblyCode},
                            zone_window: {
                                type: "object",
                                properties: {
                                    solar_screen: {type: "boolean"},
                                    window_area: {type: "number", minimum: 0, maximum:999},
                                    window_method: {type: "string"},
                                    window_shqc: {type: "number", maximum: 1, minimum: 0},
                                    window_u_value: {type: "number", maximum: 1, minimum: 0},
                                }
                            }
                        },
                        additionalProperties: false
                    }
                }
            },

            required: [
                "wall_construction_same",
                "window_construction_same"
            ],
        }
    },
    required: ["about"],
    // additionalProperties: true
}

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
    return homeValues.building ? getNestedRequiredFields(homeValues.building) : getFlatRequiredFields(homeValues);
}

function getNestedRequiredFields (homeValues) {
    const errorMessages = {}
    errorMessages[ENUMS.BLOCKER] = {};
    errorMessages[ENUMS.ERROR] = {};
    errorMessages[ENUMS.MANDATORY] = {};

    const nested_validate = ajv.compile(nestedRequiredFields);
    const valid=nested_validate(homeValues);
    if(!valid) {
        nested_validate.errors.forEach((error) => {
            const {instancePath, params} = error;
            const errorPath = params.missingProperty ? `${instancePath}/${params.missingProperty}` : instancePath;

            if(errorMessages[ENUMS.BLOCKER][errorPath] === undefined) {
                errorMessages[ENUMS.BLOCKER][errorPath] = [];
            }
            errorMessages[ENUMS.BLOCKER][errorPath].push(convertAJVError(error));
        })
        // console.log('errors', nested_validate.errors[0]);
    }
    getAdditionalNestedRequiredFields(homeValues, errorMessages);
    getCrossValidationMessages(homeValues, errorMessages);
    return errorMessages
}

function convertAJVError(errorObj) {
    const {keyword, schemaPath, instancePath, params, message} = errorObj;
    const returnObj = {
        schemaPath, instancePath, keyword, message
    }
    switch(keyword) {
        case 'required':
            returnObj.message = mandatoryMessage;
            break;
        default:
            break;
    }
    return returnObj;
}

function getCrossValidationMessages (homeValues, errorMessages) {
    const CrossValidator = new validationRules(homeValues);
    getAboutObjectCrossValidationMessages(homeValues.about, errorMessages, CrossValidator)
}

/**
 * Cross validations for the "About" object in the nested JSON Schema
 */
function getAboutObjectCrossValidationMessages(about, errorMessages, CrossValidator) {
    const fields = ['shape', 'year_built', 'number_bedrooms', 'num_floor_above_grade',
        'floor_to_ceiling_height', 'conditioned_floor_area', 'orientation', 'blower_door_test',
        'envelope_leakage', 'town_house_walls', 'air_sealing_present', 'comments'];
    for(const index in fields) {
        const field = fields[index]
        if(![null, undefined].includes(about[field])) {
            const validationResult = CrossValidator[field](about[field])
            if(validationResult && validationResult['message']) {
                if(errorMessages[validationResult['type']][`/about/${field}`] === undefined) {
                    errorMessages[validationResult['type']][`/about/${field}`] = [];
                }
                errorMessages[validationResult['type']][`/about/${field}`].push(validationResult['message']);
            }
        }
    }
}

function getZoneCrossValidationMessages(zone, errorMessages, CrossValidator) {
    // zone wall

    // zone roof

    // zone floor
}


function getAdditionalNestedRequiredFields (homeValues) {

}

function getAdditionalRoofFields (roof, index, errorMessages) {

}

function getAdditionalSkylightFields (skylight, roof_index, errorMessages) {
    // If we have a skylight area and it's not 0
    if(skylight.skylight_area && skylight.skylight_area !== 0) {
        // Skylight method is required
        if(!skylight.skylight_method) {
            // ERROR:  Skylight method is required
            errorMessages[ENUMS.BLOCKER].zone_roof[roof_index].zone_skylight.skylight_method = 'This is a required skylight field';
        } else
            // Skylight method is code
        if (skylight.skylight_method === 'code' && !skylight.skylight_code) {
            // If there is not 'code'
            errorMessages[ENUMS.BLOCKER].zone_roof[roof_index].zone_skylight.skylight_code = 'Skylight specs are required if known';
        }
        // Else, is custom
        else {
            ['skylight_u_value', 'skylight_shgc'].forEach((item) => {
                if(!skylight[item]) {
                    errorMessages[ENUMS.BLOCKER].zone_roof[roof_index].zone_skylight[item] = 'Field is required if skylight specs unknown'
                }
            });
        }
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
                requiredFields['cooling_year_'+system] = 'Year Installed is required when efficincy value is unknown';
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
