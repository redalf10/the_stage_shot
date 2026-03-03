// ============================================================
// SPRITE LOADER - Loads individual animation frames
// ============================================================
class SpriteLoader {
  constructor(type, character) {
    this.type = type; // 'player' or 'enemy'
    this.character = character; // The character object (Player or Enemy instance)
    this.sprites = {};
    this.currentAnimSprites = [];
    this.loadAnimationFrames();
  }

  loadAnimationFrames() {
    if (this.type === 'player') {
      this.definePlayerAnimations();
    } else if (this.type === 'enemy') {
      this.defineEnemyAnimations();
    }
  }

  definePlayerAnimations() {
    this.animations = {
      idle: { frames: ['idle'], count: 1 },
      run: { frames: ['run-1', 'run-2'], count: 2 },
      jump: { frames: ['jump-1', 'jump-2'], count: 2 },
      shoot: { frames: ['shoot-1'], count: 1 },
      'shoot-while-run': { frames: ['shoot-while-run'], count: 1 },
      skill: { frames: ['skill-1'], count: 1 },
      hit: { frames: ['hit-1'], count: 1 },
      die: { frames: ['die-1', 'die-2', 'die-3'], count: 3 },
    };
  }

  defineEnemyAnimations() {
    this.animations = {
      idle: { frames: ['idle'], count: 1 },
      run: { frames: ['run-1', 'run-2', 'run-3'], count: 3 },
      jump: { frames: ['jump-1', 'jump-3'], count: 2 },
      attack: { frames: ['attack-1'], count: 1 },
      hit: { frames: ['hit-1', 'hit-2', 'hit-3'], count: 3 },
      die: { frames: ['die-1', 'die-2', 'die-3'], count: 3 },
    };
  }

  getSprite(animName, frameIndex) {
    const anim = this.animations[animName];
    if (!anim) return null;

    const frameKey = anim.frames[frameIndex % anim.count];
    const spritePath = `assets/sprites/${this.type}/${this.type}-${frameKey}.png`;
    
    if (!this.sprites[spritePath]) {
      const img = new Image();
      img.src = spritePath;
      this.sprites[spritePath] = img;
    }
    
    return this.sprites[spritePath];
  }
}
