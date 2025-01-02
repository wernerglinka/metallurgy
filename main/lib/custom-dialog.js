// custom-dialog.js

import { ipcMain, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );



const createDialogWindow = ( parentWindow, options ) => {
  const win = new BrowserWindow( {
    parent: parentWindow,
    modal: true,
    frame: false,
    width: 600,
    height: 400,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join( __dirname, '../dialog-preload.cjs' )
    },
    ...options
  } );

  return win;
};

const createCustomDialogHTML = ( { type, message, buttons, input } ) => `
 <!DOCTYPE html>
 <html>
  <head>
    <style>
     body {
      font-family: system-ui;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
      display: flex;
      flex-direction: column;
     }
     .message {
      flex-grow: 0;
      margin: 20px 0;
      white-space: pre-wrap;
     }
     .input {
      margin: 10px 0;
     }
     input {
      box-sizing: border-box;
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      max-width: 100%;
     }
     .buttons {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: auto;
     }
     button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background: #0066cc;
      color: white;
      cursor: pointer;
     }
    </style>
  </head>
  <body>
    <div class="message">${ message }</div>
    ${ input ? '<div class="input"><input type="text" id="inputValue" /></div>' : '' }
    <div class="buttons">
     ${ buttons.map( btn => `<button>${ btn }</button>` ).join( '' ) }
    </div>
    <script>
     document.querySelectorAll('button').forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const value = document.getElementById('inputValue')?.value;
        window.electronAPI.customResponse({ index, value });
      });
     });
    </script>
  </body>
 </html>
`;

export const createCustomDialog = ( window ) => {
  let progressWindow = null;

  return {
    showMessage: async ( options ) => {
      return new Promise( ( resolve ) => {
        const win = createDialogWindow( window, options );

        // Use once instead of handleOnce
        const responseHandler = ( event, response ) => {
          win.close();
          resolve( { response } );
        };

        // Remove any existing listeners
        ipcMain.removeAllListeners( 'custom-dialog-response' );

        // Add one-time event listener
        ipcMain.once( 'custom-dialog-response', responseHandler );

        // Clean up on window close
        win.on( 'closed', () => {
          ipcMain.removeListener( 'custom-dialog-response', responseHandler );
        } );

        const html = createCustomDialogHTML( options );
        win.loadURL( `data:text/html;charset=utf-8,${ encodeURIComponent( html ) }` );

        if ( !options.buttons || options.buttons.length === 0 ) {
          progressWindow = win;
          resolve( { type: 'progress' } );
        }
      } );
    },

    closeProgress: () => {
      if ( progressWindow ) {
        progressWindow.close();
        progressWindow = null;
      }
    }
  };
};