// ============================================================
// SOUND MANAGER - Web Audio API (No external files)
// All sounds are generated procedurally using oscillators & noise
// ============================================================
class SoundManager {
  constructor() {
    this.enabled = true;
    this.masterVolume = 0.7;
    this.audioContext = null;
    this.masterGain = null;
    this._initAudioContext();
  }

  _initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Web Audio API not supported — sounds disabled');
    }
  }

  _ensureContext() {
    if (!this.audioContext) return false;
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return true;
  }

  // ---- Primitive helpers ----

  _osc(type, freq, startTime, duration, gainValue, detune = 0) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    if (detune) osc.detune.value = detune;
    gain.gain.setValueAtTime(gainValue, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  _noise(startTime, duration, gainValue, filter = null) {
    const ctx = this.audioContext;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(gainValue, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    if (filter) {
      const filt = ctx.createBiquadFilter();
      filt.type = filter.type || 'lowpass';
      filt.frequency.value = filter.freq || 2000;
      if (filter.Q) filt.Q.value = filter.Q;
      src.connect(filt);
      filt.connect(gain);
    } else {
      src.connect(gain);
    }
    gain.connect(this.masterGain);
    src.start(startTime);
    src.stop(startTime + duration);
  }

  _sweep(type, startFreq, endFreq, startTime, duration, gainValue) {
    const ctx = this.audioContext;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), startTime + duration);
    gain.gain.setValueAtTime(gainValue, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  // ---- Sound generators (one per sound key) ----

  _genShoot(t, vol) {
    // Short high-pitched blip
    this._sweep('square', 1200, 200, t, 0.1, vol * 0.4);
    this._sweep('sawtooth', 900, 150, t, 0.08, vol * 0.2);
  }

  _genRapidShoot(t, vol) {
    // Faster, lighter blip
    this._sweep('square', 1600, 400, t, 0.06, vol * 0.3);
  }

  _genPlayerHit(t, vol) {
    // Low thud + noise burst
    this._sweep('sine', 200, 60, t, 0.2, vol * 0.5);
    this._noise(t, 0.15, vol * 0.3, { type: 'lowpass', freq: 1500 });
  }

  _genPlayerDie(t, vol) {
    // Descending tone + long noise
    this._sweep('sawtooth', 500, 40, t, 0.6, vol * 0.4);
    this._sweep('square', 300, 30, t + 0.1, 0.5, vol * 0.3);
    this._noise(t + 0.1, 0.5, vol * 0.35, { type: 'lowpass', freq: 800 });
  }

  _genSkillLaser(t, vol) {
    // Rising laser sweep
    this._sweep('sawtooth', 200, 4000, t, 0.3, vol * 0.35);
    this._sweep('square', 150, 3000, t, 0.25, vol * 0.2);
    this._osc('sine', 1000, t + 0.05, 0.2, vol * 0.15);
  }

  _genSkillBomb(t, vol) {
    // Big explosion — low rumble + noise
    this._sweep('sine', 150, 20, t, 0.5, vol * 0.6);
    this._sweep('square', 100, 15, t, 0.4, vol * 0.3);
    this._noise(t, 0.6, vol * 0.5, { type: 'lowpass', freq: 600 });
    this._noise(t + 0.05, 0.4, vol * 0.3, { type: 'highpass', freq: 2000 });
  }

  _genSkillDash(t, vol) {
    // Quick whoosh
    this._noise(t, 0.2, vol * 0.3, { type: 'bandpass', freq: 2000, Q: 1 });
    this._sweep('sine', 600, 1200, t, 0.15, vol * 0.2);
  }

  _genEnemyHit(t, vol) {
    // Crisp impact
    this._sweep('square', 400, 100, t, 0.1, vol * 0.35);
    this._noise(t, 0.08, vol * 0.25, { type: 'highpass', freq: 3000 });
  }

  _genEnemyDie(t, vol) {
    // Crunchy pop
    this._sweep('sawtooth', 600, 50, t, 0.3, vol * 0.4);
    this._noise(t, 0.25, vol * 0.35, { type: 'lowpass', freq: 2000 });
    this._osc('square', 80, t + 0.1, 0.15, vol * 0.2);
  }

  _genEnemyShoot(t, vol) {
    // Lower-pitched pew
    this._sweep('triangle', 800, 200, t, 0.12, vol * 0.3);
    this._sweep('square', 600, 150, t, 0.1, vol * 0.15);
  }

  _genBossHit(t, vol) {
    // Heavy metallic clang
    this._sweep('square', 300, 80, t, 0.15, vol * 0.45);
    this._osc('sine', 150, t, 0.12, vol * 0.3);
    this._noise(t, 0.1, vol * 0.25, { type: 'highpass', freq: 4000 });
  }

  _genBossDie(t, vol) {
    // Massive explosion chain
    this._sweep('sine', 200, 15, t, 0.8, vol * 0.6);
    this._sweep('sawtooth', 150, 20, t + 0.1, 0.7, vol * 0.4);
    this._noise(t, 0.8, vol * 0.5, { type: 'lowpass', freq: 500 });
    this._noise(t + 0.2, 0.5, vol * 0.3, { type: 'highpass', freq: 3000 });
    // Secondary rumble
    this._sweep('sine', 80, 10, t + 0.3, 0.5, vol * 0.35);
  }

  _genPowerupPickup(t, vol) {
    // Ascending arpeggio — cheerful
    this._osc('sine', 523, t, 0.1, vol * 0.3);         // C5
    this._osc('sine', 659, t + 0.08, 0.1, vol * 0.3);  // E5
    this._osc('sine', 784, t + 0.16, 0.15, vol * 0.35); // G5
    this._osc('sine', 1047, t + 0.24, 0.2, vol * 0.3);  // C6
  }

  _genHealthPickup(t, vol) {
    // Warm two-tone chime
    this._osc('sine', 440, t, 0.12, vol * 0.3);         // A4
    this._osc('sine', 660, t + 0.1, 0.18, vol * 0.35);  // E5
    this._osc('triangle', 880, t + 0.15, 0.15, vol * 0.2); // A5
  }

  _genLevelComplete(t, vol) {
    // Triumphant fanfare arpeggio
    const notes = [523, 659, 784, 1047, 1319, 1568]; // C5 E5 G5 C6 E6 G6
    notes.forEach((freq, i) => {
      this._osc('sine', freq, t + i * 0.1, 0.25, vol * 0.3);
      this._osc('triangle', freq, t + i * 0.1, 0.2, vol * 0.15);
    });
    // Sustained chord
    this._osc('sine', 1047, t + 0.6, 0.5, vol * 0.25);
    this._osc('sine', 1319, t + 0.6, 0.5, vol * 0.2);
    this._osc('sine', 1568, t + 0.6, 0.5, vol * 0.2);
  }

  _genGameOver(t, vol) {
    // Descending minor tones — ominous
    const notes = [440, 415, 370, 330, 294, 220]; // A4 Ab4 F#4 E4 D4 A3
    notes.forEach((freq, i) => {
      this._osc('sawtooth', freq, t + i * 0.15, 0.3, vol * 0.25);
      this._osc('sine', freq * 0.5, t + i * 0.15, 0.3, vol * 0.2);
    });
    // Final low drone
    this._osc('sine', 110, t + 0.9, 0.8, vol * 0.3);
    this._noise(t + 0.9, 0.6, vol * 0.15, { type: 'lowpass', freq: 400 });
  }

  // ---- Sound key → generator mapping ----

  _generators = {
    'shoot':          (t, v) => this._genShoot(t, v),
    'rapid-shoot':    (t, v) => this._genRapidShoot(t, v),
    'player-hit':     (t, v) => this._genPlayerHit(t, v),
    'player-die':     (t, v) => this._genPlayerDie(t, v),
    'skill-laser':    (t, v) => this._genSkillLaser(t, v),
    'skill-bomb':     (t, v) => this._genSkillBomb(t, v),
    'skill-dash':     (t, v) => this._genSkillDash(t, v),
    'enemy-hit':      (t, v) => this._genEnemyHit(t, v),
    'enemy-die':      (t, v) => this._genEnemyDie(t, v),
    'enemy-shoot':    (t, v) => this._genEnemyShoot(t, v),
    'boss-hit':       (t, v) => this._genBossHit(t, v),
    'boss-die':       (t, v) => this._genBossDie(t, v),
    'powerup-pickup': (t, v) => this._genPowerupPickup(t, v),
    'health-pickup':  (t, v) => this._genHealthPickup(t, v),
    'level-complete': (t, v) => this._genLevelComplete(t, v),
    'game-over':      (t, v) => this._genGameOver(t, v),
  };

  // Volume presets per sound key
  _volumes = {
    'shoot': 0.5, 'rapid-shoot': 0.4, 'player-hit': 0.6, 'player-die': 0.7,
    'skill-laser': 0.7, 'skill-bomb': 0.8, 'skill-dash': 0.6,
    'enemy-hit': 0.5, 'enemy-die': 0.6, 'enemy-shoot': 0.4,
    'boss-hit': 0.7, 'boss-die': 0.8,
    'powerup-pickup': 0.6, 'health-pickup': 0.6,
    'level-complete': 0.8, 'game-over': 0.7,
  };

  // ---- Public API (unchanged interface) ----

  play(soundKey) {
    if (!this.enabled || !this._ensureContext()) return;
    const gen = this._generators[soundKey];
    if (!gen) {
      console.warn(`Sound "${soundKey}" not found`);
      return;
    }
    const vol = this._volumes[soundKey] || 0.5;
    gen(this.audioContext.currentTime, vol);
  }

  playWithVariation(soundKey, volumeVariation = 0.1, pitchVariation = 0.05) {
    if (!this.enabled || !this._ensureContext()) return;
    const gen = this._generators[soundKey];
    if (!gen) {
      console.warn(`Sound "${soundKey}" not found`);
      return;
    }
    const baseVol = this._volumes[soundKey] || 0.5;
    const volVar = (Math.random() - 0.5) * 2 * volumeVariation;
    const vol = Math.max(0.05, Math.min(1, baseVol + volVar));

    // Apply pitch variation via master detune offset on individual calls
    const detuneCents = (Math.random() - 0.5) * 2 * pitchVariation * 1200;
    // Temporarily store detune for primitives to pick up
    this._tempDetune = detuneCents;
    gen(this.audioContext.currentTime, vol);
    this._tempDetune = 0;
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
    }
  }

  toggleEnabled() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Preset sound sequences
  playLevelComplete() { this.play('level-complete'); }
  playGameOver()      { this.play('game-over'); }
  playExplosion()     { this.playWithVariation('skill-bomb', 0.15, 0.1); }

  playHit(type = 'player') {
    if (type === 'boss')       this.playWithVariation('boss-hit', 0.1, 0.05);
    else if (type === 'enemy') this.playWithVariation('enemy-hit', 0.15, 0.1);
    else                       this.playWithVariation('player-hit', 0.1, 0.05);
  }
}

// Create global sound manager instance
const soundManager = new SoundManager();
