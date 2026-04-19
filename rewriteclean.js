
const fs = require('fs');
const jsFile = 'C:/Users/Anish/OneDrive/Desktop/gittest/project-monorepo-team-51/frontend/src/components/Results.js';
let code = fs.readFileSync(jsFile, 'utf8');

const s1 = \  const scoreSavedRef = useRef(false); // useRef so guard works synchronously (useState is async)\;

const replaceTop = \  // Moved up for stars calculation
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

  const scoreSavedRef = useRef(false);\;

code = code.replace(s1, replaceTop);

const s2 = \      // Save score to database
      if (!skipScoreSave) saveScore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, navigate, skipScoreSave]);\;

const replace2 = \      // Save score to database
      if (!skipScoreSave) saveScore();
      
      // IMMEDIATELY Save locally so PlanetGamesScreen highlights stars correctly!
      if (typeof stars !== 'undefined') {
        import('../hooks/useGameProgress').then(({ saveStars }) => {
          saveStars(gameType || 'quiz', stars);
        }).catch(err => console.error(err));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, navigate, skipScoreSave, stars, gameType]);\;

code = code.replace(s2, replace2);

// Remove the now duplicated extraction below near getEmoji!
const s3 = code.indexOf('  // For balloon and mars games');
const e3 = code.indexOf('  const getEmoji = () => {');
code = code.substring(0, s3) + code.substring(e3);

fs.writeFileSync(jsFile, code);

