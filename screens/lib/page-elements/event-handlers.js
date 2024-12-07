import { createComponent } from "./create-element.js";
import { updateButtonsStatus } from "./update-buttons-status.js";
import { isValidLabel, showErrorMessage, removeErrorMessage } from '../utilities/form-field-validations.js';
import { addActionButtons } from '../buttons/form-actions.js';

/**
 * @function processSidebarDraggables
 * @param {*} e 
 * @param {*} component 
 * @param {*} dropzone
 * @description This function will process the sidebar draggables
 */
function processSidebarDraggables( e, component ) {
  const dropzone = e.target.closest( '.dropzone' );
  if ( !dropzone ) return;

  console.log( 'processSidebarDraggables' );

  // Create new element with requested component type
  const newElement = createComponent( component, false );

  // add an ADD and DELETE button to the new element
  addActionButtons( newElement, { addDeleteButton: true, addDuplicateButton: true } );


  console.log( `inserted element:` );
  console.log( newElement );

  // If an object is placed in an array dropzone, hide the label input
  // since the object will not need a name
  if ( component === "object" && e.target.dataset.wrapper === "is-array" ) {
    const labelInput = newElement.querySelector( '.object-name' );

    // check if any objects already exists in the array dropzone
    // to avoid duplicate names. E.g. we will generate  'neverMind1', 'neverMind2', etc.
    const objectsInArray = e.target.querySelectorAll( '.object-name' );
    const objectIndex = objectsInArray.length;
    labelInput.querySelector( 'input' ).value = `neverMind${ objectIndex + 1 }`; // something for the loopstack
    labelInput.style.display = "none";
  }

  // Add an eventlistener to the label input to enable the button when the user
  // has added text to the label input and all other label inputs have text
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

  /*
    To insert the dragged element either before or after an existing element 
    in the drop container, including the ability to insert before the first 
    element, we need to determine the relative position of the cursor to the 
    center of each potential sibling element. This way, we can decide whether 
    to insert the dragged element before or after each child based on the 
    cursor's position.
  */
  const { closest, position } = getInsertionPoint( dropzone, e.clientY );
  if ( closest ) {
    if ( position === 'before' ) {
      dropzone.insertBefore( newElement, closest );
    } else {
      dropzone.insertBefore( newElement, closest.nextSibling );
    }
  } else {
    dropzone.appendChild( newElement );
  }

  updateButtonsStatus();
};

/**
 * @function processTemplates
 * @param {*} e 
 * @param {*} url 
 * @description This function will process the template draggables
 */
const processTemplates = async ( e, url ) => {
  const dropzone = e.target.closest( '.dropzone' );
  if ( !dropzone ) return;

  // load the template json from the url with electron ipcRenderer
  // and create the element from the template
  const template = await electronAPI.files.read( url );



  console.log( template );

  // Create new element with requested component type
  const placeholderDiv = document.createElement( 'div' );
  placeholderDiv.classList.add( 'template-placeholder' );
  placeholderDiv.innerHTML = "Loading template...";

  /*
    To insert the dragged element either before or after an existing element 
    in the drop container, including the ability to insert before the first 
    element, we need to determine the relative position of the cursor to the 
    center of each potential sibling element. This way, we can decide whether 
    to insert the dragged element before or after each child based on the 
    cursor's position.
  */
  const { closest, position } = getInsertionPoint( dropzone, e.clientY );
  if ( closest ) {
    if ( position === 'before' ) {
      dropzone.insertBefore( placeholderDiv, closest );
    } else {
      dropzone.insertBefore( placeholderDiv, closest.nextSibling );
    }
  } else {
    dropzone.appendChild( placeholderDiv );
  }

  updateButtonsStatus();
};

/**
 * @function getInsertionPoint
 * @param {*} container - The drop container element in which a dragged element is being dropped
 * @param {*} y - The vertical position of the mouse cursor at the time of the drop, typically provided by e.clientY from the drop event.
 * @returns The closest insertion point based on the cursor's position
 * @description This function will get the closest insertion point based on the cursor's position
 * during a drag/drop operation. The insertion point is the element that is closest
 * to the cursor's position. The position is either before or after the element.
 */
