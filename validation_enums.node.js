let nested_json_schema = require('./nested_building_schema');
const {about, zone, systems} = nested_json_schema.properties;

module.exports = {
     BLOCKER: 'blocker',
     ERROR: 'error',
     MANDATORY: 'mandatory',

     HEATING: 'Heating',
     COOLING: 'Cooling',

     stateArray: [
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
    ],

     buildingShapes: about.properties.shape.enum,

     assessmentTypes: about.properties.assessment_type.enum,

     orientationArray: about.properties.orientation.enum,

     townHouseWallOrientations: about.properties.town_house_walls.enum,

     zoneWallSides: zone.properties.zone_wall.items.properties.side.enum,

     tiltArray: systems.properties.generation.properties.solar_electric.properties.array_tilt.enum,

     roofAssemblyCode: zone.properties.zone_roof.items.properties.roof_assembly_code.enum,

     roofColor: zone.properties.zone_roof.items.properties.roof_color.enum,

     roofType: zone.properties.zone_roof.items.properties.roof_type.enum,

     ceilingAssemblyCode: zone.properties.zone_roof.items.properties.ceiling_assembly_code.enum,

     kneeWallAssemblyCodes: zone.properties.zone_roof.items.properties.knee_wall.properties.assembly_code.enum,

     foundationType: zone.properties.zone_floor.items.properties.foundation_type.enum,

     foundationInsulationLevels: zone.properties.zone_floor.items.properties.foundation_insulation_level.enum,

     floorAssemblyCode: zone.properties.zone_floor.items.properties.floor_assembly_code.enum,

     windowAndSkylightCode: zone.properties.zone_roof.items.properties.zone_skylight.properties.skylight_code.enum,

     wallAssemblyCode: zone.properties.zone_wall.items.properties.wall_assembly_code,

     heatingTypeOptions: systems.properties.hvac.items.properties.heating.properties.type.enum,

     ductlessHeatingTypes: [
        'central_furnace',
        'gchp',
        'heat_pump',
        'split_dx'
     ],

     heatingFuelOptions: systems.properties.hvac.items.properties.heating.properties.fuel_primary.enum,

     furnaceAndBoiler: [
        'central_furnace',
        'wall_furnace',
        'boiler'
    ],

     heatingFuelToType: {
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
    },

     coolingTypeOptions: systems.properties.hvac.items.properties.cooling.properties.type.enum,

     hvacEfficiencyOptions: systems.properties.hvac.items.properties.cooling.properties.efficiency_method.enum,

     ductType: nested_json_schema.definitions.def_hvac_distribution.properties.duct.items.properties.location.enum,

     ductType_alwaysValid: [
        'cond_space',
        'under_slab',
        'exterior_wall',
        'outside'
    ],

     hotWaterCategories: systems.properties.domestic_hot_water.properties.category.enum,

     hotWaterFuel: systems.properties.domestic_hot_water.properties.fuel_primary.enum,

     hotWaterType: systems.properties.domestic_hot_water.properties.type.enum,
}