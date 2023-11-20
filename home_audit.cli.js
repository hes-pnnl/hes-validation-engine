/**
 * Command-line tool for performing validation of a Home Energy Score building. The home audit inputs are passed in
 * JSON format as an argument, and the validation results are returned in JSON format via standard output.
 *
 * Example:
 * node home_audit.cli.js '{"solar_electric_capacity_known" : "3"}'
 * > {"solar_electric_capacity_known":"3 is outside the allowed range (0 - 1)"}
 */
import * as fs from 'fs';
import validateRequiredFields from './home_audit'; // Assuming home_audit.ts is a TypeScript file or has type declarations

let input = process.argv[2];

// If we have a file instead of a string, read the file for running against the validation engine
if (fs.existsSync(input)) {
    input = fs.readFileSync(input, 'utf-8');
}

const obj = JSON.parse(input);
const result = validateRequiredFields(obj);

console.log(JSON.stringify(result, null, 2));
