/** 
 * @function isValidLabel
 * @param {string} label
 * @returns {boolean}
 * @description checks if the label is not empty and contains only letters and numbers
*/
function isValidLabel( label ) {
  return /^[A-Za-z0-9]+$/.test( label );
}

export const updateButtonsStatus = ( newForm = false ) => {
  console.log( "enter updateButtonsStatus" );
  console.log( `newForm: ${ newForm }` );
  // update SUBMIT button status
  // SUBMIT button is disabled by default. It will be enabled when schema fields
  // exist, the user has added valid text to a label input in the dropzone and all 
  // other label inputs have valid text.
  const submitButton = document.getElementById( 'submit-primary' );

  if ( newForm ) {
    submitButton.disabled = true;
    return;
  }

  // loop over all label inputs in the dropzone and check if they have valid text.
  // If all have valid text, enable the SUBMIT button
  // NOTE: Object name inputs are not required to have text. When used in an array
  //an object may not need a name. This is up to the user.
  const allLabelInputs = document.querySelectorAll( '.element-label, .object-name input:not(.not-required input)' );
  let hasValidLabelInputs = true;
  let hasLabelInputs = true;

  if ( allLabelInputs.length > 0 ) {
    hasLabelInputs = true;
    // check if any input is empty
    allLabelInputs.forEach( input => {
      // check if the input is valid
      if ( !isValidLabel( input.value.trim() ) ) {
        hasValidLabelInputs = false;
      }
    } );
  } else {
    hasValidLabelInputs = false;
    hasLabelInputs = false;
  }

  //console.log( `hasValidLabelInputs: ${ hasValidLabelInputs }` );
  //console.log( `hasLabelInputs: ${ hasLabelInputs }` );

  // enable the SUBMIT button if all inputs have valid text

  /*
  if ( hasValidLabelInputs ) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }
  */

  submitButton.disabled = false;

  // update CLEAR FORM button status
  // CLEAR FORM button is disabled by default. It will be enabled when the user
  // has added elements to the dropzone and disabled when the dropzone is empty.
  const clearDropzoneButton = document.getElementById( 'clear-dropzone' );
  const dropzone = document.getElementById( 'dropzone' );
  const dropzoneElements = dropzone.querySelectorAll( '.form-element' );
  if ( dropzoneElements.length > 0 ) {
    clearDropzoneButton.disabled = false;
  } else {
    clearDropzoneButton.disabled = true;
  }
};