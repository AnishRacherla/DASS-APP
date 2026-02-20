import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';

export default function MarsLevelSelection({ navigation, route }) {
  const { language } = route.params;

  const levels = [
    {
      id: 1,
      title: 'Level 1',
      emoji: '⭐',
      description: '3 image choices',
      questions: '4 questions',
      color: '#FF6B6B',
    },
    {
      id: 2,
      title: 'Level 2',
      emoji: '⭐⭐',
      description: '4 image choices',
      questions: '2 questions',
      color: '#FF4757',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.navigate('PlanetHome', { language })}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mars Game</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🔴 Mars Word Match</Text>
        <Text style={styles.subtitle}>Select a difficulty level</Text>

        <View style={styles.levelsContainer}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[styles.levelCard, { borderColor: level.color }]}
              onPress={() => navigation.navigate('MarsGame', { language, level: level.id })}
            >
              <View style={[styles.levelIconContainer, { backgroundColor: level.color }]}>
                <Text style={styles.levelEmoji}>{level.emoji}</Text>
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text style={styles.levelDescription}>{level.description}</Text>
                <Text style={styles.levelQuestions}>{level.questions}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📖 How to Play</Text>
          <Text style={styles.instructionsText}>
            • Listen to the word pronunciation{'\n'}
            • Look at all the images{'\n'}
            • Tap the correct image that matches the word{'\n'}
            • Earn 10 points for each correct answer!
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1a1a40',
  },
  backBtn: {
    width: 60,
  },
  backBtnText: {
    color: '#4ECDC4',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  levelsContainer: {
    gap: 15,
    marginBottom: 30,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a40',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 15,
  },
  levelIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  levelEmoji: {
    fontSize: 30,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  levelDescription: {
    fontSize: 14,
    color: '#8892b0',
    marginBottom: 3,
  },
  levelQuestions: {
    fontSize: 12,
    color: '#4ECDC4',
  },
  arrow: {
    fontSize: 24,
    color: '#FF6B6B',
  },
  instructions: {
    backgroundColor: '#1a1a40',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ECDC4',
    marginBottom: 15,
  },
  instructionsText: {
    fontSize: 16,
    color: '#8892b0',
    lineHeight: 24,
  },
});
