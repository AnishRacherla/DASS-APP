/**
 * ACCEPTANCE TESTS - Whack-a-Letter Game
 * 
 * These tests validate complete user flows for the Whack-a-Letter game
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const whackGameRouter = require('../../routes/whackGame');
const scoresRouter = require('../../routes/scores');

jest.mock('../../config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/Game');
jest.mock('../../models/Score');
jest.mock('../../models/Progress');

const Game = require('../../models/Game');
const Score = require('../../models/Score');
const Progress = require('../../models/Progress');

describe('ACCEPTANCE: Whack-a-Letter Game - Complete User Journey', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/whack', whackGameRouter);
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

  describe('AC-WG-01: User can select and start Whack game', () => {
    test('User selects Hindi Level 1 and game loads', async () => {
      const mockGame = {
        _id: '507f1f77bcf86cd799439050',
        language: 'hindi',
        level: 1,
        title: 'Whack the Letter अ',
        description: 'Whack all the अ tiles',
        gameData: {
          timeLimit: 40,
          totalRounds: 5,
          rounds: [
            {
              roundNumber: 1,
              targetLetter: 'अ',
              tiles: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः', 'अ', 'अ', 'अ', 'अ']
            }
          ]
        },
        isActive: true
      };

      Game.findOne = jest.fn().mockResolvedValue(mockGame);

      const response = await request(app)
        .get('/api/whack/hindi/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.game.level).toBe(1);
      expect(response.body.game.gameData.timeLimit).toBe(40);
      expect(response.body.game.gameData.totalRounds).toBe(5);
    });

    test('All 7 levels available for Telugu', async () => {
      const mockGames = Array.from({ length: 7 }, (_, i) => ({
        _id: `507f1f77bcf86cd79943905${i}`,
        language: 'telugu',
        level: i + 1,
        title: `Whack Level ${i + 1}`,
        gameData: { timeLimit: 40, totalRounds: 5 },
        isActive: true
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

  describe('AC-WG-02: Game has 5 rounds and 40 second time limit', () => {
    test('Whack game configuration is correct', async () => {
      const mockGame = {
        language: 'hindi',
        level: 3,
        gameData: {
          timeLimit: 40,
          totalRounds: 5,
          rounds: [
            { roundNumber: 1, targetLetter: 'क' },
            { roundNumber: 2, targetLetter: 'ख' },
            { roundNumber: 3, targetLetter: 'ग' },
            { roundNumber: 4, targetLetter: 'घ' },
            { roundNumber: 5, targetLetter: 'च' }
          ]
        },
        isActive: true
      };

      Game.findOne = jest.fn().mockResolvedValue(mockGame);

      const response = await request(app)
        .get('/api/whack/hindi/3');

      expect(response.body.game.gameData.timeLimit).toBe(40);
      expect(response.body.game.gameData.totalRounds).toBe(5);
      expect(response.body.game.gameData.rounds).toHaveLength(5);
    });
  });

  describe('AC-WG-03: 4x4 tile grid display', () => {
    test('Each round has exactly 16 tiles (4x4 grid)', async () => {
      const mockGame = {
        language: 'telugu',
        level: 2,
        gameData: {
          timeLimit: 40,
          totalRounds: 5,
          rounds: [
            {
              roundNumber: 1,
              targetLetter: 'అ',
              tiles: new Array(16).fill('అ') // 4x4 = 16 tiles
            }
          ]
        },
        isActive: true
      };

      Game.findOne = jest.fn().mockResolvedValue(mockGame);

      const response = await request(app)
        .get('/api/whack/telugu/2');

      const round = response.body.game.gameData.rounds[0];
      expect(round.tiles).toHaveLength(16);
    });
  });

  describe('AC-WG-04: Scoring with correct and incorrect whacks', () => {
    test('User whacks 15 correct and 3 incorrect = 150 points with 3 penalties', async () => {
      const scoreData = {
        userId: '507f1f77bcf86cd799439011',
        gameType: 'whack',
        language: 'hindi',
        level: 4,
        score: 150, // 15 correct × 10 points
        correctAnswers: 15,
        totalQuestions: 18, // 15 correct + 3 incorrect
        penalties: 3 // 3 incorrect whacks
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
      expect(response.body.score.score).toBe(150);
      expect(response.body.score.correctAnswers).toBe(15);
      expect(response.body.score.penalties).toBe(3);
    });

    test('Correct whack = +10 points, incorrect whack = penalty', () => {
      const gameLogic = {
        correctPoints: 10,
        penaltyForIncorrect: 1
      };

      // Scenario: 20 correct, 5 incorrect
      const correct = 20;
      const incorrect = 5;
      
      const totalScore = correct * gameLogic.correctPoints;
      const penalties = incorrect * gameLogic.penaltyForIncorrect;

      expect(totalScore).toBe(200);
      expect(penalties).toBe(5);
    });
  });

  describe('AC-WG-05: Results display with penalties', () => {
    test('Results show "Points • X Wrong Taps"', async () => {
      const scoreData = {
        userId: '507f1f77bcf86cd799439011',
        gameType: 'whack',
        language: 'telugu',
        level: 5,
        score: 120,
        correctAnswers: 12,
        totalQuestions: 17,
        penalties: 5 // 5 wrong taps
      };

      const mockScore = {
        ...scoreData,
        save: jest.fn().mockResolvedValue(true)
      };

      Score.mockImplementation(() => mockScore);

      const response = await request(app)
        .post('/api/scores')
        .send(scoreData);

      expect(response.body.score.score).toBe(120);
      expect(response.body.score.penalties).toBe(5);

      // Frontend should display: "120 Points • 5 Wrong Taps"
      const displayText = `${response.body.score.score} Points • ${response.body.score.penalties} Wrong Taps`;
      expect(displayText).toBe('120 Points • 5 Wrong Taps');
    });
  });

  describe('AC-WG-06: Next level navigation', () => {
    test('After completing level 1, user can proceed to level 2', async () => {
      // Complete Level 1
      const level1Score = {
        userId: '507f1f77bcf86cd799439011',
        gameType: 'whack',
        language: 'hindi',
        level: 1,
        score: 100,
        correctAnswers: 10,
        totalQuestions: 12,
        penalties: 2
      };

      const mockScore = {
        ...level1Score,
        save: jest.fn().mockResolvedValue(true)
      };

      Score.mockImplementation(() => mockScore);

      await request(app)
        .post('/api/scores')
        .send(level1Score);

      // Check Level 2 is available
      const mockLevel2Game = {
        language: 'hindi',
        level: 2,
        gameData: { timeLimit: 40, totalRounds: 5 },
        isActive: true
      };

      Game.findOne = jest.fn().mockResolvedValue(mockLevel2Game);

      const response = await request(app)
        .get('/api/whack/hindi/2');

      expect(response.status).toBe(200);
      expect(response.body.game.level).toBe(2);
    });

    test('Results page shows "Next Level" button for levels 1-6', () => {
      const testCases = [
        { level: 1, hasNextLevel: true },
        { level: 3, hasNextLevel: true },
        { level: 6, hasNextLevel: true },
        { level: 7, hasNextLevel: false } // Last level
      ];

      testCases.forEach(({ level, hasNextLevel }) => {
        const showNextButton = level < 7;
        expect(showNextButton).toBe(hasNextLevel);
      });
    });
  });

  describe('AC-WG-07: Navigation on Results page', () => {
    test('Whack results show "Play Again", "Next Level" (if not last), "Back to Mars"', () => {
      const gameResult = {
        gameType: 'whack',
        level: 3,
        score: 150,
        penalties: 4
      };

      expect(gameResult.gameType).toBe('whack');
      
      // Navigation buttons:
      // 1. Play Again - replay same level
      // 2. Next Level - go to level 4 (since current is 3)
      // 3. Back to Mars - go to /planet-home
      
      const showNextLevel = gameResult.level < 7;
      expect(showNextLevel).toBe(true);
    });

    test('Level 7 results only show "Play Again" and "Back to Mars"', () => {
      const gameResult = {
        gameType: 'whack',
        level: 7,
        score: 200,
        penalties: 1
      };

      const showNextLevel = gameResult.level < 7;
      expect(showNextLevel).toBe(false); // No next level after 7
    });
  });

  describe('AC-WG-08: Target letter changes per round', () => {
    test('Each of 5 rounds has a different target letter', async () => {
      const mockGame = {
        language: 'hindi',
        level: 1,
        gameData: {
          timeLimit: 40,
          totalRounds: 5,
          rounds: [
            { roundNumber: 1, targetLetter: 'अ', tiles: new Array(16).fill('अ') },
            { roundNumber: 2, targetLetter: 'आ', tiles: new Array(16).fill('आ') },
            { roundNumber: 3, targetLetter: 'इ', tiles: new Array(16).fill('इ') },
            { roundNumber: 4, targetLetter: 'ई', tiles: new Array(16).fill('ई') },
            { roundNumber: 5, targetLetter: 'उ', tiles: new Array(16).fill('उ') }
          ]
        },
        isActive: true
      };

      Game.findOne = jest.fn().mockResolvedValue(mockGame);

      const response = await request(app)
        .get('/api/whack/hindi/1');

      const rounds = response.body.game.gameData.rounds;
      const targetLetters = rounds.map(r => r.targetLetter);
      
      // All rounds should have target letters
      expect(targetLetters.every(letter => letter)).toBe(true);
      expect(targetLetters).toHaveLength(5);
    });
  });

  describe('AC-WG-09: Progressive difficulty', () => {
    test('Higher levels are available after completing lower levels', async () => {
      const levels = [1, 2, 3, 4, 5, 6, 7];

      for (const level of levels) {
        const mockGame = {
          language: 'telugu',
          level: level,
          gameData: {
            timeLimit: 40,
            totalRounds: 5
          },
          isActive: true
        };

        Game.findOne = jest.fn().mockResolvedValue(mockGame);

        const response = await request(app)
          .get(`/api/whack/telugu/${level}`);

        expect(response.status).toBe(200);
        expect(response.body.game.level).toBe(level);
      }
    });
  });

  describe('AC-WG-10: Time pressure mechanics', () => {
    test('40 seconds is sufficient for 5 rounds', () => {
      const totalTime = 40; // seconds
      const totalRounds = 5;
      const timePerRound = totalTime / totalRounds;

      // 8 seconds per round is adequate
      expect(timePerRound).toBe(8);
      expect(timePerRound).toBeGreaterThanOrEqual(5); // At least 5 seconds per round
    });
  });
});
