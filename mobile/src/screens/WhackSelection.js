import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

const difficultyColor = { easy: '#4CAF50', medium: '#FFD700', hard: '#FF5252' };
const difficultyLabel = { easy: '⭐ Easy', medium: '⭐⭐ Medium', hard: '⭐⭐⭐ Hard' };

export default function WhackSelection({ route, navigation }) {
  const paramLanguage = route.params?.language;
  const [language, setLanguage] = useState(paramLanguage || 'hindi');
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    if (!paramLanguage) {
      const stored = await AsyncStorage.getItem('userLanguage');
      if (stored) setLanguage(stored);
    }
    fetchGames();
  };

  const fetchGames = async () => {
    try {
      const lang = paramLanguage || (await AsyncStorage.getItem('userLanguage')) || 'hindi';
      const res = await axios.get(API_BASE_URL + '/api/whack/' + lang, { timeout: API_TIMEOUT });
      setGames(res.data.games || []);
    } catch (e) {
      console.log('WhackSelection fetch error:', e.message);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#ffa502" />
        <Text style={styles.loadingText}>🔨 Loading levels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('GameHub')}>
          <Text style={styles.backBtn}>← Back to Games</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔨 Whack-a-Letter</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subtitle}>
          {language === 'hindi' ? 'Hindi 🇮🇳' : 'Telugu 🇮🇳'} — Choose a level
        </Text>

        {games.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No games found. Please check if WhackGame data is seeded.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {games.map((game) => (
              <TouchableOpacity
                key={game._id}
                style={styles.card}
                onPress={() => navigation.navigate('WhackGame', { language, level: game.level })}
                activeOpacity={0.85}
              >
                <View style={[styles.badge, { backgroundColor: difficultyColor[game.difficulty] || '#4ECDC4' }]}>
                  <Text style={styles.badgeText}>{difficultyLabel[game.difficulty] || game.difficulty}</Text>
                </View>
                <Text style={styles.targetLetter}>🔊</Text>
                <Text style={styles.levelLabel}>Level {game.level}</Text>
                <Text style={styles.cardDesc}>{game.description}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>⏱ 40s</Text>
                  <Text style={styles.metaText}>🔄 5 rounds</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A' },
  loadingText: { color: '#94a3b8', marginTop: 12, fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { color: '#a855f7', fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#e2e8f0' },
  scroll: { padding: 20, paddingBottom: 40 },
  subtitle: { fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 20 },
  emptyBox: { padding: 50, alignItems: 'center' },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, width: '45%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  badge: { alignSelf: 'stretch', paddingVertical: 4, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  targetLetter: { fontSize: 36, marginBottom: 4 },
  levelLabel: { fontSize: 16, fontWeight: '700', color: '#e2e8f0', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#94a3b8', textAlign: 'center', marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 12 },
  metaText: { fontSize: 11, color: '#c084fc' },
});
