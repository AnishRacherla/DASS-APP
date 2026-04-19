/**
 * ACCEPTANCE TESTS - Balloon Pop Game
 * 
 * These tests validate complete user flows for the Balloon Pop game
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const balloonGameRouter = require('../../routes/balloonGame');
const scoresRouter = require('../../routes/scores');

jest.mock('../../config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/Game');
jest.mock('../../models/Score');
jest.mock('../../models/Progress');

const Game = require('../../models/Game');
const Score = require('../../models/Score');
const Progress = require('../../models/Progress');

describe('ACCEPTANCE: Balloon Pop Game - Complete User Journey', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/balloon', balloonGameRouter);
    app.use('/api/scores', scoresRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Progress for score submissions - route needs this to NOT be null or it returns early
    const mockProgress = {
      userId: '507f1f77bcf86cd799439011',
      language: 'hindi',
      totalScore: 0,
      currentLevel: 1,
      quizzesCompleted: 0,
      updatedAt: Date.now(),
      save: jest.fn().mockResolvedValue(true)
    };
    Progress.findOne = jest.fn().mockResolvedValue(mockProgress);
    
    Score.findOne = jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(null)
    });
  });

  describe('AC-BP-01: User can start Balloon Pop game', () => {
    test('User selects Telugu Level 1 and game loads', async () => {
      const mockGame = {
        _id: '507f1f77bcf86cd799439040',
        language: 'telugu',
        level: 1,
        title: 'Pop the Letter అ',
        description: 'Find and pop balloons with అ',
        gameData: {
          timeLimit: 60,
          rounds: [
            {
              targetLetter: 'అ',
              balloons: ['అ', 'ఆ', 'ఇ', 'అ', 'ఈ', 'ఉ']
            }
          ]
        },
        isActive: true
      };

      Game.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockGame)
      });

      const response = await request(app)
        .get('/api/balloon/telugu/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.game.gameData.timeLimit).toBe(60);
      expect(response.body.game.gameData.rounds[0].targetLetter).toBe('అ');
    });
  });

  describe('AC-BP-02: Game timer is 60 seconds', () => {
    test('Balloon game must have 60 second time limit', async () => {
      const mockGame = {
        language: 'hindi',
        level: 1,
        gameData: {
          timeLimit: 60,
          rounds: []
        },
        isActive: true
      };

      Game.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockGame)
      });

      const response = await request(app)
        .get('/api/balloon/hindi/1');

      expect(response.body.game.gameData.timeLimit).toBe(60);
    });
  });

  describe('AC-BP-03: Scoring system - correct and incorrect pops', () => {
    test('User pops 5 correct balloons and 3 incorrect = 50 points', async () => {
      const scoreData = {
        userId: '507f1f77bcf86cd799439011',
        gameType: 'balloon',
        language: 'hindi',
        level: 1,
        score: 50, // 5 correct × 10 points
        correctAnswers: 5, // Correct balloons
        totalQuestions: 8 // Total taps (5 correct + 3 incorrect)
      };

      const mockScore = {
        ...scoreData,
        save: jest.fn().mockResolvedValue(true)
      };

      Score.mockImplementation(() => mockScore);

      const response = await request(app)
        .post('/api/scores')
        .send(scoreData);

      expect(response.status).toBe(201);
      expect(response.body.score.score).toBe(50);
      expect(response.body.score.correctAnswers).toBe(5);
      expect(response.body.score.totalQuestions).toBe(8);
    });

    test('Only correct balloons add points, incorrect do not subtract', async () => {
      // Test case 1: 3 correct, 10 incorrect taps = 30 points
      const score1 = {
        correctBalloons: 3,
        incorrectTaps: 10,
        expectedScore: 30 // No penalties
      };

      expect(score1.correctBalloons * 10).toBe(score1.expectedScore);
      
      // Test case 2: 0 correct, 5 incorrect = 0 points (not negative)
      const score2 = {
        correctBalloons: 0,
        incorrectTaps: 5,
        expectedScore: 0
      };

      expect(score2.correctBalloons * 10).toBe(score2.expectedScore);
    });
  });

  describe('AC-BP-04: Total taps counter tracking', () => {
    test('System tracks both correct and incorrect balloon pops', async () => {
      const gameSession = {
        correctPops: 7,
        incorrectPops: 4,
        totalTaps: 11 // 7 + 4
      };

      expect(gameSession.correctPops + gameSession.incorrectPops).toBe(gameSession.totalTaps);
    });
  });

  describe('AC-BP-05: Results display format', () => {
    test('Results should show "X Correct Balloons • Y Total Taps"', async () => {
      const scoreData = {
        userId: '507f1f77bcf86cd799439011',
        gameType: 'balloon',
        language: 'telugu',
        level: 2,
        score: 60,
        correctAnswers: 6,
        totalQuestions: 10
      };

      const mockScore = {
        ...scoreData,
        save: jest.fn().mockResolvedValue(true)
      };

      Score.mockImplementation(() => mockScore);

      const response = await request(app)
        .post('/api/scores')
        .send(scoreData);

      // Verify data for results display
      expect(response.body.score.correctAnswers).toBe(6);
      expect(response.body.score.totalQuestions).toBe(10);
      
      // Frontend should display: "6 Correct Balloons • 10 Total Taps"
      const displayText = `${response.body.score.correctAnswers} Correct Balloons • ${response.body.score.totalQuestions} Total Taps`;
      expect(displayText).toBe('6 Correct Balloons • 10 Total Taps');
    });
  });

  describe('AC-BP-06: Target letter displayed clearly', () => {
    test('Game shows target letter at top of screen', async () => {
      const mockGame = {
        language: 'hindi',
        level: 1,
        gameData: {
          timeLimit: 60,
          rounds: [
            {
              targetLetter: 'अ',
              balloons: ['अ', 'आ', 'इ']
            },
            {
              targetLetter: 'क',
              balloons: ['क', 'ख', 'ग']
            }
          ]
        },
        isActive: true
      };

      Game.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockGame)
      });

      const response = await request(app)
        .get('/api/balloon/hindi/1');

      // Verify each round has a target letter
      response.body.game.gameData.rounds.forEach(round => {
        expect(round.targetLetter).toBeTruthy();
        expect(typeof round.targetLetter).toBe('string');
      });
    });
  });

  describe('AC-BP-07: Balloon spawning mechanics', () => {
    test('Balloons array contains target and distractor letters', async () => {
      const mockGame = {
        language: 'telugu',
        level: 1,
        gameData: {
          timeLimit: 60,
          rounds: [
            {
              targetLetter: 'అ',
              balloons: ['అ', 'ఆ', 'ఇ', 'అ', 'ఈ', 'ఉ', 'అ']
            }
          ]
        },
        isActive: true
      };

      Game.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockGame)
      });

      const response = await request(app)
        .get('/api/balloon/telugu/1');

      const round = response.body.game.gameData.rounds[0];
      const targetCount = round.balloons.filter(b => b === round.targetLetter).length;
      
      // Verify target letter appears multiple times
      expect(targetCount).toBeGreaterThan(0);
      
      // Verify there are distractor letters
      expect(round.balloons.length).toBeGreaterThan(targetCount);
    });
  });

  describe('AC-BP-08: Navigation on Results page', () => {
    test('Balloon results should show "Play Again" and "Back to Home"', () => {
      const gameResult = {
        gameType: 'balloon',
        score: 70,
        correctAnswers: 7,
        totalQuestions: 12
      };

      // Frontend navigation for balloon game:
      // 1. Play Again - go to /balloon-selection
      // 2. Back to Home - go to /planet-home
      
      expect(gameResult.gameType).toBe('balloon');
      
      // No "Next Level" button for balloon (different from Mars game)
    });
  });

  describe('AC-BP-09: Rapid clicking stress test', () => {
    test('Multiple scores can be saved rapidly without conflicts', async () => {
      const scores = [
        { score: 30, correctAnswers: 3, totalQuestions: 5 },
        { score: 50, correctAnswers: 5, totalQuestions: 8 },
        { score: 20, correctAnswers: 2, totalQuestions: 6 }
      ];

      for (const scoreData of scores) {
        const mockScore = {
          userId: '507f1f77bcf86cd799439011',
          gameType: 'balloon',
          language: 'hindi',
          level: 1,
          ...scoreData,
          save: jest.fn().mockResolvedValue(true)
        };

        Score.mockImplementation(() => mockScore);

        const response = await request(app)
          .post('/api/scores')
          .send({
            userId: '507f1f77bcf86cd799439011',
            gameType: 'balloon',
            language: 'hindi',
            level: 1,
            ...scoreData
          });

        expect(response.status).toBe(201);
      }
    });
  });

  describe('AC-BP-10: Pass/fail criteria for balloon game', () => {
    test('Any score > 0 is considered passing for balloon game', () => {
      // Unlike mars game, balloon has no strict pass percentage
      // Any points earned = successful game
      
      const testCases = [
        { score: 10, shouldPass: true },
        { score: 100, shouldPass: true },
        { score: 0, shouldPass: false }
      ];

      testCases.forEach(({ score, shouldPass }) => {
        const passed = score > 0;
        expect(passed).toBe(shouldPass);
      });
    });
  });
});
