import { saveToLocalStorage, deleteFromLocalStorage, getFromLocalStorage } from "../lib/local-storage.js";
import { selectProject } from "../lib/select-project.js";

const renderer = ( () => {
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

        console.log( "Get project folder" );

        try {
          const targetScreen = e.target.href;
          const currentLocation = document.location;

          // Show a dialog to select the project folder
          const projectFolder = await selectProject();

          console.log( `projectFolder: ${ projectFolder }` );

          if ( projectFolder === "abort" ) {
            // User cancelled the dialog, so reload the page

            console.log( "user canceled" );

            //currentLocation.reload();
            return;
          }

          console.log( "Saved project folder to local storage" );
          saveToLocalStorage( "projectFolder", projectFolder );

          // we are starting a new project, so clear the existing project
          // data from localStorage
          deleteFromLocalStorage( "contentFolder" );
          deleteFromLocalStorage( "dataFolder" );

          console.log( `targetScreen: ${ targetScreen }` );

          location.assign( "../new-project/index.html" );

        } catch ( error ) {
          console.error( "Error in getProjectFolder", error );
          // Provide user feedback here, such as showing an error message
          alert( "Error selecting project folder" );
          return;
        }
      } );
    } else {
      console.warn( "Trigger element not found for getProjectFolder" );
      return;
    }
  };

  const deleteProject = () => {
    const trigger = document.querySelector( '.js-delete-project-folder' );

    if ( trigger ) {
      trigger.addEventListener( 'click', async ( e ) => {
        e.preventDefault();

        console.log( "Delete project folder" );

        // Show a dialog to select the project folder
        const projectFolder = await selectProject();
        // Get projeect name
        const projectName = projectFolder.split( "/" ).pop();

        if ( !projectFolder ) {
          // User cancelled the dialog, so reload the page
          currentLocation.reload();
        }

        // display a confirmation dialog
        const confirmDelete = `Are you sure you want to remove the ${ projectName } project?`;
        const userConfirmed = await window.electronAPI.showConfirmationDialog( confirmDelete );
        if ( !userConfirmed ) {

          console.log( 'User cancelled action' );

          // Do nothing, just reload the page
          location.reload();
        }

        // Build path to project data file
        const filePath = `${ projectFolder }/.metallurgy/projectData.json`;

        try {
          const result = await electronAPI.deleteFile( filePath );

          console.log( `Deleting project ${ projectName }: ${ result }` );

        } catch ( error ) {
          console.error( `Error deleting ${ projectName }:`, error );
        }

        // we are deleting a project, so clear the existing project
        // data from localStorage as well
        deleteFromLocalStorage( "projectFolder" );
        deleteFromLocalStorage( "contentFolder" );
        deleteFromLocalStorage( "dataFolder" );

        // Reload the page
        location.reload();

      } );
    } else {
      console.warn( "Trigger element not found for deleteProjectFolder" );
      return false;
    }
  };

  const getRecentProject = () => {
    const recentProject = getFromLocalStorage( "projectFolder" );
    if ( recentProject ) {
      const recentProjectSlot = document.querySelector( '.js-recent-project' );
      const recentProjectName = recentProject.split( "/" ).pop();
      recentProjectSlot.innerHTML = recentProjectName;

      recentProjectSlot.addEventListener( 'click', ( e ) => {
        e.preventDefault();

        const targetScreen = e.target.href;
        location.assign( targetScreen );
      } );
    }
  };

  const openProject = async () => {
    const trigger = document.querySelector( '.js-open-project' );

    if ( !trigger ) {
      console.warn( "Trigger element not found for openProject" );
      return false;
    }

    trigger.addEventListener( 'click', async ( e ) => {
      e.preventDefault();

      // Get the target and home screen
      const targetScreen = e.target.href;

      // Get the project folder
      const projectFolder = await selectProject();

      if ( projectFolder === "abort" ) {
        return;
      }

      saveToLocalStorage( "projectFolder", projectFolder );

      // Check if a config file already exists in this project folder
      // <projectFolder>/.metallurgy/projectData.json
      const configFilePath = `${ projectFolder }/.metallurgy/projectData.json`;

      const exists = await electronAPI.checkFileExists( configFilePath );

      if ( exists ) {
        // Get the content and data folder from the config file
        const fileContents = await window.electronAPI.readFile( configFilePath );
        const contentFolder = fileContents.data.contentPath;
        const dataFolder = fileContents.data.dataPath;

        // Save the content and data folders to local storage
        saveToLocalStorage( "contentFolder", contentFolder );
        saveToLocalStorage( "dataFolder", dataFolder );

        location.assign( targetScreen );
      } else {
        alert( "This folder is not a valid project - projectData.json missing!" );
        return;
      }

    } );
  };

  return {
    getProjectFolder,
    deleteProject,
    getRecentProject,
    openProject
  };
} )();

renderer.getProjectFolder();
renderer.deleteProject();
renderer.getRecentProject();
renderer.openProject();
