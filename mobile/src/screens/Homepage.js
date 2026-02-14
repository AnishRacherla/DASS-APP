import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const { width } = Dimensions.get('window');

export default function Homepage({ navigation }) {
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '5'
  });

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowForm(true);
  };

  const handleStartLearning = async () => {
    if (!formData.name) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const requestPromise = axios.post(`${API_BASE_URL}/api/users`, {
        name: formData.name,
        age: parseInt(formData.age),
        language: selectedLanguage
      });
      
      const response = await Promise.race([requestPromise, timeoutPromise]);

      if (response.data.success) {
        await AsyncStorage.setItem('userId', response.data.user._id);
        await AsyncStorage.setItem('userName', response.data.user.name);
        await AsyncStorage.setItem('userLanguage', response.data.user.language);
        
        setLoading(false);
        navigation.navigate('PlanetSelection', { language: selectedLanguage });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setLoading(false);
      alert('Cannot connect to server. Please make sure backend is running at ' + API_BASE_URL);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.rocket}>🚀</Text>
        
        <Text style={styles.title}>Letter Space Adventure</Text>
        <Text style={styles.subtitle}>Learn Hindi & Telugu Letters</Text>

        {!showForm ? (
          <View style={styles.languageSelection}>
            <Text style={styles.selectionTitle}>Choose Your Language</Text>
            <Text style={styles.selectionSubtitle}>Select which language you want to learn</Text>
            
            <View style={styles.languageButtons}>
              <TouchableOpacity
                style={[styles.languageBtn, styles.hindiBorder]}
                onPress={() => handleLanguageSelect('hindi')}
              >
                <Text style={styles.langEmoji}>🇮🇳</Text>
                <Text style={styles.langText}>Hindi</Text>
                <Text style={styles.langSubtext}>Learn Hindi Letters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.languageBtn, styles.teluguBorder]}
                onPress={() => handleLanguageSelect('telugu')}
              >
                <Text style={styles.langEmoji}>🇮🇳</Text>
                <Text style={styles.langText}>Telugu</Text>
                <Text style={styles.langSubtext}>Learn Telugu Letters</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Welcome, Young Astronaut!</Text>
            <Text style={styles.formSubtitle}>Let's start your learning journey! 🚀</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter your name"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Age (3-8 years)</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                keyboardType="numeric"
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Selected Language</Text>
              <View style={styles.disabledInput}>
                <Text style={styles.disabledText}>
                  {selectedLanguage === 'hindi' ? 'Hindi (हिंदी)' : 'Telugu (తెలుగు)'}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.startBtn, loading && styles.startBtnDisabled]} 
              onPress={handleStartLearning}
              disabled={loading}
            >
              <Text style={styles.startBtnText}>
                {loading ? 'Loading...' : 'Start Learning 🚀'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                setShowForm(false);
                setSelectedLanguage('');
              }}
            >
              <Text style={styles.backBtnText}>← Back to Language Selection</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C2A',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  rocket: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#9B5DE5',
    textAlign: 'center',
    marginBottom: 40,
  },
  languageSelection: {
    width: '100%',
    marginTop: 20,
  },
  selectionTitle: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  selectionSubtitle: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 30,
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 20,
  },
  languageBtn: {
    width: width * 0.4,
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  hindiBorder: {
    borderColor: '#FFD700',
  },
  teluguBorder: {
    borderColor: '#9B5DE5',
  },
  langEmoji: {
    fontSize: 50,
    marginBottom: 10,
  },
  langText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  langSubtext: {
    fontSize: 14,
    color: '#ddd',
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 30,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 15,
    padding: 15,
    fontSize: 18,
    color: 'white',
  },
  disabledInput: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 15,
    padding: 15,
  },
  disabledText: {
    fontSize: 18,
    color: 'white',
  },
  startBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 50,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  startBtnDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  startBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B0C2A',
  },
  backBtn: {
    backgroundColor: '#6B2FA5',
    borderRadius: 50,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});
