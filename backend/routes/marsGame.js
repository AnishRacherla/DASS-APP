const express = require('express');
const router = express.Router();
const MarsGame = require('../models/MarsGame');

// Get Mars game by language and level
router.get('/:language/:level', async (req, res) => {
  try {
    const { language, level } = req.params;
    const game = await MarsGame.findOne({ 
      language, 
      level: parseInt(level),
      isActive: true 
    });
    
    if (!game) {
      return res.status(404).json({ 
        success: false, 
        error: 'Mars game not found' 
      });
    }
    
    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
