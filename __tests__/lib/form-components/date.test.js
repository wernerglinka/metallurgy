// __tests__/lib/baseFields/date.test.js
import date from '../../../screens/lib/baseFields/date.js';

describe( 'date component', () => {
  let container;

  beforeEach( () => {
    container = document.createElement( 'div' );
    container.classList.add( 'form-element' );
  } );

  it( 'creates date with editable label', () => {
    const result = date( container, false );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( false );
  } );

  it( 'creates date with readonly label', () => {
    const result = date( container, true );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( true );
  } );

  it( 'creates date input with correct attributes', () => {
    const result = date( container, false );
    const input = result.querySelector( 'input[type="date"]' );
    expect( input ).toBeTruthy();
    expect( input.classList.contains( 'element-value' ) ).toBe( true );
  } );

  it( 'includes hint text', () => {
    const result = date( container, false );
    expect( result.querySelector( '.hint' ).textContent ).toBe( 'Date for date element' );
  } );

  it( 'has required indicator', () => {
    const result = date( container, false );
    expect( result.querySelector( 'sup' ).textContent ).toBe( '*' );
  } );

  it( 'maintains proper structure', () => {
    const result = date( container, false );
    expect( result.querySelector( '.label-wrapper' ) ).toBeTruthy();
    expect( result.querySelector( '.content-wrapper' ) ).toBeTruthy();
  } );
} );