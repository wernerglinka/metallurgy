/**
 * @module field-handlers/textarea
 * @description Updates textarea field elements
 */
import { initializeEditor } from '../../editor/setup.js';

export const updateTextareaField = ( element, field, useEditor = true ) => {
  element.querySelector( '.element-label' ).value = field.label;

  const originalValueElement = element.querySelector( '.element-value' );
  const originalValueParent = originalValueElement.parentNode;
  originalValueElement.remove();

  const tempContainer = document.createElement( 'div' );
  tempContainer.innerHTML = `
    <textarea class="element-value is-editor" placeholder="Click to open editor">${ field.value }</textarea>
  `;

  while ( tempContainer.firstChild ) {
    originalValueParent.appendChild( tempContainer.firstChild );
  }

  if ( !document.getElementById( 'editorWrapper' ) && useEditor ) {
    window.mdeditor = initializeEditor();
  }

  return element;
};