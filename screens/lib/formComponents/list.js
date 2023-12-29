const list = ( div, labelExists ) => {
  const tempContainer = document.createElement( 'div' );
  tempContainer.innerHTML = `
    <label class="label-wrapper object-name">
      <span>List Label<sup>*</sup></span>
      <input type="text" class="element-label" placeholder="Label Placeholder" ${ labelExists ? "readonly" : "" }>
    </label>
    <ul>
      <li>
        <input type="text" class="list-item" placeholder="Item Placeholder">
        <div class="button-wrapper">
          <div class="add-button button">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                <g stroke="#000000" stroke-width="2">
                  <g transform="translate(2, 2)">
                    <circle cx="10" cy="10" r="10"></circle>
                    <line x1="6" y1="10" x2="14" y2="10"></line>
                    <line x1="10" y1="6" x2="10" y2="14"></line>
                  </g>
                </g>
              </g>
            </svg>
          </div>
          <div class="delete-button button">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" >
              <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
                <g stroke="#000000" stroke-width="2">
                  <g transform="translate(2, 2)">
                    <circle cx="10" cy="10" r="10"></circle>
                    <line x1="13" y1="7" x2="7" y2="13"></line>
                    <line x1="7" y1="7" x2="13" y2="13"></line>
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </li>
    </ul>
  `;

  // Append children of tempContainer to the div
  while ( tempContainer.firstChild ) {
    div.appendChild( tempContainer.firstChild );
  }

  return div;

};

export default list;