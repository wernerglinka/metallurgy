// screens/home/ui/setup.js
import { StorageOperations } from '../../lib/storage-operations.js';
import { handleRecentProject } from '../handlers/recent-project.js';

/**
 * DOM selector constants
 */
const SELECTORS = {
  recentProject: '.js-recent-project',
  newProject: '.js-get-project-folder',
  deleteProject: '.js-delete-project-folder',
  editProject: '.js-edit-project',
  cloneProject: '.js-clone-from-github'
};

/**
 * Error messages
 */
const ERRORS = {
  NO_RECENT: 'No recent project found',
  NO_ELEMENT: 'Element not found'
};

/**
 * Sets up recent project UI and handlers
 * @throws {Error} If required elements not found
 */
export const setupRecentProject = () => {
  try {
    const recentProject = StorageOperations.getProjectPath();
    if ( !recentProject ) {
      console.info( ERRORS.NO_RECENT );
      return;
    }

    const element = document.querySelector( SELECTORS.recentProject );
    if ( !element ) {
      console.warn( ERRORS.NO_ELEMENT );
      return;
    }

    const projectName = StorageOperations.getProjectName( recentProject );
    element.innerHTML = projectName;
    element.setAttribute( 'title', `Open ${ projectName }` );
    element.addEventListener( 'click', handleRecentProject );

  } catch ( error ) {
    console.error( 'Failed to setup recent project:', error );
  }
};

/**
 * Initializes event listeners for project handlers
 * @param {Object.<string, Function>} handlers - Map of selectors to handlers
 */
export const initializeEventListeners = ( handlers ) => {
  Object.entries( handlers ).forEach( ( [ selector, handler ] ) => {
    const element = document.querySelector( selector );
    if ( element ) {
      element.addEventListener( 'click', handler );
    } else {
      console.warn( `${ ERRORS.NO_ELEMENT }: ${ selector }` );
    }
  } );
};