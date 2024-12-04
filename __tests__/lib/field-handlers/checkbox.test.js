// __tests__/lib/page-elements/field-handlers/checkbox.test.js
import { updateCheckboxField } from '../../../screens/lib/page-elements/field-handlers/checkbox.js';

describe( 'checkbox field handler', () => {
  let element;

  beforeEach( () => {
    // Set up DOM structure that matches what the handler expects
    element = document.createElement( 'div' );
    element.innerHTML = `
      <input type="text" class="element-label" value="">
      <input type="checkbox" class="element-value">
    `;
  } );

  it( 'updates checkbox state and label', () => {
    const field = {
      value: true,
      label: 'Test Checkbox'
    };

    const updatedElement = updateCheckboxField( element, field );

    expect( updatedElement.querySelector( '.element-value' ).checked ).toBe( true );
    expect( updatedElement.querySelector( '.element-label' ).value ).toBe( 'Test Checkbox' );
  } );

  it( 'handles unchecked state', () => {
    const field = {
      value: false,
      label: 'Test Checkbox'
    };

    const updatedElement = updateCheckboxField( element, field );

    expect( updatedElement.querySelector( '.element-value' ).checked ).toBe( false );
    expect( updatedElement.querySelector( '.element-label' ).value ).toBe( 'Test Checkbox' );
  } );

  it( 'updates label independently of checkbox state', () => {
    const field = {
      value: false,
      label: 'New Label'
    };

    const updatedElement = updateCheckboxField( element, field );
    expect( updatedElement.querySelector( '.element-label' ).value ).toBe( 'New Label' );
  } );
} );