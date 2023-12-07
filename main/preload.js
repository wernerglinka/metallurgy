const { contextBridge, ipcRenderer } = require( 'electron' );

contextBridge.exposeInMainWorld( 'electronAPI', {
  // use to open a dialog from the renderer process to the main process
  openDialog: ( method, config ) => ipcRenderer.invoke( 'dialog', method, config ),
  writeFile: ( data ) => ipcRenderer.invoke( 'writeFile', data )

  // we can also expose variables, not just functions
} );