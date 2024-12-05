// __tests__/lib/schema-tests/schema-validation.test.js

import { validateField, validateSchema } from '../../../screens/lib/form-generation/schema/validate-schema.js';

describe( 'Schema Validation', () => {
  describe( 'validateSchema', () => {
    test( 'validates schema with fields array', () => {
      expect( validateSchema( { fields: [] } ) ).toBe( true );
    } );

    test( 'throws on missing fields property', () => {
      expect( () => validateSchema( {} ) )
        .toThrow( 'Schema must contain fields property' );
    } );

    test( 'throws on non-array fields', () => {
      expect( () => validateSchema( { fields: {} } ) )
        .toThrow( 'Schema fields must be an array' );
    } );
  } );

  describe( 'validateField', () => {
    test( 'validates field with type and name', () => {
      expect( validateField( { type: 'text', name: 'title' } ) ).toBe( true );
    } );

    test( 'validates field with type and label', () => {
      expect( validateField( { type: 'text', label: 'Title' } ) ).toBe( true );
    } );

    test( 'throws on missing type', () => {
      expect( () => validateField( { name: 'title' } ) )
        .toThrow( 'Field must have a type' );
    } );

    test( 'throws on missing name and label', () => {
      expect( () => validateField( { type: 'text' } ) )
        .toThrow( 'Field must have label or name' );
    } );

    test( 'throws on invalid field type', () => {
      expect( () => validateField( { type: 'invalid', name: 'test' } ) )
        .toThrow( 'Invalid field type: invalid' );
    } );

    test( 'throws when select field missing options', () => {
      expect( () => validateField( { type: 'select', name: 'choice' } ) )
        .toThrow( 'select field requires options' );
    } );

    test( 'validates select field with valid value', () => {
      const field = {
        type: 'select',
        name: 'choice',
        options: [ { value: 'a', label: 'A' } ],
        value: 'a'
      };
      expect( validateField( field ) ).toBe( true );
    } );

    test( 'throws on invalid select value', () => {
      const field = {
        type: 'select',
        name: 'choice',
        options: [ { value: 'a', label: 'A' } ],
        value: 'b'
      };
      expect( () => validateField( field ) )
        .toThrow( 'Select value must match an option' );
    } );

    test( 'validates list field with array value', () => {
      expect( validateField( {
        type: 'list',
        name: 'items',
        value: []
      } ) ).toBe( true );
    } );

    test( 'throws on non-array list value', () => {
      expect( () => validateField( {
        type: 'list',
        name: 'items',
        value: 'not-array'
      } ) ).toThrow( 'List field must have array value' );
    } );

    test( 'skips value validation for object type', () => {
      expect( validateField( {
        type: 'object',
        name: 'data',
        value: 'any'
      } ) ).toBe( true );
    } );
  } );
} );