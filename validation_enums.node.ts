import schema from './hescore_json_schema.js';

export const BLOCKER = 'blocker';
export const ERROR = 'error';
export const MANDATORY = 'mandatory';

export const HEATING = 'Heating';
export const COOLING = 'Cooling';

export const STATES = [
    '',
    'AL',
    'AK',
    'AZ',
    'AR',
    'CA',
    'CO',
    'CT',
    'DE',
    'DC',
    'FL',
    'GA',
    'HI',
    'ID',
    'IL',
    'IN',
    'IA',
    'KS',
    'KY',
    'LA',
    'ME',
    'MD',
    'MA',
    'MI',
    'MN',
    'MS',
    'MO',
    'MT',
    'NE',
    'NV',
    'NH',
    'NJ',
    'NM',
    'NY',
    'NC',
    'ND',
    'OH',
    'OK',
    'OR',
    'PA',
    'RI',
    'SC',
    'SD',
    'TN',
    'TX',
    'UT',
    'VT',
    'VA',
    'WA',
    'WV',
    'WI',
    'WY'
];

export const ASSESSMENT_TYPE = [
    'initial',
    'final',
    'qa',
    'alternative',
    'test',
    'corrected',
    'mentor',
    'preconstruction',
    // Note that the 'void' option is omitted by default when rendering assessment type input because it
    // is only available to administrators using the "batch update" feature
    'void',
];
export const ORIENTATION = schema.properties.about.properties.orientation.enum;
export const WALL_SIDE = schema.properties.zone.properties.zone_wall.items.properties.side.enum;
export const ARRAY_TILT = schema.properties.systems.properties.generation.properties.solar_electric.properties.array_tilt.enum;
export const ROOF_ASSEMBLY_CODE = schema.properties.zone.properties.zone_roof.items.properties.roof_assembly_code.enum;
export const ROOF_COLOR = schema.properties.zone.properties.zone_roof.items.properties.roof_color.enum;
export const ROOF_TYPE = schema.properties.zone.properties.zone_roof.items.properties.roof_type.enum;
export const CEILING_ASSEMBLY_CODE = schema.properties.zone.properties.zone_roof.items.properties.ceiling_assembly_code.enum;
export const KNEE_WALL_ASSEMBLY_CODE = schema.properties.zone.properties.zone_roof.items.properties.knee_wall.properties.assembly_code.enum;
export const FOUNDATION_TYPE = schema.properties.zone.properties.zone_floor.items.properties.foundation_type.enum;
export const FLOOR_ASSEMBLY_CODE = schema.properties.zone.properties.zone_floor.items.properties.floor_assembly_code.enum;
export const WINDOW_CODE = schema.properties.zone.properties.zone_wall.items.properties.zone_window.properties.window_code.enum;
export const SKYLIGHT_CODE = schema.properties.zone.properties.zone_roof.items.properties.zone_skylight.properties.skylight_code.enum;
export const WALL_ASSEMBLY_CODE = schema.properties.zone.properties.zone_wall.items.properties.wall_assembly_code.enum;
export const WALL_ADJACENT_TO = schema.properties.zone.properties.zone_wall.items.properties.adjacent_to.enum;
export const HEATING_TYPE = schema.properties.systems.properties.hvac.items.properties.heating.properties.type.enum;
export const HEATING_FUEL = schema.properties.systems.properties.hvac.items.properties.heating.properties.fuel_primary.enum;
export const OPTIONS_FURNACE_AND_BOILER = [
    'central_furnace',
    'wall_furnace',
    'boiler'
];
export const MAP_HEATING_FUEL_TO_TYPE = {
    'natural_gas': OPTIONS_FURNACE_AND_BOILER,
    'lpg': OPTIONS_FURNACE_AND_BOILER,
    'fuel_oil': OPTIONS_FURNACE_AND_BOILER,
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
export const COOLING_TYPE = schema.properties.systems.properties.hvac.items.properties.cooling.properties.type.enum;
export const DUCT_LOCATION = schema.definitions.def_hvac_distribution.properties.duct.items.properties.location.enum;
export const OPTIONS_DUCT_LOCATION_ALWAYS = [
    'cond_space',
    'under_slab',
    'exterior_wall',
    'outside'
];
export const OPTIONS_SYSTEM_TYPES_WITH_DUCTS = ['central_furnace', 'heat_pump', 'gchp', 'split_dx'];
export const HOT_WATER_FUEL = schema.properties.systems.properties.domestic_hot_water.properties.fuel_primary.enum;
export const HOT_WATER_TYPE = schema.properties.systems.properties.domestic_hot_water.properties.type.enum;
export const HOT_WATER_EFFICIENCY_METHOD = schema.properties.systems.properties.domestic_hot_water.properties.efficiency_method.enum;
export const HOT_WATER_EFFICIENCY_UNIT = schema.properties.systems.properties.domestic_hot_water.properties.efficiency_unit.enum;