import React from 'react';
import { motion } from 'framer-motion';
import './MemoryCard.css';

const MemoryCard = ({ card, isFlipped, isMatched, onClick, disabled }) => {
    const handleClick = () => {
        if (!disabled && !isFlipped && !isMatched) {
            onClick(card);
        }
    };

    return (
        <motion.div
            className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
            onClick={handleClick}
            whileHover={!isFlipped && !isMatched && !disabled ? { scale: 1.05 } : {}}
            whileTap={!isFlipped && !isMatched && !disabled ? { scale: 0.95 } : {}}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
            <div className="memory-card-inner">
                {/* Back (hidden side - shows ?) */}
                <div className="memory-card-back">
                    <span className="memory-card-question">?</span>
                </div>

                {/* Front (revealed side - shows content) */}
                <div className="memory-card-front">
                    {card.type === 'letter' ? (
                        <div className="memory-card-letter-content">
                            <span className="memory-card-letter">{card.letter}</span>
                            <span className="memory-card-word">{card.word}</span>
                        </div>
                    ) : (
                        <div className="memory-card-image-content">
                            <img
                                src={card.image}
                                alt={card.word}
                                className="memory-card-img"
                                draggable={false}
                            />
                            <span className="memory-card-img-word">{card.word}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Match glow effect */}
            {isMatched && <div className="memory-card-match-glow" />}
        </motion.div>
    );
};

export default MemoryCard;
