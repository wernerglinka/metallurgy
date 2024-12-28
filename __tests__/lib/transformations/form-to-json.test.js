import { describe, it, expect } from '@jest/globals';
import { transformFormElementsToObject } from '../../../screens/lib/form-submission/transform-form-to-object.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

const setupTest = async () => {
  const htmlContent = await fs.readFile( path.join( __dirname, './incoming.html' ), 'utf8' );
  const expectedContent = await fs.readFile( path.join( __dirname, './resulting-object.json' ), 'utf8' );
  return {
    html: htmlContent,
    expected: JSON.parse( expectedContent )
  };
};

const processForm = ( html ) => {
  document.body.innerHTML = html;
  const mainForm = document.getElementById( 'main-form' );
  if ( !mainForm ) return null;

  const allDropzones = mainForm.querySelectorAll( '.js-dropzone' );
  allDropzones.forEach( dropzone => {
    const dummyElement = document.createElement( 'div' );
    dummyElement.classList.add( 'form-element', 'is-last' );
    if ( dropzone.classList.contains( 'array-dropzone' ) ) {
      dummyElement.classList.add( 'array-last' );
    }
    dropzone.appendChild( dummyElement );
  } );

  const allFormElements = mainForm.querySelectorAll( '.form-element' );
  try {
    return transformFormElementsToObject( allFormElements );
  } catch ( error ) {
    console.error( 'Error in processForm:', error );
    return null;
  }
};

describe( 'Form Processing Tests', () => {
  let testData;

  beforeAll( async () => {
    testData = await setupTest();
  } );

  test( 'processes form into expected structure', () => {
    const result = processForm( testData.html );
    expect( result ).toEqual( testData.expected );
  } );

  test( 'handles nested objects correctly', () => {
    const result = processForm( testData.html );
    expect( result.seo ).toBeDefined();
    expect( typeof result.seo ).toBe( 'object' );
  } );

  test( 'handles arrays correctly', () => {
    const result = processForm( testData.html );
    expect( Array.isArray( result.sections ) ).toBe( true );
  } );
} );

describe( 'Form Processing Edge Cases', () => {
  let testData;

  beforeAll( async () => {
    testData = await setupTest();
  } );

  test( 'handles empty form', () => {
    document.body.innerHTML = testData.html;
    const mainForm = document.getElementById( 'main-form' );
    mainForm.innerHTML = '';
    const elements = mainForm.querySelectorAll( '.form-element' );
    const result = transformFormElementsToObject( elements );
    expect( result ).toEqual( {} );
  } );

  test( 'handles missing labels', () => {
    document.body.innerHTML = testData.html;
    const formElement = document.querySelector( '.form-element' );
    formElement.querySelector( '.label-wrapper' ).remove();
    const elements = document.querySelectorAll( '.form-element' );
    const result = transformFormElementsToObject( elements );
    expect( result ).toBeDefined();
  } );

  test( 'handles array items correctly', () => {
    document.body.innerHTML = testData.html;
    const arrayElement = document.querySelector( '.is-array' );
    const dropzone = arrayElement.querySelector( '.dropzone' );
    dropzone.innerHTML = `
      <div class="form-element">
        <label class="content-wrapper">
          <input class="element-value" value="test-item-1">
        </label>
      </div>
      <div class="form-element">
        <label class="content-wrapper">
          <input class="element-value" value="test-item-2">
        </label>
      </div>
    `;
    const elements = document.querySelectorAll( '.form-element' );
    const result = transformFormElementsToObject( elements );
    expect( result.simpleList ).toBeInstanceOf( Array );
  } );

  test( 'handles invalid HTML structure', () => {
    const result = processForm( '<div>Invalid form</div>' );
    expect( result ).toBeNull();
  } );
} );

export { transformFormElementsToObject, processForm };