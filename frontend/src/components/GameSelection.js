import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './GameSelection.css';

export default function GameSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = location.state?.language || 'hindi';

  const games = [
    {
      id: 'quiz',
      title: '🎯 Audio Quiz',
      description: 'Listen and answer questions',
      color: '#4ECDC4'
    },
    {
      id: 'balloon',
      title: '🎈 Balloon Pop',
      description: 'Pop the balloon with correct letter',
      color: '#FF6B6B'
    }
  ];

  const handleGameClick = (gameId) => {
    if (gameId === 'quiz') {
      // Use the old URL format for quiz to maintain compatibility
      navigate(`/planets/${language}`);
    } else if (gameId === 'balloon') {
      navigate('/balloon-selection', { state: { language } });
    }
  };

  return (
    <div className="game-selection-container">
      <div className="game-selection-header">
        <button className="back-btn" onClick={() => navigate('/game-hub')}>
          ← Back
        </button>
        <h1>Choose a Game</h1>
        <div className="placeholder"></div>
      </div>

      <div className="game-selection-content">
        <h2 className="game-selection-title">Select Game Type</h2>
        <p className="game-selection-subtitle">
          Language: {language === 'hindi' ? 'Hindi 🇮🇳' : 'Telugu 🇮🇳'}
        </p>

        <div className="games-container">
          {games.map((game) => (
            <div
              key={game.id}
              className="game-card"
              style={{ borderColor: game.color }}
              onClick={() => handleGameClick(game.id)}
            >
              <div className="game-icon-container" style={{ backgroundColor: game.color }}>
                <span className="game-icon">{game.title.split(' ')[0]}</span>
              </div>
              <div className="game-info">
                <h3 className="game-title">{game.title.split(' ').slice(1).join(' ')}</h3>
                <p className="game-description">{game.description}</p>
              </div>
              <span className="arrow">→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
