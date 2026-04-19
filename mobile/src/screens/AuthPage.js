import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

const API_BASE_CANDIDATES = Array.from(
  new Set([
    API_BASE_URL,
    'http://10.201.48.5:5001',
    'http://10.2.143.103:5001',
    'http://172.25.80.189:5001',
    'http://10.0.2.2:5001',
    'http://127.0.0.1:5001',
  ])
);

export default function AuthPage({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [age, setAge] = useState('5');
  const [language, setLanguage] = useState('hindi');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeApiBase, setActiveApiBase] = useState(API_BASE_URL);

  const requestWithFallback = async (path, options = {}) => {
    const orderedBases = [activeApiBase, ...API_BASE_CANDIDATES.filter((b) => b !== activeApiBase)];
    let lastError = null;

    for (const base of orderedBases) {
      try {
        const response = await axios({
          url: `${base}${path}`,
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
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
    try {
      const loggedIn = await AsyncStorage.getItem('isLoggedIn');
      if (loggedIn === 'true') {
        navigation.replace('GameHub');
      }
    } catch (e) {}
    setChecking(false);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const res = await requestWithFallback('/api/akshara/auth/login', {
        method: 'post',
        data: { email: email.trim().toLowerCase(), password },
      });
      const player = res.data.player;
      await AsyncStorage.multiSet([
        ['playerId', player._id],
        ['playerName', player.playerName],
        ['playerEmail', player.email],
        ['userName', player.playerName],
        ['userLanguage', player.language || 'hindi'],
        ['isLoggedIn', 'true'],
      ]);
      try {
        const legacyRes = await requestWithFallback('/api/users/find-or-create', {
          method: 'post',
          data: { name: player.playerName, language: player.language || 'hindi' },
        });
        if (legacyRes.data?.success && legacyRes.data?.user?._id) {
          await AsyncStorage.setItem('userId', legacyRes.data.user._id);
        }
      } catch (e) {}
      navigation.replace('GameHub');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Cannot reach backend. Check server and Wi-Fi.';
      Alert.alert('Login Failed', msg);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const res = await requestWithFallback('/api/akshara/auth/signup', {
        method: 'post',
        data: { email: email.trim().toLowerCase(), password, playerName: playerName.trim(), language },
      });
      const player = res.data.player;
      await AsyncStorage.multiSet([
        ['playerId', player._id],
        ['playerName', player.playerName],
        ['playerEmail', player.email],
        ['userName', player.playerName],
        ['userLanguage', language],
        ['isLoggedIn', 'true'],
      ]);
      try {
        const legacyRes = await requestWithFallback('/api/users', {
          method: 'post',
          data: { name: playerName.trim(), age: parseInt(age), language },
        });
        if (legacyRes.data?.success) {
          await AsyncStorage.setItem('userId', legacyRes.data.user._id);
        }
      } catch (e) {}
      navigation.replace('GameHub');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Cannot reach backend. Check server and Wi-Fi.';
      Alert.alert('Registration Failed', msg);
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🚀</Text>
        <Text style={styles.title}>Letter Space Adventure</Text>
        <Text style={styles.subtitle}>Learn Hindi & Telugu through 5 magical games!</Text>

        <View style={styles.gamePreview}>
          <Text style={styles.gameIcon}>🎈</Text>
          <Text style={styles.gameIcon}>🪐</Text>
          <Text style={styles.gameIcon}>🔨</Text>
          <Text style={styles.gameIcon}>📝</Text>
          <Text style={styles.gameIcon}>🧙‍♂️</Text>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, isLogin && styles.tabActive]} onPress={() => setIsLogin(true)}>
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>🔑 Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, !isLogin && styles.tabActive]} onPress={() => setIsLogin(false)}>
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>✨ Register</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>📧 Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>🔒 Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>👤 Your Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What should we call you?"
                  placeholderTextColor="#666"
                  value={playerName}
                  onChangeText={setPlayerName}
                  autoCapitalize="words"
                  maxLength={20}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>🎂 Age (3-8 years)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="5"
                  placeholderTextColor="#666"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  maxLength={1}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>🌐 Preferred Language</Text>
                <View style={styles.langRow}>
                  <TouchableOpacity
                    style={[styles.langBtn, language === 'hindi' && styles.langActive]}
                    onPress={() => setLanguage('hindi')}
                  >
                    <Text style={[styles.langText, language === 'hindi' && styles.langTextActive]}>🇮🇳 Hindi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.langBtn, language === 'telugu' && styles.langActive]}
                    onPress={() => setLanguage('telugu')}
                  >
                    <Text style={[styles.langText, language === 'telugu' && styles.langTextActive]}>🇮🇳 Telugu</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={isLogin ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {isLogin ? '🚀 Login & Play!' : '✨ Create Account & Play!'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchLink}>{isLogin ? 'Register here' : 'Login here'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logo: { fontSize: 60, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFD700', marginBottom: 4, fontStyle: 'italic' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 16, textAlign: 'center' },
  gamePreview: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 },
  gameIcon: { fontSize: 32 },
  tabRow: { flexDirection: 'row', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 20 },
  tab: { paddingVertical: 10, paddingHorizontal: 28, backgroundColor: 'transparent' },
  tabActive: { backgroundColor: '#a855f7' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#94a3b8' },
  tabTextActive: { color: '#fff' },
  form: { width: '100%', maxWidth: 340, alignItems: 'center' },
  fieldGroup: { width: '100%', marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#e2e8f0', marginBottom: 6, marginLeft: 4 },
  input: { width: '100%', padding: 14, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.06)', color: '#f1f5f9', fontSize: 15 },
  langRow: { flexDirection: 'row', gap: 10, width: '100%' },
  langBtn: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  langActive: { borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)' },
  langText: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
  langTextActive: { color: '#fff' },
  submitBtn: { width: '100%', padding: 16, borderRadius: 14, backgroundColor: '#a855f7', alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  switchText: { fontSize: 13, color: '#94a3b8', marginTop: 14 },
  switchLink: { color: '#c084fc', fontWeight: '700' },
});
