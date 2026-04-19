/**
 * ACCEPTANCE TESTS - Akshara Game (REAL DATABASE)
 * 
 * Tests complete user journey for letter tracing with REAL MongoDB database
 */

require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const connectDB = require('../../config/db');
const aksharaGameRouter = require('../../routes/aksharaGame');
const scoresRouter = require('../../routes/scores');
const progressRouter = require('../../routes/progress');

const Score = require('../../models/Score');
const Progress = require('../../models/Progress');
const User = require('../../models/User');

describe('ACCEPTANCE (REAL DB): Akshara Game - Complete User Journey', () => {
  let app;
  let testUserId;

  beforeAll(async () => {
    await connectDB();
    
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/akshara', aksharaGameRouter);
    app.use('/api/scores', scoresRouter);
    app.use('/api/progress', progressRouter);

    const testUser = await User.create({
      name: 'Akshara Test User',
      age: 5,
      language: 'hindi',
      email: `akshara-test-${Date.now()}@example.com`
    });
    testUserId = testUser._id.toString();

    await Progress.create({
      userId: testUserId,
      language: 'hindi',
      totalScore: 0,
      currentLevel: 1,
      quizzesCompleted: 0
    });
  });

  afterAll(async () => {
    await User.deleteMany({ name: 'Akshara Test User' });
    await Score.deleteMany({ userId: testUserId });
    await Progress.deleteMany({ userId: testUserId });
    await mongoose.connection.close();
  });

  describe('AC-AK-01: User can access letters', () => {
    test('User can get all Hindi letters', async () => {
      const response = await request(app)
        .get('/api/akshara/hindi/letters');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Verify letter structure (actual API returns array directly)
      const letter = response.body[0];
      expect(letter.symbol).toBeDefined();
      expect(letter.name).toBeDefined();
      expect(letter.type).toBeDefined();
    });

    test('User can get all Telugu letters', async () => {
      const response = await request(app)
        .get('/api/akshara/telugu/letters');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('AC-AK-02: User can access matras (diacritics)', () => {
    test('User can get all Hindi matras', async () => {
      const response = await request(app)
        .get('/api/akshara/hindi/matras');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const matra = response.body[0];
      expect(matra.symbol).toBeDefined();
      expect(matra.name).toBeDefined();
    });

    test('User can get all Telugu matras', async () => {
      const response = await request(app)
        .get('/api/akshara/telugu/matras');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('AC-AK-03: User practices letter tracing', () => {
    test('User completes letter tracing and submits score', async () => {
      const lettersResponse = await request(app)
        .get('/api/akshara/hindi/letters');
      
      if (lettersResponse.body.length > 0) {
        const scoreData = {
          userId: testUserId,
          gameId: 'akshara-hindi-letters',
          gameType: 'akshara',
          language: 'hindi',
          level: 1,
          score: 850,
          correctAnswers: 10,
          totalQuestions: 12
        };

        const response = await request(app)
          .post('/api/scores')
          .send(scoreData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      }
    });

    test.skip('User practices Telugu letters', async () => {
      const lettersResponse = await request(app)
        .get('/api/akshara/telugu/letters');
      
      if (lettersResponse.body.length > 0) {
        const scoreData = {
          userId: testUserId,
          gameId: 'akshara-telugu-letters',
          gameType: 'akshara',
          language: 'telugu',
          level: 2,
          score: 900,
          correctAnswers: 15,
          totalQuestions: 20
        };

        const response = await request(app)
          .post('/api/scores')
          .send(scoreData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      }
      
    });

    test.skip('User practices matras tracing', async () => {
      const matrasResponse = await request(app)
        .get('/api/akshara/telugu/matras');
      
      if (matrasResponse.body.length > 0) {
        const scoreData = {
          userId: testUserId,
          gameId: 'akshara-telugu-matras',
          gameType: 'akshara',
          language: 'telugu',
          level: 3,
          score: 750,
          correctAnswers: 7,
          totalQuestions: 9
        };

        const response = await request(app)
          .post('/api/scores')
          .send(scoreData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('AC-AK-04: Audio and pronunciation', () => {
    test('Letters include name for pronunciation', async () => {
      const response = await request(app)
        .get('/api/akshara/hindi/letters');

      expect(response.status).toBe(200);
      
      const firstLetter = response.body[0];
      expect(firstLetter.name).toBeDefined();
      expect(typeof firstLetter.name).toBe('string');
    });

    test('Matras include pronunciation info', async () => {
      const response = await request(app)
        .get('/api/akshara/hindi/matras');

      expect(response.status).toBe(200);
      
      if (response.body.length > 0) {
        const firstMatra = response.body[0];
        expect(firstMatra.name).toBeDefined();
      }
    });
  });

  describe('AC-AK-05: User views scores and progress', () => {
    test('User can view their Akshara practice scores', async () => {
      const response = await request(app)
        .get(`/api/scores/user/${testUserId}`);

      expect(response.status).toBe(200);
      
      const aksharaScores = response.body.scores.filter(s => s.gameType === 'akshara');
      expect(aksharaScores.length).toBeGreaterThan(0);
    });

    test('Progress tracks Akshara practice', async () => {
      const response = await request(app)
        .get(`/api/progress/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.progress.totalScore).toBeGreaterThan(0);
    });
  });

  describe('AC-AK-06: Complete user journey', () => {
    test('Complete flow: browse letters → practice → score → progress', async () => {
      // Step 1: Browse letters
      const lettersResponse = await request(app)
        .get('/api/akshara/hindi/letters');
      expect(lettersResponse.status).toBe(200);

      // Step 2: Browse matras
      const matrasResponse = await request(app)
        .get('/api/akshara/hindi/matras');
      expect(matrasResponse.status).toBe(200);

      // Step 3: Practice and submit score
      const scoreResponse = await request(app)
        .post('/api/scores')
        .send({
          userId: testUserId,
          gameId: 'akshara-hindi-complete',
          gameType: 'akshara',
          language: 'hindi',
          level: 1,
          score: 950,
          correctAnswers: 20,
          totalQuestions: 22
        });
      expect(scoreResponse.status).toBe(201);

      // Step 4: View all scores
      const scoresResponse = await request(app)
        .get(`/api/scores/user/${testUserId}`);
      expect(scoresResponse.status).toBe(200);

      // Step 5: Check progress
      const progressResponse = await request(app)
        .get(`/api/progress/${testUserId}`);
      expect(progressResponse.status).toBe(200);
    });
  });

  describe('AC-AK-07: Multi-language support', () => {
    test('User can switch between Hindi and Telugu', async () => {
      // Get Hindi letters
      const hindiResponse = await request(app)
        .get('/api/akshara/hindi/letters');
      expect(hindiResponse.status).toBe(200);
      expect(Array.isArray(hindiResponse.body)).toBe(true);

      // Get Telugu letters
      const teluguResponse = await request(app)
        .get('/api/akshara/telugu/letters');
      expect(teluguResponse.status).toBe(200);
      expect(Array.isArray(teluguResponse.body)).toBe(true);
    });

    test('Matras available for both languages', async () => {
      const hindiMatras = await request(app)
        .get('/api/akshara/hindi/matras');
      expect(hindiMatras.status).toBe(200);

      const teluguMatras = await request(app)
        .get('/api/akshara/telugu/matras');
      expect(teluguMatras.status).toBe(200);
    });
  });

  describe('AC-AK-08: Error handling', () => {
    test('Returns error for invalid language', async () => {
      const response = await request(app)
        .get('/api/akshara/spanish/letters');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('Handles missing score data', async () => {
      const response = await request(app)
        .post('/api/scores')
        .send({
          userId: testUserId,
          gameType: 'akshara'
          // Missing required fields
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
