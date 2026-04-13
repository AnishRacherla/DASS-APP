import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Results.css';

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { score, totalQuestions, language, level, difficulty, correctAnswers, gameType, penalties, skipScoreSave } = location.state || {};
  const scoreSavedRef = useRef(false); // useRef so guard works synchronously (useState is async)

  useEffect(() => {
    if (!score && score !== 0) {
      navigate('/game-hub');
    } else {
      // Save score to database
      if (!skipScoreSave) saveScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, navigate, skipScoreSave]);

  const saveScore = async () => {
    if (scoreSavedRef.current) return; // Prevent duplicate saves (useRef is synchronous)
    scoreSavedRef.current = true; // lock immediately before any await
    
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
    } catch (error) {
      console.error('Error saving score:', error);
      scoreSavedRef.current = false; // allow retry on error
    }
  };

  if (!score && score !== 0) {
    return null;
  }

  // For balloon and mars games, show raw score. For others, use correctAnswers
  const isBaloonGame = gameType === 'balloon';
  const isMarsGame = gameType === 'mars';
  const isWhackGame = gameType === 'whack';
  const isBubbleShooterGame = gameType === 'bubble-shooter';
  const isWordSortingGame = gameType === 'word-sorting-basket';
  
  // For balloon: score is points, correctAnswers is number of correct balloons, totalQuestions is total taps
  // For mars/quiz: correctAnswers is correct count, totalQuestions is total questions
  const displayScore = (isBaloonGame || isMarsGame || isWhackGame || isBubbleShooterGame || isWordSortingGame)
    ? score
    : (correctAnswers !== undefined ? correctAnswers : score);
  
  // For balloon game, don't calculate percentage based on taps, just show if they got points
  const correctCount = correctAnswers !== undefined ? correctAnswers : score;
  const totalQuestionsValue = totalQuestions || correctCount || 1; // always use actual totalQuestions
  const whackPenaltyCount = penalties || 0;
  const whackPassed = whackPenaltyCount === 0 && score >= 10;
  const bubbleWrongHits = penalties || 0;
  
  // Calculate percentage based on correct answers vs total questions
  const percentage = (isWhackGame || isBubbleShooterGame || isWordSortingGame)
    ? (totalQuestionsValue > 0 ? ((correctCount / totalQuestionsValue) * 100) : 0)
    : totalQuestionsValue > 0
      ? ((correctCount / totalQuestionsValue) * 100)
      : (displayScore > 0 ? 100 : 0);
    
  const passed = isWhackGame ? whackPassed : (correctCount >= Math.ceil(totalQuestionsValue * 0.6));
  const stars = isWhackGame
    ? (whackPassed ? (whackPenaltyCount === 0 && score >= 30 ? 3 : 2) : 1)
    : (percentage >= 80 ? 3 : percentage >= 60 ? 2 : 1);

  const getEmoji = () => {
    if (isWhackGame && whackPassed) return '🔨';
    if (isBubbleShooterGame && score >= 30) return '🫧';
    if (isWordSortingGame && score >= 30) return '🧺';
    if (percentage === 100) return '🏆';
    if (percentage >= 80) return '🌟';
    if (percentage >= 60) return '⭐';
    if (percentage >= 40) return '💫';
    return '💪';
  };

  const getMessage = () => {
    if (isWhackGame) {
      if (whackPassed && whackPenaltyCount === 0) return 'Sharp Aim!';
      if (score > 0) return 'Nice Reflexes!';
      return 'Keep Practicing!';
    }
    if (isBubbleShooterGame) {
      if (score >= 30) return 'Bubble Master!';
      if (score > 0) return 'Nice Shooting!';
      return 'Keep Practicing!';
    }
    if (isWordSortingGame) {
      if (score >= 30) return 'Sorting Master!';
      if (score > 0) return 'Nice Sorting!';
      return 'Keep Practicing!';
    }
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
            {isBaloonGame || isMarsGame || isWhackGame || isBubbleShooterGame || isWordSortingGame ? (
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
                : isWhackGame
                  ? `${correctCount} Hits • ${whackPenaltyCount} Penalties`
                  : isBubbleShooterGame
                    ? `${correctCount} Correct Hits • ${bubbleWrongHits} Wrong Hits`
                      : isWordSortingGame
                        ? `${correctCount} Correct Placements • ${bubbleWrongHits} Wrong Drops`
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

            {/* For Bubble Shooter game */}
            {gameType === 'bubble-shooter' && (
              <>
                <button
                  className="btn btn-primary action-btn"
                  onClick={() => {
                    const replayDifficulty = difficulty || (level >= 3 ? 'hard' : level === 2 ? 'medium' : 'easy');
                    navigate(`/bubble-shooter/${language}/${replayDifficulty}`);
                  }}
                >
                  🔄 Play Again
                </button>

                <button
                  className="btn btn-secondary action-btn"
                  onClick={() => navigate('/bubble-shooter', { state: { language } })}
                >
                  🫧 Change Level
                </button>

                <button
                  className="btn btn-secondary action-btn"
                  onClick={() => navigate('/game-hub')}
                >
                  🏠 Back to Games
                </button>
              </>
            )}

            {/* For Word Sorting Basket game */}
            {gameType === 'word-sorting-basket' && (
              <>
                <button
                  className="btn btn-primary action-btn"
                  onClick={() => navigate(`/word-sorting-basket/${language}/${level || 1}`, { state: { language, level } })}
                >
                  🔄 Play Again
                </button>

                <button
                  className="btn btn-secondary action-btn"
                  onClick={() => navigate('/word-sorting-basket', { state: { language } })}
                >
                  🧺 Change Level
                </button>

                <button
                  className="btn btn-secondary action-btn"
                  onClick={() => navigate('/game-hub')}
                >
                  🏠 Back to Games
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
