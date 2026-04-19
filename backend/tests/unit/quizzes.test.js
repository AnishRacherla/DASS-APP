/**
 * UNIT TESTS - Quiz Routes
 * 
 * Tests API endpoints for Quiz game
 */

const request = require('supertest');
const express = require('express');
const quizzesRouter = require('../../routes/quizzes');

jest.mock('../../config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/Quiz');

const Quiz = require('../../models/Quiz');

describe('Quiz Routes - Unit Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/quizzes', quizzesRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/quizzes/:language/:level - Get Quiz by Language and Level', () => {
    test('should retrieve Hindi Level 1 quiz', async () => {
      const mockQuiz = {
        _id: '507f1f77bcf86cd799439050',
        language: 'hindi',
        level: 1,
        title: 'Hindi Quiz Level 1',
        questions: [
          {
            questionText: 'Which letter is this: अ?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0
          }
        ]
      };

      Quiz.findOne = jest.fn().mockResolvedValue(mockQuiz);

      const response = await request(app)
        .get('/api/quizzes/hindi/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.quiz.language).toBe('hindi');
      expect(response.body.quiz.level).toBe(1);
      expect(response.body.quiz.questions).toHaveLength(1);
    });

    test('should retrieve Telugu Level 2 quiz', async () => {
      const mockQuiz = {
        _id: '507f1f77bcf86cd799439051',
        language: 'telugu',
        level: 2,
        title: 'Telugu Quiz Level 2',
        questions: [
          {
            questionText: 'Which letter is this: అ?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0
          }
        ]
      };

      Quiz.findOne = jest.fn().mockResolvedValue(mockQuiz);

      const response = await request(app)
        .get('/api/quizzes/telugu/2');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.quiz.language).toBe('telugu');
      expect(response.body.quiz.level).toBe(2);
    });

    test('should return 404 for non-existent quiz', async () => {
      Quiz.findOne = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/api/quizzes/hindi/99');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should handle database errors', async () => {
      Quiz.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/quizzes/hindi/1');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/quizzes/:language - Get All Quizzes by Language', () => {
    test('should retrieve all Hindi quizzes', async () => {
      const mockQuizzes = [
        { _id: '1', language: 'hindi', level: 1, title: 'Quiz 1' },
        { _id: '2', language: 'hindi', level: 2, title: 'Quiz 2' },
        { _id: '3', language: 'hindi', level: 3, title: 'Quiz 3' }
      ];

      Quiz.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockQuizzes)
      });

      const response = await request(app)
        .get('/api/quizzes/hindi');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.quizzes).toHaveLength(3);
    });

    test('should retrieve all Telugu quizzes', async () => {
      const mockQuizzes = [
        { _id: '1', language: 'telugu', level: 1, title: 'Quiz 1' },
        { _id: '2', language: 'telugu', level: 2, title: 'Quiz 2' }
      ];

      Quiz.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockQuizzes)
      });

      const response = await request(app)
        .get('/api/quizzes/telugu');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.quizzes).toHaveLength(2);
    });
  });

  describe('Quiz Structure Validation', () => {
    test('quiz should have required fields', async () => {
      const mockQuiz = {
        _id: '507f1f77bcf86cd799439050',
        language: 'hindi',
        level: 1,
        title: 'Test Quiz',
        questions: [
          {
            questionText: 'Test question',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0
          }
        ]
      };

      Quiz.findOne = jest.fn().mockResolvedValue(mockQuiz);

      const response = await request(app)
        .get('/api/quizzes/hindi/1');

      expect(response.status).toBe(200);
      expect(response.body.quiz).toHaveProperty('language');
      expect(response.body.quiz).toHaveProperty('level');
      expect(response.body.quiz).toHaveProperty('questions');
      expect(response.body.quiz.questions[0]).toHaveProperty('questionText');
      expect(response.body.quiz.questions[0]).toHaveProperty('options');
      expect(response.body.quiz.questions[0]).toHaveProperty('correctAnswer');
    });

    test('questions should have 4 options', async () => {
      const mockQuiz = {
        questions: [
          {
            questionText: 'Test',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0
          }
        ]
      };

      Quiz.findOne = jest.fn().mockResolvedValue(mockQuiz);

      const response = await request(app)
        .get('/api/quizzes/hindi/1');

      expect(response.status).toBe(200);
      expect(response.body.quiz.questions[0].options).toHaveLength(4);
    });
  });

  describe('Language Support', () => {
    test('supports Hindi and Telugu', async () => {
      const mockHindiQuiz = { language: 'hindi', level: 1 };
      const mockTeluguQuiz = { language: 'telugu', level: 1 };

      for (const language of ['hindi', 'telugu']) {
        const mockQuiz = language === 'hindi' ? mockHindiQuiz : mockTeluguQuiz;
        Quiz.findOne = jest.fn().mockResolvedValue(mockQuiz);

        const response = await request(app)
          .get(`/api/quizzes/${language}/1`);

        expect(response.status).toBe(200);
        expect(response.body.quiz.language).toBe(language);
      }
    });
  });
});
