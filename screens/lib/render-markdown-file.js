import { convertToSchemaObject } from './convert-js-to-schema.js';
import { getUpdatedElement } from './create-element.js';

export const renderMarkdownFile = ( frontmatter, content ) => {

  console.log( JSON.stringify( frontmatter, null, 2 ) );

  const schema = convertToSchemaObject( frontmatter );

  console.log( JSON.stringify( schema, null, 2 ) );

  // render the schema to the DOM
  const fragment = document.createDocumentFragment();
  schema.fields.forEach( field => {
    // create a new element
    const schemaElement = getUpdatedElement( field );
    // Append the new element to the tempWrapper
    fragment.appendChild( schemaElement );
  } );

  const dropzone = document.querySelector( '.js-main-dropzone' );
  dropzone.appendChild( fragment );

};