// __tests__/lib/form-submission.test.js
import { jest } from '@jest/globals';

describe( 'Form Submission', () => {
  beforeEach( () => {
    // Setup minimal DOM
    document.body.innerHTML = `
      <form id="main-form">
        <div class="js-dropzone">
          <div class="form-element">
            <input class="element-value" value="Test Page">
          </div>
        </div>
      </form>
    `;

    // Mock preprocessFormData
    window.preprocessFormData = jest.fn().mockReturnValue( {
      title: 'Test Page'
    } );
  } );

  afterEach( () => {
    document.body.innerHTML = '';
  } );

  test( 'submits form data correctly', async () => {
    const form = document.getElementById( 'main-form' );

    // Add submit handler (similar to render-edit-space.js)
    form.addEventListener( 'submit', async ( e ) => {
      e.preventDefault();
      const dropzoneValues = window.preprocessFormData();
      await window.electronAPI.files.writeYAML( {
        obj: dropzoneValues,
        path: 'test/path.md'
      } );
    } );

    // Submit form
    form.dispatchEvent( new Event( 'submit' ) );

    // Wait for async operations
    await new Promise( resolve => setTimeout( resolve, 0 ) );

    // Verify writeYAML was called correctly
    expect( window.electronAPI.files.writeYAML ).toHaveBeenCalledWith( {
      obj: { title: 'Test Page' },
      path: 'test/path.md'
    } );
  } );
} );