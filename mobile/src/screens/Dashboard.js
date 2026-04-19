import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';

export default function Dashboard({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />
      <Text style={styles.emoji}>📊</Text>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A', justifyContent: 'center', alignItems: 'center', padding: 20 },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFD700', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#94a3b8', marginBottom: 32 },
  backBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 14, backgroundColor: 'rgba(168,85,247,0.2)', borderWidth: 1, borderColor: '#a855f7' },
  backText: { color: '#c084fc', fontSize: 16, fontWeight: '700' },
});
