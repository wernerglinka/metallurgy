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
 *  for example text to select or text to text area.
 *  Based on the labelsExist parameter, the function will either render the element with the
 *  label as an input field or as a label.
 */
function updateElement( element, field, explicitSchemaArray, labelsExist ) {
  let explicitFieldObject;
  let addDeleteButton;
  let addDuplicateButton;

  // Loop over the explicit schema array to find the field object
  // for simple types, the field name is the same as the label
  if ( field.type !== "object" && field.type !== "array" ) {
    explicitFieldObject = explicitSchemaArray.find( schema => schema.name === field.label );

    // check if the implied and explicit field types are the same
    // if not, overwrite the implied field type
    if ( explicitFieldObject.type !== field.type ) {
      field.type = explicitFieldObject.type;
    }

    // if the field value is an empty string but the explicit field object
    // has a default value, update the field value
    if ( field.value === "" && explicitFieldObject.default ) {
      field.value = explicitFieldObject.default;
    }

    // if the field type is a select and the explicit field object has options
    // update the field options and add the default value
    if ( field.type === "select" && explicitFieldObject.options ) {
      field.options = explicitFieldObject.options;
      field.default = explicitFieldObject.default;
    }

    // Get the permits of the add/delete buttons
    addDeleteButton = !explicitFieldObject.noDeletion;
    addDuplicateButton = !explicitFieldObject.noDuplication;

    // Finally, add the placeholder from the explicit field object
    field.placeholder = explicitFieldObject.placeholder;
  }

  /*
   * SELECT field
   * The markdown file presents this as a text field. We'll delete the text field
   * and replace it with a select element.
   */
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


  /*
   * CHECKBOX field
   * The markdown file presents this properly as a checkbox, but we need to
   * update the label and value.
   */
  if ( field.type === "checkbox" ) {
    // Update the checkbox state
    element.querySelector( '.element-value' ).checked = field.value;
    // Update the label
    element.querySelector( '.element-label' ).value = field.label;
  } // end checkbox


  /*
   * DATE field
   * The markdown file presents this as a text field. We'll delete the text field
   * and replace it with a date input.
   */
  if ( field.type === "date" ) {
    // Update the label
    element.querySelector( '.element-label' ).value = field.label;

    // Replace the original element value input
    const originalValueElement = element.querySelector( '.element-value' );
    const originalValueParent = originalValueElement.parentNode;
    originalValueElement.remove();

    // Build the date element
    const tempContainer = document.createElement( 'div' );
    tempContainer.innerHTML = `
      <input type="date" class="element-value">
    `;
    // Append children of tempContainer to the div
    while ( tempContainer.firstChild ) {
      originalValueParent.appendChild( tempContainer.firstChild );
    }
  } // end date


  /**
   * IMAGE and URL fields
   * The markdown file presents this as a text field. We'll delete the text field
   * and replace it with a url input.
   */
  if ( field.type === "image" || field.type === "url" ) {
    // Update the label
    element.querySelector( '.element-label' ).value = field.label;

    // Replace the original element value input
    const originalValueElement = element.querySelector( '.element-value' );
    const originalValueParent = originalValueElement.parentNode;
    originalValueElement.remove();

    // Build the date element
    const tempContainer = document.createElement( 'div' );
    tempContainer.innerHTML = `
      <input type="url" class="element-value" placeholder="${ field.placeholder }">
    `;
    // Append children of tempContainer to the div
    while ( tempContainer.firstChild ) {
      originalValueParent.appendChild( tempContainer.firstChild );
    }
  } // end image, url


  /**
   * TEXT field
   */
  if ( field.type === "text" ) {
    // Update the label
    element.querySelector( '.element-label' ).value = field.label;
    // Update the text value
    const textInputValue = element.querySelector( '.element-value' );
    textInputValue.value = field.value;
    textInputValue.placeholder = field.placeholder;
  } // end text


  /*
   * TEXTAREA field
   * The markdown file presents this as a text field. We'll delete the text field
   * and replace it with a textarea.
   */
  if ( field.type === "textarea" ) {
    // Update the label
    element.querySelector( '.element-label' ).value = field.label;

    // Replace the original element value input
    const originalValueElement = element.querySelector( '.element-value' );
    const originalValueParent = originalValueElement.parentNode;
    originalValueElement.remove();

    // Build the date element
    const tempContainer = document.createElement( 'div' );
    tempContainer.innerHTML = `
      <textarea class="element-value is-editor" placeholder="Click to open editor">${ field.value }</textarea>
    `;
    // Append children of tempContainer to the div
    while ( tempContainer.firstChild ) {
      originalValueParent.appendChild( tempContainer.firstChild );
    }

    /**
     *  Create a textarea with editor
     */
    // check if #editorWrapper already exists
    const editorWrapper = document.getElementById( 'editorWrapper' );
    if ( !editorWrapper ) {
      // Add an overlay
      const editorOverlay = document.createElement( 'div' );
      editorOverlay.id = "editorOverlay";
      // Add the editor textarea
      const easyMDEditor = document.createElement( 'textarea' );
      easyMDEditor.id = "editorWrapper";
      // add the editor wrapper to the DOM
      editorOverlay.appendChild( easyMDEditor );
      document.body.appendChild( editorOverlay );
      // add the editor wrapper to the DOM
      document.body.appendChild( editorOverlay );

      // add the easyMDEditor
      window.mdeditor = new EasyMDE( { element: easyMDEditor, autoDownloadFontAwesome: true } );

      // add a button to the easyMDEitor to disable the inline markdown styles
      const disableMarkdownStyles = document.createElement( 'button' );
      disableMarkdownStyles.id = "disableMarkdownStyles";
      disableMarkdownStyles.innerHTML = "Inline Styles";
      // add the button to the toolbar
      const toolbar = document.querySelector( '.editor-toolbar' );
      toolbar.appendChild( disableMarkdownStyles );

      // add eventlistener to the disableMarkdownStyles button
      disableMarkdownStyles.addEventListener( 'click', ( e ) => {
        e.target.classList.toggle( 'disabled' );
        const codemirrorWrapper = document.querySelector( '.CodeMirror' );
        codemirrorWrapper.classList.toggle( 'disable-markdown-styles' );
      } );

      // add a close button
      const closeButton = document.createElement( 'div' );
      closeButton.id = "closeEditor";
      closeButton.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#ffffff" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"> 
            <circle cx="11" cy="11" r="10"></circle>
            <line x1="14" y1="8" x2="8" y2="14"></line>
            <line x1="8" y1="8" x2="14" y2="14"></line>
          </g>
        </svg>
      `;
      editorOverlay.appendChild( closeButton );

      // add eventlistener to the close button
      closeButton.addEventListener( 'click', () => {
        // first move the editor value to the textarea
        window.textareaInput.value = window.mdeditor.value();
        editorOverlay.classList.remove( 'show' );
      } );
    }
  } // end textarea


  /**
   * SIMPLE LIST field
   */
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


  /**
   * NUMBER field
   * The markdown file presents this as a text field. We'll delete the text field
   * and replace it with a number input.
   */
  if ( field.type === "number" ) {
    const numberFieldValue = element.querySelector( '.element-value' );
    // Update the label
    element.querySelector( '.element-label' ).value = field.label;
    // Update the number value
    numberFieldValue.value = field.value;
    numberFieldValue.placeholder = field.placeholder;

  } // end number


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

  /*
   * Add the add/delete buttons
   * Add/Delete buttons are enabled in the explicit field schema.
   * Buttons are defined in the context of a page. E.g. a page must have
   * a layout, but that field can not be duplicated. A simple list item
   * can be duplicated or deleted.
  */
  if ( addDeleteButton || addDuplicateButton ) {

    // create a button wrapper
    const buttonWrapper = document.createElement( 'div' );
    buttonWrapper.classList.add( 'button-wrapper' );
    element.appendChild( buttonWrapper );

    // add the DUPLICATE button
    if ( addDuplicateButton ) {
      //add the ADD button
      const addButton = document.createElement( 'div' );
      addButton.classList.add( 'add-button', 'button' );
      addButton.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
            <g stroke="#000000" stroke-width="2">
              <g transform="translate(2, 2)">
                <circle cx="10" cy="10" r="10"></circle>
                <line x1="6" y1="10" x2="14" y2="10"></line>
                <line x1="10" y1="6" x2="10" y2="14"></line>
              </g>
            </g>
          </g>
        </svg>
      `;
      buttonWrapper.appendChild( addButton );
    }

    //add the DELETE button
    if ( addDeleteButton ) {
      const deleteButton = document.createElement( 'div' );
      deleteButton.classList.add( 'delete-button' );
      deleteButton.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" >
          <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
            <g stroke="#000000" stroke-width="2">
              <g transform="translate(2, 2)">
                <circle cx="10" cy="10" r="10"></circle>
                <line x1="13" y1="7" x2="7" y2="13"></line>
                <line x1="7" y1="7" x2="13" y2="13"></line>
              </g>
            </g>
          </g>
        </svg>
      `;
      buttonWrapper.appendChild( deleteButton );
    }
  }

  return element;
}