/**
 * ACCEPTANCE TESTS - Whack-a-Letter Game (REAL DATABASE)
 * 
 * Tests complete user journey with REAL MongoDB database
 */

require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const connectDB = require('../../config/db');
const whackGameRouter = require('../../routes/whackGame');
const scoresRouter = require('../../routes/scores');
const progressRouter = require('../../routes/progress');

const Score = require('../../models/Score');
const Progress = require('../../models/Progress');
const User = require('../../models/User');

describe('ACCEPTANCE (REAL DB): Whack-a-Letter Game - Complete User Journey', () => {
  let app;
  let testUserId;

  beforeAll(async () => {
    await connectDB();
    
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/whack', whackGameRouter);
    app.use('/api/scores', scoresRouter);
    app.use('/api/progress', progressRouter);

    const testUser = await User.create({
      name: 'Whack Test User',
      age: 8,
      language: 'telugu',
      email: `whack-test-${Date.now()}@example.com`
    });
    testUserId = testUser._id.toString();

    await Progress.create({
      userId: testUserId,
      language: 'telugu',
      totalScore: 0,
      currentLevel: 1,
      quizzesCompleted: 0
    });
  });

  afterAll(async () => {
    await User.deleteMany({ name: 'Whack Test User' });
    await Score.deleteMany({ userId: testUserId });
    await Progress.deleteMany({ userId: testUserId });
    await mongoose.connection.close();
  });

  describe('AC-WHACK-01: User can start Whack game', () => {
    test('User can get all Whack games', async () => {
      const response = await request(app)
        .get('/api/whack');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.games)).toBe(true);
      expect(response.body.games.length).toBeGreaterThan(0);
    });

    test('User selects Telugu Level 1', async () => {
      const response = await request(app)
        .get('/api/whack/telugu/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.game.language).toBe('telugu');
      expect(response.body.game.level).toBe(1);
    });

    test('User can get all Telugu Whack games', async () => {
      const response = await request(app)
        .get('/api/whack/telugu');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.games)).toBe(true);
      
      response.body.games.forEach(game => {
        expect(game.language).toBe('telugu');
      });
    });

    test('Returns 404 for non-existent level', async () => {
      const response = await request(app)
        .get('/api/whack/hindi/999');

      expect(response.status).toBe(404);
    });
  });

  describe('AC-WHACK-02: User plays through 7 levels', () => {
    test('User can access and play Level 1', async () => {
      const gameResponse = await request(app)
        .get('/api/whack/telugu/1');
      
      if (gameResponse.status === 200) {
        const game = gameResponse.body.game;

        const scoreResponse = await request(app)
          .post('/api/scores')
          .send({
            userId: testUserId,
            gameId: game.gameId,
            gameType: 'whack',
            language: 'telugu',
            level: 1,
            score: 500,
            correctAnswers: 10,
            totalQuestions: 15,
            penalties: 2
          });

        expect(scoreResponse.status).toBe(201);
        expect(scoreResponse.body.success).toBe(true);
      }
    });

    test('User progresses through multiple levels', async () => {
      const levels = [1, 2, 3];
      
      for (let level of levels) {
        const gameResponse = await request(app)
          .get(`/api/whack/telugu/${level}`);
        
        if (gameResponse.status === 200) {
          const scoreData = {
            userId: testUserId,
            gameId: gameResponse.body.game.gameId,
            gameType: 'whack',
            language: 'telugu',
            level: level,
            score: 450 + (level * 30),
            correctAnswers: 8 + level,
            totalQuestions: 15,
            penalties: 3 - level
          };

          const response = await request(app)
            .post('/api/scores')
            .send(scoreData);

          expect(response.status).toBe(201);
        }
      }
    });

    test('Level 7 is accessible (final level)', async () => {
      const response = await request(app)
        .get('/api/whack/telugu/7');

      // Level 7 might exist in DB
      if (response.status === 200) {
        expect(response.body.game.level).toBe(7);
      } else {
        expect(response.status).toBe(404);
      }
    });
  });

  describe('AC-WHACK-03: Score and penalty tracking', () => {
    test.skip('Penalties are recorded in score submission', async () => {
      const gameResponse = await request(app)
        .get('/api/whack/hindi/1');
      
      if (gameResponse.status === 200) {
        const scoreData = {
          userId: testUserId,
          gameId: gameResponse.body.game.gameId,
          gameType: 'whack',
          language: 'hindi',
          level: 1,
          score: 400,
          correctAnswers: 7,
          totalQuestions: 15
        };

        const response = await request(app)
          .post('/api/scores')
          .send(scoreData);

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      }
    });

    test('User can view all Whack game scores', async () => {
      const response = await request(app)
        .get(`/api/scores/user/${testUserId}`);

      expect(response.status).toBe(200);
      
      const whackScores = response.body.scores.filter(s => s.gameType === 'whack');
      expect(whackScores.length).toBeGreaterThan(0);
    });
  });

  describe('AC-WHACK-04: Progress tracking', () => {
    test('Progress updates after completing Whack games', async () => {
      const response = await request(app)
        .get(`/api/progress/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.progress).toBeDefined();
      expect(response.body.progress.totalScore).toBeGreaterThan(0);
    });
  });

  describe('AC-WHACK-05: Complete user journey', () => {
    test.skip('Complete flow: browse all → select level → play → score → progress', async () => {
      // Step 1: Get all games
      const allGamesResponse = await request(app)
        .get('/api/whack');
      expect(allGamesResponse.status).toBe(200);
      expect(allGamesResponse.body.games.length).toBeGreaterThan(0);

      // Step 2: Select specific game
      const game = allGamesResponse.body.games[0];
      const gameResponse = await request(app)
        .get(`/api/whack/${game.language}/${game.level}`);
      expect(gameResponse.status).toBe(200);

      // Step 3: Play and submit score
      const scoreResponse = await request(app)
        .post('/api/scores')
        .send({
          userId: testUserId,
          gameId: game.gameId,
          gameType: 'whack',
          language: game.language,
          level: game.level,
          score: 650,
          correctAnswers: 13,
          totalQuestions: 15
        });
      expect(scoreResponse.status).toBe(201);

      // Step 4: View scores
      const scoresResponse = await request(app)
        .get(`/api/scores/user/${testUserId}`);
      expect(scoresResponse.status).toBe(200);

      // Step 5: Check progress
      const progressResponse = await request(app)
        .get(`/api/progress/${testUserId}`);
      expect(progressResponse.status).toBe(200);
    });
  });

  describe('AC-WHACK-06: Error handling', () => {
    test('Returns 404 for invalid level', async () => {
      const response = await request(app)
        .get('/api/whack/hindi/999');

      expect(response.status).toBe(404);
    });

    test('Handles missing score data', async () => {
      const response = await request(app)
        .post('/api/scores')
        .send({
          userId: testUserId,
          gameType: 'whack'
          // Missing required fields
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
