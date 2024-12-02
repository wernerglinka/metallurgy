// __tests__/lib/transform-form-to-object.test.js
import { jest } from '@jest/globals';
import {
  PathOps,
  ValueOps,
  FormStateOps,
  processElement,
  transformFormElementsToObject
} from '../../screens/lib/transform-form-to-object.js';

describe( 'PathOps', () => {
  describe( 'push', () => {
    it( 'adds element to path array immutably', () => {
      const path = [ 'main', 'seo' ];
      const result = PathOps.push( path, 'title' );
      expect( result ).toEqual( [ 'main', 'seo', 'title' ] );
      // Verify immutability
      expect( path ).toEqual( [ 'main', 'seo' ] );
    } );
  } );

  describe( 'pop', () => {
    it( 'removes last element from path array immutably', () => {
      const path = [ 'main', 'seo', 'title' ];
      const result = PathOps.pop( path );
      expect( result ).toEqual( [ 'main', 'seo' ] );
      // Verify immutability
      expect( path ).toEqual( [ 'main', 'seo', 'title' ] );
    } );
  } );

  describe( 'getIn', () => {
    it( 'safely gets nested object value', () => {
      const obj = { main: { seo: { title: 'Page' } } };
      const result = PathOps.getIn( obj, [ 'main', 'seo' ] );
      expect( result ).toEqual( { title: 'Page' } );
    } );

    it( 'creates objects for missing paths', () => {
      const obj = { main: {} };
      const result = PathOps.getIn( obj, [ 'main', 'seo', 'social' ] );
      expect( result ).toEqual( {} );
      expect( obj.main.seo ).toBeDefined();
      expect( obj.main.seo.social ).toBeDefined();
    } );
  } );

  describe( 'setIn', () => {
    it( 'sets nested value immutably', () => {
      const obj = { main: { seo: {} } };
      const result = PathOps.setIn( obj, [ 'main', 'seo', 'title' ], 'Page' );
      expect( result.main.seo.title ).toBe( 'Page' );
      // Verify immutability
      expect( obj.main.seo.title ).toBeUndefined();
    } );
  } );
} );

describe( 'ValueOps', () => {
  let element;

  beforeEach( () => {
    element = document.createElement( 'div' );
  } );

  describe( 'getName', () => {
    it( 'gets name from input element', () => {
      element.innerHTML = `
        <div class="object-name">
          <input value="test-name" />
        </div>
      `;
      expect( ValueOps.getName( element ) ).toBe( 'test-name' );
    } );

    it( 'gets name from text element', () => {
      element.innerHTML = `
        <span class="label-text">test-label</span>
      `;
      expect( ValueOps.getName( element ) ).toBe( 'test-label' );
    } );

    it( 'handles missing elements', () => {
      expect( ValueOps.getName( element ) ).toBe( '' );
    } );
  } );

  describe( 'getValue', () => {
    it( 'converts number input', () => {
      element.innerHTML = `
        <input class="element-value" type="number" value="42" />
      `;
      expect( ValueOps.getValue( element ) ).toBe( 42 );
    } );

    it( 'handles checkbox input', () => {
      element.innerHTML = `
        <input class="element-value" type="checkbox" checked />
      `;
      expect( ValueOps.getValue( element ) ).toBe( true );
    } );

    it( 'handles date input', () => {
      const dateStr = '2024-01-01';
      element.innerHTML = `
        <input class="element-value" type="date" value="${ dateStr }" />
      `;
      expect( ValueOps.getValue( element ) ).toEqual( new Date( dateStr ) );
    } );

    it( 'returns empty string for missing input', () => {
      expect( ValueOps.getValue( element ) ).toBe( '' );
    } );
  } );

  describe( 'getKeyValue', () => {
    let element;

    beforeEach( () => {
      element = document.createElement( 'div' );
    } );

    it( 'gets key-value from input element', () => {
      element.innerHTML = `
        <input class="element-label" value="title" />
        <input class="element-value" value="My Page" />
      `;
      expect( ValueOps.getKeyValue( element ) ).toEqual( {
        key: 'title',
        value: 'My Page'
      } );
    } );

    it( 'gets key-value from text element', () => {
      element.innerHTML = `
        <span class="label-text">title</span>
        <input class="element-value" value="My Page" />
      `;
      expect( ValueOps.getKeyValue( element ) ).toEqual( {
        key: 'title',
        value: 'My Page'
      } );
    } );

    it( 'handles missing input and text elements', () => {
      // Neither input nor text element present
      expect( ValueOps.getKeyValue( element ) ).toEqual( {
        key: '',
        value: ''
      } );
    } );
  } );
} );

