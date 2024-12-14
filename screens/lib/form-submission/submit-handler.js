// lib/form-submission/submit-handler.js
import { validateSubmission } from './validate.js';
import { handleFileOperations } from './file-operations.js';
import { preprocessFormData } from '../preprocess-form-data.js';

/**
 * Main form submission handler
 * @param {HTMLFormElement} form - The form element
 * @param {string} filePath - Path to save the file
 * @param {Object} schema - Form schema
 */
export const handleFormSubmission = async ( form, filePath, schema ) => {
  const submitButton = form.querySelector( 'button[type="submit"]' );
  submitButton.disabled = true;

  console.log( form );

  try {
    // Process form data
    const formData = preprocessFormData();

    // Validate processed data
    const validationErrors = validateSubmission( formData, schema );
    if ( validationErrors.length ) {
      throw new Error( `Validation failed:\n${ validationErrors.join( '\n' ) }` );
    }

    // Handle file operations
    const cleanPath = filePath.replace( 'file://', '' );
    await handleFileOperations( formData, cleanPath );

    return { success: true };

  } catch ( error ) {
    console.error( 'Form submission failed:', error );
    return {
      success: false,
      error: error.message
    };

  } finally {
    submitButton.disabled = false;
  }
};