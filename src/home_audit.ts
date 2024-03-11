import HesJsonSchema from './schema/hescore_json.schema.js'
import { Building } from "./types/Building.type"
import Ajv from 'ajv'
import { ErrorObject as AjvErrorObject } from 'ajv/dist/types'
import addFormats from 'ajv-formats'

type Zone = Building["zone"]
type Floor = Exclude<Zone["zone_floor"], undefined>[number]
type Wall = Zone['zone_wall'][number]
type Roof = Zone["zone_roof"][number]
type About = Building["about"]
type Systems = Building["systems"]
type HotWater = Systems["domestic_hot_water"]
type HVACSystem = Systems["hvac"][number]
type HeatingSystem = Exclude<HVACSystem["heating"], undefined>
type HeatingType = HeatingSystem["type"]
type CoolingSystem = Exclude<HVACSystem["cooling"], undefined>
type CoolingType = CoolingSystem["type"]
type DistributionSystem = Exclude<HVACSystem["hvac_distribution"], undefined>

const ajv:Ajv = new Ajv({ allErrors: true, strictTypes: false, strictSchema: false })
addFormats(ajv)

// Add the schema to the validator
ajv.addSchema(HesJsonSchema)
// Add the custom keyword "error_msg" to the validator
ajv.addKeyword('error_msg')

function isNullOrUndefined(value:any):boolean
{
    return [null, undefined].includes(value)
}

interface ErrorMessages {
    // Keys are paths to the field triggering the error, values are arrays of strings describing the error(s)
    // triggered by that field
    [key: string]: string[]|undefined
}

/**
 * Perform the HES validation for the nested JSON format. Uses the JSON Schema for initial required field and field
 * limit validations (e.g. enums, within bounds, etc) and then performs secondary cross validation across the building
 * as a whole (e.g. the roof area is large enough to cover the floor area)
 * @param {Building} homeValues
 * @return Error messages
 * Messages are grouped by path in the JSON Schema to the error, and can contain multiple errors for a
 * single item in the JSON Schema.
 */
let _errorMessages: ErrorMessages = {}

export function validate(homeValues: Building): ErrorMessages
{
    _errorMessages = {}

    // Don't perform cross-object validation unless the building JSON is valid
    if(!ajv.validate(HesJsonSchema, homeValues)){
        // if ajv.validate() returns false, then ajv.errors should always be populated,
        // but TypeScript doesn't like us calling forEach on a value that's not guaranteed
        // to be set
        if (ajv.errors) {
            ajv.errors.forEach((error) => {
                const {
                    instancePath,
                    params: { missingProperty }
                } = error
                const errorPath = missingProperty ? `${instancePath}/${missingProperty}` : instancePath
                const errorMessage = getMessageFromAjvError(error)
                if (errorMessage) {
                    addErrorMessage(errorPath, errorMessage)
                }
            })
        }
    } else {
        getCrossValidationMessages(homeValues)
    }

    return _errorMessages
}

/**
 * Convert the AJV error into an intelligible error message that the HES system knows how to display
 * @param {AjvErrorObject} errorObj
 * @return {string|undefined}
 */
function getMessageFromAjvError(errorObj: AjvErrorObject): string | undefined
{
    const { keyword, message, schemaPath, params } = errorObj
    const keyArr = schemaPath.split('/')
    keyArr.shift() // remove '#'

    // If it's a keyword that's too deep we should pop it to get the right
    // level for the error message
    if(['required', 'const'].includes(keyword)) {
        keyArr.pop()
    }

    const error_leaf: any = keyArr.reduce(
        (acc: any, key: string) => acc[key],
        HesJsonSchema
    )

    // This property can be set in the schema to override the default error
    // with a rule-specific error message.
    if(error_leaf.error_msg) {
        return error_leaf.error_msg
    }

    switch (keyword) {
        case 'required':
            return "Missing value for mandatory field"
        case 'enum':
            return `${message}: '${error_leaf.join('\', \'')}'`
        case 'additionalProperties':
            return `Unexpected property '${params.additionalProperty}'`
        case 'if':
        case 'not':
            // Some keywords indicate errors that we don't want to include in our output
            return undefined
        default:
            return message
    }
}

