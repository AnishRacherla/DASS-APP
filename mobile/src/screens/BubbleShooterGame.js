import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, PanResponder, Platform } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { hindiConsonants, hindiStage1Consonants, hindiStage2Consonants } from '../akshara-data/hindiData';
import { teluguConsonants, teluguStage1Consonants, teluguStage2Consonants } from '../akshara-data/teluguData';

const BOARD_COLS = 8;
const MAX_ROWS = 7;
const LETTER_CHANGE_INTERVAL_MS = 10000;
const AUDIO_REPEAT_INTERVAL_MS = 3000;
const GAME_TIME_SEC = 60;
const CORRECT_HIT_POINTS = 10;
const WRONG_HIT_POINTS = -5;
const PROJECTILE_SPEED = 6;
const API_TIMEOUT_MS = 8000;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_WIDTH = SCREEN_WIDTH - 24;
const BOARD_HEIGHT = 430;
const BUBBLE_SIZE = 36;
const GAP = 4;
const ROW_STEP = 34;
const TOP_PADDING = 14;
const PROJECTILE_SIZE = 28;

function getPool(language, difficulty) {
  const all = language === 'telugu' ? teluguConsonants : hindiConsonants;
  const stage1 = language === 'telugu' ? teluguStage1Consonants : hindiStage1Consonants;
  const stage2 = language === 'telugu' ? teluguStage2Consonants : hindiStage2Consonants;
  if (difficulty === 'easy') return all.filter((x) => stage1.includes(x.id));
  if (difficulty === 'medium') return all.filter((x) => stage2.includes(x.id));
  return all;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createBoard(pool, rows) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: BOARD_COLS }, () => {
      const letter = pool[Math.floor(Math.random() * pool.length)];
      return { id: makeId(), symbol: letter.symbol, name: letter.name, letterId: letter.id };
    })
  );
}

function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function isExposed(board, row, col) {
  if (!board[row]?.[col]) return false;
  if (row === 0 || row === board.length - 1 || col === 0 || col === BOARD_COLS - 1) return true;
  const neighbors = [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];
  return neighbors.some(([r, c]) => !board[r] || !board[r][c]);
}

function exposedCells(board) {
  const out = [];
  board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (cell && isExposed(board, r, c)) out.push({ ...cell, row: r, col: c });
    });
  });
  return out;
}

function pickTarget(board, previousId) {
  const cells = exposedCells(board);
  if (!cells.length) return null;
  const filtered = previousId ? cells.filter((x) => x.id !== previousId) : cells;
  const pool = filtered.length ? filtered : cells;
  return pool[Math.floor(Math.random() * pool.length)];
}

function findCell(board, id) {
  for (let r = 0; r < board.length; r += 1) {
    for (let c = 0; c < board[r].length; c += 1) {
      if (board[r][c] && board[r][c].id === id) return { ...board[r][c], row: r, col: c };
    }
  }
  return null;
}

