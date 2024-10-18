import { validate_address } from "./home_audit";
console.log(validate_address(JSON.parse(process.argv[2])));