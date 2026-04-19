import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert, Dimensions, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';
import { LEVELS, WRONG_MESSAGES, CORRECT_MESSAGES } from '../akshara-data/gameData';
import { generateRound, calcStars, calcScore, resetUsedPrompts } from '../akshara-utils/gameHelpers';

const { width } = Dimensions.get('window');

export default function AksharaGame({ navigation, route }) {
  const [screen, setScreen] = useState('levels'); // levels | playing | levelComplete | gameOver
  const [language, setLanguage] = useState(route.params?.language || 'hindi');
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState(null);

  // Level select state
  const [completedLevels, setCompletedLevels] = useState([]);
  const [levelStars, setLevelStars] = useState({});

  // Game state
  const [currentLevel, setCurrentLevel] = useState(null);
  const [round, setRound] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(5);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [feedback, setFeedback] = useState(null); // {type: 'correct'|'wrong', message}

  const totalRoundsRef = useRef(0);
  const feedbackTimeout = useRef(null);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = async () => {
    const name = await AsyncStorage.getItem('playerName') || 'Player';
    const id = await AsyncStorage.getItem('playerId');
    const lang = await AsyncStorage.getItem('userLanguage') || 'hindi';
    setPlayerName(name);
    setPlayerId(id);
    setLanguage(lang);

    // Load saved progress
    const saved = await AsyncStorage.getItem('akshara_session');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const langProg = data.langProgress?.[lang] || {};
        const completed = Object.keys(langProg).map(Number);
        const stars = {};
        Object.entries(langProg).forEach(([k, v]) => { stars[Number(k)] = v.stars || 0; });
        setCompletedLevels(completed);
        setLevelStars(stars);
      } catch (e) {}
    }

    // Also try to load from backend
    if (id) {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/akshara/player/${id}`, { timeout: API_TIMEOUT });
        const player = res.data;
        if (player?.langProgress?.[lang]) {
          const entries = player.langProgress[lang];
          const completed = entries.map(e => e.levelId);
          const stars = {};
          entries.forEach(e => { stars[e.levelId] = e.stars || 0; });
          setCompletedLevels(completed);
          setLevelStars(stars);
        }
      } catch (e) {}
    }
  };

  const changeLanguage = async (newLang) => {
    setLanguage(newLang);
    await AsyncStorage.setItem('userLanguage', newLang);
    // Reload progress for new language
    const saved = await AsyncStorage.getItem('akshara_session');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const langProg = data.langProgress?.[newLang] || {};
        const completed = Object.keys(langProg).map(Number);
        const stars = {};
        Object.entries(langProg).forEach(([k, v]) => { stars[Number(k)] = v.stars || 0; });
        setCompletedLevels(completed);
        setLevelStars(stars);
      } catch (e) {}
    }
  };

  const startLevel = (level) => {
    resetUsedPrompts();
    setCurrentLevel(level);
    setCurrentRound(1);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(level.lives || 5);
    setCorrectCount(0);
    setTotalAttempts(0);
    setDisabled(false);
    setFeedback(null);
    totalRoundsRef.current = level.rounds;
    const newRound = generateRound(level, language);
    setRound(newRound);
    setScreen('playing');
  };

  const handleSelect = (option) => {
    if (disabled) return;
    setDisabled(true);
    setTotalAttempts(prev => prev + 1);

    if (option.correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      const points = calcScore(1, newStreak, currentLevel.id);
      setScore(prev => prev + points);
      setCorrectCount(prev => prev + 1);
      const msg = CORRECT_MESSAGES[Math.floor(Math.random() * CORRECT_MESSAGES.length)];
      setFeedback({ type: 'correct', message: msg });

      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => {
        setFeedback(null);
        if (currentRound >= totalRoundsRef.current) {
          finishLevel();
        } else {
          setCurrentRound(prev => prev + 1);
          setRound(generateRound(currentLevel, language));
          setDisabled(false);
        }
      }, 800);
    } else {
      setStreak(0);
      const msg = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
      setFeedback({ type: 'wrong', message: msg });

      if (currentLevel.penalty) {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
          feedbackTimeout.current = setTimeout(() => {
            setFeedback(null);
            setScreen('gameOver');
          }, 900);
          return;
        }
      }

      if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => {
        setFeedback(null);
        if (currentRound >= totalRoundsRef.current) {
          finishLevel();
        } else {
          setCurrentRound(prev => prev + 1);
          setRound(generateRound(currentLevel, language));
          setDisabled(false);
        }
      }, 900);
    }
  };

  const finishLevel = async () => {
    const total = totalRoundsRef.current;
    const stars = calcStars(correctCount, total);
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Update local progress
    const newCompleted = [...new Set([...completedLevels, currentLevel.id])];
    const newStars = { ...levelStars, [currentLevel.id]: Math.max(levelStars[currentLevel.id] || 0, stars) };
    setCompletedLevels(newCompleted);
    setLevelStars(newStars);

    // Save to AsyncStorage
    try {
      const saved = await AsyncStorage.getItem('akshara_session');
      const session = saved ? JSON.parse(saved) : { langProgress: { hindi: {}, telugu: {} } };
      if (!session.langProgress) session.langProgress = { hindi: {}, telugu: {} };
      if (!session.langProgress[language]) session.langProgress[language] = {};
      const existing = session.langProgress[language][currentLevel.id];
      session.langProgress[language][currentLevel.id] = {
        stars: Math.max(existing?.stars || 0, stars),
        bestScore: Math.max(existing?.bestScore || 0, score),
        bestAccuracy: Math.max(existing?.bestAccuracy || 0, accuracy),
      };
      await AsyncStorage.setItem('akshara_session', JSON.stringify(session));
    } catch (e) {}

    // Save to backend
    if (playerId) {
      try {
        await axios.post(`${API_BASE_URL}/api/akshara/player/${playerId}/complete-level`, {
          levelId: currentLevel.id, language, stars, score, accuracy,
          bestStreak, roundsPlayed: total, correct: correctCount, wrong: total - correctCount,
          streak: bestStreak, playTime: 0,
        }, { timeout: API_TIMEOUT });
      } catch (e) {}
    }

    setScreen('levelComplete');
  };

  const isUnlocked = (level) => completedLevels.length >= level.unlockRequirement;

  // Cleanup
  useEffect(() => {
    return () => { if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current); };
  }, []);

  // ─── LEVEL SELECT SCREEN ───
  if (screen === 'levels') {
    const totalStarsCount = Object.values(levelStars).reduce((a, b) => a + b, 0);
    const maxStars = LEVELS.length * 3;
    const stages = [...new Set(LEVELS.map(l => l.stage))];
    const stageIcons = { Discover: '🔮', Guided: '🧭', Words: '📖', Mastery: '👑' };

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('GameHub')}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
            <View style={styles.playerChip}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{playerName?.charAt(0)?.toUpperCase() || '?'}</Text>
              </View>
              <Text style={styles.playerNameText}>{playerName}</Text>
            </View>
          </View>

          {/* Language Toggle */}
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, language === 'hindi' && styles.langActive]}
              onPress={() => changeLanguage('hindi')}
            >
              <Text style={[styles.langBtnText, language === 'hindi' && styles.langBtnTextActive]}>🇮🇳 Hindi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, language === 'telugu' && styles.langActive]}
              onPress={() => changeLanguage('telugu')}
            >
              <Text style={[styles.langBtnText, language === 'telugu' && styles.langBtnTextActive]}>✨ Telugu</Text>
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <Text style={styles.heroTitle}>🧙‍♂️ Akshara Magic Lab</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statVal}>{totalStarsCount}</Text>
              <Text style={styles.statLabel}>/ {maxStars}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statVal}>{completedLevels.length}</Text>
              <Text style={styles.statLabel}>/ {LEVELS.length}</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${maxStars > 0 ? (totalStarsCount / maxStars) * 100 : 0}%` }]} />
          </View>

          {/* Levels by Stage */}
          {stages.map(stage => (
            <View key={stage} style={styles.stageSection}>
              <View style={styles.stageLabel}>
                <Text style={styles.stageLabelIcon}>{stageIcons[stage] || '📚'}</Text>
                <Text style={styles.stageLabelText}>{stage}</Text>
                <View style={styles.stageLine} />
              </View>
              {LEVELS.filter(l => l.stage === stage).map((level) => {
                const unlocked = isUnlocked(level);
                const completed = completedLevels.includes(level.id);
                const isCurrent = unlocked && !completed;
                const stars = levelStars[level.id] || 0;

                return (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.levelCard,
                      !unlocked && styles.levelLocked,
                      completed && styles.levelCompleted,
                      isCurrent && styles.levelCurrent,
                    ]}
                    onPress={() => unlocked && startLevel(level)}
                    disabled={!unlocked}
                    activeOpacity={0.7}
                  >
                    <View style={styles.lcHeader}>
                      <Text style={styles.lcNum}>Level {level.id}</Text>
                      <Text style={styles.lcEmoji}>{unlocked ? level.emoji : '🔒'}</Text>
                    </View>
                    <Text style={styles.lcName}>{level.name}</Text>
                    <Text style={styles.lcDesc}>{level.description}</Text>
                    {completed && (
                      <View style={styles.lcStarsRow}>
                        {[1, 2, 3].map(s => (
                          <Text key={s} style={[styles.lcStar, s <= stars && styles.lcStarFilled]}>⭐</Text>
                        ))}
                      </View>
                    )}
                    {isCurrent && (
                      <View style={[styles.lcBadge, { backgroundColor: level.color }]}>
                        <Text style={styles.lcBadgeText}>▶ PLAY</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ─── GAME BOARD ───
  if (screen === 'playing' && round) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />
        <View style={styles.gameContainer}>
          {/* Game Header */}
          <View style={styles.gameHeader}>
            <TouchableOpacity onPress={() => { setScreen('levels'); setFeedback(null); }}>
              <Text style={styles.gameBackBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.gameLevel}>Level {currentLevel.id}</Text>
            <View style={styles.gameStatsRow}>
              <Text style={styles.gameStat}>⭐ {score}</Text>
              {currentLevel.penalty && <Text style={styles.gameStat}>❤️ {lives}</Text>}
              <Text style={styles.gameStat}>🔥 {streak}</Text>
            </View>
          </View>

          {/* Round Progress */}
          <View style={styles.roundProgress}>
            <View style={[styles.roundFill, { width: `${(currentRound / totalRoundsRef.current) * 100}%` }]} />
          </View>
          <Text style={styles.roundText}>Round {currentRound} / {totalRoundsRef.current}</Text>

          {/* Prompt */}
          <View style={styles.promptArea}>
            {round.mode === 'meaning' ? (
              <View style={styles.meaningPrompt}>
                <Text style={styles.meaningLabel}>What word means:</Text>
                <Text style={styles.meaningText}>"{round.prompt}"</Text>
              </View>
            ) : (
              <>
                <Text style={styles.promptSymbol}>
                  {round.mode === 'word' || round.mode === 'wordspot' ? round.prompt : round.prompt}
                </Text>
                {round.promptLabel ? <Text style={styles.promptLabel}>{round.promptLabel}</Text> : null}
              </>
            )}
            <Text style={styles.instruction}>{round.instruction}</Text>
          </View>

          {/* Options */}
          <View style={styles.optionsGrid}>
            {round.options.map((opt, i) => (
              <TouchableOpacity
                key={opt.id || i}
                style={[styles.optionBtn, { borderColor: currentLevel.color + '60' }]}
                onPress={() => handleSelect(opt)}
                disabled={disabled}
                activeOpacity={0.6}
              >
                <Text style={styles.optionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback overlay */}
          {feedback && (
            <View style={[styles.feedbackOverlay, feedback.type === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong]}>
              <Text style={styles.feedbackEmoji}>{feedback.type === 'correct' ? '✅' : '❌'}</Text>
              <Text style={styles.feedbackMsg}>{feedback.message}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // ─── LEVEL COMPLETE ───
  if (screen === 'levelComplete') {
    const total = totalRoundsRef.current;
    const stars = calcStars(correctCount, total);
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const nextLevel = LEVELS.find(l => l.id === currentLevel.id + 1);

    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />
        <ScrollView contentContainerStyle={styles.completeScroll}>
          <Text style={styles.completeTitle}>🎉 Level Complete!</Text>
          <Text style={styles.completeLevelName}>{currentLevel.name}</Text>

          {/* Stars */}
          <View style={styles.starsContainer}>
            {[1, 2, 3].map(s => (
              <Text key={s} style={[styles.completeStar, s <= stars && styles.completeStarFilled]}>⭐</Text>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.completeStats}>
            <View style={styles.completeStatItem}>
              <Text style={styles.completeStatVal}>{score}</Text>
              <Text style={styles.completeStatLabel}>Score</Text>
            </View>
            <View style={styles.completeStatItem}>
              <Text style={styles.completeStatVal}>{accuracy}%</Text>
              <Text style={styles.completeStatLabel}>Accuracy</Text>
            </View>
            <View style={styles.completeStatItem}>
              <Text style={styles.completeStatVal}>{bestStreak}</Text>
              <Text style={styles.completeStatLabel}>Best Streak</Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={[styles.completeBtn, { backgroundColor: currentLevel.color }]} onPress={() => startLevel(currentLevel)}>
            <Text style={styles.completeBtnText}>🔄 Play Again</Text>
          </TouchableOpacity>
          {nextLevel && (
            <TouchableOpacity style={[styles.completeBtn, { backgroundColor: '#a855f7' }]} onPress={() => startLevel(nextLevel)}>
              <Text style={styles.completeBtnText}>▶ Next Level</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.completeBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={() => setScreen('levels')}>
            <Text style={[styles.completeBtnText, { color: '#94a3b8' }]}>📋 Level Select</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ─── GAME OVER ───
  if (screen === 'gameOver') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverEmoji}>💀</Text>
          <Text style={styles.gameOverTitle}>Game Over</Text>
          <Text style={styles.gameOverSub}>You ran out of lives!</Text>
          <Text style={styles.gameOverScore}>Score: {score}</Text>
          <TouchableOpacity style={[styles.completeBtn, { backgroundColor: '#ef4444' }]} onPress={() => startLevel(currentLevel)}>
            <Text style={styles.completeBtnText}>🔄 Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.completeBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={() => setScreen('levels')}>
            <Text style={[styles.completeBtnText, { color: '#94a3b8' }]}>📋 Level Select</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A' },
  scroll: { padding: 16, paddingTop: 30, paddingBottom: 60 },

  // Top bar
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(168,85,247,0.4)', backgroundColor: 'rgba(168,85,247,0.1)' },
  backArrow: { fontSize: 18, color: '#c084fc' },
  backText: { fontSize: 14, fontWeight: '700', color: '#c084fc' },
  playerChip: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#a855f7', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  playerNameText: { color: '#f1f5f9', fontWeight: '700', fontSize: 14 },

  // Language toggle
  langRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  langBtn: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  langActive: { borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)' },
  langBtnText: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
  langBtnTextActive: { color: '#fff' },

  // Hero
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fbbf24', textAlign: 'center', marginBottom: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 10 },
  statBox: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statIcon: { fontSize: 14 },
  statVal: { fontSize: 16, fontWeight: '800', color: '#fbbf24' },
  statLabel: { fontSize: 12, color: '#94a3b8' },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 99, marginBottom: 20, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#a855f7', borderRadius: 99 },

  // Stages
  stageSection: { marginBottom: 20 },
  stageLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  stageLabelIcon: { fontSize: 18 },
  stageLabelText: { fontSize: 12, fontWeight: '800', color: '#c084fc', letterSpacing: 2, textTransform: 'uppercase' },
  stageLine: { flex: 1, height: 1, backgroundColor: 'rgba(168,85,247,0.3)' },

  // Level cards
  levelCard: { padding: 18, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 10 },
  levelLocked: { opacity: 0.3 },
  levelCompleted: { borderColor: 'rgba(52,211,153,0.3)', backgroundColor: 'rgba(52,211,153,0.04)' },
  levelCurrent: { borderColor: '#a855f7', shadowColor: '#a855f7', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  lcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  lcNum: { fontSize: 11, fontWeight: '700', color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase' },
  lcEmoji: { fontSize: 24 },
  lcName: { fontSize: 17, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  lcDesc: { fontSize: 12, color: '#94a3b8', lineHeight: 18, marginBottom: 6 },
  lcStarsRow: { flexDirection: 'row', gap: 4 },
  lcStar: { fontSize: 16, opacity: 0.2 },
  lcStarFilled: { opacity: 1 },
  lcBadge: { position: 'absolute', top: 10, right: 10, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20 },
  lcBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  // Game board
  gameContainer: { flex: 1, padding: 16, paddingTop: 30 },
  gameHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  gameBackBtn: { fontSize: 24, color: '#94a3b8', padding: 8 },
  gameLevel: { fontSize: 16, fontWeight: '800', color: '#f1f5f9' },
  gameStatsRow: { flexDirection: 'row', gap: 10 },
  gameStat: { fontSize: 14, fontWeight: '700', color: '#fbbf24' },
  roundProgress: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden', marginBottom: 4 },
  roundFill: { height: '100%', backgroundColor: '#a855f7', borderRadius: 99 },
  roundText: { fontSize: 11, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },

  // Prompt
  promptArea: { alignItems: 'center', marginBottom: 30, flex: 1, justifyContent: 'center' },
  promptSymbol: { fontSize: 72, color: '#fff', fontWeight: '700', marginBottom: 8 },
  promptLabel: { fontSize: 14, color: '#94a3b8', marginBottom: 8 },
  instruction: { fontSize: 14, color: '#c084fc', textAlign: 'center', paddingHorizontal: 20 },
  meaningPrompt: { alignItems: 'center', padding: 20 },
  meaningLabel: { fontSize: 14, color: '#94a3b8', marginBottom: 6 },
  meaningText: { fontSize: 22, fontWeight: '700', color: '#fbbf24', textAlign: 'center' },

  // Options
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', paddingBottom: 30 },
  optionBtn: { width: (width - 60) / 2, paddingVertical: 18, paddingHorizontal: 10, borderRadius: 18, borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  optionText: { fontSize: 24, fontWeight: '700', color: '#f1f5f9' },

  // Feedback
  feedbackOverlay: { position: 'absolute', top: '40%', left: 20, right: 20, padding: 20, borderRadius: 20, alignItems: 'center', zIndex: 100 },
  feedbackCorrect: { backgroundColor: 'rgba(52,211,153,0.9)' },
  feedbackWrong: { backgroundColor: 'rgba(239,68,68,0.9)' },
  feedbackEmoji: { fontSize: 36, marginBottom: 4 },
  feedbackMsg: { fontSize: 18, fontWeight: '800', color: '#fff', textAlign: 'center' },

  // Level Complete
  completeScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  completeTitle: { fontSize: 28, fontWeight: '800', color: '#fbbf24', marginBottom: 6 },
  completeLevelName: { fontSize: 16, color: '#94a3b8', marginBottom: 20 },
  starsContainer: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  completeStar: { fontSize: 36, opacity: 0.2 },
  completeStarFilled: { opacity: 1 },
  completeStats: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  completeStatItem: { alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', minWidth: 80 },
  completeStatVal: { fontSize: 22, fontWeight: '800', color: '#fbbf24' },
  completeStatLabel: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  completeBtn: { width: '100%', maxWidth: 300, padding: 16, borderRadius: 16, alignItems: 'center', marginBottom: 10 },
  completeBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Game Over
  gameOverContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  gameOverEmoji: { fontSize: 60, marginBottom: 12 },
  gameOverTitle: { fontSize: 28, fontWeight: '800', color: '#ef4444', marginBottom: 6 },
  gameOverSub: { fontSize: 14, color: '#94a3b8', marginBottom: 12 },
  gameOverScore: { fontSize: 20, fontWeight: '700', color: '#fbbf24', marginBottom: 24 },
});
