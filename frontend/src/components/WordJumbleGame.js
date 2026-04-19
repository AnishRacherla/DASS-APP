import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './WordJumbleGame.css';

const API_BASE = 'http://localhost:5001';
const CORRECT_POINTS = 10;
const WRONG_POINTS = -5;
const TOTAL_SENTENCES = 5;

// Word bubble dimensions
const WORD_W = 110;
const WORD_H = 52;

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function WordJumbleGame() {
  const navigate = useNavigate();
  const { language: routeLanguage, level: routeLevel } = useParams();
  const language = routeLanguage || 'hindi';
  const level = String(routeLevel || '1');

  const [gameData, setGameData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [words, setWords] = useState([]);       // { id, text, x, y }
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // { correct: bool, message: string }
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [scoreHistory, setScoreHistory] = useState([]);

  // Drag state
  const dragRef = useRef(null); // { wordId, offsetX, offsetY }
  const boardRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);
  const particlesRef = useRef([]);
  const [particles, setParticles] = useState([]);

  // ---- Fetch game data ----
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/word-jumble/play`, {
          params: { language, level }
        });
        setGameData(res.data);
      } catch (err) {
        console.error('Error fetching word jumble game:', err);
        alert('Failed to load game. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [language, level]);

  // ---- Initialize sentence ----
  const initSentence = useCallback((sentence, boardEl) => {
    const wordList = sentence.originalSentence.split(' ');
    const shuffled = shuffleArray(wordList);
    const el = boardEl || boardRef.current;
    const bw = el ? el.clientWidth : 700;
    const bh = el ? el.clientHeight : 440;

    const padding = 20;
    const maxX = Math.max(bw - WORD_W - padding, WORD_W);
    const maxY = Math.max(bh - WORD_H - padding, WORD_H);

    // Spread randomly but avoid too much overlap
    const placed = [];
    const initWords = shuffled.map((text, idx) => {
      let x, y, attempts = 0;
      do {
        x = padding + Math.random() * maxX;
        y = padding + Math.random() * maxY;
        attempts++;
      } while (
        attempts < 30 &&
        placed.some(p => Math.abs(p.x - x) < WORD_W + 10 && Math.abs(p.y - y) < WORD_H + 8)
      );
      placed.push({ x, y });
      return { id: idx, text, x, y };
    });

    setWords(initWords);
    setFeedback(null);
  }, []);

  useEffect(() => {
    if (gameData && gameData.sentences && gameData.sentences.length > 0 && !loading) {
      setCurrentIdx(0);
      // Wait for board to mount
      setTimeout(() => initSentence(gameData.sentences[0], boardRef.current), 50);
    }
  }, [gameData, loading, initSentence]);

  // ---- Mouse drag handlers ----
  const handleMouseDown = useCallback((e, word) => {
    if (feedback?.correct) return;
    e.preventDefault();
    const rect = boardRef.current.getBoundingClientRect();
    dragRef.current = {
      wordId: word.id,
      offsetX: e.clientX - rect.left - word.x,
      offsetY: e.clientY - rect.top - word.y
    };
    setDraggingId(word.id);
  }, [feedback]);

  const handleTouchStart = useCallback((e, word) => {
    if (feedback?.correct) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = boardRef.current.getBoundingClientRect();
    dragRef.current = {
      wordId: word.id,
      offsetX: touch.clientX - rect.left - word.x,
      offsetY: touch.clientY - rect.top - word.y
    };
    setDraggingId(word.id);
  }, [feedback]);

  const moveWord = useCallback((clientX, clientY) => {
    if (!dragRef.current || !boardRef.current) return;
    const { wordId, offsetX, offsetY } = dragRef.current;
    const rect = boardRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(clientX - rect.left - offsetX, rect.width - WORD_W));
    const newY = Math.max(0, Math.min(clientY - rect.top - offsetY, rect.height - WORD_H));
    setWords(prev => prev.map(w => w.id === wordId ? { ...w, x: newX, y: newY } : w));
  }, []);

  const handleMouseMove = useCallback((e) => { if (dragRef.current) moveWord(e.clientX, e.clientY); }, [moveWord]);
  const handleTouchMove = useCallback((e) => { if (dragRef.current) { e.preventDefault(); moveWord(e.touches[0].clientX, e.touches[0].clientY); } }, [moveWord]);

  const stopDrag = useCallback(() => {
    dragRef.current = null;
    setDraggingId(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', stopDrag);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [handleMouseMove, handleTouchMove, stopDrag]);

  // ---- Particle effect ----
  const spawnParticles = (correct) => {
    const colors = correct
      ? ['#ffd700', '#10b981', '#34d399', '#6ee7b7', '#fff']
      : ['#ef4444', '#f87171', '#fca5a5', '#fde68a'];
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 12,
      vx: (Math.random() - 0.5) * 6,
      vy: -(2 + Math.random() * 5)
    }));
    particlesRef.current = newParticles;
    setParticles(newParticles);
    setTimeout(() => { particlesRef.current = []; setParticles([]); }, 1000);
  };

  // ---- Check answer ----
  const checkAnswer = () => {
    if (feedback?.correct) return;
    const currentSentence = gameData.sentences[currentIdx];
    const correctWords = currentSentence.originalSentence.split(' ');

    // Sort words by x position to determine the user's order
    const sorted = [...words].sort((a, b) => a.x - b.x);
    const userAnswer = sorted.map(w => w.text).join(' ');
    const correctAnswer = currentSentence.originalSentence;

    const isCorrect = userAnswer === correctAnswer;
    spawnParticles(isCorrect);

    if (isCorrect) {
      const newScore = score + CORRECT_POINTS;
      setScore(newScore);
      setScoreHistory(prev => [...prev, { correct: true, points: CORRECT_POINTS }]);
      setFeedback({
        correct: true,
        message: language === 'hindi' ? '✅ बहुत अच्छे!' : language === 'telugu' ? '✅ చాలా బాగుంది!' : '✅ Correct!'
      });
      setTimeout(() => advanceOrFinish(newScore), 1400);
    } else {
      const newScore = Math.max(0, score + WRONG_POINTS);
      setScore(newScore);
      setScoreHistory(prev => [...prev, { correct: false, points: WRONG_POINTS }]);
      setFeedback({
        correct: false,
        message: language === 'hindi'
          ? `❌ गलत! सही उत्तर: ${correctAnswer}`
          : language === 'telugu'
          ? `❌ తప్పు! సరైన: ${correctAnswer}`
          : `❌ Wrong! Correct: ${correctAnswer}`
      });
    }
  };

  const advanceOrFinish = (currentScore) => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < gameData.sentences.length) {
      setCurrentIdx(nextIdx);
      setTimeout(() => initSentence(gameData.sentences[nextIdx], boardRef.current), 50);
    } else {
      setFinished(true);
    }
  };

  const handleNext = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < gameData.sentences.length) {
      setCurrentIdx(nextIdx);
      setTimeout(() => initSentence(gameData.sentences[nextIdx], boardRef.current), 50);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    if (gameData && gameData.sentences.length > 0) {
      initSentence(gameData.sentences[currentIdx], boardRef.current);
      setFeedback(null);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setScore(0);
    setFinished(false);
    setScoreHistory([]);
    setTimeout(() => initSentence(gameData.sentences[0], boardRef.current), 50);
  };

  // ---- Render: Loading ----
  if (loading) {
    return (
      <div className="wjg-root loading">
        <div className="wjg-loader">
          <div className="wjg-spinner" />
          <p>{language === 'hindi' ? 'लोड हो रहा है...' : language === 'telugu' ? 'లోడ అవుతోంది...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!gameData || !gameData.sentences || gameData.sentences.length === 0) {
    return (
      <div className="wjg-root loading">
        <div className="wjg-loader">
          <p style={{ color: '#f87171' }}>
            {language === 'hindi' ? 'डेटा नहीं मिला' : 'Game data not found.'}
          </p>
          <button className="wjg-btn wjg-btn-home" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>
    );
  }

  // ---- Render: Finished ----
  if (finished) {
    const maxScore = TOTAL_SENTENCES * CORRECT_POINTS;
    const pct = (score / maxScore) * 100;
    const msg = pct >= 80
      ? (language === 'hindi' ? '🌟 शानदार!' : language === 'telugu' ? '🌟 అద్భుతం!' : '🌟 Awesome!')
      : pct >= 50
      ? (language === 'hindi' ? '👍 अच्छा!' : language === 'telugu' ? '👍 బాగుంది!' : '👍 Good!')
      : (language === 'hindi' ? '💪 फिर कोशिश करो!' : language === 'telugu' ? '💪 మళ్లీ ప్రయత్నించు!' : '💪 Try Again!');

    return (
      <div className="wjg-root finished">
        <div className="wjg-confetti-bg">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="wjg-confetti" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              background: ['#ffd700','#ff6b6b','#10b981','#818cf8','#f472b6'][i % 5]
            }} />
          ))}
        </div>
        <div className="wjg-finish-card">
          <div className="wjg-finish-emoji">🎉</div>
          <h1>{language === 'hindi' ? 'खेल पूरा!' : language === 'telugu' ? 'గేమ్ పూర్తి!' : 'Game Complete!'}</h1>
          <div className="wjg-score-ring">
            <svg viewBox="0 0 120 120" width="160" height="160">
              <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10"/>
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke="url(#ring-grad)" strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct / 100)}`}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1.2s ease' }}
              />
              <defs>
                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8"/>
                  <stop offset="100%" stopColor="#10b981"/>
                </linearGradient>
              </defs>
              <text x="60" y="55" textAnchor="middle" fill="white" fontSize="22" fontWeight="900">{score}</text>
              <text x="60" y="74" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="13">/ {maxScore}</text>
            </svg>
          </div>
          <div className="wjg-finish-msg">{msg}</div>

          {/* Per-sentence breakdown */}
          <div className="wjg-score-history">
            {scoreHistory.map((h, i) => (
              <div key={i} className={`wjg-hist-item ${h.correct ? 'correct' : 'wrong'}`}>
                <span>{language === 'hindi' ? `वाक्य ${i + 1}` : language === 'telugu' ? `వాక్యం ${i + 1}` : `Sentence ${i + 1}`}</span>
                <span>{h.correct ? `+${h.points}` : h.points}</span>
              </div>
            ))}
          </div>

          <div className="wjg-finish-btns">
            <button className="wjg-btn wjg-btn-play" onClick={handleRestart}>
              🔄 {language === 'hindi' ? 'फिर खेलें' : language === 'telugu' ? 'మళ్లీ ఆడు' : 'Play Again'}
            </button>
            <button className="wjg-btn wjg-btn-home" onClick={() => navigate(-1)}>
              🏠 {language === 'hindi' ? 'होम' : language === 'telugu' ? 'హోమ్' : 'Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- Render: Game ----
  const progress = (currentIdx / TOTAL_SENTENCES) * 100;
  const currentSentence = gameData.sentences[currentIdx];
  const sentenceWords = currentSentence.originalSentence.split(' ');

  return (
    <div className="wjg-root">
      {/* Animated bg stars */}
      <div className="wjg-bg">
        {[...Array(40)].map((_, i) => (
          <div key={i} className="wjg-star" style={{
            left: `${(i * 43 + 7) % 100}%`,
            top: `${(i * 61 + 13) % 100}%`,
            animationDelay: `${(i * 0.3) % 5}s`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`
          }} />
        ))}
      </div>

      {/* Header */}
      <div className="wjg-header">
        <button className="wjg-back" onClick={() => navigate(-1)}>
          ← {language === 'hindi' ? 'वापस' : language === 'telugu' ? 'వెనక్కి' : 'Back'}
        </button>
        <div className="wjg-title-wrap">
          <span className="wjg-game-title">🌊 {language === 'hindi' ? 'शब्द जोड़ो' : language === 'telugu' ? 'పదజాల' : 'Word Jumble'}</span>
          <span className="wjg-level-badge">Level {level}</span>
        </div>
        <div className="wjg-score-badge">
          <span className="wjg-score-label">⭐</span>
          <span className="wjg-score-val">{score}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="wjg-progress-bar-wrap">
        <div className="wjg-progress-bar">
          <div className="wjg-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="wjg-progress-text">
          {currentIdx + 1} / {TOTAL_SENTENCES}
        </div>
      </div>

      {/* Instruction strip */}
      <div className="wjg-instruction">
        {language === 'hindi'
          ? '👆 शब्दों को खींचकर सही क्रम में लगाएं, फिर OK दबाएं'
          : language === 'telugu'
          ? '👆 పదాలను సరైన క్రమంలో లాగండి, తర్వాత OK నొక్కండి'
          : '👆 Drag words into the correct order left-to-right, then press OK'}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`wjg-feedback ${feedback.correct ? 'correct' : 'wrong'}`}>
          {feedback.message}
          {!feedback.correct && (
            <button className="wjg-next-btn" onClick={handleNext}>
              {language === 'hindi' ? 'अगला →' : language === 'telugu' ? 'తర్వాత →' : 'Next →'}
            </button>
          )}
        </div>
      )}

      {/* Particle Layer */}
      <div className="wjg-particles" aria-hidden>
        {particles.map(p => (
          <div
            key={p.id}
            className="wjg-particle"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              background: p.color
            }}
          />
        ))}
      </div>

      {/* Game Board — free floating words */}
      <div className="wjg-board" ref={boardRef}>
        <div
          className="wjg-answer-strip"
          aria-label="Answer placeholders"
          style={{ gridTemplateColumns: `repeat(${sentenceWords.length}, minmax(0, 1fr))` }}
        >
          {sentenceWords.map((_, index) => (
            <div key={index} className="wjg-answer-slot">
              <span className="wjg-answer-slot-label">{index + 1}</span>
            </div>
          ))}
        </div>

        {words.map(word => {
          const isDragging = draggingId === word.id;
          return (
            <div
              key={word.id}
              className={`wjg-word ${isDragging ? 'dragging' : ''} ${feedback?.correct ? 'locked' : ''}`}
              style={{
                transform: `translate(${word.x}px, ${word.y}px)`,
                zIndex: isDragging ? 999 : 10,
                cursor: isDragging ? 'grabbing' : (feedback?.correct ? 'default' : 'grab')
              }}
              onMouseDown={(e) => handleMouseDown(e, word)}
              onTouchStart={(e) => handleTouchStart(e, word)}
            >
              <span className="wjg-word-text">{word.text}</span>
              <div className="wjg-word-shine" />
            </div>
          );
        })}

        {/* X-axis order indicator */}
        <div className="wjg-order-hint">
          <span>← {language === 'hindi' ? 'पहला शब्द' : language === 'telugu' ? 'మొదటి' : 'First'}</span>
          <span className="wjg-arrow-line" />
          <span>{language === 'hindi' ? 'आखिरी शब्द' : language === 'telugu' ? 'చివరిది' : 'Last'} →</span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="wjg-controls">
        <button className="wjg-btn wjg-btn-reset" onClick={handleReset} disabled={!!feedback?.correct}>
          🔄 {language === 'hindi' ? 'रीसेट' : language === 'telugu' ? 'రీసెట్' : 'Reset'}
        </button>
        <button
          className="wjg-btn wjg-btn-ok"
          onClick={checkAnswer}
          disabled={!!feedback?.correct}
        >
          ✅ OK
        </button>
      </div>
    </div>
  );
}
