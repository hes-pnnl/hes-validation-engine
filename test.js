const NestedBuildingSchema = require('./hescore_json_schema.js');
const Ajv = require("ajv");
const addFormats = require('ajv-formats');
const ajv = new Ajv({allErrors: true, strictTypes: false, strictSchema: false})
addFormats(ajv);
// Add the schema to the validator.
ajv.addSchema(NestedBuildingSchema);
// Add the custom keywords "error_msg" to the validator
ajv.addKeyword('error_msg');


const address = {
    "version": "1.0",
    "address": {
        "address": "",
        "city": "St Louis",
        "state": "MO",
        "zip_code": "6301"
    },
    "about": {
        "assessment_type": "test",
        "assessment_date": "2021-06-07",
        "year_built": 1970,
        "number_bedrooms": 4,
        "num_floor_above_grade": 2,
        "floor_to_ceiling_height": 8,
        "conditioned_floor_area": 2000,
        "orientation": "north",
        "blower_door_test": false,
        "air_sealing_present": true,
        "dwelling_unit_type": "single_family_detached"
    },
    "zone": {
        "zone_roof": [
            {
                "roof_name": "roof1",
                "ceiling_area": 1000.0,
                "roof_assembly_code": "rfwf00co",
                "roof_color": "medium",
                "roof_type": "vented_attic",
                "ceiling_assembly_code": "ecwf19"
            }
        ],
        "zone_floor": [
            {
                "floor_name": "floor1",
                "floor_area": 1000.0,
                "foundation_type": "slab_on_grade",
                "foundation_insulation_level": 0
            }
        ],
        "zone_wall": [
            {
                "side": "front",
                "wall_assembly_code": "ewwf13vi",
                "adjacent_to": "outside",
                "zone_window": {
                    "window_area": 60.0,
                    "window_method": "code",
                    "window_code": "dcaw",
                    "solar_screen": false
                }
            },
            {
                "side": "back",
                "wall_assembly_code": "ewwf13vi",
                "adjacent_to": "outside",
                "zone_window": {
                    "window_area": 50.0,
                    "window_method": "code",
                    "window_code": "dcaw",
                    "solar_screen": false
                }
            },
            {
                "side": "right",
                "wall_assembly_code": "ewwf13vi",
                "adjacent_to": "outside",
                "zone_window": {
                    "window_area": 40.0,
                    "window_method": "code",
                    "window_code": "dcaw",
                    "solar_screen": false
                }
            },
            {
                "side": "left",
                "wall_assembly_code": "ewwf13vi",
                "adjacent_to": "outside",
                "zone_window": {
                    "window_area": 30.0,
                    "window_method": "code",
                    "window_code": "dcaw",
                    "solar_screen": false
                }
            }
        ]
    },
    "systems": {
        "hvac": [
            {
                "hvac_name": "hvac1",
                "hvac_fraction": 1,
                "heating": {
                    "fuel_primary": "natural_gas",
                    "type": "central_furnace",
                    "efficiency_method": "user",
                    "efficiency": 0.8,
                    "efficiency_unit": "afue"
                },
                "cooling": {
                    "type": "split_dx",
                    "efficiency_method": "user",
                    "efficiency": 13.0,
                    "efficiency_unit": "seer"
                },
                "hvac_distribution": {
                    "leakage_method": "qualitative",
                    "sealed": true,
                    "duct": [
                        {
                            "name": "duct1",
                            "location": "uncond_attic",
                            "fraction": 1.0,
                            "insulated": true
                        },
                        {
                            "name": "duct2",
                            "fraction": 0.0
                        },
                        {
                            "name": "duct3",
                            "fraction": 0.0
                        }
                    ]
                }
            }
        ],
        "domestic_hot_water": {
            "category": "unit",
            "type": "storage",
            "fuel_primary": "natural_gas",
            "efficiency_method": "user",
            "efficiency": 0.6,
            "efficiency_unit": "ef"
        }
    }
}
const nested_validate = ajv;
const isValid=nested_validate.validate(NestedBuildingSchema, address);

if (isValid) {
    console.log("Address is valid.");
  } else {
    console.log("Address is not valid.");
    console.log(nested_validate.errors);
  }