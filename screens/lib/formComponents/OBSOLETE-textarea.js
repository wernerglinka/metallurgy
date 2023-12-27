const textarea = ( div, labelExists ) => {
  console.log( "in the textarea component" );
  const tempContainer = document.createElement( 'div' );
  tempContainer.innerHTML = `
    <label class="label-wrapper">
      <span>Textarea Label<sup>*</sup></span>
      <div>
        <input type="text" class="element-label" placeholder="Label Placeholder" ${ labelExists ? "readonly" : "" }>
      </div>
    </label>
    <label class="content-wrapper">
      <span class="hint">Text for Textarea</span>
      <div>
        <textarea class="element-value is-editor" placeholder="Click to open editor"></textarea>
      </div>
    </label>
  `;

  // Append children of tempContainer to the div
  while ( tempContainer.firstChild ) {
    div.appendChild( tempContainer.firstChild );
  }


  // show the editor when the textarea is in focus
  div.addEventListener( 'click', ( e ) => {
    const editorOverlay = document.getElementById( 'editorOverlay' );
    editorOverlay.classList.add( 'show' );

    window.textareaInput = e.target;

    console.log( window.mdeditor.value() );
    // add value from the textarea to the editor
    window.mdeditor.value( e.target.value );
  } );


  /**
   *  Create a textarea with editor
   */
  // check if #editorWrapper already exists
  const editorWrapper = document.getElementById( 'editorWrapper' );
  if ( !editorWrapper ) {
    // Add an overlay
    const editorOverlay = document.createElement( 'div' );
    editorOverlay.id = "editorOverlay";
    // Add the editor textarea
    const easyMDEditor = document.createElement( 'textarea' );
    easyMDEditor.id = "editorWrapper";
    // add the editor wrapper to the DOM
    editorOverlay.appendChild( easyMDEditor );
    document.body.appendChild( editorOverlay );

    // add the easyMDEditor
    window.mdeditor = new EasyMDE( { element: easyMDEditor, autoDownloadFontAwesome: true } );

    // add a button to the easyMDEitor to disable the inline markdown styles
    const disableMarkdownStyles = document.createElement( 'button' );
    disableMarkdownStyles.id = "disableMarkdownStyles";
    disableMarkdownStyles.innerHTML = "Inline Styles";
    // add the button to the toolbar
    const toolbar = document.querySelector( '.editor-toolbar' );
    toolbar.appendChild( disableMarkdownStyles );

    // add eventlistener to the disableMarkdownStyles button
    disableMarkdownStyles.addEventListener( 'click', ( e ) => {
      e.target.classList.toggle( 'disabled' );
      const codemirrorWrapper = document.querySelector( '.CodeMirror' );
      codemirrorWrapper.classList.toggle( 'disable-markdown-styles' );
    } );

    // add a close button
    const closeButton = document.createElement( 'div' );
    closeButton.id = "closeEditor";
    closeButton.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g stroke="#ffffff" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"> 
            <circle cx="11" cy="11" r="10"></circle>
            <line x1="14" y1="8" x2="8" y2="14"></line>
            <line x1="8" y1="8" x2="14" y2="14"></line>
          </g>
        </svg>
      `;
    editorOverlay.appendChild( closeButton );

    // add eventlistener to the close button
    closeButton.addEventListener( 'click', () => {
      // first move the editor value to the textarea
      window.textareaInput.value = window.mdeditor.value();
      editorOverlay.classList.remove( 'show' );
    } );
  }

  return div;

};

export default textarea;