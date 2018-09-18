/**
 * required_fields.node.js - Validates that required home audit fields have a value.
 */

module.exports = function (homeValues) {
    // Define values that are always required
    let requiredFields = [
        'assessment_date',
        'blower_door_test',
        'conditioned_floor_area',
        'floor_to_ceiling_height',
        'num_floor_above_grade',
        'number_bedrooms',
        'orientation',
        'shape',
        'year_built',
        'hot_water_type',
        'hvac_fraction_1',
        'heating_type_1',
        'heating_fuel_1',
        'cooling_type_1',
        'roof_area_1',
        'floor_area_1',
        'wall_construction_same',
        'window_construction_same'
    ];

    //////////////////////////////////////////////////////////////////////////////
    // Add any fields that are required due to the values of other fields       //
    //////////////////////////////////////////////////////////////////////////////

    if (homeValues['building_id_holder'] === '-1') {
        requiredFields.push(
            'address',
            'city',
            'state',
            'zip_code',
            'assessment_type'
        );
    }
    /*
     * About conitional validations
     */
    //If blower door test conducted, require envelope_leakage, else air_sealing_present
    if (homeValues['blower_door_test'] === '1') {
        requiredFields.push('envelope_leakage');
    } else if (homeValues['blower_door_test'] === '0') {
        requiredFields.push('air_sealing_present');
    }

    /*
     * Roof/Attic conditional validations
     */
    for (let roofNumber of [1, 2]) {
        //If the roof area is entered, required roof contents
        if (parseInt(homeValues['roof_area_'+roofNumber]) > 0) {
            requiredFields.push(
                'roof_assembly_code_'+roofNumber,
                'roof_color_'+roofNumber,
                'roof_type_'+roofNumber
            );

            // The "cool_color" option for roof color requires an additional "absorptance" value to be set
            if (homeValues['roof_color_' + roofNumber] === 'cool_color') {
                requiredFields.push('roof_absorptance_' + roofNumber);
            }
            // If "cath_ceiling" is selected, we do not need "ceiling_insulation"
            if (homeValues['roof_type_' + roofNumber] !== 'cath_ceiling') {
                requiredFields.push('ceiling_assembly_code_'+roofNumber);
            }
        }
    }
    /*
     * Foundation conditional validations
     */
    for (let floorNumber of [1, 2]) {
        //If floor area entered, require other foundation elements
        if (parseInt(homeValues['floor_area_'+floorNumber]) > 0) {
            requiredFields.push(
                'foundation_type_'+floorNumber,
                'foundation_insulation_level_'+floorNumber,
                'floor_assembly_code_'+floorNumber
            );
        }
        //If the foundation type is 'slab_on_grade', don't require 'floor_assembly_code'
        if (homeValues['foundation_type_'+floorNumber] === 'slab_on_grade') {
            let floorAssemblyIndex = requiredFields.indexOf('floor_assembly_code_'+floorNumber);
            if (floorAssemblyIndex > -1) {
                requiredFields.splice(floorAssemblyIndex, 1);
            }
        }
    }

    /*
     * Walls conditional validations
     */
    //If house is townhouse, require position
    if (homeValues['shape'] === 'town_house') {
        requiredFields.push('town_house_walls');
    }
    //If wall construction is same on all sides, on require one side
    if (homeValues['wall_construction_same'] === '1') {
        requiredFields.push('wall_assembly_code_front');
        //otherwise check them based on position
    } else if (homeValues['wall_construction_same'] === '0') {
        if (homeValues['shape'] === 'rectangle') {
            requiredFields.push(
                'wall_assembly_code_front',
                'wall_assembly_code_back',
                'wall_assembly_code_right',
                'wall_assembly_code_left'
            );
        } else {
            if (homeValues['town_house_walls'] === 'back_front') {
                requiredFields.push(
                    'wall_assembly_code_front',
                    'wall_assembly_code_back',
                );
            } else if (homeValues['town_house_walls'] === 'back_front_left') {
                requiredFields.push(
                    'wall_assembly_code_front',
                    'wall_assembly_code_back',
                    'wall_assembly_code_left'
                );
            } else if (homeValues['town_house_walls'] === 'back_right_front') {
                requiredFields.push(
                    'wall_assembly_code_front',
                    'wall_assembly_code_back',
                    'wall_assembly_code_right'
                );
            }
        }
    }

    /*
     * Windows conditional validations
     */
    //If skylights, require area and skylight_method
    //If skylight specs are known, require U-Factor and SHGC, else require assembly code
    if (parseInt(homeValues['skylight_area']) > parseInt(0)) {
        requiredFields.push(
            'skylight_method'
        );
        if(homeValues['skylight_method'] === 'code') {
            requiredFields.push('skylight_code');
        } else if (homeValues['skylight_method'] === 'custom') {
            requiredFields.push('skylight_u_value');
            requiredFields.push('skylight_shgc');
        }
    }
    //If height entered, require window area
    if (homeValues['floor_to_ceiling_height'] !== '') {
        for (let position of ['front', 'back', 'right', 'left']) {
            requiredFields.push('window_area_'+position);
        }
    }
    //Check if window construction is same on all sides and require appropriate elements
    //If window specs are known, require U-Factor and SHGC, else require assembly code
    if (homeValues['window_construction_same'] === '1') {
        requiredFields.push('window_method_front');
        if (homeValues['window_method_front'] === 'code') {
            requiredFields.push('window_code_front');
        } else if (homeValues['window_method_front'] === 'custom') {
            requiredFields.push('window_u_value_front');
            requiredFields.push('window_shgc_front');
        }
    } else if (homeValues['window_construction_same'] === '0') {
        requiredFields.push(
            'window_method_front',
            'window_method_back',
            'window_method_right',
            'window_method_left'
        );
        for (let position of ['front', 'back', 'right', 'left']) {
            if (homeValues['window_method_'+position] === 'code') {
                requiredFields.push('window_code_'+position);
            } else if (homeValues['window_method_'+position] === 'custom') {
                requiredFields.push('window_u_value_'+position);
                requiredFields.push('window_shgc_'+position);
            }
        }
    }

    /*
     * Systems coniditional validations
     */
    //If second system is heating percentage of house, require
    if (parseFloat(homeValues['hvac_fraction_2']) > 0){
        requiredFields.push('heating_type_2', 'heating_fuel_2', 'cooling_type_2');
    }
    for (let system of ['1', '2']) {
        if (homeValues['heating_fuel_'+system] !== '' &&
            ['', 'none', null, 'baseboard'].indexOf(homeValues['heating_type_'+system]) === -1)
        {
            requiredFields.push('heating_efficiency_method_'+system);
            if(homeValues['heating_efficiency_method_'+system] === 'user') {
                requiredFields.push('heating_efficiency_'+system);
            } else if(homeValues['heating_efficiency_method_'+system] === 'shipment_weighted') {
                requiredFields.push('heating_year_'+system);
            }
            //Require ducts for heating/cooling types with ducts
            if (homeValues['heating_type_'+system] === 'central_furnace' ||
                homeValues['heating_type_'+system] === 'heat_pump' ||
                homeValues['heating_type_'+system] === 'gchp' ||
                homeValues['cooling_type'+system] === 'central_furnace' ||
                homeValues['cooling_type'+system] === 'gchp' ||
                homeValues['cooling_type'+system] === 'split_dx')
            {
                requiredFields.push('duct_fraction_1_'+system);
                let ductPercent = (parseInt(homeValues['duct_fraction_1_'+system]) || 0 )+(parseInt(homeValues['duct_fraction_2_'+system]) || 0 )+(parseInt(homeValues['duct_fraction_3_'+system]) || 0 );
                if(ductPercent === 100) {
                    //Do nothing
                } else if((parseInt(homeValues['duct_fraction_1_'+system]) > 0) && (parseInt(homeValues['duct_fraction_2_'+system]) > 0) && ductPercent < 100) {
                    requiredFields.push('duct_fraction_3_'+system);
                } else if(parseInt(homeValues['duct_fraction_1_'+system]) > 0 && ductPercent < 100) {
                    requiredFields.push('duct_fraction_2_'+system);
                }
                for (let duct of ['1', '2', '3']) {
                    //If duct percentage entered, require rest of ducts
                    if(parseInt(homeValues['duct_fraction_'+duct+'_'+system]) > 0){
                        requiredFields.push(
                            'duct_location_'+duct+'_'+system,
                            'duct_insulated_'+duct+'_'+system,
                            'duct_sealed_'+duct+'_'+system
                        );
                    }
                }
            }
        }
    }
    for (let system of ['1', '2']) {
        if (homeValues['cooling_type_'+system] !== '' && homeValues['cooling_type_'+system] !== 'none' && homeValues['cooling_type_'+system] !== null) {
            requiredFields.push('cooling_efficiency_method_'+system);
            if(homeValues['cooling_efficiency_method_'+system] === 'user') {
                requiredFields.push('cooling_efficiency_'+system);
            } else if(homeValues['cooling_efficiency_method_'+system] === 'shipment_weighted') {
                requiredFields.push('cooling_year_'+system);
            }
        }
    }

    /*
     * Hot Water
     */
    if (homeValues['hot_water_type'] !== 'indirect' && homeValues['hot_water_type'] !== 'tankless_coil' && homeValues['hot_water_type'] !== '') {
        requiredFields.push('hot_water_fuel');
        requiredFields.push('hot_water_efficiency_method');
        if (homeValues['hot_water_efficiency_method'] === 'user') {
            requiredFields.push('hot_water_energy_factor');
        } else if (homeValues['hot_water_efficiency_method'] === 'shipment_weighted') {
            requiredFields.push('hot_water_year');
        }
    }

    /*
     * PV System
     */
    if (homeValues['solar_electric_capacity_known'] || homeValues['solar_electric_year'] || homeValues['solar_electric_array_azimuth']) {
        requiredFields.push(
            'solar_electric_capacity_known',
            'solar_electric_year',
            'solar_electric_array_azimuth',
        );
        if (homeValues['solar_electric_capacity_known'] === '1') {
            requiredFields.push('solar_electric_system_capacity');
        } else if (homeValues['solar_electric_capacity_known'] === '0') {
            requiredFields.push('solar_electric_num_panels');
        }
    }

    /*
     * HPwES
     */
    if (homeValues['improvement_installation_start_date'] ||
        homeValues['improvement_installation_completion_date'] ||
        homeValues['contractor_business_name'] ||
        homeValues['contractor_zip_code'] ||
        homeValues['is_income_eligible_program'] )
    {
        requiredFields.push(
            'improvement_installation_start_date',
            'improvement_installation_completion_date',
            'contractor_business_name',
            'contractor_zip_code',
            'is_income_eligible_program',
        );
    }

    return requiredFields;
};
