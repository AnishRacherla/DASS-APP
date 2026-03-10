import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

export default function PlanetHome({ route, navigation }) {
  const language = route.params?.language || 'hindi';
  const [marsUnlocked, setMarsUnlocked] = useState(false);
  const [totalScore, setTotalScore] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      setUserId(uid);
      const lessonsCompleted = await AsyncStorage.getItem('lessonsCompleted_' + language);
      if (lessonsCompleted === 'true') setMarsUnlocked(true);
      if (uid) fetchTotalScore(uid);
    } catch (e) {}
  };

  const fetchTotalScore = async (uid) => {
    try {
      const res = await axios.get(API_BASE_URL + '/api/scores/user/' + uid + '/total?language=' + language, { timeout: API_TIMEOUT });
      setTotalScore(res.data);
    } catch (e) {}
  };

  const planets = [
    { id: 'earth', name: 'Earth', emoji: '🌍', category: 'Letters', description: 'Learn letters and sounds', color: '#4ECDC4', unlocked: true },
    { id: 'mars', name: 'Mars', emoji: '🔴', category: 'Words', description: 'Match images with words', color: '#FF6B6B', unlocked: marsUnlocked },
  ];

  const handlePlanetClick = (planet) => {
    if (!planet.unlocked) {
      Alert.alert('Locked', 'Complete lessons from previous planet to unlock!');
      return;
    }
    if (planet.id === 'earth') {
      navigation.navigate('GameSelection', { language, planet: 'earth' });
    } else if (planet.id === 'mars') {
      navigation.navigate('MarsLevelSelection', { language, planet: 'mars' });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('GameHub')}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Planet</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Learning Journey</Text>
        <Text style={styles.subtitle}>Language: {language === 'hindi' ? 'Hindi 🇮🇳' : 'Telugu 🇮🇳'}</Text>

        {totalScore && (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreTitle}>🏆 Total Score: {totalScore.totalScore} Points</Text>
            <View style={styles.scoreBreakdown}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>🎵 Audio Quiz:</Text>
                <Text style={styles.scoreVal}>{totalScore.gameTypeTotals?.quiz || 0} pts</Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>🎈 Balloon Pop:</Text>
                <Text style={styles.scoreVal}>{totalScore.gameTypeTotals?.balloon || 0} pts</Text>
              </View>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>🔴 Mars Game:</Text>
                <Text style={styles.scoreVal}>{totalScore.gameTypeTotals?.mars || 0} pts</Text>
              </View>
            </View>
            <Text style={styles.gamesPlayed}>Games Played: {totalScore.gamesPlayed?.total || 0}</Text>
          </View>
        )}

        {planets.map((planet, index) => (
          <React.Fragment key={planet.id}>
            <TouchableOpacity
              style={[styles.planetCard, { borderLeftColor: planet.color, borderLeftWidth: 4 }, !planet.unlocked && styles.locked]}
              onPress={() => handlePlanetClick(planet)}
              activeOpacity={0.8}
            >
              <View style={[styles.planetIcon, { backgroundColor: planet.color }]}>
                <Text style={styles.planetEmoji}>{planet.emoji}</Text>
              </View>
              <View style={styles.planetInfo}>
                <Text style={styles.planetName}>{planet.name}</Text>
                <Text style={styles.planetCategory}>{planet.category}</Text>
                <Text style={styles.planetDesc}>{planet.description}</Text>
              </View>
              {!planet.unlocked && <Text style={styles.lockIcon}>🔒</Text>}
            </TouchableOpacity>

            {index === 0 && (
              <TouchableOpacity
                style={styles.lessonsBtn}
                onPress={() => navigation.navigate('Lessons', { language })}
              >
                <Text style={styles.lessonsBtnText}>📚 Learn Words Before Mars</Text>
              </TouchableOpacity>
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { color: '#a855f7', fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#e2e8f0' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', color: '#FFD700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },

  scoreCard: { backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)', marginBottom: 24 },
  scoreTitle: { fontSize: 18, fontWeight: '700', color: '#FFD700', marginBottom: 10 },
  scoreBreakdown: { gap: 6 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scoreLabel: { fontSize: 14, color: '#e2e8f0' },
  scoreVal: { fontSize: 14, fontWeight: '600', color: '#FFD700' },
  gamesPlayed: { fontSize: 13, color: '#94a3b8', marginTop: 10, textAlign: 'center' },

  planetCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  locked: { opacity: 0.5 },
  planetIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  planetEmoji: { fontSize: 28 },
  planetInfo: { flex: 1 },
  planetName: { fontSize: 18, fontWeight: '700', color: '#e2e8f0' },
  planetCategory: { fontSize: 12, color: '#a855f7', fontWeight: '600', marginTop: 2 },
  planetDesc: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  lockIcon: { fontSize: 24 },

  lessonsBtn: { alignSelf: 'center', backgroundColor: 'rgba(168,85,247,0.15)', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)', marginVertical: 12 },
  lessonsBtnText: { fontSize: 15, fontWeight: '700', color: '#c084fc' },
});
