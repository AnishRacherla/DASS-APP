const request = require('supertest');
const express = require('express');
const cors = require('cors');
const whackGameRouter = require('../../routes/whackGame');

jest.mock('../../config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/Game');
const Game = require('../../models/Game');

describe('Whack Game Routes - Unit Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/whack', whackGameRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/whack/:language - Get All Whack Games by Language', () => {
    test('should retrieve all Hindi whack games', async () => {
      const mockGames = [
        {
          _id: '507f1f77bcf86cd799439050',
          language: 'hindi',
          level: 1,
          gameData: { targetLetter: 'अ' },
          difficulty: 'easy',
          description: 'Find अ'
        },
        {
          _id: '507f1f77bcf86cd799439051',
          language: 'hindi',
          level: 2,
          gameData: { targetLetter: 'क' },
          difficulty: 'medium',
          description: 'Find क'
        }
      ];

      Game.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockGames)
      });

      const response = await request(app)
        .get('/api/whack/hindi');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.games).toHaveLength(2);
    });

    test('should return 7 Telugu whack games', async () => {
      const mockGames = Array.from({ length: 7 }, (_, i) => ({
        _id: `507f1f77bcf86cd79943905${i}`,
        language: 'telugu',
        level: i + 1,
        gameData: { targetLetter: 'అ' }
      }));

      Game.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockGames)
      });

      const response = await request(app)
        .get('/api/whack/telugu');

      expect(response.status).toBe(200);
      expect(response.body.games).toHaveLength(7);
    });
  });

  describe('GET /api/whack/:language/:level - Get Specific Whack Game', () => {
    test('should retrieve specific whack game level', async () => {
      const mockGame = {
        _id: '507f1f77bcf86cd799439050',
        language: 'hindi',
        level: 3,
        title: 'Whack Hindi Consonants',
        gameData: {
          targetLetter: 'क',
          timeLimit: 40,
          rounds: 5
        },
        difficulty: 'medium',
        description: 'Find and tap क tiles',
        isActive: true
      };

      Game.findOne = jest.fn().mockResolvedValue(mockGame);

      const response = await request(app)
        .get('/api/whack/hindi/3');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.game.level).toBe(3);
      expect(response.body.game.gameData.rounds).toBe(5);
      expect(response.body.game.gameData.timeLimit).toBe(40);
    });

    test('should return 404 for non-existent level', async () => {
      Game.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/api/whack/hindi/99');

      expect(response.status).toBe(404);
    });
  });
});
