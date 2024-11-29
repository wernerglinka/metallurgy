/**
 * @module schema/validate-schema
 * @description Schema structure and field validation
 */
import { FIELD_TYPES } from './field-types.js';

const validateFieldStructure = ( field ) => {
  if ( !field.type ) throw new Error( 'Field must have a type' );
  if ( !field.label && !field.name ) throw new Error( 'Field must have label or name' );

  const fieldType = Object.values( FIELD_TYPES )
    .find( t => t.type === field.type.toLowerCase() );
  if ( !fieldType ) throw new Error( `Invalid field type: ${ field.type }` );

  if ( fieldType.requiresOptions && !field.options?.length ) {
    throw new Error( `${ field.type } field requires options` );
  }
};

const validateFieldValue = ( field ) => {
  const fieldType = Object.values( FIELD_TYPES ).find( t => t.type === field.type );

  // Skip validation for object type since it may be empty initially
  if ( field.type === 'object' ) return;

  if ( field.value === undefined && field.default === undefined ) {
    field.value = fieldType.default;
  }

  switch ( field.type ) {
    case 'list':
      if ( !Array.isArray( field.value ) && !Array.isArray( field.default ) ) {
        throw new Error( 'List field must have array value' );
      }
      break;
    case 'select':
      if ( field.value && !field.options.find( opt => opt.value === field.value ) ) {
        throw new Error( 'Select value must match an option' );
      }
      break;
  }
};

export const validateField = ( field ) => {
  validateFieldStructure( field );
  validateFieldValue( field );
  return true;
};

export const validateSchema = ( schema ) => {
  if ( !schema?.fields ) throw new Error( 'Schema must contain fields property' );
  if ( !Array.isArray( schema.fields ) ) throw new Error( 'Schema fields must be an array' );

  schema.fields.forEach( validateField );
  return true;
};