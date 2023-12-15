/**
 * Command-line tool for performing validation of a Home Energy Score building. The home audit inputs are passed in
 * JSON format as an argument, and the validation results are returned in JSON format via standard output.
 *
 * Example:
 * node home_audit.cli.js '{"solar_electric_capacity_known" : "3"}'
 * > {"solar_electric_capacity_known":"3 is outside the allowed range (0 - 1)"}
 */
import fs from "../fs";
import getNestedValidationMessages from './home_audit.ts';

let input: string = process.argv[2];

// Check if the input is a file path and read the file
if(fs.existsSync(input)) {
    input = fs.readFileSync(input, 'utf8');
}

const obj: object = JSON.parse(input.toString());

// Theoretically, a caller should be passing only the actual building definition, but to be user
// friendly, if they pass an entire HES JSON object, we will extract out the building_unit
// object, which is what we are actually able to validate
const result = getNestedValidationMessages(obj.building_unit || obj);

console.log(JSON.stringify(result, null, 2));