/**
 * home_audit.node.js - Defines the validation functions used to validate a home audit for the HES GUI.
 */

let TypeRules = require('./type_rules.node');

const BLOCKER = HESValidationEngine.BLOCKER;
const ERROR = HESValidationEngine.ERROR;
const MANDATORY = HESValidationEngine.MANDATORY;

const stateArray = [
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

const assessmentTypes = [
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

const orientationArray = [
    'north',
    'north_east',
    'east',
    'south_east',
    'south',
    'south_west',
    'west',
    'north_west'
];
const roofAssemblyCode = [
    'rfwf00co',
    'rfwf00rc',
    'rfwf11co',
    'rfwf13co',
    'rfwf15co',
    'rfwf19co',
    'rfwf21co',
    'rfwf27co',
    'rfwf30co',
    'rfrb00co',
    'rfps00co',
    'rfps11co',
    'rfps13co',
    'rfps15co',
    'rfps19co',
    'rfps21co',
    'rfwf00wo',
    'rfwf00lc',
    'rfwf11wo',
    'rfwf13wo',
    'rfwf15wo',
    'rfwf19wo',
    'rfwf21wo',
    'rfwf27wo',
    'rfwf30wo',
    'rfrb00wo',
    'rfps00wo',
    'rfps11wo',
    'rfps13wo',
    'rfps15wo',
    'rfps19wo',
    'rfps21wo',
    'rfps00rc',
    'rfps11rc',
    'rfps13rc',
    'rfps15rc',
    'rfps19rc',
    'rfps21rc',
    'rfrb00rc',
    'rfwf00tg',
    'rfwf11rc',
    'rfwf13rc',
    'rfwf15rc',
    'rfwf19rc',
    'rfwf21rc',
    'rfwf27rc',
    'rfwf30rc',
    'rfps00lc',
    'rfps11lc',
    'rfps13lc',
    'rfps15lc',
    'rfps19lc',
    'rfps21lc',
    'rfwf11lc',
    'rfwf13lc',
    'rfwf15lc',
    'rfwf19lc',
    'rfwf21lc',
    'rfwf27lc',
    'rfwf30lc',
    'rfps00tg',
    'rfps11tg',
    'rfps13tg',
    'rfps15tg',
    'rfps19tg',
    'rfps21tg',
    'rfwf11tg',
    'rfwf13tg',
    'rfwf15tg',
    'rfwf19tg',
    'rfwf21tg',
    'rfwf27tg',
    'rfwf30tg',
    'rfrb00lc',
    'rfrb00tg',
];
const roofColor = [
    'white',
    'light',
    'medium',
    'medium_dark',
    'dark',
    'cool_color'
];
const roofType = [
    'vented_attic',
    'cond_attic',
    'cath_ceiling'
];
const ceilingAssemblyCode = [
    'ecwf00',
    'ecwf03',
    'ecwf06',
    'ecwf09',
    'ecwf11',
    'ecwf19',
    'ecwf21',
    'ecwf25',
    'ecwf30',
    'ecwf38',
    'ecwf44',
    'ecwf49',
    'ecwf60'
];

const foundationType = [
    'uncond_basement',
    'cond_basement',
    'vented_crawl',
    'unvented_crawl',
    'slab_on_grade'
];

const floorAssemblyCode = [
    'efwf00ca',
    'efwf11ca',
    'efwf13ca',
    'efwf15ca',
    'efwf19ca',
    'efwf21ca',
    'efwf25ca',
    'efwf30ca',
    'efwf38ca'
];

const windowAndSkylightCode = [
    'scna',
    'scnw',
    'stna',
    'dcaa',
    'dtaa',
    'thmabw',
    'stnw',
    'dcaw',
    'dtaw',
    'dpeaw',
    'dpeaaw',
    'dseaw',
    'dseaaw',
    'dseaa',
    'dcab',
    'dtab',
    'dpeaab',
    'dseab'
];

const wallAssemblyCode = [
    'ewwf00wo',
    'ewwf00st',
    'ewwf00vi',
    'ewwf03wo',
    'ewwf07wo',
    'ewwf11wo',
    'ewwf13wo',
    'ewwf15wo',
    'ewwf19wo',
    'ewwf21wo',
    'ewps00wo',
    'ewps03wo',
    'ewps07wo',
    'ewps11wo',
    'ewps13wo',
    'ewps15wo',
    'ewps19wo',
    'ewps21wo',
    'ewov19wo',
    'ewov21wo',
    'ewov27wo',
    'ewov33wo',
    'ewov38wo',
    'ewov19st',
    'ewov21st',
    'ewov27st',
    'ewov33st',
    'ewov38st',
    'ewcb00st',
    'ewcb03st',
    'ewcb06st',
    'ewsb00st',
    'ewps00st',
    'ewps03st',
    'ewps07st',
    'ewps11st',
    'ewps13st',
    'ewps15st',
    'ewps19st',
    'ewps21st',
    'ewwf00al',
    'ewwf03st',
    'ewwf07st',
    'ewwf11st',
    'ewwf13st',
    'ewwf15st',
    'ewwf19st',
    'ewwf21st',
    'ewwf00br',
    'ewwf03vi',
    'ewwf07vi',
    'ewwf11vi',
    'ewwf13vi',
    'ewwf15vi',
    'ewwf19vi',
    'ewwf21vi',
    'ewwf03al',
    'ewwf07al',
    'ewwf11al',
    'ewwf13al',
    'ewwf15al',
    'ewwf19al',
    'ewwf21al',
    'ewwf03br',
    'ewwf07br',
    'ewwf11br',
    'ewwf13br',
    'ewwf15br',
    'ewwf19br',
    'ewwf21br',
    'ewps00vi',
    'ewps03vi',
    'ewps07vi',
    'ewps11vi',
    'ewps13vi',
    'ewps15vi',
    'ewps19vi',
    'ewps21vi',
    'ewov19vi',
    'ewov21vi',
    'ewov27vi',
    'ewov33vi',
    'ewov38vi',
    'ewps00al',
    'ewps03al',
    'ewps07al',
    'ewps11al',
    'ewps13al',
    'ewps15al',
    'ewps19al',
    'ewps21al',
    'ewov19al',
    'ewov21al',
    'ewov27al',
    'ewov33al',
    'ewov38al',
    'ewps00br',
    'ewps03br',
    'ewps07br',
    'ewps11br',
    'ewps13br',
    'ewps15br',
    'ewps19br',
    'ewps21br',
    'ewov19br',
    'ewov21br',
    'ewov27br',
    'ewov33br',
    'ewov38br',
    'ewbr00nn',
    'ewbr05nn',
    'ewbr10nn',
    'ewcb00nn',
    'ewcb03nn',
    'ewcb06nn',
    'ewcb00br',
    'ewcb03br',
    'ewcb06br',
];

const heatingTypeOptions = [
    'none',
    'central_furnace',
    'wall_furnace',
    'boiler',
    'heat_pump',
    'baseboard',
    'gchp',
    'mini_split',
    'wood_stove',
];

const heatingFuelOptions = [
    'natural_gas',
    'lpg',
    'fuel_oil',
    'electric',
    'cord_wood',
    'pellet_wood'
];

const coolingTypeOptions = [
    'none',
    'packaged_dx',
    'split_dx',
    'heat_pump',
    'gchp',
    'dec',
    'mini_split'
];

const ductType = [
    'cond_space',
    'uncond_attic',
    'uncond_basement',
    'vented_crawl',
    'unvented_crawl'
];

const hotWaterFuel = [
    'natural_gas',
    'lpg',
    'fuel_oil',
    'electric',
];

const hotWaterType = [
    'storage',
    'heat_pump',
    'indirect',
    'tankless_coil'
];

/***************
 * VALIDATIONS *
 ***************/

/**
 * Our Validation class holds a message and a type
 *
 * @param {string} message The validation message
 * @param {string} type The type of validation (BLOCKER, ERROR, MANDATORY)
 */
function Validation(message, type) {
    this.message = message;
    this.type = type;
}
Validation.prototype.getMessage = function() {
    return this.message;
};
Validation.prototype.getType = function() {
    return this.type;
};

/**
 * Each validation rule has the same name as the "name" attribute of the associated form input.
 * Each rule is a function that takes the following parameter:
 * @param {string} value The value of the field
 */

let validationRules = {

    /*
     * building
     */
    building_id: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, _homeValues), ERROR);
    },
    assessor_id: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, _homeValues), ERROR);
    },

    /*
     * address_validate
     */
    address: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, _homeValues), ERROR);
    },
    city: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, _homeValues), ERROR);
    },
    state: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 2, stateArray), ERROR);
    },
    zip_code: function(value, _homeValues) {
        return new Validation(TypeRules._zip(value, _homeValues), ERROR);
    },
    assessment_type: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, assessmentTypes), BLOCKER);
    },
    external_building_id: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, _homeValues), ERROR);
    },
    building_id_holder: function(value, _homeValues) {
        //This is just a homeValue holder so we can check if this is a new assessment
        //No validation required for this field
    },

    /*
     * about
     */
    assessment_date: function(value, _homeValues) {
        return new Validation(TypeRules._date(value, Date.parse('2010-01-01'), Date.now()), BLOCKER);
    },
    comments: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 256), BLOCKER);
    },
    //The following two functions are associated with current Walls page
    shape: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, ['rectangle', 'town_house']), BLOCKER);
    },
    town_house_walls: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, ['back_front', 'back_right_front', 'back_front_left']), BLOCKER);
    },
    year_built: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 1600, (new Date()).getFullYear()), BLOCKER);
    },
    number_bedrooms: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 1, 10), BLOCKER);
    },
    num_floor_above_grade: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 1, 4), BLOCKER);
    },
    floor_to_ceiling_height: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 6, 12), BLOCKER);
    },
    conditioned_floor_area: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 250, 25000), BLOCKER);
    },
    orientation: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, orientationArray), BLOCKER);
    },
    blower_door_test: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    air_sealing_present: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    envelope_leakage: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 0, 25000), BLOCKER);
    },

    /*
     * zone
     */
    wall_construction_same: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    window_construction_same: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    /*
     * zone_roof
     */
    roof_area_1: function(value, _homeValues) {
        return this._roof_area(value, _homeValues);
    },
    roof_area_2: function(value, _homeValues) {
        return this._roof_area(value, _homeValues);
    },
    _roof_area: function(value, _homeValues) {
        //Check that roof area is within legal bounds per API
        if (TypeRules._int(value, 1, 25000) === null) {
            let combinedAreaCheck = this._check_combined_area(_homeValues);
            //Check that roof area is not less than floor area
            if (!combinedAreaCheck) {
                let combinedRoofArea = this._get_combined_roof_area(_homeValues);
                let checkConditionedAreas = this._check_conditioned_areas(combinedRoofArea, "Roof area", _homeValues);
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
    },

    roof_assembly_code_1: function(value, _homeValues) {
        return this._roof_assembly_code(value, _homeValues);
    },
    roof_assembly_code_2: function(value, _homeValues) {
        return this._roof_assembly_code(value, _homeValues);
    },
    _roof_assembly_code: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, roofAssemblyCode), BLOCKER);
    },

    roof_color_1: function(value, _homeValues) {
        return this._roof_color(value, _homeValues);
    },
    roof_color_2: function(value, _homeValues) {
        return this._roof_color(value, _homeValues);
    },
    _roof_color: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, roofColor), BLOCKER);
    },

    roof_absorptance_1: function(value, _homeValues) {
        return this._roof_absorptance(value, _homeValues);
    },
    roof_absorptance_2: function(value, _homeValues) {
        return this._roof_absorptance(value, _homeValues);
    },
    _roof_absorptance: function(value, _homeValues) {
        return new Validation(TypeRules._float(value, 0, 1), BLOCKER);
    },

    roof_type_1: function(value, _homeValues) {
        return this._roof_type(value, _homeValues);
    },
    roof_type_2: function(value, _homeValues) {
        return this._roof_type(value, _homeValues);
    },
    _roof_type: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, roofType), BLOCKER);
    },

    ceiling_assembly_code_1: function(value, _homeValues) {
        return this._ceiling_assembly_code(value, _homeValues);
    },
    ceiling_assembly_code_2: function(value, _homeValues) {
        return this._ceiling_assembly_code(value, _homeValues);
    },
    _ceiling_assembly_code: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, ceilingAssemblyCode), BLOCKER);
    },

    /*
     * zone_floor
     */
    floor_area_1: function(value, _homeValues) {
        return this._floor_area(value, _homeValues);
    },
    floor_area_2: function(value, _homeValues) {
        return this._floor_area(value, _homeValues);
    },
    _floor_area: function(value, _homeValues) {
        //Check that floor area is within legal bounds per API
        if (TypeRules._int(value, 1, 25000) === null) {
            let combinedAreaCheck = this._check_combined_area(_homeValues);
            //Check that floor area is not greater than roof area
            if (!combinedAreaCheck) {
                let combinedFloorArea = this._get_combined_floor_area(_homeValues);
                let checkConditionedAreas = this._check_conditioned_areas(combinedFloorArea, "Floor area", _homeValues);
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
    },

    foundation_type_1: function(value, _homeValues) {
        return this._foundation_type(value, _homeValues);
    },
    foundation_type_2: function(value, _homeValues) {
        return this._foundation_type(value, _homeValues);
    },
    _foundation_type: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, foundationType), BLOCKER);
    },

    foundation_insulation_level_1: function(value, _homeValues) {
        return this._foundation_insulation_level(value, _homeValues);
    },
    foundation_insulation_level_2: function(value, _homeValues) {
        return this._foundation_insulation_level(value, _homeValues);
    },
    _foundation_insulation_level: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 0, 19), BLOCKER);
    },

    floor_assembly_code_1: function(value, _homeValues) {
        return this._floor_assembly_code(value, _homeValues);
    },
    floor_assembly_code_2: function(value, _homeValues) {
        return this._floor_assembly_code(value, _homeValues);
    },
    _floor_assembly_code: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, floorAssemblyCode), BLOCKER);
    },

    /*
     * zone_skylight
     */
    skylight_area: function(value, _homeValues) {
        if(parseInt(value, _homeValues) !== 0) {
            if(_homeValues.conditioned_floor_area === '') {
                return new Validation("Cannot validate the Skylight Area without Conditioned Floor Area and Stories above ground level", ERROR);
            }
            let footprintArea = this._get_footprint_area(_homeValues);
            //Skylights have API max of 300
            if(footprintArea > 300) {
                footprintArea = 300;
            }
            return new Validation(TypeRules._float(value, 0, footprintArea), BLOCKER);
        }
    },
    skylight_method: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, ['code', 'custom']), BLOCKER);
    },
    skylight_code: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, windowAndSkylightCode, BLOCKER));
    },
    skylight_u_value: function(value, _homeValues) {
        return new Validation(TypeRules._float(value, 0.01, 5), BLOCKER);
    },
    skylight_shgc: function(value, _homeValues) {
        return new Validation(TypeRules._float(value, 0, 1), BLOCKER);
    },

    skylight_area_2: function(value, _homeValues) {
        if(parseInt(value, _homeValues) !== 0) {
            if(_homeValues.conditioned_floor_area === '') {
                return new Validation("Cannot validate the Skylight Area without Conditioned Floor Area and Stories above ground level", ERROR);
            }
            let footprintArea = this._get_footprint_area(_homeValues);
            //Skylights have API max of 300
            if(footprintArea > 300) {
                footprintArea = 300;
            }
            return new Validation(TypeRules._int(value, 0, footprintArea), BLOCKER);
        }
    },
    skylight_method_2: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, ['code', 'custom']), BLOCKER);
    },
    skylight_code_2: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, windowAndSkylightCode, BLOCKER));
    },
    skylight_u_value_2: function(value, _homeValues) {
        return new Validation(TypeRules._float(value, 0.01, 5), BLOCKER);
    },
    skylight_shgc_2: function(value, _homeValues) {
        return new Validation(TypeRules._float(value, 0, 1), BLOCKER);
    },
    /*
     * zone_window
     */
    window_area_front: function(value, _homeValues) {
        let wall_area = this._get_wall_area(_homeValues);
        //return TypeRules._int(value, 10, wall_area); TODO: Make this an ignorable warning
        return new Validation(TypeRules._float(value, 0, wall_area), ERROR);
    },
    window_area_back: function(value, _homeValues) {
        return this._window_area(value, false);
    },
    window_area_right: function(value, _homeValues) {
        return this._window_area(value, false);
    },
    window_area_left: function(value, _homeValues) {
        return this._window_area(value, false);
    },
    _window_area: function(value, isFront, _homeValues) {
        let wall_area = this._get_wall_area(_homeValues);
        if (wall_area) {
            //Windows have API max area of 999
            //TODO: Clarify that this really should be the maximum (documentation has less than calculated wall area)
            if (wall_area > 999) {
                wall_area = 999;
            }
            return new Validation(TypeRules._float(value, 0, wall_area), BLOCKER);
        } else {
            return new Validation("Must enter Conditioned floor area, Interior floor-to-ceiling height, and stories above ground level", ERROR);
        }
    },

    window_method_front: function(value, _homeValues) {
        return this._window_method(value, _homeValues);
    },
    window_method_back: function(value, _homeValues) {
        return this._window_method(value, _homeValues);
    },
    window_method_right: function(value, _homeValues) {
        return this._window_method(value, _homeValues);
    },
    window_method_left: function(value, _homeValues) {
        return this._window_method(value, _homeValues);
    },
    _window_method: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, ['code', 'custom']), BLOCKER);
    },

    window_code_front: function(value, _homeValues) {
        return this._window_code(value, _homeValues);
    },
    window_code_back: function(value, _homeValues) {
        return this._window_code(value, _homeValues);
    },
    window_code_right: function(value, _homeValues) {
        return this._window_code(value, _homeValues);
    },
    window_code_left: function(value, _homeValues) {
        return this._window_code(value, _homeValues);
    },
    _window_code: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, windowAndSkylightCode), BLOCKER);
    },

    window_u_value_front: function(value, _homeValues) {
        return this._window_u_value(value, _homeValues);
    },
    window_u_value_back: function(value, _homeValues) {
        return this._window_u_value(value, _homeValues);
    },
    window_u_value_right: function(value, _homeValues) {
        return this._window_u_value(value, _homeValues);
    },
    window_u_value_left: function(value, _homeValues) {
        return this._window_u_value(value, _homeValues);
    },
    _window_u_value: function(value, _homeValues) {
        return new Validation(TypeRules._float(value, 0.01, 5), BLOCKER);
    },

    window_shgc_front: function(value, _homeValues) {
        return this._window_shgc(value, _homeValues);
    },
    window_shgc_back: function(value, _homeValues) {
        return this._window_shgc(value, _homeValues);
    },
    window_shgc_right: function(value, _homeValues) {
        return this._window_shgc(value, _homeValues);
    },
    window_shgc_left: function(value, _homeValues) {
        return this._window_shgc(value, _homeValues);
    },
    _window_shgc: function(value, _homeValues) {
        return new Validation(TypeRules._float(value, 0, 1), BLOCKER);
    },

    /*
     * zone_wall
     */
    wall_assembly_code_front: function(value, _homeValues) {
        return this._wall_assembly_code(value, _homeValues);
    },
    wall_assembly_code_back: function(value, _homeValues) {
        return this._wall_assembly_code(value, _homeValues);
    },
    wall_assembly_code_right: function(value, _homeValues) {
        return this._wall_assembly_code(value, _homeValues);
    },
    wall_assembly_code_left: function(value, _homeValues) {
        return this._wall_assembly_code(value, _homeValues);
    },
    _wall_assembly_code: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, wallAssemblyCode), BLOCKER);
    },

    /*
     * hvac
     */
    hvac_fraction_1: function(value, _homeValues) {
        return this._hvac_fraction();
    },
    hvac_fraction_2: function(value, _homeValues) {
        return this._hvac_fraction();
    },
    _hvac_fraction: function() {
        return new Validation(TypeRules._fraction(parseFloat(_homeValues.hvac_fraction_1) + parseFloat(_homeValues.hvac_fraction_2)), BLOCKER);
    },

    /*
     * hvac_heating
     */
    heating_type_1: function(value, _homeValues) {
        return this._heating_type(value, _homeValues);
    },
    heating_type_2: function(value, _homeValues) {
        return this._heating_type(value, _homeValues);
    },
    _heating_type: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 100, heatingTypeOptions), BLOCKER);
    },
    heating_fuel_1: function(value, _homeValues) {
        return this._heating_fuel(value, _homeValues);
    },
    heating_fuel_2: function(value, _homeValues) {
        return this._heating_fuel(value, _homeValues);
    },
    _heating_fuel: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 100, heatingFuelOptions), BLOCKER);
    },

    heating_efficiency_method_1: function(value, _homeValues) {
        return this._heating_efficiency_method(value, _homeValues);
    },
    heating_efficiency_method_2: function(value, _homeValues) {
        return this._heating_efficiency_method(value, _homeValues);
    },
    _heating_efficiency_method: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, ['user', 'shipment_weighted']), BLOCKER);
    },

    heating_year_1: function(value, _homeValues) {
        return this._heating_year(value, _homeValues);
    },
    heating_year_2: function(value, _homeValues) {
        return this._heating_year(value, _homeValues);
    },
    _heating_year: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, parseInt(_homeValues.year_built), (new Date()).getFullYear()), BLOCKER);
    },

    heating_efficiency_1: function(value, _homeValues) {
        return this._heating_efficiency(_homeValues.heating_type_1, value);
    },
    heating_efficiency_2: function(value, _homeValues) {
        return this._heating_efficiency(_homeValues.heating_type_2, value);
    },
    _heating_efficiency: function(type, value) {
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
    },

    /*
     * hvac_cooling
     */
    cooling_type_1: function(value, _homeValues) {
        return this._cooling_type(value, _homeValues);
    },
    cooling_type_2: function(value, _homeValues) {
        return this._cooling_type(value, _homeValues);
    },
    _cooling_type: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 100, coolingTypeOptions), BLOCKER);
    },

    cooling_efficiency_method_1: function(value, _homeValues) {
        return this._cooling_efficiency_method(value, _homeValues);
    },
    cooling_efficiency_method_2: function(value, _homeValues) {
        return this._cooling_efficiency_method(value, _homeValues);
    },
    _cooling_efficiency_method: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, ['user', 'shipment_weighted']), BLOCKER);
    },

    cooling_year_1: function(value, _homeValues) {
        return this._cooling_year(value, _homeValues);
    },
    cooling_year_2: function(value, _homeValues) {
        return this._cooling_year(value, _homeValues);
    },
    _cooling_year: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, parseInt(_homeValues.year_built), (new Date()).getFullYear()), BLOCKER);
    },

    cooling_efficiency_1: function(value, _homeValues) {
        return this._cooling_efficiency(value, _homeValues);
    },
    cooling_efficiency_2: function(value, _homeValues) {
        return this._cooling_efficiency(value, _homeValues);
    },
    _cooling_efficiency: function(value, _homeValues) {
        return new Validation(TypeRules._float(value, 8, 40), BLOCKER);
    },

    /*
     * hvac_distribution
     */
    duct_location_1_1: function(value, _homeValues) {
        return this._duct_location(value, _homeValues);
    },
    duct_location_2_1: function(value, _homeValues) {
        return this._duct_location(value, _homeValues);
    },
    duct_location_3_1: function(value, _homeValues) {
        return this._duct_location(value, _homeValues);
    },
    duct_location_1_2: function(value, _homeValues) {
        return this._duct_location(value, _homeValues);
    },
    duct_location_2_2: function(value, _homeValues) {
        return this._duct_location(value, _homeValues);
    },
    duct_location_3_2: function(value, _homeValues) {
        return this._duct_location(value, _homeValues);
    },
    _duct_location: function(value, _homeValues) {
        if (ductType.indexOf(value, _homeValues) > -1) {
            let ductTypes = ['cond_space'];
            let roofTypes = [_homeValues.roof_type_1, _homeValues.roof_type_2, ];
            let foundTypes = [_homeValues.foundation_type_1, _homeValues.foundation_type_2];
            roofTypes.forEach(function(type) {
                if (type === 'vented_attic') {
                    ductTypes.push('uncond_attic');
                }
            });
            foundTypes.forEach(function(type) {
                if (type === 'uncond_basement' || type === 'unvented_crawl' || type === 'vented_crawl') {
                    ductTypes.push(type);
                }
            });
            if (ductType.indexOf(value, _homeValues) === -1) {
                return new Validation(value + ' was defined for this duct location, but the home definition does not contain any such space.', ERROR);
            }
        } else {
            return new Validation(TypeRules._string(value, 20, ductType), BLOCKER);
        }
    },

    duct_fraction_1_1: function(value, _homeValues) {
        return this._duct_fraction('1');
    },
    duct_fraction_2_1: function(value, _homeValues) {
        return this._duct_fraction('1');
    },
    duct_fraction_3_1: function(value, _homeValues) {
        return this._duct_fraction('1');
    },
    duct_fraction_1_2: function(value, _homeValues) {
        return this._duct_fraction('2');
    },
    duct_fraction_2_2: function(value, _homeValues) {
        return this._duct_fraction('2');
    },
    duct_fraction_3_2: function(value, _homeValues) {
        return this._duct_fraction('2');
    },
    _duct_fraction: function(c) {
        if (c === '1') {
            return new Validation(TypeRules._percent((parseInt(_homeValues.duct_fraction_1_1) || 0) + (parseInt(_homeValues.duct_fraction_2_1) || 0) + (parseInt(_homeValues.duct_fraction_3_1) || 0)), BLOCKER);
        } else if (c === '2') {
            return new Validation(TypeRules._percent((parseInt(_homeValues.duct_fraction_1_2) || 0) + (parseInt(_homeValues.duct_fraction_2_2) || 0) + (parseInt(_homeValues.duct_fraction_3_2) || 0)), BLOCKER);
        } else {
            throw new Error("Unexpected duct " + c);
        }
    },

    duct_insulated_1_1: function(value, _homeValues) {
        return this._duct_insulated(value, _homeValues);
    },
    duct_insulated_2_1: function(value, _homeValues) {
        return this._duct_insulated(value, _homeValues);
    },
    duct_insulated_3_1: function(value, _homeValues) {
        return this._duct_insulated(value, _homeValues);
    },
    duct_insulated_1_2: function(value, _homeValues) {
        return this._duct_insulated(value, _homeValues);
    },
    duct_insulated_2_2: function(value, _homeValues) {
        return this._duct_insulated(value, _homeValues);
    },
    duct_insulated_3_2: function(value, _homeValues) {
        return this._duct_insulated(value, _homeValues);
    },
    _duct_insulated: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },

    duct_sealed_1_1: function(value, _homeValues) {
        return this._duct_sealed(value, _homeValues);
    },
    duct_sealed_2_1: function(value, _homeValues) {
        return this._duct_sealed(value, _homeValues);
    },
    duct_sealed_3_1: function(value, _homeValues) {
        return this._duct_sealed(value, _homeValues);
    },
    duct_sealed_1_2: function(value, _homeValues) {
        return this._duct_sealed(value, _homeValues);
    },
    duct_sealed_2_2: function(value, _homeValues) {
        return this._duct_sealed(value, _homeValues);
    },
    duct_sealed_3_2: function(value, _homeValues) {
        return this._duct_sealed(value, _homeValues);
    },
    _duct_sealed: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },

    /*
     * systems_hot_water
     */
    hot_water_type: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, hotWaterType), BLOCKER);
    },
    hot_water_fuel: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, hotWaterFuel), BLOCKER);
    },
    hot_water_efficiency_method: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, ['user', 'shipment_weighted']), BLOCKER);
    },
    hot_water_year: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, parseInt(_homeValues.year_built), (new Date()).getFullYear()), BLOCKER);
    },
    hot_water_energy_factor(value, _homeValues) {
        let min, max;

        if (_homeValues.hot_water_type === 'storage') {
            [min, max] = [0.45, 1.0];
        } else if (_homeValues.hot_water_type === 'heat_pump') {
            [min, max] = [1, 4];
        }

        return new Validation(TypeRules._float(value, min, max), BLOCKER);
    },

    /*
     * systems_solar_electric
     */
    solar_electric_capacity_known: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    solar_electric_system_capacity: function(value, _homeValues) {
        return new Validation(TypeRules._float(value, 0.05, 100), BLOCKER);
    },
    solar_electric_num_panels: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 1, 100), BLOCKER);
    },
    solar_electric_year: function(value, _homeValues) {
        return new Validation(TypeRules._int(value, 2000, (new Date()).getFullYear()), BLOCKER);
    },
    solar_electric_array_azimuth: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, 20, orientationArray), BLOCKER);
    },

    /*
     * HPwES
     */
    improvement_installation_start_date: function(value, _homeValues) {
        return new Validation(TypeRules._date(value, _homeValues), ERROR);
    },
    improvement_installation_completion_date: function(value, _homeValues) {
        return new Validation(TypeRules._date(value, _homeValues), ERROR);
    },
    contractor_business_name: function(value, _homeValues) {
        return new Validation(TypeRules._string(value, _homeValues), ERROR);
    },
    contractor_zip_code: function(value, _homeValues) {
        return new Validation(TypeRules._zip(value, _homeValues), ERROR);
    },
    is_income_eligible_program: function(value, _homeValues) {
        return new Validation(TypeRules._bool(value, _homeValues), ERROR);
    },

