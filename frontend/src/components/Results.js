import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Results.css';

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { score, totalQuestions, language, level, correctAnswers, gameType, penalties } = location.state || {};
  const [scoreSaved, setScoreSaved] = useState(false);

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

  // For balloon and mars games, show raw score. For others, use correctAnswers
  const isBaloonGame = gameType === 'balloon';
  const isMarsGame = gameType === 'mars';
  
  // For balloon: score is points, correctAnswers is number of correct balloons, totalQuestions is total taps
  // For mars/quiz: correctAnswers is correct count, totalQuestions is total questions
  const displayScore = (isBaloonGame || isMarsGame) ? score : (correctAnswers !== undefined ? correctAnswers : score);
  
  // For balloon game, don't calculate percentage based on taps, just show if they got points
  const correctCount = correctAnswers !== undefined ? correctAnswers : score;
  const totalQuestionsValue = (isBaloonGame || isMarsGame) ? correctCount : (totalQuestions || correctCount || 1);
  
  // Calculate percentage - for balloon/mars, assume 100% if they scored, otherwise based on correct/total
  const percentage = (isBaloonGame || isMarsGame) 
    ? (displayScore > 0 ? 100 : 0)
    : ((correctCount / totalQuestionsValue) * 100);
    
  const passed = (isBaloonGame || isMarsGame) ? (displayScore > 0) : (correctCount >= Math.ceil(totalQuestionsValue * 0.6));
  const stars = percentage >= 80 ? 3 : percentage >= 60 ? 2 : 1;

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
            {isBaloonGame || isMarsGame ? (
              <>
                <span className="score-number">{displayScore}</span>
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
              ? `${correctCount} Correct Balloons • ${totalQuestions || 0} Total Taps`
              : isMarsGame
                ? `${correctCount}/${totalQuestionsValue} Correct`
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
            {/* For WhackGame */}
            {gameType === 'whack' && (
              <>
                <button
                  className="btn btn-primary action-btn"
                  onClick={() => navigate(`/whack/${language}/${level}`)}
                >
                  🔄 Play Again
                </button>

                {passed && level < 7 && (
                  <button
                    className="btn btn-success action-btn"
                    onClick={() => navigate(`/whack/${language}/${parseInt(level) + 1}`)}
                  >
                    Next Level →
                  </button>
                )}

                <button
                  className="btn btn-secondary action-btn"
                  onClick={() => navigate('/mars-games', { state: { language } })}
                >
                  🏠 Back to Mars
                </button>
              </>
            )}

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
                  onClick={() => navigate('/mars-games', { state: { language } })}
                >
                  🏠 Back to Mars
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
