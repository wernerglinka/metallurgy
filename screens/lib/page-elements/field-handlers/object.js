import { getUpdatedElement } from '../create-element.js';

/**
 * @module field-handlers/object
 * @description Updates object and array field elements
 */
export const updateObjectField = ( element, field, explicitSchemaArray, labelsExist ) => {
  element.querySelector( '.object-name input' ).value = field.label;

  if ( field.value.length > 0 ) {
    const objectDropzone = element.querySelector( '.dropzone' );
    field.value.forEach( property => {
      const updatedElement = getUpdatedElement( property, explicitSchemaArray, labelsExist );
      objectDropzone.appendChild( updatedElement );
    } );
  }

  return element;
};