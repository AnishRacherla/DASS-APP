import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './BalloonGame.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

export default function BalloonGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, level, gameId } = location.state || {};
  
  const [game, setGame] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [balloons, setBalloons] = useState([]);
  const [, setTargetLetter] = useState('');
  const [gameActive, setGameActive] = useState(true);
  
  const balloonIdCounter = useRef(0);
  const spawnTimerRef = useRef(null);
  const gameTimerRef = useRef(null);
  const audioTimerRef = useRef(null);
  const letterChangeTimerRef = useRef(null);
  const audioRef = useRef(null);

  // Refs to track latest values for use inside interval callbacks (avoids stale closures)
  const scoreRef = useRef(0);
  const correctAnswersRef = useRef(0);
  const totalTapsRef = useRef(0);
  const gameActiveRef = useRef(true);
  const targetLetterRef = useRef('');
  const availableLettersRef = useRef([]);
  const letterAudioMapRef = useRef({});
  const levelRef = useRef(level); // Store level for use in callbacks

  // Get level parameters for current level
  const getLevelParams = (lv) => {
    switch(lv) {
      case 3:
        return {
          targetLetterChance: 0.8,      // 80% chance target letter
          letterChangeInterval: 10000,  // Change every 10 seconds
          audioReplayInterval: 3000     // Announce every 3 seconds
        };
      case 2:
        return {
          targetLetterChance: 0.6,      // 60% chance target letter
          letterChangeInterval: 20000,  // Change every 20 seconds
          audioReplayInterval: 4000     // Announce every 4 seconds
        };
      case 1:
      default:
        return {
          targetLetterChance: 0.4,      // 40% chance target letter
          letterChangeInterval: null,   // No change (single letter for whole game)
          audioReplayInterval: 5000     // Announce every 5 seconds
        };
    }
  };

  const resolveAudioUrl = (audioUrlOrPath) => {
    if (!audioUrlOrPath) return '';
    if (audioUrlOrPath.startsWith('http://') || audioUrlOrPath.startsWith('https://')) {
      return audioUrlOrPath;
    }
    if (audioUrlOrPath.startsWith('/')) {
      return `${API_BASE}${audioUrlOrPath}`;
    }
    return `${API_BASE}/${audioUrlOrPath}`;
  };

  const buildLetterAudioMap = async () => {
    const response = await axios.get(`${API_BASE}/api/akshara/${language}/letters`);
    const rows = Array.isArray(response.data) ? response.data : [];
    const map = {};

    rows.forEach((row) => {
      if (!row?.symbol) return;
      if (row.audioUrl) {
        map[row.symbol] = resolveAudioUrl(row.audioUrl);
      } else if (row.audioFileName) {
        map[row.symbol] = `${API_BASE}/audio/${language}/${encodeURIComponent(row.audioFileName)}`;
      }
    });

    letterAudioMapRef.current = map;
  };

  const playRecordedLetterAudio = (letter) => {
    if (!letter) return;
    const audioUrl = letterAudioMapRef.current[letter];
    if (!audioUrl) {
      console.warn(`No letter audio found in DB mapping for symbol: ${letter}`);
      return;
    }
    const audio = audioRef.current || new Audio();
    audioRef.current = audio;
    audio.pause();
    audio.currentTime = 0;
    audio.src = audioUrl;
    audio.play().catch((err) => {
      console.warn('Audio playback blocked/failed:', err);
    });
  };

  useEffect(() => {
    fetchGame();
    
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, level]);

  useEffect(() => {
    if (game && !loading && gameActive) {
      startGame();
    }
    
    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (audioTimerRef.current) clearInterval(audioTimerRef.current);
      if (letterChangeTimerRef.current) clearInterval(letterChangeTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, loading]);

  const fetchGame = async () => {
    try {
      const gameEndpoint = gameId
        ? `${API_BASE}/api/balloon/id/${gameId}`
        : `${API_BASE}/api/balloon/${language}/${level}`;
      const response = await axios.get(gameEndpoint);
      const gameData = response.data.game;
      setGame(gameData);
      levelRef.current = gameData?.level || level;

      await buildLetterAudioMap();
      
      const letters = new Set();
      gameData.gameData.rounds.forEach(round => {
        round.balloons.forEach(letter => letters.add(letter));
        // Also add the targetLetter just in case
        letters.add(round.targetLetter);
      });
      const lettersArray = Array.from(letters);
      
      let initialTarget = '';
      if (lettersArray.length > 0) {
        initialTarget = lettersArray[Math.floor(Math.random() * lettersArray.length)];
        setTargetLetter(initialTarget);
        targetLetterRef.current = initialTarget;
      }
      availableLettersRef.current = lettersArray;
      
      // Play target letter audio immediately using letter-audio mapping from DB
      playRecordedLetterAudio(initialTarget);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching game:', error);
      alert('Could not load game');
      navigate(-1);
    }
  };

  const startGame = () => {
    const levelParams = getLevelParams(levelRef.current);
    
    gameTimerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Replay target letter audio at level-specific intervals
    audioTimerRef.current = setInterval(() => {
        if (gameActiveRef.current && targetLetterRef.current) {
        playRecordedLetterAudio(targetLetterRef.current);
        }
    }, levelParams.audioReplayInterval);

    // For Level 2 and 3: Add letter change timer
    if (levelParams.letterChangeInterval) {
      letterChangeTimerRef.current = setInterval(() => {
        if (gameActiveRef.current && availableLettersRef.current.length > 0) {
          const newTarget = availableLettersRef.current[
            Math.floor(Math.random() * availableLettersRef.current.length)
          ];
          targetLetterRef.current = newTarget;
          setTargetLetter(newTarget);
          // Play audio for new letter immediately
          playRecordedLetterAudio(newTarget);
        }
      }, levelParams.letterChangeInterval);
    }

    spawnTimerRef.current = setInterval(() => {
      spawnBalloon();
    }, 600);
    
    for (let i = 0; i < 8; i++) {
      setTimeout(() => spawnBalloon(), i * 200);
    }
  };

  const spawnBalloon = () => {
    const currentTarget = targetLetterRef.current;
    const currentLetters = availableLettersRef.current;
    const levelParams = getLevelParams(levelRef.current);
    
    if (!gameActiveRef.current || currentLetters.length === 0 || !currentTarget) return;
    
    setBalloons(prevBalloons => {
      const activeBalloons = prevBalloons.filter(b => !b.popped && !b.offScreen);
      
      if (activeBalloons.length >= 8) return prevBalloons;
      
      const id = balloonIdCounter.current++;
      
      let letter;
      // Use level-specific chance for target letter
      if (Math.random() < levelParams.targetLetterChance) {
        letter = currentTarget;
      } else {
        const wrongLetters = currentLetters.filter(l => l !== currentTarget);
        if (wrongLetters.length > 0) {
          letter = wrongLetters[Math.floor(Math.random() * wrongLetters.length)];
        } else {
          letter = currentLetters[Math.floor(Math.random() * currentLetters.length)];
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
    if (!gameActiveRef.current || balloon.popped) return;
    
    totalTapsRef.current += 1;
    
    setBalloons(prevBalloons =>
      prevBalloons.map(b =>
        b.id === balloon.id ? { ...b, popped: true } : b
      )
    );
    
    if (balloon.letter === targetLetterRef.current) {
      scoreRef.current += 10;
      correctAnswersRef.current += 1;
      setScore(scoreRef.current);
      setCorrectAnswers(correctAnswersRef.current);
    } else {
      scoreRef.current = Math.max(0, scoreRef.current - 5);
      setScore(scoreRef.current);
    }
    
    setTimeout(() => {
      setBalloons(prevBalloons =>
        prevBalloons.filter(b => b.id !== balloon.id)
      );
    }, 500);
  };

  const endGame = () => {
    gameActiveRef.current = false;
    setGameActive(false);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (audioTimerRef.current) clearInterval(audioTimerRef.current);
    if (letterChangeTimerRef.current) clearInterval(letterChangeTimerRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const finalScore = scoreRef.current;
    const finalCorrect = correctAnswersRef.current;
    const finalTaps = totalTapsRef.current;
    
    setTimeout(() => {
      navigate('/results', {
        state: {
          score: finalScore,
          correctAnswers: finalCorrect,
          totalQuestions: finalTaps || finalCorrect || 1,
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
          <h2 className="target-label">Listen carefully and pop the spoken letter</h2>
          <button
            type="button"
            className="speak-again-btn"
            onClick={() => playRecordedLetterAudio(targetLetterRef.current)}
          >
            Repeat Audio
          </button>
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
