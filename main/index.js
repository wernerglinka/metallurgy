const { app, BrowserWindow, ipcMain, dialog } = require( 'electron' );
const path = require( 'node:path' );
const fs = require( 'node:fs' );
const matter = require( 'gray-matter' );
const yaml = require( 'yaml' );

/**
 * Application Constants
 */
const CONSTANTS = {
  PROJECT_CONFIG_DIR: '.metallurgy',
  PROJECT_CONFIG_FILE: 'projectData.json',
  WINDOW_CONFIG: {
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join( __dirname, 'preload.js' )
    }
  }
};

/**
 * File System Utilities
 */
const FileSystem = {
  /**
   * Recursively reads directory structure
   * @param {string} rootDir - Root directory to start from
   * @returns {Object} Tree structure of directories and files
   */
  readDirectoryStructure( rootDir ) {
    function readAllFiles( dir ) {
      const files = fs.readdirSync( dir, { withFileTypes: true } );
      let result = [];

      for ( const file of files ) {
        if ( file.name === '.DS_Store' ) continue;

        const fullPath = path.join( dir, file.name );
        if ( file.isDirectory() ) {
          result.push( { [ file.name ]: readAllFiles( fullPath ) } );
        } else {
          result.push( { [ file.name ]: fullPath } );
        }
      }

      return result;
    }

    return { [ rootDir ]: readAllFiles( rootDir ) };
  },

  /**
   * Ensures a directory exists, creates if it doesn't
   * @param {string} dirPath - Directory path to check/create
   */
  ensureDirectoryExists( dirPath ) {
    if ( !fs.existsSync( dirPath ) ) {
      fs.mkdirSync( dirPath, { recursive: true } );
    }
  }
};

/**
 * Main Window Management
 */
class MainWindow {
  static window = null;

  static createWindow() {
    MainWindow.window = new BrowserWindow( CONSTANTS.WINDOW_CONFIG );
    MainWindow.window.loadFile( 'screens/home/index.html' );
  }

  static getWindow() {
    return MainWindow.window;
  }
}

/**
 * IPC Handler Functions
 */
const IPCHandlers = {
  async handleDialog( event, method, params ) {
    return dialog[ method ]( MainWindow.getWindow(), params );
  },

  async handleWriteFile( event, projectData ) {
    try {
      const filePath = path.join(
        projectData.projectPath,
        CONSTANTS.PROJECT_CONFIG_DIR,
        CONSTANTS.PROJECT_CONFIG_FILE
      );
      FileSystem.ensureDirectoryExists( path.dirname( filePath ) );
      fs.writeFileSync( filePath, JSON.stringify( projectData ) );
      return { status: 'success' };
    } catch ( err ) {
      return { status: 'failure', error: err.message };
    }
  },

  async handleReadFile( event, filePath ) {
    try {
      const data = fs.readFileSync( filePath, 'utf8' );
      return { status: 'success', data: JSON.parse( data ) };
    } catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  },

  async handleMarkdownOperations( event, operation, filePath, data = null ) {
    try {
      switch ( operation ) {
        case 'read':
          const fileContent = fs.readFileSync( filePath, 'utf8' );
          const { data: frontmatter, content } = matter( fileContent );
          return { status: 'success', data: { frontmatter, content: content || '' } };

        case 'write':
          FileSystem.ensureDirectoryExists( path.dirname( filePath ) );
          fs.writeFileSync( filePath, data );
          return { status: 'success' };

        default:
          throw new Error( `Unknown operation: ${ operation }` );
      }
    } catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  },

  async handleDeleteFile( event, filePath ) {
    try {
      fs.unlinkSync( filePath );
      return { status: 'success' };
    } catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  },

  async handleGetTemplates( event, templatesDirName ) {
    try {
      const templatesDir = path.join( __dirname, '../', templatesDirName );
      const allFiles = FileSystem.readDirectoryStructure( templatesDir );
      return { status: 'success', data: allFiles };
    } catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  },

  async handleWriteObjectToFile( event, { path: filePath, obj } ) {
    try {
      const yamlString = yaml.stringify( obj );
      fs.writeFileSync( filePath, `---\n${ yamlString }---\n` );
      return { status: 'success' };
    } catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  },

  async handleConfirmationDialog( event, message ) {
    const options = {
      type: 'question',
      buttons: [ 'Yes', 'No' ],
      defaultId: 1,
      title: 'Confirm',
      message
    };
    const result = await dialog.showMessageBox( options );
    return result.response === 0;
  }
};

/**
 * Application Setup
 */
function setupIPC() {
  ipcMain.handle( 'dialog', IPCHandlers.handleDialog );
  ipcMain.handle( 'writeFile', IPCHandlers.handleWriteFile );
  ipcMain.handle( 'readFile', IPCHandlers.handleReadFile );
  ipcMain.handle( 'readMarkdownFile', ( e, path ) =>
    IPCHandlers.handleMarkdownOperations( e, 'read', path ) );
  ipcMain.handle( 'writeMarkdownFile', ( e, path, data ) =>
    IPCHandlers.handleMarkdownOperations( e, 'write', path, data ) );
  ipcMain.handle( 'deleteFile', IPCHandlers.handleDeleteFile );
  ipcMain.handle( 'getTemplates', IPCHandlers.handleGetTemplates );
  ipcMain.handle( 'writeObjectToFile', IPCHandlers.handleWriteObjectToFile );
  ipcMain.handle( 'showConfirmationDialog', IPCHandlers.handleConfirmationDialog );
  ipcMain.handle( 'readDirectory', ( e, path ) => ( {
    status: 'success',
    data: FileSystem.readDirectoryStructure( path )
  } ) );
}

app.whenReady().then( () => {
  MainWindow.createWindow();
  setupIPC();

  // MacOS-specific window handling
  app.on( 'activate', () => {
    if ( BrowserWindow.getAllWindows().length === 0 ) {
      MainWindow.createWindow();
    }
  } );
} );

// Handle window closing
app.on( 'window-all-closed', () => {
  if ( process.platform !== 'darwin' ) {
    app.quit();
  }
} );