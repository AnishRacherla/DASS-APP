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

export default function PlanetSelection({ navigation, route }) {
  const { language } = route.params;
  const [quizzes, setQuizzes] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const name = await AsyncStorage.getItem('userName');
      setUserName(name);

      const quizzesResponse = await axios.get(`${API_BASE_URL}/api/quizzes/${language}`);
      setQuizzes(quizzesResponse.data.quizzes);

      if (userId) {
        const progressResponse = await axios.get(`${API_BASE_URL}/api/progress/${userId}`);
        setProgress(progressResponse.data.progress);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handlePlanetClick = (level) => {
    if (progress && level <= progress.currentLevel) {
      navigation.navigate('Quiz', { language, level });
    }
  };

  const isPlanetUnlocked = (level) => {
    return progress && level <= progress.currentLevel;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>🌍 Loading Planets...</Text>
      </View>
    );
  }

  const planetEmojis = ['🌎', '🪐', '🌕', '⭐', '🌙', '☄️', '🌟', '💫', '✨', '🌠'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Home</Text>
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Text style={styles.welcomeText}>Welcome, {userName}! 👋</Text>
          <Text style={styles.scoreInfo}>🏆 Total Score: {progress?.totalScore || 0}</Text>
        </View>
      </View>

      <Text style={styles.title}>Choose Your Planet 🪐</Text>
      <Text style={styles.subtitle}>Select a level to start learning</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.planetsGrid}>
          {quizzes.map((quiz, index) => {
            const unlocked = isPlanetUnlocked(quiz.level);
            
            return (
              <TouchableOpacity
                key={quiz._id}
                style={[
                  styles.planetCard,
                  unlocked ? styles.planetUnlocked : styles.planetLocked
                ]}
                onPress={() => handlePlanetClick(quiz.level)}
                disabled={!unlocked}
              >
                <Text style={styles.planetEmoji}>{planetEmojis[index % planetEmojis.length]}</Text>
                <Text style={styles.planetName}>{quiz.planetName}</Text>
                <Text style={styles.planetLevel}>Level {quiz.level}</Text>
                <Text style={styles.planetQuestions}>{quiz.questions.length} Questions</Text>
                
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

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>📊 Your Progress</Text>
          <View style={styles.statsContainer}>
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
    backgroundColor: '#0B0C2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
    color: 'white',
    marginTop: 20,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    backgroundColor: '#6B2FA5',
    borderRadius: 25,
    padding: 12,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  backBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  welcomeText: {
    fontSize: 20,
    color: '#FFD700',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scoreInfo: {
    fontSize: 16,
    color: 'white',
  },
  title: {
    fontSize: 32,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#9B5DE5',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollContent: {
    padding: 20,
  },
  planetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  planetCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 3,
  },
  planetUnlocked: {
    borderColor: '#FFD700',
  },
  planetLocked: {
    borderColor: '#666',
    opacity: 0.6,
  },
  planetEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  planetName: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  planetLevel: {
    fontSize: 14,
    color: '#9B5DE5',
    marginBottom: 3,
  },
  planetQuestions: {
    fontSize: 12,
    color: '#ddd',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 40,
    marginBottom: 5,
  },
  lockText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
  },
  progressTitle: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#ddd',
    marginBottom: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 28,
    color: '#FFD700',
    fontWeight: 'bold',
  },
});
