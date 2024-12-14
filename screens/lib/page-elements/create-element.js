import { addDragHandle } from '../drag/handle.js';
import { addActionButtons } from '../buttons/form-actions.js';
import formComponent from '../formComponents/index.js';

// get all the field handlers
import { updateSelectField } from './field-handlers/select.js';
import { updateCheckboxField } from './field-handlers/checkbox.js';
import { updateDateField } from './field-handlers/date.js';
import { updateUrlField } from './field-handlers/url.js';
import { updateTextField } from './field-handlers/text.js';
import { updateTextareaField } from './field-handlers/textarea.js';
import { updateListField } from './field-handlers/list.js';
import { updateNumberField } from './field-handlers/number.js';
import { updateObjectField } from './field-handlers/object.js';

import { processExplicitField } from './field-initialization/explicit-fields.js';

import { ICONS } from '../../icons/index.js';

/**
 * @function isArrayType
 * @param {string} type - The field type to check
 * @returns {boolean} Whether this is an array type
 */
function isArrayType( type ) {
  return type === 'array' || type === 'sections-array';
}

/**
 * @function getArrayType
 * @param {Object} field - The field definition
 * @returns {string} The specific array type
 */
function getArrayType( field ) {
  if ( field.type === 'array' && field.label === 'sections' ) {
    return 'sections-array';
  }
  return field.type;
}

/**
 * @function createArrayElement
 * @param {string} componentType - The type of array component to create
 * @returns {HTMLElement} The created array element
 */
function createArrayElement( componentType, labelsExists ) {
  const element = document.createElement( 'div' );
  element.className = `form-element is-array no-drop ${ labelsExists ? "label-exists" : "" }`;
  element.draggable = true;

  element.innerHTML = `
    <span class="sort-handle">${ ICONS.DRAG_HANDLE }</span>
    <label class="object-name label-wrapper">
      <span>Array Label<sup>*</sup></span>
      <input type="text" class="element-label" placeholder="Array Name" ${ labelsExists ? 'readonly' : '' }>
      <span class="collapse-icon">
        ${ ICONS.COLLAPSE }
        ${ ICONS.COLLAPSED }
      </span>
    </label>
    <div class="${ componentType === 'sections-array' ? 'array-dropzone' : 'array-list' } dropzone js-dropzone" 
         ${ componentType === 'sections-array' ? 'data-wrapper="is-array"' : '' }>
    </div>
    <div class="button-wrapper"></div>`;

  return element;
}

/**
 * @function createComponent
 * @param {string} type - text, checkbox, array, object, etc.
 * @param {boolean} labelsExist - if false, return the raw component with the label as an input field
 * @returns {HTMLElement} a form element
 */
export function createComponent( type, labelsExist ) {
  const componentType = type.toLowerCase();

  // Handle array types
  if ( componentType === 'array' || componentType === 'sections-array' ) {
    return createArrayElement( componentType, labelsExist );
  }

  // create a div to hold the form element
  let div = document.createElement( 'div' );

  if ( labelsExist ) {
    div.classList.add( 'label-exists' );
  }

  let elementModifier = null;
  if ( type === "object" ) { elementModifier = "is-object"; }
  if ( type === "array" ) { elementModifier = "is-array"; }
  if ( type === "list" ) { elementModifier = "is-list"; }

  div.classList.add( 'form-element' );
  elementModifier && div.classList.add( elementModifier );

  // Make element draggable but nothing can be dropped into it
  div.setAttribute( 'draggable', true );
  div.classList.add( 'no-drop' );

  // Temp element storage so I know what type of element I'm dragging
  window.draggedElement = null;

  // Add a drag handle
  addDragHandle( div );

  // Call the form component function to create the element
  div = formComponent[ type ]( div, labelsExist );

  return div;
}

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

      // Add sort handle
      const sortHandle = document.createElement( 'span' );
      sortHandle.className = 'sort-handle';
      sortHandle.innerHTML = ICONS.DRAG_HANDLE;
      columnContainer.appendChild( sortHandle );

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
      itemElement.className = `form-element no-drop ${ labelsExist ? "label-exists" : "" }`;
      itemElement.draggable = true;

      // Add sort handle
      const sortHandle = document.createElement( 'span' );
      sortHandle.className = 'sort-handle';
      sortHandle.innerHTML = ICONS.DRAG_HANDLE;
      itemElement.appendChild( sortHandle );

      // Add label wrapper
      const labelWrapper = document.createElement( 'label' );
      labelWrapper.className = 'label-wrapper';

      // Get the key-value pair from the item
      const [ entry ] = item.value;
      const key = entry.label;
      const value = entry.value;

      labelWrapper.innerHTML = `
        <span>Text Label<sup>*</sup></span>
        <div>
          <input type="text" class="element-label" value="${ key }" placeholder="Label Placeholder" readonly>
        </div>
      `;
      itemElement.appendChild( labelWrapper );

      // Add content wrapper
      const contentWrapper = document.createElement( 'label' );
      contentWrapper.className = 'content-wrapper';
      contentWrapper.innerHTML = `
        <span class="hint">Text for Text element</span>
        <div>
          <input type="text" class="element-value" value="${ value }" placeholder="Text Placeholder">
        </div>
      `;
      itemElement.appendChild( contentWrapper );

      // Add button wrapper
      const buttonWrapper = document.createElement( 'div' );
      buttonWrapper.className = 'button-wrapper';

      // Add action buttons
      addActionButtons( itemElement, { addDeleteButton: true, addDuplicateButton: true } );

      dropzone.appendChild( itemElement );
    } );
  }

  return element;
}

