// Telugu Akshara Data — gunintaalu (vowel signs), hallulu (consonants)

const teluguMatras = [
  { id: 'aa', symbol: 'ా', name: 'aa gunintam', vowel: 'ఆ' },
  { id: 'i', symbol: 'ి', name: 'i gunintam', vowel: 'ఇ' },
  { id: 'ii', symbol: 'ీ', name: 'ee gunintam', vowel: 'ఈ' },
  { id: 'u', symbol: 'ు', name: 'u gunintam', vowel: 'ఉ' },
  { id: 'uu', symbol: 'ూ', name: 'oo gunintam', vowel: 'ఊ' },
  { id: 'e', symbol: 'ె', name: 'e gunintam', vowel: 'ఎ' },
  { id: 'ee', symbol: 'ే', name: 'ee gunintam', vowel: 'ఏ' },
  { id: 'ai', symbol: 'ై', name: 'ai gunintam', vowel: 'ఐ' },
  { id: 'o', symbol: 'ొ', name: 'o gunintam', vowel: 'ఒ' },
  { id: 'oo', symbol: 'ో', name: 'oo gunintam', vowel: 'ఓ' },
  { id: 'au', symbol: 'ౌ', name: 'au gunintam', vowel: 'ఔ' },
];

const teluguConsonants = [
  { id: 'ka', symbol: 'క', name: 'ka' },
  { id: 'kha', symbol: 'ఖ', name: 'kha' },
  { id: 'ga', symbol: 'గ', name: 'ga' },
  { id: 'gha', symbol: 'ఘ', name: 'gha' },
  { id: 'cha', symbol: 'చ', name: 'cha' },
  { id: 'ja', symbol: 'జ', name: 'ja' },
  { id: 'ta1', symbol: 'ట', name: 'Ta' },
  { id: 'da1', symbol: 'డ', name: 'Da' },
  { id: 'ta2', symbol: 'త', name: 'ta' },
  { id: 'da2', symbol: 'ద', name: 'da' },
  { id: 'na', symbol: 'న', name: 'na' },
  { id: 'pa', symbol: 'ప', name: 'pa' },
  { id: 'pha', symbol: 'ఫ', name: 'pha' },
  { id: 'ba', symbol: 'బ', name: 'ba' },
  { id: 'ma', symbol: 'మ', name: 'ma' },
  { id: 'ya', symbol: 'య', name: 'ya' },
  { id: 'ra', symbol: 'ర', name: 'ra' },
  { id: 'la', symbol: 'ల', name: 'la' },
  { id: 'va', symbol: 'వ', name: 'va' },
  { id: 'sha', symbol: 'శ', name: 'sha' },
  { id: 'sa', symbol: 'స', name: 'sa' },
  { id: 'ha', symbol: 'హ', name: 'ha' },
];

const teluguSyllables = {};
teluguConsonants.forEach(c => {
  teluguSyllables[c.id] = {};
  teluguMatras.forEach(m => {
    teluguSyllables[c.id][m.id] = c.symbol + m.symbol;
  });
});

const teluguStage1Matras = ['aa', 'i', 'ii', 'u'];
const teluguStage2Matras = ['aa', 'i', 'ii', 'u', 'uu', 'e', 'ee'];
const teluguStage3Matras = ['aa', 'i', 'ii', 'u', 'uu', 'e', 'ee', 'ai', 'o', 'oo', 'au'];

const teluguStage1Consonants = ['ka', 'ga', 'cha', 'ta2', 'pa', 'ma', 'ra', 'la'];
const teluguStage2Consonants = ['ka', 'kha', 'ga', 'gha', 'cha', 'ja', 'ta2', 'da2', 'na', 'pa', 'ba', 'ma'];

