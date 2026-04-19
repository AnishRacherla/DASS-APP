let audioCtx = null;
let enabled = true;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function resumeCtx() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
}

export function setSoundEnabled(val) { enabled = val; }
export function isSoundEnabled() { return enabled; }

function playTone(freq, duration = 0.15, type = 'sine', vol = 0.25) {
  if (!enabled) return;
  try {
    resumeCtx();
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function playPop() { playTone(600, 0.08, 'sine', 0.2); }

export function playCorrect() {
  playTone(523, 0.12, 'sine', 0.25);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.25), 100);
  setTimeout(() => playTone(784, 0.2, 'sine', 0.3), 200);
}

export function playWrong() {
  playTone(280, 0.2, 'sawtooth', 0.15);
  setTimeout(() => playTone(220, 0.3, 'sawtooth', 0.15), 150);
}

export function playLevelUp() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.3), i * 120));
}

export function playCombo() {
  playTone(880, 0.08, 'square', 0.12);
  setTimeout(() => playTone(1100, 0.1, 'square', 0.15), 60);
}

export function playGameOver() {
  const notes = [440, 349, 294, 220];
  notes.forEach((f, i) => setTimeout(() => playTone(f, 0.35, 'sawtooth', 0.15), i * 200));
}