/**
 * Get Cross Validation messages for the building to check for other errors.
 * @param {object} homeValues
 */
function getCrossValidationMessages (homeValues: Building): void
{
    getAboutObjectCrossValidationMessages(homeValues)
    getZoneCrossValidationMessages(homeValues.zone, homeValues.about)
    getSystemCrossValidation(homeValues.systems)
}

/**
 * Helper function to add the validation messages easily to the object
 * @param {string} path Path in the nested schema to the error area in the building object
 * @param {string} message Validation error message
 */
function addErrorMessage(path: string, message: string): void
{
    if(message) {
        if (!(path in _errorMessages)) {
            _errorMessages[path] = []
        }

        // NOTE: Because of potential duplicate $refs in the schema to the same rules,
        // we de-duplicate the error message here
        if(!_errorMessages[path]!.includes(message)) {
            _errorMessages[path]!.push(message)
        }
    }
}

/**
 * Cross validations for the "About" object in the nested JSON Schema
 */
function getAboutObjectCrossValidationMessages(building: Building): void
{
    const {
        about: {
            assessment_date: assessmentDate,
            year_built: yearBuilt
        }
    } = building
    const today = new Date()

    // The JSON schema ensures that the assessment date is a valid date string, but since it can't validate
    // minimum or maximum values, we have to do that validation in JavaScript
    const MIN_ASSESSMENT_DATE:string = '2010-01-01'
    const assessmentDateMs: number = Date.parse(assessmentDate)
    const minDateMs: number = Date.parse(MIN_ASSESSMENT_DATE)
    const todayMs: number = Date.now()

    if (assessmentDateMs < minDateMs || assessmentDateMs > todayMs) {
        const todayFormatted: string = today.toISOString().split('T')[0]
        addErrorMessage(`/about/assessment_date`, `${assessmentDate} is outside the allowed range ${MIN_ASSESSMENT_DATE} - ${todayFormatted}`)
    }

    const maxYear: number = today.getFullYear()
    if (yearBuilt > maxYear) {
        addErrorMessage(`/about/year_built`, `${yearBuilt} is greater than the maximum of ${maxYear}`)
    }
}


/**
 * Cross validation for the "Zone" object in the nested JSON Schema
 */
function getZoneCrossValidationMessages(zone:Zone, about:About): void
{
    const {
        zone_wall: walls,
        zone_floor: floors,
        zone_roof: roofs,
    } = zone

    checkWindowSidesValid(walls)
    checkWindowAreaValid(walls, floors, about)

    getAdditionalRoofZoneValidations(floors, roofs, about)
    getAdditionalFloorZoneValidations(floors, roofs, about)
}

function checkWindowSidesValid(walls: Wall[]): void {
    const sides: string[] = walls.map(wall => wall.side || '')
    const duplicateSides: string[] = sides.filter(
        (side, index) => sides.indexOf(side) !== index
    )

    duplicateSides.forEach(side =>
        addErrorMessage('/zone/zone_wall', `Duplicate wall side "${side}" detected. Ensure that each zone wall has a unique side`)
    )
}

/**
 * Zone window must be smaller than the wall area
 */
function checkWindowAreaValid(walls: Wall[], floors: Floor[], about:About): void
{
    walls.forEach(({side, zone_window}, index) => {
        const wall_area = getWallArea(floors, about, ['front', 'back'].includes(side || ''))
        if(zone_window && wall_area) {
            const {window_area} = zone_window
            if(window_area && window_area > wall_area) {
                addErrorMessage(`zone/zone_wall/${index}/zone_window/window_area`, `Window area too large for wall.`)
            }
        }
    })
}

