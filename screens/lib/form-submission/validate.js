// lib/form-submission/validate.js
import { validateSchema } from '../form-generation/schema/validate-schema.js';
import { isValidLabel } from '../utilities/form-field-validations.js';

/**
 * Validates a single form field based on its type and value
 * @param {string} key - Field name
 * @param {*} value - Field value
 * @param {string} type - Field type
 * @returns {string|null} Error message or null if valid
 */
const validateField = ( key, value, type ) => {
  // Skip empty values since nothing is required at this point
  if ( value === undefined || value === '' ) {
    return null;
  }

  // Only validate specific types
  switch ( type ) {
    case 'number':
      if ( value !== '' && typeof value !== 'number' && isNaN( Number( value ) ) ) {
        return `${ key } must be a valid number`;
      }
      break;

    case 'boolean':
      if ( value !== '' && typeof value !== 'boolean' && value !== 'true' && value !== 'false' ) {
        return `${ key } must be true or false`;
      }
      break;

    case 'date':
      if ( value !== '' && !( value instanceof Date ) && isNaN( Date.parse( value ) ) ) {
        return `${ key } must be a valid date`;
      }
      break;

    case 'array':
      if ( value !== '' && !Array.isArray( value ) ) {
        return `${ key } must be a list`;
      }
      break;
  }

  // Remove label validation since it was incorrectly validating content
  return null;
};

/**
 * Recursively validates form data object
 * @param {Object} data - Form data to validate
 * @param {Object} schema - Validation schema
 * @returns {Array<string>} Array of validation errors
 */
const validateFormData = ( data, schema ) => {
  const errors = [];

  Object.entries( data ).forEach( ( [ key, value ] ) => {
    const fieldSchema = schema?.properties?.[ key ] || {};
    const fieldType = fieldSchema.type || typeof value;

    // Validate field
    const fieldError = validateField( key, value, fieldType );
    if ( fieldError ) {
      errors.push( fieldError );
    }

    // Recursive validation for objects and arrays if they contain values
    if ( value && typeof value === 'object' ) {
      if ( Array.isArray( value ) ) {
        value.forEach( ( item, index ) => {
          if ( typeof item === 'object' ) {
            const itemErrors = validateFormData( item, fieldSchema.items );
            if ( itemErrors.length > 0 ) {
              errors.push( ...itemErrors.map( err => `${ key }[${ index }]: ${ err }` ) );
            }
          }
        } );
      } else {
        const nestedErrors = validateFormData( value, fieldSchema );
        if ( nestedErrors.length > 0 ) {
          errors.push( ...nestedErrors.map( err => `${ key }.${ err }` ) );
        }
      }
    }
  } );

  return errors;
};

/**
 * Main validation function for form submission
 * @param {Object} formData - Processed form data
 * @param {Object} schema - Form schema
 * @returns {Array<string>} Array of validation errors
 */
export const validateSubmission = ( formData, schema ) => {
  const errors = [];

  // Form data validation
  const formErrors = validateFormData( formData, schema );
  if ( formErrors.length ) {
    errors.push( ...formErrors );
  }

  return errors;
};