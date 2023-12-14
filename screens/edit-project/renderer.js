import { getDirectoryFiles } from "../lib/get-directory-files.js";
import { getFromLocalStorage } from "../lib/local-storage.js";
import { getMarkdownFile } from "../lib/get-markdown-file.js";
import { renderMarkdownFile } from "../lib/render-markdown-file.js";
import { renderJSONFile } from "../lib/render-json-file.js";
import { updateButtonsStatus } from "../lib/update-buttons-status.js";
import { transformFormElementsToObject } from "../lib/transform-form-to-object.js";
import { dragStart, dragOver, dragLeave, drop } from "../lib/drag-drop.js";

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

  /**
   * Main function to render the edit space
   * The function will get the content and data file names and adds a COM tree
   * to the sidebar. It will also add event listeners to the file links.
   */
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

    /**
     * Add event listeners to the file links
     * When a file link is clicked, we'll retrieve the file contents and render
     * it in the edit space.
     */
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

        /**
         * Once the file has been selected and rendered in the edit space, we'll
         * complete the form handling by adding a dropzone and buttons to the form.
         */

        const filePath = selectedFilePath.replace( 'file://', '' );
        addFormHandling( filePath );

      } );

    }
  };

  /**
   * Prepare the form for the drag and drop functionality by adding a dropzone
   * We'll also add a button wrapper to hold all buttons for the form
   */
  const addFormHandling = ( filePath ) => {
    const mainForm = document.getElementById( 'main-form' );

    // Add the dropzone to the form
    const dropzone = document.getElementById( 'dropzone' );
    dropzone.addEventListener( "dragover", dragOver );
    dropzone.addEventListener( "dragleave", dragLeave );
    dropzone.addEventListener( "drop", drop );

    // add a button wrapper to the form
    const buttonWrapper = document.createElement( 'div' );
    buttonWrapper.id = 'button-wrapper';
    mainForm.appendChild( buttonWrapper );

    // Add the SUBMIT button
    const submitButton = document.createElement( 'button' );
    submitButton.setAttribute( 'type', "submit" );
    submitButton.id = 'submit-primary';
    submitButton.classList.add( 'form-button' );
    submitButton.innerHTML = "Submit";
    buttonWrapper.appendChild( submitButton );

    // Add a CLEAR DROPZONE button
    const clearDropzoneButton = document.createElement( 'button' );
    clearDropzoneButton.classList.add( 'form-button' );
    clearDropzoneButton.id = 'clear-dropzone';
    clearDropzoneButton.disabled = true;
    clearDropzoneButton.innerHTML = "Clear Dropzone";
    clearDropzoneButton.addEventListener( 'click', ( e ) => {
      e.preventDefault();
      dropzone.innerHTML = "";
      updateButtonsStatus();
    } );
    buttonWrapper.appendChild( clearDropzoneButton );

    updateButtonsStatus();

    /**
     *  Listen for form submittion
     *  We'll have to preprocess form data that are added via the drag and drop
     *  functionality. We'll have to convert the form data to an object and then
     *  write it to a file.
     */
    mainForm.addEventListener( 'submit', ( e ) => {
      e.preventDefault();

      // Preprocess form data in the dropzones
      const allDropzones = document.querySelectorAll( '.js-dropzone' );
      allDropzones.forEach( dropzone => {
        // add a dummy is-last element at the end of the dropzone
        const dummyElement = document.createElement( 'div' );
        dummyElement.classList.add( 'form-element', 'is-last' );
        // if array dropzone add "array-last" class
        if ( dropzone.classList.contains( 'array-dropzone' ) ) {
          dummyElement.classList.add( 'array-last' );
        }
        dropzone.appendChild( dummyElement );
      } );

      // Get all form-elements in the dropzone
      const allFormElements = mainForm.querySelectorAll( '.form-element' );
      // Transform the form elements to an object
      const dropzoneValues = transformFormElementsToObject( allFormElements );

      // Cleanup
      // Remove the dummy element so we can edit and use the form again
      const redundantDummyElements = mainForm.querySelectorAll( '.is-last' );
      redundantDummyElements.forEach( element => {
        element.remove();
      } );

      // Convert the object to YAML
      const pageYAMLObject = window.electronAPI.toYAML( dropzoneValues );

      // Write the  YAML object to its markdown file
      const options = {
        obj: pageYAMLObject,
        path: filePath
      };
      window.electronAPI.writeObjectToFile( options );

    } );
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

