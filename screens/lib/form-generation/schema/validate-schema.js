/**
 * @module schema/validate-schema
 * @description Schema validation utilities
 */

/**
 * Validates schema structure
 * @param {Object} schema - Schema to validate
 * @throws {Error} If schema structure is invalid
 */
export const validateSchema = ( schema ) => {
  if ( !schema?.fields ) {
    throw new Error( 'Schema must contain fields property' );
  }

  if ( !Array.isArray( schema.fields ) ) {
    throw new Error( 'Schema fields must be an array' );
  }
};

/**
 * Validates individual schema field
 * @param {Object} field - Field to validate
 * @returns {boolean} True if field is valid
 * @throws {Error} If field structure is invalid
 */
export const validateField = ( field ) => {
  if ( !field.type ) {
    throw new Error( 'Field must have a type' );
  }

  if ( !field.label ) {
    throw new Error( 'Field must have a label' );
  }

  return true;
};