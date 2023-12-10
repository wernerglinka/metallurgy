export const convertToSchemaObject = ( jsObject ) => {
  function createSchemaField( key, value ) {
    if ( typeof value === 'object' && !Array.isArray( value ) && value !== null ) {
      // It's an object, recurse
      return {
        label: key,
        type: 'object',
        value: Object.entries( value ).map( ( [ subKey, subValue ] ) => createSchemaField( subKey, subValue ) )
      };
    } else {
      // It's a primitive value or an array
      // analyse the typeof the value to determine the type of the element
      if ( Array.isArray( value ) ) {
        return {
          label: key,
          type: 'array',
          value: value.map( item => createSchemaField( key, item ) )
        };
      };
      if ( typeof value === 'boolean' ) {
        return {
          label: key,
          type: 'checkbox',
          value: value,
          placeholder: `Add ${ key }`
        };
      };
      if ( typeof value === 'string' ) {
        return {
          label: key,
          type: typeof value === 'string' && value.includes( '\n' ) ? 'textarea' : 'text',
          value: value,
          placeholder: `Add ${ key }`
        };
      };

      if ( typeof value === 'number' ) {
        return {
          label: key,
          type: 'text',
          value: value,
          placeholder: `Add ${ key }`
        };
      };
    }
  }
  return {
    fields: Object.entries( jsObject ).map( ( [ key, value ] ) => createSchemaField( key, value ) )
  };
};