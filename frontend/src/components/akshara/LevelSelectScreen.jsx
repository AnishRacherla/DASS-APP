import React from 'react';
import { motion } from 'framer-motion';
import { LEVELS } from '../../akshara-data/gameData';

const stageIcons = { Discover: '🔮', Guided: '🧭', Words: '📖', Mastery: '👑' };
const stageGradients = {
  Discover: 'linear-gradient(135deg, #a855f7, #6366f1)',
  Guided: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
  Words: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  Mastery: 'linear-gradient(135deg, #f472b6, #fbbf24)',
};

export default function LevelSelectScreen({ onSelectLevel, onBack, completedLevels, levelStars, playerName, language, onChangeLanguage }) {
  const stages = [...new Set(LEVELS.map(l => l.stage))];
  const totalStars = Object.values(levelStars).reduce((a, b) => a + b, 0);
  const maxStars = LEVELS.length * 3;
  const highestCompleted = completedLevels.length;

  const isUnlocked = (level) => highestCompleted >= level.unlockRequirement;

  const starPercent = maxStars > 0 ? Math.round((totalStars / maxStars) * 100) : 0;

  return (
    <motion.div
      className="level-select-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top bar */}
      <div className="ls-top-bar">
        <button className="ls-back-btn" onClick={onBack} title="Back to Game Hub">
          <span className="ls-back-arrow">←</span>
          <span className="ls-back-text">Back</span>
        </button>

        <div className="ls-player-chip">
          <span className="ls-avatar-circle">{playerName?.charAt(0)?.toUpperCase() || '?'}</span>
          <span className="ls-player-name">{playerName}</span>
        </div>

        <div className="ls-lang-toggle">
          <button
            className={`ls-lang-btn ${language === 'hindi' ? 'active' : ''}`}
            onClick={() => onChangeLanguage('hindi')}
          >🇮🇳 Hindi</button>
          <button
            className={`ls-lang-btn ${language === 'telugu' ? 'active' : ''}`}
            onClick={() => onChangeLanguage('telugu')}
          >✨ Telugu</button>
        </div>
      </div>

      {/* Hero header */}
      <div className="ls-hero">
        <motion.h1
          className="ls-hero-title"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >🧙‍♂️ Akshara Magic Lab</motion.h1>

        <div className="ls-progress-row">
          <div className="ls-stat-box">
            <span className="ls-stat-icon">⭐</span>
            <span className="ls-stat-val">{totalStars}</span>
            <span className="ls-stat-label">/ {maxStars} Stars</span>
          </div>
          <div className="ls-stat-box">
            <span className="ls-stat-icon">✅</span>
            <span className="ls-stat-val">{highestCompleted}</span>
            <span className="ls-stat-label">/ {LEVELS.length} Done</span>
          </div>
        </div>

        <div className="ls-progress-bar-track">
          <motion.div
            className="ls-progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${starPercent}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        </div>
      </div>

      {/* Level stages */}
      <div className="ls-stages-container">
        {stages.map(stage => (
          <div key={stage} className="stage-section">
            <div className="stage-label">
              <span className="stage-label-icon">{stageIcons[stage] || '📚'}</span>
              <span className="stage-label-text">{stage}</span>
              <span className="stage-label-line" />
            </div>
            <div className="level-grid">
              {LEVELS.filter(l => l.stage === stage).map((level, i) => {
                const unlocked = isUnlocked(level);
                const completed = completedLevels.includes(level.id);
                const stars = levelStars[level.id] || 0;
                const isCurrent = unlocked && !completed;

                return (
                  <motion.div
                    key={level.id}
                    className={`level-card ${!unlocked ? 'locked' : ''} ${completed ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                    onClick={() => unlocked && onSelectLevel(level)}
                    whileHover={unlocked ? { scale: 1.04, y: -6 } : {}}
                    whileTap={unlocked ? { scale: 0.96 } : {}}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    {/* card glow accent */}
                    {isCurrent && <div className="lc-glow" style={{ background: stageGradients[stage] }} />}

                    <div className="lc-header">
                      <span className="lc-num">Level {level.id}</span>
                      {unlocked ? (
                        <span className="lc-emoji">{level.emoji}</span>
                      ) : (
                        <span className="lc-lock">🔒</span>
                      )}
                    </div>
                    <div className="lc-name">{level.name}</div>
                    <div className="lc-desc">{level.description}</div>
                    {completed && (
                      <div className="lc-stars">
                        {[1, 2, 3].map(s => (
                          <span key={s} className={s <= stars ? 'star-filled' : 'star-empty'}>⭐</span>
                        ))}
                      </div>
                    )}
                    {isCurrent && <span className="lc-badge new-badge">▶ PLAY</span>}
                    {stars === 3 && <span className="lc-badge best-badge">★ MAX</span>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
