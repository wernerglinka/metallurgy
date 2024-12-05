// __tests__/lib/form-reading/preprocess-form-data.test.js
import { jest } from '@jest/globals';
import { preprocessFormData } from '../../../screens/lib/preprocess-form-data.js';

describe( 'preprocessFormData', () => {
  beforeEach( () => {
    document.body.innerHTML = `
      <form id="main-form">
        <div class="js-dropzone">
          <div class="form-element">
            <input class="element-label" value="title">
            <input class="element-value" value="Test Page">
          </div>
        </div>
      </form>
    `;
  } );

  afterEach( () => {
    document.body.innerHTML = '';
  } );

  it( 'should handle mixed arrays and objects', () => {
    document.body.innerHTML = `
      <form id="main-form">
        <div class="js-dropzone">
          <div class="form-element is-object">
            <div class="object-name">
              <input value="page">
            </div>
            <div class="form-element is-object">
              <div class="object-name">
                <input value="sections">
              </div>
              <div class="form-element">
                <input class="element-label" value="text">
                <input class="element-value" value="Section 1 content">
              </div>
            </div>
          </div>
        </div>
      </form>
    `;

    const result = preprocessFormData();

    expect( result ).toEqual( {
      page: {
        sections: {
          text: 'Section 1 content'
        }
      }
    } );
  } );

  it( 'should handle malformed form structure gracefully', () => {
    document.body.innerHTML = `
      <form id="main-form">
        <div class="js-dropzone">
          <div class="form-element">
            <input class="element-label" value="noValue">
            <input class="element-value" value="">
          </div>
          <div class="form-element">
            <span class="label-text">altLabel</span>
            <input class="element-value" value="value">
          </div>
        </div>
      </form>
    `;

    const result = preprocessFormData();

    expect( result ).toEqual( {
      noValue: '',
      altLabel: 'value'
    } );
  } );

  it( 'should handle array dropzones with nested elements', () => {
    document.body.innerHTML = `
      <form id="main-form">
        <div class="js-dropzone array-dropzone">
          <div class="form-element is-array">
            <div class="object-name">
              <input value="items">
            </div>
            <div class="form-element">
              <input class="element-label" value="name">
              <input class="element-value" value="Item 2">
            </div>
          </div>
        </div>
      </form>
    `;

    const result = preprocessFormData();

    expect( result ).toEqual( {
      items: [
        { name: 'Item 2' }
      ]
    } );
  } );

  it( 'should handle different input types correctly', () => {
    document.body.innerHTML = `
      <form id="main-form">
        <div class="js-dropzone">
          <div class="form-element">
            <input class="element-label" value="isActive">
            <input class="element-value" type="checkbox" checked>
          </div>
          <div class="form-element">
            <input class="element-label" value="count">
            <input class="element-value" type="number" value="42">
          </div>
          <div class="form-element">
            <input class="element-label" value="date">
            <input class="element-value" type="date" value="2024-01-01">
          </div>
        </div>
      </form>
    `;

    const result = preprocessFormData();

    expect( result ).toEqual( {
      isActive: true,
      count: 42,
      date: new Date( '2024-01-01' )
    } );
  } );

  it( 'should handle empty dropzones without errors', () => {
    document.body.innerHTML = `
      <form id="main-form">
        <div class="js-dropzone"></div>
      </form>
    `;

    const result = preprocessFormData();

    expect( result ).toEqual( {} );
  } );

  it( 'should handle nested dropzones with mixed content', () => {
    document.body.innerHTML = `
      <form id="main-form">
        <div class="js-dropzone">
          <div class="form-element is-object">
            <div class="object-name">
              <input value="metadata">
            </div>
            <div class="js-dropzone array-dropzone">
              <div class="form-element is-array">
                <div class="object-name">
                  <input value="tags">
                </div>
                <div class="form-element">
                  <input class="element-label" value="name">
                  <input class="element-value" value="tag1">
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    `;

    const result = preprocessFormData();

    expect( result ).toEqual( {
      metadata: {
        tags: [
          { name: 'tag1' }
        ]
      }
    } );
  } );
} );