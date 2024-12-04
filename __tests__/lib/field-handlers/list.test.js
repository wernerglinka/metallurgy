// __tests__/lib/page-elements/field-handlers/list.test.js
import { updateListField } from '../../../screens/lib/page-elements/field-handlers/list.js';

describe( 'list field handler', () => {
  let element;

  beforeEach( () => {
    // Set up DOM structure that matches what the handler expects
    element = document.createElement( 'div' );
    element.innerHTML = `
      <div class="object-name">
        <input type="text" value="">
      </div>
      <ul>
        <li>
          <input type="text" class="list-item" value="">
          <div class="button-wrapper">
            <div class="add-button button"></div>
            <div class="delete-button button"></div>
          </div>
        </li>
      </ul>
    `;
  } );

  it( 'updates list label', () => {
    const field = {
      label: 'Test List',
      value: []
    };

    const updatedElement = updateListField( element, field );
    expect( updatedElement.querySelector( '.object-name input' ).value ).toBe( 'Test List' );
  } );

  it( 'adds is-list class', () => {
    const field = {
      label: 'Test List',
      value: []
    };

    const updatedElement = updateListField( element, field );
    expect( updatedElement.classList.contains( 'is-list' ) ).toBe( true );
  } );

  it( 'creates list items for each value', () => {
    const field = {
      label: 'Test List',
      value: [ 'Item 1', 'Item 2', 'Item 3' ]
    };

    const updatedElement = updateListField( element, field );
    const listItems = updatedElement.querySelectorAll( 'li' );

    expect( listItems.length ).toBe( 3 );
    expect( listItems[ 0 ].querySelector( 'input' ).value ).toBe( 'Item 1' );
    expect( listItems[ 1 ].querySelector( 'input' ).value ).toBe( 'Item 2' );
    expect( listItems[ 2 ].querySelector( 'input' ).value ).toBe( 'Item 3' );
  } );

  it( 'preserves button structure in cloned items', () => {
    const field = {
      label: 'Test List',
      value: [ 'Item 1' ]
    };

    const updatedElement = updateListField( element, field );
    const listItem = updatedElement.querySelector( 'li' );

    expect( listItem.querySelector( '.button-wrapper' ) ).toBeTruthy();
    expect( listItem.querySelector( '.add-button' ) ).toBeTruthy();
    expect( listItem.querySelector( '.delete-button' ) ).toBeTruthy();
  } );

  it( 'handles empty value array', () => {
    const field = {
      label: 'Test List',
      value: []
    };

    const updatedElement = updateListField( element, field );
    expect( updatedElement.querySelectorAll( 'li' ).length ).toBe( 0 );
  } );
} );