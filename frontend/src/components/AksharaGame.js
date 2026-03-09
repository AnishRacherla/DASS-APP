import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import BackgroundShapes from './akshara/BackgroundShapes';
import LevelSelectScreen from './akshara/LevelSelectScreen';
import GameBoard from './akshara/GameBoard';
import LevelComplete from './akshara/LevelComplete';
import GameOverOverlay from './akshara/GameOverOverlay';
import SettingsPanel from './akshara/SettingsPanel';
import { LEVELS, WRONG_MESSAGES, CORRECT_MESSAGES } from '../akshara-data/gameData';
import { generateRound, calcStars, calcScore, resetUsedPrompts } from '../akshara-utils/gameHelpers';
import { playCorrect, playWrong, playLevelUp, playCombo, playGameOver } from '../akshara-utils/sounds';
import { completeLevel as apiCompleteLevel, updateLanguage as apiUpdateLanguage } from '../akshara-utils/api';
import './AksharaGame.css';

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const emptyProgress = () => ({ completed: [], stars: {} });

const AksharaGame = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [screen, setScreen] = useState('levels');
  const [language, setLanguage] = useState(
    location.state?.language || localStorage.getItem('userLanguage') || 'hindi'
  );
  const playerName = localStorage.getItem('playerName') || localStorage.getItem('userName') || 'Player';
  const playerId = localStorage.getItem('playerId');

  const [langProgress, setLangProgress] = useState({ hindi: emptyProgress(), telugu: emptyProgress() });

  const [currentLevel, setCurrentLevel] = useState(null);
  const [round, setRound] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(5);
  const [correctCount, setCorrectCount] = useState(0);
  const [disabled, setDisabled] = useState(false);

  const [showWrong, setShowWrong] = useState(false);
  const [wrongMsg, setWrongMsg] = useState('');
  const [showCorrect, setShowCorrect] = useState(false);
  const [correctMsg, setCorrectMsg] = useState('');
  const [sparkleKey, setSparkleKey] = useState(0);

  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({ sound: true, music: false, animations: true });

  const totalRoundsRef = useRef(0);
  const submittingRef = useRef(false); // guard: prevent double API submission

  const completedLevels = langProgress[language]?.completed || [];
  const levelStars = langProgress[language]?.stars || {};

  // Restore akshara session progress
  useEffect(() => {
    const saved = localStorage.getItem('akshara_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (session.langProgress) {
          setLangProgress(session.langProgress);
        }
      } catch { }
    }
  }, []);

  const startLevel = useCallback((level) => {
    resetUsedPrompts();
    submittingRef.current = false; // reset guard for new level
    setCurrentLevel(level);
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(level.lives);
    setCorrectCount(0);
    totalRoundsRef.current = level.rounds;
    setDisabled(false);

    const newRound = generateRound(level, language);
    setRound(newRound);
    setCurrentRound(1);
    setScreen('playing');
  }, [language]);

  const advanceRound = useCallback((wasCorrect) => {
    const updatedCorrect = wasCorrect ? correctCount + 1 : correctCount;

    if (currentRound >= totalRoundsRef.current) {
      playLevelUp();
      const stars = calcStars(updatedCorrect, totalRoundsRef.current);
      const lvlId = currentLevel.id;
      const lang = language;

      setLangProgress(prev => {
        const langData = prev[lang] || emptyProgress();
        const newCompleted = langData.completed.includes(lvlId)
          ? langData.completed
          : [...langData.completed, lvlId];
        const newStars = { ...langData.stars, [lvlId]: Math.max(langData.stars[lvlId] || 0, stars) };
        const updated = { ...prev, [lang]: { completed: newCompleted, stars: newStars } };

        const session = JSON.parse(localStorage.getItem('akshara_session') || '{}');
        localStorage.setItem('akshara_session', JSON.stringify({ ...session, langProgress: updated }));
        return updated;
      });

      if (playerId && !submittingRef.current) {
        submittingRef.current = true; // lock to prevent duplicate saves
        apiCompleteLevel(playerId, {
          levelId: lvlId,
          language: lang,
          score,
          stars,
          accuracy: Math.round((updatedCorrect / totalRoundsRef.current) * 100),
          bestStreak: Math.max(bestStreak, streak),
          roundsPlayed: totalRoundsRef.current,
          correct: updatedCorrect,
          wrong: totalRoundsRef.current - updatedCorrect,
        }).catch(() => { });
      }

      setScreen('levelComplete');
      return;
    }

    setDisabled(false);
    const newRound = generateRound(currentLevel, language);
    setRound(newRound);
    setCurrentRound(prev => prev + 1);
  }, [currentRound, currentLevel, language, correctCount, score, bestStreak, streak, playerId]);

  const handleSelect = useCallback((option) => {
    if (disabled) return;
    setDisabled(true);

    if (option.correct) {
      playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      if (newStreak >= 3) playCombo();

      const points = calcScore(1, newStreak, currentLevel.id);
      setScore(prev => prev + points);
      setCorrectCount(prev => prev + 1);

      setCorrectMsg(pick(CORRECT_MESSAGES));
      setShowCorrect(true);
      setSparkleKey(prev => prev + 1);

      setTimeout(() => {
        setShowCorrect(false);
        advanceRound(true);
      }, 800);
    } else {
      playWrong();
      setStreak(0);
      setWrongMsg(pick(WRONG_MESSAGES));
      setShowWrong(true);

      if (currentLevel.penalty) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setTimeout(() => {
              playGameOver();
              setShowWrong(false);
              setScreen('gameOver');
            }, 900);
          }
          return newLives;
        });
      }

      setTimeout(() => {
        setShowWrong(false);
        setLives(currentLives => {
          if (currentLives > 0 || !currentLevel.penalty) {
            advanceRound(false);
          }
          return currentLives;
        });
      }, 900);
    }
  }, [disabled, streak, bestStreak, currentLevel, advanceRound]);

  const handleNextLevel = useCallback(() => {
    const nextIdx = LEVELS.findIndex(l => l.id === currentLevel.id) + 1;
    if (nextIdx < LEVELS.length) {
      startLevel(LEVELS[nextIdx]);
    } else {
      setScreen('levels');
    }
  }, [currentLevel, startLevel]);

  const handleChangeLanguage = useCallback(async (lang) => {
    setLanguage(lang);
    localStorage.setItem('userLanguage', lang);
    if (playerId) {
      apiUpdateLanguage(playerId, lang).catch(() => { });
    }
    const session = JSON.parse(localStorage.getItem('akshara_session') || '{}');
    localStorage.setItem('akshara_session', JSON.stringify({ ...session, language: lang }));
  }, [playerId]);

  const handleBack = () => {
    if (screen === 'levels') {
      navigate('/game-hub');
    } else {
      setScreen('levels');
    }
  };

  return (
    <div className="akshara-game-wrapper">
      <BackgroundShapes />

      <AnimatePresence mode="wait">
        {screen === 'levels' && (
          <LevelSelectScreen
            key="levels"
            onSelectLevel={startLevel}
            onBack={handleBack}
            completedLevels={completedLevels}
            levelStars={levelStars}
            playerName={playerName}
            language={language}
            onChangeLanguage={handleChangeLanguage}
          />
        )}

        {screen === 'playing' && currentLevel && round && (
          <GameBoard
            key="playing"
            level={currentLevel}
            round={round}
            currentRound={currentRound}
            totalRounds={totalRoundsRef.current}
            score={score}
            streak={streak}
            lives={lives}
            maxLives={currentLevel.lives}
            wrongMsg={wrongMsg}
            correctMsg={correctMsg}
            showWrong={showWrong}
            showCorrect={showCorrect}
            sparkleKey={sparkleKey}
            disabled={disabled}
            onSelect={handleSelect}
            onBack={() => setScreen('levels')}
            onSettings={() => setShowSettings(true)}
          />
        )}
      </AnimatePresence>

      <LevelComplete
        show={screen === 'levelComplete'}
        level={currentLevel || LEVELS[0]}
        stars={calcStars(correctCount, totalRoundsRef.current)}
        score={score}
        correct={correctCount}
        total={totalRoundsRef.current}
        bestStreak={bestStreak}
        onNext={handleNextLevel}
        onLevels={() => setScreen('levels')}
      />

      <GameOverOverlay
        show={screen === 'gameOver'}
        score={score}
        onRetry={() => currentLevel && startLevel(currentLevel)}
        onQuit={() => setScreen('levels')}
      />

      <SettingsPanel
        show={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />
    </div>
  );
};

export default AksharaGame;
