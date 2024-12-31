const state = {
  projectPath: null,
  isCommitting: false
};

/**
 * Updates button state during git operations
 * @param {HTMLElement} button 
 * @param {boolean} isProcessing 
 */
const updateCommitButtonState = ( button, isProcessing ) => {
  if ( isProcessing ) {
    button.classList.add( 'processing' );
    updateTooltip( button ).textContent = 'Committing changes...';
  } else {
    button.classList.remove( 'processing' );
    updateTooltip( button ).textContent = 'Commit changes';
  }
};

/**
 * Handles committing changes
 */
const handleCommit = async () => {
  const commitBtn = document.getElementById( 'git-commit' );
  if ( !commitBtn || state.isCommitting ) return;

  try {
    state.isCommitting = true;
    updateCommitButtonState( commitBtn, true );

    // Get commit message from user (you'll need to implement the UI for this)
    const message = await window.electronAPI.dialog.prompt( 'Enter commit message:' );
    if ( !message ) {
      state.isCommitting = false;
      updateCommitButtonState( commitBtn, false );
      return;
    }

    const result = await window.electronAPI.git.commit( {
      projectPath: state.projectPath,
      message
    } );

    if ( result.status === 'failure' ) {
      window.electronAPI.dialog.showError( result.error );
    }
  } catch ( error ) {
    window.electronAPI.dialog.showError( error.message );
  } finally {
    state.isCommitting = false;
    updateCommitButtonState( commitBtn, false );
  }
};

/**
 * Updates tooltip for SVG button
 * @param {HTMLElement} button 
 * @returns {SVGTitleElement}
 */
const updateTooltip = ( button ) => {
  let titleElement = button.querySelector( 'title' );
  if ( !titleElement ) {
    titleElement = document.createElementNS( 'http://www.w3.org/2000/svg', 'title' );
    button.appendChild( titleElement );
  }
  return titleElement;
};

/**
 * Initializes git controls
 * @param {string} path - Project path
 */
const initGitControls = ( path ) => {
  state.projectPath = path;
  const commitBtn = document.getElementById( 'git-commit' );
  if ( commitBtn ) {
    updateTooltip( commitBtn ).textContent = 'Commit changes';
    commitBtn.addEventListener( 'click', handleCommit );
  }
};

export { initGitControls };