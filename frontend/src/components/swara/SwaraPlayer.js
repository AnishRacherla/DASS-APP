import React, { useState, useRef, useEffect } from 'react';
import Controls from './Controls';
import ProgressBar from './ProgressBar';

const API_BASE = 'http://localhost:5001';

const SwaraPlayer = ({ swaraList }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [animClass, setAnimClass] = useState('');

    const audioRef = useRef(null);
    const autoPlayEnabled = useRef(false);
    const animTimerRef = useRef(null);

    const currentSwara = swaraList[currentIndex];

    // Preload all images on mount
    useEffect(() => {
        swaraList.forEach((swara) => {
            const img = new Image();
            img.src = `${API_BASE}${swara.image}`;
        });
    }, [swaraList]);

    // Update audio muted state live
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    }, [isMuted]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopAudio();
            if (animTimerRef.current) clearTimeout(animTimerRef.current);
        };
    }, []);

    // === CORE AUDIO FUNCTIONS ===

    // Completely stop and destroy current audio
    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.onended = null;
            audioRef.current.onerror = null;
            audioRef.current = null;
        }
    };

    // Play audio for a specific index, with onEnd callback
    const playAudioForIndex = (index) => {
        // Always stop existing audio first
        stopAudio();

        const swara = swaraList[index];
        if (!swara) return;

        const audio = new Audio(`${API_BASE}${swara.audio}`);
        audio.muted = isMuted;
        audioRef.current = audio;

        audio.onended = () => {
            // Only auto-advance if autoplay is still enabled
            if (autoPlayEnabled.current) {
                if (index < swaraList.length - 1) {
                    const nextIndex = index + 1;
                    setCurrentIndex(nextIndex);
                    triggerEntryAnimation();
                    // Play next after a small delay for animation
                    setTimeout(() => {
                        if (autoPlayEnabled.current) {
                            playAudioForIndex(nextIndex);
                        }
                    }, 400);
                } else {
                    // All done!
                    autoPlayEnabled.current = false;
                    setIsPlaying(false);
                    setIsStarted(false);
                    setIsCompleted(true);
                }
            }
        };

        audio.onerror = () => {
            console.warn('Audio failed to load for index:', index);
        };

        audio.play().catch((err) => {
            console.warn('Audio play failed:', err);
        });
    };

    // Trigger entry animation
    const triggerEntryAnimation = () => {
        if (animTimerRef.current) clearTimeout(animTimerRef.current);
        setAnimClass('entering');
        animTimerRef.current = setTimeout(() => {
            setAnimClass('playing');
        }, 600);
    };

    // === CONTROL HANDLERS ===

    const handleStart = () => {
        setIsCompleted(false);
        setCurrentIndex(0);
        setIsPlaying(true);
        setIsStarted(true);
        autoPlayEnabled.current = true;
        triggerEntryAnimation();

        setTimeout(() => {
            playAudioForIndex(0);
        }, 400);
    };

    const handlePause = () => {
        setIsPlaying(false);
        autoPlayEnabled.current = false;
        setAnimClass('');
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const handleResume = () => {
        setIsPlaying(true);
        autoPlayEnabled.current = true;
        setAnimClass('playing');
        if (audioRef.current) {
            // Resume the paused audio
            audioRef.current.play().catch(console.warn);
        } else {
            // If audio was cleaned up, play current index fresh
            playAudioForIndex(currentIndex);
        }
    };

    const handleNext = () => {
        if (currentIndex >= swaraList.length - 1) return;

        const nextIdx = currentIndex + 1;

        // Stop everything first
        stopAudio();

        setCurrentIndex(nextIdx);
        triggerEntryAnimation();

        if (isPlaying && autoPlayEnabled.current) {
            // Auto-play mode: play next audio after animation
            setTimeout(() => {
                playAudioForIndex(nextIdx);
            }, 400);
        }
    };

    const handlePrev = () => {
        if (currentIndex <= 0) return;

        const prevIdx = currentIndex - 1;

        // Stop everything first
        stopAudio();

        setCurrentIndex(prevIdx);
        triggerEntryAnimation();

        if (isPlaying && autoPlayEnabled.current) {
            setTimeout(() => {
                playAudioForIndex(prevIdx);
            }, 400);
        }
    };

    const handleReplay = () => {
        stopAudio();
        triggerEntryAnimation();
        setTimeout(() => {
            playAudioForIndex(currentIndex);
        }, 300);
    };

    const handleToggleMute = () => {
        setIsMuted((prev) => !prev);
    };

    const handlePlayAgain = () => {
        handleStart();
    };

    // ===== COMPLETION SCREEN =====
    if (isCompleted) {
        return (
            <div className="swara-card">
                <div className="swara-state-screen">
                    <div className="swara-completion-stars">
                        <span className="swara-star">⭐</span>
                        <span className="swara-star">🌟</span>
                        <span className="swara-star">⭐</span>
                        <span className="swara-star">🌟</span>
                        <span className="swara-star">⭐</span>
                    </div>
                    <div className="swara-state-emoji">🎉</div>
                    <div className="swara-state-title">Well Done! Great Job! 🎊</div>
                    <div className="swara-state-subtitle">
                        You learned all 13 Hindi vowels!<br />
                        तुमने सभी 13 स्वर सीख लिए!
                    </div>
                    <button className="swara-play-again-btn" onClick={handlePlayAgain}>
                        🔁 Play Again!
                    </button>
                </div>
            </div>
        );
    }

    // ===== WELCOME SCREEN (before start) =====
    if (!isStarted) {
        return (
            <div className="swara-card">
                <div className="swara-state-screen">
                    <div className="swara-state-emoji">🎵</div>
                    <div className="swara-state-title">Sing-Along Swara Song!</div>
                    <div className="swara-state-subtitle">
                        Learn all 13 Hindi vowels<br />
                        हिंदी के सभी 13 स्वर सीखो!
                    </div>
                    <button className="swara-start-btn" onClick={handleStart}>
                        ▶ Start!
                    </button>
                </div>
                <ProgressBar
                    swaraList={swaraList}
                    currentIndex={currentIndex}
                    isStarted={false}
                />
            </div>
        );
    }

    // ===== MAIN PLAYER =====
    return (
        <div className="swara-card">
            {/* Letter */}
            <div className="swara-letter-container">
                <div className={`swara-letter ${animClass}`}>
                    {currentSwara.letter}
                </div>
            </div>

            {/* Image */}
            <div className={`swara-image-container ${animClass}`}>
                <img
                    className="swara-image"
                    src={`${API_BASE}${currentSwara.image}`}
                    alt={currentSwara.word}
                    draggable={false}
                />
            </div>

            {/* Word */}
            <div className={`swara-word ${animClass}`}>
                {currentSwara.word}
            </div>

            {/* Phrase */}
            <div className={`swara-phrase ${animClass}`}>
                {currentSwara.letter} से {currentSwara.word}
            </div>

            {/* Progress */}
            <ProgressBar
                swaraList={swaraList}
                currentIndex={currentIndex}
                isStarted={true}
            />

            {/* Controls */}
            <Controls
                isPlaying={isPlaying}
                isMuted={isMuted}
                isStarted={isStarted}
                canGoPrev={currentIndex > 0}
                canGoNext={currentIndex < swaraList.length - 1}
                onStart={handleStart}
                onPause={handlePause}
                onResume={handleResume}
                onNext={handleNext}
                onPrev={handlePrev}
                onReplay={handleReplay}
                onToggleMute={handleToggleMute}
            />
        </div>
    );
};

export default SwaraPlayer;
