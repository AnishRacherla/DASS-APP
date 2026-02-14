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
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function Quiz({ navigation, route }) {
  const { language, level } = route.params;
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const [sound, setSound] = useState();

  useEffect(() => {
    fetchQuiz();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/quizzes/${language}/${level}`);
      setQuiz(response.data.quiz);
      setLoading(false);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setLoading(false);
    }
  };

  const playAudio = async () => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const questionId = quiz.questions[currentQuestion].questionId;
      const audioUrl = `${API_BASE_URL}/api/audio/${language}/${level}/${questionId}`;

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Could not play audio');
    }
  };

  const handleAnswerSelect = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      alert('Please select an answer!');
      return;
    }

    const question = quiz.questions[currentQuestion];
    const correct = selectedAnswer === question.correctAnswer;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    setIsCorrect(correct);
    setShowFeedback(true);

    const answerData = {
      questionId: question.questionId,
      selectedAnswer,
      isCorrect: correct,
      timeTaken
    };

    const updatedAnswers = [...answers, answerData];
    setAnswers(updatedAnswers);

    const newScore = correct ? score + 1 : score;
    setScore(newScore);

    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer('');
        setShowFeedback(false);
        setStartTime(Date.now());
      } else {
        submitQuizScore(updatedAnswers, newScore);
      }
    }, 2000);
  };

  const submitQuizScore = async (finalAnswers, finalScore) => {
    try {
      const userId = await AsyncStorage.getItem('userId');

      await axios.post(`${API_BASE_URL}/api/scores`, {
        userId,
        quizId: quiz._id,
        language,
        level: parseInt(level),
        score: finalScore,
        answers: finalAnswers
      });

      navigation.navigate('Results', {
        score: finalScore,
        totalQuestions: quiz.questions.length,
        language,
        level
      });
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>🎯 Loading Quiz...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Quiz not found!</Text>
      </View>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.exitBtn} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.exitBtnText}>← Exit</Text>
        </TouchableOpacity>
        
        <View style={styles.quizInfo}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level {level}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>Score: {score}/{quiz.questions.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {quiz.questions.length}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.quizCard}>
          <Text style={styles.questionTitle}>Listen and Choose the Correct Letter</Text>

          <TouchableOpacity style={styles.audioBtn} onPress={playAudio}>
            <Text style={styles.speakerIcon}>🔊</Text>
            <View>
              <Text style={styles.audioText}>Play Audio</Text>
              <Text style={styles.audioSubtext}>Click to hear the letter</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = showFeedback && option === question.correctAnswer;
              const isWrongAnswer = showFeedback && isSelected && option !== question.correctAnswer;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionBtn,
                    isSelected && styles.optionSelected,
                    isCorrectAnswer && styles.optionCorrect,
                    isWrongAnswer && styles.optionWrong
                  ]}
                  onPress={() => handleAnswerSelect(option)}
                  disabled={showFeedback}
                >
                  <View style={styles.optionLetter}>
                    <Text style={styles.optionLetterText}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                  {showFeedback && isCorrectAnswer && <Text style={styles.feedbackIcon}>✓</Text>}
                  {showFeedback && isWrongAnswer && <Text style={styles.feedbackIcon}>✗</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {!showFeedback && (
            <TouchableOpacity
              style={[styles.submitBtn, !selectedAnswer && styles.submitBtnDisabled]}
              onPress={handleSubmitAnswer}
              disabled={!selectedAnswer}
            >
              <Text style={styles.submitBtnText}>Submit Answer →</Text>
            </TouchableOpacity>
          )}

          {showFeedback && (
            <View style={[
              styles.feedbackMessage,
              isCorrect ? styles.correctFeedback : styles.wrongFeedback
            ]}>
              <Text style={styles.feedbackEmoji}>{isCorrect ? '🎉' : '💪'}</Text>
              <View>
                <Text style={styles.feedbackText}>
                  {isCorrect ? 'Excellent! Correct Answer!' : 'Keep Trying!'}
                </Text>
                {!isCorrect && (
                  <Text style={styles.feedbackSubtext}>
                    Correct answer: {question.correctAnswer}
                  </Text>
                )}
              </View>
            </View>
          )}
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
    paddingBottom: 15,
  },
  exitBtn: {
    backgroundColor: '#6B2FA5',
    borderRadius: 25,
    padding: 12,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  exitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  levelBadge: {
    backgroundColor: '#6B2FA5',
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 20,
  },
  levelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 20,
  },
  scoreText: {
    color: '#0B0C2A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFD700',
    borderRadius: 20,
  },
  progressText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    zIndex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  quizCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 25,
  },
  questionTitle: {
    fontSize: 24,
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  audioBtn: {
    backgroundColor: '#6B2FA5',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  speakerIcon: {
    fontSize: 50,
    marginRight: 15,
  },
  audioText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  audioSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    minHeight: 70,
  },
  optionSelected: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  optionCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76,175,80,0.3)',
  },
  optionWrong: {
    borderColor: '#FF5252',
    backgroundColor: 'rgba(255,82,82,0.3)',
  },
  optionLetter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B2FA5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionLetterText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionText: {
    flex: 1,
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  feedbackIcon: {
    fontSize: 30,
  },
  submitBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 50,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B0C2A',
  },
  feedbackMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    borderWidth: 3,
  },
  correctFeedback: {
    backgroundColor: 'rgba(76,175,80,0.3)',
    borderColor: '#4CAF50',
  },
  wrongFeedback: {
    backgroundColor: 'rgba(255,82,82,0.3)',
    borderColor: '#FF5252',
  },
  feedbackEmoji: {
    fontSize: 50,
    marginRight: 15,
  },
  feedbackText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  feedbackSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
  },
});
