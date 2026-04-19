import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { storyTimeData } from '../../data/storyTimeData';
import './StoryTime.css';

const StoryTimeHub = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [language, setLanguage] = useState(
        location.state?.language || localStorage.getItem('userLanguage') || 'hindi'
    );

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        localStorage.setItem('userLanguage', lang);
    };

    const filteredStories = storyTimeData.filter(s => s.language === language);

    return (
        <div className="story-hub-container">
            <div className="hub-topbar">
                <button className="back-btn" onClick={() => navigate('/game-hub')}>← Back</button>
                <h1>Story Time (कथा और प्रश्न)</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: language === 'hindi' ? '#ff9800' : 'white', color: language === 'hindi' ? 'white' : '#00838f', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => handleLanguageChange('hindi')}
                    >Hindi</button>
                    <button
                        style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: language === 'telugu' ? '#ff9800' : 'white', color: language === 'telugu' ? 'white' : '#00838f', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => handleLanguageChange('telugu')}
                    >Telugu</button>
                </div>
            </div>
            <div className="story-grid">
                {filteredStories.map((story) => (
                    <motion.div
                        key={story.id}
                        className="story-card"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate(`/story-time/play/${story.id}`)}
                    >
                        <div className="story-card-image" style={{ backgroundImage: `url(http://localhost:5001/images/storyTime/${story.slides[0].image})` }}></div>
                        <h3>{story.title}</h3>
                        <span className="level-badge">Level {story.level}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default StoryTimeHub;
