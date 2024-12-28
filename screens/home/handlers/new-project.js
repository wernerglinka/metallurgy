// screens/home/handlers/new-project.js
import { navigate } from '../navigation/utils.js';
import { StorageOperations } from '../../lib/storage-operations.js';
import { selectProject } from '../../lib/select-project.js';

export const handleNewProject = async ( e ) => {
  e.preventDefault();

  try {
    const targetScreen = e.target.href;
    const projectFolder = await selectProject();

    if ( projectFolder === "abort" ) return;

    // Save project path in local storage
    StorageOperations.saveProjectPath( projectFolder );
    // and navigate to the new project screen
    navigate( targetScreen );

  } catch ( error ) {
    console.error( "Error creating new project:", error );
    alert( `Failed to create project: ${ error.message }` );
  }
};