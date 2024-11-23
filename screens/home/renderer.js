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

    if ( !trigger ) {
      console.warn( "Trigger element not found for getProjectFolder" );
      return;
    }

    trigger.addEventListener( 'click', async ( e ) => {
      e.preventDefault();

      try {
        const targetScreen = e.target.href;
        const projectFolder = await selectProject();

        if ( projectFolder === "abort" ) {
          console.log( "User canceled project selection" );
          return;
        }

        // Save project folder and clear existing data
        saveToLocalStorage( "projectFolder", projectFolder );
        [ "contentFolder", "dataFolder" ].forEach( key =>
          deleteFromLocalStorage( key ) );

        location.assign( "../new-project/index.html" );
      } catch ( error ) {
        console.error( "Error in getProjectFolder:", error );
        alert( "Error selecting project folder" );
      }
    } );
  };

  const deleteProject = () => {
    const trigger = document.querySelector( '.js-delete-project-folder' );

    if ( !trigger ) {
      console.warn( "Trigger element not found for deleteProjectFolder" );
      return false;
    }

    trigger.addEventListener( 'click', async ( e ) => {
      e.preventDefault();

      try {
        const projectFolder = await selectProject();
        if ( !projectFolder ) return location.reload();

        const projectName = projectFolder.split( "/" ).pop();
        const confirmDelete = `Are you sure you want to remove the ${ projectName } project?`;

        const userConfirmed = await window.electronAPI.dialog.showConfirmation( confirmDelete );
        if ( !userConfirmed ) {
          console.log( 'User cancelled deletion' );
          return location.reload();
        }

        const filePath = `${ projectFolder }/.metallurgy/projectData.json`;
        await window.electronAPI.files.delete( filePath );
        console.log( `Project ${ projectName } deleted successfully` );

        // Clear all project data from localStorage
        [ "projectFolder", "contentFolder", "dataFolder" ].forEach( key =>
          deleteFromLocalStorage( key ) );

        location.reload();
      } catch ( error ) {
        console.error( `Error deleting project:`, error );
        alert( `Failed to delete project: ${ error.message }` );
      }
    } );
  };

  const getRecentProject = () => {
    const recentProject = getFromLocalStorage( "projectFolder" );
    if ( !recentProject ) return;

    const recentProjectSlot = document.querySelector( '.js-recent-project' );
    if ( !recentProjectSlot ) return;

    const recentProjectName = recentProject.split( "/" ).pop();
    recentProjectSlot.innerHTML = recentProjectName;

    recentProjectSlot.addEventListener( 'click', ( e ) => {
      e.preventDefault();
      location.assign( e.target.href );
    } );
  };

  const openProject = async () => {
    const trigger = document.querySelector( '.js-open-project' );

    if ( !trigger ) {
      console.warn( "Trigger element not found for openProject" );
      return false;
    }

    trigger.addEventListener( 'click', async ( e ) => {
      e.preventDefault();

      try {
        const targetScreen = e.target.href;
        const projectFolder = await selectProject();

        if ( projectFolder === "abort" ) return;

        saveToLocalStorage( "projectFolder", projectFolder );
        const configFilePath = `${ projectFolder }/.metallurgy/projectData.json`;

        const exists = await window.electronAPI.files.exists( configFilePath );
        if ( !exists ) {
          alert( "This folder is not a valid project - projectData.json missing!" );
          return;
        }

        const { data: fileContents } = await window.electronAPI.files.read( configFilePath );

        // Save project paths to localStorage
        saveToLocalStorage( "contentFolder", fileContents.contentPath );
        saveToLocalStorage( "dataFolder", fileContents.dataPath );

        location.assign( targetScreen );
      } catch ( error ) {
        console.error( "Error opening project:", error );
        alert( `Failed to open project: ${ error.message }` );
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
