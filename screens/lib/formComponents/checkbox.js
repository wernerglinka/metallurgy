const checkbox = ( div ) => {
  // create the label for label input
  const label = document.createElement( 'label' );
  label.innerHTML = `<span>Checkbox Key<sup>*</sup></span>`;

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
  labelText.innerHTML = `<span>Initial state of checkbox</span>`;

  // create the checkbox
  const checkboxInput = document.createElement( 'input' );
  checkboxInput.value = "false";
  checkboxInput.classList.add( 'element-value' );
  //checkboxInput.dataset.type = "checkbox";
  checkboxInput.setAttribute( 'type', "checkbox" );
  checkboxInput.setAttribute( 'role', "switch" );

  // create wrapper for input for styling
  const inputWrapper = document.createElement( 'div' );
  inputWrapper.appendChild( checkboxInput );

  // add the input to the label element
  labelText.appendChild( inputWrapper );

  // add the label to the div
  div.appendChild( labelText );

  return div;
};

export default checkbox;