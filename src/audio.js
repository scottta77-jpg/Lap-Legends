/**
 * Web Audio API synthesizer for subtle motorsport sound design
 * Synthesizes aerodynamic whoosh and high-tech reveal feedback without external audio files.
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = true; // Default muted for respectful UX
    this.lastSoundTime = 0;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    return !this.isMuted;
  }

  playRevealWhoosh(intensity = 1.0) {
    if (this.isMuted) return;
    const now = performance.now();
    if (now - this.lastSoundTime < 350) return; // Debounce
    this.lastSoundTime = now;

    try {
      this.ensureContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.15);
      filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.35);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(280, this.ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.35);

      const vol = Math.min(0.08 * intensity, 0.15);
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.36);
    } catch {
      // AudioContext policy fallback
    }
  }

  playDriverSwitch() {
    if (this.isMuted) return;
    try {
      this.ensureContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.23);
    } catch {
      // AudioContext policy fallback
    }
  }
}

export const sound = new AudioManager();
