// __tests__/lib/schema-tests/convert-js-to-schema.test.js

import { convertToSchemaObject } from '../../../screens/lib/form-generation/schema/convert-js-to-schema.js';

describe( 'Convert JS to Schema', () => {
  test( 'infers text field type', async () => {
    const result = await convertToSchemaObject( { title: 'Test' } );
    expect( result.fields[ 0 ] ).toMatchObject( {
      type: 'text',
      label: 'title',
      value: 'Test'
    } );
  } );

  test( 'infers textarea for multiline strings', async () => {
    const result = await convertToSchemaObject( { content: 'Line 1\nLine 2' } );
    expect( result.fields[ 0 ].type ).toBe( 'textarea' );
  } );

  test( 'infers list type', async () => {
    const result = await convertToSchemaObject( { tags: [ 'one', 'two' ] } );
    expect( result.fields[ 0 ].type ).toBe( 'list' );
  } );

  test( 'infers array type for mixed arrays', async () => {
    const result = await convertToSchemaObject( { items: [ 1, 'two' ] } );
    expect( result.fields[ 0 ].type ).toBe( 'array' );
  } );

  test( 'handles nested objects', async () => {
    const data = {
      meta: {
        title: 'Test',
        active: true
      }
    };
    const result = await convertToSchemaObject( data );
    expect( result.fields[ 0 ].type ).toBe( 'object' );
    expect( result.fields[ 0 ].value ).toHaveLength( 2 );
  } );

  test( 'handles arrays of objects', async () => {
    const data = {
      sections: [ {
        title: 'Section 1',
        enabled: true
      } ]
    };
    const result = await convertToSchemaObject( data );
    expect( result.fields[ 0 ].type ).toBe( 'array' );
    expect( result.fields[ 0 ].value[ 0 ].type ).toBe( 'object' );
  } );

  test( 'infers checkbox for booleans', async () => {
    const result = await convertToSchemaObject( { active: true } );
    expect( result.fields[ 0 ].type ).toBe( 'checkbox' );
  } );

  test( 'infers number type', async () => {
    const result = await convertToSchemaObject( { count: 42 } );
    expect( result.fields[ 0 ].type ).toBe( 'number' );
  } );

  test( 'handles date objects', async () => {
    const result = await convertToSchemaObject( { published: new Date() } );
    expect( result.fields[ 0 ].type ).toBe( 'date' );
  } );
} );