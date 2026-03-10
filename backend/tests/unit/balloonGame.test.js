const request = require('supertest');
const express = require('express');
const cors = require('cors');
const balloonGameRouter = require('../../routes/balloonGame');

jest.mock('../../config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/Game');
const Game = require('../../models/Game');

describe('Balloon Game Routes - Unit Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/balloon', balloonGameRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/balloon/:language/:level - Get Balloon Game', () => {
    test('should retrieve balloon game with correct structure', async () => {
      const mockGame = {
        _id: '507f1f77bcf86cd799439040',
        language: 'hindi',
        level: 1,
        title: 'Pop the Letter अ',
        description: 'Find and pop balloons with the letter अ',
        gameData: {
          timeLimit: 60,
          rounds: [
            {
              targetLetter: 'अ',
              balloons: ['अ', 'आ', 'इ', 'ई', 'अ', 'उ']
            }
          ]
        },
        isActive: true
      };

      // Mock the chaining: findOne().select()
      Game.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockGame)
      });

      const response = await request(app)
        .get('/api/balloon/hindi/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.game.gameData.timeLimit).toBe(60);
      expect(response.body.game.gameData.rounds).toHaveLength(1);
    });

    test('should validate time limit is 60 seconds', async () => {
      const mockGame = {
        gameData: {
          timeLimit: 60,
          rounds: []
        },
        isActive: true
      };

      // Mock the chaining: findOne().select()
      Game.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockGame)
      });

      const response = await request(app)
        .get('/api/balloon/telugu/1');

      expect(response.body.game.gameData.timeLimit).toBe(60);
    });

    test('should return 404 for inactive game', async () => {
      // Mock the chaining: findOne().select() returns null
      Game.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      const response = await request(app)
        .get('/api/balloon/hindi/10');

      expect(response.status).toBe(404);
    });
  });
});
