const express = require('express');
const router = express.Router();
const Game = require('../models/Game'); // Re-using general game model for structure

// GET /api/shabd/:language
// Returns all shabd levels available for the language
router.get('/:language', async (req, res) => {
    try {
        const games = await Game.find({
            gameType: 'shabd',
            language: req.params.language.toLowerCase()
        }).sort({ level: 1 });

        if (!games || games.length === 0) {
            return res.status(404).json({ success: false, message: 'No shabd games found' });
        }

        const levels = games.map(g => ({
            id: g.gameId,
            level: g.level,
            title: g.title,
            difficulty: g.difficulty
        }));

        res.json({ success: true, levels });
    } catch (err) {
        console.error('Error fetching shabd games:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// GET /api/shabd/:language/:level
// Returns the specific level data
router.get('/:language/:level', async (req, res) => {
    try {
        const game = await Game.findOne({
            gameType: 'shabd',
            language: req.params.language.toLowerCase(),
            level: parseInt(req.params.level)
        });

        if (!game) {
            return res.status(404).json({ success: false, message: 'Shabd game level not found' });
        }

        res.json({ success: true, gameData: game.gameData });
    } catch (err) {
        console.error('Error fetching shabd level:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
