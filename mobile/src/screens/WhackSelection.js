import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const difficultyColor = { easy: '#4CAF50', medium: '#FFD700', hard: '#FF5252' };
const difficultyLabel = { easy: '⭐ Easy', medium: '⭐⭐ Medium', hard: '⭐⭐⭐ Hard' };

export default function WhackSelection({ navigation, route }) {
  const { language } = route.params;
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/whack/${language}`)
      .then((res) => {
        setGames(res.data.games || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('WhackGame API error:', err);
        setError('Could not load levels. Please try again.');
        setLoading(false);
      });
  }, [language]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#FF8C42" />
        <Text style={styles.loadingText}>🔨 Loading levels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate('MarsLevelSelection', { language })}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Whack-a-Letter</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🔨 Choose a Level</Text>
        <Text style={styles.subtitle}>
          {language === 'hindi' ? 'Hindi 🇮🇳' : 'Telugu 🇮🇳'} — Tap the correct tiles!
        </Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>Make sure the backend is running and WhackGame data is seeded.</Text>
          </View>
        ) : games.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No levels found.</Text>
            <Text style={styles.errorHint}>Run: node seeds/seedWhackGames.js</Text>
          </View>
        ) : (
          <View style={styles.levelsContainer}>
            {games.map((game) => {
              const color = difficultyColor[game.difficulty] || '#4ECDC4';
              const label = difficultyLabel[game.difficulty] || game.difficulty;
              return (
                <TouchableOpacity
                  key={game._id}
                  style={[styles.levelCard, { borderColor: color }]}
                  onPress={() => navigation.navigate('WhackGame', { language, level: game.level })}
                >
                  <View style={[styles.levelBadge, { backgroundColor: color }]}>
                    <Text style={styles.levelBadgeText}>{label}</Text>
                  </View>
                  <View style={styles.levelBody}>
                    <Text style={styles.levelTitle}>Level {game.level}</Text>
                    {game.description ? (
                      <Text style={styles.levelDescription}>{game.description}</Text>
                    ) : null}
                    <View style={styles.levelMeta}>
                      <Text style={styles.levelMetaText}>⏱ 40s</Text>
                      <Text style={styles.levelMetaText}>🔄 5 rounds</Text>
                    </View>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* How to play */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📖 How to Play</Text>
          <Text style={styles.instructionsText}>
            {'• Listen carefully to the letter sound\n'}
            {'• Tiles will appear on the grid — tap FAST!\n'}
            {'• Only tap tiles showing the correct letter\n'}
            {'• +score for correct taps, -1 for wrong taps\n'}
            {'• 5 rounds in 40 seconds — good luck!'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C2A',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FF8C42',
    fontSize: 18,
    marginTop: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1a1a40',
  },
  backBtn: {
    width: 60,
  },
  backBtnText: {
    color: '#FF8C42',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#8892b0',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },
  levelsContainer: {
    marginBottom: 25,
  },
  levelCard: {
    backgroundColor: '#1a1a40',
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 15,
    overflow: 'hidden',
  },
  levelBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    borderBottomRightRadius: 12,
  },
  levelBadgeText: {
    color: '#0B0C2A',
    fontWeight: 'bold',
    fontSize: 13,
  },
  levelBody: {
    flexDirection: 'column',
    padding: 15,
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: '#8892b0',
    marginBottom: 8,
  },
  levelMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  levelMetaText: {
    fontSize: 13,
    color: '#4ECDC4',
    marginRight: 12,
  },
  arrow: {
    position: 'absolute',
    right: 18,
    top: '50%',
    fontSize: 22,
    color: '#FF8C42',
  },
  errorContainer: {
    backgroundColor: '#1a1a40',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorHint: {
    color: '#8892b0',
    fontSize: 13,
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: '#1a1a40',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF8C42',
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF8C42',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: '#8892b0',
    lineHeight: 22,
  },
});
