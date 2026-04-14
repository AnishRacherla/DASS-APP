import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

const API_BASE_CANDIDATES = Array.from(
  new Set([
    API_BASE_URL,
    'http://10.2.138.72:5001',
    'http://10.201.48.5:5001',
    'http://10.2.143.103:5001',
    'http://172.25.80.189:5001',
    'http://10.0.2.2:5001',
  ])
);

export default function WordJumbleSelection({ navigation, route }) {
  const [language, setLanguage] = useState(
    route.params?.language || 'hindi'
  );
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeApiBase, setActiveApiBase] = useState(API_BASE_URL);

  const requestWithFallback = async (path, options = {}) => {
    const orderedBases = [activeApiBase, ...API_BASE_CANDIDATES.filter((b) => b !== activeApiBase)];
    let lastError = null;
    for (const base of orderedBases) {
      try {
        const response = await axios.get(`${base}${path}`, {
          timeout: API_TIMEOUT,
          ...options,
        });
        if (base !== activeApiBase) setActiveApiBase(base);
        return response;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  };

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const lang = await AsyncStorage.getItem('userLanguage');
      if (lang) setLanguage(lang);
    } catch (e) {}
  };

  useEffect(() => {
    fetchLevels();
  }, [language]);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await requestWithFallback('/api/word-jumble/levels', {
        params: { language },
      });
      setLevels(res.data || []);
    } catch (err) {
      setError('Could not load levels. Check backend and Wi-Fi.');
    } finally {
      setLoading(false);
    }
  };

  const levelMeta = {
    1: { emoji: '⭐', labelEn: 'Easy', labelHi: 'आसान', labelTe: 'సులభం', color: '#10b981', desc: 'Short & simple sentences' },
    2: { emoji: '⭐⭐', labelEn: 'Medium', labelHi: 'मध्यम', labelTe: 'మధ్యస్థం', color: '#f59e0b', desc: 'Medium length sentences' },
    3: { emoji: '⭐⭐⭐', labelEn: 'Hard', labelHi: 'कठिन', labelTe: 'కష్టం', color: '#ef4444', desc: 'Longer & complex sentences' },
  };

  const t = (hi, te, en) =>
    language === 'hindi' ? hi : language === 'telugu' ? te : en;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0c29" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← {t('वापस', 'వెనక్కి', 'Back')}</Text>
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.titleEmoji}>🌊</Text>
          <Text style={styles.title}>{t('शब्द जोड़ो', 'పదజాల', 'Word Jumble')}</Text>
        </View>
        <View style={{ width: 70 }} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        {t(
          'तैरते शब्दों को खींचकर सही वाक्य बनाएं!',
          'తేలులున్న పదాలను లాగి సరైన వాక్యం తీర్చండి!',
          'Drag floating words into the correct order!'
        )}
      </Text>

      {/* How to play */}
      <View style={styles.howToCard}>
        <Text style={styles.howToTitle}>
          {t('कैसे खेलें?', 'ఎలా ఆడాలి?', 'How to play?')}
        </Text>
        <Text style={styles.howToText}>
          {t(
            '• शब्दों को बाएं से दाएं सही क्रम में खींचें\n• OK दबाएं → सही = +10, गलत = -5\n• 5 वाक्य = 1 गेम',
            '• పదాలను ఎడమ నుండి కుడికి సరైన క్రమంలో లాగండి\n• OK నొక్కండి → సరైనది = +10, తప్పు = -5\n• 5 వాక్యాలు = 1 గేమ్',
            '• Drag words left-to-right into the correct order\n• Press OK → Correct = +10, Wrong = -5\n• 5 sentences = 1 game'
          )}
        </Text>
      </View>

      {/* Level Cards */}
      {loading ? (
        <ActivityIndicator size="large" color="#818cf8" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchLevels}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.levelsContainer}>
          {levels.map((lvl) => {
            const meta = levelMeta[lvl.level] || levelMeta[1];
            const label = language === 'hindi' ? meta.labelHi : language === 'telugu' ? meta.labelTe : meta.labelEn;
            return (
              <TouchableOpacity
                key={lvl.level}
                style={[styles.levelCard, { borderLeftColor: meta.color }]}
                onPress={() => navigation.navigate('WordJumbleGame', { language, level: lvl.level })}
                activeOpacity={0.82}
              >
                <View style={[styles.levelCircle, { backgroundColor: meta.color + '22', borderColor: meta.color }]}>
                  <Text style={styles.levelEmoji}>{meta.emoji}</Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelNum}>
                    {t('स्तर', 'స్థాయి', 'Level')} {lvl.level}
                  </Text>
                  <Text style={[styles.levelLabel, { color: meta.color }]}>{label}</Text>
                  <Text style={styles.levelDesc}>{meta.desc}</Text>
                </View>
                <View style={[styles.playChip, { backgroundColor: meta.color }]}>
                  <Text style={styles.playChipText}>{t('खेलें', 'ఆడు', 'Play')} ▶</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0c29' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 50, paddingBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  backText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleEmoji: { fontSize: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: '900' },
  subtitle: {
    color: 'rgba(255,255,255,0.6)', textAlign: 'center',
    fontSize: 14, fontWeight: '600', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8,
  },
  howToCard: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: 'rgba(129,140,248,0.1)',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(129,140,248,0.25)',
  },
  howToTitle: { color: '#a5b4fc', fontSize: 14, fontWeight: '800', marginBottom: 6 },
  howToText: { color: 'rgba(255,255,255,0.65)', fontSize: 13, lineHeight: 20 },
  levelsContainer: { padding: 16, gap: 14 },
  levelCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderLeftWidth: 4,
  },
  levelCircle: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
  },
  levelEmoji: { fontSize: 20 },
  levelInfo: { flex: 1 },
  levelNum: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  levelLabel: { fontSize: 24, fontWeight: '900', marginTop: 2 },
  levelDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  playChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  playChipText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  errorCard: { margin: 20, backgroundColor: 'rgba(239,68,68,0.15)', borderRadius: 16, padding: 20, alignItems: 'center' },
  errorText: { color: '#fca5a5', fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 14 },
  retryBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '700' },
});
