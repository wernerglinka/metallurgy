export const selectProject = async () => {
  try {
    const dialogOptions = {
      title: 'Select Project Folder',
      message: 'Choose a folder for your project',
      properties: [ 'openDirectory' ],
      buttonLabel: 'Select Project Folder'
    };

    const result = await window.electronAPI.dialog.open( 'showOpenDialog', dialogOptions );
    console.log( 'Dialog result:', result );

    // Check the nested data structure
    if ( !result.status === 'success' ||
      result.data.canceled ||
      !result.data.filePaths ||
      result.data.filePaths.length === 0 ) {
      return "abort";
    }

    const selectedPath = result.data.filePaths[ 0 ];

    // Verify the selected path exists
    const pathExists = await window.electronAPI.files.exists( selectedPath );
    if ( !pathExists ) {
      throw new Error( 'Selected folder does not exist' );
    }

    return selectedPath;
  } catch ( error ) {
    console.error( 'Error in selectProject:', error );
    throw new Error( `Failed to select project folder: ${ error.message }` );
  }
};