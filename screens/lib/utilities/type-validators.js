/**
 * @module utils/type-validators
 * @description Validation utilities for checking data types and structures
 */

/**
 * Checks if value is an array containing only strings
 * @param {*} value - Value to check
 * @returns {boolean} True if value is array of strings
 */
export const isSimpleList = ( value ) => {
  return Array.isArray( value ) && value.every( item => typeof item === 'string' );
};

/**
 * Validates if input can be parsed as a valid date
 * @param {string} input - Date string to validate
 * @returns {boolean} True if input is valid date string
 */
export const isDateString = ( input ) => {
  const parsedDate = new Date( input );
  return !isNaN( parsedDate.getTime() );
};

/**
 * Checks if input is a Date object
 * @param {*} input - Value to check
 * @returns {boolean} True if input is Date instance
 */
export const isDateObject = ( input ) => input instanceof Date;

/**
 * Determines value type for form field generation
 * @param {*} value - Value to analyze
 * @returns {string} Field type identifier
 */
export const getFieldType = ( value ) => {
  if ( isSimpleList( value ) ) return 'list';
  if ( isDateObject( value ) ) return 'date';
  if ( Array.isArray( value ) ) return 'array';
  if ( value === null ) return 'null';

  return typeof value;
};