// __tests__/lib/baseFields/array.test.js
import array from '../../../screens/lib/baseFields/array.js';
import { ICONS } from '../../../screens/icons/index.js';

describe( 'array component', () => {
  let container;

  beforeEach( () => {
    container = document.createElement( 'div' );
    container.classList.add( 'form-element', 'is-array' );
  } );

  it( 'creates array component with editable label', () => {
    const result = array( container, false );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( false );
  } );

  it( 'creates array component with readonly label', () => {
    const result = array( container, true );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( true );
  } );

  it( 'creates array dropzone', () => {
    const result = array( container, false );
    const dropzone = result.querySelector( '.array-dropzone' );
    expect( dropzone.classList.contains( 'js-dropzone' ) ).toBe( true );
    expect( dropzone.dataset.wrapper ).toBe( 'is-array' );
  } );

  it( 'includes both collapse icons', () => {
    const result = array( container, false );
    const iconContainer = result.querySelector( '.collapse-icon' );
    expect( iconContainer.children.length ).toBe( 2 );
    expect( iconContainer.querySelector( '.open' ) ).toBeTruthy();
    expect( iconContainer.querySelector( '.collapsed' ) ).toBeTruthy();
  } );

  it( 'includes correct collapse icons', () => {
    const result = array( container, false );
    const iconContainer = result.querySelector( '.collapse-icon' );

    // Remove whitespace for comparison
    const normalizedHtml = iconContainer.innerHTML.replace( /\s+/g, '' );
    const expectedIcons = ( ICONS.COLLAPSE + ICONS.COLLAPSED ).replace( /\s+/g, '' );

    expect( normalizedHtml ).toBe( expectedIcons );
  } );
} );