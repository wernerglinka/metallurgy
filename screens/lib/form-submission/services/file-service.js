// form-submission/services/file-service.js

/**
 * Saves form data as a YAML file using Electron API
 * 
 * @param {Object} electronAPI - Electron API instance
 * @param {Object} options - Save options
 * @param {Object} options.data - Data to save
 * @param {string} options.filePath - Path to save file
 * @throws {FormSubmissionError} If save operation fails
 * 
 * @example
 * await saveYAMLFile(window.electronAPI, {
 *   data: formData,
 *   filePath: 'path/to/file.yml'
 * });
 */
export const saveYAMLFile = async ( electronAPI, { data, filePath } ) => {
  try {
    await electronAPI.files.writeYAML( {
      obj: data,
      path: filePath.replace( 'file://', '' )
    } );
  } catch ( error ) {
    throw createSubmissionError(
      'submission',
      'Failed to save YAML file',
      error
    );
  }
};