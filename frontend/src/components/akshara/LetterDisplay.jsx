import React from 'react';
import { motion } from 'framer-motion';

export default function LetterDisplay({ round, peekDone }) {
  const isWordType = round.mode === 'word' || round.mode === 'wordspot' || round.mode === 'meaning';
  const modeClass = round.mode === 'reverse' ? 'reverse-mode'
    : round.mode === 'split' ? 'reverse-mode'
    : round.mode === 'peek' ? 'peek-mode'
    : isWordType ? 'word-mode' : '';

  const displaySymbol = (round.mode === 'peek' && peekDone) ? '?' : round.prompt;

  return (
    <div className="letter-container">
      <div className="letter-ring-outer" />
      <div className="letter-ring-inner" />
      <motion.div
        className={`letter-display ${modeClass} ${round.mode === 'peek' && peekDone ? 'peek-hidden' : ''}`}
        key={round.prompt + String(peekDone)}
        initial={{ scale: 0.7, opacity: 0, rotateY: 90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
      >
        {displaySymbol}
      </motion.div>
      {round.mode === 'peek' && peekDone && (
        <div className="peek-sublabel">Which matra did you see?</div>
      )}
    </div>
  );
}
