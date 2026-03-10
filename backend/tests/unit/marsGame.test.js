const request = require('supertest');
const express = require('express');
const cors = require('cors');
const marsGameRouter = require('../../routes/marsGame');

jest.mock('../../config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/MarsGame');
const MarsGame = require('../../models/MarsGame');

describe('Mars Game Routes - Unit Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/mars-game', marsGameRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/mars-game/:language/:level - Get Mars Game', () => {
    test('should retrieve Hindi Level 1 mars game', async () => {
      const mockGame = {
        _id: '507f1f77bcf86cd799439030',
        language: 'hindi',
        level: 1,
        title: 'Match Hindi Vowels',
        questions: [
          {
            word: 'अ',
            audioUrl: '/audio/hindi/vowels/a.mp3',
            images: [
              '/images/hindi/a1.jpg',
              '/images/hindi/b1.jpg',
              '/images/hindi/c1.jpg'
            ],
            correctImageIndex: 0
          }
        ],
        isActive: true
      };

      MarsGame.findOne = jest.fn().mockResolvedValue(mockGame);

      const response = await request(app)
        .get('/api/mars-game/hindi/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.game.language).toBe('hindi');
      expect(response.body.game.level).toBe(1);
      expect(response.body.game.questions).toHaveLength(1);
    });

    test('should retrieve Telugu Level 2 mars game', async () => {
      const mockGame = {
        _id: '507f1f77bcf86cd799439031',
        language: 'telugu',
        level: 2,
        title: 'Match Telugu Consonants',
        questions: [],
        isActive: true
      };

      MarsGame.findOne = jest.fn().mockResolvedValue(mockGame);

      const response = await request(app)
        .get('/api/mars-game/telugu/2');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.game.language).toBe('telugu');
    });

    test('should return 404 for non-existent game', async () => {
      MarsGame.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/api/mars-game/hindi/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    test('should handle invalid language parameter', async () => {
      MarsGame.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/api/mars-game/invalid-lang/1');

      expect(response.status).toBe(404);
    });
  });
});
