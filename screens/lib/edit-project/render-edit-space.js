// screens/edit-project/render-edit-space.js

import { getDirectoryFiles } from "../file-ops/get-directory-files.js";
import { addMainForm } from "../page-elements/add-main-form.js";
import { updateButtonsStatus } from "../page-elements/update-buttons-status.js";
import { getMarkdownFile } from "../file-ops/get-markdown-file.js";
import { renderMarkdownFile } from "../file-ops/render-markdown-file.js";
import { renderJSONFile } from "../file-ops/render-json-file.js";
import { cleanMainForm } from "../utilities/clean-main-form.js";
import { redoUndo } from "../undo-redo.js";
import { preprocessFormData } from "../preprocess-form-data.js";


// screens/edit-project/edit-space/render-space.js

/**
 * @typedef {Object} FileData
 * @property {string} frontmatter - YAML frontmatter
 * @property {string} content - File content
 */

/**
 * Loads directory files and builds sidebar structure
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
      await renderMarkdownFile( frontmatter, content );
      break;
    case 'json':
      renderJSONFile( content );
      break;
    default:
      throw new Error( `Unsupported file type: ${ fileType }` );
  }
};

/**
 * Sets up form submission handler
 * @param {HTMLFormElement} form - The main form
 * @param {string} filePath - Path to save file
 */
const setupFormSubmission = ( form, filePath ) => {
  form.addEventListener( 'submit', ( e ) => {
    e.preventDefault();
    const dropzoneValues = preprocessFormData();

    window.electronAPI.files.write( {
      obj: dropzoneValues,
      path: filePath.replace( 'file://', '' )
    } );
  } );
};

/**
 * Handles file selection
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
    await loadDirectoryFiles();
    setupFolderToggles();

    // Set up file handlers
    document.querySelectorAll( '.js-files-list .file a' )
      .forEach( link => link.addEventListener( 'click', handleFileSelection ) );

    setupTemplateLinks();
  } catch ( error ) {
    console.error( 'Failed to render edit space:', error );
    throw error;
  }
};

export default renderEditSpace;