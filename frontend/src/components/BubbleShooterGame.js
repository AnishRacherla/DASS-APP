import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { hindiConsonants, hindiStage1Consonants, hindiStage2Consonants } from '../akshara-data/hindiData';
import { teluguConsonants, teluguStage1Consonants, teluguStage2Consonants } from '../akshara-data/teluguData';
import { playCorrect, playGameOver, playPop, playWrong } from '../akshara-utils/sounds';
import './BubbleShooterGame.css';

const BOARD_COLS = 8;
const MAX_ROWS = 7;
const LETTER_CHANGE_INTERVAL_MS = 10000;
const AUDIO_REPEAT_INTERVAL_MS = 3000;
const PROJECTILE_SPEED = 6;
const PROJECTILE_RADIUS = 18;
const CORRECT_HIT_POINTS = 10;
const WRONG_HIT_POINTS = -5;
const API_BASE = 'http://localhost:5001';

const AUDIO_FOLDER_MAP = { hindi: 'hindi_letters', telugu: 'telugu_letters' };

function getLetterAudioUrl(language, letterSymbol) {
  const pool = language === 'telugu' ? teluguConsonants : hindiConsonants;
  const match = pool.find((item) => item.symbol === letterSymbol);
  if (!match) return '';
  const folder = AUDIO_FOLDER_MAP[language] || 'hindi_letters';
  const suffix = language === 'telugu' ? 'Telugu' : 'Hindi';
  return `${API_BASE}/audio/${folder}/${encodeURIComponent(`${match.id}_${suffix}.mp3`)}`;
}

