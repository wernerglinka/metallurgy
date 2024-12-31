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
    showConfirmation: ( message ) => ipcRenderer.invoke( 'showConfirmationDialog', message ),
    prompt: ( message ) => ipcRenderer.invoke( 'dialog-prompt', message )
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
  git: {
    clone: async ( repoUrl ) => await ipcRenderer.invoke( 'git-clone', { repoUrl } ),
    commit: ( params ) => ipcRenderer.invoke( 'git-commit', params )
  },

  // npm operations
  npm: {
    install: ( projectPath ) => ipcRenderer.invoke( 'npm-command', { command: 'install', projectPath } ),
    start: ( projectPath ) => ipcRenderer.invoke( 'npm-command', { command: 'start', projectPath } ),
    stop: () => ipcRenderer.invoke( 'npm-stop' ),
    onOutput: ( callback ) => ipcRenderer.on( 'npm-output', callback ),
    onError: ( callback ) => ipcRenderer.on( 'npm-error', callback ),
    removeListener: ( channel, callback ) => ipcRenderer.removeListener( channel, callback )
  },

  // IPC Renderer operations, used for main menu updfates from the renderer
  ipcRenderer: {
    send: ( channel, data ) => ipcRenderer.send( channel, data ),
    on: ( channel, callback ) => ipcRenderer.on( channel, callback ),
    removeListener: ( channel, callback ) => ipcRenderer.removeListener( channel, callback )
  }
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld( 'electronAPI', electronAPI );