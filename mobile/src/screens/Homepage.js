import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../config';

export default function Homepage({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('5');

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    setShowForm(true);
  };

  const handleStartLearning = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    try {
      const res = await axios.post(API_BASE_URL + '/api/users', {
        name: name.trim(),
        age: parseInt(age),
        language: selectedLanguage,
      }, { timeout: API_TIMEOUT });

      if (res.data.success) {
        await AsyncStorage.multiSet([
          ['userId', res.data.user._id],
          ['userName', res.data.user.name],
          ['userLanguage', res.data.user.language],
        ]);
        navigation.navigate('PlanetHome', { language: selectedLanguage });
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong! Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0C2A" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.rocket}>🚀</Text>
        <Text style={styles.title}>🌟 Letter Space Adventure 🌟</Text>
        <Text style={styles.subtitle}>Learn Hindi & Telugu Letters</Text>

        {!showForm ? (
          <View style={styles.langSection}>
            <Text style={styles.sectionTitle}>Choose Your Language</Text>
            <Text style={styles.sectionSub}>Select which language you want to learn</Text>

            <TouchableOpacity style={[styles.langBtn, { borderColor: '#FF6B6B' }]} onPress={() => handleLanguageSelect('hindi')}>
              <Text style={styles.langEmoji}>🇮🇳</Text>
              <Text style={styles.langText}>Hindi</Text>
              <Text style={styles.langSubtext}>Learn Hindi Letters</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.langBtn, { borderColor: '#4ECDC4' }]} onPress={() => handleLanguageSelect('telugu')}>
              <Text style={styles.langEmoji}>🇮🇳</Text>
              <Text style={styles.langText}>Telugu</Text>
              <Text style={styles.langSubtext}>Learn Telugu Letters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Welcome, Young Astronaut!</Text>
            <Text style={styles.sectionSub}>Let's start your learning journey! 🚀</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Your Age (3-8 years)</Text>
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
              <Text style={styles.fieldLabel}>Selected Language</Text>
              <View style={[styles.input, { backgroundColor: 'rgba(255,215,0,0.1)' }]}>
                <Text style={styles.disabledText}>
                  {selectedLanguage === 'hindi' ? 'Hindi (हिंदी)' : 'Telugu (తెలుగు)'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.startBtn} onPress={handleStartLearning}>
              <Text style={styles.startBtnText}>Start Learning 🚀</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setShowForm(false); setSelectedLanguage(''); }}>
              <Text style={styles.backLink}>← Back to Language Selection</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0C2A' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  rocket: { fontSize: 60, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#FFD700', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 24 },

  langSection: { width: '100%', maxWidth: 340, alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#e2e8f0', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#94a3b8', marginBottom: 20 },
  langBtn: { width: '100%', borderRadius: 16, borderWidth: 2, padding: 20, alignItems: 'center', marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)' },
  langEmoji: { fontSize: 32, marginBottom: 4 },
  langText: { fontSize: 20, fontWeight: '700', color: '#e2e8f0' },
  langSubtext: { fontSize: 13, color: '#94a3b8', marginTop: 4 },

  formSection: { width: '100%', maxWidth: 340, alignItems: 'center' },
  fieldGroup: { width: '100%', marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#e2e8f0', marginBottom: 6, marginLeft: 4 },
  input: { width: '100%', padding: 14, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.06)', color: '#f1f5f9', fontSize: 15, justifyContent: 'center' },
  disabledText: { color: '#FFD700', fontSize: 15 },
  startBtn: { width: '100%', padding: 16, borderRadius: 14, backgroundColor: '#a855f7', alignItems: 'center', marginTop: 8 },
  startBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  backLink: { color: '#c084fc', fontSize: 14, fontWeight: '600', marginTop: 14 },
});
