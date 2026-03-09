import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './BalloonSelection.css';

export default function BalloonSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = location.state?.language || 'hindi';
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGames = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/balloon/${language}`);
      setGames(response.data.games);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching games:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="balloon-selection-container">
        <div className="loading-container">
          <div className="loader"></div>
          <p className="loading-text">Loading levels...</p>
        </div>
      </div>
    );
  }

  const balloonEmojis = ['🎈', '🎈', '🎈', '🎈', '🎈'];

  return (
    <div className="balloon-selection-container">
      <div className="balloon-selection-header">
        <button className="back-btn" onClick={() => navigate('/game-hub')}>
          ← Back to Games
        </button>
        <h1>Balloon Pop Levels</h1>
        <div className="placeholder"></div>
      </div>

      <div className="balloon-selection-content">
        <h2 className="balloon-selection-title">Choose Your Level 🎈</h2>
        <p className="balloon-selection-subtitle">Pop the correct balloons!</p>

        <div className="levels-grid">
          {games.map((game, index) => (
            <div
              key={game._id}
              className="level-card"
              onClick={() => navigate('/balloon-game', { state: { language, level: game.level } })}
            >
              <div className="level-icon-container">
                <span className="level-icon">{balloonEmojis[index % balloonEmojis.length]}</span>
              </div>
              <h3 className="level-number">Level {game.level}</h3>
              <h4 className="level-title">{game.title}</h4>
              <p className="level-description">{game.description}</p>
              <div className="level-info">
                <span className="level-info-text">⏱ {game.config.timeLimit}s</span>
                <span className="level-info-text">🎯 {game.config.numberOfRounds} rounds</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
