import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = localStorage.getItem('userId') || localStorage.getItem('playerId');
      if (!userId) {
        navigate('/');
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5001/api/users/${userId}/profile`);
        if (response.data.success) {
          setProfileData(response.data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <div className="profile-loading">Loading Profile...</div>;
  }

  if (!profileData) {
    return <div className="profile-error">Could not load profile data</div>;
  }

  const { user, stages } = profileData;

  const renderStars = (points) => {
    // If no points, show 0 stars. Render full stars up to the points limit
    const stars = [];
    // Assuming each stage has a maximum possible number of stars (let's say we show raw point accumulation)
    // We'll just display points as star icons
    for(let i=0; i<points; i++) {
        stars.push(<span key={i} className="star-icon">★</span>)
    }
    return points > 0 ? stars : <span className="no-stars">0 Stars</span>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Hello, {user.name}!</h1>
        <p>Age: {user.age} | Language: {user.language}</p>
        <button onClick={() => navigate('/stages')} className="back-btn">Map</button>
      </div>

      <div className="stages-container">
        <h2>Your Journey & Scores</h2>
        <div className="profile-planets-grid">
          
          <div className="profile-planet-card profile-earth">
            <div className="profile-planet-icon">🌍</div>
            <h3>Earth</h3>
            <p className="profile-stage-title">{stages.earth.title}</p>
            <div className="profile-stars-earned">{renderStars(stages.earth.points)} ({stages.earth.points} Stars)</div>
          </div>

          <div className="profile-planet-card profile-mars">
            <div className="profile-planet-icon">🔴</div>
            <h3>Mars</h3>
            <p className="profile-stage-title">{stages.mars.title}</p>
            <div className="profile-stars-earned">{renderStars(stages.mars.points)} ({stages.mars.points} Stars)</div>
          </div>

          <div className="profile-planet-card profile-jupiter">
            <div className="profile-planet-icon">🪐</div>
            <h3>Jupiter</h3>
            <p className="profile-stage-title">{stages.jupiter.title}</p>
            <div className="profile-stars-earned">{renderStars(stages.jupiter.points)} ({stages.jupiter.points} Stars)</div>
          </div>

          <div className="profile-planet-card profile-saturn">
            <div className="profile-planet-icon">🌌</div>
            <h3>Saturn</h3>
            <p className="profile-stage-title">{stages.saturn.title}</p>
            <div className="profile-stars-earned">{renderStars(stages.saturn.points)} ({stages.saturn.points} Stars)</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;