function removeExposedCluster(board, origin, symbol) {
  const next = cloneBoard(board);
  const originCell = findCell(board, origin.id);
  if (!originCell) return next;

  const exposedSet = new Set(exposedCells(board).map((x) => x.id));
  const queue = [[originCell.row, originCell.col]];
  const visited = new Set();

  while (queue.length) {
    const [r, c] = queue.shift();
    const key = `${r}:${c}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const cell = board[r]?.[c];
    if (!cell || cell.symbol !== symbol || !exposedSet.has(cell.id)) continue;
    next[r][c] = null;

    [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ].forEach(([nr, nc]) => {
      if (board[nr]?.[nc] && board[nr][nc].symbol === symbol && exposedSet.has(board[nr][nc].id)) {
        queue.push([nr, nc]);
      }
    });
  }

  return next;
}

function countCells(board) {
  return board.reduce((acc, row) => acc + row.filter(Boolean).length, 0);
}

function addTopRow(board, pool) {
  const row = createBoard(pool, 1)[0];
  return [row, ...cloneBoard(board)].slice(0, MAX_ROWS);
}

function clampAngle(angle) {
  const min = -Math.PI + 0.18;
  const max = -0.18;
  return Math.min(max, Math.max(min, angle));
}

export default function BubbleShooterGame({ navigation, route }) {
  const language = route.params?.language || 'hindi';
  const difficulty = route.params?.difficulty || 'easy';

  const levelConfig = useMemo(() => {
    if (difficulty === 'medium') return { lives: 3, scoreOnly: false, rows: 5, level: 2 };
    if (difficulty === 'hard') return { lives: 3, scoreOnly: false, rows: 6, level: 3 };
    return { lives: 0, scoreOnly: true, rows: 4, level: 1 };
  }, [difficulty]);

  const pool = useMemo(() => getPool(language, difficulty), [language, difficulty]);
  const symbolToId = useMemo(() => {
    const map = {};
    pool.forEach((c) => { map[c.symbol] = c.id; });
    return map;
  }, [pool]);

  const leftBase = (BOARD_WIDTH - (BOARD_COLS * BUBBLE_SIZE + (BOARD_COLS - 1) * GAP)) / 2;
  const launcherCenterX = BOARD_WIDTH / 2;
  const launcherCenterY = BOARD_HEIGHT - 30;

  const [board, setBoard] = useState(() => createBoard(pool, levelConfig.rows));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(levelConfig.lives);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_SEC);
  const [target, setTarget] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [aimAngle, setAimAngle] = useState(-Math.PI / 2);
  const [projectile, setProjectile] = useState(null);
  const [audioUnlocked, setAudioUnlocked] = useState(Platform.OS !== 'web');

  const boardRef = useRef(board);
  const targetRef = useRef(null);
  const endedRef = useRef(false);
  const gameTimerRef = useRef(null);
  const repeatTimerRef = useRef(null);
  const changeTimerRef = useRef(null);
  const shotLoopRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  const soundRef = useRef(null);
  const letterAudioMapRef = useRef({});
  const projectileRef = useRef(null);

  const scoreRef = useRef(0);
  const livesRef = useRef(levelConfig.lives);
  const correctHitsRef = useRef(0);
  const wrongHitsRef = useRef(0);

  const showFeedback = useCallback((text) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedback(text);
    feedbackTimerRef.current = setTimeout(() => setFeedback(''), 900);
  }, []);

  const getBubbleCenter = useCallback((row, col) => {
    const rowOffset = row % 2 === 1 ? (BUBBLE_SIZE + GAP) / 2 : 0;
    const x = leftBase + rowOffset + col * (BUBBLE_SIZE + GAP) + BUBBLE_SIZE / 2;
    const y = TOP_PADDING + row * ROW_STEP + BUBBLE_SIZE / 2;
    return { x, y };
  }, [leftBase]);

  const stopSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (_) {}
  }, []);

  const resolveAudioUrl = useCallback((audioUrlOrPath) => {
    if (!audioUrlOrPath) return null;
    if (audioUrlOrPath.startsWith('http://') || audioUrlOrPath.startsWith('https://')) return audioUrlOrPath;
    if (audioUrlOrPath.startsWith('/')) return `${API_BASE_URL}${audioUrlOrPath}`;
    return `${API_BASE_URL}/${audioUrlOrPath}`;
  }, []);

  const buildLetterAudioMap = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/akshara/${language}/letters`, { timeout: API_TIMEOUT_MS });
      const rows = Array.isArray(response.data) ? response.data : [];
      const map = {};
      rows.forEach((row) => {
        if (!row?.symbol) return;
        if (row.audioUrl) {
          map[row.symbol] = resolveAudioUrl(row.audioUrl);
        } else if (row.audioFileName) {
          map[row.symbol] = `${API_BASE_URL}/audio/${language}_letters/${encodeURIComponent(row.audioFileName)}`;
        }
      });
      letterAudioMapRef.current = map;
    } catch (error) {
      console.warn('BubbleShooter mobile: audio map fetch failed.', error?.message);
      letterAudioMapRef.current = {};
    }
  }, [language, resolveAudioUrl]);

  const playTargetSound = useCallback(async (targetCell) => {
    if (!targetCell) return;
    if (Platform.OS === 'web' && !audioUnlocked) return;
    const letterId = symbolToId[targetCell.symbol];
    const suffix = language === 'telugu' ? 'Telugu' : 'Hindi';
    const mappedUrl = letterAudioMapRef.current[targetCell.symbol];
    const fallbackUrl = letterId ? `${API_BASE_URL}/audio/${language}_letters/${encodeURIComponent(`${letterId}_${suffix}.mp3`)}` : null;
    const url = mappedUrl || fallbackUrl;
    if (!url) return;

    try {
      await stopSound();
      const sound = new Audio.Sound();
      soundRef.current = sound;
      await sound.loadAsync({ uri: url }, { shouldPlay: true, volume: 1 });
    } catch (error) {
      console.warn('BubbleShooter mobile: audio playback failed.', error?.message);
    }
  }, [audioUnlocked, language, stopSound, symbolToId]);

  const endGame = useCallback(async (reason) => {
    if (endedRef.current) return;
    endedRef.current = true;

    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
    if (changeTimerRef.current) clearInterval(changeTimerRef.current);
    if (shotLoopRef.current) clearInterval(shotLoopRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);

    await stopSound();

    navigation.replace('Results', {
      score: scoreRef.current,
      correctAnswers: correctHitsRef.current,
      totalQuestions: Math.max(correctHitsRef.current + wrongHitsRef.current, 1),
      penalties: wrongHitsRef.current,
      language,
      level: levelConfig.level,
      difficulty,
      gameType: 'bubble-shooter',
      endReason: reason,
    });
  }, [difficulty, language, levelConfig.level, navigation, stopSound]);

  const applyWrongHit = useCallback((message = 'Wrong') => {
    wrongHitsRef.current += 1;
    const nextScore = scoreRef.current + WRONG_HIT_POINTS;
    scoreRef.current = nextScore;
    setScore(nextScore);
    showFeedback(`${message} (-5)`);

    if (!levelConfig.scoreOnly) {
      const nextLives = Math.max(0, livesRef.current - 1);
      livesRef.current = nextLives;
      setLives(nextLives);
      if (nextLives === 0) {
        endGame('lives');
      }
    }
  }, [endGame, levelConfig.scoreOnly, showFeedback]);

  const retarget = useCallback((boardState) => {
    const nextTarget = pickTarget(boardState, targetRef.current?.id);
    targetRef.current = nextTarget;
    setTarget(nextTarget);
    if (nextTarget) playTargetSound(nextTarget);
  }, [playTargetSound]);

  const resolveCollision = useCallback((cell, row, col) => {
    const boardNow = boardRef.current;
    const exposed = isExposed(boardNow, row, col);
    if (!exposed) {
      setProjectile(null);
      projectileRef.current = null;
      showFeedback('Outer layer only');
      return;
    }

    const isCorrect = targetRef.current && cell.symbol === targetRef.current.symbol;

    if (isCorrect) {
      correctHitsRef.current += 1;
      const nextScore = scoreRef.current + CORRECT_HIT_POINTS;
      scoreRef.current = nextScore;
      setScore(nextScore);
      showFeedback('+10');

      const clustered = removeExposedCluster(boardNow, cell, cell.symbol);
      const withNewRow = addTopRow(clustered, pool);
      boardRef.current = withNewRow;
      setBoard(withNewRow);
    } else {
      const next = cloneBoard(boardNow);
      next[row][col] = null;
      boardRef.current = next;
      setBoard(next);
      applyWrongHit('Wrong bubble');
    }

    setProjectile(null);
    projectileRef.current = null;

    if (countCells(boardRef.current) === 0) {
      endGame('cleared');
      return;
    }

    retarget(boardRef.current);
  }, [applyWrongHit, endGame, pool, retarget, showFeedback]);

  const startShotLoop = useCallback(() => {
    if (shotLoopRef.current) clearInterval(shotLoopRef.current);
    shotLoopRef.current = setInterval(() => {
      const prev = projectileRef.current;
      if (!prev || endedRef.current) {
        if (shotLoopRef.current) {
          clearInterval(shotLoopRef.current);
          shotLoopRef.current = null;
        }
        return;
      }

      let nextX = prev.x + prev.vx;
      let nextY = prev.y + prev.vy;
      const radius = PROJECTILE_SIZE / 2;

      if (nextX <= radius) {
        nextX = radius;
        prev.vx *= -1;
      } else if (nextX >= BOARD_WIDTH - radius) {
        nextX = BOARD_WIDTH - radius;
        prev.vx *= -1;
      }

      const boardNow = boardRef.current;
      for (let r = 0; r < boardNow.length; r += 1) {
        for (let c = 0; c < boardNow[r].length; c += 1) {
          const cell = boardNow[r][c];
          if (!cell) continue;
          const center = getBubbleCenter(r, c);
          const dist = Math.hypot(nextX - center.x, nextY - center.y);
          if (dist <= (BUBBLE_SIZE / 2) * 1.05) {
            resolveCollision(cell, r, c);
            if (shotLoopRef.current) {
              clearInterval(shotLoopRef.current);
              shotLoopRef.current = null;
            }
            return;
          }
        }
      }

      if (nextY <= TOP_PADDING + BUBBLE_SIZE / 2) {
        setProjectile(null);
        projectileRef.current = null;
        applyWrongHit('Too high');
        if (shotLoopRef.current) {
          clearInterval(shotLoopRef.current);
          shotLoopRef.current = null;
        }
        return;
      }

      if (Date.now() - prev.startedAt > 9000) {
        setProjectile(null);
        projectileRef.current = null;
        applyWrongHit('Miss');
        if (shotLoopRef.current) {
          clearInterval(shotLoopRef.current);
          shotLoopRef.current = null;
        }
        return;
      }

      const updated = { ...prev, x: nextX, y: nextY };
      projectileRef.current = updated;
      setProjectile(updated);
    }, 16);
  }, [applyWrongHit, getBubbleCenter, resolveCollision]);

  const fireProjectile = useCallback(() => {
    if (endedRef.current || projectileRef.current || !targetRef.current) return;
    const angle = clampAngle(aimAngle);
    const shot = {
      x: launcherCenterX,
      y: launcherCenterY,
      vx: Math.cos(angle) * PROJECTILE_SPEED,
      vy: Math.sin(angle) * PROJECTILE_SPEED,
      startedAt: Date.now(),
    };
    projectileRef.current = shot;
    setProjectile(shot);
    startShotLoop();
  }, [aimAngle, launcherCenterX, launcherCenterY, startShotLoop]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      if (!audioUnlocked) {
        setAudioUnlocked(true);
      }
      if (targetRef.current) playTargetSound(targetRef.current);
    },
    onPanResponderMove: (_, gestureState) => {
      const angle = clampAngle(Math.atan2(gestureState.dy || -20, gestureState.dx || 0));
      setAimAngle(angle);
    },
    onPanResponderRelease: () => {
      fireProjectile();
    },
    onPanResponderTerminate: () => {
      fireProjectile();
    },
  }), [audioUnlocked, fireProjectile, playTargetSound]);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.warn('BubbleShooter mobile: audio mode setup failed.', error?.message);
      }

      await buildLetterAudioMap();
      if (!mounted) return;

      const initialBoard = createBoard(pool, levelConfig.rows);
      boardRef.current = initialBoard;
      setBoard(initialBoard);
      setScore(0);
      setLives(levelConfig.lives);
      setTimeLeft(GAME_TIME_SEC);
      setFeedback('');
      setAimAngle(-Math.PI / 2);
      setProjectile(null);

      scoreRef.current = 0;
      livesRef.current = levelConfig.lives;
      correctHitsRef.current = 0;
      wrongHitsRef.current = 0;
      endedRef.current = false;
      projectileRef.current = null;

      retarget(initialBoard);

      gameTimerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame('time');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      repeatTimerRef.current = setInterval(() => {
        if (endedRef.current) return;
        if (targetRef.current) playTargetSound(targetRef.current);
      }, AUDIO_REPEAT_INTERVAL_MS);

      changeTimerRef.current = setInterval(() => {
        if (endedRef.current) return;
        retarget(boardRef.current);
      }, LETTER_CHANGE_INTERVAL_MS);
    };

    initialize();

    return () => {
      mounted = false;
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (repeatTimerRef.current) clearInterval(repeatTimerRef.current);
      if (changeTimerRef.current) clearInterval(changeTimerRef.current);
      if (shotLoopRef.current) clearInterval(shotLoopRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      stopSound();
    };
  }, [buildLetterAudioMap, endGame, levelConfig.lives, levelConfig.rows, playTargetSound, pool, retarget, stopSound]);

  const aimLength = 78;
  const aimX2 = launcherCenterX + Math.cos(aimAngle) * aimLength;
  const aimY2 = launcherCenterY + Math.sin(aimAngle) * aimLength;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('BubbleShooterSelection', { language })}>
          <Text style={styles.backText}>← Levels</Text>
        </TouchableOpacity>
        <View style={styles.hudRow}>
          <Text style={styles.hudChip}>Score {score}</Text>
          <Text style={styles.hudChip}>Time {timeLeft}s</Text>
          {!levelConfig.scoreOnly && <Text style={styles.hudChip}>Lives {lives}</Text>}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Drag to aim, release to shoot</Text>
        <Text style={styles.infoText}>Target changes every 10s. Sound repeats every 3s.</Text>
        <Text style={styles.infoText}>Scoring: +10 correct, -5 wrong.</Text>
        {!audioUnlocked && Platform.OS === 'web' ? (
          <Text style={styles.infoWarn}>Web audio: drag once to enable sound playback.</Text>
        ) : null}
      </View>

      {!!feedback && <Text style={styles.feedback}>{feedback}</Text>}

      <View style={styles.board} {...panResponder.panHandlers}>
        {board.map((row, r) => row.map((cell, c) => {
          if (!cell) return null;
          const center = getBubbleCenter(r, c);
          const exposed = isExposed(board, r, c);
          return (
            <View
              key={cell.id}
              style={[
                styles.bubble,
                {
                  width: BUBBLE_SIZE,
                  height: BUBBLE_SIZE,
                  left: center.x - BUBBLE_SIZE / 2,
                  top: center.y - BUBBLE_SIZE / 2,
                  opacity: exposed ? 1 : 0.45,
                },
              ]}
            >
              <Text style={styles.bubbleText}>{cell.symbol}</Text>
            </View>
          );
        }))}

        <View
          style={[
            styles.aimLine,
            {
              left: launcherCenterX,
              top: launcherCenterY,
              width: aimLength,
              transform: [{ rotate: `${(aimAngle * 180) / Math.PI}deg` }],
            },
          ]}
        />

        {projectile && (
          <View
            style={[
              styles.projectile,
              {
                width: PROJECTILE_SIZE,
                height: PROJECTILE_SIZE,
                left: projectile.x - PROJECTILE_SIZE / 2,
                top: projectile.y - PROJECTILE_SIZE / 2,
              },
            ]}
          >
            <Text style={styles.projectileText}>◉</Text>
          </View>
        )}

        <View style={[styles.launcher, { left: launcherCenterX - PROJECTILE_SIZE / 2, top: launcherCenterY - PROJECTILE_SIZE / 2, width: PROJECTILE_SIZE, height: PROJECTILE_SIZE }]}>
          <Text style={styles.projectileText}>◉</Text>
        </View>

        <View style={styles.dragHintWrap}>
          <Text style={styles.dragHint}>Drag and release anywhere on board</Text>
        </View>
      </View>

      <Text style={styles.footer}>Only outer-layer bubbles are valid targets. Use sound to match letters.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A', padding: 12 },
  header: { marginTop: 18, marginBottom: 10 },
  backBtn: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 10 },
  backText: { color: '#fff', fontWeight: '700' },
  hudRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  hudChip: { color: '#fff', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, fontWeight: '700' },

  infoCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12, marginBottom: 8 },
  infoTitle: { color: '#38BDF8', fontWeight: '800', marginBottom: 4 },
  infoText: { color: '#e2e8f0', fontSize: 12 },
  infoWarn: { color: '#FDE68A', fontSize: 12, marginTop: 6, fontWeight: '700' },

  feedback: { color: '#FFD166', fontWeight: '800', textAlign: 'center', marginBottom: 8 },

  board: {
    width: BOARD_WIDTH,
    height: BOARD_HEIGHT,
    alignSelf: 'center',
    backgroundColor: '#123a66',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#4FC3F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  bubbleText: { color: '#08233e', fontWeight: '800', fontSize: 17 },

  aimLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
    transformOrigin: 'left center',
  },

  projectile: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#8ddcff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  projectileText: { color: '#05324b', fontSize: 14, fontWeight: '800' },

  launcher: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#8ddcff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  dragHintWrap: {
    position: 'absolute',
    bottom: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dragHint: {
    color: '#dbeafe',
    fontSize: 11,
    backgroundColor: 'rgba(0,0,0,0.24)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  footer: { color: '#94a3b8', textAlign: 'center', marginTop: 10, fontSize: 12 },
});
