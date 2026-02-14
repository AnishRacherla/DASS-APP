import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Homepage.css';

const Homepage = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: 5
  });

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleStartLearning = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:5000/api/users', {
        name: formData.name,
        age: parseInt(formData.age),
        language: selectedLanguage
      });

      if (response.data.success) {
        // Store user ID in localStorage
        localStorage.setItem('userId', response.data.user._id);
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userLanguage', response.data.user.language);
        
        // Navigate to planet selection
        navigate(`/planets/${selectedLanguage}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Something went wrong! Please try again.');
    }
  };

  return (
    <div className="homepage">
      <div className="stars-container">
        {[...Array(100)].map((_, i) => (
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

      <div className="homepage-content">
        <div className="rocket-animation">🚀</div>
        
        <h1 className="title">
          <span className="title-emoji">🌟</span>
          Letter Space Adventure
          <span className="title-emoji">🌟</span>
        </h1>
        <h2 className="subtitle">Learn Hindi & Telugu Letters</h2>

        {!showForm ? (
          <div className="language-selection">
            <h3>Choose Your Language</h3>
            <p className="subtitle-text">Select which language you want to learn</p>
            
            <div className="language-buttons">
              <button
                className="language-btn hindi-btn"
                onClick={() => handleLanguageSelect('hindi')}
              >
                <span className="lang-emoji">🇮🇳</span>
                <span className="lang-text">Hindi</span>
                <span className="lang-subtext">Learn Hindi Letters</span>
              </button>

              <button
                className="language-btn telugu-btn"
                onClick={() => handleLanguageSelect('telugu')}
              >
                <span className="lang-emoji">🇮🇳</span>
                <span className="lang-text">Telugu</span>
                <span className="lang-subtext">Learn Telugu Letters</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="user-form card">
            <h3>Welcome, Young Astronaut!</h3>
            <p className="form-subtitle">Let's start your learning journey! 🚀</p>

            <form onSubmit={handleStartLearning}>
              <div className="form-group">
                <label>
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>
                  Your Age (3-8 years)
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  min="3"
                  max="8"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>
                  Selected Language
                </label>
                <input
                  type="text"
                  value={selectedLanguage === 'hindi' ? 'Hindi (हिंदी)' : 'Telugu (తెలుగు)'}
                  disabled
                  className="form-input"
                  style={{background: 'rgba(255, 215, 0, 0.2)', cursor: 'not-allowed'}}
                />
              </div>

              <button type="submit" className="btn btn-primary start-btn">
                Start Learning
                <span className="btn-icon">🚀</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary back-btn"
                onClick={() => {
                  setShowForm(false);
                  setSelectedLanguage('');
                }}
              >
                ← Back to Language Selection
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
