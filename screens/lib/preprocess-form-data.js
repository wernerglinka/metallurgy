import { transformFormElementsToObject } from './transform-form-to-object.js';

export const preprocessFormData = () => {

  const allDropzones = document.querySelectorAll( '.js-dropzone' );
  allDropzones.forEach( dropzone => {
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
  const mainForm = document.getElementById( 'main-form' );
  const allFormElements = mainForm.querySelectorAll( '.form-element' );

  // Transform the form elements to an object
  const dropzoneValues = transformFormElementsToObject( allFormElements );

  // Cleanup
  // Remove the dummy element so we can edit and use the form again
  const redundantDummyElements = mainForm.querySelectorAll( '.is-last' );
  redundantDummyElements.forEach( element => {
    element.remove();
  } );

  return dropzoneValues;
};