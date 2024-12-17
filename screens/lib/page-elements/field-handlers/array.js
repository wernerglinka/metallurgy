import { ICONS } from '../../../icons/index.js';
import { addDragHandle } from '../../drag/handle.js';
import { addActionButtons } from '../../buttons/form-actions.js';

/**
 * @function updateArrayElement
 * @param {HTMLElement} element - The element to update
 * @param {Object} field - The field data
 * @returns {HTMLElement} The updated element
 */
export function updateArrayElement( element, field, labelsExist ) {
  const labelInput = element.querySelector( '.element-label' );
  if ( labelInput ) {
    labelInput.value = field.label || 'columns';
  }

  const dropzone = element.querySelector( '.dropzone' );

  // Add special handling for columns array
  if ( dropzone && field.label === 'columns' && Array.isArray( field.value ) ) {
    field.value.forEach( ( columnItem, index ) => {
      // Create container for column
      const columnContainer = document.createElement( 'div' );
      columnContainer.className = 'array-item label-exists form-element is-object no-drop';
      columnContainer.draggable = true;

      // Add label with collapse icon
      const labelWrapper = document.createElement( 'label' );
      labelWrapper.className = 'object-name label-wrapper';
      labelWrapper.innerHTML = `
        <span>Column ${ index + 1 }<sup>*</sup></span>
        <input type="text" class="element-label" value="column" readonly>
        <span class="collapse-icon">
          ${ ICONS.COLLAPSE }
          ${ ICONS.COLLAPSED }
        </span>
      `;
      columnContainer.appendChild( labelWrapper );

      // Create and add object dropzone
      const objectDropzone = document.createElement( 'div' );
      objectDropzone.className = 'object-dropzone dropzone js-dropzone';
      objectDropzone.dataset.wrapper = 'is-object';

      // Process column content
      if ( Array.isArray( columnItem.value ) ) {
        const blocksField = columnItem.value.find( item => item.label === 'blocks' );
        if ( blocksField && Array.isArray( blocksField.value ) ) {
          blocksField.value.forEach( block => {
            const blockElement = getUpdatedElement( {
              type: 'object',
              label: block.label,
              value: block.value
            }, [], true );
            objectDropzone.appendChild( blockElement );
          } );
        }
      }
      columnContainer.appendChild( objectDropzone );

      // Add action buttons
      addActionButtons( columnContainer, { addDeleteButton: true, addDuplicateButton: true } );

      dropzone.appendChild( columnContainer );
    } );
  } else if ( dropzone && field.label === 'sections' ) {
    dropzone.dataset.wrapper = 'is-array';
  } else if ( dropzone && Array.isArray( field.value ) ) {
    // Handle regular arrays
    field.value.forEach( ( item ) => {
      // Create array item element
      const itemElement = document.createElement( 'div' );
      itemElement.className = `form-element no-drop label-exists`;
      itemElement.draggable = true;

      // Get the key-value pair from the item
      const [ { label, value } ] = item.value;

      itemElement.innerHTML = `
        <label class="label-wrapper">
          <span>Text Label<sup>*</sup></span>
          <div>
            <input type="text" class="element-label" value="${ label }" placeholder="Label Placeholder" readonly>
          </div>
        </label>
        <label class="content-wrapper">
          <span class="hint">Text for Text element</span>
          <div>
            <input type="text" class="element-value" value="${ value }" placeholder="Text Placeholder">
          </div>
        </label>
      `;

      // Add action buttons
      addActionButtons( itemElement, { addDeleteButton: true, addDuplicateButton: true } );

      dropzone.appendChild( itemElement );
    } );
  }

  return element;
}