import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

const { width, height } = Dimensions.get('window');
const BALLOON_SIZE = 80;
const ANIMATION_DURATION = 8000; // 8 seconds for balloon to rise (slower)
const MAX_BALLOONS = 8; // Number of balloons on screen at once
const SPAWN_INTERVAL = 600; // Spawn new balloon every 0.6 seconds (more continuous)

export default function BalloonGame({ navigation, route }) {
  const { language, level } = route.params;
  const [game, setGame] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const [balloons, setBalloons] = useState([]);
  const [targetLetter, setTargetLetter] = useState('');
  const [availableLetters, setAvailableLetters] = useState([]);
  const [gameActive, setGameActive] = useState(true);
  const [totalTaps, setTotalTaps] = useState(0);
  
  const balloonIdCounter = useRef(0);
  const spawnTimerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const scoreRef = useRef(0);
  const correctAnswersRef = useRef(0);
  const totalTapsRef = useRef(0);
  const gameActiveRef = useRef(true);

  // Reset game state when level changes
  useEffect(() => {
    setScore(0);
    setCorrectAnswers(0);
    setTotalTaps(0);
    setTimeLeft(60);
    setGameStartTime(Date.now());
    setLoading(true);
    setGameActive(true);
    setBalloons([]);
    scoreRef.current = 0;
    correctAnswersRef.current = 0;
    totalTapsRef.current = 0;
    gameActiveRef.current = true;
    fetchGame();
    
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [language, level]);

  useEffect(() => {
    if (game && !loading && gameActive) {
      startGame();
    }
    
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [game, loading]);

  const fetchGame = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/balloon/${language}/${level}`, { timeout: API_TIMEOUT });
      const gameData = response.data.game;
      setGame(gameData);
      
      // Collect all unique letters from all rounds
      const letters = new Set();
      gameData.gameData.rounds.forEach(round => {
        round.balloons.forEach(letter => letters.add(letter));
      });
      const lettersArray = Array.from(letters);
      setAvailableLetters(lettersArray);
      
      // Set first target letter
      if (gameData.gameData.rounds.length > 0) {
        setTargetLetter(gameData.gameData.rounds[0].targetLetter);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game:', error);
      Alert.alert('Error', 'Could not load game');
      navigation.goBack();
    }
  };

  const startGame = () => {
    // Start game timer (60 seconds)
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Start spawning balloons
    spawnTimerRef.current = setInterval(() => {
      spawnBalloon();
    }, SPAWN_INTERVAL);
    
    // Spawn initial balloons
    for (let i = 0; i < MAX_BALLOONS; i++) {
      setTimeout(() => spawnBalloon(), i * 200);
    }
  };

  const spawnBalloon = () => {
    if (!gameActive || availableLetters.length === 0 || !targetLetter) return;
    
    setBalloons(prevBalloons => {
      // Remove balloons that are popped (off screen ones are already removed)
      const activeBalloons = prevBalloons.filter(b => !b.popped);
      
      // Don't spawn if we already have max balloons
      if (activeBalloons.length >= MAX_BALLOONS) return prevBalloons;
      
      const id = balloonIdCounter.current++;
      
      // 40% chance of correct letter, 60% chance of random letter
      let letter;
      if (Math.random() < 0.4) {
        letter = targetLetter;
      } else {
        // Pick a random letter that's NOT the target letter
        const wrongLetters = availableLetters.filter(l => l !== targetLetter);
        if (wrongLetters.length > 0) {
          letter = wrongLetters[Math.floor(Math.random() * wrongLetters.length)];
        } else {
          letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
        }
      }
      
      const xPosition = Math.random() * (width - BALLOON_SIZE);
      const animValue = new Animated.Value(height);
      const scaleValue = new Animated.Value(1);
      const opacityValue = new Animated.Value(1);
      
      // Start animation
      Animated.timing(animValue, {
        toValue: -BALLOON_SIZE * 2,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished && gameActiveRef.current) {
          // Remove balloon and spawn new one
          setBalloons(prev => prev.filter(b => b.id !== id));
          setTimeout(() => spawnBalloon(), 50); // Spawn new one immediately
        } else if (finished) {
          // Game ended, just remove balloon
          setBalloons(prev => prev.filter(b => b.id !== id));
        }
      });
      
      const newBalloon = {
        id,
        letter,
        xPosition,
        animValue,
        scaleValue,
        opacityValue,
        popped: false,
      };
      
      return [...activeBalloons, newBalloon];
    });
  };

  const handleBalloonPress = (balloonId) => {
    if (!gameActive) return;
    
    // Find the balloon and check if already popped
    const balloon = balloons.find(b => b.id === balloonId);
    if (!balloon || balloon.popped) return;
    
    const isCorrect = balloon.letter === targetLetter;
    
    // IMMEDIATELY mark balloon as popped to prevent double-tap
    balloon.popped = true;
    
    // Update state to mark as popped
    setBalloons(prev =>
      prev.map(b => b.id === balloonId ? { ...b, popped: true, isCorrect } : b)
    );
    
    // Track total taps
    totalTapsRef.current += 1;
    setTotalTaps(prev => prev + 1);
    
    // Update score immediately if correct
    if (isCorrect) {
      scoreRef.current += 10;
      correctAnswersRef.current += 1;
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
    } else {
      scoreRef.current = Math.max(0, scoreRef.current - 5);
      setScore(Math.max(0, scoreRef.current));
    }
    
    // Animate balloon pop and remove quickly
    Animated.parallel([
      Animated.timing(balloon.scaleValue, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(balloon.opacityValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      })
    ]).start(() => {
      // Remove popped balloon from array
      setBalloons(prev => prev.filter(b => b.id !== balloonId));
    });
    
    // Spawn new balloon immediately
    setTimeout(() => spawnBalloon(), 100);
  };

  const endGame = async () => {
    setGameActive(false);
    gameActiveRef.current = false;
    
    // Clear timers
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    
    // Use refs to get latest values
    const finalScore = scoreRef.current;
    const finalCorrectAnswers = correctAnswersRef.current;
    const finalTotalTaps = totalTapsRef.current;
    
    console.log('Game ended - Score:', finalScore, 'Correct:', finalCorrectAnswers, 'Total taps:', finalTotalTaps);
    
    setTimeout(() => {
      navigation.navigate('Results', {
        score: finalScore,
        correctAnswers: finalCorrectAnswers,
        totalQuestions: finalTotalTaps || finalCorrectAnswers || 1,
        gameType: 'balloon',
        language,
        level
      });
    }, 1000);
  };

  if (loading || !game) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading game...</Text>
      </View>
    );
  }

  const getBalloonColor = (balloon) => {
    if (balloon.popped) {
      return balloon.isCorrect ? '#4CAF50' : '#F44336';
    }
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#FF69B4', '#FFD700'];
    return colors[balloon.id % colors.length];
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{game.title}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.timer}>⏱ {timeLeft}s</Text>
        </View>
      </View>

      {/* Score Bar */}
      <View style={styles.scoreBar}>
        <Text style={styles.scoreText}>Score: {score}</Text>
        <Text style={styles.roundText}>Correct: {correctAnswers}</Text>
      </View>

      {/* Target Letter */}
      <View style={styles.targetContainer}>
        <Text style={styles.targetLabel}>🎯 Pop balloons with:</Text>
        <Text style={styles.targetLetter}>{targetLetter}</Text>
      </View>

      {/* Game Area - Continuous Balloons */}
      <View style={styles.gameArea}>
        {balloons.map((balloon) => (
          <Animated.View
            key={balloon.id}
            style={[
              styles.balloonContainer,
              {
                left: balloon.xPosition,
                transform: [
                  { translateY: balloon.animValue },
                  { scale: balloon.scaleValue }
                ],
                opacity: balloon.opacityValue,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.balloon,
                { backgroundColor: getBalloonColor(balloon) },
                balloon.popped && styles.balloonPopped
              ]}
              onPress={() => handleBalloonPress(balloon.id)}
              disabled={balloon.popped || !gameActive}
            >
              <Text style={styles.balloonText}>{balloon.letter}</Text>
              {balloon.popped && (
                <View style={styles.popEffect}>
                  <Text style={styles.popText}>💥</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.balloonString} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#16213e',
  },
  backBtn: {
    color: '#4ECDC4',
    fontSize: 16,
    paddingVertical: 8,
    paddingRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 60,
  },
  timer: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#0f3460',
  },
  scoreText: {
    color: '#4ECDC4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roundText: {
    color: '#fff',
    fontSize: 16,
  },
  targetContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#16213e',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
  },
  targetLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  targetLetter: {
    color: '#FFD700',
    fontSize: 60,
    fontWeight: 'bold',
  },
  feedbackContainer: {
    position: 'absolute',
    top: height / 2 - 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 15,
    zIndex: 1000,
  },
  feedbackText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  balloonContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  balloon: {
    width: BALLOON_SIZE,
    height: BALLOON_SIZE * 1.2,
    borderRadius: BALLOON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  balloonText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  balloonString: {
    width: 2,
    height: 40,
    backgroundColor: '#666',
    marginTop: -5,
  },
  balloonPopped: {
    borderWidth: 3,
    borderStyle: 'solid',
  },
  popEffect: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: BALLOON_SIZE,
    height: BALLOON_SIZE * 1.2,
  },
  popText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
});
