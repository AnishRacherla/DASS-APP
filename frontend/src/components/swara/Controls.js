import React from 'react';

const Controls = ({
    isPlaying,
    isMuted,
    isStarted,
    canGoPrev,
    canGoNext,
    onStart,
    onPause,
    onResume,
    onNext,
    onPrev,
    onReplay,
    onToggleMute,
}) => {
    return (
        <div className="swara-controls-container">
            {/* Previous */}
            <div className="swara-control-btn-wrapper">
                <button
                    className="swara-control-btn swara-btn-nav"
                    onClick={onPrev}
                    disabled={!isStarted || !canGoPrev}
                    aria-label="Previous"
                >
                    ⏮
                </button>
                <span className="swara-btn-label">Prev</span>
            </div>

            {/* Play / Pause */}
            {!isStarted ? (
                <div className="swara-control-btn-wrapper">
                    <button className="swara-control-btn swara-btn-play" onClick={onStart} aria-label="Start">
                        ▶
                    </button>
                    <span className="swara-btn-label">Start</span>
                </div>
            ) : isPlaying ? (
                <div className="swara-control-btn-wrapper">
                    <button className="swara-control-btn swara-btn-pause" onClick={onPause} aria-label="Pause">
                        ⏸
                    </button>
                    <span className="swara-btn-label">Pause</span>
                </div>
            ) : (
                <div className="swara-control-btn-wrapper">
                    <button className="swara-control-btn swara-btn-play" onClick={onResume} aria-label="Resume">
                        ▶
                    </button>
                    <span className="swara-btn-label">Play</span>
                </div>
            )}

            {/* Next */}
            <div className="swara-control-btn-wrapper">
                <button
                    className="swara-control-btn swara-btn-nav"
                    onClick={onNext}
                    disabled={!isStarted || !canGoNext}
                    aria-label="Next"
                >
                    ⏭
                </button>
                <span className="swara-btn-label">Next</span>
            </div>

            {/* Replay */}
            <div className="swara-control-btn-wrapper">
                <button
                    className="swara-control-btn swara-btn-replay"
                    onClick={onReplay}
                    disabled={!isStarted}
                    aria-label="Replay"
                >
                    🔁
                </button>
                <span className="swara-btn-label">Replay</span>
            </div>

            {/* Mute/Unmute */}
            <div className="swara-control-btn-wrapper">
                <button
                    className={`swara-control-btn swara-btn-mute ${isMuted ? 'muted' : ''}`}
                    onClick={onToggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? '🔇' : '🔊'}
                </button>
                <span className="swara-btn-label">{isMuted ? 'Unmute' : 'Mute'}</span>
            </div>
        </div>
    );
};

export default Controls;
