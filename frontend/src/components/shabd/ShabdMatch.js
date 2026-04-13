import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './ShabdMatch.css';

const API_BASE = 'http://localhost:5001';

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

const ShabdMatch = () => {
    const { language, level } = useParams();
    const navigate = useNavigate();

    const [imagesCol, setImagesCol] = useState([]);
    const [wordsCol, setWordsCol] = useState([]);

    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedWord, setSelectedWord] = useState(null);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [wrongShake, setWrongShake] = useState(null);

    const [score, setScore] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);
    const [loading, setLoading] = useState(true);

    const containerRef = useRef(null);
    const imgRefs = useRef({});
    const wordRefs = useRef({});
    const [lines, setLines] = useState([]);

    useEffect(() => {
        const fetchLevel = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/api/shabd/${language}/${level}`);
                const data = await response.json();
                if (data.success && data.gameData.pairs) {
                    const pairs = data.gameData.pairs;
                    setImagesCol(shuffleArray(pairs));
                    setWordsCol(shuffleArray(pairs));
                    setMatchedPairs([]);
                    setSelectedImage(null);
                    setSelectedWord(null);
                    setScore(0);
                    setGameComplete(false);
                    setLines([]);
                }
            } catch (err) {
                console.error("Failed to load match level", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLevel();
    }, [language, level]);

    const playAudio = (item) => {
        const playFallback = () => {
            const audio = new Audio(`${API_BASE}${item.audio}`);
            audio.play().catch(e => console.log('Audio play failed:', e));
        };

        if ('speechSynthesis' in window) {
            const langCode = language === 'telugu' ? 'te-IN' : 'hi-IN';
            const voices = window.speechSynthesis.getVoices();
            const hasVoice = voices.some(v => v.lang.startsWith(langCode) || v.lang.startsWith(language === 'telugu' ? 'te' : 'hi'));

            // If voices are loaded but the exact language is absent, fallback immediately
            if (voices.length > 0 && !hasVoice) {
                return playFallback();
            }

            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(item.word);
            utterance.lang = langCode;
            utterance.rate = 0.2;
            utterance.pitch = 1.1;

            // If speech synthesis silently fails or errors, try MP3
            utterance.onerror = playFallback;

            window.speechSynthesis.speak(utterance);
        } else {
            playFallback();
        }
    };

    // Calculate lines between matched pairs
    const updateLines = () => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();

        const newLines = matchedPairs.map(word => {
            const imgEl = imgRefs.current[word];
            const wordEl = wordRefs.current[word];

            if (imgEl && wordEl) {
                const imgRect = imgEl.getBoundingClientRect();
                const wordRect = wordEl.getBoundingClientRect();

                // SVG lines should start from the right-middle of the image box
                // and end at the left-middle of the word box
                return {
                    id: word,
                    x1: imgRect.right - containerRect.left,
                    y1: imgRect.top + (imgRect.height / 2) - containerRect.top,
                    x2: wordRect.left - containerRect.left,
                    y2: wordRect.top + (wordRect.height / 2) - containerRect.top
                };
            }
            return null;
        }).filter(Boolean);

        setLines(newLines);
    };

    // Recalculate lines when matched pairs change or window resizes
    useEffect(() => {
        // Small delay to ensure DOM is updated
        setTimeout(updateLines, 50);
        window.addEventListener('resize', updateLines);
        return () => window.removeEventListener('resize', updateLines);
    }, [matchedPairs, imagesCol, wordsCol]);

    // Evaluation Logic
    useEffect(() => {
        if (selectedImage && selectedWord) {
            if (selectedImage.word === selectedWord.word) {
                // Match!
                playAudio(selectedImage);
                setMatchedPairs(prev => [...prev, selectedImage.word]);
                setScore(prev => prev + 10);
                setSelectedImage(null);
                setSelectedWord(null);
            } else {
                // Mismatch
                setWrongShake(selectedWord.word);
                setTimeout(() => {
                    setWrongShake(null);
                    setSelectedImage(null);
                    setSelectedWord(null);
                }, 800);
            }
        }
    }, [selectedImage, selectedWord]);

    useEffect(() => {
        if (imagesCol.length > 0 && matchedPairs.length === imagesCol.length) {
            setTimeout(() => setGameComplete(true), 1500);
        }
    }, [matchedPairs, imagesCol]);

    // Handlers to allow bidirectional clicking
    const handleImageClick = (item) => {
        if (matchedPairs.includes(item.word)) return;
        setSelectedImage(selectedImage?.word === item.word ? null : item);
    };

    const handleWordClick = (item) => {
        if (matchedPairs.includes(item.word)) return;
        setSelectedWord(selectedWord?.word === item.word ? null : item);
    };

    if (loading) return <div className="shabd-wrapper"><div className="shabd-loader"></div></div>;

    return (
        <div className="shabd-wrapper">
            <div className="shabd-header">
                <button className="shabd-back-btn" onClick={() => navigate('/shabd')}>🔙 Back</button>
                <div className="shabd-score">Score: {score}</div>
            </div>

            <div className="shabd-match-board-container" ref={containerRef}>
                {/* SVG Layer for Dotted Lines */}
                <svg className="shabd-svg-layer">
                    {lines.map(line => (
                        <motion.line
                            key={`line-${line.id}`}
                            x1={line.x1} y1={line.y1}
                            x2={line.x2} y2={line.y2}
                            stroke="#FFD700"
                            strokeWidth="4"
                            strokeDasharray="10 10"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                    ))}
                </svg>

                <div className="shabd-match-board">
                    {/* LEFT COLUMN: IMAGES */}
                    <div className="shabd-col images">
                        {imagesCol.map((item) => {
                            const isMatched = matchedPairs.includes(item.word);
                            const isSelected = selectedImage?.word === item.word;

                            return (
                                <motion.div
                                    key={`img-${item.word}`}
                                    ref={el => imgRefs.current[item.word] = el}
                                    className={`shabd-img-card ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleImageClick(item)}
                                    whileHover={!isMatched ? { scale: 1.05 } : {}}
                                    whileTap={!isMatched ? { scale: 0.95 } : {}}
                                >
                                    <img src={`${API_BASE}${item.image}`} alt={item.meaning} draggable={false} />
                                    {isMatched && <div className="shabd-check">✅</div>}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* RIGHT COLUMN: WORDS */}
                    <div className="shabd-col words">
                        {wordsCol.map((item) => {
                            const isMatched = matchedPairs.includes(item.word);
                            const isSelected = selectedWord?.word === item.word;
                            const isWrong = wrongShake === item.word;

                            return (
                                <motion.div
                                    key={`word-${item.word}`}
                                    ref={el => wordRefs.current[item.word] = el}
                                    className={`shabd-word-card ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong' : ''}`}
                                    onClick={() => handleWordClick(item)}
                                    whileHover={!isMatched ? { scale: 1.05 } : {}}
                                    whileTap={!isMatched ? { scale: 0.95 } : {}}
                                    animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                                    transition={isWrong ? { duration: 0.4 } : {}}
                                >
                                    <span>{item.word}</span>
                                    {isMatched && <div className="shabd-check">✅</div>}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {gameComplete && (
                    <motion.div
                        className="shabd-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            className="shabd-complete-card"
                            initial={{ scale: 0.5, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                        >
                            <button className="shabd-close-btn" onClick={() => setGameComplete(false)}>✕</button>
                            <h2>🎉 {language === 'telugu' ? 'శభాష్!' : 'शाबाश!'} 🎉</h2>
                            <p>You matched all the words!</p>
                            <div className="shabd-final-score">Score: {score}</div>

                            <div className="shabd-actions">
                                <button className="shabd-btn primary" onClick={() => navigate(`/shabd/match/${language}/${parseInt(level) + 1}`)}>
                                    Next Level
                                </button>
                                <button className="shabd-btn secondary" onClick={() => navigate('/shabd')}>
                                    Game Hub
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShabdMatch;
