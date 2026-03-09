import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MarsGameSelection.css';

export default function MarsGameSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = location.state?.language || 'hindi';
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: 'image-identification',
      title: 'Image Identification',
      emoji: '🖼️',
      description: 'Match images with words - 2 levels',
      color: '#FF6B6B'
    },
    {
      id: 'whack-a-letter',
      title: 'Whack-a-Letter',
      emoji: '🔨',
      description: 'Tap tiles with target letters!',
      color: '#FF8C42'
    }
  ];

  const imageIdentificationLevels = [
    {
      level: 1,
      title: 'Level 1 - Easy',
      description: '3 images, choose the correct one',
      questions: 4,
      totalImages: 12,
      color: '#FF6B6B'
    },
    {
      level: 2,
      title: 'Level 2 - Medium',
      description: '4 images, choose the correct one',
      questions: 2,
      totalImages: 8,
      color: '#d66d75'
    }
  ];

  const handleGameSelect = (gameId) => {
    if (gameId === 'whack-a-letter') {
      // Navigate directly to whack game selection
      navigate(`/whack/${language}`);
    } else {
      // Show level selection for image identification
      setSelectedGame(gameId);
    }
  };

  const handleLevelSelect = (level) => {
    navigate('/mars-game', { state: { language, level } });
  };

  const handleBack = () => {
    if (selectedGame) {
      setSelectedGame(null);
    } else {
      navigate('/game-hub');
    }
  };

  return (
    <div className="mars-selection-container">
      <div className="mars-selection-header">
        <button className="back-btn" onClick={handleBack}>
          ← Back
        </button>
        <h1>Mars Planet 🔴</h1>
        <div className="placeholder"></div>
      </div>

      <div className="mars-selection-content">
        {!selectedGame ? (
          // Game Type Selection
          <>
            <h2 className="mars-selection-title">Choose Your Game</h2>
            <p className="mars-selection-subtitle">Advanced learning games for Mars explorers!</p>

            <div className="games-container">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="mars-game-card"
                  style={{ borderColor: game.color }}
                  onClick={() => handleGameSelect(game.id)}
                >
                  <div className="game-icon" style={{ backgroundColor: game.color }}>
                    {game.emoji}
                  </div>
                  <h3 className="game-title">{game.title}</h3>
                  <p className="game-description">{game.description}</p>
                  <div className="play-arrow">→</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Level Selection for Image Identification
          <>
            <h2 className="mars-selection-title">Choose Your Level �️</h2>
            <p className="mars-selection-subtitle">Match images with words!</p>

            <div className="levels-container">
              {imageIdentificationLevels.map((levelData) => (
                <div
                  key={levelData.level}
                  className="mars-level-card"
                  style={{ borderColor: levelData.color }}
                  onClick={() => handleLevelSelect(levelData.level)}
                >
                  <div className="level-badge" style={{ backgroundColor: levelData.color }}>
                    Level {levelData.level}
                  </div>
                  <h3 className="level-title">{levelData.title}</h3>
                  <p className="level-description">{levelData.description}</p>
                  <div className="level-stats">
                    <div className="stat-item">
                      <span className="stat-icon">❓</span>
                      <span>{levelData.questions} questions</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-icon">🖼️</span>
                      <span>{levelData.totalImages} images</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
