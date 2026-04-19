import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import './WordSortingBasketGame.css';

const API_BASE = 'http://localhost:5001';
const GAME_TIME = 60;
const CORRECT_HIT_POINTS = 10;
const WRONG_HIT_POINTS = -5;
const BASKET_BLOCK_HEIGHT = 190;

const CATEGORY_META = {
  fruits: { label: 'Fruits', emoji: '🍎', color: '#f97316' },
  animals: { label: 'Animals', emoji: '🐘', color: '#22c55e' },
  pets: { label: 'Pets', emoji: '🐶', color: '#38bdf8' },
  vegetables: { label: 'Vegetables', emoji: '🥕', color: '#a3e635' },
  birds: { label: 'Birds', emoji: '🕊️', color: '#f59e0b' },
  vehicles: { label: 'Vehicles', emoji: '🚗', color: '#fb7185' },
};

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pickActiveCategories(words) {
  const unique = [...new Set(words.map((item) => item.category).filter(Boolean))];
  return shuffle(unique);
}

function normalizeWordItems(items) {
  return items.map((item, index) => ({
    ...item,
    id: item.id || item._id || `${item.word}-${item.category}-${index}`,
  }));
}

function layoutWords(items, boardRect) {
  if (!boardRect.width || !boardRect.height) return items;
  const width = 150;
  const height = 54;
  const leftMin = 26 + width / 2;
  const leftMax = boardRect.width - 26 - width / 2;
  const topMin = 64 + height / 2;
  const topMax = Math.max(topMin + 20, boardRect.height - BASKET_BLOCK_HEIGHT - height / 2);

  const placed = [];

  return shuffle(items).map((item) => {
    let x = leftMin;
    let y = topMin;

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const nextX = leftMin + Math.random() * Math.max(1, leftMax - leftMin);
      const nextY = topMin + Math.random() * Math.max(1, topMax - topMin);
      const overlaps = placed.some((slot) => Math.hypot(slot.x - nextX, slot.y - nextY) < 66);
      if (!overlaps) {
        x = nextX;
        y = nextY;
        break;
      }
      if (attempt === 59) {
        x = nextX;
        y = nextY;
      }
    }

    placed.push({ x, y });
    const tilt = Number((Math.random() * 8 - 4).toFixed(2));
    const floatDuration = Number((2.6 + Math.random() * 1.9).toFixed(2));
    const floatDelay = Number((Math.random() * 1.4).toFixed(2));

    return {
      ...item,
      x,
      y,
      homeX: x,
      homeY: y,
      width,
      height,
      tilt,
      floatDuration,
      floatDelay,
    };
  });
}

