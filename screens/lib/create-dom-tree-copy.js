export function createDomTree( data ) {
  const ul = document.createElement( 'ul' );

  for ( const [ key, value ] of Object.entries( data ) ) {
    const li = document.createElement( 'li' );
    if ( Array.isArray( value ) ) {
      // Directory
      li.textContent = key.split( '/' ).pop();
      const subUl = document.createElement( 'ul' );
      value.forEach( item => {
        Object.entries( item ).forEach( ( [ subKey, subValue ] ) => {
          const subLi = document.createElement( 'li' );
          if ( typeof subValue === 'string' ) {
            // File
            const link = document.createElement( 'a' );
            link.href = subValue;
            link.textContent = subKey;
            subLi.appendChild( link );
          } else {
            // Subdirectory
            const subTree = createDomTree( { [ subKey ]: subValue } );
            subLi.appendChild( subTree );
          }
          subUl.appendChild( subLi );
        } );
      } );
      li.appendChild( subUl );
    } else {
      // File
      const link = document.createElement( 'a' );
      link.href = value;
      link.textContent = key;
      li.appendChild( link );
    }
    ul.appendChild( li );
  }

  return ul;
}