describe( 'FormStateOps', () => {
  describe( 'createState', () => {
    it( 'creates initial state', () => {
      const state = FormStateOps.createState();
      expect( state ).toEqual( {
        path: [ 'main' ],
        result: { main: {} }
      } );
    } );
  } );

  describe( 'handleStructural', () => {
    it( 'adds new path level', () => {
      const element = document.createElement( 'div' );
      element.innerHTML = '<div class="object-name"><input value="seo" /></div>';

      const state = FormStateOps.createState();
      const newState = FormStateOps.handleStructural( state, element );

      expect( newState.path ).toEqual( [ 'main', 'seo' ] );
      expect( newState ).not.toBe( state ); // Verify immutability
    } );
  } );

  describe( 'handleArrayConversion', () => {
    it( 'converts object to array', () => {
      const state = {
        path: [ 'main', 'sections' ],
        result: {
          main: {
            sections: {
              '0': { title: 'Section 1' },
              '1': { content: 'Text' }
            }
          }
        }
      };

      const newState = FormStateOps.handleArrayConversion( state );
      expect( Array.isArray( newState.result.main.sections ) ).toBe( true );
      expect( newState.path ).toEqual( [ 'main' ] );
      expect( newState.result.main.sections ).toEqual( [
        { title: 'Section 1' },
        { content: 'Text' }
      ] );
    } );
  } );

  describe( 'handleValue', () => {
    it( 'handles list elements', () => {
      const element = document.createElement( 'div' );
      element.classList.add( 'is-list' );
      // Add required DOM structure for list element with inputs in list items
      element.innerHTML = `
        <div class="object-name">
          <span class="label-text">listItem</span>
        </div>
        <ul>
          <li><input type="text" value="item1" /></li>
          <li><input type="text" value="item2" /></li>
        </ul>
      `;

      const initialState = {
        path: [ 'main', 'section' ],
        result: { main: { section: {} } }
      };

      const newState = FormStateOps.handleValue( initialState, element );

      // Check that the state was updated with list values
      expect( newState.path ).toEqual( [ 'main', 'section' ] );
      expect( newState.result.main.section ).toBeDefined();
    } );

    it( 'preserves existing values when handling lists', () => {
      const element = document.createElement( 'div' );
      element.classList.add( 'is-list' );
      // Add required DOM structure for list element with inputs in list items
      element.innerHTML = `
        <div class="object-name">
          <span class="label-text">listItem</span>
        </div>
        <ul>
          <li><input type="text" value="item1" /></li>
          <li><input type="text" value="item2" /></li>
        </ul>
      `;

      const initialState = {
        path: [ 'main', 'section' ],
        result: {
          main: {
            section: {
              existingKey: 'existingValue'
            }
          }
        }
      };

      const newState = FormStateOps.handleValue( initialState, element );

      // Check that existing values are preserved and list values are added
      expect( newState.path ).toEqual( [ 'main', 'section' ] );
      expect( newState.result.main.section.existingKey ).toBe( 'existingValue' );
      expect( newState.result.main.section.listItem ).toBeDefined();
      expect( Array.isArray( newState.result.main.section.listItem ) ).toBe( true );
      expect( newState.result.main.section.listItem ).toContain( 'item1' );
      expect( newState.result.main.section.listItem ).toContain( 'item2' );
    } );
  } );
} );

describe( 'transformFormElementsToObject', () => {
  it( 'transforms simple object structure', () => {
    // Create a more complete DOM structure
    document.body.innerHTML = `
      <div class="form-container">
        <div class="is-object">
          <div class="object-name">
            <input value="seo" />
          </div>
        </div>
        <div class="form-element">
          <span class="label-text">title</span>
          <input class="element-value" type="text" value="My Page" />
        </div>
        <div class="is-last"></div>
      </div>
    `;

    const elements = document.querySelectorAll( '.form-container > div' );
    const result = transformFormElementsToObject( elements );

    expect( result ).toEqual( {
      seo: {
        title: 'My Page'
      }
    } );
  } );

  // Add a test for array structure
  it( 'transforms array structure', () => {
    document.body.innerHTML = `
      <div class="form-container">
        <div class="is-array">
          <div class="object-name">
            <input value="sections" />
          </div>
        </div>
        <div class="form-element">
          <span class="label-text">title</span>
          <input class="element-value" type="text" value="Section 1" />
        </div>
        <div class="form-element">
          <span class="label-text">content</span>
          <input class="element-value" type="text" value="Content 1" />
        </div>
        <div class="is-last array-last"></div>
      </div>
    `;

    const elements = document.querySelectorAll( '.form-container > div' );
    const result = transformFormElementsToObject( elements );

    expect( result ).toEqual( {
      sections: [
        { title: 'Section 1' },
        { content: 'Content 1' }
      ]
    } );
  } );
} );