/*
 * CONDITION FUNCTIONS
 ***********************
 */

    /*
     * Gets footprint area for skylight area validations
     */
    _get_footprint_area: function(_homeValues) {
        if (_homeValues.conditioned_floor_area === '') {
            return false;
        }
        return parseInt(parseInt(_homeValues.conditioned_floor_area) / parseInt(_homeValues.num_floor_above_grade));
    },

    /*
     * Get combined floor area
     */
    _get_combined_floor_area: function(_homeValues) {
        return TypeRules._int_or_zero(_homeValues.floor_area_1) + TypeRules._int_or_zero(_homeValues.floor_area_2);
    },

    /*
     * Get combined roof area
     */
    _get_combined_roof_area: function(_homeValues) {
        return TypeRules._int_or_zero(_homeValues.roof_area_1) + TypeRules._int_or_zero(_homeValues.roof_area_2);
    },

    /*
     * Gets wall length for window area validations
     */
    _get_wall_length: function(_homeValues) {
        let area = this._get_footprint_area(_homeValues);
        if (area) {
            //Assume floor dimensions area 5x3
            return parseInt((Math.sqrt((3 * area) / 5)) * (5 / 3));
        } else {
            return false;
        }
    },

    /*
     * Gets wall area for window area validations
     */
    _get_wall_area: function(_homeValues) {
        let length = this._get_wall_length(_homeValues);
        let height = parseInt(_homeValues.floor_to_ceiling_height) || false;
        let stories = parseInt(_homeValues.num_floor_above_grade) || false;
        if (length && height && stories) {
            return parseInt((length * height - 20) * stories);
        } else {
            return false;
        }
    },

    /*
     * Checks that the combined roof_area is not less than the combined floor_area
     */
    _check_combined_area: function(_homeValues) {
        let combinedRoofArea = this._get_combined_roof_area(_homeValues);
        let combinedFloorArea = this._get_combined_floor_area(_homeValues);
        if (combinedRoofArea < combinedFloorArea * .95) { // Allow 5% error
            return "The roof does not cover the floor";
        } else {
            return false;
        }
    },

    /*
     * Checks that the roof_area and floor_areas are consistent with conditioned footprint areas
     */
    _check_conditioned_areas: function(combinedArea, thisAreaType, _homeValues) {
        let footprintArea = TypeRules._int_or_zero(_homeValues.conditioned_floor_area);
        if (_homeValues.foundation_type_1 === 'cond_basement') {
            footprintArea = footprintArea - TypeRules._int_or_zero(_homeValues.floor_area_1);
        }
        if (_homeValues.foundation_type_2 === 'cond_basement') {
            footprintArea = footprintArea - TypeRules._int_or_zero(_homeValues.floor_area_2);
        }
        if (TypeRules._int_or_zero(_homeValues.num_floor_above_grade) === 0) {
            return thisAreaType + " is internally inconsistent with conditioned floor area and number of conditioned floors"
        } else {
            footprintArea = footprintArea / TypeRules._int_or_zero(_homeValues.num_floor_above_grade);
            if (footprintArea < combinedArea * .95) { // Allow 5% error
                return thisAreaType + " is internally inconsistent with conditioned floor area and number of conditioned floors"
            }
        }
    }
};

module.exports = validationRules;
