/**
 * @module field-handlers/list
 * @description Updates list field elements
 */
export const updateListField = ( element, field ) => {
  element.classList.add( 'is-list' );
  element.querySelector( '.object-name input' ).value = field.label;

  const listWrapper = element.querySelector( 'ul' );
  const listItem = listWrapper.querySelector( 'li' );
  listItem.remove();

  field.value.forEach( item => {
    const clonedListItem = listItem.cloneNode( true );
    clonedListItem.querySelector( 'input' ).value = item;
    listWrapper.appendChild( clonedListItem );
  } );

  return element;
};