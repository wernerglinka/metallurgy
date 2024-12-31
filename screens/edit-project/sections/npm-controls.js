// npm-controls.js

/**
 * State management for npm controls
 */
const state = {
  isRunning: false,
  projectPath: null
};

/**
 * Updates visibility of start/stop buttons based on running state
 */
const updateButtonStates = () => {
  const startBtn = document.getElementById( 'npm-start' );
  const stopBtn = document.getElementById( 'npm-stop' );

  if ( startBtn && stopBtn ) {
    startBtn.style.display = state.isRunning ? 'none' : 'inline-block';
    stopBtn.style.display = state.isRunning ? 'inline-block' : 'none';
  }
};

/**
 * Handles output messages from npm commands
 * @param {string} message - Output message to display
 */
const handleOutput = ( message ) => {
  const outputEl = document.getElementById( 'npm-output' );
  if ( outputEl ) {
    outputEl.textContent += message;
    outputEl.scrollTop = outputEl.scrollHeight;
  }
};

/**
 * Handles error messages
 * @param {string} message - Error message to display
 */
const handleError = ( message ) => {
  const errorEl = document.getElementById( 'npm-error' );
  if ( errorEl ) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
  }
};

/**
 * Clears output and error messages
 */
const clearMessages = () => {
  const outputEl = document.getElementById( 'npm-output' );
  const errorEl = document.getElementById( 'npm-error' );

  if ( outputEl ) outputEl.textContent = '';
  if ( errorEl ) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
};

/**
 * Starts the npm project
 */
const startProject = async () => {
  if ( !state.projectPath ) return;

  try {
    clearMessages();
    const result = await window.electronAPI.npm.start( state.projectPath );

    if ( result.status === 'success' ) {
      state.isRunning = true;
      updateButtonStates();
    } else {
      handleError( result.error );
    }
  } catch ( error ) {
    handleError( error.message );
  }
};

/**
 * Stops the running npm process
 */
const stopProject = async () => {
  try {
    const result = await window.electronAPI.npm.stop();

    if ( result.status === 'success' ) {
      state.isRunning = false;
      updateButtonStates();
    } else {
      handleError( result.error );
    }
  } catch ( error ) {
    handleError( error.message );
  }
};

/**
 * Updates the tooltip for an SVG button
 * @param {HTMLElement} button - The button element
 * @param {string} tooltipText - The tooltip text to display
 */
const updateTooltip = ( button ) => {
  // Find or create the title element within the SVG
  let titleElement = button.querySelector( 'title' );
  if ( !titleElement ) {
    titleElement = document.createElementNS( 'http://www.w3.org/2000/svg', 'title' );
    button.appendChild( titleElement );
  }
  return titleElement;
};

/**
 * Disables the install button and updates its state
 * @param {HTMLElement} button - The install button element
 */
const disableInstallButton = ( button ) => {
  button.classList.add( 'disabled' );
  updateTooltip( button ).textContent = 'Dependencies already installed';
  button.removeEventListener( 'click', installDeps );
};

/**
 * Installs project dependencies
 */
const installDeps = async () => {
  if ( !state.projectPath ) return;

  const installBtn = document.getElementById( 'npm-install' );
  if ( !installBtn ) return;

  try {
    clearMessages();
    installBtn.classList.add( 'installing' );
    updateTooltip( installBtn ).textContent = 'Installing dependencies...';

    const result = await window.electronAPI.npm.install( state.projectPath );

    if ( result.status === 'failure' ) {
      handleError( result.error );
      installBtn.classList.remove( 'installing' );
      updateTooltip( installBtn ).textContent = 'Install dependencies';
    } else {
      handleOutput( 'Dependencies installed successfully!\n' );
      disableInstallButton( installBtn );
    }
  } catch ( error ) {
    handleError( error.message );
    installBtn.classList.remove( 'installing' );
    updateTooltip( installBtn ).textContent = 'Install dependencies';
  }
};

/**
 * Checks if node_modules directory exists
 * @param {string} projectPath - Path to project directory
 * @returns {Promise<boolean>} True if node_modules exists
 */
const hasNodeModules = async ( projectPath ) => {
  try {
    const result = await window.electronAPI.directories.exists(
      `${ projectPath }/node_modules`
    );
    return result.status === 'success' && result.data === true;
  } catch ( error ) {
    console.error( 'Error checking node_modules:', error );
    return false;
  }
};

/**
 * Sets up event listeners for npm operations
 */
const setupListeners = async () => {
  // Remove any existing listeners
  window.electronAPI.npm.removeListener( 'npm-output', handleOutput );
  window.electronAPI.npm.removeListener( 'npm-error', handleError );

  // Add output and error listeners
  window.electronAPI.npm.onOutput( ( event, message ) => handleOutput( message ) );
  window.electronAPI.npm.onError( ( event, message ) => handleError( message ) );

  // Add button click listeners
  document.getElementById( 'npm-start' )?.addEventListener( 'click', startProject );
  document.getElementById( 'npm-stop' )?.addEventListener( 'click', stopProject );

  // Check for node_modules before setting up install button
  const installBtn = document.getElementById( 'npm-install' );
  if ( installBtn ) {
    const hasModules = await hasNodeModules( state.projectPath );
    if ( hasModules ) {
      disableInstallButton( installBtn );
    } else {
      updateTooltip( installBtn ).textContent = 'Install dependencies';
      installBtn.addEventListener( 'click', installDeps );
    }
  }
};

/**
 * Initializes npm controls
 * @param {string} path - Project path
 */
const initNpmControls = ( path ) => {
  state.projectPath = path;
  setupListeners();
  updateButtonStates();
};

export {
  initNpmControls,
  updateButtonStates,
  startProject,
  stopProject,
  installDeps
};