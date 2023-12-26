import { convertToSchemaObject } from './convert-js-to-schema.js';
import { getUpdatedElement } from './create-element.js';
import { getFromLocalStorage } from './local-storage.js';

export const renderMarkdownFile = async ( frontmatter, content ) => {
  const schema = await convertToSchemaObject( frontmatter );

  /**
   * Check if we have explicitly defined field schemas or if we need to infer them 
   * from the json shape.
   * Field schemas are defined in the fields.json file in the .metallurgy folder of the project
   */

  // Get the project path from localStorage
  const projectPath = getFromLocalStorage( 'projectFolder' );
  // Create the schema file path
  const schemaFilePath = `${ projectPath }/.metallurgy/frontmatterTemplates/fields.json`;
  // check if file exists via the main process
  const schemaExists = await window.electronAPI.checkFileExists( schemaFilePath );

  let explicitSchemaArray;

  if ( schemaExists ) {
    const explicitSchema = await window.electronAPI.readFile( schemaFilePath );
    explicitSchemaArray = JSON.parse( explicitSchema.data );
  }

  // render the schema to the DOM
  const fragment = document.createDocumentFragment();
  schema.fields.forEach( ( field ) => {
    // create a new element
    // Since we are rendering a markdown file, all labels will be rendered as they are
    // in the file, so we need to set labelsExist to true.
    // If we'd render a new file, the labels would be rendered as input fields, so we'd
    // need to set labelsExist to false.
    const labelsExist = true;
    const schemaElement = getUpdatedElement( field, explicitSchemaArray, labelsExist );

    // Append the new element to the tempWrapper
    fragment.appendChild( schemaElement );
  } );

  const dropzone = document.getElementById( 'dropzone' );
  dropzone.appendChild( fragment );

};