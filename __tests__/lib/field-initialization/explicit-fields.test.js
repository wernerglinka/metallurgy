// __tests__/lib/field-initialization/explicit-fields.test.js
import { processExplicitField } from '../../../screens/lib/page-elements/field-initialization/explicit-fields.js';

describe( 'processExplicitField', () => {
  it( 'returns unmodified field with default permissions when no schema array', () => {
    const field = { type: 'text', label: 'test', value: '' };
    const result = processExplicitField( field, null );
    expect( result ).toEqual( {
      field,
      permissions: { addDeleteButton: true, addDuplicateButton: true }
    } );
  } );

  it( 'returns unmodified field with default permissions for empty schema array', () => {
    const field = { type: 'text', label: 'test', value: '' };
    const result = processExplicitField( field, [] );
    expect( result ).toEqual( {
      field,
      permissions: { addDeleteButton: true, addDuplicateButton: true }
    } );
  } );

  it( 'applies schema settings when field matches', () => {
    const field = { type: 'text', label: 'title', value: '' };
    const schema = [ {
      name: 'title',
      type: 'text',
      noDeletion: true,
      noDuplication: true,
      default: 'Default Title',
      placeholder: 'Enter title'
    } ];

    const result = processExplicitField( field, schema );
    expect( result ).toEqual( {
      field: {
        type: 'text',
        label: 'title',
        value: 'Default Title',
        placeholder: 'Enter title'
      },
      permissions: {
        addDeleteButton: false,
        addDuplicateButton: false
      }
    } );
  } );

  it( 'handles select fields with options', () => {
    const field = { type: 'select', label: 'layout', value: '' };
    const schema = [ {
      name: 'layout',
      type: 'select',
      options: [ { label: 'Default', value: 'default' } ],
      default: 'default'
    } ];

    const result = processExplicitField( field, schema );
    expect( result.field.options ).toEqual( schema[ 0 ].options );
    expect( result.field.default ).toBe( 'default' );
  } );

  it( 'preserves field type when not in schema', () => {
    const field = { type: 'text', label: 'custom', value: 'test' };
    const schema = [ { name: 'other', type: 'text' } ];

    const result = processExplicitField( field, schema );
    expect( result.field.type ).toBe( 'text' );
  } );

  it( 'handles empty string values with schema defaults', () => {
    const field = {
      type: 'text',
      label: 'description',
      value: '' // explicitly empty string
    };

    const schema = [ {
      name: 'description',
      type: 'text',
      default: 'Default description'
    } ];

    const result = processExplicitField( field, schema );
    expect( result.field.value ).toBe( 'Default description' );
  } );

  it( 'preserves non-empty string values despite schema defaults', () => {
    const field = {
      type: 'text',
      label: 'description',
      value: 'Existing content'  // non-empty string
    };

    const schema = [ {
      name: 'description',
      type: 'text',
      default: 'Default description'
    } ];

    const result = processExplicitField( field, schema );
    expect( result.field.value ).toBe( 'Existing content' );
  } );

  it( 'preserves field placeholder when no matching schema object exists', () => {
    const field = {
      type: 'text',
      label: 'nonexistent',
      value: '',
      placeholder: 'Original placeholder'
    };

    const schema = [ {
      name: 'different',
      type: 'text'
    } ];

    const result = processExplicitField( field, schema );
    expect( result.field.placeholder ).toBe( 'Original placeholder' );
  } );

  it( 'handles undefined schema placeholder while preserving original', () => {
    const field = {
      type: 'text',
      label: 'test',
      value: '',
      placeholder: 'Original placeholder'
    };

    const schema = [ {
      name: 'test',  // Matching schema object but no placeholder
      type: 'text'
    } ];

    const result = processExplicitField( field, schema );
    expect( result.field.placeholder ).toBe( 'Original placeholder' );
  } );
} );