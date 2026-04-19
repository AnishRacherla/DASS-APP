import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameOverOverlay({ show, score, onRetry, onQuit }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="game-over-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="game-over-card"
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 18 }}
          >
            <div className="go-icon">💔</div>
            <h2>Game Over!</h2>
            <p className="go-sub">You ran out of lives. Don&apos;t give up!</p>
            <div className="go-score">💎 {score}</div>
            <div className="go-buttons">
              <button className="go-btn quit" onClick={onQuit}>🏠 Home</button>
              <button className="go-btn retry" onClick={onRetry}>🔄 Retry</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
