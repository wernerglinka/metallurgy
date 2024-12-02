// lib/form-submission/file-operations.js
/**
 * Handles file write operation during form submission
 * @param {Object} data - Processed form data
 * @param {string} filePath - Target file path
 * @returns {Promise<void>}
 * @throws {Error} If file write fails
 */
export const handleFileOperations = async ( data, filePath ) => {
  try {
    await window.electronAPI.files.writeYAML( {
      obj: data,
      path: filePath
    } );
  } catch ( error ) {
    throw new Error( `Failed to save file: ${ error.message }` );
  }
};