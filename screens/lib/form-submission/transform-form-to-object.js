// Value operations
export const ValueOps = {
  // Extracts name from either input or text element
  getName: element => {
    const input = element.querySelector( '.object-name input' );
    const text = element.querySelector( '.label-text' );
    if ( !input && !text ) return '';

    // Clean up name - trim spaces and convert to camelCase if needed
    const rawName = ( input ? input.value : text.textContent ).trim();
    return rawName.toLowerCase();
  },

  // Extracts both key and value from a form element
  getKeyValue: element => {
    const labelInput = element.querySelector( '.element-label' );
    const valueInput = element.querySelector( '.element-value' );

    // Get key and ensure it's lowercase
    const key = labelInput ? labelInput.value.trim().toLowerCase() : '';

    // For value, handle different input types
    let value = '';
    if ( valueInput ) {
      if ( valueInput.type === 'checkbox' ) {
        value = valueInput.checked;
      } else if ( valueInput.type === 'number' ) {
        value = Number( valueInput.value );
      } else {
        value = valueInput.value.trim();
      }
    }

    // Special case for layout to ensure it's exactly 'blocks.njk'
    if ( key === 'layout' ) {
      return { key, value: 'blocks.njk' };
    }

    return { key, value };
  }
};

// Path operations
export const PathOps = {
  push: ( path, name ) => [ ...path, name ],
  pop: path => path.slice( 0, -1 ),
  getIn: ( obj, path ) => {
    return path.reduce( ( current, key ) => {
      current[ key ] = current[ key ] || {};
      return current[ key ];
    }, obj );
  },
  setIn: ( obj, path, value ) => {
    if ( path.length === 0 ) return value;

    const [ head, ...rest ] = path;
    return {
      ...obj,
      [ head ]: PathOps.setIn( obj[ head ] || {}, rest, value )
    };
  }
};

// Form state operations
export const FormStateOps = {
  createState: () => ( {
    path: [ 'main' ],
    result: { main: {} }
  } ),

  handleStructural: ( state, element ) => {
    console.log( 'Handling structural element' );
    const name = ValueOps.getName( element );
    console.log( 'Got name:', name );
    return {
      ...state,
      path: PathOps.push( state.path, name )
    };
  },

  handleValue: ( state, element ) => {
    console.log( 'Handling value element' );
    const { key, value } = ValueOps.getKeyValue( element );
    console.log( 'Got key-value:', { key, value } );

    if ( !key ) return state; // Skip if no key found

    return {
      ...state,
      result: PathOps.setIn(
        state.result,
        state.path,
        { ...PathOps.getIn( state.result, state.path ), [ key ]: value }
      )
    };
  },

  handleArrayConversion: ( state ) => {
    console.log( 'Converting to array' );
    const currentObj = PathOps.getIn( state.result, state.path );

    // Convert object to array, keeping blocks intact
    const arrayVersion = Object.entries( currentObj ).map( ( [ key, value ] ) => {
      // Check if this is a block (has a specific block structure)
      const isBlock = key.endsWith( 'block' );
      if ( isBlock ) {
        // Return block directly
        return { [ key ]: value };
      }
      // For other elements, use standard conversion
      return typeof value === 'object' ? value : { [ key ]: value };
    } );

    return {
      ...state,
      path: PathOps.pop( state.path ),
      result: PathOps.setIn( state.result, state.path, arrayVersion )
    };
  },

  handleObjectEnd: ( state ) => {
    console.log( 'Ending object, current path:', state.path );
    return {
      ...state,
      path: PathOps.pop( state.path )
    };
  }
};

// Main transformation function
export const transformFormElementsToObject = ( allFormElements ) => {
  console.log( 'Starting transformation with elements:', allFormElements.length );

  try {
    const finalState = Array.from( allFormElements ).reduce( ( state, element ) => {
      console.log( 'Processing element:', element.className );

      const isObject = element.classList.contains( 'is-object' );
      const isArray = element.classList.contains( 'is-array' );
      const isLast = element.classList.contains( 'is-last' );
      const isLastInArray = element.classList.contains( 'array-last' );

      if ( isObject || isArray ) {
        return FormStateOps.handleStructural( state, element );
      } else if ( !isLast ) {
        return FormStateOps.handleValue( state, element );
      } else if ( isLastInArray ) {
        return FormStateOps.handleArrayConversion( state );
      } else {
        return FormStateOps.handleObjectEnd( state );
      }
    }, FormStateOps.createState() );

    console.log( 'Final state:', finalState );
    return finalState.result.main;
  } catch ( error ) {
    console.error( 'Transformation error:', error );
    return null;
  }
};

export const processElement = ( state, element ) => {
  // Special handling for blocks
  if ( element.classList.contains( 'is-block' ) ) {
    const blockName = ValueOps.getName( element ).toLowerCase();
    if ( !blockName ) return state;

    // Process all fields in the block's container
    const blockFields = {};
    element.querySelectorAll( '.block-fields-container .form-element' ).forEach( field => {
      const { key, value } = ValueOps.getKeyValue( field );
      if ( key ) {
        blockFields[ key ] = value;
      }
    } );

    // Add block to current path level
    return {
      ...state,
      result: PathOps.setIn(
        state.result,
        state.path,
        { ...PathOps.getIn( state.result, state.path ), [ blockName ]: blockFields }
      )
    };
  }

  // Regular element processing
  const isObject = element.classList.contains( 'is-object' );
  const isArray = element.classList.contains( 'is-array' );
  const isLast = element.classList.contains( 'is-last' );
  const isLastInArray = element.classList.contains( 'array-last' );

  if ( isObject || isArray ) {
    return FormStateOps.handleStructural( state, element );
  } else if ( !isLast ) {
    return FormStateOps.handleValue( state, element );
  } else if ( isLastInArray ) {
    return FormStateOps.handleArrayConversion( state );
  }
  return FormStateOps.handleObjectEnd( state );
};