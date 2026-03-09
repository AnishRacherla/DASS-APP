import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signup, login } from '../../akshara-utils/api';

export default function WelcomeScreen({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Please enter your name'); return; }

    setLoading(true);
    let result;
    if (mode === 'signup') {
      result = await signup(email, password, name.trim(), 'hindi');
    } else {
      result = await login(email, password);
    }
    setLoading(false);

    if (result?.error) {
      setError(result.error);
      return;
    }
    if (result?.player) {
      onAuth(result.player);
    } else {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <motion.div
      className="welcome-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="welcome-mascot"
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
      >
        🧙‍♂️
      </motion.div>

      <motion.h1
        className="welcome-title"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Akshara Magic Lab
      </motion.h1>

      <motion.p
        className="welcome-subtitle"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        Learn Hindi &amp; Telugu aksharas through magical challenges —
        combine, split, and master syllables! ✨
      </motion.p>

      {/* Auth Tabs */}
      <motion.div
        className="auth-tabs"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
      >
        <button
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => { setMode('login'); setError(''); }}
        >
          Login
        </button>
        <button
          className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
          onClick={() => { setMode('signup'); setError(''); }}
        >
          Sign Up
        </button>
      </motion.div>

      {/* Auth Form */}
      <motion.form
        className="auth-form"
        onSubmit={handleSubmit}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
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

        <input
          className="auth-input"
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
        />

        <AnimatePresence>
          {mode === 'signup' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ width: '100%', overflow: 'hidden' }}
            >
              <input
                className="auth-input"
                type="text"
                placeholder="Your display name"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={20}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="play-btn"
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? '⏳ Please wait...' : mode === 'login' ? '🚀 Login & Play' : '✨ Create Account'}
        </motion.button>
      </motion.form>

      <motion.p
        className="auth-switch-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {mode === 'login'
          ? "Don't have an account? "
          : 'Already have an account? '
        }
        <span
          className="auth-switch-link"
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
        >
          {mode === 'login' ? 'Sign up' : 'Login'}
        </span>
      </motion.p>
    </motion.div>
  );
}
