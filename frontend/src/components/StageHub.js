import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GAMES } from './GameHub';
import {
    isStageUnlocked, hasBadge, getStars, getStreak, touchStreak,
    registerStageGames, getStageScore
} from '../hooks/useGameProgress';
import './StageHub.css';

// ─── Stage meta data ────────────────────────────────────────────────────────
const STAGES = [
    {
        id: 1,
        planet: '🌍',
        name: 'Earth',
        hindiName: 'पहचान',
        subtitle: 'Vowel Recognition',
        desc: 'Start your journey on Earth! Learn all 13 Hindi vowels through songs, cards, and tracing activities.',
        color: '#22d3ee',
        gradient: 'linear-gradient(135deg, #22d3ee, #0ea5e9)',
        badge: '🏅',
        age: 'Age 4–5 · Pre-reader'
    },
    {
        id: 2,
        planet: '🔴',
        name: 'Mars',
        hindiName: 'अक्षर',
        subtitle: 'Alphabet Mastery',
        desc: 'Blast off to Mars! Conquer all 36 consonants through action-packed arcade games and puzzles.',
        color: '#f97316',
        gradient: 'linear-gradient(135deg, #f97316, #dc2626)',
        badge: '🥇',
        age: 'Age 4–5 · Early Reader'
    },
    {
        id: 3,
        planet: '🟠',
        name: 'Jupiter',
        hindiName: 'शब्द',
        subtitle: 'Words & Matras',
        desc: 'Explore Jupiter! Master all 11 matras and build your first real Hindi words with fun challenges.',
        color: '#fb923c',
        gradient: 'linear-gradient(135deg, #fb923c, #a855f7)',
        badge: '🏆',
        age: 'Age 5–6 · Word Builder'
    },
    {
        id: 4,
        planet: '🪐',
        name: 'Saturn',
        hindiName: 'वाक्य',
        subtitle: 'Sentences & Stories',
        desc: 'Reach Saturn! Read and understand full sentences and short stories. You are almost a fluent reader!',
        color: '#a78bfa',
        gradient: 'linear-gradient(135deg, #a78bfa, #818cf8)',
        badge: '🌟',
        age: 'Age 6–8 · Fluent Reader'
    }
];

// ─── Mascot tip logic ────────────────────────────────────────────────────────
const getMascotTip = (stages, gamesPerStage) => {
    for (let s of stages) {
        if (!isStageUnlocked(s.id, gamesPerStage)) {
            return `Complete Stage ${s.id - 1} to unlock ${s.name}! 🔒`;
        }
        const played = gamesPerStage[s.id]?.filter(g => getStars(g.id) >= 0) ?? [];
        const total = gamesPerStage[s.id]?.length ?? 0;
        if (played.length < total) {
            return `Play ${total - played.length} more game${total - played.length > 1 ? 's' : ''} in ${s.name} to earn the ${s.badge} badge!`;
        }
    }
    return 'You are a Hindi star! 🌟 Play more games to keep your streak going!';
};

