// Unified data loader — selects Hindi or Telugu data based on language setting

import * as hindi from './hindiData';
import * as telugu from './teluguData';

export function getLanguageData(lang) {
  if (lang === 'telugu') {
    return {
      matras: telugu.teluguMatras,
      consonants: telugu.teluguConsonants,
      syllables: telugu.teluguSyllables,
      words: telugu.teluguWords,
      vocabWords: telugu.teluguVocabWords,
    };
  }
  return {
    matras: hindi.hindiMatras,
    consonants: hindi.hindiConsonants,
    syllables: hindi.hindiSyllables,
    words: hindi.hindiWords,
    vocabWords: hindi.hindiVocabWords,
  };
}

// ─────────────────────────────────────────────────────────────
//  PER-LEVEL LANGUAGE-SPECIFIC CONSONANT + MATRA POOLS
//  Each level has its own exclusive subset — NO overlap across levels 1-4.
//  L5-L8 use word/vocab lists, not pools.
// ─────────────────────────────────────────────────────────────
export const LEVELS = [
  {
    id: 1, name: 'First Touch', emoji: '🌱', stage: 'Discover',
    description: 'See a letter — pick the right vowel to build the sound!',
    rounds: 6, mode: 'forward', optionCount: 4, speed: 'slow', penalty: false, lives: 5,
    color: '#34d399', unlockRequirement: 0,
    pools: {
      hindi:  { consonants: ['ka', 'ma', 'ra', 'la', 'ga'],  matras: ['aa', 'i', 'ii', 'u'] },
      telugu: { consonants: ['ka', 'ma', 'ra', 'la', 'ga'],  matras: ['aa', 'i', 'ii', 'u'] },
    },
  },
  {
    id: 2, name: 'Hear & Find', emoji: '👂', stage: 'Discover',
    description: 'See a full syllable — pick which letter is hiding inside!',
    rounds: 6, mode: 'reverse', optionCount: 4, speed: 'slow', penalty: false, lives: 5,
    color: '#60a5fa', unlockRequirement: 1,
    pools: {
      hindi:  { consonants: ['na', 'pa', 'ba', 'sa', 'ha'],  matras: ['aa', 'i', 'uu', 'e'] },
      telugu: { consonants: ['na', 'cha', 'va', 'sa', 'ha'], matras: ['aa', 'i', 'uu', 'e'] },
    },
  },
  {
    id: 3, name: 'Split & Find', emoji: '✂️', stage: 'Guided',
    description: 'Break the syllable apart — which vowel sound is inside?',
    rounds: 7, mode: 'split', optionCount: 4, speed: 'normal', penalty: false, lives: 4,
    color: '#a855f7', unlockRequirement: 2,
    pools: {
      hindi:  { consonants: ['ta2', 'da2', 'cha', 'ja', 'va', 'ya'], matras: ['uu', 'e', 'ai', 'o'] },
      telugu: { consonants: ['ta2', 'da2', 'pa', 'ba', 'ja', 'ya'],  matras: ['uu', 'e', 'ee', 'o'] },
    },
  },
  {
    id: 4, name: 'Sharp Eyes', emoji: '👁️', stage: 'Guided',
    description: 'Mix of joining & splitting — trickier letters, no hints!',
    rounds: 8, mode: 'mixed', optionCount: 4, speed: 'normal', penalty: true, lives: 4,
    color: '#f472b6', unlockRequirement: 3,
    pools: {
      hindi:  { consonants: ['kha', 'gha', 'pha', 'sha', 'tha', 'dha'], matras: ['ai', 'o', 'au', 'ii'] },
      telugu: { consonants: ['kha', 'gha', 'pha', 'sha', 'ta1', 'da1'], matras: ['ai', 'oo', 'au', 'ii'] },
    },
  },
  {
    id: 5, name: 'Picture Words', emoji: '🖼️', stage: 'Words',
    description: 'See a picture — pick the correct word for it!',
    rounds: 8, mode: 'word', optionCount: 4, speed: 'normal', penalty: true, lives: 3,
    color: '#06b6d4', unlockRequirement: 4,
    pools: { hindi: { consonants: [], matras: [] }, telugu: { consonants: [], matras: [] } },
  },
  {
    id: 6, name: 'Word Hunt', emoji: '🕵️', stage: 'Words',
    description: 'See a picture — pick the right word from harder choices!',
    rounds: 8, mode: 'wordspot', optionCount: 4, speed: 'normal', penalty: true, lives: 3,
    color: '#f97316', unlockRequirement: 5,
    pools: { hindi: { consonants: [], matras: [] }, telugu: { consonants: [], matras: [] } },
  },
  {
    id: 7, name: 'Meaning Match', emoji: '🧠', stage: 'Mastery',
    description: 'Only the meaning — no picture! Recall the correct word.',
    rounds: 8, mode: 'meaning', optionCount: 4, speed: 'normal', penalty: true, lives: 3,
    color: '#eab308', unlockRequirement: 6,
    pools: { hindi: { consonants: [], matras: [] }, telugu: { consonants: [], matras: [] } },
  },
  {
    id: 8, name: 'Grand Master', emoji: '👑', stage: 'Mastery',
    description: 'No hints, no picture — only meaning text. Ultimate test!',
    rounds: 10, mode: 'grandmaster', optionCount: 5, speed: 'fast', penalty: true, lives: 3,
    color: '#ef4444', unlockRequirement: 7,
    pools: {
      hindi:  { consonants: ['ka','kha','ga','gha','cha','ja','ta2','da2','na','pa','ba','ma','ra','la','va','sha','sa','ha','ya','pha','tha','dha','ta1','da1'],
                matras: ['aa','i','ii','u','uu','e','ai','o','au'] },
      telugu: { consonants: ['ka','kha','ga','gha','cha','ja','ta2','da2','na','pa','ba','ma','ra','la','va','sha','sa','ha','ya','pha','ta1','da1'],
                matras: ['aa','i','ii','u','uu','e','ee','ai','o','oo','au'] },
    },
  },
];

export const WRONG_MESSAGES = [
  'Oops! Try again! 🤔',
  'Not quite! 😅',
  'Almost there! 💪',
  "Hmm, that's not it! 🧐",
  'Keep trying! 🌈',
  'So close! ✨',
];

export const CORRECT_MESSAGES = [
  'Amazing! 🎉',
  'Perfect! ✨',
  'Brilliant! 🌟',
  'Wonderful! 💫',
  'You got it! 🔥',
  'Superstar! ⭐',
  'Magnificent! 🎊',
  'Incredible! 💖',
];
