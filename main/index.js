const { app, BrowserWindow, ipcMain, dialog } = require( 'electron' );
const path = require( 'node:path' );
const fs = require( 'node:fs' );

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow( {
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join( __dirname, 'preload.js' )
    }
  } );

  mainWindow.loadFile( 'screens/home/index.html' );
};

// Load the window when Electron is ready
app.whenReady().then( () => {

  createWindow();

  // On macOS, re-create the window when the dock icon is clicked
  app.on( 'activate', () => {
    if ( BrowserWindow.getAllWindows().length === 0 ) {
      createWindow();
    };
  } );

  // handle dialog requests from the renderer process
  ipcMain.handle( 'dialog', ( e, method, params ) => {
    return dialog[ method ]( mainWindow, params );
  } );

  // handle a write file request from the renderer process
  ipcMain.handle( 'writeFile', ( e, projectData ) => {
    try {
      // Create the path for the project data file
      const filePath = path.join( projectData.projectPath, "/.metallurgy/projectData.json" );
      const directoryPath = path.dirname( filePath );

      // Ensure the directory exists
      if ( !fs.existsSync( directoryPath ) ) {
        fs.mkdirSync( directoryPath, { recursive: true } );
      }

      fs.writeFileSync( filePath, JSON.stringify( projectData ) );
      return { status: 'success' };
    }
    catch ( err ) {
      return { status: 'failure', error: err.message };
    }
  } );

  // handle a read file request from the renderer process
  ipcMain.handle( 'readFile', ( e, filePath ) => {
    try {
      const data = fs.readFileSync( filePath, 'utf8' );
      return { status: 'success', data: JSON.parse( data ) };
    }
    catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  } );

  // handle delete file request from the renderer process
  ipcMain.handle( 'deleteFile', ( e, filePath ) => {
    try {
      fs.unlinkSync( filePath );
      return { status: 'success' };
    }
    catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  } );

  // handle confirmation dialog requests from the renderer process
  ipcMain.handle( 'showConfirmationDialog', async ( event, message ) => {
    const options = {
      type: 'question',
      buttons: [ 'Yes', 'No' ],
      defaultId: 1,
      title: 'Confirm',
      message: message,
    };

    const result = await dialog.showMessageBox( options );
    return result.response === 0; // Returns true if 'Yes' was clicked
  } );

  // Quit when all windows are closed, except on macOS
  app.on( 'window-all-closed', () => {
    if ( process.platform !== 'darwin' ) app.quit();
  } );

} );