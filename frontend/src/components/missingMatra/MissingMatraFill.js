import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getStars, saveStars } from '../../hooks/useGameProgress';
import './MissingMatraFill.css';

const MATRA_SYMBOLS = {
    'aa': 'ा', 'i': 'ि', 'ii': 'ी', 'u': 'ु', 'uu': 'ू',
    'e': 'े', 'ai': 'ै', 'o': 'ो', 'au': 'ौ'
};

const MissingMatraFill = () => {
    const navigate = useNavigate();
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [words, setWords] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [options, setOptions] = useState([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [isWrong, setIsWrong] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5001/api/missing-matra/levels')
            .then(res => {
                setLevels(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching levels", err);
                setLoading(false);
            });
    }, []);

    const startGame = async (level) => {
        setLoading(true);
        setSelectedLevel(level);
        try {
            const matrasQuery = level.matras.join(',');
            const res = await axios.get(`http://localhost:5001/api/missing-matra/words?matras=${matrasQuery}&limit=${level.wordsPerRound}`);
            const shuffledWords = res.data.sort(() => 0.5 - Math.random());
            setWords(shuffledWords);
            setCurrentIndex(0);
            setScore(0);
            setGameOver(false);
            generateOptions(shuffledWords[0], level);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching words", error);
            setLoading(false);
        }
    };

    const generateOptions = (word, level) => {
        if (!word) return;
        const correctMatraKey = word.keyMatra;
        const availableKeys = level.matras.filter(m => m !== correctMatraKey);

        // Pick random wrong options
        const shuffledWrongs = availableKeys.sort(() => 0.5 - Math.random()).slice(0, level.optionCount - 1);
        const finalOptions = [correctMatraKey, ...shuffledWrongs].sort(() => 0.5 - Math.random());
        setOptions(finalOptions);
    };

    const handleOptionSelect = (selectedMatraKey) => {
        if (showAnswer) return;

        const currentWord = words[currentIndex];
        if (selectedMatraKey === currentWord.keyMatra) {
            // Correct
            setScore(prev => prev + selectedLevel.pointsPerCorrect);
            setShowAnswer(true);

            // Auto advance
            setTimeout(() => {
                setShowAnswer(false);
                if (currentIndex + 1 < words.length) {
                    setCurrentIndex(prev => prev + 1);
                    generateOptions(words[currentIndex + 1], selectedLevel);
                } else {
                    handleGameOver(score + selectedLevel.pointsPerCorrect);
                }
            }, 1500);
        } else {
            // Wrong
            setIsWrong(true);
            setTimeout(() => setIsWrong(false), 500);
        }
    };

    const handleGameOver = (finalScore) => {
        setGameOver(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

        // Calculate stars
        let stars = 1;
        if (finalScore >= selectedLevel.starsThreshold[2]) stars = 3;
        else if (finalScore >= selectedLevel.starsThreshold[1]) stars = 2;

        saveStars('missing-matra', stars);
    };

    if (loading) {
        return <div className="mmf-container"><div className="mmf-title">Loading...</div></div>;
    }

    if (!selectedLevel) {
        return (
            <div className="mmf-container">
                <div className="mmf-header">
                    <button className="mmf-back-btn" onClick={() => navigate('/stages')}>← Planets</button>
                    <h1 className="mmf-title">Missing Matra Fill</h1>
                    <div style={{ width: 100 }}></div>
                </div>

                <div className="mmf-level-grid">
                    {levels.map(level => {
                        const stars = getStars('missing-matra'); // Currently global stars for the game
                        return (
                            <div key={level.level} className="mmf-level-card" onClick={() => startGame(level)}>
                                <h2>Level {level.level}</h2>
                                <h3>{level.nameHindi}</h3>
                                <p>{level.description}</p>
                                <div style={{ marginTop: '1rem', color: '#fbbf24' }}>
                                    {stars >= 1 ? '⭐'.repeat(stars) : 'Play to earn stars!'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (gameOver) {
        return (
            <div className="mmf-container">
                <div className="mmf-header">
                    <button className="mmf-back-btn" onClick={() => navigate('/stages')}>← Planets</button>
                </div>
                <div className="mmf-celebration">
                    <h1>Game Complete! 🎉</h1>
                    <h2>Your Score: {score}</h2>
                    <br />
                    <button className="mmf-option-btn" style={{ width: '200px', fontSize: '1.2rem', margin: '0 auto', color: '#1f2937' }} onClick={() => setSelectedLevel(null)}>
                        Play Again
                    </button>
                </div>
            </div>
        );
    }

    const currentWord = words[currentIndex];
    if (!currentWord) return null;

    // Build the blanked word display using Unicode separation
    // e.g. "कुत्ता" split by "ु" => ["क", "त्ता"]
    let parts = [currentWord.combined, ''];
    if (currentWord.combined && currentWord.keyMatra) {
        const matraChar = MATRA_SYMBOLS[currentWord.keyMatra];
        if (matraChar) {
            const splitParts = currentWord.combined.split(matraChar);
            if (splitParts.length >= 2) {
                // In case the matra appears multiple times, only replace the first occurrence
                parts = [splitParts[0], splitParts.slice(1).join(matraChar)];
            }
        }
    }

    return (
        <div className="mmf-container">
            <div className="mmf-header">
                <button className="mmf-back-btn" onClick={() => setSelectedLevel(null)}>← Levels</button>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Score: {score}</div>
                <div style={{ fontSize: '1.2rem' }}>{currentIndex + 1} / {words.length}</div>
            </div>

            <div className="mmf-game">
                <motion.div
                    className="mmf-card"
                    animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                >
                    {currentWord.emoji && (
                        <div style={{ fontSize: '6rem', margin: '0 auto 1.5rem', lineHeight: 1 }}>
                            {currentWord.emoji}
                        </div>
                    )}

                    <div className="mmf-word-display">
                        {showAnswer ? (
                            <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }} style={{ color: '#22c55e' }}>
                                {currentWord.combined}
                            </motion.span>
                        ) : (
                            <>
                                <span>{parts[0]}</span>
                                <span className="mmf-blank"></span>
                                <span>{parts[1]}</span>
                            </>
                        )}
                    </div>

                    <div className="mmf-meaning">
                        {currentWord.meaning}
                    </div>
                </motion.div>

                <div className="mmf-options">
                    <AnimatePresence>
                        {options.map((optKey, idx) => {
                            const isCorrect = showAnswer && optKey === currentWord.keyMatra;
                            return (
                                <motion.button
                                    key={`${currentIndex}-${optKey}`}
                                    className={`mmf-option-btn ${isCorrect ? 'correct' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => handleOptionSelect(optKey)}
                                    disabled={showAnswer}
                                >
                                    {MATRA_SYMBOLS[optKey] || '?'}
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MissingMatraFill;
