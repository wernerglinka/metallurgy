// lib/transform-form-to-object.js
import { processList } from './process-list.js';

/**
 * Gets object at current path in form object
 * Example: path ['main', 'seo', 'meta'] would traverse formObject.main.seo.meta
 * Creates empty objects along the path if they don't exist
 */
const getObjectAtPath = ( formObject, objectPath ) => {
  let currentObject = formObject;
  // Traverse path except last element (which is where we'll add new data)
  for ( let i = 0; i < objectPath.length - 1; i++ ) {
    const key = objectPath[ i ];
    // Create empty object if path doesn't exist yet
    if ( !currentObject[ key ] ) {
      currentObject[ key ] = {};
    }
    currentObject = currentObject[ key ];
  }
  return currentObject;
};

/**
 * Gets element name from form element, handling both editable and non-editable labels
 * Non-editable labels are in .label-text spans (when reading existing files)
 * Editable labels are in .object-name inputs (when creating new elements)
 */
const getElementName = ( element ) => {
  return element.querySelector( '.object-name input' )
    ? element.querySelector( '.object-name input' ).value
    : element.querySelector( '.label-text' ).textContent;
};

/**
 * Converts form element values to appropriate data types based on widget type
 * - Numbers are converted from strings to numbers
 * - Checkboxes return boolean values
 * - Dates are converted to Date objects
 * - Other types return string values
 */
const getElementValue = ( element ) => {
  const input = element.querySelector( '.element-value' );
  const widget = input?.type;

  switch ( widget ) {
    case 'number':
      return Number( input.value );
    case 'checkbox':
      return input.checked;
    case 'date':
      return new Date( input.value );
    default:
      return input?.value || '';
  }
};

/**
 * Processes non-object, non-array form elements (simple key-value pairs)
 * Handles both:
 * - List elements (which have their own processing logic)
 * - Regular form elements (which need label/value extraction)
 * 
 * For regular elements, handles both editable labels (.element-label inputs)
 * and non-editable labels (.label-text spans)
 */
const processSimpleElement = ( element ) => {
  // Lists have special processing needs
  if ( element.classList.contains( 'is-list' ) ) {
    return processList( element );
  }

  // Get key from either editable or non-editable label
  const key = element.querySelector( '.element-label' )
    ? element.querySelector( '.element-label' ).value
    : element.querySelector( '.label-text' ).textContent;

  return {
    key,
    value: getElementValue( element )
  };
};

/**
 * Converts object to array format when needed (for array-type elements)
 * Example input: { item1: { value: 'a' }, item2: { value: 'b' } }
 * Example output: [{ value: 'a' }, { value: 'b' }]
 * 
 * For simple values, wraps them in objects:
 * { item1: 'a', item2: 'b' } becomes [{ item1: 'a' }, { item2: 'b' }]
 */
const convertToArrayIfNeeded = ( currentObject, parentKey, isLastInArray ) => {
  // Only convert if this is the last element in an array
  if ( !isLastInArray ) return currentObject;

  const arrayVersion = [];
  Object.entries( currentObject[ parentKey ] ).forEach( ( [ key, value ] ) => {
    // Objects go directly into array
    if ( typeof value === 'object' ) {
      arrayVersion.push( value );
    } else {
      // Simple values get wrapped in an object
      arrayVersion.push( { [ key ]: value } );
    }
  } );

  return arrayVersion;
};

/**
 * Core function that processes each form element and updates the form object
 * Handles different element types:
 * - Objects: Create new nested object
 * - Arrays: Create object that will later be converted to array
 * - Simple elements: Add key-value to current object
 * - Last elements: Handle cleanup (pop from path, convert arrays)
 */
const processFormElement = ( element, formObject, objectPath ) => {
  // Determine element type from classes
  const isObject = element.classList.contains( 'is-object' );
  const isArray = element.classList.contains( 'is-array' );
  const isList = element.classList.contains( 'is-list' );
  const isLast = element.classList.contains( 'is-last' );
  const isLastInArray = element.classList.contains( 'array-last' );

  // Get the object we're currently working with based on our path
  const currentObject = getObjectAtPath( formObject, objectPath );
  const currentKey = objectPath[ objectPath.length - 1 ];

  if ( isObject || isArray ) {
    // Start new nested object/array
    const name = getElementName( element );
    objectPath.push( name );
    currentObject[ currentKey ] = currentObject[ currentKey ] || {};
  } else if ( !isLast ) {
    // Process regular form elements
    const { key, value } = processSimpleElement( element );
    currentObject[ currentKey ] = currentObject[ currentKey ] || {};
    currentObject[ currentKey ][ key ] = value;
  } else if ( isLastInArray ) {
    // Convert object to array format if needed
    currentObject[ currentKey ] = convertToArrayIfNeeded(
      currentObject,
      currentKey,
      isLastInArray
    );
    objectPath.pop();
  } else {
    // Regular last element, just pop from path
    objectPath.pop();
  }

  return formObject;
};

/**
 * Main transformation function that processes all form elements
 * Uses reduce to process elements one by one, maintaining object path
 * Returns final processed object without the 'main' wrapper
 */
export const transformFormElementsToObject = ( allFormElements ) => {
  const objectPath = [ 'main' ];  // Start at root level
  const formObject = { main: {} };

  // Process all elements in sequence
  Array.from( allFormElements ).reduce( ( obj, element ) => {
    return processFormElement( element, obj, objectPath );
  }, formObject );

  // Return without the 'main' wrapper
  return formObject.main;
};