/**
 * Wall must be appropriate length for the conditioned footprint of the building
 */
function getWallLength(floors:Floor[], about:About, is_front_back:boolean):number|false
{
    const conditioned_footprint:number = getBuildingConditionedFootprint(about, floors)
    if(conditioned_footprint) {
        return Math.floor(
            (is_front_back
                ? Math.sqrt((5 * conditioned_footprint) / 3)
                : Math.sqrt((3 * conditioned_footprint) / 5)
            )
        )
    }
    return false
}

/**
 * Gets the total wall area of the home
 */
function getWallArea(floor:Floor[], about:About, is_front_back:boolean): number|false
{
    const length = getWallLength(floor, about, is_front_back)
    const height = about?.floor_to_ceiling_height
    const stories = about?.num_floor_above_grade
    if(length && height && stories) {
        let one_story_area = length * height
        if(is_front_back) {
            one_story_area -= 20
        }
        return Math.floor(one_story_area * stories)
    }
    return false
}

/**
 * Do the cross validations for the zone roof
 */
function getAdditionalRoofZoneValidations(floors: Floor[], roofs: Roof[], about: About): void
{
    const conditioned_footprint = getBuildingConditionedFootprint(about, floors)

    // Roof area
    checkRoofArea(floors, roofs, conditioned_footprint, 'roof_area')
    // Ceiling area
    checkRoofArea(floors, roofs, conditioned_footprint, 'ceiling_area')
    // Knee wall area
    checkKneeWallArea(roofs, conditioned_footprint)
    // Skylight area
    checkSkylightArea(roofs, conditioned_footprint)
}

/**
 * Check that the skylight isn't too big for the roof
 */
function checkSkylightArea(roofs: Roof[], conditioned_footprint: number): void
{
    // Skylights must be smaller than the conditioned footprint
    let zone_skylight_area = 0
    roofs.forEach((roof) => {
        const {zone_skylight} = roof
        if(zone_skylight && zone_skylight.skylight_area) {
            zone_skylight_area += zone_skylight.skylight_area
        }
    })
    if(zone_skylight_area > conditioned_footprint) {
        roofs.forEach((roof, index) => {
            if(roof.zone_skylight && roof.zone_skylight.skylight_area) {
                addErrorMessage(`zone/zone_roof/${index}/zone_skylight/skylight_area`, `Total skylight area exceeds the maximum allowed ${conditioned_footprint} sqft`)
            }
        })
    }
}

/**
 * Check that the knee wall is not too big for the attic
 */
function checkKneeWallArea(roofs:Roof[], conditioned_footprint:number): void
{
    const max_knee_wall_area = (2 * conditioned_footprint) / 3
    const knee_walls:object[] = []
    roofs.forEach(roof => {
        if (roof.knee_wall) {
            knee_walls.push(roof.knee_wall)
        }
    })
    const combined_knee_wall_area = getSumOfObjectPropertiesByFieldName(knee_walls, 'area')
    if(combined_knee_wall_area > max_knee_wall_area) {
        roofs.forEach((roof, index) => {
            if(roof.knee_wall && roof.knee_wall.area) {
                addErrorMessage(`zone/zone_roof/${index}/knee_wall/area`, `Total knee wall area exceeds the maximum allowed ${Math.ceil(max_knee_wall_area)} sqft (2/3 the footprint area).`)
            }
        })
    }
}

/**
 * Check that the roof area isn't too big for the roof type
 */
