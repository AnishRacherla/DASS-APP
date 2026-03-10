/**
 * ACCEPTANCE TESTS - Mars Game / Image Identification (REAL DATABASE)
 * 
 * Tests complete user journey with REAL MongoDB database
 */

require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const connectDB = require('../../config/db');
const marsGameRouter = require('../../routes/marsGame');
const scoresRouter = require('../../routes/scores');
const progressRouter = require('../../routes/progress');

const Score = require('../../models/Score');
const Progress = require('../../models/Progress');
const User = require('../../models/User');

describe('ACCEPTANCE (REAL DB): Mars Game - Complete User Journey', () => {
  let app;
  let testUserId;

  beforeAll(async () => {
    await connectDB();
    
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/mars', marsGameRouter);
    app.use('/api/scores', scoresRouter);
    app.use('/api/progress', progressRouter);

    const testUser = await User.create({
      name: 'Mars Test User',
      age: 6,
      language: 'hindi',
      email: `mars-test-${Date.now()}@example.com`
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
    await User.deleteMany({ name: 'Mars Test User' });
    await Score.deleteMany({ userId: testUserId });
    await Progress.deleteMany({ userId: testUserId });
    await mongoose.connection.close();
  });

  describe('AC-MARS-01: User can start Mars game', () => {
    test('User selects Hindi Level 1 and game loads', async () => {
      const response = await request(app)
        .get('/api/mars/hindi/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.game).toBeDefined();
      expect(response.body.game.language).toBe('hindi');
      expect(response.body.game.level).toBe(1);
    });

    test('User selects Hindi Level 2 and game loads', async () => {
      const response = await request(app)
        .get('/api/mars/hindi/2');

      // Might not exist
      if (response.status === 200) {
        expect(response.body.game.language).toBe('hindi');
        expect(response.body.game.level).toBe(2);
      } else {
        expect(response.status).toBe(404);
      }
    });

    test('Returns 404 for non-existent level', async () => {
      const response = await request(app)
        .get('/api/mars/hindi/999');

      expect(response.status).toBe(404);
    });
  });

  describe('AC-MARS-02: User plays Mars game', () => {
    test('User completes Mars game and submits score', async () => {
      const gameResponse = await request(app)
        .get('/api/mars/hindi/1');
      
      const game = gameResponse.body.game;

      const scoreData = {
        userId: testUserId,
        gameId: game.gameId,
        gameType: 'mars',
        language: 'hindi',
        level: 1,
        score: 900,
        correctAnswers: 9,
        totalQuestions: 10,
        timeTaken: 120
      };

      const response = await request(app)
        .post('/api/scores')
        .send(scoreData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.score.score).toBe(900);
    });

    test('User can play multiple levels', async () => {
      const levels = [1, 2];
      
      for (let level of levels) {
        const gameResponse = await request(app)
          .get(`/api/mars/hindi/${level}`);
        
        if (gameResponse.status === 200) {
          const scoreData = {
            userId: testUserId,
            gameId: gameResponse.body.game.gameId,
            gameType: 'mars',
            language: 'hindi',
            level: level,
            score: 800 + (level * 20),
            correctAnswers: 8 + level,
            totalQuestions: 10
          };

          const response = await request(app)
            .post('/api/scores')
            .send(scoreData);

          expect(response.status).toBe(201);
        }
      }
    });
  });

  describe('AC-MARS-03: User views scores and progress', () => {
    test('User can view their Mars game scores', async () => {
      const response = await request(app)
        .get(`/api/scores/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const marsScores = response.body.scores.filter(s => s.gameType === 'mars');
      expect(marsScores.length).toBeGreaterThan(0);
    });

    test('Progress is updated after Mars game', async () => {
      const response = await request(app)
        .get(`/api/progress/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.progress.totalScore).toBeGreaterThan(0);
    });
  });

  describe('AC-MARS-04: Complete Mars game journey', () => {
    test('Complete flow: select game → play → score → progress', async () => {
      // Step 1: Select specific game level
      const gameResponse = await request(app)
        .get('/api/mars/hindi/1');
      expect(gameResponse.status).toBe(200);

      const game = gameResponse.body.game;

      // Step 2: Submit score
      const scoreResponse = await request(app)
        .post('/api/scores')
        .send({
          userId: testUserId,
          gameId: game.gameId,
          gameType: 'mars',
          language: game.language,
          level: game.level,
          score: 950,
          correctAnswers: 10,
          totalQuestions: 10
        });
      expect(scoreResponse.status).toBe(201);

      // Step 3: Check progress
      const progressResponse = await request(app)
        .get(`/api/progress/${testUserId}`);
      expect(progressResponse.status).toBe(200);
      expect(progressResponse.body.progress.totalScore).toBeGreaterThan(0);
    });
  });

  describe('AC-MARS-05: Error handling', () => {
    test('Handles invalid level gracefully', async () => {
      const response = await request(app)
        .get('/api/mars/hindi/abc');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('Handles missing score data', async () => {
      const response = await request(app)
        .post('/api/scores')
        .send({ userId: testUserId });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
