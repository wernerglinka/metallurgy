import { getDirectoryFiles } from "../lib/get-directory-files.js";
import { getFromLocalStorage } from "../lib/local-storage.js";
import { getMarkdownFile } from "../lib/get-markdown-file.js";

const renderer = ( () => {
  const updateProjectName = () => {
    const projectFolder = getFromLocalStorage( 'projectFolder' );
    const projectName = projectFolder.split( '/' ).pop();
    document.getElementById( 'project-name' ).prepend( projectName );
  };

  const renderEditSpace = async () => {
    // Get content and data files and add them to the sidebar
    await getDirectoryFiles( 'contentFolder', '.md' );
    await getDirectoryFiles( 'dataFolder', '.json' );

    // Add folder toggles to sidebar
    const folderToggles = document.querySelectorAll( 'li.folder > span' );
    for ( const toggle of folderToggles ) {
      toggle.addEventListener( 'click', ( e ) => {
        e.preventDefault();
        const folder = toggle.closest( 'li' );
        folder.classList.toggle( 'open' );
      } );
    }

    ////// At this point we are ready to select individual files //////

    // add event listener to file links
    const allFileLinks = document.querySelectorAll( '.js-dom-tree .file a' );
    for ( const fileLink of allFileLinks ) {
      fileLink.addEventListener( 'click', async ( e ) => {
        e.preventDefault();
        e.stopPropagation();

        // Retrieve the file path from the link
        const selectedFile = e.target.closest( 'li' );
        let selectedFilePath = selectedFile.querySelector( 'a' ).href;

        // get the file contents
        const { frontmatter, content } = await getMarkdownFile( selectedFilePath );



        console.log( frontmatter );
        console.log( content );


      } );

    }




  };

  return {
    updateProjectName,
    renderEditSpace,

  };

} )();

renderer.updateProjectName();
renderer.renderEditSpace();
