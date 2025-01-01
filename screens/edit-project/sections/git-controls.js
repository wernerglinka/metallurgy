// git-controls.js
const state = {
  projectPath: null
};

const handleCommit = async () => {
  if ( !state.projectPath ) return;

  try {
    const result = await window.electronAPI.dialog.prompt( 'Enter commit message:' );
    if ( !result ) return;  // User cancelled

    const commitResult = await window.electronAPI.git.commit( {
      projectPath: state.projectPath,
      message: result
    } );

    if ( commitResult.status === 'failure' ) {
      console.error( 'Commit failed:', commitResult.error );
    }
  } catch ( error ) {
    console.error( 'Commit error:', error );
  }
};

const setupGitListeners = () => {
  window.electronAPI.ipcRenderer.removeListener( 'git-commit-trigger', handleCommit );
  window.electronAPI.ipcRenderer.on( 'git-commit-trigger', () => handleCommit() );
};

const initGitControls = ( path ) => {
  state.projectPath = path;
  setupGitListeners();
};

export { initGitControls };