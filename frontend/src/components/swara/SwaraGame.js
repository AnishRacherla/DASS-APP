import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SwaraPlayer from './SwaraPlayer';
import './SwaraGame.css';

const API_URL = 'http://localhost:5001/api/swaras';

export default function SwaraGame() {
    const navigate = useNavigate();
    const [swaraList, setSwaraList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSwaras = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('No swaras found in database');
            }
            setSwaraList(data);
        } catch (err) {
            console.error('Failed to fetch swaras:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSwaras();
    }, []);

    return (
        <>
            <div className="swara-bg-particles" />
            <div className="swara-app-container">
                {/* Header */}
                <header className="swara-app-header">
                    <button className="swara-back-btn" onClick={() => navigate('/game-hub')}>
                        ← Back to Games
                    </button>
                    <h1>🎵 स्वर गीत — Sing-Along 🎵</h1>
                    <p>Hindi Vowels for Kids</p>
                </header>

                {/* Loading State */}
                {loading && (
                    <div className="swara-card">
                        <div className="swara-state-screen">
                            <div className="swara-loading-spinner" />
                            <div className="swara-state-title">लोड हो रहा है...</div>
                            <div className="swara-state-subtitle">Loading swaras from database</div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="swara-card">
                        <div className="swara-state-screen">
                            <div className="swara-state-emoji">😔</div>
                            <div className="swara-state-title">Oops!</div>
                            <div className="swara-error-msg">{error}</div>
                            <button className="swara-retry-btn" onClick={fetchSwaras}>
                                🔄 Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Player */}
                {!loading && !error && swaraList.length > 0 && (
                    <SwaraPlayer swaraList={swaraList} />
                )}
            </div>
        </>
    );
}
