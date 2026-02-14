import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Quiz.css';

const Quiz = () => {
  const { language, level } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime, setStartTime] = useState(Date.now());
  const audioRef = useRef(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchQuiz();
  }, [language, level]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quizzes/${language}/${level}`);
      setQuiz(response.data.quiz);
      setLoading(false);
      setStartTime(Date.now());
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (quiz && quiz.questions[currentQuestion]) {
      const questionId = quiz.questions[currentQuestion].questionId;
      // Fetch audio from database via API
      const audioUrl = `http://localhost:5000/api/audio/${language}/${level}/${questionId}`;
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
    }
  };

  const handleAnswerSelect = (answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      alert('Please select an answer!');
      return;
    }

    const question = quiz.questions[currentQuestion];
    const correct = selectedAnswer === question.correctAnswer;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    setIsCorrect(correct);
    setShowFeedback(true);

    const answerData = {
      questionId: question.questionId,
      selectedAnswer,
      isCorrect: correct,
      timeTaken
    };

    const updatedAnswers = [...answers, answerData];
    setAnswers(updatedAnswers);

    // Calculate total score from all answers
    const newScore = correct ? score + 1 : score;
    setScore(newScore);

    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer('');
        setShowFeedback(false);
        setStartTime(Date.now());
      } else {
        submitQuizScore(updatedAnswers, newScore);
      }
    }, 2000);
  };

  const submitQuizScore = async (finalAnswers, finalScore) => {
    try {
      await axios.post('http://localhost:5000/api/scores', {
        userId,
        quizId: quiz._id,
        language,
        level: parseInt(level),
        score: finalScore,
        answers: finalAnswers
      });

      navigate('/results', {
        state: {
          score: finalScore,
          totalQuestions: quiz.questions.length,
          language,
          level
        }
      });
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  };

  if (loading) {
    return (
      <div className="quiz-container loading">
        <div className="loading-spinner">🎯 Loading Quiz...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiz-container">
        <div className="error-message">Quiz not found!</div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="stars-container">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`star ${['small', 'medium', 'large'][Math.floor(Math.random() * 3)]}`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <audio ref={audioRef} />

      <div className="quiz-header">
        <button
          className="btn btn-secondary exit-btn"
          onClick={() => navigate(`/planets/${language}`)}
        >
          ← Exit
        </button>
        <div className="quiz-info">
          <span className="level-badge">Level {level}</span>
          <span className="score-display">Score: {score}/{quiz.questions.length}</span>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <span className="progress-text">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </span>
      </div>

      <div className="quiz-content card">
        <div className="question-section">
          <h2 className="question-title">
            Listen and Choose the Correct Letter
          </h2>

          <button className="audio-btn" onClick={playAudio}>
            <span className="speaker-icon">🔊</span>
            <span className="audio-text">
              Play Audio
              <br />
              <span className="audio-subtext">Click to hear the letter</span>
            </span>
          </button>
        </div>

        <div className="options-section">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`option-btn ${selectedAnswer === option ? 'selected' : ''} ${
                showFeedback
                  ? option === question.correctAnswer
                    ? 'correct'
                    : selectedAnswer === option
                    ? 'wrong'
                    : ''
                  : ''
              }`}
              onClick={() => handleAnswerSelect(option)}
              disabled={showFeedback}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
              {showFeedback && option === question.correctAnswer && (
                <span className="feedback-icon">✓</span>
              )}
              {showFeedback && selectedAnswer === option && option !== question.correctAnswer && (
                <span className="feedback-icon">✗</span>
              )}
            </button>
          ))}
        </div>

        {!showFeedback && (
          <button
            className="btn btn-primary submit-btn"
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
          >
            Submit Answer →
          </button>
        )}

        {showFeedback && (
          <div className={`feedback-message ${isCorrect ? 'correct-feedback' : 'wrong-feedback'}`}>
            {isCorrect ? (
              <>
                <span className="feedback-emoji">🎉</span>
                <span className="feedback-text">
                  Excellent! Correct Answer!
                </span>
              </>
            ) : (
              <>
                <span className="feedback-emoji">💪</span>
                <span className="feedback-text">
                  Keep Trying!
                  <br />
                  <span className="feedback-subtext">Correct answer: {question.correctAnswer}</span>
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
