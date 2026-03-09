import { getLanguageData } from '../akshara-data/gameData';

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ─── USED PROMPTS TRACKER (no repeats within a level) ───
let usedPrompts = new Set();

export function resetUsedPrompts() { usedPrompts = new Set(); }

function pickUnique(pool, keyFn, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const item = pick(pool);
    const key = keyFn(item);
    if (!usedPrompts.has(key)) {
      usedPrompts.add(key);
      return item;
    }
  }
  // Exhausted — reset and return fresh item
  usedPrompts.clear();
  const item = pick(pool);
  usedPrompts.add(keyFn(item));
  return item;
}

// Resolve the consonant+matra arrays from pools for this level+language
function getPoolData(data, level, language) {
  const pool = level.pools?.[language] || { consonants: [], matras: [] };
  const consonants = pool.consonants.length
    ? pool.consonants.map(id => data.consonants.find(c => c.id === id)).filter(Boolean)
    : data.consonants;
  const matras = pool.matras.length
    ? pool.matras.map(id => data.matras.find(m => m.id === id)).filter(Boolean)
    : data.matras;
  return { consonants, matras };
}

export function generateRound(level, language) {
  const data = getLanguageData(language);
  let mode = level.mode;

  if (mode === 'mixed') {
    mode = pick(['forward', 'reverse', 'split']);
  } else if (mode === 'grandmaster') {
    // Grand Master: hardest — split (no picture) + meaning-only (no picture)
    mode = pick(['split', 'meaning', 'meaning', 'split']);
  }

  if (mode === 'wordspot') return generateWordSpotRound(data, level);
  if (mode === 'meaning')  return generateMeaningRound(data, level);
  if (mode === 'word') return generateWordRound(data, level);
  if (mode === 'split') return generateSplitRound(data, level, language);
  if (mode === 'reverse') return generateReverseRound(data, level, language);
  if (mode === 'peek') return generatePeekRound(data, level, language);
  return generateForwardRound(data, level, language);
}

function generateForwardRound(data, level, language) {
  const { consonants, matras } = getPoolData(data, level, language);

  const combos = [];
  consonants.forEach(c => matras.forEach(m => combos.push({ consId: c.id, matraId: m.id })));

  const chosen = pickUnique(combos, c => `combo:${c.consId}+${c.matraId}`);
  const consonant = data.consonants.find(c => c.id === chosen.consId);
  const correctMatra = data.matras.find(m => m.id === chosen.matraId);
  const result = data.syllables[chosen.consId]?.[chosen.matraId] || consonant.symbol + correctMatra.symbol;

  // Distractors: other matras from this level's pool
  const distractorPool = matras.filter(m => m.id !== chosen.matraId);
  const distractorItems = shuffle(distractorPool).slice(0, level.optionCount - 1);
  const distractors = distractorItems.map(m => ({ id: m.id, label: m.symbol, correct: false }));

  const options = shuffle([
    { id: chosen.matraId, label: correctMatra.symbol, correct: true },
    ...distractors,
  ]);

  return {
    mode: 'forward',
    prompt: consonant.symbol,
    promptLabel: consonant.name,
    instruction: `Add a vowel sound to "${consonant.symbol}" to make "${result}"`,
    answer: result,
    options,
  };
}

function generateReverseRound(data, level, language) {
  const { consonants, matras } = getPoolData(data, level, language);

  const combos = [];
  consonants.forEach(c => matras.forEach(m => combos.push({ consId: c.id, matraId: m.id })));
  const chosen = pickUnique(combos, c => `combo:${c.consId}+${c.matraId}`);

  const consonant = data.consonants.find(c => c.id === chosen.consId);
  const matra = data.matras.find(m => m.id === chosen.matraId);
  const syllable = data.syllables[chosen.consId]?.[chosen.matraId] || consonant.symbol + matra.symbol;

  const distractorPool = consonants.filter(c => c.id !== chosen.consId);
  const distractorItems = shuffle(distractorPool).slice(0, level.optionCount - 1);
  const distractors = distractorItems.map(c => ({ id: c.id, label: c.symbol, correct: false }));

  const options = shuffle([
    { id: chosen.consId, label: consonant.symbol, correct: true },
    ...distractors,
  ]);

  return {
    mode: 'reverse',
    prompt: syllable,
    promptLabel: 'syllable',
    instruction: `Which consonant is in "${syllable}"?`,
    answer: consonant.symbol,
    options,
  };
}

// ─── SPLIT MODE: show a syllable, ask which matra is in it ───
function generateSplitRound(data, level, language) {
  const { consonants, matras } = getPoolData(data, level, language);

  const combos = [];
  consonants.forEach(c => matras.forEach(m => combos.push({ consId: c.id, matraId: m.id })));
  const chosen = pickUnique(combos, c => `combo:${c.consId}+${c.matraId}`);

  const consonant = data.consonants.find(c => c.id === chosen.consId);
  const matra = data.matras.find(m => m.id === chosen.matraId);
  const syllable = data.syllables[chosen.consId]?.[chosen.matraId] || consonant.symbol + matra.symbol;

  const distractorPool = matras.filter(m => m.id !== chosen.matraId);
  const distractorItems = shuffle(distractorPool).slice(0, level.optionCount - 1);
  const distractors = distractorItems.map(m => ({ id: m.id, label: m.symbol, correct: false }));

  const options = shuffle([
    { id: chosen.matraId, label: matra.symbol, correct: true },
    ...distractors,
  ]);

  return {
    mode: 'split',
    prompt: syllable,
    promptLabel: `${consonant.name} + ?`,
    instruction: `"${syllable}" = "${consonant.symbol}" + which vowel sound?`,
    answer: matra.symbol,
    options,
  };
}

