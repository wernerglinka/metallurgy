/**
 * @module date-formatter
 * @description Date formatting utilities
 */

/**
 * Formats date string to yyyy-MM-dd
 * @param {string} inputDateString - Input date string
 * @returns {string} Formatted date or "Invalid Date"
 */
export const formatDate = ( inputDateString ) => {
  const inputDate = new Date( inputDateString );
  if ( isNaN( inputDate.getTime() ) ) return "Invalid Date";

  const year = inputDate.getFullYear();
  const month = String( inputDate.getMonth() + 1 ).padStart( 2, "0" );
  const day = String( inputDate.getDate() ).padStart( 2, "0" );

  return `${ year }-${ month }-${ day }`;
};