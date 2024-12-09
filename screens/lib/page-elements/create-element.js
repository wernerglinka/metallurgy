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
function createArrayElement( componentType ) {
  const element = document.createElement( 'div' );
  element.className = 'label-exists form-element is-array no-drop';
  element.draggable = true;

  element.innerHTML = `
    <span class="sort-handle">
      <svg viewBox="0 0 14 22" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <g stroke="#FFFFFF" stroke-width="2">
            <circle cx="4" cy="11" r="1"></circle>
            <circle cx="4" cy="4" r="1"></circle>
            <circle cx="4" cy="18" r="1"></circle>
            <circle cx="10" cy="11" r="1"></circle>
            <circle cx="10" cy="4" r="1"></circle>
            <circle cx="10" cy="18" r="1"></circle>
          </g>
        </g>
      </svg>
    </span>
    <label class="object-name label-wrapper">
      <span>Array Label<sup>*</sup></span>
      <input type="text" class="element-label" placeholder="Array Name" readonly>
      <span class="collapse-icon">
        <svg class="open" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <!-- Your existing collapse icon SVG -->
        </svg>
        <svg class="collapsed" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <!-- Your existing collapsed icon SVG -->
        </svg>
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
    return createArrayElement( componentType );
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
function updateArrayElement( element, field ) {
  const labelInput = element.querySelector( '.element-label' );
  if ( labelInput ) {
    labelInput.value = field.label;
  }

  const dropzone = element.querySelector( '.dropzone' );
  if ( dropzone && field.label === 'sections' ) {
    dropzone.dataset.wrapper = 'is-array';
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
    return updateArrayElement( element, field );
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