/**
 * @function updateElement
 * @param {HTMLElement} element - a raw DOM element
 * @param {Object} field - a field object
 * @param {Array} explicitSchemaArray - array of explicit field definitions
 * @param {boolean} labelsExist - whether labels exist
 * @returns {HTMLElement} Updated DOM element
 */
export const updateElement = ( element, field, explicitSchemaArray, labelsExist ) => {
  // Process explicit field schema and get updated field data and permissions
  const { field: processedField, permissions } = processExplicitField( field, explicitSchemaArray );
  const { addDeleteButton, addDuplicateButton } = permissions;

  // Handle array types first
  if ( isArrayType( field.type ) ) {
    return updateArrayElement( element, field, labelsExist );
  }

  // Your existing field type handling
  if ( field.type === "select" ) {
    element = updateSelectField( element, field );
  } else if ( field.type === "checkbox" ) {
    element = updateCheckboxField( element, field );
  } else if ( field.type === "date" ) {
    element = updateDateField( element, field );
  } else if ( field.type === "image" || field.type === "url" ) {
    element = updateUrlField( element, field );
  } else if ( field.type === "text" ) {
    element = updateTextField( element, field );
  } else if ( field.type === "textarea" ) {
    element = updateTextareaField( element, field );
  } else if ( field.type === "list" ) {
    element = updateListField( element, field );
  } else if ( field.type === "number" ) {
    element = updateNumberField( element, field );
  } else if ( field.type === "object" ) {
    element = updateObjectField( element, field, explicitSchemaArray, labelsExist );
  }

  // Add action buttons
  addActionButtons( element, { addDeleteButton, addDuplicateButton } );

  return element;
};

/**
 * @function getUpdatedElement
 * @param {Object} mdField - The markdown field definition
 * @param {Array} explicitSchemaArray - Array of explicit schema definitions
 * @param {boolean} labelsExist - Whether labels exist
 * @returns {HTMLElement} The updated element
 */
export const getUpdatedElement = ( mdField, explicitSchemaArray = [], labelsExist ) => {
  // Get the actual type including sections-array
  const arrayType = getArrayType( mdField );

  // Store the original type before creating component
  const originalType = mdField.type;
  mdField.type = arrayType;  // Temporarily set the type to match what we detected

  // Build the new element with the correct type
  const newElement = createComponent( arrayType, labelsExist );

  // Update it with the field data
  const updatedElement = updateElement( newElement, mdField, explicitSchemaArray, labelsExist );

  // Restore original type
  mdField.type = originalType;

  // Add label input event listener
  const newElementLabelInput = newElement.querySelector( '.element-label, .object-name input' );
  if ( newElementLabelInput ) {
    newElementLabelInput.addEventListener( 'change', ( e ) => {
      const thisElement = e.target;

      if ( !isValidLabel( thisElement.value ) ) {
        showErrorMessage( thisElement, "Label must only use characters and numbers" );
        updateButtonsStatus();
        return;
      }

      if ( thisElement.classList.contains( 'invalid' ) ) {
        removeErrorMessage( thisElement );
      }

      updateButtonsStatus();
    } );
  }

  return updatedElement;
};