import { transformFormElementsToObject } from './transform-form-to-object.js';

/**
 * Preprocesses form data by adding temporary markers and transforming to object
 * 
 * @description
 * Process:
 * 1. Adds temporary 'is-last' markers to dropzones for proper object structure
 * 2. Handles special case for array dropzones with 'array-last' marker
 * 3. Collects all form elements
 * 4. Transforms elements to structured object
 * 5. Cleans up temporary markers
 * 
 * @returns {Object} Processed form data object with nested structure
 * @throws {Error} If main form element not found
 * 
 * @example
 * // Form structure:
 * // <form id="main-form">
 * //   <div class="js-dropzone">
 * //     <input name="title" value="Page Title">
 * //   </div>
 * // </form>
 * 
 * const result = preprocessFormData();
 * // Returns: { title: "Page Title" }
 */
export const preprocessFormData = () => {
  // Add temporary markers for structure parsing
  const allDropzones = document.querySelectorAll( '.js-dropzone' );
  allDropzones.forEach( dropzone => {
    // Add dummy is-last element at the end of dropzone
    const dummyElement = document.createElement( 'div' );
    dummyElement.classList.add( 'form-element', 'is-last' );

    // Handle array dropzones specially
    if ( dropzone.classList.contains( 'array-dropzone' ) ) {
      dummyElement.classList.add( 'array-last' );
    }
    dropzone.appendChild( dummyElement );
  } );

  // Get all form elements
  const mainForm = document.getElementById( 'main-form' );
  const allFormElements = mainForm.querySelectorAll( '.form-element' );

  // Transform to object structure
  const dropzoneValues = transformFormElementsToObject( allFormElements );

  // Cleanup temporary markers
  const redundantDummyElements = mainForm.querySelectorAll( '.is-last' );
  redundantDummyElements.forEach( element => {
    element.remove();
  } );

  return dropzoneValues;
};