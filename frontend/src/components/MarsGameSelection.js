import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MarsGameSelection.css';

export default function MarsGameSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = location.state?.language || 'hindi';

  const levels = [
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

  return (
    <div className="mars-selection-container">
      <div className="mars-selection-header">
        <button className="back-btn" onClick={() => navigate('/planet-home', { state: { language } })}>
          ← Back
        </button>
        <h1>Mars - Word Matching</h1>
        <div className="placeholder"></div>
      </div>

      <div className="mars-selection-content">
        <h2 className="mars-selection-title">Choose Your Level 🔴</h2>
        <p className="mars-selection-subtitle">Match images with words!</p>

        <div className="levels-container">
          {levels.map((levelData) => (
            <div
              key={levelData.level}
              className="mars-level-card"
              style={{ borderColor: levelData.color }}
              onClick={() => navigate('/mars-game', { state: { language, level: levelData.level } })}
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
      </div>
    </div>
  );
}
