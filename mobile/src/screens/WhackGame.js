import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const TOTAL_TIME   = 40;
const NUM_ROUNDS   = 5;
const ROUND_DURATION = 8000;  // 8 s per round
const TILE_OPEN_MS   = 3000;  // tiles visible for 3 s

const LANG_LOCALE_MAP = { hindi: 'hi-IN', telugu: 'te-IN' };

// ── helpers ──────────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const EMPTY_TILES = () =>
  Array(9).fill(null).map(() => ({ letter: null, state: 'closed' }));

// ─────────────────────────────────────────────────────────────────────────────

export default function WhackGame({ navigation, route }) {
  const { language, level } = route.params;

  const [game,        setGame]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [gamePhase,   setGamePhase]   = useState('loading'); // loading|countdown|playing|ended
  const [countdown,   setCountdown]   = useState(3);
  const [timeLeft,    setTimeLeft]    = useState(TOTAL_TIME);
  const [roundNumber, setRoundNumber] = useState(0);
  const [roundPhase,  setRoundPhase]  = useState('waiting'); // waiting|open|closed
  const [tiles,       setTiles]       = useState(EMPTY_TILES);
  const [score,       setScore]       = useState(0);
  const [penalties,   setPenalties]   = useState(0);
  const [feedback,    setFeedback]    = useState(null); // { text, type }

  // Refs to avoid stale closures in timers
  const scoreRef       = useRef(0);
  const penaltiesRef   = useRef(0);
  const timeLeftRef    = useRef(TOTAL_TIME);
  const tilesActiveRef = useRef(false);
  const gameEndedRef   = useRef(false);
  const gameRef        = useRef(null);
  const globalTimerRef = useRef(null);
  const roundTimers    = useRef([]);

  // ── speech ────────────────────────────────────────────────────────────────

  const speakLetter = useCallback((letter) => {
    if (!letter) return;
    Speech.stop();
    Speech.speak(letter, {
      language: LANG_LOCALE_MAP[language] || 'hi-IN',
      rate: 0.8,
      pitch: 1.0,
    });
  }, [language]);

  // ── timer helpers ─────────────────────────────────────────────────────────

  const clearAll = useCallback(() => {
    if (globalTimerRef.current) clearInterval(globalTimerRef.current);
    roundTimers.current.forEach((t) => clearTimeout(t));
    roundTimers.current = [];
  }, []);

  const addTimeout = (fn, ms) => {
    const id = setTimeout(fn, ms);
    roundTimers.current.push(id);
    return id;
  };

  // ── feedback pop ──────────────────────────────────────────────────────────

  const showFeedback = (text, type) => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 700);
  };

  // ── fetch game ────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/whack/${language}/${level}`);
        gameRef.current = res.data.game;
        setGame(res.data.game);
        setLoading(false);
        setGamePhase('countdown');
      } catch (err) {
        console.error('WhackGame load error:', err);
        navigation.navigate('WhackSelection', { language });
      }
    };
    load();
    return clearAll;
  }, []); // eslint-disable-line

  // ── countdown ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (gamePhase !== 'countdown') return;
    if (gameRef.current) {
      speakLetter(gameRef.current.gameData.targetLetter);
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

  // ── start game ────────────────────────────────────────────────────────────

  const startGame = () => {
    setGamePhase('playing');

    globalTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        timeLeftRef.current = next;
        return Math.max(next, 0);
      });
    }, 1000);

    for (let i = 0; i < NUM_ROUNDS; i++) {
      addTimeout(() => openRound(i + 1), i * ROUND_DURATION);
      addTimeout(() => closeRound(),     i * ROUND_DURATION + TILE_OPEN_MS);
    }
    addTimeout(endGame, NUM_ROUNDS * ROUND_DURATION + 200);
  };

  // ── round helpers ─────────────────────────────────────────────────────────

  const openRound = (roundNum) => {
    if (gameEndedRef.current) return;
    const g = gameRef.current;
    if (!g) return;

    setRoundNumber(roundNum);
    setRoundPhase('open');
    tilesActiveRef.current = true;

    speakLetter(g.gameData.targetLetter);

    const { targetLetter, allLetters } = g.gameData;
    const numOpen   = Math.floor(Math.random() * 6) + 4; // 4-9
    const numTarget = Math.floor(Math.random() * 3) + 1; // 1-3

    const shuffledIdx = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const openIdx     = shuffledIdx.slice(0, numOpen);
    const targetIdxSet = new Set(openIdx.slice(0, numTarget));
    const distractors  = (allLetters || []).filter((l) => l !== targetLetter);

    const newTiles = Array(9).fill(null).map((_, i) => {
      if (!openIdx.includes(i)) return { letter: null, state: 'closed' };
      if (targetIdxSet.has(i))  return { letter: targetLetter, state: 'open' };
      const distractor =
        distractors.length > 0
          ? distractors[Math.floor(Math.random() * distractors.length)]
          : '?';
      return { letter: distractor, state: 'open' };
    });

    setTiles(newTiles);
  };

  const closeRound = () => {
    if (gameEndedRef.current) return;
    tilesActiveRef.current = false;
    setRoundPhase('closed');
    setTiles(EMPTY_TILES());
  };

  // ── tap handler ───────────────────────────────────────────────────────────

  const handleTileTap = (index) => {
    if (!tilesActiveRef.current || gameEndedRef.current) return;
    const g = gameRef.current;
    if (!g) return;

    setTiles((prev) => {
      const tile = prev[index];
      if (tile.state !== 'open') return prev;

      const correct = tile.letter === g.gameData.targetLetter;

      if (correct) {
        const pts = Math.max(timeLeftRef.current, 0);
        scoreRef.current += pts;
        setScore(scoreRef.current);
        showFeedback(`+${pts}`, 'correct');
      } else {
        scoreRef.current -= 1;
        setScore(scoreRef.current);
        penaltiesRef.current += 1;
        setPenalties(penaltiesRef.current);
        showFeedback('−1 ✗', 'wrong');
      }

      return prev.map((t, i) =>
        i === index ? { ...t, state: correct ? 'correct' : 'wrong' } : t
      );
    });
  };

  // ── end game ──────────────────────────────────────────────────────────────

  const endGame = useCallback(async () => {
    if (gameEndedRef.current) return;
    gameEndedRef.current = true;
    clearAll();
    tilesActiveRef.current = false;
    setGamePhase('ended');
    setTiles(EMPTY_TILES());

    const finalScore    = scoreRef.current;
    const finalPenalties = penaltiesRef.current;

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (userId && gameRef.current) {
        await axios.post(`${API_BASE_URL}/api/whack/score`, {
          userId,
          gameId:    gameRef.current._id,
          language,
          level:     parseInt(level),
          score:     finalScore,
          penalties: finalPenalties,
          timeTaken: TOTAL_TIME,
        });
      }
    } catch (err) {
      console.error('Error saving whack score:', err);
    } finally {
      navigation.navigate('Results', {
        score:          finalScore,
        totalQuestions: NUM_ROUNDS,
        correctAnswers: Math.max(finalScore, 0),
        language,
        level,
        gameType: 'whack',
        penalties: finalPenalties,
      });
    }
  }, [clearAll, language, level, navigation]);

  const handleExit = () => {
    Alert.alert('Exit Game?', 'Your progress will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Exit',
        onPress: () => {
          clearAll();
          navigation.navigate('WhackSelection', { language });
        },
      },
    ]);
  };

  // ── tile style ────────────────────────────────────────────────────────────

  const tileStyle = (tile) => {
    switch (tile.state) {
      case 'open':    return [styles.tile, styles.tileOpen];
      case 'correct': return [styles.tile, styles.tileCorrect];
      case 'wrong':   return [styles.tile, styles.tileWrong];
      default:        return [styles.tile, styles.tileClosed];
    }
  };

  const timerColor =
    timeLeft > 20 ? '#4ECDC4' :
    timeLeft > 10 ? '#FFD700' : '#FF5252';

  // ── loading screen ────────────────────────────────────────────────────────

  if (loading || !game) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>🔨 Loading game...</Text>
      </View>
    );
  }

  // ── countdown screen ──────────────────────────────────────────────────────

  if (gamePhase === 'countdown') {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.countdownLabel}>Listen carefully!</Text>
        <TouchableOpacity
          style={styles.soundBtn}
          onPress={() => speakLetter(game.gameData.targetLetter)}
        >
          <Text style={styles.soundBtnText}>🔊</Text>
        </TouchableOpacity>
        <Text style={styles.soundHint}>Tap to hear again</Text>
        <Text style={styles.countdownNumber}>{countdown}</Text>
      </View>
    );
  }

  // ── main game ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitBtn} onPress={handleExit}>
          <Text style={styles.exitBtnText}>✕ Exit</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔨 Whack-a-Letter</Text>
        <Text style={[styles.timer, { color: timerColor }]}>⏱ {timeLeft}s</Text>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={[styles.statValue, { color: score < 0 ? '#FF5252' : '#4ECDC4' }]}>
            {score}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Round</Text>
          <Text style={styles.statValue}>{roundNumber} / {NUM_ROUNDS}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Penalties</Text>
          <Text style={[styles.statValue, { color: penalties > 0 ? '#FF5252' : '#aaa' }]}>
            {penalties}
          </Text>
        </View>
      </View>

      {/* Target audio button */}
      <View style={styles.targetRow}>
        <Text style={styles.targetLabel}>Listen & Find:</Text>
        <TouchableOpacity
          style={styles.soundBtn}
          onPress={() => speakLetter(game.gameData.targetLetter)}
        >
          <Text style={styles.soundBtnText}>🔊</Text>
        </TouchableOpacity>
      </View>

      {/* Round phase message */}
      <View style={styles.phaseRow}>
        {roundPhase === 'waiting' && <Text style={styles.phaseWaiting}>⏳ Get ready…</Text>}
        {roundPhase === 'open'    && <Text style={styles.phaseOpen}>👆 Tap the tiles!</Text>}
        {roundPhase === 'closed'  && <Text style={styles.phaseClosed}>✋ Wait for next round</Text>}
      </View>

      {/* Feedback pop */}
      {feedback && (
        <View
          style={[
            styles.feedbackPop,
            feedback.type === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong,
          ]}
        >
          <Text style={styles.feedbackText}>{feedback.text}</Text>
        </View>
      )}

      {/* 3×3 tile grid */}
      <View style={styles.grid}>
        {tiles.map((tile, i) => (
          <TouchableOpacity
            key={i}
            style={tileStyle(tile)}
            onPress={() => handleTileTap(i)}
            disabled={tile.state !== 'open'}
            activeOpacity={0.7}
          >
            {tile.state !== 'closed' && (
              <Text style={styles.tileLetter}>{tile.letter}</Text>
            )}
            {tile.state === 'correct' && <Text style={styles.tileOverlay}>✓</Text>}
            {tile.state === 'wrong'   && <Text style={styles.tileOverlay}>✗</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Round progress dots */}
      <View style={styles.dotsRow}>
        {Array(NUM_ROUNDS).fill(null).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < roundNumber
                ? styles.dotDone
                : i === roundNumber - 1
                ? styles.dotActive
                : styles.dotPending,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const TILE_SIZE = 90;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C2A',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FF8C42',
    fontSize: 18,
    marginTop: 15,
  },

  // Countdown
  countdownLabel: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 20,
  },
  soundBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  soundBtnText: {
    fontSize: 36,
  },
  soundHint: {
    fontSize: 14,
    color: '#8892b0',
    marginBottom: 30,
  },
  countdownNumber: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#FFD700',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#1a1a40',
  },
  exitBtn: {
    width: 70,
  },
  exitBtnText: {
    color: '#FF5252',
    fontSize: 15,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timer: {
    fontSize: 18,
    fontWeight: 'bold',
    width: 70,
    textAlign: 'right',
  },

  // Stats
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a40',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a60',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#8892b0',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Target
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 12,
  },
  targetLabel: {
    fontSize: 16,
    color: '#fff',
    marginRight: 10,
  },

  // Phase
  phaseRow: {
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 28,
  },
  phaseWaiting: { color: '#8892b0', fontSize: 15 },
  phaseOpen:    { color: '#FFD700', fontSize: 16, fontWeight: 'bold' },
  phaseClosed:  { color: '#4ECDC4', fontSize: 15 },

  // Feedback pop
  feedbackPop: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
  },
  feedbackCorrect: { backgroundColor: 'rgba(76,175,80,0.9)' },
  feedbackWrong:   { backgroundColor: 'rgba(244,67,54,0.9)' },
  feedbackText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignSelf: 'center',
    width: TILE_SIZE * 3 + 24,
    gap: 8,
    marginVertical: 8,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileClosed:  { backgroundColor: '#1a1a40', borderWidth: 2, borderColor: '#2a2a60' },
  tileOpen:    { backgroundColor: '#2d2d7a', borderWidth: 2, borderColor: '#4ECDC4' },
  tileCorrect: { backgroundColor: '#1b5e20', borderWidth: 2, borderColor: '#4CAF50' },
  tileWrong:   { backgroundColor: '#b71c1c', borderWidth: 2, borderColor: '#FF5252' },
  tileLetter: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  tileOverlay: {
    position: 'absolute',
    fontSize: 20,
    color: '#fff',
    bottom: 6,
    right: 8,
  },

  // Round dots
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: 5,
  },
  dotPending: { backgroundColor: '#2a2a60' },
  dotActive:  { backgroundColor: '#FF8C42' },
  dotDone:    { backgroundColor: '#4CAF50' },
});
