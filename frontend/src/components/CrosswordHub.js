import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './CrosswordHub.css';

function normalizeLanguage(language) {
  if (language === 'hindi') return 'hi';
  if (language === 'telugu') return 'te';
  if (language === 'hi' || language === 'te') return language;
  return 'hi';
}

const API_BASE_URL = 'http://localhost:5001';

function CrosswordHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = normalizeLanguage(location.state?.language);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState({});
  const [userId] = useState('Player');

  const levels = [1, 2, 3, 4, 5];

  // Fetch user's progress for all levels - re-fetch every time user navigates back to this page
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/crossword/progress/${userId}/all`
        );

        if (response.data.success) {
          const progressMap = {};
          response.data.data.forEach((levelData) => {
            progressMap[levelData.level] = levelData;
          });
          setLevelProgress(progressMap);

          // Auto-select the first incomplete level
          let firstIncomplete = 1;
          for (let i = 1; i <= 5; i++) {
            if (!progressMap[i]?.completed) {
              firstIncomplete = i;
              break;
            }
          }
          setSelectedLevel(firstIncomplete);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();
  }, [userId, location.key]);

  // Determine which level is playable (first incomplete level)
  const getFirstIncompleteLevel = () => {
    for (let i = 1; i <= 5; i++) {
      if (!levelProgress[i]?.completed) {
        return i;
      }
    }
    return 5; // All completed, return last level
  };

  const firstPlayableLevel = getFirstIncompleteLevel();

  const handleLevelSelect = (level) => {
    // Only allow selecting levels that are unlocked
    if (level <= firstPlayableLevel) {
      setSelectedLevel(level);
    }
  };

  const handleStartGame = () => {
    // Only allow starting on the selected level if it's unlocked
    if (selectedLevel <= firstPlayableLevel) {
      navigate('/crossword-game', {
        state: { language, level: selectedLevel },
      });
    }
  };

  const handleBack = () => {
    navigate('/game-hub');
  };

  const levelDescriptions = {
    1: 'Fruit, Home, Water, Cat - Start your puzzle adventure!',
    2: 'Tea, Milk, Lotus, Roti - Learning new words!',
    3: 'Boat, Hand, Leg, Nose - Body parts fun!',
    4: 'Ear, Eye, Fire, Cloud - More vocabulary!',
    5: 'Cap, Ball, Banana, Flower - Master the puzzles!',
  };

  return (
    <div className="crossword-hub">
      <header className="crossword-hub-header">
        <button className="back-btn" onClick={handleBack}>← Back</button>
        <h1>Kids Crossword 🎮</h1>
      </header>

      <main className="crossword-hub-content">
        <section className="level-selector">
          <h2>Select Your Level</h2>
          <div className="levels-grid">
            {levels.map((level) => {
              const progress = levelProgress[level] || {};
              const isCompleted = progress.completed;
              const isLocked = level > firstPlayableLevel;
              
              return (
                <button
                  key={level}
                  className={`level-btn ${selectedLevel === level ? 'selected' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                  onClick={() => handleLevelSelect(level)}
                  disabled={isLocked}
                  title={isLocked ? 'Complete previous levels to unlock' : ''}
                >
                  <div className="level-number">{level}</div>
                  {isLocked ? (
                    <span className="lock-icon">🔒</span>
                  ) : isCompleted ? (
                    <span className="star-icon gold">⭐</span>
                  ) : (
                    <span className="star-icon">☆</span>
                  )}
                  {progress.score > 0 && (
                    <div className="level-score">{progress.score} pts</div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="level-description">
            <h3>Level {selectedLevel}</h3>
            {selectedLevel > firstPlayableLevel ? (
              <p style={{ color: '#ff6b35', fontWeight: 600 }}>
                🔒 Complete Level {selectedLevel - 1} to unlock this level!
              </p>
            ) : (
              <>
                <p>{levelDescriptions[selectedLevel]}</p>
                {levelProgress[selectedLevel] && levelProgress[selectedLevel].score > 0 && (
                  <p className="progress-text">
                    Score: {levelProgress[selectedLevel].score} | 
                    Words Completed: {levelProgress[selectedLevel].completedWords?.length || 0}/4
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <div className="crossword-hub-footer">
        <button 
          className={`play-btn ${selectedLevel > firstPlayableLevel ? 'disabled' : ''}`}
          onClick={handleStartGame}
          disabled={selectedLevel > firstPlayableLevel}
        >
          {selectedLevel > firstPlayableLevel ? '🔒 Locked' : 'Start Game 🎯'}
        </button>
      </div>
    </div>
  );
}

export default CrosswordHub;
