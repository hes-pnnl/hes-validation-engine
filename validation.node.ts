/**
 * Our Validation class holds a message and a type
 */
class Validation {
   private message: string | undefined;
   private type: string;

   /**
    * Constructor for the Validation class
    * @param {string} message The validation message
    * @param {string} type The type of validation (BLOCKER, ERROR, MANDATORY)
    */
   constructor(message: string | undefined, type: string) {
       this.message = message;
       this.type = type;
   }

   /**
    * Get the validation message
    * @returns {string} The validation message
    */
   getMessage(): string | undefined {
       return this.message;
   }

   /**
    * Get the type of validation
    * @returns {string} The type of validation
    */
   getType(): string {
       return this.type;
   }
}

export default Validation;
