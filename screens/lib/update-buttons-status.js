export const updateButtonsStatus = () => {
  // update SUBMIT button status
  // SUBMIT button is disabled by default. It will be enabled when schema fields
  // exist, the user has added valid text to a label input in the dropzone and all 
  // other label inputs have valid text.
  const submitButton = document.getElementById( 'submit-primary' );

  // check if any schemas are present
  let hasSchemaFields = false;
  const schemaWrapper = document.getElementById( 'existing-schemas' );
  const schemaFields = schemaWrapper ? schemaWrapper.querySelectorAll( '.form-element' ) : [];
  if ( schemaFields.length > 0 ) {
    hasSchemaFields = true;
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

  //console.log(`hasSchemaFields: ${hasSchemaFields}`);
  //console.log(`hasValidLabelInputs: ${hasValidLabelInputs}`);
  //console.log(`hasLabelInputs: ${hasLabelInputs}`);

  // enable the SUBMIT button if all inputs have valid text
  if ( ( hasSchemaFields && hasValidLabelInputs ) ||
    ( !hasSchemaFields && hasValidLabelInputs ) ||
    ( hasSchemaFields && !hasLabelInputs ) ) {
    submitButton.disabled = false;
  } else {
    submitButton.disabled = true;
  }

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