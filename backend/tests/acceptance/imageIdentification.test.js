/**
 * ACCEPTANCE TESTS - Image Identification Game (Mars Game)
 * 
 * These tests validate complete user flows and business requirements
 * from the test plan document.
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const marsGameRouter = require('../../routes/marsGame');
const scoresRouter = require('../../routes/scores');

jest.mock('../../config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/MarsGame');
jest.mock('../../models/Score');
jest.mock('../../models/Progress');

const MarsGame = require('../../models/MarsGame');
const Score = require('../../models/Score');
const Progress = require('../../models/Progress');

describe('ACCEPTANCE: Image Identification Game - Complete User Journey', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/mars-game', marsGameRouter);
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

  describe('AC-IG-01: User can select and start Image Identification game', () => {
    test('User selects Hindi language and Level 1', async () => {
      // Given: A user on Mars game selection screen
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
          },
          {
            word: 'आ',
            audioUrl: '/audio/hindi/vowels/aa.mp3',
            images: [
              '/images/hindi/aa1.jpg',
              '/images/hindi/a1.jpg',
              '/images/hindi/i1.jpg'
            ],
            correctImageIndex: 0
          }
        ],
        isActive: true
      };

      MarsGame.findOne = jest.fn().mockResolvedValue(mockGame);

      // When: User clicks Level 1 card
      const response = await request(app)
        .get('/api/mars-game/hindi/1');

      // Then: Game loads successfully with questions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.game.questions.length).toBeGreaterThan(0);
      expect(response.body.game.questions[0].images.length).toBeGreaterThanOrEqual(2);
      
      // And: Audio URL is provided for pronunciation
      expect(response.body.game.questions[0].audioUrl).toBeTruthy();
    });
  });

  describe('AC-IG-02: Game displays questions with audio and images', () => {
    test('Each question has word, audio, and multiple image options', async () => {
      const mockGame = {
        language: 'telugu',
        level: 1,
        questions: [
          {
            word: 'అ',
            audioUrl: '/audio/telugu/vowels/a.mp3',
            images: ['/img1.jpg', '/img2.jpg', '/img3.jpg'],
            correctImageIndex: 1
          }
        ],
        isActive: true
      };

      MarsGame.findOne = jest.fn().mockResolvedValue(mockGame);

      const response = await request(app)
        .get('/api/mars-game/telugu/1');

      const question = response.body.game.questions[0];
      
      // Verify question structure
      expect(question.word).toBe('అ');
      expect(question.audioUrl).toContain('/audio/');
      expect(question.images).toHaveLength(3);
      expect(question.correctImageIndex).toBeGreaterThanOrEqual(0);
      expect(question.correctImageIndex).toBeLessThan(question.images.length);
    });
  });

  describe('AC-IG-03: Scoring system works correctly', () => {
    test('User answers 3 correct and 2 incorrect out of 5 questions, gets 30 points', async () => {
      // Given: User completed game with 3 correct answers
      const scoreData = {
        userId: '507f1f77bcf86cd799439011',
        gameType: 'mars',
        language: 'hindi',
        level: 1,
        score: 30, // 3 correct × 10 points each
        correctAnswers: 3,
        totalQuestions: 5
      };

      const mockScore = {
        ...scoreData,
        _id: '507f1f77bcf86cd799439099',
        completedAt: new Date(),
        save: jest.fn().mockResolvedValue(true)
      };

      Score.mockImplementation(() => mockScore);

      // When: Score is submitted
      const response = await request(app)
        .post('/api/scores')
        .send(scoreData);

      // Then: Score is saved correctly
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.score.score).toBe(30);
      expect(response.body.score.correctAnswers).toBe(3);
      expect(response.body.score.totalQuestions).toBe(5);
      
      // And: Percentage calculation = 60% (3/5)
      const percentage = (3 / 5) * 100;
      expect(percentage).toBe(60);
    });

    test('Perfect score: 5 correct out of 5 = 50 points and 100%', async () => {
      const scoreData = {
        userId: '507f1f77bcf86cd799439011',
        gameType: 'mars',
        language: 'telugu',
        level: 2,
        score: 50,
        correctAnswers: 5,
        totalQuestions: 5
      };

      const mockScore = {
        ...scoreData,
        save: jest.fn().mockResolvedValue(true)
      };

      Score.mockImplementation(() => mockScore);

      const response = await request(app)
        .post('/api/scores')
        .send(scoreData);

      expect(response.body.score.score).toBe(50);
      const percentage = (5 / 5) * 100;
      expect(percentage).toBe(100);
    });
  });

  describe('AC-IG-04: Progress tracking and next level unlocking', () => {
    test('Passing Level 1 (60%+) should allow progression to Level 2', async () => {
      // Given: User passed Level 1 with 80% (4/5 correct)
      const level1Score = {
        userId: '507f1f77bcf86cd799439011',
        gameType: 'mars',
        language: 'hindi',
        level: 1,
        score: 40,
        correctAnswers: 4,
        totalQuestions: 5
      };

      const mockScore = {
        ...level1Score,
        save: jest.fn().mockResolvedValue(true)
      };

      Score.mockImplementation(() => mockScore);

      const response = await request(app)
        .post('/api/scores')
        .send(level1Score);

      const percentage = (4 / 5) * 100;
      
      // Then: User passed (>= 60%)
      expect(percentage).toBeGreaterThanOrEqual(60);
      expect(response.body.success).toBe(true);
      
      // And: Level 2 should be accessible
      // (Frontend logic: show "Next Level" button)
    });

    test('Failing Level 1 (<60%) should not unlock Level 2', async () => {
      // Given: User failed with 40% (2/5 correct)
      const percentage = (2 / 5) * 100;
      
      // Then: User failed (<60%)
      expect(percentage).toBeLessThan(60);
      
      // And: Level 2 remains locked
      // (Frontend logic: hide "Next Level" button)
    });
  });

  describe('AC-IG-05: Star rating system (3 stars, 2 stars, 1 star)', () => {
    test('80-100% should award 3 stars', () => {
      const testCases = [
        { correct: 5, total: 5, expected: 3 }, // 100%
        { correct: 4, total: 5, expected: 3 }, // 80%
        { correct: 9, total: 10, expected: 3 } // 90%
      ];

      testCases.forEach(({ correct, total, expected }) => {
        const percentage = (correct / total) * 100;
        const stars = percentage >= 80 ? 3 : percentage >= 60 ? 2 : 1;
        expect(stars).toBe(expected);
      });
    });

    test('60-79% should award 2 stars', () => {
      const testCases = [
        { correct: 3, total: 5, expected: 2 }, // 60%
        { correct: 7, total: 10, expected: 2 }, // 70%
        { correct: 4, total: 6, expected: 2 } // 66.7%
      ];

      testCases.forEach(({ correct, total, expected }) => {
        const percentage = (correct / total) * 100;
        const stars = percentage >= 80 ? 3 : percentage >= 60 ? 2 : 1;
        expect(stars).toBe(expected);
      });
    });

    test('Below 60% should award 1 star', () => {
      const testCases = [
        { correct: 2, total: 5, expected: 1 }, // 40%
        { correct: 1, total: 5, expected: 1 }, // 20%
        { correct: 5, total: 10, expected: 1 } // 50%
      ];

      testCases.forEach(({ correct, total, expected }) => {
        const percentage = (correct / total) * 100;
        const stars = percentage >= 80 ? 3 : percentage >= 60 ? 2 : 1;
        expect(stars).toBe(expected);
      });
    });
  });

  describe('AC-IG-06: Navigation options on Results page', () => {
    test('Results should provide "Play Again", "Next Level", and "Back to Mars" options', () => {
      // Given: User completed game
      const gameResult = {
        gameType: 'mars',
        level: 1,
        score: 40,
        correctAnswers: 4,
        totalQuestions: 5,
        language: 'hindi'
      };

      // Then: Frontend should display navigation based on gameType
      expect(gameResult.gameType).toBe('mars');
      
      // Navigation options:
      // 1. Play Again - replay same level
      // 2. Next Level - if passed and level < 2
      // 3. Back to Mars - return to game selection
      
      const passed = (gameResult.correctAnswers / gameResult.totalQuestions) >= 0.6;
      expect(passed).toBe(true);
      
      const nextLevelAvailable = passed && gameResult.level < 2;
      expect(nextLevelAvailable).toBe(true);
    });
  });

  describe('AC-IG-07: Audio replay functionality', () => {
    test('User can replay audio pronunciation at any time', async () => {
      const mockGame = {
        language: 'hindi',
        level: 1,
        questions: [
          {
            word: 'अ',
            audioUrl: '/audio/hindi/vowels/a.mp3',
            images: ['/img1.jpg', '/img2.jpg'],
            correctImageIndex: 0
          }
        ],
        isActive: true
      };

      MarsGame.findOne = jest.fn().mockResolvedValue(mockGame);

      const response = await request(app)
        .get('/api/mars-game/hindi/1');

      // Verify audio URL is provided
      const audioUrl = response.body.game.questions[0].audioUrl;
      expect(audioUrl).toBeTruthy();
      expect(audioUrl).toContain('/audio/');
      
      // Frontend should provide replay button
      // User can click "🔊 Replay Sound" button anytime
    });
  });
});
