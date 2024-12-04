// __tests__/lib/preprocess-form-data.test.js
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
} );