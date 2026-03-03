// ============================================================
// CAMERA
// ============================================================
class Camera {
  constructor(w, h) {
    this.x = 0; this.y = 0;
    this.w = w; this.h = h;
    this.targetX = 0; this.targetY = 0;
    this.shake = 0;
  }
  follow(target, levelW, levelH) {
    this.targetX = target.x + target.w / 2 - this.w / 2;
    this.targetY = target.y + target.h / 2 - this.h / 2;
    this.targetX = Math.max(0, Math.min(this.targetX, levelW - this.w));
    this.targetY = Math.max(0, Math.min(this.targetY, levelH - this.h));
    this.x += (this.targetX - this.x) * 0.08;
    this.y += (this.targetY - this.y) * 0.08;
  }
  addShake(amt) { this.shake = Math.max(this.shake, amt); }
  getOffset() {
    let sx = 0, sy = 0;
    if (this.shake > 0) {
      sx = (Math.random() - 0.5) * this.shake * 2;
      sy = (Math.random() - 0.5) * this.shake * 2;
      this.shake *= 0.85;
      if (this.shake < 0.5) this.shake = 0;
    }
    return { x: Math.round(this.x + sx), y: Math.round(this.y + sy) };
  }
}
