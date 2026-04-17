import React, { useEffect, useRef } from 'react';
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
import { API_BASE_URL, API_TIMEOUT } from '../config';

export default function Results({ navigation, route }) {
  const { score, totalQuestions, language, level, difficulty, gameType, correctAnswers, penalties } = route.params;
  const scoreSavedRef = useRef(false);

  const isBaloonGame = gameType === 'balloon';
  const isMarsGame = gameType === 'mars';
  const isWhackGame = gameType === 'whack';
  const isBubbleShooterGame = gameType === 'bubble-shooter';
  const isWordSortingGame = gameType === 'word-sorting-basket';

  const correctCount = correctAnswers !== undefined ? correctAnswers : score;
  const totalQuestionsValue = totalQuestions || correctCount || 1;
  const whackPenaltyCount = penalties || 0;
  const whackPassed = whackPenaltyCount === 0 && score >= 10;
  const percentage = (isWhackGame || isBubbleShooterGame || isWordSortingGame)
    ? (totalQuestionsValue > 0 ? ((correctCount / totalQuestionsValue) * 100) : 0)
    : totalQuestionsValue > 0
      ? ((correctCount / totalQuestionsValue) * 100)
      : (score > 0 ? 100 : 0);
  const passed = isWhackGame ? whackPassed : (correctCount >= Math.ceil(totalQuestionsValue * 0.6));
  
  let stars = 1;
  if (isWhackGame) {
    stars = whackPassed ? (whackPenaltyCount === 0 && score >= 30 ? 3 : 2) : 1;
  } else if (isBaloonGame || isMarsGame || isWordSortingGame) {
    stars = score >= 30 ? 3 : score >= 15 ? 2 : 1;
  } else {
    stars = percentage >= 80 ? 3 : percentage >= 50 ? 2 : 1;
  }

  useEffect(() => {
    if (!score && score !== 0) {
      navigation.navigate('GameHub');
    } else {
      saveScore();
    }
  }, []);

  const saveScore = async () => {
    if (scoreSavedRef.current) return;
    scoreSavedRef.current = true;

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await axios.post(`${API_BASE_URL}/api/scores`, {
        userId,
        gameType: gameType || 'quiz',
        language,
        level: level || 1,
        score,
        stars,
        correctAnswers: correctAnswers !== undefined ? correctAnswers : score,
        totalQuestions,
      }, { timeout: API_TIMEOUT });
      
      const averageStars = response?.data?.averageStars !== undefined ? response.data.averageStars : stars;
      await AsyncStorage.setItem(`stars_${gameType || 'quiz'}`, String(averageStars));
    } catch (error) {
      console.log('Score save failed (non-critical):', error?.message);
      scoreSavedRef.current = false;
    }
  };

  const getEmoji = () => {
    if (isWhackGame && whackPassed) return '🔨';
    if (isBubbleShooterGame && score >= 30) return '🫧';
    if (isWordSortingGame && score >= 30) return '🧺';
    if (percentage === 100) return '🏆';
    if (percentage >= 80) return '🌟';
    if (percentage >= 60) return '⭐';
    if (percentage >= 40) return '💫';
    return '💪';
  };

  const getMessage = () => {
    if (isWhackGame) {
      if (whackPassed && whackPenaltyCount === 0) return 'Sharp Aim!';
      if (score > 0) return 'Nice Reflexes!';
      return 'Keep Practicing!';
    }
    if (isBubbleShooterGame) {
      if (score >= 30) return 'Bubble Master!';
      if (score > 0) return 'Nice Shooting!';
      return 'Keep Practicing!';
    }
    if (isWordSortingGame) {
      if (score >= 30) return 'Sorting Master!';
      if (score > 0) return 'Nice Sorting!';
      return 'Keep Practicing!';
    }
    if (percentage === 100) return 'Perfect! All Correct!';
    if (percentage >= 80) return 'Excellent Work!';
    if (percentage >= 60) return 'Great Job!';
    if (percentage >= 40) return 'Good Try!';
    return 'Keep Practicing!';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.resultsCard}>
          <Text style={styles.emoji}>{getEmoji()}</Text>
          
          <Text style={styles.title}>{getMessage()}</Text>

          {(isBaloonGame || isMarsGame || isWhackGame || isBubbleShooterGame || isWordSortingGame) ? (
            <View style={styles.scorePoints}>
              <Text style={styles.scoreLabel}>Total Score:</Text>
              <Text style={styles.scoreValue}>{score} Points</Text>
            </View>
          ) : (
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreNumber}>{correctCount}</Text>
              <Text style={styles.scoreSeparator}>/</Text>
              <Text style={styles.scoreTotal}>{totalQuestionsValue}</Text>
            </View>
          )}

          <Text style={styles.percentage}>
            {isBaloonGame
              ? `${correctCount} Correct Balloons • ${totalQuestions || 0} Total Taps`
              : isMarsGame
                ? `${correctCount}/${totalQuestionsValue} Correct`
                : isWhackGame
                  ? `${correctCount} Hits • ${whackPenaltyCount} Penalties`
                  : isBubbleShooterGame
                    ? `${correctCount} Correct Hits • ${penalties || 0} Wrong Hits`
                    : isWordSortingGame
                      ? `${correctCount} Correct Placements • ${penalties || 0} Wrong Drops`
                  : `${isNaN(percentage) ? '0' : percentage.toFixed(0)}% Correct`
            }
          </Text>

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
            {/* Whack Game buttons */}
            {isWhackGame && (
              <>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => navigation.navigate('WhackGame', { language, level })}
                >
                  <Text style={styles.primaryBtnText}>🔄 Play Again</Text>
                </TouchableOpacity>

                {passed && (
                  <TouchableOpacity
                    style={styles.successBtn}
                    onPress={() => navigation.navigate('WhackGame', { language, level: parseInt(level) + 1 })}
                  >
                    <Text style={styles.primaryBtnText}>Next Level →</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => navigation.navigate('MarsLevelSelection', { language })}
                >
                  <Text style={styles.secondaryBtnText}>🏠 Back to Mars</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Mars Game buttons */}
            {isMarsGame && (
              <>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => navigation.navigate('MarsGame', { language, level })}
                >
                  <Text style={styles.primaryBtnText}>🔄 Play Again</Text>
                </TouchableOpacity>

                {passed && level < 2 && (
                  <TouchableOpacity
                    style={styles.successBtn}
                    onPress={() => navigation.navigate('MarsGame', { language, level: parseInt(level) + 1 })}
                  >
                    <Text style={styles.primaryBtnText}>Next Level →</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => navigation.navigate('MarsLevelSelection', { language })}
                >
                  <Text style={styles.secondaryBtnText}>🏠 Back to Mars</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Balloon Game buttons */}
            {isBaloonGame && (
              <>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => navigation.navigate('BalloonSelection', { language })}
                >
                  <Text style={styles.primaryBtnText}>🔄 Play Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => navigation.navigate('PlanetHome', { language })}
                >
                  <Text style={styles.secondaryBtnText}>🏠 Back to Home</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Bubble Shooter buttons */}
            {isBubbleShooterGame && (
              <>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => navigation.navigate('BubbleShooterGame', {
                    language,
                    difficulty: difficulty || (level >= 3 ? 'hard' : level === 2 ? 'medium' : 'easy')
                  })}
                >
                  <Text style={styles.primaryBtnText}>🔄 Play Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => navigation.navigate('BubbleShooterSelection', { language })}
                >
                  <Text style={styles.secondaryBtnText}>🫧 Change Level</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => navigation.navigate('GameHub')}
                >
                  <Text style={styles.secondaryBtnText}>🏠 Back to Games</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Word Sorting Basket buttons */}
            {isWordSortingGame && (
              <>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => navigation.navigate('WordSortingBasketGame', { language, level: level || 1 })}
                >
                  <Text style={styles.primaryBtnText}>🔄 Play Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => navigation.navigate('WordSortingBasketSelection', { language })}
                >
                  <Text style={styles.secondaryBtnText}>🧺 Change Level</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => navigation.navigate('GameHub')}
                >
                  <Text style={styles.secondaryBtnText}>🏠 Back to Games</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Quiz Game buttons */}
            {!gameType && (
              <>
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
                  onPress={() => navigation.navigate('PlanetHome', { language })}
                >
                  <Text style={styles.secondaryBtnText}>🏠 Back to Home</Text>
                </TouchableOpacity>
              </>
            )}
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
