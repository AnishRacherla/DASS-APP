import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';

const LEVELS = [
  { id: '1', title: 'Level 1', subtitle: 'Warm-up sort', description: '4 baskets, 12 words, and clear category groups to learn the flow.', color: '#F97316' },
  { id: '2', title: 'Level 2', subtitle: 'More baskets', description: '5 baskets, 15 words, and more mixed categories to keep you moving.', color: '#22C55E' },
  { id: '3', title: 'Level 3', subtitle: 'Full challenge', description: '6 baskets, 24 words, and the full mixed set for the final test.', color: '#F59E0B' },
];

export default function WordSortingBasketSelection({ navigation, route }) {
  const language = route.params?.language || 'hindi';

  const startGame = (level) => {
    navigation.navigate('WordSortingBasketGame', { language, level });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('GameHub')}>
          <Text style={styles.backText}>← Back to Games</Text>
        </TouchableOpacity>

        <Text style={styles.kicker}>Word Sorting Basket</Text>
        <Text style={styles.title}>Toss the word into the right basket</Text>
        <Text style={styles.subtitle}>
          Drag each word into the matching category basket. Correct drops score points, wrong drops cost points.
        </Text>

        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>Game Rules</Text>
          <Text style={styles.rule}>• Words are mixed from several categories like fruits, animals, pets, vegetables, birds, and vehicles.</Text>
          <Text style={styles.rule}>• Drag a word into the correct basket to make it disappear and earn points.</Text>
          <Text style={styles.rule}>• If you drop it in the wrong basket, it snaps back and you lose points.</Text>
        </View>

        <View style={styles.levelGrid}>
          {LEVELS.map((level) => (
            <TouchableOpacity key={level.id} style={[styles.levelCard, { borderLeftColor: level.color }]} onPress={() => startGame(level.id)}>
              <View style={styles.levelCopy}>
                <View style={styles.levelTopline}>
                  <Text style={styles.levelTitleSmall}>{level.title}</Text>
                  <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
                </View>
                <Text style={styles.levelDesc}>{level.description}</Text>
              </View>
              <Text style={styles.levelArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.previewGrid}>
          <View style={[styles.previewCard, { borderLeftColor: '#F97316' }]}>
            <View style={[styles.previewEmoji, { backgroundColor: '#F97316' }]}>
              <Text style={styles.previewEmojiText}>🍎</Text>
            </View>
            <View>
              <Text style={styles.previewTitle}>Fruits</Text>
              <Text style={styles.previewDesc}>One of the baskets in the sorting round.</Text>
            </View>
          </View>
          <View style={[styles.previewCard, { borderLeftColor: '#22C55E' }]}>
            <View style={[styles.previewEmoji, { backgroundColor: '#22C55E' }]}>
              <Text style={styles.previewEmojiText}>🐘</Text>
            </View>
            <View>
              <Text style={styles.previewTitle}>Animals</Text>
              <Text style={styles.previewDesc}>One of the baskets in the sorting round.</Text>
            </View>
          </View>
        </View>

        <View style={styles.langPill}>
          <Text style={styles.langPillText}>{language === 'hindi' ? 'Hindi 🇮🇳' : 'Telugu 🇮🇳'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A' },
  scrollContent: { padding: 16, paddingBottom: 32 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
  backText: { color: '#fff', fontWeight: '700' },
  kicker: { color: '#FBBF24', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.1, marginTop: 8, marginBottom: 4 },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', lineHeight: 34 },
  subtitle: { color: '#cbd5e1', marginTop: 10, lineHeight: 20 },
  rulesCard: { marginTop: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  rulesTitle: { color: '#fff', fontWeight: '800', marginBottom: 8 },
  rule: { color: '#e2e8f0', marginBottom: 4, lineHeight: 18 },
  levelGrid: { marginTop: 16, gap: 12 },
  levelCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderLeftWidth: 5, borderColor: 'rgba(255,255,255,0.12)' },
  levelCopy: { flex: 1 },
  levelTopline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  levelTitleSmall: { color: '#fff', fontSize: 16, fontWeight: '800' },
  levelSubtitle: { color: '#cbd5e1', fontSize: 12, fontWeight: '700' },
  levelDesc: { color: '#cbd5e1', marginTop: 4, fontSize: 12, lineHeight: 18 },
  levelArrow: { color: '#fff', fontSize: 18, fontWeight: '800' },
  previewGrid: { marginTop: 16, gap: 12 },
  previewCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.07)', borderLeftWidth: 5 },
  previewEmoji: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  previewEmojiText: { fontSize: 24 },
  previewTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  previewDesc: { color: '#cbd5e1', marginTop: 2, fontSize: 12 },
  langPill: { alignSelf: 'flex-start', marginTop: 16, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' },
  langPillText: { color: '#fff', fontWeight: '700' },
});