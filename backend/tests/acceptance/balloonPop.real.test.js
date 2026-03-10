/**
 * ACCEPTANCE TESTS - Balloon Pop Game (REAL DATABASE)
 * 
 * These tests use the REAL MongoDB database to validate complete user flows
 * No mocking - tests actual API → Database → Response flow
 */

require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const connectDB = require('../../config/db');
const balloonGameRouter = require('../../routes/balloonGame');
const scoresRouter = require('../../routes/scores');
const progressRouter = require('../../routes/progress');

const Game = require('../../models/Game');
const Score = require('../../models/Score');
const Progress = require('../../models/Progress');
const User = require('../../models/User');

describe('ACCEPTANCE (REAL DB): Balloon Pop Game - Complete User Journey', () => {
  let app;
  let testUserId;
  let testGameId;

  beforeAll(async () => {
    // Connect to REAL database
    await connectDB();
    
    // Setup Express app with all routes
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/balloon', balloonGameRouter);
    app.use('/api/scores', scoresRouter);
    app.use('/api/progress', progressRouter);

    // Create a test user in the database
    const testUser = await User.create({
      name: 'Test User for Acceptance',
      age: 7,
      language: 'hindi',
      email: `test-${Date.now()}@example.com`
    });
    testUserId = testUser._id.toString();

    // Create test progress for the user
    await Progress.create({
      userId: testUserId,
      language: 'hindi',
      totalScore: 0,
      currentLevel: 1,
      quizzesCompleted: 0
    });
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await User.deleteMany({ name: 'Test User for Acceptance' });
    await Score.deleteMany({ userId: testUserId });
    await Progress.deleteMany({ userId: testUserId });
    
    // Close database connection
    await mongoose.connection.close();
  });

  describe('AC-BP-01: User can start Balloon Pop game', () => {
    test('User selects Hindi Level 1 and game loads with REAL data', async () => {
      const response = await request(app)
        .get('/api/balloon/hindi/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.game).toBeDefined();
      expect(response.body.game.language).toBe('hindi');
      expect(response.body.game.level).toBe(1);
      expect(response.body.game.gameType).toBe('balloon');
      
      // Store gameId for later tests
      testGameId = response.body.game.gameId;
      
      // Verify game has required fields (actual structure from DB)
      expect(response.body.game.title).toBeDefined();
      expect(response.body.game.gameData).toBeDefined();
      expect(response.body.game.gameData.rounds).toBeDefined();
      expect(Array.isArray(response.body.game.gameData.rounds)).toBe(true);
      expect(response.body.game.gameData.rounds.length).toBeGreaterThan(0);
    });

    test('User selects Hindi Level 2 and game loads', async () => {
      const response = await request(app)
        .get('/api/balloon/hindi/2');

      // Level 2 might not exist, so check either way
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body.game.language).toBe('hindi');
        expect(response.body.game.level).toBe(2);
      } else {
        expect(response.status).toBe(404);
      }
    });

    test('Returns 404 for non-existent level', async () => {
      const response = await request(app)
        .get('/api/balloon/hindi/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('AC-BP-02: User plays Balloon Pop game', () => {
    test('User completes game and submits score successfully', async () => {
      // First, get a real game
      const gameResponse = await request(app)
        .get('/api/balloon/hindi/1');
      
      const game = gameResponse.body.game;

      // Submit score
      const scoreData = {
        userId: testUserId,
        gameId: game.gameId,
        gameType: 'balloon',
        language: 'hindi',
        level: 1,
        score: 850,
        correctAnswers: 17,
        totalQuestions: 20,
        timeTaken: 45,
        accuracy: 85
      };

      const response = await request(app)
        .post('/api/scores')
        .send(scoreData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.score).toBeDefined();
      expect(response.body.score.score).toBe(850);
      expect(response.body.score.userId).toBe(testUserId);
    });

    test('User can submit multiple scores for different levels', async () => {
      const levels = [1, 2, 3];
      
      for (let level of levels) {
        const gameResponse = await request(app)
          .get(`/api/balloon/hindi/${level}`);
        
        if (gameResponse.status === 200) {
          const scoreData = {
            userId: testUserId,
            gameId: gameResponse.body.game.gameId,
            gameType: 'balloon',
            language: 'hindi',
            level: level,
            score: 700 + (level * 50),
            correctAnswers: 15 + level,
            totalQuestions: 20,
            timeTaken: 50 - level
          };

          const response = await request(app)
            .post('/api/scores')
            .send(scoreData);

          expect(response.status).toBe(201);
          expect(response.body.success).toBe(true);
        }
      }
    });
  });

  describe('AC-BP-03: User can view their scores', () => {
    test('User can retrieve their submitted scores', async () => {
      const response = await request(app)
        .get(`/api/scores/user/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.scores)).toBe(true);
      expect(response.body.scores.length).toBeGreaterThan(0);
      
      // Verify score structure
      const score = response.body.scores[0];
      expect(score.userId).toBe(testUserId);
      expect(score.score).toBeDefined();
      expect(score.gameType).toBe('balloon');
    });
  });

  describe('AC-BP-04: User progress tracking', () => {
    test('Progress is updated after completing a game', async () => {
      const response = await request(app)
        .get(`/api/progress/${testUserId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.progress).toBeDefined();
      expect(response.body.progress.userId).toBe(testUserId);
      
      // Progress should have updated scores
      expect(response.body.progress.totalScore).toBeGreaterThan(0);
    });
  });

  describe('AC-BP-05: Complete user journey', () => {
    test('User can complete full balloon pop journey: start → play → score → view', async () => {
      // Step 1: Get available games
      const gamesResponse = await request(app)
        .get('/api/balloon/hindi');

      expect(gamesResponse.status).toBe(200);
      expect(gamesResponse.body.games.length).toBeGreaterThan(0);

      // Step 2: Select first game
      const selectedGame = gamesResponse.body.games[0];
      const gameResponse = await request(app)
        .get(`/api/balloon/${selectedGame.language}/${selectedGame.level}`);

      expect(gameResponse.status).toBe(200);

      // Step 3: Play game and submit score
      const scoreResponse = await request(app)
        .post('/api/scores')
        .send({
          userId: testUserId,
          gameId: selectedGame.gameId,
          gameType: 'balloon',
          language: selectedGame.language,
          level: selectedGame.level,
          score: 920,
          correctAnswers: 19,
          totalQuestions: 20,
          timeTaken: 38
        });

      expect(scoreResponse.status).toBe(201);

      // Step 4: View user scores
      const scoresResponse = await request(app)
        .get(`/api/scores/user/${testUserId}`);

      expect(scoresResponse.status).toBe(200);
      expect(scoresResponse.body.scores.length).toBeGreaterThan(0);
      
      // Step 5: Check progress
      const progressResponse = await request(app)
        .get(`/api/progress/${testUserId}`);

      expect(progressResponse.status).toBe(200);
      expect(progressResponse.body.progress.totalScore).toBeGreaterThan(0);
    });
  });

  describe('AC-BP-06: Error handling', () => {
    test('Returns error for non-existent game level', async () => {
      const response = await request(app)
        .get('/api/balloon/hindi/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('Returns error for missing required score fields', async () => {
      const response = await request(app)
        .post('/api/scores')
        .send({
          userId: testUserId,
          // Missing gameId, score, etc.
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });
  });
});
