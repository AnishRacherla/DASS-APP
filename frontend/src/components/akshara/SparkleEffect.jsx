import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

export default function SparkleEffect({ trigger }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;
    // Fire confetti
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.55, x: 0.5 },
      colors: ['#a855f7', '#f472b6', '#fbbf24', '#34d399', '#60a5fa'],
      disableForReducedMotion: true,
    });

    // Small sparkle emojis
    const emojis = ['✨', '⭐', '💫', '🌟', '🎵', '💜', '💖'];
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[i % emojis.length],
      x: 30 + Math.random() * 40,
      y: 40 + Math.random() * 20,
      dx: (Math.random() - 0.5) * 200,
      dy: -100 - Math.random() * 150,
    }));
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 1200);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="sparkle-container">
      {particles.map(p => (
        <span
          key={p.id}
          className="sparkle-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `sparkleFloat 1s ease-out forwards`,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
          }}
        >
          {p.emoji}
        </span>
      ))}
      <style>{`
        @keyframes sparkleFloat {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
