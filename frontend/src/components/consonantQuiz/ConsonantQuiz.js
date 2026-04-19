import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import AnimalMascot from './AnimalMascot';
import Flashcard from './Flashcard';
import SoundOption from './SoundOption';
import './ConsonantQuiz.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

const ConsonantQuiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState(
    location.state?.language || localStorage.getItem('userLanguage') || 'hindi'
  );
  const [questionData, setQuestionData] = useState(null);
  const [mascotState, setMascotState] = useState('idle');
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  const userId = useMemo(
    () => localStorage.getItem('userId') || localStorage.getItem('playerId'),
    []
  );

  useEffect(() => {
    if (!localStorage.getItem('isLoggedIn')) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('userLanguage', language);
  }, [language]);

  const fetchScore = useCallback(async () => {
    setError('');
    try {
      const res = await fetch(
        `${API_BASE}/api/consonant/score?userId=${userId}&language=${language}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Score fetch failed');
      setScore(data.score || 0);
    } catch (err) {
      setError(err.message || 'Unable to load score');
    }
  }, [language, userId]);

  const fetchQuestion = useCallback(async () => {
    setError('');
    setMascotState('idle');
    setSelectedOptionId(null);
    setIsSubmitting(false);
    try {
      const res = await fetch(`${API_BASE}/api/consonant/question?language=${language}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Question fetch failed');
      setQuestionData(data);
    } catch (err) {
      setError(err.message || 'Unable to load question');
    }
  }, [language]);

  useEffect(() => {
    if (!userId) return;
    fetchScore();
    fetchQuestion();
  }, [fetchQuestion, fetchScore, userId]);

  const handleSubmit = async () => {
    if (!selectedOptionId || isSubmitting || !questionData) return;
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/consonant/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          language,
          questionId: questionData.questionId,
          selectedOptionId
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Submission failed');

      if (result.isCorrect) {
        setMascotState('correct');
        setScore(result.currentScore);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.7 },
          colors: ['#00c2a8', '#ffbe0b', '#fb5607', '#3a86ff']
        });
        setTimeout(() => {
          fetchQuestion();
        }, 1800);
      } else {
        setMascotState('wrong');
        setTimeout(() => {
          setMascotState('idle');
          setIsSubmitting(false);
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Submission failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cq-page">
      <div className="cq-bg" />
      <header className="cq-header">
        <button className="cq-back" onClick={() => navigate('/game-hub')}>
          ← Back
        </button>
        <div className="cq-title">
          <span className="cq-title-emoji">🧸</span>
          Consonant Quiz
        </div>
        <div className="cq-score">⭐ Score: {score}</div>
      </header>

      <div className="cq-toolbar">
        <div className="cq-lang">
          <button
            className={`cq-lang-btn ${language === 'hindi' ? 'active' : ''}`}
            onClick={() => setLanguage('hindi')}
          >
            Hindi
          </button>
          <button
            className={`cq-lang-btn ${language === 'telugu' ? 'active' : ''}`}
            onClick={() => setLanguage('telugu')}
          >
            Telugu
          </button>
        </div>
        <div className="cq-helper">
          Tap a sound, pick the match
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="cq-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {!questionData ? (
        <div className="cq-loading">
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="cq-loading-emoji"
          >
            🧸
          </motion.div>
          <div className="cq-loading-text">Loading your next letter...</div>
        </div>
      ) : (
        <>
          <div className="cq-stage">
            <AnimalMascot state={mascotState} />
            <Flashcard letter={questionData.correctLetter} />
          </div>

          <div className="cq-options">
            {questionData.options.map((option, idx) => (
              <SoundOption
                key={option._id}
                index={idx}
                audioBase64={option.audioBase64}
                isSelected={selectedOptionId === option._id}
                onSelect={() => setSelectedOptionId(option._id)}
              />
            ))}
          </div>

          <div className="cq-submit-wrap">
            <button
              className={`cq-submit ${selectedOptionId ? 'ready' : ''}`}
              onClick={handleSubmit}
              disabled={!selectedOptionId || isSubmitting}
            >
              {isSubmitting ? 'Checking...' : 'Submit'}
            </button>
          </div>
        </>
      )}

      <div className="cq-footer">
        <span>Listen carefully, then match the letter.</span>
      </div>
    </div>
  );
};

export default ConsonantQuiz;
