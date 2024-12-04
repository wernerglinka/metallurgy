// __tests__/lib/page-elements/field-handlers/number.test.js
import { updateNumberField } from '../../../screens/lib/page-elements/field-handlers/number.js';

describe( 'number field handler', () => {
  let element;

  beforeEach( () => {
    element = document.createElement( 'div' );
    element.innerHTML = `
      <input type="text" class="element-label" value="">
      <input type="number" class="element-value" value="">
    `;
  } );

  it( 'updates number field label', () => {
    const field = {
      label: 'Test Number',
      value: 42,
      placeholder: 'Enter a number'
    };

    const updatedElement = updateNumberField( element, field );
    expect( updatedElement.querySelector( '.element-label' ).value ).toBe( 'Test Number' );
  } );

  it( 'updates number field value', () => {
    const field = {
      label: 'Test Number',
      value: 42,
      placeholder: 'Enter a number'
    };

    const updatedElement = updateNumberField( element, field );
    expect( updatedElement.querySelector( '.element-value' ).value ).toBe( '42' );
  } );

  it( 'updates placeholder text', () => {
    const field = {
      label: 'Test Number',
      value: 42,
      placeholder: 'Enter a number'
    };

    const updatedElement = updateNumberField( element, field );
    expect( updatedElement.querySelector( '.element-value' ).placeholder ).toBe( 'Enter a number' );
  } );

  it( 'handles empty values', () => {
    const field = {
      label: 'Test Number',
      value: '',
      placeholder: 'Enter a number'
    };

    const updatedElement = updateNumberField( element, field );
    expect( updatedElement.querySelector( '.element-value' ).value ).toBe( '' );
  } );

  it( 'handles zero value', () => {
    const field = {
      label: 'Test Number',
      value: 0,
      placeholder: 'Enter a number'
    };

    const updatedElement = updateNumberField( element, field );
    expect( updatedElement.querySelector( '.element-value' ).value ).toBe( '0' );
  } );
} );