function getInsertionPoint( container, y ) {
  // 'closest' will hold a reference to the closest child element to the drop point
  let closest = null;
  // 'closestDistance' will hold the distance from the drop point to the closest child element
  let closestDistance = Infinity;

  //  Iterate over each child element of the container 
  Array.from( container.children ).forEach( child => {
    // Get the position and size of the child element
    const box = child.getBoundingClientRect();
    /*
      Calculate the vertical offset between the center of the child element 
      and the drop point. E.g., difference between the drop point and the 
      vertical midpoint of the child element (box.top + box.height / 2).
    */
    const offset = y - box.top - ( box.height / 2 );

    /* 
      Check if the absolute value of the offset for the current child element 
      is less than the closestDistance. If it is, this child element is closer 
      to the drop point than any previously checked elements. Then update 
      closest to reference this child element and closestDistance to the new 
      offset value.
    */
    if ( Math.abs( offset ) < Math.abs( closestDistance ) ) {
      closestDistance = offset;
      closest = child;
    }
  } );

  /*
     Along with finding the closest child, we also determine whether the dragged
     element should be inserted before or after this child. This is decided 
     based on whether the offset is negative or positive, indicating the cursor's 
     position relative to the vertical center of the closest child.
     If offset is negative, the cursor is above the center, set position to 'before'.
     If offset is positive, the cursor is below the center, set position to 'after'.
  */

  /*
    Return an object containing:
    'closest': The closest child element to the drop point.
    'position': A string indicating whether the dragged element should be inserted 
    before or after the closest child ('before' or 'after').
  */
  return { closest, position: closestDistance < 0 ? 'before' : 'after' };
}

/**
 * @function moveElement
 * @param {*} e 
 * @param {*} dropzone 
 * @description This function will move an existing element within or between drop zones
 *   To insert the dragged element either before or after an existing element 
 *   in the drop container, including the ability to insert before the first 
 *   element, we need to determine the relative position of the cursor to the 
 *   center of each potential sibling element. This way, we can decide whether 
 *   to insert the dragged element before or after each child based on the 
 *   cursor's position.
 */
function moveElement( e ) {
  const dropzone = e.target.closest( '.dropzone' );
  if ( !dropzone ) return;

  // Validate draggedElement exists and is a valid Node
  if ( !window.draggedElement || !( window.draggedElement instanceof Node ) ) {
    console.warn( 'Invalid dragged element:', window.draggedElement );
    return;
  }

  const { closest, position } = getInsertionPoint( dropzone, e.clientY );

  try {
    if ( closest ) {
      if ( position === 'before' ) {
        dropzone.insertBefore( window.draggedElement, closest );
      } else {
        const nextSibling = closest.nextElementSibling;
        if ( nextSibling ) {
          dropzone.insertBefore( window.draggedElement, nextSibling );
        } else {
          dropzone.appendChild( window.draggedElement );
        }
      }
    } else {
      dropzone.appendChild( window.draggedElement );
    }
  } catch ( error ) {
    console.error( 'Error moving element:', error );
  } finally {
    window.draggedElement = null; // Clear the reference
  }
}

// Add drag and drop functionality to the form
export const dragStart = ( e ) => {
  // dragstart is delegated from the form element's event listener
  if ( !e.target.closest( '.form-element' ) // for dragging/sorting existing elements
    && !e.target.closest( '.component-selection' ) // for adding fields
    && !e.target.closest( '.template-selection' ) // for adding templates
  ) return;

  // Set the data type and value of the dragged element
  e.dataTransfer.setData( "text/plain", e.target.dataset.component );
  /* 
    Add the drag origin to the dragged element
    We may drag a new element token from the 'sidebar' to add an element to the form, OR
    we may drag an element in the 'dropzone' to a different dropzone location
  */
  let origin = "sidebar";

  // Find if an ancestor with id 'dropzone' exists, then we just move the
  // element inside the dropzone
  const dropzone = e.target.closest( '.dropzone' );
  origin = dropzone ? "dropzone" : origin;
  // Set the origin
  e.dataTransfer.setData( "origin", origin );


  // Find if an ancestor with class 'js-templates-wrapper' exists
  const templateList = e.target.closest( '.js-templates-wrapper' );
  if ( templateList ) {
    origin = "templates";
    e.dataTransfer.setData( "origin", origin );
    e.dataTransfer.setData( "text/plain", e.target.dataset.url );
    // Don't set window.draggedElement for templates
    return;
  }

  // Only store draggedElement for form elements and field proxies
  if ( origin === "sidebar" || origin === "dropzone" ) {
    window.draggedElement = e.target;
  }
};

/**
 * @function dragOver(e)
 * @param {event object} e 
 * @description This function will handle the dragover event. It will indicate
 *   drop space by inserting a drop-indicator temporarily
 */
export const dragOver = ( e ) => {
  e.preventDefault();
  if ( !e.target.closest( '.dropzone' ) ) return;

  e.target.classList.add( 'dropzone-highlight' );
  const dropzone = e.target.closest( '.dropzone' );
  const { closest, position } = getInsertionPoint( dropzone, e.clientY );

  if ( closest ) {
    if ( position === 'before' ) {
      closest.style.marginBottom = "5rem";
    } else {
      if ( closest.nextElementSibling ) {
        closest.nextElementSibling.style.marginTop = "5rem";
      }
    }
  } else {
    dropzone.childNodes.forEach( child => {
      child.style.margin = "0.5rem 0";
    } );
  }
};

