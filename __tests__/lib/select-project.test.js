import { jest, describe, it, expect } from '@jest/globals';
import { mocks } from '../setup.js';
import { selectProject } from '../../screens/lib/select-project.js';

describe( 'selectProject', () => {
  beforeEach( () => {
    // Clear all mock data before each test
    jest.clearAllMocks();
  } );

  it( 'should handle dialog cancellation', async () => {
    mocks.dialog.open.mockResolvedValueOnce( {
      canceled: true,
      filePaths: []
    } );

    const result = await selectProject();
    expect( result ).toBe( 'abort' );
  } );

  it( 'should handle empty file paths', async () => {
    mocks.dialog.open.mockResolvedValueOnce( {
      canceled: false,
      filePaths: []
    } );

    const result = await selectProject();
    expect( result ).toBe( 'abort' );
  } );

  it( 'should validate selected path exists', async () => {
    const testPath = '/test/path';
    mocks.dialog.open.mockResolvedValueOnce( {
      canceled: false,
      filePaths: [ testPath ]
    } );
    mocks.files.exists.mockResolvedValueOnce( true );

    const result = await selectProject();

    expect( result ).toBe( testPath );
    expect( mocks.files.exists ).toHaveBeenCalledWith( testPath );
  } );

  it( 'should throw error if selected path does not exist', async () => {
    const testPath = '/nonexistent/path';
    mocks.dialog.open.mockResolvedValueOnce( {
      canceled: false,
      filePaths: [ testPath ]
    } );
    mocks.files.exists.mockResolvedValueOnce( false );

    await expect( selectProject() ).rejects.toThrow( 'Failed to select project folder: Selected folder does not exist' );
  } );

  it( 'should call dialog.open with correct parameters', async () => {
    mocks.dialog.open.mockResolvedValueOnce( {
      canceled: true,
      filePaths: []
    } );

    await selectProject();

    expect( mocks.dialog.open ).toHaveBeenCalledWith( 'showOpenDialog', {
      title: 'Select Project Folder',
      message: 'Choose a folder for your project',
      properties: [ 'openDirectory' ],
      buttonLabel: 'Select Project Folder'
    } );
  } );

  it( 'should handle dialog errors', async () => {
    mocks.dialog.open.mockRejectedValueOnce( new Error( 'Dialog failed' ) );

    await expect( selectProject() ).rejects.toThrow( 'Failed to select project folder: Dialog failed' );
  } );
} );