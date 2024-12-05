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

  test( 'handles missing project path', async () => {
    StorageOperations.clearProjectData();
    await expect( getExplicitSchema() )
      .rejects
      .toMatchObject( {
        type: 'FILE_ERROR',
        message: 'No project path found in storage'
      } );
  } );

  test( 'returns null if schema file does not exist', async () => {
    window.electronAPI.files.exists = async () => false;
    const result = await getExplicitSchema();
    expect( result ).toBeNull();
  } );

  test( 'throws error if schema read fails', async () => {
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

  test( 'throws error for non-array data', async () => {
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

  test( 'processes valid schema field', async () => {
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
} );