// __tests__/lib/form-building/form-builder.test.js

import { jest } from '@jest/globals';
import { createFormFragment, renderToDropzone } from '../../../screens/lib/form-generation/form/form-builder.js';
import { ICONS } from '../../../screens/icons/index.js';

// Mock validation functions
global.isValidLabel = jest.fn( value => /^[a-zA-Z0-9]+$/.test( value ) );
global.showErrorMessage = jest.fn();
global.removeErrorMessage = jest.fn();

// Mock EasyMDE with proper toolbar setup
global.EasyMDE = jest.fn().mockImplementation( () => ( {
  value: jest.fn().mockReturnValue( 'test content' )
} ) );

describe( 'Form Builder', () => {
  beforeEach( () => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  } );

  describe( 'createFormFragment', () => {
    it( 'creates form elements from fields', () => {
      const fields = [
        {
          type: 'text',
          label: 'First Field',
          value: 'Value 1'
        },
        {
          type: 'number',
          label: 'Second Field',
          value: 42
        }
      ];

      const fragment = createFormFragment( fields, [] );
      const elements = Array.from( fragment.children );

      // Verify we got the right number of elements
      expect( elements ).toHaveLength( 2 );

      // Verify basic structure
      elements.forEach( element => {
        expect( element.classList.contains( 'form-element' ) ).toBe( true );
        expect( element.querySelector( '.element-label, .object-name input' ) ).toBeTruthy();
      } );

      // Verify first element (text)
      const firstLabel = elements[ 0 ].querySelector( '.element-label' );
      expect( firstLabel ).toBeTruthy();
      expect( firstLabel.value ).toBe( 'First Field' );

      // Verify second element (number)
      const secondLabel = elements[ 1 ].querySelector( '.element-label' );
      expect( secondLabel ).toBeTruthy();
      expect( secondLabel.value ).toBe( 'Second Field' );
    } );

    it( 'handles empty fields array', () => {
      const fragment = createFormFragment( [], [] );
      expect( fragment.children ).toHaveLength( 0 );
    } );

    it( 'processes fields with explicit schema', () => {
      const fields = [ {
        type: 'text',
        label: 'Schema Field',
        value: 'Test Value'
      } ];

      const explicitSchema = [ {
        name: 'Schema Field',
        type: 'text',
        addDeleteButton: true,
        addDuplicateButton: true
      } ];

      const fragment = createFormFragment( fields, explicitSchema );
      const elements = Array.from( fragment.children );

      // Verify basic structure
      expect( elements ).toHaveLength( 1 );
      const element = elements[ 0 ];
      expect( element.classList.contains( 'form-element' ) ).toBe( true );

      // Verify label
      const label = element.querySelector( '.element-label' );
      expect( label ).toBeTruthy();
      expect( label.value ).toBe( 'Schema Field' );

      // Verify value input
      const valueInput = element.querySelector( '.element-value' );
      expect( valueInput ).toBeTruthy();

      // Verify buttons based on schema
      expect( element.querySelector( '.delete-button' ) ).toBeTruthy();
      expect( element.querySelector( '.add-button' ) ).toBeTruthy();
    } );

    it( 'creates nested fields correctly', () => {
      const fields = [ {
        type: 'object',
        label: 'Parent',
        value: [
          { type: 'text', label: 'Child', value: 'Child Value' }
        ]
      } ];

      const fragment = createFormFragment( fields, [] );
      const elements = Array.from( fragment.children );

      expect( elements ).toHaveLength( 1 );
      const parentElement = elements[ 0 ];
      expect( parentElement.classList.contains( 'is-object' ) ).toBe( true );

      // Verify object name
      const objectName = parentElement.querySelector( '.object-name input' );
      expect( objectName ).toBeTruthy();
      expect( objectName.value ).toBe( 'Parent' );
    } );
  } );

  describe( 'renderToDropzone', () => {
    it( 'renders fragment to dropzone', () => {
      const dropzone = document.createElement( 'div' );
      dropzone.id = 'dropzone';
      document.body.appendChild( dropzone );

      const fragment = document.createDocumentFragment();
      const element = document.createElement( 'div' );
      element.textContent = 'Test Element';
      fragment.appendChild( element );

      renderToDropzone( fragment );

      expect( dropzone.children ).toHaveLength( 1 );
      expect( dropzone.firstChild.textContent ).toBe( 'Test Element' );
    } );

    it( 'throws error when dropzone not found', () => {
      const fragment = document.createDocumentFragment();

      expect( () => {
        renderToDropzone( fragment );
      } ).toThrow( 'Dropzone element not found' );
    } );

    it( 'handles empty fragment', () => {
      const dropzone = document.createElement( 'div' );
      dropzone.id = 'dropzone';
      document.body.appendChild( dropzone );

      const fragment = document.createDocumentFragment();
      renderToDropzone( fragment );

      expect( dropzone.children ).toHaveLength( 0 );
    } );
  } );
} );