/**
 * NOTE:
 * Preload scripts in Electron run in a special context that's more compatible 
 * with CommonJS, Even when the main process uses ES modules, preload scripts 
 * should use CommonJS. The contextBridge API is specifically designed to work 
 * with CommonJS modules in the preload context.
 */
const { contextBridge, ipcRenderer } = require( 'electron' );
const convertToYAML = require( 'yaml' );

/**
 * API exposed to renderer process
 * Groups functionality into logical categories for better organization
 */
const electronAPI = {
  onReady: ( callback ) => ipcRenderer.on( 'app-ready', callback ),

  // Dialog operations
  dialog: {
    open: ( method, config ) => ipcRenderer.invoke( 'dialog', method, config ),
    showConfirmation: ( message ) => ipcRenderer.invoke( 'showConfirmationDialog', message )
  },

  // File operations
  files: {
    write: ( data ) => ipcRenderer.invoke( 'writeFile', data ),
    writeYAML: ( data ) => ipcRenderer.invoke( 'writeYAMLFile', data ),
    read: ( filePath ) => ipcRenderer.invoke( 'readFile', filePath ),
    delete: ( filePath ) => ipcRenderer.invoke( 'deleteFile', filePath ),
    exists: ( filePath ) => ipcRenderer.invoke( 'fileExists', filePath )
  },

  // Directory operations
  directories: {
    read: ( directoryPath ) => ipcRenderer.invoke( 'readDirectory', directoryPath ),
    getTemplates: ( templatesDirName ) => ipcRenderer.invoke( 'getTemplates', templatesDirName ),
    delete: ( directoryPath ) => ipcRenderer.invoke( 'deleteDirectory', directoryPath ),
    exists: ( directoryPath ) => ipcRenderer.invoke( 'directoryExists', directoryPath )
  },

  // Markdown specific operations
  markdown: {
    write: ( data ) => ipcRenderer.invoke( 'writeMarkdownFile', data ),
    read: ( filePath ) => ipcRenderer.invoke( 'readMarkdownFile', filePath ),
    writeObject: ( data ) => ipcRenderer.invoke( 'writeObjectToFile', data )
  },

  // Utility functions that don't require file system access
  utils: {
    toYAML: ( args ) => convertToYAML.stringify( args )
  },

  // Git operations
  cloneRepository: async ( repoUrl ) => await ipcRenderer.invoke( 'cloneRepository', { repoUrl } )
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld( 'electronAPI', electronAPI );