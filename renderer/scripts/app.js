// ...existing code...

window.electronAPI.onUpdateProgressContent( ( _event, { message, logOutput } ) => {
  const messageEl = document.querySelector( '.message' );
  const logEl = document.querySelector( '.log-output' );

  if ( messageEl ) {
    messageEl.textContent = message;
  }
  if ( logEl ) {
    logEl.textContent = logOutput;
  }
} );

// Handle npm install trigger
window.electronAPI.onNpmInstallTrigger( async ( event, projectPath ) => {
  try {
    console.log( 'Starting npm install in:', projectPath );
    await handleNpmInstall( projectPath );
  } catch ( error ) {
    console.error( 'Failed to run npm install:', error );
  }
} );

const handleNpmInstall = async ( projectPath ) => {
  try {
    if ( !projectPath ) {
      throw new Error( 'Project path is required' );
    }
    const result = await window.electronAPI.npmCommand( {
      command: 'install',
      projectPath
    } );
    return result;
  } catch ( error ) {
    console.error( 'NPM install error:', error );
    throw error; // Re-throw to be handled by caller
  }
};

// ...existing code...
