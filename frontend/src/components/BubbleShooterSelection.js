import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BubbleShooterSelection.css';

const LEVELS = [
  {
    id: 'easy',
    title: 'Easy',
    subtitle: 'Score only',
    description: 'Fewer bubbles, simpler consonants, and no lives. Focus on building accuracy.',
    accent: '#38bdf8',
    icon: '🫧'
  },
  {
    id: 'medium',
    title: 'Medium',
    subtitle: 'Score + lives',
    description: 'More distractors, more speed, and 3 lives to keep the pressure on.',
    accent: '#f59e0b',
    icon: '🌊'
  },
  {
    id: 'hard',
    title: 'Hard',
    subtitle: 'Score + lives',
    description: 'The biggest bubble field, fastest pace, and the full consonant set.',
    accent: '#ef4444',
    icon: '⚡'
  }
];

export default function BubbleShooterSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = location.state?.language || localStorage.getItem('userLanguage') || 'hindi';

  const startLevel = (difficulty) => {
    navigate(`/bubble-shooter/${language}/${difficulty}`, {
      state: { language, difficulty }
    });
  };

  return (
    <div className="bs-select-page">
      <div className="bs-select-bg" />
      <header className="bs-select-header">
        <button className="bs-back-btn" onClick={() => navigate('/game-hub')}>
          ← Back to Games
        </button>
        <div className="bs-select-title-wrap">
          <span className="bs-select-kicker">Bubble Shooter</span>
          <h1>Match the sound, pop the right bubble</h1>
          <p>
            The consonant audio changes every second. Shoot the correct bubble before the next sound plays.
          </p>
        </div>
        <div className="bs-lang-pill">
          {language === 'hindi' ? 'Hindi 🇮🇳' : 'Telugu 🇮🇳'}
        </div>
      </header>

      <section className="bs-rules-panel">
        <h2>Game Rules</h2>
        <ul>
          <li>Listen to the consonant sound and find the matching bubble.</li>
          <li>The sound changes every 1 second, so stay focused.</li>
          <li>Easy mode only tracks score. Medium and Hard add lives.</li>
        </ul>
      </section>

      <section className="bs-level-grid">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            className="bs-level-card"
            style={{ borderColor: level.accent }}
            onClick={() => startLevel(level.id)}
          >
            <div className="bs-level-icon" style={{ background: level.accent }}>
              {level.icon}
            </div>
            <div className="bs-level-copy">
              <div className="bs-level-topline">
                <h3>{level.title}</h3>
                <span>{level.subtitle}</span>
              </div>
              <p>{level.description}</p>
            </div>
            <span className="bs-level-arrow">→</span>
          </button>
        ))}
      </section>
    </div>
  );
}
