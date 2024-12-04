// __tests__/lib/page-elements/field-handlers/object.test.js
import { updateObjectField } from '../../../screens/lib/page-elements/field-handlers/object.js';

describe( 'object field handler', () => {
  let element;

  beforeEach( () => {
    // Set up main element
    element = document.createElement( 'div' );
    element.innerHTML = `
      <div class="object-name">
        <input type="text" value="">
      </div>
      <div class="dropzone"></div>
    `;
  } );

  it( 'updates object label', () => {
    const field = {
      label: 'Test Object',
      value: []
    };

    const updatedElement = updateObjectField( element, field, [], false );
    expect( updatedElement.querySelector( '.object-name input' ).value ).toBe( 'Test Object' );
  } );

  it( 'handles empty value array', () => {
    const field = {
      label: 'Test Object',
      value: []
    };

    const updatedElement = updateObjectField( element, field, [], false );
    expect( updatedElement.querySelector( '.dropzone' ).children.length ).toBe( 0 );
  } );

  it( 'maintains original element reference', () => {
    const field = {
      label: 'Test Object',
      value: []
    };

    const updatedElement = updateObjectField( element, field, [], false );
    expect( updatedElement ).toBe( element );
  } );

  it( 'preserves dropzone element', () => {
    const field = {
      label: 'Test Object',
      value: []
    };

    const dropzoneBefore = element.querySelector( '.dropzone' );
    const updatedElement = updateObjectField( element, field, [], false );
    const dropzoneAfter = updatedElement.querySelector( '.dropzone' );

    expect( dropzoneAfter ).toBe( dropzoneBefore );
  } );
} );