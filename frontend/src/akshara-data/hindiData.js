// Hindi Akshara Data — matras, consonants, syllable combos
// Each matra has: symbol, name, vowel sound, and a "combine" function concept

const hindiMatras = [
  { id: 'aa', symbol: 'ा', name: 'aa matra', vowel: 'आ' },
  { id: 'i', symbol: 'ि', name: 'chhoti i matra', vowel: 'इ' },
  { id: 'ii', symbol: 'ी', name: 'badi ee matra', vowel: 'ई' },
  { id: 'u', symbol: 'ु', name: 'chhota u matra', vowel: 'उ' },
  { id: 'uu', symbol: 'ू', name: 'bada oo matra', vowel: 'ऊ' },
  { id: 'e', symbol: 'े', name: 'e matra', vowel: 'ए' },
  { id: 'ai', symbol: 'ै', name: 'ai matra', vowel: 'ऐ' },
  { id: 'o', symbol: 'ो', name: 'o matra', vowel: 'ओ' },
  { id: 'au', symbol: 'ौ', name: 'au matra', vowel: 'औ' },
];

const hindiConsonants = [
  { id: 'ka', symbol: 'क', name: 'ka' },
  { id: 'kha', symbol: 'ख', name: 'kha' },
  { id: 'ga', symbol: 'ग', name: 'ga' },
  { id: 'gha', symbol: 'घ', name: 'gha' },
  { id: 'cha', symbol: 'च', name: 'cha' },
  { id: 'ja', symbol: 'ज', name: 'ja' },
  { id: 'ta1', symbol: 'ट', name: 'Ta' },
  { id: 'da1', symbol: 'ड', name: 'Da' },
  { id: 'ta2', symbol: 'त', name: 'ta' },
  { id: 'da2', symbol: 'द', name: 'da' },
  { id: 'na', symbol: 'न', name: 'na' },
  { id: 'pa', symbol: 'प', name: 'pa' },
  { id: 'pha', symbol: 'फ', name: 'pha' },
  { id: 'ba', symbol: 'ब', name: 'ba' },
  { id: 'ma', symbol: 'म', name: 'ma' },
  { id: 'ya', symbol: 'य', name: 'ya' },
  { id: 'ra', symbol: 'र', name: 'ra' },
  { id: 'la', symbol: 'ल', name: 'la' },
  { id: 'va', symbol: 'व', name: 'va' },
  { id: 'sha', symbol: 'श', name: 'sha' },
  { id: 'sa', symbol: 'स', name: 'sa' },
  { id: 'ha', symbol: 'ह', name: 'ha' },
  { id: 'tha', symbol: 'थ', name: 'tha' },
  { id: 'dha', symbol: 'ध', name: 'dha' },
  { id: 'bha', symbol: 'भ', name: 'bha' },
];

// Pre-built syllable combos for levels
const hindiSyllables = {};
hindiConsonants.forEach(c => {
  hindiSyllables[c.id] = {};
  hindiMatras.forEach(m => {
    hindiSyllables[c.id][m.id] = c.symbol + m.symbol;
  });
});

// Difficulty-tiered matra groups
const hindiStage1Matras = ['aa', 'i', 'ii', 'u'];        // Simple, visually distinct
const hindiStage2Matras = ['aa', 'i', 'ii', 'u', 'uu', 'e', 'ai'];  // Similar-looking
const hindiStage3Matras = ['aa', 'i', 'ii', 'u', 'uu', 'e', 'ai', 'o', 'au'];

// Stage 1 consonants (simple, common)
const hindiStage1Consonants = ['ka', 'ga', 'cha', 'ta2', 'pa', 'ma', 'ra', 'la'];
const hindiStage2Consonants = ['ka', 'kha', 'ga', 'gha', 'cha', 'ja', 'ta2', 'da2', 'na', 'pa', 'ba', 'ma'];

