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

  const { closest, position } = getInsertionPoint( dropzone, e.clientY );
  if ( closest ) {
    if ( position === 'before' ) {
      dropzone.insertBefore( window.draggedElement, closest );
    } else {
      dropzone.insertBefore( window.draggedElement, closest.nextSibling );
    }
  } else {
    dropzone.appendChild( window.draggedElement );
  }
  window.draggedElement = null; // Clear the reference
};


// Add drag and drop functionality to the form
export const dragStart = ( e ) => {
  // dragstart is delegated from the form element's event listener
  if ( !e.target.closest( '.form-element' ) ) return;

  // Set the data type and value of the dragged element
  e.dataTransfer.setData( "text/plain", e.target.dataset.component );
  /* 
    Add the drag origin to the dragged element
    We may drag a new element token from the 'sidebar' to add an element to the form, OR
    we may drag an element in the 'dropzone' to a different dropzone location
  */
  let origin = "sidebar";

  // Find if an acestor with id 'dropzone' exists
  const dropzone = e.target.closest( '.dropzone' );
  origin = dropzone ? "dropzone" : origin;
  // Set the origin
  e.dataTransfer.setData( "origin", origin );

  // store the dragged element
  window.draggedElement = e.target;
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
      closest.style.marginBottom = "2rem";
    } else {
      if ( closest.nextSibling ) {
        closest.nextSibling.style.marginTop = "2rem";
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

  // reset all margins that were caused by elements dragged over
  dropzone.childNodes.forEach( child => {
    child.style.margin = "0.5rem 0";
  } );
};

/**
 * @function drop
 * @param {*} event 
 * @description This function will handle the drop event. 
 * There are three scenarios to handle during a drop event:
 *  1. Dragging a schema file into the drop zone
 *  2. Dragging a new element from the sidebar to the drop zone
 *  3. Moving an existing element within or between drop zones
 */
export const drop = async ( e ) => {
  e.preventDefault();
  e.stopPropagation();

  const dropzone = e.target.closest( '.dropzone' );
  if ( !dropzone ) return;

  // Remove highlight class from the event target, which indicates a valid drop target during the dragover event.
  dropzone.classList.remove( 'dropzone-highlight' );

  // reset all margins that were caused by elements dragged over
  dropzone.childNodes.forEach( child => {
    child.style.margin = "0.5rem 0";
  } );

  // get the origin of the dragged element
  const origin = e.dataTransfer.getData( "origin" );

  /*
    1. Check if we dragged schema files into the dropzone
  */
  const hasFiles = e.dataTransfer.types.includes( 'Files' );

  if ( hasFiles ) {
    const files = e.dataTransfer.files;
    await processSchemaFile( files, dropzone, e );
    return;
  }

  /*
    2. Dragging a new element from the sidebar to the drop zone
  */
  if ( origin === "sidebar" ) {
    /*
      After receiving an component token from the sidebar, we need to create a 
      new element that represents the component type from the dataTransfer object.
    */
    const component = e.dataTransfer.getData( "text/plain" );
    processSidebarDraggables( e, component );

  } else {
    /*
      3. Moving an existing element within or between drop zones
    */
    moveElement( e );
  }
};

export const sectionCollapse = ( e ) => {
  const collapseIcon = e.target.closest( '.collapse-icon' );
  if ( !collapseIcon ) return;

  e.stopPropagation();
  const objectDropzone = collapseIcon.closest( '.object-name' ).nextSibling;
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

  // if the add button was clicked clone the element and add it after the element
  if ( e.target.classList.contains( 'add-button' ) ) {
    e.stopPropagation();
    const clonedElement = e.target.parentElement.parentElement.cloneNode( true );
    e.target.parentElement.parentElement.after( clonedElement );
  }
  // if the delete button was clicked remove element
  if ( e.target.classList.contains( 'delete-button' ) ) {
    e.stopPropagation();
    e.target.parentElement.parentElement.remove();
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