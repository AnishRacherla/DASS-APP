const express = require('express');
const router = express.Router();
const Crossword = require('../models/Crossword');
const CrosswordProgress = require('../models/CrosswordProgress');

function splitGraphemes(word) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(word), (item) => item.segment);
  }
  return Array.from(word);
}

function shuffleArray(values) {
  const copied = [...values];
  for (let i = copied.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

// Get crossword data by language and level
router.get('/data/:language/:level', async (req, res) => {
  try {
    const { language, level } = req.params;

    if (!['hi', 'te'].includes(language)) {
      return res.status(400).json({ success: false, error: 'Language must be "hi" or "te".' });
    }

    const content = await Crossword.findOne({ gameKey: 'kidsCrossword', isActive: true });
    if (!content) {
      return res.status(404).json({ success: false, error: 'Crossword content is not available.' });
    }

    const totalLevels = content.totalLevels || 5;
    const levelNumber = Number(level);
    const normalizedLevel = ((levelNumber - 1) % totalLevels) + 1;
    const template = content.levels.find((entry) => entry.level === normalizedLevel);

    if (!template) {
      return res.status(404).json({ success: false, error: 'Level template not found.' });
    }

    const grid = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => null));
    const slotMap = {};
    const words = [];
    const letterBag = [];

    template.slots.forEach((slot) => {
      const sourceEntry = content.wordBank.find((item) => item.id === slot.wordId);
      if (!sourceEntry) return;

      const answerWord = sourceEntry[language];
      const letters = splitGraphemes(answerWord).slice(0, slot.maxLen);
      const cells = [];

      letters.forEach((letter, offset) => {
        const row = slot.orientation === 'across' ? slot.row : slot.row + offset;
        const col = slot.orientation === 'across' ? slot.col + offset : slot.col;
        const key = `${row}-${col}`;

        grid[row][col] = {
          answer: letter,
          value: '',
          status: 'idle',
        };

        slotMap[key] = slotMap[key] || [];
        slotMap[key].push(slot.id);
        cells.push(key);
        letterBag.push(letter);
      });

      words.push({
        id: slot.id,
        clueId: sourceEntry.id,
        clue: sourceEntry.clue,
        answerWord,
        letters,
        cells,
        orientation: slot.orientation,
        reward: 10,
      });
    });

    return res.json({
      success: true,
      data: {
        language,
        level: normalizedLevel,
        totalLevels,
        grid,
        words,
        slotMap,
        letterBag: shuffleArray(letterBag),
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch crossword puzzle data.',
      details: error.message,
    });
  }
});

// Save crossword progress for a specific level
router.post('/save-progress', async (req, res) => {
  try {
    const { userId, score, completed, completedWords = [], language = 'hi', level = 1 } = req.body;

    if (!userId || typeof score !== 'number' || typeof completed !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'userId, score (number), and completed (boolean) are required.',
      });
    }

    // Find or create progress record for THIS SPECIFIC LEVEL
    let progress = await CrosswordProgress.findOne({ 
      userId, 
      gameId: 'crossword',
      language,
      level: Number(level)
    });

    if (progress) {
      // Update existing level progress
      progress.language = language;
      progress.attempts = (progress.attempts || 0) + 1;
      progress.score = Math.max(progress.score || 0, score);
      progress.completed = completed || progress.completed;
      progress.completedWords = Array.isArray(completedWords) ? completedWords : progress.completedWords;
      progress.lastPlayed = new Date();
      await progress.save();
    } else {
      // Create new level progress record
      progress = new CrosswordProgress({
        userId,
        gameId: 'crossword',
        language,
        level: Number(level),
        score,
        completed,
        completedWords: Array.isArray(completedWords) ? completedWords : [],
        attempts: 1,
        lastPlayed: new Date(),
      });
      await progress.save();
    }

    return res.json({
      success: true,
      message: 'Crossword progress saved successfully.',
      data: progress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to save crossword progress.',
      details: error.message,
    });
  }
});

// Get all crossword progress levels for a user
router.get('/progress/:userId/all', async (req, res) => {
  try {
    const { userId } = req.params;
    const { language = 'hi' } = req.query;
    
    // Get all level progress for this user
    const progressList = await CrosswordProgress.find({ 
      userId, 
      gameId: 'crossword',
      language,
    }).sort({ level: 1 });

    if (!progressList || progressList.length === 0) {
      // Return empty progress for all 5 levels
      const defaultLevels = Array.from({ length: 5 }, (_, i) => ({
        userId,
        level: i + 1,
        score: 0,
        completed: false,
        completedWords: [],
        language,
        lastPlayed: null,
      }));
      return res.json({
        success: true,
        data: defaultLevels,
      });
    }

    return res.json({
      success: true,
      data: progressList,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch crossword progress.',
      details: error.message,
    });
  }
});

// Get crossword progress for a user at specific level
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { level = 1, language = 'hi' } = req.query;

    const progress = await CrosswordProgress.findOne({ 
      userId, 
      gameId: 'crossword',
      language,
      level: Number(level)
    });

    if (!progress) {
      return res.json({
        success: true,
        data: {
          userId,
          level: Number(level),
          score: 0,
          completed: false,
          completedWords: [],
          language,
          lastPlayed: null,
        }
      });
    }

    return res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch crossword progress.',
      details: error.message,
    });
  }
});

module.exports = router;
