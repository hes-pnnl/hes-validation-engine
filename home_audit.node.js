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
    'tankless_coil',
    'instantaneous'
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
        return new Validation(TypeRules._string(value, 256), BLOCKER);
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
        return new Validation(TypeRules._int(value, 0, 25000), BLOCKER);
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
    roof_area_1: function(value) {
        return this._roof_area(value);
    },
    roof_area_2: function(value) {
        return this._roof_area(value);
    },
    _roof_area: function(value) {
        //Check that roof area is within legal bounds per API
        if (TypeRules._int(value, 1, 25000) === undefined) {
            let combinedAreaCheck = this._check_combined_area();
            //Check that roof area is not less than floor area
            if (!combinedAreaCheck) {
                let combinedRoofArea = this._get_combined_roof_area();
                let checkConditionedAreas = this._check_conditioned_areas(combinedRoofArea, "roof area");
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

    roof_type_1: function(value) {
        return this._roof_type(value);
    },
    roof_type_2: function(value) {
        return this._roof_type(value);
    },
    _roof_type: function(value) {
        return new Validation(TypeRules._string(value, 20, roofType), BLOCKER);
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
        if (TypeRules._int(value, 1, 25000) === undefined) {
            let combinedAreaCheck = this._check_combined_area();
            //Check that floor area is not greater than roof area
            if (!combinedAreaCheck) {
                let combinedFloorArea = this._get_combined_floor_area();
                let checkConditionedAreas = this._check_conditioned_areas(combinedFloorArea, "floor area");
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
                return new new Validation(checkFootprint, BLOCKER);
            }
            //This is a blocker case and will prevent saving
            return new Validation(TypeRules._int(value, 1, 25000), BLOCKER);
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
            return new Validation(TypeRules._float(value, 0, footprintArea), ERROR);
        }
    },
    skylight_solar_screen: function(value) {
        return new Validation(TypeRules._bool(value), BLOCKER);
    },
    skylight_method: function(value) {
        return new Validation(TypeRules._string(value, 20, ['code', 'custom']), BLOCKER);
    },
    skylight_code: function(value) {
        return new Validation(TypeRules._string(value, 20, windowAndSkylightCode, BLOCKER));
    },
    skylight_u_value: function(value) {
        return new Validation(TypeRules._float(value, 0.01, 5), BLOCKER);
    },
    skylight_shgc: function(value) {
        return new Validation(TypeRules._float(value, 0, 1), BLOCKER);
    },

    skylight_area_2: function(value) {
        return this.skylight_area(value);
    },
    skylight_method_2: function(value) {
        return new Validation(TypeRules._string(value, 20, ['code', 'custom']), BLOCKER);
    },
    skylight_code_2: function(value) {
        return new Validation(TypeRules._string(value, 20, windowAndSkylightCode, BLOCKER));
    },
    skylight_u_value_2: function(value) {
        return new Validation(TypeRules._float(value, 0.01, 5), BLOCKER);
    },
    skylight_shgc_2: function(value) {
        return new Validation(TypeRules._float(value, 0, 1), BLOCKER);
    },
    /*
     * zone_window
     */
    window_solar_screen_front: function(value) {
        return new Validation(TypeRules._bool(value), BLOCKER);
    },
    window_solar_screen_back: function(value) {
        return new Validation(TypeRules._bool(value), BLOCKER);
    },
    window_solar_screen_right: function(value) {
        return new Validation(TypeRules._bool(value), BLOCKER);
    },
    window_solar_screen_left: function(value) {
        return new Validation(TypeRules._bool(value), BLOCKER);
    },
    window_area_front: function(value) {
        //return TypeRules._int(value, 10, wall_area); TODO: Make this an ignorable warning
        let wallArea = this._get_wall_area_front_back();
        return this._window_area(value, wallArea);
    },
    window_area_back: function(value) {
        let wallArea = this._get_wall_area_front_back();
        return this._window_area(value, wallArea);
    },
    window_area_right: function(value) {
        let wallArea = this._get_wall_area_left_right();
        return this._window_area(value, wallArea);
    },
    window_area_left: function(value) {
        let wallArea = this._get_wall_area_left_right();
        return this._window_area(value, wallArea);
    },
    _window_area: function(value, wallArea) {
        if (value > 999 || value < 0) {
            //Windows have API max area of 999
            return new Validation(TypeRules._float(value, 0, 999), BLOCKER);
        }
        if (wallArea) {
            return new Validation(TypeRules._float(value, 0, wallArea), ERROR);
        }
    },

    window_method_front: function(value) {
        return this._window_method(value);
    },
    window_method_back: function(value) {
        return this._window_method(value);
    },
    window_method_right: function(value) {
        return this._window_method(value);
    },
    window_method_left: function(value) {
        return this._window_method(value);
    },
    _window_method: function(value) {
        return new Validation(TypeRules._string(value, 20, ['code', 'custom']), BLOCKER);
    },

    window_code_front: function(value) {
        return this._window_code(value);
    },
    window_code_back: function(value) {
        return this._window_code(value);
    },
    window_code_right: function(value) {
        return this._window_code(value);
    },
    window_code_left: function(value) {
        return this._window_code(value);
    },
    _window_code: function(value) {
        return new Validation(TypeRules._string(value, 20, windowAndSkylightCode), BLOCKER);
    },

    window_u_value_front: function(value) {
        return this._window_u_value(value);
    },
    window_u_value_back: function(value) {
        return this._window_u_value(value);
    },
    window_u_value_right: function(value) {
        return this._window_u_value(value);
    },
    window_u_value_left: function(value) {
        return this._window_u_value(value);
    },
    _window_u_value: function(value) {
        return new Validation(TypeRules._float(value, 0.01, 5), BLOCKER);
    },

    window_shgc_front: function(value) {
        return this._window_shgc(value);
    },
    window_shgc_back: function(value) {
        return this._window_shgc(value);
    },
    window_shgc_right: function(value) {
        return this._window_shgc(value);
    },
    window_shgc_left: function(value) {
        return this._window_shgc(value);
    },
    _window_shgc: function(value) {
        return new Validation(TypeRules._float(value, 0, 1), BLOCKER);
    },

    /*
     * zone_wall
     */
    wall_assembly_code_front: function(value) {
        return this._wall_assembly_code(value);
    },
    wall_assembly_code_back: function(value) {
        return this._wall_assembly_code(value);
    },
    wall_assembly_code_right: function(value) {
        return this._wall_assembly_code(value);
    },
    wall_assembly_code_left: function(value) {
        return this._wall_assembly_code(value);
    },
    _wall_assembly_code: function(value) {
        return new Validation(TypeRules._string(value, 20, wallAssemblyCode), BLOCKER);
    },

    /*
     * hvac
     */
    hvac_fraction_1: function(value) {
        return this._hvac_fraction();
    },
    hvac_fraction_2: function(value) {
        return this._hvac_fraction();
    },
    _hvac_fraction: function() {
        const fraction1 = _homeValues.hvac_fraction_1 ? parseFloat(_homeValues.hvac_fraction_1) : 0;
        const fraction2 = _homeValues.hvac_fraction_2 ? parseFloat(_homeValues.hvac_fraction_2) : 0;
        return new Validation(TypeRules._fraction(fraction1 + fraction2), BLOCKER);
    },

    /*
     * hvac_heating
     */
    _heating_and_cooling_types: function(value, num, heatingOrCooling) {
        const oppSystem = heatingOrCooling === HEATING ? COOLING : HEATING;
        const currLower = heatingOrCooling.charAt(0).toLowerCase() + heatingOrCooling.slice(1);
        const oppLower = oppSystem.charAt(0).toLowerCase() + oppSystem.slice(1);
        if(['heat_pump', 'gchp', 'mini_split'].indexOf(value) > -1 || ['heat_pump', 'gchp', 'mini_split'].indexOf(_homeValues[oppLower+'_type_'+num]) > -1) {
            if(value !== _homeValues[oppLower+'_type_'+num] && _homeValues[oppLower+'_type_'+num] !== 'none' && value !== 'none') {
                return new Validation('Heating and Cooling Types must match if they are heat pumps.', ERROR);
            }
            if(['gchp', 'mini_split'].indexOf(value) > -1 && _homeValues[currLower+'_efficiency_method_'+num] === 'shipment_weighted') {
                return new Validation('Invalid Efficiency Method for GCHP and Mini-Split Types', ERROR);
            }
        } else if(value === 'none' && _homeValues[oppLower+'_type_'+num] === 'none') {
            let message = heatingOrCooling + ' Type is required if there is no ' + oppSystem + ' Type';
            return new Validation(message, ERROR);
        }
        if(heatingOrCooling === HEATING) {
            if ((value === 'wood_stove' && ['cord_wood', 'pellet_wood'].indexOf(_homeValues['heating_fuel_'+num]) === -1) ||
                (value !== 'wood_stove' && ['cord_wood', 'pellet_wood'].indexOf(_homeValues['heating_fuel_'+num]) > -1)) {
                return new Validation(_homeValues['heating_fuel_'+num]+' is not an appropriate fuel for heating type '+value, ERROR);
            }
        }
        const validTypeOptions = heatingOrCooling === HEATING ? heatingTypeOptions : coolingTypeOptions;
        return new Validation(TypeRules._string(value, 100, validTypeOptions), BLOCKER);
    },

    heating_type_1: function(value) {
        return this._heating_and_cooling_types(value, 1, HEATING);
    },
    heating_type_2: function(value) {
        return this._heating_and_cooling_types(value, 2, HEATING);
    },

    heating_fuel_1: function(value) {
        return this._heating_fuel(value);
    },
    heating_fuel_2: function(value) {
        return this._heating_fuel(value);
    },
    _heating_fuel: function(value) {
        return new Validation(TypeRules._string(value, 100, heatingFuelOptions), BLOCKER);
    },

    heating_efficiency_method_1: function(value) {
        return this._heating_efficiency_method(value);
    },
    heating_efficiency_method_2: function(value) {
        return this._heating_efficiency_method(value);
    },
    _heating_efficiency_method: function(value) {
        return new Validation(TypeRules._string(value, 20, ['user', 'shipment_weighted']), BLOCKER);
    },

    heating_year_1: function(value) {
        return this._installation_year(value, 1970);
    },
    heating_year_2: function(value) {
        return this._installation_year(value, 1970);
    },

    heating_efficiency_1: function(value) {
        return this._heating_efficiency(_homeValues.heating_type_1, value);
    },
    heating_efficiency_2: function(value) {
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
    cooling_type_1: function(value) {
        return this._heating_and_cooling_types(value, 1, COOLING);
    },
    cooling_type_2: function(value) {
        return this._heating_and_cooling_types(value, 2, COOLING);
    },

    cooling_efficiency_method_1: function(value) {
        return this._cooling_efficiency_method(value);
    },
    cooling_efficiency_method_2: function(value) {
        return this._cooling_efficiency_method(value);
    },
    _cooling_efficiency_method: function(value) {
        return new Validation(TypeRules._string(value, 20, ['user', 'shipment_weighted']), BLOCKER);
    },

    cooling_year_1: function(value) {
        return this._installation_year(value, 1970);
    },
    cooling_year_2: function(value) {
        return this._installation_year(value, 1970);
    },

    cooling_efficiency_1: function(value) {
        return this._cooling_efficiency(value);
    },
    cooling_efficiency_2: function(value) {
        return this._cooling_efficiency(value);
    },
    _cooling_efficiency: function(value) {
        return new Validation(TypeRules._float(value, 8, 40), BLOCKER);
    },

    /*
     * hvac_distribution
     */
    duct_location_1_1: function(value) {
        return this._duct_location(value);
    },
    duct_location_2_1: function(value) {
        return this._duct_location(value);
    },
    duct_location_3_1: function(value) {
        return this._duct_location(value);
    },
    duct_location_1_2: function(value) {
        return this._duct_location(value);
    },
    duct_location_2_2: function(value) {
        return this._duct_location(value);
    },
    duct_location_3_2: function(value) {
        return this._duct_location(value);
    },
    _duct_location: function(value) {
        if (ductType.indexOf(value) > -1) {
            let ductTypes = ['cond_space'];
            let roofTypes = [_homeValues.roof_type_1, _homeValues.roof_type_2];
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
            if (ductType.indexOf(value) === -1) {
                return new Validation(value + ' was defined for this duct location, but the home definition does not contain any such space.', ERROR);
            }
        } else {
            return new Validation(TypeRules._string(value, 20, ductType), BLOCKER);
        }
    },

    duct_fraction_1_1: function(value) {
        return this._duct_fraction('1');
    },
    duct_fraction_2_1: function(value) {
        return this._duct_fraction('1');
    },
    duct_fraction_3_1: function(value) {
        return this._duct_fraction('1');
    },
    duct_fraction_1_2: function(value) {
        return this._duct_fraction('2');
    },
    duct_fraction_2_2: function(value) {
        return this._duct_fraction('2');
    },
    duct_fraction_3_2: function(value) {
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

    duct_insulated_1_1: function(value) {
        return this._duct_insulated(value);
    },
    duct_insulated_2_1: function(value) {
        return this._duct_insulated(value);
    },
    duct_insulated_3_1: function(value) {
        return this._duct_insulated(value);
    },
    duct_insulated_1_2: function(value) {
        return this._duct_insulated(value);
    },
    duct_insulated_2_2: function(value) {
        return this._duct_insulated(value);
    },
    duct_insulated_3_2: function(value) {
        return this._duct_insulated(value);
    },
    _duct_insulated: function(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },

    duct_sealed_1_1: function(value) {
        return this._duct_sealed(value);
    },
    duct_sealed_2_1: function(value) {
        return this._duct_sealed(value);
    },
    duct_sealed_3_1: function(value) {
        return this._duct_sealed(value);
    },
    duct_sealed_1_2: function(value) {
        return this._duct_sealed(value);
    },
    duct_sealed_2_2: function(value) {
        return this._duct_sealed(value);
    },
    duct_sealed_3_2: function(value) {
        return this._duct_sealed(value);
    },
    _duct_sealed: function(value) {
        return new Validation(TypeRules._int(value, 0, 1), BLOCKER);
    },

    /*
     * systems_hot_water
     */
    hot_water_category: function(value) {
        if([_homeValues['heating_type_1'], _homeValues['heating_type_2'], _homeValues['cooling_type_1'], _homeValues['cooling_type_2']].indexOf('boiler') === -1 && value === 'combined') {
            return new Validation("Must have a boiler for combined hot water category", ERROR);
        }
        return new Validation(TypeRules._string(value, 20, ['unit', 'combined']), BLOCKER);
    },
    hot_water_type: function(value) {
        return new Validation(TypeRules._string(value, 20, hotWaterType), BLOCKER);
    },
    hot_water_fuel: function(value) {
        return new Validation(TypeRules._string(value, 20, hotWaterFuel), BLOCKER);
    },
    hot_water_efficiency_method: function(value) {
        if(['heat_pump', 'instantaneous', 'tankless_coil'].indexOf(_homeValues['hot_water_type']) > -1 && value === 'shipment_weighted') {
            return new Validation('Invalid Efficiency Method for entered Hot Water Type');
        }
        return new Validation(TypeRules._string(value, 20, ['user', 'shipment_weighted']), BLOCKER);
    },
    hot_water_year: function(value) {
        return this._installation_year(value, 1972);
    },
    hot_water_energy_factor: function(value) {
        let min, max;

        if (_homeValues.hot_water_type === 'storage') {
            [min, max] = [0.45, 1.0];
        } else if (_homeValues.hot_water_type === 'heat_pump') {
            [min, max] = [1, 4];
        } else if (_homeValues.hot_water_type === 'instantaneous') {
            [min, max] = [0.8, 1];
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
    is_income_eligible_program: function(value) {
        return new Validation(TypeRules._bool(value), ERROR);
    },

/*
 * CONDITION FUNCTIONS
 ***********************
 */

    /**
     * Validation for installation years
     * @param {int} minYear the minimum year the API will accept
     * @param {int} value the entered year
     * @return {Validation}
     */
    _installation_year: function(value, minYear) {
        if(parseInt(value) >= minYear) {
            return new Validation(TypeRules._int(value, parseInt(_homeValues.year_built), (new Date()).getFullYear()), ERROR);
        } else {
            return new Validation(TypeRules._int(value, minYear, (new Date()).getFullYear()), BLOCKER);
        }
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
     * Get combined roof area
     */
    _get_combined_roof_area: function() {
        return TypeRules._int_or_zero(_homeValues.roof_area_1) + TypeRules._int_or_zero(_homeValues.roof_area_2);
    },

    /*
     * Gets the first wall dimension for window area validations
     */
    _get_wall_dimension_left_right: function() {
        let area = this._get_footprint_area();
        if (area) {
            //Assume floor dimensions area 5x3
            return parseInt((Math.sqrt((3 * area) / 5)));
        } else {
            return false;
        }
    },
    
    /*
     * Gets the second wall dimension for window area validations
     */
    _get_wall_dimension_front_back: function() {
        let dimension1 = this._get_wall_dimension_front_back();
        if (dimension1) {
            //Assume floor dimensions area 5x3
            return dimension1 * (5 / 3);
        } else {
            return false;
        }
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
        let combinedRoofArea = this._get_combined_roof_area();
        let combinedFloorArea = this._get_combined_floor_area();
        if (combinedRoofArea <= combinedFloorArea * .95) { // Allow 5% error
            return "The roof does not cover the floor";
        } else {
            return false;
        }
    },

    /*
     * Checks that the roof_area and floor_areas are consistent with conditioned footprint areas
     */
    _check_conditioned_areas: function(combinedArea, thisAreaType) {
        let footprintArea = this._get_footprint_area();
        if (TypeRules._int_or_zero(_homeValues.num_floor_above_grade) === 0) {
            return "This home’s minumum footprint is unknown.  Please enter number of stories.";
        } else {
            if (footprintArea * .95 >= combinedArea) { // Allow 5% error
                return "This home’s minimum footprint is approximately "+footprintArea+"sqft, but you have only specified "+combinedArea+"sqft of total "+thisAreaType+". Please adjust any incorrect values. *The footprint is calculated as (<total area> - <conditioned basement area>) / <number of floors>";
            }
        }
    }
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

    for (var fieldName in requiredFields) {
        //Because we have two validation rules for one user input, here we check for potential duplicate messages
        if (undefined === homeValues[fieldName] || '' === homeValues[fieldName] || null === homeValues[fieldName]) {
            if ((fieldName === 'heating_fuel_1' && (homeValues['heating_type_1'] === 'none' || TypeRules._is_empty(homeValues['heating_type_1']))) ||
                (fieldName === 'heating_fuel_2' && (homeValues['heating_type_2'] === 'none' || TypeRules._is_empty(homeValues['heating_type_2'])))) {
                /*
                 * If heating_fuel_ is not entered, we must check if heating_type_ is 'none'
                 * (that is, the user selecting "None").  In this scenario, heating_fuel_ is not required.
                 * Further, if both are empty, we do not need to see the validation message for both.
                 */
            } else if (homeValues['hot_water_type'] && TypeRules._is_empty(homeValues['hot_water_fuel'])) {
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
    let requiredFields = require('./required_fields.node')(homeValues);

    return get_validation_messages(homeValues, requiredFields, additionalRules);
}

/**
 * @param {Object} homeValues Key/value pairs. The keys should be identical to the "name" attributes of the
 * corresponding form fields.
 * @returns {Object} Keys are the same as in homeValues. Values are error strings. In the event that no
 * validation rules were violated, an empty object is returned.
 */
function validate_address (homeValues) {
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
