import { ICONS } from '../../icons/index.js';

const array = ( div, labelExists ) => {
  const tempContainer = document.createElement( 'div' );
  tempContainer.innerHTML = `
    <label class="object-name label-wrapper">
      <span>Array Label<sup>*</sup></span>
      <input type="text" class="element-label" placeholder="Array Name" ${ labelExists ? "readonly" : "" }>
      <span class="collapse-icon">
        ${ ICONS.COLLAPSE }
        ${ ICONS.COLLAPSED }
      </span>
    </label>
  `;

  // Append children of tempContainer to the div
  while ( tempContainer.firstChild ) {
    div.appendChild( tempContainer.firstChild );
  }

  // create a dropzone for the array members
  const arrayDropzone = document.createElement( 'div' );
  arrayDropzone.classList.add( 'array-dropzone', 'dropzone', 'js-dropzone' );
  arrayDropzone.dataset.wrapper = "is-array";
  div.appendChild( arrayDropzone );

  return div;
};

export default array;