// Jest configuration for backend
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    '!node_modules/**'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  testTimeout: 10000,
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};