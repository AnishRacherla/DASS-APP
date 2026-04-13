import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './ScavengerGame.css';

const SCENES = [
    { level: 1, scene: 'kitchen', emoji: '🍳', title: 'Kitchen', titleHi: 'रसोई', titleTe: 'వంటగది', color: '#FF8C42' },
    { level: 2, scene: 'market', emoji: '🏪', title: 'Market', titleHi: 'बाज़ार', titleTe: 'మార్కెట్', color: '#FF6B6B' },
    { level: 3, scene: 'garden', emoji: '🌻', title: 'Garden', titleHi: 'बगीचा', titleTe: 'తోట', color: '#4ECDC4' },
    { level: 4, scene: 'bedroom', emoji: '🛏️', title: 'Bedroom', titleHi: 'कमरा', titleTe: 'గది', color: '#AA96DA' },
    { level: 5, scene: 'playground', emoji: '🎡', title: 'Playground', titleHi: 'मैदान', titleTe: 'ఆటస్థలం', color: '#32CD32' },
];

export default function ScavengerHub() {
    const navigate = useNavigate();
    const [language, setLanguage] = useState(
        localStorage.getItem('userLanguage') || 'hindi'
    );

    const handleSceneSelect = (level) => {
        navigate('/scavenger/play', { state: { language, level } });
    };

    return (
        <div className="scav-hub">
            <header className="scav-hub-header">
                <button className="scav-back-btn" onClick={() => navigate('/game-hub')}>
                    ← Back to Games
                </button>
                <h1>🔍 {language === 'telugu' ? 'అక్షర వేట' : 'अक्षर खोज'} — Akshar Scavenger Hunt</h1>
                <p className="scav-hub-subtitle">
                    {language === 'telugu'
                        ? 'దాచిన అక్షరాలను కనుగొనండి!'
                        : 'छुपे हुए अक्षर ढूंढो!'}
                </p>
            </header>

            {/* Language Toggle */}
            <div className="scav-lang-toggle">
                <button
                    className={`scav-lang-btn ${language === 'hindi' ? 'active' : ''}`}
                    onClick={() => { setLanguage('hindi'); localStorage.setItem('userLanguage', 'hindi'); }}
                >
                    Hindi
                </button>
                <button
                    className={`scav-lang-btn ${language === 'telugu' ? 'active' : ''}`}
                    onClick={() => { setLanguage('telugu'); localStorage.setItem('userLanguage', 'telugu'); }}
                >
                    Telugu
                </button>
            </div>

            {/* Scene Cards */}
            <div className="scav-scenes-grid">
                {SCENES.map((s, idx) => (
                    <motion.div
                        key={s.scene}
                        className="scav-scene-card"
                        style={{ borderColor: s.color }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.04, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSceneSelect(s.level)}
                    >
                        <div className="scav-scene-icon" style={{ background: s.color }}>
                            {s.emoji}
                        </div>
                        <h3>{s.title}</h3>
                        <p className="scav-scene-native">
                            {language === 'telugu' ? s.titleTe : s.titleHi}
                        </p>
                        <div className="scav-scene-badge">
                            Level {s.level}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
