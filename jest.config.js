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