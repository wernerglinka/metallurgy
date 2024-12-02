// __tests__/lib/frontmatter-to-form.test.js
import { jest } from '@jest/globals';

// First set up all mocks before any imports
jest.mock( '../../screens/lib/form-generation/schema/convert-js-to-schema.js', () => ( {
  convertToSchemaObject: jest.fn().mockResolvedValue( { fields: [] } )
} ) );

jest.mock( '../../screens/lib/form-generation/schema/schema-handler.js', () => ( {
  getExplicitSchema: jest.fn().mockResolvedValue( [] )
} ) );

jest.mock( '../../screens/lib/form-generation/schema/validate-schema.js', () => ( {
  validateSchema: jest.fn().mockReturnValue( true )
} ) );

jest.mock( '../../screens/lib/form-generation/form/form-builder.js', () => ( {
  createFormFragment: jest.fn().mockReturnValue( document.createDocumentFragment() ),
  renderToDropzone: jest.fn()
} ) );

// Then import the functions
import { frontmatterToForm } from '../../screens/lib/form-generation/frontmatter-to-form.js';
import { convertToSchemaObject } from '../../screens/lib/form-generation/schema/convert-js-to-schema.js';
import { getExplicitSchema } from '../../screens/lib/form-generation/schema/schema-handler.js';
import { validateSchema } from '../../screens/lib/form-generation/schema/validate-schema.js';
import { createFormFragment, renderToDropzone } from '../../screens/lib/form-generation/form/form-builder.js';

describe( 'frontmatterToForm', () => {
  beforeEach( () => {
    // Reset all mocks
    jest.clearAllMocks();
  } );

  it( 'processes frontmatter successfully', async () => {
    const frontmatter = {
      title: 'Test Page',
      layout: 'default'
    };
    const content = 'Test content';

    await frontmatterToForm( frontmatter, content );

    expect( convertToSchemaObject ).toHaveBeenCalledWith( frontmatter );
    expect( validateSchema ).toHaveBeenCalled();
    expect( getExplicitSchema ).toHaveBeenCalled();
    expect( createFormFragment ).toHaveBeenCalled();
    expect( renderToDropzone ).toHaveBeenCalled();
  } );

  it( 'continues without explicit schema if file not found', async () => {
    const fileError = new Error( 'File not found' );
    fileError.isSchemaError = true;
    fileError.type = 'FILE_ERROR';
    getExplicitSchema.mockRejectedValueOnce( fileError );

    const frontmatter = { title: 'Test' };
    await frontmatterToForm( frontmatter, '' );

    expect( createFormFragment ).toHaveBeenCalledWith( [], null );
    expect( renderToDropzone ).toHaveBeenCalled();
  } );

  it( 'throws schema validation errors', async () => {
    const schemaError = new Error( 'Invalid schema' );
    schemaError.isSchemaError = true;
    schemaError.type = 'VALIDATION_ERROR';
    schemaError.field = 'title';
    validateSchema.mockImplementationOnce( () => {
      throw schemaError;
    } );

    const frontmatter = { title: 'Test' };

    await expect( frontmatterToForm( frontmatter, '' ) ).rejects.toThrow( 'Invalid schema' );
  } );

  it( 'throws other errors normally', async () => {
    const error = new Error( 'Unexpected error' );
    convertToSchemaObject.mockRejectedValueOnce( error );

    const frontmatter = { title: 'Test' };

    await expect( frontmatterToForm( frontmatter, '' ) ).rejects.toThrow( 'Unexpected error' );
  } );
} );