// L5 simple words — used in 'word' mode. 24 unique entries, no overlap with vocabWords below.
const teluguWords = [
  { parts: ['అమ్మ'], combined: 'అమ్మ', meaning: 'mother', emoji: '👩' },
  { parts: ['నాన్న'], combined: 'నాన్న', meaning: 'father', emoji: '👨' },
  { parts: ['అన్న'], combined: 'అన్న', meaning: 'brother', emoji: '👦' },
  { parts: ['అక్క'], combined: 'అక్క', meaning: 'sister', emoji: '👧' },
  { parts: ['పాల'], combined: 'పాల', meaning: 'milk', emoji: '🥛' },
  { parts: ['నీళ్ళు'], combined: 'నీళ్ళు', meaning: 'water', emoji: '💧' },
  { parts: ['అరటి'], combined: 'అరటి', meaning: 'banana', emoji: '🍌' },
  { parts: ['మామిడి'], combined: 'మామిడి', meaning: 'mango', emoji: '🥭' },
  { parts: ['ఇల్లు'], combined: 'ఇల్లు', meaning: 'house', emoji: '🏠' },
  { parts: ['కుక్క'], combined: 'కుక్క', meaning: 'dog', emoji: '🐶' },
  { parts: ['పిల్లి'], combined: 'పిల్లి', meaning: 'cat', emoji: '🐱' },
  { parts: ['ఆవు'], combined: 'ఆవు', meaning: 'cow', emoji: '🐄' },
  { parts: ['చేప'], combined: 'చేప', meaning: 'fish', emoji: '🐟' },
  { parts: ['పాట'], combined: 'పాట', meaning: 'song', emoji: '🎵' },
  { parts: ['పువ్వు'], combined: 'పువ్వు', meaning: 'flower', emoji: '🌸' },
  { parts: ['చెట్టు'], combined: 'చెట్టు', meaning: 'tree', emoji: '🌳' },
  { parts: ['నది'], combined: 'నది', meaning: 'river', emoji: '🏞️' },
  { parts: ['రాత'], combined: 'రాత', meaning: 'night', emoji: '🌙' },
  { parts: ['పొద్దు'], combined: 'పొద్దు', meaning: 'sun/day', emoji: '☀️' },
  { parts: ['చేయి'], combined: 'చేయి', meaning: 'hand', emoji: '🤚' },
  { parts: ['కన్ను'], combined: 'కన్ను', meaning: 'eye', emoji: '👁️' },
  { parts: ['నోరు'], combined: 'నోరు', meaning: 'mouth', emoji: '👄' },
  { parts: ['పుస్తకం'], combined: 'పుస్తకం', meaning: 'book', emoji: '📚' },
  { parts: ['బంతి'], combined: 'బంతి', meaning: 'ball', emoji: '⚽' },
];

