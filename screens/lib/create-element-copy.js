import { text } from './formComponents/text.js';
import { textarea } from './formComponents/textarea.js';

/**
 * @function createComponent
 * @param {string} type 
 * @returns a form element
 */
export const createComponent = ( type ) => {
  // create a div to hold the form element
  let div = document.createElement( 'div' );

  let elementModifier = null;
  if ( type === "object" ) { elementModifier = "is-object"; }
  if ( type === "array" ) { elementModifier = "is-array"; }
  if ( type === "simple list" ) { elementModifier = "is-list"; }

  div.classList.add( 'form-element' );
  elementModifier && div.classList.add( elementModifier );

  // Make element draggable but nothing can be dropped into it
  div.setAttribute( 'draggable', true );
  div.classList.add( 'no-drop' );
  div.addEventListener( 'dragstart', dragStart );

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


  if ( type === 'text' ) {
    div = text( div );

    /*
    // create the label for label input
    const label = document.createElement( 'label' );
    label.innerHTML = `<span>Text Key<sup>*</sup></span>`;

    // create the label input
    const labelInput = document.createElement( 'input' );
    labelInput.setAttribute( 'type', "text" );
    labelInput.classList.add( 'element-label' );
    labelInput.placeholder = "Label Placeholder";

    // create wrapper for input for styling
    const labelInputWrapper = document.createElement( 'div' );
    labelInputWrapper.appendChild( labelInput );

    // add the input to the label element
    label.appendChild( labelInputWrapper );

    // add the label to the div
    div.appendChild( label );

    // create the label for text input
    const labelText = document.createElement( 'label' );
    labelText.innerHTML = `<span>Text for Text element</span>`;

    // create the input
    const textInput = document.createElement( 'input' );
    textInput.setAttribute( 'type', "text" );
    // textInput.dataset.type = "text";
    textInput.classList.add( 'element-value' );
    textInput.placeholder = "Text Placeholder";

    // create wrapper for input for styling
    const inputWrapper = document.createElement( 'div' );
    inputWrapper.appendChild( textInput );

    // add the input to the label element
    labelText.appendChild( inputWrapper );

    // add the label to the div
    div.appendChild( labelText );

    */
  }

  if ( type === 'textarea' ) {
    div = textarea( div );
    /*
    // create the label for label input
    const label = document.createElement( 'label' );
    label.innerHTML = `<span>Textarea Key<sup>*</sup></span>`;

    // create the label input
    const labelInput = document.createElement( 'input' );
    labelInput.setAttribute( 'type', "text" );
    labelInput.classList.add( 'element-label' );
    labelInput.placeholder = "Label Placeholder";

    // create wrapper for input for styling
    const labelInputWrapper = document.createElement( 'div' );
    labelInputWrapper.appendChild( labelInput );

    // add the input to the label element
    label.appendChild( labelInputWrapper );

    // add the label to the div
    div.appendChild( label );

    // create the label for textarea
    const labelText = document.createElement( 'label' );
    labelText.innerHTML = `<span>Text content</span>`;

    // create the textarea
    const textareaInput = document.createElement( 'textarea' );
    textareaInput.classList.add( 'element-value', 'is-editor' );
    //textareaInput.dataset.type = "textarea";
    textareaInput.placeholder = "Click to open editor";

    // show the editor when the textarea is in focus
    textareaInput.addEventListener( 'click', ( e ) => {
      const editorOverlay = document.getElementById( 'editorOverlay' );
      editorOverlay.classList.add( 'show' );

      window.textareaInput = e.target;

      console.log( window.mdeditor.value() );
      // add value from the textarea to the editor
      window.mdeditor.value( e.target.value );
    } );


    // create wrapper for input for styling
    const inputWrapper = document.createElement( 'div' );
    inputWrapper.appendChild( textareaInput );

    // add the input to the label element
    labelText.appendChild( inputWrapper );

    // add the label to the div
    div.appendChild( labelText );


    /**
     *  Create a textarea with editor
     
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
    */
  }

  if ( type === 'number' ) {
    // create the label for label input
    const label = document.createElement( 'label' );
    label.innerHTML = `<span>Number Key<sup>*</sup></span>`;

    // create the label input
    const labelInput = document.createElement( 'input' );
    labelInput.setAttribute( 'type', "text" );
    labelInput.classList.add( 'element-label' );
    labelInput.placeholder = "Label Placeholder";

    // create wrapper for input for styling
    const labelInputWrapper = document.createElement( 'div' );
    labelInputWrapper.appendChild( labelInput );

    // add the input to the label element
    label.appendChild( labelInputWrapper );

    // add the label to the div
    div.appendChild( label );

    // create the label for text input
    const labelText = document.createElement( 'label' );
    labelText.innerHTML = `<span>Number for number element</span>`;

    // create the input
    const textInput = document.createElement( 'input' );
    textInput.setAttribute( 'type', "number" );
    //textInput.dataset.type = "number";
    textInput.classList.add( 'element-value' );
    textInput.placeholder = "1 2 3 4... Placeholder";

    // create wrapper for input for styling
    const inputWrapper = document.createElement( 'div' );
    inputWrapper.appendChild( textInput );

    // add the input to the label element
    labelText.appendChild( inputWrapper );

    // add the label to the div
    div.appendChild( labelText );
  }

  if ( type === 'checkbox' ) {
    // create the label for label input
    const label = document.createElement( 'label' );
    label.innerHTML = `<span>Checkbox Key<sup>*</sup></span>`;

    // create the label input
    const labelInput = document.createElement( 'input' );
    labelInput.setAttribute( 'type', "text" );
    labelInput.classList.add( 'element-label' );
    labelInput.placeholder = "Label Placeholder";

    // create wrapper for input for styling
    const labelInputWrapper = document.createElement( 'div' );
    labelInputWrapper.appendChild( labelInput );

    // add the input to the label element
    label.appendChild( labelInputWrapper );

    // add the label to the div
    div.appendChild( label );

    // create the label for checkbox
    const labelText = document.createElement( 'label' );
    labelText.innerHTML = `<span>Initial state of checkbox</span>`;

    // create the checkbox
    const checkboxInput = document.createElement( 'input' );
    checkboxInput.value = "false";
    checkboxInput.classList.add( 'element-value' );
    //checkboxInput.dataset.type = "checkbox";
    checkboxInput.setAttribute( 'type', "checkbox" );
    checkboxInput.setAttribute( 'role', "switch" );

    // create wrapper for input for styling
    const inputWrapper = document.createElement( 'div' );
    inputWrapper.appendChild( checkboxInput );

    // add the input to the label element
    labelText.appendChild( inputWrapper );

    // add the label to the div
    div.appendChild( labelText );
  }

  if ( type === 'date' ) {
    // create the label for label input
    const label = document.createElement( 'label' );
    label.innerHTML = `<span>Date Key<sup>*</sup></span>`;

    // create the label input
    const labelInput = document.createElement( 'input' );
    labelInput.setAttribute( 'type', "text" );
    labelInput.classList.add( 'element-label' );
    labelInput.placeholder = "Label Placeholder";

    // create wrapper for input for styling
    const labelInputWrapper = document.createElement( 'div' );
    labelInputWrapper.appendChild( labelInput );

    // add the input to the label element
    label.appendChild( labelInputWrapper );

    // add the label to the div
    div.appendChild( label );

    // create the label for text input
    const labelText = document.createElement( 'label' );
    labelText.innerHTML = `<span>The date</span>`;

    // create the input
    const textInput = document.createElement( 'input' );
    textInput.setAttribute( 'type', "date" );
    textInput.setAttribute( 'value', new Date().toISOString() );
    //textInput.dataset.type = "date";
    textInput.classList.add( 'element-value' );
    textInput.placeholder = "date Placeholder";

    // create wrapper for input for styling
    const inputWrapper = document.createElement( 'div' );
    inputWrapper.appendChild( textInput );

    // add the input to the label element
    labelText.appendChild( inputWrapper );

    // add the label to the div
    div.appendChild( labelText );
  }

  if ( type === 'simple list' ) {
    // create the array name input
    const label = document.createElement( 'label' );
    label.classList.add( 'object-name' );
    label.innerHTML = `<span>List Key<sup>*</sup></span>`;
    const nameInput = document.createElement( 'input' );
    nameInput.setAttribute( 'type', "text" );
    nameInput.placeholder = "Name Placeholder";

    label.appendChild( nameInput );
    div.appendChild( label );

    // create the first list item input
    const textInput = document.createElement( 'input' );
    textInput.setAttribute( 'type', "text" );
    //textInput.dataset.type = "text";
    textInput.classList.add( 'list-item' );
    textInput.placeholder = "Item Placeholder";

    // create wrapper for input styling
    const listWrapper = document.createElement( 'ul' );
    const listItem = document.createElement( 'li' );
    listItem.appendChild( textInput );

    // add a button wrapper to the list item
    const buttonWrapper = document.createElement( 'div' );
    buttonWrapper.classList.add( 'button-wrapper' );
    listItem.appendChild( buttonWrapper );

    //add the list item add button
    const addListItem = document.createElement( 'div' );
    addListItem.classList.add( 'add-button', 'button' );
    addListItem.innerHTML = "+";
    buttonWrapper.appendChild( addListItem );

    //add the list item delete button
    const deleteListItem = document.createElement( 'div' );
    deleteListItem.classList.add( 'delete-button', 'button' );
    deleteListItem.innerHTML = "-";
    buttonWrapper.appendChild( deleteListItem );

    listItem.appendChild( buttonWrapper );
    listWrapper.appendChild( listItem );

    // add a eventlistener to the listWrapper to handle the add and delete buttons
    /*
        listWrapper.addEventListener('click', (e) => {
          // if the add button was clicked clone the list item and add it to the list
          if( e.target.classList.contains('add-button') ) {
            const listItem = e.target.parentElement.parentElement.cloneNode(true);
            listWrapper.appendChild(listItem);
          }
          // if the delete button was clicked remove the list item from the list
          if( e.target.classList.contains('delete-button') ) {
            e.target.parentElement.parentElement.remove();
          }
        });
    */
    div.appendChild( listWrapper );
  }

  if ( type === 'object' ) {
    // create the object name input
    const label = document.createElement( 'label' );
    label.classList.add( 'object-name' );
    label.innerHTML = `<span>Object Key<sup>*</sup></span>`;
    const hint = document.createElement( 'span' );
    hint.classList.add( 'hint' );
    hint.innerHTML = `Sections Object`;
    label.appendChild( hint );
    const nameInput = document.createElement( 'input' );
    nameInput.setAttribute( 'type', "text" );
    nameInput.placeholder = "Name Placeholder";
    label.appendChild( nameInput );

    const collapseIcon = document.createElement( 'span' );
    collapseIcon.classList.add( 'collapse-icon' );
    collapseIcon.innerHTML = `
      <svg class="open" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <g transform="translate(-2, 0)" stroke="#FFFFFF" stroke-width="2">
            <g stroke="#FFFFFF" stroke-width="2">
              <line x1="12" y1="22" x2="12" y2="16" id="Path"></line>
              <line x1="12" y1="8" x2="12" y2="2" id="Path"></line>
              <line x1="4" y1="12" x2="2" y2="12" id="Path"></line>
              <line x1="10" y1="12" x2="8" y2="12" id="Path"></line>
              <line x1="16" y1="12" x2="14" y2="12" id="Path"></line>
              <line x1="22" y1="12" x2="20" y2="12" id="Path"></line>
              <polyline id="Path" points="15 19 12 16 9 19"></polyline>
              <polyline id="Path" points="15 5 12 8 9 5"></polyline>
            </g>
          </g>
        </g>
      </svg>

      
      <svg class="collapsed viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <g transform="translate(-2, 0)" stroke="#FFFFFF" stroke-width="2">
              <g transform="translate(2, 2)">
                  <line x1="10" y1="20" x2="10" y2="14" id="Path"></line>
                  <line x1="10" y1="6" x2="10" y2="0" id="Path"></line>
                  <line x1="2" y1="10" x2="0" y2="10" id="Path"></line>
                  <line x1="8" y1="10" x2="6" y2="10" id="Path"></line>
                  <line x1="14" y1="10" x2="12" y2="10" id="Path"></line>
                  <line x1="20" y1="10" x2="18" y2="10" id="Path"></line>
                  <polyline id="Path" points="13 17 10 20 7 17"></polyline>
                  <polyline id="Path" points="13 3 10 0 7 3"></polyline>
              </g>
          </g>
        </g>
      </svg>
    `;

    collapseIcon.addEventListener( 'click', ( e ) => {
      const collapseIcon = e.target.closest( '.collapse-icon' );
      const objectDropzone = collapseIcon.closest( '.object-name' ).nextSibling;
      const isCollapsed = objectDropzone.classList.contains( 'is-collapsed' );
      if ( isCollapsed ) {
        objectDropzone.classList.remove( 'is-collapsed' );
        collapseIcon.classList.remove( 'is-collapsed' );
      } else {
        objectDropzone.classList.add( 'is-collapsed' );
        collapseIcon.classList.add( 'is-collapsed' );
      }

    } );
    label.appendChild( collapseIcon );
    div.appendChild( label );


    // create a dropzone for the object properties
    const objectDropzone = document.createElement( 'div' );
    objectDropzone.classList.add( 'object-dropzone', 'dropzone', 'js-dropzone' );
    objectDropzone.dataset.wrapper = "is-object";
    objectDropzone.addEventListener( "dragover", dragOver );
    objectDropzone.addEventListener( "dragleave", dragLeave );
    objectDropzone.addEventListener( "drop", drop );

    div.appendChild( objectDropzone );
  }

  if ( type === 'array' ) {
    // create the array name input
    const label = document.createElement( 'label' );
    label.classList.add( 'object-name' );
    label.innerHTML = `<span>Array Key<sup>*</sup></span>`;
    const nameInput = document.createElement( 'input' );
    nameInput.setAttribute( 'type', "text" );
    nameInput.placeholder = "Array Name";
    label.appendChild( nameInput );

    const collapseIcon = document.createElement( 'span' );
    collapseIcon.classList.add( 'collapse-icon' );
    collapseIcon.innerHTML = `
      <svg class="open" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <g transform="translate(-2, -2)" stroke="#FFFFFF" stroke-width="2">
            <g stroke="#FFFFFF" stroke-width="2">
              <line x1="12" y1="22" x2="12" y2="16" id="Path"></line>
              <line x1="12" y1="8" x2="12" y2="2" id="Path"></line>
              <line x1="4" y1="12" x2="2" y2="12" id="Path"></line>
              <line x1="10" y1="12" x2="8" y2="12" id="Path"></line>
              <line x1="16" y1="12" x2="14" y2="12" id="Path"></line>
              <line x1="22" y1="12" x2="20" y2="12" id="Path"></line>
              <polyline id="Path" points="15 19 12 16 9 19"></polyline>
              <polyline id="Path" points="15 5 12 8 9 5"></polyline>
            </g>
          </g>
        </g>
      </svg>

      
      <svg class="collapsed viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <g transform="translate(-2, -2)" stroke="#FFFFFF" stroke-width="2">
              <g transform="translate(2, 2)">
                  <line x1="10" y1="20" x2="10" y2="14" id="Path"></line>
                  <line x1="10" y1="6" x2="10" y2="0" id="Path"></line>
                  <line x1="2" y1="10" x2="0" y2="10" id="Path"></line>
                  <line x1="8" y1="10" x2="6" y2="10" id="Path"></line>
                  <line x1="14" y1="10" x2="12" y2="10" id="Path"></line>
                  <line x1="20" y1="10" x2="18" y2="10" id="Path"></line>
                  <polyline id="Path" points="13 17 10 20 7 17"></polyline>
                  <polyline id="Path" points="13 3 10 0 7 3"></polyline>
              </g>
          </g>
        </g>
      </svg>
    `;

    collapseIcon.addEventListener( 'click', ( e ) => {
      const collapseIcon = e.target.closest( '.collapse-icon' );
      const objectDropzone = collapseIcon.closest( '.object-name' ).nextSibling;
      const isCollapsed = objectDropzone.classList.contains( 'is-collapsed' );
      if ( isCollapsed ) {
        objectDropzone.classList.remove( 'is-collapsed' );
        collapseIcon.classList.remove( 'is-collapsed' );
      } else {
        objectDropzone.classList.add( 'is-collapsed' );
        collapseIcon.classList.add( 'is-collapsed' );
      }
    } );
    label.appendChild( collapseIcon );
    div.appendChild( label );

    // create a dropzone for the array members
    const arrayDropzone = document.createElement( 'div' );
    arrayDropzone.classList.add( 'array-dropzone', 'dropzone', 'js-dropzone' );
    arrayDropzone.dataset.wrapper = "is-array";
    arrayDropzone.addEventListener( "dragover", dragOver );
    arrayDropzone.addEventListener( "dragleave", dragLeave );
    arrayDropzone.addEventListener( "drop", drop );

    div.appendChild( arrayDropzone );
  }

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

  document.getElementById( 'dropzone' ).addEventListener( 'click', ( e ) => {
    e.stopImmediatePropagation();
    // if the add button was clicked clone the element and add it after the element
    if ( e.target.classList.contains( 'add-button' ) ) {
      const clonedElement = e.target.parentElement.parentElement.cloneNode( true );
      e.target.parentElement.parentElement.after( clonedElement );
    }
    // if the delete button was clicked remove element
    if ( e.target.classList.contains( 'delete-button' ) ) {
      e.target.parentElement.parentElement.remove();
    }
  } );

  return div;
};

