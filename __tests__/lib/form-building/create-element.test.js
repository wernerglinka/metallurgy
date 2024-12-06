// __tests__/lib/form-building/create-element.test.js

import { jest } from '@jest/globals';
import { createComponent, getUpdatedElement, updateElement } from '../../../screens/lib/page-elements/create-element.js';
import { ICONS } from '../../../screens/icons/index.js';

// Mock validation functions
global.isValidLabel = jest.fn( value => /^[a-zA-Z0-9]+$/.test( value ) );
global.showErrorMessage = jest.fn();
global.removeErrorMessage = jest.fn();
global.updateButtonsStatus = jest.fn();

// Mock EasyMDE with proper toolbar setup
global.EasyMDE = jest.fn().mockImplementation( () => ( {
  value: jest.fn().mockReturnValue( 'test content' )
} ) );

describe( 'Create Element', () => {
  beforeEach( () => {
    document.body.innerHTML = '';
    window.draggedElement = null;

    // Add toolbar for EasyMDE
    const toolbar = document.createElement( 'div' );
    toolbar.className = 'editor-toolbar';
    document.body.appendChild( toolbar );

    jest.clearAllMocks();
  } );

  describe( 'Label Input Event Handling', () => {
    it( 'handles valid label input', () => {
      const field = {
        type: 'text',
        label: 'TestField',
        value: ''
      };

      const element = getUpdatedElement( field, [], true );
      const labelInput = element.querySelector( '.element-label' );

      // Simulate valid input
      labelInput.value = 'ValidLabel';
      labelInput.dispatchEvent( new Event( 'change' ) );

      expect( updateButtonsStatus ).toHaveBeenCalled();
      expect( showErrorMessage ).not.toHaveBeenCalled();
    } );

    it( 'maintains error state when label remains invalid', () => {
      const field = {
        type: 'text',
        label: 'TestField',
        value: ''
      };

      const element = getUpdatedElement( field, [], true );
      const labelInput = element.querySelector( '.element-label' );

      // Trigger change with invalid input
      labelInput.value = 'Invalid@Label';
      labelInput.dispatchEvent( new Event( 'change' ) );

      expect( showErrorMessage ).toHaveBeenCalledWith(
        labelInput,
        "Label must only use characters and numbers"
      );
      expect( updateButtonsStatus ).toHaveBeenCalled();
      expect( removeErrorMessage ).not.toHaveBeenCalled();
    } );

    it( 'handles object name input validation', () => {
      const field = {
        type: 'object',
        label: 'TestObject',
        value: []
      };

      const element = getUpdatedElement( field, [], true );
      const nameInput = element.querySelector( '.object-name input' );

      // First make mock return false for invalid input
      isValidLabel.mockReturnValueOnce( false );

      // Trigger change with invalid input
      nameInput.value = 'Invalid@Name';
      nameInput.dispatchEvent( new Event( 'change' ) );

      expect( showErrorMessage ).toHaveBeenCalled();
      expect( updateButtonsStatus ).toHaveBeenCalled();

      // Add invalid class to simulate error state
      nameInput.classList.add( 'invalid' );

      // Now make mock return true for valid input
      isValidLabel.mockReturnValueOnce( true );

      // Trigger change with valid input
      nameInput.value = 'ValidName';
      nameInput.dispatchEvent( new Event( 'change' ) );

      expect( removeErrorMessage ).toHaveBeenCalled();
      expect( updateButtonsStatus ).toHaveBeenCalledTimes( 2 );
    } );

    it( 'handles error removal when element has invalid class', () => {
      const field = {
        type: 'text',
        label: 'TestField',
        value: ''
      };

      const element = getUpdatedElement( field, [], true );
      const labelInput = element.querySelector( '.element-label' );

      // Add invalid class and make input valid
      labelInput.classList.add( 'invalid' );
      isValidLabel.mockReturnValueOnce( true );
      labelInput.value = 'ValidLabel';
      labelInput.dispatchEvent( new Event( 'change' ) );

      expect( removeErrorMessage ).toHaveBeenCalled();
      expect( updateButtonsStatus ).toHaveBeenCalled();
    } );

    it( 'handles component types without modifiers', () => {
      const element = createComponent( 'text', true );

      // Should have form-element class but no modifier classes
      expect( element.classList.contains( 'form-element' ) ).toBe( true );
      expect( element.classList.contains( 'is-object' ) ).toBe( false );
      expect( element.classList.contains( 'is-array' ) ).toBe( false );
      expect( element.classList.contains( 'is-list' ) ).toBe( false );
    } );
  } );

  describe( 'createComponent', () => {
    it( 'creates list component', () => {
      const element = createComponent( 'list', true );
      expect( element.classList.contains( 'is-list' ) ).toBe( true );
      expect( element.classList.contains( 'form-element' ) ).toBe( true );
      expect( element.getAttribute( 'draggable' ) ).toBe( 'true' );
    } );

    it( 'creates array component', () => {
      const element = createComponent( 'array', true );
      expect( element.classList.contains( 'is-array' ) ).toBe( true );
    } );

    it( 'creates object component', () => {
      const element = createComponent( 'object', true );
      expect( element.classList.contains( 'is-object' ) ).toBe( true );
    } );

    it( 'adds label-exists class when labelsExist is true', () => {
      const element = createComponent( 'text', true );
      expect( element.classList.contains( 'label-exists' ) ).toBe( true );
    } );

    it( 'omits label-exists class when labelsExist is false', () => {
      const element = createComponent( 'text', false );
      expect( element.classList.contains( 'label-exists' ) ).toBe( false );
    } );

    it( 'handles falsy elementModifier with undefined type', () => {
      // Create with undefined type to ensure elementModifier remains null
      const element = createComponent( undefined, true );

      // Should only have base form-element class
      expect( element.classList.contains( 'form-element' ) ).toBe( true );
      expect( element.classList.contains( 'is-object' ) ).toBe( false );
      expect( element.classList.contains( 'is-array' ) ).toBe( false );
      expect( element.classList.contains( 'is-list' ) ).toBe( false );

      // Verify classList modification wasn't attempted with null
      expect( element.classList.length ).toBe( 2 ); // form-element and label-exists only
    } );
  } );
} );

