import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameHeader from './GameHeader';
import LevelBar from './LevelBar';
import LetterDisplay from './LetterDisplay';
import FloatingOptions from './FloatingOptions';
import WrongOverlay from './WrongOverlay';
import CorrectOverlay from './CorrectOverlay';
import ComboDisplay from './ComboDisplay';
import SparkleEffect from './SparkleEffect';

// ── PEEK MODE: flash the full syllable for 1.5s then hide it ──
function PeekFlash({ syllable, onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone(); }, 1500);
    return () => clearTimeout(t);
  }, [syllable, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="peek-flash-overlay"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 0.25 }}
        >
          <div className="peek-flash-syllable">{syllable}</div>
          <div className="peek-flash-hint">Remember it!</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function GameBoard({
  level, round, currentRound, totalRounds,
  score, streak, lives, maxLives,
  wrongMsg, correctMsg, showWrong, showCorrect, sparkleKey,
  disabled,
  onSelect, onBack, onSettings,
}) {
  const [peekDone, setPeekDone] = useState(false);
  const [disabledDuringPeek, setDisabledDuringPeek] = useState(false);

  // Reset peek state when round changes
  useEffect(() => {
    if (round?.mode === 'peek') {
      setPeekDone(false);
      setDisabledDuringPeek(true);
    } else {
      setPeekDone(true);
      setDisabledDuringPeek(false);
    }
  }, [round?.prompt, round?.mode]);

  const handlePeekDone = () => {
    setPeekDone(true);
    setDisabledDuringPeek(false);
  };

  if (!round) return null;

  const isPeek = round.mode === 'peek';
  const isDisabled = disabled || disabledDuringPeek;

  // Mode badge label
  const modeBadge = {
    forward:  '➕ Combine',
    reverse:  '🔍 Find Consonant',
    split:    '✂️ Split',
    peek:     '👁️ Memory',
    word:     '📝 Words',
    wordspot: '🔍 Word Detective',
    meaning:  '🧠 Meaning Match',
  }[round.mode] || '';

  // wordspot + word: big emoji card. meaning: text-only card (no emoji).
  const isEmojiMode  = round.mode === 'wordspot' || round.mode === 'word';
  const isMeaningMode = round.mode === 'meaning';
  const isPictureMode = isEmojiMode || isMeaningMode;
  const showWordHint = false;

  return (
    <>
      <GameHeader
        level={level}
        score={score}
        streak={streak}
        lives={lives}
        maxLives={maxLives}
        onBack={onBack}
        onSettings={onSettings}
      />
      <LevelBar level={level} currentRound={currentRound} totalRounds={totalRounds} />

      <div className="game-board">
        {modeBadge && <div className="mode-badge">{modeBadge}</div>}

        <div className="instruction-text">{round.instruction}</div>

        {/* Emoji picture quiz (wordspot / word) */}
        {isEmojiMode ? (
          <motion.div
            className="picture-card"
            key={round.prompt}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div className="picture-emoji">{round.prompt}</div>
            {round.promptLabel && <div className="picture-label">{round.promptLabel}</div>}
          </motion.div>

        ) : isMeaningMode ? (
          /* Meaning-only mode — no emoji, just the English word */
          <motion.div
            className="meaning-card"
            key={round.prompt}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div className="meaning-text">{round.prompt}</div>
          </motion.div>

        ) : (
          <>
            {showWordHint && (
              <div className="word-hint-badge">{round.emoji} {round.meaning}</div>
            )}
            <LetterDisplay round={round} peekDone={peekDone} />
          </>
        )}

        <FloatingOptions
          options={round.options}
          onSelect={onSelect}
          disabled={isDisabled}
          wordMode={isPictureMode}
        />

        {/* Peek waiting hint */}
        {isPeek && !peekDone && (
          <div className="peek-waiting">👁️ Watch carefully...</div>
        )}
      </div>

      {/* Peek flash overlay */}
      {isPeek && !peekDone && round.peekSyllable && (
        <PeekFlash syllable={round.peekSyllable} onDone={handlePeekDone} />
      )}

      <ComboDisplay streak={streak} />
      <SparkleEffect trigger={sparkleKey} />
      <WrongOverlay show={showWrong} message={wrongMsg} />
      <CorrectOverlay show={showCorrect} message={correctMsg} />
    </>
  );
}

