// __tests__/lib/formComponents/checkbox.test.js
import checkbox from '../../../screens/lib/formComponents/checkbox.js';

describe( 'checkbox component', () => {
  let container;

  beforeEach( () => {
    container = document.createElement( 'div' );
    container.classList.add( 'form-element' );
  } );

  it( 'creates checkbox with editable label', () => {
    const result = checkbox( container, false );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( false );
  } );

  it( 'creates checkbox with readonly label', () => {
    const result = checkbox( container, true );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( true );
  } );

  it( 'creates checkbox input with correct attributes', () => {
    const result = checkbox( container, false );
    const input = result.querySelector( 'input[type="checkbox"]' );
    expect( input.classList.contains( 'element-value' ) ).toBe( true );
    expect( input.getAttribute( 'role' ) ).toBe( 'switch' );
    expect( input.value ).toBe( 'false' );
  } );

  it( 'includes hint text', () => {
    const result = checkbox( container, false );
    expect( result.querySelector( '.hint' ).textContent ).toBe( 'Initial state of checkbox' );
  } );

  it( 'has required indicator', () => {
    const result = checkbox( container, false );
    expect( result.querySelector( 'sup' ).textContent ).toBe( '*' );
  } );
} );