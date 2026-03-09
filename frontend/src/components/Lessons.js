import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Lessons.css';

export default function Lessons() {
  const navigate = useNavigate();
  const location = useLocation();
  const language = location.state?.language || 'hindi';
  
  const [lessons, setLessons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    fetchLessons();
    
    return () => {
      if (audio) {
        audio.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/api/lessons/${language}`);
      setLessons(response.data.lessons);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLoading(false);
    }
  };

  const playAudio = (audioUrl) => {
    // Don't play if audio URL is null or empty
    if (!audioUrl) {
      return;
    }
    
    if (audio) {
      audio.pause();
    }
    
    const newAudio = new Audio(`http://localhost:5001${audioUrl}`);
    newAudio.play();
    setAudio(newAudio);
  };

  const handleNext = () => {
    if (currentIndex < lessons.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed all lessons - unlock Mars
      localStorage.setItem(`lessonsCompleted_${language}`, 'true');
      alert('Great! You completed all lessons! Mars planet unlocked!');
      navigate('/planet-home', { state: { language } });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="lessons-container">
        <div className="loading-container">
          <div className="loader"></div>
          <p className="loading-text">Loading lessons...</p>
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="lessons-container">
        <div className="no-lessons">
          <h2>No lessons available yet!</h2>
          <button className="back-btn" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentLesson = lessons[currentIndex];

  return (
    <div className="lessons-container">
      <div className="lessons-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Learn Words</h1>
        <div className="progress-indicator">
          {currentIndex + 1} / {lessons.length}
        </div>
      </div>

      <div className="lessons-content">
        <div className="lesson-card">
          <div className="lesson-image-container">
            <img 
              src={`http://localhost:5001${currentLesson.imageUrl}`} 
              alt={currentLesson.word}
              className="lesson-image"
            />
          </div>

          <div className="lesson-word-container">
            <h2 className="lesson-word">{currentLesson.word}</h2>
            {currentLesson.audioUrl && (
              <button 
                className="play-audio-btn"
                onClick={() => playAudio(currentLesson.audioUrl)}
              >
                🔊 Play Sound
              </button>
            )}
          </div>

          <div className="lesson-navigation">
            <button 
              className="nav-btn"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              ← Previous
            </button>
            
            <button 
              className="nav-btn primary"
              onClick={handleNext}
            >
              {currentIndex === lessons.length - 1 ? 'Finish ✓' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
