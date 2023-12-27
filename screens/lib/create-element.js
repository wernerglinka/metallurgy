import formComponent from './formComponents/index.js';

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
  if ( type === "simplelist" ) { elementModifier = "is-list"; }

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
  const dragHandle = document.createElement( 'span' );
  dragHandle.classList.add( 'sort-handle' );
  dragHandle.innerHTML = `
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
  `;
  div.appendChild( dragHandle );

  // Call the form component function to create the element
  div = formComponent[ type ]( div, labelsExist );


  // Add an Add and Delete button to all fields. We'll hide them later
  // based on the field type and the explicit schema.
  const buttonWrapper = document.createElement( 'div' );
  buttonWrapper.classList.add( 'button-wrapper' );
  div.appendChild( buttonWrapper );

  //add the ADD button
  const addButton = document.createElement( 'div' );
  addButton.classList.add( 'add-button', 'button' );
  addButton.innerHTML = "+";
  buttonWrapper.appendChild( addButton );

  //add the DELETE button
  const deleteButton = document.createElement( 'div' );
  deleteButton.classList.add( 'delete-button' );
  deleteButton.innerHTML = "-";
  buttonWrapper.appendChild( deleteButton );


  return div;
};

/**
 * @function getUpdatedElement(prop)
 * @param {object} prop 
 * @returns updatedElement
 * @description This function will first create a new element and then updates
 *   element based on prop values
 */
export const getUpdatedElement = ( prop, explicitSchemaArray = [], labelsExist ) => {
  // Build the new element as inferred from the json shape...
  const newElement = createComponent( prop.type, labelsExist );
  // ...and update it with the field data and if the field is explicitly defined
  // add structure of the element, for example text to select or text area.
  const updatedElement = updateElement( newElement, prop, explicitSchemaArray, labelsExist );

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
 *  for example text to select or text to text area.
 *  Based on the labelsExist parameter, the function will either render the element with the
 *  label as an input field or as a label.
 */
function updateElement( element, field, explicitSchemaArray, labelsExist ) {
  let explicitFieldObject;

  // Loop over the explicit schema array to find the field object
  // for simple types, the field name is the same as the label
  if ( field.type !== "object" && field.type !== "array" ) {
    explicitFieldObject = explicitSchemaArray.find( schema => schema.name === field.label );
    // check if the implied and explicit field types are the same
    if ( explicitFieldObject.type !== field.type ) {
      // Text/Textarea is a special case, all attributes etc are the same, except the tag
      if ( explicitFieldObject.type === "textarea" && field.type === "text" ) {
        element.classList.add( 'wasText' );
      } else {
        // If types are not the same, just update the field type
        // We'll make changes below
        field.type = explicitFieldObject.type;
      }
    }
    // if the field value is an empty string but the explicit field object has a default value,
    // update the field value
    if ( field.value === "" && explicitFieldObject.default ) {
      field.value = explicitFieldObject.default;
    }
    // if the field type is a select and the explicit field object has options
    // update the field options and add the default value
    if ( field.type === "select" && explicitFieldObject.options ) {
      field.options = explicitFieldObject.options;
      field.default = explicitFieldObject.default;
    }

    // Finally, add the placeholder from the explicit field object
    field.placeholder = explicitFieldObject.placeholder;
  }


  // A select field came in from the frontmatter as a text field.
  // The field will be converted to a select field according to the explicit schema
  if ( field.type === "select" ) {
    // Update the label
    element.querySelector( '.element-label' ).value = field.label;

    // Replace the original element value input
    const originalValueElement = element.querySelector( '.element-value' );
    const originalValueParent = originalValueElement.parentNode;
    originalValueElement.remove();

    // Build the select element
    const selectElement = document.createElement( 'select' );
    selectElement.classList.add( 'element-value' );
    // Add the options
    field.options.forEach( option => {
      const optionElement = document.createElement( 'option' );
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      // check if this option is the default value
      if ( option.value === field.default ) {
        optionElement.selected = true;
      }
      selectElement.appendChild( optionElement );
    } );
    // set the default value
    selectElement.value = field.default;

    // Add the select element to the original value parent
    originalValueParent.appendChild( selectElement );
  }


  if ( field.type === "checkbox" ) {
    // Update the checkbox state
    element.querySelector( '.element-value' ).checked = field.value;
    // Update the label
    element.querySelector( '.element-label' ).value = field.label;
  } // end checkbox


  if ( field.type === "text" || field.type === "textarea" || field.type === "image" || field.type === "url" ) {
    // Update the text value
    element.querySelector( '.element-value' ).value = field.value;
    // Update the label
    element.querySelector( '.element-label' ).value = field.label;
  } // end text, textarea, image, url


  if ( field.type === "textarea" && element.classList.contains( 'wasText' ) ) {
    // replace the text input with a textarea
    const originalValueElement = element.querySelector( '.element-value' );
    const originalValueParent = originalValueElement.parentNode;
    originalValueElement.remove();

    const textareaElement = document.createElement( 'textarea' );
    textareaElement.classList.add( 'element-value' );
    textareaElement.value = field.value;
    textareaElement.placeholder = field.placeholder;

    originalValueParent.appendChild( textareaElement );
  } // end new textarea


  if ( field.type === "listField" ) {
    element.classList.add( 'is-list' );
    // Update the label
    element.querySelector( '.object-name input' ).value = field.label;

    /* 
      Update the list items
      A new element includes only 1 list item. We'll clone it and use it to
      add all items in the field.value array.
    */
    const listWrapper = element.querySelector( 'ul' );
    const listItem = listWrapper.querySelector( 'li' );
    // remove the existing list item
    listItem.remove();
    // add the new list items from the field.value array
    field.value.forEach( item => {
      const clonedListItem = listItem.cloneNode( true );
      clonedListItem.querySelector( 'input' ).value = item;
      listWrapper.appendChild( clonedListItem );
    } );
  } // end simple list


  if ( field.type === "object" || field.type === "array" ) {
    // Update the label
    element.querySelector( '.object-name input' ).value = field.label;

    if ( field.value.length > 0 ) {
      // Get a reference to the object dropzone
      const objectDropzone = element.querySelector( '.dropzone' );
      // Add the new object properties
      field.value.forEach( property => {
        // Build/update the new element...
        const updatedElement = getUpdatedElement( property, explicitSchemaArray, labelsExist );
        // ... and add it to the dropzone
        objectDropzone.appendChild( updatedElement );
      } );
    }
  } // end object/array

  return element;
}