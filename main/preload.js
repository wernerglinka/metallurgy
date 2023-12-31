const { contextBridge, ipcRenderer } = require( 'electron' );
const path = require( 'node:path' );
const fs = require( 'node:fs' );
const convertToYAML = require( 'yaml' );

contextBridge.exposeInMainWorld( 'electronAPI', {
  // use to open a dialog from the renderer process to the main process
  openDialog: ( method, config ) => ipcRenderer.invoke( 'dialog', method, config ),
  writeFile: ( data ) => ipcRenderer.invoke( 'writeFile', data ),
  readFile: ( filePath ) => ipcRenderer.invoke( 'readFile', filePath ),
  deleteFile: ( filePath ) => ipcRenderer.invoke( 'deleteFile', filePath ),
  checkFileExists: async ( filePath ) => {
    try {
      if ( fs.existsSync( filePath ) ) {
        return true;
      }
      else {
        return false;
      }
    } catch ( error ) {
      return false;
    }
  },
  getTemplates: ( templatesDirName ) => ipcRenderer.invoke( 'getTemplates', templatesDirName ),
  showConfirmationDialog: ( message ) => ipcRenderer.invoke( 'showConfirmationDialog', message ),
  readDirectory: ( directoryPath ) => ipcRenderer.invoke( 'readDirectory', directoryPath ),
  writeMarkdownFile: ( data ) => ipcRenderer.invoke( 'writeMarkdownFile', data ),
  readMarkdownFile: ( filePath ) => ipcRenderer.invoke( 'readMarkdownFile', filePath ),
  writeObjectToFile: ( data ) => ipcRenderer.invoke( 'writeObjectToFile', data ),
  toYAML: ( args ) => convertToYAML.stringify( args ),
} );