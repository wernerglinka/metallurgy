// __tests__/lib/schema-tests/schema-errors.test.js

import { jest } from '@jest/globals';
import {
  createSchemaError,
  createValidationError,
  createFileError
} from '../../../screens/lib/form-generation/schema/schema-errors.js';

describe( 'Schema Errors', () => {
  it( 'creates basic schema error with specified type', () => {
    const error = createSchemaError( 'Test error', 'CUSTOM_ERROR' );

    expect( error ).toEqual( {
      message: 'Test error',
      type: 'CUSTOM_ERROR',
      isSchemaError: true
    } );
  } );

  it( 'creates basic schema error with default type', () => {
    const error = createSchemaError( 'Test error' );

    expect( error ).toEqual( {
      message: 'Test error',
      type: 'SCHEMA_ERROR',
      isSchemaError: true
    } );
  } );

  it( 'creates validation error with field info', () => {
    const error = createValidationError( 'Invalid field', 'title' );

    expect( error ).toEqual( {
      message: 'Invalid field',
      type: 'VALIDATION_ERROR',
      isSchemaError: true,
      field: 'title'
    } );
  } );

  it( 'creates file error with path info', () => {
    const error = createFileError( 'File not found', '/path/to/file' );

    expect( error ).toEqual( {
      message: 'File not found',
      type: 'FILE_ERROR',
      isSchemaError: true,
      path: '/path/to/file'
    } );
  } );
} );
