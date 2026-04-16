import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import './FillStoryHub.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const UI_TEXT = {
  hindi: {
    title: 'कहानी भरो!',
    subtitle: 'खाली जगह भरो और मज़ेदार कहानी पढ़ो!',
    selectStory: 'कहानी चुनो',
    level: 'स्तर',
    play: 'खेलो ▶',
    back: '← वापस',
    loading: 'लोड हो रहा है...',
    noStories: 'कोई कहानी नहीं मिली',
    langLabel: 'हिंदी',
    langFlag: '🇮🇳'
  },
  telugu: {
    title: 'కథ నింపండి!',
    subtitle: 'ఖాళీలు నింపి మజా కథ చదవండి!',
    selectStory: 'కథ ఎంచుకోండి',
    level: 'స్థాయి',
    play: 'ఆడండి ▶',
    back: '← వెనక్కి',
    loading: 'లోడ్ అవుతోంది...',
    noStories: 'కథలు దొరకలేదు',
    langLabel: 'తెలుగు',
    langFlag: '🇮🇳'
  }
};

const CARD_COLORS = [
  { bg: 'linear-gradient(145deg, #6d28d9, #4c1d95)', border: '#8b5cf6' },
  { bg: 'linear-gradient(145deg, #be185d, #831843)', border: '#f472b6' },
  { bg: 'linear-gradient(145deg, #0369a1, #0c4a6e)', border: '#38bdf8' },
  { bg: 'linear-gradient(145deg, #b45309, #78350f)', border: '#fbbf24' },
  { bg: 'linear-gradient(145deg, #047857, #064e3b)', border: '#34d399' },
];

const STORY_EMOJIS = ['🐦', '🐱', '🐒', '🌧️', '🐘'];

const FillStoryHub = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState(
    location.state?.language || localStorage.getItem('userLanguage') || 'hindi'
  );
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const t = UI_TEXT[language] || UI_TEXT.hindi;

  useEffect(() => {
    const fetchLevels = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API}/api/fill-story/${language}`);
        if (res.data.success) {
          setLevels(res.data.levels);
        }
      } catch (err) {
        console.error('Error fetching fill-story levels:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchLevels();
  }, [language]);

  const handlePlay = (level) => {
    navigate(`/fill-story/${language}/${level}`, { state: { language } });
  };

  const handleLanguageSwitch = (lang) => {
    setLanguage(lang);
    localStorage.setItem('userLanguage', lang);
  };

  const difficultyLabel = (d) => {
    if (language === 'hindi') {
      return d === 'easy' ? 'आसान' : d === 'medium' ? 'मध्यम' : 'कठिन';
    }
    return d === 'easy' ? 'సులభం' : d === 'medium' ? 'మధ్యస్థం' : 'కఠినం';
  };

  return (
    <div className="fsh-root">
      {/* Animated background */}
      <div className="fsh-bg">
        <div className="fsh-stars">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className={`fsh-star ${['s','m','l'][i % 3]}`}
              style={{
                left: `${(i * 43 + 13) % 100}%`,
                top: `${(i * 61 + 7) % 100}%`,
                animationDelay: `${(i * 0.5) % 5}s`
              }}
            />
          ))}
        </div>
        <div className="fsh-orb fsh-orb-1" />
        <div className="fsh-orb fsh-orb-2" />
        <div className="fsh-orb fsh-orb-3" />
      </div>

      {/* Top bar */}
      <div className="fsh-topbar">
        <button className="fsh-back-btn" onClick={() => navigate('/game-hub')}>
          {t.back}
        </button>
        <div className="fsh-lang-toggle">
          <button
            className={`fsh-lang-btn ${language === 'hindi' ? 'active' : ''}`}
            onClick={() => handleLanguageSwitch('hindi')}
          >
            🇮🇳 हिंदी
          </button>
          <button
            className={`fsh-lang-btn ${language === 'telugu' ? 'active' : ''}`}
            onClick={() => handleLanguageSwitch('telugu')}
          >
            🇮🇳 తెలుగు
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="fsh-header">
        <div className="fsh-title-mascot">📖</div>
        <h1 className="fsh-title">{t.title}</h1>
        <p className="fsh-subtitle">{t.subtitle}</p>
      </div>

      {/* Story Grid */}
      <div className="fsh-content">
        {loading ? (
          <div className="fsh-loading">
            <div className="fsh-spinner" />
            <p>{t.loading}</p>
          </div>
        ) : error || levels.length === 0 ? (
          <div className="fsh-empty">
            <div className="fsh-empty-emoji">📚</div>
            <p>{t.noStories}</p>
          </div>
        ) : (
          <div className="fsh-grid">
            {levels.map((lvl, idx) => {
              const colorScheme = CARD_COLORS[idx % CARD_COLORS.length];
              const emoji = STORY_EMOJIS[idx % STORY_EMOJIS.length];
              return (
                <motion.div
                  key={lvl.id}
                  className="fsh-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
                  whileHover={{ y: -8, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handlePlay(lvl.level)}
                  style={{
                    background: colorScheme.bg,
                    borderColor: colorScheme.border,
                  }}
                >
                  <div className="fsh-card-top">
                    <div className="fsh-card-emoji">{emoji}</div>
                    <div className="fsh-card-level-badge">{lvl.level}</div>
                  </div>
                  <h3 className="fsh-card-title">{lvl.title}</h3>
                  <p className="fsh-card-desc">{lvl.description}</p>
                  <div className="fsh-card-bottom">
                    <span className={`fsh-card-diff ${lvl.difficulty}`}>
                      {difficultyLabel(lvl.difficulty)}
                    </span>
                    <button className="fsh-card-play-btn">
                      {t.play}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FillStoryHub;