function getConsonantPool(language, difficulty) {
  const all = language === 'telugu' ? teluguConsonants : hindiConsonants;
  const stage1 = language === 'telugu' ? teluguStage1Consonants : hindiStage1Consonants;
  const stage2 = language === 'telugu' ? teluguStage2Consonants : hindiStage2Consonants;

  if (difficulty === 'easy') return all.filter((item) => stage1.includes(item.id));
  if (difficulty === 'medium') return all.filter((item) => stage2.includes(item.id));
  return all;
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function randomLetter(pool) {
  return pool[Math.floor(Math.random() * pool.length)] || pool[0];
}

function createBoard(pool, rowCount) {
  return Array.from({ length: rowCount }, (_, rowIndex) => (
    Array.from({ length: BOARD_COLS }, (_, colIndex) => {
      const letter = randomLetter(pool);
      return {
        id: `${rowIndex}-${colIndex}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        symbol: letter.symbol,
        name: letter.name,
      };
    })
  ));
}

function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function boardRows(board) {
  return board.length;
}

function isCellExposed(board, row, col) {
  if (!board[row] || !board[row][col]) return false;
  if (row === 0 || row === board.length - 1 || col === 0 || col === BOARD_COLS - 1) return true;

  const neighbors = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];

  return neighbors.some(([nextRow, nextCol]) => !board[nextRow] || !board[nextRow][nextCol]);
}

function getExposedCells(board) {
  const exposed = [];
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (!cell) return;
      if (isCellExposed(board, rowIndex, colIndex)) {
        exposed.push({ ...cell, row: rowIndex, col: colIndex });
      }
    });
  });
  return exposed;
}

function findCellById(board, id) {
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const cell = board[row][col];
      if (cell && cell.id === id) {
        return { ...cell, row, col };
      }
    }
  }
  return null;
}

function addTopRow(board, pool) {
  const next = createBoard(pool, 1).concat(cloneBoard(board));
  return next.slice(0, MAX_ROWS);
}

function removeCellCluster(board, origin, symbol) {
  const next = cloneBoard(board);
  const exposed = new Set(getExposedCells(board).map((cell) => cell.id));
  const target = findCellById(board, origin.id);
  const targetSymbol = symbol || origin.symbol;

  if (!target) {
    return next;
  }

  const queue = [[target.row, target.col]];
  const visited = new Set();
  const toRemove = [];

  const neighbors = ([row, col]) => ([
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ]);

  while (queue.length > 0) {
    const [row, col] = queue.shift();
    const key = `${row}:${col}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const cell = board[row]?.[col];
    if (!cell || cell.symbol !== targetSymbol || !exposed.has(cell.id)) continue;

    toRemove.push([row, col]);

    neighbors([row, col]).forEach(([nextRow, nextCol]) => {
      const neighbor = board[nextRow]?.[nextCol];
      if (neighbor && neighbor.symbol === targetSymbol && exposed.has(neighbor.id)) {
        queue.push([nextRow, nextCol]);
      }
    });
  }

  toRemove.forEach(([row, col]) => {
    next[row][col] = null;
  });

  return next;
}

function getBoardLayout(width, height) {
  const bubbleSize = Math.max(42, Math.min(width / 10.2, 62));
  const gap = Math.max(6, bubbleSize * 0.16);
  const rowStep = bubbleSize * 0.9;
  const topPadding = Math.max(18, height * 0.07);
  const leftPadding = Math.max(14, (width - ((BOARD_COLS * bubbleSize) + ((BOARD_COLS - 1) * gap))) / 2);
  const launcherY = height - bubbleSize * 1.05;

  return {
    bubbleSize,
    bubbleRadius: bubbleSize / 2,
    gap,
    rowStep,
    topPadding,
    leftPadding,
    launcherY,
  };
}

function getBubbleCenter(row, col, layout) {
  const rowOffset = row % 2 === 1 ? (layout.bubbleSize + layout.gap) / 2 : 0;
  const x = layout.leftPadding + rowOffset + col * (layout.bubbleSize + layout.gap) + layout.bubbleRadius;
  const y = layout.topPadding + row * layout.rowStep + layout.bubbleRadius;
  return { x, y };
}

function normalizeAngle(angle) {
  const min = -Math.PI + 0.18;
  const max = -0.18;
  return Math.min(max, Math.max(min, angle));
}

function pickTarget(board, previousId) {
  const exposed = getExposedCells(board);
  if (exposed.length === 0) return null;
  const choices = previousId ? exposed.filter((cell) => cell.id !== previousId) : exposed;
  const pool = choices.length > 0 ? choices : exposed;
  return pool[Math.floor(Math.random() * pool.length)];
}

function countRemaining(board) {
  return board.reduce((total, row) => total + row.filter(Boolean).length, 0);
}

export default function BubbleShooterGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language: routeLanguage, difficulty: routeDifficulty } = useParams();

  const language = routeLanguage || location.state?.language || localStorage.getItem('userLanguage') || 'hindi';
  const difficulty = routeDifficulty || location.state?.difficulty || 'easy';

  const level = useMemo(() => {
    if (difficulty === 'medium') {
      return { label: 'Medium', scoreOnly: false, lives: 3, timeLimit: 60, initialRows: 5 };
    }

    if (difficulty === 'hard') {
      return { label: 'Hard', scoreOnly: false, lives: 3, timeLimit: 60, initialRows: 6 };
    }

    return { label: 'Easy', scoreOnly: true, lives: 0, timeLimit: 60, initialRows: 4 };
  }, [difficulty]);

  const availablePool = useMemo(() => getConsonantPool(language, difficulty), [language, difficulty]);

  const boardRef = useRef(null);
  const boardStateRef = useRef([]);
  const targetRef = useRef(null);
  const projectileRef = useRef(null);
  const lastFrameRef = useRef(0);
  const gameTimerRef = useRef(null);
  const audioTimerRef = useRef(null);
  const letterChangeTimerRef = useRef(null);
  const animationRef = useRef(null);
  const audioRef = useRef(null);
  const scoreRef = useRef(0);
  const correctHitsRef = useRef(0);
  const wrongHitsRef = useRef(0);
  const boardSizeRef = useRef({ width: 960, height: 620 });
  const endedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const pendingMissPenaltyRef = useRef(false);

  const [board, setBoard] = useState(() => createBoard(availablePool, level.initialRows));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(level.lives);
  const [timeLeft, setTimeLeft] = useState(level.timeLimit);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [projectile, setProjectile] = useState(null);
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2);
  const [feedback, setFeedback] = useState(null);
  const [gameState, setGameState] = useState('playing');
  const [endReason, setEndReason] = useState('');
  const levelNumber = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;

  const getBoardMetrics = useCallback(() => getBoardLayout(boardSizeRef.current.width, boardSizeRef.current.height), []);

  const sayTarget = useCallback((targetCell) => {
    if (!targetCell) return;
    const audioUrl = getLetterAudioUrl(language, targetCell.symbol);
    if (!audioUrl) return;
    const audio = audioRef.current || new Audio();
    audioRef.current = audio;
    audio.pause();
    audio.currentTime = 0;
    audio.src = audioUrl;
    audio.play().catch((error) => {
      console.warn('Recorded letter audio playback failed:', error);
    });
  }, [language]);

  const refreshBoardMeasurement = useCallback(() => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    boardSizeRef.current = { width: rect.width, height: rect.height };
  }, []);

  const finishGame = useCallback((reason) => {
    if (endedRef.current) return;
    endedRef.current = true;
    setGameState('ended');
    setEndReason(reason);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    if (letterChangeTimerRef.current) clearInterval(letterChangeTimerRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    playGameOver();

    navigate('/results', {
      state: {
        score: scoreRef.current,
        correctAnswers: correctHitsRef.current,
        totalQuestions: Math.max(correctHitsRef.current + wrongHitsRef.current, 1),
        penalties: wrongHitsRef.current,
        language,
        level: levelNumber,
        difficulty,
        gameType: 'bubble-shooter',
      }
    });
  }, [difficulty, language, levelNumber, navigate]);

  const showFeedback = useCallback((text, type) => {
    setFeedback({ text, type });
    window.setTimeout(() => setFeedback(null), 650);
  }, []);

  const syncTarget = useCallback((boardState) => {
    const nextTarget = pickTarget(boardState, targetRef.current?.id);
    targetRef.current = nextTarget;
    setCurrentTarget(nextTarget);
    if (nextTarget) sayTarget(nextTarget);
  }, [sayTarget]);

  const addNewRowAndRetarget = useCallback((boardState) => {
    const nextBoard = addTopRow(boardState, availablePool);
    const nextTarget = pickTarget(nextBoard, null);
    targetRef.current = nextTarget;
    setBoard(nextBoard);
    boardStateRef.current = nextBoard;
    setCurrentTarget(nextTarget);
    if (nextTarget) sayTarget(nextTarget);
    return nextBoard;
  }, [availablePool, sayTarget]);

  const applyWrongHit = useCallback((message = 'Wrong hit') => {
    wrongHitsRef.current += 1;
    const nextScore = scoreRef.current + WRONG_HIT_POINTS;
    scoreRef.current = nextScore;
    setScore(nextScore);
    showFeedback(`${message} (-5)`, 'wrong');

    if (!level.scoreOnly) {
      const nextLives = Math.max(0, (livesRef.current ?? level.lives) - 1);
      livesRef.current = nextLives;
      setLives(nextLives);
      if (nextLives === 0) {
        finishGame('lives');
      }
    }
  }, [finishGame, level.lives, level.scoreOnly, showFeedback]);

  const livesRef = useRef(level.lives);

  const resolveHit = useCallback((hitCell) => {
    const boardState = boardStateRef.current;
    if (!boardState || !hitCell) return;

    const nextBoard = removeCellCluster(boardState, hitCell, hitCell.symbol);
    const removedCount = countRemaining(boardState) - countRemaining(nextBoard);

    if (removedCount > 0) {
      playPop();
      playCorrect();
      confetti({
        particleCount: 80,
        spread: 64,
        origin: { y: 0.68 },
        colors: ['#38bdf8', '#f8fbff', '#67e8f9', '#0ea5e9']
      });
      correctHitsRef.current += 1;
      const points = CORRECT_HIT_POINTS;
      const nextScore = scoreRef.current + points;
      scoreRef.current = nextScore;
      setScore(nextScore);
      showFeedback(`+${points}`, 'correct');
      const replenished = addNewRowAndRetarget(nextBoard);
      projectileRef.current = null;
      setProjectile(null);
      boardStateRef.current = replenished;
      setBoard(replenished);
      return;
    }

    projectileRef.current = null;
    setProjectile(null);
    applyWrongHit('Miss');
    playWrong();
  }, [addNewRowAndRetarget, applyWrongHit, showFeedback]);

  const stepProjectile = useCallback((timestamp) => {
    if (endedRef.current) return;
    const prev = projectileRef.current;
    if (!prev || !prev.active) {
      animationRef.current = requestAnimationFrame(stepProjectile);
      return;
    }

    const metrics = getBoardMetrics();
    const delta = prev.lastTimestamp ? Math.min((timestamp - prev.lastTimestamp) / 16.67, 1.8) : 1;
    const next = { ...prev, lastTimestamp: timestamp };
    let nextX = next.x + next.vx * delta;
    let nextY = next.y + next.vy * delta;

    if (nextX <= metrics.bubbleRadius) {
      nextX = metrics.bubbleRadius;
      next.vx *= -1;
    } else if (nextX >= boardSizeRef.current.width - metrics.bubbleRadius) {
      nextX = boardSizeRef.current.width - metrics.bubbleRadius;
      next.vx *= -1;
    }

    const boardState = boardStateRef.current;
    const targetCell = targetRef.current;

    for (let row = 0; row < boardState.length; row += 1) {
      for (let col = 0; col < boardState[row].length; col += 1) {
        const cell = boardState[row][col];
        if (!cell) continue;
        const center = getBubbleCenter(row, col, metrics);
        const distance = Math.hypot(nextX - center.x, nextY - center.y);
        if (distance <= metrics.bubbleRadius * 1.05) {
          projectileRef.current = null;
          setProjectile(null);
          if (cell.symbol === targetCell?.symbol) {
            resolveHit(cell);
          } else {
            const nextBoard = cloneBoard(boardState);
            if (nextBoard[row]) {
              nextBoard[row][col] = null;
            }
            boardStateRef.current = nextBoard;
            setBoard(nextBoard);
            applyWrongHit('Wrong bubble');
            playWrong();
            playPop();
          }
          animationRef.current = requestAnimationFrame(stepProjectile);
          return;
        }
      }
    }

    if (nextY <= metrics.topPadding + metrics.bubbleRadius) {
      projectileRef.current = null;
      setProjectile(null);
      applyWrongHit('Too high');
      playWrong();
      animationRef.current = requestAnimationFrame(stepProjectile);
      return;
    }

    if (timestamp - (next.startedAt || timestamp) > 9000) {
      projectileRef.current = null;
      setProjectile(null);
      applyWrongHit('Miss');
      animationRef.current = requestAnimationFrame(stepProjectile);
      return;
    }

    next.x = nextX;
    next.y = nextY;
    projectileRef.current = next;
    setProjectile(next);
    animationRef.current = requestAnimationFrame(stepProjectile);
  }, [applyWrongHit, getBoardMetrics, resolveHit, showFeedback]);

  const fireProjectile = useCallback(() => {
    if (endedRef.current || projectileRef.current || !currentTarget) return;
    const metrics = getBoardMetrics();
    const launcherX = boardSizeRef.current.width / 2;
    const launcherY = metrics.launcherY;
    const angle = normalizeAngle(aimAngle);
    const speed = PROJECTILE_SPEED;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;
    const shot = {
      active: true,
      x: launcherX,
      y: launcherY,
      vx,
      vy,
      symbol: currentTarget.symbol,
      name: currentTarget.name,
      startedAt: performance.now(),
      lastTimestamp: 0,
    };
    projectileRef.current = shot;
    setProjectile(shot);
  }, [aimAngle, currentTarget, getBoardMetrics]);

  const updateAim = useCallback((event) => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const metrics = getBoardMetrics();
    const launcherX = rect.width / 2;
    const launcherY = metrics.launcherY;
    const angle = normalizeAngle(Math.atan2(y - launcherY, x - launcherX));
    setAimAngle(angle);
  }, [getBoardMetrics]);

  useEffect(() => {
    refreshBoardMeasurement();
    const handleResize = () => refreshBoardMeasurement();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [refreshBoardMeasurement]);

  useEffect(() => {
    boardStateRef.current = board;
  }, [board]);

  useEffect(() => {
    const nextBoard = createBoard(availablePool, level.initialRows);
    endedRef.current = false;
    projectileRef.current = null;
    targetRef.current = null;
    boardStateRef.current = nextBoard;
    setBoard(nextBoard);
    setScore(0);
    scoreRef.current = 0;
    correctHitsRef.current = 0;
    wrongHitsRef.current = 0;
    setLives(level.lives);
    setTimeLeft(level.timeLimit);
    setProjectile(null);
    setAimAngle(-Math.PI / 2);
    setFeedback(null);
    setGameState('playing');
    setEndReason('');
    livesRef.current = level.lives;

    const nextTarget = pickTarget(nextBoard, null);
    targetRef.current = nextTarget;
    setCurrentTarget(nextTarget);
    if (nextTarget) sayTarget(nextTarget);
  }, [availablePool, level.initialRows, level.lives, level.timeLimit, sayTarget]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame('time');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const audioTimer = window.setInterval(() => {
      if (endedRef.current) return;
      const target = targetRef.current;
      if (target) sayTarget(target);
    }, AUDIO_REPEAT_INTERVAL_MS);

    const letterChangeTimer = window.setInterval(() => {
      if (endedRef.current) return;
      const target = pickTarget(boardStateRef.current, targetRef.current?.id);
      targetRef.current = target;
      setCurrentTarget(target);
      if (target) sayTarget(target);
    }, LETTER_CHANGE_INTERVAL_MS);

    gameTimerRef.current = timer;
    audioTimerRef.current = audioTimer;
    letterChangeTimerRef.current = letterChangeTimer;

    animationRef.current = requestAnimationFrame(stepProjectile);

    return () => {
      window.clearInterval(timer);
      window.clearInterval(audioTimer);
      window.clearInterval(letterChangeTimer);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [finishGame, sayTarget, stepProjectile]);

  const launcherMetrics = getBoardMetrics();
  const launcherX = boardSizeRef.current.width / 2;
  const launcherY = launcherMetrics.launcherY;
  const launcherAngleDeg = (aimAngle * 180) / Math.PI;

  const boardBubbleElements = board.map((row, rowIndex) => row.map((cell, colIndex) => {
    if (!cell) return null;
    const center = getBubbleCenter(rowIndex, colIndex, launcherMetrics);
    const exposed = isCellExposed(board, rowIndex, colIndex);
    return (
      <motion.div
        key={cell.id}
        className={`bs-board-bubble ${exposed ? 'exposed' : ''}`}
        style={{
          width: `${launcherMetrics.bubbleSize}px`,
          height: `${launcherMetrics.bubbleSize}px`,
          left: `${center.x - launcherMetrics.bubbleRadius}px`,
          top: `${center.y - launcherMetrics.bubbleRadius}px`,
        }}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18 }}
      >
        <span className="bs-bubble-letter">{cell.symbol}</span>
        <span className="bs-bubble-shadow" />
      </motion.div>
    );
  })).flat();

  return (
    <div className="bs-game-page">
      <div className="bs-game-bg" />

      <header className="bs-game-header">
        <button className="bs-game-back" onClick={() => navigate('/bubble-shooter', { state: { language } })}>
          ← Levels
        </button>
        <div className="bs-game-title">
          <span className="bs-game-kicker">{language === 'hindi' ? 'Hindi' : 'Telugu'} Bubble Shooter</span>
          <h1>{level.label} Mode</h1>
          <p>Drag to aim, release to shoot. The target changes every 10 seconds and repeats every 3 seconds.</p>
        </div>
        <div className="bs-hud">
          <div className="bs-hud-chip">Score {score}</div>
          <div className="bs-hud-chip">Time {timeLeft}s</div>
          {!level.scoreOnly && <div className="bs-hud-chip">Lives {lives}</div>}
          <div className="bs-hud-chip">Left {countRemaining(board)}</div>
        </div>
      </header>

      <main className="bs-game-shell">
        <section className="bs-target-strip">
          <div className="bs-target-card">
            <span className="bs-target-label">Hear this consonant</span>
            <p>Listen carefully. Each target letter lasts 10 seconds, with the same recorded sound replayed every 3 seconds.</p>
          </div>
          <div className="bs-target-note">
            Only the outer layer and top layer bubbles can be cleared. If you miss on medium or hard, you lose a life.
          </div>
        </section>

        <section
          ref={boardRef}
          className="bs-board"
          onPointerDown={(event) => {
            isDraggingRef.current = true;
            updateAim(event);
          }}
          onPointerMove={(event) => {
            if (!isDraggingRef.current) return;
            updateAim(event);
          }}
          onPointerUp={() => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            fireProjectile();
          }}
          onPointerLeave={() => {
            isDraggingRef.current = false;
          }}
        >
          <div className="bs-stars" />
          <div className="bs-board-grid" />

          {boardBubbleElements}

          {projectile && (
            <motion.div
              className="bs-projectile"
              style={{
                width: `${PROJECTILE_RADIUS * 2}px`,
                height: `${PROJECTILE_RADIUS * 2}px`,
                left: `${projectile.x - PROJECTILE_RADIUS}px`,
                top: `${projectile.y - PROJECTILE_RADIUS}px`,
              }}
              animate={{ scale: 1 }}
              initial={{ scale: 0.9 }}
            >
              <span>{projectile.symbol}</span>
            </motion.div>
          )}

          <div className="bs-aim-layer">
            <div
              className="bs-aim-line"
              style={{
                left: `${launcherX}px`,
                top: `${launcherY}px`,
                width: `${launcherMetrics.bubbleSize * 2.5}px`,
                transform: `rotate(${launcherAngleDeg}deg)`,
              }}
            />
            <div
              className="bs-launcher"
              style={{
                left: `${launcherX}px`,
                top: `${launcherY}px`,
              }}
            >
              <div className="bs-launcher-glow" />
              <div className="bs-launcher-bubble">
                <span>◉</span>
              </div>
            </div>
            <div
              className="bs-launcher-base"
              style={{
                left: `${launcherX}px`,
                top: `${launcherY + 34}px`,
              }}
            />
          </div>

          <button
            className="bs-fire-btn"
            onClick={fireProjectile}
            disabled={Boolean(projectile) || !currentTarget || gameState === 'ended'}
          >
            Fire
          </button>
        </section>

        <div className="bs-footer-hint">
          Easy mode only scores. Medium and hard use lives. New bubbles rise from the top after each hit.
        </div>
      </main>

      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`bs-feedback ${feedback.type}`}
            initial={{ opacity: 0, y: 14, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.92 }}
          >
            {feedback.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState === 'ended' && null}
      </AnimatePresence>
    </div>
  );
}