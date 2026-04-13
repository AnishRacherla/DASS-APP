import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './WordSortingBasketSelection.css';

const LEVELS = [
  { id: '1', title: 'Level 1', subtitle: 'Warm-up sort', description: '4 baskets, 12 words, and clear category groups to learn the flow.', color: '#F97316' },
  { id: '2', title: 'Level 2', subtitle: 'More baskets', description: '5 baskets, 15 words, and more mixed categories to keep you moving.', color: '#22C55E' },
  { id: '3', title: 'Level 3', subtitle: 'Full challenge', description: '6 baskets, 24 words, and the full mixed set for the final test.', color: '#F59E0B' },
];

export default function WordSortingBasketSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = location.state?.language || localStorage.getItem('userLanguage') || 'hindi';

  const startGame = (level) => {
    navigate(`/word-sorting-basket/${language}/${level}`, { state: { language, level } });
  };

  return (
    <div className="wsb-select-page">
      <div className="wsb-select-bg" />

      <header className="wsb-select-header">
        <button className="wsb-back-btn" onClick={() => navigate('/game-hub')}>
          ← Back to Games
        </button>
        <div className="wsb-select-copy">
          <span className="wsb-kicker">Word Sorting Basket</span>
          <h1>Toss the word into the right basket</h1>
          <p>
            Drag each word into the matching category basket. Correct drops score points, wrong drops cost points.
          </p>
        </div>
        <div className="wsb-lang-pill">
          {language === 'hindi' ? 'Hindi 🇮🇳' : 'Telugu 🇮🇳'}
        </div>
      </header>

      <section className="wsb-rules-card">
        <h2>Game Rules</h2>
        <ul>
          <li>Words are mixed from several categories like fruits, animals, pets, vegetables, birds, and vehicles.</li>
          <li>Drag a word into the correct basket to make it disappear and earn points.</li>
          <li>If you drop it in the wrong basket, it snaps back and you lose points.</li>
        </ul>
      </section>

      <section className="wsb-level-grid">
        {LEVELS.map((level) => (
          <button key={level.id} className="wsb-level-card" style={{ borderColor: level.color }} onClick={() => startGame(level.id)}>
            <div className="wsb-level-copy">
              <div className="wsb-level-topline">
                <h3>{level.title}</h3>
                <span>{level.subtitle}</span>
              </div>
              <p>{level.description}</p>
            </div>
            <span className="wsb-level-arrow">→</span>
          </button>
        ))}
      </section>

      <section className="wsb-preview-grid">
        <div className="wsb-preview-card" style={{ borderColor: '#F97316' }}>
          <div className="wsb-preview-emoji" style={{ background: '#F97316' }}>🍎</div>
          <div>
            <h3>Fruits</h3>
            <p>One of the baskets in the sorting round.</p>
          </div>
        </div>
        <div className="wsb-preview-card" style={{ borderColor: '#22C55E' }}>
          <div className="wsb-preview-emoji" style={{ background: '#22C55E' }}>🐘</div>
          <div>
            <h3>Animals</h3>
            <p>One of the baskets in the sorting round.</p>
          </div>
        </div>
      </section>
    </div>
  );
}