import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GAMES = [
  {
    id: 'balloon',
    title: 'Balloon Pop',
    emoji: '🎈',
    description: 'Pop balloons with the correct letters! Fun letter recognition game.',
    color: '#FF6B6B',
    screen: 'BalloonSelection',
    category: 'Letters',
  },
  {
    id: 'quiz',
    title: 'Audio Quiz',
    emoji: '📝',
    description: 'Listen to sounds and answer questions. Test your knowledge!',
    color: '#4ECDC4',
    screen: 'PlanetSelection',
    category: 'Letters',
  },
  {
    id: 'bubble-shooter',
    title: 'Bubble Shooter',
    emoji: '🫧',
    description: 'Hear the consonant and shoot the matching bubble.',
    color: '#38BDF8',
    screen: 'BubbleShooterSelection',
    category: 'Letters',
  },
  {
    id: 'word-sorting-basket',
    title: 'Word Sorting Basket',
    emoji: '🧺',
    description: 'Drag mixed words into the right category basket.',
    color: '#F59E0B',
    screen: 'WordSortingBasketSelection',
    category: 'Words',
  },
  {
    id: 'mars',
    title: 'Mars Game',
    emoji: '🪐',
    description: 'Match images with words on Mars! Learn vocabulary through space adventure.',
    color: '#FF4757',
    screen: 'MarsLevelSelection',
    category: 'Words',
  },

  {
    id: 'akshara',
    title: 'Akshara Magic Lab',
    emoji: '🧙‍♂️',
    description: '8 magical levels! Learn aksharas through combining, splitting & word mastery.',
    color: '#a855f7',
    screen: 'AksharaGame',
    category: 'Aksharas',
    special: true,
  },
  {
    id: 'swara',
    title: 'Swara Sing-Along',
    emoji: '🎵',
    description: 'Learn Hindi vowels with picture, pronunciation, and audio practice.',
    color: '#3b82f6',
    screen: 'SwaraGame',
    category: 'Vowels',
    special: true,
  },
  {
    id: 'varnamal',
    title: 'Varnamala Puzzle',
    emoji: '🧩',
    description: 'Arrange consonants in alphabetical order! Drag and drop letters to complete the Varnamala.',
    color: '#8b5cf6',
    screen: 'VarnamalGame',
    category: 'Puzzle',
    special: true,
  },
  {
    id: 'matra',
    title: 'Matra Magic Builder',
    emoji: '✨',
    description: 'Drag & drop matras to build Hindi words! Learn all 11 matras.',
    color: '#f43f5e',
    screen: 'MatraGame',
    category: 'Matras',
    special: true,
  },
  {
    id: 'word-jumble',
    title: 'Word Jumble',
    emoji: '🌊',
    description: 'Drag floating words into the correct order and press OK to score!',
    color: '#06b6d4',
    screen: 'WordJumbleSelection',
    category: 'Sentences',
    special: true,
  },
  {
    id: 'crossword',
    title: 'Kids Crossword',
    emoji: '🎮',
    description: 'Solve 5 crossword puzzles in sequence with 4 stars per puzzle.',
    color: '#8b5cf6',
    screen: 'CrosswordGame',
    category: 'Puzzles',
    special: true,
  },
];

