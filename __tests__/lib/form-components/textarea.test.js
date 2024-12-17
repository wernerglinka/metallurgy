// __tests__/lib/baseFields/textarea.test.js
import textarea from '../../../screens/lib/baseFields/textarea.js';

describe( 'textarea component', () => {
  let container;

  beforeEach( () => {
    container = document.createElement( 'div' );
    container.classList.add( 'form-element' );
  } );

  it( 'creates textarea component with editable label', () => {
    const result = textarea( container, false );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( false );
  } );

  it( 'creates textarea component with readonly label', () => {
    const result = textarea( container, true );
    expect( result.querySelector( '.element-label' ).readOnly ).toBe( true );
  } );

  it( 'creates textarea with correct attributes', () => {
    const result = textarea( container, false );
    const textareaElement = result.querySelector( 'textarea' );
    expect( textareaElement ).toBeTruthy();
    expect( textareaElement.classList.contains( 'element-value' ) ).toBe( true );
    expect( textareaElement.classList.contains( 'is-editor' ) ).toBe( true );
    expect( textareaElement.getAttribute( 'placeholder' ) ).toBe( 'Click to open editor' );
  } );

  it( 'includes hint text', () => {
    const result = textarea( container, false );
    expect( result.querySelector( '.hint' ).textContent ).toBe( 'Text for Textarea element' );
  } );

  it( 'has required indicator', () => {
    const result = textarea( container, false );
    expect( result.querySelector( 'sup' ).textContent ).toBe( '*' );
  } );

  it( 'maintains proper component structure', () => {
    const result = textarea( container, false );
    const labelWrapper = result.querySelector( '.label-wrapper' );
    const contentWrapper = result.querySelector( '.content-wrapper' );

    expect( labelWrapper ).toBeTruthy();
    expect( contentWrapper ).toBeTruthy();
    expect( labelWrapper.querySelector( 'input[type="text"]' ) ).toBeTruthy();
    expect( contentWrapper.querySelector( 'textarea' ) ).toBeTruthy();
  } );
} );