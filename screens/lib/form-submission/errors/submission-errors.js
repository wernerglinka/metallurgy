// form-submission/errors/submission-errors.js

/**
 * Creates a standardized error object for form submission failures
 * 
 * @param {string} stage - The stage where the error occurred (validation|transformation|submission)
 * @param {string} message - Detailed error message
 * @param {Error|null} originalError - Original error object if available
 * @returns {Object} Structured error object with context
 * 
 * @example
 * const error = createSubmissionError(
 *   'validation',
 *   'Required fields missing',
 *   new Error('title field empty')
 * );
 */
export const createSubmissionError = ( stage, message, originalError = null ) => ( {
  name: 'FormSubmissionError',
  stage,
  message,
  originalError,
  timestamp: new Date()
} );

/**
 * Checks if an error is a FormSubmissionError
 * 
 * @param {*} error - Error to check
 * @returns {boolean} True if error is a FormSubmissionError
 * 
 * @example
 * if (isSubmissionError(error)) {
 *   // Handle submission error
 * }
 */
export const isSubmissionError = ( error ) =>
  error && error.name === 'FormSubmissionError';

/**
 * Processes submission errors and returns user-friendly messages
 * 
 * @param {Object} error - Error object from createSubmissionError
 * @returns {string} User-friendly error message
 * 
 * @example
 * const message = handleSubmissionError(error);
 * showErrorToUser(message);
 */
export const handleSubmissionError = ( error ) => {
  console.error( 'Form submission failed:', error );
  return 'Unable to save changes. Please try again.';
};