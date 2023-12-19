import formComponent from './formComponents/index.js';

/**
 * @function createComponent
 * @param {string} type - text, checkbox, array, object, etc.
 * @param {boolean} raw - if true, return the raw component with the label input field
 * @returns a form element
 */
export const createComponent = ( type, raw ) => {
  // create a div to hold the form element
  let div = document.createElement( 'div' );

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
  div = formComponent[ type ]( div, raw );

  // add a button wrapper to the element
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
export const getUpdatedElement = ( prop, raw ) => {
  // Build the new element...
  const newElement = createComponent( prop.type );
  // ...and update it with the field data
  const updatedElement = updateElement( newElement, prop, raw );

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
 * @param {element} - a raw DOM element, both lanel and value are empty
 * @param {field} - a field object
 * @param 
 * @returns 
 */
function updateElement( element, field, raw ) {

  if ( field.type === "checkbox" ) {
    // Update the checkbox state
    element.querySelector( '.element-value' ).checked = field.value;
    // Update the label
    if ( raw ) {
      element.querySelector( '.element-label' ).value = field.label;
    } else {
      // Replace the "raw" input field with a label
      element.querySelector( 'label span:first-child' ).remove();
      element.querySelector( 'label input' ).remove();
      const labelText = document.createElement( 'span' );
      labelText.innerHTML = field.label;
      labelText.classList.add( 'label-text' );
      element.querySelector( 'label:first-of-type' ).prepend( labelText );
    }
  } // end checkbox

  if ( field.type === "text" || field.type === "textarea" || field.type === "markdown editor" ) {
    // Update the text value
    element.querySelector( '.element-value' ).value = field.value;
    // Update the label
    if ( raw ) {
      element.querySelector( '.element-label' ).value = field.label;
    } else {
      // Replace the "raw" input field with a label
      element.querySelector( 'label span:first-child' ).remove();
      element.querySelector( 'label input' ).remove();
      const labelText = document.createElement( 'span' );
      labelText.innerHTML = field.label;
      labelText.classList.add( 'label-text' );
      element.querySelector( 'label:first-of-type' ).prepend( labelText );
    }
    // Update the placeholder
    element.querySelector( '.element-value' ).placeholder = field.placeholder;
  } // end text, textarea, markdown editor

  if ( field.type === "simplelist" ) {
    element.classList.add( 'is-list' );
    // Update the label
    if ( raw ) {
      element.querySelector( '.object-name input' ).value = field.label;
    } else {
      // Replace the "raw" input field with a label
      element.querySelector( 'label span:first-child' ).remove();
      element.querySelector( 'label input' ).remove();
      const labelText = document.createElement( 'span' );
      labelText.innerHTML = field.label;
      labelText.classList.add( 'label-text' );
      element.querySelector( 'label:first-of-type' ).prepend( labelText );
    }
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
    if ( raw ) {
      element.querySelector( '.object-name input' ).value = field.label;
    } else {
      // Replace the "raw" input field with a label
      element.querySelector( '.object-name span:first-child' ).remove();
      element.querySelector( '.object-name input' ).remove();
      const labelText = document.createElement( 'span' );
      labelText.innerHTML = field.label;
      labelText.classList.add( 'label-text' );
      element.querySelector( '.object-name' ).prepend( labelText );
    }

    if ( field.value.length > 0 ) {
      // Get a reference to the object dropzone
      const objectDropzone = element.querySelector( '.dropzone' );
      // Add the new object properties
      field.value.forEach( property => {
        // Build/update the new element...
        const updatedElement = getUpdatedElement( property );
        // ... and add it to the dropzone
        objectDropzone.appendChild( updatedElement );
      } );
    }
  } // end object/array

  return element;
}