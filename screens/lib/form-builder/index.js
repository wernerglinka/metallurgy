import { ICONS } from '../../icons/index.js';

/**
 * Transform a given incoming schema (derived from YAML frontmatter) into an HTML form.
 * This function also takes an implicitSchema (explicit schema) that provides overrides and additional detail.
 *
 * @param {Object} incomingSchema - The incoming schema object as shown in the prompt.
 * @param {Object[]} implicitSchema - The array of field definitions that augment the rendering logic.
 * @return {string} HTML string representing the form.
 */

export function buildForm( incomingSchema, implicitSchema ) {
  // A helper function to find a field definition from the implicit schema
  // based on a given field name.
  function findImplicitDefinition( name ) {
    return implicitSchema.find( def => def.name === name );
  }

  // Generate drag handle SVG snippet (as per the final desired HTML)
  function getSortHandleHTML() {
    return `<span class="sort-handle">${ ICONS.DRAG_HANDLE }</span>`;
  }

  // For delete/add buttons and so forth, you'd similarly define snippets.
  // Here we define a few placeholders:
  function getDeleteButtonHTML() {
    return `<div class="delete-button">${ ICONS.DELETE }</div>`;
  }

  function getAddButtonHTML() {
    return `<div class="add-button button">${ ICONS.ADD }</div>`;
  }

  function getCollapseButtonsHTML() {
    return `<span class="collapse-icon">${ ICONS.COLLAPSE }${ ICONS.COLLAPSED }</span>`;
  }

  // Helper function to render add/delete buttons based on implicitDef rules
  function renderButtonWrapper( implicitDef ) {
    // By default, assume no buttons
    let addBtn = '';
    let deleteBtn = '';

    // Only render add button if noDuplication is NOT true
    if ( !implicitDef || !implicitDef.noDuplication ) {
      addBtn = getAddButtonHTML();
    }

    // Only render delete button if noDeletion is NOT true
    if ( !implicitDef || !implicitDef.noDeletion ) {
      deleteBtn = getDeleteButtonHTML();
    }

    // If no buttons, return an empty wrapper to maintain structure
    if ( !addBtn && !deleteBtn ) {
      return '<div class="button-wrapper"></div>';
    }

    return `<div class="button-wrapper">${ addBtn }${ deleteBtn }</div>`;
  }


  // A helper to get placeholders/hints. If the implicit schema has a placeholder, we use it; otherwise fallback.
  function getPlaceholder( def, fallback ) {
    return ( def && def.placeholder ) || fallback || '';
  }

  // A helper to get labels. If the implicit schema has a label, we use it; otherwise fallback to a generic label.
  function getLabel( def, fallbackType = 'Text' ) {
    return ( def && def.label ) || ( fallbackType + ' Label' );
  }

  // For fields that must show a star if required
  function getRequiredSup( def ) {
    return ( def && def.isRequired ) ? '<sup>*</sup>' : '';
  }

  // For fields that differ in type: text, checkbox, select, etc.
  // We'll assume incoming fields have "type" (text, checkbox, object, list, array)
  // and if implicit schema differs, we override.
  function renderField( field ) {
    const fieldName = field.label;
    const implicitDef = findImplicitDefinition( fieldName );

    // Determine element type
    let elementType = field.type;
    if ( implicitDef && implicitDef.type ) {
      elementType = implicitDef.type;
    }

    // Common wrappers and classes:
    // form-element, label-wrapper, content-wrapper, etc.
    // The provided HTML structure is quite extensive. We’ll try to mimic it.
    // For simplicity, we’ll handle just a few field types as examples:
    switch ( elementType ) {
      case 'text':
      case 'url':
      case 'number':
      case 'image':
        return renderTextLike( field, implicitDef );
      case 'textarea':
        return renderTextarea( field, implicitDef );
      case 'checkbox':
        return renderCheckbox( field, implicitDef );
      case 'select':
        return renderSelect( field, implicitDef );
      case 'object':
        return renderObject( field, implicitDef );
      case 'list':
        return renderList( field, implicitDef );
      case 'array':
        return renderArray( field, implicitDef );
      default:
        // default fallback: treat as text
        return renderTextLike( field, implicitDef );
    }
  }

  function renderTextLike( field, implicitDef ) {
    const label = getLabel( implicitDef, 'Text' );
    const placeholder = getPlaceholder( implicitDef, field.placeholder );
    const requiredSup = getRequiredSup( implicitDef );
    const hint = ( implicitDef && implicitDef.label ) ? `Text for ${ implicitDef.label } element` : 'Text for Text element';
    const value = field.value || '';

    return `<div class="form-element null label-exists no-drop" draggable="true">
      ${ getSortHandleHTML() }
      <label class="label-wrapper">
        <span>${ label }${ requiredSup }</span>
        <div>
          <input type="text" class="element-label" placeholder="Label Placeholder" readonly="">
        </div>
      </label>
      <label class="content-wrapper">
        <span class="hint">${ hint }</span>
        <div>
          <input type="${ ( implicitDef && implicitDef.type ) || 'text' }" class="element-value" placeholder="${ placeholder }" value="${ value }">
        </div>
      </label>
      ${ renderButtonWrapper( implicitDef ) }
    </div>`;
  }

  function renderTextarea( field, implicitDef ) {
    const label = getLabel( implicitDef, 'Text' );
    const placeholder = getPlaceholder( implicitDef, field.placeholder );
    const requiredSup = getRequiredSup( implicitDef );
    const hint = 'Text for Text element';
    const value = field.value || '';

    // According to the example, textarea might have class "is-editor"
    return `<div class="form-element null label-exists no-drop" draggable="true">
      ${ getSortHandleHTML() }
      <label class="label-wrapper">
        <span>${ label }${ requiredSup }</span>
        <div>
          <input type="text" class="element-label" placeholder="Label Placeholder" readonly="">
        </div>
      </label>
      <label class="content-wrapper">
        <span class="hint">${ hint }</span>
        <div>
          <textarea class="element-value is-editor" placeholder="Click to open editor">${ value }</textarea>
        </div>
      </label>
      ${ renderButtonWrapper( implicitDef ) }
    </div>`;
  }

  function renderCheckbox( field, implicitDef ) {
    const label = getLabel( implicitDef, 'Checkbox' );
    const requiredSup = getRequiredSup( implicitDef );
    const hint = 'Initial state of checkbox';
    const value = field.value === true ? 'true' : 'false';
    const placeholder = field.placeholder || 'Text Placeholder';

    return `<div class="form-element null label-exists no-drop" draggable="true">
      ${ getSortHandleHTML() }
      <label class="label-wrapper">
        <span>${ label }${ requiredSup }</span>
        <div>
          <input type="text" class="element-label" placeholder="Label Placeholder" readonly="">
        </div>
      </label>
      <label class="content-wrapper">
        <span class="hint">${ hint }</span>
        <div>
          <input type="checkbox" role="switch" class="element-value" value="${ value }" placeholder="${ placeholder }" ${ field.value ? 'checked' : '' }>
        </div>
      </label>
      ${ renderButtonWrapper( implicitDef ) }
    </div>`;
  }

  function renderSelect( field, implicitDef ) {
    const label = getLabel( implicitDef, 'Text' );
    const requiredSup = getRequiredSup( implicitDef );
    const hint = ( implicitDef && implicitDef.label ) ? `Text for ${ implicitDef.label } element` : 'Text for Text element';
    const options = ( implicitDef && implicitDef.options ) || [];
    const currentValue = field.value || implicitDef.default || '';

    const optionsHTML = options.map( opt => {
      const selected = ( opt.value === currentValue ) ? 'selected' : '';
      return `<option value="${ opt.value }" ${ selected }>${ opt.label }</option>`;
    } ).join( '' );

    return `<div class="form-element null label-exists no-drop" draggable="true">
      ${ getSortHandleHTML() }
      <label class="label-wrapper">
        <span>${ label }${ requiredSup }</span>
        <div>
          <input type="text" class="element-label" placeholder="Label Placeholder" readonly="">
        </div>
      </label>
      <label class="content-wrapper">
        <span class="hint">${ hint }</span>
        <div>
          <select class="element-value">${ optionsHTML }</select>
        </div>
      </label>
      ${ renderButtonWrapper( implicitDef ) }
    </div>`;
  }

  function renderObject( field, implicitDef ) {
    // Objects contain nested fields in `field.value` array
    const label = getLabel( implicitDef, 'Object' );
    const requiredSup = getRequiredSup( implicitDef );
    const hint = ( implicitDef && implicitDef.label ) ? `${ implicitDef.label } Object` : 'Sections Object';

    // Render nested fields
    const innerFields = field.value.map( subField => renderField( subField ) ).join( '' );

    return `<div class="form-element is-object label-exists no-drop" draggable="true">
      ${ getSortHandleHTML() }
      <label class="object-name label-wrapper label-exists">
        <span>${ label }${ requiredSup }</span>
        <span class="hint">${ hint }</span>
        <input type="text" class="element-label" placeholder="Label Placeholder" readonly="">
        ${ getCollapseButtonsHTML() }
      </label>
      <div class="object-dropzone dropzone js-dropzone" data-wrapper="is-object">
        ${ innerFields }
      </div>
      ${ renderButtonWrapper( implicitDef ) }
    </div>`;
  }

  function renderList( field, implicitDef ) {
    // Lists are basically arrays of simple values (strings)
    const label = getLabel( implicitDef, 'List' );
    const requiredSup = getRequiredSup( implicitDef );
    const items = field.value || [];
    const itemsHTML = items.map( itemValue => {
      return `<li>
        <input type="text" class="list-item" placeholder="Item Placeholder" value="${ itemValue }">
        <div class="button-wrapper">
          ${ getAddButtonHTML() }
          ${ getDeleteButtonHTML() }
        </div>
      </li>`;
    } ).join( '' );

    return `<div class="form-element is-list label-exists no-drop" draggable="true">
      ${ getSortHandleHTML() }
      <label class="label-wrapper object-name">
        <span>${ label }${ requiredSup }</span>
        <input type="text" class="element-label" placeholder="Label Placeholder" readonly="">
      </label>
      <ul>
        ${ itemsHTML }
      </ul>
      ${ renderButtonWrapper( implicitDef ) }
    </div>`;
  }

  function renderArray( field, implicitDef ) {
    // Arrays are similar to objects, but represent an ordered collection of objects.
    // Typically you'll have multiple object-like items inside `field.value`.
    const label = getLabel( implicitDef, 'Array' );
    const requiredSup = getRequiredSup( implicitDef );
    const hint = ( implicitDef && implicitDef.label ) ? `${ implicitDef.label } Array` : 'Sections Array';

    const innerFields = field.value.map( subField => renderField( subField ) ).join( '' );

    return `<div class="form-element is-array label-exists no-drop" draggable="true">
      ${ getSortHandleHTML() }
      <label class="object-name label-wrapper">
        <span>${ label }${ requiredSup }</span>
        <input type="text" class="element-label" placeholder="Array Name" readonly="">
        ${ getCollapseButtonsHTML() }
      </label>
      <div class="array-dropzone dropzone js-dropzone" data-wrapper="is-array">
        ${ innerFields }
      </div>
      ${ renderButtonWrapper( implicitDef ) }
    </div>`;
  }

  // Now start building the form. According to the given schema, it starts with a main form element.
  // The main incoming schema has a "fields" array.
  const dropzoneStart = `<div id="dropzone" class="dropzone js-main-dropzone js-dropzone">`;
  const dropzoneEnd = `</div>`;

  // Render top-level fields:
  const fieldsHTML = incomingSchema.fields.map( f => renderField( f ) ).join( '' );

  // return HTML string
  return dropzoneStart + fieldsHTML + dropzoneEnd;
}

// Usage example with given schemas:

// The user provided `incomingSchema` and `explicitSchema`. 
// Just call:
// const html = buildForm(incomingSchema, explicitSchema);
// console.log(html);