function checkRoofArea(
    floors:Floor[],
    roofs: Roof[],
    conditioned_footprint:number,
    type:'roof_area'|'ceiling_area'
): void
{
    const roof_type = type === 'roof_area' ? 'cath_ceiling' : 'vented_attic'
    const combined_type = type === 'roof_area' ? 'roof' : 'ceiling'
    const combined_area_invalid = getRoofCoversFloorErrorMessage(floors, roofs)
    if(!combined_area_invalid) {
        const combined_roof_ceil_area = getCombinedArea_roof_and_ceiling(roofs)
        const conditioned_area_invalid = getConditionedAreaErrorMessage(combined_roof_ceil_area, conditioned_footprint, combined_type)
        if(conditioned_area_invalid) {
            roofs.forEach((roof, index) => {
                if(roof.roof_type === roof_type) {
                    addErrorMessage(`/zone/zone_roof/${index}/${type}`, conditioned_area_invalid)
                }
            })
        }
    }
    else {
        roofs.forEach((roof, index) => {
            if(roof.roof_type === roof_type) {
                addErrorMessage(`/zone/zone_roof/${index}/${type}`, combined_area_invalid)
            }
        })
    }
}

/**
 * Check that the floor isn't too small for the combined area
 */
function checkFloorArea(floors: Floor[], roofs: Roof[], conditioned_footprint:number): void
{
    const combined_area_invalid = getRoofCoversFloorErrorMessage(floors, roofs)
    if(!combined_area_invalid) {
        const combined_floor_area = getCombinedArea_floor(floors)
        const conditioned_area_invalid = getConditionedAreaErrorMessage(combined_floor_area, conditioned_footprint, 'floor')
        if(conditioned_area_invalid) {
            floors.forEach((floor, index) => {
                addErrorMessage(`/zone/zone_floor/${index}/floor_area`, conditioned_area_invalid)
            })
        }
    }
    else {
        floors.forEach((roof, index) => {
            addErrorMessage(`/zone/zone_floor/${index}/floor_area`, combined_area_invalid)
        })
    }
}

/**
 * Check that the insulation level is appropriate for the foundation type
 */
function checkFoundationLevel(floors:Floor[]): void
{
    floors.forEach(({foundation_type, foundation_insulation_level}, index) => {
        if(
            foundation_type &&
            !["above_other_unit", "belly_and_wing"].includes(foundation_type) &&
            isNullOrUndefined(foundation_insulation_level)
        ) {
            let valid_insulation_levels:any[]
            let msg:string
            if(foundation_type === 'slab_on_grade') {
                valid_insulation_levels = [0, 5]
                msg = 'Insulation must be R-0 or R-5 for Slab on Grade Foundation'
            } else {
                valid_insulation_levels = [0, 11, 19]
                msg = 'Insulation must be R-0, R-11, or R-19 for current foundation type'
            }
            if (!valid_insulation_levels.includes(foundation_insulation_level)) {
                addErrorMessage(`/zone/zone_floor/${index}/foundation_insulation_level`, msg)
            }
        }
    })
}

/**
 * Check that the conditioned area is within the bounds for the building footprint. Returns
 * a string if the area is invalid, otherwise null.
 */
function getConditionedAreaErrorMessage(
    combined_area:number,
    conditioned_footprint:number,
    area_type:string
):string|null
{
    const min = conditioned_footprint * 0.95
    const max = conditioned_footprint * 2.5
    if(!((min < combined_area) && (combined_area < max))) {
        return `This home's minimum footprint is approximately ${conditioned_footprint}sqft, but you have specified ${combined_area}sqft of total ${area_type} area. The allowed range is (${Math.ceil(min)}sqft - ${Math.floor(max)}sqft). Please adjust any incorrect values. *The footprint is calculated as (<total area> - <conditioned basement area>) / <number of floors>`
    }
    return null
}

/**
 * Do the additional validations for the zone floors
 */
function getAdditionalFloorZoneValidations(floors: Floor[], roofs: Roof[], about: About): void
{
    const conditioned_footprint = getBuildingConditionedFootprint(about, floors)

    // Conditioned Footprint for home must be greater than 250 sq ft.
    if(conditioned_footprint < 250) {
        addErrorMessage('/about/conditioned_floor_area', `Home footprint must be greater than 250 sq ft. Current footprint is ${conditioned_footprint} sq ft.`)
    }

    // Floor area is within bounds of conditioned floor area
    checkFloorArea(floors, roofs, conditioned_footprint)

    // Validate foundation insulation level is correct for foundation type
    checkFoundationLevel(floors)
}

