import { getDirectoryFiles } from "../lib/get-directory-files.js";
import { getFromLocalStorage } from "../lib/local-storage.js";
import { getMarkdownFile } from "../lib/get-markdown-file.js";
import { renderMarkdownFile } from "../lib/render-markdown-file.js";
import { renderJSONFile } from "../lib/render-json-file.js";

const renderer = ( () => {
  const updateProjectName = () => {
    const projectFolder = getFromLocalStorage( 'projectFolder' );
    const projectName = projectFolder.split( '/' ).pop();
    document.getElementById( 'project-name' ).prepend( projectName );
  };

  const manageSidebar = () => {
    const sidebarSelectLinks = document.querySelectorAll( '.js-sidebar-pane-selection a' );
    for ( const link of sidebarSelectLinks ) {
      link.addEventListener( 'click', ( e ) => {
        e.preventDefault();
        const allPanes = document.querySelectorAll( '.js-sidebar-pane' );
        for ( const pane of allPanes ) {
          pane.classList.remove( 'active' );
        }
        // Get the pane ID from the link data set
        const selectedPane = e.target.dataset.pane;
        // ... and activate the new pane
        document.getElementById( selectedPane ).classList.add( 'active' );

        const allLinks = document.querySelectorAll( '.js-sidebar-pane-selection a' );
        for ( const link of allLinks ) {
          link.classList.remove( 'active' );
        }
        // ... and activate the new link
        e.target.classList.add( 'active' );

      } );
    }

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
        const fileType = selectedFilePath.split( '.' ).pop();

        // get the file contents
        const { frontmatter, content } = await getMarkdownFile( selectedFilePath );

        switch ( fileType ) {
          case 'md':
            renderMarkdownFile( frontmatter, content );
            break;
          case 'json':
            renderJSONFile( content );
            break;
          default:
            alert( 'File type not supported' );
            break;
        }
        console.log( fileType );
        console.log( frontmatter );
        console.log( content );


      } );

    }




  };

  return {
    updateProjectName,
    manageSidebar,
    renderEditSpace,

  };

} )();

renderer.updateProjectName();
renderer.manageSidebar();
renderer.renderEditSpace();
