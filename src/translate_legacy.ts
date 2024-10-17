import { ErrorMessages } from "./home_audit";
import { HEScoreJSONSchema } from "./types/HomeEnergyScore.type";
import blockers from "./blockers";
import jsonpath from 'jsonpath';

export const MANDATORY_MESSAGE = 'Missing value for mandatory field';

const ALWAYS_MANDATORY_CASCADE = {
    ['/about']: [
        'assessment_date',
        'blower_door_test',
        'conditioned_floor_area',
        'floor_to_ceiling_height',
        'num_floor_above_grade',
        'number_bedrooms',
        'orientation',
        'shape',
        'year_built',
    ],
    ['/systems/domestic_hot_water']: [
        'hot_water_type',
    ],
    ['/systems']: [
        'hvac_fraction_1',
        'heating_type_1',
        'heating_fuel_1',
        'cooling_type_1'
    ],
    ['/zone']: [
        'roof_type_1',
        'floor_area_1',
        'adjacent_to_back',
        'adjacent_to_front',
        'adjacent_to_right',
        'adjacent_to_left',
        'wall_assembly_code_back',
        'wall_assembly_code_front',
        'wall_assembly_code_right',
        'wall_assembly_code_left',
    ],
    ['/zone/zone_roof']: [
        'roof_type_1',
    ],
    ['/zone/zone_floor']: [
        'floor_area_1',
    ],
    ['/zone/zone_wall']: [
        'adjacent_to_back',
        'adjacent_to_front',
        'adjacent_to_right',
        'adjacent_to_left',
        'wall_assembly_code_back',
        'wall_assembly_code_front',
        'wall_assembly_code_right',
        'wall_assembly_code_left',
    ]
}

/**
 * @param obj
 * @returns TRUE if obj is NULL, undefined, '', or NaN
 */
const isEmpty = (obj: any) => obj === null || obj === undefined || Number.isNaN(obj) || obj === '';

/**
 * @param input Flat building
 * @returns The building JSON
 */