/**
 * @function getUpdatedElement(prop)
 * @param {object} prop 
 * @returns updatedElement
 * @description This function will first create a new element and then updates
 *   element based on prop values
 */
export const getUpdatedElement = ( prop ) => {
  // Build the new element...
  const newElement = createComponent( prop.type );
  // ...and update it with the field data
  const updatedElement = updateElement( newElement, prop );

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
 * @param {DOM Element} element 
 * @param {*} field 
 * @returns 
 */
function updateElement( element, field ) {

  if ( field.type === "checkbox" ) {
    // Update the checkbox state
    element.querySelector( '.element-value' ).checked = field.value;
    // Update the label
    element.querySelector( '.element-label' ).value = field.label;
  } // end checkbox

  if ( field.type === "text" || field.type === "textarea" || field.type === "markdown editor" ) {
    // Update the text value
    element.querySelector( '.element-value' ).value = field.value;
    // Update the label
    element.querySelector( '.element-label' ).value = field.label;
    // Update the placeholder
    element.querySelector( '.element-value' ).placeholder = field.placeholder;
  } // end text, textarea, markdown editor

  if ( field.type === "simple list" ) {
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
        const updatedElement = getUpdatedElement( property );
        // ... and add it to the dropzone
        objectDropzone.appendChild( updatedElement );
      } );
    }
  } // end object/array

  return element;
}