// ─── VOCABULARY WORDS for Level 6 & 7 ───
// All 27 entries are DIFFERENT from teluguWords above — zero overlap.
function teluguVocabWords() { return _teluguVocabWords; }
const _teluguVocabWords = [
  // Animals (different from L5 which has dog/cat/cow/fish)
  { combined: 'సింహం', meaning: 'lion', emoji: '🦁', category: 'animal', keyIdx: 0, keyMatra: 'i', keyCons: 'sa' },
  { combined: 'ఏనుగు', meaning: 'elephant', emoji: '🐘', category: 'animal', keyIdx: 0, keyMatra: 'ee', keyCons: 'na' },
  { combined: 'పులి', meaning: 'tiger', emoji: '🐯', category: 'animal', keyIdx: 0, keyMatra: 'u', keyCons: 'pa' },
  { combined: 'కోతి', meaning: 'monkey', emoji: '🐒', category: 'animal', keyIdx: 0, keyMatra: 'oo', keyCons: 'ka' },
  { combined: 'గుర్రం', meaning: 'horse', emoji: '🐴', category: 'animal', keyIdx: 0, keyMatra: 'u', keyCons: 'ga' },
  { combined: 'పక్షి', meaning: 'bird', emoji: '🐦', category: 'animal', keyIdx: 0, keyMatra: 'a', keyCons: 'pa' },
  // Food (different from L5 which has milk/banana/mango)
  { combined: 'అన్నం', meaning: 'rice', emoji: '🍚', category: 'food', keyIdx: 0, keyMatra: 'a', keyCons: 'na' },
  { combined: 'రొట్టె', meaning: 'bread', emoji: '🫓', category: 'food', keyIdx: 0, keyMatra: 'o', keyCons: 'ra' },
  { combined: 'పప్పు', meaning: 'lentils', emoji: '🫘', category: 'food', keyIdx: 0, keyMatra: 'a', keyCons: 'pa' },
  { combined: 'మిఠాయి', meaning: 'sweet', emoji: '🍬', category: 'food', keyIdx: 0, keyMatra: 'i', keyCons: 'ma' },
  { combined: 'ఆపిల్', meaning: 'apple', emoji: '🍎', category: 'food', keyIdx: 0, keyMatra: 'aa', keyCons: 'ya' },
  { combined: 'నారింజ', meaning: 'orange', emoji: '🍊', category: 'food', keyIdx: 0, keyMatra: 'aa', keyCons: 'na' },
  // Nature (different from L5 which has river/night/sun/flower/tree)
  { combined: 'మబ్బు', meaning: 'cloud', emoji: '☁️', category: 'nature', keyIdx: 0, keyMatra: 'a', keyCons: 'ma' },
  { combined: 'వర్షం', meaning: 'rain', emoji: '🌧️', category: 'nature', keyIdx: 0, keyMatra: 'a', keyCons: 'va' },
  { combined: 'నక్షత్రం', meaning: 'star', emoji: '⭐', category: 'nature', keyIdx: 0, keyMatra: 'a', keyCons: 'na' },
  { combined: 'సముద్రం', meaning: 'ocean', emoji: '🌊', category: 'nature', keyIdx: 0, keyMatra: 'a', keyCons: 'sa' },
  // Family (different from L5 which has mother/father/brother/sister)
  { combined: 'తాత', meaning: 'grandfather', emoji: '👴', category: 'family', keyIdx: 0, keyMatra: 'aa', keyCons: 'ta2' },
  { combined: 'నానమ్మ', meaning: 'grandmother', emoji: '👵', category: 'family', keyIdx: 0, keyMatra: 'aa', keyCons: 'na' },
  { combined: 'బిడ్డ', meaning: 'child/baby', emoji: '👶', category: 'family', keyIdx: 0, keyMatra: 'i', keyCons: 'ba' },
  // Body (different from L5 which has hand/eye/mouth)
  { combined: 'ముక్కు', meaning: 'nose', emoji: '👃', category: 'body', keyIdx: 0, keyMatra: 'u', keyCons: 'ma' },
  { combined: 'చెవి', meaning: 'ear', emoji: '👂', category: 'body', keyIdx: 0, keyMatra: 'e', keyCons: 'cha' },
  { combined: 'పళ్ళు', meaning: 'teeth', emoji: '🦷', category: 'body', keyIdx: 0, keyMatra: 'u', keyCons: 'la' },
  // Objects (different from L5 which has book/ball)
  { combined: 'కత్తెర', meaning: 'scissors', emoji: '✂️', category: 'object', keyIdx: 0, keyMatra: 'a', keyCons: 'ka' },
  { combined: 'గడియారం', meaning: 'clock', emoji: '🕐', category: 'object', keyIdx: 0, keyMatra: 'a', keyCons: 'ga' },
  { combined: 'బల్ల', meaning: 'table', emoji: '🪑', category: 'object', keyIdx: 0, keyMatra: 'a', keyCons: 'ba' },
  { combined: 'కిటికీ', meaning: 'window', emoji: '🪟', category: 'object', keyIdx: 0, keyMatra: 'i', keyCons: 'ka' },
  { combined: 'తలుపు', meaning: 'door', emoji: '🚪', category: 'object', keyIdx: 0, keyMatra: 'a', keyCons: 'ta2' },
];

export {
  teluguMatras,
  teluguConsonants,
  teluguSyllables,
  teluguStage1Matras,
  teluguStage2Matras,
  teluguStage3Matras,
  teluguStage1Consonants,
  teluguStage2Consonants,
  teluguWords,
  teluguVocabWords,
};