export function translateHomeValues(flat:any): HEScoreJSONSchema {
    /**
     * Parse any value to boolean
     */
    const parseBooleanOrUndefined = (v?: any): boolean|undefined => (
        [1, '1', 'true', true].includes(v) ? true 
        : [0, '0', 'false', false].includes(v) ? false 
        : undefined
    );

    /**
     * @param v
     */
    const parseIntOrUndefined = (v?: any): number|undefined => (
        Number.isNaN(parseInt(v)) ? undefined : parseInt(v)
    );

    /**
     * @param v
     */
    const parseFloatOrUndefined = (v?: any): number|undefined => (
        Number.isNaN(parseFloat(v)) ? undefined : parseFloat(v)
    );

    /**
     * Ensure zip code is valid (append 0s to front, since lost on some ints)
     * @param z incoming zipcode
     * @returns the new zip
     */
    const parseZipCode = (z?: string) => {
        if (z === undefined || z === null) {
            return undefined;
        }
        const missing = 5 - z.length > 0 ? 5 - z.length : 0;
        return [...Array(missing).keys()].reduce((p) => p + '0', '') + z;
    };

    /**
     * Convert Date to date string for JSON
     * @param d incoming date
     * @returns the new date string
     */
    const parseDateToString = (d?: Date|'') => {
        if (d === undefined || d === null || d === '') {
            return undefined;
        }
        return new Date(d).toISOString().split('T')[0];
    };

    type DeepPartial<T> = T extends object
        ? {
              [P in keyof T]?: DeepPartial<T[P]>;
          }
        : T;
    const building: DeepPartial<HEScoreJSONSchema> = {
        version: '3.0',
        address: {
            address: flat.address,
            address2: flat.address2,
            city: flat.city,
            state: flat.state,
            zip_code: parseZipCode(flat.zip_code), // Some zip codes got parsed as ints and need the 0 in front
            external_building_id: flat.external_building_id,
        },
        hpwes: {
            improvement_installation_start_date: parseDateToString(flat.improvement_installation_start_date),
            improvement_installation_completion_date: parseDateToString(
                flat.improvement_installation_completion_date
            ),
            contractor_zip_code: flat.contractor_zip_code && parseZipCode(flat.contractor_zip_code),
            contractor_business_name: flat.contractor_business_name,
            is_income_eligible_program: parseBooleanOrUndefined(flat.is_income_eligible_program),
        },
        about: {
            assessment_type: flat.assessment_type,
            assessment_date: parseDateToString(flat.assessment_date),
            comments: flat.comments,
            comment_api_only: undefined,
            dwelling_unit_type: flat.dwelling_unit_type,
            number_units: parseIntOrUndefined(flat.number_units),
            manufactured_home_sections: flat.manufactured_home_sections,
            year_built: parseIntOrUndefined(flat.year_built),
            number_bedrooms: parseIntOrUndefined(flat.number_bedrooms),
            num_floor_above_grade: parseIntOrUndefined(flat.num_floor_above_grade),
            floor_to_ceiling_height: parseIntOrUndefined(flat.floor_to_ceiling_height),
            conditioned_floor_area: parseIntOrUndefined(flat.conditioned_floor_area),
            orientation: flat.orientation,
            blower_door_test: parseBooleanOrUndefined(flat.blower_door_test),
            air_sealing_present: parseBooleanOrUndefined(flat.air_sealing_present),
            envelope_leakage: parseBooleanOrUndefined(flat.blower_door_test) ? parseFloatOrUndefined(flat.envelope_leakage) : undefined,
        },
        zone: {
            zone_roof: [
                {
                    roof_name: 'roof1',
                    ceiling_area: flat.ceiling_area_1 == 0 ? undefined : parseFloatOrUndefined(flat.ceiling_area_1),
                    roof_area: parseFloatOrUndefined(flat.roof_area_1 == 0 ? undefined : flat.roof_area_1),
                    roof_assembly_code: flat.roof_assembly_code_1,
                    roof_color: flat.roof_color_1,
                    roof_absorptance: parseFloatOrUndefined(flat.roof_absorptance_1),
                    roof_type: flat.roof_type_1,
                    ceiling_assembly_code: flat.ceiling_assembly_code_1,
                    knee_wall: {
                        area: flat.knee_wall_area_1 == 0 ? undefined : parseFloatOrUndefined(flat.knee_wall_area_1),
                        assembly_code: flat.knee_wall_assembly_code_1,
                    },
                    zone_skylight: {
                        skylight_area: flat.skylight_area == 0 ? undefined : parseFloatOrUndefined(flat.skylight_area),
                        skylight_method: flat.skylight_method,
                        skylight_code: flat.skylight_code,
                        skylight_u_value: parseFloatOrUndefined(flat.skylight_u_value),
                        skylight_shgc: parseFloatOrUndefined(flat.skylight_shgc),
                        solar_screen: parseBooleanOrUndefined(flat.skylight_solar_screen),
                    },
                },
                {
                    roof_name: 'roof2',
                    ceiling_area: flat.ceiling_area_2 == 0 ? undefined : parseFloatOrUndefined(flat.ceiling_area_2),
                    roof_area: flat.roof_area_2 == 0 ? undefined : parseFloatOrUndefined(flat.roof_area_2),
                    roof_assembly_code: flat.roof_assembly_code_2,
                    roof_color: flat.roof_color_2,
                    roof_absorptance: parseFloatOrUndefined(flat.roof_absorptance_2),
                    roof_type: flat.roof_type_2,
                    ceiling_assembly_code: flat.ceiling_assembly_code_2,
                    knee_wall: {
                        area: flat.knee_wall_area_2 == 0 ? undefined : parseFloatOrUndefined(flat.knee_wall_area_2),
                        assembly_code: flat.knee_wall_assembly_code_2,
                    }
                },
            ],
            zone_floor: [
                {
                    floor_name: 'floor1',
                    floor_area: parseFloatOrUndefined(flat.floor_area_1),
                    foundation_type: flat.foundation_type_1,
                    foundation_insulation_level: parseIntOrUndefined(flat.foundation_insulation_level_1),
                    floor_assembly_code: flat.floor_assembly_code_1,
                },
                {
                    floor_name: 'floor2',
                    floor_area: parseFloatOrUndefined(flat.floor_area_2),
                    foundation_type: flat.foundation_type_2,
                    foundation_insulation_level: parseIntOrUndefined(flat.foundation_insulation_level_2),
                    floor_assembly_code: flat.floor_assembly_code_2,
                },
            ],
            zone_wall: [
                {
                    side: 'front',
                    adjacent_to: flat.adjacent_to_front,
                    wall_assembly_code: flat.wall_assembly_code_front,
                    zone_window: {
                        window_area: parseFloatOrUndefined(flat.window_area_front),
                        window_method: flat.window_method_front,
                        window_code: flat.window_code_front,
                        window_u_value: parseFloatOrUndefined(flat.window_u_value_front),
                        window_shgc: parseFloatOrUndefined(flat.window_shgc_front),
                        solar_screen: parseBooleanOrUndefined(flat.window_solar_screen_front),
                    },
                },
                {
                    side: 'back',
                    adjacent_to: flat.adjacent_to_back,
                    wall_assembly_code: flat.wall_assembly_code_back,
                    zone_window: {
                        window_area: parseFloatOrUndefined(flat.window_area_back),
                        window_method: flat.window_method_back,
                        window_code: flat.window_code_back,
                        window_u_value: parseFloatOrUndefined(flat.window_u_value_back),
                        window_shgc: parseFloatOrUndefined(flat.window_shgc_back),
                        solar_screen: parseBooleanOrUndefined(flat.window_solar_screen_back),
                    },
                },
                {
                    side: 'right',
                    adjacent_to: flat.adjacent_to_right,
                    wall_assembly_code: flat.wall_assembly_code_right,
                    zone_window: {
                        window_area: parseFloatOrUndefined(flat.window_area_right),
                        window_method: flat.window_method_right,
                        window_code: flat.window_code_right,
                        window_u_value: parseFloatOrUndefined(flat.window_u_value_right),
                        window_shgc: parseFloatOrUndefined(flat.window_shgc_right),
                        solar_screen: parseBooleanOrUndefined(flat.window_solar_screen_right),
                    },
                },
                {
                    side: 'left',
                    adjacent_to: flat.adjacent_to_left,
                    wall_assembly_code: flat.wall_assembly_code_left,
                    zone_window: {
                        window_area: parseFloatOrUndefined(flat.window_area_left),
                        window_method: flat.window_method_left,
                        window_code: flat.window_code_left,
                        window_u_value: parseFloatOrUndefined(flat.window_u_value_left),
                        window_shgc: parseFloatOrUndefined(flat.window_shgc_left),
                        solar_screen: parseBooleanOrUndefined(flat.window_solar_screen_left),
                    },
                },
            ],
        },
        systems: {
            hvac: [
                {
                    hvac_name: 'hvac1',
                    hvac_fraction: parseFloatOrUndefined(flat.hvac_fraction_1),
                    heating: {
                        type: flat.heating_type_1,
                        fuel_primary: flat.heating_fuel_1,
                        efficiency_method: flat.heating_efficiency_method_1,
                        year: parseIntOrUndefined(flat.heating_year_1),
                        efficiency: parseFloatOrUndefined(flat.heating_efficiency_1),
                        efficiency_unit: flat.heating_efficiency_unit_1,
                    },
                    cooling: {
                        type: flat.cooling_type_1,
                        efficiency_method: flat.cooling_efficiency_method_1,
                        year: parseIntOrUndefined(flat.cooling_year_1),
                        efficiency: parseFloatOrUndefined(flat.cooling_efficiency_1),
                        efficiency_unit: flat.cooling_efficiency_unit_1,
                    },
                    hvac_distribution: {
                        leakage_method: parseFloatOrUndefined(flat.duct_fraction_1_1) ? flat.hvac_distribution_leakage_method_1 : undefined,
                        leakage_to_outside: parseFloatOrUndefined(flat.duct_fraction_1_1) ? parseFloatOrUndefined(flat.hvac_distribution_leakage_to_outside_1) : undefined,
                        sealed: parseFloatOrUndefined(flat.duct_fraction_1_1) ? parseBooleanOrUndefined(flat.hvac_distribution_sealed_1) : undefined,
                        duct: [
                            {
                                name: 'duct1',
                                location: flat.duct_location_1_1,
                                fraction: parseFloatOrUndefined(flat.duct_fraction_1_1),
                                insulated: parseBooleanOrUndefined(flat.duct_insulated_1_1),
                            },
                            {
                                name: 'duct2',
                                location: flat.duct_location_2_1,
                                fraction: parseFloatOrUndefined(flat.duct_fraction_2_1),
                                insulated: parseBooleanOrUndefined(flat.duct_insulated_2_1),
                            },
                            {
                                name: 'duct3',
                                location: flat.duct_location_3_1,
                                fraction: parseFloatOrUndefined(flat.duct_fraction_3_1),
                                insulated: parseBooleanOrUndefined(flat.duct_insulated_3_1),
                            },
                        ],
                    },
                },
                {
                    hvac_name: 'hvac2',
                    hvac_fraction: parseFloatOrUndefined(flat.hvac_fraction_2),
                    heating: {
                        type: flat.heating_type_2,
                        fuel_primary: flat.heating_fuel_2,
                        efficiency_method: flat.heating_efficiency_method_2,
                        year: parseIntOrUndefined(flat.heating_year_2),
                        efficiency: parseFloatOrUndefined(flat.heating_efficiency_2),
                        efficiency_unit: flat.heating_efficiency_unit_2,
                    },
                    cooling: {
                        type: flat.cooling_type_2,
                        efficiency_method: flat.cooling_efficiency_method_2,
                        year: parseIntOrUndefined(flat.cooling_year_2),
                        efficiency: parseFloatOrUndefined(flat.cooling_efficiency_2),
                        efficiency_unit: flat.cooling_efficiency_unit_2,
                    },
                    hvac_distribution: {
                        leakage_method: parseFloatOrUndefined(flat.duct_fraction_1_2) ? flat.hvac_distribution_leakage_method_2 : undefined,
                        leakage_to_outside: parseFloatOrUndefined(flat.duct_fraction_1_2) ? parseFloatOrUndefined(flat.hvac_distribution_leakage_to_outside_2) : undefined,
                        sealed: parseFloatOrUndefined(flat.duct_fraction_1_2) ? parseBooleanOrUndefined(flat.hvac_distribution_sealed_2) : undefined,
                        duct: [
                            {
                                name: 'duct1',
                                location: flat.duct_location_1_2,
                                fraction: parseFloatOrUndefined(flat.duct_fraction_1_2),
                                insulated: parseBooleanOrUndefined(flat.duct_insulated_1_2),
                            },
                            {
                                name: 'duct2',
                                location: flat.duct_location_2_2,
                                fraction: parseFloatOrUndefined(flat.duct_fraction_2_2),
                                insulated: parseBooleanOrUndefined(flat.duct_insulated_2_2),
                            },
                            {
                                name: 'duct3',
                                location: flat.duct_location_3_2,
                                fraction: parseFloatOrUndefined(flat.duct_fraction_3_2),
                                insulated: parseBooleanOrUndefined(flat.duct_insulated_3_2),
                            },
                        ],
                    },
                },
            ],
            domestic_hot_water: {
                category: flat.hot_water_category,
                type: flat.hot_water_type,
                fuel_primary: flat.hot_water_fuel,
                efficiency_method: flat.hot_water_efficiency_method,
                year: parseIntOrUndefined(flat.hot_water_year),
                efficiency: parseFloatOrUndefined(flat.hot_water_efficiency),
                efficiency_unit: flat.hot_water_efficiency_unit,
            },
            generation: {
                solar_electric: {
                    capacity_known: parseBooleanOrUndefined(flat.solar_electric_capacity_known),
                    system_capacity: parseFloatOrUndefined(flat.solar_electric_system_capacity),
                    num_panels: parseIntOrUndefined(flat.solar_electric_num_panels),
                    year: parseIntOrUndefined(flat.solar_electric_year),
                    array_azimuth: flat.solar_electric_array_azimuth,
                    array_tilt: flat.solar_electric_array_tilt,
                },
            },
        },
    };
    const clearObj = (obj: any) => {
        if (isEmpty(obj)) {
            return undefined;
        }
        if (Array.isArray(obj)) {
            obj = obj.map((o) => clearObj(o)).filter((o) => !isEmpty(o));
            if (!obj.length || !obj.some((val: any) => !isEmpty(val))) {
                return undefined;
            }
        } else if (typeof obj === 'object') {
            const clearedObj: any = {};
            Object.keys(obj).forEach((key) => {
                clearedObj[key] = clearObj(obj[key]);
            });
            const keys = Object.keys(clearedObj);
            if (
                !keys.length ||
                // Key must (1) point to a non-empty value (2) not just be a name field and (3) if fraction, not be 0
                !keys.some(
                    (key) =>
                        !isEmpty(clearedObj[key]) &&
                        !['name', 'hvac_name', 'roof_name', 'floor_name'].includes(key) &&
                        !(['hvac_fraction', 'fraction'].includes(key) && clearedObj[key] === 0)
                )
            ) {
                return undefined;
            }
            return clearedObj;
        }
        return obj;
    };

    return clearObj(building);
};