export const dragLeave = ( e ) => {
  const dropzone = e.target.closest( '.dropzone' );
  e.target.classList.remove( 'dropzone-highlight' );

  if ( !dropzone ) return;

  // reset all margins that were caused by elements dragged over
  dropzone.childNodes.forEach( child => {
    child.style.margin = "0.5rem 0";
  } );
};

/**
 * Handles drop events for different drag sources:
 * - Templates: Adding template components from sidebar
 * - Sidebar: Adding new form elements
 * - Dropzone: Moving existing elements
 * 
 * @param {DragEvent} e - The drop event object
 * @returns {Promise<void>}
 * @throws {Error} If drop processing fails
 */
export const drop = async ( e ) => {
  try {
    e.preventDefault();
    e.stopPropagation();

    // Validate drop target
    const dropzone = e.target.closest( '.dropzone' );
    if ( !dropzone ) return;

    // Clean up visual drop indicators
    cleanupDropzone( dropzone );

    // Get drag source and process accordingly
    const origin = e.dataTransfer.getData( 'origin' );

    switch ( origin ) {
      case 'templates': {
        // Handle template drops - creates new component from template
        const templateUrl = e.dataTransfer.getData( 'text/plain' );
        await processTemplates( e, templateUrl );
        break;
      }

      case 'sidebar': {
        // Handle new element drops - creates new form field
        const componentType = e.dataTransfer.getData( 'text/plain' );
        processSidebarDraggables( e, componentType );
        break;
      }

      case 'dropzone': {
        // Handle existing element moves - repositions form field
        moveElement( e );
        break;
      }

      default:
        console.warn( `Unknown drag origin: ${ origin }` );
    }

  } catch ( error ) {
    console.error( 'Drop processing failed:', error );
    throw error;
  }
};

/**
 * Cleans up visual indicators after drop
 * @param {HTMLElement} dropzone - The dropzone element
 */
const cleanupDropzone = ( dropzone ) => {
  // Remove dropzone highlighting
  dropzone.classList.remove( 'dropzone-highlight' );

  // Reset spacing on child elements
  dropzone.childNodes.forEach( child => {
    child.style.margin = '0.5rem 0';
  } );
};

export const sectionCollapse = ( e ) => {
  const collapseIcon = e.target.closest( '.collapse-icon' );
  if ( !collapseIcon ) return;

  e.stopPropagation();
  const objectDropzone = collapseIcon.closest( '.object-name' ).nextElementSibling;
  const isCollapsed = objectDropzone.classList.contains( 'is-collapsed' );
  if ( isCollapsed ) {
    objectDropzone.classList.remove( 'is-collapsed' );
    collapseIcon.classList.remove( 'is-collapsed' );
  } else {
    objectDropzone.classList.add( 'is-collapsed' );
    collapseIcon.classList.add( 'is-collapsed' );
  }
};

export const addDeleteButtons = ( e ) => {
  if ( e.target.closest( '.add-button' ) ) {
    e.stopPropagation();
    const thisButton = e.target.closest( '.add-button' );
    const clonedElement = thisButton.parentElement.parentElement.cloneNode( true );
    clonedElement.classList.remove( 'label-exists' );

    const elementLabel = clonedElement.querySelector( '.element-label' );
    if ( elementLabel ) {
      elementLabel.removeAttribute( 'readonly' );
    }

    // Generate unique name for duplicated section
    const objectNameInput = clonedElement.querySelector( '.object-name input' );
    if ( objectNameInput ) {
      const timestamp = Date.now();
      objectNameInput.value = `neverMind${ timestamp }`;
    }

    thisButton.parentElement.parentElement.after( clonedElement );
  }

  if ( e.target.closest( '.delete-button' ) ) {
    e.stopPropagation();
    const thisButton = e.target.closest( '.delete-button' );
    thisButton.parentElement.parentElement.remove();
  }
};

export const showEditor = ( e ) => {
  // if a click occured inside a textarea, show the editor
  const element = e.target.closest( 'textarea.element-value' );
  if ( !element ) return;

  e.stopPropagation();
  // show the editor when the textarea is in focus
  const editorOverlay = document.getElementById( 'editorOverlay' );
  editorOverlay.classList.add( 'show' );

  window.textareaInput = e.target;

  console.log( window.mdeditor.value() );
  // add value from the textarea to the editor
  window.mdeditor.value( e.target.value );

};