import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GAMES = [
  { id: 'quiz', name: 'Audio Quiz', emoji: '🎯', color: '#4ECDC4', desc: 'Listen & pick the correct letter' },
  { id: 'balloon', name: 'Balloon Pop', emoji: '🎈', color: '#FF6B6B', desc: 'Pop balloons with the right letter' },
  { id: 'mars', name: 'Mars Explorer', emoji: '🔴', color: '#f97316', desc: 'Match words to images on Mars' },
  { id: 'whack', name: 'Whack-a-Letter', emoji: '🔨', color: '#a855f7', desc: 'Fast-paced tile tapping game' },
  { id: 'akshara', name: 'Akshara Magic Lab', emoji: '🧙‍♂️', color: '#f472b6', desc: 'Master letters, syllables & words' },
  { id: 'lessons', name: 'Word Lessons', emoji: '📚', color: '#60a5fa', desc: 'Learn words with images & audio' },
];

export default function GameHub({ navigation }) {
  const [playerName, setPlayerName] = useState('Player');
  const [language, setLanguage] = useState('hindi');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const name = await AsyncStorage.getItem('playerName') || await AsyncStorage.getItem('userName') || 'Player';
    const lang = await AsyncStorage.getItem('userLanguage') || 'hindi';
    setPlayerName(name);
    setLanguage(lang);
  };

  const switchLanguage = async () => {
    const newLang = language === 'hindi' ? 'telugu' : 'hindi';
    setLanguage(newLang);
    await AsyncStorage.setItem('userLanguage', newLang);
  };

  const handleGamePress = (gameId) => {
    switch (gameId) {
      case 'quiz':
        navigation.navigate('PlanetHome', { language });
        break;
      case 'balloon':
        navigation.navigate('BalloonSelection', { language });
        break;
      case 'mars':
        navigation.navigate('MarsLevelSelection', { language });
        break;
      case 'whack':
        navigation.navigate('WhackSelection', { language });
        break;
      case 'akshara':
        navigation.navigate('AksharaGame', { language });
        break;
      case 'lessons':
        navigation.navigate('Lessons', { language });
        break;
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['playerId', 'playerName', 'playerEmail', 'userId', 'userName', 'userLanguage', 'isLoggedIn', 'akshara_session']);
          navigation.replace('AuthPage');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.name}>{playerName} 👋</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Language Toggle */}
        <TouchableOpacity style={styles.langToggle} onPress={switchLanguage}>
          <Text style={styles.langLabel}>Language:</Text>
          <Text style={styles.langValue}>{language === 'hindi' ? '🇮🇳 Hindi' : '✨ Telugu'}</Text>
          <Text style={styles.langSwitch}>Tap to switch</Text>
        </TouchableOpacity>

        {/* Game Grid */}
        <Text style={styles.sectionTitle}>Choose a Game</Text>
        <View style={styles.gameGrid}>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { borderColor: game.color + '40' }]}
              onPress={() => handleGamePress(game.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.gameEmoji}>{game.emoji}</Text>
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameDesc}>{game.desc}</Text>
              <View style={[styles.playBadge, { backgroundColor: game.color }]}>
                <Text style={styles.playText}>PLAY ▶</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 20 },
  welcome: { fontSize: 14, color: '#94a3b8' },
  name: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  logoutBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)', backgroundColor: 'rgba(248,113,113,0.08)' },
  logoutText: { color: '#f87171', fontSize: 13, fontWeight: '600' },
  langToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
  langLabel: { color: '#94a3b8', fontSize: 13 },
  langValue: { color: '#f1f5f9', fontSize: 15, fontWeight: '700', flex: 1 },
  langSwitch: { color: '#a855f7', fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#c084fc', marginBottom: 14, letterSpacing: 0.5 },
  gameGrid: { gap: 14 },
  gameCard: { padding: 18, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 2, flexDirection: 'column' },
  gameEmoji: { fontSize: 36, marginBottom: 8 },
  gameName: { fontSize: 17, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  gameDesc: { fontSize: 12, color: '#94a3b8', marginBottom: 10, lineHeight: 18 },
  playBadge: { alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 20 },
  playText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