// ─── Component ───────────────────────────────────────────────────────────────
const StageHub = () => {
    const navigate = useNavigate();
    const playerName = localStorage.getItem('playerName') || localStorage.getItem('userName') || 'Learner';
    const [language, setLanguage] = useState(localStorage.getItem('userLanguage') || 'hindi');
    const [streak, setStreak] = useState(0);
    const [celebration, setCelebration] = useState(null); // { stage } on badge unlock

    // Group games by stage
    const gamesPerStage = React.useMemo(() => {
        const map = { 1: [], 2: [], 3: [], 4: [] };
        GAMES.forEach(g => { if (g.stage && map[g.stage]) map[g.stage].push(g); });
        return map;
    }, []);

    useEffect(() => {
        if (!localStorage.getItem('isLoggedIn')) { navigate('/'); return; }
        // Register game lists so autoCheckBadge can find them
        registerStageGames(gamesPerStage);
        touchStreak();
        setStreak(getStreak());
    }, [navigate, gamesPerStage]);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        localStorage.setItem('userLanguage', lang);
    };

    const handleLogout = () => {
        ['isLoggedIn', 'playerId', 'playerName', 'playerEmail', 'userId', 'userName', 'userLanguage', 'akshara_session']
            .forEach(k => localStorage.removeItem(k));
        navigate('/');
    };

    const handleStageClick = (stage) => {
        if (!isStageUnlocked(stage.id, gamesPerStage)) return;
        navigate(`/stages/${stage.id}`, { state: { language } });
    };

    // Progress for each stage = # games tried (stars >= 0)
    const stageProgress = (stageId) => {
        const gs = gamesPerStage[stageId] ?? [];
        const played = gs.filter(g => getStars(g.id) >= 0).length;
        return { played, total: gs.length, scorePct: getStageScore(gs) };
    };

    const mascotTip = getMascotTip(STAGES, gamesPerStage);

    return (
        <div className="stage-hub">
            {/* Starfield */}
            <div className="stage-stars">
                {[...Array(70)].map((_, i) => (
                    <div key={i} className={`stage-star ${['s', 'm', 'l'][i % 3]}`}
                        style={{
                            left: `${(i * 43 + 11) % 100}%`,
                            top: `${(i * 67 + 7) % 100}%`,
                            animationDelay: `${(i * 0.3) % 5}s`
                        }} />
                ))}
            </div>

            {/* Top Bar */}
            <motion.div className="stage-topbar" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
                <div className="topbar-left">
                    <div className="stage-avatar">{playerName.charAt(0).toUpperCase()}</div>
                    <div>
                        <span className="stage-welcome">Welcome back,</span>
                        <div className="stage-username">{playerName} 👋</div>
                    </div>
                </div>
                <div className="topbar-right">
                    {streak > 0 && (
                        <div className="streak-badge">🔥 {streak} day streak</div>
                    )}
                    <button className="profile-btn" onClick={() => navigate('/profile')} title="Go to Profile">👤 Profile</button>
                    <div className="lang-toggle">
                        <button className={`lang-btn ${language === 'hindi' ? 'active' : ''}`} onClick={() => handleLanguageChange('hindi')}>Hindi</button>
                        <button className={`lang-btn ${language === 'telugu' ? 'active' : ''}`} onClick={() => handleLanguageChange('telugu')}>Telugu</button>
                    </div>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">🚪</button>
                </div>
            </motion.div>

            {/* Hero header */}
            <motion.div className="stage-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h1>🚀 Your Learning Journey</h1>
                <p>Explore 4 planets, master {language === 'hindi' ? 'Hindi (हिंदी)' : 'Telugu (తెలుగు)'} step by step!</p>
            </motion.div>

            {/* Planet path */}
            <div className="planet-path">
                {STAGES.map((stage, idx) => {
                    const unlocked = isStageUnlocked(stage.id, gamesPerStage);
                    const badge = hasBadge(stage.id);
                    const { played, total, scorePct } = stageProgress(stage.id);
                    const pct = total > 0 ? Math.round((played / total) * 100) : 0;

                    return (
                        <motion.div
                            key={stage.id}
                            className={`planet-card ${!unlocked ? 'locked' : ''}`}
                            style={{ '--planet-color': stage.color }}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx + 0.3, type: 'spring', stiffness: 180 }}
                            onClick={() => handleStageClick(stage)}
                            whileHover={unlocked ? { scale: 1.02 } : {}}
                            whileTap={unlocked ? { scale: 0.98 } : {}}
                        >
                            {/* background glow */}
                            <div className="planet-glow" style={{ background: stage.color }} />

                            {/* Planet icon */}
                            <div className="planet-icon-wrap">
                                <div className="planet-emoji">{unlocked ? stage.planet : '🔒'}</div>
                                <div className="planet-stage-tag">Stage {stage.id}</div>
                            </div>

                            {/* Info */}
                            <div className="planet-info">
                                <div className="planet-stage-label">{stage.age}</div>
                                <div className="planet-name">{stage.name} <span style={{ color: stage.color }}>{stage.hindiName}</span></div>
                                <div className="planet-subtitle">{stage.subtitle}</div>
                                <p className="planet-desc">{stage.desc}</p>
                                {unlocked && (
                                    <div className="planet-progress">
                                        <div className="progress-bar">
                                            <motion.div className="progress-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ delay: 0.5 + idx * 0.1, duration: 0.8 }}
                                            />
                                        </div>
                                        <span className="progress-label">
                                            {played}/{total} tried{scorePct > 0 ? ` · ${scorePct}% avg score` : ''}
                                        </span>
                                    </div>
                                )}
                                {!unlocked && <div className="planet-desc" style={{ color: '#f97316' }}>🔒 Complete previous stage to unlock</div>}
                            </div>

                            {/* Right side */}
                            {badge ? (
                                <div className="planet-badge" title="Stage Complete!">{stage.badge}</div>
                            ) : !unlocked ? (
                                <div className="lock-icon">🔒</div>
                            ) : (
                                <div className="planet-arrow">›</div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Mascot */}
            <motion.div className="mascot-bubble" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
                <div className="mascot-speech">🦜 {mascotTip}</div>
                <div className="mascot-emoji">🦜</div>
            </motion.div>

            {/* Celebration modal */}
            <AnimatePresence>
                {celebration && (
                    <motion.div className="celebration-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="celebration-card" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                            <div className="badge-reveal">{celebration.badge}</div>
                            <h2>Badge Earned! 🎉</h2>
                            <p>You completed <strong>{celebration.name}</strong>!<br />Stage {celebration.id + 1} is now unlocked.</p>
                            <button className="celebration-btn" onClick={() => setCelebration(null)}>Continue ›</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export { STAGES };
export default StageHub;
