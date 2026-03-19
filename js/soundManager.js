// ============================================================
// SOUND MANAGER
// ============================================================
class SoundManager {
  constructor() {
    this.enabled = true;
    this.masterVolume = 0.7;
    this.sounds = {};
    this.audioContext = null;
    this.initAudioContext();
    this.loadSounds();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (e) {
      console.warn('Web Audio API not supported, using HTML Audio fallback');
    }
  }

  loadSounds() {
    // Define all game sounds - can load from files or generate with Web Audio API
    const soundDefinitions = {
      // Player actions
      'shoot': { file: 'assets/sounds/shoot.mp3', volume: 0.5 },
      'rapid-shoot': { file: 'assets/sounds/rapid-shoot.mp3', volume: 0.4 },
      'player-hit': { file: 'assets/sounds/player-hit.mp3', volume: 0.6 },
      'player-die': { file: 'assets/sounds/player-die.mp3', volume: 0.7 },
      
      // Skills
      'skill-laser': { file: 'assets/sounds/skill-laser.mp3', volume: 0.7 },
      'skill-bomb': { file: 'assets/sounds/skill-bomb.mp3', volume: 0.8 },
      'skill-dash': { file: 'assets/sounds/skill-dash.mp3', volume: 0.6 },
      
      // Enemy actions
      'enemy-hit': { file: 'assets/sounds/enemy-hit.mp3', volume: 0.5 },
      'enemy-die': { file: 'assets/sounds/enemy-die.mp3', volume: 0.6 },
      'enemy-shoot': { file: 'assets/sounds/enemy-shoot.mp3', volume: 0.4 },
      'boss-hit': { file: 'assets/sounds/boss-hit.mp3', volume: 0.7 },
      'boss-die': { file: 'assets/sounds/boss-die.mp3', volume: 0.8 },
      
      // Pickups and events
      'powerup-pickup': { file: 'assets/sounds/powerup-pickup.mp3', volume: 0.6 },
      'health-pickup': { file: 'assets/sounds/health-pickup.mp3', volume: 0.6 },
      'level-complete': { file: 'assets/sounds/level-complete.mp3', volume: 0.8 },
      'game-over': { file: 'assets/sounds/game-over.mp3', volume: 0.7 },
    };

    // Create audio elements for each sound
    for (const [key, config] of Object.entries(soundDefinitions)) {
      const audio = new Audio();
      audio.src = config.file;
      audio.volume = config.volume * this.masterVolume;
      this.sounds[key] = { element: audio, config };
    }
  }

  play(soundKey) {
    if (!this.enabled) return;
    
    const sound = this.sounds[soundKey];
    if (!sound) {
      console.warn(`Sound "${soundKey}" not found`);
      return;
    }

    // Clone and play to allow multiple instances
    const audio = sound.element.cloneNode();
    audio.volume = sound.config.volume * this.masterVolume;
    audio.play().catch(e => {
      console.warn(`Failed to play sound "${soundKey}":`, e);
    });
  }

  playWithVariation(soundKey, volumeVariation = 0.1, pitchVariation = 0.05) {
    if (!this.enabled) return;

    const sound = this.sounds[soundKey];
    if (!sound) {
      console.warn(`Sound "${soundKey}" not found`);
      return;
    }

    const audio = sound.element.cloneNode();
    const volumeVar = (Math.random() - 0.5) * 2 * volumeVariation;
    audio.volume = Math.max(0, Math.min(1, (sound.config.volume * this.masterVolume) + volumeVar));
    
    // Apply pitch variation using playback rate if Web Audio API is available
    if (this.audioContext && audio.playbackRate !== undefined) {
      const pitchVar = (Math.random() - 0.5) * 2 * pitchVariation;
      audio.playbackRate = Math.max(0.8, Math.min(1.2, 1 + pitchVar));
    }

    audio.play().catch(e => {
      console.warn(`Failed to play sound "${soundKey}":`, e);
    });
  }

  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    // Update all loaded sounds
    for (const sound of Object.values(this.sounds)) {
      if (sound.element) {
        sound.element.volume = sound.config.volume * this.masterVolume;
      }
    }
  }

  toggleEnabled() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Preset sound sequences for special events
  playLevelComplete() {
    this.play('level-complete');
  }

  playGameOver() {
    this.play('game-over');
  }

  playExplosion() {
    // Play skill-bomb with variation for explosion effect
    this.playWithVariation('skill-bomb', 0.15, 0.1);
  }

  playHit(type = 'player') {
    if (type === 'boss') {
      this.playWithVariation('boss-hit', 0.1, 0.05);
    } else if (type === 'enemy') {
      this.playWithVariation('enemy-hit', 0.15, 0.1);
    } else {
      this.playWithVariation('player-hit', 0.1, 0.05);
    }
  }
}

// Create global sound manager instance
const soundManager = new SoundManager();