/**
 * Iterates over an array of objects, calculating the sum of a given field name from each object
 */
function getSumOfObjectPropertiesByFieldName(objects:{[key: string]: any}[], field_name:string):number
{
    const combined_area = objects.reduce(
        (val, obj) => val + (assertNumeric(obj[field_name]) || 0),
        0
    )
    return Math.floor(combined_area)
}

function getCombinedArea_floor(floors:Floor[]):number
{
    return getSumOfObjectPropertiesByFieldName(floors, 'floor_area')
}

function getCombinedArea_ceiling(roofs:Roof[]):number
{
    return getSumOfObjectPropertiesByFieldName(roofs, 'ceiling_area')
}

function getCombinedArea_roof(roofs:Roof[]):number
{
    return getSumOfObjectPropertiesByFieldName(roofs, 'roof_area')
}

function getCombinedArea_roof_and_ceiling(roofs:Roof[]):number
{
    return getCombinedArea_roof(roofs) + getCombinedArea_ceiling(roofs)
}

/**
 * Check that the roof is large enough to cover the floor area. Returns a string
 * if an error is found, otherwise null.
 */
function getRoofCoversFloorErrorMessage(floors:Floor[], roofs:Roof[]): string|null
{
    const combined_floor = getCombinedArea_floor(floors)
    const combined_roof_ceiling = getCombinedArea_roof_and_ceiling(roofs)
    if (combined_roof_ceiling <= (combined_floor * .95)) {
        return "The roof does not cover the floor"
    }
    return null
}

function getBuildingConditionedFootprint(
    {
        conditioned_floor_area,
        num_floor_above_grade
    }:About,
    floors:Floor[]
):number
{
    // For conditioned footprint, we need to subtract the area of any conditioned basement floors
    const conditioned_basement_area = floors.reduce((area:number, floor) =>
        area + (floor.foundation_type === 'cond_basement' && floor.floor_area || 0)
    , 0)
    const above_grade_area = conditioned_floor_area - conditioned_basement_area
    return Math.floor(above_grade_area / (num_floor_above_grade || 1))
}

/**
 * Get the Cross validation messages for the system of the JSON Schema
 */
function getSystemCrossValidation({hvac:hvacs, domestic_hot_water}:Systems): void
{
    if(hvacs) {
        checkHvacFraction(hvacs)
        hvacs.forEach(({heating, cooling, hvac_distribution}:HVACSystem, index) => {
            if (heating) {
                checkHeatingFuelValidForHeatingType(heating, index)
                checkHeatingEfficiencyValid(heating, index)
                checkSystemYear(heating, 'heating', index)
            }
            if (cooling) {
                checkCoolingEfficiencyValid(cooling, index)
                checkSystemYear(cooling, 'cooling', index)
            }
            if (heating && cooling) {
                checkHeatingCoolingTypeValid(heating.type, cooling.type, index)
            }
            if (hvac_distribution) {
                checkHvacDistribution(hvac_distribution, index)
            }
        })
    }
    if(domestic_hot_water) {
        checkHotWaterCategoryValid(domestic_hot_water, hvacs)
        checkHotWaterFuelValid(domestic_hot_water)
        checkHotWaterEfficiencyValid(domestic_hot_water)
        checkHotWaterYearValid(domestic_hot_water)
    }
}

/**
 * Check that the HVAC fraction is equal to 1 (100%)
 */
function checkHvacFraction(hvac_systems:HVACSystem[]): void
{
    const total_fraction = getSumOfObjectPropertiesByFieldName(hvac_systems, 'hvac_fraction')
    if(total_fraction !== 1) {
        hvac_systems.forEach((hvac_system, index) => {
            if (hvac_system.hvac_fraction) {
                addErrorMessage(`systems/hvac/${index}/hvac_fraction`, `Total HVAC Fraction must equal 100%`)
            }
        })
    }
}

