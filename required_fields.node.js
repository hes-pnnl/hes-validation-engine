/**
 * required_fields.node.js - Validates that required home audit fields have a value.
 */

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
        roof_type_1 : mandatoryMessage,
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
                requiredFields['ceiling_area_'+roofNumber] = 'Roof area' + mandatoryRoofTypeMessage;
                requiredFields['ceiling_assembly_code_'+roofNumber] = 'Ceiling assembly' + mandatoryRoofTypeMessage;
                if(homeValues['knee_wall_area_'+roofNumber] > 0){
                    requiredFields['knee_wall_assembly_code_'+roofNumber] = 'Knee wall assembly' + mandatoryRoofTypeMessage;
                }
            } else if(homeValues['roof_type_' + roofNumber] === 'cath_ceiling') {
                requiredFields['roof_area_'+roofNumber] = 'Roof area' + mandatoryRoofTypeMessage;
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
            !['', 'none', null, undefined, 'baseboard', 'wood_stove', 'central_furnace', 'wall_furnace'].includes(heatingType) &&
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
            requiredFields['hvac_distribution_sealed_'+system] = 'Duct information is required for your system type selections';
            requiredFields['hvac_distribution_leakage_method_'+system] = 'Duct leakage is required for your system type selections';
            if(homeValues['hvac_distribution_leakage_method_'+system] === 'qualitative') {
                requiredFields['hvac_distribution_leakage_to_outside_'+system] = 'Duct leakage is required when known';
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
            if(parseInt(homeValues['duct_fraction_'+duct+'_'+system]) > 0){
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
    if (homeValues['solar_electric_capacity_known'] || homeValues['solar_electric_year'] || homeValues['solar_electric_array_azimuth'] || homeValues['solar_electric_array_tilt']) {
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
