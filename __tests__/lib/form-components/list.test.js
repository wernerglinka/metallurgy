// __tests__/lib/baseFields/list.test.js
import list from '../../../screens/lib/baseFields/list.js';
import { ICONS } from '../../../screens/icons/index.js';

describe( 'list component', () => {
  let container;

  beforeEach( () => {
    container = document.createElement( 'div' );
    container.classList.add( 'form-element' );
  } );

  it( 'creates list with editable label', () => {
    const result = list( container, false );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( false );
  } );

  it( 'creates list with readonly label', () => {
    const result = list( container, true );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( true );
  } );

  it( 'creates initial list item with input', () => {
    const result = list( container, false );
    const listItem = result.querySelector( 'li' );
    const input = listItem.querySelector( 'input.list-item' );

    expect( input ).toBeTruthy();
    expect( input.getAttribute( 'type' ) ).toBe( 'text' );
    expect( input.getAttribute( 'placeholder' ) ).toBe( 'Item Placeholder' );
  } );

  it( 'includes add and delete buttons with correct icons', () => {
    const result = list( container, false );
    const buttonWrapper = result.querySelector( '.button-wrapper' );

    // Check add button
    const addButton = buttonWrapper.querySelector( '.add-button' );
    expect( addButton ).toBeTruthy();
    const normalizedAddHtml = addButton.innerHTML.replace( /\s+/g, '' );
    const expectedAddIcon = ICONS.ADD.replace( /\s+/g, '' );
    expect( normalizedAddHtml ).toBe( expectedAddIcon );

    // Check delete button
    const deleteButton = buttonWrapper.querySelector( '.delete-button' );
    expect( deleteButton ).toBeTruthy();
    const normalizedDeleteHtml = deleteButton.innerHTML.replace( /\s+/g, '' );
    const expectedDeleteIcon = ICONS.DELETE.replace( /\s+/g, '' );
    expect( normalizedDeleteHtml ).toBe( expectedDeleteIcon );
  } );

  it( 'has proper list structure', () => {
    const result = list( container, false );
    expect( result.querySelector( 'ul' ) ).toBeTruthy();
    expect( result.querySelectorAll( 'li' ).length ).toBe( 1 );
  } );

  it( 'has required indicator', () => {
    const result = list( container, false );
    expect( result.querySelector( 'sup' ).textContent ).toBe( '*' );
  } );

  it( 'maintains proper label wrapper structure', () => {
    const result = list( container, false );
    const labelWrapper = result.querySelector( '.label-wrapper' );
    expect( labelWrapper ).toBeTruthy();
    expect( labelWrapper.classList.contains( 'object-name' ) ).toBe( true );
  } );
} );