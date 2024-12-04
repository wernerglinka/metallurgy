// __tests__/lib/formComponents/text.test.js
import text from '../../../screens/lib/formComponents/text.js';

describe( 'text component', () => {
  let container;

  beforeEach( () => {
    container = document.createElement( 'div' );
    container.classList.add( 'form-element' );
  } );

  it( 'creates text component with editable label', () => {
    const result = text( container, false );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( false );
  } );

  it( 'creates text component with readonly label', () => {
    const result = text( container, true );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( true );
  } );

  it( 'creates text input with correct attributes', () => {
    const result = text( container, false );
    const input = result.querySelector( '.element-value' );
    expect( input ).toBeTruthy();
    expect( input.type ).toBe( 'text' );
    expect( input.classList.contains( 'element-value' ) ).toBe( true );
    expect( input.getAttribute( 'placeholder' ) ).toBe( 'Text Placeholder' );
  } );

  it( 'includes hint text', () => {
    const result = text( container, false );
    expect( result.querySelector( '.hint' ).textContent ).toBe( 'Text for Text element' );
  } );

  it( 'has required indicator', () => {
    const result = text( container, false );
    expect( result.querySelector( 'sup' ).textContent ).toBe( '*' );
  } );

  it( 'maintains proper component structure', () => {
    const result = text( container, false );
    const labelWrapper = result.querySelector( '.label-wrapper' );
    const contentWrapper = result.querySelector( '.content-wrapper' );

    expect( labelWrapper ).toBeTruthy();
    expect( contentWrapper ).toBeTruthy();
    expect( labelWrapper.querySelector( 'input[type="text"]' ) ).toBeTruthy();
    expect( contentWrapper.querySelector( 'input[type="text"]' ) ).toBeTruthy();
  } );
} );