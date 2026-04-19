import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar
} from 'react-native';

export default function GameSelection({ navigation, route }) {
  const { language } = route.params;

  const games = [
    {
      id: 'quiz',
      title: '🎯 Audio Quiz',
      description: 'Listen and answer questions',
      color: '#4ECDC4',
      screen: 'PlanetSelection'
    },
    {
      id: 'balloon',
      title: '🎈 Balloon Pop',
      description: 'Pop the balloon with correct letter',
      color: '#FF6B6B',
      screen: 'BalloonSelection'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose a Game</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Select Game Type</Text>
        <Text style={styles.subtitle}>Language: {language === 'hindi' ? 'Hindi 🇮🇳' : 'Telugu 🇮🇳'}</Text>

        <View style={styles.gamesContainer}>
          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { borderColor: game.color }]}
              onPress={() => navigation.navigate(game.screen, { language })}
            >
              <View style={[styles.gameIconContainer, { backgroundColor: game.color }]}>
                <Text style={styles.gameIcon}>{game.title.split(' ')[0]}</Text>
              </View>
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle}>{game.title.split(' ').slice(1).join(' ')}</Text>
                <Text style={styles.gameDescription}>{game.description}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
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
    fontSize: 28,
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
  gamesContainer: {
    gap: 15,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a40',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    marginBottom: 15,
  },
  gameIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  gameIcon: {
    fontSize: 30,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: '#8892b0',
  },
  arrow: {
    fontSize: 24,
    color: '#4ECDC4',
    marginLeft: 10,
  },
});
