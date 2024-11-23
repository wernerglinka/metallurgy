/**
 * Opens a dialog to select a project folder
 * @returns {Promise<string|"abort">} The selected folder path or "abort" if cancelled
 * @throws {Error} If dialog operation fails
 */
export const selectProject = async () => {
  try {
    const dialogOptions = {
      title: 'Select Project Folder',
      message: 'Choose a folder for your project',
      properties: [ 'openDirectory' ],
      buttonLabel: 'Select Project Folder'
    };

    const result = await window.electronAPI.dialog.open( 'showOpenDialog', dialogOptions );

    if ( result.canceled || !result.filePaths || result.filePaths.length === 0 ) {
      return "abort";
    }

    // Verify the selected path exists
    const pathExists = await window.electronAPI.files.exists( result.filePaths[ 0 ] );
    if ( !pathExists ) {
      throw new Error( 'Selected folder does not exist' );
    }

    return result.filePaths[ 0 ];
  } catch ( error ) {
    console.error( 'Error in selectProject:', error );
    throw new Error( `Failed to select project folder: ${ error.message }` );
  }
};