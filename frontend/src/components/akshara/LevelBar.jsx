import React from 'react';

export default function LevelBar({ level, currentRound, totalRounds }) {
  const pct = Math.min(100, (currentRound / totalRounds) * 100);

  return (
    <div className="level-bar">
      <span className="level-pill">Lv.{level.id}</span>
      <div className="progress-wrapper">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="round-text">{currentRound}/{totalRounds}</span>
    </div>
  );
}
