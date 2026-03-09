import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export default function AuthPage({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [language, setLanguage] = useState('hindi');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

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
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/akshara/auth/login`, { email: email.trim().toLowerCase(), password });
      const player = res.data.player;
      await AsyncStorage.multiSet([
        ['playerId', player._id],
        ['playerName', player.playerName],
        ['playerEmail', player.email],
        ['userLanguage', player.language || 'hindi'],
        ['isLoggedIn', 'true'],
      ]);
      // Also create/find legacy user for score tracking
      try {
        const legacyRes = await axios.post(`${API_BASE_URL}/api/users/find-or-create`, { name: player.playerName, language: player.language || 'hindi' });
        if (legacyRes.data?.user?._id) {
          await AsyncStorage.setItem('userId', legacyRes.data.user._id);
          await AsyncStorage.setItem('userName', player.playerName);
        }
      } catch (e) {}
      navigation.replace('GameHub');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Check your credentials.';
      Alert.alert('Login Failed', msg);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !playerName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/akshara/auth/signup`, {
        email: email.trim().toLowerCase(), password, playerName: playerName.trim(), language,
      });
      const player = res.data.player;
      await AsyncStorage.multiSet([
        ['playerId', player._id],
        ['playerName', player.playerName],
        ['playerEmail', player.email],
        ['userLanguage', language],
        ['isLoggedIn', 'true'],
      ]);
      // Also create legacy user
      try {
        const legacyRes = await axios.post(`${API_BASE_URL}/api/users`, { name: playerName.trim(), age: 5, language });
        if (legacyRes.data?._id) {
          await AsyncStorage.setItem('userId', legacyRes.data._id);
          await AsyncStorage.setItem('userName', playerName.trim());
        }
      } catch (e) {}
      navigation.replace('GameHub');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed.';
      Alert.alert('Registration Failed', msg);
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#a855f7" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🎮</Text>
        <Text style={styles.title}>Literacy Games</Text>
        <Text style={styles.subtitle}>Learn Hindi & Telugu through fun games!</Text>

        {/* Tab Toggle */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, isLogin && styles.tabActive]} onPress={() => setIsLogin(true)}>
            <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, !isLogin && styles.tabActive]} onPress={() => setIsLogin(false)}>
            <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Player Name"
              placeholderTextColor="#666"
              value={playerName}
              onChangeText={setPlayerName}
              autoCapitalize="words"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {!isLogin && (
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
                <Text style={[styles.langText, language === 'telugu' && styles.langTextActive]}>✨ Telugu</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={isLogin ? handleLogin : handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>{isLogin ? 'Login' : 'Create Account'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchLink}>{isLogin ? 'Register' : 'Login'}</Text>
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
  title: { fontSize: 32, fontWeight: '800', color: '#FFD700', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 28, textAlign: 'center' },
  tabRow: { flexDirection: 'row', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 20 },
  tab: { paddingVertical: 10, paddingHorizontal: 32, backgroundColor: 'transparent' },
  tabActive: { backgroundColor: '#a855f7' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#94a3b8' },
  tabTextActive: { color: '#fff' },
  form: { width: '100%', maxWidth: 340, alignItems: 'center', gap: 12 },
  input: { width: '100%', padding: 14, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.06)', color: '#f1f5f9', fontSize: 15 },
  langRow: { flexDirection: 'row', gap: 10, width: '100%' },
  langBtn: { flex: 1, padding: 12, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  langActive: { borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.15)' },
  langText: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
  langTextActive: { color: '#fff' },
  submitBtn: { width: '100%', padding: 16, borderRadius: 14, backgroundColor: '#a855f7', alignItems: 'center', marginTop: 4 },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  switchText: { fontSize: 13, color: '#94a3b8', marginTop: 12 },
  switchLink: { color: '#c084fc', fontWeight: '700' },
});
