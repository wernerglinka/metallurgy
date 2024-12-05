// __tests__/lib/field-handlers/object.test.js

import { updateObjectField } from '../../../screens/lib/page-elements/field-handlers/object.js';

describe( 'object field handler', () => {
  let element;

  beforeEach( () => {
    document.body.innerHTML = '';
    element = document.createElement( 'div' );
    element.innerHTML = `
      <div class="object-name">
        <input type="text" value="">
      </div>
      <div class="dropzone"></div>
    `;
    document.body.appendChild( element );
  } );

  afterEach( () => {
    document.body.innerHTML = '';
  } );

  it( 'updates object label', () => {
    const field = {
      label: 'Test Object',
      value: []
    };
    const updatedElement = updateObjectField( element, field, [], false );
    expect( updatedElement.querySelector( '.object-name input' ).value )
      .toBe( 'Test Object' );
  } );

  it( 'handles empty value array', () => {
    const field = {
      label: 'Test Object',
      value: []
    };
    const updatedElement = updateObjectField( element, field, [], false );
    expect( updatedElement.querySelector( '.dropzone' ).children.length )
      .toBe( 0 );
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

  it( 'handles non-empty value array', () => {
    const field = {
      label: 'Test Object',
      value: [
        { type: 'text', label: 'Child1', value: 'test1' },
        { type: 'text', label: 'Child2', value: 'test2' }
      ]
    };

    const updatedElement = updateObjectField( element, field, [], false );
    const dropzone = updatedElement.querySelector( '.dropzone' );
    expect( dropzone.children.length ).toBe( 2 );
  } );
} );