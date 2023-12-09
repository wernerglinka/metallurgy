import { getDirectoryFiles } from "../lib/get-directory-files.js";
import { getFromLocalStorage } from "../lib/local-storage.js";

const renderer = ( () => {
  const updateProjectName = () => {
    const projectFolder = getFromLocalStorage( 'projectFolder' );
    const projectName = projectFolder.split( '/' ).pop();
    document.getElementById( 'project-name' ).prepend( projectName );
  };

  const getFileLists = async () => {
    await getDirectoryFiles( 'contentFolder', '.md' );
    await getDirectoryFiles( 'dataFolder', '.json' );

    // Add event listeners to folder toggles
    const folderToggles = document.querySelectorAll( 'li.folder > span' );

    for ( const toggle of folderToggles ) {
      toggle.addEventListener( 'click', ( e ) => {
        e.preventDefault();
        const folder = toggle.closest( 'li' );
        folder.classList.toggle( 'open' );
      } );
    }
  };

  return {
    updateProjectName,
    getFileLists,

  };

} )();

renderer.updateProjectName();
renderer.getFileLists();
