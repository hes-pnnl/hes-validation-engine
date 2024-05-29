/**
 * Command-line tool for performing validation of a Home Energy Score building. The home audit inputs are passed in
 * JSON format as an argument, and the validation results are returned in JSON format via standard output.
 *
 * Example:
 * node home_audit.cli.js '{"solar_electric_capacity_known" : "3"}'
 * > {"solar_electric_capacity_known":"3 is outside the allowed range (0 - 1)"}
 */
import fs from 'fs'
import { validate } from './home_audit'
import {translateHomeValues} from "./translate_legacy";

let input_string: string = process.argv[2]
if (!input_string?.length) {
    console.error("You must pass a JSON string or file name as an argument to this script")
    process.exit()
}

// Check if the input is a file path and read the file
if(fs.existsSync(input_string)) {
    input_string = fs.readFileSync(input_string, 'utf8')
}

let input_obj: any = JSON.parse(input_string.toString())
const result = (input_obj.building_unit?.about || input_obj.about) ? validate(input_obj.building_unit || input_obj) : validate(translateHomeValues(input_obj))
console.log(JSON.stringify(result, null, 2))