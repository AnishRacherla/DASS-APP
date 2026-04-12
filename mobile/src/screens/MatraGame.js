import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Dimensions, StatusBar, Animated as RNAnimated, PanResponder,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Fallback Data ──────────────────────────────────────────────
const FALLBACK_MATRAS = [
  { id: 'aa', symbol: 'ा', name: 'aa matra', vowel: 'आ' },
  { id: 'i',  symbol: 'ि', name: 'chhoti i matra', vowel: 'इ' },
  { id: 'ii', symbol: 'ी', name: 'badi ee matra', vowel: 'ई' },
  { id: 'u',  symbol: 'ु', name: 'chhota u matra', vowel: 'उ' },
  { id: 'uu', symbol: 'ू', name: 'bada oo matra', vowel: 'ऊ' },
  { id: 'e',  symbol: 'े', name: 'e matra', vowel: 'ए' },
  { id: 'ai', symbol: 'ै', name: 'ai matra', vowel: 'ऐ' },
  { id: 'o',  symbol: 'ो', name: 'o matra', vowel: 'ओ' },
  { id: 'au', symbol: 'ौ', name: 'au matra', vowel: 'औ' },
];

const FALLBACK_CONSONANTS = [
  { id: 'ka', symbol: 'क' }, { id: 'ga', symbol: 'ग' }, { id: 'ma', symbol: 'म' },
  { id: 'ra', symbol: 'र' }, { id: 'la', symbol: 'ल' }, { id: 'pa', symbol: 'प' },
  { id: 'na', symbol: 'न' }, { id: 'sa', symbol: 'स' }, { id: 'ha', symbol: 'ह' },
  { id: 'ba', symbol: 'ब' }, { id: 'sha', symbol: 'श' },
];

const FALLBACK_WORDS = [
  { combined: 'काला', meaning: 'black', emoji: '⚫', category: 'colors', keyMatra: 'aa', keyCons: 'ka' },
  { combined: 'नीला', meaning: 'blue', emoji: '🔵', category: 'colors', keyMatra: 'ii', keyCons: 'na' },
  { combined: 'गाय', meaning: 'cow', emoji: '🐄', category: 'animals', keyMatra: 'aa', keyCons: 'ga' },
  { combined: 'शेर', meaning: 'lion', emoji: '🦁', category: 'animals', keyMatra: 'e', keyCons: 'sha' },
  { combined: 'हाथ', meaning: 'hand', emoji: '🤚', category: 'body', keyMatra: 'aa', keyCons: 'ha' },
  { combined: 'सेब', meaning: 'apple', emoji: '🍎', category: 'fruits', keyMatra: 'e', keyCons: 'sa' },
  { combined: 'केला', meaning: 'banana', emoji: '🍌', category: 'fruits', keyMatra: 'e', keyCons: 'ka' },
  { combined: 'लाल', meaning: 'red', emoji: '🔴', category: 'colors', keyMatra: 'aa', keyCons: 'la' },
  { combined: 'नाक', meaning: 'nose', emoji: '👃', category: 'body', keyMatra: 'aa', keyCons: 'na' },
  { combined: 'किताब', meaning: 'book', emoji: '📚', category: 'objects', keyMatra: 'i', keyCons: 'ka' },
];

const LEVEL_COLORS = ['#f43f5e', '#8b5cf6', '#3b82f6', '#f59e0b', '#10b981'];
const LEVEL_EMOJIS = ['📝', '👆', '🎯', '🧩', '⚡'];

