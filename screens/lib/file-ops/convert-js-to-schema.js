import { isSimpleList, isDateObject } from '../utilities/type-validators.js';

export async function convertToSchemaObject( json ) {
  function createField( key, value ) {

    if ( isSimpleList( value ) ) {
      return {
        label: key,
        type: 'list',
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
    } else if ( isDateObject( value ) ) {  // must come before we test for object
      return {
        label: key,
        type: 'date',
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
  };

  // If we don't have an explicit schema, we'll infer it from the json shape
  return { fields: Object.entries( json ).map( ( [ key, value ] ) => createField( key, value ) ) };
}