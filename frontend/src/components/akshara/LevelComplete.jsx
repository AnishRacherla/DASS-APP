import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function LevelComplete({ show, level, stars, score, correct, total, bestStreak, onNext, onLevels }) {
  useEffect(() => {
    if (show && stars >= 2) {
      setTimeout(() => {
        confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 }, colors: ['#a855f7', '#f472b6', '#fbbf24', '#34d399'] });
      }, 400);
    }
  }, [show, stars]);

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="level-complete-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="lc-card-inner"
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 18, delay: 0.1 }}
          >
            <div className="trophy">
              {stars === 3 ? '🏆' : stars === 2 ? '🎉' : stars === 1 ? '👏' : '😊'}
            </div>
            <h2>Level Complete!</h2>
            <p className="sub">{level.name} — {level.emoji}</p>

            <div className="stars-display">
              {[1, 2, 3].map(s => (
                <motion.span
                  key={s}
                  className={s <= stars ? '' : 'star-empty'}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + s * 0.15, type: 'spring', stiffness: 300 }}
                >
                  ⭐
                </motion.span>
              ))}
            </div>

            <div className="stats-grid">
              <div className="sg-item">
                <div className="sg-val">{score}</div>
                <div className="sg-label">Score</div>
              </div>
              <div className="sg-item">
                <div className="sg-val">{accuracy}%</div>
                <div className="sg-label">Accuracy</div>
              </div>
              <div className="sg-item">
                <div className="sg-val">{bestStreak}🔥</div>
                <div className="sg-label">Best Streak</div>
              </div>
            </div>

            {stars === 3 && (
              <motion.div
                className="achievement-popup"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring' }}
              >
                🏅 Perfect Score! All 3 Stars!
              </motion.div>
            )}

            <div className="lc-buttons">
              <button className="lc-btn secondary" onClick={onLevels}>📋 Levels</button>
              <button className="lc-btn primary" onClick={onNext}>▶️ Next Level</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
