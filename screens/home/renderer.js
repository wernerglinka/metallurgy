import { saveToLocalStorage } from "../utility-functions/local-storage.js";

const renderer = ( () => {
  // Modular dialog options for reusability
  const dialogOptions = {
    message: "Select a Project Folder",
    properties: [ "openDirectory" ],
  };

  /**
   * Function to handle the project folder selection
   * The function calles a dialog to select the project folder.
   * If the user cancels the dialog, the page is reloaded.
   * If the user selects a folder, the path is saved to localStorage
   */
  const getProjectFolder = () => {
    const trigger = document.querySelector( '.js-get-project-folder' );

    if ( trigger ) {
      trigger.addEventListener( 'click', async ( e ) => {
        e.preventDefault();

        try {
          const targetScreen = e.target.href;
          const currentLocation = document.location;

          // Show a dialog to select the project folder
          const userSelection = await electronAPI.openDialog( "showOpenDialog", dialogOptions );

          if ( userSelection.canceled ) {
            currentLocation.reload();
          }

          if ( userSelection.filePaths.length > 0 ) {
            const projectFolder = userSelection.filePaths[ 0 ];
            saveToLocalStorage( "projectFolder", projectFolder );
            location.assign( targetScreen );
          }
        } catch ( error ) {
          console.error( "Error in getProjectFolder", error );
          // Provide user feedback here, such as showing an error message
          alert( "Error selecting project folder" );
          currentLocation.reload();
        }
      } );
    } else {
      console.warn( "Trigger element not found for getProjectFolder" );
      return false;
    }
  };

  return {
    getProjectFolder
  };
} )();

renderer.getProjectFolder();
