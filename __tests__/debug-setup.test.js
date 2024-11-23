import { jest, describe, it, expect } from '@jest/globals';
import { mocks } from './setup.js';

describe( 'Test Environment Setup', () => {
  it( 'window object should be properly configured', () => {
    // Log initial state
    console.log( 'Initial window state:', {
      hasWindow: !!window,
      hasElectronAPI: !!window?.electronAPI,
      hasDialog: !!window?.electronAPI?.dialog,
      hasOpen: !!window?.electronAPI?.dialog?.open
    } );

    // Test window exists
    expect( window ).toBeDefined();

    // Test electronAPI exists
    expect( window.electronAPI ).toBeDefined();

    // Test dialog exists
    expect( window.electronAPI.dialog ).toBeDefined();

    // Test open function exists
    expect( window.electronAPI.dialog.open ).toBeDefined();
    expect( typeof window.electronAPI.dialog.open ).toBe( 'function' );

    // Verify mock function works
    window.electronAPI.dialog.open( 'test' );
    expect( mocks.dialog.open ).toHaveBeenCalledWith( 'test' );
  } );
} );