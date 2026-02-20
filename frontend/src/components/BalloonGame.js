import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './BalloonGame.css';

export default function BalloonGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, level } = location.state || {};
  
  const [game, setGame] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [balloons, setBalloons] = useState([]);
  const [targetLetter, setTargetLetter] = useState('');
  const [availableLetters, setAvailableLetters] = useState([]);
  const [gameActive, setGameActive] = useState(true);
  const [totalTaps, setTotalTaps] = useState(0);
  
  const balloonIdCounter = useRef(0);
  const spawnTimerRef = useRef(null);
  const gameTimerRef = useRef(null);

  useEffect(() => {
    fetchGame();
    
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [language, level]);

  useEffect(() => {
    if (game && !loading && gameActive) {
      startGame();
    }
    
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    };
  }, [game, loading]);

  const fetchGame = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/balloon/${language}/${level}`);
      const gameData = response.data.game;
      setGame(gameData);
      
      const letters = new Set();
      gameData.gameData.rounds.forEach(round => {
        round.balloons.forEach(letter => letters.add(letter));
      });
      const lettersArray = Array.from(letters);
      setAvailableLetters(lettersArray);
      
      if (gameData.gameData.rounds.length > 0) {
        setTargetLetter(gameData.gameData.rounds[0].targetLetter);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game:', error);
      alert('Could not load game');
      navigate(-1);
    }
  };

  const startGame = () => {
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    spawnTimerRef.current = setInterval(() => {
      spawnBalloon();
    }, 600);
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => spawnBalloon(), i * 200);
    }
  };

  const spawnBalloon = () => {
    if (!gameActive || availableLetters.length === 0 || !targetLetter) return;
    
    setBalloons(prevBalloons => {
      const activeBalloons = prevBalloons.filter(b => !b.popped && !b.offScreen);
      
      if (activeBalloons.length >= 8) return prevBalloons;
      
      const id = balloonIdCounter.current++;
      
      let letter;
      if (Math.random() < 0.4) {
        letter = targetLetter;
      } else {
        const wrongLetters = availableLetters.filter(l => l !== targetLetter);
        if (wrongLetters.length > 0) {
          letter = wrongLetters[Math.floor(Math.random() * wrongLetters.length)];
        } else {
          letter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
        }
      }
      
      const colors = ['#FF6B6B', '#4ECDC4', '#FFD700', '#95E1D3', '#F38181', '#AA96DA'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const left = Math.random() * 85;
      
      const newBalloon = {
        id,
        letter,
        color,
        left,
        bottom: -10,
        popped: false,
        offScreen: false
      };
      
      setTimeout(() => {
        setBalloons(prev => prev.map(b => 
          b.id === id ? { ...b, offScreen: true } : b
        ));
      }, 8000);
      
      return [...prevBalloons, newBalloon];
    });
  };

  const handleBalloonClick = (balloon) => {
    if (!gameActive || balloon.popped) return;
    
    setTotalTaps(prev => prev + 1);
    
    setBalloons(prevBalloons =>
      prevBalloons.map(b =>
        b.id === balloon.id ? { ...b, popped: true } : b
      )
    );
    
    if (balloon.letter === targetLetter) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
    } else {
      setScore(prev => Math.max(0, prev - 5));
    }
    
    setTimeout(() => {
      setBalloons(prevBalloons =>
        prevBalloons.filter(b => b.id !== balloon.id)
      );
    }, 500);
  };

  const endGame = () => {
    setGameActive(false);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    
    setTimeout(() => {
      navigate('/results', {
        state: {
          score,
          correctAnswers,
          totalQuestions: totalTaps || correctAnswers || 1, // Use totalTaps, fallback to correctAnswers
          gameType: 'balloon',
          language,
          level
        }
      });
    }, 1000);
  };

  if (loading) {
    return (
      <div className="balloon-game-container">
        <div className="loading-container">
          <div className="loader"></div>
          <p className="loading-text">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="balloon-game-container">
      <div className="balloon-game-header">
        <div className="game-stats">
          <span className="stat">⏱ {timeLeft}s</span>
          <span className="stat">⭐ {score}</span>
          <span className="stat">✓ {correctAnswers}</span>
        </div>
      </div>

      <div className="balloon-game-content">
        <div className="target-letter-box">
          <h2 className="target-label">Pop balloons with:</h2>
          <div className="target-letter">{targetLetter}</div>
        </div>

        <div className="balloons-area">
          {balloons.map((balloon) => (
            <div
              key={balloon.id}
              className={`balloon ${balloon.popped ? 'popped' : ''}`}
              style={{
                left: `${balloon.left}%`,
                backgroundColor: balloon.color,
                animation: balloon.popped ? 'pop 0.3s ease-out' : 'float 8s ease-in-out'
              }}
              onClick={() => handleBalloonClick(balloon)}
            >
              <span className="balloon-letter">{balloon.letter}</span>
              <div className="balloon-string"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
