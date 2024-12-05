// __tests__/lib/page-elements/field-handlers/select.test.js

import { updateSelectField } from '../../../screens/lib/page-elements/field-handlers/select.js';

describe( 'Select Field Handler', () => {
  let container;

  beforeEach( () => {
    document.body.innerHTML = `
      <div class="form-element">
        <input type="text" class="element-label" value="old-label">
        <input type="text" class="element-value" value="old-value">
      </div>
    `;
    container = document.querySelector( '.form-element' );
  } );

  test( 'converts input to select field with options', () => {
    const field = {
      label: 'Colors',
      options: [
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' }
      ],
      default: 'blue'
    };

    const result = updateSelectField( container, field );
    const select = result.querySelector( 'select' );
    const options = select.querySelectorAll( 'option' );

    expect( select ).toBeTruthy();
    expect( select.classList.contains( 'element-value' ) ).toBe( true );
    expect( options.length ).toBe( 2 );
    expect( options[ 1 ].selected ).toBe( true );
  } );

  test( 'handles field with value over default', () => {
    const field = {
      label: 'Colors',
      value: 'red',
      default: 'blue',
      options: [
        { label: 'Red', value: 'red' },
        { label: 'Blue', value: 'blue' }
      ]
    };

    const result = updateSelectField( container, field );
    const options = result.querySelectorAll( 'option' );
    expect( options[ 0 ].selected ).toBe( true );
  } );

  test( 'updates label value', () => {
    const field = {
      label: 'New Label',
      options: [ { label: 'Option', value: 'option' } ],
      default: 'option'
    };

    const result = updateSelectField( container, field );
    expect( result.querySelector( '.element-label' ).value ).toBe( 'New Label' );
  } );
} );