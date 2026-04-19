import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import './FillStoryGame.css';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const UI_TEXT = {
  hindi: {
    fillBlanks: 'खाली जगह भरो!',
    tapBlank: 'नीचे दी गई जगह पर टैप करो',
    chooseWord: 'सही शब्द चुनो:',
    correct: 'सही! 🎉',
    wrong: 'फिर कोशिश करो! 😊',
    storyComplete: 'कहानी पूरी हुई!',
    hearStory: '🔊 कहानी सुनो',
    nextStory: 'अगली कहानी →',
    backToHub: '← वापस',
    score: 'अंक',
    hint: '💡 संकेत',
    loading: 'लोड हो रहा है...',
    greatJob: 'शाबाश! 🌟',
    playAgain: 'फिर से खेलो',
    readAloud: '📖 पढ़ो'
  },
  telugu: {
    fillBlanks: 'ఖాళీలు నింపండి!',
    tapBlank: 'కింద ఉన్న ఖాళీని నొక్కండి',
    chooseWord: 'సరైన పదం ఎంచుకోండి:',
    correct: 'సరిగ్గా! 🎉',
    wrong: 'మళ్ళీ ప్రయత్నించండి! 😊',
    storyComplete: 'కథ పూర్తయింది!',
    hearStory: '🔊 కథ వినండి',
    nextStory: 'తర్వాత కథ →',
    backToHub: '← వెనక్కి',
    score: 'స్కోర్',
    hint: '💡 సూచన',
    loading: 'లోడ్ అవుతోంది...',
    greatJob: 'భలే! 🌟',
    playAgain: 'మళ్ళీ ఆడండి',
    readAloud: '📖 చదవండి'
  }
};

const MASCOT_STATES = {
  thinking: '🤔',
  happy: '😄',
  excited: '🤩',
  encouraging: '😊',
  celebrating: '🥳'
};

