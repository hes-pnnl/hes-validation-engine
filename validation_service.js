require('./home_audit.node');

/**
 * ValidationService - Defines functions used to trigger and evaluate the results of form validation
 */
HES.ValidationService = {

    REQUIRED_ADDRESS : [
        'address',
        'city',
        'state',
        'zip_code',
        'assessment_type',
    ],

    BLOCKER : 'blocker',
    ERROR  : 'error',
    MANDATORY  : 'mandatory',

    getHomeFactsValidationMessages : function (form) {
        let validate_home_audit = require('./home_audit.node');
        return validate_home_audit(HES.Utils.getValuesForValidation(form));
    },
};
