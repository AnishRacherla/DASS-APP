import React from 'react';

export default function GameHeader({ level, score, streak, lives, maxLives, onBack, onSettings }) {
  return (
    <div className="game-header">
      <div className="header-left">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="game-title-small">{level.emoji} {level.name}</span>
      </div>
      <div className="header-stats">
        <div className="stat-badge lives-badge">
          {Array.from({ length: maxLives }, (_, i) => (
            <span key={i} className={`heart ${i >= lives ? 'lost' : ''}`}>❤️</span>
          ))}
        </div>
        <div className="stat-badge score-badge">
          <span className="icon">💎</span> {score}
        </div>
        {streak >= 2 && (
          <div className="stat-badge streak-badge">
            <span className="icon streak-fire">🔥</span> {streak}
          </div>
        )}
        <button className="settings-btn" onClick={onSettings}>⚙️</button>
      </div>
    </div>
  );
}
