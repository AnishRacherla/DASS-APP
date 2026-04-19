const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Leaderboard = require('../models/Leaderboard');
const Score = require('../models/Score');
const HindiLetter  = require('../models/HindiLetter');
const TeluguLetter = require('../models/TeluguLetter');
const HindiMatra   = require('../models/HindiMatra');
const TeluguMatra  = require('../models/TeluguMatra');
const HindiWord    = require('../models/HindiWord');
const TeluguWord   = require('../models/TeluguWord');

// ─── GAME DATA ROUTES ───────────────────────────────────────────────────────

// GET all Hindi letters  — /api/hindi/letters
router.get('/hindi/letters', async (req, res) => {
  try { res.json(await HindiLetter.find().sort({ stage: 1, levelIntroduced: 1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// GET all Telugu letters — /api/telugu/letters
router.get('/telugu/letters', async (req, res) => {
  try { res.json(await TeluguLetter.find().sort({ stage: 1, levelIntroduced: 1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// GET all Hindi matras  — /api/hindi/matras
router.get('/hindi/matras', async (req, res) => {
  try { res.json(await HindiMatra.find().sort({ stage: 1, levelIntroduced: 1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// GET all Telugu matras — /api/telugu/matras
router.get('/telugu/matras', async (req, res) => {
  try { res.json(await TeluguMatra.find().sort({ stage: 1, levelIntroduced: 1 })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

// GET all Hindi words   — /api/hindi/words  (optional ?category=food&level=5)
router.get('/hindi/words', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.level)    filter.levelIntroduced = Number(req.query.level);
    res.json(await HindiWord.find(filter).sort({ levelIntroduced: 1, category: 1 }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET all Telugu words  — /api/telugu/words
router.get('/telugu/words', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.level)    filter.levelIntroduced = Number(req.query.level);
    res.json(await TeluguWord.find(filter).sort({ levelIntroduced: 1, category: 1 }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET summary of all collections — /api/data/summary
router.get('/data/summary', async (req, res) => {
  try {
    const [hl, tl, hm, tm, hw, tw, players, lb] = await Promise.all([
      HindiLetter.countDocuments(),
      TeluguLetter.countDocuments(),
      HindiMatra.countDocuments(),
      TeluguMatra.countDocuments(),
      HindiWord.countDocuments(),
      TeluguWord.countDocuments(),
      Player.countDocuments(),
      Leaderboard.countDocuments(),
    ]);
    res.json({
      collections: {
        hindi_letters:  hl,
        telugu_letters: tl,
        hindi_matras:   hm,
        telugu_matras:  tm,
        hindi_words:    hw,
        telugu_words:   tw,
        players,
        leaderboards:   lb,
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin key guard — require ?adminKey=<ADMIN_SECRET> for destructive routes
function adminOnly(req, res, next) {
  const secret = process.env.ADMIN_SECRET || 'change_me';
  if (req.query.adminKey !== secret) {
    return res.status(403).json({ error: 'Forbidden — invalid admin key' });
  }
  next();
}

// DELETE all players + leaderboard — /api/players/all?adminKey=<ADMIN_SECRET>
router.delete('/players/all', adminOnly, async (req, res) => {
  try {
    const pResult = await Player.deleteMany({});
    const lResult = await Leaderboard.deleteMany({});
    res.json({ success: true, deletedPlayers: pResult.deletedCount, deletedLeaderboard: lResult.deletedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST trigger seed  — /api/seed?adminKey=<ADMIN_SECRET>  (re-populates all game data collections)
router.post('/seed', adminOnly, async (req, res) => {
  try {
    const hindiMatrasData = [
      { id: 'aa', symbol: 'ा', name: 'aa matra',       vowel: 'आ', stage: 1, levelIntroduced: 1 },
      { id: 'i',  symbol: 'ि', name: 'chhoti i matra', vowel: 'इ', stage: 1, levelIntroduced: 1 },
      { id: 'ii', symbol: 'ी', name: 'badi ee matra',  vowel: 'ई', stage: 1, levelIntroduced: 2 },
      { id: 'u',  symbol: 'ु', name: 'chhota u matra', vowel: 'उ', stage: 1, levelIntroduced: 2 },
      { id: 'uu', symbol: 'ू', name: 'bada oo matra',  vowel: 'ऊ', stage: 2, levelIntroduced: 3 },
      { id: 'e',  symbol: 'े', name: 'e matra',         vowel: 'ए', stage: 2, levelIntroduced: 3 },
      { id: 'ai', symbol: 'ै', name: 'ai matra',        vowel: 'ऐ', stage: 2, levelIntroduced: 4 },
      { id: 'o',  symbol: 'ो', name: 'o matra',         vowel: 'ओ', stage: 2, levelIntroduced: 4 },
      { id: 'au', symbol: 'ौ', name: 'au matra',        vowel: 'औ', stage: 3, levelIntroduced: 8 },
    ];
    const hindiConsonantsData = [
      { id: 'ka',  symbol: 'क', name: 'ka',  stage: 1, levelIntroduced: 1 },
      { id: 'ma',  symbol: 'म', name: 'ma',  stage: 1, levelIntroduced: 1 },
      { id: 'ra',  symbol: 'र', name: 'ra',  stage: 1, levelIntroduced: 1 },
      { id: 'la',  symbol: 'ल', name: 'la',  stage: 1, levelIntroduced: 1 },
      { id: 'ga',  symbol: 'ग', name: 'ga',  stage: 1, levelIntroduced: 1 },
      { id: 'na',  symbol: 'न', name: 'na',  stage: 1, levelIntroduced: 2 },
      { id: 'pa',  symbol: 'प', name: 'pa',  stage: 1, levelIntroduced: 2 },
      { id: 'ba',  symbol: 'ब', name: 'ba',  stage: 1, levelIntroduced: 2 },
      { id: 'sa',  symbol: 'स', name: 'sa',  stage: 1, levelIntroduced: 2 },
      { id: 'ha',  symbol: 'ह', name: 'ha',  stage: 1, levelIntroduced: 2 },
      { id: 'ta2', symbol: 'त', name: 'ta',  stage: 2, levelIntroduced: 3 },
      { id: 'da2', symbol: 'द', name: 'da',  stage: 2, levelIntroduced: 3 },
      { id: 'cha', symbol: 'च', name: 'cha', stage: 2, levelIntroduced: 3 },
      { id: 'ja',  symbol: 'ज', name: 'ja',  stage: 2, levelIntroduced: 3 },
      { id: 'va',  symbol: 'व', name: 'va',  stage: 2, levelIntroduced: 3 },
      { id: 'kha', symbol: 'ख', name: 'kha', stage: 2, levelIntroduced: 4 },
      { id: 'gha', symbol: 'घ', name: 'gha', stage: 2, levelIntroduced: 4 },
      { id: 'pha', symbol: 'फ', name: 'pha', stage: 2, levelIntroduced: 4 },
      { id: 'ya',  symbol: 'य', name: 'ya',  stage: 2, levelIntroduced: 4 },
      { id: 'sha', symbol: 'श', name: 'sha', stage: 2, levelIntroduced: 4 },
      { id: 'ta1', symbol: 'ट', name: 'Ta',  stage: 3, levelIntroduced: 8 },
      { id: 'da1', symbol: 'ड', name: 'Da',  stage: 3, levelIntroduced: 8 },
      { id: 'tha', symbol: 'थ', name: 'tha', stage: 2, levelIntroduced: 4 },
      { id: 'dha', symbol: 'ध', name: 'dha', stage: 2, levelIntroduced: 4 },
      { id: 'bha', symbol: 'भ', name: 'bha', stage: 2, levelIntroduced: 4 },
    ];
    const hindiWordsData = [
      { combined: 'आम',    parts: ['आम'],       meaning: 'mango',    emoji: '🥭', category: 'nature',  keyIdx: 0, keyMatra: 'aa', keyCons: 'ma', levelIntroduced: 5 },
      { combined: 'पानी',  parts: ['पानी'],     meaning: 'water',    emoji: '💧', category: 'nature',  keyIdx: 0, keyMatra: 'aa', keyCons: 'pa', levelIntroduced: 5 },
      { combined: 'फूल',   parts: ['फूल'],      meaning: 'flower',   emoji: '🌸', category: 'nature',  keyIdx: 0, keyMatra: 'uu', keyCons: 'pha', levelIntroduced: 5 },
      { combined: 'नदी',   parts: ['नदी'],      meaning: 'river',    emoji: '🏞️', category: 'nature',  keyIdx: 0, keyMatra: 'i',  keyCons: 'na', levelIntroduced: 6 },
      { combined: 'रात',   parts: ['रात'],      meaning: 'night',    emoji: '🌙', category: 'nature',  keyIdx: 0, keyMatra: 'aa', keyCons: 'ra', levelIntroduced: 5 },
      { combined: 'धूप',   parts: ['धूप'],      meaning: 'sunshine', emoji: '☀️', category: 'nature',  keyIdx: 0, keyMatra: 'uu', keyCons: 'dha', levelIntroduced: 6 },
      { combined: 'बिल्ली', parts: ['बिल्ली'],  meaning: 'cat',      emoji: '🐱', category: 'animals', keyIdx: 0, keyMatra: 'i',  keyCons: 'ba', levelIntroduced: 6 },
      { combined: 'कुत्ता', parts: ['कुत्ता'],  meaning: 'dog',      emoji: '🐶', category: 'animals', keyIdx: 0, keyMatra: 'u',  keyCons: 'ka', levelIntroduced: 6 },
      { combined: 'मछली',  parts: ['मछली'],     meaning: 'fish',     emoji: '🐟', category: 'animals', keyIdx: 0, keyMatra: 'a',  keyCons: 'ma', levelIntroduced: 6 },
      { combined: 'गाय',   parts: ['गाय'],      meaning: 'cow',      emoji: '🐄', category: 'animals', keyIdx: 0, keyMatra: 'aa', keyCons: 'ga', levelIntroduced: 5 },
      { combined: 'शेर',   parts: ['शेर'],      meaning: 'lion',     emoji: '🦁', category: 'animals', keyIdx: 0, keyMatra: 'e',  keyCons: 'sha', levelIntroduced: 6 },
      { combined: 'हाथी',  parts: ['हाथी'],     meaning: 'elephant', emoji: '🐘', category: 'animals', keyIdx: 0, keyMatra: 'aa', keyCons: 'ha', levelIntroduced: 6 },
      { combined: 'माँ',   parts: ['माँ'],      meaning: 'mother',   emoji: '👩', category: 'family',  keyIdx: 0, keyMatra: 'aa', keyCons: 'ma', levelIntroduced: 5 },
      { combined: 'बाबा',  parts: ['बाबा'],     meaning: 'father',   emoji: '👨', category: 'family',  keyIdx: 0, keyMatra: 'aa', keyCons: 'ba', levelIntroduced: 5 },
      { combined: 'भाई',   parts: ['भाई'],      meaning: 'brother',  emoji: '👦', category: 'family',  keyIdx: 0, keyMatra: 'aa', keyCons: 'bha', levelIntroduced: 6 },
      { combined: 'बहन',   parts: ['बहन'],      meaning: 'sister',   emoji: '👧', category: 'family',  keyIdx: 0, keyMatra: 'a',  keyCons: 'ba', levelIntroduced: 6 },
      { combined: 'रोटी',  parts: ['रोटी'],     meaning: 'bread',    emoji: '🫓', category: 'food',    keyIdx: 0, keyMatra: 'o',  keyCons: 'ra', levelIntroduced: 6 },
      { combined: 'दूध',   parts: ['दूध'],      meaning: 'milk',     emoji: '🥛', category: 'food',    keyIdx: 0, keyMatra: 'uu', keyCons: 'da2', levelIntroduced: 5 },
      { combined: 'सेब',   parts: ['सेब'],      meaning: 'apple',    emoji: '🍎', category: 'food',    keyIdx: 0, keyMatra: 'e',  keyCons: 'sa', levelIntroduced: 5 },
      { combined: 'केला',  parts: ['केला'],     meaning: 'banana',   emoji: '🍌', category: 'food',    keyIdx: 0, keyMatra: 'e',  keyCons: 'ka', levelIntroduced: 5 },
      { combined: 'हाथ',   parts: ['हाथ'],      meaning: 'hand',     emoji: '🤚', category: 'body',    keyIdx: 0, keyMatra: 'aa', keyCons: 'ha', levelIntroduced: 5 },
      { combined: 'नाक',   parts: ['नाक'],      meaning: 'nose',     emoji: '👃', category: 'body',    keyIdx: 0, keyMatra: 'aa', keyCons: 'na', levelIntroduced: 5 },
      { combined: 'आँख',   parts: ['आँख'],      meaning: 'eye',      emoji: '👁️', category: 'body',    keyIdx: 0, keyMatra: 'aa', keyCons: 'ma', levelIntroduced: 6 },
      { combined: 'घर',    parts: ['घर'],       meaning: 'home',     emoji: '🏠', category: 'objects', keyIdx: 0, keyMatra: 'a',  keyCons: 'gha', levelIntroduced: 5 },
      { combined: 'किताब', parts: ['किताब'],    meaning: 'book',     emoji: '📚', category: 'objects', keyIdx: 0, keyMatra: 'i',  keyCons: 'ka', levelIntroduced: 6 },
      { combined: 'कलम',   parts: ['कलम'],      meaning: 'pen',      emoji: '✏️', category: 'objects', keyIdx: 0, keyMatra: 'a',  keyCons: 'ka', levelIntroduced: 5 },
      { combined: 'थाली',  parts: ['थाली'],     meaning: 'plate',    emoji: '🍽️', category: 'objects', keyIdx: 0, keyMatra: 'aa', keyCons: 'tha', levelIntroduced: 6 },
      { combined: 'कल',    parts: ['क', 'ल'],   meaning: 'yesterday',emoji: '📅', category: 'words',   levelIntroduced: 5 },
      { combined: 'मन',    parts: ['म', 'न'],   meaning: 'mind',     emoji: '🧠', category: 'words',   levelIntroduced: 5 },
      { combined: 'दिन',   parts: ['दि', 'न'],  meaning: 'day',      emoji: '☀️', category: 'words',   levelIntroduced: 5 },
      { combined: 'चाय',   parts: ['चा', 'य'],  meaning: 'tea',      emoji: '🍵', category: 'words',   levelIntroduced: 5 },
      { combined: 'बाल',   parts: ['बा', 'ल'],  meaning: 'hair',     emoji: '💇', category: 'words',   levelIntroduced: 5 },
      { combined: 'गाना',  parts: ['गा', 'ना'], meaning: 'song',     emoji: '🎵', category: 'words',   levelIntroduced: 5 },
    ];
    const teluguMatrasData = [
      { id: 'aa', symbol: 'ా',  name: 'aa gunintam', vowel: 'ఆ', stage: 1, levelIntroduced: 1 },
      { id: 'i',  symbol: 'ి',  name: 'i gunintam',  vowel: 'ఇ', stage: 1, levelIntroduced: 1 },
      { id: 'ii', symbol: 'ీ',  name: 'ii gunintam', vowel: 'ఈ', stage: 1, levelIntroduced: 2 },
      { id: 'u',  symbol: 'ు',  name: 'u gunintam',  vowel: 'ఉ', stage: 1, levelIntroduced: 2 },
      { id: 'uu', symbol: 'ూ',  name: 'uu gunintam', vowel: 'ఊ', stage: 2, levelIntroduced: 3 },
      { id: 'e',  symbol: 'ె',  name: 'e gunintam',  vowel: 'ఎ', stage: 2, levelIntroduced: 3 },
      { id: 'ee', symbol: 'ే',  name: 'ee gunintam', vowel: 'ఏ', stage: 2, levelIntroduced: 4 },
      { id: 'ai', symbol: 'ై',  name: 'ai gunintam', vowel: 'ఐ', stage: 2, levelIntroduced: 4 },
      { id: 'o',  symbol: 'ొ',  name: 'o gunintam',  vowel: 'ఒ', stage: 2, levelIntroduced: 3 },
      { id: 'oo', symbol: 'ో',  name: 'oo gunintam', vowel: 'ఓ', stage: 3, levelIntroduced: 8 },
      { id: 'au', symbol: 'ౌ',  name: 'au gunintam', vowel: 'ఔ', stage: 3, levelIntroduced: 8 },
    ];
    const teluguConsonantsData = [
      { id: 'ka',  symbol: 'క', name: 'ka',  stage: 1, levelIntroduced: 1 },
      { id: 'ma',  symbol: 'మ', name: 'ma',  stage: 1, levelIntroduced: 1 },
      { id: 'ra',  symbol: 'ర', name: 'ra',  stage: 1, levelIntroduced: 1 },
      { id: 'la',  symbol: 'ల', name: 'la',  stage: 1, levelIntroduced: 1 },
      { id: 'ga',  symbol: 'గ', name: 'ga',  stage: 1, levelIntroduced: 1 },
      { id: 'na',  symbol: 'న', name: 'na',  stage: 1, levelIntroduced: 2 },
      { id: 'cha', symbol: 'చ', name: 'cha', stage: 1, levelIntroduced: 2 },
      { id: 'va',  symbol: 'వ', name: 'va',  stage: 1, levelIntroduced: 2 },
      { id: 'sa',  symbol: 'స', name: 'sa',  stage: 1, levelIntroduced: 2 },
      { id: 'ha',  symbol: 'హ', name: 'ha',  stage: 1, levelIntroduced: 2 },
      { id: 'ta2', symbol: 'త', name: 'ta',  stage: 2, levelIntroduced: 3 },
      { id: 'da2', symbol: 'ద', name: 'da',  stage: 2, levelIntroduced: 3 },
      { id: 'pa',  symbol: 'ప', name: 'pa',  stage: 2, levelIntroduced: 3 },
      { id: 'ba',  symbol: 'బ', name: 'ba',  stage: 2, levelIntroduced: 3 },
      { id: 'ja',  symbol: 'జ', name: 'ja',  stage: 2, levelIntroduced: 3 },
      { id: 'kha', symbol: 'ఖ', name: 'kha', stage: 2, levelIntroduced: 4 },
      { id: 'gha', symbol: 'ఘ', name: 'gha', stage: 2, levelIntroduced: 4 },
      { id: 'pha', symbol: 'ఫ', name: 'pha', stage: 2, levelIntroduced: 4 },
      { id: 'ya',  symbol: 'య', name: 'ya',  stage: 2, levelIntroduced: 4 },
      { id: 'sha', symbol: 'శ', name: 'sha', stage: 2, levelIntroduced: 4 },
      { id: 'ta1', symbol: 'ట', name: 'Ta',  stage: 3, levelIntroduced: 8 },
      { id: 'da1', symbol: 'డ', name: 'Da',  stage: 3, levelIntroduced: 8 },
    ];
    const teluguWordsData = [
      { combined: 'మామ',    parts: ['మామ'],    meaning: 'mango',     emoji: '🥭', category: 'nature',  keyIdx: 0, keyMatra: 'aa', keyCons: 'ma', levelIntroduced: 5 },
      { combined: 'నీళ్ళ',  parts: ['నీళ్ళ'],  meaning: 'water',     emoji: '💧', category: 'nature',  keyIdx: 0, keyMatra: 'ii', keyCons: 'na', levelIntroduced: 5 },
      { combined: 'పూల',    parts: ['పూల'],    meaning: 'flower',    emoji: '🌸', category: 'nature',  keyIdx: 0, keyMatra: 'uu', keyCons: 'pa', levelIntroduced: 5 },
      { combined: 'నది',    parts: ['నది'],    meaning: 'river',     emoji: '🏞️', category: 'nature',  keyIdx: 0, keyMatra: 'i',  keyCons: 'na', levelIntroduced: 6 },
      { combined: 'రాత',    parts: ['రాత'],    meaning: 'night',     emoji: '🌙', category: 'nature',  keyIdx: 0, keyMatra: 'aa', keyCons: 'ra', levelIntroduced: 5 },
      { combined: 'వేడి',   parts: ['వేడి'],   meaning: 'heat/sun',  emoji: '☀️', category: 'nature',  keyIdx: 0, keyMatra: 'ee', keyCons: 'va', levelIntroduced: 6 },
      { combined: 'పిల్ల',  parts: ['పిల్ల'],  meaning: 'cat/kitten',emoji: '🐱', category: 'animals', keyIdx: 0, keyMatra: 'i',  keyCons: 'pa', levelIntroduced: 6 },
      { combined: 'కుక్క',  parts: ['కుక్క'],  meaning: 'dog',       emoji: '🐶', category: 'animals', keyIdx: 0, keyMatra: 'u',  keyCons: 'ka', levelIntroduced: 6 },
      { combined: 'చేప',    parts: ['చేప'],    meaning: 'fish',      emoji: '🐟', category: 'animals', keyIdx: 0, keyMatra: 'ee', keyCons: 'cha', levelIntroduced: 6 },
      { combined: 'ఆవు',    parts: ['ఆవు'],    meaning: 'cow',       emoji: '🐄', category: 'animals', keyIdx: 0, keyMatra: 'aa', keyCons: 'ma', levelIntroduced: 5 },
      { combined: 'సింహ',   parts: ['సింహ'],   meaning: 'lion',      emoji: '🦁', category: 'animals', keyIdx: 0, keyMatra: 'i',  keyCons: 'sa', levelIntroduced: 6 },
      { combined: 'ఏనుగు',  parts: ['ఏనుగు'],  meaning: 'elephant',  emoji: '🐘', category: 'animals', keyIdx: 0, keyMatra: 'ee', keyCons: 'na', levelIntroduced: 6 },
      { combined: 'అమ్మ',   parts: ['అమ్మ'],   meaning: 'mother',    emoji: '👩', category: 'family',  keyIdx: 0, keyMatra: 'a',  keyCons: 'ma', levelIntroduced: 5 },
      { combined: 'నాన',    parts: ['నాన'],    meaning: 'father',    emoji: '👨', category: 'family',  keyIdx: 0, keyMatra: 'aa', keyCons: 'na', levelIntroduced: 5 },
      { combined: 'అన్న',   parts: ['అన్న'],   meaning: 'brother',   emoji: '👦', category: 'family',  keyIdx: 0, keyMatra: 'a',  keyCons: 'na', levelIntroduced: 6 },
      { combined: 'అక్క',   parts: ['అక్క'],   meaning: 'sister',    emoji: '👧', category: 'family',  keyIdx: 0, keyMatra: 'a',  keyCons: 'ka', levelIntroduced: 6 },
      { combined: 'రొట్టె',  parts: ['రొట్టె'], meaning: 'bread',     emoji: '🫓', category: 'food',    keyIdx: 0, keyMatra: 'o',  keyCons: 'ra', levelIntroduced: 6 },
      { combined: 'పాల',    parts: ['పాల'],    meaning: 'milk',      emoji: '🥛', category: 'food',    keyIdx: 0, keyMatra: 'aa', keyCons: 'pa', levelIntroduced: 5 },
      { combined: 'యాపిల',  parts: ['యాపిల'],  meaning: 'apple',     emoji: '🍎', category: 'food',    keyIdx: 0, keyMatra: 'aa', keyCons: 'ya', levelIntroduced: 5 },
      { combined: 'అరటి',   parts: ['అరటి'],   meaning: 'banana',    emoji: '🍌', category: 'food',    keyIdx: 0, keyMatra: 'i',  keyCons: 'ra', levelIntroduced: 5 },
      { combined: 'చేయి',   parts: ['చేయి'],   meaning: 'hand',      emoji: '🤚', category: 'body',    keyIdx: 0, keyMatra: 'ee', keyCons: 'cha', levelIntroduced: 5 },
      { combined: 'ముక్కు',  parts: ['ముక్కు'],  meaning: 'nose',      emoji: '👃', category: 'body',    keyIdx: 0, keyMatra: 'u',  keyCons: 'ma', levelIntroduced: 5 },
      { combined: 'కళ్ళు',  parts: ['కళ్ళు'],  meaning: 'eyes',      emoji: '👁️', category: 'body',    keyIdx: 0, keyMatra: 'u',  keyCons: 'la', levelIntroduced: 6 },
      { combined: 'ఇల్ల',   parts: ['ఇల్ల'],   meaning: 'home',      emoji: '🏠', category: 'objects', keyIdx: 0, keyMatra: 'i',  keyCons: 'la', levelIntroduced: 5 },
      { combined: 'పుస్తక', parts: ['పుస్తక'], meaning: 'book',      emoji: '📚', category: 'objects', keyIdx: 0, keyMatra: 'u',  keyCons: 'pa', levelIntroduced: 6 },
      { combined: 'కలమ',    parts: ['కలమ'],    meaning: 'pen',       emoji: '✏️', category: 'objects', keyIdx: 0, keyMatra: 'a',  keyCons: 'ka', levelIntroduced: 5 },
      { combined: 'పళ్ళె',  parts: ['పళ్ళె'],  meaning: 'plate',     emoji: '🍽️', category: 'objects', keyIdx: 0, keyMatra: 'a',  keyCons: 'pa', levelIntroduced: 6 },
      { combined: 'మన',   parts: ['మ', 'న'],   meaning: 'our',       emoji: '👥', category: 'words',   levelIntroduced: 5 },
      { combined: 'పని',  parts: ['ప', 'ని'],  meaning: 'work',      emoji: '💼', category: 'words',   levelIntroduced: 5 },
      { combined: 'కల',   parts: ['క', 'ల'],   meaning: 'dream',     emoji: '💭', category: 'words',   levelIntroduced: 5 },
      { combined: 'పాట',  parts: ['పా', 'ట'],  meaning: 'song',      emoji: '🎵', category: 'words',   levelIntroduced: 5 },
      { combined: 'చాయ',  parts: ['చా', 'య'],  meaning: 'tea',       emoji: '🍵', category: 'words',   levelIntroduced: 5 },
      { combined: 'తార',  parts: ['తా', 'ర'],  meaning: 'star',      emoji: '⭐', category: 'words',   levelIntroduced: 5 },
    ];

    const results = {};
    await HindiMatra.deleteMany({});   results.hindi_matras   = (await HindiMatra.insertMany(hindiMatrasData)).length;
    await TeluguMatra.deleteMany({});  results.telugu_matras  = (await TeluguMatra.insertMany(teluguMatrasData)).length;
    await HindiLetter.deleteMany({});  results.hindi_letters  = (await HindiLetter.insertMany(hindiConsonantsData)).length;
    await TeluguLetter.deleteMany({}); results.telugu_letters = (await TeluguLetter.insertMany(teluguConsonantsData)).length;
    await HindiWord.deleteMany({});    results.hindi_words    = (await HindiWord.insertMany(hindiWordsData)).length;
    await TeluguWord.deleteMany({});   results.telugu_words   = (await TeluguWord.insertMany(teluguWordsData)).length;

    res.json({ success: true, inserted: results });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─── AUTH: SIGNUP ───
router.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, playerName, language } = req.body;
    if (!email || !password || !playerName) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }
    const exists = await Player.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'Email already registered. Please login.' });
    }
    const player = await Player.create({ email, password, playerName, language: language || 'hindi' });
    const obj = player.toObject();
    delete obj.password;
    res.json({ player: obj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AUTH: LOGIN ───
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const player = await Player.findOne({ email });
    if (!player) {
      return res.status(404).json({ error: 'No account found with this email' });
    }
    const isMatch = await player.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }
    const obj = player.toObject();
    delete obj.password;
    res.json({ player: obj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get player by ID
router.get('/player/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id).select('-password');
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update player language preference
router.put('/player/:id/language', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    player.language = req.body.language;
    await player.save();
    const obj = player.toObject();
    delete obj.password;
    res.json({ player: obj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save level completion (per-language)
router.post('/player/:id/complete-level', async (req, res) => {
  try {
    const { levelId, language, stars, score, accuracy, roundsPlayed, correct, wrong, streak, playTime } = req.body;
    const lang = language || 'hindi';
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    // Ensure langProgress exists
    if (!player.langProgress) player.langProgress = { hindi: [], telugu: [] };
    if (!player.langProgress[lang]) player.langProgress[lang] = [];

    // Update per-language level entry
    const existingLevel = player.langProgress[lang].find(l => l.levelId === levelId);
    if (existingLevel) {
      existingLevel.stars = Math.max(existingLevel.stars, stars);
      existingLevel.bestScore = Math.max(existingLevel.bestScore, score);
      existingLevel.bestAccuracy = Math.max(existingLevel.bestAccuracy, accuracy);
      existingLevel.completedAt = new Date();
    } else {
      player.langProgress[lang].push({ levelId, stars, bestScore: score, bestAccuracy: accuracy });
    }
    player.markModified('langProgress');

    // Update aggregated totals across both languages
    const allEntries = [...(player.langProgress.hindi || []), ...(player.langProgress.telugu || [])];
    player.totalStars = allEntries.reduce((sum, l) => sum + l.stars, 0);
    player.totalScore = (player.totalScore || 0) + score;
    player.highestLevel = Math.max(player.highestLevel, levelId + 1);

    // Update stats
    player.stats.totalRoundsPlayed += roundsPlayed || 0;
    player.stats.totalCorrect += correct || 0;
    player.stats.totalWrong += wrong || 0;
    player.stats.bestStreak = Math.max(player.stats.bestStreak, streak || 0);
    player.stats.totalPlayTime += playTime || 0;

    // Check achievements
    const achievementChecks = [
      { id: 'first_star', name: '⭐ First Star!', condition: player.totalStars >= 1 },
      { id: 'five_stars', name: '🌟 Star Collector', condition: player.totalStars >= 5 },
      { id: 'ten_stars', name: '💫 Star Master', condition: player.totalStars >= 10 },
      { id: 'perfect_round', name: '🎯 Perfect Round', condition: accuracy >= 100 },
      { id: 'streak_5', name: '🔥 Hot Streak', condition: (streak || 0) >= 5 },
      { id: 'streak_10', name: '🔥🔥 On Fire!', condition: (streak || 0) >= 10 },
      { id: 'level_4', name: '🏆 Word Wizard', condition: levelId >= 4 },
      { id: 'level_8', name: '👑 Grand Master', condition: levelId >= 8 },
      { id: 'played_50', name: '📚 Dedicated Learner', condition: player.stats.totalRoundsPlayed >= 50 },
      { id: 'played_200', name: '🧠 Knowledge Seeker', condition: player.stats.totalRoundsPlayed >= 200 },
      { id: 'hindi_master', name: '🇮🇳 Hindi Master', condition: (player.langProgress.hindi || []).length >= 8 },
      { id: 'telugu_master', name: '🌺 Telugu Master', condition: (player.langProgress.telugu || []).length >= 8 },
    ];
    achievementChecks.forEach(a => {
      if (a.condition && !player.achievements.find(e => e.id === a.id)) {
        player.achievements.push({ id: a.id, name: a.name });
      }
    });

    await player.save();

    // Also save to the shared scores collection (same as all other games)
    await Score.create({
      userId: player._id,     // player._id used as userId (both are ObjectIds)
      gameType: 'akshara',
      language: lang,
      level: levelId,
      score: score || 0,
      correctAnswers: correct || 0,
      totalQuestions: roundsPlayed || 0,
    });

    const obj = player.toObject();
    delete obj.password;
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update settings
router.put('/player/:id/settings', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    Object.assign(player.settings, req.body);
    await player.save();
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit to leaderboard
router.post('/leaderboard', async (req, res) => {
  try {
    const entry = await Leaderboard.create(req.body);
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get leaderboard (top 50)
router.get('/leaderboard', async (req, res) => {
  try {
    const { language } = req.query;
    const filter = language ? { language } : {};
    const entries = await Leaderboard.find(filter).sort({ score: -1 }).limit(50);
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
