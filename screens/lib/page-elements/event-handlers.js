import { createComponent } from "./create-element.js";
import { updateButtonsStatus } from "./update-buttons-status.js";
import { isValidLabel, showErrorMessage, removeErrorMessage } from '../utilities/form-field-validations.js';
import { addActionButtons } from '../buttons/form-actions.js';
import { frontmatterToFragment } from '../form-generation/frontmatter-to-fragment.js';
import { ICONS } from '../../icons/index.js';
import { templates } from '../../../templates/index.js';

import { logFragment } from '../utilities/fragment-debug-helper.js';

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

  // Create new element with requested component type
  const newElement = createComponent( component, false );

  // add an ADD and DELETE button to the new element
  addActionButtons( newElement, { addDeleteButton: true, addDuplicateButton: true } );

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
 * @function processTemplate
 * @param {*} e 
 * @param {*} url 
 * @description This function will process the template draggables
 */
// processTemplate function update
async function processTemplate( e, url ) {
  const dropzone = e.target.closest( '.dropzone' );
  if ( !dropzone ) return;

  try {
    const templateName = url.replace( '.json', '' );
    const templateSchema = templates[ templateName ];

    if ( !templateSchema ) {
      throw new Error( 'Failed to load template' );
    }

    // check if section template
    if ( url.includes( 'section' ) ) {
      // Create section wrapper fragment
      const wrapperFragment = document.createDocumentFragment();
      const sectionWrapper = document.createElement( 'div' );
      sectionWrapper.className = 'label-exists form-element is-object no-drop';
      sectionWrapper.draggable = true;
      sectionWrapper.setAttribute( 'data-path', templateName );

      // Add section wrapper structure
      sectionWrapper.innerHTML = `
        <span class="sort-handle">${ ICONS.DRAG_HANDLE }</span>
        <label class="object-name label-wrapper">
          <span>Object Label<sup>*</sup></span>
          <span class="hint">Sections Object</span>
          <input type="text" class="element-label" placeholder="Label Placeholder" readonly="">
          <span class="collapse-icon">
            ${ ICONS.COLLAPSE }
            ${ ICONS.COLLAPSED }
          </span>
        </label>
        <div class="object-dropzone dropzone js-dropzone" data-wrapper="is-object"></div>
        <div class="button-wrapper">
          <div class="add-button button">${ ICONS.ADD }</div>
          <div class="delete-button">${ ICONS.DELETE }</div>
        </div>
      `;

      // convert the template schema to HTML form fields starting with root path
      const formFragment = await frontmatterToFragment( templateSchema, templateName );

      // Process any arrays found in the converted form
      processArraysInFragment( formFragment, templateSchema );

      // Add form elements to the inner dropzone
      sectionWrapper.querySelector( '.object-dropzone' ).appendChild( formFragment );
      wrapperFragment.appendChild( sectionWrapper );

      // Handle insertion based on position
      const { closest, position } = getInsertionPoint( dropzone, e.clientY );

      if ( !closest ) {
        dropzone.appendChild( wrapperFragment );
        return;
      }

      if ( position === 'before' ) {
        dropzone.insertBefore( wrapperFragment, closest );
      } else {
        const nextSibling = closest.nextElementSibling;
        if ( nextSibling ) {
          dropzone.insertBefore( wrapperFragment, nextSibling );
        } else {
          dropzone.appendChild( wrapperFragment );
        }
      }
    } else {
      // Handle non-section templates
      const fragment = await frontmatterToFragment( templateSchema );

      // Validate fragment
      if ( !( fragment instanceof DocumentFragment ) ) {
        throw new Error( 'Invalid fragment returned from frontmatterToForm' );
      }

      // Handle insertion based on position
      const { closest, position } = getInsertionPoint( dropzone, e.clientY );

      if ( !closest ) {
        dropzone.appendChild( fragment );
        return;
      }

      if ( position === 'before' ) {
        dropzone.insertBefore( fragment, closest );
      } else {
        const nextSibling = closest.nextElementSibling;
        if ( nextSibling ) {
          dropzone.insertBefore( fragment, nextSibling );
        } else {
          dropzone.appendChild( fragment );
        }
      }
    }

    updateButtonsStatus();

  } catch ( error ) {
    console.error( 'Template processing failed:', error );
    throw error;
  }
}

