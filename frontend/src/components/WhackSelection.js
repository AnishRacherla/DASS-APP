import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './WhackSelection.css';

const difficultyColor = { easy: '#4CAF50', medium: '#FFD700', hard: '#FF5252' };
const difficultyLabel = { easy: '⭐ Easy', medium: '⭐⭐ Medium', hard: '⭐⭐⭐ Hard' };

const WhackSelection = () => {
  const { language } = useParams();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/whack/${language}`)
      .then((res) => {
        setGames(res.data.games || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [language]);

  if (loading) {
    return (
      <div className="whack-selection loading">
        <div className="loading-spinner">🔨 Loading levels...</div>
      </div>
    );
  }

  return (
    <div className="whack-selection">
      {/* Stars background */}
      <div className="stars-container">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className={`star ${['small', 'medium', 'large'][i % 3]}`}
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s` }}
          />
        ))}
      </div>

      <div className="ws-header">
        <button className="btn btn-secondary" onClick={() => navigate(`/planets/${language}`)}>
          ← Back
        </button>
        <h1 className="ws-title">🔨 Whack-a-Letter</h1>
        <div style={{ width: 80 }} />
      </div>

      <p className="ws-subtitle">
        {language === 'hindi' ? 'Hindi 🇮🇳' : 'Telugu 🇮🇳'} — Choose a level
      </p>

      <div className="ws-grid">
        {games.map((game) => (
          <div
            key={game._id}
            className="ws-card"
            onClick={() => navigate(`/whack/${language}/${game.level}`)}
          >
            <div
              className="ws-card-badge"
              style={{ background: difficultyColor[game.difficulty] || '#4ECDC4' }}
            >
              {difficultyLabel[game.difficulty] || game.difficulty}
            </div>
            <div className="ws-target-letter">{game.gameData.targetLetter}</div>
            <div className="ws-level-label">Level {game.level}</div>
            <div className="ws-card-desc">{game.description}</div>
            <div className="ws-card-meta">
              <span>⏱ 40s</span>
              <span>🔄 5 rounds</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhackSelection;
