
const fs = require('fs');
const jsFile = 'C:/Users/Anish/OneDrive/Desktop/gittest/project-monorepo-team-51/backend/routes/scores.js';
let code = fs.readFileSync(jsFile, 'utf8');

const oldStr1 = \    // Check if this game/level was played before
    const previousScore = await Score.findOne({
      userId,
      gameType,
      language,
      level: level || 1
    }).sort({ completedAt: -1 });\;

const newStr1 = \    // Give ONLY HIGHEST OF PREVIOUS - That is, keeping the max score!
    const highestScoreDoc = await Score.findOne({
      userId,
      gameType,
      language,
      level: level || 1
    }).sort({ score: -1, completedAt: -1 });\;

code = code.replace(oldStr1, newStr1);

const oldStr2 = \    // If there was a previous score, subtract it first
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
    }\;

const newStr2 = \    // If this is the FIRST time playing, add the full score.
    // If they played before, ONLY update if the new score is HIGHER than their previous best!
    if (!highestScoreDoc) {
      progress.totalScore += finalScore;
    } else if (finalScore > highestScoreDoc.score) {
      progress.totalScore += (finalScore - highestScoreDoc.score);
    }

    // For quiz, update level progress
    if (gameType === 'quiz') {
      // Only increment quizzes completed if this is a new level
      if (!highestScoreDoc) {
        progress.quizzesCompleted += 1;
      }

      // Unlock next level if score >= 3
      if (score >= 3 && level >= progress.currentLevel) {
        progress.currentLevel = level + 1;
      }
    }\;

code = code.replace(oldStr2, newStr2);

const oldStr3 = \    const scores = await Score.find(query).sort({ completedAt: -1 });\;
const newStr3 = \    const scores = await Score.find(query).sort({ score: -1, completedAt: -1 });\;
// For /user/:userId/total only keeping latest -> now highest
if (code.includes(oldStr3)) {
    code = code.replace(oldStr3, newStr3);
}

fs.writeFileSync(jsFile, code);

