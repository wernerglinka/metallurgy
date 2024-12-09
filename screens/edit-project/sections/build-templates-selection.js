// screens/edit-project/build-templates-selection.js

import { createDomTree } from "../../lib/page-elements/create-dom-tree.js";
import { addMainForm } from "../../lib/page-elements/add-main-form.js";
import { updateButtonsStatus } from "../../lib/page-elements/update-buttons-status.js";
import { cleanMainForm } from "../../lib/utilities/clean-main-form.js";
import { StorageOperations } from '../../lib/storage-operations.js';

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
  };

  if ( !elements.wrapper ) {
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
 * Converts template data to draggable divs
 * @param {Object|Array} templatesData - Template data 
 * @param {HTMLElement} wrapper - Container element
 */
const createTemplateDivs = ( templatesData, wrapper ) => {
  // Get the first (and only) entry which contains the root path and templates array
  const [ rootPath, templates ] = Object.entries( templatesData )[ 0 ];

  templates.forEach( ( template, index ) => {
    // Handle sections array specially
    if ( 'sections' in template ) {
      // insert header h3 'Sections' before the first section
      const h3 = document.createElement( 'h3' );
      h3.textContent = 'Section Templates';
      h3.className = 'section-header';
      wrapper.appendChild( h3 );

      template.sections.forEach( ( section, sectionIndex ) => {
        let [ sectionName, sectionPath ] = Object.entries( section )[ 0 ];

        if ( sectionName !== 'index.js' ) {
          // calculate relative section path with respect to rootpath
          sectionPath = sectionPath.replace( rootPath, '' );

          const div = document.createElement( 'div' );
          div.id = `template-section-${ sectionIndex }`;
          div.className = 'template-selection draggable';
          div.setAttribute( 'draggable', 'true' );
          div.setAttribute( 'data-url', sectionPath );
          sectionName = sectionName
            .replace( /\.[^/.]+$/, '' ) // Remove file extension
            .replace( /-/g, ' ' )       // Replace all dashes with spaces
            .toUpperCase();             // Convert to uppercase
          div.textContent = sectionName;
          wrapper.appendChild( div );
        }
      } );
      return;
    }

    // Handle regular templates
    let [ templateName, templatePath ] = Object.entries( template )[ 0 ];

    if ( templateName !== 'index.js' && templateName !== 'common-fields.js' ) {
      // calculate relative section path with respect to rootpath
      templatePath = templatePath.replace( rootPath, '' );

      const div = document.createElement( 'div' );
      div.id = `template-${ index }`;
      div.className = 'template-selection draggable';
      div.setAttribute( 'draggable', 'true' );
      div.setAttribute( 'data-url', templatePath );
      templateName = templateName
        .replace( /\.[^/.]+$/, '' ) // Remove file extension
        .replace( /-/g, ' ' )       // Replace all dashes with spaces
        .toUpperCase();             // Convert to uppercase
      div.textContent = templateName;
      wrapper.appendChild( div );
    }
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

    // Build the template list with placeholder elements like the fields
    // loop over the templates, key is the template name, value is the template data
    // The placeholder should have this structure:
    // <div id="template<loop-iteration>" class="template-selection draggable" draggable="true" data-url="<value>">key of the template

    const templateWrapper = document.createElement( 'div' );
    templateWrapper.className = 'templates-wrapper';
    createTemplateDivs( templates.data, templateWrapper );
    elements.wrapper.appendChild( templateWrapper );

  } catch ( error ) {
    console.error( 'Failed to build templates:', error );
    throw error;
  }
};

export default buildTemplatesSelection;