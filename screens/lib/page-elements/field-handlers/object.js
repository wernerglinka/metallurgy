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

  /*
   * If there is a `sectionDescription` field in the object we will use it to add a description
   * to the section. This is useful when a section is collapsed and the description is the only
   * info available to the user. The alternative is to open any section to find out what it is.
   */
  // Check if the field is an object and has a value array
  if ( field.type === 'object' && Array.isArray( field.value ) ) {
    // Find the sub-field with label 'sectionDescription'
    const descriptionField = field.value.find( subField => subField.label === 'sectionDescription' );

    // If the description field exists, update the hint text
    if ( descriptionField && descriptionField.value ) {
      // Create a new span element
      const descriptionSpan = document.createElement( 'span' );
      descriptionSpan.className = 'section-description';
      descriptionSpan.textContent = descriptionField.value;

      // Insert the span after the .hint element
      const hintElement = element.querySelector( '.hint' );
      hintElement.insertAdjacentElement( 'afterend', descriptionSpan );
    }
  }

  return element;
};