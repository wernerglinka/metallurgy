/**
 * @module field-initialization
 * @description Handles field initialization and explicit field schema handling
 * 
 * An `explicit field` is a field that has a schema definition that is explicitly defined
 */

/**
 * Processes explicit field schema
 * @param {Object} field - Field to process
 * @param {Array} explicitSchemaArray - Array of explicit field schemas
 * @returns {Object} Field data and permissions
 * @description This function checks if a field has an explicit schema definition
 * and updates its properties accordingly. For non-object/array fields, it handles:
 * - Type overrides if explicit type differs
 * - Default values
 * - Select field options
 * - Placeholders
 * It also determines add/delete button permissions based on schema settings.
 */
export const processExplicitField = ( field, explicitSchemaArray ) => {

  // Return unmodified field if no schema array or array is empty
  if ( !Array.isArray( explicitSchemaArray ) || explicitSchemaArray.length === 0 ) {
    return { field, permissions: { addDeleteButton: true, addDuplicateButton: true } };
  }

  const explicitFieldObject = explicitSchemaArray.find( schema => schema.name === field.label );

  // Get the permits of the add/delete buttons
  // If the explicit field object does not exist, add the buttons
  const permissions = {
    addDeleteButton: explicitFieldObject ? !explicitFieldObject.noDeletion : true,
    addDuplicateButton: explicitFieldObject ? !explicitFieldObject.noDuplication : true
  };

  // Loop over the explicit schema array to find the field object
  // for simple types, the field name is the same as the label
  if ( field.type !== "object" && field.type !== "array" ) {
    // Check if the implied and explicit field types are the same
    // if not, overwrite the implied field type
    if ( explicitFieldObject && explicitFieldObject.type !== field.type ) {
      field.type = explicitFieldObject.type;
    }

    // If the field value is an empty string but the explicit field object
    // has a default value, update the field value
    if ( field.value === "" && explicitFieldObject?.default ) {
      field.value = explicitFieldObject.default;
    }

    // If the field type is a select and the explicit field object has options
    // update the field options and add the default value
    if ( field.type === "select" && explicitFieldObject.options ) {
      field.options = explicitFieldObject.options;
      field.default = explicitFieldObject.default;
    }

    // Finally, add the placeholder from the explicit field object
    field.placeholder = explicitFieldObject ? explicitFieldObject.placeholder : field.placeholder;
  }

  return { field, permissions };
};