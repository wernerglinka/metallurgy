/**
 * @module form/form-builder
 * @description Creates and renders form elements from schema fields
 */

import { getUpdatedElement } from '../../page-elements/create-element.js';

import { logFragment } from '../../utilities/fragment-debug-helper.js';
/**
 * Creates form fragment from schema fields
 * @param {Array} fields - Schema fields to convert to form elements
 * @param {Array} explicitSchemaArray - Explicit field definitions
 * @returns {DocumentFragment} Fragment containing form elements
 */
export const createFormFragment = ( fields, explicitSchemaArray ) => {
  const fragment = document.createDocumentFragment();

  // convert fields to form elements
  fields.forEach( field => {
    const schemaElement = getUpdatedElement(
      field,
      explicitSchemaArray,
      true // labelsExist = true for markdown file rendering
    );

    fragment.appendChild( schemaElement );
  } );

  return fragment;
};

/**
 * Renders form elements to dropzone
 * @param {DocumentFragment} fragment - Form elements to render
 * @throws {Error} If dropzone element not found
 */
export const renderToDropzone = ( fragment ) => {
  const dropzone = document.getElementById( 'dropzone' );
  if ( !dropzone ) {
    throw new Error( 'Dropzone element not found' );
  }

  dropzone.appendChild( fragment );
};