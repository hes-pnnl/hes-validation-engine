/**
 * Command-line tool for performing validation of a Home Energy Score building. The home audit inputs are passed in
 * JSON format as an argument, and the validation results are returned in JSON format via standard output.
 *
 * Example:
 * node home_audit.cli.js '{"solar_electric_capacity_known" : "3"}'
 * > {"solar_electric_capacity_known":"3 is outside the allowed range (0 - 1)"}
 */
let hes_validation_engine = require('hes-validation-engine');
let validate_address = hes_validation_engine.validate_address;
let validate_home_audit = hes_validation_engine.validate_home_audit;

const obj = JSON.parse(process.argv[2]);
let result = Object.assign(validate_address(obj), validate_home_audit(obj))
console.log(JSON.stringify(result));
