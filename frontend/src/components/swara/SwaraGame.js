import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MemoryCard from './MemoryCard';
import { swaraData } from './SwaraData';
import './SwaraGame.css';

// Utility to shuffle an array
const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

export default function SwaraGame() {
    const location = useLocation();
    const navigate = useNavigate();
    // Default to Hindi if language not passed
    const language = location.state?.language || 'hindi';

    const [cards, setCards] = useState([]);
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedIds, setMatchedIds] = useState([]);
    const [isLocked, setIsLocked] = useState(false);
    const [moves, setMoves] = useState(0);
    const [level, setLevel] = useState(1);

    // Setup game on mount or level change
    useEffect(() => {
        startNewGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, level]);

    const startNewGame = () => {
        const allPairs = swaraData[language];

        // Slicing 2 unique pairs for the current level sequentially
        const startIndex = ((level - 1) * 2) % allPairs.length;
        let selectedPairs = allPairs.slice(startIndex, startIndex + 2);

        // If at the very end and only 1 item retrieved, wrap around
        if (selectedPairs.length < 2) {
            selectedPairs.push(allPairs[0]);
        }

        let deck = [];
        selectedPairs.forEach(pair => {
            // Create Letter Card
            deck.push({ ...pair, uniqueId: `${pair.id}-letter`, isImage: false, content: pair.letter, audio: pair.audioLetter });
            // Create Image Card
            deck.push({ ...pair, uniqueId: `${pair.id}-image`, isImage: true, content: pair.image, audio: pair.audioWord });
        });

        setCards(shuffleArray(deck));
        setFlippedIndices([]);
        setMatchedIds([]);
        setMoves(0);
        setIsLocked(false);
    };

    const playAudio = (url) => {
        const audio = new Audio(`http://localhost:5001${url}`);
        audio.play().catch(e => console.log('Audio not found yet:', e));
    };

    const handleCardClick = (index) => {
        if (isLocked) return;
        if (flippedIndices.includes(index) || matchedIds.includes(cards[index].id)) return;

        // Play card audio
        playAudio(cards[index].audio);

        const newFlipped = [...flippedIndices, index];
        setFlippedIndices(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(moves => moves + 1);
            setIsLocked(true);

            const card1 = cards[newFlipped[0]];
            const card2 = cards[newFlipped[1]];

            if (card1.id === card2.id) {
                // Match!
                setTimeout(() => {
                    setMatchedIds(prev => [...prev, card1.id]);
                    setFlippedIndices([]);
                    setIsLocked(false);
                    // Optional: Add success chime here
                }, 500);
            } else {
                // Mismatch!
                setTimeout(() => {
                    setFlippedIndices([]);
                    setIsLocked(false);
                    // Optional: Add error buzz here
                }, 1000);
            }
        }
    };

    // Check victory condition
    const totalPairs = cards.length / 2;
    const isVictory = totalPairs > 0 && matchedIds.length === totalPairs;

    return (
        <div className="swara-game-container">
            <div className="swara-header">
                <button className="back-btn" onClick={() => navigate('/game-hub')}>
                    ← Back
                </button>
                <h1>{language === 'hindi' ? 'Swar Match' : 'Achchulu Match'} <span style={{ fontSize: '1.5rem', color: '#666' }}>Lvl {level}</span></h1>
                <div className="moves-counter">Moves: {moves}</div>
            </div>

            <div className="swara-board">
                {cards.map((card, index) => (
                    <MemoryCard
                        key={card.uniqueId}
                        card={card}
                        isFlipped={flippedIndices.includes(index) || matchedIds.includes(card.id)}
                        isMatched={matchedIds.includes(card.id)}
                        onClick={() => handleCardClick(index)}
                    />
                ))}
            </div>

            {isVictory && (
                <div className="victory-modal">
                    <h2>🎉 You Did It! 🎉</h2>
                    <p>Matched all pairs perfectly!</p>
                    <button className="play-again-btn" onClick={() => setLevel(lvl => lvl + 1)}>
                        Next Level ➡️
                    </button>
                </div>
            )}
        </div>
    );
}
