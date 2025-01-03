// npm-handlers.js
import { spawn } from 'child_process';

export const createNPMHandlers = ( window, dialogOps ) => {
  let currentProcess = null;
  let progressWindow = null;

  const updateProgress = ( message, log ) => {
    // Use the actual BrowserWindow instance
    if ( progressWindow && !progressWindow.isDestroyed() ) {
      progressWindow.webContents.send( 'update-dialog-content', {
        message: message,
        logOutput: log
      } );
    }
  };

  const handlers = {
    handleNpmCommand: async ( event, { command, projectPath } ) => {
      if ( !projectPath ) {
        return {
          status: 'failure',
          error: 'Project path is required'
        };
      }

      try {
        const message = `Running npm ${ command }...`;
        let logContent = '';  // Reset log content

        // Store the actual window reference
        let result = await dialogOps.showCustomMessage( {
          type: 'progress',
          message: message,
          logOutput: logContent,
          buttons: []
        } );
        progressWindow = result.window; // Store the window reference

        // Wait for dialog to be ready
        await new Promise( resolve => setTimeout( resolve, 100 ) );

        result = await new Promise( ( resolve, reject ) => {
          const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

          currentProcess = spawn( npm, [ command ], {
            cwd: projectPath,
            shell: true
          } );

          currentProcess.stdout.on( 'data', ( data ) => {
            logContent += data.toString();
            updateProgress( message, logContent );
          } );

          currentProcess.stderr.on( 'data', ( data ) => {
            logContent += data.toString();
            updateProgress( message, logContent );
          } );

          currentProcess.on( 'close', async ( code ) => {
            try {
              if ( code === 0 ) {
                logContent += '\n✅ Operation completed successfully!';
              } else {
                logContent += `\n❌ Operation failed with code ${ code }`;
              }
              updateProgress( message, logContent );

              // Wait a moment before showing final dialog
              setTimeout( async () => {
                dialogOps.closeProgress();
                progressWindow = null;
                currentProcess = null;

                if ( code === 0 ) {
                  // Show success dialog with OK button
                  await dialogOps.showCustomMessage( {
                    type: 'info',
                    message: `npm ${ command } completed successfully`,
                    buttons: [ 'OK' ]
                  } );
                  resolve( { status: 'success', data: logContent } );
                } else {
                  throw new Error( `npm ${ command } failed with code ${ code }` );
                }
              }, 1000 );
            } catch ( error ) {
              reject( error );
            }
          } );

          currentProcess.on( 'error', ( error ) => {
            dialogOps.closeProgress();
            progressWindow = null;
            currentProcess = null;
            reject( error );
          } );
        } );

        return result;

      } catch ( error ) {
        // Always clean up on error
        if ( progressWindow ) {
          dialogOps.closeProgress();
          progressWindow = null;
        }
        if ( currentProcess ) {
          currentProcess.kill();
          currentProcess = null;
        }

        // Show error dialog
        await dialogOps.showCustomMessage( {
          type: 'error',
          message: `Error: ${ error.message }`,
          buttons: [ 'OK' ]
        } );

        return {
          status: 'failure',
          error: error.message
        };
      }
    },

    handleNpmStop: async () => {
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
    }
  };

  return handlers;
};