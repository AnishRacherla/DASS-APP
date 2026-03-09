import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './AuthPage.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: 5,
    language: 'hindi'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!formData.name.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        if (!formData.email.trim() || !formData.password.trim()) {
          setError('Email and password are required');
          setLoading(false);
          return;
        }

        // Register with Akshara backend (Player model with hashed password)
        const aksharaRes = await axios.post(`${API_BASE}/api/akshara/auth/signup`, {
          email: formData.email,
          password: formData.password,
          playerName: formData.name.trim(),
          language: formData.language
        });

        if (aksharaRes.data.player) {
          const player = aksharaRes.data.player;

          // Also create user in the original backend for other games
          try {
            const userRes = await axios.post(`${API_BASE}/api/users`, {
              name: formData.name.trim(),
              age: parseInt(formData.age),
              language: formData.language
            });
            if (userRes.data.success) {
              localStorage.setItem('userId', userRes.data.user._id);
            }
          } catch (err) {
            console.warn('Legacy user creation failed:', err.message);
          }

          // Store unified login info
          localStorage.setItem('playerId', player._id);
          localStorage.setItem('playerName', player.playerName);
          localStorage.setItem('playerEmail', player.email);
          localStorage.setItem('userName', player.playerName);
          localStorage.setItem('userLanguage', formData.language);
          localStorage.setItem('isLoggedIn', 'true');

          navigate('/game-hub');
        }
      } else {
        // Login
        if (!formData.email.trim() || !formData.password.trim()) {
          setError('Email and password are required');
          setLoading(false);
          return;
        }

        const res = await axios.post(`${API_BASE}/api/akshara/auth/login`, {
          email: formData.email,
          password: formData.password
        });

        if (res.data.player) {
          const player = res.data.player;
          localStorage.setItem('playerId', player._id);
          localStorage.setItem('playerName', player.playerName);
          localStorage.setItem('playerEmail', player.email);
          localStorage.setItem('userName', player.playerName);
          localStorage.setItem('userLanguage', player.language || 'hindi');
          localStorage.setItem('isLoggedIn', 'true');

          // Find or create legacy User for other games (scores, progress)
          try {
            const userRes = await axios.post(`${API_BASE}/api/users/find-or-create`, {
              name: player.playerName,
              language: player.language || 'hindi'
            });
            if (userRes.data.success) {
              localStorage.setItem('userId', userRes.data.user._id);
            }
          } catch (err) {
            console.warn('Legacy user lookup failed:', err.message);
          }

          navigate('/game-hub');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-stars">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className={`auth-star ${['s', 'm', 'l'][i % 3]}`}
              style={{
                left: `${(i * 37 + 13) % 100}%`,
                top: `${(i * 53 + 7) % 100}%`,
                animationDelay: `${(i * 0.3) % 5}s`
              }}
            />
          ))}
        </div>
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo / Title */}
        <motion.div
          className="auth-header"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <div className="auth-logo">🚀</div>
          <h1 className="auth-title">Letter Space Adventure</h1>
          <p className="auth-subtitle">Learn Hindi & Telugu through 5 magical games!</p>
        </motion.div>

        {/* Game icons preview */}
        <div className="auth-game-preview">
          <span title="Balloon Pop">🎈</span>
          <span title="Mars Game">🪐</span>
          <span title="Whack-a-Mole">🔨</span>
          <span title="Quiz">📝</span>
          <span title="Akshara Magic Lab">🧙‍♂️</span>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            🔑 Login
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            ✨ Register
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="error"
                className="auth-error"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                ⚠️ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="auth-field">
            <label>📧 Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label>🔒 Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="auth-field">
                  <label>👤 Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="What should we call you?"
                    maxLength={20}
                  />
                </div>

                <div className="auth-field">
                  <label>🎂 Age (3-8 years)</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="3"
                    max="8"
                  />
                </div>

                <div className="auth-field">
                  <label>🌐 Preferred Language</label>
                  <div className="auth-lang-select">
                    <button
                      type="button"
                      className={`auth-lang-btn ${formData.language === 'hindi' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, language: 'hindi' })}
                    >
                      🇮🇳 Hindi
                    </button>
                    <button
                      type="button"
                      className={`auth-lang-btn ${formData.language === 'telugu' ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, language: 'telugu' })}
                    >
                      🇮🇳 Telugu
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading
              ? '⏳ Please wait...'
              : mode === 'login'
              ? '🚀 Login & Play!'
              : '✨ Create Account & Play!'
            }
          </motion.button>
        </form>

        <p className="auth-switch">
          {mode === 'login'
            ? "Don't have an account? "
            : 'Already have an account? '}
          <span onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Register here' : 'Login here'}
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
