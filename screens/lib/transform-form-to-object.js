/**
 * @function getCurrentObject
 * @param {object} formObject 
 * @param {array} loopStack 
 * @returns {object} currentObject
 * @description getCurrentObject navigates through the nested formObject based on 
 * an array representing the path to traverse within this object and returns the
 * object at that specific location. 
 */
function getCurrentObject( formObject, loopStack ) {
  let currentObject = formObject;
  for ( let i = 0; i < loopStack.length - 1; i++ ) {
    let key = loopStack[ i ];
    if ( !currentObject[ key ] ) {
      currentObject[ key ] = {};
    }
    currentObject = currentObject[ key ];
  }
  return currentObject;
}

/**
 * @function transformFormElementsToObject
 * @param {Nodelist} allFormElements 
 * @returns {object} formObject
 * @description This function will transform the form elements to an 
 *   object which will be used to create the frontmatter YAML. The function
 *   uses a loopStack to keep track of the current object's depth. The loopStack is
 *   an array of strings. An array item is the name of the current object.
 *   The previous item in the array is the name of the parent object, etc. The
 *   first item in the array is the name of the main object. This approach is
 *   necessary to create the correct deep object structure.   
 */
export const transformFormElementsToObject = ( allFormElements ) => {
  const numberOfFormElements = allFormElements.length;
  const loopStack = [ "main" ];
  const formObject = {};
  // Add object to formObject with name from loopStack. This is initially 
  // the main object, e.g. formObject.main = {}
  formObject[ loopStack[ 0 ] ] = {};
  let currentLevelObject;

  for ( let i = 0; i < numberOfFormElements; i++ ) {
    const currentElement = allFormElements[ i ];

    // get status of the current element
    const isObject = currentElement.classList.contains( 'is-object' );
    const isArray = currentElement.classList.contains( 'is-array' );
    const isList = currentElement.classList.contains( 'is-list' );
    const isLast = currentElement.classList.contains( 'is-last' );
    const isLastInArray = currentElement.classList.contains( 'array-last' );

    // check if the current element is an array or object. If so, add the name to the loopStack
    // as this represents a level in the object structure
    if ( isObject || isArray ) {
      const name = currentElement.querySelector( '.object-name input' ).value;
      loopStack.push( name );

      // add an empty object to formObject with name from loopStack
      currentLevelObject = getCurrentObject( formObject, loopStack );
      currentLevelObject[ loopStack[ loopStack.length - 1 ] ] = {};
    }

    // process all simple prop elements
    else if ( !isLast ) {
      let key, value, widget;

      // A list is a simple prop variants
      if ( isList ) {
        const list = processList( currentElement );
        key = list.key;
        value = list.value;

      } else {
        // Get the element props
        key = currentElement.querySelector( '.element-label' ).value;
        value = currentElement.querySelector( '.element-value' ).value;
        widget = currentElement.querySelector( '.element-value' ).type;
      }

      // Add the element to its parent object
      currentLevelObject = getCurrentObject( formObject, loopStack );
      currentLevelObject[ loopStack[ loopStack.length - 1 ] ][ key ] = widget !== "checkbox" ? value : currentElement.querySelector( '.element-value' ).checked;

    } else {
      // if the current element is the last in an array or object, remove the
      // parent name from the loopStack. This will move the currentLevelObject up one level
      currentLevelObject = getCurrentObject( formObject, loopStack );

      // remove the last item from the loopStack
      const parentName = loopStack.pop();

      /************************************************************************
        Objects when direct array children do not have a name to aid in the 
        conversion from object to YAML. This example shows the issue:
        
        NOTE: that initially we use a dummy name for the object, e.g. neverMind1, neverMind2, etc.
        so we can create the correct object structure. This dummy name will be removed later.
      
      {
        "layout": "sections",
        "draft": false,
        "sections": {
          "neverMind1": {
            "container": "article",
            "inContainer": true,
            "background": {
              "color": "#333",
              "image": ""
            }
          },
          "neverMind2": {
            "container": "aside",
            "inContainer": false,
            "background": {
              "color": "#333",
              "image": ""
            }
          }
        }
      }
      
      will be converted to this:
      NOTE: that the dummy name is removed and the object is converted to an array
      
      {
        "layout": "sections",
        "draft": false,
        "sections": [
          {
            "container": "article",
            "inContainer": true,
            "background": {
              "color": "#333",
              "image": ""
            }
          },
          {
            "container": "aside",
            "inContainer": false,
            "background": {
              "color": "#333",
              "image": ""
            }
          }
        ]
      }

      This will finally result in this YAML object:

      layout: sections
      draft: false
      sections:
        - container: article
          inContainer: true
          background:
            color: '#333'
            image: ''
        - container: aside
          inContainer: false
          background:
            color: '#333'
            image: ''

       *************************************************************************/

      // Check if the current element is the last in an array
      // if so, convert object props to array members
      if ( isLastInArray ) {
        const arrayVersion = [];
        Object.entries( currentLevelObject[ parentName ] ).forEach( ( [ key, value ] ) => {
          // if object, just push the value
          if ( typeof value === 'object' ) {
            arrayVersion.push( value );
          } else {
            // if not object, create an object with the key and value and push it
            arrayVersion.push( { [ key ]: value } );
          }
        } );

        // replace the object with the array
        currentLevelObject[ parentName ] = arrayVersion;
      }
    }
  };

  return formObject.main;
};