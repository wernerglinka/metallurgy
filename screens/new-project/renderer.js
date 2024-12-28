import { getFromLocalStorage, saveToLocalStorage } from "../lib/local-storage.js";
import { StorageOperations } from '../lib/storage-operations.js';
import { isProjectReady } from "../lib/utilities/is-project-ready.js";
import { selectFolder } from "../lib/select-folder.js";
import { updateFolderUI } from "../lib/update-folder-ui.js";
import { updateButtonsContainer } from "../lib/update-buttons-container.js";

const renderer = ( () => {
  const showProjectFolderName = async () => {
    const projectFolder = StorageOperations.getProjectPath();
    const projectFolderName = document.querySelector( '.js-project-folder-name' );
    if ( projectFolderName ) {
      const folderName = `/${ projectFolder.split( "/" ).pop() }/`;
      projectFolderName.innerText = folderName;
    }

    // Check if a config file already exists in this project folder
    // <projectFolder>/.metallurgy/projectData.json
    const configFilePath = `${ projectFolder }/.metallurgy/projectData.json`;

    const exists = await electronAPI.files.exists( configFilePath );

    if ( exists ) {
      // Get the content and data folder from the config file
      const fileContentsRaw = await window.electronAPI.files.read( configFilePath );
      const fileContents = JSON.parse( fileContentsRaw.data );

      const contentFolder = fileContents.contentPath;
      const dataFolder = fileContents.dataPath;

      // Save the content and data folders to local storage
      saveToLocalStorage( "contentFolder", contentFolder );
      saveToLocalStorage( "dataFolder", dataFolder );

      // Update the UI with the content and data folder names and hide the
      // 'select content folder' and 'select data folder' buttons
      updateFolderUI( 'content', contentFolder );
      updateFolderUI( 'data', dataFolder );

      // Check if the project is ready to be created
      if ( isProjectReady() ) {
        updateButtonsContainer();
      }

      // Add note to the UI that the project already exists and ask if the
      // user wants to continue
      const startNew = document.querySelector( '.js-start-new' );
      const startWithConfig = document.querySelector( '.js-start-with-config' );

      startNew.style.display = "none";
      startWithConfig.style.display = "block";
    }
  };

  const getContentFolder = () => {
    const trigger = document.querySelector( '.js-get-content-folder' );

    if ( trigger ) {
      trigger.addEventListener( 'click', async ( e ) => {
        e.preventDefault();

        try {
          // Get the content folder from the user via a dialog box
          const userSelection = await selectFolder( "Content" );
          if ( userSelection.canceled || userSelection.filePaths.length === 0 ) return false;

          // Save the content folder to local storage
          const contentFolder = userSelection.filePaths[ 0 ];
          saveToLocalStorage( "contentFolder", contentFolder );

          // Update the UI with the content folder name and hide the 'select 
          // content folder' button
          updateFolderUI( 'content', contentFolder );

          // Check if the project is ready to be created
          if ( isProjectReady() ) {
            updateButtonsContainer();
          }

        } catch ( error ) {
          console.error( "Error in getContentFolder", error );
          alert( "Error selecting content folder" );
          return false;
        }
      } );
    } else {
      console.warn( "Trigger element not found for getProjectFolder" );
      return false;
    }
  };

  const getDataFolder = () => {
    const trigger = document.querySelector( '.js-get-data-folder' );

    if ( trigger ) {
      trigger.addEventListener( 'click', async ( e ) => {
        e.preventDefault();

        try {
          // Get the content folder from the user via a dialog box
          const userSelection = await selectFolder( "Data" );
          if ( userSelection.canceled || userSelection.filePaths.length === 0 ) return false;

          // Save the data folder to local storage
          const dataFolder = userSelection.filePaths[ 0 ];
          saveToLocalStorage( "dataFolder", dataFolder );

          // update the UI with the content folder name and hide the 'select 
          // content folder' button
          updateFolderUI( 'data', dataFolder );

          // Check if the project is ready to be created
          if ( isProjectReady() ) {
            updateButtonsContainer();
          }
        } catch ( error ) {
          console.error( "Error in getDataFolder", error );
          alert( "Error selecting data folder" );
          return false;
        }
      } );
    } else {
      console.warn( "Trigger element not found for getDataFolder" );
      return false;
    }
  };

  const storeProjectConfig = () => {
    const trigger = document.querySelector( '.js-start' );

    if ( trigger ) {
      trigger.addEventListener( 'click', async ( e ) => {
        e.preventDefault();
        e.stopImmediatePropagation();

        // Get the target and home screen
        const targetScreen = e.target.href;
        const homeScreen = document.location.href;

        // Create the project config file
        const projectData = StorageOperations.getProjectData();

        // Send the project data to the main process to create the project config file
        const response = await electronAPI.files.write( projectData );

        if ( response.status === "success" ) {
          // Redirect to open project screen
          window.location.href = targetScreen;
        } else {
          console.error( `Error creating project config file`, response.error );
          window.location.href = homeScreen;
        }
      } );
    }
  };

  return {
    showProjectFolderName,
    getContentFolder,
    getDataFolder,
    storeProjectConfig,
  };

} )();

renderer.showProjectFolderName();
renderer.getContentFolder();
renderer.getDataFolder();
renderer.storeProjectConfig();