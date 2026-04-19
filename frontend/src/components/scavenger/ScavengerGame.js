import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import './ScavengerGame.css';

const API_BASE = 'http://localhost:5001';

export default function ScavengerGame() {
    const navigate = useNavigate();
    const location = useLocation();
    const { language, level } = location.state || {};

    const [scene, setScene] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [foundLetters, setFoundLetters] = useState([]);
    const [currentTarget, setCurrentTarget] = useState(0);
    const [score, setScore] = useState(0);
    const [wrongTaps, setWrongTaps] = useState(0);
    const [showWrongFeedback, setShowWrongFeedback] = useState(null);
    const [showCorrectFeedback, setShowCorrectFeedback] = useState(null);
    const [gameComplete, setGameComplete] = useState(false);
    const [timer, setTimer] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHintCircle, setShowHintCircle] = useState(false);
    const timerRef = useRef(null);
    const audioRef = useRef(null);

    // Fetch scene data and reset state on level change
    useEffect(() => {
        if (!language || !level) {
            navigate('/scavenger');
            return;
        }

        // Reset all game state when transitioning to next scene
        setFoundLetters([]);
        setCurrentTarget(0);
        setScore(0);
        setWrongTaps(0);
        setGameComplete(false);
        setTimer(0);
        setHintsUsed(0);
        setShowHintCircle(false);
        setLoading(true);

        const fetchScene = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/scavenger/${language}/${level}`);
                const data = await response.json();
                if (data.success) {
                    setScene(data.scene);
                } else {
                    setError('Scene not found');
                }
            } catch (err) {
                setError('Failed to load scene');
            } finally {
                setLoading(false);
            }
        };

        fetchScene();
    }, [language, level, navigate]);

    // Timer
    useEffect(() => {
        if (!loading && scene && !gameComplete) {
            timerRef.current = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [loading, scene, gameComplete]);

    // Play audio for current target letter
    const playTargetAudio = useCallback(() => {
        if (!scene || gameComplete) return;
        const letter = scene.gameData.letters[currentTarget];
        if (!letter) return;

        if (audioRef.current) {
            audioRef.current.pause();
        }
        const audio = new Audio(`${API_BASE}${letter.audioUrl}`);
        audio.play().catch(() => { });
        audioRef.current = audio;
    }, [scene, currentTarget, gameComplete]);

    // Auto-play audio when target changes
    useEffect(() => {
        if (scene && !loading) {
            const timeout = setTimeout(playTargetAudio, 500);
            return () => clearTimeout(timeout);
        }
    }, [currentTarget, scene, loading, playTargetAudio]);

    // Handle tap on the scene
    const handleSceneTap = useCallback((e) => {
        if (!scene || gameComplete) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const tapX = ((e.clientX - rect.left) / rect.width) * 100;
        const tapY = ((e.clientY - rect.top) / rect.height) * 100;

        const letters = scene.gameData.letters;

        // Check if tap is near any unfound letter
        let found = false;
        letters.forEach((letter, idx) => {
            if (foundLetters.includes(idx)) return;
            const dx = tapX - letter.x;
            const dy = tapY - letter.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 8) { // ~8% radius hitbox
                found = true;
                const newFound = [...foundLetters, idx];
                setFoundLetters(newFound);
                setScore(prev => prev + 10);
                setShowCorrectFeedback({ x: letter.x, y: letter.y, letter: letter.letter });

                // Play letter audio
                const audio = new Audio(`${API_BASE}${letter.audioUrl}`);
                audio.play().catch(() => { });
                audioRef.current = audio;

                setTimeout(() => setShowCorrectFeedback(null), 1500);

                // Check if all letters found
                if (newFound.length === letters.length) {
                    // Game complete!
                    clearInterval(timerRef.current);
                    setGameComplete(true);
                    setTimeout(() => {
                        confetti({
                            particleCount: 150,
                            spread: 80,
                            origin: { y: 0.6 }
                        });
                    }, 300);
                } else {
                    // Move to next unfound target
                    const remaining = letters.map((_, i) => i).filter(i => !newFound.includes(i));
                    if (remaining.length > 0) {
                        setCurrentTarget(remaining[0]);
                    }
                }
            }
        });

        if (!found) {
            setWrongTaps(prev => prev + 1);
            setShowWrongFeedback({ x: tapX, y: tapY });
            setTimeout(() => setShowWrongFeedback(null), 800);
        }
    }, [scene, gameComplete, foundLetters]);

    // Hint — show a pulsing red circle around current target
    const handleHint = () => {
        setHintsUsed(prev => prev + 1);
        playTargetAudio();
        setShowHintCircle(true);
        setTimeout(() => setShowHintCircle(false), 5000); // show for 5 seconds
    };

    // Calculate stars
    const getStars = () => {
        if (hintsUsed === 0 && wrongTaps <= 2) return 3;
        if (hintsUsed <= 2 && wrongTaps <= 5) return 2;
        return 1;
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Loading state
    if (loading) {
        return (
            <div className="scav-game">
                <div className="scav-loading">
                    <div className="scav-loader"></div>
                    <p>Loading scene...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="scav-game">
                <div className="scav-loading">
                    <p>❌ {error}</p>
                    <button onClick={() => navigate('/scavenger')}>Go Back</button>
                </div>
            </div>
        );
    }

    const letters = scene.gameData.letters;

    return (
        <div className="scav-game">
            {/* Header */}
            <div className="scav-game-header">
                <button className="scav-back-btn" onClick={() => navigate('/scavenger')}>
                    ← Back
                </button>
                <div className="scav-game-info">
                    <span className="scav-stat">⏱ {formatTime(timer)}</span>
                    <span className="scav-stat">⭐ {score}</span>
                    <span className="scav-stat">🔍 {foundLetters.length}/{letters.length}</span>
                </div>
            </div>

            {/* Target Letter Prompt — audio only, no letter shown */}
            {!gameComplete && (
                <motion.div
                    className="scav-target-prompt"
                    key={currentTarget}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                >
                    <span className="scav-target-text">
                        🎧 Listen and find the letter!
                    </span>
                    <button className="scav-audio-btn" onClick={playTargetAudio}>🔊 Play Sound</button>
                    <button className="scav-hint-btn" onClick={handleHint}>💡 Hint</button>
                </motion.div>
            )}

            {/* Scene Container */}
            <div className="scav-scene-container" onClick={handleSceneTap}>
                <img
                    src={`${API_BASE}${scene.gameData.sceneImage}`}
                    alt={scene.gameData.scene}
                    className="scav-scene-img"
                    draggable={false}
                />

                {/* Letters on scene — semi-transparent when unfound, gold when found */}
                {letters.map((letter, idx) => (
                    <motion.div
                        key={idx}
                        className={`scav-hidden-letter ${foundLetters.includes(idx) ? 'found' : ''}`}
                        style={{
                            left: `${letter.x}%`,
                            top: `${letter.y}%`,
                            color: foundLetters.includes(idx)
                                ? '#FFD700'
                                : letter.blendColor || 'rgba(255,255,255,0.25)',
                        }}
                        animate={foundLetters.includes(idx) ? {
                            scale: [1, 1.8, 1.4],
                            opacity: 1,
                        } : {}}
                    >
                        {letter.letter}
                    </motion.div>
                ))}

                {/* Hint circle — appears on click, stays 5s, then fades */}
                <AnimatePresence>
                    {showHintCircle && !foundLetters.includes(currentTarget) && (
                        <motion.div
                            className="scav-hint-circle"
                            style={{
                                left: `${letters[currentTarget].x}%`,
                                top: `${letters[currentTarget].y}%`,
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.85 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        />
                    )}
                </AnimatePresence>

                {/* Wrong tap feedback */}
                <AnimatePresence>
                    {showWrongFeedback && (
                        <motion.div
                            className="scav-wrong-tap"
                            style={{ left: `${showWrongFeedback.x}%`, top: `${showWrongFeedback.y}%` }}
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            ✗
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Correct tap feedback */}
                <AnimatePresence>
                    {showCorrectFeedback && (
                        <motion.div
                            className="scav-correct-tap"
                            style={{ left: `${showCorrectFeedback.x}%`, top: `${showCorrectFeedback.y}%` }}
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                        >
                            ✨ {showCorrectFeedback.letter} ✨
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Found letters bar */}
            <div className="scav-found-bar">
                {letters.map((letter, idx) => (
                    <div
                        key={idx}
                        className={`scav-found-slot ${foundLetters.includes(idx) ? 'filled' : ''}`}
                    >
                        {foundLetters.includes(idx) ? letter.letter : '?'}
                    </div>
                ))}
            </div>

            {/* Game Complete Overlay */}
            <AnimatePresence>
                {gameComplete && (
                    <motion.div
                        className="scav-complete-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="scav-complete-card"
                            initial={{ scale: 0.5, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                        >
                            <button 
                                className="scav-close-modal-btn" 
                                onClick={() => setGameComplete(false)}
                            >
                                ✕
                            </button>
                            <h2>🎉 {language === 'telugu' ? 'అద్భుతం!' : 'शाबाश!'}</h2>
                            <p className="scav-complete-subtitle">All letters found!</p>

                            <div className="scav-stars">
                                {[1, 2, 3].map(star => (
                                    <motion.span
                                        key={star}
                                        className={`scav-star ${star <= getStars() ? 'earned' : ''}`}
                                        initial={{ rotate: -30, scale: 0 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ delay: star * 0.2, type: 'spring' }}
                                    >
                                        ⭐
                                    </motion.span>
                                ))}
                            </div>

                            <div className="scav-complete-stats">
                                <div className="scav-complete-stat">
                                    <span className="scav-stat-label">Score</span>
                                    <span className="scav-stat-value">{score}</span>
                                </div>
                                <div className="scav-complete-stat">
                                    <span className="scav-stat-label">Time</span>
                                    <span className="scav-stat-value">{formatTime(timer)}</span>
                                </div>
                                <div className="scav-complete-stat">
                                    <span className="scav-stat-label">Wrong Taps</span>
                                    <span className="scav-stat-value">{wrongTaps}</span>
                                </div>
                            </div>

                            <div className="scav-complete-actions">
                                <button
                                    className="scav-action-btn primary"
                                    onClick={() => window.location.reload()}
                                >
                                    🔄 Play Again
                                </button>
                                {level < 5 && (
                                    <button
                                        className="scav-action-btn secondary"
                                        onClick={() => navigate('/scavenger/play', {
                                            state: { language, level: level + 1 }
                                        })}
                                    >
                                        ▶ Next Scene
                                    </button>
                                )}
                                <button
                                    className="scav-action-btn outline"
                                    onClick={() => navigate('/scavenger')}
                                >
                                    🏠 All Scenes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
