/**
 * UNIT TESTS - Akshara Game Routes
 * 
 * Tests API endpoints for Akshara (letter tracing) game
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const aksharaGameRouter = require('../../routes/aksharaGame');

jest.mock('../../config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/HindiLetter');
jest.mock('../../models/TeluguLetter');
jest.mock('../../models/HindiMatra');
jest.mock('../../models/TeluguMatra');
jest.mock('../../models/Player');
jest.mock('../../models/Leaderboard');
jest.mock('../../models/Score');

const HindiLetter = require('../../models/HindiLetter');
const TeluguLetter = require('../../models/TeluguLetter');
const HindiMatra = require('../../models/HindiMatra');
const TeluguMatra = require('../../models/TeluguMatra');

describe('Akshara Game Routes - Unit Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/akshara', aksharaGameRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/akshara/:language/letters - Get Letters', () => {
    test('should retrieve Hindi letters', async () => {
      const mockLetters = [
        { letter: 'अ', category: 'vowels', romanization: 'a', audioUrl: '/audio/hindi/a.mp3' },
        { letter: 'आ', category: 'vowels', romanization: 'aa', audioUrl: '/audio/hindi/aa.mp3' },
        { letter: 'क', category: 'consonants', romanization: 'ka', audioUrl: '/audio/hindi/ka.mp3' }
      ];

      HindiLetter.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockLetters)
      });

      const response = await request(app)
        .get('/api/akshara/hindi/letters');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body[0].romanization).toBeTruthy();
    });

    test('should retrieve Telugu letters', async () => {
      const mockLetters = [
        { letter: 'అ', category: 'vowels', romanization: 'a', audioUrl: '/audio/telugu/a.mp3' },
        { letter: 'ఆ', category: 'vowels', romanization: 'aa', audioUrl: '/audio/telugu/aa.mp3' }
      ];

      TeluguLetter.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockLetters)
      });

      const response = await request(app)
        .get('/api/akshara/telugu/letters');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should handle database errors', async () => {
      HindiLetter.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const response = await request(app)
        .get('/api/akshara/hindi/letters');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/akshara/:language/matras - Get Matras', () => {
    test('should retrieve Hindi matras', async () => {
      const mockMatras = [
        { matra: 'ा', romanization: 'aa', audioUrl: '/audio/hindi/matra_aa.mp3' },
        { matra: 'ि', romanization: 'i', audioUrl: '/audio/hindi/matra_i.mp3' }
      ];

      HindiMatra.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockMatras)
      });

      const response = await request(app)
        .get('/api/akshara/hindi/matras');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should retrieve Telugu matras', async () => {
      const mockMatras = [
        { matra: 'ా', romanization: 'aa', audioUrl: '/audio/telugu/matra_aa.mp3' }
      ];

      TeluguMatra.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockMatras)
      });

      const response = await request(app)
        .get('/api/akshara/telugu/matras');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });
  });

  describe('Data Structure Validation', () => {
    test('letters should have required fields', async () => {
      const mockLetters = [
        { letter: 'अ', romanization: 'a', audioUrl: '/audio/hindi/a.mp3', stage: 1 }
      ];

      HindiLetter.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockLetters)
      });

      const response = await request(app)
        .get('/api/akshara/hindi/letters');

      expect(response.status).toBe(200);
      const letter = response.body[0];
      expect(letter.letter).toBeTruthy();
      expect(letter.romanization).toBeTruthy();
    });
  });

  describe('Language Support', () => {
    test('supports both Hindi and Telugu', async () => {
      HindiLetter.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ letter: 'अ' }])
      });
      
      TeluguLetter.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([{ letter: 'అ' }])
      });

      const hindiResponse = await request(app).get('/api/akshara/hindi/letters');
      const teluguResponse = await request(app).get('/api/akshara/telugu/letters');

      expect(hindiResponse.status).toBe(200);
      expect(teluguResponse.status).toBe(200);
    });
  });
});
