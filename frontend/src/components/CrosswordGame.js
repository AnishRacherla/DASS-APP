import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CrosswordGrid from './CrosswordGrid';
import LetterBank from './CrosswordLetterBank';
import CluePanel from './CrosswordCluePanel';
import './CrosswordGame.css';

const API_BASE = 'http://localhost:5001/api/crossword';
const TOTAL_CROSSWORDS = 5;

function normalizeLanguage(language) {
  if (language === 'hindi') return 'hi';
  if (language === 'telugu') return 'te';
  if (language === 'hi' || language === 'te') return language;
  return 'hi';
}

const COMPLETE_MESSAGES = {
  hi: 'शाबाश!',
  te: 'బాగా చేశావు!',
};

const EMPTY_PUZZLE = {
  language: 'hi',
  level: 1,
  totalLevels: 5,
  grid: Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => null)),
  words: [],
  slotMap: {},
  letterBag: [],
};

function buildCountMap(letters) {
  return letters.reduce((acc, letter) => {
    acc[letter] = (acc[letter] || 0) + 1;
    return acc;
  }, {});
}

function CrosswordGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const [language] = useState(
    normalizeLanguage(location.state?.language || localStorage.getItem('userLanguage'))
  );
  const [level, setLevel] = useState(1);
  const [puzzle, setPuzzle] = useState(EMPTY_PUZZLE);
  const [totalLevels, setTotalLevels] = useState(TOTAL_CROSSWORDS);
  const [loadingPuzzle, setLoadingPuzzle] = useState(false);
  const [puzzleError, setPuzzleError] = useState('');
  const [cellState, setCellState] = useState({});
  const [selectedCell, setSelectedCell] = useState(null);
  const [completedWords, setCompletedWords] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [completionText, setCompletionText] = useState('');
  const [currentLevelCompleted, setCurrentLevelCompleted] = useState(false);
  const completedWordsRef = useRef([]);
  const [userId] = useState(
    localStorage.getItem('userId')
      || localStorage.getItem('playerId')
      || localStorage.getItem('userName')
      || localStorage.getItem('playerName')
      || 'Player'
  );

  function fetchPuzzle(activeLanguage, activeLevel) {
    setLoadingPuzzle(true);
    setPuzzleError('');

    fetch(`${API_BASE}/data/${activeLanguage}/${activeLevel}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load puzzle data.');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          setPuzzle(data.data);
          setTotalLevels(data.data.totalLevels || TOTAL_CROSSWORDS);
        } else {
          setPuzzleError(data.error || 'Puzzle data unavailable.');
        }
        setCellState({});
        setSelectedCell(null);
        setShowConfetti(false);
        setCompletionText('');
        setCurrentLevelCompleted(false);
      })
      .catch((error) => {
        setPuzzleError(error.message || 'Puzzle data unavailable.');
      })
      .finally(() => setLoadingPuzzle(false));
  }

  useEffect(() => {
    if (!userId) return;

    // Start directly at the first unfinished crossword when entering this game.
    fetch(`${API_BASE}/progress/${userId}/all?language=${language}`)
      .then((response) => response.json())
      .then((data) => {
        if (!data.success || !Array.isArray(data.data)) return;

        let startLevel = 1;
        for (let i = 1; i <= TOTAL_CROSSWORDS; i += 1) {
          const row = data.data.find((entry) => Number(entry.level) === i);
          if (!row?.completed) {
            startLevel = i;
            break;
          }
          if (i === TOTAL_CROSSWORDS) startLevel = TOTAL_CROSSWORDS;
        }
        setLevel(startLevel);
      })
      .catch((error) => {
        console.error('Error loading sequence progress:', error);
      });
  }, [userId, language]);

  useEffect(() => {
    fetchPuzzle(language, level);
  }, [language, level]);

  // Load current crossword progress (word stars) for this level.
  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE}/progress/${userId}?level=${level}&language=${language}`)
      .then((response) => response.json())
      .then((data) => {
        if (!data.success || !data.data) return;
        const savedData = data.data;
        setCompletedWords(Array.isArray(savedData.completedWords) ? savedData.completedWords : []);
        setCurrentLevelCompleted(Boolean(savedData.completed));
      })
      .catch((error) => {
        console.error('Error loading crossword state:', error);
      });
  }, [userId, level, language]);

  useEffect(() => {
    completedWordsRef.current = completedWords;
  }, [completedWords]);

  const allCells = useMemo(() => {
    const entries = [];
    puzzle.grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) entries.push(`${rowIndex}-${colIndex}`);
      });
    });
    return entries;
  }, [puzzle]);

  const bankCount = useMemo(() => buildCountMap(puzzle.letterBag), [puzzle.letterBag]);

  const usedCount = useMemo(() => {
    const counts = {};
    Object.values(cellState).forEach((cell) => {
      if (cell?.value) counts[cell.value] = (counts[cell.value] || 0) + 1;
    });
    return counts;
  }, [cellState]);

  const availableCount = useMemo(() => {
    const result = { ...bankCount };
    Object.keys(result).forEach((letter) => {
      result[letter] = Math.max(0, (bankCount[letter] || 0) - (usedCount[letter] || 0));
    });
    return result;
  }, [bankCount, usedCount]);

  const selectedCellLabel = selectedCell ? `Selected: ${selectedCell}` : 'Select a box';
  const wordsPerPuzzle = puzzle.words.length || 4;
  const starsEarned = Math.min(completedWords.length, wordsPerPuzzle);
  const solvedWordCount = new Set(completedWords).size;
  const puzzleCompleted =
    currentLevelCompleted ||
    (puzzle.words.length > 0 && solvedWordCount >= puzzle.words.length);

  function speakWord(word) {
    if (!('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'te-IN';
    utterance.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function saveProgress(nextCompletedWords, isCompleted) {
    if (!userId) return;

    fetch(`${API_BASE}/save-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        score: nextCompletedWords.length * 10,
        completed: isCompleted,
        completedWords: nextCompletedWords,
        language,
        level,
      }),
    }).catch(() => {
      // Network failure is intentionally ignored
    });
  }

  function handleCellClick(key) {
    setSelectedCell(key);
  }

  function checkWordCompletion(slotId, nextState) {
    const currentCompletedWords = completedWordsRef.current;
    if (currentCompletedWords.includes(slotId)) return;

    const word = puzzle.words.find((entry) => entry.id === slotId);
    if (!word) return;

    const allCorrect = word.cells.every((key) => {
      const cell = nextState[key];
      return cell && cell.value === cell.answer;
    });

    if (allCorrect) {
      const nextCompletedWords = [...currentCompletedWords, slotId];

      completedWordsRef.current = nextCompletedWords;

      setCompletedWords(nextCompletedWords);
      speakWord(word.answerWord);

      const isCompleted = nextCompletedWords.length === puzzle.words.length;
      saveProgress(nextCompletedWords, isCompleted);

      if (isCompleted) {
        setCurrentLevelCompleted(true);
        setShowConfetti(true);
        setCompletionText(COMPLETE_MESSAGES[language]);
      }
    }
  }

  function handleLetterPick(letter) {
    if (!selectedCell) return;
    if (!allCells.includes(selectedCell)) return;

    if ((availableCount[letter] || 0) <= 0) return;

    const target = puzzle.grid
      .flatMap((row, rowIndex) => row.map((cell, colIndex) => ({ rowIndex, colIndex, cell })))
      .find(({ rowIndex, colIndex }) => `${rowIndex}-${colIndex}` === selectedCell);

    if (!target || !target.cell) return;

    const { answer } = target.cell;
    const isCorrect = letter === answer;

    const nextState = {
      ...cellState,
      [selectedCell]: {
        answer,
        value: letter,
        status: isCorrect ? 'correct' : 'wrong',
        shake: isCorrect ? 0 : Date.now(),
      },
    };

    setCellState(nextState);

    if (!isCorrect) {
      window.setTimeout(() => {
        setCellState((prev) => {
          const current = prev[selectedCell];
          if (!current || current.value !== letter || current.status !== 'wrong') {
            return prev;
          }
          return {
            ...prev,
            [selectedCell]: {
              answer: current.answer,
              value: '',
              status: 'idle',
            },
          };
        });
      }, 500);
      return;
    }

    const slotIds = puzzle.slotMap[selectedCell] || [];
    slotIds.forEach((slotId) => checkWordCompletion(slotId, nextState));
  }

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 24 }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.5}s`,
        duration: `${1.5 + Math.random() * 1.5}s`,
      })),
    []
  );

  const handleBack = () => {
    navigate('/game-hub');
  };

  const handlePreviousCrossword = () => {
    if (level > 1) {
      setLevel(level - 1);
      setShowConfetti(false);
      setCompletionText('');
      setCompletedWords([]);
      setCurrentLevelCompleted(false);
    }
  };

  const handleNextCrossword = () => {
    if (level < totalLevels) {
      setLevel(level + 1);
      setShowConfetti(false);
      setCompletionText('');
      setCompletedWords([]);
      setCurrentLevelCompleted(false);
    }
  };

  return (
    <div className="crossword-page">
      <header className="crossword-top-bar">
        <div className="crossword-header-left">
          <button className="back-btn" onClick={handleBack}>← Back</button>
          <h2>Kids Crossword</h2>
        </div>
      </header>

      <section className="crossword-stars-panel">
        <div className="crossword-stars-header">
          <p><strong>Puzzle {level} / {totalLevels}</strong></p>
          <p><strong>{selectedCellLabel}</strong></p>
        </div>
        {level > 1 && (
          <div className="crossword-stars-nav">
            <button className="prev-level-btn" onClick={handlePreviousCrossword}>
              ← Previous Crossword
            </button>
            {level < totalLevels && puzzleCompleted && (
              <button className="next-nav-btn" onClick={handleNextCrossword}>
                Next Crossword →
              </button>
            )}
          </div>
        )}
        {level === 1 && level < totalLevels && puzzleCompleted && (
          <div className="crossword-stars-nav">
            <button className="next-nav-btn" onClick={handleNextCrossword}>
              Next Crossword →
            </button>
          </div>
        )}
        <div className="crossword-stars-row" aria-label="word completion stars">
          {Array.from({ length: wordsPerPuzzle }).map((_, index) => (
            <span
              key={`star-${index}`}
              className={`word-star ${index < starsEarned ? 'earned' : ''}`}
            >
              {index < starsEarned ? '★' : '☆'}
            </span>
          ))}
        </div>
      </section>

      {loadingPuzzle && <p className="loading-msg">Loading puzzle...</p>}
      {puzzleError && <p className="error-msg">{puzzleError}</p>}

      <main className="crossword-game-layout">
        <CluePanel clues={puzzle.words} completedWords={completedWords} language={language} />

        <CrosswordGrid
          grid={puzzle.grid}
          cellState={cellState}
          selectedCell={selectedCell}
          onCellClick={handleCellClick}
        />

        <LetterBank
          letters={puzzle.letterBag}
          availableCount={availableCount}
          onPick={handleLetterPick}
        />
      </main>

      {showConfetti && (
        <>
          <div className="confetti-area">
            {confettiPieces.map((piece) => (
              <span
                key={piece.id}
                className="confetti"
                style={{
                  left: piece.left,
                  animationDelay: piece.delay,
                  animationDuration: piece.duration,
                }}
              />
            ))}
          </div>
          <div className="complete-banner">
            <div>{completionText}</div>
            {level === totalLevels && (
              <button className="finish-btn" onClick={handleBack}>
                Finish Game
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CrosswordGame;
