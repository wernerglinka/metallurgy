import { config } from 'dotenv';
config();

import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { setupIPC } from './lib/ipc-handlers.js';
import { FileSystem } from './lib/file-system.js';
import { CONSTANTS } from './lib/constants.js';

import { isDev, isMac } from './lib/env.js';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

// Set preload path in window config
const WINDOW_CONFIG = {
  ...CONSTANTS.WINDOW_CONFIG,
  webPreferences: {
    ...CONSTANTS.WINDOW_CONFIG.webPreferences,
    preload: path.join( __dirname, 'preload.cjs' )
  }
};

// Store window instance
let mainWindow = null;

// Window management functions
const createWindow = () => {
  mainWindow = new BrowserWindow( WINDOW_CONFIG );
  mainWindow.loadFile( 'screens/home/index.html' );

  // Show devtools automatically if in development
  if ( isDev ) {
    mainWindow.webContents.openDevTools();
  }

  return mainWindow;
};

const getWindow = () => mainWindow;

// Application initialization
const initializeApp = () => {
  mainWindow = createWindow();
  setupIPC( getWindow(), FileSystem );
};

// Application event handlers
const handleAppReady = () => {
  initializeApp();

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
app.whenReady().then( handleAppReady );
app.on( 'window-all-closed', handleWindowClose );