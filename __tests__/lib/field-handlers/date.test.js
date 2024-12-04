// __tests__/lib/page-elements/field-handlers/date.test.js
import { updateDateField } from '../../../screens/lib/page-elements/field-handlers/date.js';

describe( 'date field handler', () => {
  let element;

  beforeEach( () => {
    // Set up DOM structure
    element = document.createElement( 'div' );
    element.innerHTML = `
      <input type="text" class="element-label" value="">
      <div>
        <input type="date" class="element-value">
      </div>
    `;
  } );

  it( 'updates date field label', () => {
    const field = {
      value: '2024-01-01',
      label: 'Test Date'
    };

    const updatedElement = updateDateField( element, field );
    expect( updatedElement.querySelector( '.element-label' ).value ).toBe( 'Test Date' );
  } );

  it( 'replaces original date input with new one', () => {
    const field = {
      value: '2024-01-01',
      label: 'Test Date'
    };

    const originalInput = element.querySelector( '.element-value' );
    const updatedElement = updateDateField( element, field );
    const newInput = updatedElement.querySelector( '.element-value' );

    expect( newInput ).not.toBe( originalInput );
    expect( newInput.type ).toBe( 'date' );
    expect( newInput.classList.contains( 'element-value' ) ).toBe( true );
  } );

  it( 'maintains parent node structure', () => {
    const field = {
      value: '2024-01-01',
      label: 'Test Date'
    };

    const parentBeforeUpdate = element.querySelector( '.element-value' ).parentNode;
    const updatedElement = updateDateField( element, field );
    const parentAfterUpdate = updatedElement.querySelector( '.element-value' ).parentNode;

    expect( parentAfterUpdate ).toBe( parentBeforeUpdate );
  } );
} );