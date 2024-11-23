const baseConfig = require( './jest.config' );

module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  testMatch: [ '**/__tests__/e2e/**/*.test.js' ],
  setupFiles: [ './__tests__/e2e/setup.js' ],
};