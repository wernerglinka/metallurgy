const array = ( div ) => {
  // create the array name input
  const label = document.createElement( 'label' );
  label.classList.add( 'object-name' );
  label.innerHTML = `<span>Array Key<sup>*</sup></span>`;
  const nameInput = document.createElement( 'input' );
  nameInput.setAttribute( 'type', "text" );
  nameInput.placeholder = "Array Name";
  label.appendChild( nameInput );

  const collapseIcon = document.createElement( 'span' );
  collapseIcon.classList.add( 'collapse-icon' );
  collapseIcon.innerHTML = `
      <svg class="open" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <g transform="translate(-2, -2)" stroke="#FFFFFF" stroke-width="2">
            <g stroke="#FFFFFF" stroke-width="2">
              <line x1="12" y1="22" x2="12" y2="16" id="Path"></line>
              <line x1="12" y1="8" x2="12" y2="2" id="Path"></line>
              <line x1="4" y1="12" x2="2" y2="12" id="Path"></line>
              <line x1="10" y1="12" x2="8" y2="12" id="Path"></line>
              <line x1="16" y1="12" x2="14" y2="12" id="Path"></line>
              <line x1="22" y1="12" x2="20" y2="12" id="Path"></line>
              <polyline id="Path" points="15 19 12 16 9 19"></polyline>
              <polyline id="Path" points="15 5 12 8 9 5"></polyline>
            </g>
          </g>
        </g>
      </svg>

      
      <svg class="collapsed viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <g transform="translate(-2, -2)" stroke="#FFFFFF" stroke-width="2">
              <g transform="translate(2, 2)">
                  <line x1="10" y1="20" x2="10" y2="14" id="Path"></line>
                  <line x1="10" y1="6" x2="10" y2="0" id="Path"></line>
                  <line x1="2" y1="10" x2="0" y2="10" id="Path"></line>
                  <line x1="8" y1="10" x2="6" y2="10" id="Path"></line>
                  <line x1="14" y1="10" x2="12" y2="10" id="Path"></line>
                  <line x1="20" y1="10" x2="18" y2="10" id="Path"></line>
                  <polyline id="Path" points="13 17 10 20 7 17"></polyline>
                  <polyline id="Path" points="13 3 10 0 7 3"></polyline>
              </g>
          </g>
        </g>
      </svg>
    `;

  label.appendChild( collapseIcon );
  div.appendChild( label );

  // create a dropzone for the array members
  const arrayDropzone = document.createElement( 'div' );
  arrayDropzone.classList.add( 'array-dropzone', 'dropzone', 'js-dropzone' );
  arrayDropzone.dataset.wrapper = "is-array";
  div.appendChild( arrayDropzone );

  return div;
};

export default array;