const errorPathToTmpKey = (building:HEScoreJSONSchema, path:string) => {
    let prefix = "";
    let field = path.split('/').pop();
    let postfix = "";
    if(path.includes("/zone/zone_roof/")) {
        const i = parseInt(path.split('/zone/zone_roof/').pop()?.split('/').shift() || '0');
        postfix = `_${i+1}`;
        if(path.includes("zone_skylight")) {
            postfix = "";
        } else if(path.includes("knee_wall")) {
            prefix = `knee_wall_`;
        }
    } else if(path.includes("/zone/zone_floor/")) {
        const i = parseInt(path.split('/zone/zone_floor/').pop()?.split('/').shift() || '0');
        postfix = `_${i+1}`;
    } else if(path.includes("/zone/zone_wall/")) {
        const i = parseInt(path.split('/zone/zone_wall/').pop()?.split('/').shift() || '0');
        const side = building.zone.zone_wall[i].side;
        postfix = `_${side}`;
    } else if(path.includes("/systems/domestic_hot_water/")) {
        prefix = 'hot_water_';
    } else if(path.includes("/systems/hvac/")) {
        const i = parseInt(path.split('/systems/hvac/').pop()?.split('/').shift() || '0');
        postfix = `_${i+1}`;
        if(path.includes("/heating/")) {
            prefix = 'heating_'
        } else if(path.includes("/cooling/")) {
            prefix = 'cooling_'
        } else if(path.includes('/hvac_distribution/')) {
            if(path.includes('duct')) {
                const j = parseInt(path.split('/duct/').pop()?.split('/').shift() || '0');
                postfix = `${j+1}_${postfix}`;
                prefix = 'duct_';
                // if(field === 'fraction') {
                //     field = 'percentage';
                // }
            } else {
                prefix = 'hvac_distribution_';
            }
        }
        if(field === 'fuel_primary') {
            field = 'fuel';
        }
    } else if(path.includes("/generation/")) {
        prefix = 'solar_electric_';
    }
    return `${prefix}${field}${postfix}`;
}

