// screens/edit-project/build-templates-selection.js

import { createDomTree } from "../../lib/page-elements/create-dom-tree.js";
import { addMainForm } from "../../lib/page-elements/add-main-form.js";
import { updateButtonsStatus } from "../../lib/page-elements/update-buttons-status.js";
/**
 * @typedef {Object} TemplatesElements
 * @property {HTMLElement} wrapper - Templates wrapper element
 * @property {HTMLElement} newPageButton - New page button element
 */

/**
 * Gets and validates required DOM elements
 * @returns {TemplatesElements} Object containing required elements
 * @throws {Error} If elements not found
 */
const getTemplatesElements = () => {
  const elements = {
    wrapper: document.querySelector( '.js-templates-wrapper' ),
    newPageButton: document.getElementById( 'init-new-page' )
  };

  if ( !elements.wrapper || !elements.newPageButton ) {
    throw new Error( 'Required template elements not found' );
  }

  return elements;
};

/**
 * Creates template list DOM structure
 * @param {Object} templatesData - Template data from API
 * @returns {HTMLElement} Template list element
 */
const createTemplatesList = ( templatesData ) => {
  const list = createDomTree( templatesData, '.js', true );
  list.classList.add( 'dom-tree', 'js-dom-tree', 'js-templates-list' );
  return list;
};

/**
 * Sets up new page button handler
 * @param {HTMLElement} button - New page button element
 */
const setupNewPageHandler = ( button ) => {
  button.addEventListener( 'click', ( e ) => {
    e.preventDefault();
    const mainForm = addMainForm();
    updateButtonsStatus();
  } );
};

/**
 * Builds templates selection interface
 * @returns {Promise<void>}
 * @throws {Error} If template loading or DOM operations fail
 */
const buildTemplatesSelection = async () => {
  try {
    // Get DOM elements
    const elements = getTemplatesElements();

    // Load templates
    const templates = await electronAPI.directories.getTemplates( 'templates' );
    if ( !templates?.data ) {
      throw new Error( 'No templates data received' );
    }

    // Build and append template list
    const templatesList = createTemplatesList( templates.data );
    elements.wrapper.appendChild( templatesList );

    // Setup event handlers
    setupNewPageHandler( elements.newPageButton );

  } catch ( error ) {
    console.error( 'Failed to build templates:', error );
    throw error;
  }
};

export default buildTemplatesSelection;