const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const Score = require('../models/Score');

// Get all scavenger scenes for a language
router.get('/:language', async (req, res) => {
    try {
        const { language } = req.params;
        const scenes = await Game.find({
            gameType: 'scavenger',
            language,
            isActive: true
        })
            .select('gameId title description language level difficulty gameData.scene gameData.sceneImage gameData.lettersCount')
            .sort({ level: 1 });

        res.json({ success: true, scenes });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get a specific scavenger scene by language and level
router.get('/:language/:level', async (req, res) => {
    try {
        const { language, level } = req.params;
        const scene = await Game.findOne({
            gameType: 'scavenger',
            language,
            level: parseInt(level),
            isActive: true
        });

        if (!scene) {
            return res.status(404).json({
                success: false,
                error: 'Scavenger scene not found'
            });
        }

        res.json({ success: true, scene });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit scavenger game score
router.post('/score', async (req, res) => {
    try {
        const { userId, gameId, score, correctAnswers, totalQuestions, timeTaken } = req.body;

        if (!userId || !gameId || score === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: userId, gameId, score'
            });
        }

        const game = await Game.findOne({ gameId });
        if (!game) {
            return res.status(404).json({ success: false, error: 'Game not found' });
        }

        const scoreEntry = new Score({
            userId,
            gameType: 'scavenger',
            gameId,
            language: game.language,
            level: game.level,
            score,
            correctAnswers,
            totalQuestions,
            timeTaken,
            completedAt: new Date()
        });

        await scoreEntry.save();

        res.status(201).json({
            success: true,
            message: 'Score saved!',
            score: scoreEntry
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
