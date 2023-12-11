const simplelist = ( div ) => {
  // create the array name input
  const label = document.createElement( 'label' );
  label.classList.add( 'object-name' );
  label.innerHTML = `<span>List Key<sup>*</sup></span>`;
  const nameInput = document.createElement( 'input' );
  nameInput.setAttribute( 'type', "text" );
  nameInput.placeholder = "Name Placeholder";

  label.appendChild( nameInput );
  div.appendChild( label );

  // create the first list item input
  const textInput = document.createElement( 'input' );
  textInput.setAttribute( 'type', "text" );
  //textInput.dataset.type = "text";
  textInput.classList.add( 'list-item' );
  textInput.placeholder = "Item Placeholder";

  // create wrapper for input styling
  const listWrapper = document.createElement( 'ul' );
  const listItem = document.createElement( 'li' );
  listItem.appendChild( textInput );

  // add a button wrapper to the list item
  const buttonWrapper = document.createElement( 'div' );
  buttonWrapper.classList.add( 'button-wrapper' );
  listItem.appendChild( buttonWrapper );

  //add the list item add button
  const addListItem = document.createElement( 'div' );
  addListItem.classList.add( 'add-button', 'button' );
  addListItem.innerHTML = "+";
  buttonWrapper.appendChild( addListItem );

  //add the list item delete button
  const deleteListItem = document.createElement( 'div' );
  deleteListItem.classList.add( 'delete-button', 'button' );
  deleteListItem.innerHTML = "-";
  buttonWrapper.appendChild( deleteListItem );

  listItem.appendChild( buttonWrapper );
  listWrapper.appendChild( listItem );

  div.appendChild( listWrapper );

  return div;

};

export default simplelist;