const CATEGORY_MAP = {
  animals: { name: 'जानवर', emoji: '🐶', nameEn: 'Animals' },
  fruits:  { name: 'फल',   emoji: '🍎', nameEn: 'Fruits' },
  colors:  { name: 'रंग',   emoji: '🎨', nameEn: 'Colors' },
  body:    { name: 'शरीर',  emoji: '🧍', nameEn: 'Body Parts' },
  objects: { name: 'वस्तुएं', emoji: '🏠', nameEn: 'Objects' },
  nature:  { name: 'प्रकृति', emoji: '🌿', nameEn: 'Nature' },
  food:    { name: 'खाना',   emoji: '🍽️', nameEn: 'Food' },
  family:  { name: 'परिवार', emoji: '👨‍👩‍👧‍👦', nameEn: 'Family' },
  words:   { name: 'शब्द',   emoji: '📝', nameEn: 'Words' },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speakHindi(text) {
  Speech.speak(text, { language: 'hi-IN', rate: 0.85, pitch: 1.1 });
}

const DEFAULT_LEVELS = [
  { level: 1, name: 'Learn the Matras', nameHindi: 'मात्राएँ सीखें', mode: 'learn', matras: ['aa','i','ii','u','uu'], wordsPerRound: 8, pointsPerCorrect: 10, starsThreshold: [50,70,90], timeLimit: 0 },
  { level: 2, name: 'Tap & Match', nameHindi: 'टैप और मिलाओ', mode: 'tap', matras: ['aa','i','ii','u','uu'], wordsPerRound: 10, pointsPerCorrect: 15, starsThreshold: [80,120,150], timeLimit: 0 },
  { level: 3, name: 'Drag & Drop', nameHindi: 'खींचो और छोड़ो', mode: 'drag', matras: ['aa','i','ii','u','uu','e','ai','o','au'], wordsPerRound: 10, pointsPerCorrect: 20, starsThreshold: [120,160,200], timeLimit: 0 },
  { level: 4, name: 'Word Scramble', nameHindi: 'शब्द पहेली', mode: 'scramble', matras: ['aa','i','ii','u','uu','e','ai','o','au'], wordsPerRound: 10, pointsPerCorrect: 25, starsThreshold: [150,200,250], timeLimit: 0 },
  { level: 5, name: 'Speed Challenge', nameHindi: 'स्पीड चैलेंज', mode: 'speed', matras: ['aa','i','ii','u','uu','e','ai','o','au'], wordsPerRound: 15, pointsPerCorrect: 30, starsThreshold: [200,350,450], timeLimit: 90 },
];

// ═══════════════════════════════════════════════════════════════
// MatraGame Mobile Screen
// ═══════════════════════════════════════════════════════════════
export default function MatraGame({ navigation }) {
  const [matras, setMatras] = useState(FALLBACK_MATRAS);
  const [consonants, setConsonants] = useState(FALLBACK_CONSONANTS);
  const [allWords, setAllWords] = useState(FALLBACK_WORDS);
  const [levels, setLevels] = useState(DEFAULT_LEVELS);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [screen, setScreen] = useState('levels');
  const [currentLevel, setCurrentLevel] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [gameWords, setGameWords] = useState([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedMatra, setSelectedMatra] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [learnIndex, setLearnIndex] = useState(0);
  const [scrambleSlots, setScrambleSlots] = useState([]);
  const [scrambleOptions, setScrambleOptions] = useState([]);
  const [userProgress, setUserProgress] = useState({ highestLevel: 0 });

  const timerRef = useRef(null);
  const feedbackAnim = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    fetchData();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const api = axios.create({ baseURL: API_BASE_URL, timeout: API_TIMEOUT });
      const [matrasRes, consRes, wordsRes, levelsRes] = await Promise.all([
        api.get('/api/matra-game/matras').catch(() => ({ data: FALLBACK_MATRAS })),
        api.get('/api/matra-game/consonants').catch(() => ({ data: FALLBACK_CONSONANTS })),
        api.get('/api/matra-game/words').catch(() => ({ data: FALLBACK_WORDS })),
        api.get('/api/matra-game/levels').catch(() => ({ data: DEFAULT_LEVELS })),
      ]);

      const m = matrasRes.data.length ? matrasRes.data : FALLBACK_MATRAS;
      const c = consRes.data.length ? consRes.data : FALLBACK_CONSONANTS;
      const w = wordsRes.data.length ? wordsRes.data : FALLBACK_WORDS;
      const l = levelsRes.data.length ? levelsRes.data : DEFAULT_LEVELS;

      setMatras(m); setConsonants(c); setAllWords(w); setLevels(l);

      const catMap = {};
      w.forEach(word => {
        if (!catMap[word.category]) catMap[word.category] = 0;
        catMap[word.category]++;
      });
      setCategories(Object.keys(catMap).map(id => ({
        id, count: catMap[id],
        ...(CATEGORY_MAP[id] || { name: id, emoji: '📚', nameEn: id }),
      })));

      const userId = await AsyncStorage.getItem('playerId') || await AsyncStorage.getItem('userId');
      if (userId) {
        try {
          const prog = await api.get(`/api/matra-game/user-progress/${userId}`);
          setUserProgress(prog.data);
        } catch (e) {}
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  };

  const handleLevelSelect = (lvl) => {
    if (lvl.level > (userProgress.highestLevel || 0) + 1) return;
    setCurrentLevel(lvl);
    if (lvl.mode === 'learn') {
      setLearnIndex(0); setScore(0); setScreen('play');
    } else {
      setScreen('category');
    }
  };

  const startGame = (category) => {
    setSelectedCategory(category);
    let words = allWords.filter(w => w.keyMatra);
    if (category && category !== 'all') words = words.filter(w => w.category === category);
    if (currentLevel?.matras?.length) {
      const filtered = words.filter(w => currentLevel.matras.includes(w.keyMatra));
      if (filtered.length >= 3) words = filtered;
    }
    words = shuffle(words).slice(0, currentLevel?.wordsPerRound || 10);
    if (words.length === 0) words = shuffle(FALLBACK_WORDS).slice(0, 8);

    setGameWords(words); setWordIndex(0); setScore(0); setStreak(0);
    setMaxStreak(0); setCorrectCount(0); setTotalAnswered(0);
    setSelectedMatra(null); setFeedback(null);

    if (currentLevel?.mode === 'scramble' && words.length > 0) setupScramble(words[0]);
    if (currentLevel?.timeLimit > 0) {
      setTimeLeft(currentLevel.timeLimit);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => { if (prev <= 1) { clearInterval(timerRef.current); return 0; } return prev - 1; });
      }, 1000);
    }
    setScreen('play');
  };

  const setupScramble = (word) => {
    if (!word) return;
    const chars = word.combined.split('');
    setScrambleSlots(new Array(chars.length).fill(null));
    setScrambleOptions(shuffle(chars).map((ch, i) => ({ id: i, char: ch, used: false })));
  };

  useEffect(() => {
    if (currentLevel?.timeLimit > 0 && timeLeft === 0 && screen === 'play' && currentLevel?.mode === 'speed') {
      if (timerRef.current) clearInterval(timerRef.current);
      finishGame();
    }
  }, [timeLeft]);

  const currentWord = gameWords[wordIndex] || null;

  const getMatraOptions = () => {
    if (!currentWord) return [];
    const correctId = currentWord.keyMatra;
    const correct = matras.find(m => m.id === correctId);
    if (!correct) return [];
    const distractors = shuffle(matras.filter(m => m.id !== correctId)).slice(0, 4);
    return shuffle([correct, ...distractors]);
  };

  const getConsonantSymbol = () => {
    if (!currentWord) return '?';
    const cons = consonants.find(c => c.id === currentWord.keyCons);
    return cons ? cons.symbol : currentWord.combined[0];
  };

  const showFeedback = (fb) => {
    setFeedback(fb);
    feedbackAnim.setValue(0);
    RNAnimated.spring(feedbackAnim, { toValue: 1, useNativeDriver: true }).start();
    setTimeout(() => setFeedback(null), 1400);
  };

  const handleMatraTap = (matra) => {
    if (feedback) return;
    setSelectedMatra(matra.id);
    const isCorrect = matra.id === currentWord?.keyMatra;
    if (isCorrect) {
      const pts = currentLevel?.pointsPerCorrect || 15;
      const bonus = streak >= 3 ? Math.floor(pts * 0.5) : 0;
      setScore(prev => prev + pts + bonus);
      setStreak(prev => { const ns = prev + 1; setMaxStreak(ms => Math.max(ms, ns)); return ns; });
      setCorrectCount(prev => prev + 1);
      speakHindi(currentWord.combined);
      showFeedback({ type: 'correct', text: 'सही! 🎉', detail: `${currentWord.combined} (${currentWord.meaning})`, points: pts + bonus });
    } else {
      setStreak(0);
      const cm = matras.find(m => m.id === currentWord?.keyMatra);
      showFeedback({ type: 'wrong', text: 'गलत 😔', detail: `सही: ${cm?.symbol || '?'}`, points: 0 });
    }
    setTotalAnswered(prev => prev + 1);
    setTimeout(() => { setSelectedMatra(null); advanceWord(); }, 1500);
  };

  const handleScrambleTap = (optIdx) => {
    if (feedback) return;
    const opt = scrambleOptions[optIdx];
    if (opt.used) return;
    const nextSlot = scrambleSlots.findIndex(s => s === null);
    if (nextSlot === -1) return;
    const newSlots = [...scrambleSlots]; newSlots[nextSlot] = opt.char;
    setScrambleSlots(newSlots);
    const newOpts = [...scrambleOptions]; newOpts[optIdx] = { ...opt, used: true };
    setScrambleOptions(newOpts);
    if (newSlots.every(s => s !== null)) {
      const formed = newSlots.join('');
      const isCorrect = formed === currentWord?.combined;
      if (isCorrect) {
        const pts = currentLevel?.pointsPerCorrect || 25;
        const bonus = streak >= 3 ? Math.floor(pts * 0.5) : 0;
        setScore(prev => prev + pts + bonus);
        setStreak(prev => { const ns = prev + 1; setMaxStreak(ms => Math.max(ms, ns)); return ns; });
        setCorrectCount(prev => prev + 1);
        speakHindi(currentWord.combined);
        showFeedback({ type: 'correct', text: 'शाबाश! 🏆', detail: `${currentWord.combined}`, points: pts + bonus });
      } else {
        setStreak(0);
        showFeedback({ type: 'wrong', text: 'गलत क्रम 😔', detail: `सही: ${currentWord?.combined}`, points: 0 });
      }
      setTotalAnswered(prev => prev + 1);
      setTimeout(() => advanceWord(), 1500);
    }
  };

  const handleScrambleSlotTap = (slotIdx) => {
    if (feedback) return;
    if (scrambleSlots[slotIdx] === null) return;
    const char = scrambleSlots[slotIdx];
    const newSlots = [...scrambleSlots]; newSlots[slotIdx] = null;
    const filtered = newSlots.filter(s => s !== null);
    setScrambleSlots([...filtered, ...new Array(newSlots.length - filtered.length).fill(null)]);
    const optIdx = scrambleOptions.findIndex(o => o.char === char && o.used);
    if (optIdx !== -1) { const no = [...scrambleOptions]; no[optIdx] = { ...no[optIdx], used: false }; setScrambleOptions(no); }
  };

  const advanceWord = () => {
    const nextIdx = wordIndex + 1;
    if (nextIdx >= gameWords.length) { finishGame(); }
    else { setWordIndex(nextIdx); if (currentLevel?.mode === 'scramble') setupScramble(gameWords[nextIdx]); }
  };

  const finishGame = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen('results');
    const userId = await AsyncStorage.getItem('playerId') || await AsyncStorage.getItem('userId');
    if (userId && currentLevel) {
      try {
        await axios.post(`${API_BASE_URL}/api/matra-game/save-score`, {
          userId, level: currentLevel.level, score, correctAnswers: correctCount, totalQuestions: totalAnswered, language: 'hindi',
        }, { timeout: API_TIMEOUT });
      } catch (e) {}
      setUserProgress(prev => ({ ...prev, highestLevel: Math.max(prev.highestLevel || 0, currentLevel.level) }));
    }
  }, [currentLevel, score, correctCount, totalAnswered]);

  const getStars = () => {
    if (!currentLevel) return 0;
    const t = currentLevel.starsThreshold || [50, 100, 150];
    if (score >= t[2]) return 3;
    if (score >= t[1]) return 2;
    if (score >= t[0]) return 1;
    return 0;
  };

  // ═══════════════════════════════════════════════════════════
  // RENDERS
  // ═══════════════════════════════════════════════════════════

  if (loading) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />
        <View style={s.loadingWrap}>
          <Text style={s.loadingEmoji}>✨</Text>
          <Text style={s.loadingText}>मात्रा गेम लोड हो रहा है...</Text>
        </View>
      </View>
    );
  }

  // ── Top bar ────────────────────────────────────────────────
  const renderTopBar = () => (
    <View style={s.topBar}>
      <TouchableOpacity style={s.backBtn} onPress={() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (screen === 'play' || screen === 'results') setScreen('levels');
        else if (screen === 'category') setScreen('levels');
        else navigation.goBack();
      }}>
        <Text style={s.backBtnText}>← {screen === 'levels' ? 'Hub' : 'Back'}</Text>
      </TouchableOpacity>
      {screen === 'play' && (
        <View style={s.statsRow}>
          <View style={s.statBadge}><Text style={s.statText}>⭐ {score}</Text></View>
          {streak >= 2 && <View style={[s.statBadge, { backgroundColor: 'rgba(249,115,22,0.2)' }]}><Text style={s.statText}>🔥 {streak}</Text></View>}
        </View>
      )}
    </View>
  );

  // ── Level Select ───────────────────────────────────────────
  const renderLevels = () => (
    <ScrollView contentContainerStyle={s.scroll}>
      <Text style={s.title}>✨ Matra Magic Builder ✨</Text>
      <Text style={s.subtitle}>हिंदी मात्राओं का जादुई खेल</Text>
      {levels.map((lvl, idx) => {
        const isLocked = lvl.level > (userProgress.highestLevel || 0) + 1;
        const isCompleted = lvl.level <= (userProgress.highestLevel || 0);
        return (
          <TouchableOpacity key={lvl.level}
            style={[s.levelCard, { borderLeftColor: LEVEL_COLORS[idx], borderLeftWidth: 4 },
              isLocked && s.levelLocked, isCompleted && s.levelCompleted]}
            activeOpacity={isLocked ? 1 : 0.8}
            onPress={() => handleLevelSelect(lvl)}>
            <View style={s.levelHeader}>
              <Text style={[s.levelNum, { color: LEVEL_COLORS[idx] }]}>{lvl.level}</Text>
              <Text style={s.levelBadge}>{isLocked ? '🔒' : LEVEL_EMOJIS[idx]}</Text>
            </View>
            <Text style={s.levelName}>{lvl.name}</Text>
            <Text style={s.levelNameHi}>{lvl.nameHindi}</Text>
            <Text style={s.levelDesc}>{lvl.description || ''}</Text>
            {isCompleted && <Text style={s.levelStars}>⭐⭐⭐</Text>}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ── Category Select ────────────────────────────────────────
  const renderCategories = () => (
    <ScrollView contentContainerStyle={s.scroll}>
      <Text style={s.catTitle}>📂 Choose a Category</Text>
      <Text style={s.catSub}>Pick a word category or play with all words</Text>
      <View style={s.catGrid}>
        {categories.filter(c => c.count >= 2).map(cat => (
          <TouchableOpacity key={cat.id} style={s.catCard} onPress={() => startGame(cat.id)}>
            <Text style={s.catEmoji}>{cat.emoji}</Text>
            <Text style={s.catName}>{cat.name}</Text>
            <Text style={s.catNameEn}>{cat.nameEn}</Text>
            <Text style={s.catCount}>{cat.count} words</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={s.allBtn} onPress={() => startGame('all')}>
        <Text style={s.allBtnText}>🌈 All Categories</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // ── Learn Mode ─────────────────────────────────────────────
  const renderLearnMode = () => {
    const learnMatras = matras.filter(m => (currentLevel?.matras || []).includes(m.id));
    const current = learnMatras[learnIndex];
    if (!current) return null;
    const examples = allWords.filter(w => w.keyMatra === current.id).slice(0, 2);
    const cons = examples.length > 0 ? consonants.find(c => c.id === examples[0].keyCons) : consonants[0];

    return (
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.progressBar}><View style={[s.progressFill, { width: `${((learnIndex + 1) / learnMatras.length) * 100}%` }]} /></View>
        <View style={s.learnCard}>
          <Text style={s.learnSymbol}>{current.symbol}</Text>
          <Text style={s.learnName}>{current.name}</Text>
          <Text style={s.learnVowel}>स्वर: {current.vowel}</Text>
          <TouchableOpacity style={s.speakBtn} onPress={() => speakHindi(current.vowel)}>
            <Text style={s.speakBtnText}>🔊 सुनें</Text>
          </TouchableOpacity>
          {cons && (
            <View style={s.learnExample}>
              <Text style={s.learnParts}>{cons.symbol} + {current.symbol} =</Text>
              <Text style={s.learnCombo}>{cons.symbol}{current.symbol}</Text>
              {examples.length > 0 && (
                <>
                  <Text style={{ fontSize: 28, marginTop: 6 }}>{examples[0].emoji}</Text>
                  <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>{examples[0].combined}</Text>
                  <Text style={{ fontSize: 13, color: '#94a3b8' }}>{examples[0].meaning}</Text>
                  <TouchableOpacity style={s.speakBtn} onPress={() => speakHindi(examples[0].combined)}>
                    <Text style={s.speakBtnText}>🔊 शब्द सुनें</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>
        <View style={s.learnNav}>
          {learnIndex > 0 && (
            <TouchableOpacity style={s.navBtn} onPress={() => setLearnIndex(p => p - 1)}>
              <Text style={s.navBtnText}>← पिछला</Text>
            </TouchableOpacity>
          )}
          {learnIndex < learnMatras.length - 1 ? (
            <TouchableOpacity style={[s.navBtn, s.navBtnPrimary]} onPress={() => setLearnIndex(p => p + 1)}>
              <Text style={[s.navBtnText, { color: '#fff' }]}>अगला →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[s.navBtn, s.navBtnPrimary]} onPress={() => {
              setScore(currentLevel?.starsThreshold?.[2] || 90);
              setCorrectCount(learnMatras.length);
              setTotalAnswered(learnMatras.length);
              finishGame();
            }}>
              <Text style={[s.navBtnText, { color: '#fff' }]}>🎉 पूरा हुआ!</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  };

  // ── Tap Mode ───────────────────────────────────────────────
  const renderTapMode = () => {
    if (!currentWord) return null;
    const options = getMatraOptions();
    return (
      <ScrollView contentContainerStyle={s.scroll}>
        {currentLevel?.mode === 'speed' && (
          <Text style={[s.timer, timeLeft <= 15 && { color: '#ef4444' }]}>⏱️ {timeLeft}s</Text>
        )}
        <View style={s.progressBar}><View style={[s.progressFill, { width: `${((wordIndex + 1) / gameWords.length) * 100}%` }]} /></View>
        <View style={s.wordCard}>
          <Text style={s.wordEmoji}>{currentWord.emoji}</Text>
          <Text style={s.wordMeaning}>{currentWord.meaning}</Text>
          <Text style={s.wordHindi}>{currentWord.combined}</Text>
          <TouchableOpacity style={s.speakBtn} onPress={() => speakHindi(currentWord.combined)}>
            <Text style={s.speakBtnText}>🔊 सुनें</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.optionsLabel}>कौन सी मात्रा है?</Text>
        <View style={s.optionsGrid}>
          {options.map(m => (
            <TouchableOpacity key={m.id}
              style={[s.option,
                selectedMatra === m.id && (m.id === currentWord.keyMatra
                  ? { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.2)' }
                  : { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.2)' })
              ]}
              onPress={() => handleMatraTap(m)}>
              <Text style={s.optionText}>{m.symbol}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.progressText}>{wordIndex + 1} / {gameWords.length}</Text>
      </ScrollView>
    );
  };

  // ── Drag Mode (Tap-to-select on mobile) ────────────────────
  const renderDragMode = () => {
    if (!currentWord) return null;
    const options = getMatraOptions();
    const consSymbol = getConsonantSymbol();

    return (
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.progressBar}><View style={[s.progressFill, { width: `${((wordIndex + 1) / gameWords.length) * 100}%` }]} /></View>
        <View style={s.wordCard}>
          <Text style={s.wordEmoji}>{currentWord.emoji}</Text>
          <Text style={s.wordMeaning}>{currentWord.meaning}</Text>
          <Text style={[s.wordHindi, { opacity: 0.3, fontSize: 28 }]}>{currentWord.combined}</Text>
          <TouchableOpacity style={s.speakBtn} onPress={() => speakHindi(currentWord.combined)}>
            <Text style={s.speakBtnText}>🔊 सुनें</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.optionsLabel}>मात्रा चुनें और व्यंजन से जोड़ें</Text>
        <View style={s.dropArea}>
          <Text style={s.consonantSlot}>{consSymbol}</Text>
          <Text style={{ fontSize: 24, color: '#94a3b8' }}>+</Text>
          <View style={[s.dropZone, selectedMatra && { borderColor: '#10b981', borderStyle: 'solid' }]}>
            <Text style={s.dropZoneText}>
              {selectedMatra ? matras.find(m => m.id === selectedMatra)?.symbol : '?'}
            </Text>
          </View>
        </View>
        <View style={s.optionsGrid}>
          {options.map(m => (
            <TouchableOpacity key={m.id} style={s.option}
              onPress={() => {
                if (feedback) return;
                setSelectedMatra(m.id);
                const isCorrect = m.id === currentWord?.keyMatra;
                if (isCorrect) {
                  const pts = currentLevel?.pointsPerCorrect || 20;
                  const bonus = streak >= 3 ? Math.floor(pts * 0.5) : 0;
                  setScore(prev => prev + pts + bonus);
                  setStreak(prev => { const ns = prev + 1; setMaxStreak(ms => Math.max(ms, ns)); return ns; });
                  setCorrectCount(prev => prev + 1);
                  speakHindi(currentWord.combined);
                  showFeedback({ type: 'correct', text: 'बहुत बढ़िया! 🌟', detail: `${consSymbol}${m.symbol} → ${currentWord.combined}`, points: pts + bonus });
                } else {
                  setStreak(0);
                  const cm = matras.find(mm => mm.id === currentWord?.keyMatra);
                  showFeedback({ type: 'wrong', text: 'फिर कोशिश करो! 💪', detail: `सही: ${cm?.symbol || '?'}`, points: 0 });
                }
                setTotalAnswered(prev => prev + 1);
                setTimeout(() => { setSelectedMatra(null); advanceWord(); }, 1500);
              }}>
              <Text style={s.optionText}>{m.symbol}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.progressText}>{wordIndex + 1} / {gameWords.length}</Text>
      </ScrollView>
    );
  };

  // ── Scramble Mode ──────────────────────────────────────────
  const renderScrambleMode = () => {
    if (!currentWord) return null;
    return (
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.progressBar}><View style={[s.progressFill, { width: `${((wordIndex + 1) / gameWords.length) * 100}%` }]} /></View>
        <View style={s.wordCard}>
          <Text style={s.wordEmoji}>{currentWord.emoji}</Text>
          <Text style={s.wordMeaning}>{currentWord.meaning}</Text>
          <TouchableOpacity style={s.speakBtn} onPress={() => speakHindi(currentWord.combined)}>
            <Text style={s.speakBtnText}>🔊 सुनें</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.optionsLabel}>अक्षरों को सही क्रम में लगाओ</Text>
        <View style={s.scrambleRow}>
          {scrambleSlots.map((ch, idx) => (
            <TouchableOpacity key={idx} style={[s.scrambleSlot, ch && s.scrambleSlotFilled]}
              onPress={() => handleScrambleSlotTap(idx)}>
              <Text style={s.scrambleSlotText}>{ch || ''}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.scrambleRow}>
          {scrambleOptions.map((opt, idx) => (
            <TouchableOpacity key={opt.id}
              style={[s.scrambleOption, opt.used && s.scrambleUsed]}
              onPress={() => handleScrambleTap(idx)} disabled={opt.used}>
              <Text style={s.scrambleOptionText}>{opt.char}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.progressText}>{wordIndex + 1} / {gameWords.length}</Text>
      </ScrollView>
    );
  };

  // ── Play Screen Router ─────────────────────────────────────
  const renderPlayScreen = () => {
    const mode = currentLevel?.mode || 'tap';
    switch (mode) {
      case 'learn': return renderLearnMode();
      case 'tap': return renderTapMode();
      case 'drag': return renderDragMode();
      case 'scramble': return renderScrambleMode();
      case 'speed': return renderTapMode(); // speed reuses tap with timer
      default: return renderTapMode();
    }
  };

  // ── Results ────────────────────────────────────────────────
  const renderResults = () => {
    const stars = getStars();
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    return (
      <ScrollView contentContainerStyle={[s.scroll, { alignItems: 'center' }]}>
        <Text style={s.resultsTitle}>
          {stars >= 3 ? '🏆 शानदार!' : stars >= 2 ? '🌟 बहुत अच्छा!' : stars >= 1 ? '👍 अच्छा!' : '💪 कोशिश जारी रखो!'}
        </Text>
        <Text style={s.resultsStars}>{[1,2,3].map(i => i <= stars ? '⭐' : '☆').join(' ')}</Text>
        <View style={s.resultsGrid}>
          {[
            { val: score, label: 'Score' },
            { val: `${accuracy}%`, label: 'Accuracy' },
            { val: maxStreak, label: 'Streak' },
            { val: correctCount, label: 'Correct' },
            { val: totalAnswered, label: 'Attempted' },
            { val: `Lv ${currentLevel?.level || 1}`, label: 'Level' },
          ].map((item, idx) => (
            <View key={idx} style={s.resultStat}>
              <Text style={s.resultStatVal}>{item.val}</Text>
              <Text style={s.resultStatLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
        <View style={s.resultsActions}>
          <TouchableOpacity style={[s.actionBtn, s.actionSecondary]} onPress={() => { setScreen('levels'); fetchData(); }}>
            <Text style={s.actionBtnText}>📋 Levels</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => {
            if (currentLevel?.mode === 'learn') { setLearnIndex(0); setScore(0); setScreen('play'); }
            else startGame(selectedCategory);
          }}>
            <Text style={s.actionBtnText}>🔄 Play Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // ── Feedback Overlay ───────────────────────────────────────
  const renderFeedbackOverlay = () => {
    if (!feedback) return null;
    return (
      <RNAnimated.View style={[s.feedbackOverlay, {
        opacity: feedbackAnim,
        transform: [{ scale: feedbackAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
      }]}>
        <View style={[s.feedbackCard, feedback.type === 'correct' ? s.feedbackCorrect : s.feedbackWrong]}>
          <Text style={s.feedbackEmoji}>{feedback.type === 'correct' ? '🎉' : '😔'}</Text>
          <Text style={[s.feedbackText, { color: feedback.type === 'correct' ? '#6ee7b7' : '#fca5a5' }]}>{feedback.text}</Text>
          <Text style={s.feedbackDetail}>{feedback.detail}</Text>
          {feedback.points > 0 && <Text style={s.feedbackPoints}>+{feedback.points} pts</Text>}
        </View>
      </RNAnimated.View>
    );
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />
      {renderTopBar()}
      {screen === 'levels' && renderLevels()}
      {screen === 'category' && renderCategories()}
      {screen === 'play' && renderPlayScreen()}
      {screen === 'results' && renderResults()}
      {renderFeedbackOverlay()}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingEmoji: { fontSize: 48, marginBottom: 12 },
  loadingText: { fontSize: 16, color: '#94a3b8' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  backBtnText: { color: '#e2e8f0', fontSize: 14, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBadge: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statText: { color: '#FFD700', fontWeight: '700', fontSize: 14 },

  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFD700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },

  // Level cards
  levelCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  levelLocked: { opacity: 0.4 },
  levelCompleted: { borderColor: 'rgba(16,185,129,0.3)' },
  levelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  levelNum: { fontSize: 32, fontWeight: '800' },
  levelBadge: { fontSize: 22 },
  levelName: { fontSize: 17, fontWeight: '700', color: '#fff' },
  levelNameHi: { fontSize: 13, color: '#a78bfa', marginBottom: 4 },
  levelDesc: { fontSize: 12, color: '#94a3b8', lineHeight: 17 },
  levelStars: { marginTop: 6, fontSize: 16 },

  // Category
  catTitle: { fontSize: 24, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 4 },
  catSub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 16 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  catCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, width: (SCREEN_WIDTH - 56) / 2, alignItems: 'center' },
  catEmoji: { fontSize: 32, marginBottom: 6 },
  catName: { fontSize: 16, fontWeight: '700', color: '#fff' },
  catNameEn: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  catCount: { fontSize: 11, color: '#a78bfa', marginTop: 4 },
  allBtn: { backgroundColor: '#f43f5e', borderRadius: 14, paddingVertical: 12, marginTop: 16, alignItems: 'center' },
  allBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Progress bar
  progressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, marginBottom: 14, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#f43f5e', borderRadius: 8 },

  // Word display
  wordCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  wordEmoji: { fontSize: 48, marginBottom: 6 },
  wordMeaning: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  wordHindi: { fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: 3 },
  speakBtn: { backgroundColor: 'rgba(59,130,246,0.15)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, marginTop: 8 },
  speakBtnText: { color: '#93c5fd', fontSize: 14, fontWeight: '600' },

  // Options
  optionsLabel: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 12 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 16 },
  option: { width: 64, height: 64, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optionText: { fontSize: 30, fontWeight: '700', color: '#e2e8f0' },
  progressText: { fontSize: 12, color: '#64748b', textAlign: 'center' },

  // Drop area
  dropArea: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 },
  consonantSlot: { fontSize: 48, fontWeight: '800', color: '#e2e8f0', backgroundColor: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 12 },
  dropZone: { width: 72, height: 72, borderWidth: 2.5, borderColor: 'rgba(244,63,94,0.5)', borderStyle: 'dashed', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dropZoneText: { fontSize: 30, fontWeight: '700', color: 'rgba(244,63,94,0.5)' },

  // Learn card
  learnCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 16 },
  learnSymbol: { fontSize: 64, fontWeight: '800', color: '#f43f5e' },
  learnName: { fontSize: 18, color: '#e2e8f0', marginBottom: 2 },
  learnVowel: { fontSize: 14, color: '#a78bfa', marginBottom: 12 },
  learnExample: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, width: '100%', alignItems: 'center', marginTop: 10 },
  learnParts: { fontSize: 14, color: '#94a3b8' },
  learnCombo: { fontSize: 32, fontWeight: '700', color: '#FFD700' },
  learnNav: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  navBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  navBtnPrimary: { backgroundColor: '#f43f5e' },
  navBtnText: { fontSize: 15, fontWeight: '600', color: '#e2e8f0' },

  // Scramble
  scrambleRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  scrambleSlot: { minWidth: 52, height: 56, borderWidth: 2, borderColor: 'rgba(168,85,247,0.4)', borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  scrambleSlotFilled: { borderStyle: 'solid', borderColor: '#a78bfa', backgroundColor: 'rgba(168,85,247,0.1)' },
  scrambleSlotText: { fontSize: 26, fontWeight: '700', color: '#e2e8f0' },
  scrambleOption: { minWidth: 52, height: 56, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  scrambleUsed: { opacity: 0.25 },
  scrambleOptionText: { fontSize: 24, fontWeight: '700', color: '#e2e8f0' },

  // Timer
  timer: { fontSize: 22, fontWeight: '700', color: '#fbbf24', textAlign: 'center', marginBottom: 10 },

  // Results
  resultsTitle: { fontSize: 28, fontWeight: '800', color: '#FFD700', textAlign: 'center', marginBottom: 8 },
  resultsStars: { fontSize: 40, textAlign: 'center', marginBottom: 16, letterSpacing: 8 },
  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 20, width: '100%' },
  resultStat: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, width: (SCREEN_WIDTH - 72) / 3, alignItems: 'center' },
  resultStatVal: { fontSize: 22, fontWeight: '800', color: '#f43f5e' },
  resultStatLabel: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  resultsActions: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  actionBtn: { backgroundColor: '#f43f5e', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  actionSecondary: { backgroundColor: 'rgba(255,255,255,0.1)' },
  actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Feedback overlay
  feedbackOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  feedbackCard: { backgroundColor: 'rgba(20,20,50,0.95)', borderWidth: 2, borderRadius: 20, padding: 28, alignItems: 'center', marginHorizontal: 32 },
  feedbackCorrect: { borderColor: 'rgba(16,185,129,0.5)' },
  feedbackWrong: { borderColor: 'rgba(239,68,68,0.5)' },
  feedbackEmoji: { fontSize: 52, marginBottom: 6 },
  feedbackText: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  feedbackDetail: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
  feedbackPoints: { fontSize: 18, fontWeight: '700', color: '#FFD700', marginTop: 6 },
});
