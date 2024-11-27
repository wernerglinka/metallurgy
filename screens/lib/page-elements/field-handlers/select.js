/**
 * @module field-handlers/select
 * @description Handler for select field type
 */
export const updateSelectField = ( element, field ) => {
  element.querySelector( '.element-label' ).value = field.label;

  const originalValueElement = element.querySelector( '.element-value' );
  const originalValueParent = originalValueElement.parentNode;
  originalValueElement.remove();

  const selectElement = document.createElement( 'select' );
  selectElement.classList.add( 'element-value' );

  field.options.forEach( option => {
    const optionElement = document.createElement( 'option' );
    optionElement.value = option.value;
    optionElement.textContent = option.label;
    if ( option.value === field.default ) {
      optionElement.selected = true;
    }
    selectElement.appendChild( optionElement );
  } );

  selectElement.value = field.default;
  originalValueParent.appendChild( selectElement );

  return element;
};