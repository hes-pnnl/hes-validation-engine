# hes-validation-engine

  HES-VALIDATION-ENGINE provides validation for home values, entries in the Home Energy Scoring Tool
     home_audit.ts defines validation rules/restrictions for HES home values
     home_audit.cli.ts is a CLI tool for invoking the validation engine

# Build instructions
To build this application, first install dependencies with `npm install`, 
then run `npm run build`.

# Execution instructions
To run this application from the command line, build the application and then call `node dist/src/home_audit.cli.js`.

To use this application as a Javascript/Typescript dependency, build it (for Javascript) and then import 
getNestedValidationMessages() from home_audit.js. That method can be called with an HES home object as 
its only parameter, and returns validation results.