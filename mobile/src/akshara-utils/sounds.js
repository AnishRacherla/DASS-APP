import { Audio } from 'expo-av';

let enabled = true;

export function setSoundEnabled(val) { enabled = val; }
export function isSoundEnabled() { return enabled; }

async function playTone(freq, duration = 150) {
  // React Native doesn't have Web Audio API oscillators.
  // We use a no-op placeholder. Sound feedback uses haptics or inline beeps.
  // The game still works — sound cues are visual + textual on mobile.
}

export function playPop() { playTone(600, 80); }

export function playCorrect() { playTone(523, 120); }

export function playWrong() { playTone(280, 200); }

export function playLevelUp() { playTone(523, 200); }

export function playCombo() { playTone(880, 80); }

export function playGameOver() { playTone(440, 350); }
