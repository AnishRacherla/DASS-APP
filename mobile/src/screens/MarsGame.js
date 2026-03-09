import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function MarsGame({ navigation, route }) {
  const { language, level } = route.params;
  const [game, setGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    fetchGame();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchGame = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/mars-game/${language}/${level}`);
      setGame(response.data.game);
      setLoading(false);
      
      // Auto-play audio for first question
      if (response.data.game.questions[0]) {
        playAudio(response.data.game.questions[0].audioUrl);
      }
    } catch (error) {
      console.error('Error fetching game:', error);
      Alert.alert('Error', 'Could not load game');
      navigation.goBack();
    }
  };

  const playAudio = async (audioUrl) => {
    if (!audioUrl) {
      return;
    }

    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `${API_BASE_URL}${audioUrl}` },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleImageClick = (imageIndex) => {
    if (showFeedback) return;
    
    const question = game.questions[currentQuestion];
    const isCorrect = imageIndex === question.correctImageIndex;
    
    setSelectedImage(imageIndex);
    setShowFeedback(true);
    
    let newScore = score;
    let newCorrectCount = correctCount;
    
    if (isCorrect) {
      newScore = score + 10;
      newCorrectCount = correctCount + 1;
      setScore(newScore);
      setCorrectCount(newCorrectCount);
    }
    
    // Move to next question after 1.5 seconds
    setTimeout(() => {
      if (currentQuestion < game.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedImage(null);
        setShowFeedback(false);
        
        // Play audio for next question
        playAudio(game.questions[currentQuestion + 1].audioUrl);
      } else {
        // Game over
        navigation.navigate('Results', {
          score: newScore,
          correctAnswers: newCorrectCount,
          totalQuestions: game.questions.length,
          gameType: 'mars',
          language,
          level
        });
      }
    }, 1500);
  };

  const handleExit = () => {
    Alert.alert(
      'Exit Game?',
      'Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => navigation.navigate('GameHub') }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  if (!game || game.questions.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>No questions available</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const question = game.questions[currentQuestion];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitBtn} onPress={handleExit}>
          <Text style={styles.exitBtnText}>← Exit</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mars Level {level}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{score} pts</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.progressBar}>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} / {game.questions.length}
          </Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionWord}>{question.word}</Text>
          {question.audioUrl && (
            <TouchableOpacity
              style={styles.audioButton}
              onPress={() => playAudio(question.audioUrl)}
            >
              <Text style={styles.audioButtonText}>🔊 Replay Sound</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.instruction}>Tap the correct image:</Text>

        <View style={styles.imagesGrid}>
          {question.images.map((imageUrl, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.imageOption,
                selectedImage === index && (
                  index === question.correctImageIndex
                    ? styles.correctImage
                    : styles.incorrectImage
                )
              ]}
              onPress={() => handleImageClick(index)}
              disabled={showFeedback}
            >
              <Image
                source={{ uri: `${API_BASE_URL}${imageUrl}` }}
                style={styles.optionImage}
                resizeMode="contain"
              />
              {showFeedback && selectedImage === index && (
                <Text style={styles.feedbackEmoji}>
                  {index === question.correctImageIndex ? '✓' : '✗'}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1a1a40',
  },
  exitBtn: {
    width: 80,
  },
  exitBtnText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreContainer: {
    width: 80,
    alignItems: 'flex-end',
  },
  scoreText: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressBar: {
    backgroundColor: '#1a1a40',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  progressText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionCard: {
    backgroundColor: '#1a1a40',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  audioButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  audioButtonText: {
    color: '#0B0C2A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: 18,
    color: '#8892b0',
    textAlign: 'center',
    marginBottom: 15,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageOption: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#1a1a40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionImage: {
    width: '100%',
    height: '100%',
  },
  correctImage: {
    borderColor: '#4ECDC4',
    backgroundColor: '#e8f9f8',
  },
  incorrectImage: {
    borderColor: '#FF6B6B',
    backgroundColor: '#ffe8e8',
  },
  feedbackEmoji: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 30,
    fontWeight: 'bold',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: '#0B0C2A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
