// npm-handlers.js
import { spawn } from 'child_process';

/**
 * Executes an npm command and returns a promise
 * @param {string} command - The npm command to execute
 * @param {string} projectPath - Path to the project directory
 * @param {object} sender - IPC sender for progress updates
 * @returns {Promise<object>} Command result
 */
const executeNpmCommand = ( command, projectPath, sender ) => {
  return new Promise( ( resolve, reject ) => {
    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const child = spawn( npmCommand, [ command ], {
      cwd: projectPath,
      shell: true
    } );

    let output = '';
    let hasStarted = false;

    child.stdout.on( 'data', ( data ) => {
      const message = data.toString();
      output += message;
      sender.send( 'npm-output', message );

      // For 'start' command, resolve when we detect the server has started
      if ( command === 'start' && !hasStarted &&
        ( message.includes( 'Access URLs:' ) ||
          message.includes( 'Browsersync' ) ||
          message.includes( 'Local: http://localhost' ) ) ) {
        hasStarted = true;
        resolve( {
          status: 'success',
          data: output
        } );
      }
    } );

    child.stderr.on( 'data', ( data ) => {
      const message = data.toString();
      output += message;
      sender.send( 'npm-error', message );
    } );

    child.on( 'close', ( code ) => {
      // For 'start' command, we don't wait for close
      if ( command === 'start' ) {
        if ( !hasStarted ) {
          reject( {
            status: 'failure',
            error: `npm ${ command } failed to start\n${ output }`
          } );
        }
        return;
      }

      // For other commands (like install), wait for completion
      if ( code !== 0 ) {
        reject( {
          status: 'failure',
          error: `npm ${ command } failed with code ${ code }\n${ output }`
        } );
      } else {
        resolve( {
          status: 'success',
          data: output
        } );
      }
    } );

    child.on( 'error', ( error ) => {
      reject( {
        status: 'failure',
        error: `Failed to start npm ${ command }: ${ error.message }`
      } );
    } );
  } );
};

/**
 * Handles npm command execution
 * @param {Event} event - IPC event object
 * @param {Object} params - Command parameters
 * @returns {Promise<Object>} Operation result
 */
const handleNpmCommand = async ( event, { command, projectPath } ) => {
  try {
    return await executeNpmCommand( command, projectPath, event.sender );
  } catch ( error ) {
    return error;
  }
};

/**
 * Handles stopping npm processes
 * @param {Event} event - IPC event object
 * @returns {Promise<Object>} Operation result
 */
const handleNpmStop = async () => {
  try {
    // Different commands for Windows and Unix-like systems
    const command = process.platform === 'win32'
      ? `taskkill /F /FI "WINDOWTITLE eq browsersync*"`
      : `pkill -f "browsersync"`;

    await spawn( command, [], { shell: true } );

    // Also try to kill the metalsmith-dev process if it exists
    const metalsmithCommand = process.platform === 'win32'
      ? `taskkill /F /FI "WINDOWTITLE eq metalsmith-dev*"`
      : `pkill -f "metalsmith-dev"`;

    await spawn( metalsmithCommand, [], { shell: true } );

    return { status: 'success' };
  } catch ( error ) {
    // Even if the kill command fails (e.g., process not found), we don't want to treat it as an error
    return { status: 'success' };
  }
};

/**
 * Creates and returns IPC handlers for npm operations
 * @returns {Object} Object containing handler functions
 */
const createNPMHandlers = () => ( {
  handleNpmCommand,
  handleNpmStop
} );

export { createNPMHandlers };