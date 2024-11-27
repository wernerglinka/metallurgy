/**
 * @module field-handlers/checkbox
 * @description Updates checkbox field elements 
 */
export const updateCheckboxField = ( element, field ) => {
  element.querySelector( '.element-value' ).checked = field.value;
  element.querySelector( '.element-label' ).value = field.label;
  return element;
};