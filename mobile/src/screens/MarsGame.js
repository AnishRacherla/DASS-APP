import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, ActivityIndicator, Image, Alert } from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

export default function MarsGame({ route, navigation }) {
  const { language, level } = route.params || {};
  const [game, setGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    fetchGame();
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const fetchGame = async () => {
    try {
      const res = await axios.get(API_BASE_URL + '/api/mars-game/' + language + '/' + level, { timeout: API_TIMEOUT });
      setGame(res.data.game);
      setLoading(false);
      if (res.data.game.questions[0]) {
        playAudio(res.data.game.questions[0].audioUrl);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not load game');
      navigation.goBack();
    }
  };

  const playAudio = async (audioUrl) => {
    if (!audioUrl) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: API_BASE_URL + audioUrl });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.log('Audio error:', e.message);
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

    setTimeout(() => {
      if (currentQuestion < game.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedImage(null);
        setShowFeedback(false);
        playAudio(game.questions[currentQuestion + 1].audioUrl);
      } else {
        navigation.navigate('Results', {
          score: newScore,
          correctAnswers: newCorrectCount,
          totalQuestions: game.questions.length,
          gameType: 'mars',
          language,
          level,
        });
      }
    }, 1500);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF4757" />
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const question = game.questions[currentQuestion];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mars - Match the Word</Text>
        <View style={styles.progressArea}>
          <Text style={styles.progressText}>{currentQuestion + 1}/{game.questions.length}</Text>
          <Text style={styles.scoreText}>⭐ {score}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.wordDisplay}>
          <Text style={styles.targetWord}>{question.word}</Text>
          {question.audioUrl && (
            <TouchableOpacity style={styles.replayBtn} onPress={() => playAudio(question.audioUrl)}>
              <Text style={styles.replayText}>🔊 Replay Sound</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.imagesGrid}>
          {question.images.map((image, index) => {
            let cardStyle = [styles.imageOption];
            if (selectedImage === index) {
              cardStyle.push(index === question.correctImageIndex ? styles.correct : styles.incorrect);
            }
            if (showFeedback && index === question.correctImageIndex) {
              cardStyle.push(styles.showCorrect);
            }

            return (
              <TouchableOpacity
                key={index}
                style={cardStyle}
                onPress={() => handleImageClick(index)}
                activeOpacity={showFeedback ? 1 : 0.8}
              >
                <Image
                  source={{ uri: API_BASE_URL + image }}
                  style={styles.optionImage}
                  resizeMode="cover"
                />
                {showFeedback && index === question.correctImageIndex && (
                  <View style={styles.badge}><Text style={styles.badgeText}>✓</Text></View>
                )}
                {selectedImage === index && index !== question.correctImageIndex && (
                  <View style={[styles.badge, styles.badgeWrong]}><Text style={styles.badgeText}>✗</Text></View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A' },
  loadingText: { color: '#94a3b8', marginTop: 12, fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { color: '#a855f7', fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#e2e8f0' },
  progressArea: { alignItems: 'flex-end' },
  progressText: { fontSize: 13, color: '#94a3b8' },
  scoreText: { fontSize: 14, fontWeight: '700', color: '#FFD700' },
  scroll: { padding: 20, alignItems: 'center' },
  wordDisplay: { alignItems: 'center', marginBottom: 24 },
  targetWord: { fontSize: 36, fontWeight: '800', color: '#FFD700', marginBottom: 10 },
  replayBtn: { backgroundColor: 'rgba(168,85,247,0.15)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)' },
  replayText: { fontSize: 14, fontWeight: '600', color: '#c084fc' },
  imagesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, width: '100%' },
  imageOption: { width: '45%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)' },
  correct: { borderColor: '#4CAF50', borderWidth: 4 },
  incorrect: { borderColor: '#FF5252', borderWidth: 4 },
  showCorrect: { borderColor: '#4CAF50', borderWidth: 4 },
  optionImage: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: '#4CAF50', alignItems: 'center', justifyContent: 'center' },
  badgeWrong: { backgroundColor: '#FF5252' },
  badgeText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
