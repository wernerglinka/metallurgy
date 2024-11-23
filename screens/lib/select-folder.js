import { getFromLocalStorage } from "./local-storage.js";

/**
 * Opens a folder selection dialog
 * @param {string} folderType - Type of folder being selected (e.g., 'content', 'data')
 * @returns {Promise<{filePaths: string[]}>} Selected folder path
 * @throws {Error} If dialog operation fails
 */
export const selectFolder = async ( folderType ) => {
  try {
    const projectFolder = getFromLocalStorage( "projectFolder" );

    if ( !projectFolder ) {
      console.warn( "No project folder found in localStorage" );
    }

    const dialogOptions = {
      message: `Select the ${ folderType } Folder`,
      defaultPath: projectFolder || undefined,
      properties: [ "openDirectory" ],
    };

    // Use proper window.electronAPI reference
    const result = await window.electronAPI.dialog.open( "showOpenDialog", dialogOptions );

    if ( result.canceled ) {
      return { canceled: true, filePaths: [] };
    }

    return result;
  } catch ( error ) {
    console.error( `Error selecting ${ folderType } folder:`, error );
    throw new Error( `Failed to select ${ folderType } folder: ${ error.message }` );
  }
};