const request = require('supertest');
const express = require('express');
const cors = require('cors');
const swaraGameRouter = require('../../routes/swaraGame');

jest.mock('../../config/db', () => ({ connectDB: jest.fn() }));
jest.mock('../../models/Swara');
const Swara = require('../../models/Swara');

describe('Swara Game Routes - Unit Tests', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(cors());
        app.use(express.json());
        app.use('/api/swaras', swaraGameRouter);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/swaras - Get All Swaras', () => {
        test('should return all swaras sorted by id', async () => {
            const mockSwaras = [
                { id: 1, letter: 'अ', word: 'अमरूद', image: '/images/swara/a.png', audio: '/audio/swara/a_se_amarood.mp3' },
                { id: 2, letter: 'आ', word: 'आम', image: '/images/swara/aa.png', audio: '/audio/swara/aa_se_aam.mp3' },
                { id: 3, letter: 'इ', word: 'इमली', image: '/images/swara/i.png', audio: '/audio/swara/i_se_imli.mp3' }
            ];

            // Mock the chaining: find().sort().select()
            Swara.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockSwaras)
                })
            });

            const response = await request(app).get('/api/swaras');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(3);
            expect(response.body[0].letter).toBe('अ');
            expect(response.body[0].word).toBe('अमरूद');
            expect(response.body[0].image).toBe('/images/swara/a.png');
            expect(response.body[0].audio).toBe('/audio/swara/a_se_amarood.mp3');
        });

        test('should return all 13 swaras when fully seeded', async () => {
            const mockSwaras = Array.from({ length: 13 }, (_, i) => ({
                id: i + 1,
                letter: `letter_${i + 1}`,
                word: `word_${i + 1}`,
                image: `/images/swara/img_${i + 1}.png`,
                audio: `/audio/swara/audio_${i + 1}.mp3`
            }));

            Swara.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue(mockSwaras)
                })
            });

            const response = await request(app).get('/api/swaras');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(13);
        });

        test('should return empty array when no swaras in DB', async () => {
            Swara.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue([])
                })
            });

            const response = await request(app).get('/api/swaras');

            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        test('should return 500 on server error', async () => {
            Swara.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockRejectedValue(new Error('Database connection failed'))
                })
            });

            const response = await request(app).get('/api/swaras');

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Server error while fetching swaras');
        });

        test('should call Swara.find with correct sort and select options', async () => {
            Swara.find = jest.fn().mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    select: jest.fn().mockResolvedValue([])
                })
            });

            await request(app).get('/api/swaras');

            expect(Swara.find).toHaveBeenCalledWith({});
            expect(Swara.find().sort).toHaveBeenCalledWith({ id: 1 });
            expect(Swara.find().sort().select).toHaveBeenCalledWith('-_id -__v');
        });
    });
});
