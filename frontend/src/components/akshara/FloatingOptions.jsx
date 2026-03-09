import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playPop } from '../../akshara-utils/sounds';

const COLORS = ['c0', 'c1', 'c2', 'c3', 'c4'];

export default function FloatingOptions({ options, onSelect, disabled, wordMode }) {
  return (
    <div className={`options-area${wordMode ? ' word-options' : ''}`}>
      <AnimatePresence mode="popLayout">
        {options.map((opt, i) => (
          <motion.button
            key={`${opt.id}-${opt.label}`}
            className={`option-bubble ${COLORS[i % COLORS.length]}${wordMode ? ' word-opt' : ''}`}
            onClick={() => {
              if (!disabled) {
                playPop();
                onSelect(opt);
              }
            }}
            disabled={disabled}
            initial={{ scale: 0, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.07 }}
            whileHover={{ scale: 1.12, y: -6 }}
            whileTap={{ scale: 0.88 }}
          >
            {opt.label}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
