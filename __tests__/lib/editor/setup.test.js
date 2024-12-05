// __tests__/lib/editor/setup.test.js
import { jest } from '@jest/globals';
import { initializeEditor } from '../../../screens/lib/editor/setup.js';
import { ICONS } from '../../../screens/icons/index.js';

// Mock EasyMDE
class MockEasyMDE {
  constructor( config ) {
    this.config = config;
    this.value = jest.fn().mockReturnValue( 'test content' );
  }
}

describe( 'Editor Setup', () => {
  let editor;

  beforeEach( () => {
    // Reset DOM
    document.body.innerHTML = '';

    // Create toolbar for editor controls
    const toolbar = document.createElement( 'div' );
    toolbar.classList.add( 'editor-toolbar' );
    document.body.appendChild( toolbar );

    // Create CodeMirror element
    const codeMirror = document.createElement( 'div' );
    codeMirror.classList.add( 'CodeMirror' );
    document.body.appendChild( codeMirror );

    // Setup window.textareaInput properly
    window.textareaInput = {
      value: ''
    };

    // Setup EasyMDE global
    global.EasyMDE = MockEasyMDE;
  } );

  afterEach( () => {
    document.body.innerHTML = '';
    delete window.textareaInput;
    jest.clearAllMocks();
  } );

  it( 'should initialize editor with correct configuration', () => {
    editor = initializeEditor();

    expect( editor ).toBeInstanceOf( MockEasyMDE );
    expect( editor.config.autoDownloadFontAwesome ).toBe( true );
    expect( document.getElementById( 'editorOverlay' ) ).toBeTruthy();
    expect( document.getElementById( 'editorWrapper' ) ).toBeTruthy();
  } );

  it( 'should create editor controls', () => {
    editor = initializeEditor();

    const styleToggle = document.getElementById( 'disableMarkdownStyles' );
    const closeButton = document.getElementById( 'closeEditor' );

    expect( styleToggle ).toBeTruthy();
    expect( styleToggle.innerHTML ).toBe( 'Inline Styles' );
    expect( closeButton ).toBeTruthy();
    expect( closeButton.innerHTML ).toBe( ICONS.CLOSE );
  } );

  it( 'should toggle markdown styles when style button clicked', () => {
    editor = initializeEditor();

    const styleToggle = document.getElementById( 'disableMarkdownStyles' );
    const codeMirror = document.querySelector( '.CodeMirror' );

    styleToggle.click();
    expect( styleToggle.classList.contains( 'disabled' ) ).toBe( true );
    expect( codeMirror.classList.contains( 'disable-markdown-styles' ) ).toBe( true );

    styleToggle.click();
    expect( styleToggle.classList.contains( 'disabled' ) ).toBe( false );
    expect( codeMirror.classList.contains( 'disable-markdown-styles' ) ).toBe( false );
  } );

  it( 'should handle editor close button click', () => {
    editor = initializeEditor();

    const closeButton = document.getElementById( 'closeEditor' );
    const overlay = document.getElementById( 'editorOverlay' );

    closeButton.click();

    expect( window.textareaInput.value ).toBe( 'test content' );
    expect( overlay.classList.contains( 'show' ) ).toBe( false );
  } );

  it( 'should create editor overlay with correct structure', () => {
    editor = initializeEditor();

    const overlay = document.getElementById( 'editorOverlay' );
    const textarea = overlay.querySelector( '#editorWrapper' );

    expect( overlay ).toBeTruthy();
    expect( textarea ).toBeTruthy();
    expect( textarea.tagName ).toBe( 'TEXTAREA' );
    expect( overlay.contains( textarea ) ).toBe( true );
  } );

  it( 'should maintain overlay and editor state after multiple interactions', () => {
    editor = initializeEditor();

    const styleToggle = document.getElementById( 'disableMarkdownStyles' );
    const closeButton = document.getElementById( 'closeEditor' );
    const overlay = document.getElementById( 'editorOverlay' );

    // Toggle styles
    styleToggle.click();
    expect( styleToggle.classList.contains( 'disabled' ) ).toBe( true );

    // Close editor
    closeButton.click();
    expect( overlay.classList.contains( 'show' ) ).toBe( false );
    expect( window.textareaInput.value ).toBe( 'test content' );
  } );
} );