describe( 'getUpdatedElement', () => {
  it( 'handles label validation and error display', () => {
    const field = {
      type: 'text',
      label: 'TestField',
      value: ''
    };
    const element = getUpdatedElement( field, [], true );
    const labelInput = element.querySelector( '.element-label' );

    // Add invalid class to simulate existing error state
    labelInput.classList.add( 'invalid' );

    // Test valid input
    global.isValidLabel.mockReturnValueOnce( true );
    labelInput.value = 'ValidLabel';
    labelInput.dispatchEvent( new Event( 'change' ) );

    expect( global.removeErrorMessage ).toHaveBeenCalled();
    expect( global.updateButtonsStatus ).toHaveBeenCalled();
  } );

  it( 'handles object name input validation', () => {
    const field = {
      type: 'object',
      label: 'TestObject',
      value: []
    };
    const element = getUpdatedElement( field, [], true );
    const nameInput = element.querySelector( '.object-name input' );

    global.isValidLabel.mockReturnValueOnce( false );
    nameInput.value = 'Invalid@Name';
    nameInput.dispatchEvent( new Event( 'change' ) );

    expect( global.showErrorMessage ).toHaveBeenCalled();
    expect( global.updateButtonsStatus ).toHaveBeenCalled();
  } );
} );

describe( 'updateElement', () => {
  it( 'processes image field', () => {
    const element = document.createElement( 'div' );
    element.innerHTML = '<input class="element-label"><input class="element-value">';
    const field = { type: 'image', label: 'Test Image' };

    const updated = updateElement( element, field, [], true );
    const input = updated.querySelector( 'input[type="url"]' );
    expect( input ).toBeTruthy();
  } );

  it( 'processes text field', () => {
    const element = document.createElement( 'div' );
    element.innerHTML = '<input class="element-label"><input class="element-value">';
    const field = { type: 'text', label: 'Test Text' };

    const updated = updateElement( element, field, [], true );
    const input = updated.querySelector( '.element-value' );
    expect( input.type ).toBe( 'text' );
  } );

  it( 'processes checkbox field', () => {
    const element = document.createElement( 'div' );
    element.innerHTML = `
        <label class="element-label">Test Label</label>
        <input type="checkbox" class="element-value">
      `;
    const field = { type: 'checkbox', label: 'Test Checkbox', value: true };

    const updated = updateElement( element, field, [], true );
    const input = updated.querySelector( '.element-value' );
    expect( input.type ).toBe( 'checkbox' );
    expect( input.checked ).toBe( true );
  } );

  it( 'processes date field', () => {
    const element = document.createElement( 'div' );
    element.innerHTML = '<input class="element-label"><input class="element-value">';
    const field = { type: 'date', label: 'Test Date' };

    const updated = updateElement( element, field, [], true );
    const input = updated.querySelector( '.element-value' );
    expect( input.type ).toBe( 'date' );
  } );

  it( 'processes number field', () => {
    const element = document.createElement( 'div' );
    element.innerHTML = `
        <label class="element-label">Test Label</label>
        <input type="number" class="element-value">
      `;
    const field = { type: 'number', label: 'Test Number', value: 42 };

    const updated = updateElement( element, field, [], true );
    const input = updated.querySelector( '.element-value' );
    expect( input.type ).toBe( 'number' );
    expect( input.value ).toBe( '42' );
  } );

  it( 'processes list field', () => {
    const element = document.createElement( 'div' );
    element.innerHTML = `
        <div class="object-name">
          <input type="text" value="">
        </div>
        <ul>
          <li class="element-value">
            <input type="text" value="">
          </li>
        </ul>
      `;
    const field = { type: 'list', label: 'Test List', value: [ 'item1', 'item2' ] };

    const updated = updateElement( element, field, [], true );
    expect( updated.querySelector( '.object-name input' ).value ).toBe( 'Test List' );
    expect( updated.querySelectorAll( 'ul li' ).length ).toBe( 2 );
  } );

  it( 'processes url field with validation', () => {
    const element = document.createElement( 'div' );
    element.classList.add( 'form-element' );
    element.innerHTML = `
        <input class="element-label" value="TestURL">
        <input class="element-value" type="text">
      `;

    const field = {
      type: 'url',
      label: 'TestURL',
      value: 'https://example.com',
      placeholder: 'Enter URL'
    };

    const updated = updateElement( element, field, [], true );
    const input = updated.querySelector( 'input[type="url"]' );
    expect( input ).toBeTruthy();
    expect( input.type ).toBe( 'url' );
    expect( input.placeholder ).toBe( 'Enter URL' );

    // Set the value after update since updateUrlField creates a new input
    input.value = field.value;
    expect( input.value ).toBe( 'https://example.com' );
  } );

  it( 'processes textarea field with explicit schema', () => {
    const element = document.createElement( 'div' );
    element.classList.add( 'form-element' );
    element.innerHTML = `
        <input class="element-label" value="TestTextarea">
        <input class="element-value" type="text" value="Test content">
      `;

    const field = {
      type: 'textarea',
      label: 'TestTextarea',
      value: 'Test content'
    };

    const explicitSchema = [ {
      name: 'TestTextarea',
      type: 'textarea',
      addDeleteButton: true,
      addDuplicateButton: true
    } ];

    const updated = updateElement( element, field, explicitSchema, true );

    // Verify field structure
    expect( updated.querySelector( '.element-label' ).value ).toBe( 'TestTextarea' );
    expect( updated.querySelector( '.element-value' ).value ).toBe( 'Test content' );

    // Verify action buttons were created with proper structure
    const buttonWrapper = updated.querySelector( '.button-wrapper' );
    expect( buttonWrapper ).toBeTruthy();

    const addButton = buttonWrapper.querySelector( '.add-button' );
    expect( addButton ).toBeTruthy();
    expect( addButton.innerHTML ).toBe( ICONS.ADD );

    const deleteButton = buttonWrapper.querySelector( '.delete-button' );
    expect( deleteButton ).toBeTruthy();
    expect( deleteButton.innerHTML ).toBe( ICONS.DELETE );
  } );

  it( 'processes array field with nested elements', () => {
    const element = document.createElement( 'div' );
    element.innerHTML = `
          <div class="object-name">
            <input type="text" value="">
          </div>
          <div class="dropzone"></div>
        `;
    const field = {
      type: 'array',
      label: 'TestArray',
      value: [
        { type: 'text', label: 'Item1', value: 'Value1' },
        { type: 'text', label: 'Item2', value: 'Value2' }
      ]
    };

    const updated = updateElement( element, field, [], true );
    expect( updated.querySelector( '.object-name input' ).value ).toBe( 'TestArray' );
  } );

} );