// ─── WORD SPOT MODE (L6): Picture quiz — show emoji, pick the correct word ───
function generateWordSpotRound(data, level) {
  const pool = data.vocabWords ? (typeof data.vocabWords === 'function' ? data.vocabWords() : data.vocabWords) : data.words;
  if (!pool || pool.length === 0) return generateForwardRound(data, level, 'hindi');

  const word = pickUnique(pool, w => `vocab:${w.combined}`);

  // Distractors: 3 other words from the pool
  const otherWords = shuffle(pool.filter(w => w.combined !== word.combined)).slice(0, level.optionCount - 1);

  const options = shuffle([
    { id: 'correct', label: word.combined, correct: true },
    ...otherWords.map((w, i) => ({ id: `d${i}`, label: w.combined, correct: false })),
  ]);

  return {
    mode: 'wordspot',
    prompt: word.emoji || '🖼️',
    promptLabel: '',
    instruction: 'Which word matches the picture?',
    answer: word.combined,
    meaning: word.meaning,
    emoji: word.emoji,
    options,
  };
}

// ─── MEANING MODE (L7 + grandmaster): NO picture — only English meaning text ───
// Hardest vocab mode: no emoji visual cue, player must know the word from meaning alone
function generateMeaningRound(data, level) {
  const pool = data.vocabWords ? (typeof data.vocabWords === 'function' ? data.vocabWords() : data.vocabWords) : data.words;
  if (!pool || pool.length === 0) return generateForwardRound(data, level, 'hindi');

  const word = pickUnique(pool, w => `vocab:${w.combined}`);

  // Distractors: same-category words make it hardest (all animals, all fruits, etc.)
  const sameCategory = pool.filter(w => w.combined !== word.combined && w.category === word.category);
  const otherWords = sameCategory.length >= level.optionCount - 1
    ? shuffle(sameCategory).slice(0, level.optionCount - 1)
    : shuffle(pool.filter(w => w.combined !== word.combined)).slice(0, level.optionCount - 1);

  const options = shuffle([
    { id: 'correct', label: word.combined, correct: true },
    ...otherWords.map((w, i) => ({ id: `d${i}`, label: w.combined, correct: false })),
  ]);

  return {
    mode: 'meaning',
    prompt: word.meaning,        // TEXT ONLY — no emoji shown in prompt
    promptLabel: '',
    instruction: `Which word means "${word.meaning}"?`,
    answer: word.combined,
    meaning: word.meaning,
    emoji: null,                  // no emoji — intentional
    fullWord: word.combined,
    options,
  };
}


function generatePeekRound(data, level, language) {
  const { consonants, matras } = getPoolData(data, level, language);

  const combos = [];
  consonants.forEach(c => matras.forEach(m => combos.push({ consId: c.id, matraId: m.id })));
  const chosen = pickUnique(combos, c => `combo:${c.consId}+${c.matraId}`);

  const consonant = data.consonants.find(c => c.id === chosen.consId);
  const matra = data.matras.find(m => m.id === chosen.matraId);
  const syllable = data.syllables[chosen.consId]?.[chosen.matraId] || consonant.symbol + matra.symbol;

  const distractorPool = matras.filter(m => m.id !== chosen.matraId);
  const distractorItems = shuffle(distractorPool).slice(0, level.optionCount - 1);
  const distractors = distractorItems.map(m => ({ id: m.id, label: m.symbol, correct: false }));

  const options = shuffle([
    { id: chosen.matraId, label: matra.symbol, correct: true },
    ...distractors,
  ]);

  return {
    mode: 'peek',
    prompt: consonant.symbol,
    peekSyllable: syllable,   // shown briefly then hidden
    promptLabel: `${consonant.name} + ???`,
    instruction: `You saw it — which matra was added to "${consonant.symbol}"?`,
    answer: matra.symbol,
    options,
  };
}

function generateWordRound(data, level) {
  if (!data.words || data.words.length === 0) {
    return generateForwardRound(data, level, 'hindi');
  }
  const word = pickUnique(data.words, w => `vocab:${w.combined}`);

  // Show emoji as picture, give 4 complete word choices — no blanks, no single letters
  const otherWords = shuffle(data.words.filter(w => w.combined !== word.combined))
    .slice(0, level.optionCount - 1);

  const options = shuffle([
    { id: 'correct', label: word.combined, correct: true },
    ...otherWords.map((w, i) => ({ id: `d${i}`, label: w.combined, correct: false })),
  ]);

  return {
    mode: 'word',
    prompt: word.emoji || '🖼️',
    promptLabel: word.meaning || '',
    instruction: 'Which word matches the picture?',
    answer: word.combined,
    meaning: word.meaning,
    emoji: word.emoji,
    options,
  };
}

export function calcStars(correct, total) {
  const pct = correct / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.7) return 2;
  if (pct >= 0.4) return 1;
  return 0;
}

export function calcScore(correct, streak, levelId) {
  const base = correct * 10 * levelId;
  const streakBonus = Math.floor(streak * 5);
  return base + streakBonus;
}
