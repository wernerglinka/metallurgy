# Jest Tests Documentation

## Overview

This document provides an overview of how Jest tests are structured and executed in the `metallurgy` project. It covers the setup, configuration, and individual test cases to help you understand the testing process.

## Project Structure

The relevant files and directories for testing are organized as follows:

```
└── 📁__tests__
    └── 📁e2e
    └── 📁lib
        └── select-project.test.js
    └── debug-setup.test.js
    └── setup.js
```


## Configuration

### `jest.config.js`

This is the main configuration file for Jest. It specifies the test environment, file extensions, test match patterns, and other settings.

```js
export default {
  testEnvironment: 'jsdom',
  moduleFileExtensions: [ 'js', 'json' ],
  transform: {},
  testMatch: [
    '**/__tests__/**/*.test.js',
    '!**/__tests__/e2e/**/*.test.js'
  ],
  moduleDirectories: [ 'node_modules', 'screens' ],
  roots: [ '<rootDir>' ],
  modulePaths: [ '<rootDir>' ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/screens/$1'
  },
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [ 'text', 'lcov', 'html' ],
  setupFilesAfterEnv: [ './__tests__/setup.js' ],
  testPathIgnorePatterns: [ '/node_modules/', '/dist/' ],
  clearMocks: true,
  verbose: true
};
```
### `jest.e2e.config.js`
This configuration file is for end-to-end (E2E) tests. It extends the main configuration and specifies additional settings for E2E tests.

```js
const baseConfig = require( './jest.config' );

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  testMatch: [ '**/__tests__/e2e/**/*.test.js' ],
  setupFiles: [ './__tests__/e2e/setup.js' ],
};
```

## Setup
### `__tests__/setup.js`

This file sets up the global environment for tests. It creates mock functions and configures the `window` object with `electronAPI`.

```js
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
```

## Test Cases
### `__tests__/lib/select-project.test.js`

This file contains tests for the `selectProject` function. Each test case verifies a specific behavior of the function.

```js
import { jest, describe, it, expect } from '@jest/globals';
import { mocks } from '../setup.js';
import { selectProject } from '../../screens/lib/select-project.js';

describe( 'selectProject', () => {
  beforeEach( () => {
    jest.clearAllMocks();
  } );

  it( 'should handle dialog cancellation', async () => {
    mocks.dialog.open.mockResolvedValueOnce( {
      canceled: true,
      filePaths: []
    } );

    const result = await selectProject();
    expect( result ).toBe( 'abort' );
  } );

  it( 'should handle empty file paths', async () => {
    mocks.dialog.open.mockResolvedValueOnce( {
      canceled: false,
      filePaths: []
    } );

    const result = await selectProject();
    expect( result ).toBe( 'abort' );
  } );

  it( 'should validate selected path exists', async () => {
    const testPath = '/test/path';
    mocks.dialog.open.mockResolvedValueOnce( {
      canceled: false,
      filePaths: [ testPath ]
    } );
    mocks.files.exists.mockResolvedValueOnce( true );

    const result = await selectProject();
    expect( result ).toBe( testPath );
    expect( mocks.files.exists ).toHaveBeenCalledWith( testPath );
  } );

  it( 'should throw error if selected path does not exist', async () => {
    const testPath = '/nonexistent/path';
    mocks.dialog.open.mockResolvedValueOnce( {
      canceled: false,
      filePaths: [ testPath ]
    } );
    mocks.files.exists.mockResolvedValueOnce( false );

    await expect( selectProject() ).rejects.toThrow( 'Failed to select project folder: Selected folder does not exist' );
  } );

  it( 'should call dialog.open with correct parameters', async () => {
    mocks.dialog.open.mockResolvedValueOnce( {
      canceled: true,
      filePaths: []
    } );

    await selectProject();

    expect( mocks.dialog.open ).toHaveBeenCalledWith( 'showOpenDialog', {
      title: 'Select Project Folder',
      message: 'Choose a folder for your project',
      properties: [ 'openDirectory' ],
      buttonLabel: 'Select Project Folder'
    } );
  } );

  it( 'should handle dialog errors', async () => {
    mocks.dialog.open.mockRejectedValueOnce( new Error( 'Dialog failed' ) );

    await expect( selectProject() ).rejects.toThrow( 'Failed to select project folder: Dialog failed' );
  } );
} );
```
### `__tests__/debug-setup.test.js`

This file contains a test to verify the initial setup of the `window` object and `electronAPI`.

```js
import { jest, describe, it, expect } from '@jest/globals';
import { mocks } from './setup.js';

describe( 'Test Environment Setup', () => {
  it( 'window object should be properly configured', () => {
    console.log( 'Initial window state:', {
      hasWindow: !!window,
      hasElectronAPI: !!window?.electronAPI,
      hasDialog: !!window?.electronAPI?.dialog,
      hasOpen: !!window?.electronAPI?.dialog?.open
    } );

    expect( window ).toBeDefined();
    expect( window.electronAPI ).toBeDefined();
    expect( window.electronAPI.dialog ).toBeDefined();
    expect( window.electronAPI.dialog.open ).toBeDefined();
    expect( typeof window.electronAPI.dialog.open ).toBe( 'function' );

    window.electronAPI.dialog.open( 'test' );
    expect( mocks.dialog.open ).toHaveBeenCalledWith( 'test' );
  } );
} );
``` 

## Running Tests
You can run the tests using the following commands defined in `package.json`:

- `npm run test`: Runs all tests.
- `npm run test:watch`: Runs tests in watch mode.
- `npm run test:coverage`: Runs tests and generates a coverage report.
- `npm run test:e2e`: Runs end-to-end tests.

## Conclusion

This document provides a comprehensive overview of how Jest tests are set up and executed in the metallurgy project. By following the structure and examples provided, you should be able to understand and extend the test cases as needed. 