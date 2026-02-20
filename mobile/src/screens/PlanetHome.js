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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function PlanetHome({ navigation, route }) {
  const { language } = route.params;
  const [totalScore, setTotalScore] = useState(null);
  const [marsUnlocked, setMarsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMarsUnlock();
    fetchTotalScore();
  }, []);

  const checkMarsUnlock = async () => {
    try {
      const unlocked = await AsyncStorage.getItem(`lessonsCompleted_${language}`);
      setMarsUnlocked(unlocked === 'true');
    } catch (error) {
      console.error('Error checking Mars unlock:', error);
    }
  };

  const fetchTotalScore = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/scores/user/${userId}/total?language=${language}`);
      setTotalScore(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching total score:', error);
      setLoading(false);
    }
  };

  const planets = [
    {
      id: 'earth',
      name: 'Earth',
      emoji: '🌍',
      color: '#4ECDC4',
      description: 'Learn letters and sounds',
      unlocked: true,
      screen: 'GameSelection'
    },
    {
      id: 'mars',
      name: 'Mars',
      emoji: '🔴',
      color: '#FF6B6B',
      description: 'Match words with images',
      unlocked: marsUnlocked,
      screen: 'MarsLevelSelection'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Homepage')}>
          <Text style={styles.backBtnText}>← Home</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Planet System</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          {language === 'hindi' ? 'Hindi 🇮🇳' : 'Telugu 🇮🇳'} Learning
        </Text>

        {/* Score Display */}
        {loading ? (
          <ActivityIndicator size="large" color="#4ECDC4" style={styles.loader} />
        ) : totalScore && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreTitle}>Total Score: {totalScore.totalScore}</Text>
            {totalScore.gameTypeTotals && (
              <View style={styles.scoreBreakdown}>
                {totalScore.gameTypeTotals.quiz > 0 && (
                  <Text style={styles.scoreItem}>🎯 Quiz: {totalScore.gameTypeTotals.quiz}</Text>
                )}
                {totalScore.gameTypeTotals.balloon > 0 && (
                  <Text style={styles.scoreItem}>🎈 Balloon: {totalScore.gameTypeTotals.balloon}</Text>
                )}
                {totalScore.gameTypeTotals.mars > 0 && (
                  <Text style={styles.scoreItem}>🔴 Mars: {totalScore.gameTypeTotals.mars}</Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Planets */}
        <View style={styles.planetsContainer}>
          {planets.map((planet) => (
            <TouchableOpacity
              key={planet.id}
              style={[
                styles.planetCard,
                { borderColor: planet.color },
                !planet.unlocked && styles.lockedCard
              ]}
              onPress={() => {
                if (planet.unlocked) {
                  navigation.navigate(planet.screen, { language });
                }
              }}
              disabled={!planet.unlocked}
            >
              <View style={[styles.planetIcon, { backgroundColor: planet.color }]}>
                <Text style={styles.planetEmoji}>{planet.emoji}</Text>
              </View>
              <View style={styles.planetInfo}>
                <Text style={styles.planetName}>{planet.name}</Text>
                <Text style={styles.planetDescription}>{planet.description}</Text>
                {!planet.unlocked && (
                  <Text style={styles.lockedText}>🔒 Complete 20 lessons to unlock</Text>
                )}
              </View>
              {planet.unlocked && <Text style={styles.arrow}>→</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Lessons Button */}
        <TouchableOpacity
          style={styles.lessonsButton}
          onPress={() => navigation.navigate('Lessons', { language })}
        >
          <Text style={styles.lessonsButtonText}>📚 Learn 20 Words</Text>
          <Text style={styles.lessonsButtonSubtext}>Complete to unlock Mars!</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C2A',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  scoreContainer: {
    backgroundColor: '#1a1a40',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  scoreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ECDC4',
    textAlign: 'center',
    marginBottom: 10,
  },
  scoreBreakdown: {
    marginTop: 10,
  },
  scoreItem: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 3,
  },
  planetsContainer: {
    gap: 15,
    marginBottom: 20,
  },
  planetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a40',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 15,
  },
  lockedCard: {
    opacity: 0.5,
    borderColor: '#666',
  },
  planetIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  planetEmoji: {
    fontSize: 40,
  },
  planetInfo: {
    flex: 1,
  },
  planetName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  planetDescription: {
    fontSize: 14,
    color: '#8892b0',
  },
  lockedText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 5,
  },
  arrow: {
    fontSize: 24,
    color: '#4ECDC4',
  },
  lessonsButton: {
    backgroundColor: '#4ECDC4',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  lessonsButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B0C2A',
    marginBottom: 5,
  },
  lessonsButtonSubtext: {
    fontSize: 14,
    color: '#0B0C2A',
  },
});
