import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PanResponder,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Animated,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const BOARD_W = SCREEN_W - 24;
const BOARD_H = Math.min(SCREEN_H * 0.46, 340);
const WORD_H = 46;
const WORD_W_BASE = 100; // min width per word

const CORRECT_PTS = 10;
const WRONG_PTS = -5;
const TOTAL = 5;

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function layoutWords(wordTexts, boardW, boardH) {
  const shuffled = shuffleArr(wordTexts);
  const placed = [];
  const pad = 12;

  return shuffled.map((text, idx) => {
    const ww = Math.max(WORD_W_BASE, text.length * 16 + 28);
    let x, y, tries = 0;
    do {
      x = pad + Math.random() * Math.max(1, boardW - ww - pad * 2);
      y = pad + Math.random() * Math.max(1, boardH - WORD_H - pad * 2);
      tries++;
    } while (
      tries < 40 &&
      placed.some(p => Math.abs(p.x - x) < ww + 8 && Math.abs(p.y - y) < WORD_H + 6)
    );
    placed.push({ x, y });
    return { id: idx, text, x, y, width: ww };
  });
}

// ---- Single Word Bubble using PanResponder ----
function WordBubble({ item, isLocked, boardOffsetRef, onMoveWord }) {
  const pan = useRef(new Animated.ValueXY({ x: item.x, y: item.y })).current;
  const isDragging = useRef(false);

  // Sync position when item changes (new sentence)
  useEffect(() => {
    pan.setValue({ x: item.x, y: item.y });
  }, [item.id, item.x, item.y]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !isLocked,
    onMoveShouldSetPanResponder: () => !isLocked,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => {
      isDragging.current = true;
      pan.setOffset({ x: pan.x._value, y: pan.y._value });
      pan.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      isDragging.current = false;
      pan.flattenOffset();
      // Clamp to board bounds
      const rawX = pan.x._value;
      const rawY = pan.y._value;
      const clampedX = Math.max(0, Math.min(rawX, BOARD_W - item.width));
      const clampedY = Math.max(0, Math.min(rawY, BOARD_H - WORD_H));
      pan.setValue({ x: clampedX, y: clampedY });
      onMoveWord(item.id, clampedX, clampedY);
    },
    onPanResponderTerminate: () => {
      isDragging.current = false;
      pan.flattenOffset();
    },
  }), [isLocked, item.id, item.width, onMoveWord]);

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.wordBubble,
        isLocked && styles.wordBubbleLocked,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          width: item.width,
          zIndex: 10,
        },
      ]}
    >
      <Text style={styles.wordText}>{item.text}</Text>
    </Animated.View>
  );
}

