// Test setup file
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/literacy-game-test';

// Increase timeout for database operations
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
