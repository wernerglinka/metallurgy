/**
 * @module form-generation/frontmatter-to-form
 * @description Converts frontmatter to form elements
 */
import { processFrontmatter } from './process-frontmatter.js';
import { createFormFragment, renderToDropzone } from './form/form-builder.js';

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

    // Create and render form elements
    const fragment = createFormFragment( schema.fields, explicitSchemaArray );
    renderToDropzone( fragment );

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