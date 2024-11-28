import { convertToSchemaObject } from './schema/convert-js-to-schema.js';
import { getExplicitSchema } from './schema/schema-handler.js';
import { validateSchema } from './schema/validate-schema.js';
import { createFormFragment, renderToDropzone } from './form/form-builder.js';

/**
 * Renders a markdown file's frontmatter as form elements
 * @param {Object} frontmatter - The frontmatter object from the markdown file
 * @param {string} content - The content of the markdown file
 * @throws {Error} If schema file operations fail
 */
export const frontmatterToForm = async ( frontmatter, content ) => {
  try {
    // Convert frontmatter to schema
    const schema = await convertToSchemaObject( frontmatter );
    validateSchema( schema );

    // Get explicit field schemas
    const explicitSchemaArray = await getExplicitSchema();

    // Create and render form elements
    const fragment = createFormFragment( schema.fields, explicitSchemaArray );
    renderToDropzone( fragment );

  } catch ( error ) {
    console.error( 'Error in frontmatterToForm:', error );
    throw error;
  }
};