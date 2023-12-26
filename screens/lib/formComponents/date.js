const date = ( div ) => {
  // create the label for label input
  const label = document.createElement( 'label' );
  label.innerHTML = `<span>Date Label<sup>*</sup></span>`;

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

  // create the label for text input
  const labelText = document.createElement( 'label' );
  labelText.innerHTML = `<span>The date</span>`;

  // create the input
  const textInput = document.createElement( 'input' );
  textInput.setAttribute( 'type', "date" );
  textInput.setAttribute( 'value', new Date().toISOString() );
  //textInput.dataset.type = "date";
  textInput.classList.add( 'element-value' );
  textInput.placeholder = "date Placeholder";

  // create wrapper for input for styling
  const inputWrapper = document.createElement( 'div' );
  inputWrapper.appendChild( textInput );

  // add the input to the label element
  labelText.appendChild( inputWrapper );

  // add the label to the div
  div.appendChild( labelText );

  return div;

};

export default date;