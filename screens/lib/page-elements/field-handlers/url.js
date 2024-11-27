/**
 * @module field-handlers/url
 * @description Updates URL and image field elements
 */
export const updateUrlField = ( element, field ) => {
  element.querySelector( '.element-label' ).value = field.label;

  const originalValueElement = element.querySelector( '.element-value' );
  const originalValueParent = originalValueElement.parentNode;
  originalValueElement.remove();

  const tempContainer = document.createElement( 'div' );
  tempContainer.innerHTML = `
    <input type="url" class="element-value" placeholder="${ field.placeholder }">
  `;

  while ( tempContainer.firstChild ) {
    originalValueParent.appendChild( tempContainer.firstChild );
  }

  return element;
};