# hes-validation-engine

  HES-VALIDATION-ENGINE provides validation for home values, entries in the Home Energy Scoring Tool  
     validation.node.js holds our Validation class  
     home_audit.node.js contains validations rules/restrictions for entering the values themselves  
          type_rules.js provides rules for the given types (int, float, date, string, etc...)  
required_fields.node.js contains the conditions by which home values required by the system  
      home_audit.cli.ts runs our validation engine from the command line
