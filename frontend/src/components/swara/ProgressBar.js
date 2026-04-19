import React from 'react';

const ProgressBar = ({ swaraList, currentIndex, isStarted }) => {
    if (!swaraList.length) return null;

    return (
        <div className="swara-progress-section">
            <div className="swara-progress-label">
                {isStarted ? `${currentIndex + 1} / ${swaraList.length}` : `${swaraList.length} स्वर`}
            </div>
            <div className="swara-progress-dots">
                {swaraList.map((swara, index) => {
                    let dotClass = 'swara-progress-dot ';
                    if (index < currentIndex) dotClass += 'completed';
                    else if (index === currentIndex && isStarted) dotClass += 'active';
                    else dotClass += 'upcoming';

                    return (
                        <div key={swara.id} className={dotClass} title={swara.letter}>
                            {swara.letter}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProgressBar;
