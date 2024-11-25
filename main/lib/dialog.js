// main/lib/dialog.js
import { dialog } from 'electron';

// Pure function to create dialog options
export const createConfirmationOptions = ( message ) => ( {
  type: 'question',
  buttons: [ 'Yes', 'No' ],
  defaultId: 1,
  title: 'Confirm',
  message
} );

// Dialog operations with error handling wrapper
export const createDialogOperations = ( window ) => ( {
  showDialog: async ( method, params ) => {
    try {
      const result = await dialog[ method ]( window, params );
      return { status: 'success', data: result };
    } catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  },

  showConfirmation: async ( message ) => {
    try {
      const options = createConfirmationOptions( message );
      const result = await dialog.showMessageBox( window, options );
      return { status: 'success', data: result.response === 0 };
    } catch ( error ) {
      return { status: 'failure', error: error.message };
    }
  }
} );