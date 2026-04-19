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
import { Audio } from 'expo-av';
import { hindiConsonants } from '../akshara-data/hindiData';
import { teluguConsonants } from '../akshara-data/teluguData';
import { API_BASE_URL, API_TIMEOUT } from '../config';

const { width, height } = Dimensions.get('window');
const BALLOON_SIZE = 80;
const ANIMATION_DURATION = 8000; // 8 seconds for balloon to rise (slower)
const MAX_BALLOONS = 8; // Number of balloons on screen at once
const SPAWN_INTERVAL = 600; // Spawn new balloon every 0.6 seconds (more continuous)

const HINDI_NAME_BY_SYMBOL = Object.fromEntries(hindiConsonants.map((c) => [c.symbol, c.name]));
const TELUGU_NAME_BY_SYMBOL = Object.fromEntries(teluguConsonants.map((c) => [c.symbol, c.name]));

const FALLBACK_LETTERS = {
  hindi: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख', 'ग', 'घ', 'च', 'ज', 'ट', 'ठ', 'ड', 'ढ', 'त', 'थ', 'द', 'ध', 'प', 'फ', 'ब', 'भ', 'म', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह'],
  telugu: ['అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'క', 'ఖ', 'గ', 'ఘ', 'చ', 'జ', 'ట', 'ఠ', 'డ', 'ఢ', 'త', 'థ', 'ద', 'ధ', 'ప', 'ఫ', 'బ', 'భ', 'మ', 'ర', 'ల', 'వ', 'శ', 'ష', 'స', 'హ'],
};

