import { getDirectoryFiles } from "../lib/get-directory-files.js";
import { getFromLocalStorage } from "../lib/local-storage.js";
import { getMarkdownFile } from "../lib/get-markdown-file.js";
import { renderMarkdownFile } from "../lib/render-markdown-file.js";
import { renderJSONFile } from "../lib/render-json-file.js";
import { updateButtonsStatus } from "../lib/update-buttons-status.js";
import { transformFormElementsToObject } from "../lib/transform-form-to-object.js";
import { dragStart, dragOver, dragLeave, drop } from "../lib/event-handlers.js";
import { cleanMainForm } from "../lib/clean-main-form.js";
import { addMainForm } from "../lib/add-main-form.js";
import { redoUndo } from "../lib/undo-redo.js";

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

    // Add a dragstart event listener to the sidebar
    const newComponentsSidebar = document.getElementById( 'js-add-field' );
    newComponentsSidebar.addEventListener( 'dragstart', dragStart );
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

        // clean the edit space, we may have rendered a file before
        // first  fadeout the edit space, then remove all content
        await cleanMainForm();

        // Add the main form to the edit space
        const mainForm = addMainForm();

        // ... and update the buttons status
        updateButtonsStatus();

        // Retrieve the file path from the link
        const selectedFile = e.target.closest( 'li' );
        let selectedFilePath = selectedFile.querySelector( 'a' ).href;
        const fileType = selectedFilePath.split( '.' ).pop();
        const fileName = selectedFilePath.split( '/' ).pop();

        const fileNameDisplay = document.querySelector( '#file-name span' );
        fileNameDisplay.textContent = fileName;

        // Get the file contents
        const { frontmatter, content } = await getMarkdownFile( selectedFilePath );

        switch ( fileType ) {
          case 'md':
            await renderMarkdownFile( frontmatter, content );
            break;
          case 'json':
            renderJSONFile( content );
            break;
          default:
            alert( 'File type not supported' );
            break;
        }

        // Now that the content has been loaded, add undo/redo buttons
        // Note: the buttons are added to the main form, but outside of the main dropzone.
        mainForm.appendChild( redoUndo() );

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
          //const pageYAMLObject = window.electronAPI.toYAML( dropzoneValues );

          // Write the object to its markdown file (conversion to YAML/frontmatter is done in the main process)
          const options = {
            obj: dropzoneValues,
            path: selectedFilePath.replace( 'file://', '' )
          };
          window.electronAPI.writeObjectToFile( options );

          console.log( "Form was send to file" );

        } ); // end form submit listener
      } ); // end file link listener

    }
  };

  const managePreview = () => {
    const editPane = document.querySelector( ".js-edit-pane" );
    const previewButton = document.getElementById( "preview-button" );
    previewButton.addEventListener( "click", ( e ) => {
      e.preventDefault();
      editPane.classList.toggle( "active" );

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
      const mainForm = document.getElementById( 'main-form' );
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

      // display the yaml in the preview pane as code
      const previewPane = document.querySelector( ".js-preview-pane" );
      previewPane.innerHTML = `<pre>${ pageYAMLObject }</pre>`;

    } );

  };


  return {
    updateProjectName,
    manageSidebar,
    renderEditSpace,
    managePreview
  };

} )();
renderer.updateProjectName();
renderer.manageSidebar();
renderer.renderEditSpace();
renderer.managePreview();

