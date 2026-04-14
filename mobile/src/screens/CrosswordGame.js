import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Speech from 'expo-speech';
import { API_BASE_URL, API_TIMEOUT } from '../config';

const { width } = Dimensions.get('window');
const TOTAL_CROSSWORDS = 5;
const STARS_PER_CROSSWORD = 4;
const API_BASE_CANDIDATES = Array.from(
  new Set([
    API_BASE_URL,
    'http://10.201.48.5:5001',
    'http://172.25.80.189:5001',
    'http://10.0.2.2:5001',
    'http://127.0.0.1:5001',
  ])
);

function normalizeLanguage(language) {
  if (language === 'hindi') return 'hi';
  if (language === 'telugu') return 'te';
  if (language === 'hi' || language === 'te') return language;
  return 'hi';
}

function buildCountMap(letters) {
  return letters.reduce((acc, letter) => {
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {});
}

export default function CrosswordGame({ navigation, route }) {
  const { language = 'hi' } = route.params || {};
  const normalizedLanguage = normalizeLanguage(language);

  const [puzzle, setPuzzle] = useState(null);
  const [cellState, setCellState] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [completedWords, setCompletedWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('Player');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [ready, setReady] = useState(false);
  const [currentLevelCompleted, setCurrentLevelCompleted] = useState(false);
  const [activeApiBase, setActiveApiBase] = useState(API_BASE_URL);
  const completedWordsRef = useRef([]);

  async function requestWithFallback(path, options = {}) {
    const { method = 'get', data } = options;
    const orderedBases = [activeApiBase, ...API_BASE_CANDIDATES.filter((b) => b !== activeApiBase)];
    let lastError = null;

    for (const base of orderedBases) {
      try {
        const response = await axios({
          method,
          url: `${base}${path}`,
          data,
          timeout: API_TIMEOUT,
        });
        if (base !== activeApiBase) {
          setActiveApiBase(base);
        }
        return response;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }

  useEffect(() => {
    const initSession = async () => {
      try {
        const uid =
          (await AsyncStorage.getItem('userId')) ||
          (await AsyncStorage.getItem('playerId')) ||
          (await AsyncStorage.getItem('userName')) ||
          (await AsyncStorage.getItem('playerName')) ||
          'Player';

        setUserId(uid);

        const progressResponse = await requestWithFallback(
          `/api/crossword/progress/${uid}/all?language=${normalizedLanguage}`
        );

        if (progressResponse.data?.success && Array.isArray(progressResponse.data.data)) {
          let firstIncomplete = 1;
          for (let level = 1; level <= TOTAL_CROSSWORDS; level += 1) {
            const row = progressResponse.data.data.find((entry) => Number(entry.level) === level);
            if (!row?.completed) {
              firstIncomplete = level;
              break;
            }
            if (level === TOTAL_CROSSWORDS) firstIncomplete = TOTAL_CROSSWORDS;
          }
          setCurrentLevel(firstIncomplete);
        }
      } catch (error) {
        console.error('Error initializing crossword session:', error?.message || error);
      } finally {
        setReady(true);
      }
    };

    initSession();
  }, []);

  useEffect(() => {
    if (!ready) return;

    const fetchPuzzle = async () => {
      try {
        setLoading(true);

        const response = await requestWithFallback(
          `/api/crossword/data/${normalizedLanguage}/${currentLevel}`
        );

        if (response.data.success) {
          setPuzzle(response.data.data);
          setCellState({});
          setSelectedCell(null);
          setCurrentLevelCompleted(false);
        }
      } catch (error) {
        console.error('Error fetching puzzle:', error);
        Alert.alert('Error', 'Failed to load crossword. Check backend and Wi-Fi.');
      } finally {
        setLoading(false);
      }
    };

    fetchPuzzle();

    return () => {};
  }, [ready, normalizedLanguage, currentLevel]);

  useEffect(() => {
    if (!ready || !userId) return;

    const loadSavedProgress = async () => {
      try {
        const response = await requestWithFallback(
          `/api/crossword/progress/${userId}?level=${currentLevel}&language=${normalizedLanguage}`
        );

        if (response.data.success && response.data.data) {
          const savedWords = Array.isArray(response.data.data.completedWords)
            ? response.data.data.completedWords
            : [];
          setCompletedWords(savedWords);
          setCurrentLevelCompleted(Boolean(response.data.data.completed));
        } else {
          setCompletedWords([]);
          setCurrentLevelCompleted(false);
        }
      } catch (error) {
        console.error('Error loading saved crossword progress:', error?.message || error);
      }
    };

    loadSavedProgress();
  }, [ready, userId, currentLevel, normalizedLanguage]);

  useEffect(() => {
    completedWordsRef.current = completedWords;
  }, [completedWords]);

  const bankCount = useMemo(
    () => buildCountMap(puzzle?.letterBag || []),
    [puzzle?.letterBag]
  );

  const usedCount = useMemo(() => {
    const counts = {};
    Object.values(cellState).forEach((cell) => {
      if (cell?.value) counts[cell.value] = (counts[cell.value] || 0) + 1;
    });
    return counts;
  }, [cellState]);

  const availableCount = useMemo(() => {
    const result = { ...bankCount };
    Object.keys(result).forEach((letter) => {
      result[letter] = Math.max(0, (bankCount[letter] || 0) - (usedCount[letter] || 0));
    });
    return result;
  }, [bankCount, usedCount]);

  async function speakWord(word) {
    try {
      Speech.stop();
      Speech.speak(word, {
        language: normalizedLanguage === 'te' ? 'te-IN' : 'hi-IN',
        rate: 0.85,
        pitch: 1.0,
      });
    } catch (error) {
      console.error('Error speaking:', error);
    }
  }

  async function saveProgress(nextCompletedWords, isCompleted) {
    try {
      await requestWithFallback('/api/crossword/save-progress', {
        method: 'post',
        data: {
          userId,
          score: nextCompletedWords.length * 10,
          completed: isCompleted,
          completedWords: nextCompletedWords,
          language: normalizedLanguage,
          level: currentLevel,
        },
      });
    } catch (error) {
      console.error('Error saving crossword progress:', error?.message || error);
    }
  }

  function handleCellClick(key) {
    setSelectedCell(key);
  }

  function handleLetterPick(letter) {
    if (!selectedCell || !puzzle) return;

    const target = puzzle.grid
      .flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => ({ rowIndex, colIndex, cell }))
      )
      .find(({ rowIndex, colIndex }) => `${rowIndex}-${colIndex}` === selectedCell);

    if (!target || !target.cell) return;

    const { answer } = target.cell;
    const isCorrect = letter === answer;

    const nextState = {
      ...cellState,
      [selectedCell]: {
        answer,
        value: letter,
        status: isCorrect ? 'correct' : 'wrong',
      },
    };

    setCellState(nextState);

    if (!isCorrect) {
      setTimeout(() => {
        setCellState((prev) => {
          const current = prev[selectedCell];
          if (!current || current.value !== letter) {
            return prev;
          }
          return {
            ...prev,
            [selectedCell]: {
              answer: current.answer,
              value: '',
              status: 'idle',
            },
          };
        });
      }, 500);
      return;
    }

    const slotIds = puzzle.slotMap[selectedCell] || [];
    slotIds.forEach((slotId) => {
      const currentCompletedWords = completedWordsRef.current;
      if (currentCompletedWords.includes(slotId)) return;

      const word = puzzle.words.find((entry) => entry.id === slotId);
      if (!word) return;

      const allCorrect = word.cells.every((key) => {
        const cell = nextState[key];
        return cell && cell.value === cell.answer;
      });

      if (allCorrect) {
        setCompletedWords((prev) => {
          if (prev.includes(slotId)) return prev;
          const nextCompletedWords = [...prev, slotId];
          completedWordsRef.current = nextCompletedWords;
          const isCompleted = nextCompletedWords.length >= puzzle.words.length;
          if (isCompleted) setCurrentLevelCompleted(true);
          saveProgress(nextCompletedWords, isCompleted);
          return nextCompletedWords;
        });
        speakWord(word.answerWord);
      }
    });
  }

  function handleBack() {
    navigation.navigate('GameHub');
  }

  function handlePreviousCrossword() {
    if (currentLevel > 1) {
      setCurrentLevel((prev) => prev - 1);
      setCompletedWords([]);
      setSelectedCell(null);
      setCellState({});
    }
  }

  function handleNextCrossword() {
    if (currentLevel < TOTAL_CROSSWORDS) {
      setCurrentLevel((prev) => prev + 1);
      setCompletedWords([]);
      setSelectedCell(null);
      setCellState({});
      setCurrentLevelCompleted(false);
      return;
    }

    Alert.alert('Great job!', 'You finished all 5 crosswords!', [
      { text: 'Back to Games', onPress: () => navigation.navigate('GameHub') },
    ]);
  }

  if (loading || !puzzle) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading crossword...</Text>
      </View>
    );
  }

  const uniqueLetters = Array.from(new Set(puzzle.letterBag));
  const starsEarned = Math.min(completedWords.length, STARS_PER_CROSSWORD);
  const solvedWordCount = new Set(completedWords).size;
  const puzzleCompleted =
    currentLevelCompleted ||
    (puzzle.words.length > 0 && solvedWordCount >= puzzle.words.length);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fef7d8" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kids Crossword</Text>
      </View>

      <View style={styles.starsPanel}>
        <View style={styles.starsHeader}>
          <Text style={styles.starsHeaderText}>Crossword {currentLevel}/{TOTAL_CROSSWORDS}</Text>
          <Text style={styles.starsHeaderText}>Words: {completedWords.length}/{STARS_PER_CROSSWORD}</Text>
        </View>
        {currentLevel > 1 && (
          <View style={styles.prevWrap}>
            <TouchableOpacity style={styles.prevBtn} onPress={handlePreviousCrossword}>
              <Text style={styles.prevBtnText}>← Previous Crossword</Text>
            </TouchableOpacity>
          </View>
        )}
        {puzzleCompleted && (
          <View style={styles.nextTopWrap}>
            <TouchableOpacity style={styles.nextTopBtn} onPress={handleNextCrossword}>
              <Text style={styles.nextTopBtnText}>
                {currentLevel < TOTAL_CROSSWORDS ? 'Next Crossword →' : 'Finish ✅'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.starsRow}>
          {Array.from({ length: STARS_PER_CROSSWORD }).map((_, index) => (
            <Text key={`star-${index}`} style={[styles.wordStar, index < starsEarned && styles.wordStarEarned]}>
              {index < starsEarned ? '★' : '☆'}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView style={styles.gameArea} showsVerticalScrollIndicator={false}>
        <View style={styles.clueSection}>
          <Text style={styles.sectionTitle}>📖 Picture Clues</Text>
          <View style={styles.clueList}>
            {puzzle.words.map((word) => {
              const done = completedWords.includes(word.id);
              return (
                <View key={word.id} style={[styles.clueItem, done && styles.clueItemDone]}>
                  <Text style={styles.clueEmoji}>{word.clue}</Text>
                  <View style={styles.clueTextWrapper}>
                    <Text style={styles.clueText}>{word.orientation} • {word.letters.length}</Text>
                    <View style={styles.blanks}>
                      {word.letters.map((_, idx) => (
                        <Text key={idx} style={styles.blank}>_</Text>
                      ))}
                    </View>
                  </View>
                  {done && <Text style={styles.star}>⭐</Text>}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.gridSection}>
          <Text style={styles.sectionTitle}>🎮 Crossword</Text>
          <View style={styles.grid}>
            {puzzle.grid.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.gridRow}>
                {row.map((cell, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`;
                  if (!cell) {
                    return (
                      <View key={key} style={[styles.gridCell, styles.gridCellBlocked]} />
                    );
                  }

                  const state = cellState[key] || { value: '', status: 'idle' };
                  const isSelected = selectedCell === key;

                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.gridCell,
                        isSelected && styles.gridCellSelected,
                        state.status === 'correct' && styles.gridCellCorrect,
                        state.status === 'wrong' && styles.gridCellWrong,
                      ]}
                      onPress={() => handleCellClick(key)}
                    >
                      <Text style={styles.gridCellText}>{state.value}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.letterSection}>
          <Text style={styles.sectionTitle}>🔤 Letter Bank</Text>
          <View style={styles.letterBank}>
            {uniqueLetters.map((letter) => {
              const left = availableCount[letter] || 0;
              return (
                <TouchableOpacity
                  key={letter}
                  style={[styles.letterBtn, left === 0 && styles.letterBtnDisabled]}
                  onPress={() => handleLetterPick(letter)}
                  disabled={left === 0}
                >
                  <Text style={styles.letterBtnText}>{letter}</Text>
                  <Text style={styles.letterBtnCount}>x{left}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {puzzleCompleted && (
          <View style={styles.nextWrap}>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNextCrossword}>
              <Text style={styles.nextBtnText}>
                {currentLevel < TOTAL_CROSSWORDS ? 'Next Crossword →' : 'Finish ✅'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7d8',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#1d2a4d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ff8a00',
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d2a4d',
    flex: 1,
    textAlign: 'center',
  },
  starsPanel: {
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  starsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  starsHeaderText: {
    fontSize: 12,
    color: '#1d2a4d',
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  prevWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  prevBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ffbf66',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  prevBtnText: {
    color: '#1d2a4d',
    fontSize: 13,
    fontWeight: '700',
  },
  nextTopWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  nextTopBtn: {
    backgroundColor: '#ff8a00',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  nextTopBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  wordStar: {
    fontSize: 24,
    color: '#a0a0a0',
  },
  wordStarEarned: {
    color: '#ffbf00',
  },
  gameArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  clueSection: {
    marginBottom: 20,
  },
  gridSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1d2a4d',
    marginBottom: 10,
  },
  clueList: {
    gap: 8,
  },
  clueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef6ff',
    borderRadius: 10,
    padding: 8,
    gap: 8,
  },
  clueItemDone: {
    backgroundColor: '#ddf9e8',
    borderWidth: 1,
    borderColor: '#2bb673',
  },
  clueEmoji: {
    fontSize: 24,
  },
  clueTextWrapper: {
    flex: 1,
  },
  clueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  blanks: {
    flexDirection: 'row',
    gap: 4,
  },
  blank: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1d2a4d',
    marginRight: 6,
  },
  star: {
    fontSize: 14,
  },
  grid: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    gap: 4,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 4,
    marginBottom: 4,
  },
  gridCell: {
    width: (width - 44) / 4,
    height: (width - 44) / 4,
    backgroundColor: '#f8f9ff',
    borderWidth: 1.5,
    borderColor: '#d8deff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCellBlocked: {
    backgroundColor: '#4b5d8b',
    borderColor: '#3a4c79',
  },
  gridCellSelected: {
    backgroundColor: '#fff6df',
    borderColor: '#ff8a00',
    borderWidth: 2,
  },
  gridCellCorrect: {
    backgroundColor: '#d9f8e7',
    borderColor: '#2bb673',
  },
  gridCellWrong: {
    backgroundColor: '#ffd8dc',
    borderColor: '#ff4d5a',
  },
  gridCellText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d2a4d',
  },
  letterSection: {
    marginBottom: 20,
  },
  letterBank: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  letterBtn: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#fff2cc',
    borderWidth: 1.5,
    borderColor: '#ffcf66',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterBtnDisabled: {
    opacity: 0.4,
  },
  letterBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d2a4d',
  },
  letterBtnCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    marginTop: 2,
  },
  nextWrap: {
    marginTop: 8,
    marginBottom: 30,
  },
  nextBtn: {
    backgroundColor: '#ff8a00',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
