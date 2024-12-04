// __tests__/lib/formComponents/object.test.js
import object from '../../../screens/lib/formComponents/object.js';
import { ICONS } from '../../../screens/icons/index.js';

describe( 'object component', () => {
  let container;

  beforeEach( () => {
    container = document.createElement( 'div' );
    container.classList.add( 'form-element', 'is-object' );
  } );

  it( 'creates object component with editable label', () => {
    const result = object( container, false );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( false );
  } );

  it( 'creates object component with readonly label', () => {
    const result = object( container, true );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( true );
  } );

  it( 'creates object dropzone', () => {
    const result = object( container, false );
    const dropzone = result.querySelector( '.object-dropzone' );
    expect( dropzone.classList.contains( 'js-dropzone' ) ).toBe( true );
    expect( dropzone.dataset.wrapper ).toBe( 'is-object' );
  } );

  it( 'includes correct collapse icons', () => {
    const result = object( container, false );
    const iconContainer = result.querySelector( '.collapse-icon' );

    // Remove whitespace for comparison
    const normalizedHtml = iconContainer.innerHTML.replace( /\s+/g, '' );
    const expectedIcons = ( ICONS.COLLAPSE + ICONS.COLLAPSED ).replace( /\s+/g, '' );

    expect( normalizedHtml ).toBe( expectedIcons );
  } );

  it( 'includes hint text', () => {
    const result = object( container, false );
    expect( result.querySelector( '.hint' ).textContent ).toBe( 'Sections Object' );
  } );
} );