// screens/home/handlers/recent-project.js
import { navigate } from '../navigation/utils.js';
import { StorageOperations } from '../../lib/storage-operations.js';

const RECENT_PROJECT = {
  SELECTOR: '.js-recent-project',
  ERROR: {
    NO_PATH: 'No recent project path found',
    NO_ELEMENT: 'Recent project element not found'
  }
};

/**
 * Handles click on recent project link
 * @param {Event} e - Click event
 */
const handleRecentProject = ( e ) => {
  e.preventDefault();
  navigate( e.target.href );
};

/**
 * Sets up recent project UI and handlers
 * @throws {Error} If required data or elements missing
 */
const setupRecentProject = () => {
  try {
    const recentProject = StorageOperations.getProjectPath();
    if ( !recentProject ) {
      console.info( RECENT_PROJECT.ERROR.NO_PATH );
      return;
    }

    const element = document.querySelector( RECENT_PROJECT.SELECTOR );
    if ( !element ) {
      console.warn( RECENT_PROJECT.ERROR.NO_ELEMENT );
      return;
    }

    const projectName = StorageOperations.getProjectName( recentProject );

    // Update UI
    element.innerHTML = projectName;
    element.setAttribute( 'title', `Open ${ projectName }` );
    element.addEventListener( 'click', handleRecentProject );

  } catch ( error ) {
    console.error( 'Failed to setup recent project:', error );
  }
};

export {
  handleRecentProject,
  setupRecentProject
};