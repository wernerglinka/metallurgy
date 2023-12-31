const { app, BrowserWindow, ipcMain, dialog } = require( 'electron' );
const path = require( 'node:path' );
const fs = require( 'node:fs' );
const matter = require( 'gray-matter' );
const yaml = require( 'yaml' );

/**
 * @function readAllFiles
 * @param {*} dir 
 * @param {*} result 
 * @returns {Object} Contains all files in the directory and subdirectories
 * @description Creates object (result) with arrays of file paths, organized by
 *     their parent directory paths. The result object is initialized as an empty
 *     object and gets populated recursively as the function traverses the 
 *     directory structure.
 */
function readDirectoryStructure( rootDir ) {
  function readAllFiles( dir ) {
    const files = fs.readdirSync( dir, { withFileTypes: true } );
    let result = [];

    for ( const file of files ) {
      // Skip .DS_Store files
      if ( file.name === '.DS_Store' ) {
        continue;
      }
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
}

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow( {
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
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
      return { status: 'success', data: data };
    }
    catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  } );

  // handle a write markdown file request from the renderer process
  ipcMain.handle( 'writeMarkdownFile', ( e, filePath, data ) => {
    try {
      // Ensure the directory exists
      if ( !fs.existsSync( filePath ) ) {
        fs.mkdirSync( filePath, { recursive: true } );
      }

      fs.writeFileSync( filePath, JSON.stringify( projectData ) );
      return { status: 'success' };
    }
    catch ( err ) {
      return { status: 'failure', error: err.message };
    }
  } );

  // handle a read markdown file request from the renderer process
  ipcMain.handle( 'readMarkdownFile', ( e, filePath ) => {
    try {
      const fileContent = fs.readFileSync( filePath, 'utf8' );
      const frontmatter = matter( fileContent ).data;
      const content = matter( fileContent ).content || '';

      return { status: 'success', data: { frontmatter, content } };
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

  // handle a read directory request from the renderer process
  ipcMain.handle( 'readDirectory', ( e, directoryPath ) => {
    try {
      const allFiles = readDirectoryStructure( directoryPath );
      return { status: 'success', data: allFiles };
    }
    catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  } );

  // handle a get templates request from the renderer process
  ipcMain.handle( 'getTemplates', ( e, templatesDirName ) => {
    // build path to templates directory
    const templatesDir = path.join( __dirname, '../', templatesDirName );
    try {
      const allFiles = readDirectoryStructure( templatesDir );
      return { status: 'success', data: allFiles };
    }
    catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  } );

  // handle a request to write an object as YAML/frontmatter to a markdown file
  ipcMain.handle( 'writeObjectToFile', async ( e, data ) => {
    // convert the object to frontmatter yaml
    let yamlString = yaml.stringify( data.obj );

    try {
      fs.writeFileSync( data.path, `---\n${ yamlString }---\n` );
    } catch ( error ) {
      console.error( "Error writing to file:", error );
    }
  } );

  // Quit when all windows are closed, except on macOS
  app.on( 'window-all-closed', () => {
    if ( process.platform !== 'darwin' ) app.quit();
  } );

} );