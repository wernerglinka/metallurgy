// __tests__/setup.js
import { jest } from '@jest/globals';

// Create mock functions
const mockDialogOpen = jest.fn();
const mockFilesExists = jest.fn();
const mockWriteYAML = jest.fn();  // Add writeYAML mock

// Set up window and electronAPI before any tests run
Object.defineProperty( globalThis, 'window', {
  value: {
    electronAPI: {
      dialog: {
        open: mockDialogOpen
      },
      files: {
        exists: mockFilesExists,
        writeYAML: mockWriteYAML  // Add to electronAPI.files
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
    exists: mockFilesExists,
    writeYAML: mockWriteYAML
  }
};

// Reset all mocks before each test
beforeEach( () => {
  jest.clearAllMocks();
} );