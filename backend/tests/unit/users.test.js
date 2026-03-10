const request = require('supertest');
const express = require('express');
const cors = require('cors');
const usersRouter = require('../../routes/users');

// Mock MongoDB connection
jest.mock('../../config/db', () => ({
  connectDB: jest.fn()
}));

// Mock User model
jest.mock('../../models/User');
jest.mock('../../models/Progress');
const User = require('../../models/User');
const Progress = require('../../models/Progress');

describe('User Routes - Unit Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/users', usersRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users - Create User', () => {
    test('should create a new user successfully', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Child',
        age: 5,
        language: 'hindi',
        createdAt: new Date(),
        lastActive: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      const mockProgress = {
        userId: '507f1f77bcf86cd799439011',
        language: 'hindi',
        currentLevel: 1,
        totalScore: 0,
        quizzesCompleted: 0,
        save: jest.fn().mockResolvedValue(true)
      };

      User.mockImplementation(() => mockUser);
      Progress.mockImplementation(() => mockProgress);

      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Test Child',
          age: 5,
          language: 'hindi'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe('Test Child');
    });

    test('should fail with missing required fields', async () => {
      // Mock User to throw validation error
      User.mockImplementation(() => {
        const error = new Error('User validation failed');
        error.name = 'ValidationError';
        throw error;
      });

      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Test Child'
          // Missing age and language
        });

      expect(response.status).toBe(400);
    });

    test('should validate age range (3-8)', async () => {
      User.mockImplementation(() => {
        throw new Error('Age validation failed');
      });

      const response = await request(app)
        .post('/api/users')
        .send({
          name: 'Test Child',
          age: 2, // Invalid age
          language: 'hindi'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/users/:id - Get User by ID', () => {
    test('should retrieve user by ID', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Child',
        age: 5,
        language: 'hindi',
        lastActive: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/users/507f1f77bcf86cd799439011');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe('Test Child');
    });

    test('should return 404 for non-existent user', async () => {
      User.findById = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/api/users/nonexistentid123');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users/find-or-create - Find or Create User', () => {
    test('should find existing user', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Existing User',
        age: 6,
        language: 'telugu',
        lastActive: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users/find-or-create')
        .send({
          name: 'Existing User',
          language: 'telugu'
        });

      expect(response.status).toBe(200);
      expect(response.body.existing).toBe(true);
      expect(response.body.user.name).toBe('Existing User');
    });

    test('should create new user if not found', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);
      
      const mockUser = {
        _id: '507f1f77bcf86cd799439012',
        name: 'New User',
        age: 5,
        language: 'hindi',
        save: jest.fn().mockResolvedValue(true)
      };

      const mockProgress = {
        save: jest.fn().mockResolvedValue(true)
      };

      User.mockImplementation(() => mockUser);
      Progress.mockImplementation(() => mockProgress);

      const response = await request(app)
        .post('/api/users/find-or-create')
        .send({
          name: 'New User',
          language: 'hindi'
        });

      expect(response.status).toBe(201);
      expect(response.body.existing).toBe(false);
    });
  });
});
