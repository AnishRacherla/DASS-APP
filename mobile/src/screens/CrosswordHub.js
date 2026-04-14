import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

const { width, height } = Dimensions.get('window');

function normalizeLanguage(language) {
  if (language === 'hindi') return 'hi';
  if (language === 'telugu') return 'te';
  if (language === 'hi' || language === 'te') return language;
  return 'hi';
}

export default function CrosswordHub({ navigation, route }) {
  const { language = 'hi' } = route.params || {};
  const normalizedLanguage = normalizeLanguage(language);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState({});
  const [userId] = useState('Player');

  const levels = [1, 2, 3, 4, 5];

  // Fetch user's progress for all levels - re-fetch every time screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      const fetchProgress = async () => {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/crossword/progress/${userId}/all`,
            { timeout: API_TIMEOUT }
          );

          if (response.data.success) {
            const progressMap = {};
            response.data.data.forEach((levelData) => {
              progressMap[levelData.level] = levelData;
            });
            setLevelProgress(progressMap);

            // Auto-select the first incomplete level
            let firstIncomplete = 1;
            for (let i = 1; i <= 5; i++) {
              if (!progressMap[i]?.completed) {
                firstIncomplete = i;
                break;
              }
            }
            setSelectedLevel(firstIncomplete);
          }
        } catch (error) {
          console.error('Error fetching progress:', error);
        }
      };

      fetchProgress();
    }, [userId])
  );

  // Determine which level is playable (first incomplete level)
  const getFirstIncompleteLevel = () => {
    for (let i = 1; i <= 5; i++) {
      if (!levelProgress[i]?.completed) {
        return i;
      }
    }
    return 5; // All completed, return last level
  };

  const firstPlayableLevel = getFirstIncompleteLevel();

  const levelDescriptions = {
    1: 'Fruit, Home, Water, Cat\nStart your puzzle adventure!',
    2: 'Tea, Milk, Lotus, Roti\nLearning new words!',
    3: 'Boat, Hand, Leg, Nose\nBody parts fun!',
    4: 'Ear, Eye, Fire, Cloud\nMore vocabulary!',
    5: 'Cap, Ball, Banana, Flower\nMaster the puzzles!',
  };

  const handleLevelSelect = (level) => {
    // Only allow selecting levels that are unlocked
    if (level <= firstPlayableLevel) {
      setSelectedLevel(level);
    }
  };

  const handleStartGame = () => {
    // Only allow starting on the selected level if it's unlocked
    if (selectedLevel <= firstPlayableLevel) {
      navigation.navigate('CrosswordGame', {
        language: normalizedLanguage,
        level: selectedLevel,
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fef7d8" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kids Crossword 🎮</Text>
        <View style={styles.langBadge}>
          <Text style={styles.langBadgeText}>Language: {normalizedLanguage === 'hi' ? 'हिंदी' : 'తెలుగు'}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Select Your Level</Text>

        {/* Levels Grid */}
        <View style={styles.levelsGrid}>
          {levels.map((level) => {
            const progress = levelProgress[level] || {};
            const isCompleted = progress.completed;
            const isLocked = level > firstPlayableLevel;
            
            return (
              <View key={level} style={styles.levelBtnWrapper}>
                <TouchableOpacity
                  disabled={isLocked}
                  style={[
                    styles.levelBtn,
                    selectedLevel === level && styles.levelBtnSelected,
                    isCompleted && styles.levelBtnCompleted,
                    isLocked && styles.levelBtnLocked,
                  ]}
                  onPress={() => handleLevelSelect(level)}
                >
                  <Text
                    style={[
                      styles.levelNumber,
                      selectedLevel === level && styles.levelNumberSelected,
                    ]}
                  >
                    {level}
                  </Text>
                  {isLocked ? (
                    <Text style={styles.lockIcon}>🔒</Text>
                  ) : (
                    <Text
                      style={[
                        styles.levelStar,
                        selectedLevel === level && styles.levelStarSelected,
                        isCompleted && styles.levelStarGold,
                      ]}
                    >
                      {isCompleted ? '⭐' : '☆'}
                    </Text>
                  )}
                </TouchableOpacity>
                {progress.score > 0 && !isLocked && (
                  <Text style={styles.levelScore}>{progress.score} pts</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Description */}
        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionTitle}>Level {selectedLevel}</Text>
          {selectedLevel > firstPlayableLevel ? (
            <Text style={styles.lockedMessage}>
              🔒 Complete Level {selectedLevel - 1} to unlock this level!
            </Text>
          ) : (
            <>
              <Text style={styles.descriptionText}>{levelDescriptions[selectedLevel]}</Text>
              {levelProgress[selectedLevel] && levelProgress[selectedLevel].score > 0 && (
                <Text style={styles.progressText}>
                  Score: {levelProgress[selectedLevel].score} | Words: {levelProgress[selectedLevel].completedWords?.length || 0}/4
                </Text>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Play Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          disabled={selectedLevel > firstPlayableLevel}
          style={[styles.playBtn, selectedLevel > firstPlayableLevel && styles.playBtnDisabled]}
          onPress={handleStartGame}
        >
          <Text style={styles.playBtnText}>
            {selectedLevel > firstPlayableLevel ? '🔒 Locked' : 'Start Game 🎯'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef7d8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
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
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d2a4d',
    flex: 1,
    textAlign: 'center',
  },
  langBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ffbf66',
    borderRadius: 8,
  },
  langBadgeText: {
    fontSize: 11,
    color: '#1d2a4d',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d2a4d',
    textAlign: 'center',
    marginBottom: 20,
  },
  levelsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 8,
  },
  levelBtnWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  levelBtn: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f4ff',
    borderWidth: 2,
    borderColor: '#d7e0ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBtnSelected: {
    backgroundColor: '#ff8a00',
    borderColor: '#ff7a00',
  },
  levelBtnCompleted: {
    backgroundColor: '#fffbf0',
    borderColor: '#ffd700',
  },
  levelBtnLocked: {
    backgroundColor: '#e8e8e8',
    borderColor: '#bbb',
    opacity: 0.6,
  },
  lockIcon: {
    fontSize: 16,
    opacity: 0.8,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1d2a4d',
    marginBottom: 6,
  },
  levelNumberSelected: {
    color: '#fff',
  },
  levelStar: {
    fontSize: 14,
    opacity: 0.6,
  },
  levelStarSelected: {
    opacity: 1,
  },
  levelStarGold: {
    fontSize: 16,
    color: '#ffd700',
  },
  levelScore: {
    fontSize: 10,
    color: '#ff8a00',
    fontWeight: '600',
    marginTop: 4,
    backgroundColor: 'rgba(255, 138, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  descriptionBox: {
    backgroundColor: 'rgba(255, 191, 102, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#ff8a00',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff8a00',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#1d2a4d',
    lineHeight: 22,
  },
  lockedMessage: {
    fontSize: 14,
    color: '#ff6b35',
    fontWeight: '600',
    lineHeight: 22,
  },
  progressText: {
    fontSize: 12,
    color: '#ff8a00',
    fontWeight: '600',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 138, 0, 0.2)',
  },
  footer: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  playBtn: {
    backgroundColor: '#ff8a00',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff8a00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  playBtnDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
});

