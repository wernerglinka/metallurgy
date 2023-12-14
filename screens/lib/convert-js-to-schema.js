function isSimpleList( value ) {
  // Check if value is an array
  if ( Array.isArray( value ) ) {
    // Check if every item in the array is a string -> simple list
    return value.every( item => typeof item === 'string' );
  }
  return false;
}

export function convertToSchemaObject( json ) {
  function createField( key, value ) {
    if ( isSimpleList( value ) ) {
      console.log( `simple list: ${ key }/${ value }` );
      return {
        label: key,
        type: 'simplelist',
        value: value
      };
    }
    const type = typeof value;

    if ( type === 'string' ) {
      return {
        label: key,
        type: typeof value === 'string' && value.includes( '\n' ) ? 'textarea' : 'text',
        value: value,
        placeholder: `Add ${ key }`
      };
    } else if ( type === 'number' ) {
      return {
        label: key,
        type: 'number',
        value: value,
        placeholder: `Add ${ key }`
      };
    } else if ( type === 'boolean' ) {
      return {
        label: key,
        type: 'checkbox',
        value: value,
        placeholder: `Add ${ key }`
      };
    } else if ( Array.isArray( value ) ) {
      return {
        label: key,
        type: 'array',
        value: value.map( ( item, index ) => createField( `${ key }${ index }`, item ) ),
        placeholder: `Add ${ key }`
      };
    } else if ( typeof value === 'object' && !Array.isArray( value ) && value !== null ) {
      return {
        label: key,
        type: 'object',
        value: Object.entries( value ).map( ( [ subKey, subValue ] ) => createField( subKey, subValue ) )
      };
    }

    throw new Error( `Unsupported type: ${ type }` );
  }

  return { fields: Object.entries( json ).map( ( [ key, value ] ) => createField( key, value ) ) };
}