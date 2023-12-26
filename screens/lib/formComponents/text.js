const text = ( div ) => {
  const tempContainer = document.createElement( 'div' );
  tempContainer.innerHTML = `
    <label class="label-wrapper">
      <div class="raw-mode">
        <span>Text Label<sup>*</sup></span>
        <div>
          <input type="text" class="element-label" placeholder="Label Placeholder">
        </div>
        <div class="edit-mode">
          <span class="label-text"></span>
        </div>
      </div>
    </label>
    <label class="content-wrapper">
      <span class="hint">Text for Text element</span>
      <div>
        <input type="text" class="element-value" placeholder="Text Placeholder">
      </div>
    </label>
  `;

  // Append children of tempContainer to the div
  while ( tempContainer.firstChild ) {
    div.appendChild( tempContainer.firstChild );
  }

  return div;

};

export default text;