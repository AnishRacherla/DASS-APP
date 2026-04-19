const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// GET /api/fill-story/:language
// Returns all fill-story levels available for the language
router.get('/:language', async (req, res) => {
    try {
        const games = await Game.find({
            gameType: 'fill-story',
            language: req.params.language.toLowerCase()
        }).sort({ level: 1 });

        if (!games || games.length === 0) {
            return res.status(404).json({ success: false, message: 'No fill-story games found' });
        }

        const levels = games.map(g => ({
            id: g.gameId,
            level: g.level,
            title: g.title,
            description: g.description,
            difficulty: g.difficulty
        }));

        res.json({ success: true, levels });
    } catch (err) {
        console.error('Error fetching fill-story games:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/fill-story/:language/:level
// Returns the specific story level data
router.get('/:language/:level', async (req, res) => {
    try {
        const game = await Game.findOne({
            gameType: 'fill-story',
            language: req.params.language.toLowerCase(),
            level: parseInt(req.params.level)
        });

        if (!game) {
            return res.status(404).json({ success: false, message: 'Fill-story level not found' });
        }

        res.json({ success: true, gameData: game.gameData, title: game.title, description: game.description });
    } catch (err) {
        console.error('Error fetching fill-story level:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
