// home/renderer.js
import { StorageOperations } from '../lib/storage-operations.js';
import { ProjectOperations } from '../lib/project-operations.js';
import { selectProject } from '../lib/select-project.js';

const renderer = ( () => {
  // Navigation helpers
  const navigate = ( path ) => location.assign( path );
  const reload = () => location.reload();

  // Event handlers
  const handleNewProject = async ( e ) => {
    e.preventDefault();
    try {
      const targetScreen = e.target.href;
      const projectFolder = await selectProject();

      if ( projectFolder === "abort" ) return;

      // For new projects, we just save the folder path
      StorageOperations.saveProjectPath( projectFolder );
      StorageOperations.clearProjectData();

      navigate( targetScreen );  // This will go to new-project/index.html
    } catch ( error ) {
      console.error( "Error creating new project:", error );
      alert( `Failed to create project: ${ error.message }` );
    }
  };

  const handleDeleteProject = async ( e ) => {
    e.preventDefault();
    try {
      const projectFolder = await selectProject();
      if ( !projectFolder ) return reload();

      // Get project name and confirm deletion
      const projectName = StorageOperations.getProjectName( projectFolder );
      const userConfirmed = await ProjectOperations.confirmDeletion( projectName );

      if ( !userConfirmed ) {
        console.log( 'User cancelled deletion' );
        return reload();
      }

      // Verify it's a valid project before deletion
      const isValid = await ProjectOperations.validateProject( projectFolder );
      if ( !isValid ) {
        alert( "This folder is not a valid project - projectData.json missing!" );
        return reload();
      }

      // Delete project and clear storage
      await ProjectOperations.deleteProject( projectFolder );
      StorageOperations.clearProjectData();

      console.log( `Project ${ projectName } deleted successfully` );
      reload();
    } catch ( error ) {
      console.error( "Error deleting project:", error );
      alert( `Failed to delete project: ${ error.message }` );
    }
  };

  const handleOpenProject = async ( e ) => {
    e.preventDefault();
    try {
      const targetScreen = e.target.href;

      // show dialog to select project folder
      const projectFolder = await selectProject();

      // If user cancels, return
      if ( projectFolder === "abort" ) return;

      // Verify it's a valid project before opening
      // A valid project will have a hidden .metallurgy folder with a projectData.json file 
      const isValid = await ProjectOperations.validateProject( projectFolder );
      if ( !isValid ) {
        alert( "This folder is not a valid project - projectData.json missing!" );
        return;
      }

      // Save project folder first
      StorageOperations.saveProjectPath( projectFolder );

      // Load project configuration
      const config = await ProjectOperations.loadProjectConfig( projectFolder );

      // Save all project data consisting of project path, the paths to the 
      // website content and data folder path      
      StorageOperations.saveProjectData( {
        projectPath: projectFolder,
        contentPath: config.contentPath,
        dataPath: config.dataPath
      } );

      // navigate to edit-project screen
      navigate( targetScreen );
    } catch ( error ) {
      console.error( "Error opening project:", error );
      alert( `Failed to open project: ${ error.message }` );
    }
  };

  const handleRecentProject = ( e ) => {
    e.preventDefault();
    navigate( e.target.href );
  };

  // Setup functions
  const setupRecentProject = () => {
    const recentProject = StorageOperations.getProjectPath();
    if ( !recentProject ) return;

    const element = document.querySelector( '.js-recent-project' );
    if ( !element ) return;

    const projectName = StorageOperations.getProjectName( recentProject );
    element.innerHTML = projectName;
    element.addEventListener( 'click', handleRecentProject );
  };

  // Initialize event listeners
  const initializeEventListeners = () => {
    const selectors = {
      newProject: '.js-get-project-folder',
      deleteProject: '.js-delete-project-folder',
      openProject: '.js-open-project'
    };

    const handlers = {
      [ selectors.newProject ]: handleNewProject,
      [ selectors.deleteProject ]: handleDeleteProject,
      [ selectors.openProject ]: handleOpenProject
    };

    Object.entries( handlers ).forEach( ( [ selector, handler ] ) => {
      const element = document.querySelector( selector );
      if ( element ) {
        element.addEventListener( 'click', handler );
      } else {
        console.warn( `Element not found: ${ selector }` );
      }
    } );
  };

  // Initialize
  const initialize = () => {
    initializeEventListeners();
    setupRecentProject();
  };

  return { initialize };
} )();

// Start the application
renderer.initialize();