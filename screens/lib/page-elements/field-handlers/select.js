/**
 * @module field-handlers/select
 * @description Handler for select field type
 */
export const updateSelectField = ( element, field ) => {
  element.querySelector( '.element-label' ).value = field.label;
  // Remove original value element and replace with select element
  // For example, a text field being replaced by a select element
  const originalValueElement = element.querySelector( '.element-value' );
  const originalValueParent = originalValueElement.parentNode;
  originalValueElement.remove();

  const selectElement = document.createElement( 'select' );
  selectElement.classList.add( 'element-value' );

  field.options.forEach( option => {
    const optionElement = document.createElement( 'option' );
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    optionElement.selected = option.value === ( field.value || field.default );
    selectElement.appendChild( optionElement );
  } );

  originalValueParent.appendChild( selectElement );

  return element;
};