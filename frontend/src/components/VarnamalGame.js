import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import './VarnamalGame.css';

const HINDI_CONSONANTS = [
    'क', 'ख', 'ग', 'घ', 'ङ',
    'च', 'छ', 'ज', 'झ', 'ञ',
    'ट', 'ठ', 'ड', 'ढ', 'ण',
    'त', 'थ', 'द', 'ध', 'न',
    'प', 'फ', 'ब', 'भ', 'म',
    'य', 'र', 'ल', 'व',
    'श', 'ष', 'स', 'ह',
    'क्ष', 'त्र', 'ज्ञ'
];

const TELUGU_CONSONANTS = [
    'క', 'ఖ', 'గ', 'ఘ', 'ఙ',
    'చ', 'ఛ', 'జ', 'ఝ', 'ఞ',
    'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
    'త', 'థ', 'ద', 'ధ', 'న',
    'ప', 'ఫ', 'బ', 'భ', 'మ',
    'య', 'ర', 'ల', 'వ',
    'శ', 'ష', 'స', 'హ',
    'క్ష', 'త్ర', 'జ్ఞ'
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const createInitialState = (consonants, languageKey) => ({
    placed: Array(consonants.length).fill(null),
    bank: shuffle(consonants.map((l, i) => ({ letter: l, originalIndex: i, id: `${languageKey}-${i}` }))),
    score: 0,
    completed: false,
    timer: 0,
    timerActive: true
});

const VarnamalGame = () => {
    const navigate = useNavigate();
    const [language] = useState(() => localStorage.getItem('userLanguage') || 'hindi');
    const consonants = language === 'telugu' ? TELUGU_CONSONANTS : HINDI_CONSONANTS;
    const total = consonants.length;

    const [gameState, setGameState] = useState(() => ({
        hindi: createInitialState(HINDI_CONSONANTS, 'hindi'),
        telugu: createInitialState(TELUGU_CONSONANTS, 'telugu')
    }));
    const [shakeSlot, setShakeSlot] = useState(null);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const timerRef = useRef(null);

    const currentState = gameState[language];
    const { placed, bank, score, completed, timer, timerActive } = currentState;

    const resetGame = () => {
        setGameState(prev => ({
            ...prev,
            [language]: createInitialState(language === 'telugu' ? TELUGU_CONSONANTS : HINDI_CONSONANTS, language)
        }));
    };

    // Timer
    useEffect(() => {
        if (timerActive && !completed) {
            timerRef.current = setInterval(() => {
                setGameState(prev => {
                    const current = prev[language];
                    return {
                        ...prev,
                        [language]: {
                            ...current,
                            timer: current.timer + 1
                        }
                    };
                });
            }, 1000);
        }

        return () => clearInterval(timerRef.current);
    }, [language, timerActive, completed]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const getSpeechLang = (letter) => {
        return /[\u0C00-\u0C7F]/.test(letter) ? 'te-IN' : 'hi-IN';
    };

    const handleDrop = useCallback((slotIndex, e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const { letter, index: bankIndex } = data;

        if (letter === consonants[slotIndex]) {
            // Correct!
            setGameState(prev => {
                const current = prev[language];
                const nextPlaced = [...current.placed];
                nextPlaced[slotIndex] = letter;

                return {
                    ...prev,
                    [language]: {
                        ...current,
                        placed: nextPlaced,
                        bank: current.bank.filter(item => item.id !== `${language}-${bankIndex}`),
                        score: current.score + 1
                    }
                };
            });

            // Pronounce
            if ('speechSynthesis' in window) {
                const u = new SpeechSynthesisUtterance(letter);
                u.lang = getSpeechLang(letter);
                u.rate = 0.75;
                u.pitch = 1.1;
                u.volume = 1;
                speechSynthesis.cancel();
                speechSynthesis.speak(u);
            }
        } else {
            // Wrong – shake
            setShakeSlot(slotIndex);
            setTimeout(() => setShakeSlot(null), 600);
        }
        setDraggingIndex(null);
    }, [consonants, language]);

    // Check completion
    useEffect(() => {
        if (score === total && total > 0 && !completed) {
            setGameState(prev => {
                const current = prev[language];
                if (current.completed) return prev;
                return {
                    ...prev,
                    [language]: {
                        ...current,
                        completed: true,
                        timerActive: false
                    }
                };
            });

            // Fire confetti
            confetti({
                particleCount: 200,
                spread: 120,
                origin: { y: 0.6 },
                colors: ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff']
            });
            setTimeout(() => confetti({ particleCount: 100, spread: 80, origin: { y: 0.4 } }), 300);
            setTimeout(() => confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } }), 700);
        }
    }, [score, total, completed, language]);

    const handleDragOver = (e) => e.preventDefault();

    // Build rows for the grid (match the Varnamala grouping)
    const rowSizes = [5, 5, 5, 5, 5, 4, 4, 3];
    const rows = [];
    let idx = 0;
    for (const size of rowSizes) {
        rows.push(consonants.slice(idx, idx + size));
        idx += size;
    }

    const progress = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
        <div className="varnamal-container">
            {/* Header */}
            <header className="varnamal-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate('/game-hub')}>
                        ← Back to Games
                    </button>
                    <h1 className="varnamal-title">Varnamala Puzzle</h1>
                    <span className="varnamal-subtitle">
                        {language === 'hindi' ? 'वर्णमाला पज़ल' : 'వర్ణమాల పజిల్'}
                    </span>
                </div>
                <div className="header-right">
                    <span className="user-badge">
                        👤 {localStorage.getItem('playerName') || localStorage.getItem('userName') || 'Player'}
                    </span>
                </div>
            </header>

            {/* Game Board */}
            <main className="varnamal-main">
                {/* Stats Bar */}
                <div className="stats-bar">
                    <div className="stat">
                        <span className="stat-icon">⏱️</span>
                        <span className="stat-value">{formatTime(timer)}</span>
                    </div>
                    <div className="stat">
                        <span className="stat-icon">⭐</span>
                        <span className="stat-value">{score}/{total}</span>
                    </div>
                    <div className="stat progress-stat">
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${progress}%` }}>
                                <span className="progress-text">{progress}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Completion Banner */}
                {completed && (
                    <div className="completion-banner">
                        <h2>🎉 Great job! {language === 'hindi' ? 'शाबाश!' : 'శుభం!'}</h2>
                        <p>You completed the Varnamala Puzzle in {formatTime(timer)}!</p>
                        <p className="final-score-text">Final Score: {Math.round((total / Math.max(timer, 1)) * 100)}</p>
                    </div>
                )}

                {/* Drop Zone Grid */}
                <div className="grid-section">
                    <h3 className="section-title">
                        {language === 'hindi' ? '📋 Alphabet Order — वर्णमाला क्रम' : '📋 Alphabet Order — వర్ణమాల క్రమం'}
                    </h3>
                    <div className="drop-grid">
                        {rows.map((row, ri) => (
                            <div key={ri} className="grid-row">
                                {row.map((letter, ci) => {
                                    const globalIdx = rows.slice(0, ri).reduce((s, r) => s + r.length, 0) + ci;
                                    const isPlaced = placed[globalIdx] !== null;
                                    return (
                                        <div
                                            key={globalIdx}
                                            className={`drop-slot ${isPlaced ? 'filled' : ''} ${shakeSlot === globalIdx ? 'shake' : ''}`}
                                            onDragOver={handleDragOver}
                                            onDrop={(e) => handleDrop(globalIdx, e)}
                                        >
                                            {isPlaced ? (
                                                <span className="placed-letter">{placed[globalIdx]}</span>
                                            ) : (
                                                <span className="slot-number">{globalIdx + 1}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Letter Bank */}
                {!completed && (
                    <div className="bank-section">
                        <h3 className="section-title">
                            {language === 'hindi' ? '🔤 Letter Bank — अक्षर बैंक (Drag and drop)' : '🔤 Letter Bank — అక్షర బ్యాంక్ (Drag and drop)'}
                        </h3>
                        <div className="letter-bank">
                            {bank.map((item) => (
                                <div
                                    key={item.id}
                                    className={`letter-tile ${draggingIndex === item.originalIndex ? 'dragging' : ''}`}
                                    draggable={!placed.some(p => p === item.letter)}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('text/plain', JSON.stringify({ letter: item.letter, index: item.originalIndex }));
                                        e.dataTransfer.effectAllowed = 'move';
                                        setDraggingIndex(item.originalIndex);
                                    }}
                                    onDragEnd={() => setDraggingIndex(null)}
                                    onClick={() => {
                                        // Pronounce the letter using SpeechSynthesis
                                        if ('speechSynthesis' in window) {
                                            const utterance = new SpeechSynthesisUtterance(item.letter);
                                            utterance.lang = getSpeechLang(item.letter);
                                            utterance.rate = 0.75;
                                            utterance.pitch = 1.1;
                                            utterance.volume = 1;
                                            speechSynthesis.cancel();
                                            speechSynthesis.speak(utterance);
                                        }
                                    }}
                                    title="Click for pronunciation"
                                >
                                    <span className="letter-text">{item.letter}</span>
                                    <span className="speaker-icon">🔊</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="form-row reset-row">
                    <button className="reset-game-btn" onClick={resetGame}>🔄 Reset Game</button>
                </div>
            </main>
        </div>
    );
};

export default VarnamalGame;