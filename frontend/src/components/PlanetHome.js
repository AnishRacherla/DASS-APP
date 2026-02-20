import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './PlanetHome.css';

export default function PlanetHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = location.state?.language || 'hindi';
  const [marsUnlocked, setMarsUnlocked] = useState(false);
  const [totalScore, setTotalScore] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    // Check if lessons are completed
    const lessonsCompleted = localStorage.getItem(`lessonsCompleted_${language}`);
    if (lessonsCompleted === 'true') {
      setMarsUnlocked(true);
    }
    
    // Fetch total score
    fetchTotalScore();
  }, [language]);

  const fetchTotalScore = async () => {
    if (!userId) return;
    
    try {
      const response = await axios.get(`http://localhost:5001/api/scores/user/${userId}/total?language=${language}`);
      setTotalScore(response.data);
    } catch (error) {
      console.error('Error fetching total score:', error);
    }
  };

  const planets = [
    {
      id: 'earth',
      name: 'Earth',
      emoji: '🌍',
      category: 'Letters',
      description: 'Learn letters and sounds',
      color: '#4ECDC4',
      unlocked: true
    },
    {
      id: 'mars',
      name: 'Mars',
      emoji: '🔴',
      category: 'Words',
      description: 'Match images with words',
      color: '#FF6B6B',
      unlocked: marsUnlocked
    }
  ];

  const handlePlanetClick = (planet) => {
    if (!planet.unlocked) {
      alert('Complete lessons from previous planet to unlock!');
      return;
    }

    if (planet.id === 'earth') {
      navigate('/game-selection', { state: { language, planet: 'earth' } });
    } else if (planet.id === 'mars') {
      navigate('/mars-games', { state: { language, planet: 'mars' } });
    }
  };

  const handleLessonsClick = () => {
    navigate('/lessons', { state: { language } });
  };

  return (
    <div className="planet-home-container">
      <div className="planet-home-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Choose Your Planet</h1>
        <div className="placeholder"></div>
      </div>

      <div className="planet-home-content">
        <h2 className="planet-home-title">Learning Journey</h2>
        <p className="planet-home-subtitle">
          Language: {language === 'hindi' ? 'Hindi 🇮🇳' : 'Telugu 🇮🇳'}
        </p>

        {/* Total Score Display */}
        {totalScore && (
          <div className="total-score-card">
            <h3>🏆 Total Score: {totalScore.totalScore} Points</h3>
            <div className="score-breakdown">
              <div className="score-item">
                <span>🎵 Audio Quiz:</span>
                <span>{totalScore.gameTypeTotals.quiz || 0} pts</span>
              </div>
              <div className="score-item">
                <span>🎈 Balloon Pop:</span>
                <span>{totalScore.gameTypeTotals.balloon || 0} pts</span>
              </div>
              <div className="score-item">
                <span>🔴 Mars Game:</span>
                <span>{totalScore.gameTypeTotals.mars || 0} pts</span>
              </div>
            </div>
            <p className="games-played">Games Played: {totalScore.gamesPlayed.total}</p>
          </div>
        )}

        <div className="planets-container">
          {planets.map((planet, index) => (
            <React.Fragment key={planet.id}>
              <div
                className={`planet-card ${!planet.unlocked ? 'locked' : ''}`}
                style={{ borderColor: planet.color }}
                onClick={() => handlePlanetClick(planet)}
              >
                <div className="planet-icon-container" style={{ backgroundColor: planet.color }}>
                  <span className="planet-icon">{planet.emoji}</span>
                </div>
                <div className="planet-info">
                  <h3 className="planet-name">{planet.name}</h3>
                  <p className="planet-category">{planet.category}</p>
                  <p className="planet-description">{planet.description}</p>
                </div>
                {!planet.unlocked && <span className="lock-icon">🔒</span>}
              </div>

              {/* Show Lessons button between Earth and Mars */}
              {index === 0 && (
                <div className="lessons-separator">
                  <div className="lessons-line"></div>
                  <button className="lessons-btn" onClick={handleLessonsClick}>
                    📚 Learn Words Before Mars
                  </button>
                  <div className="lessons-line"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
