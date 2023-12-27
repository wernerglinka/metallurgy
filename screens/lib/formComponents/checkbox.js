const checkbox = ( div, labelExists ) => {

  const tempContainer = document.createElement( 'div' );
  tempContainer.innerHTML = `
    <label class="label-wrapper">
      <span>Checkbox Label<sup>*</sup></span>
      <div>
        <input type="text" class="element-label" placeholder="Label Placeholder" ${ labelExists ? "readonly" : "" }>
      </div>
    </label>
    <label class="content-wrapper">
      <span class="hint">Initial state of checkbox</span>
      <div>
        <input type="checkbox" role="switch" class="element-value" value=false placeholder="Text Placeholder">
      </div>
    </label>
  `;

  // Append children of tempContainer to the div
  while ( tempContainer.firstChild ) {
    div.appendChild( tempContainer.firstChild );
  }



  /*
  
    // create the label for label input
    const label = document.createElement( 'label' );
    label.innerHTML = `<span>Checkbox Label<sup>*</sup></span>`;
  
    // create the label input
    const labelInput = document.createElement( 'input' );
    labelInput.setAttribute( 'type', "text" );
    labelInput.classList.add( 'element-label' );
    labelInput.placeholder = "Label Placeholder";
  
    // create wrapper for input for styling
    const labelInputWrapper = document.createElement( 'div' );
    labelInputWrapper.appendChild( labelInput );
  
    // add the input to the label element
    label.appendChild( labelInputWrapper );
  
    // add the label to the div
    div.appendChild( label );
  
    // create the label for checkbox
    const labelText = document.createElement( 'label' );
    labelText.innerHTML = `<span class="hint">Initial state of checkbox</span>`;
  
    // create the checkbox
    const checkboxInput = document.createElement( 'input' );
    checkboxInput.value = "false";
    checkboxInput.classList.add( 'element-value' );
    checkboxInput.setAttribute( 'type', "checkbox" );
    checkboxInput.setAttribute( 'role', "switch" );
  
    // create wrapper for input for styling
    const inputWrapper = document.createElement( 'div' );
    inputWrapper.appendChild( checkboxInput );
  
    // add the input to the label element
    labelText.appendChild( inputWrapper );
  
    // add the label to the div
    div.appendChild( labelText );
  
    */

  return div;
};

export default checkbox;