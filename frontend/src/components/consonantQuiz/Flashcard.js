import React from 'react';
import { motion } from 'framer-motion';

const Flashcard = ({ letter }) => {
  return (
    <motion.div
      className="cq-flashcard"
      initial={{ scale: 0.9, rotate: -4 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    >
      <span className="cq-flashcard-letter">{letter}</span>
    </motion.div>
  );
};

export default Flashcard;
