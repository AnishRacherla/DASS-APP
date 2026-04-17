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

    const played = games.filter(g => getStars(g.id) >= 0).length;

    const handleGameClick = (game) => {
        // Mark as played immediately — just launching counts for unlock
        markPlayed(game.id);
        // Store which planet we came from — back buttons in each game read this
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
            default: navigate(game.path, { state: { language } });
        }
    };

    if (!stage) return <div style={{ color: '#fff', padding: 40 }}>Stage not found.</div>;

    return (
        <div className="planet-screen">
            {/* Starfield */}
            <div className="stage-stars">
                {[...Array(50)].map((_, i) => (
                    <div key={i} className={`stage-star ${['s', 'm', 'l'][i % 3]}`}
                        style={{ left: `${(i * 43 + 11) % 100}%`, top: `${(i * 67 + 7) % 100}%`, animationDelay: `${(i * .3) % 5}s` }} />
                ))}
            </div>

            {/* Top bar */}
            <div className="ps-topbar">
                <button className="ps-back-btn" onClick={() => navigate('/stages')}>← Planets</button>
                <div className="ps-planet-badge">{stage.planet}</div>
                <div className="ps-stage-info">
                    <h2>{stage.name} — {stage.hindiName}</h2>
                    <span>{stage.age} · {stage.subtitle}</span>
                </div>
            </div>

            {/* Progress */}
            <div className="ps-progress-bar-wrap">
                <div className="ps-prog-bar">
                    <motion.div className="ps-prog-fill"
                        style={{ background: stage.gradient }}
                        initial={{ width: 0 }}
                        animate={{ width: `${games.length > 0 ? Math.round((played / games.length) * 100) : 0}%` }}
                        transition={{ duration: 0.8 }}
                    />
                </div>
                <span className="ps-prog-label">{played}/{games.length} games played</span>
            </div>

            {/* Hero */}
            <motion.div className="ps-hero" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h1>{stage.planet} {stage.name} — {stage.subtitle}</h1>
                <p>{stage.desc}</p>
            </motion.div>

            {/* Game grid — entire card is clickable */}
            <div className="ps-game-grid">
                {games.map((game, i) => (
                    <motion.div
                        key={game.id}
                        className="ps-game-card"
                        style={{ '--card-gradient': game.gradient, '--card-color': game.color, cursor: 'pointer' }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i + 0.2, type: 'spring', stiffness: 200 }}
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleGameClick(game)}
                    >
                        <div className="ps-card-glow" />
                        <div className="ps-card-top">
                            <span className="ps-card-emoji">{game.emoji}</span>
                            <StarRow gameId={game.id} />
                        </div>
                        <div className="ps-card-title">{game.title}</div>
                        <div className="ps-card-category">{game.category}</div>
                        <p className="ps-card-desc">{game.description}</p>
                        <div className="ps-play-btn">▶ Play</div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default PlanetGamesScreen;
