import { ErrorMessages } from "./home_audit";
import { HEScoreJSONSchema } from "./types/HomeEnergyScore.type";
import HESJsonSchema from "./schema/hescore_json.schema.json";
import blockers from "./blockers";
import jsonpath from 'jsonpath';

export const MANDATORY_MESSAGE = 'Missing value for mandatory field';

// Build list of keys that are not leaves
// These error messages are more general and should be displayed separately
const NON_LEAF_KEYS:string[] = ['0', '1'];
const getNonLeafKeys = (obj:any, key?: string) => {
    const is_leaf = obj?.type !== "array" && obj?.type !== "object"
    if(is_leaf) {
        if(key) {
            NON_LEAF_KEYS.push(key)
        }
    } else if(obj.properties) {
        Object.keys(obj.properties).forEach((key) => {
            getNonLeafKeys(obj[key], key)
        })
    }
}
getNonLeafKeys(HESJsonSchema)

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

const errorPathToTmpKey = (building:HEScoreJSONSchema, path:string) => {
    let prefix = "";
    let field = path.split('/').pop();
    if(NON_LEAF_KEYS.includes(field || '')) {
        return path;
    }
    let postfix = "";
    if(path.includes("/zone/zone_roof/")) {
        const i = parseInt(path.split('/zone/zone_roof/').pop()?.split('/').shift() || '0');
        postfix = `_${i+1}`;
        if(path.includes("zone_skylight")) {
            postfix = `_${i+1}`;
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
                postfix = `_${j+1}${postfix}`;
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