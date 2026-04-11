import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

const LEVELS = [
  {
    id: 'easy',
    title: 'Easy',
    subtitle: 'Score only',
    description: 'Fewer bubbles, simpler consonants, and no lives. Focus on building accuracy.',
    color: '#38BDF8',
  },
  {
    id: 'medium',
    title: 'Medium',
    subtitle: 'Score + lives',
    description: 'More distractors, more speed, and 3 lives to keep the pressure on.',
    color: '#F59E0B',
  },
  {
    id: 'hard',
    title: 'Hard',
    subtitle: 'Score + lives',
    description: 'The biggest bubble field, fastest pace, and the full consonant set.',
    color: '#EF4444',
  },
];

export default function BubbleShooterSelection({ navigation, route }) {
  const language = route.params?.language || 'hindi';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('GameHub')} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Games</Text>
        </TouchableOpacity>
        <Text style={styles.kicker}>Bubble Shooter</Text>
        <Text style={styles.title}>Match the sound, pop the right bubble</Text>
        <Text style={styles.subtitle}>
          The consonant audio changes every second. Shoot the correct bubble before the next sound plays.
        </Text>
      </View>

      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>Game Rules</Text>
        <Text style={styles.rule}>• Listen to the consonant sound and find the matching bubble.</Text>
        <Text style={styles.rule}>• The sound changes every 1 second, so stay focused.</Text>
        <Text style={styles.rule}>• Easy mode only tracks score. Medium and Hard add lives.</Text>
      </View>

      {LEVELS.map((level) => (
        <TouchableOpacity
          key={level.id}
          style={[styles.levelCard, { borderLeftColor: level.color }]}
          onPress={() => navigation.navigate('BubbleShooterGame', { language, difficulty: level.id })}
        >
          <View style={styles.levelHeaderRow}>
            <Text style={styles.levelTitle}>{level.title}</Text>
            <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
          </View>
          <Text style={styles.levelDescription}>{level.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A', padding: 16 },
  header: { marginTop: 24, marginBottom: 16 },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  backText: { color: '#fff', fontWeight: '700' },
  kicker: { color: '#38BDF8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginTop: 14, marginBottom: 4 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', lineHeight: 34 },
  subtitle: { color: '#94a3b8', marginTop: 8, lineHeight: 20 },
  rulesCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  rulesTitle: { color: '#38BDF8', fontWeight: '800', marginBottom: 8 },
  rule: { color: '#e2e8f0', marginBottom: 4, lineHeight: 18 },
  levelCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, borderLeftWidth: 5, marginBottom: 12 },
  levelHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  levelTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  levelSubtitle: { color: '#cbd5e1', marginTop: 2, fontSize: 12, fontWeight: '700' },
  levelDescription: { color: '#e2e8f0', marginTop: 6, lineHeight: 18 },
});
