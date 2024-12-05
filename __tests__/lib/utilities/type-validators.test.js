// __tests__/lib/utilities/type-validators.test.js

import { isSimpleList, isDateString, isDateObject, getFieldType } from '../../../screens/lib/utilities/type-validators.js';

describe( 'Type Validators', () => {
  describe( 'isSimpleList', () => {
    test( 'validates array of strings', () => {
      expect( isSimpleList( [ 'a', 'b', 'c' ] ) ).toBe( true );
    } );

    test( 'rejects non-arrays', () => {
      expect( isSimpleList( 'not array' ) ).toBe( false );
      expect( isSimpleList( 123 ) ).toBe( false );
    } );

    test( 'rejects mixed arrays', () => {
      expect( isSimpleList( [ 'a', 1, 'b' ] ) ).toBe( false );
      expect( isSimpleList( [ 'a', {}, 'b' ] ) ).toBe( false );
    } );
  } );

  describe( 'isDateString', () => {
    test( 'validates valid date strings', () => {
      expect( isDateString( '2023-12-25' ) ).toBe( true );
      expect( isDateString( '2023/12/25' ) ).toBe( true );
    } );

    test( 'rejects invalid date strings', () => {
      expect( isDateString( 'invalid' ) ).toBe( false );
      expect( isDateString( '2023-13-45' ) ).toBe( false );
    } );
  } );

  describe( 'isDateObject', () => {
    test( 'validates Date objects', () => {
      expect( isDateObject( new Date() ) ).toBe( true );
    } );

    test( 'rejects non-Date objects', () => {
      expect( isDateObject( '2023-12-25' ) ).toBe( false );
      expect( isDateObject( {} ) ).toBe( false );
    } );
  } );

  describe( 'getFieldType', () => {
    test( 'detects lists', () => {
      expect( getFieldType( [ 'a', 'b' ] ) ).toBe( 'list' );
    } );

    test( 'detects arrays', () => {
      expect( getFieldType( [ 1, 2 ] ) ).toBe( 'array' );
    } );

    test( 'detects dates', () => {
      expect( getFieldType( new Date() ) ).toBe( 'date' );
    } );

    test( 'detects null', () => {
      expect( getFieldType( null ) ).toBe( 'null' );
    } );

    test( 'detects primitives', () => {
      expect( getFieldType( 'string' ) ).toBe( 'string' );
      expect( getFieldType( 123 ) ).toBe( 'number' );
      expect( getFieldType( true ) ).toBe( 'boolean' );
    } );
  } );
} );