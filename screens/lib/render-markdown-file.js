import { convertToSchemaObject } from './convert-js-to-schema.js';
import { getUpdatedElement } from './create-element.js';
import { getFromLocalStorage } from './local-storage.js';

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
    const projectPath = getFromLocalStorage( 'projectFolder' );
    if ( !projectPath ) {
      throw new Error( 'No project path found in localStorage' );
    }

    // Check for explicit field schemas
    const schemaFilePath = `${ projectPath }/.metallurgy/frontmatterTemplates/fields.json`;

    let explicitSchemaArray = null;
    const schemaExists = await window.electronAPI.files.exists( schemaFilePath );

    if ( schemaExists ) {
      try {
        const { status, data, error } = await window.electronAPI.files.read( schemaFilePath );

        if ( status === 'failure' ) {
          throw new Error( `Failed to read schema file: ${ error }` );
        }

        explicitSchemaArray = JSON.parse( data );
      } catch ( error ) {
        console.error( 'Error parsing schema file:', error );
        // Continue without explicit schema if parsing fails
      }
    }

    // Render schema to DOM
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

    // Add to dropzone
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