// Simple words for Word Mode (L5) — 24 unique, NO overlap with hindiVocabWords below
const hindiWords = [
  { parts: ['क', 'ल'], combined: 'कल', meaning: 'yesterday', emoji: '📅' },
  { parts: ['म', 'न'], combined: 'मन', meaning: 'mind', emoji: '🧠' },
  { parts: ['प', 'ल'], combined: 'पल', meaning: 'moment', emoji: '⏳' },
  { parts: ['ग', 'म'], combined: 'गम', meaning: 'sorrow', emoji: '😢' },
  { parts: ['न', 'ल'], combined: 'नल', meaning: 'tap', emoji: '🚰' },
  { parts: ['दि', 'न'], combined: 'दिन', meaning: 'day', emoji: '🌤️' },
  { parts: ['क', 'मल'], combined: 'कमल', meaning: 'lotus', emoji: '🪷' },
  { parts: ['ना', 'म'], combined: 'नाम', meaning: 'name', emoji: '📛' },
  { parts: ['जा', 'म'], combined: 'जाम', meaning: 'jam', emoji: '🍓' },
  { parts: ['चा', 'य'], combined: 'चाय', meaning: 'tea', emoji: '🍵' },
  { parts: ['बा', 'ल'], combined: 'बाल', meaning: 'hair', emoji: '💇' },
  { parts: ['गा', 'ना'], combined: 'गाना', meaning: 'song', emoji: '🎵' },
  { parts: ['मा', 'ला'], combined: 'माला', meaning: 'garland', emoji: '📿' },
  { parts: ['ना', 'ना'], combined: 'नाना', meaning: 'maternal grandpa', emoji: '👴' },
  { parts: ['दा', 'दा'], combined: 'दादा', meaning: 'paternal grandpa', emoji: '👨‍🦳' },
  { parts: ['का', 'ला'], combined: 'काला', meaning: 'black', emoji: '⚫' },
  { parts: ['रा', 'म'], combined: 'राम', meaning: 'Ram', emoji: '🙏' },
  { parts: ['ता', 'रा'], combined: 'तारा', meaning: 'star', emoji: '⭐' },
  { parts: ['मे', 'ला'], combined: 'मेला', meaning: 'fair/fest', emoji: '🎡' },
  { parts: ['खे', 'ल'], combined: 'खेल', meaning: 'game', emoji: '🎮' },
  { parts: ['ज', 'ल'], combined: 'जल', meaning: 'water', emoji: '💦' },
  { parts: ['फ', 'ल'], combined: 'फल', meaning: 'fruit', emoji: '🍑' },
  { parts: ['र', 'थ'], combined: 'रथ', meaning: 'chariot', emoji: '🛕' },
  { parts: ['व', 'न'], combined: 'वन', meaning: 'forest', emoji: '🌲' },
];

