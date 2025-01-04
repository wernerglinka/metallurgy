// git-handlers.js

import simpleGit from 'simple-git';
import { readdirSync } from 'node:fs';
import prompt from 'electron-prompt';

/**
 * Executes a series of Git operations: check status, add changes, commit, and push
 * @param {SimpleGit} git - Initialized SimpleGit instance for the repository
 * @param {string} message - Commit message
 * @returns {Promise<Object>} Operation result
 * @returns {Object} result.commitResult - Result from git.commit()
 * @returns {Object} result.status - Repository status before commit
 * @throws {Error} If no changes to commit
 * @throws {Error} If git operations fail
 * @example
 * const git = simpleGit('/path/to/repo');
 * const result = await executeGitOperations(git, 'feat: add new feature');
 */
const executeGitOperations = async ( git, message ) => {
  // Check status first
  const status = await git.status();
  if ( !status.modified.length && !status.not_added.length ) {
    throw new Error( 'No changes to commit' );
  }

  // Add all changes
  await git.add( '.' );
  const commitResult = await git.commit( message );
  await git.push();
  return { commitResult, status };
};

/**
 * Handles committing changes to a repository
 * @param {Event} event - IPC event
 * @param {Object} params - Commit parameters
 * @returns {Promise<Object>} Operation result
 */
const handleGitCommit = async ( event, { projectPath, message }, dialogOps ) => {
  const timeoutPromise = new Promise( ( _, reject ) => {
    setTimeout( () => reject( new Error( 'Commit operation timed out' ) ), 30000 ); // 30 seconds
  } );

  try {
    const git = simpleGit( projectPath );

    // Show progress dialog
    await dialogOps.showCustomMessage( {
      type: 'info',
      message: 'Committing changes...\nPlease wait.',
      buttons: []
    } );

    try {
      // Race between commit operation and timeout
      const { commitResult, status } = await Promise.race( [
        executeGitOperations( git, message ),
        timeoutPromise
      ] );

      // Close progress dialog
      dialogOps.closeProgress();

      // Success dialog
      await dialogOps.showCustomMessage( {
        type: 'info',
        message: 'Changes committed successfully',
        buttons: [ 'OK' ]
      } );

      return {
        status: 'success',
        data: {
          commitHash: commitResult.commit,
          summary: status.modified
        }
      };

    } catch ( error ) {
      dialogOps.closeProgress();

      const errorMessage = error.message === 'Commit operation timed out'
        ? 'The commit operation took too long. Please try again.'
        : `Error during commit: ${ error.message }`;

      // Error dialog
      await dialogOps.showCustomMessage( {
        type: 'error',
        message: errorMessage,
        buttons: [ 'OK' ]
      } );

      return {
        status: 'failure',
        error: error.message
      };
    }
  } catch ( error ) {
    dialogOps.closeProgress();
    return {
      status: 'failure',
      error: error.message
    };
  }
};

/**
 * Clones a Git repository to a local path
 * @param {Event} event - IPC event object
 * @param {Object} params - Clone parameters
 * @param {string} params.repoUrl - Repository URL
 * @returns {Object} Operation result
 * @returns {string} result.status - 'success' or 'failure'
 * @returns {string} [result.error] - Error message if failed
 * @example
 * await handleGitClone(event, {
 *   repoUrl: 'https://github.com/user/repo.git'
 * })
 */
const handleGitClone = async ( event, { repoUrl }, dialogOps ) => {
  try {
    if ( !repoUrl ) {
      // Show custom input dialog for URL
      const urlResult = await dialogOps.showCustomMessage( {
        type: 'custom',
        message: 'Enter Git Repository URL:',
        input: true,
        buttons: [ 'Clone', 'Cancel' ]
      } );

      // Make sure we got a valid result
      if ( !urlResult?.response?.value || urlResult.response.index !== 0 ) {
        return { status: 'cancelled' };
      }

      repoUrl = urlResult.response.value;

      // Wait for window to close before proceeding
      await new Promise( ( resolve ) => {
        // Check if window is already closed
        if ( !urlResult.window.isDestroyed() ) {
          urlResult.window.on( 'closed', () => {
            // Small delay after close event
            setTimeout( resolve, 500 );
          } );
        } else {
          // Window already closed, resolve after small delay
          setTimeout( resolve, 100 );
        }
      } );
    }

    // Show dialog to select directory to clone into
    const dialogResult = await dialogOps.showDialog( 'showOpenDialog', {
      properties: [ 'openDirectory', 'createDirectory' ]
    } );
    const localPath = dialogResult.data.filePaths?.[ 0 ];

    if ( !localPath ) {
      throw new Error( 'No directory selected' );
    }

    // check if the directory is empty
    const dirContents = readdirSync( localPath );
    if ( dirContents.length > 0 ) {
      const shouldProceed = await dialogOps.showConfirmation(
        'Selected directory is not empty. Would you like to select a different directory?'
      );

      if ( shouldProceed ) {
        const recursiveResult = await handleGitClone( event, { repoUrl }, dialogOps );
        return recursiveResult; // Just return the result from recursive call
      }
      return { status: 'failure', error: 'Operation cancelled - Directory not empty' };
    }

    // Clone repository to selected directory
    await simpleGit().clone( repoUrl, localPath );

    // Show success dialog and ask to proceed - only show this at the final successful clone
    const shouldProceed = await dialogOps.showConfirmation(
      `Repository successfully cloned to:\n${ localPath }\n\nWould you like to work with this project?`
    );

    return {
      status: 'success',
      proceed: shouldProceed,
      path: localPath
    };

  } catch ( error ) {
    console.error( 'Clone Repository Error:', error );
    return { status: 'failure', error: error.message };
  }
};

const handleGitStatus = async ( event, { projectPath } ) => {
  try {
    const git = simpleGit( projectPath );
    const status = await git.status();
    return {
      status: 'success',
      data: {
        modified: status.modified,
        not_added: status.not_added
      }
    };
  } catch ( error ) {
    return {
      status: 'failure',
      error: error.message
    };
  }
};

/**
 * Creates and returns IPC handlers for git operations
 * @returns {Object} Object containing handler functions
 */
const createGitHandlers = ( window, dialogOps ) => ( {
  handleGitCommit: ( event, params ) => handleGitCommit( event, params, dialogOps ),
  handleGitClone: ( event, params ) => handleGitClone( event, params, dialogOps ),
  handleGitStatus
} );

export { createGitHandlers };