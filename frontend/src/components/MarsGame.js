import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './MarsGame.css';

export default function MarsGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, level } = location.state || {};
  
  const [game, setGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    fetchGame();
    
    return () => {
      if (audio) {
        audio.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGame = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/mars-game/${language}/${level}`);
      setGame(response.data.game);
      setLoading(false);
      
      // Auto-play audio for first question
      if (response.data.game.questions[0]) {
        playAudio(response.data.game.questions[0].audioUrl);
      }
    } catch (error) {
      console.error('Error fetching game:', error);
      alert('Could not load game');
      navigate(-1);
    }
  };

  const playAudio = (audioUrl) => {
    // Don't play if audio URL is null or empty
    if (!audioUrl) {
      return;
    }
    
    if (audio) {
      audio.pause();
    }
    
    const newAudio = new Audio(`http://localhost:5001${audioUrl}`);
    newAudio.play();
    setAudio(newAudio);
  };

  const handleImageClick = (imageIndex) => {
    if (showFeedback) return; // Prevent clicking during feedback
    
    const question = game.questions[currentQuestion];
    const isCorrect = imageIndex === question.correctImageIndex;
    
    setSelectedImage(imageIndex);
    setShowFeedback(true);
    
    let newScore = score;
    let newCorrectCount = correctCount;
    
    if (isCorrect) {
      newScore = score + 10;
      newCorrectCount = correctCount + 1;
      setScore(newScore);
      setCorrectCount(newCorrectCount);
    }
    
    // Move to next question after 1.5 seconds
    setTimeout(() => {
      if (currentQuestion < game.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedImage(null);
        setShowFeedback(false);
        
        // Play audio for next question
        playAudio(game.questions[currentQuestion + 1].audioUrl);
      } else {
        // Game over
        navigate('/results', {
          state: {
            score: newScore,
            correctAnswers: newCorrectCount,
            totalQuestions: game.questions.length,
            gameType: 'mars',
            language,
            level
          }
        });
      }
    }, 1500);
  };

  if (loading) {
    return (
      <div className="mars-game-container">
        <div className="loading-container">
          <div className="loader"></div>
          <p className="loading-text">Loading game...</p>
        </div>
      </div>
    );
  }

  const question = game.questions[currentQuestion];

  return (
    <div className="mars-game-container">
      <div className="mars-game-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Mars - Match the Word</h1>
        <div className="game-progress">
          <span>Question {currentQuestion + 1}/{game.questions.length}</span>
          <span className="score">⭐ {score}</span>
        </div>
      </div>

      <div className="mars-game-content">
        <div className="word-display">
          <h2 className="target-word">{question.word}</h2>
          {question.audioUrl && (
            <button 
              className="replay-audio-btn"
              onClick={() => playAudio(question.audioUrl)}
            >
              🔊 Replay Sound
            </button>
          )}
        </div>

        <div className={`images-grid grid-${question.images.length}`}>
          {question.images.map((image, index) => (
            <div
              key={index}
              className={`image-option ${
                selectedImage === index
                  ? index === question.correctImageIndex
                    ? 'correct'
                    : 'incorrect'
                  : ''
              } ${showFeedback && index === question.correctImageIndex ? 'show-correct' : ''}`}
              onClick={() => handleImageClick(index)}
            >
              <img src={`http://localhost:5001${image}`} alt={`Option ${index + 1}`} />
              {showFeedback && index === question.correctImageIndex && (
                <div className="correct-badge">✓</div>
              )}
              {selectedImage === index && index !== question.correctImageIndex && (
                <div className="incorrect-badge">✗</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
