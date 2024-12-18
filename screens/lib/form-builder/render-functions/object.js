import helpers from '../helpers/index.js';
import renderFunctions from './index.js';

/**
 * @function renderObject
 * @param {*} field 
 * @param {*} implicitDef 
 * @returns The HTML string for an object field
 */

export function renderObject( field, implicitDef, implicitSchema ) {
  // Objects contain nested fields in `field.value` array
  const label = helpers.getLabel( field );
  const requiredSup = helpers.getRequiredSup( implicitDef );
  const hint = ( implicitDef && implicitDef.label ) ? `${ implicitDef.label } Object` : 'Sections Object';

  // Render nested fields
  const innerFields = field.value.map( subField => renderFunctions.renderField( subField, implicitSchema ) ).join( '' );

  return `<div class="form-element is-object label-exists no-drop" draggable="true">
      ${ renderFunctions.renderSortHandleHTML() }
      <label class="object-name label-wrapper label-exists">
        <span>${ label }${ requiredSup }</span>
        <span class="hint">${ hint }</span>
        <input type="text" class="element-label" placeholder="Label Placeholder" value="${ label }" readonly>
        ${ renderFunctions.renderCollapseButtonsHTML() }
      </label>
      <div class="object-dropzone dropzone js-dropzone" data-wrapper="is-object">
        ${ innerFields }
      </div>
      ${ renderFunctions.renderButtonWrapperHTML( implicitDef ) }
    </div>`;
}