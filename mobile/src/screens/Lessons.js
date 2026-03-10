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
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

export default function Lessons({ navigation, route }) {
  const { language } = route.params;
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    fetchLessons();
    
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/lessons/${language}`, { timeout: API_TIMEOUT });
      setLessons(response.data.lessons);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      Alert.alert('Error', 'Could not load lessons');
      setLoading(false);
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

  const handleNext = async () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed all lessons - unlock Mars
      await AsyncStorage.setItem(`lessonsCompleted_${language}`, 'true');
      Alert.alert(
        'Great!',
        'You completed all lessons! Mars planet unlocked!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('PlanetHome', { language })
          }
        ]
      );
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleExit = () => {
    navigation.navigate('GameHub');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={styles.loadingText}>Loading lessons...</Text>
      </View>
    );
  }

  if (lessons.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>No lessons available</Text>
        <TouchableOpacity style={styles.button} onPress={handleExit}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentLesson = lessons[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitBtn} onPress={handleExit}>
          <Text style={styles.exitBtnText}>← Exit</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learn Words</Text>
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>{currentIndex + 1}/{lessons.length}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.lessonCard}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: `${API_BASE_URL}${currentLesson.imageUrl}` }}
              style={styles.lessonImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.wordContainer}>
            <Text style={styles.lessonWord}>{currentLesson.word}</Text>
            {currentLesson.audioUrl && (
              <TouchableOpacity
                style={styles.audioButton}
                onPress={() => playAudio(currentLesson.audioUrl)}
              >
                <Text style={styles.audioButtonText}>🔊 Play Sound</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.navigation}>
            <TouchableOpacity
              style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
              onPress={handlePrevious}
              disabled={currentIndex === 0}
            >
              <Text style={styles.navButtonText}>← Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navButton, styles.primaryButton]}
              onPress={handleNext}
            >
              <Text style={styles.navButtonText}>
                {currentIndex === lessons.length - 1 ? 'Finish ✓' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
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
    color: '#4ECDC4',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressIndicator: {
    width: 80,
    alignItems: 'flex-end',
  },
  progressText: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  lessonCard: {
    backgroundColor: '#1a1a40',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 20,
  },
  lessonImage: {
    width: '100%',
    height: '100%',
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  lessonWord: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  audioButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  audioButtonText: {
    color: '#0B0C2A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#2a2a5a',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4ECDC4',
  },
  disabledButton: {
    opacity: 0.3,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
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
