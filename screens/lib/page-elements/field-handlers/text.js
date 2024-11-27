/**
 * @module field-handlers/text
 * @description Updates text field elements
 */
export const updateTextField = ( element, field ) => {
  element.querySelector( '.element-label' ).value = field.label;
  const textInputValue = element.querySelector( '.element-value' );
  textInputValue.value = field.value;
  textInputValue.placeholder = field.placeholder;
  return element;
};