// ─── VOCABULARY WORDS for Level 5 & 6 ───
// Each word has: parts (syllables), combined (full word), meaning, emoji
// The key syllable (keyIdx) is the one the player must identify — richer pedagogically
function hindiVocabWords() { return _hindiVocabWords; }
const _hindiVocabWords = [
  // Nature
  { parts: ['आम'], combined: 'आम', meaning: 'mango', emoji: '🥭', keyIdx: 0, keyMatra: 'aa', keyCons: 'ma' },
  { parts: ['पानी'], combined: 'पानी', meaning: 'water', emoji: '💧', keyIdx: 0, keyMatra: 'aa', keyCons: 'pa' },
  { parts: ['फूल'], combined: 'फूल', meaning: 'flower', emoji: '🌸', keyIdx: 0, keyMatra: 'uu', keyCons: 'pha' },
  { parts: ['नदी'], combined: 'नदी', meaning: 'river', emoji: '🏞️', keyIdx: 0, keyMatra: 'i', keyCons: 'na' },
  { parts: ['रात'], combined: 'रात', meaning: 'night', emoji: '🌙', keyIdx: 0, keyMatra: 'aa', keyCons: 'ra' },
  { parts: ['धूप'], combined: 'धूप', meaning: 'sunshine', emoji: '☀️', keyIdx: 0, keyMatra: 'uu', keyCons: 'dha' },
  // Animals
  { parts: ['बिल्ली'], combined: 'बिल्ली', meaning: 'cat', emoji: '🐱', keyIdx: 0, keyMatra: 'i', keyCons: 'ba' },
  { parts: ['कुत्ता'], combined: 'कुत्ता', meaning: 'dog', emoji: '🐶', keyIdx: 0, keyMatra: 'u', keyCons: 'ka' },
  { parts: ['मछली'], combined: 'मछली', meaning: 'fish', emoji: '🐟', keyIdx: 0, keyMatra: 'a', keyCons: 'ma' },
  { parts: ['गाय'], combined: 'गाय', meaning: 'cow', emoji: '🐄', keyIdx: 0, keyMatra: 'aa', keyCons: 'ga' },
  { parts: ['शेर'], combined: 'शेर', meaning: 'lion', emoji: '🦁', keyIdx: 0, keyMatra: 'e', keyCons: 'sha' },
  { parts: ['हाथी'], combined: 'हाथी', meaning: 'elephant', emoji: '🐘', keyIdx: 0, keyMatra: 'aa', keyCons: 'ha' },
  // Family
  { parts: ['माँ'], combined: 'माँ', meaning: 'mother', emoji: '👩', keyIdx: 0, keyMatra: 'aa', keyCons: 'ma' },
  { parts: ['बाबा'], combined: 'बाबा', meaning: 'father', emoji: '👨', keyIdx: 0, keyMatra: 'aa', keyCons: 'ba' },
  { parts: ['भाई'], combined: 'भाई', meaning: 'brother', emoji: '👦', keyIdx: 0, keyMatra: 'aa', keyCons: 'bha' },
  { parts: ['बहन'], combined: 'बहन', meaning: 'sister', emoji: '👧', keyIdx: 0, keyMatra: 'a', keyCons: 'ba' },
  // Food
  { parts: ['रोटी'], combined: 'रोटी', meaning: 'bread', emoji: '🫓', keyIdx: 0, keyMatra: 'o', keyCons: 'ra' },
  { parts: ['दूध'], combined: 'दूध', meaning: 'milk', emoji: '🥛', keyIdx: 0, keyMatra: 'uu', keyCons: 'da2' },
  { parts: ['सेब'], combined: 'सेब', meaning: 'apple', emoji: '🍎', keyIdx: 0, keyMatra: 'e', keyCons: 'sa' },
  { parts: ['केला'], combined: 'केला', meaning: 'banana', emoji: '🍌', keyIdx: 0, keyMatra: 'e', keyCons: 'ka' },
  // Body / Actions
  { parts: ['हाथ'], combined: 'हाथ', meaning: 'hand', emoji: '🤚', keyIdx: 0, keyMatra: 'aa', keyCons: 'ha' },
  { parts: ['नाक'], combined: 'नाक', meaning: 'nose', emoji: '👃', keyIdx: 0, keyMatra: 'aa', keyCons: 'na' },
  { parts: ['आँख'], combined: 'आँख', meaning: 'eye', emoji: '👁️', keyIdx: 0, keyMatra: 'aa', keyCons: 'ma' },
  // Objects
  { parts: ['घर'], combined: 'घर', meaning: 'home', emoji: '🏠', keyIdx: 0, keyMatra: 'a', keyCons: 'gha' },
  { parts: ['किताब'], combined: 'किताब', meaning: 'book', emoji: '📚', keyIdx: 0, keyMatra: 'i', keyCons: 'ka' },
  { parts: ['कलम'], combined: 'कलम', meaning: 'pen', emoji: '✏️', keyIdx: 0, keyMatra: 'a', keyCons: 'ka' },
  { parts: ['थाली'], combined: 'थाली', meaning: 'plate', emoji: '🍽️', keyIdx: 0, keyMatra: 'aa', keyCons: 'tha' },
];

export {
  hindiMatras,
  hindiConsonants,
  hindiSyllables,
  hindiStage1Matras,
  hindiStage2Matras,
  hindiStage3Matras,
  hindiStage1Consonants,
  hindiStage2Consonants,
  hindiWords,
  hindiVocabWords,
};

