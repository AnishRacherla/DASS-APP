import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WhackGame.css';

const TOTAL_TIME = 40;
const NUM_ROUNDS = 5;
const ROUND_DURATION = 8000;    // 8 s per round
const TILE_OPEN_MS  = 3000;     // tiles visible for 3 s

const LANG_VOICE_MAP = { hindi: 'hi-IN', telugu: 'te-IN' };

const WhackGame = () => {
  const { language, level } = useParams();
  const navigate = useNavigate();

  const [game,        setGame]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [gamePhase,   setGamePhase]   = useState('loading');  // loading|countdown|playing|ended
  const [countdown,   setCountdown]   = useState(3);
  const [timeLeft,    setTimeLeft]    = useState(TOTAL_TIME);
  const [roundNumber, setRoundNumber] = useState(0);
  const [roundPhase,  setRoundPhase]  = useState('waiting'); // waiting|open|closed
  const [tiles,       setTiles]       = useState(() =>
    Array(9).fill(null).map(() => ({ letter: null, state: 'closed' }))
  );
  const [score,     setScore]     = useState(0);
  const [penalties, setPenalties] = useState(0);
  const [feedback,  setFeedback]  = useState(null); // { text, type } ephemeral pop-up

  // Refs (avoid stale closures in timers)
  const scoreRef       = useRef(0);
  const penaltiesRef   = useRef(0);
  const timeLeftRef    = useRef(TOTAL_TIME);
  const tilesActiveRef = useRef(false);
  const gameEndedRef   = useRef(false);
  const gameRef        = useRef(null);
  const globalTimerRef = useRef(null);
  const roundTimers    = useRef([]);

  const userId = localStorage.getItem('userId');

  // ── speech helper ──────────────────────────────────────────────────────────

  const playLetterSound = useCallback((letter) => {
    if (!letter) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(letter);
    utter.lang = LANG_VOICE_MAP[language] || 'hi-IN';
    utter.rate = 0.8;
    utter.pitch = 1;
    utter.volume = 1;
    // Try to pick a matching voice
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find(v => v.lang === (LANG_VOICE_MAP[language] || 'hi-IN'));
    if (match) utter.voice = match;
    window.speechSynthesis.speak(utter);
  }, [language]);

  // ── helpers ────────────────────────────────────────────────────────────────

  const clearAll = useCallback(() => {
    if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    roundTimers.current.forEach(t => clearTimeout(t));
    roundTimers.current = [];
  }, []);

  const addTimeout = (fn, ms) => {
    const id = setTimeout(fn, ms);
    roundTimers.current.push(id);
    return id;
  };

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const showFeedbackPop = (text, type) => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 700);
  };

  // ── fetch ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/whack/${language}/${level}`);
        gameRef.current = res.data.game;
        setGame(res.data.game);
        setLoading(false);
        setGamePhase('countdown');
      } catch (err) {
        console.error(err);
        navigate(`/whack/${language}`);
      }
    };
    load();
    return clearAll;
  }, []); // eslint-disable-line

  // ── countdown ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (gamePhase !== 'countdown') return;
    // Play the target letter sound at the start of countdown
    if (gameRef.current) {
      playLetterSound(gameRef.current.gameData.targetLetter);
    }
    let c = 3;
    setCountdown(c);
    const iv = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(iv);
        startGame();
      } else {
        setCountdown(c);
      }
    }, 1000);
    return () => clearInterval(iv);
  }, [gamePhase]); // eslint-disable-line

  // ── game start ─────────────────────────────────────────────────────────────

  const startGame = () => {
    setGamePhase('playing');

    // Global 40-second countdown (display only — endGame triggered by timeout below)
    globalTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        timeLeftRef.current = next;
        return Math.max(next, 0);
      });
    }, 1000);

    // Schedule rounds
    for (let i = 0; i < NUM_ROUNDS; i++) {
      addTimeout(() => openRound(i + 1), i * ROUND_DURATION);
      addTimeout(() => closeRound(),     i * ROUND_DURATION + TILE_OPEN_MS);
    }
    // End game after all rounds complete
    addTimeout(endGame, NUM_ROUNDS * ROUND_DURATION + 200);
  };

  // ── round helpers ──────────────────────────────────────────────────────────

  const openRound = (roundNum) => {
    if (gameEndedRef.current) return;
    const g = gameRef.current;
    if (!g) return;

    setRoundNumber(roundNum);
    setRoundPhase('open');
    tilesActiveRef.current = true;

    // Play the target letter sound at the start of each round
    playLetterSound(g.gameData.targetLetter);

    const { targetLetter, allLetters } = g.gameData;

    // How many tiles open (4-9) and how many show the target (1-3)
    const numOpen   = Math.floor(Math.random() * 6) + 4;
    const numTarget = Math.floor(Math.random() * 3) + 1;

    const shuffledIdx = shuffle([0,1,2,3,4,5,6,7,8]);
    const openIdx     = shuffledIdx.slice(0, numOpen);
    const targetIdx   = new Set(openIdx.slice(0, numTarget));

    const distractors = allLetters.filter(l => l !== targetLetter);

    const newTiles = Array(9).fill(null).map((_, i) => {
      if (!openIdx.includes(i)) return { letter: null, state: 'closed' };
      if (targetIdx.has(i))    return { letter: targetLetter, state: 'open' };
      return {
        letter: distractors[Math.floor(Math.random() * distractors.length)],
        state: 'open'
      };
    });

    setTiles(newTiles);
  };

  const closeRound = () => {
    if (gameEndedRef.current) return;
    tilesActiveRef.current = false;
    setRoundPhase('closed');
    setTiles(Array(9).fill(null).map(() => ({ letter: null, state: 'closed' })));
  };

  // ── tap handler ────────────────────────────────────────────────────────────

  const handleTileTap = (index) => {
    if (!tilesActiveRef.current || gameEndedRef.current) return;
    const g = gameRef.current;
    if (!g) return;

    setTiles(prev => {
      const tile = prev[index];
      if (tile.state !== 'open') return prev;                     // already tapped

      const correct = tile.letter === g.gameData.targetLetter;

      if (correct) {
        const pts = Math.max(timeLeftRef.current, 0);
        scoreRef.current += pts;
        setScore(scoreRef.current);
        showFeedbackPop(`+${pts}`, 'correct');
      } else {
        scoreRef.current -= 1;
        setScore(scoreRef.current);
        penaltiesRef.current += 1;
        setPenalties(penaltiesRef.current);
        showFeedbackPop('−1 ✗', 'wrong');
      }

      const updated = prev.map((t, i) =>
        i === index ? { ...t, state: correct ? 'correct' : 'wrong' } : t
      );
      return updated;
    });
  };

  // ── end & submit ───────────────────────────────────────────────────────────

  const endGame = useCallback(async () => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;
    clearAll();
    tilesActiveRef.current = false;
    setGamePhase('ended');
    setTiles(Array(9).fill(null).map(() => ({ letter: null, state: 'closed' })));

    const finalScore    = scoreRef.current;
    const finalPenalties = penaltiesRef.current;

    try {
      if (userId && gameRef.current) {
        await axios.post('http://localhost:5001/api/whack/score', {
          userId,
          gameId:   gameRef.current.gameId,
          language,
          level:    parseInt(level),
          score:    finalScore,
          penalties: finalPenalties,
          timeTaken: TOTAL_TIME
        });
      }
    } catch (err) {
      console.error('Error saving score:', err);
    } finally {
      navigate('/results', {
        state: {
          score:     finalScore,
          penalties: finalPenalties,
          language,
          level,
          gameType: 'whack'
        }
      });
    }
  }, [clearAll, language, level, navigate, userId]);

  // ── derived display ────────────────────────────────────────────────────────

  const timerColor =
    timeLeft > 20 ? '#4ECDC4' :
    timeLeft > 10 ? '#FFD700' : '#FF5252';

  const tileClass = (tile) => {
    const base = 'whack-tile';
    if (tile.state === 'closed') return `${base} tile-closed`;
    if (tile.state === 'open')   return `${base} tile-open`;
    if (tile.state === 'correct') return `${base} tile-correct`;
    return `${base} tile-wrong`;
  };

  // ── loading ────────────────────────────────────────────────────────────────

  if (loading || !game) {
    return (
      <div className="whack-game-container loading">
        <div className="wg-spinner">🔨 Loading game...</div>
      </div>
    );
  }

  // ── countdown overlay ──────────────────────────────────────────────────────

  if (gamePhase === 'countdown') {
    return (
      <div className="whack-game-container countdown-screen">
        <div className="countdown-box">
          <p className="countdown-label">Listen carefully!</p>
          <button
            className="wg-sound-btn wg-sound-btn-large"
            onClick={() => playLetterSound(game.gameData.targetLetter)}
          >
            🔊
          </button>
          <p className="countdown-hint">Tap to hear again</p>
          <div className="countdown-number">{countdown}</div>
        </div>
      </div>
    );
  }

  // ── main game ──────────────────────────────────────────────────────────────

  return (
    <div className="whack-game-container">
      {/* Stars */}
      <div className="stars-container">
        {[...Array(60)].map((_, i) => (
          <div key={i} className={`star ${['small','medium','large'][i % 3]}`}
            style={{ left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, animationDelay:`${Math.random()*3}s` }} />
        ))}
      </div>

      {/* Header */}
      <div className="wg-header">
        <button className="wg-back-btn" onClick={() => { clearAll(); navigate(`/whack/${language}`); }}>
          ← Exit
        </button>
        <div className="wg-title">🔨 Whack-a-Letter</div>
        <div className="wg-timer" style={{ color: timerColor }}>
          ⏱ {timeLeft}s
        </div>
      </div>

      {/* Stats bar */}
      <div className="wg-stats">
        <div className="wg-stat">
          <span className="wg-stat-label">Score</span>
          <span className="wg-stat-value" style={{ color: score < 0 ? '#FF5252' : '#4ECDC4' }}>{score}</span>
        </div>
        <div className="wg-stat">
          <span className="wg-stat-label">Round</span>
          <span className="wg-stat-value">{roundNumber} / {NUM_ROUNDS}</span>
        </div>
        <div className="wg-stat">
          <span className="wg-stat-label">Penalties</span>
          <span className="wg-stat-value" style={{ color: penalties > 0 ? '#FF5252' : '#aaa' }}>{penalties}</span>
        </div>
      </div>

      {/* Target – audio only, no visual letter */}
      <div className="wg-target-row">
        <span className="wg-target-label">Listen & Find:</span>
        <button
          className="wg-sound-btn"
          onClick={() => playLetterSound(game.gameData.targetLetter)}
          title="Play letter sound"
        >
          🔊
        </button>
      </div>

      {/* Round phase message */}
      <div className="wg-round-msg">
        {roundPhase === 'waiting' && <span className="phase-waiting">⏳ Get ready…</span>}
        {roundPhase === 'open'    && <span className="phase-open">👆 Tap the tiles!</span>}
        {roundPhase === 'closed'  && <span className="phase-closed">✋ Wait for next round</span>}
      </div>

      {/* Feedback pop */}
      {feedback && (
        <div className={`wg-feedback-pop ${feedback.type}`}>{feedback.text}</div>
      )}

      {/* Grid */}
      <div className="whack-grid">
        {tiles.map((tile, i) => (
          <button
            key={i}
            className={tileClass(tile)}
            onClick={() => handleTileTap(i)}
            disabled={tile.state !== 'open'}
          >
            {tile.state !== 'closed' && (
              <span className="tile-letter">{tile.letter}</span>
            )}
            {tile.state === 'correct' && <span className="tile-overlay">✓</span>}
            {tile.state === 'wrong'   && <span className="tile-overlay">✗</span>}
          </button>
        ))}
      </div>

      {/* Progress dots */}
      <div className="wg-round-dots">
        {Array(NUM_ROUNDS).fill(null).map((_, i) => (
          <div
            key={i}
            className={`round-dot ${i < roundNumber ? 'dot-done' : i === roundNumber - 1 ? 'dot-active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default WhackGame;
