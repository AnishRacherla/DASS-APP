import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Results.css';

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { score, totalQuestions, language, level } = location.state || {};

  useEffect(() => {
    if (!score && score !== 0) {
      navigate('/');
    }
  }, [score, navigate]);

  if (!score && score !== 0) {
    return null;
  }

  const percentage = (score / totalQuestions) * 100;
  const passed = score >= 3;
  const stars = score >= 4 ? 3 : score >= 2 ? 2 : 1;

  const getEmoji = () => {
    if (score === 5) return '🏆';
    if (score >= 4) return '🌟';
    if (score >= 3) return '⭐';
    if (score >= 2) return '💫';
    return '💪';
  };

  const getMessage = () => {
    if (score === 5) return 'Perfect! All Correct!';
    if (score >= 4) return 'Excellent Work!';
    if (score >= 3) return 'Great Job!';
    if (score >= 2) return 'Good Try!';
    return 'Keep Practicing!';
  };

  return (
    <div className="results-container">
      <div className="stars-container">
        {[...Array(150)].map((_, i) => (
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

      {passed && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                background: ['#FFD700', '#FF5252', '#4CAF50', '#9B5DE5', '#FFA500'][
                  Math.floor(Math.random() * 5)
                ]
              }}
            />
          ))}
        </div>
      )}

      <div className="results-content">
        <div className="results-card card">
          <div className="emoji-large">{getEmoji()}</div>

          <h1 className="results-title">
            {getMessage()}
          </h1>

          <div className="score-display-large">
            <span className="score-number">{score}</span>
            <span className="score-separator">/</span>
            <span className="score-total">{totalQuestions}</span>
          </div>

          <div className="percentage-display">
            {percentage.toFixed(0)}% Correct
          </div>

          <div className="stars-rating">
            {[...Array(3)].map((_, i) => (
              <span key={i} className={`star-icon ${i < stars ? 'filled' : ''}`}>
                ⭐
              </span>
            ))}
          </div>

          {passed && (
            <div className="success-message">
              <span className="success-icon">🎉</span>
              <span className="success-text">
                Next Level Unlocked!
              </span>
            </div>
          )}

          <div className="results-actions">
            <button
              className="btn btn-primary action-btn"
              onClick={() => navigate(`/quiz/${language}/${level}`)}
            >
              🔄 Play Again
            </button>

            {passed && (
              <button
                className="btn btn-success action-btn"
                onClick={() => navigate(`/quiz/${language}/${parseInt(level) + 1}`)}
              >
                Next Level →
              </button>
            )}

            <button
              className="btn btn-secondary action-btn"
              onClick={() => navigate(`/planets/${language}`)}
            >
              🪐 Back to Planets
            </button>

            <button
              className="btn btn-secondary action-btn"
              onClick={() => navigate('/')}
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
