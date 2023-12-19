import { updateButtonsStatus } from './update-buttons-status.js';
import { dragStart, dragOver, dragLeave, drop, sectionCollapse, addDeleteButtons } from './event-handlers.js';

/**
 * @function mainForm
 * @description Add the main form to the edit page
 */

export const addMainForm = () => {
  const frontmatterContainer = document.getElementById( 'frontmatter-container' );

  // Add the main form plus dropzone
  const mainForm = document.createElement( 'form' );
  mainForm.id = 'main-form';

  // Add event listeners to the dropzone
  // We delegate the event listeners to the form wrapper as the dropzone may be
  // replaced by a new dropzone when the user uses undo/redo
  mainForm.addEventListener( 'dragstart', dragStart );
  mainForm.addEventListener( "dragover", dragOver );
  mainForm.addEventListener( "dragleave", dragLeave );
  mainForm.addEventListener( "drop", drop );
  mainForm.addEventListener( "click", sectionCollapse );
  mainForm.addEventListener( "click", addDeleteButtons );

  // Add the dropzone
  const dropzone = document.createElement( 'div' );
  dropzone.id = 'dropzone';
  dropzone.classList.add( 'dropzone', 'js-main-dropzone', 'js-dropzone' );
  mainForm.appendChild( dropzone );
  frontmatterContainer.appendChild( mainForm );

  // add buttons to the form
  const buttonWrapper = document.createElement( 'div' );
  buttonWrapper.id = 'button-wrapper';
  mainForm.appendChild( buttonWrapper );

  // Add the SUBMIT button
  const submitButton = document.createElement( 'button' );
  submitButton.setAttribute( 'type', "submit" );
  submitButton.id = 'submit-primary';
  submitButton.classList.add( 'btn', 'primary' );
  submitButton.innerHTML = "Submit";
  buttonWrapper.appendChild( submitButton );

  // Add a CLEAR DROPZONE button
  const clearDropzoneButton = document.createElement( 'button' );
  clearDropzoneButton.classList.add( 'btn' );
  clearDropzoneButton.id = 'clear-dropzone';
  clearDropzoneButton.disabled = true;
  clearDropzoneButton.innerHTML = "Clear Dropzone";
  clearDropzoneButton.addEventListener( 'click', ( e ) => {
    e.preventDefault();
    dropzone.innerHTML = "";
    updateButtonsStatus();
  } );
  buttonWrapper.appendChild( clearDropzoneButton );

  return mainForm;

};