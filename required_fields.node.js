/**
 * required_fields.node.js - Validates that required home audit fields have a value.
 */

module.exports = function (homeValues) {
    let mandatoryMessage = "Missing value for mandatory field";
    // Define values that are always required
    let requiredFields = {
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
        roof_area_1 : mandatoryMessage,
        floor_area_1 : mandatoryMessage,
        wall_construction_same : mandatoryMessage,
        window_construction_same : mandatoryMessage
    };

    let positions = [];

    //////////////////////////////////////////////////////////////////////////////
    // Add any fields that are required due to the values of other fields       //
    //////////////////////////////////////////////////////////////////////////////
    
    /*
     * About conitional validations
     */
    //If blower door test conducted, require envelope_leakage, else air_sealing_present
    if (homeValues['blower_door_test'] === '1') {
        requiredFields['envelope_leakage'] = 'Air Leakage Rate is required if a Blower Door test was conducted';
    } else if (homeValues['blower_door_test'] === '0') {
        requiredFields['air_sealing_present'] = 'This information is required if a Blower Door test was not conducted';
    }

    /*
     * Roof/Attic conditional validations
     */
    for (let roofNumber of [1, 2]) {
        //If the roof area is entered, required roof contents
        let mandatoryRoofMessage = ' is a required roof value';
        if (parseInt(homeValues['roof_area_'+roofNumber]) > 0) {
            requiredFields['roof_assembly_code_'+roofNumber] = 'Roof Assembly' + mandatoryRoofMessage;
            requiredFields['roof_color_'+roofNumber] = 'Roof Color' + mandatoryRoofMessage;
            requiredFields['roof_type_'+roofNumber] = 'Roof Type' + mandatoryRoofMessage;

            // The "cool_color" option for roof color requires an additional "absorptance" value to be set
            if (homeValues['roof_color_' + roofNumber] === 'cool_color') {
                requiredFields['roof_absorptance_' + roofNumber] = 'Roof absortance is required when Roof Color is Cool';
            }
            // If "cath_ceiling" is selected, we do not need "ceiling_insulation"
            if (homeValues['roof_type_' + roofNumber] !== 'cath_ceiling') {
                requiredFields['ceiling_assembly_code_'+roofNumber] = 'Ceiling Code is required if Roof Type is not Cathedral Ceiling';
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
    if (homeValues['wall_construction_same'] === '1' || homeValues['wall_construction_same'] === 1) {
        requiredFields['wall_assembly_code_front'] = mandatoryWallMessage;
        //otherwise check them based on position
    } else if (homeValues['wall_construction_same'] === '0' || homeValues['wall_construction_same'] === 0) {
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
        requiredFields['window_area_'+position] = 'Window area '+position+' is required';
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
    if (homeValues['window_construction_same'] === '1' || homeValues['window_construction_same'] === 1) {
        positions = ['front'];
    } else if (homeValues['window_construction_same'] === '0' || homeValues['window_construction_same'] === 0) {
        positions = homeValues['town_house_walls'] ? homeValues['town_house_walls'].split('_') : ['front', 'back', 'right', 'left'];
    }
    for (let position of positions) {
        requiredFields['window_method_'+position] = mandatoryWindowMessage;
        if (homeValues['window_method_'+position] === 'code') {
            requiredFields['window_code_'+position] = windowSpecsKnownMessage;
        } else if (homeValues['window_method_'+position] === 'custom') {
            requiredFields['window_u_value_'+position] = windowSpecsUnknownMessage;
            requiredFields['window_shgc_'+position] = windowSpecsUnknownMessage;
        }
    }

    /*
     * Systems coniditional validations
     */
    //If second system is heating percentage of house, require
    if (parseFloat(homeValues['hvac_fraction_2']) > 0){
        requiredFields['heating_type_2', 'heating_fuel_2', 'cooling_type_2'] = 'This is a required system field';
    }
    for (let system of ['1', '2']) {
        if ([null, undefined, ''].indexOf(homeValues['heating_fuel_'+system]) === -1 &&
            ['', 'none', null, undefined, 'baseboard', 'wood_stove'].indexOf(homeValues['heating_type_'+system]) === -1 &&
            !(homeValues['heating_fuel_'+system] === 'electric' && homeValues['heating_type_'+system] === 'central_furnace')
        ){
            requiredFields['heating_efficiency_method_'+system] = 'Field is required when Heating Type has variable efficiency';
            if(homeValues['heating_efficiency_method_'+system] === 'user') {
                requiredFields['heating_efficiency_'+system] = 'Efficiency Value is required when known';
            } else if(homeValues['heating_efficiency_method_'+system] === 'shipment_weighted') {
                requiredFields['heating_year_'+system] = 'Installation year is required when efficiency value is unknown';
            }
        }
        if (['', 'none', null, undefined].indexOf(homeValues['cooling_type_'+system]) === -1) {
            requiredFields['cooling_efficiency_method_'+system] = 'Field is required when Cooling Type has variable efficiency';
            if(homeValues['cooling_efficiency_method_'+system] === 'user') {
                requiredFields['cooling_efficiency_'+system] = 'Cooling Efficiency is required when known';
            } else if(homeValues['cooling_efficiency_method_'+system] === 'shipment_weighted') {
                requiredFields['cooling_year_'+system] = 'Year Installed is required when efficincy value is unknown';
            }
        }
        //Require ducts for heating/cooling types with ducts
        let ductTypes = ['central_furnace', 'heat_pump', 'gchp', 'split_dx'];
        if (ductTypes.indexOf(homeValues['heating_type_'+system]) > -1  ||
            ductTypes.indexOf(homeValues['cooling_type_'+system]) > -1)
        {
            requiredFields['duct_fraction_1_'+system] = 'Duct percentange is required when they exist';
            let ductPercent = (parseInt(homeValues['duct_fraction_1_'+system]) || 0 )+(parseInt(homeValues['duct_fraction_2_'+system]) || 0 )+(parseInt(homeValues['duct_fraction_3_'+system]) || 0 );
            if(ductPercent === 100) {
                //Do nothing
            } else if((parseInt(homeValues['duct_fraction_1_'+system]) > 0) && (parseInt(homeValues['duct_fraction_2_'+system]) > 0) && ductPercent < 100) {
                requiredFields['duct_fraction_3_'+system] = 'Duct percetange is required when they exist';
            } else if(parseInt(homeValues['duct_fraction_1_'+system]) > 0 && ductPercent < 100) {
                requiredFields['duct_fraction_2_'+system] = 'Duct percetange is required when they exist';
            }
            for (let duct of ['1', '2', '3']) {
                //If duct percentage entered, require rest of ducts
                let mandatoryDuctMessage = 'This is a mandatory duct field';
                if(parseInt(homeValues['duct_fraction_'+duct+'_'+system]) > 0){
                    requiredFields['duct_location_'+duct+'_'+system] = mandatoryDuctMessage;
                    requiredFields['duct_insulated_'+duct+'_'+system] = mandatoryDuctMessage;
                    requiredFields['duct_sealed_'+duct+'_'+system] = mandatoryDuctMessage;
                }
            }
        }
    }

    /*
     * Hot Water
     */
    if (['', 'tankless_coil', 'indirect', null, undefined].indexOf(homeValues['hot_water_type']) === -1) {
        requiredFields['hot_water_fuel'] = 'Required for non-boiler water heaters';
        requiredFields['hot_water_efficiency_method'] = 'Required for non-boiler water heaters';
        if (homeValues['hot_water_efficiency_method'] === 'user') {
            requiredFields['hot_water_energy_factor'] = mandatoryMessage;
        } else if (homeValues['hot_water_efficiency_method'] === 'shipment_weighted') {
            requiredFields['hot_water_year'] = 'Year Installed is required when energy factor is unknown';
        }
    }

    /*
     * PV System
     */
    let mandatoryPVMessage = 'This is a mandatory PV field';
    if (homeValues['solar_electric_capacity_known'] || homeValues['solar_electric_year'] || homeValues['solar_electric_array_azimuth']) {
        requiredFields['solar_electric_capacity_known'] = mandatoryPVMessage;
        requiredFields['solar_electric_year'] = mandatoryPVMessage;
        requiredFields['solar_electric_array_azimuth'] = mandatoryPVMessage;
        if (homeValues['solar_electric_capacity_known'] === '1') {
            requiredFields['solar_electric_system_capacity'] = 'System Capacity is required when known';
        } else if (homeValues['solar_electric_capacity_known'] === '0') {
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
        homeValues['contractor_zip_code'] ||
        homeValues['is_income_eligible_program'] )
    {
        requiredFields['improvement_installation_start_date'] = mandatoryHPwESMessage;
        requiredFields['improvement_installation_completion_date'] = mandatoryHPwESMessage;
        requiredFields['contractor_business_name'] = mandatoryHPwESMessage;
        requiredFields['contractor_zip_code'] = mandatoryHPwESMessage;
    }

    return requiredFields;
};