// Helper function to process arrays within a fragment
function processArraysInFragment( fragment, schema ) {
  const arrayElements = fragment.querySelectorAll( '.is-array' );

  arrayElements.forEach( arrayElement => {
    const arrayPath = arrayElement.getAttribute( 'data-path' );
    const arrayData = getArrayDataFromSchema( schema, arrayPath );
    const arrayDropzone = arrayElement.querySelector( '.array-list.dropzone' );

    if ( arrayDropzone && arrayData.length ) {
      arrayData.forEach( ( item, index ) => {
        const itemWrapper = document.createElement( 'div' );
        itemWrapper.className = 'label-exists form-element is-object no-drop';
        itemWrapper.draggable = true;
        itemWrapper.setAttribute( 'data-path', `${ arrayPath }[${ index }]` );

        itemWrapper.innerHTML = `
          <span class="sort-handle">${ ICONS.DRAG_HANDLE }</span>
          <label class="object-name label-wrapper">
            <span>Array Item<sup>*</sup></span>
            <input type="text" class="element-label" placeholder="Item Name" readonly="">
            <span class="collapse-icon">
              ${ ICONS.COLLAPSE }
              ${ ICONS.COLLAPSED }
            </span>
          </label>
          <div class="object-dropzone dropzone js-dropzone" data-wrapper="is-object"></div>
          <div class="button-wrapper">
            <div class="add-button button">${ ICONS.ADD }</div>
            <div class="delete-button">${ ICONS.DELETE }</div>
          </div>
        `;

        // Process the item's content with proper path
        const itemFragment = frontmatterToFragment( item, `${ arrayPath }[${ index }]` );

        // Add to item's dropzone
        itemWrapper.querySelector( '.object-dropzone' ).appendChild( itemFragment );

        // Add completed item to array dropzone
        arrayDropzone.appendChild( itemWrapper );
      } );
    }
  } );
}

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
  // Handle empty container
  if ( !container.children.length ) {
    return { closest: null, position: 'after' };
  }

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
 * @function isValidDropTarget
 * @param {HTMLElement} dropzone - The target dropzone element
 * @param {string} componentType - The type of component being dragged
 * @param {string} origin - The origin of the drag ('templates', 'sidebar', 'dropzone')
 * @returns {boolean} - Whether the drop is valid for this target
 * @description Validates if a component can be dropped in the target dropzone
 */
function isValidDropTarget( dropzone, componentType, origin ) {
  // If we're dragging a section, it must go into an array dropzone
  if ( componentType === 'section' ||
    ( origin === 'templates' && componentType.includes( 'section' ) ) ) {
    return dropzone.dataset.wrapper === 'is-array';
  }

  // All other components can be dropped anywhere
  return true;
}

/**
 * @function validateDrop
 * @param {DragEvent} e - The drop event
 * @returns {Object} - Validation result with dropzone and validity
 * @description Validates a drop event and returns the target dropzone if valid
 */
function validateDrop( e ) {
  const dropzone = e.target.closest( '.dropzone' );
  if ( !dropzone ) {
    return { dropzone: null, isValid: false };
  }

  const origin = e.dataTransfer.getData( 'origin' );
  const componentType = e.dataTransfer.getData( 'text/plain' );

  return {
    dropzone,
    isValid: isValidDropTarget( dropzone, componentType, origin )
  };
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

  const dropzone = e.target.closest( '.dropzone' );
  dropzone.classList.add( 'dropzone-highlight' );
  dropzone.style.paddingTop = "5rem";
  dropzone.style.paddingBottom = "5rem";

  const { closest, position } = getInsertionPoint( dropzone, e.clientY );

  // Reset existing margins first
  Array.from( dropzone.children ).forEach( child => {
    if ( child.style ) {
      child.style.margin = "0.5rem 0";
    }
  } );

  if ( closest ) {
    if ( position === 'before' ) {
      if ( closest.style ) {
        closest.style.marginBottom = "5rem";
      }
    } else if ( closest.nextElementSibling && closest.nextElementSibling.style ) {
      closest.nextElementSibling.style.marginTop = "5rem";
    }
  }
};

export const dragLeave = ( e ) => {
  const dropzone = e.target.closest( '.dropzone' );
  if ( !dropzone ) return;

  dropzone.classList.remove( 'dropzone-highlight' );
  dropzone.style.paddingTop = "0.5rem";
  dropzone.style.paddingBottom = "0.5rem";

  // Reset margins using children instead of childNodes
  Array.from( dropzone.children ).forEach( child => {
    if ( child.style ) {
      child.style.margin = "0.5rem 0";
    }
  } );
};

/**
 * @function drop
 * Handles drop events for different drag sources
 * @param {DragEvent} e - The drop event object
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
        const templateUrl = e.dataTransfer.getData( 'text/plain' );
        await processTemplate( e, templateUrl );
        break;
      }

      case 'sidebar': {
        const componentType = e.dataTransfer.getData( 'text/plain' );
        processSidebarDraggables( e, componentType );
        break;
      }

      case 'dropzone': {
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
/**
 * Cleans up visual indicators after drop
 * @param {HTMLElement} dropzone - The dropzone element
 */
const cleanupDropzone = ( dropzone ) => {
  if ( !dropzone ) return;

  // Remove dropzone highlighting
  dropzone.classList.remove( 'dropzone-highlight' );
  dropzone.style.paddingTop = "0.5rem";
  dropzone.style.paddingBottom = "0.5rem";

  // Reset spacing on child elements
  Array.from( dropzone.children ).forEach( child => {
    if ( child && child.style ) {
      child.style.margin = '0.5rem 0';
    }
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