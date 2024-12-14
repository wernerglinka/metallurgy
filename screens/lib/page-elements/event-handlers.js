import { createComponent } from "./create-element.js";
import { updateButtonsStatus } from "./update-buttons-status.js";
import { isValidLabel, showErrorMessage, removeErrorMessage } from '../utilities/form-field-validations.js';
import { addActionButtons } from '../buttons/form-actions.js';
import { frontmatterToFragment } from '../form-generation/frontmatter-to-fragment.js';
import { ICONS } from '../../icons/index.js';
import { templates } from '../../../templates/index.js';
import { updateArrayElement } from './create-element.js';

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
    const templateName = url.split( '/' ).pop().replace( '.js', '' );
    const templateSchema = templates[ templateName ];

    console.log( templateName );

    if ( !templateSchema ) {
      throw new Error( 'Failed to load template' );
    }

    // check if section or block template
    if ( url.includes( 'section' ) || url.includes( 'blocks' ) ) {
      // Create wrapper fragment
      const wrapperFragment = document.createDocumentFragment();
      const wrapper = document.createElement( 'div' );
      wrapper.className = 'label-exists form-element is-object no-drop';
      wrapper.draggable = true;
      //wrapper.setAttribute( 'data-path', templateName );

      const isSection = url.includes( 'section' );
      const hintText = isSection ? 'Sections Object' : 'Block Object';
      const description = isSection ? templateSchema.sectionDescription : templateSchema.blockDescription;

      // Add wrapper structure
      wrapper.innerHTML = `
        <span class="sort-handle">${ ICONS.DRAG_HANDLE }</span>
        <label class="object-name label-wrapper">
          <span>${ isSection ? 'Object Label' : templateName + ' Block' }<sup>*</sup></span>
          <span class="hint">${ hintText }</span>
          <input type="text" class="element-label" placeholder="Label Placeholder" readonly="">
          <span class="collapse-icon">
            ${ ICONS.COLLAPSE }
            ${ ICONS.COLLAPSED }
          </span>
        </label>
        <div class="object-dropzone dropzone js-dropzone"></div>
      `;

      // Add appropriate buttons based on type
      addActionButtons( wrapper, {
        addDeleteButton: true,
        addDuplicateButton: isSection
      } );

      // Add description if it exists
      if ( description && description !== '' ) {
        const descriptionSpan = document.createElement( 'span' );
        descriptionSpan.classList.add( isSection ? 'section-description' : 'block-description' );
        descriptionSpan.textContent = description;

        const hintElement = wrapper.querySelector( '.hint' );
        hintElement.insertAdjacentElement( 'afterend', descriptionSpan );
      }

      // convert the template schema to HTML form fields
      const formFragment = await frontmatterToFragment( templateSchema, templateName );

      // Process any arrays if it's a section
      if ( isSection ) {
        processArraysInFragment( formFragment, templateSchema );
      }

      // Add form elements to the inner dropzone
      wrapper.querySelector( '.object-dropzone' ).appendChild( formFragment );
      wrapperFragment.appendChild( wrapper );

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
      // Handle other templates
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
    // Get element details
    const labelInput = arrayElement.querySelector( '.element-label' );
    const dropzone = arrayElement.querySelector( '.dropzone' );

    if ( labelInput && labelInput.value === 'columns' ) {
      // Columns are already handled by updateArrayElement during initial creation
      return;
    }

    // Handle other arrays as before...
    const arrayPath = arrayElement.getAttribute( 'data-path' );
    const arrayData = schema[ arrayPath ] || [];
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
  // Simplified to just focus on the key logic
  if ( !container.children.length ) {
    return { closest: null, position: 'after' };
  }

  let closest = null;
  let closestDistance = Infinity;

  Array.from( container.children ).forEach( child => {
    const box = child.getBoundingClientRect();
    const midpoint = box.top + ( box.height / 2 );
    const distance = Math.abs( y - midpoint );

    if ( distance < closestDistance ) {
      closestDistance = distance;
      closest = child;
    }
  } );

  return {
    closest,
    position: closest ? ( y < closest.getBoundingClientRect().top + ( closest.getBoundingClientRect().height / 2 ) ? 'before' : 'after' ) : 'after'
  };
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

// Keep track of the current drag state
let dragState = {
  currentDropzone: null,
  ghostElement: null,
  lastPosition: null,
  isDragging: false,
  elementPositions: new Map(),
  lastUpdate: 0, // Add timestamp tracking
  isUpdating: false // Add flag to prevent concurrent updates
};

const recordElementPositions = ( dropzone ) => {
  const elements = Array.from( dropzone.querySelectorAll( '.form-element' ) );
  dragState.elementPositions.clear();

  elements.forEach( element => {
    dragState.elementPositions.set( element, element.getBoundingClientRect() );
  } );
};

const animateElements = ( dropzone ) => {
  const elements = Array.from( dropzone.querySelectorAll( '.form-element' ) );

  // Get the new positions
  elements.forEach( element => {
    const oldRect = dragState.elementPositions.get( element );
    if ( !oldRect ) return;

    const newRect = element.getBoundingClientRect();
    const deltaY = oldRect.top - newRect.top;

    // Immediately move back to original position
    element.style.transition = 'none';
    element.style.transform = `translateY(${ deltaY }px)`;
  } );

  // Force reflow
  dropzone.offsetHeight;

  // Animate to new positions
  elements.forEach( element => {
    element.style.transition = 'transform 0.2s ease-out';
    element.style.transform = 'translateY(0)';
  } );
};

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

  dragState.isDragging = true;
};

