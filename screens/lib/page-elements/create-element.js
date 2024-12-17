import { addDragHandle } from '../drag/handle.js';
import { addActionButtons } from '../buttons/form-actions.js';
import formComponent from '../formComponents/index.js';

// get all the field handlers
import { updateArrayElement } from './field-handlers/array.js';
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
 * @function getArrayType
 * @param {Object} field - The field definition
 * @returns {string} The specific array type
 */
function getArrayType( field ) {
  if ( field.type === 'array' && field.label === 'sections' ) {
    return 'sectionsArray';
  }
  return field.type;
}

/**
 * @function createComponent
 * @param {string} type - text, checkbox, array, object, etc.
 * @param {boolean} labelsExist - if false, return the raw component with the label as an input field
 * @returns {HTMLElement} a form element
 */
export function createComponent( type, labelsExist ) {
  let elementModifier = null;
  if ( type === "object" ) { elementModifier = "is-object"; }
  if ( type === "array" || type === "sectionsArray" ) { elementModifier = "is-array"; }
  if ( type === "list" ) { elementModifier = "is-list"; }

  // create a div to hold the form element
  let div = document.createElement( 'div' );
  // Add classes to the div
  div.className = `form-element ${ elementModifier } ${ labelsExist ? 'label-exists' : '' } no-drop`;
  // Make element draggable but nothing can be dropped into it
  div.setAttribute( 'draggable', true );

  // Temp element storage so I know what type of element I'm dragging
  window.draggedElement = null;

  // Add a drag handle
  addDragHandle( div );

  // Call the form component function to create the element
  div = formComponent[ type ]( div, labelsExist );

  return div;
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

  const fieldTypeMap = {
    select: updateSelectField,
    checkbox: updateCheckboxField,
    date: updateDateField,
    image: updateUrlField,
    url: updateUrlField,
    text: updateTextField,
    textarea: updateTextareaField,
    list: updateListField,
    number: updateNumberField,
    object: ( element, field ) => updateObjectField( element, field, explicitSchemaArray, labelsExist ),
    array: ( element, field ) => updateArrayElement( element, field, labelsExist )
  };

  try {
    // get the update function for the field type
    const updateFn = fieldTypeMap[ field.type ];
    if ( updateFn ) {
      // apply update function to the element
      element = updateFn( element, field );
    } else {
      console.warn( `Unsupported field type: ${ field.type }` );
    }
  } catch ( error ) {
    console.error( `Error updating field ${ field.type }:`, error );
  }

  // Add action buttons based on permissions
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
  // If the field is an array and the label is 'sections', set the type to 'sectionsArray'
  // They are both array but sliughtly different
  mdField.type = getArrayType( mdField );

  // Build the new element 
  const newElement = createComponent( mdField.type, labelsExist );

  // Update it with the field data
  const updatedElement = updateElement( newElement, mdField, explicitSchemaArray, labelsExist );

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