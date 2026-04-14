import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './GameHub.css';

const GAMES = [
  {
    id: 'balloon',
    title: 'Balloon Pop',
    emoji: '🎈',
    description: 'Pop balloons with the correct letters! Fun letter recognition game.',
    color: '#FF6B6B',
    gradient: 'linear-gradient(135deg, #FF6B6B, #ee5a24)',
    path: '/balloon-selection',
    category: 'Letters'
  },
  {
    id: 'bubble-shooter',
    title: 'Bubble Shooter',
    emoji: '🫧',
    description: 'Hear the consonant and shoot the matching bubble before the sound changes.',
    color: '#38BDF8',
    gradient: 'linear-gradient(135deg, #38BDF8, #0EA5E9)',
    path: '/bubble-shooter',
    category: 'Letters'
  },
  {
    id: 'word-sorting-basket',
    title: 'Word Sorting Basket',
    emoji: '🧺',
    description: 'Drag mixed words into the right category basket and score points.',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
    path: '/word-sorting-basket',
    category: 'Words'
  },
  {
    id: 'quiz',
    title: 'Audio Quiz',
    emoji: '📝',
    description: 'Listen to sounds and answer questions. Test your knowledge!',
    color: '#4ECDC4',
    gradient: 'linear-gradient(135deg, #4ECDC4, #44bd9e)',
    path: '/planet-selection',
    category: 'Letters'
  },
  {
    id: 'consonant',
    title: 'Consonant Quiz',
    emoji: '🧸',
    description: 'Tap the sound and match the consonant. Fast rounds, big fun!',
    color: '#06d6a0',
    gradient: 'linear-gradient(135deg, #06d6a0, #1b9aaa)',
    path: '/consonant-quiz',
    category: 'Letters',
    special: true
  },
  {
    id: 'mars',
    title: 'Mars Game',
    emoji: '🪐',
    description: 'Match images with words on Mars! Learn vocabulary through space adventure.',
    color: '#FF4757',
    gradient: 'linear-gradient(135deg, #ff4757, #c44569)',
    path: '/mars-games',
    category: 'Words'
  },
  {
    id: 'whack',
    title: 'Whack-a-Letter',
    emoji: '🔨',
    description: 'Whack the correct letters as they pop up! Fast-paced fun learning.',
    color: '#ffa502',
    gradient: 'linear-gradient(135deg, #ffa502, #e17055)',
    path: '/whack-select',
    category: 'Letters'
  },
  {
    id: 'akshara',
    title: 'Akshara Magic Lab',
    emoji: '🧙‍♂️',
    description: '8 magical levels! Learn aksharas through combining, splitting & word mastery.',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #6366f1)',
    path: '/akshara',
    category: 'Aksharas',
    special: true
  },
  {
    id: 'swara',
    title: 'Swara Sing-Along',
    emoji: '🎵',
    description: 'Learn all 13 Hindi vowels through a fun sing-along experience with audio and images!',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    path: '/swara-game',
    category: 'Sing-Along',
    special: true
  },
  {
    id: 'swara-memory',
    title: 'Swara Pair Cards',
    emoji: '🃏',
    description: 'Match Hindi vowel letters with their pictures! Fun memory card game.',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    path: '/swara-memory',
    category: 'Flashcards',
    special: true
  },
  {
    id: 'trace-vowel',
    title: 'Trace the Vowel',
    emoji: '✏️',
    description: 'Learn to write Hindi vowels by tracing numbered strokes step by step!',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    path: '/trace-vowel',
    category: 'Writing',
    special: true
  },
  {
    id: 'varnamal',
    title: 'Varnamala Puzzle',
    emoji: '🧩',
    description: 'Arrange consonants in alphabetical order! Drag and drop letters to complete the Varnamala.',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    path: '/varnamal',
    category: 'Puzzle',
    special: true
  },
  {
    id: 'scavenger',
    title: 'Akshar Scavenger Hunt',
    emoji: '🔍',
    description: 'Find hidden consonants in colorful scenes! Tap the letters hiding in the kitchen, market, and more.',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    path: '/scavenger',
    category: 'Spot-It',
    special: true
  },
  {
    id: 'matra',
    title: 'Matra Magic Builder',
    emoji: '✨',
    description: 'Drag & drop matras onto consonants to build Hindi words! Learn all 11 matras through fun challenges.',
    color: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    path: '/matra-game',
    category: 'Matras',
    special: true
  },
  {
    id: 'word-jumble',
    title: 'Word Jumble',
    emoji: '🌊',
    description: 'Words float freely on the board — drag them into the right order and press OK to score!',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0284c7)',
    path: '/word-jumble',
    category: 'Sentences',
    special: true
  },
  {
    id: 'shabd',
    title: 'Shabd Match',
    emoji: '🧩',
    description: 'Match the Hindi/Telugu words to their colorful pictures!',
    color: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    path: '/shabd',
    category: 'Word Games',
    special: true
  },
  {
    id: 'fill-story',
    title: 'Fill the Story',
    emoji: '📖',
    description: 'Fill blanks in funny stories with the right words! Read & hear the complete tale.',
    color: '#f472b6',
    gradient: 'linear-gradient(135deg, #f472b6, #a855f7)',
    path: '/fill-story',
    category: 'Stories',
    special: true
  },
  {
    id: 'crossword',
    title: 'Kids Crossword',
    emoji: '🎮',
    description: 'Solve crossword puzzles with picture clues! Learn new words level by level.',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    path: '/crossword',
    category: 'Puzzles',
    special: true
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  }
};

