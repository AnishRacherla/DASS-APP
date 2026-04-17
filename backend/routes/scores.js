const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const Progress = require('../models/Progress');

// Submit any game score (no scaling - use raw scores)
router.post('/', async (req, res) => {
  try {
    const { 
      userId, 
      quizId, 
      gameType = 'quiz',
      language, 
      level, 
      score, 
      correctAnswers,
      totalQuestions,
      answers 
    } = req.body;

    // Use raw score without any scaling
    const finalScore = score;
    const finalStars = req.body.stars || 0;

    // Check if this game/level was played before
    const previousScore = await Score.findOne({
      userId,
      gameType,
      language,
      level: level || 1
    }).sort({ completedAt: -1 });

    const newScore = new Score({
      userId,
      quizId,
      gameType,
      language,
      level: level || 1,
      score: finalScore,
      stars: finalStars,
      correctAnswers: correctAnswers || 0,
      totalQuestions: totalQuestions || 5,
      answers
    });

    await newScore.save();

    // Update user progress (create if missing so score save never fails with 404)
    let progress = await Progress.findOne({ userId, language });

    if (!progress) {
      progress = new Progress({
        userId,
        language,
        currentLevel: 1,
        totalScore: 0,
        quizzesCompleted: 0
      });
    }

    // If there was a previous score, subtract it first
    if (previousScore) {
      progress.totalScore -= previousScore.score;
    }

    // Then add the new score
    progress.totalScore += finalScore;

    // For quiz, update level progress
    if (gameType === 'quiz') {
      // Only increment quizzes completed if this is a new level
      if (!previousScore) {
        progress.quizzesCompleted += 1;
      }

      // Unlock next level if score >= 3
      if (score >= 3 && level >= progress.currentLevel) {
        progress.currentLevel = level + 1;
      }
    }

    progress.updatedAt = Date.now();
    await progress.save();

    // Calculate updated average stars for this game type
    const userScores = await Score.find({ userId, gameType, language });
    const levelStarsMap = {};
    userScores.forEach(s => {
      const lvl = s.level || 1;
      // if multiple attempts, keep the latest or highest? We usually sort by completedAt -1 above.
      // But Score.find() without sort might return mixed. Let's just track the latest for each level logic as earlier,
      // or simply the highest stars. Let's use highest stars per level for average.
      levelStarsMap[lvl] = Math.max(levelStarsMap[lvl] || 0, s.stars || 0);
    });
    
    let sumStars = 0;
    let countLevels = 0;
    Object.values(levelStarsMap).forEach(st => {
      sumStars += st;
      countLevels++;
    });
    const averageStars = countLevels > 0 ? Math.round(sumStars / countLevels) : 0;

    res.status(201).json({
      success: true,
      score: newScore,
      progress,
      averageStars,
      message: previousScore ? 'Score updated' : 'Score saved'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get scores by user
router.get('/user/:userId', async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.params.userId })
      .sort({ completedAt: -1 });

    res.json({
      success: true,
      scores
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get total score summary for a user
router.get('/user/:userId/total', async (req, res) => {
  try {
    const { language } = req.query;
    const query = { userId: req.params.userId };
    
    if (language) {
      query.language = language;
    }

    const scores = await Score.find(query).sort({ completedAt: -1 });

    // Group scores by game type and level, keeping only the latest (most recent) score
    const latestScores = {};
    scores.forEach(score => {
      const gameType = score.gameType || 'quiz';
      const level = score.level || 1;
      const key = `${gameType}-${level}`;
      
      // Only keep the first occurrence (latest due to sorting)
      if (!latestScores[key]) {
        latestScores[key] = score;
      }
    });

    // Calculate totals by game type using only latest scores
    const gameTypeTotals = {};
    const gameTypeStarsSum = {};
    const gameTypeLevelCount = {};
    let totalScore = 0;

    Object.values(latestScores).forEach(score => {
      const gameType = score.gameType || 'quiz';
      gameTypeTotals[gameType] = (gameTypeTotals[gameType] || 0) + score.score;
      totalScore += score.score;
      
      // For stars calculation
      gameTypeStarsSum[gameType] = (gameTypeStarsSum[gameType] || 0) + (score.stars || 0);
      gameTypeLevelCount[gameType] = (gameTypeLevelCount[gameType] || 0) + 1;
    });

    const averageStars = {};
    Object.keys(gameTypeLevelCount).forEach(type => {
      averageStars[type] = Math.round(gameTypeStarsSum[type] / gameTypeLevelCount[type]);
    });

    // Count unique games played (unique game-level combinations)
    const uniqueGames = Object.values(latestScores);
    const gamesPlayed = {
      total: uniqueGames.length
    };
    Object.keys(gameTypeLevelCount).forEach(type => {
      gamesPlayed[type] = gameTypeLevelCount[type];
    });

    res.json({
      success: true,
      totalScore,
      gameTypeTotals,
      gamesPlayed,
      averageStars,
      language
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
