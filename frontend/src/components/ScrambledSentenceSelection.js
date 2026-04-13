import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import './ScrambledSentenceSelection.css';

const API_BASE = 'http://localhost:5001';

export default function ScrambledSentenceSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = location.state?.language || localStorage.getItem('userLanguage') || 'hindi';
  
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        setLoading(true);
        console.log('Fetching levels for language:', language);
        const response = await axios.get(`${API_BASE}/api/scrambled-sentences/levels`, {
          params: { language }
        });
        console.log('Levels response:', response.data);
        setLevels(response.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching levels:', error);
        setError(error.message);
        setLevels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, [language]);

  const handleSelectLevel = (level) => {
    navigate(`/scrambled-sentences/${language}/${level}`, {
      state: { language, level }
    });
  };

  const difficultyEmojis = {
    easy: '😊',
    medium: '😐',
    hard: '😰'
  };

  const levelColors = {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#ef4444'
  };

  if (loading) {
    return (
      <div className="scrambled-selection loading">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <div className="scrambled-selection">
      <div className="selection-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        
        <h1>
          {language === 'hindi' ? 'वाक्य ठीक करें' : 'Scrambled Sentences'}
        </h1>
        <p className="subtitle">
          {language === 'hindi' 
            ? 'एक स्तर चुनें और शुरू करें' 
            : 'Choose a level and start playing'}
        </p>

        {/* Debug Info */}
        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          borderRadius: '8px', 
          margin: '20px 0',
          fontSize: '12px',
          color: '#666'
        }}>
          Language: <strong>{language}</strong> | Levels Loaded: <strong>{levels.length}</strong>
          {error && <div style={{ color: '#dc2626', marginTop: '5px' }}>Error: {error}</div>}
        </div>

        <div className="levels-grid">
          {levels.map((levelData) => (
            <motion.button
              key={levelData.level}
              className="level-card"
              onClick={() => handleSelectLevel(levelData.level)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                borderTopColor: levelColors[levelData.difficulty]
              }}
            >
              <div className="level-header">
                <h2>{levelData.title}</h2>
                <span className="difficulty-emoji">
                  {difficultyEmojis[levelData.difficulty]}
                </span>
              </div>
              
              <div className="level-info">
                <span className="difficulty-badge" style={{
                  backgroundColor: levelColors[levelData.difficulty]
                }}>
                  {levelData.difficulty.toUpperCase()}
                </span>
              </div>

              <div className="level-action">
                {language === 'hindi' ? 'शुरू करें' : 'Start Game'}
              </div>
            </motion.button>
          ))}
        </div>

        {levels.length === 0 && !loading && (
          <div className="no-levels">
            {error ? (
              <>
                <div style={{ marginBottom: '15px', color: '#dc2626' }}>
                  ❌ Error: {error}
                </div>
                <div style={{ fontSize: '12px', marginTop: '10px' }}>
                  Make sure the backend server is running on {API_BASE}
                </div>
              </>
            ) : (
              <>
                {language === 'hindi' ? 'कोई गेम उपलब्ध नहीं' : 'No games available'}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
