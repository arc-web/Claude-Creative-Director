module.exports = {
  testEnvironment: '<rootDir>/jest-env.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/**/*.test.js'
  ],
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: false
};
