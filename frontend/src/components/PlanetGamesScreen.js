import React, { useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAMES } from './GameHub';
import { STAGES } from './StageHub';
import { getStars, markPlayed } from '../hooks/useGameProgress';
import './PlanetGamesScreen.css';

const StarRow = ({ gameId }) => {
    const stars = getStars(gameId); // -1 = not played
    return (
        <div className="ps-card-stars">
            {[1, 2, 3].map(n => (
                <span key={n} className={`ps-star ${stars >= n ? 'earned' : 'empty'}`}>⭐</span>
            ))}
        </div>
    );
};

const PlanetGamesScreen = () => {
    const { stageId } = useParams();
    const navigate = useNavigate();
    const { state } = useLocation();
    const language = state?.language || localStorage.getItem('userLanguage') || 'hindi';

    const stageNum = parseInt(stageId, 10);
    const stage = STAGES.find(s => s.id === stageNum);
    const games = useMemo(() => GAMES.filter(g => g.stage === stageNum), [stageNum]);

    const playedPositions = games.map(g => getStars(g.id) >= 0);
    const playedCount = playedPositions.filter(Boolean).length;

    // A game unlocks if it's the first one OR the previous one has been played
    const isGameUnlocked = (idx) => idx === 0 || playedPositions[idx - 1];

    // The 'active' game is the first unplayed one, or the very last one if all played
    const activeIdx = Math.min(playedPositions.findIndex(p => !p) !== -1 ? playedPositions.findIndex(p => !p) : games.length - 1, games.length - 1);

    const handleGameClick = (game, idx) => {
        if (!isGameUnlocked(idx)) return; // Locked

        markPlayed(game.id);
        localStorage.setItem('lastStage', stageNum.toString());

        switch (game.id) {
            case 'whack': navigate(`/whack/${language}`); break;
            case 'quiz': navigate(`/planets/${language}`); break;
            case 'balloon': navigate('/balloon-selection', { state: { language } }); break;
            case 'bubble-shooter': navigate('/bubble-shooter', { state: { language } }); break;
            case 'word-sorting-basket': navigate('/word-sorting-basket', { state: { language } }); break;
            case 'mars': navigate('/mars-games', { state: { language } }); break;
            case 'akshara': navigate('/akshara', { state: { language } }); break;
            case 'consonant': navigate('/consonant-quiz', { state: { language } }); break;
            case 'varnamal': navigate('/varnamal', { state: { language } }); break;
            case 'scavenger': navigate('/scavenger', { state: { language } }); break;
            case 'matra': navigate('/matra-game', { state: { language } }); break;
            case 'word-jumble': navigate('/word-jumble', { state: { language } }); break;
            case 'shabd': navigate('/shabd', { state: { language } }); break;
            case 'story-time': navigate('/story-time', { state: { language } }); break;
            case 'fill-story': navigate('/fill-story', { state: { language } }); break;
            case 'crossword': navigate('/crossword', { state: { language } }); break;
            case 'swara': navigate('/swara-game', { state: { language } }); break;
            case 'swara-memory': navigate('/swara-memory', { state: { language } }); break;
            case 'trace-vowel': navigate('/trace-vowel', { state: { language } }); break;
            case 'missing-matra': navigate('/missing-matra', { state: { language } }); break;
            default: navigate(game.path, { state: { language } });
        }
    };

    if (!stage) return <div style={{ color: '#fff', padding: 40 }}>Stage not found.</div>;

    // Get assigned theme
    const themeClass = ['theme-forest', 'theme-canyon', 'theme-clouds', 'theme-crystals'][stageNum - 1] || 'theme-clouds';

    // SVG Path calculation
    const SPACING = 180;
    const OFFSET_Y = 100;
    const getX = (idx) => [50, 20, 50, 80][idx % 4];

    const generatePathData = () => {
        if (games.length === 0) return '';
        let d = `M ${getX(0)} ${OFFSET_Y}`;
        for (let i = 1; i < games.length; i++) {
            const px = getX(i - 1);
            const py = (i - 1) * SPACING + OFFSET_Y;
            const cx = getX(i);
            const cy = i * SPACING + OFFSET_Y;
            d += ` C ${px} ${py + 90}, ${cx} ${cy - 90}, ${cx} ${cy}`;
        }
        return d;
    };

    return (
        <div className={`planet-screen ${themeClass}`}>
            <div className="ps-topbar">
                <button className="ps-back-btn" onClick={() => navigate('/stages')}>← Planets</button>
                <div className="ps-planet-badge">{stage.planet}</div>
                <div className="ps-stage-info">
                    <h2>{stage.name} — {stage.hindiName}</h2>
                    <span>{stage.age} · {stage.subtitle}</span>
                </div>
            </div>

            <motion.div className="ps-hero" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1>{stage.planet} {stage.name}</h1>
                <p>{stage.desc}</p>
                <div style={{ background: 'rgba(0,0,0,0.5)', padding: '5px 15px', borderRadius: '20px', display: 'inline-block', marginTop: '10px' }}>
                    {playedCount}/{games.length} Complete
                </div>
            </motion.div>

            <div className="path-container" style={{ height: `${games.length * SPACING + 200}px` }}>
                <svg className="path-svg" viewBox={`0 0 100 ${games.length * SPACING + 200}`} preserveAspectRatio="none">
                    <path d={generatePathData()} stroke="rgba(255, 255, 255, 0.2)" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" fill="none" />
                </svg>

                {games.map((game, i) => {
                    const unlocked = isGameUnlocked(i);
                    const isActive = i === activeIdx;
                    const stars = getStars(game.id);

                    return (
                        <div key={game.id} className="path-node-wrapper"
                            style={{ top: `${i * SPACING + OFFSET_Y}px`, left: `${getX(i)}%` }}
                        >
                            <div
                                className={`path-node ${unlocked ? 'unlocked' : 'locked'} ${isActive ? 'active-bounce' : ''}`}
                                style={{ '--card-color': game.color }}
                                onClick={() => handleGameClick(game, i)}
                            >
                                {unlocked ? game.emoji : '🔒'}

                                {unlocked && (
                                    <div className="node-stars">
                                        {[1, 2, 3].map(n => (
                                            <span key={n} className={`node-star ${stars >= n ? 'earned' : ''}`}>⭐</span>
                                        ))}
                                    </div>
                                )}

                                {!unlocked && <div className="lock-icon">🔒</div>}
                            </div>

                            {isActive && (
                                <motion.div
                                    className="node-title-card"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <h3>{game.title}</h3>
                                    <p>{game.description}</p>
                                    <button className="play-prompt-btn" onClick={() => handleGameClick(game, i)}>
                                        Play ▶
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlanetGamesScreen;
