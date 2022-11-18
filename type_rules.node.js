let TypeRules = {

    /**
     * @param {*} value
     * @param {Number=} min
     * @param {Number=} max
     */
    _int: function(value, min, max) {
        if (value != parseInt(value)) {
            return value + " is not a whole number."
        }
        if ((undefined !== min && value < min) || (undefined !== max && value > max)) {
            return value + " is outside the allowed range (" + min + " - " + max + ")";
        }
    },

    /**
     * @param {*} value
     * @param {Number=} min
     * @param {Number=} max
     * @param {bool} inclusive
     */
    _float: function(value, min, max, inclusive = true) {
        if (value != parseFloat(value)) {
            return value + " is not a number."
        }
        if (inclusive && ((undefined !== min && value < min) || (undefined !== max && value > max))) {
            return value + " is outside the allowed range (" + min + " - " + max + ")";
        } else if (!inclusive && ((undefined !== min && value <= min) || (undefined !== max && value >= max))) {
            return value + " is outside the allowed range (" + min + " - " + max + ")";
        }
    },

    /**
     * @param {*} value
     */
    _zip: function(value) {
        if (!(/(^\d{5}$)/.test(value))) {
            return value + " is not a valid zip-code."
        }
    },

    /**
     * @param {*} value
     */
    _bool: function(value) {
        if ((typeof(value) !== typeof(true)) && (value !== "true") && (value !== "false")) {
            return value + " is not a boolean.";
        }
    },

    /**
     * @param {string} value
     * @param {int=} length
     * @param {string[]=} options
     */
    _string: function(value, length, options) {
        if (undefined !== length && value.length > length) {
            return "Value must be less than " + length + " characters.";
        }
        if (undefined !== options) {
            if (options.indexOf(value) === -1) {
                return value + " is not a valid value. Valid values are '" + options.join("', '") + "'";
            }
        }
    },

    /**
     * @param {int} value
     */
    _percent: function(value) {
        if (parseInt(value) > 100) {
            return "Sum of fraction values may not exceed 100%"
        } else if (parseInt(value) < 100) {
            return "Fraction values must add to 100%"
        }
    },

    /**
     * @param {float} value
     */
    _fraction: function(value) {
        value = parseFloat(value.toFixed(10)); // Re-parse to avoid bit rounding inaccuracies
        if (value > 1) {
            return "Sum of fraction values may not exceed 100%"
        } else if (value < 1) {
            return "Fraction values must add to 100%"
        }
    },

    /**
     * Adapted from https://stackoverflow.com/a/6178341/1288633
     * @param {*} value
     * @param {int=} min Minimum valid date as ms since Unix epoch
     * @param {int=} max Maximum valid date as ms since Unix epoch
     */
    _date: function(value, min, max) {
        // First check for the pattern
        if (!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(value)) {
            return value + " is not a valid date";
        }

        // Parse the date parts to integers
        let parts = value.split("-");
        let day = parseInt(parts[2]);
        let month = parseInt(parts[1]);
        let year = parseInt(parts[0]);

        let monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        // Adjust for leap years
        if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
            monthLength[1] = 29;
        }

        // Check the range of the day
        if (month <= 0 || month > 12) {
            return value + " is not a valid date (impossible month)";
        }
        if (day <= 0 || day > monthLength[month - 1]) {
            return value + " is not a valid date (impossible day/month combination)";
        }

        let dateMs = Date.parse(value); // Number of ms since the Unix epoch
        if (dateMs < min) {
            return value + " is earlier than the earliest permitted date";
        }
        if (dateMs > max) {
            return value + " is later than the latest permitted date";
        }
    },

    /*
     * Return integer value if value is entered and numeric, else make zero
     */
    _int_or_zero: function(value) {
        if (isNaN(parseInt(value))) {
            return 0;
        } else {
            return parseInt(value);
        }
    },
    
    /*
     * Return true if value is '', null, or undefined
     */
    _is_empty: function(value) {
        if (value === '' || value === null || value === undefined) {
            return true;
        }
        return false;
    }
};

module.exports = TypeRules;
