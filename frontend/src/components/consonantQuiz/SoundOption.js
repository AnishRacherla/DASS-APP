import React, { useState } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#ff6b6b', '#4ecdc4', '#ffd166', '#06d6a0'];

const SoundOption = ({ audioBase64, onSelect, index, isSelected }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const accent = COLORS[index % COLORS.length];

  const handlePlay = () => {
    const audio = new Audio(audioBase64);
    setIsPlaying(true);
    audio.play().catch(() => setIsPlaying(false));
    audio.onended = () => setIsPlaying(false);
    onSelect();
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={handlePlay}
      className={`cq-sound-btn ${isSelected ? 'selected' : ''} ${isPlaying ? 'playing' : ''}`}
      style={{ '--cq-accent': accent }}
    >
      <span className="cq-sound-index">{index + 1}</span>
      <span className="cq-sound-icon">🔊</span>
      <span className="cq-sound-text">Play</span>
      {isSelected && <span className="cq-sound-check">✓</span>}
    </motion.button>
  );
};

export default SoundOption;
