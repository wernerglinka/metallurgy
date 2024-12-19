// lib/transform-form-to-object.js
import { processList } from './process-list.js';
import helpers from './form-generation/form-builder/helpers/index.js';

/**
 * Pure functions for path operations
 * These functions never modify their inputs, always return new arrays/objects
 */
export const PathOps = {
  // Takes a path array and name, returns new array with name added
  // e.g., push(['main', 'seo'], 'title') returns ['main', 'seo', 'title']
  push: ( path, name ) => [ ...path, name ],

  // Takes a path array, returns new array without last element
  // e.g., pop(['main', 'seo', 'title']) returns ['main', 'seo']
  pop: path => path.slice( 0, -1 ),

  // Safely traverses nested object structure, creating objects as needed
  // e.g., getIn({a: {b: {}}}, ['a', 'b', 'c']) returns {} and ensures path exists
  getIn: ( obj, path ) =>
    path.reduce( ( current, key ) => {
      current[ key ] = current[ key ] || {};
      return current[ key ];
    }, obj ),

  // Sets value at nested path, returning entirely new object structure
  // Preserves immutability by creating new objects along the path
  // e.g., setIn({a: {b: {}}}, ['a', 'b', 'c'], 'value') returns new object
  // with value set at a.b.c
  setIn: ( obj, path, value ) => {
    if ( path.length === 0 ) return value;

    const [ head, ...rest ] = path;
    return {
      ...obj,
      [ head ]: PathOps.setIn( obj[ head ] || {}, rest, value )
    };
  }
};

/**
 * Pure functions for extracting and converting values from DOM elements
 * Each function handles one specific aspect of value extraction
 */
export const ValueOps = {
  // Extracts name from either input or text element
  // Handles both editable (input) and static (span) cases
  getName: element => {
    const input = element.querySelector( '.object-name input' );
    const text = element.querySelector( '.label-text' );
    if ( !input && !text ) return '';

    // convert the pretty label to camelCase as that is what the YAML frontmatter expects
    // e.g. `helpers.toCamelCase( input.value )` rather than `input.value`
    return input ? helpers.toCamelCase( input.value ) : text.textContent;
  },

  // Converts form values to appropriate types based on input type
  // Handles numbers, checkboxes, dates, and default string values
  getValue: element => {
    const input = element.querySelector( '.element-value' );
    if ( !input ) return '';

    switch ( input.type ) {
      case 'number': return Number( input.value );
      case 'checkbox': return input.checked;
      case 'date': return new Date( input.value );
      default: return input.value;
    }
  },

  // Extracts both key and value from a form element
  // Returns an object with both properties
  getKeyValue: element => {
    const input = element.querySelector( '.element-label' );
    const text = element.querySelector( '.label-text' );

    if ( !input && !text ) return { key: '', value: ValueOps.getValue( element ) };

    // convert the pretty label to camelCase as that is what the YAML frontmatter expects
    // e.g. `helpers.toCamelCase( input.value )` rather than `input.value`
    return {
      key: input ? helpers.toCamelCase( input.value ) : text.textContent,
      value: ValueOps.getValue( element )
    };
  },
};

/**
 * Functions for handling form state transitions
 * Each function takes current state and returns new state
 * State consists of:
 * - path: array of keys showing current position in object structure
 * - result: the accumulated result object
 */
export const FormStateOps = {
  // Creates initial state object with 'main' as root
  createState: () => ( {
    path: [ 'main' ],
    result: { main: {} }
  } ),

  // Handles object/array type elements by adding their name to the path
  // Returns new state with updated path
  handleStructural: ( state, element ) => {
    const name = ValueOps.getName( element );
    return {
      ...state,
      path: PathOps.push( state.path, name )
    };
  },

  // Handles simple value elements and list elements
  // Updates result object with new key-value pair at current path
  handleValue: ( state, element ) => {
    if ( element.classList.contains( 'is-list' ) ) {
      const { key, value } = processList( element );
      return {
        ...state,
        result: PathOps.setIn(
          state.result,
          state.path,
          { ...PathOps.getIn( state.result, state.path ), [ key ]: value }
        )
      };
    }

    const { key, value } = ValueOps.getKeyValue( element );
    return {
      ...state,
      result: PathOps.setIn(
        state.result,
        state.path,
        { ...PathOps.getIn( state.result, state.path ), [ key ]: value }
      )
    };
  },

  // Converts object to array at current path and moves up one level
  // Used when processing array-type structures
  handleArrayConversion: ( state ) => {
    const currentObj = PathOps.getIn( state.result, state.path );
    // Convert object key-values to array items
    const arrayVersion = Object.entries( currentObj ).map( ( [ key, value ] ) =>
      typeof value === 'object' ? value : { [ key ]: value }
    );

    return {
      ...state,
      path: PathOps.pop( state.path ),
      result: PathOps.setIn( state.result, state.path, arrayVersion )
    };
  },

  // Moves up one level in the path when finishing an object
  handleObjectEnd: ( state ) => ( {
    ...state,
    path: PathOps.pop( state.path )
  } )
};

/**
 * Processes a single form element, determining its type and applying
 * appropriate state transformation
 * Returns new state object after processing element
 */
export const processElement = ( state, element ) => {
  // Classify element by its type using class markers
  const isObject = element.classList.contains( 'is-object' );
  const isArray = element.classList.contains( 'is-array' );
  const isLast = element.classList.contains( 'is-last' );
  const isLastInArray = element.classList.contains( 'array-last' );

  // Apply appropriate state transformation based on element type
  if ( isObject || isArray ) {
    return FormStateOps.handleStructural( state, element );
  }
  if ( !isLast ) {
    return FormStateOps.handleValue( state, element );
  }
  if ( isLastInArray ) {
    return FormStateOps.handleArrayConversion( state );
  }
  return FormStateOps.handleObjectEnd( state );
};

/**
 * Main transformation function that processes form elements into object structure
 * Uses reduce to thread state through all elements, maintaining immutability
 * Returns final transformed object without the 'main' wrapper
 */
export const transformFormElementsToObject = ( allFormElements ) => {
  // Convert NodeList to Array and reduce over elements
  const finalState = Array.from( allFormElements ).reduce(
    ( state, element ) => processElement( state, element ),
    FormStateOps.createState()
  );

  // Return just the 'main' object's contents
  return finalState.result.main;
};