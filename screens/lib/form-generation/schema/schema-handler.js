/**
 * @module schema/schema-handler
 * @description Handles reading and processing of explicit schema files
 */

import { StorageOperations } from '../../storage-operations.js';

/**
 * Reads and processes explicit schema file
 * @returns {Promise<Array|null>} Schema array or null if not found/invalid
 * @throws {Error} If project path not found
 */
export const getExplicitSchema = async () => {
  const projectPath = StorageOperations.getProjectPath();
  if ( !projectPath ) {
    throw new Error( 'No project path found in storage' );
  }

  const schemaFilePath = `${ projectPath }/.metallurgy/frontmatterTemplates/fields.json`;
  const schemaExists = await window.electronAPI.files.exists( schemaFilePath );

  if ( !schemaExists ) {
    return null;
  }

  const { status, data, error } = await window.electronAPI.files.read( schemaFilePath );
  if ( status === 'failure' ) {
    console.error( 'Error reading schema file:', error );
    return null;
  }

  return data;
};