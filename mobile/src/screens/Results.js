import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Results({ navigation, route }) {
  const { score, totalQuestions, language, level, gameType, correctAnswers } = route.params;

  const safeTotal = Math.max(totalQuestions || correctAnswers || 1, 1);
  const safeCorrect = correctAnswers || 0;
  const percentage = (safeCorrect / safeTotal) * 100;
  const passed = safeCorrect >= Math.ceil(safeTotal * 0.6);
  const stars = percentage >= 80 ? 3 : percentage >= 60 ? 2 : 1;

  useEffect(() => {
    saveScore();
  }, []);

  const saveScore = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      await axios.post(`${API_BASE_URL}/api/scores`, {
        userId,
        score,
        gameType: gameType || 'quiz',
        language,
        level: level || 1,
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const getEmoji = () => {
    if (gameType === 'balloon' || gameType === 'mars') {
      if (percentage >= 80) return '🏆';
      if (percentage >= 60) return '🌟';
      if (percentage >= 40) return '⭐';
      if (percentage >= 20) return '💫';
      return '💪';
    }
    // Quiz game logic
    if (score === 5) return '🏆';
    if (score >= 4) return '🌟';
    if (score >= 3) return '⭐';
    if (score >= 2) return '💫';
    return '💪';
  };

  const getMessage = () => {
    if (gameType === 'balloon' || gameType === 'mars') {
      if (percentage >= 80) return 'Amazing! You\'re a Pro!';
      if (percentage >= 60) return 'Great Job!';
      if (percentage >= 40) return 'Good Try!';
      if (percentage >= 20) return 'Keep Practicing!';
      return 'Try Again!';
    }
    // Quiz game logic
    if (score === 5) return 'Perfect! All Correct!';
    if (score >= 4) return 'Excellent Work!';
    if (score >= 3) return 'Great Job!';
    if (score >= 2) return 'Good Try!';
    return 'Keep Practicing!';
  };

  const isBaloonGame = gameType === 'balloon';
  const isMarsGame = gameType === 'mars';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.resultsCard}>
          <Text style={styles.emoji}>{getEmoji()}</Text>
          
          <Text style={styles.title}>{getMessage()}</Text>

          {(isBaloonGame || isMarsGame) ? (
            <View style={styles.scorePoints}>
              <Text style={styles.scoreLabel}>Total Score:</Text>
              <Text style={styles.scoreValue}>{score} points</Text>
            </View>
          ) : (
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreNumber}>{safeCorrect}</Text>
              <Text style={styles.scoreSeparator}>/</Text>
              <Text style={styles.scoreTotal}>{safeTotal}</Text>
            </View>
          )}

          {!isBaloonGame && !isMarsGame && (
            <Text style={styles.percentage}>
              {isNaN(percentage) ? '0' : percentage.toFixed(0)}% Correct
            </Text>
          )}

          <View style={styles.starsRating}>
            {[...Array(3)].map((_, i) => (
              <Text key={i} style={i < stars ? styles.starFilled : styles.starEmpty}>
                ⭐
              </Text>
            ))}
          </View>

          {passed && (
            <View style={styles.successMessage}>
              <Text style={styles.successIcon}>🎉</Text>
              <Text style={styles.successText}>Next Level Unlocked!</Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                if (gameType === 'balloon') {
                  navigation.navigate('BalloonGame', { language, level });
                } else if (gameType === 'mars') {
                  navigation.navigate('MarsGame', { language, level });
                } else {
                  navigation.navigate('Quiz', { language, level });
                }
              }}
            >
              <Text style={styles.primaryBtnText}>🔄 Play Again</Text>
            </TouchableOpacity>

            {passed && gameType !== 'mars' && (
              <TouchableOpacity
                style={styles.successBtn}
                onPress={() => {
                  if (gameType === 'balloon') {
                    navigation.navigate('BalloonGame', { language, level: parseInt(level) + 1 });
                  } else {
                    navigation.navigate('Quiz', { language, level: parseInt(level) + 1 });
                  }
                }}
              >
                <Text style={styles.primaryBtnText}>Next Level →</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('PlanetHome', { language })}
            >
              <Text style={styles.secondaryBtnText}>🪐 Back to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Homepage')}
            >
              <Text style={styles.secondaryBtnText}>🏠 Main Menu</Text>
            </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  resultsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  scorePoints: {
    backgroundColor: 'rgba(78,205,196,0.2)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#8892b0',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 32,
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreNumber: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  scoreSeparator: {
    fontSize: 60,
    color: 'white',
    marginHorizontal: 10,
  },
  scoreTotal: {
    fontSize: 60,
    color: 'white',
  },
  percentage: {
    fontSize: 24,
    color: 'white',
    marginBottom: 30,
    paddingHorizontal: 30,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  starsRating: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  starFilled: {
    fontSize: 50,
    marginHorizontal: 5,
  },
  starEmpty: {
    fontSize: 50,
    marginHorizontal: 5,
    opacity: 0.3,
  },
  successMessage: {
    backgroundColor: 'rgba(76,175,80,0.3)',
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  successIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  successText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  actionsContainer: {
    width: '100%',
  },
  primaryBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 50,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B0C2A',
  },
  successBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryBtn: {
    backgroundColor: '#6B2FA5',
    borderRadius: 50,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryBtnText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
