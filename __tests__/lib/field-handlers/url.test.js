import { jest } from '@jest/globals';
import { updateUrlField } from '../../../screens/lib/page-elements/field-handlers/url.js';

describe( 'URL Field Handler', () => {
  let container;

  beforeEach( () => {
    document.body.innerHTML = `
      <div class="form-element">
        <input type="text" class="element-label" value="website">
        <input type="text" class="element-value" value="https://example.com">
      </div>
    `;
    container = document.body.querySelector( '.form-element' );
  } );

  afterEach( () => {
    document.body.innerHTML = '';
  } );

  test( 'updates label and converts input to URL type', () => {
    const field = {
      label: 'Homepage',
      placeholder: 'Enter website URL'
    };

    const updatedElement = updateUrlField( container, field );

    const label = updatedElement.querySelector( '.element-label' );
    const input = updatedElement.querySelector( '.element-value' );

    expect( label.value ).toBe( 'Homepage' );
    expect( input.type ).toBe( 'url' );
    expect( input.placeholder ).toBe( 'Enter website URL' );
  } );

  test( 'preserves DOM structure while replacing input', () => {
    const field = {
      label: 'Website',
      placeholder: 'Enter URL'
    };

    const originalParent = container.querySelector( '.element-value' ).parentNode;
    const updatedElement = updateUrlField( container, field );
    const newInput = updatedElement.querySelector( '.element-value' );

    expect( newInput.parentNode ).toBe( originalParent );
  } );
} );