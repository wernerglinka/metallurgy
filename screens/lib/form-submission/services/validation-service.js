// form-submission/services/validation-service.js

/**
 * Validates form data before submission
 * 
 * @param {HTMLFormElement} formData - Form element to validate
 * @returns {boolean} True if validation passes
 * @throws {FormSubmissionError} If validation fails
 * 
 * @example
 * try {
 *   await validateFormData(formElement);
 *   // Proceed with submission
 * } catch (error) {
 *   // Handle validation error
 * }
 */
export const validateFormData = ( formData ) => {
  try {
    // Basic validation for required fields
    const requiredFields = Array.from(
      formData.querySelectorAll( '[required]' )
    );

    const invalidFields = requiredFields.filter(
      field => !field.value.trim()
    );

    if ( invalidFields.length > 0 ) {
      throw createSubmissionError(
        'validation',
        'Required fields are missing',
        { fields: invalidFields.map( f => f.name ) }
      );
    }

    return true;
  } catch ( error ) {
    if ( isSubmissionError( error ) ) {
      throw error;
    }
    throw createSubmissionError(
      'validation',
      'Form validation failed',
      error
    );
  }
};