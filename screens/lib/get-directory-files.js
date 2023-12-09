import { getFromLocalStorage } from './local-storage.js';
import { createDomTree } from './create-dom-tree.js';

export const getDirectoryFiles = async ( directoryKey, type ) => {
  // Get the content folder path from local storage
  const folderPath = getFromLocalStorage( directoryKey );

  // Get the content directory
  const directory = await electronAPI.readDirectory( folderPath );

  // Create the dom tree from the content directory
  // Allow only markdown files
  const domTree = createDomTree( directory.data, type );

  domTree.classList.add( 'dom-tree', 'js-dom-tree' );

  // add the dom tree to the folder ui
  const sidebar = document.querySelector( '.js-dom-tree-wrapper' );
  sidebar.appendChild( domTree );

};