export const dragEnd = ( e ) => {
  cleanupDragState();
};

const cleanupDragState = () => {
  if ( dragState.currentDropzone ) {
    dragState.currentDropzone.classList.remove( 'dropzone-highlight' );
    dragState.currentDropzone.querySelectorAll( '.form-element' ).forEach( el => {
      el.style.transition = '';
      el.style.transform = '';
    } );
  }
  if ( dragState.ghostElement?.parentNode ) {
    dragState.ghostElement.remove();
  }
  dragState = {
    currentDropzone: null,
    ghostElement: null,
    lastPosition: null,
    isDragging: false,
    elementPositions: new Map()
  };
};

const createGhostElement = () => {
  const ghost = document.createElement( 'div' );
  ghost.className = 'drop-ghost';
  ghost.style.height = '4rem';
  ghost.style.border = '2px dashed #666';
  ghost.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
  ghost.style.margin = '0.5rem 0';
  ghost.style.borderRadius = '4px';
  ghost.style.pointerEvents = 'none'; // Prevent ghost from interfering with drag events
  return ghost;
};

export const dragOver = ( e ) => {
  e.preventDefault();

  const dropzone = e.target.closest( '.dropzone' );
  if ( !dropzone || !dragState.isDragging || dragState.isUpdating ) return;

  const now = Date.now();
  // Only process updates every 100ms
  if ( now - dragState.lastUpdate < 100 ) return;

  dragState.isUpdating = true;

  try {
    if ( dragState.currentDropzone === dropzone ) {
      const { closest, position } = getInsertionPoint( dropzone, e.clientY );
      const newPosition = closest ? `${ closest.id }-${ position }` : 'empty';

      if ( dragState.lastPosition !== newPosition ) {
        dragState.lastPosition = newPosition;
        updateGhostPosition( dropzone, closest, position );
        dragState.lastUpdate = now;
      }
    } else {
      if ( dragState.currentDropzone ) {
        dragState.currentDropzone.classList.remove( 'dropzone-highlight' );
      }

      dragState.currentDropzone = dropzone;
      dropzone.classList.add( 'dropzone-highlight' );

      if ( !dragState.ghostElement ) {
        dragState.ghostElement = createGhostElement();
      }

      const { closest, position } = getInsertionPoint( dropzone, e.clientY );
      updateGhostPosition( dropzone, closest, position );
      dragState.lastUpdate = now;
    }
  } finally {
    dragState.isUpdating = false;
  }
};


const updateGhostPosition = ( dropzone, closest, position ) => {
  const ghost = dragState.ghostElement;
  if ( !ghost || !dropzone ) return;

  // Record positions before making changes
  recordElementPositions( dropzone );

  // Remove ghost from current position
  if ( ghost.parentNode ) {
    ghost.remove();
  }

  try {
    if ( closest ) {
      if ( position === 'before' ) {
        closest.parentNode?.insertBefore( ghost, closest );
      } else {
        const nextSibling = closest.nextElementSibling;
        if ( nextSibling ) {
          closest.parentNode?.insertBefore( ghost, nextSibling );
        } else {
          closest.parentNode?.appendChild( ghost );
        }
      }
    } else {
      dropzone.appendChild( ghost );
    }

    // Animate elements to their new positions
    animateElements( dropzone );

  } catch ( error ) {
    console.warn( 'Failed to update ghost position:', error );
    if ( ghost.parentNode ) {
      ghost.remove();
    }
  }
};

export const dragLeave = ( e ) => {
  const dropzone = e.target.closest( '.dropzone' );
  if ( !dropzone ) {
    // Clean up if leaving dropzone area
    if ( dragState.ghostElement?.parentNode ) {
      dragState.ghostElement.remove();
      dragState.ghostElement = null;
    }
    return;
  }

  // Check if we're actually leaving the dropzone
  const relatedTarget = e.relatedTarget;
  if ( !dropzone.contains( relatedTarget ) && !relatedTarget?.closest( '.dropzone' ) ) {
    dropzone.classList.remove( 'dropzone-highlight' );
    if ( dragState.ghostElement?.parentNode ) {
      dragState.ghostElement.remove();
      dragState.ghostElement = null;
    }
    dragState.currentDropzone = null;
    dragState.lastPosition = null;
  }
};

const cleanupDropzone = ( dropzone ) => {
  if ( !dropzone ) return;
  cleanupDragState();
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
        const isBlock = templateUrl.includes( '/blocks/' );
        const isColumnDropzone = dropzone.matches( '.object-dropzone[data-wrapper="is-object"]' );

        // Only allow sections in main dropzone and blocks in column dropzones
        if ( isBlock ) {
          // Blocks can only be dropped in column dropzones
          if ( !isColumnDropzone ) {
            console.warn( 'Blocks can only be dropped into columns' );
            return;
          }
        } else {
          // Sections can only be dropped in main dropzone
          if ( isColumnDropzone ) {
            console.warn( 'Sections cannot be dropped into columns' );
            return;
          }
        }

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

  // add value from the textarea to the editor
  window.mdeditor.value( e.target.value );

};