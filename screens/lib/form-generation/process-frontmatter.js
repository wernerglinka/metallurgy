/**
 * @module form-generation/process-frontmatter
 * @description Converts frontmatter to form elements
 */

import { convertToSchemaObject } from './schema/convert-js-to-schema.js';
import { getExplicitSchema } from './schema/schema-handler.js';
import { validateSchema } from './schema/validate-schema.js';
import { createFormFragment, renderToDropzone } from './form/form-builder.js';


// Helper function to process frontmatter
export const processFrontmatter = async ( frontmatter ) => {
  // Convert frontmatter to schema
  const schema = await convertToSchemaObject( frontmatter );
  validateSchema( schema );

  // Get explicit field schemas
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

  return { schema, explicitSchemaArray };
};