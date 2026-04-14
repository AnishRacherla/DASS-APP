import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
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

function resolveAssetUrl(base, path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/')) return `${base}${path}`;
  return `${base}/${path}`;
}

export default function SwaraGame({ navigation }) {
  const [language, setLanguage] = useState('hindi');
  const [activeApiBase, setActiveApiBase] = useState(API_BASE_URL);
  const [swaras, setSwaras] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const lang = await AsyncStorage.getItem('userLanguage');
        if (lang) setLanguage(lang);
      } catch (e) {
        // no-op
      }
    };
    loadLanguage();
  }, []);

  const requestWithFallback = async (path) => {
    const orderedBases = [activeApiBase, ...API_BASE_CANDIDATES.filter((b) => b !== activeApiBase)];
    let lastError = null;

    for (const base of orderedBases) {
      try {
        const response = await axios.get(`${base}${path}`, { timeout: API_TIMEOUT });
        if (base !== activeApiBase) setActiveApiBase(base);
        return response;
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError;
  };

  useEffect(() => {
    const fetchSwaras = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await requestWithFallback('/api/swaras');
        if (!Array.isArray(response.data) || response.data.length === 0) {
          throw new Error('No swaras found in database');
        }
        setSwaras(response.data);
        setIndex(0);
      } catch (err) {
        setError(err?.message || 'Failed to load swaras');
      } finally {
        setLoading(false);
      }
    };

    fetchSwaras();
  }, []);

  const current = swaras[index];

  const imageUrl = useMemo(() => {
    if (!current) return null;
    return resolveAssetUrl(activeApiBase, current.image);
  }, [current, activeApiBase]);

  const audioLabel = useMemo(() => {
    if (!current) return '';
    return `${current.letter} ${current.word}`;
  }, [current]);

  const speakCurrent = () => {
    if (!current) return;
    Speech.speak(audioLabel, {
      language: language === 'telugu' ? 'te-IN' : 'hi-IN',
      rate: 0.85,
      pitch: 1.05,
    });
  };

  const next = () => {
    if (index < swaras.length - 1) setIndex((prev) => prev + 1);
  };

  const prev = () => {
    if (index > 0) setIndex((prev) => prev - 1);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0c29" />
        <ActivityIndicator size="large" color="#a5b4fc" />
        <Text style={styles.loadingText}>Loading Swaras...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" backgroundColor="#0f0c29" />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.replace('SwaraGame')}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtnAlt} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollWrap}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0c29" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🎵 Swara Game</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{index + 1}/{swaras.length}</Text>
        </View>
      </View>

      {current && (
        <View style={styles.card}>
          <Text style={styles.letter}>{current.letter}</Text>
          <Text style={styles.word}>{current.word}</Text>

          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
          ) : (
            <View style={[styles.image, styles.imageFallback]}>
              <Text style={styles.imageFallbackText}>No image</Text>
            </View>
          )}

          <TouchableOpacity style={styles.audioBtn} onPress={speakCurrent}>
            <Text style={styles.audioBtnText}>🔊 Listen</Text>
          </TouchableOpacity>

          <View style={styles.navRow}>
            <TouchableOpacity style={[styles.navBtn, index === 0 && styles.navBtnDisabled]} onPress={prev} disabled={index === 0}>
              <Text style={styles.navBtnText}>← Prev</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navBtn, index === swaras.length - 1 && styles.navBtnDisabled]}
              onPress={next}
              disabled={index === swaras.length - 1}
            >
              <Text style={styles.navBtnText}>Next →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0c29' },
  scrollWrap: { paddingBottom: 30 },
  center: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 14, color: '#d1d5db', fontSize: 16, fontWeight: '700' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 48,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  backText: { color: '#fff', fontWeight: '700' },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  badge: { backgroundColor: 'rgba(99,102,241,0.25)', borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { color: '#c7d2fe', fontWeight: '800', fontSize: 12 },
  card: {
    margin: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
  },
  letter: { color: '#fbbf24', fontSize: 56, fontWeight: '900' },
  word: { color: '#e5e7eb', fontSize: 26, fontWeight: '800', marginTop: 4, marginBottom: 12 },
  image: { width: 240, height: 220, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)' },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  imageFallbackText: { color: '#94a3b8', fontSize: 14, fontWeight: '700' },
  audioBtn: {
    marginTop: 14,
    backgroundColor: '#10b981',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  audioBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  navRow: { marginTop: 18, width: '100%', flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  navBtn: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 18,
    paddingVertical: 10,
    alignItems: 'center',
  },
  navBtnDisabled: { opacity: 0.35 },
  navBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  errorTitle: { color: '#fca5a5', fontSize: 24, fontWeight: '900', marginBottom: 8 },
  errorText: { color: '#fecaca', textAlign: 'center', marginHorizontal: 24, marginBottom: 16, fontSize: 14 },
  retryBtn: { backgroundColor: '#6366f1', borderRadius: 18, paddingHorizontal: 20, paddingVertical: 10, marginBottom: 10 },
  backBtnAlt: { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 18, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontWeight: '800' },
});
