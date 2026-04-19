import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, PanResponder } from 'react-native';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOARD_WIDTH = SCREEN_WIDTH - 24;
const BOARD_HEIGHT = Math.min(700, SCREEN_HEIGHT - 180);
const GAME_TIME = 60;
const CORRECT_HIT_POINTS = 10;
const WRONG_HIT_POINTS = -5;
const BASKET_BLOCK_HEIGHT = 190;

const CATEGORY_META = {
  fruits: { label: 'Fruits', emoji: '🍎', color: '#F97316' },
  animals: { label: 'Animals', emoji: '🐘', color: '#22C55E' },
  pets: { label: 'Pets', emoji: '🐶', color: '#38BDF8' },
  vegetables: { label: 'Vegetables', emoji: '🥕', color: '#A3E635' },
  birds: { label: 'Birds', emoji: '🕊️', color: '#F59E0B' },
  vehicles: { label: 'Vehicles', emoji: '🚗', color: '#FB7185' },
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

function layoutWords(items) {
  const width = 128;
  const height = 48;
  const leftMin = 24 + width / 2;
  const leftMax = BOARD_WIDTH - 24 - width / 2;
  const topMin = 56 + height / 2;
  const topMax = Math.max(topMin + 20, BOARD_HEIGHT - BASKET_BLOCK_HEIGHT - height / 2);
  const placed = [];

  return shuffle(items).map((item) => {
    let x = leftMin;
    let y = topMin;

    for (let attempt = 0; attempt < 60; attempt += 1) {
      const nextX = leftMin + Math.random() * Math.max(1, leftMax - leftMin);
      const nextY = topMin + Math.random() * Math.max(1, topMax - topMin);
      const overlaps = placed.some((slot) => Math.hypot(slot.x - nextX, slot.y - nextY) < 60);
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

    return { ...item, x, y, homeX: x, homeY: y, width, height };
  });
}

function WordCard({ item, activeId, onDragStart, onDragMove, onDragEnd }) {
  const meta = CATEGORY_META[item.category] || { color: '#60A5FA' };

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (event) => {
      onDragStart(
        item.id,
        event.nativeEvent.pageX,
        event.nativeEvent.pageY,
        event.nativeEvent.locationX,
        event.nativeEvent.locationY
      );
    },
    onPanResponderMove: (event) => {
      onDragMove(item.id, event.nativeEvent.pageX, event.nativeEvent.pageY);
    },
    onPanResponderRelease: (event) => {
      onDragEnd(item.id, event.nativeEvent.pageX, event.nativeEvent.pageY);
    },
    onPanResponderTerminate: (event) => {
      onDragEnd(item.id, event.nativeEvent.pageX, event.nativeEvent.pageY);
    },
  }), [item.id, onDragStart, onDragEnd, onDragMove]);

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.wordCard,
        {
          left: item.x - item.width / 2,
          top: item.y - item.height / 2,
          width: item.width,
          height: item.height,
          borderColor: meta.color,
          zIndex: activeId === item.id ? 10 : 2,
          transform: [{ scale: activeId === item.id ? 1.04 : 1 }],
        },
      ]}
    >
      <Text style={styles.wordEmoji}>{item.emoji || '🔤'}</Text>
      <Text style={styles.wordText}>{item.word}</Text>
    </View>
  );
}

