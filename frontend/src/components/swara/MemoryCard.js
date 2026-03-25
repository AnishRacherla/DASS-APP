import React from 'react';
import './MemoryCard.css';

export default function MemoryCard({ card, isFlipped, isMatched, onClick }) {
    // If it's a letter, show the letter. If it's an image, show the image.
    const isImage = card.isImage;

    return (
        <div
            className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
            onClick={() => {
                if (!isFlipped && !isMatched) {
                    onClick(card);
                }
            }}
        >
            <div className="memory-card-inner">
                <div className="memory-card-front">
                    <span className="question-mark">?</span>
                </div>
                <div className="memory-card-back">
                    {isImage ? (
                        <img src={`http://localhost:5001${card.image}`} alt="Flashcard" className="card-image" />
                    ) : (
                        <span className="card-letter">{card.letter}</span>
                    )}
                </div>
            </div>
        </div>
    );
}
