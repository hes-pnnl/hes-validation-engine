
/***************
 * VALIDATIONS *
 ***************/

const Validation = require("./validation.node");
const TypeRules = require("./type_rules.node");
const ENUMS = require('./validation_enums.node');

const ERROR = ENUMS.ERROR;
const BLOCKER = ENUMS.BLOCKER;
const MANDATORY = ENUMS.MANDATORY;



/**
 * Each validation rule has the same name as the "name" attribute of the associated form input.
 * Each rule is a function that takes the following parameter:
 * @param {string} value The value of the field
 */

module.exports = class ValidationRules{
    _homeValues;
    
    constructor(homeValues) {
        this._homeValues = homeValues;
    }

    /*
     * building
     */
    building_id(value) {
        return new Validation(TypeRules._int(value), ERROR);
    }
    assessor_id(value) {
        return new Validation(TypeRules._string(value), ERROR);
    }

    /*
     * address_validate
     */
    address(value) {
        return new Validation(TypeRules._string(value), ERROR);
    }
    city(value) {
        return new Validation(TypeRules._string(value), ERROR);
    }
    state(value) {
        return new Validation(TypeRules._string(value, 2, ENUMS.stateArray), ERROR);
    }
    zip_code(value) {
        return new Validation(TypeRules._zip(value), ERROR);
    }
    assessment_type(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.assessmentTypes), BLOCKER);
    }
    external_building_id(value) {
        return new Validation(TypeRules._string(value), ERROR);
    }

    /*
     * about
     */
    assessment_date(value) {
        return new Validation(TypeRules._date(value, Date.parse('2010-01-01'), Date.now()), BLOCKER);
    }
    comments(value) {
        return new Validation(TypeRules._string(value, 512), BLOCKER);
    }
    //The following two functions are associated with current Walls page
    shape(value) {
        return new Validation(TypeRules._string(value, 20, ['rectangle', 'town_house']), BLOCKER);
    }
    town_house_walls(value) {
        return new Validation(TypeRules._string(value, 20, ['back_front', 'back_right_front', 'back_front_left']), BLOCKER);
    }
    year_built(value) {
        return new Validation(TypeRules._int(value, 1600, (new Date()).getFullYear()), BLOCKER);
    }
    number_bedrooms(value) {
        return new Validation(TypeRules._int(value, 1, 10), BLOCKER);
    }
    num_floor_above_grade(value) {
        return new Validation(TypeRules._int(value, 1, 4), BLOCKER);
    }
    floor_to_ceiling_height(value) {
        return new Validation(TypeRules._int(value, 6, 12), BLOCKER);
    }
    conditioned_floor_area(value) {
        const checkFootprint = this._check_footprint();
        if(checkFootprint) {
            return new Validation(checkFootprint, BLOCKER);
        }
        return new Validation(TypeRules._int(value, 250, 25000), BLOCKER);
    }
    orientation(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.orientationArray), BLOCKER);
    }
    blower_door_test(value) {
        return new Validation(TypeRules._bool(value), BLOCKER);
    }
    air_sealing_present(value) {
        return new Validation(TypeRules._bool(value), BLOCKER);
    }
    envelope_leakage(value) {
        return new Validation(TypeRules._int(value, 0, 25000), BLOCKER);
    }

    /*
     * zone
     */
    wall_construction_same(value) {
        return new Validation(TypeRules._bool(value), BLOCKER);
    }
    window_construction_same(value) {
        return new Validation(TypeRules._bool(value), BLOCKER);
    }
    /*
     * zone_roof
     */
    // roof_type_1(value) {
    //     return this._roof_type(value);
    // }
    // roof_type_2(value) {
    //     return this._roof_type(value);
    // }
    _roof_type(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.roofType), BLOCKER);
    }

    // roof_area_1(value) {
    //     return this._roof_area(value, '1');
    // }
    // roof_area_2(value) {
    //     return this._roof_area(value, '2');
    // }

    /**
     * If the roof is Cathedral Celiing (roof_type = 'cath_ceiling'), check that the roof area is not less
     * than the combined floor area of the zone AND that the roof is not less than the
     * @param value
     * @param num
     * @return {Validation}
     * @private
     */
    _roof_area(value, num) {
        if(this._homeValues['roof_type_'+ num] === 'cath_ceiling') {
            //Check that roof area is within legal bounds per API
            if (TypeRules._int(value, 4, 25000, false) === undefined) {
                let combinedAreaCheck = this._check_combined_area();
                //Check that roof area is not less than floor area
                if (!combinedAreaCheck) {
                    let combinedRoofArea = this._get_combined_roof_ceiling_area();
                    let checkConditionedAreas = this._check_conditioned_areas(combinedRoofArea, "roof");
                    //Check that combined areas are consistent with conditioned floor areas
                    if (checkConditionedAreas) {
                        return new Validation(checkConditionedAreas, ERROR);
                    }
                } else {
                    return new Validation(combinedAreaCheck, ERROR);
                }
            } else {
                //This is a blocker case and will prevent saving
                return new Validation(TypeRules._int(value, 1, 25000), BLOCKER);
            }
        }
    }
    // ceiling_area_1(value) {
    //     return this._ceiling_area(value, '1');
    // }
    // ceiling_area_2(value) {
    //     return this._ceiling_area(value, '2');
    // }
    _ceiling_area(value, num) {
        if(this._homeValues['roof_type_'+ num] === 'vented_attic') {
            //Check that roof area is within legal bounds per API
            if (TypeRules._int(value, 4, 25000, false) === undefined) {
                let combinedAreaCheck = this._check_combined_area();
                //Check that roof area is not less than floor area
                if (!combinedAreaCheck) {
                    let combinedRoofArea = this._get_combined_roof_ceiling_area();
                    let checkConditionedAreas = this._check_conditioned_areas(combinedRoofArea, "ceiling");
                    //Check that combined areas are consistent with conditioned floor areas
                    if (checkConditionedAreas) {
                        return new Validation(checkConditionedAreas, ERROR);
                    }
                } else {
                    return new Validation(combinedAreaCheck, ERROR);
                }
            } else {
                //This is a blocker case and will prevent saving
                return new Validation(TypeRules._int(value, 1, 25000), BLOCKER);
            }
        }
    }
    // roof_assembly_code_1(value) {
    //     return this._roof_assembly_code(value);
    // }
    // roof_assembly_code_2(value) {
    //     return this._roof_assembly_code(value);
    // }
    _roof_assembly_code(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.roofAssemblyCode), BLOCKER);
    }

    // roof_color_1(value) {
    //     return this._roof_color(value);
    // }
    // roof_color_2(value) {
    //     return this._roof_color(value);
    // }
    _roof_color(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.roofColor), BLOCKER);
    }

    // roof_absorptance_1(value) {
    //     return this._roof_absorptance(value);
    // }
    // roof_absorptance_2(value) {
    //     return this._roof_absorptance(value);
    // }
    _roof_absorptance(value) {
        return new Validation(TypeRules._float(value, 0, 1), BLOCKER);
    }

    // ceiling_assembly_code_1(value) {
    //     return this._ceiling_assembly_code(value);
    // }
    // ceiling_assembly_code_2(value) {
    //     return this._ceiling_assembly_code(value);
    // }
    _ceiling_assembly_code(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.ceilingAssemblyCode), BLOCKER);
    }

    // knee_wall_area_1(value) {
    //     return this._knee_wall_area(value);
    // }
    // knee_wall_area_2(value) {
    //     return this._knee_wall_area(value);
    // }
    _knee_wall_area(value) {
        const constraintsError = TypeRules._int(value, 4, 5000, false);
        if (constraintsError === undefined) {
            let footprintArea = this._get_footprint_area();
            let max_knee_wall_area = 2*footprintArea/3;
            let knee_wall_area = TypeRules._int_or_zero(this._homeValues['knee_wall_area_1']) + TypeRules._int_or_zero(this._homeValues['knee_wall_area_2']);
            if(knee_wall_area > max_knee_wall_area){
                return new Validation( `Total knee wall area exceeds the maximum allowed ${Math.ceil(max_knee_wall_area)} sqft (2/3 the footprint area).`, ERROR);
            }
        } else {
            return new Validation(constraintsError, BLOCKER);
        }
    }

    // knee_wall_assembly_code_1(value) {
    //     return this._knee_wall_assembly_code(value);
    // }
    // knee_wall_assembly_code_2(value) {
    //     return this._knee_wall_assembly_code(value);
    // }
    _knee_wall_assembly_code(value) {
        return new Validation(TypeRules._string(value, 10, ENUMS.kneeWallAssemblyCodes), BLOCKER);
    }

    /*
     * zone_floor
     */
    floor_area_1(value) {
        return this._floor_area(value);
    }
    floor_area_2(value) {
        return this._floor_area(value);
    }
    _floor_area(value) {
        //Check that floor area is within legal bounds per API
        if (TypeRules._int(value, 4, 25000, false) === undefined) {
            let combinedAreaCheck = this._check_combined_area();
            //Check that floor area is not greater than roof area
            if (!combinedAreaCheck) {
                let combinedFloorArea = this._get_combined_floor_area();
                let checkConditionedAreas = this._check_conditioned_areas(combinedFloorArea, "floor");
                //Check that combined areas are consistent with conditioned floor areas
                if (checkConditionedAreas) {
                    return new Validation(checkConditionedAreas, ERROR);
                }
            } else {
                return new Validation(combinedAreaCheck, ERROR);
            }
        } else {
            const checkFootprint = this._check_footprint();
            if(checkFootprint) {
                return new Validation(checkFootprint, BLOCKER);
            }
            //This is a blocker case and will prevent saving
            return new Validation(TypeRules._int(value, 1, 25000), BLOCKER);
        }
    }

    foundation_type_1(value) {
        return this._foundation_type(value);
    }
    foundation_type_2(value) {
        return this._foundation_type(value);
    }
    _foundation_type(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.foundationType), BLOCKER);
    }

    foundation_insulation_level_1(value) {
        return this._foundation_insulation_level(value, 1);
    }
    foundation_insulation_level_2(value) {
        return this._foundation_insulation_level(value, 2);
    }
    _foundation_insulation_level(value, num) {
        const outsideApiBounds = TypeRules._int(value, 0, 19);
        if(outsideApiBounds) {
            return new Validation(outsideApiBounds, BLOCKER);
        } else if(this._homeValues['foundation_type_'+num] === 'slab_on_grade') {
            if([0, 5].indexOf(parseInt(value)) === -1) {
                return new Validation('Insulation must be R-0 or R-5 for Slab on Grade Foundation', ERROR);
            }
        } else {
            if([0, 11, 19].indexOf(parseInt(value)) === -1) {
                return new Validation('Insulation must be R-0, R-11, or R-19 for current foundation type', ERROR);
            }
        }
    }

    floor_assembly_code_1(value) {
        return this._floor_assembly_code(value);
    }
    floor_assembly_code_2(value) {
        return this._floor_assembly_code(value);
    }
    _floor_assembly_code(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.floorAssemblyCode), BLOCKER);
    }

    /*
     * zone_skylight
     */
    skylight_area(value) {
        let footprintArea = this._get_footprint_area();
        if(value > 300 || value < 0) {
            //Skylights have API max of 300
            return new Validation(TypeRules._float(value, 0, 300), BLOCKER);
        }
        if(footprintArea) {
            return new Validation(TypeRules._float(value, 0, footprintArea), BLOCKER);
        }
    }
    skylight_solar_screen(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    }
    skylight_method(value) {
        return new Validation(TypeRules._string(value, 20, ['code', 'custom']), BLOCKER);
    }
    skylight_code(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.windowAndSkylightCode), BLOCKER);
    }
    skylight_u_value(value) {
        return new Validation(TypeRules._float(value, 0.01, 5), BLOCKER);
    }
    skylight_shgc(value) {
        return new Validation(TypeRules._float(value, 0, 1, false), BLOCKER);
    }

    skylight_area_2(value) {
        return this.skylight_area(value);
    }
    skylight_method_2(value) {
        return new Validation(TypeRules._string(value, 20, ['code', 'custom']), BLOCKER);
    }
    skylight_code_2(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.windowAndSkylightCode), BLOCKER);
    }
    skylight_u_value_2(value) {
        return new Validation(TypeRules._float(value, 0.01, 5), BLOCKER);
    }
    skylight_shgc_2(value) {
        return new Validation(TypeRules._float(value, 0, 1, false), BLOCKER);
    }
    /*
     * zone_window
     */
    window_solar_screen_front(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    }
    window_solar_screen_back(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    }
    window_solar_screen_right(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    }
    window_solar_screen_left(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    }
    window_area_front(value) {
        let wallArea = this._get_wall_area_front_back();
        return this._window_area(value, wallArea, 'front');
    }
    window_area_back(value) {
        let wallArea = this._get_wall_area_front_back();
        return this._window_area(value, wallArea, 'back');
    }
    window_area_right(value) {
        let wallArea = this._get_wall_area_left_right();
        return this._window_area(value, wallArea, 'right');
    }
    window_area_left(value) {
        let wallArea = this._get_wall_area_left_right();
        return this._window_area(value, wallArea, 'left');
    }
    _window_area(value, wallArea, side) {
        if (value > 999 || value < 0) {
            //Windows have API max area of 999
            return this._get_wall_validation(value, side, new Validation(TypeRules._float(value, 0, 999), BLOCKER));
        }

        const invalidWall = this._is_valid_wall_side(value, side);
        if (invalidWall && invalidWall['message']) {
            return invalidWall;
        }

        if (wallArea) {
            // NOTE: While the XSD def is inclusive, the wall area check is exclusive.
            // For this reason, We also set min to -1 so zero is always valid
            return this._get_wall_validation(value, side, new Validation(TypeRules._float(value, -1, wallArea, false), BLOCKER));
        }
    }

    window_method_front(value) {
        return this._window_method(value, 'front');
    }
    window_method_back(value) {
        return this._window_method(value, 'back');
    }
    window_method_right(value) {
        return this._window_method(value, 'right');
    }
    window_method_left(value) {
        return this._window_method(value, 'left');
    }
    _window_method(value, side) {
        return this._get_wall_validation(value, side, new Validation(TypeRules._string(value, 20, ['code', 'custom']), BLOCKER));
    }

    window_code_front(value) {
        return this._window_code(value, 'front');
    }
    window_code_back(value) {
        return this._window_code(value, 'back');
    }
    window_code_right(value) {
        return this._window_code(value, 'right');
    }
    window_code_left(value) {
        return this._window_code(value, 'left');
    }
    _window_code(value, side) {
        return this._get_wall_validation(value, side, new Validation(TypeRules._string(value, 20, ENUMS.windowAndSkylightCode), BLOCKER));
    }

    window_u_value_front(value) {
        return this._window_u_value(value, 'front');
    }
    window_u_value_back(value) {
        return this._window_u_value(value, 'back');
    }
    window_u_value_right(value) {
        return this._window_u_value(value, 'right');
    }
    window_u_value_left(value) {
        return this._window_u_value(value, 'left');
    }
    _window_u_value(value, side) {
        return this._get_wall_validation(value, side, new Validation(TypeRules._float(value, 0.01, 5), BLOCKER));
    }

    window_shgc_front(value) {
        return this._window_shgc(value, 'front');
    }
    window_shgc_back(value) {
        return this._window_shgc(value, 'back');
    }
    window_shgc_right(value) {
        return this._window_shgc(value, 'right');
    }
    window_shgc_left(value) {
        return this._window_shgc(value, 'left');
    }
    _window_shgc(value, side) {
        return this._get_wall_validation(value, side, new Validation(TypeRules._float(value, 0, 1, false), BLOCKER));
    }

    /*
     * zone_wall
     */
    wall_assembly_code_front(value) {
        return this._wall_assembly_code(value, 'front');
    }
    wall_assembly_code_back(value) {
        return this._wall_assembly_code(value, 'back');
    }
    wall_assembly_code_right(value) {
        return this._wall_assembly_code(value, 'right');
    }
    wall_assembly_code_left(value) {
        return this._wall_assembly_code(value, 'left');
    }
    _wall_assembly_code(value, side) {
        return this._get_wall_validation(value, side, new Validation(TypeRules._string(value, 20, ENUMS.wallAssemblyCode), BLOCKER));
    }

    /*
     * hvac
     */
    hvac_fraction_1(value) {
        return this._hvac_fraction(value);
    }
    hvac_fraction_2(value) {
        return this._hvac_fraction(value);
    }
    _hvac_fraction(value) {
        const fraction1 = this._homeValues.hvac_fraction_1 ? parseFloat(this._homeValues.hvac_fraction_1) : 0;
        const fraction2 = this._homeValues.hvac_fraction_2 ? parseFloat(this._homeValues.hvac_fraction_2) : 0;
        const fullPercentCheck = TypeRules._fraction(fraction1 + fraction2);
        if(fullPercentCheck) {
            return new Validation(fullPercentCheck, BLOCKER);
        } else if(TypeRules._float(value, 0, 1)) {
            return new Validation('Value must be between 0 and 100%', ERROR);
        }
    }

    /*
     * hvac_heating
     */
    _heating_and_cooling_types(value, num, heatingOrCooling) {
        const oppSystem = heatingOrCooling === ENUMS.HEATING ? ENUMS.COOLING : ENUMS.HEATING;
        const validTypeOptions = heatingOrCooling === ENUMS.HEATING ? ENUMS.heatingTypeOptions : ENUMS.coolingTypeOptions;
        const blocker = new Validation(TypeRules._string(value, 100, validTypeOptions), BLOCKER);
        if(!blocker['message']) {
            const currLower = heatingOrCooling.charAt(0).toLowerCase() + heatingOrCooling.slice(1);
            const oppLower = oppSystem.charAt(0).toLowerCase() + oppSystem.slice(1);
            if(value === 'none' && this._homeValues[oppLower+'_type_'+num] === 'none') {
                let message = heatingOrCooling + ' Type is required if there is no ' + oppSystem + ' Type';
                return new Validation(message, ERROR);
            }
            if(heatingOrCooling === ENUMS.HEATING) {
                if(!this._homeValues['heating_fuel_'+num]) {
                    return new Validation(!value || value === 'none' ? undefined : 'Cannot enter type without fuel', ERROR);
                } else if (heatingFuelToType[this._homeValues['heating_fuel_'+num]].indexOf(this._homeValues['heating_type_'+num]) === -1) {
                    return new Validation(this._homeValues['heating_fuel_'+num]+' is not an appropriate fuel for heating type '+value, ERROR);
                }
            } else {
                // If Cooling Type is heat_pump or gchp, Heating Type must match or be wood_stove or none
                if(['heat_pump', 'gchp'].indexOf(value) > -1) {
                    if([value, 'wood_stove', 'none'].indexOf(this._homeValues[oppLower+'_type_'+num]) === -1) {
                        return new Validation(this._homeValues['heating_type_'+num]+' is not an appropriate heating type with cooling type '+value, ERROR);
                    }
                    // If Cooling Type is minisplit, Heating Type cannot be heat_pump or gchp
                } else if('mini_split' === value) {
                    if(['heat_pump', 'gchp'].indexOf(this._homeValues[oppLower+'_type_'+num]) > -1) {
                        return new Validation(this._homeValues['heating_type_'+num]+' is not an appropriate heating type with cooling type '+value, ERROR);
                    }
                    // If Cooling Type is split_dx, Heating Type cannot be a heat pump
                } else if('split_dx' === value) {
                    if(['heat_pump', 'gchp', 'mini_split'].indexOf(this._homeValues[oppLower+'_type_'+num]) > -1) {
                        return new Validation(this._homeValues[oppLower+'_type_'+num]+' is not an appropriate heating type with cooling type '+value, ERROR);
                    }
                    // TODO: The rule below was but in place because dec / gchp combo triggered an error: https://hescore-pnnl-sim-doe2-st.s3.us-west-2.amazonaws.com/st-st-727018/userLayer.inc/OUTPUT
                } else if('dec' === value) {
                    if(['gchp'].indexOf(this._homeValues[oppLower+'_type_'+num]) > -1) {
                        return new Validation(this._homeValues[oppLower+'_type_'+num]+' is not an appropriate heating type with cooling type '+value, ERROR);
                    }
                }
            }
        }
        return blocker;
    }

    heating_type_1(value) {
        return this._get_system_validation(value, 1, this._heating_and_cooling_types(value, 1, ENUMS.HEATING));
    }
    heating_type_2(value) {
        return this._get_system_validation(value, 2, this._heating_and_cooling_types(value, 2, ENUMS.HEATING));
    }

    heating_fuel_1(value) {
        return this._get_system_validation(value, 1, this._heating_fuel(value));
    }
    heating_fuel_2(value) {
        return this._get_system_validation(value, 2, this._heating_fuel(value));
    }
    _heating_fuel(value) {
        return new Validation(TypeRules._string(value, 100, ENUMS.heatingFuelOptions), BLOCKER);
    }

    heating_efficiency_method_1(value) {
        return this._get_system_validation(value, 1, this._heating_efficiency_method(value, 1));
    }
    heating_efficiency_method_2(value) {
        return this._get_system_validation(value, 2, this._heating_efficiency_method(value, 2));
    }
    _heating_efficiency_method(value, num) {
        const blocker = new Validation(TypeRules._string(value, 20, ['user', 'shipment_weighted']), BLOCKER);
        if(!blocker['message']) {
            const isHeatingTypeWithoutEfficiencyMethod = ['baseboard', 'wood_stove', 'none'].indexOf(this._homeValues['heating_type_'+num]) > -1;
            const isElectricFurnace = this._homeValues['heating_type_'+num] === 'central_furnace' && this._homeValues['heating_fuel_'+num] === 'electric';
            if(!TypeRules._is_empty(value) && (isHeatingTypeWithoutEfficiencyMethod || isElectricFurnace || TypeRules._is_empty(this._homeValues['heating_type_'+num]))) {
                return new Validation('Efficiency method should not be set if heating type is "central furnace" and fuel is "electric", or if heating type is "baseboard", "wood stove", "none", or empty', ERROR);
            }
            if(value === 'shipment_weighted') {
                // If heating is wall_furnace and not natural_gas, efficiency method must be user
                if(this._homeValues['heating_type_'+num] === 'wall_furnace' && this._homeValues['heating_fuel_'+num] !== 'natural_gas') {
                    return new Validation('Efficiency method must be "user" if heating type "wall_furnace" and fuel is not "natural_gas"', ERROR);
                }
                // HVAC and Water Heater efficiencies must be user when type is mini_split or gchp
                if(['mini_split', 'gchp'].includes(this._homeValues['heating_type_'+num])) {
                    return new Validation(`Heating efficiency method must be 'user' when type is '${this._homeValues['heating_type_'+num]}'`, ERROR);
                }
            }
        }
        return blocker;
    }

    heating_year_1(value) {
        return this._get_system_validation(value, 1, this._installation_year(value, 1970));
    }
    heating_year_2(value) {
        return this._get_system_validation(value, 2, this._installation_year(value, 1970));
    }

    heating_efficiency_1(value) {
        return this._get_system_validation(value, 1, this._heating_efficiency(this._homeValues.heating_type_1, value));
    }
    heating_efficiency_2(value) {
        return this._get_system_validation(value, 2, this._heating_efficiency(this._homeValues.heating_type_2, value));
    }
    _heating_efficiency(type, value) {
        let min, max;

        if (type === 'central_furnace' || type === 'wall_furnace' || type === 'boiler') {
            [min, max] = [0.6, 1.0];
        } else if (type === 'heat_pump') {
            [min, max] = [6, 20];
        } else if (type === 'mini_split') {
            [min, max] = [6, 20];
        } else if (type === 'gchp') {
            [min, max] = [2, 5];
        }

        return new Validation(TypeRules._float(value, min, max), BLOCKER);
    }

    /*
     * hvac_cooling
     */
    cooling_type_1(value) {
        return this._get_system_validation(value, 1, this._heating_and_cooling_types(value, 1, ENUMS.COOLING));
    }
    cooling_type_2(value) {
        return this._get_system_validation(value, 2, this._heating_and_cooling_types(value, 2, ENUMS.COOLING));
    }

    cooling_efficiency_method_1(value) {
        return this._get_system_validation(value, 1, this._cooling_efficiency_method(value, 1));
    }
    cooling_efficiency_method_2(value) {
        return this._get_system_validation(value, 2, this._cooling_efficiency_method(value, 2));
    }
    _cooling_efficiency_method(value, num) {
        const blocker = new Validation(TypeRules._string(value, 20, ['user', 'shipment_weighted']), BLOCKER);
        if(!blocker['message']) {
            if(!TypeRules._is_empty(value) && (['none', 'dec'].indexOf(this._homeValues['cooling_type_'+num]) > -1  || TypeRules._is_empty(this._homeValues['cooling_type_'+num]))) {
                return new Validation('Efficiency method should not be set if cooling type is "none", "direct evaporative cooler", or empty', ERROR);
            }
            // HVAC and Water Heater efficiencies must be user when type is mini_split or gchp
            if(['mini_split', 'gchp'].includes(this._homeValues['cooling_type_'+num]) && value !== 'user') {
                return new Validation(`Cooling efficiency must be 'user' when type is '${this._homeValues['cooling_type_'+num]}'`, ERROR);
            }
        }
        return blocker;
    }

    cooling_year_1(value) {
        return this._get_system_validation(value, 1, this._installation_year(value, 1970));
    }
    cooling_year_2(value) {
        return this._get_system_validation(value, 2, this._installation_year(value, 1970));
    }

    cooling_efficiency_1(value) {
        return this._get_system_validation(value, 1, this._cooling_efficiency(value));
    }
    cooling_efficiency_2(value) {
        return this._get_system_validation(value, 2, this._cooling_efficiency(value));
    }
    _cooling_efficiency(value) {
        return new Validation(TypeRules._float(value, 8, 40), BLOCKER);
    }

    /*
     * hvac_distribution
     */
    hvac_distribution_leakage_method_1(value) {
        return this._hvac_distribution_leakage_method(value, 1);
    }
    hvac_distribution_leakage_method_2(value) {
        return this._hvac_distribution_leakage_method(value, 2);
    }
    _hvac_distribution_leakage_method(value) {
        return new Validation(TypeRules._string(value, 20, ['qualitative', 'quantitative']), BLOCKER);
    }
    hvac_distribution_leakage_to_outside_1(value) {
        return this._hvac_distribution_leakage_to_outside(value, 1);
    }
    hvac_distribution_leakage_to_outside_2(value) {
        return this._hvac_distribution_leakage_to_outside(value, 2);
    }
    _hvac_distribution_leakage_to_outside(value, system) {
        if(this._homeValues['hvac_distribution_leakage_method_'+system] === 'qualitative') {
            return new Validation("Leakage should not be passed for your system if the method is 'qualitative'", ERROR);
        }
        return new Validation(TypeRules._float(value, 0, 1000, true), BLOCKER);
    }
    hvac_distribution_sealed_1(value) {
        return this._hvac_distribution_sealed(value, 1);
    }
    hvac_distribution_sealed_2(value) {
        return this._hvac_distribution_sealed(value, 2);
    }
    _hvac_distribution_sealed(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    }
    /*
     * ducts
     */
    duct_location_1_1(value) {
        return this._get_duct_validation(value, 1, 1, this._duct_location(value));
    }
    duct_location_2_1(value) {
        return this._get_duct_validation(value, 1, 2, this._duct_location(value));
    }
    duct_location_3_1(value) {
        return this._get_duct_validation(value, 1, 3, this._duct_location(value));
    }
    duct_location_1_2(value) {
        return this._get_duct_validation(value, 2, 1, this._duct_location(value));
    }
    duct_location_2_2(value) {
        return this._get_duct_validation(value, 2, 2, this._duct_location(value));
    }
    duct_location_3_2(value) {
        return this._get_duct_validation(value, 2, 3, this._duct_location(value));
    }
    _duct_location(value) {
        const invalidSpace = new Validation(TypeRules._string(value, 20, ENUMS.ductType), BLOCKER);
        if (invalidSpace && invalidSpace['message']) {
            return invalidSpace;
        }
        return this._duct_space_exists(value);
    }

    duct_fraction_1_1(value) {
        return this._duct_fraction(value, '1');
    }
    duct_fraction_2_1(value) {
        return this._duct_fraction(value, '1');
    }
    duct_fraction_3_1(value) {
        return this._duct_fraction(value, '1');
    }
    duct_fraction_1_2(value) {
        return this._duct_fraction(value, '2');
    }
    duct_fraction_2_2(value) {
        return this._duct_fraction(value, '2');
    }
    duct_fraction_3_2(value) {
        return this._duct_fraction(value, '2');
    }
    _duct_fraction(value, c) {
        let fullPercentCheck = null;
        if(['1', '2'].indexOf(c) > -1) {
            const totalPercent = [1, 2, 3].reduce((prev, duct) => prev + (parseFloat(this._homeValues[`duct_fraction_${duct}_${c}`]) || 0), 0);
            fullPercentCheck = TypeRules._fraction(totalPercent);
            if(fullPercentCheck) {
                return new Validation(fullPercentCheck, BLOCKER);
            } else if(TypeRules._float(value, 0, 1)) {
                return new Validation('Value must be between 0 and 100', ERROR);
            }
        } else {
            throw new Error("Unexpected duct " + c);
        }
    }

    duct_insulated_1_1(value) {
        return this._duct_insulated(value, 1, 1);
    }
    duct_insulated_2_1(value) {
        return this._duct_insulated(value, 1, 2);
    }
    duct_insulated_3_1(value) {
        return this._duct_insulated(value, 1, 3);
    }
    duct_insulated_1_2(value) {
        return this._duct_insulated(value, 2, 1);
    }
    duct_insulated_2_2(value) {
        return this._duct_insulated(value, 2, 2);
    }
    duct_insulated_3_2(value) {
        return this._duct_insulated(value, 2, 3);
    }
    _duct_insulated(value, sys, duct) {
        return this._get_duct_validation(value, sys, duct, new Validation(TypeRules._int(value, 0, 1), BLOCKER));
    }

    /*
     * systems_hot_water
     */
    hot_water_category(value) {
        const blocker = new Validation(TypeRules._string(value, 20, ['unit', 'combined']), BLOCKER);
        if(!blocker['message'] && [this._homeValues['heating_type_1'], this._homeValues['heating_type_2'], this._homeValues['cooling_type_1'], this._homeValues['cooling_type_2']].indexOf('boiler') === -1 && value === 'combined') {
            return new Validation("Must have a boiler for combined hot water category", ERROR);
        }
        return blocker;
    }
    hot_water_type(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.hotWaterType), BLOCKER);
    }
    hot_water_fuel(value) {
        const blocker = new Validation(TypeRules._string(value, 20, ENUMS.hotWaterFuel), BLOCKER);
        if(!blocker['message']) {
            if((this._homeValues.hot_water_type === 'tankless_coil' || this._homeValues.hot_water_type === 'indirect') && value) {
                return new Validation('Fuel is only used if type is set to storage or heat pump', ERROR);
            }
            if(this._homeValues.hot_water_type === 'heat_pump' && value !== 'electric') {
                return new Validation('Fuel must be electric if type is heat pump', ERROR);
            }
        }
        return blocker;
    }
    hot_water_efficiency_method(value) {
        const blocker = new Validation(TypeRules._string(value, 20, ['user', 'uef', 'shipment_weighted']), BLOCKER);
        if(!blocker['message'] && ['heat_pump', 'tankless', 'tankless_coil'].indexOf(this._homeValues['hot_water_type']) > -1 && value === 'shipment_weighted') {
            return new Validation('Invalid Efficiency Method for entered Hot Water Type', ERROR);
        }
        return blocker;
    }
    hot_water_year(value) {
        return this._installation_year(value, 1972);
    }
    hot_water_energy_factor(value) {
        let min, max;

        if (this._homeValues.hot_water_type === 'storage') {
            [min, max] = [0.45, 0.95];
        } else if (this._homeValues.hot_water_type === 'tankless') {
            [min, max] = [0.45, 0.99];
        } else if (this._homeValues.hot_water_type === 'heat_pump') {
            [min, max] = [1, 4];
        }

        return new Validation(TypeRules._float(value, min, max), BLOCKER);
    }

    /*
     * systems_solar_electric
     */
    solar_electric_capacity_known(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    }
    solar_electric_system_capacity(value) {
        return new Validation(TypeRules._float(value, 0.05, 100), BLOCKER);
    }
    solar_electric_num_panels(value) {
        return new Validation(TypeRules._int(value, 1, 100), BLOCKER);
    }
    solar_electric_year(value) {
        return new Validation(TypeRules._int(value, 2000, (new Date()).getFullYear()), BLOCKER);
    }
    solar_electric_array_azimuth(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.orientationArray), BLOCKER);
    }
    solar_electric_array_tilt(value) {
        return new Validation(TypeRules._string(value, 20, ENUMS.tiltArray), BLOCKER);
    }

    /*
     * HPwES
     */
    improvement_installation_start_date(value) {
        return new Validation(TypeRules._date(value), ERROR);
    }
    improvement_installation_completion_date(value) {
        return new Validation(TypeRules._date(value), ERROR);
    }
    contractor_business_name(value) {
        return new Validation(TypeRules._string(value), ERROR);
    }
    contractor_zip_code(value) {
        return new Validation(TypeRules._zip(value), ERROR);
    }

    /*
     * CONDITION FUNCTIONS
     ***********************
     */
    /**
     * Checks that entered value is on a valid wall
     * @param value
     * @param {string} side
     */
    _is_valid_wall_side(value, side) {
        if(this._homeValues.shape === 'town_house' && value && parseInt(value) !== 0) {
            const validSides = this._homeValues.town_house_walls ? this._homeValues.town_house_walls.split('_') : [];
            if(validSides.indexOf(side) === -1) {
                return new Validation(
                    'Values may not be defined for common/interior walls of a townhouse. Please only set values for exterior walls: '+validSides.join(', '),
                    ERROR
                );
            }
        }
    }

    /**
     * Get validations for wall values, ensuring wall is valid
     * @param value
     * @param {string} side
     * @param {Validation} validation
     */
    _get_wall_validation(value, side, validation) {
        if ((validation['message'] && validation['type'] === BLOCKER)) {
            return validation;
        }
        const invalidWall = this._is_valid_wall_side(value, side);
        if (invalidWall && invalidWall['message']) {
            return invalidWall;
        }
        return validation;
    }

    /**
     * Checks that entered value is on a valid hvac
     * @param value
     * @param {int} num
     */
    _is_servicing_system(value, num) {
        if([0, null].indexOf(this._homeValues['hvac_fraction_'+num]) > -1 && !TypeRules._is_empty(value)) {
            return new Validation(
                'Values may not be defined for system that do not service any area of the home. Please only set values for hvacs with hvac fraction > 0',
                ERROR
            );
        }
    }

    /**
     * Checks that entered value is on a valid hvac
     * @param value
     * @param {int} sys
     * @param {int} duct
     */
    _is_servicing_duct(value, sys, duct) {
        if([0, null].indexOf(this._homeValues['duct_fraction_'+duct+'_'+sys]) > -1 && !TypeRules._is_empty(value)) {
            return new Validation(
                'Values may not be defined for ducts that do not service any area of the home. Please only set values for ducts with duct fraction > 0',
                ERROR
            );
        }
    }

    /**
     * Get validations for wall values, ensuring wall is valid
     * @param value
     * @param {string} side
     * @param {Validation} validation
     */
    _get_system_validation(value, num, validation) {
        if ((validation['message'] && validation['type'] === BLOCKER)) {
            return validation;
        }
        const invalidSystem = this._is_servicing_system(value, num);
        if (invalidSystem && invalidSystem['message']) {
            return invalidSystem;
        }
        return validation;
    }

    /**
     * Get validations for duct values, ensuring duct is valid
     * @param value
     * @param {int} sys
     * @param {int} duct
     * @param {Validation} validation
     */
    _get_duct_validation(value, sys, duct, validation) {
        if ((validation && validation['message'] && validation['type'] === BLOCKER)) {
            return validation;
        }
        const invalidSystem = this._is_servicing_system(value, sys);
        if (invalidSystem && invalidSystem['message']) {
            return invalidSystem;
        }
        const invalidDuct = this._is_servicing_duct(value, sys, duct);
        if (invalidDuct && invalidDuct['message']) {
            return invalidDuct;
        }
        return validation;
    }

    /**
     * Ensure duct is in existing space
     * @param value
     */
    _duct_space_exists(value) {
        const ductLocations = ENUMS.ductType_alwaysValid;
        if (this._homeValues.foundation_type_1 === 'uncond_basement' || this._homeValues.foundation_type_2 === 'uncond_basement') {
            ductLocations.push('uncond_basement');
        }
        if (this._homeValues.foundation_type_1 === 'vented_crawl' || this._homeValues.foundation_type_2 === 'vented_crawl') {
            ductLocations.push('vented_crawl');
        }
        if (this._homeValues.foundation_type_1 === 'unvented_crawl' || this._homeValues.foundation_type_2 === 'unvented_crawl') {
            ductLocations.push('unvented_crawl');
        }
        if (this._homeValues.roof_type_1 === 'vented_attic' || this._homeValues.roof_type_2 === 'vented_attic') {
            ductLocations.push('uncond_attic');
        }
        if(ductLocations.indexOf(value) === -1) {
            return new Validation(
                'Ducts may only be set with values in exisiting roof or foundation spaces',
                ERROR
            );
        }
    }

    /**
     * Validation for installation years
     * @param {int} minYear the minimum year the API will accept
     * @param {int} value the entered year
     * @return {Validation}
     */
    _installation_year(value, minYear) {
        const thisYear = (new Date()).getFullYear();
        let errorLevel = BLOCKER;

        // If the installation year is greater than the minimum the API can accept, and the year_built field has been
        // set, then instead of a BLOCKER based on the API's restrictions, we create an ERROR-level validation requiring
        // the installation not to have happened before the home was built.
        if(value >= minYear && this._homeValues.year_built > 0) {
            minYear = this._homeValues.year_built;
            errorLevel = ERROR;
        }
        return new Validation(TypeRules._int(value, minYear, thisYear), errorLevel);
    }

    /*
     * Gets footprint area for skylight area validations
     */
    _get_footprint_area() {
        const {about, zone} = this._homeValues
        if (TypeRules._is_empty(about.conditioned_floor_area)) {
            return false;
        }
        let footprintArea = about.conditioned_floor_area;
        // If a zone_floor has a 'cond_basement' type, we need to subtract the floor area for that floor
        zone.zone_floor.forEach((floor) => {
            if(floor.foundation_type === 'cond_basement') {
                footprintArea -= TypeRules._int_or_zero(floor.floor_area)
            }
        });
        return parseInt(footprintArea / parseInt(about.num_floor_above_grade));
    }

    _check_footprint() {
        const footprint = this._get_footprint_area();
        if(footprint < 250) {
            return 'Home footprint must be greater than 250 sq ft.  Current footprint is '+footprint+' sq ft';
        }
    }

    /*
     * Get combined floor area
     */
    _get_combined_floor_area() {
        const {zone} = this._homeValues;
        let combinedFloorArea = 0;
        zone.zone_floor.forEach((floor) => {
            combinedFloorArea += TypeRules._int_or_zero(floor.floor_area)
        });
        return TypeRules._int_or_zero(combinedFloorArea);
    }

    // /*
    //  * Get projected roof area
    //  * @param {string} '1' or '2'
    //  */
    // _get_proj_roof_area(roof_num) {
    //     return TypeRules._int_or_zero(this._homeValues['roof_area_'+roof_num]);
    // }
    //
    // /*
    //  * Get projected ceiling area
    //  * @param {string} '1' or '2'
    //  */
    // _get_proj_ceiling_area(ceiling_num) {
    //     const {zone} = this._homeValues;
    //     let combinedCeilArea = 0;
    //     zone.zone_roof.forEach((roof) => {
    //         combinedCeilArea += TypeRules._int_or_zero(roof.ceiling_area)
    //     });
    //     return TypeRules._int_or_zero(combinedCeilArea);
    // }

    /*
     * Get combined roof area
     */
    _get_combined_ceil_area() {
        const {zone} = this._homeValues;
        let combinedCeilArea = 0;
        zone.zone_roof.forEach((roof) => {
            combinedCeilArea += TypeRules._int_or_zero(roof.ceiling_area)
        });
        return TypeRules._int_or_zero(combinedCeilArea);
    }

    /*
     * Get combined roof area
     */
    _get_combined_roof_area() {
        const {zone} = this._homeValues;
        let combinedRoofArea = 0;
        zone.zone_roof.forEach((roof) => {
            combinedRoofArea += TypeRules._int_or_zero(roof.roof_area)
        });
        return TypeRules._int_or_zero(combinedRoofArea);
    }

    /*
     * Get combined ceiling area
     */
    _get_combined_roof_ceiling_area() {
        return this._get_combined_roof_area() + this._get_combined_ceil_area();
    }

    /*
     * Gets the first wall dimension for window area validations
     */
    _get_wall_dimension_left_right() {
        let area = this._get_footprint_area();
        if (area) {
            //Assume floor dimensions area 5x3
            return parseInt((Math.sqrt((3 * area) / 5)));
        } else {
            return false;
        }
    }

    /*
     * Gets the second wall dimension for window area validations
     */
    _get_wall_dimension_front_back() {
        let dimension2 = this._get_wall_dimension_left_right();
        if (dimension2) {
            //Assume floor dimensions area 5x3
            return dimension2 * (5 / 3);
        } else {
            return false;
        }
    }

    /*
     * Gets wall area for front/back window area validations
     */
    _get_wall_area_front_back() {
        let length = this._get_wall_dimension_front_back();
        let height = parseInt(this._homeValues.floor_to_ceiling_height) || false;
        let stories = parseInt(this._homeValues.num_floor_above_grade) || false;
        if (length && height && stories) {
            return parseInt((length * height - 20) * stories);
        } else {
            return false;
        }
    }

    /*
     * Gets wall area for left/right window area validations
     */
    _get_wall_area_left_right() {
        let length = this._get_wall_dimension_left_right();
        let height = parseInt(this._homeValues.floor_to_ceiling_height) || false;
        let stories = parseInt(this._homeValues.num_floor_above_grade) || false;
        if (length && height && stories) {
            return parseInt(length * height * stories);
        } else {
            return false;
        }
    }

    /*
     * Checks that the combined roof_area is not less than the combined floor_area
     */
    _check_combined_area() {
        let combinedRoofCeilingArea = this._get_combined_roof_ceiling_area();
        let combinedFloorArea = this._get_combined_floor_area();
        if (combinedRoofCeilingArea  <= combinedFloorArea * .95) { // Allow 5% error
            return "The roof does not cover the floor";
        } else {
            return false;
        }
    }

    /*
     * Checks that the roof_area and floor_areas are consistent with conditioned footprint areas
     * @param {number} combinedArea
     * @param {'roof'|'floor'} thisAreaType
     */
    _check_conditioned_areas(combinedArea, thisAreaType) {
        let footprintArea = this._get_footprint_area();
        if (TypeRules._int_or_zero(this._homeValues.num_floor_above_grade) === 0) {
            return "This home’s minimum footprint is unknown.  Please enter number of stories.";
        } else {
            // Check that combined areas are within reasonable range of footprint
            // const max = thisAreaType === "roof"
            //     ? footprintArea * 2.5 // roof area max
            //     : this._homeValues.conditioned_floor_area * 1.05; // floor area & ceiling area max
            const max = footprintArea * 2.5;
            const expectedRange = [footprintArea * 0.95, max];
            if (!((expectedRange[0] < combinedArea) && (combinedArea < expectedRange[1]))) {
                return `
                    This home's minimum footprint is approximately ${footprintArea}sqft, but you
                    have specified ${combinedArea}sqft of total ${thisAreaType} area. The allowed range
                    is (${Math.ceil(expectedRange[0])}sqft - ${Math.floor(expectedRange[1])}sqft).
                    Please adjust any incorrect values. *The footprint is calculated as
                    (<total area> - <conditioned basement area>) / <number of floors>
                `;
            }
        }
    }

    /*
     * Checks address/city or coordinates to be an accepted input.
     * Intended to validate half addresses that do not require address and/or city feilds, if coordinates are provided on map.
     * @param {string} value
     */
    _require_if_no_coordinates(value) {
        if((this._homeValues.latitude && this._homeValues.longitude) || value){
            return null;
        }
        else{
            return "Field is required, if no coordinates are provided."
        }
    }
};