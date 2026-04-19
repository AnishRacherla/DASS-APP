import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import TracingCanvas from './TracingCanvas';
import vowelStrokes from '../../akshara-data/vowelStrokes';
import {
  calculateStarRating,
  loadProgress,
  saveProgress,
} from '../../akshara-utils/tracingHelpers';
import './TraceVowelGame.css';

const API_BASE = 'http://localhost:5001';

// Screens: welcome → selection → tracing → complete
const SCREEN = {
  WELCOME: 'welcome',
  SELECTION: 'selection',
  TRACING: 'tracing',
  COMPLETE: 'complete',
};

export default function TraceVowelGame() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState(SCREEN.WELCOME);
  const [selectedVowelIndex, setSelectedVowelIndex] = useState(0);
  const [progress, setProgress] = useState(loadProgress());
  const [stars, setStars] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [swaraData, setSwaraData] = useState([]); // from API

  const tracingStartTime = useRef(Date.now());

  // ─── Fetch swara data from backend ────────────────────
  useEffect(() => {
    const fetchSwaras = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/swaras`);
        if (res.ok) {
          const data = await res.json();
          setSwaraData(data);
        }
      } catch (err) {
        console.warn('Could not fetch swara data:', err);
      }
    };
    fetchSwaras();
  }, []);

  // ─── Current vowel data ───────────────────────────────
  const currentVowel = vowelStrokes[selectedVowelIndex];

  // Find matching swara data for audio/image
  const matchingSwara = swaraData.find(
    (s) => s.letter === currentVowel?.letter
  );

  // ─── Audio playback ──────────────────────────────────
  const playAudio = useCallback(() => {
    if (matchingSwara?.audio) {
      const audio = new Audio(`${API_BASE}${matchingSwara.audio}`);
      audio.play().catch(() => {});
    }
  }, [matchingSwara]);

  // ─── Handlers ────────────────────────────────────────
  const handleStart = () => {
    setScreen(SCREEN.SELECTION);
  };

  const handleSelectVowel = (index) => {
    setSelectedVowelIndex(index);
    setResetKey((k) => k + 1);
    setShowHint(false);
    tracingStartTime.current = Date.now();
    setScreen(SCREEN.TRACING);

    // Play the vowel sound
    const swara = swaraData.find((s) => s.letter === vowelStrokes[index].letter);
    if (swara?.audio) {
      setTimeout(() => {
        const audio = new Audio(`${API_BASE}${swara.audio}`);
        audio.play().catch(() => {});
      }, 400);
    }
  };

  const handleTracingComplete = useCallback(({ accuracies }) => {
    const timeTaken = Date.now() - tracingStartTime.current;
    const avgAccuracy =
      Object.values(accuracies).reduce((sum, v) => sum + v, 0) /
      (Object.keys(accuracies).length || 1);
    const strokeCount = currentVowel?.strokes?.length || 1;

    const rating = calculateStarRating(avgAccuracy, timeTaken, strokeCount);
    setStars(rating);

    // Save progress
    const letter = currentVowel.letter;
    const existing = progress[letter];
    const best = Math.max(rating, existing?.stars || 0);
    const newProgress = {
      ...progress,
      [letter]: { stars: best, completed: true },
    };
    setProgress(newProgress);
    saveProgress(newProgress);

    // Play completion audio
    if (matchingSwara?.audio) {
      const audio = new Audio(`${API_BASE}${matchingSwara.audio}`);
      audio.play().catch(() => {});
    }

    // Confetti!
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#22c55e', '#8b5cf6', '#f472b6', '#60a5fa'],
      });
    }, 300);

    setScreen(SCREEN.COMPLETE);
  }, [currentVowel, matchingSwara, progress]);

  const handleClear = () => {
    setResetKey((k) => k + 1);
    setShowHint(false);
  };

  const handleHint = () => {
    setShowHint(true);
    setTimeout(() => setShowHint(false), 2200);
  };

  const handleNextVowel = () => {
    const nextIdx = (selectedVowelIndex + 1) % vowelStrokes.length;
    handleSelectVowel(nextIdx);
  };

  const handleTryAgain = () => {
    handleSelectVowel(selectedVowelIndex);
  };

  const handleBackToSelection = () => {
    setScreen(SCREEN.SELECTION);
  };

  // ─── Render star string ──────────────────────────────
  const renderStars = (count) => {
    return '⭐'.repeat(count) + '☆'.repeat(3 - count);
  };

  // ─── WELCOME SCREEN ──────────────────────────────────
  if (screen === SCREEN.WELCOME) {
    return (
      <div className="trace-game">
        <div className="trace-bg-particles" />
        <div className="trace-header">
          <button className="trace-back-btn" onClick={() => navigate('/game-hub')}>
            ← Back
          </button>
          <h1>✏️ अक्षर लिखो — Trace the Vowel</h1>
          <div style={{ width: 80 }} />
        </div>
        <div className="trace-content">
          <motion.div
            className="trace-welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="trace-welcome-emoji">✏️</div>
            <h2>अक्षर लिखो!</h2>
            <p>
              Learn to write Hindi vowels step by step. Follow the numbered
              strokes and trace each letter!
            </p>
            <p style={{ fontSize: 16, color: '#a78bfa' }}>
              हिंदी स्वर लिखना सीखो — एक-एक stroke के साथ!
            </p>
            <motion.button
              className="trace-start-btn"
              onClick={handleStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              ▶ Start Tracing!
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── SELECTION SCREEN ─────────────────────────────────
  if (screen === SCREEN.SELECTION) {
    return (
      <div className="trace-game">
        <div className="trace-bg-particles" />
        <div className="trace-header">
          <button className="trace-back-btn" onClick={() => navigate('/game-hub')}>
            ← Back to Games
          </button>
          <h1>✏️ Trace the Vowel</h1>
          <div style={{ width: 80 }} />
        </div>
        <div className="trace-content">
          <motion.div
            className="trace-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2>Choose a Vowel to Trace</h2>
            <p>Tap any vowel to start tracing — एक स्वर चुनो!</p>

            <motion.div
              className="vowel-grid"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04 } },
              }}
            >
              {vowelStrokes.map((v, i) => {
                const p = progress[v.letter];
                return (
                  <motion.div
                    key={v.id}
                    className={`vowel-card ${p?.completed ? 'completed' : ''}`}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.9 },
                      visible: { opacity: 1, y: 0, scale: 1 },
                    }}
                    whileHover={{ y: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleSelectVowel(i)}
                  >
                    <span className="vowel-card-letter">{v.letter}</span>
                    <span className="vowel-card-stars">
                      {p?.completed ? renderStars(p.stars) : '☆☆☆'}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── TRACING SCREEN ───────────────────────────────────
  if (screen === SCREEN.TRACING) {
    return (
      <div className="trace-game">
        <div className="trace-bg-particles" />
        <div className="trace-header">
          <button className="trace-back-btn" onClick={handleBackToSelection}>
            ← Vowels
          </button>
          <h1>Trace: {currentVowel.letter}</h1>
          <div style={{ width: 80 }} />
        </div>
        <div className="trace-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={`trace-${currentVowel.id}`}
              className="trace-screen"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Left — Canvas area */}
              <div className="trace-main">
                {/* Vowel info bar */}
                <div className="trace-vowel-info">
                  <span className="trace-vowel-letter">{currentVowel.letter}</span>
                  <div>
                    <div style={{ fontSize: 14, color: '#a78bfa' }}>Tracing</div>
                    {matchingSwara && (
                      <div className="trace-vowel-word">
                        {currentVowel.letter} से {matchingSwara.word}
                      </div>
                    )}
                  </div>
                  <button
                    className="trace-vowel-audio-btn"
                    onClick={playAudio}
                    title="Play sound"
                  >
                    🔊
                  </button>
                </div>

                {/* Tracing Canvas */}
                <TracingCanvas
                  vowelData={currentVowel}
                  onComplete={handleTracingComplete}
                  showHint={showHint}
                  resetKey={resetKey}
                />

                {/* Action buttons */}
                <div className="trace-actions">
                  <button className="trace-action-btn" onClick={handleClear}>
                    🔄 Clear
                  </button>
                  <button
                    className="trace-action-btn hint-btn"
                    onClick={handleHint}
                  >
                    💡 Show Hint
                  </button>
                  <button className="trace-action-btn" onClick={playAudio}>
                    🔊 Play Sound
                  </button>
                </div>

                {/* Prev/Next navigation */}
                <div className="trace-nav-bar">
                  <button
                    className="trace-nav-btn"
                    disabled={selectedVowelIndex === 0}
                    onClick={() =>
                      handleSelectVowel(selectedVowelIndex - 1)
                    }
                  >
                    ← Previous
                  </button>
                  <button
                    className="trace-nav-btn"
                    disabled={selectedVowelIndex === vowelStrokes.length - 1}
                    onClick={() =>
                      handleSelectVowel(selectedVowelIndex + 1)
                    }
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Right — Sidebar */}
              <div className="trace-sidebar">
                {/* Stroke progress */}
                <div className="stroke-progress-panel">
                  <div className="stroke-progress-title">
                    Strokes ({currentVowel.strokes.length})
                  </div>
                  {currentVowel.strokes.map((s, i) => (
                    <div
                      key={s.id}
                      className={`stroke-progress-item ${
                        i === 0 ? 'active' : ''
                      }`}
                    >
                      <span className="stroke-num">{s.id}</span>
                      <span style={{ flex: 1 }}>{s.label}</span>
                      <span>{s.direction}</span>
                    </div>
                  ))}
                </div>

                {/* Swara image */}
                {matchingSwara?.image && (
                  <div className="trace-swara-image-card">
                    <img
                      className="trace-swara-image"
                      src={`${API_BASE}${matchingSwara.image}`}
                      alt={matchingSwara.word}
                      draggable={false}
                    />
                    <div className="trace-swara-image-label">
                      {currentVowel.letter} — {matchingSwara.word}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ─── COMPLETION SCREEN ────────────────────────────────
  if (screen === SCREEN.COMPLETE) {
    return (
      <div className="trace-game">
        <div className="trace-bg-particles" />
        <div className="trace-header">
          <button className="trace-back-btn" onClick={handleBackToSelection}>
            ← Vowels
          </button>
          <h1>✏️ Trace the Vowel</h1>
          <div style={{ width: 80 }} />
        </div>
        <div className="trace-content">
          <motion.div
            className="trace-complete"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="trace-complete-letter">{currentVowel.letter}</div>
            <h2>🎉 शाबाश! Well Done!</h2>
            <div className="trace-complete-stars">{renderStars(stars)}</div>
            <p className="trace-complete-msg">
              You traced <strong>{currentVowel.letter}</strong> perfectly!
              {matchingSwara && (
                <>
                  <br />
                  {currentVowel.letter} से {matchingSwara.word}
                </>
              )}
            </p>
            <div className="trace-complete-actions">
              <motion.button
                className="trace-cta-btn primary"
                onClick={handleNextVowel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Next Vowel →
              </motion.button>
              <motion.button
                className="trace-cta-btn secondary"
                onClick={handleTryAgain}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                🔄 Try Again
              </motion.button>
              <motion.button
                className="trace-cta-btn secondary"
                onClick={handleBackToSelection}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                🔤 All Vowels
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Loading fallback ────────────────────────────────
  return (
    <div className="trace-game">
      <div className="trace-bg-particles" />
      <div className="trace-content">
        <div className="trace-loading">
          <div className="trace-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    </div>
  );
}
