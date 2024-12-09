/**
 * @module form-generation/frontmatter-to-fragment
 * @description Converts frontmatter to form elements
 */

import { convertToSchemaObject } from './schema/convert-js-to-schema.js';
import { getExplicitSchema } from './schema/schema-handler.js';
import { validateSchema } from './schema/validate-schema.js';
import { createFormFragment, renderToDropzone } from './form/form-builder.js';

/**
 * Renders a markdown file's frontmatter as form elements
 * @param {Object} frontmatter - The frontmatter object from the markdown file
 * @param {string} content - The content of the markdown file
 * @throws {Error|Object} Standard error or schema error object
 */
export const frontmatterToFragment = async ( frontmatter, content ) => {
  try {
    // Convert frontmatter to schema
    const schema = await convertToSchemaObject( frontmatter );
    validateSchema( schema );

    // Get explicit field schemas - continue without if not found
    let explicitSchemaArray = null;
    try {
      explicitSchemaArray = await getExplicitSchema();
    } catch ( error ) {
      if ( error.isSchemaError && error.type === 'FILE_ERROR' ) {
        console.warn( `Schema file issue: ${ error.message }` );
      } else {
        throw error;
      }
    }

    // Create and render form elements
    const fragment = createFormFragment( schema.fields, explicitSchemaArray );

    return fragment;

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