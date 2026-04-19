import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { setSoundEnabled } from '../../akshara-utils/sounds';

export default function SettingsPanel({ show, onClose, settings, onUpdateSettings }) {
  if (!show) return null;

  const toggleSound = () => {
    const newVal = !settings.sound;
    setSoundEnabled(newVal);
    onUpdateSettings({ ...settings, sound: newVal });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="settings-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="settings-backdrop" onClick={onClose} />
          <motion.div
            className="settings-panel"
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <button className="close-settings-btn" onClick={onClose}>✕</button>
            <h3 className="settings-title">⚙️ Settings</h3>

            <div className="setting-row">
              <div className="setting-label">
                <span className="s-icon">🔊</span> Sound Effects
              </div>
              <button
                className={`toggle-switch ${settings.sound ? 'on' : 'off'}`}
                onClick={toggleSound}
              />
            </div>

            <div className="setting-row">
              <div className="setting-label">
                <span className="s-icon">🎵</span> Music
              </div>
              <button
                className={`toggle-switch ${settings.music ? 'on' : 'off'}`}
                onClick={() => onUpdateSettings({ ...settings, music: !settings.music })}
              />
            </div>

            <div className="setting-row">
              <div className="setting-label">
                <span className="s-icon">✨</span> Animations
              </div>
              <button
                className={`toggle-switch ${settings.animations ? 'on' : 'off'}`}
                onClick={() => onUpdateSettings({ ...settings, animations: !settings.animations })}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
