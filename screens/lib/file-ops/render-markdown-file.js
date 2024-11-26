import { convertToSchemaObject } from './convert-js-to-schema.js';
import { getUpdatedElement } from '../page-elements/create-element.js';
import { StorageOperations } from '../storage-operations.js';

/**
 * Renders a markdown file's frontmatter as form elements
 * @param {Object} frontmatter - The frontmatter object from the markdown file
 * @param {string} content - The content of the markdown file
 * @throws {Error} If schema file operations fail
 */
export const renderMarkdownFile = async ( frontmatter, content ) => {
  try {
    // Convert frontmatter to schema
    const schema = await convertToSchemaObject( frontmatter );

    // Get project configuration
    const projectPath = StorageOperations.getProjectPath();
    if ( !projectPath ) {
      throw new Error( 'No project path found in storage' );
    }

    // Check for explicit pre-defined field schemas
    const schemaFilePath = `${ projectPath }/.metallurgy/frontmatterTemplates/fields.json`;

    let explicitSchemaArray = null;
    const schemaExists = await window.electronAPI.files.exists( schemaFilePath );

    if ( schemaExists ) {
      const { status, data, error } = await window.electronAPI.files.read( schemaFilePath );

      if ( status === 'failure' ) {
        console.error( 'Error reading schema file:', error );
        return null; // Continue without explicit schema
      }

      explicitSchemaArray = data;
    }

    // Render schema to DOM
    // create temporary storage for DOM elements
    const fragment = document.createDocumentFragment();

    if ( !schema.fields || !Array.isArray( schema.fields ) ) {
      throw new Error( 'Invalid schema structure' );
    }

    // Create form elements for each field
    schema.fields.forEach( field => {
      const schemaElement = getUpdatedElement(
        field,
        explicitSchemaArray,
        true // labelsExist = true for markdown file rendering
      );
      fragment.appendChild( schemaElement );
    } );

    // Add all form elements to dropzone
    const dropzone = document.getElementById( 'dropzone' );
    if ( !dropzone ) {
      throw new Error( 'Dropzone element not found' );
    }

    dropzone.appendChild( fragment );
  } catch ( error ) {
    console.error( 'Error in renderMarkdownFile:', error );
    throw error;
  }
};