export default function WordSortingBasketGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language: routeLanguage, level: routeLevel } = useParams();
  const language = routeLanguage || location.state?.language || localStorage.getItem('userLanguage') || 'hindi';
  const level = String(routeLevel || location.state?.level || '1');

  const levelConfig = useMemo(() => {
    if (level === '2') return { baskets: 5, wordsPerCategory: 3, label: 'Level 2', subtitle: 'More baskets' };
    if (level === '3') return { baskets: 6, wordsPerCategory: 4, label: 'Level 3', subtitle: 'Full challenge' };
    return { baskets: 4, wordsPerCategory: 3, label: 'Level 1', subtitle: 'Warm-up sort' };
  }, [level]);

  const boardRef = useRef(null);
  const basketRefs = useRef({});
  const draggingRef = useRef(null);
  const boardRectRef = useRef({ width: 0, height: 0, left: 0, top: 0 });
  const timerRef = useRef(null);
  const endedRef = useRef(false);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState([]);
  const [basketCategories, setBasketCategories] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [feedback, setFeedback] = useState(null);
  const [gameState, setGameState] = useState('playing');
  const [activeWordId, setActiveWordId] = useState(null);

  const totalWords = words.length;

  const measureBoard = useCallback(() => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    boardRectRef.current = rect;
  }, []);

  const showFeedback = useCallback((text, type) => {
    setFeedback({ text, type });
    window.setTimeout(() => setFeedback(null), 650);
  }, []);

  const finishGame = useCallback((reason) => {
    if (endedRef.current) return;
    endedRef.current = true;
    clearInterval(timerRef.current);
    setGameState('ended');
    navigate('/results', {
      state: {
        score: scoreRef.current,
        correctAnswers: correctRef.current,
        totalQuestions: totalWords || (correctRef.current + wrongRef.current) || 1,
        penalties: wrongRef.current,
        language,
        level: Number(level),
        difficulty: reason,
        gameType: 'word-sorting-basket',
      }
    });
  }, [language, level, navigate, totalWords]);

  const resetRound = useCallback(async () => {
    setLoading(true);
    setWords([]);
    setBasketCategories([]);
    setScore(0);
    setTimeLeft(GAME_TIME);
    setFeedback(null);
    setGameState('playing');
    setActiveWordId(null);
    endedRef.current = false;
    scoreRef.current = 0;
    correctRef.current = 0;
    wrongRef.current = 0;

    try {
      const response = await axios.get(`${API_BASE}/api/word-sorting-basket/words?language=${language}`);
      const source = Array.isArray(response.data) ? response.data : [];
      const activeCategories = pickActiveCategories(source).slice(0, levelConfig.baskets);
      const selected = activeCategories.flatMap((category) => (
        shuffle(source.filter((item) => item.category === category)).slice(0, levelConfig.wordsPerCategory)
      ));
      const normalized = normalizeWordItems(selected);
      const positioned = layoutWords(normalized, boardRectRef.current);
      setBasketCategories(activeCategories);
      setWords(positioned);
    } catch (error) {
      console.error('WordSortingBasket: failed to load words', error);
      showFeedback('Unable to load words', 'wrong');
    } finally {
      setLoading(false);
    }
  }, [language, levelConfig.baskets, levelConfig.wordsPerCategory, showFeedback]);

  useEffect(() => {
    measureBoard();
    const handleResize = () => {
      measureBoard();
      setWords((currentWords) => currentWords.map((item) => ({ ...item })));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measureBoard]);

  useEffect(() => {
    resetRound();
    return () => clearInterval(timerRef.current);
  }, [resetRound]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame('time');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [finishGame, gameState]);

  const updateDraggingWord = useCallback((wordId, clientX, clientY) => {
    const rect = boardRectRef.current;
    const drag = draggingRef.current;
    if (!drag || drag.id !== wordId) return;
    const nextX = clientX - rect.left - drag.offsetX;
    const nextY = clientY - rect.top - drag.offsetY;
    setWords((currentWords) => currentWords.map((item) => (
      item.id === wordId ? { ...item, x: nextX + item.width / 2, y: nextY + item.height / 2 } : item
    )));
  }, []);

  const handleDragEnd = useCallback((wordId, clientX, clientY) => {
    const drag = draggingRef.current;
    draggingRef.current = null;
    setActiveWordId(null);
    if (!drag) return;

    const currentWord = words.find((item) => item.id === wordId);
    if (!currentWord) return;

    const basketHit = basketCategories.find((category) => {
      const basket = basketRefs.current[category];
      if (!basket) return false;
      const rect = basket.getBoundingClientRect();
      return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    });

    if (basketHit === currentWord.category) {
      const nextScore = scoreRef.current + CORRECT_HIT_POINTS;
      scoreRef.current = nextScore;
      correctRef.current += 1;
      setScore(nextScore);
      showFeedback(`+${CORRECT_HIT_POINTS}`, 'correct');
      setWords((currentWords) => currentWords.filter((item) => item.id !== wordId));
      if (totalWords === 1) {
        finishGame('cleared');
      }
      return;
    }

    if (basketHit) {
      const nextScore = scoreRef.current + WRONG_HIT_POINTS;
      scoreRef.current = nextScore;
      wrongRef.current += 1;
      setScore(nextScore);
      showFeedback('Wrong basket (-5)', 'wrong');
    }

    setWords((currentWords) => currentWords.map((item) => (
      item.id === wordId ? { ...item, x: item.homeX, y: item.homeY } : item
    )));
  }, [basketCategories, finishGame, showFeedback, totalWords, words]);

  const remaining = words.length;

  return (
    <div className="wsb-game-page">
      <div className="wsb-game-bg" />

      <header className="wsb-game-header">
        <button className="wsb-game-back" onClick={() => navigate('/word-sorting-basket', { state: { language } })}>
          ← Rules
        </button>
        <div className="wsb-game-copy">
          <span className="wsb-game-kicker">{language === 'hindi' ? 'Hindi' : 'Telugu'} Word Sorting Basket</span>
          <h1>{levelConfig.label}: {levelConfig.subtitle}</h1>
          <p>Drag a word to the correct category. Right basket removes it and adds points. Wrong basket sends it back.</p>
        </div>
        <div className="wsb-hud">
          <div className="wsb-hud-chip">Score {score}</div>
          <div className="wsb-hud-chip">Time {timeLeft}s</div>
          <div className="wsb-hud-chip">Left {remaining}</div>
        </div>
      </header>

      <main className="wsb-board-wrap">
        <section ref={boardRef} className="wsb-board">
          {(loading || words.length === 0) && (
            <div className="wsb-board-placeholder" aria-live="polite">
              <div className="wsb-board-placeholder-card">
                <span className="wsb-board-placeholder-kicker">Word Sorting Basket</span>
                <h2>Preparing your word tiles</h2>
                <p>
                  Keep this space ready while the matching words load into the board.
                </p>
              </div>
            </div>
          )}

          <div className="wsb-stars" />
          <div className="wsb-grid" />

          <div className="wsb-drop-zone">
            {basketCategories.map((category) => {
              const meta = CATEGORY_META[category] || { label: category, emoji: '🧺', color: '#60a5fa' };
              return (
                <div
                  key={category}
                  ref={(node) => { basketRefs.current[category] = node; }}
                  className="wsb-basket"
                  style={{ '--bin-color': meta.color }}
                >
                  <div className="wsb-bin-lid" />
                  <div className="wsb-bin-body">
                    <div className="wsb-bin-handle" />
                    <div className="wsb-bin-slots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="wsb-bin-label-wrap">
                      <span className="wsb-bin-emoji">{meta.emoji}</span>
                      <span className="wsb-bin-label">{meta.label}</span>
                    </div>
                  </div>
                  <p className="wsb-bin-hint">Drop here</p>
                </div>
              );
            })}
          </div>

          {words.map((word) => {
            const meta = CATEGORY_META[word.category] || { color: '#60a5fa' };
            return (
              <motion.button
                key={word.id}
                className={`wsb-word ${activeWordId === word.id ? 'active' : ''}`}
                style={{
                  left: word.x - word.width / 2,
                  top: word.y - word.height / 2,
                  width: word.width,
                  height: word.height,
                  borderColor: meta.color,
                  '--wsb-tilt': `${word.tilt || 0}deg`,
                  '--wsb-float-duration': `${word.floatDuration || 3.2}s`,
                  '--wsb-float-delay': `${word.floatDelay || 0}s`,
                }}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture?.(event.pointerId);
                  const boardRect = boardRectRef.current;
                  setActiveWordId(word.id);
                  draggingRef.current = {
                    id: word.id,
                    offsetX: event.clientX - (boardRect.left + (word.x - word.width / 2)),
                    offsetY: event.clientY - (boardRect.top + (word.y - word.height / 2)),
                  };
                }}
                onPointerMove={(event) => {
                  if (!draggingRef.current || draggingRef.current.id !== word.id) return;
                  updateDraggingWord(word.id, event.clientX, event.clientY);
                }}
                onPointerUp={(event) => {
                  if (!draggingRef.current || draggingRef.current.id !== word.id) return;
                  handleDragEnd(word.id, event.clientX, event.clientY);
                }}
                onPointerLeave={(event) => {
                  if (!draggingRef.current || draggingRef.current.id !== word.id) return;
                  handleDragEnd(word.id, event.clientX, event.clientY);
                }}
                onContextMenu={(event) => event.preventDefault()}
              >
                <span className="wsb-word-text">{word.word}</span>
              </motion.button>
            );
          })}
        </section>

        <div className="wsb-footer-hint">
          {levelConfig.baskets} baskets active. Level {level} uses {levelConfig.wordsPerCategory} words per category.
        </div>

        {loading && <div className="wsb-loading">Loading words...</div>}
      </main>

      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`wsb-feedback ${feedback.type}`}
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.92 }}
          >
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}