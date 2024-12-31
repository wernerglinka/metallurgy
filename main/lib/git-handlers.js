import simpleGit from 'simple-git';
import { readdirSync } from 'node:fs';
import prompt from 'electron-prompt';
import { createDialogOperations } from './dialog.js';

/**
 * Handles committing changes to a repository
 * @param {Event} event - IPC event
 * @param {Object} params - Commit parameters
 * @returns {Promise<Object>} Operation result
 */
const handleGitCommit = async ( event, { projectPath, message } ) => {
  try {
    const git = simpleGit( projectPath );

    // Check status first
    const status = await git.status();
    if ( !status.modified.length && !status.not_added.length ) {
      return {
        status: 'failure',
        error: 'No changes to commit'
      };
    }

    // Add all changes
    await git.add( '.' );

    // Create commit
    const commitResult = await git.commit( message );

    // Push changes
    await git.push();

    return {
      status: 'success',
      data: {
        commitHash: commitResult.commit,
        summary: status.modified
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
      const result = await prompt( {
        title: 'Enter Git Repo URL',
        label: 'Repository URL:',
        inputAttrs: { type: 'url' },
        type: 'input'
      } );
      if ( !result ) {
        throw new Error( 'No repo URL provided' );
      }
      repoUrl = result;
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

/**
 * Creates and returns IPC handlers for git operations
 * @returns {Object} Object containing handler functions
 */
const createGitHandlers = ( window, dialogOps ) => ( {
  handleGitCommit,
  handleGitClone: ( event, params ) => handleGitClone( event, params, dialogOps )
} );

export { createGitHandlers };