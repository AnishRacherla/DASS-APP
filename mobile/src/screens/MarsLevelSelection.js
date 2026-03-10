import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';

export default function MarsLevelSelection({ route, navigation }) {
  const language = route.params?.language || 'hindi';
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    { id: 'image-identification', title: 'Image Identification', emoji: '🖼️', description: 'Match images with words - 2 levels', color: '#FF6B6B' },
    { id: 'whack-a-letter', title: 'Whack-a-Letter', emoji: '🔨', description: 'Tap tiles with target letters!', color: '#FF8C42' },
  ];

  const imageIdentificationLevels = [
    { level: 1, title: 'Level 1 - Easy', description: '3 images, choose the correct one', questions: 4, totalImages: 12, color: '#FF6B6B' },
    { level: 2, title: 'Level 2 - Medium', description: '4 images, choose the correct one', questions: 2, totalImages: 8, color: '#d66d75' },
  ];

  const handleGameSelect = (gameId) => {
    if (gameId === 'whack-a-letter') {
      navigation.navigate('WhackSelection', { language });
    } else {
      setSelectedGame(gameId);
    }
  };

  const handleLevelSelect = (level) => {
    navigation.navigate('MarsGame', { language, level });
  };

  const handleBack = () => {
    if (selectedGame) {
      setSelectedGame(null);
    } else {
      navigation.navigate('GameHub');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mars Planet 🔴</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {!selectedGame ? (
          <>
            <Text style={styles.title}>Choose Your Game</Text>
            <Text style={styles.subtitle}>Advanced learning games for Mars explorers!</Text>

            {games.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[styles.gameCard, { borderLeftColor: game.color, borderLeftWidth: 4 }]}
                onPress={() => handleGameSelect(game.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.gameIconWrap, { backgroundColor: game.color }]}>
                  <Text style={styles.gameEmoji}>{game.emoji}</Text>
                </View>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameDesc}>{game.description}</Text>
                </View>
                <Text style={styles.playArrow}>→</Text>
              </TouchableOpacity>
            ))}

            {/* How to Play */}
            <View style={styles.howToPlay}>
              <Text style={styles.howToPlayTitle}>🎯 How to Play</Text>
              <Text style={styles.howToPlayText}>• Image Identification: Listen to the word and tap the matching image</Text>
              <Text style={styles.howToPlayText}>• Whack-a-Letter: Tap the tiles showing the target letter before time runs out</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Choose Your Level 🖼️</Text>
            <Text style={styles.subtitle}>Match images with words!</Text>

            {imageIdentificationLevels.map((levelData) => (
              <TouchableOpacity
                key={levelData.level}
                style={[styles.levelCard, { borderLeftColor: levelData.color, borderLeftWidth: 4 }]}
                onPress={() => handleLevelSelect(levelData.level)}
                activeOpacity={0.85}
              >
                <View style={[styles.levelBadge, { backgroundColor: levelData.color }]}>
                  <Text style={styles.levelBadgeText}>Level {levelData.level}</Text>
                </View>
                <Text style={styles.levelTitle}>{levelData.title}</Text>
                <Text style={styles.levelDesc}>{levelData.description}</Text>
                <View style={styles.levelStats}>
                  <Text style={styles.levelStat}>❓ {levelData.questions} questions</Text>
                  <Text style={styles.levelStat}>🖼️ {levelData.totalImages} images</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  backBtn: { color: '#a855f7', fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#e2e8f0' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#FFD700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 24 },

  gameCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  gameIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  gameEmoji: { fontSize: 24 },
  gameInfo: { flex: 1 },
  gameTitle: { fontSize: 17, fontWeight: '700', color: '#e2e8f0' },
  gameDesc: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  playArrow: { fontSize: 22, color: '#a855f7', fontWeight: '700' },

  howToPlay: { backgroundColor: 'rgba(168,85,247,0.08)', borderRadius: 16, padding: 16, marginTop: 20, borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)' },
  howToPlayTitle: { fontSize: 16, fontWeight: '700', color: '#e2e8f0', marginBottom: 8 },
  howToPlayText: { fontSize: 13, color: '#94a3b8', lineHeight: 20, marginBottom: 4 },

  levelCard: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12 },
  levelBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginBottom: 8 },
  levelBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  levelTitle: { fontSize: 17, fontWeight: '700', color: '#e2e8f0', marginBottom: 4 },
  levelDesc: { fontSize: 13, color: '#94a3b8', marginBottom: 8 },
  levelStats: { flexDirection: 'row', gap: 16 },
  levelStat: { fontSize: 12, color: '#c084fc' },
});
