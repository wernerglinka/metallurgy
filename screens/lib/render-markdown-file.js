import { convertToSchemaObject } from './convert-js-to-schema.js';
import { getUpdatedElement } from './create-element.js';

export const renderMarkdownFile = async ( fileName, frontmatter, content ) => {
  const schema = await convertToSchemaObject( fileName, frontmatter );

  console.log( schema );

  // render the schema to the DOM
  const fragment = document.createDocumentFragment();
  schema.fields.forEach( field => {
    // create a new element
    // Since we are rendering a markdown file, all labels will be rendered as they are
    // in the file, so we need to set raw to false.
    const schemaElement = getUpdatedElement( field, false );

    // Append the new element to the tempWrapper
    fragment.appendChild( schemaElement );
  } );

  const dropzone = document.getElementById( 'dropzone' );
  dropzone.appendChild( fragment );

};