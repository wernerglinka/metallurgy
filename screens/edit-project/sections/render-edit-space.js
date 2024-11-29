// screens/edit-project/sections/render-edit-space.js

import { getDirectoryFiles } from "../../lib/file-ops/get-directory-files.js";
import { addMainForm } from "../../lib/page-elements/add-main-form.js";
import { updateButtonsStatus } from "../../lib/page-elements/update-buttons-status.js";
import { getMarkdownFile } from "../../lib/file-ops/get-markdown-file.js";
import { frontmatterToForm } from "../../lib/form-generation/frontmatter-to-form.js";
import { renderJSONFile } from "../../lib/file-ops/render-json-file.js";
import { cleanMainForm } from "../../lib/utilities/clean-main-form.js";
import { redoUndo } from "../../lib/undo-redo.js";
import { preprocessFormData } from "../../lib/preprocess-form-data.js";

/**
 * @typedef {Object} FileData
 * @property {string} frontmatter - YAML frontmatter
 * @property {string} content - File content
 */

/**
 * Get directory files and render a DOM tree representation
 * for content and metadata files
 * @throws {Error} If file loading fails
 */
const loadDirectoryFiles = async () => {
  try {
    await Promise.all( [
      getDirectoryFiles( 'contentFolder', '.md' ),
      getDirectoryFiles( 'dataFolder', '.json' )
    ] );
  } catch ( error ) {
    throw new Error( `Failed to load directory files: ${ error.message }` );
  }
};

/**
 * Sets up folder toggle functionality
 */
const setupFolderToggles = () => {
  const toggleHandler = ( e ) => {
    e.preventDefault();
    const folder = e.target.closest( 'li' );
    folder.classList.toggle( 'open' );
  };

  document.querySelectorAll( 'li.folder > span' )
    .forEach( toggle => toggle.addEventListener( 'click', toggleHandler ) );
};

/**
 * Updates active state of file links
 * @param {HTMLElement} activeLink - Currently selected link
 */
const updateActiveLinkState = ( activeLink ) => {
  document.querySelectorAll( '.js-dom-tree .file a' )
    .forEach( link => link.classList.remove( 'active' ) );
  activeLink.classList.add( 'active' );
};

/**
 * Sets up edit form for file
 * @param {string} fileName - Name of file being edited
 * @returns {HTMLFormElement} The main form element
 */
const setupEditForm = async ( fileName ) => {
  // Clean up the main form and add a new one
  await cleanMainForm();
  const mainForm = addMainForm();
  updateButtonsStatus();

  document.querySelector( '#file-name span' ).textContent = fileName;
  return mainForm;
};

/**
 * Handles file content based on type
 * @param {string} filePath - Path to file
 * @param {string} fileType - Type of file (md/json)
 * @throws {Error} If file type not supported
 */
const handleFileContent = async ( filePath, fileType ) => {
  const { frontmatter, content } = await getMarkdownFile( filePath );

  switch ( fileType ) {
    case 'md':
      await frontmatterToForm( frontmatter, content );
      break;
    case 'json':
      renderJSONFile( content );
      break;
    default:
      throw new Error( `Unsupported file type: ${ fileType }` );
  }
};

/**
 * Sets up form submission handler with YAML conversion
 * @param {HTMLFormElement} form - The form element
 * @param {string} filePath - Path to save the file
 */
const setupFormSubmission = ( form, filePath ) => {
  form.addEventListener( 'submit', async ( e ) => {
    e.preventDefault();

    try {
      // Keep existing data processing
      const dropzoneValues = preprocessFormData();

      // Add basic validation before save
      const requiredFields = form.querySelectorAll( '[required]' );
      const invalidFields = Array.from( requiredFields )
        .filter( field => !field.value.trim() );

      if ( invalidFields.length > 0 ) {
        throw new Error( 'Required fields are missing' );
      }

      // Keep existing save mechanism
      await window.electronAPI.files.writeYAML( {
        obj: dropzoneValues,
        path: filePath.replace( 'file://', '' )
      } );

    } catch ( error ) {
      console.error( 'Form submission failed:', error );
      // TODO: Show error to user
    }
  } );
};

/**
 * When filename in sidebar is clicked, open the file in the editor
 * @param {Event} e - Click event
 */
const handleFileSelection = async ( e ) => {
  e.preventDefault();
  e.stopPropagation();

  const selectedFile = e.target.closest( 'li' );
  const filePath = selectedFile.querySelector( 'a' ).href;
  const fileType = filePath.split( '.' ).pop();
  const fileName = filePath.split( '/' ).pop();

  updateActiveLinkState( e.target );
  const mainForm = await setupEditForm( fileName );

  try {
    await handleFileContent( filePath, fileType );
    mainForm.appendChild( redoUndo() );
    setupFormSubmission( mainForm, filePath );
  } catch ( error ) {
    console.error( 'Failed to handle file:', error );
  }
};

/**
 * Sets up template link handlers
 */
const setupTemplateLinks = () => {
  const preventDefaultHandler = ( e ) => {
    e.preventDefault();
    e.stopPropagation();
  };

  document.querySelectorAll( '.js-templates-list .file a' )
    .forEach( link => link.addEventListener( 'click', preventDefaultHandler ) );
};

/**
 * Main function to render the edit space
 * @throws {Error} If rendering fails
 */
const renderEditSpace = async () => {
  try {
    // Get directory files and render a DOM tree representation
    await loadDirectoryFiles();

    // directories are closed by default, toggle open by clicking on folder name
    setupFolderToggles();

    // Click on a file name to open the file in the editor
    document.querySelectorAll( '.js-files-list .file a' )
      .forEach( link => link.addEventListener( 'click', handleFileSelection ) );

    setupTemplateLinks();
  } catch ( error ) {
    console.error( 'Failed to render edit space:', error );
    throw error;
  }
};

export default renderEditSpace;