import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Results.css';

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { score, totalQuestions, language, level, gameType, penalties } = location.state || {};

  useEffect(() => {
    if (!score && score !== 0) {
      navigate('/');
    } else {
      // Save score to database
      saveScore();
    }
  }, [score, navigate]);

  const saveScore = async () => {
    if (scoreSaved) return; // Prevent duplicate saves
    
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      await axios.post('http://localhost:5001/api/scores', {
        userId,
        gameType: gameType || 'quiz',
        language,
        level: level || 1,
        score,
        correctAnswers: correctAnswers !== undefined ? correctAnswers : score,
        totalQuestions
      });
      setScoreSaved(true);
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  if (!score && score !== 0) {
    return null;
  }

  // ── Whack-a-Letter result logic ──
  if (gameType === 'whack') {
    const passed  = (penalties === 0) && score >= 10;
    const stars   = score >= 30 ? 3 : score >= 15 ? 2 : score >= 10 ? 1 : 0;
    const getEmoji = () => {
      if (passed && score >= 30) return '🏆';
      if (passed && score >= 15) return '🌟';
      if (passed)                return '⭐';
      if (penalties > 0)         return '💪';
      return '😅';
    };
    const getMessage = () => {
      if (passed && score >= 30) return 'Amazing! Perfect Session!';
      if (passed && score >= 15) return 'Excellent Work!';
      if (passed)                return 'Great Job! You Passed!';
      if (penalties > 0)         return 'Got some wrong — Try Again!';
      return 'Score more to pass!';
    };
    return (
      <div className="results-container">
        <div className="stars-container">
          {[...Array(150)].map((_, i) => (
            <div key={i} className={`star ${['small','medium','large'][Math.floor(Math.random()*3)]}`}
              style={{ left:`${Math.random()*100}%`, top:`${Math.random()*100}%`, animationDelay:`${Math.random()*3}s` }} />
          ))}
        </div>
        {passed && (
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="confetti"
                style={{ left:`${Math.random()*100}%`, animationDelay:`${Math.random()*2}s`,
                  background: ['#FFD700','#FF5252','#4CAF50','#9B5DE5','#FFA500'][Math.floor(Math.random()*5)] }} />
            ))}
          </div>
        )}
        <div className="results-content">
          <div className="results-card card">
            <div className="emoji-large">{getEmoji()}</div>
            <h1 className="results-title">{getMessage()}</h1>
            <div className="score-display-large">
              <span className="score-number" style={{ color: score < 0 ? '#FF5252' : undefined }}>{score}</span>
              <span className="score-separator"> pts</span>
            </div>
            {penalties > 0 && (
              <div className="percentage-display" style={{ color: '#FF5252' }}>
                ⚠️ {penalties} wrong tap{penalties !== 1 ? 's' : ''} (-{penalties} penalty)
              </div>
            )}
            {penalties === 0 && (
              <div className="percentage-display" style={{ color: '#4CAF50' }}>✅ No penalties!</div>
            )}
            <div className="stars-rating">
              {[...Array(3)].map((_, i) => (
                <span key={i} className={`star-icon ${i < stars ? 'filled' : ''}`}>⭐</span>
              ))}
            </div>
            {passed && (
              <div className="success-message">
                <span className="success-icon">🎉</span>
                <span className="success-text">Next Level Unlocked!</span>
              </div>
            )}
            <div className="results-actions">
              <button className="btn btn-primary action-btn"
                onClick={() => navigate(`/whack/${language}/${level}`)}>🔄 Play Again</button>
              {passed && (
                <button className="btn btn-success action-btn"
                  onClick={() => navigate(`/whack/${language}/${parseInt(level)+1}`)}>Next Level →</button>
              )}
              <button className="btn btn-secondary action-btn"
                onClick={() => navigate(`/whack/${language}`)}>🔨 All Levels</button>
              <button className="btn btn-secondary action-btn"
                onClick={() => navigate(`/planets/${language}`)}>🪐 Back to Planets</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Original quiz result logic ──
  const percentage = (score / totalQuestions) * 100;
  const passed = score >= 3;
  const stars = score >= 4 ? 3 : score >= 2 ? 2 : 1;

  const getEmoji = () => {
    if (percentage === 100) return '🏆';
    if (percentage >= 80) return '🌟';
    if (percentage >= 60) return '⭐';
    if (percentage >= 40) return '💫';
    return '💪';
  };

  const getMessage = () => {
    if (percentage === 100) return 'Perfect! All Correct!';
    if (percentage >= 80) return 'Excellent Work!';
    if (percentage >= 60) return 'Great Job!';
    if (percentage >= 40) return 'Good Try!';
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
            {isBaloonGame ? (
              <>
                <span className="score-number">{score}</span>
                <span className="score-separator"> Points</span>
              </>
            ) : (
              <>
                <span className="score-number">{correctCount}</span>
                <span className="score-separator">/</span>
                <span className="score-total">{totalQuestionsValue}</span>
              </>
            )}
          </div>

          <div className="percentage-display">
            {isBaloonGame 
              ? `${correctAnswers || 0}/${totalQuestionsValue} Correct (${isNaN(percentage) ? '0' : percentage.toFixed(0)}%)`
              : `${isNaN(percentage) ? '0' : percentage.toFixed(0)}% Correct`
            }
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
            {/* For Mars game */}
            {gameType === 'mars' && (
              <>
                <button
                  className="btn btn-primary action-btn"
                  onClick={() => navigate(`/mars-game`, { state: { language, level } })}
                >
                  🔄 Play Again
                </button>

                {passed && level < 2 && (
                  <button
                    className="btn btn-success action-btn"
                    onClick={() => navigate(`/mars-game`, { state: { language, level: parseInt(level) + 1 } })}
                  >
                    Next Level →
                  </button>
                )}

                <button
                  className="btn btn-secondary action-btn"
                  onClick={() => navigate('/planet-home', { state: { language } })}
                >
                  🏠 Back to Home
                </button>
              </>
            )}

            {/* For Balloon game */}
            {gameType === 'balloon' && (
              <>
                <button
                  className="btn btn-primary action-btn"
                  onClick={() => navigate('/balloon-selection', { state: { language } })}
                >
                  🔄 Play Again
                </button>

                <button
                  className="btn btn-secondary action-btn"
                  onClick={() => navigate('/planet-home', { state: { language } })}
                >
                  🏠 Back to Home
                </button>
              </>
            )}

            {/* For Quiz game */}
            {!gameType && (
              <>
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
                  onClick={() => navigate('/planet-home', { state: { language } })}
                >
                  🏠 Back to Home
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
