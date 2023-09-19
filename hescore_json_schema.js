module.exports = {
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "https://github.com/NREL/hescore-hpxml/blob/master/hescorehpxml/schemas/hescore_json.schema.json",
    "type": "object",
    "title": "HEScore JSON Schema",
    "additionalProperties": false,
    "properties": {
        "version": {
            "type": "string",
            "const": "1.0",
            "description": "The version of the building unit schema. Use semantic versioning."
        },
        "address": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "address": { "type": "string" },
                "city": { "type": "string" },
                "state": { "type": "string" },
                "zip_code": {
                    "type": "string",
                    "pattern": "^[0-9]{5}$"
                },
                "external_building_id": {
                    "type": "string",
                    "description": " Allows an organization to assign an ID to the building for that organization's internal use. This field has no impact within the HES system, except that it can be filtered on in some of the retrieve_* methods."
                }
            },
            "required": [
                "address", 
                "city", 
                "state", 
                "zip_code"
            ]
        },
        "hpwes": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "improvement_installation_start_date": {
                    "type": "string",
                    "format": "date",
                    "description": "The date on which HPwES upgrade installation began, in YYYY-MM-DD format"
                },
                "improvement_installation_completion_date": {
                    "type": "string",
                    "format": "date",
                    "description": "The date on which HPwES upgrade installation was completed, in YYYY-MM-DD format"
                },
                "contractor_zip_code": {
                    "type": "string",
                    "pattern": "^[0-9]{5}$",
                    "description": "Five-digit postal code of the contractor installing the HPwES upgrades"
                },
                "contractor_business_name": {
                    "type": "string",
                    "description": "The name of the contracting business installing the HPwES upgrades"
                },
                "is_income_eligible_program": {
                    "type": "boolean",
                    "description": "Whether or not the HPwES upgrades were performed for a homeowner participating in an income-eligible program"
                }
            }
        },
        "about": {
            "type": "object",
            "required": [
                "assessment_type",
                "assessment_date",
                "dwelling_unit_type",
                "year_built",
                "number_bedrooms",
                "floor_to_ceiling_height",
                "conditioned_floor_area",
                "orientation",
                "blower_door_test"
            ],
            "additionalProperties": false,
            "properties": {
                "assessment_type": {
                    "type": "string",
                    "enum": [
                        "initial", 
                        "final", 
                        "qa", 
                        "alternative", 
                        "test", 
                        "corrected", 
                        "mentor", 
                        "preconstruction"
                    ]
                },
                "assessment_date": {
                    "type": "string",
                    "format": "date",
                    "description": "Date the assessment was performed"
                },
                "comments": {
                    "type": [
                        "string", 
                        "null"
                    ],
                    "description": "Free text comment field"
                },
                "comment_api_only": {
                    "type": "string",
                    "description": "Pass through field for use by api users"
                },
                "dwelling_unit_type": {
                    "type": "string",
                    "enum": [
                        "single_family_detached", 
                        "single_family_attached", 
                        "apartment_unit", 
                        "manufactured_home"],
                    "description": "The type of dwelling unit"
                },
                "manufactured_home_sections": {
                    "type": "string",
                    "enum": [
                        "single-wide", 
                        "double-wide", 
                        "triple-wide"
                    ],
                    "description": "The sections of a manufactured home"
                },
                "year_built": {
                    "type": "integer",
                    "minimum": 1600,
                    "description": "Year building was built"
                },
                "number_bedrooms": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 10,
                    "description": "Number of bedrooms in house"
                },
                "number_units": {
                    "type": "integer",
                    "description": "Total number of units in apartment building"
                },
                "num_floor_above_grade": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 4,
                    "description": "Number of floors above grade. Assumes 1 when dwelling_unit_type is apartment_unit"
                },
                "floor_to_ceiling_height": {
                    "type": "integer",
                    "minimum": 6,
                    "maximum": 12,
                    "description": "Floor to ceiling height (feet)"
                },
                "conditioned_floor_area": {
                    "type": "number",
                    "minimum": 250,
                    "maximum": 25000,
                    "description": "Total conditioned floor area (square feet)"
                },
                "orientation": {
                    "type": "string",
                    "enum": [
                        "north", 
                        "north_east", 
                        "east", 
                        "south_east", 
                        "south", 
                        "south_west", 
                        "west", 
                        "north_west"
                    ],
                    "description": "Orientation of the front door"
                },
                "blower_door_test": {
                    "type": "boolean",
                    "description": "Was a blower door test performed on this house?"
                },
                "air_sealing_present": {
                    "type": "boolean",
                    "description": "Has the building been air sealed? (only used if blower_door_test is false)"
                },
                "envelope_leakage": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 25000,
                    "description": "Building air leakage measured with a blower door (CFM50) (only used if blower_door_test is true)"
                }
            },
            "allOf": [
                {
                    "if": {
                        "properties": {
                            "dwelling_unit_type": { "const": "manufactured_home" }
                        }
                    },
                    "then": {
                        "required": ["manufactured_home_sections"],
                        "error_msg": "If the building 'dwelling_unit_type' is 'manufactured_home', you must identify the 'manufactured_home_sections'"
                    },
                    "else": {
                        "not": {
                            "required": ["manufactured_home_sections"],
                            "error_msg": "If the building 'dwelling_unit_type' is not 'manufactured_home', the 'manufactured_home_sections' must not be set"
                        }
                    }
                },
                {
                    "if": {
                        "properties": {
                            "blower_door_test": { "const": true }
                        },
                        "error_msg": "If 'blower_door_test' is true, 'air_sealing_present' must not be set and 'envelope_leakage' must be set"
                    },
                    "then": {
                        "allOf": [
                            {
                                "required": ["envelope_leakage"]
                            },
                            {
                                "not": {
                                    "required": ["air_sealing_present"]
                                }
                            }
                        ]
                    }
                },
                {
                    "if": {
                        "properties": {
                            "blower_door_test": { "const": false }
                        },
                        "error_msg": "If 'blower_door_test' is false, 'air_sealing_present' must be set and 'envelope_leakage' must not be set"
                    },
                    "then": {
                        "allOf": [
                            {
                                "required": ["air_sealing_present"]
                            },
                            {
                                "not": {
                                    "required": ["envelope_leakage"]
                                }
                            }
                        ]
                    }
                },
                {
                    "if": {
                        "properties": {
                            "dwelling_unit_type": { "enum": ["apartment_unit", "manufactured_home"] }
                        },
                        "required": ["dwelling_unit_type"]
                    },
                    "then": {
                        "not": {
                            "required": ["num_floor_above_grade"]
                        }
                    },
                    "else": {
                        "required": ["num_floor_above_grade"]
                    }
                },
                {
                    "if": {
                        "properties": {
                            "dwelling_unit_type": { "const": "apartment_unit" }
                        },
                        "required": ["dwelling_unit_type"]
                    },
                    "then": {
                        "required": ["number_units"]
                    },
                    "else": {
                        "not": {
                            "required": ["number_units"]
                        }
                    }
                }
            ]
        },
        "zone": {
            "type": "object",
            "required": ["zone_roof", "zone_floor", "zone_wall"],
            "additionalProperties": false,
            "properties": {
                "zone_roof": {
                    "type": "array",
                    "description": "Inputs about the construction of the roof(s)",
                    "additionalItems": false,
                    "minItems": 0,
                    "maxItems": 2,
                    "items": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                            "roof_name": {
                                "type": "string",
                                "enum": ["roof1", "roof2"],
                                "description": "Name of this roof instance"
                            },
                            "ceiling_area": {
                                "type": "number",
                                "minimum": 1,
                                "maximum": 25000,
                                "description": "Area of ceiling (attic floor), used if roof_type = vented_attic, below_other_unit"
                            },
                            "roof_area": {
                                "type": "number",
                                "minimum": 1,
                                "maximum": 25000,
                                "description": "Area of the roof, used if roof_type = cath_ceiling, flat_roof, bowstring_roof"
                            },
                            "roof_assembly_code": {
                                "type": "string",
                                "enum": [
                                    "rfwf00co",
                                    "rfwf00wo",
                                    "rfwf00rc",
                                    "rfwf00lc",
                                    "rfwf00tg",
                                    "rfwf03co",
                                    "rfwf03wo",
                                    "rfwf03rc",
                                    "rfwf03lc",
                                    "rfwf03tg",
                                    "rfwf07co",
                                    "rfwf07wo",
                                    "rfwf07rc",
                                    "rfwf07lc",
                                    "rfwf07tg",
                                    "rfwf11co",
                                    "rfwf11wo",
                                    "rfwf11rc",
                                    "rfwf11lc",
                                    "rfwf11tg",
                                    "rfwf13co",
                                    "rfwf13wo",
                                    "rfwf13rc",
                                    "rfwf13lc",
                                    "rfwf13tg",
                                    "rfwf15co",
                                    "rfwf15wo",
                                    "rfwf15rc",
                                    "rfwf15lc",
                                    "rfwf15tg",
                                    "rfwf19co",
                                    "rfwf19wo",
                                    "rfwf19rc",
                                    "rfwf19lc",
                                    "rfwf19tg",
                                    "rfwf21co",
                                    "rfwf21wo",
                                    "rfwf21rc",
                                    "rfwf21lc",
                                    "rfwf21tg",
                                    "rfwf25co",
                                    "rfwf25wo",
                                    "rfwf25rc",
                                    "rfwf25lc",
                                    "rfwf25tg",
                                    "rfwf27co",
                                    "rfwf27wo",
                                    "rfwf27rc",
                                    "rfwf27lc",
                                    "rfwf27tg",
                                    "rfwf30co",
                                    "rfwf30wo",
                                    "rfwf30rc",
                                    "rfwf30lc",
                                    "rfwf30tg",
                                    "rfrb00co",
                                    "rfrb00wo",
                                    "rfrb00rc",
                                    "rfrb00lc",
                                    "rfrb00tg",
                                    "rfps00co",
                                    "rfps00wo",
                                    "rfps00rc",
                                    "rfps00lc",
                                    "rfps00tg",
                                    "rfps03co",
                                    "rfps03wo",
                                    "rfps03rc",
                                    "rfps03lc",
                                    "rfps03tg",
                                    "rfps07co",
                                    "rfps07wo",
                                    "rfps07rc",
                                    "rfps07lc",
                                    "rfps07tg",
                                    "rfps11co",
                                    "rfps11wo",
                                    "rfps11rc",
                                    "rfps11lc",
                                    "rfps11tg",
                                    "rfps13co",
                                    "rfps13wo",
                                    "rfps13rc",
                                    "rfps13lc",
                                    "rfps13tg",
                                    "rfps15co",
                                    "rfps15wo",
                                    "rfps15rc",
                                    "rfps15lc",
                                    "rfps15tg",
                                    "rfps19co",
                                    "rfps19wo",
                                    "rfps19rc",
                                    "rfps19lc",
                                    "rfps19tg",
                                    "rfps21co",
                                    "rfps21wo",
                                    "rfps21rc",
                                    "rfps21lc",
                                    "rfps21tg"
                                ],
                                "description": "Roof construction assembly code"
                            },
                            "roof_color": {
                                "type": "string",
                                "enum": ["white", "light", "medium", "medium_dark", "dark", "cool_color"],
                                "description": "Color of roof exterior surface"
                            },
                            "roof_absorptance": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                                "description": "Absorptance of exterior surface (only used if roof_color is cool_color)"
                            },
                            "roof_type": {
                                "type": "string",
                                "enum": [
                                    "vented_attic",
                                    "cath_ceiling",
                                    "below_other_unit",
                                    "flat_roof",
                                    "bowstring_roof"
                                ],
                                "description": "Type of roof"
                            },
                            "ceiling_assembly_code": {
                                "type": "string",
                                "enum": [
                                    "ecwf00",
                                    "ecwf03",
                                    "ecwf06",
                                    "ecwf09",
                                    "ecwf11",
                                    "ecwf13",
                                    "ecwf15",
                                    "ecwf19",
                                    "ecwf21",
                                    "ecwf25",
                                    "ecwf30",
                                    "ecwf35",
                                    "ecwf38",
                                    "ecwf44",
                                    "ecwf49",
                                    "ecwf55",
                                    "ecwf60"
                                ],
                                "description": "Ceiling construction assembly code (required unless roof_type is cath_ceiling)"
                            },
                            "knee_wall": {
                                "type": "object",
                                "description": "Knee wall inputs",
                                "additionalProperties": false,
                                "required": ["area", "assembly_code"],
                                "properties": {
                                    "area": {
                                        "type": "number",
                                        "minimum": 1,
                                        "maximum": 5000,
                                        "description": "Knee wall area"
                                    },
                                    "assembly_code": {
                                        "type": "string",
                                        "enum": [
                                            "kwwf00",
                                            "kwwf03",
                                            "kwwf07",
                                            "kwwf11",
                                            "kwwf13",
                                            "kwwf15",
                                            "kwwf19",
                                            "kwwf21"
                                        ],
                                        "description": "Knee wall assembly code"
                                    }
                                }
                            },
                            "zone_skylight": {
                                "type": "object",
                                "description": "Inputs about the skylights on this roof",
                                "additionalProperties": false,
                                "properties": {
                                    "skylight_area": {
                                        "type": "number",
                                        "minimum": 0,
                                        "maximum": 300,
                                        "description": "Area of skylights (square feet)"
                                    },
                                    "skylight_method": {
                                        "type": "string",
                                        "enum": ["code", "custom"],
                                        "description": "Construction method to use for skylights"
                                    },
                                    "skylight_code": {
                                        "type": "string",
                                        "enum": [
                                            "scna",
                                            "scnw",
                                            "stna",
                                            "stnw",
                                            "dcaa",
                                            "dcab",
                                            "dcaw",
                                            "dtaa",
                                            "dtab",
                                            "dtaw",
                                            "dpeaw",
                                            "dpeaab",
                                            "dpeaaw",
                                            "dseaa",
                                            "dseab",
                                            "dseaw",
                                            "dseaaw",
                                            "thmabw"
                                        ],
                                        "description": "Assembly code for skylights (only used if skylight_method is code)"
                                    },
                                    "skylight_u_value": {
                                        "type": "number",
                                        "minimum": 0.01,
                                        "maximum": 5,
                                        "description": "U-value of skylights (Btu/sf-hr-F) (only used if skylight_method is custom)"
                                    },
                                    "skylight_shgc": {
                                        "type": "number",
                                        "exclusiveMinimum": 0,
                                        "exclusiveMaximum": 1,
                                        "description": "Solar heat gain coefficient of skylights (only used if skylight_method is custom)"
                                    },
                                    "solar_screen": {
                                        "type": "boolean",
                                        "description": "Does this skylight have a solar screen?"
                                    }
                                },
                                "allOf": [
                                    {
                                        "if": {
                                            "properties": {
                                                "skylight_area": { "exclusiveMinimum": 0 }
                                            },
                                            "required": ["skylight_area"],
                                            "error_msg": "Skylights require a construction method"
                                        },
                                        "then": {
                                            "required": ["skylight_method"]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "skylight_area": { "exclusiveMinimum": 0 },
                                                "skylight_method": { "const": "code" }
                                            },
                                            "required": [
                                                "skylight_area", 
                                                "skylight_method"
                                            ],
                                            "error_msg": "Skylights of 'Code' type construction must have an assembly code and not custom U values or Solar Heat Gain Coefficients"
                                        },
                                        "then": {
                                            "allOf": [
                                                {
                                                    "required": ["skylight_code"]
                                                },
                                                {
                                                    "not": {
                                                        "required": ["skylight_u_value"]
                                                    }
                                                },
                                                {
                                                    "not": {
                                                        "required": ["skylight_shgc"]
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "skylight_area": { "exclusiveMinimum": 0 },
                                                "skylight_method": { "const": "custom" }
                                            },
                                            "required": [
                                                "skylight_area", 
                                                "skylight_method"
                                            ],
                                            "error_msg": "Skylights of 'Custom' type construction must have custom U values and Solar Heat Gain Coefficients and not have an assembly code "
                                        },
                                        "then": {
                                            "allOf": [
                                                {
                                                    "required": ["skylight_u_value", "skylight_shgc"]
                                                },
                                                {
                                                    "not": {
                                                        "required": ["skylight_code"]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        },
                        "required": [
                            "roof_name", 
                            "roof_type"
                        ],
                        "allOf": [
                            {
                                "if": {
                                    "properties": {
                                        "roof_type": {
                                            "enum": ["vented_attic", "cath_ceiling", "flat_roof", "bowstring_roof"]
                                        }
                                    },
                                    "required": ["roof_type"],
                                    "error_msg": "Roof color and attic roof insulation are required for Vented Attics, Cath Ceiling, Flat Roof, and Bowstring Roof "
                                },
                                "then": {
                                    "required": [
                                        "roof_assembly_code", 
                                        "roof_color"
                                    ]
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "roof_type": { "enum": ["cath_ceiling", "flat_roof", "bowstring_roof"] }
                                    },
                                    "required": ["roof_type"],
                                    "error_msg": "Ceiling area and and insulation type are not applicable for Cathedral Ceilings, Flat Roof, and Bowstring Roof "
                                },
                                "then": {
                                    "allOf": [
                                        { "not": { "required": ["ceiling_area"] } },
                                        { "not": { "required": ["ceiling_assembly_code"] } },
                                        { "required": ["roof_area"] }
                                    ]
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "roof_type": { "const": "below_other_unit" }
                                    },
                                    "required": ["roof_type"],
                                    "error_msg": "Roof area and and ceiling insulation type are not applicable for roof Below Other Unit, ceiling area must be set "
                                },
                                "then": {
                                    "allOf": [
                                        { "not": { "required": ["ceiling_assembly_code"] } },
                                        { "not": { "required": ["roof_area"] } },
                                        { "required": ["ceiling_area"] }
                                    ]
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "roof_type": { "const": "vented_attic" }
                                    },
                                    "required": ["roof_type"],
                                    "error_msg": "Ceiling area and and insulation type must be set for Vented Attic"
                                },
                                "then": {
                                    "required": ["ceiling_area", "ceiling_assembly_code"]
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "roof_color": {
                                            "enum": ["cool_color"]
                                        }
                                    },
                                    "required": ["roof_color"],
                                    "error_msg": "Roof absorptance is required when Roof Color is Cool"
                                },
                                "then": {
                                    "required": ["roof_absorptance"]
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "roof_color": {
                                            "not": {
                                                "enum": ["cool_color"]
                                            }
                                        }
                                    },
                                    "required": ["roof_color"],
                                    "error_msg": "Roof absorptance is only applicable when Roof Color is Cool"
                                },
                                "then": {
                                    "not": {
                                        "required": ["roof_absorptance"]
                                    }
                                }
                            },
                            {
                                "if": {
                                    "required": ["knee_wall"],
                                    "error_msg": "Knee walls are only allowed for vented attics"
                                },
                                "then": {
                                    "properties": {
                                        "roof_type": {
                                            "enum": ["vented_attic"]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                },
                "zone_floor": {
                    "type": "array",
                    "description": "Inputs about the construction of the floor(s)",
                    "additionalItems": false,
                    "minItems": 0,
                    "maxItems": 2,
                    "items": {
                        "type": "object",
                        "required": ["floor_name"],
                        "additionalProperties": false,
                        "properties": {
                            "floor_name": {
                                "type": "string",
                                "enum": ["floor1", "floor2"],
                                "description": "Name of this floor instance"
                            },
                            "floor_area": {
                                "type": "number",
                                "minimum": 1,
                                "maximum": 25000,
                                "description": "Area of this foundation type"
                            },
                            "foundation_type": {
                                "type": "string",
                                "enum": [
                                    "uncond_basement",
                                    "cond_basement",
                                    "vented_crawl",
                                    "unvented_crawl",
                                    "slab_on_grade",
                                    "above_other_unit",
                                    "belly_and_wing"
                                ],
                                "description": "Type of foundation"
                            },
                            "foundation_insulation_level": {
                                "type": "integer",
                                "minimum": 0,
                                "maximum": 19,
                                "description": "Foundation wall / slab edge insulation R-value (sf-hr-F/Btu)"
                            },
                            "floor_assembly_code": {
                                "type": "string",
                                "enum": [
                                    "efwf00ca",
                                    "efwf03ca",
                                    "efwf07ca",
                                    "efwf11ca",
                                    "efwf13ca",
                                    "efwf15ca",
                                    "efwf19ca",
                                    "efwf21ca",
                                    "efwf25ca",
                                    "efwf30ca",
                                    "efwf35ca",
                                    "efwf38ca"
                                ],
                                "description": "Floor construction assembly code (only used if foundation_type is not slab_on_grade)"
                            }
                        },
                        "allOf": [
                            {
                                "if": {
                                    "properties": {
                                        "floor_name": {
                                            "enum": ["floor1", "floor2"]
                                        }
                                    },
                                    "required": ["floor_name"],
                                    "error_msg": "You must provide areas for all identified floors"
                                },
                                "then": {
                                    "required": ["floor_area"]
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "floor_name": {
                                            "enum": ["floor1", "floor2"]
                                        },
                                        "floor_area": { "exclusiveMinimum": 0 }
                                    },
                                    "required": [
                                        "floor_name", 
                                        "floor_area"
                                    ],
                                    "error_msg": "Identified floors must have a foundation type specified"
                                },
                                "then": {
                                    "allOf": [
                                        {
                                            "required": ["foundation_type"]
                                        },
                                        {
                                            "if": {
                                                "properties": {
                                                    "foundation_type": { "enum": ["slab_on_grade", "above_other_unit"] }
                                                },
                                                "required": ["foundation_type"],
                                                "error_msg": "Floor assembly code not applicable for slab on grade foundations or foundations located above other unit"
                                            },
                                            "then": {
                                                "not": { "required": ["floor_assembly_code"] }
                                            },
                                            "else": {
                                                "required": ["floor_assembly_code"]
                                            }
                                        },
                                        {
                                            "if": {
                                                "properties": {
                                                    "foundation_type": {
                                                        "enum": ["above_other_unit", "belly_and_wing"]
                                                    }
                                                },
                                                "required": ["foundation_type"],
                                                "error_msg": "Foundation insulation level not applicable for foundations located above other unit or belly and wing"
                                            },
                                            "then": {
                                                "not": { "required": ["foundation_insulation_level"] }
                                            },
                                            "else": {
                                                "required": ["foundation_insulation_level"]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                "zone_wall": {
                    "type": "array",
                    "description": "Inputs about the construction of the walls",
                    "additionalItems": false,
                    "minItems": 4,
                    "maxItems": 4,
                    "uniqueItems": true,
                    "items": {
                        "type": "object",
                        "additionalProperties": false,
                        "required": ["side", "adjacent_to"],
                        "properties": {
                            "side": {
                                "type": "string",
                                "enum": ["front", "back", "right", "left"],
                                "description": "Side this wall faces"
                            },
                            "wall_assembly_code": {
                                "type": "string",
                                "enum": [
                                    "ewwf00wo",
                                    "ewwf00st",
                                    "ewwf00vi",
                                    "ewwf00al",
                                    "ewwf00br",
                                    "ewwf03wo",
                                    "ewwf03st",
                                    "ewwf03vi",
                                    "ewwf03al",
                                    "ewwf03br",
                                    "ewwf07wo",
                                    "ewwf07st",
                                    "ewwf07vi",
                                    "ewwf07al",
                                    "ewwf07br",
                                    "ewwf11wo",
                                    "ewwf11st",
                                    "ewwf11vi",
                                    "ewwf11al",
                                    "ewwf11br",
                                    "ewwf13wo",
                                    "ewwf13st",
                                    "ewwf13vi",
                                    "ewwf13al",
                                    "ewwf13br",
                                    "ewwf15wo",
                                    "ewwf15st",
                                    "ewwf15vi",
                                    "ewwf15al",
                                    "ewwf15br",
                                    "ewwf19wo",
                                    "ewwf19st",
                                    "ewwf19vi",
                                    "ewwf19al",
                                    "ewwf19br",
                                    "ewwf21wo",
                                    "ewwf21st",
                                    "ewwf21vi",
                                    "ewwf21al",
                                    "ewwf21br",
                                    "ewsf00wo",
                                    "ewsf00st",
                                    "ewsf00vi",
                                    "ewsf00al",
                                    "ewsf00br",
                                    "ewsf03wo",
                                    "ewsf03st",
                                    "ewsf03vi",
                                    "ewsf03al",
                                    "ewsf03br",
                                    "ewsf07wo",
                                    "ewsf07st",
                                    "ewsf07vi",
                                    "ewsf07al",
                                    "ewsf07br",
                                    "ewsf11wo",
                                    "ewsf11st",
                                    "ewsf11vi",
                                    "ewsf11al",
                                    "ewsf11br",
                                    "ewsf13wo",
                                    "ewsf13st",
                                    "ewsf13vi",
                                    "ewsf13al",
                                    "ewsf13br",
                                    "ewsf15wo",
                                    "ewsf15st",
                                    "ewsf15vi",
                                    "ewsf15al",
                                    "ewsf15br",
                                    "ewsf19wo",
                                    "ewsf19st",
                                    "ewsf19vi",
                                    "ewsf19al",
                                    "ewsf19br",
                                    "ewsf21wo",
                                    "ewsf21st",
                                    "ewsf21vi",
                                    "ewsf21al",
                                    "ewsf21br",
                                    "ewps00wo",
                                    "ewps00st",
                                    "ewps00vi",
                                    "ewps00al",
                                    "ewps00br",
                                    "ewps03wo",
                                    "ewps03st",
                                    "ewps03vi",
                                    "ewps03al",
                                    "ewps03br",
                                    "ewps07wo",
                                    "ewps07st",
                                    "ewps07vi",
                                    "ewps07al",
                                    "ewps07br",
                                    "ewps11wo",
                                    "ewps11st",
                                    "ewps11vi",
                                    "ewps11al",
                                    "ewps11br",
                                    "ewps13wo",
                                    "ewps13st",
                                    "ewps13vi",
                                    "ewps13al",
                                    "ewps13br",
                                    "ewps15wo",
                                    "ewps15st",
                                    "ewps15vi",
                                    "ewps15al",
                                    "ewps15br",
                                    "ewps19wo",
                                    "ewps19st",
                                    "ewps19vi",
                                    "ewps19al",
                                    "ewps19br",
                                    "ewps21wo",
                                    "ewps21st",
                                    "ewps21vi",
                                    "ewps21al",
                                    "ewps21br",
                                    "ewov19wo",
                                    "ewov19st",
                                    "ewov19vi",
                                    "ewov19al",
                                    "ewov19br",
                                    "ewov21wo",
                                    "ewov21st",
                                    "ewov21vi",
                                    "ewov21al",
                                    "ewov21br",
                                    "ewov25wo",
                                    "ewov25st",
                                    "ewov25vi",
                                    "ewov25al",
                                    "ewov25br",
                                    "ewov27wo",
                                    "ewov27st",
                                    "ewov27vi",
                                    "ewov27al",
                                    "ewov27br",
                                    "ewov33wo",
                                    "ewov33st",
                                    "ewov33vi",
                                    "ewov33al",
                                    "ewov33br",
                                    "ewov35wo",
                                    "ewov35st",
                                    "ewov35vi",
                                    "ewov35al",
                                    "ewov35br",
                                    "ewov38wo",
                                    "ewov38st",
                                    "ewov38vi",
                                    "ewov38al",
                                    "ewov38br",
                                    "ewbr00nn",
                                    "ewbr05nn",
                                    "ewbr10nn",
                                    "ewcb00st",
                                    "ewcb00br",
                                    "ewcb00nn",
                                    "ewcb03st",
                                    "ewcb03br",
                                    "ewcb03nn",
                                    "ewcb06st",
                                    "ewcb06br",
                                    "ewcb06nn",
                                    "ewsb00st",
                                    "iwwf00",
                                    "iwwf03",
                                    "iwwf07",
                                    "iwwf11",
                                    "iwwf13",
                                    "iwwf15",
                                    "iwwf19",
                                    "iwwf21"
                                ],
                                "description": "Wall construction assembly code"
                            },
                            "adjacent_to": {
                                "type": "string",
                                "enum": [
                                    "outside",
                                    "other_unit",
                                    "other_heated_space",
                                    "other_multifamily_buffer_space",
                                    "other_non_freezing_space"
                                ],
                                "description": "What is on the other side of the wall"
                            },
                            "zone_window": {
                                "type": "object",
                                "description": "Inputs about the windows on this wall",
                                "additionalProperties": false,
                                "required": ["window_area"],
                                "properties": {
                                    "window_area": {
                                        "type": "number",
                                        "minimum": 0,
                                        "maximum": 999,
                                        "description": "Area of windows on this wall (square feet)"
                                    },
                                    "window_method": {
                                        "type": "string",
                                        "enum": ["code", "custom"],
                                        "description": "Construction method to use for this window"
                                    },
                                    "window_code": {
                                        "type": "string",
                                        "enum": [
                                            "scna",
                                            "scnw",
                                            "stna",
                                            "stnw",
                                            "dcaa",
                                            "dcab",
                                            "dcaw",
                                            "dtaa",
                                            "dtab",
                                            "dtaw",
                                            "dpeaw",
                                            "dpeaab",
                                            "dpeaaw",
                                            "dseaa",
                                            "dseab",
                                            "dseaw",
                                            "dseaaw",
                                            "thmabw"
                                        ],
                                        "description": "assembly code for this window (only used if window_method is code)"
                                    },
                                    "window_u_value": {
                                        "type": "number",
                                        "minimum": 0.01,
                                        "maximum": 5,
                                        "description": "U-value of this window (Btu/sf-hr-F) (only used if window_method is custom)"
                                    },
                                    "window_shgc": {
                                        "type": "number",
                                        "exclusiveMinimum": 0,
                                        "exclusiveMaximum": 1,
                                        "description": "Solar heat gain coefficient of this window (only used if window_method is custom)"
                                    },
                                    "solar_screen": {
                                        "type": "boolean",
                                        "description": "Does this window have a solar screen?"
                                    }
                                },
                                "oneOf": [
                                    {
                                        "properties": {
                                            "window_method": { "const": "code" }
                                        },
                                        "required": ["window_code"],
                                        "not": {
                                            "anyOf": [
                                                {
                                                    "required": ["window_u_value"]
                                                },
                                                {
                                                    "required": ["window_shgc"]
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        "properties": {
                                            "window_method": { "const": "custom" }
                                        },
                                        "required": ["window_u_value", "window_shgc"],
                                        "not": {
                                            "required": ["window_code"]
                                        }
                                    }
                                ]
                            }
                        },
                        "allOf": [
                            {
                                "if": {
                                    "properties": {
                                        "adjacent_to": {
                                            "enum": [
                                                "outside",
                                                "other_heated_space",
                                                "other_multifamily_buffer_space",
                                                "other_non_freezing_space"
                                            ]
                                        }
                                    },
                                    "required": ["adjacent_to"]
                                },
                                "then": {
                                    "required": ["wall_assembly_code"]
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "adjacent_to": { "const": "other_unit" }
                                    },
                                    "required": ["adjacent_to"]
                                },
                                "then": {
                                    "not": { "required": ["wall_assembly_code"] }
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "adjacent_to": { "enum": ["outside"] }
                                    },
                                    "required": ["adjacent_to"]
                                },
                                "then": {
                                    "required": ["zone_window"]
                                },
                                "else": {
                                    "not": {
                                        "required": ["zone_window"]
                                    }
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "adjacent_to": {
                                            "enum": [
                                                "other_heated_space",
                                                "other_multifamily_buffer_space",
                                                "other_non_freezing_space"
                                            ]
                                        }
                                    },
                                    "required": ["adjacent_to"]
                                },
                                "then": {
                                    "properties": {
                                        "wall_assembly_code": {
                                            "enum": [
                                                "iwwf00",
                                                "iwwf03",
                                                "iwwf07",
                                                "iwwf11",
                                                "iwwf13",
                                                "iwwf15",
                                                "iwwf19",
                                                "iwwf21"
                                            ]
                                        }
                                    },
                                    "required": ["wall_assembly_code"]
                                }
                            }
                        ]
                    }
                }
            },
            "allOf": [
                {
                    "properties": {
                        "zone_wall": {
                            "contains": {
                                "properties": {
                                    "side": { "const": "front" }
                                },
                                "required": ["side"]
                            }
                        }
                    }
                },
                {
                    "properties": {
                        "zone_wall": {
                            "contains": {
                                "properties": {
                                    "side": { "const": "back" }
                                },
                                "required": ["side"]
                            }
                        }
                    }
                },
                {
                    "properties": {
                        "zone_wall": {
                            "contains": {
                                "properties": {
                                    "side": { "const": "left" }
                                },
                                "required": ["side"]
                            }
                        }
                    }
                },
                {
                    "properties": {
                        "zone_wall": {
                            "contains": {
                                "properties": {
                                    "side": { "const": "right" }
                                },
                                "required": ["side"]
                            }
                        }
                    }
                }
            ]
        },
        "systems": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "hvac": {
                    "type": "array",
                    "additionalItems": false,
                    "minItems": 0,
                    "maxItems": 2,
                    "items": {
                        "type": "object",
                        "required": ["hvac_name"],
                        "additionalProperties": false,
                        "properties": {
                            "hvac_name": {
                                "type": "string",
                                "enum": ["hvac1", "hvac2"],
                                "description": "Name of this system instance"
                            },
                            "hvac_fraction": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                                "description": "Faction of conditioned floor area served by this system"
                            },
                            "heating": {
                                "type": "object",
                                "description": "Inputs about the heating system",
                                "additionalProperties": false,
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": [
                                            "heat_pump",
                                            "central_furnace",
                                            "wall_furnace",
                                            "baseboard",
                                            "boiler",
                                            "gchp",
                                            "wood_stove",
                                            "mini_split",
                                            "none"
                                        ],
                                        "description": "Heating equipment type"
                                    },
                                    "fuel_primary": {
                                        "type": "string",
                                        "enum": [
                                            "electric",
                                            "natural_gas",
                                            "lpg",
                                            "fuel_oil",
                                            "cord_wood",
                                            "pellet_wood"
                                        ],
                                        "description": "Primary heating fuel"
                                    },
                                    "efficiency_method": {
                                        "type": "string",
                                        "enum": ["user", "shipment_weighted"],
                                        "description": "Method to determine heating efficiency"
                                    },
                                    "year": {
                                        "type": "integer",
                                        "minimum": 1970,
                                        "description": "Year equipment was manufactured (only used if efficiency_method is shipment_weighted)"
                                    },
                                    "efficiency": {
                                        "type": "number",
                                        "$comment": "Additional requirements for this property apply based on the heating system type"
                                    },
                                    "efficiency_unit": {
                                        "type": "string",
                                        "enum": ["afue", "percent", "cop", "hspf", "hspf2"],
                                        "$comment": "Additional requirements for this property apply based on the heating system type"
                                    }
                                },
                                "allOf": [
                                    {
                                        "if": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["central_furnace", "wall_furnace", "boiler"]
                                                }
                                            },
                                            "required": ["type"]
                                        },
                                        "then": {
                                            "if": {
                                                "properties": {
                                                    "fuel_primary": { "const": "electric" }
                                                },
                                                "required": ["fuel_primary"]
                                            },
                                            "then": {
                                                "properties": {
                                                    "efficiency_unit": {
                                                        "description": "Unit of efficiency value (only used if efficiency_method is user)"
                                                    },
                                                    "efficiency": {
                                                        "description": "Efficiency of heating equipment (only used if efficiency_method is user)"
                                                    }
                                                }
                                            },
                                            "else": {
                                                "properties": {
                                                    "efficiency_unit": {
                                                        "enum": ["afue"],
                                                        "description": "Unit of efficiency value (only used if efficiency_method is user)"
                                                    },
                                                    "efficiency": {
                                                        "minimum": 0.6,
                                                        "maximum": 1,
                                                        "description": "AFUE of heating equipment (only used if efficiency_method is user)"
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["heat_pump", "mini_split"]
                                                }
                                            },
                                            "required": ["type"]
                                        },
                                        "then": {
                                            "properties": {
                                                "efficiency_unit": {
                                                    "enum": ["hspf", "hspf2"],
                                                    "description": "Unit of efficiency value (only used if efficiency_method is user)"
                                                },
                                                "efficiency": {
                                                    "minimum": 6,
                                                    "maximum": 20,
                                                    "description": "HSPF or HSPF2 of heating equipment (only used if efficiency_method is user)"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "type": { "const": "gchp" }
                                            },
                                            "required": ["type"]
                                        },
                                        "then": {
                                            "properties": {
                                                "efficiency_unit": {
                                                    "enum": ["cop"],
                                                    "description": "Unit of efficiency value (only used if efficiency_method is user)"
                                                },
                                                "efficiency": {
                                                    "minimum": 2,
                                                    "maximum": 5,
                                                    "description": "COP (ARI-330) of heating equipment (only used if efficiency_method is user)"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["baseboard", "wood_stove", "none"]
                                                }
                                            },
                                            "required": ["type"]
                                        },
                                        "then": {
                                            "properties": {
                                                "efficiency_unit": {
                                                    "description": "Unit of efficiency value (only used if efficiency_method is user)"
                                                },
                                                "efficiency": {
                                                    "description": "Efficiency of heating equipment (only used if efficiency_method is user)"
                                                }
                                            }
                                        }
                                    }
                                ]
                            },
                            "cooling": {
                                "type": "object",
                                "description": "Inputs about the cooling system",
                                "additionalProperties": false,
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": [
                                            "packaged_dx",
                                            "split_dx",
                                            "heat_pump",
                                            "gchp",
                                            "dec",
                                            "mini_split",
                                            "none"
                                        ],
                                        "description": "Cooling equipment type"
                                    },
                                    "efficiency_method": {
                                        "type": "string",
                                        "enum": ["user", "shipment_weighted"],
                                        "description": "Method to determine cooling efficiency"
                                    },
                                    "year": {
                                        "type": "integer",
                                        "minimum": 1970,
                                        "description": "Year equipment was manufactured (only used if efficiency_method is shipment_weighted)"
                                    },
                                    "efficiency": {
                                        "type": "number",
                                        "$comment": "Additional requirements for this property apply based on the cooling system type"
                                    },
                                    "efficiency_unit": {
                                        "type": "string",
                                        "enum": ["eer", "ceer", "seer", "seer2"],
                                        "$comment": "Additional requirements for this property apply based on the cooling system type"
                                    }
                                },
                                "allOf": [
                                    {
                                        "if": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["split_dx", "heat_pump", "mini_split"]
                                                }
                                            },
                                            "required": ["type"]
                                        },
                                        "then": {
                                            "properties": {
                                                "efficiency_unit": {
                                                    "enum": ["seer", "seer2"],
                                                    "description": "Unit of efficiency value (only used if efficiency_method is user)"
                                                },
                                                "efficiency": {
                                                    "minimum": 8,
                                                    "maximum": 40,
                                                    "description": "SEER or SEER2 of cooling equipment (only used if efficiency_method is user)"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["packaged_dx"]
                                                }
                                            },
                                            "required": ["type"]
                                        },
                                        "then": {
                                            "properties": {
                                                "efficiency_unit": {
                                                    "enum": ["eer", "ceer"],
                                                    "description": "Unit of efficiency value (only used if efficiency_method is user)"
                                                },
                                                "efficiency": {
                                                    "minimum": 8,
                                                    "maximum": 40,
                                                    "description": "EER or CEER of cooling equipment (only used if efficiency_method is user)"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["gchp"]
                                                }
                                            },
                                            "required": ["type"]
                                        },
                                        "then": {
                                            "properties": {
                                                "efficiency_unit": {
                                                    "enum": ["eer"],
                                                    "description": "Unit of efficiency value (only used if efficiency_method is user)"
                                                },
                                                "efficiency": {
                                                    "minimum": 8,
                                                    "maximum": 40,
                                                    "description": "EER of cooling equipment (only used if efficiency_method is user)"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        "if": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["dec", "none"]
                                                }
                                            },
                                            "required": ["type"]
                                        },
                                        "then": {
                                            "properties": {
                                                "efficiency_unit": {
                                                    "description": "Unit of efficiency value (only used if efficiency_method is user)"
                                                },
                                                "efficiency": {
                                                    "description": "Efficiency of cooling equipment (only used if efficiency_method is user)"
                                                }
                                            }
                                        }
                                    }
                                ]
                            },
                            "hvac_distribution": {
                                "$comment": "Additional requirements for this property apply based on the heating and cooling system type",
                                "$ref": "#/definitions/def_hvac_distribution"
                            }
                        },
                        "allOf": [
                            {
                                "if": {
                                    "properties": {
                                        "hvac_name": {
                                            "enum": ["hvac1", "hvac2"]
                                        }
                                    }
                                },
                                "then": {
                                    "required": ["hvac_fraction"]
                                }
                            },
                            {
                                "if": {
                                    "not": {
                                        "properties": {
                                            "hvac_fraction": { "const": 0 }
                                        }
                                    }
                                },
                                "then": {
                                    "properties": {
                                        "heating": {
                                            "required": ["type"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "allOf": [
                                        {
                                            "not": {
                                                "properties": {
                                                    "hvac_fraction": { "const": 0 }
                                                }
                                            }
                                        },
                                        {
                                            "not": {
                                                "properties": {
                                                    "heating": {
                                                        "properties": {
                                                            "type": { "const": "none" }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                },
                                "then": {
                                    "properties": {
                                        "heating": {
                                            "required": ["fuel_primary"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "allOf": [
                                        {
                                            "not": {
                                                "properties": {
                                                    "hvac_fraction": { "const": 0 }
                                                }
                                            }
                                        },
                                        {
                                            "not": {
                                                "properties": {
                                                    "heating": {
                                                        "properties": {
                                                            "type": {
                                                                "enum": ["none", "wood_stove"]
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            "not": {
                                                "allOf": [
                                                    {
                                                        "properties": {
                                                            "heating": {
                                                                "properties": {
                                                                    "type": {
                                                                        "enum": [
                                                                            "baseboard",
                                                                            "central_furnace",
                                                                            "wall_furnace",
                                                                            "boiler"
                                                                        ]
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "properties": {
                                                            "heating": {
                                                                "properties": {
                                                                    "fuel_primary": { "const": "electric" }
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                },
                                "then": {
                                    "properties": {
                                        "heating": {
                                            "required": ["efficiency_method"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "allOf": [
                                        {
                                            "not": {
                                                "properties": {
                                                    "hvac_fraction": { "const": 0 }
                                                }
                                            }
                                        },
                                        {
                                            "properties": {
                                                "heating": {
                                                    "properties": {
                                                        "efficiency_method": { "const": "shipment_weighted" }
                                                    },
                                                    "required": ["efficiency_method"]
                                                }
                                            }
                                        },
                                        {
                                            "not": {
                                                "properties": {
                                                    "heating": {
                                                        "properties": {
                                                            "type": {
                                                                "enum": ["none", "wood_stove"]
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            "not": {
                                                "allOf": [
                                                    {
                                                        "properties": {
                                                            "heating": {
                                                                "properties": {
                                                                    "type": {
                                                                        "enum": [
                                                                            "baseboard",
                                                                            "central_furnace",
                                                                            "wall_furnace",
                                                                            "boiler"
                                                                        ]
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "properties": {
                                                            "heating": {
                                                                "properties": {
                                                                    "fuel_primary": { "const": "electric" }
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                },
                                "then": {
                                    "allOf": [
                                        {
                                            "properties": {
                                                "heating": {
                                                    "required": ["year"]
                                                }
                                            }
                                        },
                                        {
                                            "properties": {
                                                "heating": {
                                                    "not": {
                                                        "required": ["efficiency", "efficiency_unit"]
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "if": {
                                    "allOf": [
                                        {
                                            "not": {
                                                "properties": {
                                                    "hvac_fraction": { "const": 0 }
                                                }
                                            }
                                        },
                                        {
                                            "properties": {
                                                "heating": {
                                                    "properties": {
                                                        "efficiency_method": { "const": "user" }
                                                    },
                                                    "required": ["efficiency_method"]
                                                }
                                            }
                                        },
                                        {
                                            "not": {
                                                "properties": {
                                                    "heating": {
                                                        "properties": {
                                                            "type": {
                                                                "enum": ["none", "wood_stove"]
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        {
                                            "not": {
                                                "allOf": [
                                                    {
                                                        "properties": {
                                                            "heating": {
                                                                "properties": {
                                                                    "type": {
                                                                        "enum": [
                                                                            "baseboard",
                                                                            "central_furnace",
                                                                            "wall_furnace",
                                                                            "boiler"
                                                                        ]
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "properties": {
                                                            "heating": {
                                                                "properties": {
                                                                    "fuel_primary": { "const": "electric" }
                                                                }
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                },
                                "then": {
                                    "allOf": [
                                        {
                                            "properties": {
                                                "heating": {
                                                    "required": ["efficiency", "efficiency_unit"]
                                                }
                                            }
                                        },
                                        {
                                            "properties": {
                                                "heating": {
                                                    "not": {
                                                        "required": ["year"]
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "if": {
                                    "not": {
                                        "properties": {
                                            "hvac_fraction": { "const": 0 }
                                        }
                                    }
                                },
                                "then": {
                                    "properties": {
                                        "cooling": {
                                            "required": ["type"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "allOf": [
                                        {
                                            "not": {
                                                "properties": {
                                                    "hvac_fraction": { "const": 0 }
                                                }
                                            }
                                        },
                                        {
                                            "not": {
                                                "properties": {
                                                    "cooling": {
                                                        "properties": {
                                                            "type": {
                                                                "enum": ["none", "dec"]
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                },
                                "then": {
                                    "properties": {
                                        "cooling": {
                                            "required": ["efficiency_method"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "allOf": [
                                        {
                                            "not": {
                                                "properties": {
                                                    "hvac_fraction": { "const": 0 }
                                                }
                                            }
                                        },
                                        {
                                            "properties": {
                                                "cooling": {
                                                    "properties": {
                                                        "efficiency_method": { "const": "shipment_weighted" }
                                                    },
                                                    "required": ["efficiency_method"]
                                                }
                                            }
                                        },
                                        {
                                            "not": {
                                                "properties": {
                                                    "cooling": {
                                                        "properties": {
                                                            "type": {
                                                                "enum": ["none", "dec"]
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                },
                                "then": {
                                    "allOf": [
                                        {
                                            "properties": {
                                                "cooling": {
                                                    "required": ["year"]
                                                }
                                            }
                                        },
                                        {
                                            "properties": {
                                                "cooling": {
                                                    "not": {
                                                        "required": ["efficiency", "efficiency_unit"]
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "if": {
                                    "allOf": [
                                        {
                                            "not": {
                                                "properties": {
                                                    "hvac_fraction": { "const": 0 }
                                                }
                                            }
                                        },
                                        {
                                            "properties": {
                                                "cooling": {
                                                    "properties": {
                                                        "efficiency_method": { "const": "user" }
                                                    },
                                                    "required": ["efficiency_method"]
                                                }
                                            }
                                        },
                                        {
                                            "not": {
                                                "properties": {
                                                    "cooling": {
                                                        "properties": {
                                                            "type": {
                                                                "enum": ["none", "dec"]
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                },
                                "then": {
                                    "allOf": [
                                        {
                                            "properties": {
                                                "cooling": {
                                                    "required": ["efficiency", "efficiency_unit"]
                                                }
                                            }
                                        },
                                        {
                                            "properties": {
                                                "cooling": {
                                                    "not": {
                                                        "required": ["year"]
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "heating": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["central_furnace", "wall_furnace", "baseboard", "boiler"]
                                                }
                                            },
                                            "required": ["type"]
                                        }
                                    },
                                    "required": ["heating"]
                                },
                                "then": {
                                    "properties": {
                                        "cooling": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["packaged_dx", "split_dx", "mini_split", "dec", "none"]
                                                }
                                            },
                                            "required": ["type"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "heating": {
                                            "properties": {
                                                "type": { "const": "heat_pump" }
                                            },
                                            "required": ["type"]
                                        }
                                    },
                                    "required": ["heating"]
                                },
                                "then": {
                                    "properties": {
                                        "cooling": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["packaged_dx", "heat_pump", "dec", "none"]
                                                }
                                            },
                                            "required": ["type"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "heating": {
                                            "properties": {
                                                "type": { "const": "gchp" }
                                            },
                                            "required": ["type"]
                                        }
                                    },
                                    "required": ["heating"]
                                },
                                "then": {
                                    "properties": {
                                        "cooling": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["packaged_dx", "gchp", "dec", "none"]
                                                }
                                            },
                                            "required": ["type"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "heating": {
                                            "properties": {
                                                "type": { "const": "mini_split" }
                                            },
                                            "required": ["type"]
                                        }
                                    },
                                    "required": ["heating"]
                                },
                                "then": {
                                    "properties": {
                                        "cooling": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["packaged_dx", "mini_split", "dec", "none"]
                                                }
                                            },
                                            "required": ["type"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "cooling": {
                                            "properties": {
                                                "type": { "const": "split_dx" }
                                            },
                                            "required": ["type"]
                                        }
                                    },
                                    "required": ["cooling"]
                                },
                                "then": {
                                    "properties": {
                                        "heating": {
                                            "properties": {
                                                "type": {
                                                    "enum": [
                                                        "central_furnace",
                                                        "wall_furnace",
                                                        "baseboard",
                                                        "boiler",
                                                        "wood_stove",
                                                        "none"
                                                    ]
                                                }
                                            },
                                            "required": ["type"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "cooling": {
                                            "properties": {
                                                "type": { "const": "heat_pump" }
                                            },
                                            "required": ["type"]
                                        }
                                    },
                                    "required": ["cooling"]
                                },
                                "then": {
                                    "properties": {
                                        "heating": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["heat_pump", "wood_stove", "none"]
                                                }
                                            },
                                            "required": ["type"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "cooling": {
                                            "properties": {
                                                "type": { "const": "gchp" }
                                            },
                                            "required": ["type"]
                                        }
                                    },
                                    "required": ["cooling"]
                                },
                                "then": {
                                    "properties": {
                                        "heating": {
                                            "properties": {
                                                "type": {
                                                    "enum": ["gchp", "wood_stove", "none"]
                                                }
                                            },
                                            "required": ["type"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "properties": {
                                        "cooling": {
                                            "properties": {
                                                "type": { "const": "mini_split" }
                                            },
                                            "required": ["type"]
                                        }
                                    },
                                    "required": ["cooling"]
                                },
                                "then": {
                                    "properties": {
                                        "heating": {
                                            "properties": {
                                                "type": {
                                                    "enum": [
                                                        "central_furnace",
                                                        "wall_furnace",
                                                        "baseboard",
                                                        "boiler",
                                                        "mini_split",
                                                        "wood_stove",
                                                        "none"
                                                    ]
                                                }
                                            },
                                            "required": ["type"]
                                        }
                                    }
                                }
                            },
                            {
                                "if": {
                                    "anyOf": [
                                        {
                                            "properties": {
                                                "heating": {
                                                    "properties": {
                                                        "type": { "const": "none" }
                                                    },
                                                    "required": ["type"]
                                                }
                                            },
                                            "required": ["heating"]
                                        },
                                        {
                                            "properties": {
                                                "cooling": {
                                                    "properties": {
                                                        "type": { "const": "none" }
                                                    },
                                                    "required": ["type"]
                                                }
                                            },
                                            "required": ["cooling"]
                                        }
                                    ]
                                },
                                "then": {
                                    "not": {
                                        "allOf": [
                                            {
                                                "properties": {
                                                    "heating": {
                                                        "properties": {
                                                            "type": { "const": "none" }
                                                        },
                                                        "required": ["type"]
                                                    }
                                                },
                                                "required": ["heating"]
                                            },
                                            {
                                                "properties": {
                                                    "cooling": {
                                                        "properties": {
                                                            "type": { "const": "none" }
                                                        },
                                                        "required": ["type"]
                                                    }
                                                },
                                                "required": ["cooling"]
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                "if": {
                                    "allOf": [
                                        {
                                            "properties": {
                                                "heating": {
                                                    "properties": {
                                                        "type": {
                                                            "enum": ["central_furnace", "heat_pump", "gchp"]
                                                        }
                                                    },
                                                    "required": ["type"]
                                                }
                                            },
                                            "required": ["heating"]
                                        }
                                    ]
                                },
                                "then": {
                                    "properties": {
                                        "hvac_distribution": { "$ref": "#/definitions/def_hvac_distribution" }
                                    },
                                    "required": ["hvac_distribution"]
                                }
                            },
                            {
                                "if": {
                                    "allOf": [
                                        {
                                            "properties": {
                                                "cooling": {
                                                    "properties": {
                                                        "type": {
                                                            "enum": ["split_dx", "heat_pump", "gchp"]
                                                        }
                                                    },
                                                    "required": ["type"]
                                                }
                                            },
                                            "required": ["cooling"]
                                        }
                                    ]
                                },
                                "then": {
                                    "properties": {
                                        "hvac_distribution": { "$ref": "#/definitions/def_hvac_distribution" }
                                    },
                                    "required": ["hvac_distribution"]
                                }
                            },
                            {
                                "if": {
                                    "allOf": [
                                        {
                                            "properties": {
                                                "heating": {
                                                    "properties": {
                                                        "type": {
                                                            "enum": [
                                                                "wall_furnace",
                                                                "baseboard",
                                                                "boiler",
                                                                "mini_split",
                                                                "wood_stove",
                                                                "none"
                                                            ]
                                                        }
                                                    },
                                                    "required": ["type"]
                                                }
                                            },
                                            "required": ["heating"]
                                        },
                                        {
                                            "properties": {
                                                "cooling": {
                                                    "properties": {
                                                        "type": {
                                                            "enum": ["packaged_dx", "mini_split", "dec", "none"]
                                                        }
                                                    },
                                                    "required": ["type"]
                                                }
                                            },
                                            "required": ["cooling"]
                                        }
                                    ]
                                },
                                "then": {
                                    "not": {
                                        "required": ["hvac_distribution"]
                                    }
                                }
                            }
                        ]
                    }
                },
                "domestic_hot_water": {
                    "type": "object",
                    "required": ["category", "type"],
                    "additionalProperties": false,
                    "properties": {
                        "category": {
                            "type": "string",
                            "enum": ["unit", "combined"],
                            "description": "Water heater category"
                        },
                        "type": {
                            "type": "string",
                            "enum": ["storage", "indirect", "tankless_coil", "tankless", "heat_pump"],
                            "description": "Water heater type"
                        },
                        "fuel_primary": {
                            "type": "string",
                            "enum": ["electric", "natural_gas", "lpg", "fuel_oil"],
                            "description": "Primary water heater fuel"
                        },
                        "efficiency_method": {
                            "type": "string",
                            "enum": ["user", "shipment_weighted"],
                            "description": "Method to determine water heater efficiency"
                        },
                        "year": {
                            "type": "integer",
                            "minimum": 1972,
                            "description": "Year water heater was manufactured (only used if efficiency_method is shipment_weighted)"
                        },
                        "efficiency": {
                            "type": "number",
                            "description": "Efficiency of water heater (only used if efficiency_method is user)"
                        },
                        "efficiency_unit": {
                            "type": "string",
                            "enum": ["ef", "uef"],
                            "description": "Unit of water heater efficiency"
                        }
                    },
                    "allOf": [
                        {
                            "if": {
                                "properties": {
                                    "type": {
                                        "enum": ["indirect", "tankless_coil"]
                                    }
                                },
                                "required": ["type"]
                            },
                            "then": {
                                "properties": {
                                    "category": { "const": "combined" }
                                },
                                "required": ["category"]
                            }
                        },
                        {
                            "if": {
                                "allOf": [
                                    {
                                        "properties": {
                                            "category": { "const": "unit" }
                                        },
                                        "required": ["category"]
                                    }
                                ]
                            },
                            "then": {
                                "required": ["fuel_primary", "efficiency_method"]
                            }
                        },
                        {
                            "if": {
                                "properties": {
                                    "category": { "const": "unit" }
                                },
                                "required": ["category"]
                            },
                            "then": {
                                "if": {
                                    "properties": {
                                        "efficiency_method": { "const": "shipment_weighted" }
                                    },
                                    "required": ["efficiency_method"]
                                },
                                "then": {
                                    "required": ["year"]
                                },
                                "else": {
                                    "not": {
                                        "required": ["year"]
                                    }
                                }
                            }
                        },
                        {
                            "if": {
                                "properties": {
                                    "category": { "const": "unit" }
                                },
                                "required": ["category"]
                            },
                            "then": {
                                "if": {
                                    "properties": {
                                        "efficiency_method": {
                                            "enum": ["user"]
                                        }
                                    },
                                    "required": ["efficiency_method"]
                                },
                                "then": {
                                    "required": ["efficiency", "efficiency_unit"]
                                },
                                "else": {
                                    "not": {
                                        "required": ["efficiency", "efficiency_unit"]
                                    }
                                }
                            }
                        },
                        {
                            "if": {
                                "properties": {
                                    "type": { "const": "storage" },
                                    "efficiency_method": {
                                        "enum": ["user", "shipment_weighted"]
                                    }
                                },
                                "required": ["type", "efficiency_method"]
                            },
                            "then": {
                                "properties": {
                                    "efficiency": {
                                        "type": "number",
                                        "minimum": 0.45,
                                        "maximum": 0.95
                                    }
                                }
                            }
                        },
                        {
                            "if": {
                                "properties": {
                                    "type": { "const": "tankless" },
                                    "efficiency_method": {
                                        "enum": ["user"]
                                    }
                                },
                                "required": ["type", "efficiency_method"]
                            },
                            "then": {
                                "properties": {
                                    "efficiency": {
                                        "type": "number",
                                        "minimum": 0.45,
                                        "maximum": 0.99
                                    }
                                }
                            }
                        },
                        {
                            "if": {
                                "properties": {
                                    "type": { "const": "heat_pump" },
                                    "efficiency_method": { "const": "user" }
                                },
                                "required": ["type", "efficiency_method"]
                            },
                            "then": {
                                "properties": {
                                    "efficiency": {
                                        "type": "number",
                                        "minimum": 1,
                                        "maximum": 4
                                    }
                                }
                            }
                        }
                    ]
                },
                "generation": {
                    "type": "object",
                    "additionalProperties": false,
                    "properties": {
                        "solar_electric": {
                            "type": "object",
                            "additionalProperties": false,
                            "properties": {
                                "capacity_known": {
                                    "type": "boolean",
                                    "description": "Is the capacity known?"
                                },
                                "system_capacity": {
                                    "type": "number",
                                    "minimum": 0.05,
                                    "maximum": 100,
                                    "description": "DC capacity of system (kW) (only used if capacity_known is true)"
                                },
                                "num_panels": {
                                    "type": "integer",
                                    "minimum": 1,
                                    "maximum": 100,
                                    "description": "Number of panels in the system (only used if capacity_known is false)"
                                },
                                "year": {
                                    "type": "integer",
                                    "minimum": 2000,
                                    "description": "Year system was installed"
                                },
                                "array_azimuth": {
                                    "type": "string",
                                    "enum": [
                                        "north",
                                        "north_east",
                                        "east",
                                        "south_east",
                                        "south",
                                        "south_west",
                                        "west",
                                        "north_west"
                                    ],
                                    "description": "Direction panels face"
                                },
                                "array_tilt": {
                                    "type": "string",
                                    "enum": ["flat", "low_slope", "medium_slope", "steep_slope"],
                                    "description": "Tilt of panels"
                                }
                            },
                            "allOf": [
                                {
                                    "if": {
                                        "properties": {
                                            "year": {}
                                        },
                                        "required": ["year"]
                                    },
                                    "then": {
                                        "required": ["capacity_known"]
                                    }
                                },
                                {
                                    "if": {
                                        "properties": {
                                            "capacity_known": { "const": true }
                                        },
                                        "required": ["capacity_known"]
                                    },
                                    "then": {
                                        "allOf": [
                                            {
                                                "required": ["system_capacity", "year"]
                                            },
                                            {
                                                "not": {
                                                    "required": ["num_panels"]
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    "if": {
                                        "properties": {
                                            "capacity_known": { "const": false }
                                        },
                                        "required": ["capacity_known"]
                                    },
                                    "then": {
                                        "allOf": [
                                            {
                                                "required": ["num_panels", "year"]
                                            },
                                            {
                                                "not": {
                                                    "required": ["system_capacity"]
                                                }
                                            }
                                        ]
                                    }
                                },
                                {
                                    "if": {
                                        "anyOf": [
                                            {
                                                "properties": {
                                                    "year": {}
                                                },
                                                "required": ["year"]
                                            },
                                            {
                                                "properties": {
                                                    "capacity_known": {}
                                                },
                                                "required": ["capacity_known"]
                                            }
                                        ]
                                    },
                                    "then": {
                                        "required": ["array_azimuth", "array_tilt"]
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            "allOf": [
                {
                    "if": {
                        "properties": {
                            "domestic_hot_water": {
                                "properties": {
                                    "category": { "const": "combined" }
                                }
                            }
                        }
                    },
                    "then": {
                        "properties": {
                            "hvac": {
                                "contains": {
                                    "properties": {
                                        "heating": {
                                            "properties": {
                                                "type": { "const": "boiler" }
                                            },
                                            "required": ["type"]
                                        }
                                    }
                                },
                                "error_msg": "The category element can only be set to \"combined\" if the heating/type is \"boiler\" and the boiler provides the domestic hot water"
                            }
                        }
                    }
                }
            ],
            "required": ["hvac", "domestic_hot_water"]
        }
    },
    "allOf": [
        {
            "if": {
                "properties": {
                    "zone": {
                        "properties": {
                            "zone_roof": {
                                "not": {
                                    "contains": {
                                        "properties": {
                                            "roof_type": {
                                                "enum": ["vented_attic", "cond_attic"]
                                            }
                                        },
                                        "required": ["roof_type"]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "then": {
                "properties": {
                    "systems": {
                        "properties": {
                            "hvac": {
                                "contains": {
                                    "properties": {
                                        "hvac_distribution": {
                                            "properties": {
                                                "duct": {
                                                    "not": {
                                                        "contains": {
                                                            "properties": {
                                                                "location": { "const": "uncond_attic" }
                                                            },
                                                            "required": ["location"]
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                "error_msg": "duct/location[\"uncond_attic\"] is not allowed as there is no attic."
                            }
                        }
                    }
                }
            }
        },
        {
            "if": {
                "properties": {
                    "about": {
                        "properties": {
                            "dwelling_unit_type": { "enum": ["single_family_detached", "manufactured_home"] }
                        },
                        "required": ["dwelling_unit_type"]
                    }
                }
            },
            "then": {
                "properties": {
                    "zone": {
                        "properties": {
                            "zone_wall": {
                                "not": {
                                    "contains": {
                                        "properties": {
                                            "adjacent_to": {
                                                "enum": [
                                                    "other_unit",
                                                    "other_heated_space",
                                                    "other_multifamily_buffer_space",
                                                    "other_non_freezing_space"
                                                ]
                                            }
                                        },
                                        "required": ["adjacent_to"]
                                    }
                                },
                                "error_msg": "single family detached and manufactured homes only allow adjacent_to \"outside\""
                            }
                        }
                    }
                }
            }
        },
        {
            "if": {
                "properties": {
                    "zone": {
                        "properties": {
                            "zone_floor": {
                                "not": {
                                    "contains": {
                                        "properties": {
                                            "foundation_type": {
                                                "enum": ["vented_crawl"]
                                            }
                                        },
                                        "required": ["foundation_type"]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "then": {
                "properties": {
                    "systems": {
                        "properties": {
                            "hvac": {
                                "contains": {
                                    "properties": {
                                        "hvac_distribution": {
                                            "properties": {
                                                "duct": {
                                                    "not": {
                                                        "contains": {
                                                            "properties": {
                                                                "location": { "const": "vented_crawl" }
                                                            },
                                                            "required": ["location"]
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                "error_msg": "duct/location[\"vented_crawl\"] is not allowed as there is no vented crawlspace."
                            }
                        }
                    }
                }
            }
        },
        {
            "if": {
                "properties": {
                    "zone": {
                        "properties": {
                            "zone_floor": {
                                "not": {
                                    "contains": {
                                        "properties": {
                                            "foundation_type": {
                                                "enum": ["unvented_crawl"]
                                            }
                                        },
                                        "required": ["foundation_type"]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "then": {
                "properties": {
                    "systems": {
                        "properties": {
                            "hvac": {
                                "contains": {
                                    "properties": {
                                        "hvac_distribution": {
                                            "properties": {
                                                "duct": {
                                                    "not": {
                                                        "contains": {
                                                            "properties": {
                                                                "location": { "const": "unvented_crawl" }
                                                            },
                                                            "required": ["location"]
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                "error_msg": "duct/location[\"unvented_crawl\"] is not allowed as there is no unvented crawlspace."
                            }
                        }
                    }
                }
            }
        },
        {
            "if": {
                "properties": {
                    "zone": {
                        "properties": {
                            "zone_floor": {
                                "not": {
                                    "contains": {
                                        "properties": {
                                            "foundation_type": {
                                                "enum": ["uncond_basement"]
                                            }
                                        },
                                        "required": ["foundation_type"]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "then": {
                "properties": {
                    "systems": {
                        "properties": {
                            "hvac": {
                                "contains": {
                                    "properties": {
                                        "hvac_distribution": {
                                            "properties": {
                                                "duct": {
                                                    "not": {
                                                        "contains": {
                                                            "properties": {
                                                                "location": { "const": "uncond_basement" }
                                                            },
                                                            "required": ["location"]
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                "error_msg": "duct/location[\"uncond_basement\"] is not allowed as there is no unconditioned basement."
                            }
                        }
                    }
                }
            }
        },
        {
            "if": {
                "properties": {
                    "zone": {
                        "properties": {
                            "zone_floor": {
                                "not": {
                                    "contains": {
                                        "properties": {
                                            "foundation_type": {
                                                "enum": ["belly_and_wing"]
                                            }
                                        },
                                        "required": ["foundation_type"]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            "then": {
                "properties": {
                    "systems": {
                        "properties": {
                            "hvac": {
                                "contains": {
                                    "properties": {
                                        "hvac_distribution": {
                                            "properties": {
                                                "duct": {
                                                    "not": {
                                                        "contains": {
                                                            "properties": {
                                                                "location": { "const": "manufactured_home_belly" }
                                                            },
                                                            "required": ["location"]
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                },
                                "error_msg": "duct/location[\"manufactured_home_belly\"] is not allowed as there is no belly_and_wing foundation type."
                            }
                        }
                    }
                }
            }
        },
        {
            "if": {
                "properties": {
                    "systems": {
                        "properties": {
                            "hvac": {
                                "contains": {
                                    "properties": {
                                        "hvac_distribution": {
                                            "properties": {
                                                "duct": {
                                                    "contains": {
                                                        "properties": {
                                                            "location": { "const": "manufactured_home_belly" }
                                                        },
                                                        "required": ["location"]
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "required": ["hvac_distribution"]
                                }
                            }
                        }
                    }
                }
            },
            "then": {
                "properties": {
                    "about": {
                        "properties": {
                            "dwelling_unit_type": {
                                "const": "manufactured_home"
                            }
                        }
                    }
                }
            }
        }
    ],
    "definitions": {
        "def_hvac_distribution": {
            "type": "object",
            "description": "Inputs about the ducts",
            "required": ["leakage_method", "duct"],
            "additionalItems": false,
            "properties": {
                "leakage_method": {
                    "type": "string",
                    "enum": ["qualitative", "quantitative"],
                    "description": "Method for duct leakage inputs"
                },
                "leakage_to_outside": {
                    "type": "number",
                    "minimum": 0,
                    "maximum": 1000,
                    "description": "Duct leakage to outside in CFM25 (only used if leakage_method is quantitative)"
                },
                "sealed": {
                    "type": "boolean",
                    "description": "Are the ducts sealed? (only used if leakage_method is qualitative)"
                },
                "duct": {
                    "type": "array",
                    "additionalItems": false,
                    "minItems": 1,
                    "maxItems": 3,
                    "items": {
                        "type": "object",
                        "additionalProperties": false,
                        "properties": {
                            "name": {
                                "type": "string",
                                "enum": ["duct1", "duct2", "duct3"],
                                "description": "Name of distribution system"
                            },
                            "location": {
                                "type": "string",
                                "enum": [
                                    "cond_space",
                                    "uncond_basement",
                                    "unvented_crawl",
                                    "vented_crawl",
                                    "uncond_attic",
                                    "under_slab",
                                    "exterior_wall",
                                    "manufactured_home_belly",
                                    "outside"
                                ],
                                "description": "Location of distribution system"
                            },
                            "fraction": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 1,
                                "description": "Fraction of total duct length"
                            },
                            "insulated": {
                                "type": "boolean",
                                "description": "Are the ducts insulated?"
                            }
                        },
                        "allOf": [
                            {
                                "required": ["name", "fraction"]
                            },
                            {
                                "if": {
                                    "properties": {
                                        "fraction": { "exclusiveMinimum": 0 }
                                    },
                                    "required": ["fraction"]
                                },
                                "then": {
                                    "required": ["location", "insulated"]
                                }
                            }
                        ]
                    }
                }
            },
            "allOf": [
                {
                    "if": {
                        "properties": {
                            "leakage_method": { "const": "qualitative" }
                        },
                        "required": ["leakage_method"]
                    },
                    "then": {
                        "allOf": [
                            {
                                "required": ["sealed"]
                            },
                            {
                                "not": {
                                    "required": ["leakage_to_outside"]
                                }
                            }
                        ]
                    }
                },
                {
                    "if": {
                        "properties": {
                            "leakage_method": { "const": "quantitative" }
                        },
                        "required": ["leakage_method"]
                    },
                    "then": {
                        "allOf": [
                            {
                                "required": ["leakage_to_outside"]
                            },
                            {
                                "not": {
                                    "required": ["sealed"]
                                }
                            }
                        ]
                    }
                }
            ]
        }
    },
    "required": ["version", "address", "about", "zone", "systems"]
}