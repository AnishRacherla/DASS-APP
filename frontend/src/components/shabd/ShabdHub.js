import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ShabdMatch.css'; // We'll share CSS between Hub and Game

const API_BASE = 'http://localhost:5001';

const ShabdHub = () => {
    const [language, setLanguage] = useState('hindi');
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLevels = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/api/shabd/${language}`);
                const data = await response.json();
                if (data.success) {
                    setLevels(data.levels);
                } else {
                    setLevels([]);
                }
            } catch (err) {
                console.error("Failed to load shabd levels", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLevels();
    }, [language]);

    return (
        <div className="shabd-wrapper">
            <div className="shabd-hub-header">
                <button className="shabd-back-btn" onClick={() => navigate('/game-hub')}>
                    ← Back to Games
                </button>
                <h1>शब्द-चित्र मिलान</h1>
                <p className="shabd-hub-subtitle">Word-Picture Match Game</p>

                <div className="shabd-lang-toggle">
                    <button
                        className={`shabd-lang-btn ${language === 'hindi' ? 'active' : ''}`}
                        onClick={() => setLanguage('hindi')}
                    >
                        हिन्दी (Hindi)
                    </button>
                    <button
                        className={`shabd-lang-btn ${language === 'telugu' ? 'active' : ''}`}
                        onClick={() => setLanguage('telugu')}
                    >
                        తెలుగు (Telugu)
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="shabd-loading">
                    <div className="shabd-loader"></div>
                    <p>Loading levels...</p>
                </div>
            ) : (
                <div className="shabd-levels-grid">
                    {levels.map((level, idx) => (
                        <motion.div
                            key={level.id}
                            className="shabd-level-card"
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(`/shabd/match/${language}/${level.level}`)}
                        >
                            <div className="shabd-level-icon">
                                {idx === 0 ? '🐶' : '🏠'}
                            </div>
                            <h3>{level.title}</h3>
                            <p className="shabd-level-native">
                                {language === 'telugu' ? 'స్థాయి ' : 'स्तर '}{level.level}
                            </p>
                            <span className="shabd-level-badge">{level.difficulty}</span>
                        </motion.div>
                    ))}
                    {levels.length === 0 && (
                        <p style={{ color: 'white' }}>No levels found for this language.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShabdHub;
