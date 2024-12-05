// __tests__/lib/buttons/form-actions.test.js

import { jest } from '@jest/globals';
import { addActionButtons } from '../../../screens/lib/buttons/form-actions.js';
import { ICONS } from '../../../screens/icons/index.js';

describe( 'Form Actions', () => {
  let parentElement;

  beforeEach( () => {
    parentElement = document.createElement( 'div' );
  } );

  it( 'adds both duplicate and delete buttons when both options true', () => {
    addActionButtons( parentElement, {
      addDeleteButton: true,
      addDuplicateButton: true
    } );

    const wrapper = parentElement.querySelector( '.button-wrapper' );
    expect( wrapper ).toBeTruthy();

    const addButton = wrapper.querySelector( '.add-button' );
    expect( addButton ).toBeTruthy();
    expect( addButton.innerHTML ).toBe( ICONS.ADD );

    const deleteButton = wrapper.querySelector( '.delete-button' );
    expect( deleteButton ).toBeTruthy();
    expect( deleteButton.innerHTML ).toBe( ICONS.DELETE );
  } );

  it( 'adds only delete button when only addDeleteButton true', () => {
    addActionButtons( parentElement, {
      addDeleteButton: true,
      addDuplicateButton: false
    } );

    const wrapper = parentElement.querySelector( '.button-wrapper' );
    expect( wrapper ).toBeTruthy();

    const addButton = wrapper.querySelector( '.add-button' );
    expect( addButton ).toBeFalsy();

    const deleteButton = wrapper.querySelector( '.delete-button' );
    expect( deleteButton ).toBeTruthy();
    expect( deleteButton.innerHTML ).toBe( ICONS.DELETE );
  } );

  it( 'adds only duplicate button when only addDuplicateButton true', () => {
    addActionButtons( parentElement, {
      addDeleteButton: false,
      addDuplicateButton: true
    } );

    const wrapper = parentElement.querySelector( '.button-wrapper' );
    expect( wrapper ).toBeTruthy();

    const addButton = wrapper.querySelector( '.add-button' );
    expect( addButton ).toBeTruthy();
    expect( addButton.innerHTML ).toBe( ICONS.ADD );

    const deleteButton = wrapper.querySelector( '.delete-button' );
    expect( deleteButton ).toBeFalsy();
  } );

  it( 'adds button wrapper but no buttons when both options false', () => {
    addActionButtons( parentElement, {
      addDeleteButton: false,
      addDuplicateButton: false
    } );

    const wrapper = parentElement.querySelector( '.button-wrapper' );
    expect( wrapper ).toBeTruthy();
    expect( wrapper.children.length ).toBe( 0 );
  } );
} );