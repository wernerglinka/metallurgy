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
 * @function createComponent
 * @param {string} type - text, checkbox, array, object, etc.
 * @param {boolean} labelsExist - if false, return the raw component with the label as an input field
 * @returns a form element
 */
export const createComponent = ( type, labelsExist ) => {
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
  // we add the dragstart event listener to the form element
  // and then delegate it to this form-element
  // div.addEventListener( 'dragstart', dragStart );

  // Temp element storage so I know what type of element I'm dragging
  window.draggedElement = null;

  // Add a drag handle
  addDragHandle( div );

  // Call the form component function to create the element
  div = formComponent[ type ]( div, labelsExist );

  return div;
};

/**
 * @function getUpdatedElement()
 * @param {object} mdField 
 * @returns updatedElement
 * @description This function will first create a new element and then updates
 *   element based on the original mdField values
 */
export const getUpdatedElement = ( mdField, explicitSchemaArray = [], labelsExist ) => {
  // Build the new element as inferred from the json shape...
  const newElement = createComponent( mdField.type, labelsExist );

  // ...and update it with the field data and if the field is 'explicitly defined
  // add structure of the element, for example text to 'select' or 'text area'.
  const updatedElement = updateElement( newElement, mdField, explicitSchemaArray, labelsExist );

  /*
    Add an eventlistener to the label input to enable the submit button when the 
    user has added text to the label input and all other label inputs have text
  */
  const newElementLabelInput = newElement.querySelector( '.element-label, .object-name input' );
  newElementLabelInput && newElementLabelInput.addEventListener( 'change', ( e ) => {
    const thisElement = e.target;

    // check if the input is valid, if not valid, show error message and disable the button
    if ( !isValidLabel( thisElement.value ) ) {
      showErrorMessage( thisElement, "Label must only use characters and numbers" );
      updateButtonsStatus();
      return;
    }

    // remove error message if it exists
    if ( thisElement.classList.contains( 'invalid' ) ) {
      removeErrorMessage( thisElement );
    }

    updateButtonsStatus();
  } );

  return updatedElement;
};

/**
 * @function updateElement
 * @param {element} - a raw DOM element, both label and value are empty
 * @param {field} - a field object
 * @param 
 * @returns DOM element that has been updated with field data and structure
 * @description This function will update the element based on field object values
 *  and if the field schema is explicitly defined, change the structure of the element, 
 *  for example 'text' -> 'select' or 'text' -> 'text area'.
 *  Based on the labelsExist parameter, the function will either render the element with the
 *  label as an input field or as a label.
 */
export const updateElement = ( element, field, explicitSchemaArray, labelsExist ) => {
  // Process explicit field schema and get updated field data and permissions
  const { field: processedField, permissions } = processExplicitField( field, explicitSchemaArray );
  const { addDeleteButton, addDuplicateButton } = permissions;

  /*
   * SELECT field
   * The markdown file presents this as a text field. We'll delete the text field
   * and replace it with a select element.
   */
  if ( field.type === "select" ) {
    element = updateSelectField( element, field );
  }

  /*
   * CHECKBOX field
   * The markdown file presents this properly as a checkbox, but we need to
   * update the label and value.
   */
  if ( field.type === "checkbox" ) {
    element = updateCheckboxField( element, field );
  }

  /*
   * DATE field
   * The markdown file presents this as a text field. We'll delete the text field
   * and replace it with a date input.
   */
  if ( field.type === "date" ) {
    element = updateDateField( element, field );
  }

  /**
   * IMAGE and URL fields
   * The markdown file presents this as a text field. We'll delete the text field
   * and replace it with a url input.
   */
  if ( field.type === "image" || field.type === "url" ) {
    element = updateUrlField( element, field );
  }

  /**
   * TEXT field
   */
  if ( field.type === "text" ) {
    element = updateTextField( element, field );
  }

  /*
   * TEXTAREA field
   * The markdown file presents this as a text field. We'll delete the text field
   * and replace it with a textarea.
   */
  if ( field.type === "textarea" ) {
    element = updateTextareaField( element, field );
  }

  /**
   * SIMPLE LIST field
   */
  if ( field.type === "list" ) {
    element = updateListField( element, field );
  }

  /**
   * NUMBER field
   * The markdown file presents this as a text field. We'll delete the text field
   * and replace it with a number input.
   */
  if ( field.type === "number" ) {
    element = updateNumberField( element, field );
  }

  if ( field.type === "object" || field.type === "array" ) {
    element = updateObjectField( element, field, explicitSchemaArray, labelsExist );
  }

  /*
   * Add the add/delete buttons
   * Add/Delete buttons are enabled in the explicit field schema.
   * Buttons are defined in the context of a page. E.g. a page must have
   * a layout, but that field can not be duplicated. A simple list item
   * can be duplicated or deleted.
  */
  addActionButtons( element, { addDeleteButton, addDuplicateButton } );

  return element;
};