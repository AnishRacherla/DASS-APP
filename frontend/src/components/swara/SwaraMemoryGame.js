import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import MemoryCard from './MemoryCard';
import { HINDI_SWARAS, TELUGU_SWARAS, LEVELS } from './SwaraData';
import './SwaraMemoryGame.css';

// Shuffle array helper
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Generate card pairs from swaras
function generateCards(swaras, pairCount) {
    const selected = shuffleArray(swaras).slice(0, pairCount);
    const cards = [];

    selected.forEach((swara) => {
        // Letter card
        cards.push({
            uid: `letter-${swara.id}`,
            pairId: swara.id,
            type: 'letter',
            letter: swara.letter,
            word: swara.word,
            audio: swara.audio,
        });
        // Image card
        cards.push({
            uid: `image-${swara.id}`,
            pairId: swara.id,
            type: 'image',
            image: swara.image,
            word: swara.word,
            audio: swara.audio,
        });
    });

    return shuffleArray(cards);
}

export default function SwaraMemoryGame() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState(
        localStorage.getItem('userLanguage') || 'hindi'
    );
    const [level, setLevel] = useState(null);
    const [cards, setCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [moves, setMoves] = useState(0);
    const [isChecking, setIsChecking] = useState(false);
    const [gameComplete, setGameComplete] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);

    const swaras = language === 'telugu' ? TELUGU_SWARAS : HINDI_SWARAS;

    // Timer effect
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimer((t) => t + 1);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    // Start a level
    const startLevel = useCallback((selectedLevel) => {
        setLevel(selectedLevel);
        setCards(generateCards(swaras, selectedLevel.pairs));
        setFlippedCards([]);
        setMatchedPairs([]);
        setMoves(0);
        setGameComplete(false);
        setTimer(0);
        setIsRunning(true);
        setIsChecking(false);
    }, [swaras]);

    // Handle card click
    const handleCardClick = useCallback((card) => {
        if (isChecking) return;
        if (flippedCards.length >= 2) return;
        if (flippedCards.find((c) => c.uid === card.uid)) return;

        const newFlipped = [...flippedCards, card];
        setFlippedCards(newFlipped);

        // Play audio for this card
        try {
            const audio = new Audio(card.audio);
            audio.volume = 0.6;
            audio.play().catch(() => { });
        } catch (e) { /* ignore */ }

        if (newFlipped.length === 2) {
            setMoves((m) => m + 1);
            setIsChecking(true);

            const [first, second] = newFlipped;

            if (first.pairId === second.pairId && first.uid !== second.uid) {
                // Match!
                setTimeout(() => {
                    setMatchedPairs((prev) => {
                        const updated = [...prev, first.pairId];
                        // Check if game is complete
                        if (updated.length === level.pairs) {
                            setIsRunning(false);
                            setGameComplete(true);
                            confetti({
                                particleCount: 200,
                                spread: 100,
                                origin: { y: 0.6 },
                                colors: ['#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'],
                            });
                        }
                        return updated;
                    });
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 700);
            } else {
                // No match — flip back
                setTimeout(() => {
                    setFlippedCards([]);
                    setIsChecking(false);
                }, 1000);
            }
        }
    }, [flippedCards, isChecking, level]);

    // Check if a card is flipped
    const isCardFlipped = (card) =>
        flippedCards.some((c) => c.uid === card.uid);

    // Check if a card is matched
    const isCardMatched = (card) =>
        matchedPairs.includes(card.pairId);

    // Format timer
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // ===== LEVEL SELECT =====
    if (!level) {
        return (
            <div className="smg-page">
                <div className="smg-bg-particles" />
                <header className="smg-header">
                    <button className="smg-back-btn" onClick={() => navigate('/game-hub')}>
                        ← Back to Games
                    </button>
                    <h1>🃏 {language === 'telugu' ? 'స్వర జోడీ' : 'स्वर जोड़ी'} — Swara Pair Cards</h1>
                    <p className="smg-subtitle">Match the {language === 'telugu' ? 'Telugu' : 'Hindi'} vowel letter with its picture!</p>
                </header>

                {/* Language Toggle */}
                <div className="smg-lang-toggle">
                    <button
                        className={`smg-lang-btn ${language === 'hindi' ? 'active' : ''}`}
                        onClick={() => { setLanguage('hindi'); localStorage.setItem('userLanguage', 'hindi'); }}
                    >
                        Hindi
                    </button>
                    <button
                        className={`smg-lang-btn ${language === 'telugu' ? 'active' : ''}`}
                        onClick={() => { setLanguage('telugu'); localStorage.setItem('userLanguage', 'telugu'); }}
                    >
                        Telugu
                    </button>
                </div>

                <div className="smg-level-select">
                    <h2>Choose Difficulty</h2>
                    <div className="smg-level-grid">
                        {LEVELS.map((lvl) => (
                            <motion.button
                                key={lvl.id}
                                className="smg-level-btn"
                                onClick={() => startLevel(lvl)}
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <span className="smg-level-name">{lvl.name}</span>
                                <span className="smg-level-desc">{lvl.description}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ===== GAME COMPLETE =====
    if (gameComplete) {
        return (
            <div className="smg-page">
                <div className="smg-bg-particles" />
                <div className="smg-complete">
                    <motion.div
                        className="smg-complete-card"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                    >
                        <div className="smg-complete-stars">⭐ 🌟 ⭐ 🌟 ⭐</div>
                        <div className="smg-complete-emoji">🎉</div>
                        <h2>Well Done! शाबाश!</h2>
                        <div className="smg-complete-stats">
                            <div className="smg-stat">
                                <span className="smg-stat-label">Moves</span>
                                <span className="smg-stat-value">{moves}</span>
                            </div>
                            <div className="smg-stat">
                                <span className="smg-stat-label">Time</span>
                                <span className="smg-stat-value">{formatTime(timer)}</span>
                            </div>
                            <div className="smg-stat">
                                <span className="smg-stat-label">Pairs</span>
                                <span className="smg-stat-value">{level.pairs}</span>
                            </div>
                        </div>
                        <div className="smg-complete-actions">
                            <button className="smg-replay-btn" onClick={() => startLevel(level)}>
                                🔁 Play Again
                            </button>
                            <button className="smg-levels-btn" onClick={() => setLevel(null)}>
                                📋 Change Level
                            </button>
                            <button className="smg-home-btn" onClick={() => navigate('/game-hub')}>
                                🏠 Game Hub
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ===== MAIN GAME =====
    return (
        <div className="smg-page">
            <div className="smg-bg-particles" />

            {/* Header */}
            <header className="smg-game-header">
                <button className="smg-back-btn" onClick={() => setLevel(null)}>
                    ← Levels
                </button>
                <h1 className="smg-game-title">🃏 Swara Pair Cards</h1>
                <div className="smg-game-stats">
                    <span className="smg-game-stat">🎯 {moves} moves</span>
                    <span className="smg-game-stat">⏱ {formatTime(timer)}</span>
                    <span className="smg-game-stat">✅ {matchedPairs.length}/{level.pairs}</span>
                </div>
            </header>

            {/* Card Grid */}
            <AnimatePresence>
                <motion.div
                    className={`smg-grid smg-grid-${level.pairs <= 4 ? 'easy' : level.pairs <= 6 ? 'medium' : 'hard'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {cards.map((card) => (
                        <MemoryCard
                            key={card.uid}
                            card={card}
                            isFlipped={isCardFlipped(card)}
                            isMatched={isCardMatched(card)}
                            onClick={handleCardClick}
                            disabled={isChecking}
                        />
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
