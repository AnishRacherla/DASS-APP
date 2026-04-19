
const fs = require('fs');
const file = 'C:/Users/Anish/OneDrive/Desktop/gittest/project-monorepo-team-51/frontend/src/components/Results.js';
let code = fs.readFileSync(file, 'utf8');

const sIdx = code.indexOf('const scoreSavedRef = useRef');

const rep1 = \
  const isBaloonGame = gameType === 'balloon';
  const isMarsGame = gameType === 'mars';
  const isWhackGame = gameType === 'whack';
  const isBubbleShooterGame = gameType === 'bubble-shooter';
  const isWordSortingGame = gameType === 'word-sorting-basket';
  
  const displayScore = (isBaloonGame || isMarsGame || isWhackGame || isBubbleShooterGame || isWordSortingGame) ? score : (correctAnswers !== undefined ? correctAnswers : score);
  
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
\;

code = code.substring(0, sIdx) + rep1 + code.substring(code.indexOf('  useEffect(() => {', sIdx));

const anchor2Idx = code.indexOf('      if (!skipScoreSave) saveScore();');
if (anchor2Idx > -1) {
  const endToReplace = code.indexOf('  }, [score, navigate, skipScoreSave]);', anchor2Idx) + 39;
  
const rep2 = \      if (!skipScoreSave) saveScore();

      if (typeof stars !== 'undefined') {
        import('../hooks/useGameProgress').then(({ saveStars }) => {
          saveStars(gameType || 'quiz', stars);
        }).catch(err => console.error(err));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, navigate, skipScoreSave, stars, gameType]);\;
  
  code = code.substring(0, anchor2Idx) + rep2 + code.substring(endToReplace);
}

let s3 = code.indexOf('  // For balloon and mars games');
let e3 = code.indexOf('  const getEmoji = () => {');
if (s3 > -1 && e3 > -1) {
    code = code.substring(0, s3) + code.substring(e3);
}

fs.writeFileSync(file, code);

