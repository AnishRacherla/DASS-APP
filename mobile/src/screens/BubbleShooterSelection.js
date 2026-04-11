import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

const LEVELS = [
  { id: 'easy', title: 'Easy', subtitle: 'Score only', color: '#38BDF8' },
  { id: 'medium', title: 'Medium', subtitle: 'Score + lives', color: '#F59E0B' },
  { id: 'hard', title: 'Hard', subtitle: 'Score + lives', color: '#EF4444' },
];

export default function BubbleShooterSelection({ navigation, route }) {
  const language = route.params?.language || 'hindi';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('GameHub')} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Bubble Shooter</Text>
        <Text style={styles.subtitle}>Choose difficulty</Text>
      </View>

      <View style={styles.rulesCard}>
        <Text style={styles.rulesTitle}>Rules</Text>
        <Text style={styles.rule}>• Target letter changes every 10 sec</Text>
        <Text style={styles.rule}>• Sound repeats every 3 sec</Text>
        <Text style={styles.rule}>• Correct hit +10, wrong hit -5</Text>
      </View>

      {LEVELS.map((level) => (
        <TouchableOpacity
          key={level.id}
          style={[styles.levelCard, { borderLeftColor: level.color }]}
          onPress={() => navigation.navigate('BubbleShooterGame', { language, difficulty: level.id })}
        >
          <Text style={styles.levelTitle}>{level.title}</Text>
          <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
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
  title: { color: '#fff', fontSize: 30, fontWeight: '800', marginTop: 14 },
  subtitle: { color: '#94a3b8', marginTop: 4 },
  rulesCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  rulesTitle: { color: '#38BDF8', fontWeight: '800', marginBottom: 8 },
  rule: { color: '#e2e8f0', marginBottom: 4 },
  levelCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16, borderLeftWidth: 5, marginBottom: 12 },
  levelTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  levelSubtitle: { color: '#cbd5e1', marginTop: 4 },
});
