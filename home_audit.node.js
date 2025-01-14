/**
 * home_audit.node.js - Defines the validation functions used to validate a home audit for the HES GUI.
 */

let TypeRules = require('./type_rules.node');
let Validation = require('./validation.node');

let _homeValues;

const BLOCKER = 'blocker';
const ERROR = 'error';
const MANDATORY = 'mandatory';

const HEATING = 'Heating';
const COOLING = 'Cooling';

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

const tiltArray = [
    'flat',
    'low_slope',
    'medium_slope',
    'steep_slope',
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
    'rfwf03co',
    'rfwf03wo',
    'rfwf03rc',
    'rfwf03lc',
    'rfwf03tg',
    'rfwf07co',
    'rfwf07wo',
    'rfwf07rc',
    'rfwf07lc',
    'rfwf07tg',
    'rfwf25co',
    'rfwf25wo',
    'rfwf25rc',
    'rfwf25lc',
    'rfwf25tg',
    'rfps03co',
    'rfps03wo',
    'rfps03rc',
    'rfps03lc',
    'rfps03tg',
    'rfps07co',
    'rfps07wo',
    'rfps07rc',
    'rfps07lc',
    'rfps07tg'
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
    'cath_ceiling'
];
const ceilingAssemblyCode = [
    'ecwf00',
    'ecwf03',
    'ecwf06',
    'ecwf09',
    'ecwf11',
    'ecwf13',
    'ecwf15',
    'ecwf19',
    'ecwf21',
    'ecwf25',
    'ecwf30',
    'ecwf35',
    'ecwf38',
    'ecwf44',
    'ecwf49',
    'ecwf55',
    'ecwf60'
];