const HEATING_FUEL_TO_TYPE = {
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
}
function checkHeatingFuelValidForHeatingType({fuel_primary, type}:HeatingSystem, index:number): void
{
    // According to the type definitions, it is possible for fuel_primary or type to be undefined.
    if (!fuel_primary || !type) {
        return
    }

    if(HEATING_FUEL_TO_TYPE[fuel_primary] && !HEATING_FUEL_TO_TYPE[fuel_primary].includes(type)) {
        addErrorMessage(
            `systems/hvac/${index}/heating/fuel_primary`,
            `${fuel_primary} is not an appropriate fuel for heating type ${type}`
        )
    }
}

/**
 * Check that the heating and cooling types are mutually compatible
 */
function checkHeatingCoolingTypeValid(heating_type:HeatingType, cooling_type:CoolingType, index:number): void
{
    // Validate the cooling type is valid for the heating type
    let heat_cool_valid = true
    switch(cooling_type) {
        // If cooling is heat_pump or gchp, heating type must match, be wood_stove, or be none
        case 'heat_pump':
        case 'gchp':
            if(!heating_type || ![cooling_type, 'wood_stove', 'none'].includes(heating_type)) {
                heat_cool_valid = false
            }
            break
        case 'mini_split':
            if(!heating_type || ['heat_pump', 'gchp'].includes(heating_type)){
                heat_cool_valid = false
            }
            break
        case 'split_dx':
            if(!heating_type || ['heat_pump', 'gchp', 'mini_split'].includes(heating_type)){
                heat_cool_valid = false
            }
            break
        case 'dec':
            if(!heating_type || ['gchp'].includes(heating_type)){
                heat_cool_valid = false
            }
            break
    }
    if(!heat_cool_valid) {
        addErrorMessage(`systems/hvac/${index}/heating/type`, `${heating_type} is not an appropriate heating type with cooling type ${cooling_type}`)
    }
}

/**
 * Check that the efficiency method is valid for the heating type
 */
function checkHeatingEfficiencyValid({type, fuel_primary, efficiency_method}:HeatingSystem, index:number): void
{
    if(efficiency_method &&
        ([null, undefined, 'baseboard', 'wood_stove', 'none'].includes(type) ||
        (type === 'central_furnace' && fuel_primary === 'electric'))
    ) {
        addErrorMessage(`systems/hvac/${index}/heating/efficiency_method`, `Efficiency method should not be set if heating type is "central furnace" and fuel is "electric", or if heating type is "baseboard", "wood stove", "none", or empty`)
    }
    if(efficiency_method === 'shipment_weighted') {
        if(type === 'wall_furnace' && fuel_primary !== 'natural_gas') {
            addErrorMessage(`systems/hvac/${index}/heating/efficiency_method`, `Efficiency method must be "user" if heating type is "wall_furnace" and fuel is not "natural_gas"`)
        }
        if(type && ['mini_split', 'gchp'].includes(type)) {
            addErrorMessage(`systems/hvac/${index}/heating/efficiency_method`, `Heating efficiency method must be "user" when heating type is "${type}"`)
        }
    }
}

/**
 * Check that the efficiency method is valid for the cooling type
 */
function checkCoolingEfficiencyValid(cooling:CoolingSystem, index:number): void
{
    const {type, efficiency_method} = cooling
    if(efficiency_method && [null, undefined, 'none', 'dec'].includes(type)) {
        addErrorMessage(`systems/hvac/${index}/cooling/efficiency_method`, `Efficiency method should not be set if cooling type is "none", "direct evaporative cooler", or empty`)
    }
    if(efficiency_method !== 'user' && type && ['mini_split', 'gchp'].includes(type)) {
        addErrorMessage(`systems/hvac/${index}/cooling/efficiency_method`, `Cooling efficiency must be 'user' when type is '${type}'`)
    }
}

/**
 * Check that the HVAC system is of a valid year
 */
