import { getFromLocalStorage, saveToLocalStorage } from "../lib/local-storage.js";
import { isProjectReady } from "../lib/is-project-ready.js";
import { selectFolder } from "../lib/select-folder.js";
import { updateFolderUI } from "../lib/update-folder-ui.js";
import { updateButtonsContainer } from "../lib/update-buttons-container.js";
import { createDomTree } from "../lib/create-dom-tree.js";
const renderer = ( () => {
  const getContentFileList = async () => {
    // Get the content folder path from local storage
    const contentFolderPath = getFromLocalStorage( "contentFolder" );

    // Get the content directory
    const contentDirectory = await electronAPI.readDirectory( contentFolderPath );

    // Create the dom tree from the content directory
    const domTree = createDomTree( contentDirectory.data );

    domTree.classList.add( 'dom-tree', 'js-dom-tree' );

    // add the dom tree to the folder ui
    const sidebar = document.querySelector( '.js-dom-tree-wrapper' );
    sidebar.appendChild( domTree );

  };

  return {
    getContentFileList
  };

} )();


renderer.getContentFileList();