// ---- Main Game Screen ----
export default function WordJumbleGame({ navigation, route }) {
  const language = route.params?.language || 'hindi';
  const level = route.params?.level || 1;

  const [gameData, setGameData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [words, setWords] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null); // { correct, message }
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [scoreHistory, setScoreHistory] = useState([]);
  const boardOffsetRef = useRef({ x: 0, y: 0 });

  const t = (hi, te, en) =>
    language === 'hindi' ? hi : language === 'telugu' ? te : en;

  // Fetch data
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/word-jumble/play`, {
          params: { language, level },
          timeout: API_TIMEOUT,
        });
        setGameData(res.data);
      } catch (err) {
        setFeedback({ correct: false, message: 'Failed to load. Check server.' });
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [language, level]);

  useEffect(() => {
    if (gameData?.sentences?.length && !loading) {
      initSentence(gameData.sentences[0]);
    }
  }, [gameData, loading]);

  const initSentence = useCallback((sentence) => {
    const wordTexts = sentence.originalSentence.split(' ');
    const laid = layoutWords(wordTexts, BOARD_W, BOARD_H);
    setWords(laid);
    setFeedback(null);
  }, []);

  // Called from WordBubble when drag ends
  const handleMoveWord = useCallback((id, x, y) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  }, []);

  const checkAnswer = () => {
    if (feedback?.correct) return;
    const sentence = gameData.sentences[currentIdx];
    const correct = sentence.originalSentence;
    // Sort by x position → determine order
    const sorted = [...words].sort((a, b) => a.x - b.x);
    const userAnswer = sorted.map(w => w.text).join(' ');
    const isCorrect = userAnswer === correct;

    const newScore = isCorrect
      ? score + CORRECT_PTS
      : Math.max(0, score + WRONG_PTS);
    setScore(newScore);
    setScoreHistory(prev => [...prev, { correct: isCorrect, pts: isCorrect ? CORRECT_PTS : WRONG_PTS }]);
    setFeedback({
      correct: isCorrect,
      message: isCorrect
        ? t('✅ बहुत अच्छे!', '✅ చాలా బాగుంది!', '✅ Correct!')
        : t(`❌ गलत! सही: ${correct}`, `❌ తప్పు! సరైన: ${correct}`, `❌ Wrong! Correct: ${correct}`)
    });

    if (isCorrect) {
      setTimeout(() => advance(newScore), 1400);
    }
  };

  const advance = useCallback((currentScore) => {
    const nextIdx = currentIdx + 1;
    if (nextIdx < gameData.sentences.length) {
      setCurrentIdx(nextIdx);
      initSentence(gameData.sentences[nextIdx]);
    } else {
      setFinished(true);
    }
  }, [currentIdx, gameData, initSentence]);

  const handleNext = () => {
    const nextIdx = currentIdx + 1;
    if (gameData && nextIdx < gameData.sentences.length) {
      setCurrentIdx(nextIdx);
      initSentence(gameData.sentences[nextIdx]);
    } else {
      setFinished(true);
    }
  };

  const handleReset = () => {
    if (gameData?.sentences?.[currentIdx]) {
      initSentence(gameData.sentences[currentIdx]);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setScore(0);
    setFinished(false);
    setScoreHistory([]);
    if (gameData?.sentences?.[0]) {
      initSentence(gameData.sentences[0]);
    }
  };

  // ---- Loading ----
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#818cf8" />
        <Text style={styles.loadingText}>{t('लोड हो रहा है...', 'లోడ అవుతోంది...', 'Loading...')}</Text>
      </View>
    );
  }

  // ---- Finished ----
  if (finished) {
    const maxScore = TOTAL * CORRECT_PTS;
    const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const msg = pct >= 80
      ? t('🌟 शानदार!', '🌟 అద్భుతం!', '🌟 Awesome!')
      : pct >= 50
      ? t('👍 अच्छा!', '👍 బాగుంది!', '👍 Good job!')
      : t('💪 फिर कोशिश करो!', '💪 మళ్లీ ప్రయత్నించు!', '💪 Try Again!');

    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.finishCard}>
          <Text style={styles.finishEmoji}>🎉</Text>
          <Text style={styles.finishTitle}>{t('खेल पूरा!', 'గేమ్ పూర్తి!', 'Game Complete!')}</Text>

          {/* Score ring (SVG-free approach) */}
          <View style={styles.ringWrap}>
            <View style={styles.ring}>
              <Text style={styles.ringScore}>{score}</Text>
              <Text style={styles.ringMax}>/ {maxScore}</Text>
            </View>
          </View>

          <Text style={styles.finishMsg}>{msg}</Text>

          {/* Per-sentence breakdown */}
          <View style={styles.historyWrap}>
            {scoreHistory.map((h, i) => (
              <View key={i} style={[styles.histItem, h.correct ? styles.histCorrect : styles.histWrong]}>
                <Text style={styles.histLabel}>{t(`वाक्य ${i+1}`, `వాక్యం ${i+1}`, `Sentence ${i+1}`)}</Text>
                <Text style={styles.histPts}>{h.correct ? `+${h.pts}` : `${h.pts}`}</Text>
              </View>
            ))}
          </View>

          <View style={styles.finishBtns}>
            <TouchableOpacity style={[styles.finBtn, styles.finBtnPlay]} onPress={handleRestart}>
              <Text style={styles.finBtnText}>🔄 {t('फिर खेलें', 'మళ్లీ ఆడు', 'Play Again')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.finBtn, styles.finBtnHome]} onPress={() => navigation.goBack()}>
              <Text style={styles.finBtnText}>🏠 {t('होम', 'హోమ్', 'Home')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const progress = currentIdx / TOTAL;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0c29" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← {t('वापस', 'వెనక్కి', 'Back')}</Text>
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.headerTitle}>🌊 {t('शब्द जोड़ो', 'పదజాల', 'Word Jumble')}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Level {level}</Text>
          </View>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreEmoji}>⭐</Text>
          <Text style={styles.scoreVal}>{score}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentIdx + 1} / {TOTAL}</Text>
      </View>

      {/* Instruction */}
      <Text style={styles.instruction}>
        {t(
          '👆 शब्दों को बाएं→दाएं सही क्रम में रखें, फिर OK दबाएं',
          '👆 పదాలను ఎడమ→కుడికి సరైన క్రమంలో లాగండి, తర్వాత OK',
          '👆 Drag words left → right in order, then press OK'
        )}
      </Text>

      {/* Feedback */}
      {feedback && (
        <View style={[styles.feedbackBar, feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackText} numberOfLines={2}>{feedback.message}</Text>
          {!feedback.correct && (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>{t('अगला →', 'తర్వాత →', 'Next →')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Board */}
      <View
        style={styles.board}
        onLayout={(e) => {
          const { x, y } = e.nativeEvent.layout;
          boardOffsetRef.current = { x, y };
        }}
      >
        {/* Order guide */}
        <View style={styles.orderGuide}>
          <Text style={styles.orderGuideText}>← {t('पहला', 'మొదటి', 'First')}</Text>
          <View style={styles.orderLine} />
          <Text style={styles.orderGuideText}>{t('आखिरी', 'చివరిది', 'Last')} →</Text>
        </View>

        {/* Floating word bubbles */}
        {words.map((word) => (
          <WordBubble
            key={`${currentIdx}-${word.id}`}
            item={word}
            isLocked={!!feedback?.correct}
            boardOffsetRef={boardOffsetRef}
            onMoveWord={handleMoveWord}
          />
        ))}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.ctrlBtn, styles.ctrlReset]}
          onPress={handleReset}
          disabled={!!feedback?.correct}
        >
          <Text style={styles.ctrlBtnText}>🔄 {t('रीसेट', 'రీసెట్', 'Reset')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ctrlBtn, styles.ctrlOk, feedback?.correct && styles.ctrlDisabled]}
          onPress={checkAnswer}
          disabled={!!feedback?.correct}
        >
          <Text style={styles.ctrlBtnText}>✅ OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0c29' },
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.7)', marginTop: 16, fontSize: 16 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingTop: 48, paddingBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  backText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  titleWrap: { alignItems: 'center', gap: 4 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '900' },
  levelBadge: { backgroundColor: 'rgba(129,140,248,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 2 },
  levelBadgeText: { color: '#a5b4fc', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, gap: 4 },
  scoreEmoji: { fontSize: 16 },
  scoreVal: { color: '#6ee7b7', fontSize: 20, fontWeight: '900' },

  // Progress
  progressWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 10, gap: 10 },
  progressBar: { flex: 1, height: 7, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#818cf8', borderRadius: 10 },
  progressText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '700' },

  // Instruction
  instruction: {
    color: 'rgba(255,255,255,0.55)', textAlign: 'center', fontSize: 12,
    paddingHorizontal: 14, paddingTop: 6, paddingBottom: 2, fontWeight: '600',
  },

  // Feedback
  feedbackBar: {
    marginHorizontal: 12, marginTop: 6, borderRadius: 12,
    padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
  },
  feedbackCorrect: { backgroundColor: 'rgba(16,185,129,0.2)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.4)' },
  feedbackWrong: { backgroundColor: 'rgba(239,68,68,0.18)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.35)' },
  feedbackText: { color: '#fff', fontWeight: '700', fontSize: 13, flex: 1 },
  nextBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7 },
  nextBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  // Board
  board: {
    width: BOARD_W, height: BOARD_H,
    alignSelf: 'center', marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16, borderWidth: 2, borderStyle: 'dashed',
    borderColor: 'rgba(129,140,248,0.3)',
    overflow: 'hidden',
    position: 'relative',
  },
  orderGuide: {
    position: 'absolute', bottom: 8, left: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    pointerEvents: 'none',
  },
  orderGuideText: { color: 'rgba(255,255,255,0.18)', fontSize: 10, fontWeight: '700' },
  orderLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },

  // Word Bubble
  wordBubble: {
    position: 'absolute',
    height: WORD_H,
    borderRadius: 30,
    backgroundColor: 'rgba(99,102,241,0.22)',
    borderWidth: 2, borderColor: 'rgba(129,140,248,0.55)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 14,
  },
  wordBubbleLocked: {
    borderColor: 'rgba(52,211,153,0.7)',
    backgroundColor: 'rgba(16,185,129,0.22)',
  },
  wordText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Controls
  controls: { flexDirection: 'row', gap: 12, justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 14 },
  ctrlBtn: {
    flex: 1, paddingVertical: 15, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  ctrlReset: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  ctrlOk: { backgroundColor: '#10b981' },
  ctrlDisabled: { opacity: 0.4 },
  ctrlBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Finish screen
  finishCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 28, padding: 28,
    width: SCREEN_W - 32, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  finishEmoji: { fontSize: 52, marginBottom: 8 },
  finishTitle: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 20 },
  ringWrap: { marginBottom: 16 },
  ring: {
    width: 120, height: 120, borderRadius: 60,
    borderWidth: 6, borderColor: '#818cf8',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(129,140,248,0.1)',
  },
  ringScore: { color: '#fff', fontSize: 36, fontWeight: '900' },
  ringMax: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 },
  finishMsg: { color: '#a5b4fc', fontSize: 20, fontWeight: '800', marginBottom: 18 },
  historyWrap: { width: '100%', gap: 6, marginBottom: 22 },
  histItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  histCorrect: { backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)' },
  histWrong: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)' },
  histLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  histPts: { color: '#fff', fontSize: 14, fontWeight: '800' },
  finishBtns: { flexDirection: 'row', gap: 12 },
  finBtn: { flex: 1, paddingVertical: 14, borderRadius: 30, alignItems: 'center' },
  finBtnPlay: { backgroundColor: '#818cf8' },
  finBtnHome: { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  finBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
