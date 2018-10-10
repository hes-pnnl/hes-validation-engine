let global = global || window;

global.HESValidationEngine = {

    BLOCKER : 'blocker',
    ERROR : 'error',
    MANDATORY : 'mandatory',

    /**
     * @param {Object} homeValues Key/value pairs. The keys should be identical to the "name" attributes of the
     * corresponding form fields.
     * @returns {Object} Keys are the same as in homeValues. Values are error strings. In the event that no
     * validation rules were violated, an empty object is returned.
     */
    validate_home_audit: function(homeValues) {
        let result = {};
        result[BLOCKER] = {};
        result[ERROR] = {};
        result[MANDATORY] = {};
        let requiredFields = require('./required_fields.node')(homeValues);
        for (var fieldName in requiredFields) {
            //Because we have two validation rules for one user input, here we check for potential duplicate messages
            if (undefined === homeValues[fieldName] || '' === homeValues[fieldName] || null === homeValues[fieldName]) {
                if ((fieldName === 'heating_fuel_1' && (homeValues['heating_type_1'] === 'none' || homeValues['heating_type_1'] === '')) ||
                    (fieldName === 'heating_fuel_2' && (homeValues['heating_type_2'] === 'none' || homeValues['heating_type_2'] === ''))) {
                    /*
                     * If heating_fuel_ is not entered, we must check if heating_type_ is 'none'
                     * (that is, the user selecting "None").  In this scenario, heating_fuel_ is not required.
                     * Further, if both are empty, we do not need to see the validation message for both.
                     */
                } else if (fieldName === 'hot_water_type' && homeValues['hot_water_fuel'] === '') {
                    // Do nothing ... avoid duplicate messages
                } else {
                    result[MANDATORY][fieldName] = requiredFields[fieldName];
                }
            }
        }
        for (let [fieldName, value] of Object.entries(homeValues)) {
            if (value === null || value === undefined || value.length === 0) {
                continue;
            }
            if (typeof(validationRules[fieldName]) !== 'function') {
                console.error("Missing a validation rule for field " + fieldName);
                continue;
            }
            let validationResult = validationRules[fieldName](value, homeValues);
            if (undefined !== validationResult) {
                if (undefined !== validationResult['message']) {
                    result[validationResult['type']][fieldName] = validationResult['message'];
                }
            }
        }
        return result;
    }
}

module.exports = validate_home_audit;