const MIN_SYSTEM_YEAR = 1970
const MAX_SYSTEM_YEAR = (new Date()).getFullYear() // this year
function checkSystemYear({year}:HeatingSystem|CoolingSystem, name:'heating'|'cooling', index:number): void
{
    if(year && (MIN_SYSTEM_YEAR > year || year > MAX_SYSTEM_YEAR)) {
        addErrorMessage(
            `systems/hvac/${index}/${name}/year`,
            `Invalid year, must be between ${MIN_SYSTEM_YEAR} and ${MAX_SYSTEM_YEAR}`
        )
    }
}

/**
 * Check that the total HVAC distribution is 1 (100%)
 */
function checkHvacDistribution(hvac_distribution:DistributionSystem, index:number): void
{
    const {leakage_method, leakage_to_outside, duct:ducts} = hvac_distribution

    if(leakage_to_outside && leakage_method === 'qualitative') {
        addErrorMessage(`systems/hvac/${index}/hvac_distribution/leakage_to_outside`, "Leakage should not be passed for your system if the method is 'qualitative'")
    }

    // If we have ducts, we need to ensure the fraction is 100%
    if(ducts) {
        const total_fraction = getSumOfObjectPropertiesByFieldName(ducts, 'fraction')
        if(total_fraction !== 1) {
            ducts.forEach((duct, index) => {
                if(duct.fraction) {
                    addErrorMessage(
                        `systems/hvac/${index}/hvac_distribution/duct/${index}/fraction`,
                        `Total Duct Fraction must equal 100%`
                    )
                }
            })
        }
    }
}

/**
 * Check that if the hot water is 'combined' the HVAC system has a boiler
 */
function checkHotWaterCategoryValid({category}:HotWater, hvacs:HVACSystem[]): void
{
    const hvac_types:string[] = []
    hvacs.forEach((system) => {
        const {heating, cooling} = system
        heating?.type && hvac_types.push(heating.type)
        cooling?.type && hvac_types.push(cooling.type)
    })
    if(!hvac_types.includes('boiler') && category === 'combined') {
        addErrorMessage(`systems/domestic_hot_water/category`, 'Must have a boiler for combined hot water category')
    }
}

/**
 * Check that fuel is appropriate for the hot water system
 */
function checkHotWaterFuelValid({type, fuel_primary}:HotWater): void
{
    if(['tankless_coil', 'indirect'].includes(type) && fuel_primary) {
        addErrorMessage(`systems/domestic_hot_water/fuel_primary`, 'Fuel is only used if type is set to storage or heat pump')
    } else if(type === 'heat_pump' && fuel_primary !== 'electric') {
        addErrorMessage(`systems/domestic_hot_water/fuel_primary`, 'Fuel must be electric if type is heat pump')
    }
}

/**
 * Check that efficiency is appropriate for the hot water system
 */
function checkHotWaterEfficiencyValid({type, efficiency_method}:HotWater): void
{
    if(['heat_pump', 'tankless', 'tankless_coil'].includes(type) && efficiency_method === 'shipment_weighted') {
        addErrorMessage(`systems/domestic_hot_water/efficiency_method`, 'Invalid Efficiency Method for entered Hot Water Type')
    }
}

/**
 * Check that the year is appropriate for the hot water system
 */
function checkHotWaterYearValid({year}:HotWater): void
{
    if(year && (1972 > year || (new Date()).getFullYear() < year)) {
        addErrorMessage(`systems/domestic_hot_water/year`, `Invalid year, must be between 1972 and ${(new Date()).getFullYear()}`)
    }
}

/**
 * Given a number, just returns that number. Given a string, asserts that the string is numeric
 * and returns the number contained in the string
 */
function assertNumeric(value:number | string): number
{
    if (typeof value === "string") {
        value = Number(value)
        if (isNaN(value)) {
            throw new Error(`${value} is not a valid numeric string`)
        }
    }

    return value
}