const GameHub = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem('userLanguage') || 'hindi');
  const playerName = localStorage.getItem('playerName') || localStorage.getItem('userName') || 'Player';

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
    }
  }, [navigate]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('userLanguage', lang);
  };

  const handleGameClick = (game) => {
    if (game.id === 'whack') {
      navigate(`/whack/${language}`);
    } else if (game.id === 'quiz') {
      navigate(`/planets/${language}`);
    } else if (game.id === 'balloon') {
      navigate('/balloon-selection', { state: { language } });
    } else if (game.id === 'bubble-shooter') {
      navigate('/bubble-shooter', { state: { language } });
    } else if (game.id === 'word-sorting-basket') {
      navigate('/word-sorting-basket', { state: { language } });
    } else if (game.id === 'mars') {
      navigate('/mars-games', { state: { language } });
    } else if (game.id === 'akshara') {
      navigate('/akshara', { state: { language } });
    } else {
      navigate(game.path, { state: { language } });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('playerId');
    localStorage.removeItem('playerName');
    localStorage.removeItem('playerEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userLanguage');
    localStorage.removeItem('akshara_session');
    navigate('/');
  };

  const handleLessons = () => {
    navigate('/lessons', { state: { language } });
  };

  return (
    <div className="game-hub">
      {/* Background */}
      <div className="hub-bg">
        <div className="hub-stars">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className={`hub-star ${['s', 'm', 'l'][i % 3]}`}
              style={{
                left: `${(i * 41 + 17) % 100}%`,
                top: `${(i * 59 + 11) % 100}%`,
                animationDelay: `${(i * 0.4) % 6}s`
              }}
            />
          ))}
        </div>
        <div className="hub-orb hub-orb-1" />
        <div className="hub-orb hub-orb-2" />
      </div>

      {/* Top Bar */}
      <motion.div
        className="hub-topbar"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="hub-user">
          <div className="hub-avatar">
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div className="hub-user-info">
            <span className="hub-welcome">Welcome back!</span>
            <span className="hub-name">{playerName}</span>
          </div>
        </div>

        <div className="hub-controls">
          <div className="hub-lang-toggle">
            <button
              className={`hub-lang-btn ${language === 'hindi' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('hindi')}
            >
              Hindi
            </button>
            <button
              className={`hub-lang-btn ${language === 'telugu' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('telugu')}
            >
              Telugu
            </button>
          </div>
          <button className="hub-logout-btn" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="hub-content">
        <motion.div
          className="hub-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="hub-title">
            <span className="hub-title-emoji">🎮</span>
            Choose Your Game
            <span className="hub-title-emoji">🌟</span>
          </h1>
          <p className="hub-subtitle">
            {GAMES.length} amazing games to learn {language === 'hindi' ? 'Hindi (हिंदी)' : 'Telugu (తెలుగు)'} letters and words!
          </p>
        </motion.div>

        {/* Lessons Banner */}
        <motion.div
          className="hub-lessons-banner"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={handleLessons}
        >
          <span className="lessons-icon">📚</span>
          <div className="lessons-text">
            <strong>Learn Words First!</strong>
            <span>Start with lessons before playing Mars Game</span>
          </div>
          <span className="lessons-arrow">→</span>
        </motion.div>

        {/* Game Grid */}
        <motion.div
          className="hub-game-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {GAMES.map((game) => (
            <motion.div
              key={game.id}
              className={`hub-game-card ${game.special ? 'special' : ''}`}
              variants={cardVariants}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { type: 'spring', stiffness: 300, damping: 15 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGameClick(game)}
              style={{ '--card-color': game.color, '--card-gradient': game.gradient }}
            >
              {game.special && <div className="special-badge">✨ NEW</div>}
              <div className="card-glow" />
              <div className="card-emoji-wrap">
                <span className="card-emoji">{game.emoji}</span>
              </div>
              <div className="card-info">
                <h3 className="card-title">{game.title}</h3>
                <span className="card-category">{game.category}</span>
                <p className="card-desc">{game.description}</p>
              </div>
              <div className="card-play">
                <span>Play</span>
                <span className="play-arrow">▶</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default GameHub;