export default function GameHub({ navigation }) {
  const [language, setLanguage] = useState('hindi');
  const [playerName, setPlayerName] = useState('Player');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const lang = await AsyncStorage.getItem('userLanguage');
      const name = (await AsyncStorage.getItem('playerName')) || (await AsyncStorage.getItem('userName')) || 'Player';
      if (lang) setLanguage(lang);
      setPlayerName(name);
    } catch (e) {}
  };

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    await AsyncStorage.setItem('userLanguage', lang);
  };

  const handleGameClick = (game) => {
    navigation.navigate(game.screen, { language });
  };

  const handleLogout = async () => {
    const keys = ['isLoggedIn', 'playerId', 'playerName', 'playerEmail', 'userId', 'userName', 'userLanguage', 'akshara_session'];
    await AsyncStorage.multiRemove(keys);
    navigation.replace('AuthPage');
  };

  const handleLessons = () => {
    navigation.navigate('Lessons', { language });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.userArea}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{playerName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.welcome}>Welcome back!</Text>
            <Text style={styles.nameText}>{playerName}</Text>
          </View>
        </View>
        <View style={styles.controls}>
          <View style={styles.langToggle}>
            <TouchableOpacity
              style={[styles.langBtn, language === 'hindi' && styles.langActive]}
              onPress={() => handleLanguageChange('hindi')}
            >
              <Text style={[styles.langBtnText, language === 'hindi' && styles.langActiveText]}>Hindi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, language === 'telugu' && styles.langActive]}
              onPress={() => handleLanguageChange('telugu')}
            >
              <Text style={[styles.langBtnText, language === 'telugu' && styles.langActiveText]}>Telugu</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutEmoji}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={styles.title}>🎮 Choose Your Game 🌟</Text>
        <Text style={styles.subtitle}>
          {GAMES.length} amazing games to learn {language === 'hindi' ? 'Hindi (हिंदी)' : 'Telugu (తెలుగు)'} letters and words!
        </Text>

        {/* Lessons Banner */}
        <TouchableOpacity style={styles.lessonsBanner} onPress={handleLessons}>
          <Text style={styles.lessonsIcon}>📚</Text>
          <View style={styles.lessonsTextArea}>
            <Text style={styles.lessonsTitle}>Learn Words First!</Text>
            <Text style={styles.lessonsDesc}>Start with lessons before playing Mars Game</Text>
          </View>
          <Text style={styles.lessonsArrow}>→</Text>
        </TouchableOpacity>

        {/* Game Cards */}
        {GAMES.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={[styles.card, { borderLeftColor: game.color, borderLeftWidth: 4 }]}
            onPress={() => handleGameClick(game)}
            activeOpacity={0.85}
          >
            {game.special && (
              <View style={styles.specialBadge}>
                <Text style={styles.specialBadgeText}>✨ NEW</Text>
              </View>
            )}
            <View style={styles.cardRow}>
              <View style={[styles.emojiWrap, { backgroundColor: game.color + '22' }]}>
                <Text style={styles.cardEmoji}>{game.emoji}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{game.title}</Text>
                <Text style={styles.cardCategory}>{game.category}</Text>
                <Text style={styles.cardDesc}>{game.description}</Text>
              </View>
            </View>
            <View style={styles.playRow}>
              <Text style={[styles.playText, { color: game.color }]}>Play</Text>
              <Text style={[styles.playArrow, { color: game.color }]}>▶</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  userArea: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#a855f7', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  welcome: { fontSize: 11, color: '#94a3b8' },
  nameText: { fontSize: 15, fontWeight: '700', color: '#e2e8f0' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  langToggle: { flexDirection: 'row', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  langBtn: { paddingHorizontal: 14, paddingVertical: 7 },
  langActive: { backgroundColor: '#a855f7' },
  langBtnText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  langActiveText: { color: '#fff' },
  logoutEmoji: { fontSize: 24 },
  scroll: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#FFD700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 16 },
  lessonsBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(168,85,247,0.12)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)', marginBottom: 16 },
  lessonsIcon: { fontSize: 28, marginRight: 12 },
  lessonsTextArea: { flex: 1 },
  lessonsTitle: { fontSize: 15, fontWeight: '700', color: '#e2e8f0' },
  lessonsDesc: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  lessonsArrow: { fontSize: 20, color: '#a855f7', fontWeight: '700' },
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  specialBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#a855f7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, zIndex: 1 },
  specialBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  emojiWrap: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardEmoji: { fontSize: 28 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#e2e8f0' },
  cardCategory: { fontSize: 11, color: '#a855f7', fontWeight: '600', marginTop: 2 },
  cardDesc: { fontSize: 12, color: '#94a3b8', marginTop: 4, lineHeight: 17 },
  playRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, gap: 6 },
  playText: { fontSize: 14, fontWeight: '700' },
  playArrow: { fontSize: 12 },
});
