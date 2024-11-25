import { ipcMain } from 'electron';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'yaml';
import { createDialogOperations } from './dialog.js';
import { fileURLToPath } from 'url';
import { CONSTANTS } from './constants.js';
import { FileSystem } from './file-system.js';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

const createIPCHandlers = ( window ) => {
  const dialogOps = createDialogOperations( window );

  return {
    // Dialog operations
    handleDialog: async ( event, method, params ) =>
      dialogOps.showDialog( method, params ),

    handleConfirmationDialog: async ( event, message ) =>
      dialogOps.showConfirmation( message ),

    // File operations
    handleWriteFile: async ( event, projectData ) => {
      const filePath = path.join(
        projectData.projectPath,
        CONSTANTS.PROJECT_CONFIG_DIR,
        CONSTANTS.PROJECT_CONFIG_FILE
      );

      FileSystem.ensureDirectoryExists( path.dirname( filePath ) );
      return FileSystem.writeFile( filePath, JSON.stringify( projectData ) );
    },

    handleReadFile: async ( event, filePath ) => {
      const result = FileSystem.readFile( filePath );
      if ( result.status === 'success' ) {
        try {
          return {
            status: 'success',
            data: JSON.parse( result.data )
          };
        } catch ( error ) {
          return {
            status: 'failure',
            error: 'Invalid JSON format'
          };
        }
      }
      return result;
    },

    handleMarkdownOperations: async ( event, operation, filePath, data = null ) => {
      try {
        switch ( operation ) {
          case 'read': {
            const result = FileSystem.readFile( filePath );
            if ( result.status === 'success' ) {
              const { data: frontmatter, content } = matter( result.data );
              return {
                status: 'success',
                data: { frontmatter, content: content || '' }
              };
            }
            return result;
          }

          case 'write': {
            FileSystem.ensureDirectoryExists( path.dirname( filePath ) );
            return FileSystem.writeFile( filePath, data );
          }

          default:
            throw new Error( `Unknown operation: ${ operation }` );
        }
      } catch ( error ) {
        return { status: 'failure', error: error.message };
      }
    },

    handleDeleteFile: async ( event, filePath ) =>
      FileSystem.deleteFile( filePath ),

    handleGetTemplates: async ( event, templatesDirName ) => {
      const templatesDir = FileSystem.getAbsolutePath( templatesDirName );
      return {
        status: 'success',
        data: FileSystem.readDirectoryStructure( templatesDir )
      };
    },

    handleWriteObjectToFile: async ( event, { path: filePath, obj } ) => {
      const yamlString = yaml.stringify( obj );
      const content = `---\n${ yamlString }---\n`;
      return FileSystem.writeFile( filePath, content );
    }
  };
};

const setupIPC = ( window ) => {
  const handlers = createIPCHandlers( window );

  // Register all handlers
  ipcMain.handle( 'dialog', handlers.handleDialog );
  ipcMain.handle( 'showConfirmationDialog', handlers.handleConfirmationDialog );
  ipcMain.handle( 'writeFile', handlers.handleWriteFile );
  ipcMain.handle( 'readFile', handlers.handleReadFile );
  ipcMain.handle( 'readMarkdownFile', ( e, path ) =>
    handlers.handleMarkdownOperations( e, 'read', path ) );
  ipcMain.handle( 'writeMarkdownFile', ( e, path, data ) =>
    handlers.handleMarkdownOperations( e, 'write', path, data ) );
  ipcMain.handle( 'deleteFile', handlers.handleDeleteFile );
  ipcMain.handle( 'getTemplates', handlers.handleGetTemplates );
  ipcMain.handle( 'writeObjectToFile', handlers.handleWriteObjectToFile );
  ipcMain.handle( 'readDirectory', ( e, path ) =>
    ( { status: 'success', data: FileSystem.readDirectoryStructure( path ) } ) );
};

export { createIPCHandlers, setupIPC };