const kneeWallAssemblyCodes = [
    'kwwf00',
    'kwwf03',
    'kwwf07',
    'kwwf11',
    'kwwf13',
    'kwwf15',
    'kwwf19',
    'kwwf21',
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
    'efwf03ca',
    'efwf07ca',
    'efwf11ca',
    'efwf13ca',
    'efwf15ca',
    'efwf19ca',
    'efwf21ca',
    'efwf25ca',
    'efwf30ca',
    'efwf35ca',
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
    'ewov25wo',
    'ewov35wo',
    'ewov25st',
    'ewov35st',
    'ewov25vi',
    'ewov35vi',
    'ewov25al',
    'ewov35al',
    'ewov25br',
    'ewov35br'
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

const furnaceAndBoiler = [
    'central_furnace',
    'wall_furnace',
    'boiler'
];

const heatingFuelToType = {
    'natural_gas': furnaceAndBoiler,
    'lpg': furnaceAndBoiler,
    'fuel_oil': furnaceAndBoiler,
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
    'unvented_crawl',
    'under_slab',
    'exterior_wall',
    'outside'
];

const ductType_alwaysValid = [
    'cond_space',
    'under_slab',
    'exterior_wall',
    'outside'
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
    'tankless_coil',
    'tankless'
];

/***************
 * VALIDATIONS *
 ***************/

/**
 * Each validation rule has the same name as the "name" attribute of the associated form input.
 * Each rule is a function that takes the following parameter:
 * @param {string} value The value of the field
 */

let validationRules = {

    /*
     * building
     */
    building_id: function(value) {
        return new Validation(TypeRules._int(value), ERROR);
    },
    assessor_id: function(value) {
        return new Validation(TypeRules._string(value), ERROR);
    },

    /*
     * address_validate
     */
    address: function(value) {
        return new Validation(TypeRules._string(value), ERROR);
    },
    city: function(value) {
        return new Validation(TypeRules._string(value), ERROR);
    },
    state: function(value) {
        return new Validation(TypeRules._string(value, 2, stateArray), ERROR);
    },
    zip_code: function(value) {
        return new Validation(TypeRules._zip(value), ERROR);
    },
    assessment_type: function(value) {
        return new Validation(TypeRules._string(value, 20, assessmentTypes), BLOCKER);
    },
    external_building_id: function(value) {
        return new Validation(TypeRules._string(value), ERROR);
    },

    /*
     * about
     */
    assessment_date: function(value) {
        return new Validation(TypeRules._date(value, Date.parse('2010-01-01'), Date.now()), BLOCKER);
    },
    comments: function(value) {
        return new Validation(TypeRules._string(value, 512), BLOCKER);
    },
    //The following two functions are associated with current Walls page
    shape: function(value) {
        return new Validation(TypeRules._string(value, 20, ['rectangle', 'town_house']), BLOCKER);
    },
    town_house_walls: function(value) {
        return new Validation(TypeRules._string(value, 20, ['back_front', 'back_right_front', 'back_front_left']), BLOCKER);
    },
    year_built: function(value) {
        return new Validation(TypeRules._int(value, 1600, (new Date()).getFullYear()), BLOCKER);
    },
    number_bedrooms: function(value) {
        return new Validation(TypeRules._int(value, 1, 10), BLOCKER);
    },
    num_floor_above_grade: function(value) {
        return new Validation(TypeRules._int(value, 1, 4), BLOCKER);
    },
    floor_to_ceiling_height: function(value) {
        return new Validation(TypeRules._int(value, 6, 12), BLOCKER);
    },
    conditioned_floor_area: function(value) {
        const checkFootprint = this._check_footprint();
        if(checkFootprint) {
            return new Validation(checkFootprint, BLOCKER);
        }
        return new Validation(TypeRules._int(value, 250, 25000), BLOCKER);
    },
    orientation: function(value) {
        return new Validation(TypeRules._string(value, 20, orientationArray), BLOCKER);
    },
    blower_door_test: function(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    air_sealing_present: function(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    envelope_leakage: function(value) {
        return new Validation(TypeRules._int(value, 0, 25000, false), BLOCKER);
    },

    /*
     * zone
     */
    wall_construction_same: function(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    window_construction_same: function(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    /*
     * zone_roof
     */
    roof_type_1: function(value) {
      return this._roof_type(value);
    },
    roof_type_2: function(value) {
        return this._roof_type(value);
    },
    _roof_type: function(value) {
        return new Validation(TypeRules._string(value, 20, roofType), BLOCKER);
    },

    roof_area_1: function(value) {
        return this._roof_area(value, '1');
    },
    roof_area_2: function(value) {
        return this._roof_area(value, '2');
    },
    _roof_area: function(value, num) {
        if(_homeValues['roof_type_'+ num] === 'cath_ceiling') {
            //Check that roof area is within legal bounds per API
            const constraintsError = TypeRules._float(value, 4, 25000);
            if (constraintsError === undefined) {
                let combinedAreaCheck = this._check_combined_area();
                //Check that roof area is not less than floor area
                if (!combinedAreaCheck) {
                    let combinedRoofArea = this._get_combined_roof_ceiling_area();
                    let checkConditionedAreas = this._check_conditioned_areas(combinedRoofArea, "roof");
                    //Check that combined areas are consistent with conditioned floor areas
                    if (checkConditionedAreas) {
                        return new Validation(checkConditionedAreas, ERROR);
                    }
                } else {
                    return new Validation(combinedAreaCheck, ERROR);
                }
            } else {
                //This is a blocker case and will prevent saving
                return new Validation(constraintsError, BLOCKER);
            }
        }
    },
    ceiling_area_1: function(value) {
        return this._ceiling_area(value, '1');
    },
    ceiling_area_2: function(value) {
        return this._ceiling_area(value, '2');
    },
    _ceiling_area: function(value, num) {
        if(_homeValues['roof_type_'+ num] === 'vented_attic') {
            //Check that roof area is within legal bounds per API
            const constraintsError = TypeRules._float(value, 4, 25000);
            if (constraintsError === undefined) {
                let combinedAreaCheck = this._check_combined_area();
                //Check that roof area is not less than floor area
                if (!combinedAreaCheck) {
                    let combinedRoofArea = this._get_combined_roof_ceiling_area();
                    let checkConditionedAreas = this._check_conditioned_areas(combinedRoofArea, "ceiling");
                    //Check that combined areas are consistent with conditioned floor areas
                    if (checkConditionedAreas) {
                        return new Validation(checkConditionedAreas, ERROR);
                    }
                } else {
                    return new Validation(combinedAreaCheck, ERROR);
                }
            } else {
                //This is a blocker case and will prevent saving
                return new Validation(constraintsError, BLOCKER);
            }
        }
    },
    roof_assembly_code_1: function(value) {
        return this._roof_assembly_code(value);
    },
    roof_assembly_code_2: function(value) {
        return this._roof_assembly_code(value);
    },
    _roof_assembly_code: function(value) {
        return new Validation(TypeRules._string(value, 20, roofAssemblyCode), BLOCKER);
    },

    roof_color_1: function(value) {
        return this._roof_color(value);
    },
    roof_color_2: function(value) {
        return this._roof_color(value);
    },
    _roof_color: function(value) {
        return new Validation(TypeRules._string(value, 20, roofColor), BLOCKER);
    },

    roof_absorptance_1: function(value) {
        return this._roof_absorptance(value);
    },
    roof_absorptance_2: function(value) {
        return this._roof_absorptance(value);
    },
    _roof_absorptance: function(value) {
        return new Validation(TypeRules._float(value, 0, 1), BLOCKER);
    },

    ceiling_assembly_code_1: function(value) {
        return this._ceiling_assembly_code(value);
    },
    ceiling_assembly_code_2: function(value) {
        return this._ceiling_assembly_code(value);
    },
    _ceiling_assembly_code: function(value) {
        return new Validation(TypeRules._string(value, 20, ceilingAssemblyCode), BLOCKER);
    },

    knee_wall_area_1: function(value) {
        return this._knee_wall_area(value);
    },
    knee_wall_area_2: function(value) {
        return this._knee_wall_area(value);
    },
    _knee_wall_area: function(value) {
        const constraintsError = TypeRules._float(value, 4, 5000);
        if (constraintsError === undefined) {
            let footprintArea = this._get_footprint_area();
            let max_knee_wall_area = 2*footprintArea/3;
            let knee_wall_area = TypeRules._int_or_zero(_homeValues['knee_wall_area_1']) + TypeRules._int_or_zero(_homeValues['knee_wall_area_2']);
            if(knee_wall_area > max_knee_wall_area){
                return new Validation( `Total knee wall area exceeds the maximum allowed ${Math.ceil(max_knee_wall_area)} sqft (2/3 the footprint area).`, ERROR);
            }
        } else {
            return new Validation(constraintsError, BLOCKER);
        }
    },

    knee_wall_assembly_code_1: function(value) {
        return this._knee_wall_assembly_code(value);
    },
    knee_wall_assembly_code_2: function(value) {
        return this._knee_wall_assembly_code(value);
    },
    _knee_wall_assembly_code: function(value) {
        return new Validation(TypeRules._string(value, 10, kneeWallAssemblyCodes), BLOCKER);
    },

    /*
     * zone_floor
     */
    floor_area_1: function(value) {
        return this._floor_area(value);
    },
    floor_area_2: function(value) {
        return this._floor_area(value);
    },
    _floor_area: function(value) {
        //Check that floor area is within legal bounds per API
        const constraintsError = TypeRules._float(value, 4, 25000);
        if (constraintsError === undefined) {
            let combinedAreaCheck = this._check_combined_area();
            //Check that floor area is not greater than roof area
            if (!combinedAreaCheck) {
                let combinedFloorArea = this._get_combined_floor_area();
                let checkConditionedAreas = this._check_conditioned_areas(combinedFloorArea, "floor");
                //Check that combined areas are consistent with conditioned floor areas
                if (checkConditionedAreas) {
                    return new Validation(checkConditionedAreas, ERROR);
                }
            } else {
                return new Validation(combinedAreaCheck, ERROR);
            }
        } else {
            const checkFootprint = this._check_footprint();
            if(checkFootprint) {
                return new Validation(checkFootprint, BLOCKER);
            }
            //This is a blocker case and will prevent saving
            return new Validation(constraintsError, BLOCKER);
        }
    },

    foundation_type_1: function(value) {
        return this._foundation_type(value);
    },
    foundation_type_2: function(value) {
        return this._foundation_type(value);
    },
    _foundation_type: function(value) {
        return new Validation(TypeRules._string(value, 20, foundationType), BLOCKER);
    },

    foundation_insulation_level_1: function(value) {
        return this._foundation_insulation_level(value, 1);
    },
    foundation_insulation_level_2: function(value) {
        return this._foundation_insulation_level(value, 2);
    },
    _foundation_insulation_level: function(value, num) {
        const outsideApiBounds = TypeRules._int(value, 0, 19);
        if(outsideApiBounds) {
            return new Validation(outsideApiBounds, BLOCKER);
        } else if(_homeValues['foundation_type_'+num] === 'slab_on_grade') {
            if([0, 5].indexOf(parseInt(value)) === -1) {
                return new Validation('Insulation must be R-0 or R-5 for Slab on Grade Foundation', ERROR);
            }
        } else {
            if([0, 11, 19].indexOf(parseInt(value)) === -1) {
                return new Validation('Insulation must be R-0, R-11, or R-19 for current foundation type', ERROR);
            }
        }
    },

    floor_assembly_code_1: function(value) {
        return this._floor_assembly_code(value);
    },
    floor_assembly_code_2: function(value) {
        return this._floor_assembly_code(value);
    },
    _floor_assembly_code: function(value) {
        return new Validation(TypeRules._string(value, 20, floorAssemblyCode), BLOCKER);
    },

    /*
     * zone_skylight
     */
    skylight_area: function(value) {
        let footprintArea = this._get_footprint_area();
        if(value > 300 || value < 0) {
            //Skylights have API max of 300
            return new Validation(TypeRules._float(value, 0, 300), BLOCKER);
        }
        if(footprintArea) {
            return new Validation(TypeRules._float(value, 0, footprintArea), BLOCKER);
        }
    },
    skylight_solar_screen: function(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    skylight_method: function(value) {
        return new Validation(TypeRules._string(value, 20, ['code', 'custom']), BLOCKER);
    },
    skylight_code: function(value) {
        return new Validation(TypeRules._string(value, 20, windowAndSkylightCode), BLOCKER);
    },
    skylight_u_value: function(value) {
        return new Validation(TypeRules._float(value, 0.01, 5), BLOCKER);
    },
    skylight_shgc: function(value) {
        return new Validation(TypeRules._float(value, 0, 1, false), BLOCKER);
    },

    skylight_area_2: function(value) {
        return this.skylight_area(value);
    },
    skylight_method_2: function(value) {
        return new Validation(TypeRules._string(value, 20, ['code', 'custom']), BLOCKER);
    },
    skylight_code_2: function(value) {
        return new Validation(TypeRules._string(value, 20, windowAndSkylightCode), BLOCKER);
    },
    skylight_u_value_2: function(value) {
        return new Validation(TypeRules._float(value, 0.01, 5), BLOCKER);
    },
    skylight_shgc_2: function(value) {
        return new Validation(TypeRules._float(value, 0, 1, false), BLOCKER);
    },
    /*
     * zone_window
     */
    window_solar_screen_front: function(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    window_solar_screen_back: function(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    window_solar_screen_right: function(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    window_solar_screen_left: function(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    window_area_front: function(value) {
        let wallArea = this._get_wall_area_front_back();
        return this._window_area(value, wallArea, 'front');
    },
    window_area_back: function(value) {
        let wallArea = this._get_wall_area_front_back();
        return this._window_area(value, wallArea, 'back');
    },
    window_area_right: function(value) {
        let wallArea = this._get_wall_area_left_right();
        return this._window_area(value, wallArea, 'right');
    },
    window_area_left: function(value) {
        let wallArea = this._get_wall_area_left_right();
        return this._window_area(value, wallArea, 'left');
    },
    _window_area: function(value, wallArea, side) {
        if (value > 999 || value < 0) {
            //Windows have API max area of 999
            return this._get_wall_validation(value, side, new Validation(TypeRules._float(value, 0, 999), BLOCKER));
        }

        const invalidWall = this._is_valid_wall_side(value, side);
        if (invalidWall && invalidWall['message']) {
            return invalidWall;
        }

        if (wallArea) {
            // NOTE: While the XSD def is inclusive, the wall area check is exclusive.
            // For this reason, We also set min to -1 so zero is always valid
            return this._get_wall_validation(value, side, new Validation(TypeRules._float(value, -1, wallArea, false), BLOCKER));
        }
    },

    window_method_front: function(value) {
        return this._window_method(value, 'front');
    },
    window_method_back: function(value) {
        return this._window_method(value, 'back');
    },
    window_method_right: function(value) {
        return this._window_method(value, 'right');
    },
    window_method_left: function(value) {
        return this._window_method(value, 'left');
    },
    _window_method: function(value, side) {
        return this._get_wall_validation(value, side, new Validation(TypeRules._string(value, 20, ['code', 'custom']), BLOCKER));
    },

    window_code_front: function(value) {
        return this._window_code(value, 'front');
    },
    window_code_back: function(value) {
        return this._window_code(value, 'back');
    },
    window_code_right: function(value) {
        return this._window_code(value, 'right');
    },
    window_code_left: function(value) {
        return this._window_code(value, 'left');
    },
    _window_code: function(value, side) {
        return this._get_wall_validation(value, side, new Validation(TypeRules._string(value, 20, windowAndSkylightCode), BLOCKER));
    },

    window_u_value_front: function(value) {
        return this._window_u_value(value, 'front');
    },
    window_u_value_back: function(value) {
        return this._window_u_value(value, 'back');
    },
    window_u_value_right: function(value) {
        return this._window_u_value(value, 'right');
    },
    window_u_value_left: function(value) {
        return this._window_u_value(value, 'left');
    },
    _window_u_value: function(value, side) {
        return this._get_wall_validation(value, side, new Validation(TypeRules._float(value, 0.01, 5), BLOCKER));
    },

    window_shgc_front: function(value) {
        return this._window_shgc(value, 'front');
    },
    window_shgc_back: function(value) {
        return this._window_shgc(value, 'back');
    },
    window_shgc_right: function(value) {
        return this._window_shgc(value, 'right');
    },
    window_shgc_left: function(value) {
        return this._window_shgc(value, 'left');
    },
    _window_shgc: function(value, side) {
        return this._get_wall_validation(value, side, new Validation(TypeRules._float(value, 0, 1, false), BLOCKER));
    },

    /*
     * zone_wall
     */
    wall_assembly_code_front: function(value) {
        return this._wall_assembly_code(value, 'front');
    },
    wall_assembly_code_back: function(value) {
        return this._wall_assembly_code(value, 'back');
    },
    wall_assembly_code_right: function(value) {
        return this._wall_assembly_code(value, 'right');
    },
    wall_assembly_code_left: function(value) {
        return this._wall_assembly_code(value, 'left');
    },
    _wall_assembly_code: function(value, side) {
        return this._get_wall_validation(value, side, new Validation(TypeRules._string(value, 20, wallAssemblyCode), BLOCKER));
    },

    /*
     * hvac
     */
    hvac_fraction_1: function(value) {
        return this._hvac_fraction(value);
    },
    hvac_fraction_2: function(value) {
        return this._hvac_fraction(value);
    },
    _hvac_fraction: function(value) {
        const fraction1 = _homeValues.hvac_fraction_1 ? parseFloat(_homeValues.hvac_fraction_1) : 0;
        const fraction2 = _homeValues.hvac_fraction_2 ? parseFloat(_homeValues.hvac_fraction_2) : 0;
        const fullPercentCheck = TypeRules._fraction(fraction1 + fraction2);
        if(fullPercentCheck) {
            return new Validation(fullPercentCheck, BLOCKER);
        } else if(TypeRules._float(value, 0, 1)) {
            return new Validation('Value must be between 0 and 100%', ERROR);
        }
    },

    /*
     * hvac_heating
     */
    _heating_and_cooling_types: function(value, num, heatingOrCooling) {
        const oppSystem = heatingOrCooling === HEATING ? COOLING : HEATING;
        const validTypeOptions = heatingOrCooling === HEATING ? heatingTypeOptions : coolingTypeOptions;
        const blocker = new Validation(TypeRules._string(value, 100, validTypeOptions), BLOCKER);
        if(!blocker['message']) {
            const currLower = heatingOrCooling.charAt(0).toLowerCase() + heatingOrCooling.slice(1);
            const oppLower = oppSystem.charAt(0).toLowerCase() + oppSystem.slice(1);
            if(value === 'none' && _homeValues[oppLower+'_type_'+num] === 'none') {
                let message = heatingOrCooling + ' Type is required if there is no ' + oppSystem + ' Type';
                return new Validation(message, ERROR);
            }
            if(heatingOrCooling === HEATING) {
                if(!_homeValues['heating_fuel_'+num]) {
                    return new Validation(!value || value === 'none' ? undefined : 'Cannot enter type without fuel', ERROR);
                } else if (!heatingFuelToType[_homeValues['heating_fuel_'+num]] || heatingFuelToType[_homeValues['heating_fuel_'+num]].indexOf(_homeValues['heating_type_'+num]) === -1) {
                    return new Validation(_homeValues['heating_fuel_'+num]+' is not an appropriate fuel for heating type '+value, ERROR);
                }
            } else {
                // If Cooling Type is heat_pump or gchp, Heating Type must match or be wood_stove or none
                if(['heat_pump', 'gchp'].indexOf(value) > -1) {
                    if([value, 'wood_stove', 'none'].indexOf(_homeValues[oppLower+'_type_'+num]) === -1) {
                        return new Validation(_homeValues['heating_type_'+num]+' is not an appropriate heating type with cooling type '+value, ERROR);
                    }
                // If Cooling Type is minisplit, Heating Type cannot be heat_pump or gchp
                } else if('mini_split' === value) {
                    if(['heat_pump', 'gchp'].indexOf(_homeValues[oppLower+'_type_'+num]) > -1) {
                        return new Validation(_homeValues['heating_type_'+num]+' is not an appropriate heating type with cooling type '+value, ERROR);
                    }
                // If Cooling Type is split_dx, Heating Type cannot be a heat pump
                } else if('split_dx' === value) {
                    if(['heat_pump', 'gchp', 'mini_split'].indexOf(_homeValues[oppLower+'_type_'+num]) > -1) {
                        return new Validation(_homeValues[oppLower+'_type_'+num]+' is not an appropriate heating type with cooling type '+value, ERROR);
                    }
                // TODO: The rule below was but in place because dec / gchp combo triggered an error: https://hescore-pnnl-sim-doe2-st.s3.us-west-2.amazonaws.com/st-st-727018/userLayer.inc/OUTPUT
                } else if('dec' === value) {
                    if(['gchp'].indexOf(_homeValues[oppLower+'_type_'+num]) > -1) {
                        return new Validation(_homeValues[oppLower+'_type_'+num]+' is not an appropriate heating type with cooling type '+value, ERROR);
                    }
                }
            }
        }
        return blocker;
    },

    heating_type_1: function(value) {
        return this._get_system_validation(value, 1, this._heating_and_cooling_types(value, 1, HEATING));
    },
    heating_type_2: function(value) {
        return this._get_system_validation(value, 2, this._heating_and_cooling_types(value, 2, HEATING));
    },

    heating_fuel_1: function(value) {
        return this._get_system_validation(value, 1, this._heating_fuel(value));
    },
    heating_fuel_2: function(value) {
        return this._get_system_validation(value, 2, this._heating_fuel(value));
    },
    _heating_fuel: function(value) {
        return new Validation(TypeRules._string(value, 100, heatingFuelOptions), BLOCKER);
    },

    heating_efficiency_method_1: function(value) {
        return this._get_system_validation(value, 1, this._heating_efficiency_method(value, 1));
    },
    heating_efficiency_method_2: function(value) {
        return this._get_system_validation(value, 2, this._heating_efficiency_method(value, 2));
    },
    _heating_efficiency_method: function(value, num) {
        const blocker = new Validation(TypeRules._string(value, 20, ['user', 'shipment_weighted']), BLOCKER);
        if(!blocker['message']) {
            const isHeatingTypeWithoutEfficiencyMethod = ['baseboard', 'wood_stove', 'none'].indexOf(_homeValues['heating_type_'+num]) > -1;
            const isElectricFurnace = _homeValues['heating_type_'+num] === 'central_furnace' && _homeValues['heating_fuel_'+num] === 'electric';
            if(!TypeRules._is_empty(value) && (isHeatingTypeWithoutEfficiencyMethod || isElectricFurnace || TypeRules._is_empty(_homeValues['heating_type_'+num]))) {
                return new Validation('Efficiency method should not be set if heating type is "central furnace" and fuel is "electric", or if heating type is "baseboard", "wood stove", "none", or empty', ERROR);
            }
            if(value === 'shipment_weighted') {
                // If heating is wall_furnace and not natural_gas, efficiency method must be user
                if(_homeValues['heating_type_'+num] === 'wall_furnace' && _homeValues['heating_fuel_'+num] !== 'natural_gas') {
                    return new Validation('Efficiency method must be "user" if heating type "wall_furnace" and fuel is not "natural_gas"', ERROR);
                }
                // HVAC and Water Heater efficiencies must be user when type is mini_split or gchp
                if(['mini_split', 'gchp'].includes(_homeValues['heating_type_'+num])) {
                    return new Validation(`Heating efficiency method must be 'user' when type is '${_homeValues['heating_type_'+num]}'`, ERROR);
                }
            }
        }
        return blocker;
    },

    heating_year_1: function(value) {
        return this._get_system_validation(value, 1, this._installation_year(value, 1970));
    },
    heating_year_2: function(value) {
        return this._get_system_validation(value, 2, this._installation_year(value, 1970));
    },

    heating_efficiency_1: function(value) {
        return this._get_system_validation(value, 1, this._heating_efficiency(_homeValues.heating_type_1, value));
    },
    heating_efficiency_2: function(value) {
        return this._get_system_validation(value, 2, this._heating_efficiency(_homeValues.heating_type_2, value));
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
    cooling_type_1: function(value) {
        return this._get_system_validation(value, 1, this._heating_and_cooling_types(value, 1, COOLING));
    },
    cooling_type_2: function(value) {
        return this._get_system_validation(value, 2, this._heating_and_cooling_types(value, 2, COOLING));
    },

    cooling_efficiency_method_1: function(value) {
        return this._get_system_validation(value, 1, this._cooling_efficiency_method(value, 1));
    },
    cooling_efficiency_method_2: function(value) {
        return this._get_system_validation(value, 2, this._cooling_efficiency_method(value, 2));
    },
    _cooling_efficiency_method: function(value, num) {
        const blocker = new Validation(TypeRules._string(value, 20, ['user', 'shipment_weighted']), BLOCKER);
        if(!blocker['message']) {
            if(!TypeRules._is_empty(value) && (['none', 'dec'].indexOf(_homeValues['cooling_type_'+num]) > -1  || TypeRules._is_empty(_homeValues['cooling_type_'+num]))) {
                return new Validation('Efficiency method should not be set if cooling type is "none", "direct evaporative cooler", or empty', ERROR);
            }
            // HVAC and Water Heater efficiencies must be user when type is mini_split or gchp
            if(['mini_split', 'gchp'].includes(_homeValues['cooling_type_'+num]) && value !== 'user') {
                return new Validation(`Cooling efficiency must be 'user' when type is '${_homeValues['cooling_type_'+num]}'`, ERROR);
            }
        }
        return blocker;
    },

    cooling_year_1: function(value) {
        return this._get_system_validation(value, 1, this._installation_year(value, 1970));
    },
    cooling_year_2: function(value) {
        return this._get_system_validation(value, 2, this._installation_year(value, 1970));
    },

    cooling_efficiency_1: function(value) {
        return this._get_system_validation(value, 1, this._cooling_efficiency(value));
    },
    cooling_efficiency_2: function(value) {
        return this._get_system_validation(value, 2, this._cooling_efficiency(value));
    },
    _cooling_efficiency: function(value) {
        return new Validation(TypeRules._float(value, 8, 40), BLOCKER);
    },

    /*
     * hvac_distribution
     */
    hvac_distribution_leakage_method_1: function(value) {
        return this._hvac_distribution_leakage_method(value, 1);
    },
    hvac_distribution_leakage_method_2: function(value) {
        return this._hvac_distribution_leakage_method(value, 2);
    },
    _hvac_distribution_leakage_method: function(value, num) {
        return this._hvac_distribution_validation(value, num, new Validation(TypeRules._string(value, 20, ['qualitative', 'quantitative']), BLOCKER));
    },
    hvac_distribution_leakage_to_outside_1: function(value) {
        return this._hvac_distribution_leakage_to_outside(value, 1);
    },
    hvac_distribution_leakage_to_outside_2: function(value) {
        return this._hvac_distribution_leakage_to_outside(value, 2);
    },
    _hvac_distribution_leakage_to_outside: function(value, system) {
        const blocker = new Validation(TypeRules._float(value, 0, 1000, true), BLOCKER);
        if(blocker['message']) {
            return blocker;
        }
        let message = undefined;
        if(_homeValues['hvac_distribution_leakage_method_'+system] === 'qualitative') {
            message = "Leakage should not be passed for your system if the method is 'qualitative'";
        }
        return this._hvac_distribution_validation(value, system, new Validation(message, ERROR));
    },
    hvac_distribution_sealed_1: function(value) {
        return this._hvac_distribution_sealed(value, 1);
    },
    hvac_distribution_sealed_2: function(value) {
        return this._hvac_distribution_sealed(value, 2);
    },
    _hvac_distribution_sealed: function(value, num) {
        return this._hvac_distribution_validation(value, num, new Validation(TypeRules._int(value, 0, 1), BLOCKER));
    },
    _hvac_distribution_validation: function(value, num, validation) {
        if ((validation && validation['message'] && validation['type'] === BLOCKER)) {
            return validation;
        }
        const invalidDuctType = this._is_servicing_duct_system(value, num);
        if(invalidDuctType && invalidDuctType['message']) {
            return invalidDuctType;
        }
        return validation;
    },
    /*
     * ducts
     */
    duct_location_1_1: function(value) {
        return this._get_duct_validation(value, 1, 1, this._duct_location(value));
    },
    duct_location_2_1: function(value) {
        return this._get_duct_validation(value, 1, 2, this._duct_location(value));
    },
    duct_location_3_1: function(value) {
        return this._get_duct_validation(value, 1, 3, this._duct_location(value));
    },
    duct_location_1_2: function(value) {
        return this._get_duct_validation(value, 2, 1, this._duct_location(value));
    },
    duct_location_2_2: function(value) {
        return this._get_duct_validation(value, 2, 2, this._duct_location(value));
    },
    duct_location_3_2: function(value) {
        return this._get_duct_validation(value, 2, 3, this._duct_location(value));
    },
    _duct_location: function(value) {
        const invalidSpace = new Validation(TypeRules._string(value, 20, ductType), BLOCKER);
        if (invalidSpace && invalidSpace['message']) {
            return invalidSpace;
        }
        return this._duct_space_exists(value);
    },

    duct_fraction_1_1: function(value) {
        return this._duct_fraction(value, '1');
    },
    duct_fraction_2_1: function(value) {
        return this._duct_fraction(value, '1');
    },
    duct_fraction_3_1: function(value) {
        return this._duct_fraction(value, '1');
    },
    duct_fraction_1_2: function(value) {
        return this._duct_fraction(value, '2');
    },
    duct_fraction_2_2: function(value) {
        return this._duct_fraction(value, '2');
    },
    duct_fraction_3_2: function(value) {
        return this._duct_fraction(value, '2');
    },
    _duct_fraction: function(value, c) {
        let fullPercentCheck = null;
        if(['1', '2'].indexOf(c) > -1) {
            const totalPercent = [1, 2, 3].reduce((prev, duct) => prev + (parseFloat(_homeValues[`duct_fraction_${duct}_${c}`]) || 0), 0);
            fullPercentCheck = TypeRules._fraction(totalPercent);
            if(fullPercentCheck) {
                return new Validation(fullPercentCheck, BLOCKER);
            } else if(TypeRules._float(value, 0, 1)) {
                return new Validation('Value must be between 0 and 100', ERROR);
            }
        } else {
            throw new Error("Unexpected duct " + c);
        }
    },

    duct_insulated_1_1: function(value) {
        return this._duct_insulated(value, 1, 1);
    },
    duct_insulated_2_1: function(value) {
        return this._duct_insulated(value, 1, 2);
    },
    duct_insulated_3_1: function(value) {
        return this._duct_insulated(value, 1, 3);
    },
    duct_insulated_1_2: function(value) {
        return this._duct_insulated(value, 2, 1);
    },
    duct_insulated_2_2: function(value) {
        return this._duct_insulated(value, 2, 2);
    },
    duct_insulated_3_2: function(value) {
        return this._duct_insulated(value, 2, 3);
    },
    _duct_insulated: function(value, sys, duct) {
        return this._get_duct_validation(value, sys, duct, new Validation(TypeRules._int(value, 0, 1), BLOCKER));
    },

    /*
     * systems_hot_water
     */
    hot_water_category: function(value) {
        const blocker = new Validation(TypeRules._string(value, 20, ['unit', 'combined']), BLOCKER);
        if(!blocker['message'] && [_homeValues['heating_type_1'], _homeValues['heating_type_2'], _homeValues['cooling_type_1'], _homeValues['cooling_type_2']].indexOf('boiler') === -1 && value === 'combined') {
            return new Validation("Must have a boiler for combined hot water category", ERROR);
        }
        return blocker;
    },
    hot_water_type: function(value) {
        return new Validation(TypeRules._string(value, 20, hotWaterType), BLOCKER);
    },
    hot_water_fuel: function(value) {
        const blocker = new Validation(TypeRules._string(value, 20, hotWaterFuel), BLOCKER);
        if(!blocker['message']) {
            if((_homeValues.hot_water_type === 'tankless_coil' || _homeValues.hot_water_type === 'indirect') && value) {
                return new Validation('Fuel is only used if type is set to storage or heat pump', ERROR);
            }
            if(_homeValues.hot_water_type === 'heat_pump' && value !== 'electric') {
                return new Validation('Fuel must be electric if type is heat pump', ERROR);
            }
        }
        return blocker;
    },
    hot_water_efficiency_method: function(value) {
        const blocker = new Validation(TypeRules._string(value, 20, ['user', 'uef', 'shipment_weighted']), BLOCKER);
        if(!blocker['message'] && ['heat_pump', 'tankless', 'tankless_coil'].indexOf(_homeValues['hot_water_type']) > -1 && value === 'shipment_weighted') {
            return new Validation('Invalid Efficiency Method for entered Hot Water Type', ERROR);
        }
        return blocker;
    },
    hot_water_year: function(value) {
        return this._installation_year(value, 1972);
    },
    hot_water_energy_factor: function(value) {
        let min, max;

        if (_homeValues.hot_water_type === 'storage') {
            [min, max] = [0.45, 0.95];
        } else if (_homeValues.hot_water_type === 'tankless') {
            [min, max] = [0.45, 0.99];
        } else if (_homeValues.hot_water_type === 'heat_pump') {
            [min, max] = [1, 4];
        }

        return new Validation(TypeRules._float(value, min, max), BLOCKER);
    },

    /*
     * systems_solar_electric
     */
    solar_electric_capacity_known: function(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },
    solar_electric_system_capacity: function(value) {
        return new Validation(TypeRules._float(value, 0.05, 100), BLOCKER);
    },
    solar_electric_num_panels: function(value) {
        return new Validation(TypeRules._int(value, 1, 100), BLOCKER);
    },
    solar_electric_year: function(value) {
        return new Validation(TypeRules._int(value, 2000, (new Date()).getFullYear()), BLOCKER);
    },
    solar_electric_array_azimuth: function(value) {
        return new Validation(TypeRules._string(value, 20, orientationArray), BLOCKER);
    },
    solar_electric_array_tilt: function(value) {
        return new Validation(TypeRules._string(value, 20, tiltArray), BLOCKER);
    },

    /*
     * HPwES
     */
    improvement_installation_start_date: function(value) {
        return new Validation(TypeRules._date(value), ERROR);
    },
    improvement_installation_completion_date: function(value) {
        return new Validation(TypeRules._date(value), ERROR);
    },
    contractor_business_name: function(value) {
        return new Validation(TypeRules._string(value), ERROR);
    },
    contractor_zip_code: function(value) {
        return new Validation(TypeRules._zip(value), ERROR);
    },

/*
 * CONDITION FUNCTIONS
 ***********************
 */
    /**
     * Checks that entered value is on a valid wall
     * @param value
     * @param {string} side
     */
    _is_valid_wall_side: function(value, side) {
        if(_homeValues.shape === 'town_house' && value && parseInt(value) !== 0) {
            const validSides = _homeValues.town_house_walls ? _homeValues.town_house_walls.split('_') : [];
            if(validSides.indexOf(side) === -1) {
                return new Validation(
                    'Values may not be defined for common/interior walls of a townhouse. Please only set values for exterior walls: '+validSides.join(', '),
                    ERROR
                );
            }
        }
    },
    
    /**
     * Get validations for wall values, ensuring wall is valid
     * @param value
     * @param {string} side
     * @param {Validation} validation
     */
    _get_wall_validation: function(value, side, validation) {
        if ((validation['message'] && validation['type'] === BLOCKER)) {
            return validation;
        }
        const invalidWall = this._is_valid_wall_side(value, side);
        if (invalidWall && invalidWall['message']) {
            return invalidWall;
        }
        return validation;
    },
    
    /**
     * Checks that entered value is on a valid hvac
     * @param value
     * @param {int} num
     */
    _is_servicing_system: function(value, num) {
        if([0, null].indexOf(_homeValues['hvac_fraction_'+num]) > -1 && !TypeRules._is_empty(value)) {
            return new Validation(
                'Values may not be defined for system that do not service any area of the home. Please only set values for hvacs with hvac fraction > 0',
                ERROR
            );
        }
    },
    
    /**
     * Checks that entered value is on a valid hvac
     * @param value
     * @param {int} sys
     * @param {int} duct
     */
    _is_servicing_duct: function(value, sys, duct) {
        if([0, null].indexOf(_homeValues['duct_fraction_'+duct+'_'+sys]) > -1 && !TypeRules._is_empty(value)) {
            return new Validation(
                'Values may not be defined for ducts that do not service any area of the home. Please only set values for ducts with duct fraction > 0',
                ERROR
            );
        }
    },

    /**
     * Checks if a HVAC system requires ducts, and returns a validation error if it does not require ducts but the user
     * added one or more ducts.
     * @param value Any duct value
     * @param {int} sys System index
     * @return {Validation|void}
     */
    _is_servicing_duct_system: function(value, sys) {
        // If heating/cooling system does not require ducts, we need to ensure the
        // user has not entered values for ducts
        let ductTypes = ['central_furnace', 'heat_pump', 'gchp', 'split_dx'];

        if (!ductTypes.includes(_homeValues['heating_type_'+sys]) && !ductTypes.includes(_homeValues['cooling_type_'+sys])) {
            if(!TypeRules._is_empty(value)) {
                return new Validation(
                    'Values may not be defined for system that does not call for ducts. Please only set values for ducts on Central Furnace, Heat Pump, Ground Coupled Heating Pump, or Central Air Conditioner systems',
                    ERROR
                );
            }
        }
    },
    
    /**
     * Get validations for wall values, ensuring wall is valid
     * @param value
     * @param {string} side
     * @param {Validation} validation
     */
    _get_system_validation: function(value, num, validation) {
        if ((validation['message'] && validation['type'] === BLOCKER)) {
            return validation;
        }
        const invalidSystem = this._is_servicing_system(value, num);
        if (invalidSystem && invalidSystem['message']) {
            return invalidSystem;
        }
        return validation;
    },
    
    /**
     * Get validations for duct values, ensuring duct is valid
     * @param value
     * @param {int} sys
     * @param {int} duct
     * @param {Validation} validation
     */
    _get_duct_validation: function(value, sys, duct, validation) {
        if ((validation && validation['message'] && validation['type'] === BLOCKER)) {
            return validation;
        }
        const invalidSystem = this._is_servicing_system(value, sys);
        if (invalidSystem && invalidSystem['message']) {
            return invalidSystem;
        }
        const invalidDuct = this._is_servicing_duct(value, sys, duct);
        if (invalidDuct && invalidDuct['message']) {
            return invalidDuct;
        }
        const invalidDuctType = this._is_servicing_duct_system(value, sys);
        if(invalidDuctType && invalidDuctType['message']) {
            return invalidDuctType;
        }
        return validation;
    },
    
    /**
     * Ensure duct is in existing space
     * @param value
     */
    _duct_space_exists: function(value) {
        const ductLocations = ductType_alwaysValid;
        if (_homeValues.foundation_type_1 === 'uncond_basement' || _homeValues.foundation_type_2 === 'uncond_basement') {
            ductLocations.push('uncond_basement');
        }
        if (_homeValues.foundation_type_1 === 'vented_crawl' || _homeValues.foundation_type_2 === 'vented_crawl') {
            ductLocations.push('vented_crawl');
        }
        if (_homeValues.foundation_type_1 === 'unvented_crawl' || _homeValues.foundation_type_2 === 'unvented_crawl') {
            ductLocations.push('unvented_crawl');
        }
        if (_homeValues.roof_type_1 === 'vented_attic' || _homeValues.roof_type_2 === 'vented_attic') {
            ductLocations.push('uncond_attic');
        }
        if(ductLocations.indexOf(value) === -1) {
            return new Validation(
                'Ducts may only be set with values in exisiting roof or foundation spaces',
                ERROR
            );
        }
    },
    
    /**
     * Validation for installation years
     * @param {int} minYear the minimum year the API will accept
     * @param {int} value the entered year
     * @return {Validation}
     */
    _installation_year: function(value, minYear) {
        const thisYear = (new Date()).getFullYear();
        let errorLevel = BLOCKER;

        // If the installation year is greater than the minimum the API can accept, and the year_built field has been
        // set, then instead of a BLOCKER based on the API's restrictions, we create an ERROR-level validation requiring
        // the installation not to have happened before the home was built.
        if(value >= minYear && _homeValues.year_built > 0) {
            minYear = _homeValues.year_built - 2; // Add a buffer of 2 years to the year_built for manufacture years
            errorLevel = ERROR;
        }
        return new Validation(TypeRules._int(value, minYear, thisYear), errorLevel);
    },

    /*
     * Gets footprint area for skylight area validations
     */
    _get_footprint_area: function() {
        if (TypeRules._is_empty(_homeValues.conditioned_floor_area)) {
            return false;
        }
        let footprintArea = _homeValues.conditioned_floor_area;
        if (_homeValues.foundation_type_1 === 'cond_basement') {
            footprintArea = footprintArea - TypeRules._int_or_zero(_homeValues.floor_area_1);
        }
        if (_homeValues.foundation_type_2 === 'cond_basement') {
            footprintArea = footprintArea - TypeRules._int_or_zero(_homeValues.floor_area_2);
        }
        return parseInt(footprintArea / parseInt(_homeValues.num_floor_above_grade));
    },
    
    _check_footprint: function() {
        const footprint = this._get_footprint_area();
        if(footprint < 250) {
            return 'Home footprint must be greater than 250 sq ft.  Current footprint is '+footprint+' sq ft';
        }
    },

    /*
     * Get combined floor area
     */
    _get_combined_floor_area: function() {
        return TypeRules._int_or_zero(_homeValues.floor_area_1) + TypeRules._int_or_zero(_homeValues.floor_area_2);
    },

    /*
     * Get projected roof area
     * @param {string} '1' or '2'
     */
    _get_proj_roof_area: function(roof_num) {
        return TypeRules._int_or_zero(_homeValues['roof_area_'+roof_num]);
    },

    /*
     * Get projected ceiling area
     * @param {string} '1' or '2'
     */
    _get_proj_ceiling_area: function(ceiling_num) {
        return TypeRules._int_or_zero(_homeValues['ceiling_area_'+ceiling_num]);
    },

    /*
     * Get combined roof area
     */
    _get_combined_roof_area: function() {
        return this._get_proj_roof_area('1') + this._get_proj_roof_area('2');
    },

    /*
     * Get combined ceiling area
     */
    _get_combined_roof_ceiling_area: function() {
        return this._get_proj_roof_area('1') + this._get_proj_roof_area('2') +
            this._get_proj_ceiling_area('1') + this._get_proj_ceiling_area('2');
    },

    _get_dimension1: function(){
        let area = this._get_footprint_area();
        if (area) {
            //Assume floor dimensions area 5x3
            return parseInt((Math.sqrt((3 * area) / 5)));
        } else {
            return false;
        }
    },

    _get_dimension2: function(){
        let dimension2 = this._get_dimension1();
        if (dimension2) {
            //Assume floor dimensions area 5x3
            return dimension2 * (5 / 3);
        } else {
            return false;
        }
    },

    /*
     * Gets the first wall dimension for window area validations
     * The calculations for dimension1 and dimension2 need to be swapped if the shape is 'townhouse'
     */
    _get_wall_dimension_left_right: function() {
        if(_homeValues.shape === 'town_house'){
            return this._get_dimension2();
        }
        return this._get_dimension1();
    },
    
    /*
     * Gets the second wall dimension for window area validations
     */
    _get_wall_dimension_front_back: function() {
        if(_homeValues.shape === 'town_house'){
            return this._get_dimension1();
        }
        return this._get_dimension2();
    },

    /*
     * Gets wall area for front/back window area validations
     */
    _get_wall_area_front_back: function() {
        let length = this._get_wall_dimension_front_back();
        let height = parseInt(_homeValues.floor_to_ceiling_height) || false;
        let stories = parseInt(_homeValues.num_floor_above_grade) || false;
        if (length && height && stories) {
            return parseInt((length * height - 20) * stories);
        } else {
            return false;
        }
    },
    
    /*
     * Gets wall area for left/right window area validations
     */
    _get_wall_area_left_right: function() {
        let length = this._get_wall_dimension_left_right();
        let height = parseInt(_homeValues.floor_to_ceiling_height) || false;
        let stories = parseInt(_homeValues.num_floor_above_grade) || false;
        if (length && height && stories) {
            return parseInt(length * height * stories);
        } else {
            return false;
        }
    },

    /*
     * Checks that the combined roof_area is not less than the combined floor_area
     */
    _check_combined_area: function() {
        let combinedRoofCeilingArea = this._get_combined_roof_ceiling_area();
        let combinedFloorArea = this._get_combined_floor_area();
        if (combinedRoofCeilingArea  <= combinedFloorArea * .95) { // Allow 5% error
            return "The roof does not cover the floor";
        } else {
            return false;
        }
    },

    /*
     * Checks that the roof_area and floor_areas are consistent with conditioned footprint areas
     * @param {number} combinedArea
     * @param {'roof'|'floor'} thisAreaType
     */
    _check_conditioned_areas: function(combinedArea, thisAreaType) {
        let footprintArea = this._get_footprint_area();
        if (TypeRules._int_or_zero(_homeValues.num_floor_above_grade) === 0) {
            return "This home’s minumum footprint is unknown.  Please enter number of stories.";
        } else {
            // Check that combined areas are within reasonable range of footprint
            // const max = thisAreaType === "roof"
            //     ? footprintArea * 2.5 // roof area max
            //     : _homeValues.conditioned_floor_area * 1.05; // floor area & ceiling area max
            const max = footprintArea * 2.5;
            const expectedRange = [footprintArea * 0.95, max];
            if (!((expectedRange[0] < combinedArea) && (combinedArea < expectedRange[1]))) {
                return `
                    This home's minimum footprint is approximately ${footprintArea}sqft, but you
                    have specified ${combinedArea}sqft of total ${thisAreaType} area. The allowed range
                    is (${Math.ceil(expectedRange[0])}sqft - ${Math.floor(expectedRange[1])}sqft).
                    Please adjust any incorrect values. *The footprint is calculated as
                    (<total area> - <conditioned basement area>) / <number of floors>
                `;
            }
        }
    },
};

function get_validation_messages (homeValues, requiredFields, additionalRules) {
    // Pass homeValues into the scope of this file so that validation rules can reference it
    // without us having to explicitly pass it to every function
    validationRules = additionalRules ? Object.assign(validationRules, additionalRules) : validationRules;
    _homeValues = homeValues;
    let result = {};
    result[BLOCKER] = {};
    result[ERROR] = {};
    result[MANDATORY] = {};

    for (const fieldName in requiredFields) {
        //Because we have two validation rules for one user input, here we check for potential duplicate messages
        if (undefined === homeValues[fieldName] || '' === homeValues[fieldName] || null === homeValues[fieldName]) {
            if ((fieldName === 'heating_fuel_1' && (homeValues['heating_type_1'] === 'none' || TypeRules._is_empty(homeValues['heating_type_1']))) ||
                (fieldName === 'heating_fuel_2' && (homeValues['heating_type_2'] === 'none' || TypeRules._is_empty(homeValues['heating_type_2'])))) {
                /*
                 * If heating_fuel_ is not entered, we must check if heating_type_ is 'none'
                 * (that is, the user selecting "None").  In this scenario, heating_fuel_ is not required.
                 * Further, if both are empty, we do not need to see the validation message for both.
                 */
            } else if (fieldName === 'hot_water_type' && homeValues['hot_water_type'] && TypeRules._is_empty(homeValues['hot_water_fuel'])) {
                // Do nothing ... avoid duplicate messages 
            } else {
                result[MANDATORY][fieldName] = requiredFields[fieldName];
            }
        }
    }
    for (let [fieldName, value] of Object.entries(homeValues)) {
        if (value === null || value === undefined || value.length === 0) {
            continue;
        }
        if (typeof(validationRules[fieldName]) !== 'function') {
            continue;
        }
        let validationResult = validationRules[fieldName](value);
        if (undefined !== validationResult) {
            if (undefined !== validationResult['message']) {
                result[validationResult['type']][fieldName] = validationResult['message'];
            }
        }
    }
    return result;
}

/**
 * @param {Object} homeValues Key/value pairs. The keys should be identical to the "name" attributes of the
 * corresponding form fields.
 * @param {Object} additionalRules (Optional) Object of functions. Additonal Validation Rules to be
 * added to present rules.
 * @returns {Object} Keys are the same as in homeValues. Values are error strings. In the event that no
 * validation rules were violated, an empty object is returned.
 */
function validate_home_audit (homeValues, additionalRules = null) {
    // Pass homeValues into the scope of this file so that validation rules can reference it
    // without us having to explicitly pass it to every function
    let requiredFields = require('./required_fields.node.js')(homeValues);
    if(homeValues.about) {
        return requiredFields;
    } else {
        return get_validation_messages(homeValues, requiredFields, additionalRules);
    }
}

/**
 * @param {Object} homeValues Key/value pairs. The keys should be identical to the "name" attributes of the
 * corresponding form fields.
 * @returns {Object} Keys are the same as in homeValues. Values are error strings. In the event that no
 * validation rules were violated, an empty object is returned.
 */
function validate_address (homeValues) {
    // If we are given the new version of the home object, we need to pass the right area to the
    // validation engine
    if(typeof homeValues.address === 'object') {
        homeValues = homeValues.address;
    }
    let mandatoryMessage = "Missing value for mandatory field";
    // Define values that are always required
    let requiredFields = {
        address : mandatoryMessage,
        city : mandatoryMessage,
        state : mandatoryMessage,
        zip_code : mandatoryMessage,
        assessment_type : mandatoryMessage,
    };
    return get_validation_messages(homeValues, requiredFields);
}

module.exports = {validate_home_audit, validate_address};
