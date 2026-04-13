import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ScrambledSentenceGame.css';

const API_BASE = 'http://localhost:5001';
const CORRECT_POINTS = 10;
const WRONG_POINTS = -5;
const TOTAL_SENTENCES = 5;

export default function ScrambledSentenceGame() {
  const navigate = useNavigate();
  const { language: routeLanguage, level: routeLevel } = useParams();
  const language = routeLanguage || 'hindi';
  const level = String(routeLevel || '1');

  const [gameData, setGameData] = useState(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [words, setWords] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gameFinished, setGameFinished] = useState(false);
  const [draggedWord, setDraggedWord] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const boardRef = useRef(null);
  const answerZoneRef = useRef(null);

  // Fetch game data
  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/scrambled-sentences/play`, {
          params: { language, level }
        });
        
        setGameData(response.data);
      } catch (error) {
        console.error('Error fetching game:', error);
        alert('Failed to load game. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [language, level]);

  useEffect(() => {
    if (!gameData || !gameData.sentences || gameData.sentences.length === 0 || loading) {
      return;
    }

    setCurrentSentenceIndex(0);
    initializeSentence(gameData.sentences[0]);
  }, [gameData, loading]);


  const initializeSentence = (sentenceData) => {
    // Get all words from original sentence and shuffle them
    const originalSentence = sentenceData.originalSentence;
    const wordList = originalSentence.split(' ');
    
    // Create shuffled version
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);
    
    // Create word items with random floating positions
    const boardWidth = boardRef.current?.clientWidth || 900;
    const boardHeight = boardRef.current?.clientHeight || 420;
    const wordsWithPositions = shuffled.map((text, idx) => ({
      id: idx,
      text: text,
      x: Math.random() * Math.max(boardWidth - 120, 120),
      y: Math.random() * Math.max(boardHeight - 180, 120),
    }));
    
    console.log('Sentence Data:', sentenceData);
    console.log('Words initialized:', wordsWithPositions);
    
    setWords(wordsWithPositions);
    setSelectedOrder([]);
    setFeedback(null);
  };
  const handleMouseDown = (e, wordItem) => {
    // Don't drag if already selected
    if (selectedOrder.some(item => item.id === wordItem.id)) {
      return;
    }
    
    setDraggedWord(wordItem);
    const rect = boardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - (wordItem.x || 0);
    const offsetY = e.clientY - rect.top - (wordItem.y || 0);
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseMove = useCallback((e) => {
    if (!draggedWord || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 80));
    const newY = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 40));

    setWords(prevWords =>
      prevWords.map(w =>
        w.id === draggedWord.id
          ? { ...w, x: newX, y: newY }
          : w
      )
    );
  }, [draggedWord, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (!draggedWord || !answerZoneRef.current) return;

    const answerRect = answerZoneRef.current.getBoundingClientRect();
    const draggedRect = {
      x: draggedWord.x,
      y: draggedWord.y,
      width: 80,
      height: 40
    };

    // Check if word is dropped in answer zone
    const isInAnswerZone = 
      draggedRect.x < answerRect.right &&
      draggedRect.x + draggedRect.width > answerRect.left &&
      draggedRect.y < answerRect.bottom &&
      draggedRect.y + draggedRect.height > answerRect.top;

    if (isInAnswerZone && !selectedOrder.some(item => item.id === draggedWord.id)) {
      // Add to selected order
      setSelectedOrder([...selectedOrder, draggedWord]);
      // Remove from floating words
      setWords(prevWords => prevWords.filter(w => w.id !== draggedWord.id));
    }

    setDraggedWord(null);
  }, [draggedWord, selectedOrder]);

  useEffect(() => {
    if (draggedWord) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedWord, handleMouseMove, handleMouseUp]);

  const handleRemoveFromAnswer = (wordId) => {
    const wordToRemove = selectedOrder.find(w => w.id === wordId);
    if (wordToRemove) {
      // Add back to floating words at random position
      const newWord = {
        ...wordToRemove,
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * 300
      };
      setWords([...words, newWord]);
      setSelectedOrder(selectedOrder.filter(w => w.id !== wordId));
    }
  };

    
  const checkAnswer = () => {
    if (selectedOrder.length === 0) {
      setFeedback({ 
        isCorrect: false, 
        message: language === 'hindi' ? 'कृपया शब्द चुनें' : language === 'telugu' ? 'దయచేసి పదాలు ఎంచుకోండి' : 'Please select words' 
      });
      return;
    }

    const currentSentence = gameData.sentences[currentSentenceIndex];
    const userAnswer = selectedOrder.map(item => item.text).join(' ');
    const correctAnswer = currentSentence.originalSentence;
    
    console.log('User answer:', userAnswer);
    console.log('Correct answer:', correctAnswer);
    console.log('Match:', userAnswer === correctAnswer);

    const isCorrect = userAnswer === correctAnswer;
    if (isCorrect) {
      const newScore = score + CORRECT_POINTS;
      setScore(newScore);
      setFeedback({ 
        isCorrect: true, 
        message: language === 'hindi' ? '✓ सही है!' : language === 'telugu' ? '✓ సరైనది!' : '✓ Correct!' 
      });
      
      // Auto move to next after 1 second
      setTimeout(() => {
        handleNext();
      }, 1000);
    } else {
      const newScore = Math.max(0, score + WRONG_POINTS);
      setScore(newScore);
      setFeedback({ 
        isCorrect: false, 
        message: language === 'hindi' 
          ? `✗ गलत! सही: ${correctAnswer}` 
          : language === 'telugu'
          ? `✗ తప్పుగా! సరైనది: ${correctAnswer}`
          : `✗ Wrong! Correct: ${correctAnswer}` 
      });
    }
  };

  const handleNext = () => {
    const nextIndex = currentSentenceIndex + 1;
    
    if (nextIndex < gameData.sentences.length) {
      setCurrentSentenceIndex(nextIndex);
      initializeSentence(gameData.sentences[nextIndex]);
    } else {
      setGameFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentSentenceIndex(0);
    setScore(0);
    setGameFinished(false);
    if (gameData && gameData.sentences.length > 0) {
      initializeSentence(gameData.sentences[0]);
    }
  };

  const handleReset = () => {
    setSelectedOrder([]);
    setFeedback(null);
    if (gameData && gameData.sentences.length > 0) {
      initializeSentence(gameData.sentences[currentSentenceIndex]);
    }
  };

  const showResults = () => {
    navigate('/results', {
      state: {
        score,
        totalPoints: TOTAL_SENTENCES * CORRECT_POINTS,
        gameType: 'Scrambled Sentences',
        language,
        level
      },
      replace: true
    });
  };

  if (loading) {
    return (
      <div className="scrambled-sentence-game loading">
        <div className="loader">
          {language === 'hindi' ? 'लोड हो रहा है...' : language === 'telugu' ? 'లోడ అవుతోంది...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (!gameData || gameData.sentences.length === 0) {
    return (
      <div className="scrambled-sentence-game">
        <div className="error-message">
          {language === 'hindi' ? 'खेल डेटा नहीं मिला' : language === 'telugu' ? 'గేమ్ డేటా కనుగొనబడలేదు' : 'Game data not found'}
        </div>
      </div>
    );
  }

  if (gameFinished) {
    return (
      <div className="scrambled-sentence-game">
        <div className="game-finished-screen">
          <h1>{language === 'hindi' ? '🎉 खेल पूरा!' : language === 'telugu' ? '🎉 గేమ్ పూర్తి!' : '🎉 Game Complete!'}</h1>
          
          <div className="final-score-display">
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-max">/ {TOTAL_SENTENCES * CORRECT_POINTS}</span>
            </div>
          </div>

          <div className="score-message">
            {score >= TOTAL_SENTENCES * CORRECT_POINTS * 0.8
              ? (language === 'hindi' ? '⭐ बहुत अच्छा!' : language === 'telugu' ? '⭐ అద్భుతమైనది!' : '⭐ Awesome!')
              : score >= TOTAL_SENTENCES * CORRECT_POINTS * 0.5
              ? (language === 'hindi' ? '👍 अच्छा!' : language === 'telugu' ? '👍 బాగుంది!' : '👍 Good!')
              : (language === 'hindi' ? '💪 फिर से कोशिश करें!' : language === 'telugu' ? '💪 మళ్లీ ప్రయత్నించండి!' : '💪 Try Again!')}
          </div>

          <div className="button-group-finish">
            <button className="btn btn-play-again" onClick={handleRestart}>
              {language === 'hindi' ? '🔄 फिर से खेलें' : language === 'telugu' ? '🔄 తిరిగి ఆడు' : '🔄 Play Again'}
            </button>
            <button className="btn btn-home-finish" onClick={() => navigate(-1)}>
              {language === 'hindi' ? '🏠 घर' : language === 'telugu' ? '🏠 ఇల్లు' : '🏠 Home'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentSentence = gameData.sentences[currentSentenceIndex];
  const progress = ((currentSentenceIndex) / gameData.sentences.length) * 100;
  const sentenceText = language === 'hindi' || language === 'telugu' 
    ? currentSentence.originalSentence 
    : currentSentence.originalSentence;

  return (
    <div className="scrambled-sentence-game">
      <div className="game-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← {language === 'hindi' ? 'पीछे' : language === 'telugu' ? 'వెనక్కి' : 'Back'}</button>
        <h1>{gameData.title}</h1>
        <div className="score-display">
          <span className="score-label">{language === 'hindi' ? 'स्कोर' : language === 'telugu' ? 'స్కోర్' : 'Score'}:</span>
          <span className="score-value">{score}</span>
        </div>
      </div>

      <div className="progress-container">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-text">
          {currentSentenceIndex + 1} / {TOTAL_SENTENCES}
        </div>
      </div>

      {/* Show target sentence */}
      <div className="sentence-display">
        {language === 'hindi' ? 'सही वाक्य:' : language === 'telugu' ? 'సరైన వాక్యం:' : 'Target Sentence:'} <strong>{sentenceText}</strong>
      </div>

      {/* Main game board */}
      <div className="game-board" ref={boardRef}>

        {/* Floating words area */}
        <div className="words-floating-area" style={{ position: 'relative', overflow: 'hidden' }}>
          {words.length === 0 && (
            <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              {language === 'hindi' ? 'सभी शब्दों को खींचा गया' : language === 'telugu' ? 'అన్ని పదాలు లాగబడ్డాయి' : 'All words dragged away'}
            </div>
          )}
          {words.map((word) => {
            const isDragging = draggedWord?.id === word.id;
            
            return (
              <div
                key={`word-${word.id}`}
                className={`floating-word ${isDragging ? 'dragging' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${Math.max(0, Math.min(word.x, boardRef.current?.clientWidth - 100 || window.innerWidth - 100))}px`,
                  top: `${Math.max(0, Math.min(word.y, 350))}px`,
                  cursor: draggedWord?.id === word.id ? 'grabbing' : 'grab',
                  zIndex: isDragging ? 1000 : 10,
                  transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                  transition: isDragging ? 'none' : 'all 0.2s ease',
                }}
                onMouseDown={(e) => handleMouseDown(e, word)}
              >
                <div className="word-bubble">{word.text}</div>
              </div>
            );
          })}
        </div>
        {/* Answer/Collection zone at bottom */}
        <div className="answer-zone" ref={answerZoneRef}>
          <div className="answer-label">
            {language === 'hindi' ? '📝 शब्दों को यहाँ एकत्रित करें' : language === 'telugu' ? '📝 పదాలను ఇక్కడ సేకరించండి' : '📝 Collect words here'}
          </div>
          <div className="answer-words">
            {selectedOrder.length === 0 ? (
              <div className="answer-placeholder" style={{ color: '#999' }}>
                {language === 'hindi' ? '↓ शब्दों को खींचकर यहाँ रखें' : language === 'telugu' ? '↓ పదాలను ఇక్కడ లాగండి' : '↓ Drag words here'}
              </div>
            ) : (
              selectedOrder.map((word, idx) => (
                <div
                  key={`answer-${word.id}`}
                  className="answer-word"
                  onClick={() => handleRemoveFromAnswer(word.id)}
                >
                  <span className="word-text">{word.text}</span>
                  <span className="word-order">{idx + 1}</span>
                  <span className="remove-hint">×</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Feedback message */}
      {feedback && (
        <div className={`feedback-message ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
          {feedback.message}
        </div>
      )}

      {/* Control buttons */}
      <div className="button-group">
        <button 
          className="btn btn-reset" 
          onClick={handleReset}
        >
          {language === 'hindi' ? '🔄 रीसेट' : language === 'telugu' ? '🔄 రీసెట్' : '🔄 Reset'}
        </button>
        <button 
          className="btn btn-check" 
          onClick={checkAnswer}
          disabled={selectedOrder.length === 0}
        >
          {language === 'hindi' ? '✓ जांचें' : language === 'telugu' ? '✓ తనిఖీ చేయండి' : '✓ Check'}
        </button>
      </div>
    </div>
  );
}
