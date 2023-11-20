interface TypeRules {
    _int(value: any, min?: number, max?: number): string | undefined;
    _float(value: any, min?: number, max?: number, inclusive?: boolean): string | undefined;
    _zip(value: any): string | undefined;
    _bool(value: any): string | undefined;
    _string(value: string, length?: number, options?: string[]): string | undefined;
    _percent(value: any): string | undefined;
    _fraction(value: any): string | undefined;
    _date(value: string, min?: number, max?: number): string | undefined;
    _int_or_zero(value: any): number;
    _is_empty(value: any): boolean;
  }
  
  const TypeRules: TypeRules = {
  
    _int(value, min, max) {
      if (value !== parseInt(value)) {
        return value + " is not a whole number.";
      }
      if ((min !== undefined && value < min) || (max !== undefined && value > max)) {
        return value + " is outside the allowed range (" + min + " - " + max + ")";
      }
    },
  
    _float(value, min, max, inclusive = true) {
      if (value !== parseFloat(value)) {
        return value + " is not a number.";
      }
      if (inclusive && ((min !== undefined && value < min) || (max !== undefined && value > max))) {
        return value + " is outside the allowed range (" + min + " - " + max + ")";
      } else if (!inclusive && ((min !== undefined && value <= min) || (max !== undefined && value >= max))) {
        return value + " is outside the allowed range (" + min + " - " + max + ")";
      }
    },
  
    _zip(value) {
      if (!(/(^\d{5}$)/.test(value))) {
        return value + " is not a valid zip-code.";
      }
    },
  
    _bool(value) {
      if ((typeof (value) !== typeof (true)) && (value !== "true") && (value !== "false")) {
        return value + " is not a boolean.";
      }
    },
  
    _string(value, length, options) {
      if (length !== undefined && value.length > length) {
        return "Value must be less than " + length + " characters.";
      }
      if (options !== undefined) {
        if (options.indexOf(value) === -1) {
          return value + " is not a valid value. Valid values are '" + options.join("', '") + "'";
        }
      }
    },
  
    _percent(value) {
      if (parseInt(value) > 100) {
        return "Sum of fraction values may not exceed 100%";
      } else if (parseInt(value) < 100) {
        return "Fraction values must add to 100%";
      }
    },
  
    _fraction(value) {
      value = parseFloat(value.toFixed(10)); // Re-parse to avoid bit rounding inaccuracies
      if (value > 1) {
        return "Sum of fraction values may not exceed 100%";
      } else if (value < 1) {
        return "Fraction values must add to 100%";
      }
    },
  
    _date(value, min, max) {
      if (!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(value)) {
        return value + " is not a valid date";
      }
  
      let parts = value.split("-");
      let day = parseInt(parts[2]);
      let month = parseInt(parts[1]);
      let year = parseInt(parts[0]);
  
      let monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
      if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
        monthLength[1] = 29;
      }
  
      if (month <= 0 || month > 12) {
        return value + " is not a valid date (impossible month)";
      }
      if (day <= 0 || day > monthLength[month - 1]) {
        return value + " is not a valid date (impossible day/month combination)";
      }
  
      let dateMs = Date.parse(value);
      if (min && dateMs < min) {
        return value + " is earlier than the earliest permitted date";
      }
      if (max && dateMs > max) {
        return value + " is later than the latest permitted date";
      }
    },
  
    _int_or_zero(value) {
      if (isNaN(parseInt(value))) {
        return 0;
      } else {
        return parseInt(value);
      }
    },
  
    _is_empty(value) {
      if (value === '' || value === null || value === undefined) {
        return true;
      }
      return false;
    }
  };
  
  export default TypeRules;
  