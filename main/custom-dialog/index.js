import { ipcMain, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

// Read external files from same directory
const dialogStyles = readFileSync( path.join( __dirname, 'styles.css' ), 'utf8' );
const dialogScript = readFileSync( path.join( __dirname, 'script.js' ), 'utf8' );

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
      preload: path.join( __dirname, 'preload.cjs' )
    },
    ...options
  } );

  return win;
};

const createCustomDialogHTML = ( { type, message, logOutput = '', buttons, input } ) => `
 <!DOCTYPE html>
 <html>
  <head>
    <style>${ dialogStyles }</style>
  </head>
  <body>
    <div class="message">${ message }</div>
    ${ type === 'progress' ? `<div class="log-output">${ logOutput }</div>` : '' }
    ${ input ? '<div class="input"><input type="text" id="inputValue" /></div>' : '' }
    <div class="buttons">
     ${ buttons ? buttons.map( btn => `<button>${ btn }</button>` ).join( '' ) : '' }
    </div>
    <script>${ dialogScript }</script>
  </body>
 </html>
`;

export const createCustomDialog = ( window ) => {
  let progressWindow = null;

  return {
    showMessage: async ( options ) => {
      return new Promise( ( resolve ) => {
        const win = createDialogWindow( window, options );

        const responseHandler = ( event, response ) => {
          win.close();
          resolve( { response } );
        };

        ipcMain.removeAllListeners( 'custom-dialog-response' );
        ipcMain.once( 'custom-dialog-response', responseHandler );

        win.on( 'closed', () => {
          ipcMain.removeListener( 'custom-dialog-response', responseHandler );
        } );

        const html = createCustomDialogHTML( options );
        win.loadURL( `data:text/html;charset=utf-8,${ encodeURIComponent( html ) }` );

        if ( !options.buttons || options.buttons.length === 0 ) {
          progressWindow = win;
          resolve( { type: 'progress', window: win } );
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
