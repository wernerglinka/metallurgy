import { ICONS } from '../../icons/index.js';

const object = ( div, labelExists ) => {
  const tempContainer = document.createElement( 'div' );
  tempContainer.innerHTML = `
    <label class="object-name label-wrapper">
      <span>Object Label<sup>*</sup></span>
      <span class="hint">Sections Object</span>
      <input type="text" class="element-label" placeholder="Label Placeholder" ${ labelExists ? "readonly" : "" }>
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

  // create a dropzone for the object properties
  const objectDropzone = document.createElement( 'div' );
  objectDropzone.classList.add( 'object-dropzone', 'dropzone', 'js-dropzone' );
  objectDropzone.dataset.wrapper = "is-object";
  div.appendChild( objectDropzone );

  return div;

};

export default object;