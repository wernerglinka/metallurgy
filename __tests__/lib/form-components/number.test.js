// __tests__/lib/formComponents/number.test.js
import number from '../../../screens/lib/formComponents/number.js';

describe( 'number component', () => {
  let container;

  beforeEach( () => {
    container = document.createElement( 'div' );
    container.classList.add( 'form-element' );
  } );

  it( 'creates number component with editable label', () => {
    const result = number( container, false );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( false );
  } );

  it( 'creates number component with readonly label', () => {
    const result = number( container, true );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( true );
  } );

  it( 'creates number input with correct attributes', () => {
    const result = number( container, false );
    const input = result.querySelector( 'input[type="number"]' );
    expect( input ).toBeTruthy();
    expect( input.classList.contains( 'element-value' ) ).toBe( true );
    expect( input.getAttribute( 'placeholder' ) ).toBe( 'Number Placeholder' );
  } );

  it( 'includes hint text', () => {
    const result = number( container, false );
    expect( result.querySelector( '.hint' ).textContent ).toBe( 'Number for Number element' );
  } );

  it( 'has required indicator', () => {
    const result = number( container, false );
    expect( result.querySelector( 'sup' ).textContent ).toBe( '*' );
  } );

  it( 'maintains proper component structure', () => {
    const result = number( container, false );
    expect( result.querySelector( '.label-wrapper' ) ).toBeTruthy();
    expect( result.querySelector( '.content-wrapper' ) ).toBeTruthy();
  } );
} );