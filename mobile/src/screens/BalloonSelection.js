import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function BalloonSelection({ navigation, route }) {
  const { language } = route.params;
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/balloon/${language}`);
      setGames(response.data.games);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching games:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading levels...</Text>
      </View>
    );
  }

  const balloonEmojis = ['🎈', '🎈', '🎈', '🎈', '🎈'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Balloon Pop Levels</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.title}>Choose Your Level 🎈</Text>
      <Text style={styles.subtitle}>Pop the correct balloons!</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.levelsGrid}>
          {games.map((game, index) => (
            <TouchableOpacity
              key={game._id}
              style={styles.levelCard}
              onPress={() => navigation.navigate('BalloonGame', { language, level: game.level })}
            >
              <View style={styles.levelIconContainer}>
                <Text style={styles.levelIcon}>{balloonEmojis[index % balloonEmojis.length]}</Text>
              </View>
              <Text style={styles.levelNumber}>Level {game.level}</Text>
              <Text style={styles.levelTitle}>{game.title}</Text>
              <Text style={styles.levelDescription}>{game.description}</Text>
              <View style={styles.levelInfo}>
                <Text style={styles.levelInfoText}>⏱ {game.config.timeLimit}s</Text>
                <Text style={styles.levelInfoText}>🎯 {game.config.numberOfRounds} rounds</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B0C2A',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
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
    color: '#4ECDC4',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  scrollContent: {
    padding: 20,
  },
  levelsGrid: {
    gap: 15,
  },
  levelCard: {
    backgroundColor: '#1a1a40',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FF6B6B',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelIcon: {
    fontSize: 40,
  },
  levelNumber: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  levelDescription: {
    fontSize: 14,
    color: '#8892b0',
    textAlign: 'center',
    marginBottom: 10,
  },
  levelInfo: {
    flexDirection: 'row',
    gap: 15,
  },
  levelInfoText: {
    fontSize: 12,
    color: '#4ECDC4',
  },
});
