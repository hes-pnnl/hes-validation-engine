/**
 * Command-line tool for performing validation of a Home Energy Score building. The home audit inputs are passed in
 * JSON format as an argument, and the validation results are returned in JSON format via standard output.
 *
 * Example:
 * node home_audit.cli.js '{"solar_electric_capacity_known" : "3"}'
 * > {"solar_electric_capacity_known":"3 is outside the allowed range (0 - 1)"}
 */
let validate_home_audit = require('./home_audit.node');

const obj = JSON.parse(process.argv[2]);
const result = validate_home_audit(obj);
console.log(JSON.stringify(result));
