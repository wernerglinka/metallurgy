import { jest } from '@jest/globals';

// Create mock functions
const mockDialogOpen = jest.fn();
const mockFilesExists = jest.fn();

// Set up window and electronAPI before any tests run
Object.defineProperty( globalThis, 'window', {
  value: {
    electronAPI: {
      dialog: {
        open: mockDialogOpen
      },
      files: {
        exists: mockFilesExists
      }
    }
  },
  writable: true
} );

// Export mocks for direct access in tests
export const mocks = {
  dialog: {
    open: mockDialogOpen
  },
  files: {
    exists: mockFilesExists
  }
};

// Reset all mocks before each test
beforeEach( () => {
  jest.clearAllMocks();
} );