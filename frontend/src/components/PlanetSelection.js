import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PlanetSelection.css';

const PlanetSelection = () => {
  const { language } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, userId]);

  const fetchData = async () => {
    try {
      // Fetch all quizzes for this language
      const quizzesResponse = await axios.get(`http://localhost:5001/api/quizzes/${language}`);
      setQuizzes(quizzesResponse.data.quizzes);

      // Fetch user progress
      if (userId) {
        const progressResponse = await axios.get(`http://localhost:5001/api/progress/${userId}`);
        setProgress(progressResponse.data.progress);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handlePlanetClick = (level) => {
    if (progress && level <= progress.currentLevel) {
      navigate(`/quiz/${language}/${level}`);
    }
  };

  const isPlanetUnlocked = (level) => {
    return progress && level <= progress.currentLevel;
  };

  if (loading) {
    return (
      <div className="planet-selection loading">
        <div className="loading-spinner">🌍 Loading Planets...</div>
      </div>
    );
  }

  return (
    <div className="planet-selection">
      <div className="stars-container">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className={`star ${['small', 'medium', 'large'][Math.floor(Math.random() * 3)]}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="planet-header">
        <button className="btn btn-secondary back-home-btn" onClick={() => navigate('/game-hub')}>
          ← Home
        </button>
        <div className="user-info">
          <span className="welcome-text">
            Welcome, {userName}! 👋
          </span>
          <span className="score-info">
            🏆 Total Score: {progress?.totalScore || 0}
          </span>
        </div>
      </div>

      <h1 className="planets-title">
        Choose Your World 🗺️
        <br />
        <span className="title-subtitle">Select a level to start learning</span>
      </h1>

      <div className="planets-grid">
        {quizzes.map((quiz, index) => {
          const unlocked = isPlanetUnlocked(quiz.level);
          const planetEmojis = ['�', '�️', '⛰️'];
          
          return (
            <div
              key={quiz._id}
              className={`planet-card ${unlocked ? 'unlocked' : 'locked'}`}
              onClick={() => handlePlanetClick(quiz.level)}
            >
              <div className="planet-emoji">
                {planetEmojis[index % planetEmojis.length]}
              </div>
              <div className="planet-info">
                <h3 className="planet-name">{quiz.planetName}</h3>
                <p className="planet-level">Level {quiz.level}</p>
                <p className="planet-questions">{quiz.questions.length} Questions</p>
              </div>
              {!unlocked && (
                <div className="lock-overlay">
                  <span className="lock-icon">🔒</span>
                  <span className="lock-text">Locked</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="progress-info card">
        <h3>📊 Your Progress</h3>
        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-label">Quizzes Completed</span>
            <span className="stat-value">{progress?.quizzesCompleted || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Current Level</span>
            <span className="stat-value">{progress?.currentLevel || 1}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Score</span>
            <span className="stat-value">{progress?.totalScore || 0}</span>
          </div>
        </div>
      </div>

      {/* ── Other Games ── */}
      <div className="other-games-section">
        <h2 className="other-games-title">🎮 Other Games</h2>
        <div
          className="other-game-card whack-card"
          onClick={() => navigate(`/whack/${language}`)}
        >
          <span className="other-game-icon">🔨</span>
          <div className="other-game-info">
            <h3 className="other-game-name">Whack-a-Letter</h3>
            <p className="other-game-desc">Tap the tiles that show the target letter!</p>
          </div>
          <span className="other-game-arrow">→</span>
        </div>
      </div>
    </div>
  );
};

export default PlanetSelection;
