export const compareDOMElements = ( element1, element2 ) => {
  // First, use isEqualNode for a general structural comparison
  if ( !element1.isEqualNode( element2 ) ) {
    return false;
  }

  // Additional function to specifically compare input elements
  function compareInputElements( el1, el2 ) {
    if ( el1.tagName === 'INPUT' || el1.tagName === 'TEXTAREA' || el1.tagName === 'SELECT' ) {
      // Handle text inputs, textareas, and select elements
      if ( el1.tagName === 'TEXTAREA' || ( el1.tagName === 'INPUT' && el1.type === 'text' ) ) {
        if ( el1.value !== el2.value ) return false;
      }

      // Handle checkboxes and radio buttons
      if ( el1.tagName === 'INPUT' && ( el1.type === 'checkbox' || el1.type === 'radio' ) ) {
        if ( el1.checked !== el2.checked ) return false;
      }

      // Handle select elements (dropdowns)
      if ( el1.tagName === 'SELECT' ) {
        for ( let i = 0; i < el1.options.length; i++ ) {
          if ( el1.options[ i ].selected !== el2.options[ i ].selected ) return false;
        }
      }
    }
    return true;
  }

  // Recursively compare all children
  if ( element1.childNodes.length !== element2.childNodes.length ) {
    return false;
  }

  for ( let i = 0; i < element1.childNodes.length; i++ ) {
    const child1 = element1.childNodes[ i ];
    const child2 = element2.childNodes[ i ];

    if ( !compareDOMElements( child1, child2 ) || !compareInputElements( child1, child2 ) ) {
      return false;
    }
  }

  return true;
};