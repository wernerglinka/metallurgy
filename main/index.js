import { config } from 'dotenv'; config();
import { app, BrowserWindow, session } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { setupIPC } from './lib/ipc-handlers.js';
import { FileSystem } from './lib/file-system.js';
import { CONSTANTS } from './lib/constants.js';
import { isDev, isMac } from './lib/env.js';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

// Define CSP configuration
const cspConfig = {
  'default-src': [ "'self'" ],
  'script-src': [ "'self'", "https://cdn.jsdelivr.net" ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    "https://maxcdn.bootstrapcdn.com",
    "https://cdn.jsdelivr.net",
    "https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css"
  ],
  'img-src': [ "'self'", "data:", "https://maxcdn.bootstrapcdn.com" ],
  'connect-src': [
    "'self'",
    "https://cdn.jsdelivr.net",
    "https://maxcdn.bootstrapcdn.com",
    "https://cdn.jsdelivr.net/codemirror.spell-checker/latest/en_US.dic",
    "https://cdn.jsdelivr.net/codemirror.spell-checker/latest/en_US.aff;"
  ],
  'font-src': [
    "'self'",
    "https://maxcdn.bootstrapcdn.com",
    "https://maxcdn.bootstrapcdn.com/font-awesome/latest/fonts/fontawesome-webfont.woff",
    "https://maxcdn.bootstrapcdn.com/font-awesome/latest/fonts/fontawesome-webfont.woff2",
    "https://maxcdn.bootstrapcdn.com/font-awesome/latest/fonts/fontawesome-webfont.ttf"
  ],
  'base-uri': [ "'self'" ],
  'form-action': [ "'self'" ],
  'frame-ancestors': [ "'none'" ],
  'object-src': [ "'none'" ]
};

// Helper to format CSP string
const formatCspString = ( config ) => {
  return Object.entries( config )
    .map( ( [ key, values ] ) => `${ key } ${ values.join( ' ' ) }` )
    .join( '; ' );
};

// Set up security headers
const setupSecurityHeaders = ( responseHeaders ) => ( {
  ...responseHeaders,
  'Content-Security-Policy': [ formatCspString( cspConfig ) ],
  'X-Content-Type-Options': [ 'nosniff' ],
  'X-Frame-Options': [ 'DENY' ],
  'X-XSS-Protection': [ '1; mode=block' ]
} );

// Window management functions
const createWindow = async () => {
  const WINDOW_CONFIG = {
    ...CONSTANTS.WINDOW_CONFIG,
    webPreferences: {
      ...CONSTANTS.WINDOW_CONFIG.webPreferences,
      preload: path.join( __dirname, 'preload.cjs' ),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      enableRemoteModule: false
    }
  };

  mainWindow = new BrowserWindow( WINDOW_CONFIG );
  await mainWindow.loadFile( 'screens/home/index.html' );

  if ( isDev ) {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
};

let mainWindow = null;

const getWindow = () => mainWindow;

const initializeApp = async () => {
  // Set up global security headers before window creation
  session.defaultSession.webRequest.onHeadersReceived( ( details, callback ) => {
    callback( {
      responseHeaders: setupSecurityHeaders( details.responseHeaders )
    } );
  } );

  mainWindow = await createWindow();
  setupIPC( getWindow(), FileSystem );
};

const handleAppReady = () => {
  initializeApp().catch( console.error );

  app.on( 'activate', () => {
    if ( BrowserWindow.getAllWindows().length === 0 ) {
      createWindow();
    }
  } );
};

const handleWindowClose = () => {
  if ( process.platform !== 'darwin' ) {
    app.quit();
  }
};

// Setup application
app.whenReady().then( () => {
  // Ensure security headers are set before app is ready
  session.defaultSession.webRequest.onHeadersReceived( ( details, callback ) => {
    callback( {
      responseHeaders: setupSecurityHeaders( details.responseHeaders )
    } );
  } );

  handleAppReady();
} );

app.on( 'window-all-closed', handleWindowClose );

// Additional security measures
app.on( 'web-contents-created', ( event, contents ) => {
  // Handle navigation security
  contents.on( 'will-navigate', ( event, url ) => {
    if ( url.startsWith( 'file://' ) ) {
      return; // Allow local navigation
    }
    event.preventDefault(); // Block external navigation
  } );

  // Block new window creation
  contents.setWindowOpenHandler( () => ( { action: 'deny' } ) );

  // Prevent modification of window.opener
  contents.on( 'did-create-window', ( window ) => {
    window.webContents.setWindowOpenHandler( () => ( { action: 'deny' } ) );
  } );
} );