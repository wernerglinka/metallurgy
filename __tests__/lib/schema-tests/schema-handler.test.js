// __tests__/lib/schema-tests/schema-handler.test.js

import { jest } from '@jest/globals';
import { getExplicitSchema } from '../../../screens/lib/form-generation/schema/schema-handler.js';
import { StorageOperations } from '../../../screens/lib/storage-operations.js';

describe( 'Schema Handler', () => {
  beforeEach( () => {
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
          data: [ { type: 'text', name: 'title' } ],
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

  it( 'handles missing project path', async () => {
    StorageOperations.clearProjectData();
    await expect( getExplicitSchema() )
      .rejects
      .toMatchObject( {
        type: 'FILE_ERROR',
        message: 'No project path found in storage'
      } );
  } );

  it( 'returns null if schema file does not exist', async () => {
    window.electronAPI.files.exists = async () => false;
    const result = await getExplicitSchema();
    expect( result ).toBeNull();
  } );

  it( 'throws error if schema read fails', async () => {
    window.electronAPI.files.read = async () => ( {
      status: 'failure',
      error: 'Read error'
    } );

    await expect( getExplicitSchema() )
      .rejects
      .toMatchObject( {
        type: 'FILE_ERROR',
        message: expect.stringContaining( 'Read error' )
      } );
  } );

  it( 'throws error for non-array data', async () => {
    window.electronAPI.files.read = async () => ( {
      status: 'success',
      data: { notAnArray: true }
    } );

    await expect( getExplicitSchema() )
      .rejects
      .toMatchObject( {
        type: 'FILE_ERROR',
        message: 'Schema file must contain an array'
      } );
  } );

  it( 'processes valid schema field', async () => {
    window.electronAPI.files.read = async () => ( {
      status: 'success',
      data: [ { type: 'checkbox', name: 'isEnabled' } ]
    } );

    const result = await getExplicitSchema();
    expect( result[ 0 ] ).toMatchObject( {
      type: 'checkbox',
      name: 'isEnabled',
      default: false
    } );
  } );

  it( 'processes schema with array field type', async () => {
    window.electronAPI.files.read = async () => ( {
      status: 'success',
      data: [ {
        type: 'array',
        name: 'items',
        fields: [
          { type: 'text', name: 'title' }
        ]
      } ]
    } );

    const result = await getExplicitSchema();
    expect( result[ 0 ] ).toMatchObject( {
      type: 'array',
      name: 'items',
      fields: expect.arrayContaining( [
        expect.objectContaining( { type: 'text', name: 'title' } )
      ] )
    } );
  } );

  it( 'processes schema with explicit permissions', async () => {
    window.electronAPI.files.read = async () => ( {
      status: 'success',
      data: [ {
        type: 'text',
        name: 'title',
        addDeleteButton: true,
        addDuplicateButton: true
      } ]
    } );

    const result = await getExplicitSchema();
    expect( result[ 0 ] ).toMatchObject( {
      type: 'text',
      name: 'title',
      addDeleteButton: true,
      addDuplicateButton: true
    } );
  } );

  it( 'processes schema with custom options', async () => {
    window.electronAPI.files.read = async () => ( {
      status: 'success',
      data: [ {
        type: 'select',
        name: 'category',
        options: [ 'A', 'B', 'C' ]  // Changed from values to options
      } ]
    } );

    const result = await getExplicitSchema();
    expect( result[ 0 ] ).toMatchObject( {
      type: 'select',
      name: 'category',
      options: [ 'A', 'B', 'C' ]
    } );
  } );

  it( 'processes schema with mixed field configurations', async () => {
    window.electronAPI.files.read = async () => ( {
      status: 'success',
      data: [
        {
          type: 'text',
          name: 'title',
          addDeleteButton: false
        },
        {
          type: 'array',
          name: 'items',
          addDuplicateButton: true,
          fields: [
            { type: 'text', name: 'name' }
          ]
        },
        {
          type: 'select',
          name: 'status',
          options: [ 'draft', 'published' ]  // Changed from values to options
        }
      ]
    } );

    const result = await getExplicitSchema();
    expect( result ).toHaveLength( 3 );
    expect( result[ 0 ].addDeleteButton ).toBe( false );
    expect( result[ 1 ].fields ).toBeTruthy();
    expect( result[ 2 ].options ).toEqual( [ 'draft', 'published' ] );  // Updated assertion
  } );

  it( 'handles validation errors in schema fields', async () => {
    window.electronAPI.files.read = async () => ( {
      status: 'success',
      data: [ {
        type: 'select',  // select type without required options
        name: 'category'
      } ]
    } );

    await expect( getExplicitSchema() )
      .rejects
      .toMatchObject( {
        type: 'FILE_ERROR',
        message: expect.stringContaining( 'select field requires options' )
      } );
  } );
} );