export default function WordSortingBasketGame({ navigation, route }) {
  const language = route.params?.language || 'hindi';
  const level = String(route.params?.level || '1');

  const levelConfig = useMemo(() => {
    if (level === '2') return { baskets: 5, wordsPerCategory: 3, label: 'Level 2', subtitle: 'More baskets' };
    if (level === '3') return { baskets: 6, wordsPerCategory: 4, label: 'Level 3', subtitle: 'Full challenge' };
    return { baskets: 4, wordsPerCategory: 3, label: 'Level 1', subtitle: 'Warm-up sort' };
  }, [level]);
  const boardRef = useRef(null);
  const basketRefs = useRef({});
  const boardRectRef = useRef({ left: 0, top: 0, width: BOARD_WIDTH, height: BOARD_HEIGHT });
  const draggingRef = useRef(null);
  const timerRef = useRef(null);
  const endedRef = useRef(false);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [words, setWords] = useState([]);
  const [basketCategories, setBasketCategories] = useState([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [feedback, setFeedback] = useState('');
  const [activeId, setActiveId] = useState(null);

  const totalWords = words.length;

  const measureBoard = useCallback(() => {
    if (!boardRef.current?.measureInWindow) return;
    boardRef.current.measureInWindow((left, top, width, height) => {
      boardRectRef.current = { left, top, width, height };
    });
  }, []);

  const showFeedback = useCallback((text) => {
    setFeedback(text);
    setTimeout(() => setFeedback(''), 650);
  }, []);

  const finishGame = useCallback((reason) => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    navigation.replace('Results', {
      score: scoreRef.current,
      correctAnswers: correctRef.current,
      totalQuestions: totalWords || (correctRef.current + wrongRef.current) || 1,
      penalties: wrongRef.current,
      language,
      level: Number(level),
      difficulty: reason,
      gameType: 'word-sorting-basket',
      endReason: reason,
    });
  }, [language, level, navigation, totalWords]);

  const resetRound = useCallback(async () => {
    setLoading(true);
    setWords([]);
    setBasketCategories([]);
    setScore(0);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(GAME_TIME);
    setFeedback('');
    setActiveId(null);
    endedRef.current = false;
    draggingRef.current = null;
    scoreRef.current = 0;
    correctRef.current = 0;
    wrongRef.current = 0;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/word-sorting-basket/words?language=${language}`, { timeout: API_TIMEOUT });
      const source = Array.isArray(response.data) ? response.data : [];
      const activeCategories = pickActiveCategories(source).slice(0, levelConfig.baskets);
      const selected = activeCategories.flatMap((category) => (
        shuffle(source.filter((item) => item.category === category)).slice(0, levelConfig.wordsPerCategory)
      ));
      const normalized = normalizeWordItems(selected);
      setBasketCategories(activeCategories);
      setWords(layoutWords(normalized));
    } catch (error) {
      console.log('WordSortingBasket mobile load failed:', error?.message);
      showFeedback('Unable to load words');
    } finally {
      setLoading(false);
    }
  }, [language, levelConfig.baskets, levelConfig.wordsPerCategory, showFeedback]);

  useEffect(() => {
    measureBoard();
    const onResize = () => measureBoard();
    const subscription = Dimensions.addEventListener?.('change', onResize);
    return () => subscription?.remove?.();
  }, [measureBoard]);

  useEffect(() => {
    resetRound();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetRound]);

  useEffect(() => {
    if (endedRef.current) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishGame('time');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [finishGame]);

  const getBasketRect = useCallback((category) => new Promise((resolve) => {
    const ref = basketRefs.current[category];
    if (!ref?.measureInWindow) {
      resolve(null);
      return;
    }
    ref.measureInWindow((left, top, width, height) => {
      resolve({ left, top, right: left + width, bottom: top + height });
    });
  }), []);

  const updateDraggingWord = useCallback((wordId, pageX, pageY) => {
    const drag = draggingRef.current;
    if (!drag || drag.id !== wordId) return;
    const nextX = pageX - boardRectRef.current.left - drag.offsetX;
    const nextY = pageY - boardRectRef.current.top - drag.offsetY;
    setWords((currentWords) => currentWords.map((item) => (
      item.id === wordId ? { ...item, x: nextX + item.width / 2, y: nextY + item.height / 2 } : item
    )));
  }, []);

  const handleDragStart = useCallback((wordId, pageX, pageY, touchOffsetX, touchOffsetY) => {
    measureBoard();
    draggingRef.current = {
      id: wordId,
      offsetX: touchOffsetX,
      offsetY: touchOffsetY,
    };
    setActiveId(wordId);
  }, [measureBoard]);

  const handleDragEnd = useCallback(async (wordId, pageX, pageY) => {
    const drag = draggingRef.current;
    draggingRef.current = null;
    setActiveId(null);
    if (!drag) return;

    const currentWord = words.find((item) => item.id === wordId);
    if (!currentWord) return;

    let basketHit = null;
    for (const category of basketCategories) {
      const rect = await getBasketRect(category);
      if (rect && pageX >= rect.left && pageX <= rect.right && pageY >= rect.top && pageY <= rect.bottom) {
        basketHit = category;
        break;
      }
    }

    if (basketHit === currentWord.category) {
      const nextScore = scoreRef.current + CORRECT_HIT_POINTS;
      scoreRef.current = nextScore;
      correctRef.current += 1;
      setScore(nextScore);
      setCorrectCount(correctRef.current);
      showFeedback(`+${CORRECT_HIT_POINTS}`);

      let shouldFinish = false;
      setWords((currentWords) => {
        const nextWords = currentWords.filter((item) => item.id !== wordId);
        shouldFinish = nextWords.length === 0;
        return nextWords;
      });
      if (shouldFinish) {
        finishGame('cleared');
      }
      return;
    }

    if (basketHit) {
      const nextScore = scoreRef.current + WRONG_HIT_POINTS;
      scoreRef.current = nextScore;
      wrongRef.current += 1;
      setScore(nextScore);
      setWrongCount(wrongRef.current);
      showFeedback('Wrong basket (-5)');
    }

    setWords((currentWords) => currentWords.map((item) => (
      item.id === wordId ? { ...item, x: item.homeX, y: item.homeY } : item
    )));
  }, [basketCategories, finishGame, getBasketRect, showFeedback, words]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('WordSortingBasketSelection', { language })}>
          <Text style={styles.backText}>← Rules</Text>
        </TouchableOpacity>
        <View style={styles.hudRow}>
          <Text style={styles.hudChip}>Score {score}</Text>
          <Text style={styles.hudChip}>Time {timeLeft}s</Text>
          <Text style={styles.hudChip}>Left {words.length}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>{language === 'hindi' ? 'Hindi' : 'Telugu'} Word Sorting Basket</Text>
        <Text style={styles.infoText}>{levelConfig.label}: {levelConfig.subtitle}</Text>
        <Text style={styles.infoText}>Drag a word to the correct category. Right basket removes it and adds points. Wrong basket sends it back.</Text>
      </View>

      {!!feedback && <Text style={styles.feedback}>{feedback}</Text>}

      <View ref={boardRef} style={styles.board}>
        {words.map((item) => (
          <WordCard
            key={item.id}
            item={item}
            activeId={activeId}
            onDragStart={handleDragStart}
            onDragMove={updateDraggingWord}
            onDragEnd={handleDragEnd}
          />
        ))}

        <View style={styles.basketWrap}>
          {basketCategories.map((category) => {
            const meta = CATEGORY_META[category] || { label: category, emoji: '🧺', color: '#60A5FA' };
            return (
              <View
                key={category}
                ref={(node) => { basketRefs.current[category] = node; }}
                style={styles.basket}
              >
                <View style={[styles.binLid, { backgroundColor: meta.color }]} />
                <View style={[styles.binBody, { borderColor: '#0b2550', backgroundColor: meta.color }]}>
                  <View style={styles.binHandle} />
                  <View style={styles.binSlots}>
                    <View style={styles.binSlot} />
                    <View style={styles.binSlot} />
                    <View style={styles.binSlot} />
                  </View>
                  <View style={styles.binLabelWrap}>
                    <Text style={styles.binEmoji}>{meta.emoji}</Text>
                    <Text style={styles.binLabel}>{meta.label}</Text>
                  </View>
                </View>
                <Text style={styles.binHint}>Drop here</Text>
              </View>
            );
          })}
        </View>

        {loading ? <Text style={styles.loadingText}>Loading words...</Text> : null}
      </View>

      <Text style={styles.footer}>{levelConfig.baskets} baskets active. Level {level} uses {levelConfig.wordsPerCategory} words per category.</Text>
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
  infoTitle: { color: '#FBBF24', fontWeight: '800', marginBottom: 4 },
  infoText: { color: '#e2e8f0', fontSize: 12 },

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
  wordCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 2,
    paddingHorizontal: 10,
  },
  wordEmoji: { fontSize: 16 },
  wordText: { color: '#08233e', fontWeight: '800', fontSize: 15 },

  basketWrap: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  basket: {
    width: (BOARD_WIDTH - 30) / 2,
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  binLid: {
    width: 78,
    height: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(5,20,56,0.45)',
  },
  binBody: {
    width: 66,
    height: 90,
    marginTop: -2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  binHandle: {
    position: 'absolute',
    top: -13,
    width: 30,
    height: 12,
    borderWidth: 3,
    borderBottomWidth: 0,
    borderColor: 'rgba(5,20,56,0.65)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  binSlots: {
    position: 'absolute',
    top: 22,
    flexDirection: 'row',
    gap: 8,
  },
  binSlot: {
    width: 4,
    height: 24,
    borderRadius: 99,
    backgroundColor: 'rgba(5,20,56,0.55)',
  },
  binLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(8,24,66,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(5,20,56,0.3)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  binEmoji: { fontSize: 10 },
  binLabel: { color: '#04213f', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  binHint: { color: '#dbeafe', fontSize: 11, fontWeight: '700', marginTop: 6 },

  loadingText: { position: 'absolute', top: 14, alignSelf: 'center', color: '#FBBF24', fontWeight: '800' },
  footer: { color: '#94a3b8', textAlign: 'center', marginTop: 10, fontSize: 12 },
});