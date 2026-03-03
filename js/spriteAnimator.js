// ============================================================
// SPRITE ANIMATOR
// ============================================================
class SpriteAnimator {
  constructor(config) {
    this.animations = config; // { name: { frames, fps, loop } }
    this.current = null;
    this.frame = 0;
    this.timer = 0;
    this.done = false;
  }
  play(name) {
    if (this.current === name && !this.done) return;
    this.current = name;
    this.frame = 0;
    this.timer = 0;
    this.done = false;
  }
  update(dt) {
    if (!this.current) return;
    const anim = this.animations[this.current];
    if (!anim) return;
    this.timer += dt;
    const interval = 1 / anim.fps;
    if (this.timer >= interval) {
      this.timer -= interval;
      this.frame++;
      if (this.frame >= anim.frames) {
        if (anim.loop) {
          this.frame = 0;
        } else {
          this.frame = anim.frames - 1;
          this.done = true;
        }
      }
    }
  }
  getFrame() { return this.frame; }
}
