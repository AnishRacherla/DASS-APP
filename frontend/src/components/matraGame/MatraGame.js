import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './MatraGame.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// ─── Hindi matra helper data (fallback if API fails) ────────────
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
  { id: 'ba', symbol: 'ब' }, { id: 'ta2', symbol: 'त' }, { id: 'da2', symbol: 'द' },
  { id: 'cha', symbol: 'च' }, { id: 'ja', symbol: 'ज' }, { id: 'va', symbol: 'व' },
  { id: 'sha', symbol: 'श' }, { id: 'kha', symbol: 'ख' }, { id: 'pha', symbol: 'फ' },
  { id: 'gha', symbol: 'घ' }, { id: 'bha', symbol: 'भ' }, { id: 'tha', symbol: 'थ' },
  { id: 'dha', symbol: 'ध' }, { id: 'ya', symbol: 'य' },
];

const FALLBACK_WORDS = [
  { combined: 'काला', meaning: 'black', emoji: '⚫', category: 'colors', keyMatra: 'aa', keyCons: 'ka' },
  { combined: 'नीला', meaning: 'blue', emoji: '🔵', category: 'colors', keyMatra: 'ii', keyCons: 'na' },
  { combined: 'लाल', meaning: 'red', emoji: '🔴', category: 'colors', keyMatra: 'aa', keyCons: 'la' },
  { combined: 'गाय', meaning: 'cow', emoji: '🐄', category: 'animals', keyMatra: 'aa', keyCons: 'ga' },
  { combined: 'शेर', meaning: 'lion', emoji: '🦁', category: 'animals', keyMatra: 'e', keyCons: 'sha' },
  { combined: 'मोर', meaning: 'peacock', emoji: '🦚', category: 'animals', keyMatra: 'o', keyCons: 'ma' },
  { combined: 'हाथ', meaning: 'hand', emoji: '🤚', category: 'body', keyMatra: 'aa', keyCons: 'ha' },
  { combined: 'नाक', meaning: 'nose', emoji: '👃', category: 'body', keyMatra: 'aa', keyCons: 'na' },
  { combined: 'कान', meaning: 'ear', emoji: '👂', category: 'body', keyMatra: 'aa', keyCons: 'ka' },
  { combined: 'सेब', meaning: 'apple', emoji: '🍎', category: 'fruits', keyMatra: 'e', keyCons: 'sa' },
  { combined: 'केला', meaning: 'banana', emoji: '🍌', category: 'fruits', keyMatra: 'e', keyCons: 'ka' },
  { combined: 'पीला', meaning: 'yellow', emoji: '🟡', category: 'colors', keyMatra: 'ii', keyCons: 'pa' },
  { combined: 'किताब', meaning: 'book', emoji: '📚', category: 'objects', keyMatra: 'i', keyCons: 'ka' },
  { combined: 'घर', meaning: 'home', emoji: '🏠', category: 'objects', keyMatra: 'aa', keyCons: 'gha' },
  { combined: 'मेज', meaning: 'table', emoji: '🪵', category: 'objects', keyMatra: 'e', keyCons: 'ma' },
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

// ─── Speak helper ───────────────────────────────────────────────
function speakHindi(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'hi-IN';
  utter.rate = 0.85;
  utter.pitch = 1.1;
  window.speechSynthesis.speak(utter);
}

// ─── Confetti spawn helper ──────────────────────────────────────
function spawnConfetti() {
  const container = document.createElement('div');
  container.className = 'matra-confetti-container';
  document.body.appendChild(container);
  const colors = ['#f43f5e', '#FFD700', '#a78bfa', '#34d399', '#38bdf8', '#fb923c'];
  for (let i = 0; i < 40; i++) {
    const c = document.createElement('div');
    c.className = 'matra-confetti';
    c.style.left = Math.random() * 100 + '%';
    c.style.top = '-10px';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDelay = Math.random() * 0.6 + 's';
    c.style.animationDuration = (1 + Math.random()) + 's';
    c.style.width = (6 + Math.random() * 8) + 'px';
    c.style.height = (6 + Math.random() * 8) + 'px';
    container.appendChild(c);
  }
  setTimeout(() => container.remove(), 2500);
}

// ─── Shuffle helper ─────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ═════════════════════════════════════════════════════════════════
// MatraGame Component
// ═════════════════════════════════════════════════════════════════
const MatraGame = () => {
  const navigate = useNavigate();

  // Data
  const [matras, setMatras] = useState([]);
  const [consonants, setConsonants] = useState([]);
  const [allWords, setAllWords] = useState([]);
  const [levels, setLevels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Game state
  const [screen, setScreen] = useState('levels'); // levels | category | play | results
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
  const [droppedMatra, setDroppedMatra] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [learnIndex, setLearnIndex] = useState(0);
  const [scrambleSlots, setScrambleSlots] = useState([]);
  const [scrambleOptions, setScrambleOptions] = useState([]);
  const [userProgress, setUserProgress] = useState({ highestLevel: 0 });

  const timerRef = useRef(null);

  // ── Fetch data on mount ─────────────────────────────────────
  useEffect(() => {
    fetchData();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matrasRes, consRes, wordsRes, levelsRes] = await Promise.all([
        axios.get(`${API}/api/matra-game/matras`).catch(() => ({ data: FALLBACK_MATRAS })),
        axios.get(`${API}/api/matra-game/consonants`).catch(() => ({ data: FALLBACK_CONSONANTS })),
        axios.get(`${API}/api/matra-game/words`).catch(() => ({ data: FALLBACK_WORDS })),
        axios.get(`${API}/api/matra-game/levels`).catch(() => ({ data: [] })),
      ]);

      setMatras(matrasRes.data.length ? matrasRes.data : FALLBACK_MATRAS);
      setConsonants(consRes.data.length ? consRes.data : FALLBACK_CONSONANTS);
      setAllWords(wordsRes.data.length ? wordsRes.data : FALLBACK_WORDS);
      setLevels(levelsRes.data.length ? levelsRes.data : getDefaultLevels());

      // Build categories from words
      const catMap = {};
      const words = wordsRes.data.length ? wordsRes.data : FALLBACK_WORDS;
      words.forEach(w => {
        if (!catMap[w.category]) catMap[w.category] = 0;
        catMap[w.category]++;
      });
      setCategories(Object.keys(catMap).map(id => ({
        id,
        count: catMap[id],
        ...(CATEGORY_MAP[id] || { name: id, emoji: '📚', nameEn: id }),
      })));

      // Fetch user progress
      const userId = localStorage.getItem('playerId') || localStorage.getItem('userId');
      if (userId) {
        try {
          const prog = await axios.get(`${API}/api/matra-game/user-progress/${userId}`);
          setUserProgress(prog.data);
        } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error('Failed to load matra game data:', err);
      setMatras(FALLBACK_MATRAS);
      setConsonants(FALLBACK_CONSONANTS);
      setAllWords(FALLBACK_WORDS);
      setLevels(getDefaultLevels());
    }
    setLoading(false);
  };

  const getDefaultLevels = () => [
    { level: 1, name: 'Learn the Matras', nameHindi: 'मात्राएँ सीखें', mode: 'learn', matras: ['aa','i','ii','u','uu'], wordsPerRound: 8, timeLimit: 0, pointsPerCorrect: 10, starsThreshold: [50,70,90] },
    { level: 2, name: 'Tap & Match', nameHindi: 'टैप और मिलाओ', mode: 'tap', matras: ['aa','i','ii','u','uu'], wordsPerRound: 10, timeLimit: 0, pointsPerCorrect: 15, starsThreshold: [80,120,150] },
    { level: 3, name: 'Drag & Drop', nameHindi: 'खींचो और छोड़ो', mode: 'drag', matras: ['aa','i','ii','u','uu','e','ai','o','au'], wordsPerRound: 10, timeLimit: 0, pointsPerCorrect: 20, starsThreshold: [120,160,200] },
    { level: 4, name: 'Word Scramble', nameHindi: 'शब्द पहेली', mode: 'scramble', matras: ['aa','i','ii','u','uu','e','ai','o','au'], wordsPerRound: 10, timeLimit: 0, pointsPerCorrect: 25, starsThreshold: [150,200,250] },
    { level: 5, name: 'Speed Challenge', nameHindi: 'स्पीड चैलेंज', mode: 'speed', matras: ['aa','i','ii','u','uu','e','ai','o','au'], wordsPerRound: 15, timeLimit: 90, pointsPerCorrect: 30, starsThreshold: [200,350,450] },
  ];

  // ── Level selection ─────────────────────────────────────────
  const handleLevelSelect = (lvl) => {
    if (lvl.level > userProgress.highestLevel + 1) return; // locked
    setCurrentLevel(lvl);
    if (lvl.mode === 'learn') {
      startLearnMode(lvl);
    } else {
      setScreen('category');
    }
  };

  // ── Start learn mode ────────────────────────────────────────
  const startLearnMode = (lvl) => {
    setLearnIndex(0);
    setScore(0);
    setScreen('play');
  };

  // ── Start game with category ────────────────────────────────
  const startGame = useCallback((category) => {
    setSelectedCategory(category);
    let words = allWords.filter(w => w.keyMatra);

    if (category && category !== 'all') {
      words = words.filter(w => w.category === category);
    }

    // Filter words matching level's matras
    if (currentLevel) {
      const levelMatras = currentLevel.matras || [];
      if (levelMatras.length > 0) {
        const filtered = words.filter(w => levelMatras.includes(w.keyMatra));
        if (filtered.length >= 3) words = filtered;
      }
    }

    words = shuffle(words).slice(0, currentLevel?.wordsPerRound || 10);

    if (words.length === 0) {
      words = shuffle(FALLBACK_WORDS.filter(w => w.keyMatra)).slice(0, 10);
    }

    setGameWords(words);
    setWordIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setCorrectCount(0);
    setTotalAnswered(0);
    setSelectedMatra(null);
    setDroppedMatra(null);
    setFeedback(null);

    // Set up scramble if needed
    if (currentLevel?.mode === 'scramble' && words.length > 0) {
      setupScramble(words[0]);
    }

    // Set timer for speed mode
    if (currentLevel?.timeLimit > 0) {
      setTimeLeft(currentLevel.timeLimit);
    }

    setScreen('play');

    // Start timer for speed mode
    if (currentLevel?.timeLimit > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [allWords, currentLevel]);

  // ── Setup scramble for a word ──────────────────────────────
  const setupScramble = (word) => {
    if (!word) return;
    const chars = word.combined.split('');
    setScrambleSlots(new Array(chars.length).fill(null));
    setScrambleOptions(shuffle(chars).map((ch, i) => ({ id: i, char: ch, used: false })));
  };

  // ── Time up effect ────────────────────────────────────────
  useEffect(() => {
    if (currentLevel?.timeLimit > 0 && timeLeft === 0 && screen === 'play' && currentLevel?.mode === 'speed') {
      if (timerRef.current) clearInterval(timerRef.current);
      finishGame();
    }
    // eslint-disable-next-line
  }, [timeLeft]);

  // ── Get current word ──────────────────────────────────────
  const currentWord = gameWords[wordIndex] || null;

  // ── Get matra options for current word ────────────────────
  const getMatraOptions = useCallback(() => {
    if (!currentWord) return [];
    const correctId = currentWord.keyMatra;
    const correct = matras.find(m => m.id === correctId);
    if (!correct) return [];

    // Pick 3-5 distractors
    const distractors = shuffle(matras.filter(m => m.id !== correctId)).slice(0, 4);
    return shuffle([correct, ...distractors]);
  }, [currentWord, matras]);

  // ── Get consonant symbol for current word ─────────────────
  const getConsonantSymbol = useCallback(() => {
    if (!currentWord) return '?';
    const cons = consonants.find(c => c.id === currentWord.keyCons);
    return cons ? cons.symbol : currentWord.combined[0];
  }, [currentWord, consonants]);

  // ── Handle matra tap (Level 2) ────────────────────────────
  const handleMatraTap = (matra) => {
    if (feedback) return;
    setSelectedMatra(matra.id);

    const isCorrect = matra.id === currentWord?.keyMatra;

    if (isCorrect) {
      const points = currentLevel?.pointsPerCorrect || 15;
      const streakBonus = streak >= 3 ? Math.floor(points * 0.5) : 0;
      setScore(prev => prev + points + streakBonus);
      setStreak(prev => {
        const newStreak = prev + 1;
        setMaxStreak(ms => Math.max(ms, newStreak));
        return newStreak;
      });
      setCorrectCount(prev => prev + 1);
      speakHindi(currentWord.combined);
      spawnConfetti();
      setFeedback({
        type: 'correct',
        text: 'सही! 🎉',
        detail: `${currentWord.combined} (${currentWord.meaning})`,
        points: points + streakBonus,
      });
    } else {
      setStreak(0);
      const correctMatra = matras.find(m => m.id === currentWord?.keyMatra);
      setFeedback({
        type: 'wrong',
        text: 'गलत 😔',
        detail: `सही मात्रा: ${correctMatra?.symbol || '?'} (${correctMatra?.name || ''})`,
        points: 0,
      });
    }
    setTotalAnswered(prev => prev + 1);

    setTimeout(() => {
      setFeedback(null);
      setSelectedMatra(null);
      advanceWord();
    }, 1500);
  };

  // ── Handle drag start ─────────────────────────────────────
  const handleDragStart = (e, matra) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(matra));
    e.dataTransfer.effectAllowed = 'move';
  };

  // ── Handle drop ───────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    if (feedback) return;

    try {
      const matra = JSON.parse(e.dataTransfer.getData('text/plain'));
      setDroppedMatra(matra);

      const isCorrect = matra.id === currentWord?.keyMatra;

      if (isCorrect) {
        const points = currentLevel?.pointsPerCorrect || 20;
        const streakBonus = streak >= 3 ? Math.floor(points * 0.5) : 0;
        setScore(prev => prev + points + streakBonus);
        setStreak(prev => {
          const newStreak = prev + 1;
          setMaxStreak(ms => Math.max(ms, newStreak));
          return newStreak;
        });
        setCorrectCount(prev => prev + 1);
        speakHindi(currentWord.combined);
        spawnConfetti();
        setFeedback({
          type: 'correct',
          text: 'बहुत बढ़िया! 🌟',
          detail: `${getConsonantSymbol()}${matra.symbol} → ${currentWord.combined} (${currentWord.meaning})`,
          points: points + streakBonus,
        });
      } else {
        setStreak(0);
        const correctMatra = matras.find(m => m.id === currentWord?.keyMatra);
        setFeedback({
          type: 'wrong',
          text: 'फिर कोशिश करो! 💪',
          detail: `सही मात्रा: ${correctMatra?.symbol || '?'}`,
          points: 0,
        });
      }
      setTotalAnswered(prev => prev + 1);

      setTimeout(() => {
        setFeedback(null);
        setDroppedMatra(null);
        advanceWord();
      }, 1500);
    } catch (err) {
      console.error('Drop error:', err);
    }
  };

  // ── Scramble handlers ─────────────────────────────────────
  const handleScrambleTap = (optIdx) => {
    if (feedback) return;
    const opt = scrambleOptions[optIdx];
    if (opt.used) return;

    const nextSlot = scrambleSlots.findIndex(s => s === null);
    if (nextSlot === -1) return;

    const newSlots = [...scrambleSlots];
    newSlots[nextSlot] = opt.char;
    setScrambleSlots(newSlots);

    const newOpts = [...scrambleOptions];
    newOpts[optIdx] = { ...opt, used: true };
    setScrambleOptions(newOpts);

    // Check if all slots filled
    if (newSlots.every(s => s !== null)) {
      const formed = newSlots.join('');
      const isCorrect = formed === currentWord?.combined;

      if (isCorrect) {
        const points = currentLevel?.pointsPerCorrect || 25;
        const streakBonus = streak >= 3 ? Math.floor(points * 0.5) : 0;
        setScore(prev => prev + points + streakBonus);
        setStreak(prev => {
          const newStreak = prev + 1;
          setMaxStreak(ms => Math.max(ms, newStreak));
          return newStreak;
        });
        setCorrectCount(prev => prev + 1);
        speakHindi(currentWord.combined);
        spawnConfetti();
        setFeedback({
          type: 'correct',
          text: 'शाबाश! 🏆',
          detail: `${currentWord.combined} (${currentWord.meaning})`,
          points: points + streakBonus,
        });
      } else {
        setStreak(0);
        setFeedback({
          type: 'wrong',
          text: 'गलत क्रम 😔',
          detail: `सही शब्द: ${currentWord?.combined}`,
          points: 0,
        });
      }
      setTotalAnswered(prev => prev + 1);

      setTimeout(() => {
        setFeedback(null);
        advanceWord();
      }, 1500);
    }
  };

  const handleScrambleSlotTap = (slotIdx) => {
    if (feedback) return;
    if (scrambleSlots[slotIdx] === null) return;

    const char = scrambleSlots[slotIdx];
    const newSlots = [...scrambleSlots];
    newSlots[slotIdx] = null;
    // Shift remaining to left
    const filtered = newSlots.filter(s => s !== null);
    const shifted = [...filtered, ...new Array(newSlots.length - filtered.length).fill(null)];
    setScrambleSlots(shifted);

    // Un-use the option
    const optIdx = scrambleOptions.findIndex(o => o.char === char && o.used);
    if (optIdx !== -1) {
      const newOpts = [...scrambleOptions];
      newOpts[optIdx] = { ...newOpts[optIdx], used: false };
      setScrambleOptions(newOpts);
    }
  };

  // ── Advance to next word ──────────────────────────────────
  const advanceWord = () => {
    const nextIdx = wordIndex + 1;
    if (nextIdx >= gameWords.length) {
      finishGame();
    } else {
      setWordIndex(nextIdx);
      if (currentLevel?.mode === 'scramble') {
        setupScramble(gameWords[nextIdx]);
      }
    }
  };

  // ── Finish game ───────────────────────────────────────────
  const finishGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setScreen('results');

    // Save score
    const userId = localStorage.getItem('playerId') || localStorage.getItem('userId');
    if (userId && currentLevel) {
      axios.post(`${API}/api/matra-game/save-score`, {
        userId,
        level: currentLevel.level,
        score,
        correctAnswers: correctCount,
        totalQuestions: totalAnswered,
        language: 'hindi',
      }).catch(err => console.error('Failed to save score:', err));

      // Update local progress
      setUserProgress(prev => ({
        ...prev,
        highestLevel: Math.max(prev.highestLevel || 0, currentLevel.level),
      }));
    }
  }, [currentLevel, score, correctCount, totalAnswered]);

  // ── Calculate stars ───────────────────────────────────────
  const getStars = () => {
    if (!currentLevel) return 0;
    const thresholds = currentLevel.starsThreshold || [50, 100, 150];
    if (score >= thresholds[2]) return 3;
    if (score >= thresholds[1]) return 2;
    if (score >= thresholds[0]) return 1;
    return 0;
  };

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="matra-game">
        <div className="matra-bg">
          <div className="matra-stars">{[...Array(40)].map((_, i) => (
            <div key={i} className={`matra-star ${['s','m','l'][i%3]}`}
              style={{ left: `${(i*41+17)%100}%`, top: `${(i*59+11)%100}%`, animationDelay: `${(i*0.4)%6}s` }} />
          ))}</div>
        </div>
        <div className="matra-content">
          <div className="matra-loading">
            <div className="matra-loading-spinner" />
            <div className="matra-loading-text">मात्रा गेम लोड हो रहा है...</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Background ────────────────────────────────────────────
  const renderBg = () => (
    <div className="matra-bg">
      <div className="matra-stars">
        {[...Array(50)].map((_, i) => (
          <div key={i} className={`matra-star ${['s','m','l'][i%3]}`}
            style={{ left: `${(i*41+17)%100}%`, top: `${(i*59+11)%100}%`, animationDelay: `${(i*0.4)%6}s` }} />
        ))}
      </div>
      <div className="matra-orb matra-orb-1" />
      <div className="matra-orb matra-orb-2" />
      <div className="matra-orb matra-orb-3" />
    </div>
  );

  // ── Top Bar ───────────────────────────────────────────────
  const renderTopbar = () => (
    <motion.div className="matra-topbar"
      initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
      <button className="matra-back-btn" onClick={() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (screen === 'play' || screen === 'results') setScreen('levels');
        else if (screen === 'category') setScreen('levels');
        else navigate('/game-hub');
      }}>
        ← {screen === 'levels' ? 'Hub' : 'Back'}
      </button>
      {screen === 'play' && (
        <div className="matra-stats">
          <div className="matra-stat">
            <span className="matra-stat-icon">⭐</span>
            <span className="matra-stat-val">{score}</span>
          </div>
          {streak >= 2 && (
            <motion.div className="matra-stat"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <span className="matra-stat-icon">🔥</span>
              <span className="matra-stat-val">{streak}</span>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );

  // ── Level Select ──────────────────────────────────────────
  const renderLevelScreen = () => {
    const displayLevels = levels.length > 0 ? levels : getDefaultLevels();
    return (
      <motion.div className="matra-level-screen"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="matra-title">✨ Matra Magic Builder ✨</h1>
        <p className="matra-subtitle">हिंदी मात्राओं का जादुई खेल — Learn Hindi matras through fun!</p>

        <motion.div className="matra-levels-grid"
          initial="hidden" animate="visible"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}>
          {displayLevels.map((lvl, idx) => {
            const isLocked = lvl.level > (userProgress.highestLevel || 0) + 1;
            const isCompleted = lvl.level <= (userProgress.highestLevel || 0);
            const stars = userProgress.levelScores?.[lvl.level]
              ? getStarsForScore(userProgress.levelScores[lvl.level].score, lvl.starsThreshold || [50,100,150])
              : 0;

            return (
              <motion.div key={lvl.level}
                className={`matra-level-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                style={{ '--level-color': LEVEL_COLORS[idx] || '#f43f5e' }}
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
                whileHover={!isLocked ? { y: -4, scale: 1.02 } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                onClick={() => !isLocked && handleLevelSelect(lvl)}>
                <div className="matra-level-header">
                  <div className="matra-level-num">{lvl.level}</div>
                  <div className="matra-level-badge">{isLocked ? '🔒' : LEVEL_EMOJIS[idx]}</div>
                </div>
                <div className="matra-level-name">{lvl.name}</div>
                <div className="matra-level-name-hi">{lvl.nameHindi}</div>
                <div className="matra-level-desc">{lvl.description || ''}</div>
                {isCompleted && (
                  <div className="matra-level-stars">
                    {[1,2,3].map(s => <span key={s}>{s <= stars ? '⭐' : '☆'}</span>)}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    );
  };

  function getStarsForScore(sc, thresholds) {
    if (sc >= thresholds[2]) return 3;
    if (sc >= thresholds[1]) return 2;
    if (sc >= thresholds[0]) return 1;
    return 0;
  }

  // ── Category Select ───────────────────────────────────────
  const renderCategoryScreen = () => (
    <motion.div className="matra-category-screen"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="matra-category-title">📂 Choose a Category</h2>
      <p className="matra-category-sub">Pick a word category or play with all words</p>

      <div className="matra-categories-grid">
        {categories.filter(c => c.count >= 2).map(cat => (
          <motion.div key={cat.id}
            className={`matra-category-card ${selectedCategory === cat.id ? 'selected' : ''}`}
            whileHover={{ y: -3 }}
            onClick={() => { setSelectedCategory(cat.id); startGame(cat.id); }}>
            <span className="matra-category-emoji">{cat.emoji}</span>
            <div className="matra-category-name">{cat.name}</div>
            <div className="matra-category-name-en">{cat.nameEn}</div>
            <div className="matra-category-count">{cat.count} words</div>
          </motion.div>
        ))}
      </div>

      <button className="matra-all-btn" onClick={() => startGame('all')}>
        🌈 All Categories
      </button>
    </motion.div>
  );

  // ── Learn Mode Play ───────────────────────────────────────
  const renderLearnMode = () => {
    const learnMatras = matras.filter(m => (currentLevel?.matras || []).includes(m.id));
    const current = learnMatras[learnIndex];
    if (!current) return null;

    // Find example words for this matra
    const examples = allWords.filter(w => w.keyMatra === current.id).slice(0, 2);
    const consonant = examples.length > 0
      ? consonants.find(c => c.id === examples[0].keyCons)
      : consonants[0];

    return (
      <motion.div className="matra-game-area"
        key={learnIndex} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <div className="matra-progress-bar-wrap">
          <div className="matra-progress-bar" style={{ width: `${((learnIndex + 1) / learnMatras.length) * 100}%` }} />
        </div>

        <div className="matra-learn-card">
          <div className="matra-learn-symbol">{current.symbol}</div>
          <div className="matra-learn-name">{current.name}</div>
          <div className="matra-learn-vowel">स्वर: {current.vowel}</div>

          <button className="matra-speak-btn" onClick={() => speakHindi(current.vowel)}>
            🔊 सुनें
          </button>

          {consonant && (
            <div className="matra-learn-example">
              <div className="matra-learn-combo-parts">
                {consonant.symbol} + {current.symbol} =
              </div>
              <div className="matra-learn-combo">
                {consonant.symbol}{current.symbol}
              </div>
              {examples.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 24 }}>{examples[0].emoji}</span>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                    {examples[0].combined}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>
                    {examples[0].meaning}
                  </div>
                  <button className="matra-speak-btn" style={{ marginTop: 6 }}
                    onClick={() => speakHindi(examples[0].combined)}>
                    🔊 शब्द सुनें
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="matra-learn-nav">
          <button className="matra-learn-nav-btn"
            disabled={learnIndex === 0}
            onClick={() => setLearnIndex(prev => prev - 1)}>
            ← पिछला
          </button>
          {learnIndex < learnMatras.length - 1 ? (
            <button className="matra-learn-nav-btn primary"
              onClick={() => setLearnIndex(prev => prev + 1)}>
              अगला →
            </button>
          ) : (
            <button className="matra-learn-nav-btn primary"
              onClick={() => {
                // Mark learn mode complete, move to results
                setScore(currentLevel?.starsThreshold?.[2] || 90);
                setCorrectCount(learnMatras.length);
                setTotalAnswered(learnMatras.length);
                finishGame();
              }}>
              🎉 पूरा हुआ!
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  // ── Tap Mode Play ─────────────────────────────────────────
  const renderTapMode = () => {
    if (!currentWord) return null;
    const options = getMatraOptions();

    return (
      <motion.div className="matra-game-area"
        key={wordIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="matra-progress-bar-wrap">
          <div className="matra-progress-bar" style={{ width: `${((wordIndex + 1) / gameWords.length) * 100}%` }} />
        </div>

        <div className="matra-word-display">
          <span className="matra-word-emoji">{currentWord.emoji}</span>
          <div className="matra-word-meaning">{currentWord.meaning}</div>
          <div className="matra-word-hindi">{currentWord.combined}</div>
          <div className="matra-word-category-tag">
            {CATEGORY_MAP[currentWord.category]?.emoji} {CATEGORY_MAP[currentWord.category]?.name || currentWord.category}
          </div>
          <button className="matra-speak-btn" onClick={() => speakHindi(currentWord.combined)}>
            🔊 सुनें
          </button>
        </div>

        <p className="matra-options-label">इस शब्द में कौन सी मात्रा है? (Which matra is in this word?)</p>

        <div className="matra-options-grid">
          {options.map(m => (
            <motion.div key={m.id}
              className={`matra-option ${selectedMatra === m.id ? (m.id === currentWord.keyMatra ? 'correct' : 'wrong') : ''}`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMatraTap(m)}>
              {m.symbol}
            </motion.div>
          ))}
        </div>

        <div style={{ fontSize: 13, color: '#64748b' }}>
          {wordIndex + 1} / {gameWords.length}
        </div>
      </motion.div>
    );
  };

  // ── Drag Mode Play ────────────────────────────────────────
  const renderDragMode = () => {
    if (!currentWord) return null;
    const options = getMatraOptions();
    const consSymbol = getConsonantSymbol();

    return (
      <motion.div className="matra-game-area"
        key={wordIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="matra-progress-bar-wrap">
          <div className="matra-progress-bar" style={{ width: `${((wordIndex + 1) / gameWords.length) * 100}%` }} />
        </div>

        <div className="matra-word-display">
          <span className="matra-word-emoji">{currentWord.emoji}</span>
          <div className="matra-word-meaning">{currentWord.meaning}</div>
          <div className="matra-word-hindi" style={{ opacity: 0.3, fontSize: 32 }}>{currentWord.combined}</div>
          <button className="matra-speak-btn" onClick={() => speakHindi(currentWord.combined)}>
            🔊 सुनें
          </button>
        </div>

        <p className="matra-options-label">मात्रा को व्यंजन पर खींचें (Drag the matra onto the consonant)</p>

        <div className="matra-drop-area">
          <div className="matra-consonant-slot">{consSymbol}</div>
          <div className="matra-drop-zone-label" style={{ fontSize: 24, color: '#94a3b8' }}>+</div>
          <div
            className={`matra-drop-zone ${dragOver ? 'drag-over' : ''} ${droppedMatra ? 'filled' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}>
            {droppedMatra ? droppedMatra.symbol : '?'}
          </div>
        </div>

        <div className="matra-options-grid">
          {options.map(m => (
            <div key={m.id}
              className="matra-option"
              draggable
              onDragStart={(e) => handleDragStart(e, m)}
              onClick={() => {
                // Also support tap-to-select for mobile web
                if (feedback) return;
                setDroppedMatra(m);
                const isCorrect = m.id === currentWord?.keyMatra;
                if (isCorrect) {
                  const points = currentLevel?.pointsPerCorrect || 20;
                  const streakBonus = streak >= 3 ? Math.floor(points * 0.5) : 0;
                  setScore(prev => prev + points + streakBonus);
                  setStreak(prev => { const ns = prev + 1; setMaxStreak(ms => Math.max(ms, ns)); return ns; });
                  setCorrectCount(prev => prev + 1);
                  speakHindi(currentWord.combined);
                  spawnConfetti();
                  setFeedback({ type: 'correct', text: 'बहुत बढ़िया! 🌟',
                    detail: `${consSymbol}${m.symbol} → ${currentWord.combined}`, points: points + streakBonus });
                } else {
                  setStreak(0);
                  const correctMatra = matras.find(mm => mm.id === currentWord?.keyMatra);
                  setFeedback({ type: 'wrong', text: 'फिर कोशिश करो! 💪',
                    detail: `सही मात्रा: ${correctMatra?.symbol || '?'}`, points: 0 });
                }
                setTotalAnswered(prev => prev + 1);
                setTimeout(() => { setFeedback(null); setDroppedMatra(null); advanceWord(); }, 1500);
              }}>
              {m.symbol}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 13, color: '#64748b' }}>
          {wordIndex + 1} / {gameWords.length}
        </div>
      </motion.div>
    );
  };

  // ── Scramble Mode Play ────────────────────────────────────
  const renderScrambleMode = () => {
    if (!currentWord) return null;

    return (
      <motion.div className="matra-game-area"
        key={wordIndex} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className="matra-progress-bar-wrap">
          <div className="matra-progress-bar" style={{ width: `${((wordIndex + 1) / gameWords.length) * 100}%` }} />
        </div>

        <div className="matra-word-display">
          <span className="matra-word-emoji">{currentWord.emoji}</span>
          <div className="matra-word-meaning">{currentWord.meaning}</div>
          <button className="matra-speak-btn" onClick={() => speakHindi(currentWord.combined)}>
            🔊 सुनें
          </button>
        </div>

        <p className="matra-options-label">अक्षरों को सही क्रम में लगाओ (Arrange the letters in correct order)</p>

        <div className="matra-scramble-slots">
          {scrambleSlots.map((ch, idx) => (
            <motion.div key={idx}
              className={`matra-scramble-slot ${ch ? 'filled' : ''}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleScrambleSlotTap(idx)}>
              {ch || ''}
            </motion.div>
          ))}
        </div>

        <div className="matra-scramble-options">
          {scrambleOptions.map((opt, idx) => (
            <motion.div key={opt.id}
              className={`matra-scramble-option ${opt.used ? 'used' : ''}`}
              whileHover={!opt.used ? { scale: 1.06 } : {}}
              whileTap={!opt.used ? { scale: 0.95 } : {}}
              onClick={() => handleScrambleTap(idx)}>
              {opt.char}
            </motion.div>
          ))}
        </div>

        <div style={{ fontSize: 13, color: '#64748b', marginTop: 12 }}>
          {wordIndex + 1} / {gameWords.length}
        </div>
      </motion.div>
    );
  };

  // ── Speed Mode Play ───────────────────────────────────────
  const renderSpeedMode = () => {
    if (!currentWord) return null;
    const options = getMatraOptions();

    return (
      <motion.div className="matra-game-area"
        key={wordIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className={`matra-timer ${timeLeft <= 15 ? 'low' : ''}`}>
          ⏱️ {timeLeft}s
        </div>

        <div className="matra-progress-bar-wrap">
          <div className="matra-progress-bar" style={{ width: `${((wordIndex + 1) / gameWords.length) * 100}%` }} />
        </div>

        <div className="matra-word-display" style={{ padding: 20 }}>
          <span className="matra-word-emoji" style={{ fontSize: 40 }}>{currentWord.emoji}</span>
          <div className="matra-word-hindi" style={{ fontSize: 40 }}>{currentWord.combined}</div>
          <div className="matra-word-meaning">{currentWord.meaning}</div>
        </div>

        <p className="matra-options-label">सही मात्रा चुनें!</p>

        <div className="matra-options-grid">
          {options.map(m => (
            <motion.div key={m.id}
              className={`matra-option ${selectedMatra === m.id ? (m.id === currentWord.keyMatra ? 'correct' : 'wrong') : ''}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMatraTap(m)}>
              {m.symbol}
            </motion.div>
          ))}
        </div>

        <div style={{ fontSize: 13, color: '#64748b' }}>
          {wordIndex + 1} / {gameWords.length}
        </div>
      </motion.div>
    );
  };

  // ── Play Screen Router ────────────────────────────────────
  const renderPlayScreen = () => {
    const mode = currentLevel?.mode || 'tap';
    switch (mode) {
      case 'learn': return renderLearnMode();
      case 'tap': return renderTapMode();
      case 'drag': return renderDragMode();
      case 'scramble': return renderScrambleMode();
      case 'speed': return renderSpeedMode();
      default: return renderTapMode();
    }
  };

  // ── Results Screen ────────────────────────────────────────
  const renderResults = () => {
    const stars = getStars();
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    return (
      <motion.div className="matra-results"
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="matra-results-title">
          {stars >= 3 ? '🏆 शानदार!' : stars >= 2 ? '🌟 बहुत अच्छा!' : stars >= 1 ? '👍 अच्छा!' : '💪 कोशिश जारी रखो!'}
        </div>

        <div className="matra-results-stars">
          {[1,2,3].map(s => (
            <motion.span key={s}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: s * 0.2, type: 'spring' }}>
              {s <= stars ? '⭐' : '☆'}
            </motion.span>
          ))}
        </div>

        <div className="matra-results-grid">
          <div className="matra-result-stat">
            <div className="matra-result-stat-val">{score}</div>
            <div className="matra-result-stat-label">Score</div>
          </div>
          <div className="matra-result-stat">
            <div className="matra-result-stat-val">{accuracy}%</div>
            <div className="matra-result-stat-label">Accuracy</div>
          </div>
          <div className="matra-result-stat">
            <div className="matra-result-stat-val">{maxStreak}</div>
            <div className="matra-result-stat-label">Best Streak</div>
          </div>
          <div className="matra-result-stat">
            <div className="matra-result-stat-val">{correctCount}</div>
            <div className="matra-result-stat-label">Correct</div>
          </div>
          <div className="matra-result-stat">
            <div className="matra-result-stat-val">{totalAnswered}</div>
            <div className="matra-result-stat-label">Attempted</div>
          </div>
          <div className="matra-result-stat">
            <div className="matra-result-stat-val">Lv {currentLevel?.level || 1}</div>
            <div className="matra-result-stat-label">Level</div>
          </div>
        </div>

        <div className="matra-results-actions">
          <button className="matra-action-btn secondary" onClick={() => {
            setScreen('levels');
            fetchData();
          }}>
            📋 Levels
          </button>
          <button className="matra-action-btn" onClick={() => {
            if (currentLevel?.mode === 'learn') {
              startLearnMode(currentLevel);
            } else {
              startGame(selectedCategory);
            }
          }}>
            🔄 Play Again
          </button>
        </div>
      </motion.div>
    );
  };

  // ── Feedback Overlay ──────────────────────────────────────
  const renderFeedback = () => {
    if (!feedback) return null;
    return (
      <AnimatePresence>
        <motion.div className="matra-feedback"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className={`matra-feedback-card ${feedback.type}`}>
            <div className="matra-feedback-emoji">
              {feedback.type === 'correct' ? '🎉' : '😔'}
            </div>
            <div className="matra-feedback-text">{feedback.text}</div>
            <div className="matra-feedback-detail">{feedback.detail}</div>
            {feedback.points > 0 && (
              <div className="matra-feedback-points">+{feedback.points} pts</div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // ── Streak Badge ──────────────────────────────────────────
  const renderStreakBadge = () => {
    if (streak < 3 || screen !== 'play') return null;
    return (
      <motion.div className="matra-streak-badge"
        key={streak} initial={{ scale: 0 }} animate={{ scale: 1 }}>
        🔥 {streak} streak!
      </motion.div>
    );
  };

  // ── Main Render ───────────────────────────────────────────
  return (
    <div className="matra-game">
      {renderBg()}
      {renderStreakBadge()}
      <div className="matra-content">
        {renderTopbar()}
        {screen === 'levels' && renderLevelScreen()}
        {screen === 'category' && renderCategoryScreen()}
        {screen === 'play' && renderPlayScreen()}
        {screen === 'results' && renderResults()}
        {renderFeedback()}
      </div>
    </div>
  );
};

export default MatraGame;
