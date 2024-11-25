/**
 * NOTE:
 * Preload scripts in Electron run in a special context that's more compatible 
 * with CommonJS, Even when the main process uses ES modules, preload scripts 
 * should use CommonJS. The contextBridge API is specifically designed to work 
 * with CommonJS modules in the preload context.
 */
const { contextBridge, ipcRenderer } = require( 'electron' );
const fs = require( 'node:fs' );
const convertToYAML = require( 'yaml' );

/**
 * API exposed to renderer process
 * Groups functionality into logical categories for better organization
 */
const electronAPI = {
  // Dialog operations
  dialog: {
    open: ( method, config ) => ipcRenderer.invoke( 'dialog', method, config ),
    showConfirmation: ( message ) => ipcRenderer.invoke( 'showConfirmationDialog', message )
  },

  // File operations
  files: {
    write: ( data ) => ipcRenderer.invoke( 'writeFile', data ),
    read: ( filePath ) => ipcRenderer.invoke( 'readFile', filePath ),
    delete: ( filePath ) => ipcRenderer.invoke( 'deleteFile', filePath ),
    exists: async ( filePath ) => {
      try {
        return fs.existsSync( filePath );
      } catch {
        return false;
      }
    }
  },

  // Directory operations
  directories: {
    read: ( directoryPath ) => ipcRenderer.invoke( 'readDirectory', directoryPath ),
    getTemplates: ( templatesDirName ) => ipcRenderer.invoke( 'getTemplates', templatesDirName )
  },

  // Markdown specific operations
  markdown: {
    write: ( data ) => ipcRenderer.invoke( 'writeMarkdownFile', data ),
    read: ( filePath ) => ipcRenderer.invoke( 'readMarkdownFile', filePath ),
    writeObject: ( data ) => ipcRenderer.invoke( 'writeObjectToFile', data )
  },

  // Utility functions
  utils: {
    toYAML: ( args ) => convertToYAML.stringify( args )
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld( 'electronAPI', electronAPI );