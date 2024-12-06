import { addMainForm } from "../../lib/page-elements/add-main-form.js";
import { cleanMainForm } from "../../lib/utilities/clean-main-form.js";
import { updateButtonsStatus } from "../../lib/page-elements/update-buttons-status.js";
import { handleFormSubmission } from '../../lib/form-submission/submit-handler.js';

/**
 * Sets up edit form for file
 * @param {string} fileName - Name of file being edited
 * @returns {HTMLFormElement} The main form element
 */
export const setupEditForm = async ( fileName ) => {
  // Clean up the main form and add a new one
  await cleanMainForm();
  const mainForm = addMainForm();
  updateButtonsStatus();

  document.querySelector( '#file-name span' ).textContent = fileName;
  return mainForm;
};

export const setupFormSubmission = ( form, filePath, schema ) => {
  form.addEventListener( 'submit', async ( e ) => {
    e.preventDefault();

    const result = await handleFormSubmission( form, filePath, schema );

    console.log( "result", result );

    updateButtonsStatus( result.success ? 'success' : 'error', result.error );
  } );
};