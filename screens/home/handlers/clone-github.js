// screens/home/handlers/open-project.js
import { navigate } from '../navigation/utils.js';
import { StorageOperations } from '../../lib/storage-operations.js';

const cloneGitHubRepo = async () => {
  try {
    return await window.electronAPI.cloneRepository();
  } catch ( error ) {
    console.error( 'Clone: Failed -', error );
    throw error;
  }
};

export const handleCloneGithub = async ( e ) => {
  e.preventDefault();

  try {
    const result = await cloneGitHubRepo();

    if ( result?.status === 'success' && result?.proceed?.status === 'success' ) {
      await StorageOperations.saveProjectPath( result.path );

      navigate( '../new-project/index.html' );
    } else {
      throw new Error( 'Failed to clone repository' );
    }
  } catch ( error ) {
    console.error( 'Clone handler error:', error );
    return false;
  }
};