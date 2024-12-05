// __tests__/lib/page-elements/field-handlers/textarea.test.js
import { updateTextareaField } from '../../../screens/lib/page-elements/field-handlers/textarea.js';

describe( 'textarea field handler', () => {
  let element;
  let originalInitializeEditor;
  const useEditor = false;

  beforeEach( () => {
    element = document.createElement( 'div' );
    element.innerHTML = `
      <input type="text" class="element-label" value="">
      <div>
        <textarea class="element-value"></textarea>
      </div>
    `;

    // Save original and skip editor initialization
    originalInitializeEditor = window.initializeEditor;
    window.initializeEditor = () => { };
  } );

  afterEach( () => {
    // Restore original
    window.initializeEditor = originalInitializeEditor;
  } );

  it( 'updates textarea label', () => {
    const field = {
      label: 'Test Textarea',
      value: 'Test content'
    };

    const updatedElement = updateTextareaField( element, field, useEditor );
    expect( updatedElement.querySelector( '.element-label' ).value ).toBe( 'Test Textarea' );
  } );

  it( 'replaces original textarea with new one containing value', () => {
    const field = {
      label: 'Test Textarea',
      value: 'Test content'
    };

    const originalTextarea = element.querySelector( '.element-value' );
    const updatedElement = updateTextareaField( element, field, useEditor );
    const newTextarea = updatedElement.querySelector( '.element-value' );

    expect( newTextarea ).not.toBe( originalTextarea );
    expect( newTextarea.value ).toBe( 'Test content' );
  } );

  it( 'adds required classes to new textarea', () => {
    const field = {
      label: 'Test Textarea',
      value: 'Test content'
    };

    const updatedElement = updateTextareaField( element, field, useEditor );
    const textarea = updatedElement.querySelector( '.element-value' );

    expect( textarea.classList.contains( 'element-value' ) ).toBe( true );
    expect( textarea.classList.contains( 'is-editor' ) ).toBe( true );
  } );

  it( 'sets correct placeholder', () => {
    const field = {
      label: 'Test Textarea',
      value: 'Test content'
    };

    const updatedElement = updateTextareaField( element, field, useEditor );
    const textarea = updatedElement.querySelector( '.element-value' );
    expect( textarea.getAttribute( 'placeholder' ) ).toBe( 'Click to open editor' );
  } );

  it( 'maintains parent node structure', () => {
    const field = {
      label: 'Test Textarea',
      value: 'Test content'
    };

    const parentBeforeUpdate = element.querySelector( '.element-value' ).parentNode;
    const updatedElement = updateTextareaField( element, field, useEditor );
    const parentAfterUpdate = updatedElement.querySelector( '.element-value' ).parentNode;

    expect( parentAfterUpdate ).toBe( parentBeforeUpdate );
  } );
} );