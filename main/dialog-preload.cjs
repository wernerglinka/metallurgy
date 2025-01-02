const { contextBridge, ipcRenderer } = require( 'electron' );

contextBridge.exposeInMainWorld( 'electronAPI', {
  customResponse: ( response ) => ipcRenderer.send( 'custom-dialog-response', response )
} );