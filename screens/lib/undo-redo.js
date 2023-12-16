export const redoUndo = () => {
  // create wrapper div for redo, undo and snapshot buttons
  const wrapper = document.createElement( 'div' );
  wrapper.id = 'undo-redo-wrapper';
  // create undo button
  const undoButton = document.createElement( 'button' );
  undoButton.classList.add( 'undo', 'btn' );
  undoButton.setAttribute( 'title', 'Undo' );
  //undoButton.disabled = true;
  undoButton.innerHTML = `
    <svg viewBox="0 0 22 14" xmlns="http://www.w3.org/2000/svg">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <g stroke="#000000" stroke-width="2">
          <g transform="translate(2, 2)">
            <polyline id="Path" points="0 0 0 6 6 6"></polyline>
            <path d="M18,10 C18,5.02943725 13.9705627,1 9,1 C6.78512226,1.00225545 4.64885314,1.82115862 3,3.3 L0,6" id="Path"></path>
          </g>
        </g>
      </g>
  </svg>
  `;
  wrapper.appendChild( undoButton );
  // create redo button
  const redoButton = document.createElement( 'button' );
  redoButton.classList.add( 'redo', 'btn' );
  redoButton.setAttribute( 'title', 'Redo' );
  redoButton.disabled = true;
  redoButton.innerHTML = `
    <svg viewBox="0 0 22 14" xmlns="http://www.w3.org/2000/svg">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <g stroke="#000000" stroke-width="2">
          <g transform="translate(2, 2)">
            <polyline id="Path" points="18 0 18 6 12 6"></polyline>
            <path d="M0,10 C0,5.02943725 4.02943725,1 9,1 C11.2148777,1.00225545 13.3511469,1.82115862 15,3.3 L18,6" id="Path"></path>
          </g>
        </g>
      </g>
    </svg>
  `;
  wrapper.appendChild( redoButton );
  // create snapshot button
  const snapshotButton = document.createElement( 'button' );
  snapshotButton.classList.add( 'snapshot', 'btn' );
  //snapshotButton.disabled = true;
  snapshotButton.setAttribute( 'title', 'Take a snapshot of the current state' );
  snapshotButton.innerHTML = `
    <svg viewBox="0 0 24 20" xmlns="http://www.w3.org/2000/svg">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
        <g stroke="#000000" stroke-width="2">
          <g transform="translate(2, 2)">
            <path d="M12.5,0 L7.5,0 L5,3 L2,3 C0.8954305,3 0,3.8954305 0,5 L0,14 C0,15.1045695 0.8954305,16 2,16 L18,16 C19.1045695,16 20,15.1045695 20,14 L20,5 C20,3.8954305 19.1045695,3 18,3 L15,3 L12.5,0 Z"></path>
            <circle cx="10" cy="9" r="3"></circle>
          </g>
        </g>
      </g>
    </svg>
  `;
  wrapper.appendChild( snapshotButton );

  /**
   * Provide undo and redo functionality for the dropzone
   * We monitor the dropzone for changes. On change we enable the snapshot button.
   * Taking a snapshot is up to the user. When the user clicks the snapshot button
   * we clone the dropzone and push the clone onto the undo stack.
   */
  //let dismissinitialLoad = true;
  let undoStack = [];
  let redoStack = [];

  console.log( "Initial undo stack:" );
  console.dir( undoStack.length );

  /*

  // Clone the initial state of the dropzone. We clone so we capture 
  // the event listeners as well as the HTML
  // Clone the current state of the dropzone. We clone so we capture 
  // the event listeners as well as the HTML
  let clone = dropzone.cloneNode( true );
  // Push the clone onto the stack
  undoStack.push( clone );

  const enableSnapshotButton = () => {
    snapshotButton.disabled = false;

    // enable the undo button if there is something on the stack
    if ( undoStack.length > 0 ) {
      undoButton.disabled = false;

      let clone = dropzone.cloneNode( true );
      // Push the clone onto the stack
      undoStack.push( clone );
    }
  };

  // Callback function to execute when DOM mutations are observed
  const manageDomChanges = function ( mutationsList, observer ) {
    if ( dismissinitialLoad ) {
      dismissinitialLoad = false;
      return;
    }
    for ( const mutation of mutationsList ) {
      if ( mutation.type === 'childList' ) {
        console.log( 'A child node has been added or removed.' );
      } else if ( mutation.type === 'attributes' ) {
        console.log( `The ${ mutation.attributeName } attribute was modified.` );
      }
    }
    enableSnapshotButton();
  };

  // Use MutationObserver to observe changes to the DOM structure and attributes.
  const observer = new MutationObserver( manageDomChanges );
  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };
  // Select the main dropzone
  const targetNode = document.getElementById( 'dropzone' );
  // ... and start observing it
  observer.observe( targetNode, config );

  // Use eventlistener to capture changes to input element values.
  targetNode.addEventListener( 'change', ( event ) => {
    if ( event.target.matches( 'input[type="checkbox"], input[type="radio"], select, input, textarea' ) ) {
      enableSnapshotButton();
    }
  } );

  */

  // Add event listeners to the buttons. Delegate to the wrapper
  wrapper.addEventListener( 'click', ( e ) => {
    const dropzone = document.getElementById( 'dropzone' );

    const target = e.target;
    if ( target.closest( '.undo' ) ) {
      // undo
      console.log( 'before undo' );
      console.log( undoStack.length );

      if ( undoStack.length > 0 ) {
        // Get the last saved state (clone)
        let lastState = undoStack.pop();
        // Replace the current element with the last saved state
        dropzone.parentNode.replaceChild( lastState, dropzone );
      } else {
        console.log( 'undo stack empty' );
      }

      console.log( 'after undo' );
      console.log( undoStack.length );
    }

    else if ( target.closest( '.redo' ) ) {
      // redo
      console.log( 'redo' );
      /*
      if ( redoStack.length > 0 ) {
        undoStack.push( dropzone );

        let nextState = redoStack.pop();
        // Replace the current element with the last saved state
        mainForm.replaceChild( nextState, dropzone );
      }
      */
    }

    else if ( target.closest( '.snapshot' ) ) {
      // Clone the current state of the dropzone. We clone so we capture 
      // the event listeners as well as the HTML
      let clone = dropzone.cloneNode( true );
      // Push the clone onto the stack
      undoStack.push( clone );
    }
  } );



  return wrapper;
};