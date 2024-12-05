// __tests__/lib/form-building/frontmatter-to-form.test.js

import { jest } from '@jest/globals';
import { frontmatterToForm } from '../../../screens/lib/form-generation/frontmatter-to-form.js';
import { StorageOperations } from '../../../screens/lib/storage-operations.js';
import testSchema from '../test-schema.json';

describe( 'frontmatterToForm with Project Schema', () => {
  const filteredSchema = testSchema.filter( field => field.type !== 'textarea' );

  beforeEach( () => {
    document.body.innerHTML = `
      <div id="main-form">
        <div id="dropzone" class="js-dropzone"></div>
      </div>
    `;

    const projectPath = '/test/project/path';
    StorageOperations.saveProjectData( {
      projectPath,
      contentPath: `${ projectPath }/content`,
      dataPath: `${ projectPath }/data`
    } );

    window.electronAPI = {
      files: {
        exists: async () => true,
        read: async () => ( {
          status: 'success',
          data: filteredSchema,
          error: null
        } )
      }
    };

    jest.spyOn( console, 'warn' ).mockImplementation( () => { } );
    jest.spyOn( console, 'error' ).mockImplementation( () => { } );
  } );

  afterEach( () => {
    StorageOperations.clearProjectData();
    jest.clearAllMocks();
  } );

  it( 'successfully processes valid frontmatter', async () => {
    const frontmatter = {
      title: "Test",
      layout: "default"
    };

    await frontmatterToForm( frontmatter, '' );

    const dropzone = document.getElementById( 'dropzone' );
    expect( dropzone.children.length ).toBeGreaterThan( 0 );
  } );

  it( 'processes schema file error', async () => {
    window.electronAPI.files.read = async () => {
      throw {
        isSchemaError: true,
        type: 'FILE_ERROR',
        message: 'File not found'
      };
    };

    const frontmatter = { title: "Test" };
    await frontmatterToForm( frontmatter, '' );

    expect( console.warn ).toHaveBeenCalledWith(
      expect.stringContaining( 'Schema file issue: File not found' )
    );
  } );

  it( 'throws non-file schema errors', async () => {
    window.electronAPI.files.read = async () => {
      throw {
        isSchemaError: true,
        type: 'VALIDATION_ERROR',
        message: 'Invalid schema',
        field: 'title'
      };
    };

    const frontmatter = { title: "Test" };
    await expect( frontmatterToForm( frontmatter, '' ) )
      .rejects
      .toMatchObject( {
        isSchemaError: true,
        type: 'VALIDATION_ERROR'
      } );

    expect( console.error ).toHaveBeenCalled();
  } );

  it( 'handles schema validation errors', async () => {
    window.electronAPI.files.read = async () => {
      throw {
        isSchemaError: true,
        type: 'VALIDATION_ERROR',
        message: 'Invalid schema structure',
        field: 'invalidField'
      };
    };

    const frontmatter = {
      invalidField: true
    };

    await expect( frontmatterToForm( frontmatter, '' ) )
      .rejects
      .toMatchObject( {
        isSchemaError: true,
        type: 'VALIDATION_ERROR',
        field: 'invalidField'
      } );

    expect( console.error ).toHaveBeenCalledWith(
      expect.stringContaining( 'Schema error (VALIDATION_ERROR):' ),
      'Invalid schema structure'
    );
  } );

  it( 'handles conversion errors', async () => {
    window.electronAPI.files.read = async () => {
      throw new Error( 'Conversion failed' );
    };

    const frontmatter = { title: "Test" };

    await expect( frontmatterToForm( frontmatter, '' ) )
      .rejects
      .toThrow( 'Conversion failed' );
  } );

  it( 'handles schema errors with path information', async () => {
    window.electronAPI.files.read = async () => {
      throw {
        isSchemaError: true,
        type: 'PATH_ERROR',
        message: 'Invalid path',
        path: '/invalid/path'
      };
    };

    const frontmatter = { title: "Test" };

    await expect( frontmatterToForm( frontmatter, '' ) )
      .rejects
      .toMatchObject( {
        isSchemaError: true,
        type: 'PATH_ERROR',
        path: '/invalid/path'
      } );

    expect( console.error ).toHaveBeenCalledWith( 'File path:', '/invalid/path' );
  } );
} );