import { getFromLocalStorage } from './local-storage.js';
import { createDomTree } from './create-dom-tree.js';

/**
 * Gets directory files and creates a DOM tree representation
 * @param {string} directoryKey - Key to fetch directory path from localStorage
 * @param {string} type - File type filter
 * @returns {Promise<void>}
 */
export const getDirectoryFiles = async ( directoryKey, type ) => {
  try {
    // Get the content folder path from local storage
    const folderPath = getFromLocalStorage( directoryKey );

    if ( !folderPath ) {
      console.warn( `No folder path found for key: ${ directoryKey }` );
      return;
    }

    // Get the content directory
    const { status, data, error } = await window.electronAPI.directories.read( folderPath );

    if ( status === 'failure' ) {
      throw new Error( `Failed to read directory: ${ error }` );
    }

    // Create the dom tree from the content directory
    // Allow only specified type of files
    const domTree = createDomTree( data, type );
    domTree.classList.add( 'dom-tree', 'js-dom-tree', 'js-files-list' );

    // add the dom tree to the folder ui
    const sidebar = document.querySelector( '.js-dom-tree-wrapper' );
    if ( !sidebar ) {
      console.warn( 'Sidebar element not found' );
      return;
    }

    sidebar.appendChild( domTree );
  } catch ( error ) {
    console.error( 'Error in getDirectoryFiles:', error );
    throw error;
  }
};