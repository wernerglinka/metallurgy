/**
 * @module field-handlers/number
 * @description Updates number field elements
 */
export const updateNumberField = ( element, field ) => {
  element.querySelector( '.element-label' ).value = field.label;
  const numberFieldValue = element.querySelector( '.element-value' );
  numberFieldValue.value = field.value;
  numberFieldValue.placeholder = field.placeholder;
  return element;
};