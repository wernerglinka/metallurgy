// npm-handlers.js
import { spawn } from 'child_process';

export const createNPMHandlers = ( window, dialogOps ) => {
  let currentProcess = null;
  let progressWindow = null;
  let hasResolved = false;

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
      console.log( 'handleNpmCommand called with command:', command, 'and projectPath:', projectPath );
      if ( !projectPath ) {
        console.log( 'Project path is missing' );
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
          buttons: [] // Removed "Stop" button
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

          console.log( 'Spawned npm process with PID:', currentProcess.pid );

          currentProcess.stdout.on( 'data', ( data ) => {
            const text = data.toString();
            // Convert to lowercase for case-insensitive match
            const lowerText = text.toLowerCase();
            logContent += text;
            updateProgress( message, logContent );

            // Check for either "browsersync" or "build success"
            if ( !hasResolved &&
              ( lowerText.includes( 'browsersync' ) || lowerText.includes( 'build success' ) )
            ) {
              hasResolved = true;
              console.log( 'Start successful, leaving process running' );
              dialogOps.closeProgress();
              progressWindow = null;
              // Inform your UI to toggle menu items
              window.webContents.send( 'update-menu-state', { canStart: false, canStop: true } );
              resolve( { status: 'success', data: logContent } );
            }
          } );

          currentProcess.stderr.on( 'data', ( data ) => {
            logContent += data.toString();
            updateProgress( message, logContent );
            console.log( 'stderr data:', data.toString() );
          } );

          currentProcess.on( 'close', async ( code ) => {
            console.log( 'npm process closed with code:', code );
            if ( hasResolved ) {
              console.log( 'Process closed after start, ignoring final dialog.' );
              currentProcess = null;
              window.webContents.send( 'update-menu-state', { canStart: true, canStop: false } );
              return;
            }
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
                  console.log( 'Success dialog shown' );
                  resolve( { status: 'success', data: logContent } );
                } else {
                  throw new Error( `npm ${ command } failed with code ${ code }` );
                }
              }, 1000 );
            } catch ( error ) {
              console.log( 'Error in close handler:', error );
              reject( error );
            }
          } );

          currentProcess.on( 'error', ( error ) => {
            console.log( 'Error spawning npm process:', error );
            dialogOps.closeProgress();
            progressWindow = null;
            currentProcess = null;
            reject( error );
          } );
        } );

        return result;

      } catch ( error ) {
        console.log( 'Error in handleNpmCommand:', error );
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
      console.log( 'handleNpmStop called' );
      try {
        if ( currentProcess ) {
          currentProcess.kill();
          console.log( 'npm process killed' );
          currentProcess = null;
        }

        if ( progressWindow ) {
          dialogOps.closeProgress();
          progressWindow = null;
        }

        // Toggle menu items
        window.webContents.send( 'update-menu-state', { canStart: true, canStop: false } );

        return { status: 'success' };
      } catch ( error ) {
        console.log( 'Error in handleNpmStop:', error );
        return { status: 'failure', error: error.message };
      }
    }
  };

  return handlers;
};