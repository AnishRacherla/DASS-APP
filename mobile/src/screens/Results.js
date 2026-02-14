import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';

export default function Results({ navigation, route }) {
  const { score, totalQuestions, language, level } = route.params;

  const percentage = (score / totalQuestions) * 100;
  const passed = score >= 3;
  const stars = score >= 4 ? 3 : score >= 2 ? 2 : 1;

  const getEmoji = () => {
    if (score === 5) return '🏆';
    if (score >= 4) return '🌟';
    if (score >= 3) return '⭐';
    if (score >= 2) return '💫';
    return '💪';
  };

  const getMessage = () => {
    if (score === 5) return 'Perfect! All Correct!';
    if (score >= 4) return 'Excellent Work!';
    if (score >= 3) return 'Great Job!';
    if (score >= 2) return 'Good Try!';
    return 'Keep Practicing!';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.resultsCard}>
          <Text style={styles.emoji}>{getEmoji()}</Text>
          
          <Text style={styles.title}>{getMessage()}</Text>

          <View style={styles.scoreDisplay}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreSeparator}>/</Text>
            <Text style={styles.scoreTotal}>{totalQuestions}</Text>
          </View>

          <Text style={styles.percentage}>{percentage.toFixed(0)}% Correct</Text>

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
              onPress={() => navigation.navigate('Quiz', { language, level })}
            >
              <Text style={styles.primaryBtnText}>🔄 Play Again</Text>
            </TouchableOpacity>

            {passed && (
              <TouchableOpacity
                style={styles.successBtn}
                onPress={() => navigation.navigate('Quiz', { language, level: parseInt(level) + 1 })}
              >
                <Text style={styles.primaryBtnText}>Next Level →</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('PlanetSelection', { language })}
            >
              <Text style={styles.secondaryBtnText}>🪐 Back to Planets</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Homepage')}
            >
              <Text style={styles.secondaryBtnText}>🏠 Home</Text>
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
