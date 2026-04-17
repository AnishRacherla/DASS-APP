
const fs = require('fs');
const jsFile = 'C:/Users/Anish/OneDrive/Desktop/gittest/project-monorepo-team-51/frontend/src/components/Results.js';
let jsCode = fs.readFileSync(jsFile, 'utf8');

const replacement = \  // Moved up so we can use stars in useEffect
  const isBaloonGame = gameType === 'balloon';
  const isMarsGame = gameType === 'mars';
  const isWhackGame = gameType === 'whack';
  const isBubbleShooterGame = gameType === 'bubble-shooter';
  const isWordSortingGame = gameType === 'word-sorting-basket';
  
  const displayScore = (isBaloonGame || isMarsGame || isWhackGame || isBubbleShooterGame || isWordSortingGame)
    ? score
    : (correctAnswers !== undefined ? correctAnswers : score);
  
  const correctCount = correctAnswers !== undefined ? correctAnswers : score;
  const totalQuestionsValue = totalQuestions || correctCount || 1;
  const whackPenaltyCount = penalties || 0;
  const whackPassed = whackPenaltyCount === 0 && score >= 10;
  const bubbleWrongHits = penalties || 0;
  
  const percentage = (isWhackGame || isBubbleShooterGame || isWordSortingGame)
    ? (totalQuestionsValue > 0 ? ((correctCount / totalQuestionsValue) * 100) : 0)
    : totalQuestionsValue > 0
      ? ((correctCount / totalQuestionsValue) * 100)
      : (displayScore > 0 ? 100 : 0);
    
  const passed = isWhackGame ? whackPassed : (correctCount >= Math.ceil(totalQuestionsValue * 0.6));
  const stars = isWhackGame
    ? (whackPassed ? (whackPenaltyCount === 0 && score >= 30 ? 3 : 2) : 1)
    : (percentage >= 80 ? 3 : percentage >= 60 ? 2 : 1);

  const scoreSavedRef = useRef(false);

  useEffect(() => {
    if (!score && score !== 0) {
      navigate('/game-hub');
    } else {
      // Save score to database
      if (!skipScoreSave) saveScore();
      
      // Immediately register the stars to localStorage so PlanetGamesScreen highlights them correctly!
      import('../hooks/useGameProgress').then(({ saveStars }) => {
        saveStars(gameType || 'quiz', stars);
      }).catch(err => console.error('Failed to import saveStars:', err));
    }
  }, [score, navigate, skipScoreSave, stars, gameType]);

  const saveScore = async () => {
    if (scoreSavedRef.current) return;
    scoreSavedRef.current = true;
    
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
      scoreSavedRef.current = false;
    }
  };

  if (!score && score !== 0) {
    return null;
  }
\;

let startIdx = jsCode.indexOf('  const scoreSavedRef = useRef(false);');
let endIdx = jsCode.indexOf('  const getEmoji = () => {');

jsCode = jsCode.substring(0, startIdx) + replacement + '\n' + jsCode.substring(endIdx);
fs.writeFileSync(jsFile, jsCode);

