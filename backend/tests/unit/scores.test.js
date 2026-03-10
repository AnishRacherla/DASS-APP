const request = require('supertest');
const express = require('express');
const cors = require('cors');
const scoresRouter = require('../../routes/scores');

jest.mock('../../config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/Score');
jest.mock('../../models/Progress');

const Score = require('../../models/Score');
const Progress = require('../../models/Progress');

describe('Score Routes - Unit Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/scores', scoresRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Progress.findOne to resolve immediately
    const mockProgress = {
      userId: '507f1f77bcf86cd799439011',
      totalScore: 0,
      quizzesCompleted: 0,
      currentLevel: 1,
      save: jest.fn().mockResolvedValue(true)
    };
    Progress.findOne = jest.fn().mockResolvedValue(mockProgress);
  });

  describe('POST /api/scores - Save Score', () => {
    test('should save score for balloon game', async () => {
      const mockScore = {
        _id: '507f1f77bcf86cd799439020',
        userId: '507f1f77bcf86cd799439011',
        gameType: 'balloon',
        language: 'hindi',
        level: 1,
        score: 50,
        correctAnswers: 5,
        totalQuestions: 8,
        completedAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock findOne for checking previous scores
      Score.findOne = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(null)
      });

      Score.mockImplementation(() => mockScore);

      const response = await request(app)
        .post('/api/scores')
        .send({
          userId: '507f1f77bcf86cd799439011',
          gameType: 'balloon',
          language: 'hindi',
          level: 1,
          score: 50,
          correctAnswers: 5,
          totalQuestions: 8
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.score.gameType).toBe('balloon');
    });

    test('should save score for mars game', async () => {
      const mockScore = {
        _id: '507f1f77bcf86cd799439021',
        userId: '507f1f77bcf86cd799439011',
        gameType: 'mars',
        language: 'telugu',
        level: 2,
        score: 40,
        correctAnswers: 4,
        totalQuestions: 5,
        save: jest.fn().mockResolvedValue(true)
      };

      // Mock findOne for checking previous scores
      Score.findOne = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(null)
      });

      Score.mockImplementation(() => mockScore);

      const response = await request(app)
        .post('/api/scores')
        .send({
          userId: '507f1f77bcf86cd799439011',
          gameType: 'mars',
          language: 'telugu',
          level: 2,
          score: 40,
          correctAnswers: 4,
          totalQuestions: 5
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.score.gameType).toBe('mars');
    });

    test('should validate gameType enum', async () => {
      Score.mockImplementation(() => {
        throw new Error('Invalid gameType');
      });

      const response = await request(app)
        .post('/api/scores')
        .send({
          userId: '507f1f77bcf86cd799439011',
          gameType: 'invalid-game', // Invalid game type
          language: 'hindi',
          level: 1,
          score: 50
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/scores/user/:userId - Get User Scores', () => {
    test('should retrieve all scores for a user', async () => {
      const mockScores = [
        {
          _id: '507f1f77bcf86cd799439020',
          gameType: 'balloon',
          score: 50,
          level: 1
        },
        {
          _id: '507f1f77bcf86cd799439021',
          gameType: 'mars',
          score: 40,
          level: 2
        }
      ];

      Score.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockScores)
      });

      const response = await request(app)
        .get('/api/scores/user/507f1f77bcf86cd799439011');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.scores).toHaveLength(2);
    });

    test('should return empty array for user with no scores', async () => {
      Score.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const response = await request(app)
        .get('/api/scores/user/newuser123');

      expect(response.status).toBe(200);
      expect(response.body.scores).toHaveLength(0);
    });
  });
});
