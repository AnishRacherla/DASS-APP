import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComboDisplay({ streak }) {
  if (streak < 3) return null;

  const labels = {
    3: 'Nice!',
    4: 'Great!',
    5: 'Amazing!',
    6: 'Incredible!',
    7: 'Unstoppable!',
  };
  const label = labels[Math.min(streak, 7)] || 'GODLIKE! 🌟';
  const bonus = streak * 5;

  return (
    <AnimatePresence>
      <motion.div
        className="combo-display"
        key={streak}
        initial={{ scale: 0.5, opacity: 0, x: 30 }}
        animate={{ scale: 1, opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        <div className="combo-text">🔥 x{streak}</div>
        <div className="combo-bonus">{label} +{bonus}</div>
      </motion.div>
    </AnimatePresence>
  );
}
