import { getDirectoryFiles } from "../lib/get-directory-files.js";
import { getFromLocalStorage } from "../lib/local-storage.js";
import { getMarkdownFile } from "../lib/get-markdown-file.js";
import { renderMarkdownFile } from "../lib/render-markdown-file.js";
import { renderJSONFile } from "../lib/render-json-file.js";


// Add drag and drop functionality to the form
window.dragStart = ( e ) => {
  e.dataTransfer.setData( "text/plain", e.target.dataset.component );
  /* 
    Add the drag origin to the dragged element
    We may drag a new element token from the 'sidebar' to add an element to the form, OR
    we may drag an element in the 'dropzone' to a different dropzone location
  */
  let origin = "sidebar";

  // Find if an acestor with id 'dropzone' exists
  const dropzone = e.target.closest( '.dropzone' );
  origin = dropzone ? "dropzone" : origin;
  // Set the origin
  e.dataTransfer.setData( "origin", origin );

  // store the dragged element
  window.draggedElement = e.target;
};

/**
 * @function dragOver(e)
 * @param {event object} e 
 * @description This function will handle the dragover event. It will indicate
 *   drop space by inserting a drop-indicator temporarily
 */
window.dragOver = ( e ) => {
  e.preventDefault();
  e.target.classList.add( 'dropzone-highlight' );
  const dropzone = e.target.closest( '.dropzone' );
  const { closest, position } = getInsertionPoint( dropzone, e.clientY );

  if ( closest ) {
    if ( position === 'before' ) {
      closest.style.marginBottom = "2rem";
    } else {
      if ( closest.nextSibling ) {
        closest.nextSibling.style.marginTop = "2rem";
      }
    }
  } else {
    dropzone.childNodes.forEach( child => {
      child.style.margin = "0.5rem 0";
    } );
  }
};

window.dragLeave = ( e ) => {
  const dropzone = e.target.closest( '.dropzone' );
  e.target.classList.remove( 'dropzone-highlight' );

  // reset all margins that were caused by elements dragged over
  dropzone.childNodes.forEach( child => {
    child.style.margin = "0.5rem 0";
  } );
};

/**
 * @function drop
 * @param {*} event 
 * @description This function will handle the drop event. 
 * There are three scenarios to handle during a drop event:
 *  1. Dragging a schema file into the drop zone
 *  2. Dragging a new element from the sidebar to the drop zone
 *  3. Moving an existing element within or between drop zones
 */
window.drop = async ( e ) => {
  e.preventDefault();
  e.stopPropagation();

  const dropzone = e.target.closest( '.dropzone' );
  if ( !dropzone ) return;

  // Remove highlight class from the event target, which indicates a valid drop target during the dragover event.
  dropzone.classList.remove( 'dropzone-highlight' );

  // reset all margins that were caused by elements dragged over
  dropzone.childNodes.forEach( child => {
    child.style.margin = "0.5rem 0";
  } );

  // get the origin of the dragged element
  const origin = e.dataTransfer.getData( "origin" );

  /*
    1. Check if we dragged schema files into the dropzone
  */
  const hasFiles = e.dataTransfer.types.includes( 'Files' );

  if ( hasFiles ) {
    const files = e.dataTransfer.files;
    await processSchemaFile( files, dropzone, e );
    return;
  }

  /*
    2. Dragging a new element from the sidebar to the drop zone
  */
  if ( origin === "sidebar" ) {
    /*
      After receiving an component token from the sidebar, we need to create a 
      new element that represents the component type from the dataTransfer object.
    */
    const component = e.dataTransfer.getData( "text/plain" );
    processSidebarDraggables( e, component );

  } else {
    /*
      3. Moving an existing element within or between drop zones
    */
    moveElement( e );
  }
};




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

        // remove active class from all file links
        const allFileLinks = document.querySelectorAll( '.js-dom-tree .file a' );
        for ( const fileLink of allFileLinks ) {
          fileLink.classList.remove( 'active' );
        }
        // ... and add it to the clicked link
        e.target.classList.add( 'active' );


        // Retrieve the file path from the link
        const selectedFile = e.target.closest( 'li' );
        let selectedFilePath = selectedFile.querySelector( 'a' ).href;
        const fileType = selectedFilePath.split( '.' ).pop();
        const fileName = selectedFilePath.split( '/' ).pop();

        const fileNameDisplay = document.getElementById( 'file-name' );
        fileNameDisplay.textContent = fileName;

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

