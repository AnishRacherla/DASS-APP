import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  PanResponder,
  Animated,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const HINDI_CONSONANTS = [
  'क', 'ख', 'ग', 'घ', 'ङ',
  'च', 'छ', 'ज', 'झ', 'ञ',
  'ट', 'ठ', 'ड', 'ढ', 'ण',
  'त', 'थ', 'द', 'ध', 'न',
  'प', 'फ', 'ब', 'भ', 'म',
  'य', 'र', 'ल', 'व',
  'श', 'ष', 'स', 'ह',
  'क्ष', 'त्र', 'ज्ञ'
];

const TELUGU_CONSONANTS = [
  'క', 'ఖ', 'గ', 'ఘ', 'ఙ',
  'చ', 'ఛ', 'జ', 'ఝ', 'ఞ',
  'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
  'త', 'థ', 'ద', 'ధ', 'న',
  'ప', 'ఫ', 'బ', 'భ', 'మ',
  'య', 'ర', 'ల', 'వ',
  'శ', 'ష', 'స', 'హ',
  'క్ష', 'త్ర', 'జ్ఞ'
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const createInitialState = (consonants, languageKey) => ({
  placed: Array(consonants.length).fill(null),
  bank: shuffle(consonants.map((l, i) => ({ letter: l, originalIndex: i, id: `${languageKey}-${i}` }))),
  score: 0,
  completed: false,
  timer: 0,
  timerActive: true
});

export default function VarnamalGame({ navigation }) {
  const [language, setLanguage] = useState('hindi');
  const [gameState, setGameState] = useState(() => ({
    hindi: createInitialState(HINDI_CONSONANTS, 'hindi'),
    telugu: createInitialState(TELUGU_CONSONANTS, 'telugu')
  }));
  const [shakeSlot, setShakeSlot] = useState(null);
  const [draggingItem, setDraggingItem] = useState(null);
  const timerRef = useRef(null);

  const consonants = language === 'telugu' ? TELUGU_CONSONANTS : HINDI_CONSONANTS;
  const total = consonants.length;
  const currentState = gameState[language];
  const { placed, bank, score, completed, timer, timerActive } = currentState;

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const lang = await AsyncStorage.getItem('userLanguage');
      if (lang) setLanguage(lang);
    } catch (e) {}
  };

  // Timer
  useEffect(() => {
    if (timerActive && !completed) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const current = prev[language];
          return {
            ...prev,
            [language]: {
              ...current,
              timer: current.timer + 1
            }
          };
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [language, timerActive, completed]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleDrop = useCallback((slotIndex) => {
    if (!draggingItem) return;

    const { letter, index: bankIndex } = draggingItem;

    if (letter === consonants[slotIndex]) {
      // Correct!
      setGameState(prev => {
        const current = prev[language];
        const nextPlaced = [...current.placed];
        nextPlaced[slotIndex] = letter;

        return {
          ...prev,
          [language]: {
            ...current,
            placed: nextPlaced,
            bank: current.bank.filter(item => item.id !== `${language}-${bankIndex}`),
            score: current.score + 1
          }
        };
      });

      // Show success feedback
      Alert.alert('Correct!', 'Great job! 🎉', [{ text: 'Continue' }]);
    } else {
      // Wrong – shake
      setShakeSlot(slotIndex);
      setTimeout(() => setShakeSlot(null), 600);
      Alert.alert('Try Again', 'That\'s not the right position. Keep trying!', [{ text: 'OK' }]);
    }
    setDraggingItem(null);
  }, [consonants, language, draggingItem]);

  // Check completion
  useEffect(() => {
    if (score === total && total > 0 && !completed) {
      setGameState(prev => {
        const current = prev[language];
        if (current.completed) return prev;
        return {
          ...prev,
          [language]: {
            ...current,
            completed: true,
            timerActive: false
          }
        };
      });

      Alert.alert(
        'Congratulations! 🎉',
        `You completed the Varnamala Puzzle in ${formatTime(timer)}!\nFinal Score: ${Math.round((total / Math.max(timer, 1)) * 100)}`,
        [{ text: 'Play Again', onPress: resetGame }]
      );
    }
  }, [score, total, completed, language, timer]);

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      [language]: createInitialState(language === 'telugu' ? TELUGU_CONSONANTS : HINDI_CONSONANTS, language)
    }));
  };

  // Build rows for the grid (match the Varnamala grouping)
  const rowSizes = [5, 5, 5, 5, 5, 4, 4, 3];
  const rows = [];
  let idx = 0;
  for (const size of rowSizes) {
    rows.push(consonants.slice(idx, idx + size));
    idx += size;
  }

  const progress = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Varnamala Puzzle</Text>
          <Text style={styles.subtitle}>
            {language === 'hindi' ? 'वर्णमाला पज़ल' : 'వర్ణమాల పజిల్'}
          </Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>⏱️</Text>
          <Text style={styles.statValue}>{formatTime(timer)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statIcon}>⭐</Text>
          <Text style={styles.statValue}>{score}/{total}</Text>
        </View>
        <View style={[styles.stat, styles.progressStat]}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressFill, { width: `${progress}%` }]}>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Completion Banner */}
      {completed && (
        <View style={styles.completionBanner}>
          <Text style={styles.completionTitle}>
            🎉 Great job! {language === 'hindi' ? 'शाबाश!' : 'శుభం!'}
          </Text>
          <Text style={styles.completionText}>
            You completed the Varnamala Puzzle in {formatTime(timer)}!
          </Text>
          <Text style={styles.finalScore}>
            Final Score: {Math.round((total / Math.max(timer, 1)) * 100)}
          </Text>
        </View>
      )}

      {/* Drop Zone Grid */}
      <View style={styles.gridSection}>
        <Text style={styles.sectionTitle}>
          {language === 'hindi' ? '📋 Alphabet Order — वर्णमाला क्रम' : '📋 Alphabet Order — వర్ణమాల క్రమం'}
        </Text>
        <View style={styles.dropGrid}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.gridRow}>
              {row.map((letter, ci) => {
                const globalIdx = rows.slice(0, ri).reduce((s, r) => s + r.length, 0) + ci;
                const isPlaced = placed[globalIdx] !== null;
                return (
                  <TouchableOpacity
                    key={globalIdx}
                    style={[
                      styles.dropSlot,
                      isPlaced && styles.filledSlot,
                      shakeSlot === globalIdx && styles.shakeSlot
                    ]}
                    onPress={() => handleDrop(globalIdx)}
                  >
                    {isPlaced ? (
                      <Text style={styles.placedLetter}>{placed[globalIdx]}</Text>
                    ) : (
                      <Text style={styles.slotNumber}>{globalIdx + 1}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Letter Bank */}
      {!completed && (
        <View style={styles.bankSection}>
          <Text style={styles.sectionTitle}>
            {language === 'hindi' ? '🔤 Letter Bank — अक्षर बैंक' : '🔤 Letter Bank — అక్షర బ్యాంక్'}
          </Text>
          <Text style={styles.instructionText}>Tap a letter, then tap the correct position</Text>
          <View style={styles.letterBank}>
            {bank.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.letterTile,
                  draggingItem?.id === item.id && styles.draggingTile
                ]}
                onPress={() => setDraggingItem(item)}
              >
                <Text style={styles.letterText}>{item.letter}</Text>
                <Text style={styles.speakerIcon}>🔊</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
        <Text style={styles.resetBtnText}>🔄 Reset Game</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  backBtn: {
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 157, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#a29bfe',
    marginTop: 4,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    marginHorizontal: 10,
    marginTop: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  statIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#feca57',
  },
  progressStat: {
    flex: 1,
    marginHorizontal: 10,
  },
  progressContainer: {
    width: '100%',
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 11,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#55efc4',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f0c29',
  },
  completionBanner: {
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    borderWidth: 2,
    borderColor: '#feca57',
    borderRadius: 20,
    padding: 20,
    margin: 15,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  completionText: {
    fontSize: 16,
    color: '#b2bec3',
    textAlign: 'center',
    marginBottom: 10,
  },
  finalScore: {
    fontSize: 18,
    color: '#feca57',
    fontWeight: '700',
  },
  gridSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#48dbfb',
    textAlign: 'center',
    marginBottom: 15,
  },
  dropGrid: {
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dropSlot: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    margin: 2,
  },
  filledSlot: {
    borderColor: '#55efc4',
    backgroundColor: 'rgba(85, 239, 196, 0.15)',
    borderStyle: 'solid',
  },
  shakeSlot: {
    borderColor: '#ff6b6b',
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },
  placedLetter: {
    fontSize: 24,
    fontWeight: '700',
    color: '#55efc4',
  },
  slotNumber: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.2)',
    fontWeight: '600',
  },
  bankSection: {
    padding: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#b2bec3',
    textAlign: 'center',
    marginBottom: 15,
  },
  letterBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  letterTile: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: 'rgba(162, 155, 254, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
    position: 'relative',
  },
  draggingTile: {
    opacity: 0.5,
    transform: [{ scale: 0.9 }],
  },
  letterText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  speakerIcon: {
    fontSize: 10,
    position: 'absolute',
    bottom: 2,
    right: 4,
    opacity: 0.5,
  },
  resetBtn: {
    backgroundColor: 'rgba(254, 202, 87, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(254, 202, 87, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginVertical: 20,
  },
  resetBtnText: {
    color: '#feca57',
    fontSize: 16,
    fontWeight: '700',
  },
});