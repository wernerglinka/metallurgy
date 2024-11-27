/**
 * @module field-handlers/date
 * @description Updates date field elements
 */
import { formatDate } from '../../utilities/date-formatter.js';

export const updateDateField = ( element, field ) => {
  element.querySelector( '.element-label' ).value = field.label;

  const originalValueElement = element.querySelector( '.element-value' );
  const originalValueParent = originalValueElement.parentNode;
  originalValueElement.remove();

  const tempContainer = document.createElement( 'div' );
  tempContainer.innerHTML = `
    <input type="date" class="element-value" value="${ formatDate( field.value ) }">
  `;

  while ( tempContainer.firstChild ) {
    originalValueParent.appendChild( tempContainer.firstChild );
  }

  return element;
};