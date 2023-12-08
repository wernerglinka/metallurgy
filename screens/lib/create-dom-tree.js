export function createDomTree( data ) {
  const ul = document.createElement( 'ul' );

  for ( const [ key, value ] of Object.entries( data ) ) {
    if ( Array.isArray( value ) ) {
      // Directory
      const dirLi = document.createElement( 'li' );
      dirLi.textContent = key.split( '/' ).pop();
      const subUl = document.createElement( 'ul' );

      for ( const item of value ) {
        for ( const [ subKey, subValue ] of Object.entries( item ) ) {
          if ( typeof subValue === 'string' ) {
            // File
            const fileLi = document.createElement( 'li' );
            fileLi.classList.add( 'file' );
            const link = document.createElement( 'a' );
            link.href = subValue;
            link.textContent = subKey;
            fileLi.appendChild( link );
            subUl.appendChild( fileLi );
          } else {
            // Subdirectory
            const subTree = createDomTree( { [ subKey ]: subValue } );
            const fragment = document.createDocumentFragment();
            subTree.firstChild.classList.add( 'folder' );
            while ( subTree.firstChild ) {
              fragment.appendChild( subTree.firstChild );
            }
            subUl.appendChild( fragment );
          }
        }
      }
      dirLi.appendChild( subUl );
      ul.appendChild( dirLi );
    } else {
      // File in the root directory
      const fileLi = document.createElement( 'li' );
      const link = document.createElement( 'a' );
      link.href = value;
      link.textContent = key;
      fileLi.appendChild( link );
      ul.appendChild( fileLi );
    }
  }

  return ul;
}

