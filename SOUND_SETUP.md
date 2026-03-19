# Sound Effects Setup Guide

## Overview
The game now has a complete sound effects system integrated. All sound effects are called at appropriate game actions, but the audio files need to be added to work.

## Sound Files Required

Create MP3 (or OGG/WAV) audio files and place them in the `assets/sounds/` directory:

### Player Actions
- **shoot.mp3** - Player regular shoot sound
- **rapid-shoot.mp3** - Player rapid fire shoot sound (when rapid powerup is active)
- **player-hit.mp3** - Player takes damage
- **player-die.mp3** - Player death/game over

### Skills
- **skill-laser.mp3** - Laser Canon skill activation
- **skill-bomb.mp3** - Ultra Bomb skill activation/explosion
- **skill-dash.mp3** - Dash skill activation

### Enemy Actions
- **enemy-hit.mp3** - Enemy takes damage
- **enemy-die.mp3** - Enemy death
- **enemy-shoot.mp3** - Enemy shoots projectile
- **boss-hit.mp3** - Boss takes damage (different from regular enemy)
- **boss-die.mp3** - Boss death

### Item & Event Sounds
- **powerup-pickup.mp3** - Shield or Rapid Fire powerup collected
- **health-pickup.mp3** - Health pack collected
- **level-complete.mp3** - Level complete / Victory
- **game-over.mp3** - Game over / player defeated

## Audio File Properties

**Recommended specifications:**
- **Format:** MP3, OGG, or WAV
- **Sample Rate:** 44.1 kHz or 48 kHz
- **Channels:** Mono or Stereo
- **Duration:** 
  - Sound effects: 0.3 - 1.0 seconds
  - Level complete: 1.0 - 2.0 seconds
  - Game over: 1.0 - 2.0 seconds

## How to Get Sound Files

### Option 1: Use Free Sound Effect Websites
- [Freesound.org](https://freesound.org) - Free creative commons sounds
- [Zenodo.org](https://zenodo.org) - Scientific sound effects
- [OpenGameArt.org](https://opengameart.org) - Game-specific sounds
- [Pixabay.com](https://pixabay.com) - Royalty-free sounds

### Option 2: Generate Your Own
Use sound generation tools:
- [jsfxr](https://sfxr.me/) - Browser-based retro sound effect generator
- [BFXR](https://www.bfxr.net/) - Standalone sound effect generator
- [ChipTone](https://sfbgames.itch.io/chiptone) - Chip tune sound generator

### Option 3: Use Royalty-Free Sound Packs
- Kenney.nl - Offers free game audio packs
- Itch.io - Many creators offer free sound effect packs

## Volume Levels

The SoundManager has built-in volume control:

```javascript
// Get current volume (0.0 to 1.0)
const vol = soundManager.masterVolume;

// Set master volume (example: 50%)
soundManager.setVolume(0.5);

// Toggle sound on/off
soundManager.toggleEnabled();
```

## Sound Variation

Many sounds use variation for natural sound effect:

```javascript
// Volume variation (±10%)
soundManager.playWithVariation('shoot', 0.1, 0.08);

// This creates variation between 0.08x to 1.12x pitch
// and ±10% volume variation
```

This makes repetitive sounds feel more natural and less robotic.

## Sound Manager Class

### Key Methods

```javascript
// Play a sound
soundManager.play('soundKey');

// Play a sound with pitch and volume variation
soundManager.playWithVariation('soundKey', volumeVar, pitchVar);

// Control volume
soundManager.setVolume(0.7);  // 70%

// Toggle sound on/off
soundManager.toggleEnabled();

// Convenience methods for special sounds
soundManager.playExplosion();      // Plays skill-bomb with variation
soundManager.playHit(type);         // type: 'player'|'enemy'|'boss'
soundManager.playLevelComplete();   // Plays level-complete
soundManager.playGameOver();        // Plays game-over
```

## Integration Points

Sounds are integrated at these game actions:

| Action | Sound |
|--------|-------|
| Player shoots | shoot.mp3 / rapid-shoot.mp3 |
| Player uses Laser | skill-laser.mp3 |
| Player uses Bomb | skill-bomb.mp3 |
| Player uses Dash | skill-dash.mp3 |
| Player takes damage | player-hit.mp3 |
| Player dies | player-die.mp3 |
| Enemy shoots | enemy-shoot.mp3 |
| Enemy takes damage | enemy-hit.mp3 / boss-hit.mp3 |
| Enemy dies | enemy-die.mp3 / boss-die.mp3 |
| Powerup collected | powerup-pickup.mp3 / health-pickup.mp3 |
| Level complete | level-complete.mp3 |
| Game over | game-over.mp3 |

## File Structure

```
THE STAGE SHOT/
├── assets/
│   └── sounds/
│       ├── shoot.mp3
│       ├── rapid-shoot.mp3
│       ├── player-hit.mp3
│       ├── player-die.mp3
│       ├── skill-laser.mp3
│       ├── skill-bomb.mp3
│       ├── skill-dash.mp3
│       ├── enemy-hit.mp3
│       ├── enemy-die.mp3
│       ├── enemy-shoot.mp3
│       ├── boss-hit.mp3
│       ├── boss-die.mp3
│       ├── powerup-pickup.mp3
│       ├── health-pickup.mp3
│       ├── level-complete.mp3
│       └── game-over.mp3
├── js/
│   └── soundManager.js  (new)
└── index.html
```

## Troubleshooting

### Sounds not playing?
1. Check that audio files are in `assets/sounds/` directory
2. Verify file names match exactly (case-sensitive)
3. Open browser console (F12) to check for errors
4. Try different audio format (MP3 vs OGG vs WAV)

### Browser autoplay policy?
- Modern browsers require user interaction before playing audio
- Sounds will play only after first user click/interaction
- This is working as intended!

### Performance issues?
- Sounds are loaded on-demand (lazy loading)
- Cloned audio elements are used for simultaneous sounds
- This shouldn't cause performance problems

## Customization

To add more sounds or customize:

1. **Add a new sound** in `soundManager.js`:
```javascript
'custom-sound': { file: 'assets/sounds/custom.mp3', volume: 0.6 }
```

2. **Call it in your code**:
```javascript
soundManager.play('custom-sound');
```

## Notes

- All sound files support MP3, OGG, and WAV formats
- The system has built-in error handling for missing files
- Sounds work in all modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile support works with standard HTML5 Audio API
