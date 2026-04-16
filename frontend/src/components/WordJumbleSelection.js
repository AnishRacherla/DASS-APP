import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import './WordJumbleSelection.css';

const API_BASE = 'http://localhost:5001';

export default function WordJumbleSelection() {
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
        const response = await axios.get(`${API_BASE}/api/word-jumble/levels`, {
          params: { language }
        });
        setLevels(response.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setLevels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLevels();
  }, [language]);

  const handleSelectLevel = (level) => {
    navigate(`/word-jumble/${language}/${level}`, {
      state: { language, level }
    });
  };

  const levelMeta = {
    1: { emoji: '⭐', label: language === 'hindi' ? 'आसान' : language === 'telugu' ? 'సులభం' : 'Easy', color: '#10b981', glow: '#d1fae5' },
    2: { emoji: '⭐⭐', label: language === 'hindi' ? 'मध्यम' : language === 'telugu' ? 'మధ్యస్థం' : 'Medium', color: '#f59e0b', glow: '#fef3c7' },
    3: { emoji: '⭐⭐⭐', label: language === 'hindi' ? 'कठिन' : language === 'telugu' ? 'కష్టం' : 'Hard', color: '#ef4444', glow: '#fee2e2' },
  };

  const title = language === 'hindi' ? '🌊 शब्द जोड़ो' : language === 'telugu' ? '🌊 పదజాల' : '🌊 Word Jumble';
  const subtitle = language === 'hindi'
    ? 'तैरते शब्दों को खींचकर सही वाक्य बनाएं!'
    : language === 'telugu'
    ? 'తేలులున్న పదాలను లాగి సరైన వాక్యం తీర్చండి!'
    : 'Drag the floating words to assemble the correct sentence!';

  return (
    <div className="wj-selection">
      {/* Animated background orbs */}
      <div className="wj-bg">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="wj-orb" style={{
            left: `${(i * 33 + 10) % 100}%`,
            top: `${(i * 47 + 15) % 100}%`,
            animationDelay: `${i * 0.7}s`
          }} />
        ))}
      </div>

      <div className="wj-selection-inner">
        <button className="wj-back-btn" onClick={() => navigate(-1)}>← {language === 'hindi' ? 'वापस' : language === 'telugu' ? 'వెనక్కి' : 'Back'}</button>

        <motion.div
          className="wj-sel-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="wj-sel-title">{title}</h1>
          <p className="wj-sel-subtitle">{subtitle}</p>
        </motion.div>

        {loading ? (
          <div className="wj-loader">
            <div className="wj-spinner" />
            <p>{language === 'hindi' ? 'लोड हो रहा है...' : 'Loading...'}</p>
          </div>
        ) : error ? (
          <div className="wj-error">❌ {error}</div>
        ) : (
          <motion.div
            className="wj-levels-grid"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            {levels.map((lvl) => {
              const meta = levelMeta[lvl.level] || levelMeta[1];
              return (
                <motion.div
                  key={lvl.level}
                  className="wj-level-card"
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.9 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 250, damping: 20 } }
                  }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectLevel(lvl.level)}
                  style={{ '--lvl-color': meta.color, '--lvl-glow': meta.glow }}
                >
                  <div className="wj-level-glow" />
                  <div className="wj-level-emoji">{meta.emoji}</div>
                  <div className="wj-level-num">
                    {language === 'hindi' ? 'स्तर' : language === 'telugu' ? 'స్థాయి' : 'Level'} {lvl.level}
                  </div>
                  <div className="wj-level-label">{meta.label}</div>
                  <div className="wj-level-desc">
                    {lvl.level === 1
                      ? (language === 'hindi' ? 'छोटे और सरल वाक्य' : language === 'telugu' ? 'చిన్న మరియు సులభమైన వాక్యాలు' : 'Short & simple sentences')
                      : lvl.level === 2
                      ? (language === 'hindi' ? 'मध्यम लंबाई के वाक्य' : language === 'telugu' ? 'మధ్య పొడవు వాక్యాలు' : 'Medium length sentences')
                      : (language === 'hindi' ? 'लंबे और जटिल वाक्य' : language === 'telugu' ? 'పొడవైన సంక్లిష్ట వాక్యాలు' : 'Longer & complex sentences')
                    }
                  </div>
                  <div className="wj-level-play">
                    {language === 'hindi' ? 'खेलें' : language === 'telugu' ? 'ఆడు' : 'Play'} ▶
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
