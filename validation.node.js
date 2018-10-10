/**
 * Our Validation class holds a message and a type
 *
 * @param {string} message The validation message
 * @param {string} type The type of validation (BLOCKER, ERROR, MANDATORY)
 */
function Validation(message, type) {
   this.message = message;
   this.type = type;
}

Validation.prototype.getMessage = function() {
   return this.message;
};

Validation.prototype.getType = function() {
   return this.type;
};