export default function BalloonGame({ navigation, route }) {
  const [language, setLanguage] = useState(route.params?.language || 'hindi');
  const level = route.params?.level || 1;
  const gameId = route.params?.gameId;
  const [game, setGame] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStartTime, setGameStartTime] = useState(Date.now());
  const [balloons, setBalloons] = useState([]);
  const [, setTargetLetter] = useState('');
  const [gameActive, setGameActive] = useState(true);
  const [totalTaps, setTotalTaps] = useState(0);
  
  const balloonIdCounter = useRef(0);
  const spawnTimerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const speechTimerRef = useRef(null);
  const letterChangeTimerRef = useRef(null);
  const scoreRef = useRef(0);
  const correctAnswersRef = useRef(0);
  const totalTapsRef = useRef(0);
  const gameActiveRef = useRef(true);
  const targetLetterRef = useRef('');
  const availableLettersRef = useRef([]);
  const letterAudioMapRef = useRef({});
  const soundObjectRef = useRef(null);
  const levelRef = useRef(level); // Store level for use in callbacks

  // Get level parameters for current level
  const getLevelParams = (lv) => {
    switch(lv) {
      case 3:
        return {
          targetLetterChance: 0.8,      // 80% chance target letter
          letterChangeInterval: 10000,  // Change every 10 seconds
          audioReplayInterval: 3000     // Announce every 3 seconds
        };
      case 2:
        return {
          targetLetterChance: 0.6,      // 60% chance target letter
          letterChangeInterval: 20000,  // Change every 20 seconds
          audioReplayInterval: 4000     // Announce every 4 seconds
        };
      case 1:
      default:
        return {
          targetLetterChance: 0.4,      // 40% chance target letter
          letterChangeInterval: null,   // No change (single letter for whole game)
          audioReplayInterval: 5000     // Announce every 5 seconds
        };
    }
  };

  // Build audio map from API
  const buildLetterAudioMap = async () => {
    try {
      const endpoint = `${API_BASE_URL}/api/akshara/${language}/letters`;
      const response = await axios.get(endpoint, { timeout: API_TIMEOUT });
      const letters = response.data;
      
      const audioMap = {};
      letters.forEach(letter => {
        if (!letter?.symbol) return;
        if (letter.audioUrl) {
          audioMap[letter.symbol] = letter.audioUrl;
          return;
        }
        if (letter.audioFileName) {
          audioMap[letter.symbol] = `/audio/${language}_letters/${letter.audioFileName}`;
        }
      });
      
      letterAudioMapRef.current = audioMap;
      console.log(`Built audio map for ${language} with ${Object.keys(audioMap).length} letters`);
      return letters;
    } catch (error) {
      console.error('Error building letter audio map:', error);
      return [];
    }
  };

  // Resolve audio URL to full path
  const resolveAudioUrl = (audioUrlOrPath) => {
    if (!audioUrlOrPath) return null;
    
    if (audioUrlOrPath.startsWith('http')) {
      return audioUrlOrPath;
    }
    
    return `${API_BASE_URL}${audioUrlOrPath}`;
  };

  // Play recorded letter audio
  const playRecordedLetterAudio = async (letter) => {
    try {
      // Stop previous audio if playing
      if (soundObjectRef.current) {
        await soundObjectRef.current.unloadAsync();
        soundObjectRef.current = null;
      }

      const audioPath = letterAudioMapRef.current[letter];
      if (!audioPath) {
        console.warn(`No audio found for letter: ${letter}`);
        return;
      }

      const audioUrl = resolveAudioUrl(audioPath);
      const sound = new Audio.Sound();
      soundObjectRef.current = sound;

      try {
        await sound.loadAsync({ uri: audioUrl });
        await sound.playAsync();
      } catch (error) {
        console.error(`Error playing audio for ${letter}:`, error);
        soundObjectRef.current = null;
      }
    } catch (error) {
      console.error('Error in playRecordedLetterAudio:', error);
    }
  };

  // Reset game state when level changes
  useEffect(() => {
    const loadStoredLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('userLanguage');
        if (storedLanguage) {
          setLanguage(storedLanguage);
        }
      } catch (e) {}
    };

    loadStoredLanguage();

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
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
      if (letterChangeTimerRef.current) clearInterval(letterChangeTimerRef.current);
      if (soundObjectRef.current) {
        soundObjectRef.current.unloadAsync();
        soundObjectRef.current = null;
      }
    };
  }, [language, level]);

  useEffect(() => {
    if (game && !loading && gameActive) {
      startGame();
    }
    
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (speechTimerRef.current) clearInterval(speechTimerRef.current);
      if (letterChangeTimerRef.current) clearInterval(letterChangeTimerRef.current);
    };
  }, [game, loading]);

  const fetchGame = async () => {
    try {
      const gameEndpoint = gameId
        ? `${API_BASE_URL}/api/balloon/id/${gameId}`
        : `${API_BASE_URL}/api/balloon/${language}/${level}`;
      const response = await axios.get(gameEndpoint, { timeout: API_TIMEOUT });
      const gameData = response.data.game;
      setGame(gameData);
      levelRef.current = gameData?.level || level;
      
      // Build letter audio map from API
      const apiLetters = await buildLetterAudioMap();
      
      // Collect all unique letters from all rounds
      const letters = new Set();
      const rounds = gameData.gameData?.rounds || gameData.rounds || [];
      rounds.forEach(round => {
        round.balloons.forEach(letter => letters.add(letter));
        letters.add(round.targetLetter);
      });

      // If the backend game payload has no rounds or no letters, fall back to the
      // built-in language pool so the game remains playable after deploy.
      if (letters.size === 0) {
        const fallbackLetters = apiLetters?.length
          ? apiLetters
              .map((item) => item.symbol)
              .filter(Boolean)
          : (FALLBACK_LETTERS[language] || FALLBACK_LETTERS.hindi);

        fallbackLetters.forEach((letter) => letters.add(letter));
      }

      const lettersArray = Array.from(letters);
      availableLettersRef.current = lettersArray;
      
      if (lettersArray.length > 0) {
        const initialTarget = lettersArray[Math.floor(Math.random() * lettersArray.length)];
        setTargetLetter(initialTarget);
        targetLetterRef.current = initialTarget;
        // Play recorded audio for the target letter
        await playRecordedLetterAudio(initialTarget);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game:', error);
      Alert.alert('Error', 'Could not load game');
      navigation.goBack();
    }
  };

  const startGame = () => {
    const levelParams = getLevelParams(levelRef.current);
    
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

    speechTimerRef.current = setInterval(() => {
      if (gameActiveRef.current && targetLetterRef.current) {
        playRecordedLetterAudio(targetLetterRef.current);
      }
    }, levelParams.audioReplayInterval);

    // For Level 2 and 3: Add letter change timer
    if (levelParams.letterChangeInterval) {
      letterChangeTimerRef.current = setInterval(() => {
        if (gameActiveRef.current && availableLettersRef.current.length > 0) {
          const newTarget = availableLettersRef.current[
            Math.floor(Math.random() * availableLettersRef.current.length)
          ];
          targetLetterRef.current = newTarget;
          setTargetLetter(newTarget);
          // Play audio for new letter immediately
          playRecordedLetterAudio(newTarget);
        }
      }, levelParams.letterChangeInterval);
    }
    
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
    const currentTarget = targetLetterRef.current;
    const currentLetters = availableLettersRef.current;
    const levelParams = getLevelParams(levelRef.current);
    
    if (!gameActiveRef.current || currentLetters.length === 0 || !currentTarget) return;
    
    setBalloons(prevBalloons => {
      // Remove balloons that are popped (off screen ones are already removed)
      const activeBalloons = prevBalloons.filter(b => !b.popped);
      
      // Don't spawn if we already have max balloons
      if (activeBalloons.length >= MAX_BALLOONS) return prevBalloons;
      
      const id = balloonIdCounter.current++;
      
      // Use level-specific chance for target letter
      let letter;
      if (Math.random() < levelParams.targetLetterChance) {
        letter = currentTarget;
      } else {
        // Pick a random letter that's NOT the target letter
        const wrongLetters = currentLetters.filter(l => l !== currentTarget);
        if (wrongLetters.length > 0) {
          letter = wrongLetters[Math.floor(Math.random() * wrongLetters.length)];
        } else {
          letter = currentLetters[Math.floor(Math.random() * currentLetters.length)];
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
    if (!gameActiveRef.current) return;
    
    // Find the balloon and check if already popped
    const balloon = balloons.find(b => b.id === balloonId);
    if (!balloon || balloon.popped) return;
    
    const isCorrect = balloon.letter === targetLetterRef.current;
    
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
    if (speechTimerRef.current) clearInterval(speechTimerRef.current);
    if (letterChangeTimerRef.current) clearInterval(letterChangeTimerRef.current);
    
    // Stop audio if playing
    if (soundObjectRef.current) {
      await soundObjectRef.current.unloadAsync();
      soundObjectRef.current = null;
    }
    
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
        <Text style={styles.targetLabel}>Listen and pop the spoken letter</Text>
        <TouchableOpacity style={styles.repeatVoiceBtn} onPress={() => playRecordedLetterAudio(targetLetterRef.current)}>
          <Text style={styles.repeatVoiceBtnText}>Repeat Voice</Text>
        </TouchableOpacity>
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
  repeatVoiceBtn: {
    marginTop: 8,
    backgroundColor: '#1976D2',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  repeatVoiceBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
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
