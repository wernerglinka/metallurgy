const { app, BrowserWindow, ipcMain } = require( 'electron' );
const path = require( 'node:path' );


const createWindow = () => {
  const win = new BrowserWindow( {
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join( __dirname, 'preload.js' )
    }
  } );

  win.loadFile( 'screens/index.html' );
};

// Load the window when Electron is ready
app.whenReady().then( () => {
  ipcMain.handle( 'ping', () => 'pong' );

  createWindow();

  // On macOS, re-create the window when the dock icon is clicked
  app.on( 'activate', () => {
    if ( BrowserWindow.getAllWindows().length === 0 ) {
      createWindow();
    };
  } );

} );

// Quit when all windows are closed, except on macOS
app.on( 'window-all-closed', () => {
  if ( process.platform !== 'darwin' ) app.quit();
} );