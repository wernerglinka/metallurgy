// __tests__/lib/storage-operations.test.js

import { StorageOperations } from '../../screens/lib/storage-operations.js';

describe( 'StorageOperations', () => {
  beforeEach( () => {
    localStorage.clear();
  } );

  test( 'saves and retrieves project path', () => {
    StorageOperations.saveProjectPath( '/test/path' );
    expect( StorageOperations.getProjectPath() ).toBe( '/test/path' );
  } );

  test( 'throws error on empty project path', () => {
    expect( () => StorageOperations.saveProjectPath() ).toThrow( 'Project path is required' );
  } );

  test( 'saves and retrieves all project data', () => {
    const paths = {
      projectPath: '/test/path',
      contentPath: '/test/path/content',
      dataPath: '/test/path/data'
    };
    StorageOperations.saveProjectData( paths );
    expect( StorageOperations.getProjectData() ).toEqual( paths );
  } );

  test( 'throws error on missing project paths', () => {
    expect( () => StorageOperations.saveProjectData( {
      projectPath: '/test'
    } ) ).toThrow( 'All project paths are required' );
  } );

  test( 'returns null when no project data exists', () => {
    expect( StorageOperations.getProjectData() ).toBeNull();
  } );

  test( 'clears project data', () => {
    StorageOperations.saveProjectData( {
      projectPath: '/test/path',
      contentPath: '/test/path/content',
      dataPath: '/test/path/data'
    } );
    StorageOperations.clearProjectData();
    expect( StorageOperations.getProjectData() ).toBeNull();
  } );

  test( 'extracts project name from path', () => {
    expect( StorageOperations.getProjectName( '/test/path/project' ) ).toBe( 'project' );
  } );

  test( 'throws error on invalid project name path', () => {
    expect( () => StorageOperations.getProjectName( '' ) ).toThrow( 'Path is required' );
    expect( () => StorageOperations.getProjectName( '/' ) ).toThrow( 'Invalid path format' );
  } );

  test( 'gets individual paths', () => {
    const paths = {
      projectPath: '/test/path',
      contentPath: '/test/path/content',
      dataPath: '/test/path/data'
    };
    StorageOperations.saveProjectData( paths );
    expect( StorageOperations.getContentPath() ).toBe( paths.contentPath );
    expect( StorageOperations.getDataPath() ).toBe( paths.dataPath );
  } );
} );