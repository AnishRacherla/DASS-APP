import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

export default function PlanetSelection({ route, navigation }) {
  const [language, setLanguage] = useState(route.params?.language || 'hindi');
  const [quizzes, setQuizzes] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('userLanguage');
        if (storedLanguage) {
          setLanguage(storedLanguage);
        }
      } catch (e) {}
    };

    loadStoredLanguage();
    loadAndFetch();
  }, [language]);

  const loadAndFetch = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      const name = await AsyncStorage.getItem('userName');
      setUserId(uid);
      setUserName(name || '');

      const quizzesRes = await axios.get(API_BASE_URL + '/api/quizzes/' + language, { timeout: API_TIMEOUT });
      setQuizzes(quizzesRes.data.quizzes || []);

      if (uid) {
        const progressRes = await axios.get(API_BASE_URL + '/api/progress/' + uid, { timeout: API_TIMEOUT });
        setProgress(progressRes.data.progress);
      }
    } catch (e) {
      console.log('PlanetSelection fetch error:', e.message);
    }
    setLoading(false);
  };

  const isPlanetUnlocked = (level) => progress && level <= progress.currentLevel;

  const handlePlanetClick = (level) => {
    if (isPlanetUnlocked(level)) {
      navigation.navigate('Quiz', { language, level });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>🌍 Loading Planets...</Text>
      </View>
    );
  }

  const planetEmojis = ['🌍', '🌎', '⛰️'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('GameHub')}>
          <Text style={styles.backBtn}>← Home</Text>
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome, {userName}! 👋</Text>
          <Text style={styles.scoreInfo}>🏆 Total Score: {progress?.totalScore || 0}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Choose Your World 🗺️</Text>
        <Text style={styles.titleSub}>Select a level to start learning</Text>

        <View style={styles.grid}>
          {quizzes.map((quiz, index) => {
            const unlocked = isPlanetUnlocked(quiz.level);
            return (
              <TouchableOpacity
                key={quiz._id}
                style={[styles.planetCard, !unlocked && styles.lockedCard]}
                onPress={() => handlePlanetClick(quiz.level)}
                activeOpacity={unlocked ? 0.8 : 1}
              >
                <Text style={styles.planetEmoji}>{planetEmojis[index % planetEmojis.length]}</Text>
                <Text style={styles.planetName}>{quiz.planetName}</Text>
                <Text style={styles.planetLevel}>Level {quiz.level}</Text>
                <Text style={styles.planetQuestions}>{quiz.questions?.length || 0} Questions</Text>
                {!unlocked && (
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockIcon}>🔒</Text>
                    <Text style={styles.lockText}>Locked</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Progress Card */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>📊 Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Quizzes Completed</Text>
              <Text style={styles.statValue}>{progress?.quizzesCompleted || 0}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current Level</Text>
              <Text style={styles.statValue}>{progress?.currentLevel || 1}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Score</Text>
              <Text style={styles.statValue}>{progress?.totalScore || 0}</Text>
            </View>
          </View>
        </View>

        {/* Other Games */}
        <Text style={styles.otherGamesTitle}>🎮 Other Games</Text>
        <TouchableOpacity
          style={styles.whackCard}
          onPress={() => navigation.navigate('WhackSelection', { language })}
        >
          <Text style={styles.whackIcon}>🔨</Text>
          <View style={styles.whackInfo}>
            <Text style={styles.whackName}>Whack-a-Letter</Text>
            <Text style={styles.whackDesc}>Tap the tiles that show the target letter!</Text>
          </View>
          <Text style={styles.whackArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A' },
  loadingText: { color: '#94a3b8', marginTop: 12, fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { color: '#a855f7', fontSize: 15, fontWeight: '600' },
  userInfo: { alignItems: 'flex-end' },
  welcomeText: { fontSize: 13, color: '#e2e8f0' },
  scoreInfo: { fontSize: 12, color: '#FFD700', fontWeight: '600' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#FFD700', textAlign: 'center', marginBottom: 4 },
  titleSub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 20 },
  planetCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, alignItems: 'center', width: '45%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  lockedCard: { opacity: 0.45 },
  planetEmoji: { fontSize: 40, marginBottom: 8 },
  planetName: { fontSize: 16, fontWeight: '700', color: '#e2e8f0', marginBottom: 2 },
  planetLevel: { fontSize: 13, color: '#a855f7', fontWeight: '600' },
  planetQuestions: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  lockOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  lockIcon: { fontSize: 28 },
  lockText: { fontSize: 12, color: '#fff', fontWeight: '600', marginTop: 4 },

  progressCard: { backgroundColor: 'rgba(78,205,196,0.08)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(78,205,196,0.2)', marginBottom: 24 },
  progressTitle: { fontSize: 17, fontWeight: '700', color: '#e2e8f0', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 4, textAlign: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#4ECDC4' },

  otherGamesTitle: { fontSize: 18, fontWeight: '700', color: '#e2e8f0', marginBottom: 12 },
  whackCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,165,2,0.1)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,165,2,0.25)' },
  whackIcon: { fontSize: 32, marginRight: 12 },
  whackInfo: { flex: 1 },
  whackName: { fontSize: 16, fontWeight: '700', color: '#e2e8f0' },
  whackDesc: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  whackArrow: { fontSize: 20, color: '#ffa502', fontWeight: '700' },
});
