// screens/home/handlers/delete-project.js
import { reload } from '../navigation/utils.js';
import { StorageOperations } from '../../lib/storage-operations.js';
import { ProjectOperations } from '../../lib/project-operations.js';
import { selectProject } from '../../lib/select-project.js';

export const handleDeleteProject = async ( e ) => {
  e.preventDefault();

  try {
    const projectFolder = await selectProject();
    if ( !projectFolder ) return reload();

    const projectName = StorageOperations.getProjectName( projectFolder );
    const userConfirmed = await ProjectOperations.confirmDeletion( projectName );

    if ( !userConfirmed ) {
      console.log( 'User cancelled deletion' );
      return reload();
    }

    const isValid = await ProjectOperations.validateProject( projectFolder );
    if ( !isValid ) {
      alert( "This folder is not a valid project - projectData.json missing!" );
      return reload();
    }

    await ProjectOperations.deleteProject( projectFolder );
    StorageOperations.clearProjectData();

    console.log( `Project ${ projectName } deleted successfully` );
    reload();
  } catch ( error ) {
    console.error( "Error deleting project:", error );
    alert( `Failed to delete project: ${ error.message }` );
  }
};