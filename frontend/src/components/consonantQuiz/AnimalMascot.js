import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const AnimalMascot = ({ state }) => {
  const face = state === 'correct' ? '🦁' : state === 'wrong' ? '🐵' : '🐶';

  const animation =
    state === 'correct'
      ? { y: [0, -30, 0], rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] }
      : state === 'wrong'
      ? { x: [0, -10, 10, 0] }
      : { y: [0, -8, 0] };

  const transition =
    state === 'idle'
      ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
      : { duration: 0.7, type: 'spring', bounce: 0.5 };

  return (
    <div className="cq-mascot">
      <motion.div className="cq-mascot-face" animate={animation} transition={transition}>
        {face}
      </motion.div>
      <motion.div
        className="cq-mascot-shadow"
        animate={{ scale: [1, 0.9, 1], opacity: [0.5, 0.3, 0.5] }}
        transition={transition}
      />
      <AnimatePresence>
        {state === 'correct' && (
          <motion.div
            className="cq-bubble success"
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
          >
            Awesome!
          </motion.div>
        )}
        {state === 'wrong' && (
          <motion.div
            className="cq-bubble warning"
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
          >
            Try again!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimalMascot;
