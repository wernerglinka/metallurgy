// __tests__/lib/frontmatter-to-form.test.js
import { frontmatterToForm } from '../../../screens/lib/form-generation/frontmatter-to-form.js';
import { StorageOperations } from '../../../screens/lib/storage-operations.js';
import testSchema from '../test-schema.json';

describe( 'frontmatterToForm with Project Schema', () => {
  beforeEach( () => {
    document.body.innerHTML = `
      <div id="main-form">
        <div id="dropzone" class="js-dropzone"></div>
      </div>
    `;

    // Set up storage
    const projectPath = '/test/project/path';
    StorageOperations.saveProjectData( {
      projectPath,
      contentPath: `${ projectPath }/content`,
      dataPath: `${ projectPath }/data`
    } );

    // Default electron API mock with schema
    global.window = {
      electronAPI: {
        files: {
          exists: async () => true,
          read: async () => ( {
            status: 'success',
            data: testSchema.map( field => ( {
              ...field,
              label: field.label || field.name
            } ) ),
            error: null
          } )
        }
      }
    };
  } );

  afterEach( () => {
    StorageOperations.clearProjectData();
  } );

  it( 'processes schema and renders form', async () => {
    const frontmatter = {
      title: "Test Page",
      layout: "sections.njk"
    };

    await frontmatterToForm( frontmatter, '' );
    const dropzone = document.querySelector( '#dropzone' );
    expect( dropzone.innerHTML ).toContain( 'input' );
  } );

  it( 'uses empty array when no schema exists', async () => {
    // Mock files API to return empty array
    window.electronAPI.files = {
      exists: async () => false,
      read: async () => ( {
        status: 'success',
        data: [], // Return empty array, not null
        error: null
      } )
    };

    const frontmatter = {
      title: "Test Page"
    };

    await frontmatterToForm( frontmatter, '' );
    const dropzone = document.querySelector( '#dropzone' );
    expect( dropzone.innerHTML ).toContain( 'input' );
  } );

  it( 'uses empty array for schema read errors', async () => {
    // Mock files API to return error but with empty array
    window.electronAPI.files = {
      exists: async () => true,
      read: async () => ( {
        status: 'failure',
        data: [], // Return empty array, not null
        error: 'Read error'
      } )
    };

    const frontmatter = {
      title: "Test Page"
    };

    await frontmatterToForm( frontmatter, '' );
    const dropzone = document.querySelector( '#dropzone' );
    expect( dropzone.innerHTML ).toContain( 'input' );
  } );
} );

// screens/lib/page-elements/field-initialization/explicit-fields.js

/**
 * Process field against explicit schema definitions
 * @param {Object} field - Field to process
 * @param {Array} explicitSchemaArray - Array of explicit schema definitions
 * @returns {Object} Processed field
 */
export const processExplicitField = ( field, explicitSchemaArray = [] ) => {
  // Return unmodified field if no schema array
  if ( !Array.isArray( explicitSchemaArray ) ) {
    return {
      ...field,
      canAdd: true,
      canDelete: true
    };
  }

  const explicitFieldObject = explicitSchemaArray.find(
    schema => schema.name === field.label
  );

  return {
    ...field,
    canAdd: explicitFieldObject?.canAdd ?? true,
    canDelete: explicitFieldObject?.canDelete ?? true
  };
};