import { isSimpleList, isDateObject } from '../../utilities/type-validators.js';

const inferFieldType = ( value ) => {
  if ( isSimpleList( value ) ) return 'list';
  if ( isDateObject( value ) ) return 'date';
  if ( Array.isArray( value ) ) return 'array';

  const type = typeof value;
  if ( type === 'string' ) return value.includes( '\n' ) ? 'textarea' : 'text';
  if ( type === 'object' && value !== null ) return 'object';

  return type === 'boolean' ? 'checkbox' :
    type === 'number' ? 'number' : 'text';
};

function createField( key, value ) {
  const type = inferFieldType( value );
  const baseField = {
    label: key,
    type,
    value,
    placeholder: `Add ${ key }`
  };

  if ( type === 'array' ) {
    baseField.value = value.map( ( item, index ) => createField( `${ key }${ index }`, item ) );
  } else if ( type === 'object' ) {
    baseField.value = Object.entries( value ).map( ( [ subKey, subValue ] ) => createField( subKey, subValue ) );
    delete baseField.placeholder;
  }

  return baseField;
}

export async function convertToSchemaObject( json ) {
  return { fields: Object.entries( json ).map( ( [ key, value ] ) => createField( key, value ) ) };
}