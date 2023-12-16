"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Command-line tool for performing validation of a Home Energy Score building. The home audit inputs are passed in
 * JSON format as an argument, and the validation results are returned in JSON format via standard output.
 *
 * Example:
 * node home_audit.cli.js '{"solar_electric_capacity_known" : "3"}'
 * > {"solar_electric_capacity_known":"3 is outside the allowed range (0 - 1)"}
 */
var fs_1 = require("../fs");
var home_audit_ts_1 = require("./home_audit.ts");
var input = process.argv[2];
// Check if the input is a file path and read the file
if (fs_1.default.existsSync(input)) {
    input = fs_1.default.readFileSync(input, 'utf8');
}
var obj = JSON.parse(input.toString());
// Theoretically, a caller should be passing only the actual building definition, but to be user
// friendly, if they pass an entire HES JSON object, we will extract out the building_unit
// object, which is what we are actually able to validate
var result = (0, home_audit_ts_1.default)(obj.building_unit || obj);
console.log(JSON.stringify(result, null, 2));
