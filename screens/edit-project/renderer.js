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
import { preprocessFormData } from "../lib/preprocess-form-data.js";
import { createDomTree } from "../lib/create-dom-tree.js";
import { getFlatTemplateList } from "../lib/get-flat-template-list.js";

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

    // Add a dragstart event listeners to the sidebar
    const newComponentsSidebar = document.getElementById( 'js-add-field' );
    newComponentsSidebar.addEventListener( 'dragstart', dragStart );
    const newTemplatesSidebar = document.getElementById( 'js-add-template' );
    newTemplatesSidebar.addEventListener( 'dragstart', dragStart );
  };

  const buildTemplatesSelection = async () => {
    // Get templates if they exists
    const templates = await electronAPI.directories.getTemplates( 'templates' );
    const templatesList = templates.data;
    const templatesSelect = document.querySelector( '.js-templates-wrapper' );

    // List of templates included draggables, set third attribute to true
    const templatesSelectList = createDomTree( templatesList, '.js', true );
    templatesSelectList.classList.add( 'dom-tree', 'js-dom-tree', 'js-templates-list' );
    templatesSelect.appendChild( templatesSelectList );

    // Add event handler for button to start a new page
    const newPageButton = document.getElementById( 'init-new-page' );
    newPageButton.addEventListener( 'click', ( e ) => {
      e.preventDefault();
      // Create a new form with a dropzone and place in the edit space
      const mainForm = addMainForm();
      // ... and update the buttons status
      updateButtonsStatus();
    } );

    /* we may not need this
    // Get all template files and load them into an object
    const allTemplatesObject = {};
    // get a flat list of all templates
    let flatArray = getFlatTemplateList( templatesList );
    //loop over the array and get the content of each file
    for ( const template of flatArray ) {
      const templatePath = Object.values( template )[ 0 ];
      const templateName = Object.keys( template )[ 0 ];
      const templateContent = await electronAPI.files.read( templatePath );
      allTemplatesObject[ templateName ] = templateContent.data;
    }
 
    console.log( allTemplatesObject );
    */
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
    const allFileLinks = document.querySelectorAll( '.js-files-list .file a' );
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
          const dropzoneValues = preprocessFormData();

          // Write the object to its markdown file (conversion to YAML/frontmatter is done in the main process)
          const options = {
            obj: dropzoneValues,
            path: selectedFilePath.replace( 'file://', '' )
          };
          window.electronAPI.files.write( options );

          console.log( "Form was send to file" );

        } ); // end form submit listener
      } ); // end file link listener

    };

    /**
    * Add event listeners to the template links
    * When a template link is clicked, we'll retrieve the file contents and render
    * it in the edit space.
    */
    const allTemplateLinks = document.querySelectorAll( '.js-templates-list .file a' );
    for ( const templateLink of allTemplateLinks ) {
      templateLink.addEventListener( 'click', async ( e ) => {
        // template files will be dragged to the main form. Here we just prevent the
        // default behavior of the link
        e.preventDefault();
        e.stopPropagation();

      } ); // end template link listener
    };

  }; // end renderEditSpace


  const managePreview = () => {
    const editPane = document.querySelector( ".js-edit-pane" );
    const previewButton = document.getElementById( "preview-button" );
    previewButton.addEventListener( "click", ( e ) => {
      e.preventDefault();
      editPane.classList.toggle( "active" );

      // Preprocess form data in the dropzones
      const dropzoneValues = preprocessFormData();

      // Convert the object to YAML
      const pageYAMLObject = window.electronAPI.utiles.toYAML( dropzoneValues );

      // display the yaml in the preview pane as code
      const previewPane = document.querySelector( ".js-preview-pane" );
      previewPane.innerHTML = `<pre>${ pageYAMLObject }</pre>`;

    } );

  };


  return {
    updateProjectName,
    manageSidebar,
    renderEditSpace,
    buildTemplatesSelection,
    managePreview
  };

} )();
renderer.updateProjectName();
renderer.manageSidebar();
renderer.renderEditSpace();
renderer.buildTemplatesSelection();
renderer.managePreview();