/**
 * Maps new AJV errors to legacy errors
 * @param building 
 * @param errors 
 * @returns errors
 */
export const translateErrors = (building:HEScoreJSONSchema, errors: ErrorMessages) => {
    const messages: {
        blocker: Record<string, string|undefined>,
        error: Record<string, string|undefined>,
        mandatory: Record<string, string|undefined>
    } = {
        blocker: {},
        error: {},
        mandatory: {},
    };
    Object.keys(errors).forEach((path) => {
        if(Object.keys(ALWAYS_MANDATORY_CASCADE).includes(path)) {
            const required_keys = ALWAYS_MANDATORY_CASCADE[path as keyof typeof ALWAYS_MANDATORY_CASCADE];
            required_keys.forEach(key => {
                messages.mandatory[key] = MANDATORY_MESSAGE;
            });
            return;
        }
        const key = errorPathToTmpKey(building, path);
        const message = errors[path]?.map(m => m.message).join(' | ');
        if(message === MANDATORY_MESSAGE) {
            messages.mandatory[key] = message;
        } else {
            messages.error[key] = message;
        }
    });
    Object.keys(blockers).forEach((b_path) => {
        const matches = jsonpath.query(building, b_path);
        if(matches.length) {
            matches.forEach((match, i) => {
                const e_path = b_path.slice(2).replace(/\./g, '/').replace(/\[*\]/g, `/${i}/`);
                const key = errorPathToTmpKey(building, e_path);
                const blocker = match !== undefined && blockers[b_path] && blockers[b_path](match);
                if(blocker) {
                    messages.blocker[key] = blocker;
                }
            });
        }
    });
    return messages;
}