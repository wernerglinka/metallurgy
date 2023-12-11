/**
   * Prepare the form for the drag and drop functionality by adding a dropzone
   * We'll also add a button wrapper to hold all buttons for the form
   */
export const editFormHandling = () => {
  // Add the dropzone to the form
  const dropzone = document.createElement( 'div' );
  dropzone.id = 'dropzone';
  dropzone.classList.add( 'dropzone' );
  dropzone.addEventListener( "dragover", dragOver );
  dropzone.addEventListener( "dragleave", dragLeave );
  dropzone.addEventListener( "drop", drop );
  mainForm.appendChild( dropzone );

  // add a button wrapper to the form
  const buttonWrapper = document.createElement( 'div' );
  buttonWrapper.id = 'button-wrapper';
  mainForm.appendChild( buttonWrapper );

  // Add the SUBMIT button
  const submitButton = document.createElement( 'button' );
  submitButton.setAttribute( 'type', "submit" );
  submitButton.id = 'submit-primary';
  submitButton.classList.add( 'form-button' );
  submitButton.innerHTML = "Submit";
  buttonWrapper.appendChild( submitButton );

  // Add a CLEAR DROPZONE button
  const clearDropzoneButton = document.createElement( 'button' );
  clearDropzoneButton.classList.add( 'form-button' );
  clearDropzoneButton.id = 'clear-dropzone';
  clearDropzoneButton.disabled = true;
  clearDropzoneButton.innerHTML = "Clear Dropzone";
  clearDropzoneButton.addEventListener( 'click', ( e ) => {
    e.preventDefault();
    dropzone.innerHTML = "";
    updateButtonsStatus();
  } );
  buttonWrapper.appendChild( clearDropzoneButton );

  updateButtonsStatus();

  /**
   *  Listen for form submittion
   *  We'll have to preprocess form data that are added via the drag and drop
   *  functionality. We'll have to convert the form data to an object and then
   *  write it to a file.
   */
  mainForm.addEventListener( 'submit', ( e ) => {
    e.preventDefault();

    // Preprocess form data in the dropzone
    const dropzone = document.getElementById( 'dropzone' );

    // first we'll add an dummy element with an "is-last" class at the end of any 
    // dropzone. This will be used to build inner objects and arrays properly.
    const dummyElement = document.createElement( 'div' );
    dummyElement.classList.add( 'form-element', 'is-last' );
    dropzone.appendChild( dummyElement );

    const secondaryDropzones = dropzone.querySelectorAll( '.object-dropzone, .array-dropzone' );
    secondaryDropzones.forEach( dropzone => {
      // add a dummy is-last element at the end of the dropzone
      const dummyElement = document.createElement( 'div' );
      dummyElement.classList.add( 'form-element', 'is-last' );
      // if array dropzone add "array-last" class
      if ( dropzone.classList.contains( 'array-dropzone' ) ) {
        dummyElement.classList.add( 'array-last' );
      }
      dropzone.appendChild( dummyElement );
    } );

    // Get all form-elements in the dropzone
    const allFormElements = dropzone.querySelectorAll( '.form-element' );
    // Transform the form elements to an object
    const dropzoneValues = transformFormElementsToObject( allFormElements );

    //console.log(JSON.stringify(dropzoneValues, null, 2));

    // Cleanup
    // Remove the dummy element so we can edit and use the form again
    const redundantDummyElements = document.querySelectorAll( '.is-last' );
    redundantDummyElements.forEach( element => {
      element.remove();
    } );


    /**
     * Merge the schemas and dropzone values and write the resulting object to a file
     
    const schemaValues = getSchemasObject();
    // merge the dropzone values with the schema values
    const pageObject = Object.assign( {}, schemaValues, dropzoneValues );

    const pageYAMLObject = window.electronAPI.toYAML( pageObject );
    console.log( pageYAMLObject );

    // send the page object to the main process
    window.electronAPI.writeObjectToFile( pageObject );
    
    */


  } );
};