const FillStoryGame = () => {
  const navigate = useNavigate();
  const { language, level } = useParams();
  const t = UI_TEXT[language] || UI_TEXT.hindi;

  const [storyData, setStoryData] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [filledBlanks, setFilledBlanks] = useState({});
  const [activeBlank, setActiveBlank] = useState(null);
  const [score, setScore] = useState(0);
  const [mascotState, setMascotState] = useState('thinking');
  const [feedback, setFeedback] = useState(null); // { type: 'correct'|'wrong', blankId }
  const [storyComplete, setStoryComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [wrongShake, setWrongShake] = useState(null);
  const [attempts, setAttempts] = useState({});

  const blankRefs = useRef({});
  const optionRefs = useRef({});
  const storyContainerRef = useRef(null);

  const fetchStory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/fill-story/${language}/${level}`);
      if (res.data.success) {
        setStoryData(res.data.gameData);
        setTitle(res.data.title);
        // Auto-select first blank
        const blankIds = Object.keys(res.data.gameData.blanks);
        if (blankIds.length > 0) {
          setActiveBlank(blankIds[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching story:', err);
    } finally {
      setLoading(false);
    }
  }, [language, level]);

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  // Parse story template into segments
  const parseStory = useCallback(() => {
    if (!storyData) return [];
    const regex = /\{\{(blank_\d+)\}\}/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(storyData.storyTemplate)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: storyData.storyTemplate.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'blank', id: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < storyData.storyTemplate.length) {
      parts.push({ type: 'text', content: storyData.storyTemplate.slice(lastIndex) });
    }
    return parts;
  }, [storyData]);

  const handleBlankClick = (blankId) => {
    if (filledBlanks[blankId]) return; // already filled
    setActiveBlank(blankId);
    setShowHint(false);
    setMascotState('thinking');
  };

  const handleOptionClick = (blankId, option) => {
    const blank = storyData.blanks[blankId];
    if (!blank) return;

    if (option === blank.correctAnswer) {
      // Correct answer!
      const isFirstAttempt = !attempts[blankId];
      setAttempts(prev => ({ ...prev, [blankId]: (prev[blankId] || 0) + 1 }));

      // Fly animation
      setFeedback({ type: 'correct', blankId });
      setMascotState('happy');

      if (isFirstAttempt) {
        setScore(prev => prev + 10);
      }

      setTimeout(() => {
        setFilledBlanks(prev => {
          const updated = { ...prev, [blankId]: option };

          // Check if all blanks are filled
          const allBlankIds = Object.keys(storyData.blanks);
          const allFilled = allBlankIds.every(id => updated[id]);

          if (allFilled) {
            setTimeout(() => {
              setStoryComplete(true);
              setMascotState('celebrating');
              triggerConfetti();
            }, 600);
          } else {
            // Move to next unfilled blank
            const nextBlank = allBlankIds.find(id => !updated[id]);
            if (nextBlank) {
              setTimeout(() => setActiveBlank(nextBlank), 500);
            }
          }
          return updated;
        });

        setFeedback(null);
      }, 700);
    } else {
      // Wrong answer
      setAttempts(prev => ({ ...prev, [blankId]: (prev[blankId] || 0) + 1 }));
      setFeedback({ type: 'wrong', blankId });
      setWrongShake(option);
      setMascotState('encouraging');

      setTimeout(() => {
        setFeedback(null);
        setWrongShake(null);
      }, 800);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#f472b6', '#a855f7', '#38bdf8', '#fbbf24', '#34d399']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#f472b6', '#a855f7', '#38bdf8', '#fbbf24', '#34d399']
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleReadAloud = () => {
    if (!storyData) return;
    const fullText = storyData.storyTemplate.replace(
      /\{\{(blank_\d+)\}\}/g,
      (_, id) => storyData.blanks[id]?.correctAnswer || ''
    );

    const langCode = language === 'hindi' ? 'hi-IN' : 'te-IN';
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = langCode;
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleNextStory = () => {
    const nextLevel = parseInt(level) + 1;
    navigate(`/fill-story/${language}/${nextLevel}`, { state: { language } });
    // Reset state
    setFilledBlanks({});
    setActiveBlank(null);
    setScore(0);
    setStoryComplete(false);
    setFeedback(null);
    setAttempts({});
  };

  const handlePlayAgain = () => {
    setFilledBlanks({});
    setScore(0);
    setStoryComplete(false);
    setFeedback(null);
    setAttempts({});
    setMascotState('thinking');
    if (storyData) {
      const blankIds = Object.keys(storyData.blanks);
      if (blankIds.length > 0) setActiveBlank(blankIds[0]);
    }
  };

  const storyParts = parseStory();
  const blankIds = storyData ? Object.keys(storyData.blanks) : [];
  const filledCount = Object.keys(filledBlanks).length;
  const totalBlanks = blankIds.length;
  const progressPct = totalBlanks > 0 ? (filledCount / totalBlanks) * 100 : 0;

  if (loading) {
    return (
      <div className="fsg-root">
        <div className="fsg-bg">
          <div className="fsg-orb fsg-orb-1" />
          <div className="fsg-orb fsg-orb-2" />
        </div>
        <div className="fsg-loading">
          <div className="fsg-spinner" />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!storyData) {
    return (
      <div className="fsg-root">
        <div className="fsg-bg">
          <div className="fsg-orb fsg-orb-1" />
          <div className="fsg-orb fsg-orb-2" />
        </div>
        <div className="fsg-loading">
          <p>Story not found</p>
          <button className="fsg-back-btn" onClick={() => navigate('/fill-story')}>
            {t.backToHub}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fsg-root">
      {/* Background */}
      <div className="fsg-bg">
        <div className="fsg-stars">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className={`fsg-star ${['s','m','l'][i % 3]}`}
              style={{
                left: `${(i * 47 + 11) % 100}%`,
                top: `${(i * 53 + 19) % 100}%`,
                animationDelay: `${(i * 0.6) % 4}s`
              }}
            />
          ))}
        </div>
        <div className="fsg-orb fsg-orb-1" />
        <div className="fsg-orb fsg-orb-2" />
      </div>

      {/* Top Bar */}
      <motion.div
        className="fsg-topbar"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <button className="fsg-back-btn" onClick={() => navigate('/fill-story', { state: { language } })}>
          {t.backToHub}
        </button>
        <div className="fsg-topbar-center">
          <h2 className="fsg-story-title">{title}</h2>
        </div>
        <div className="fsg-score-badge">
          <span className="fsg-score-label">{t.score}</span>
          <span className="fsg-score-value">{score}</span>
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="fsg-progress-wrap">
        <div className="fsg-progress-bar">
          <motion.div
            className="fsg-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
        <span className="fsg-progress-text">{filledCount}/{totalBlanks}</span>
      </div>

      {/* Mascot */}
      <motion.div
        className="fsg-mascot"
        key={mascotState}
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <span className="fsg-mascot-face">{MASCOT_STATES[mascotState]}</span>
        {storyData.mascot && (
          <span className="fsg-mascot-char">{storyData.mascot}</span>
        )}
      </motion.div>

      {/* Story Area */}
      <div className="fsg-content" ref={storyContainerRef}>
        <motion.div
          className="fsg-story-area"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="fsg-story-text">
            {storyParts.map((part, i) => {
              if (part.type === 'text') {
                return <span key={i} className="fsg-story-word">{part.content}</span>;
              }
              // Blank slot
              const isFilled = !!filledBlanks[part.id];
              const isActive = activeBlank === part.id && !isFilled;
              return (
                <motion.span
                  key={part.id}
                  ref={el => blankRefs.current[part.id] = el}
                  className={`fsg-blank ${isFilled ? 'filled' : ''} ${isActive ? 'active' : ''} ${
                    feedback?.blankId === part.id && feedback?.type === 'correct' ? 'correct-flash' : ''
                  }`}
                  onClick={() => handleBlankClick(part.id)}
                  animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                  transition={isActive ? { repeat: Infinity, duration: 1.5 } : {}}
                >
                  {isFilled ? (
                    <motion.span
                      className="fsg-filled-word"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      {filledBlanks[part.id]}
                      <span className="fsg-sparkle">✨</span>
                    </motion.span>
                  ) : (
                    <span className="fsg-blank-underline">___</span>
                  )}
                </motion.span>
              );
            })}
          </div>
        </motion.div>

        {/* Options area */}
        <AnimatePresence mode="wait">
          {activeBlank && !filledBlanks[activeBlank] && storyData.blanks[activeBlank] && (
            <motion.div
              className="fsg-options-area"
              key={activeBlank}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <p className="fsg-choose-label">{t.chooseWord}</p>

              {/* Hint button */}
              <button
                className="fsg-hint-btn"
                onClick={() => setShowHint(!showHint)}
              >
                {t.hint}
              </button>

              <AnimatePresence>
                {showHint && (
                  <motion.div
                    className="fsg-hint-box"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <p>{storyData.blanks[activeBlank].hint}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="fsg-options-grid">
                {storyData.blanks[activeBlank].options.map((option, idx) => (
                  <motion.button
                    key={option}
                    ref={el => optionRefs.current[option] = el}
                    className={`fsg-option-btn ${
                      wrongShake === option ? 'shake' : ''
                    } ${
                      feedback?.type === 'correct' && option === storyData.blanks[activeBlank].correctAnswer ? 'correct-glow' : ''
                    }`}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.08, type: 'spring', stiffness: 300 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleOptionClick(activeBlank, option)}
                    disabled={feedback?.type === 'correct'}
                  >
                    <span className="fsg-option-text">{option}</span>
                    <span className="fsg-option-deco">
                      {['🌸', '⭐', '🌈', '🎵'][idx % 4]}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Feedback toast */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    className={`fsg-feedback ${feedback.type}`}
                    initial={{ opacity: 0, scale: 0.7, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7, y: -20 }}
                  >
                    {feedback.type === 'correct' ? t.correct : t.wrong}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completion Overlay */}
      <AnimatePresence>
        {storyComplete && (
          <motion.div
            className="fsg-complete-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="fsg-complete-card"
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <div className="fsg-complete-stars">
                {[...Array(5)].map((_, i) => (
                  <motion.span
                    key={i}
                    className="fsg-complete-star"
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2 + i * 0.15, type: 'spring', stiffness: 200 }}
                  >
                    ⭐
                  </motion.span>
                ))}
              </div>

              <h2 className="fsg-complete-title">{t.storyComplete}</h2>
              <p className="fsg-complete-subtitle">{t.greatJob}</p>

              <div className="fsg-complete-score">
                <span className="fsg-complete-score-label">{t.score}</span>
                <motion.span
                  className="fsg-complete-score-value"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  {score}
                </motion.span>
              </div>

              {/* Full story read */}
              <div className="fsg-complete-story-preview">
                <div className="fsg-complete-story-text">
                  {storyParts.map((part, i) => {
                    if (part.type === 'text') return <span key={i}>{part.content}</span>;
                    return (
                      <span key={part.id} className="fsg-highlight-word">
                        {filledBlanks[part.id]}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="fsg-complete-actions">
                <motion.button
                  className="fsg-hear-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReadAloud}
                >
                  {t.hearStory}
                </motion.button>
                <motion.button
                  className="fsg-replay-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayAgain}
                >
                  {t.playAgain}
                </motion.button>
                <motion.button
                  className="fsg-next-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextStory}
                >
                  {t.nextStory}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FillStoryGame;
