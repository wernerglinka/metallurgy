const date = ( div, labelExists ) => {
  const tempContainer = document.createElement( 'div' );
  tempContainer.innerHTML = `
    <label class="label-wrapper">
      <span>Date Label<sup>*</sup></span>
      <div>
        <input type="text" class="element-label" placeholder="Label Placeholder" ${ labelExists ? "readonly" : "" }>
      </div>
    </label>
    <label class="content-wrapper">
      <span class="hint">date for date element</span>
      <div>
        <input type="date" value="${ new Date().toISOString() }" class="element-value" placeholder="Date Placeholder">
      </div>
    </label>
  `;

  // Append children of tempContainer to the div
  while ( tempContainer.firstChild ) {
    div.appendChild( tempContainer.firstChild );
  }
  return div;

};

export default date;