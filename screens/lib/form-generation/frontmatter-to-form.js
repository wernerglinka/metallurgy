/**
 * @module form-generation/frontmatter-to-form
 * @description Converts frontmatter to form elements
 */
import { processFrontmatter } from './process-frontmatter.js';
import { createFormFragment, renderToDropzone } from './form/form-builder.js';
import { buildForm } from '../form-builder/index.js';

import { logFragment } from '../utilities/fragment-debug-helper.js';

/**
 * Renders a markdown file's frontmatter as form elements
 * @param {Object} frontmatter - The frontmatter object from the markdown file
 * @param {string} content - The content of the markdown file
 * @throws {Error|Object} Standard error or schema error object
 */
export const frontmatterToForm = async ( frontmatter, content ) => {
  try {
    const { schema, explicitSchemaArray } = await processFrontmatter( frontmatter );

    // Create form elements from schema fields
    const formHTML = buildForm( schema, explicitSchemaArray );

    // Create and populate template
    const template = document.createElement( 'template' );
    template.innerHTML = formHTML;

    // Get dropzone
    const dropzone = document.getElementById( 'dropzone' );
    if ( !dropzone ) {
      throw new Error( 'Dropzone element not found' );
    }

    // Clone and append template content
    dropzone.appendChild( template.content.cloneNode( true ) );

  } catch ( error ) {
    // Handle schema errors
    if ( error.isSchemaError ) {
      console.error( `Schema error (${ error.type }):`, error.message );
      if ( error.field ) {
        console.error( 'Problem field:', error.field );
      }
      if ( error.path ) {
        console.error( 'File path:', error.path );
      }
    }
    throw error;
  }
};