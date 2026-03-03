// ============================================================
// PROJECTILE
// ============================================================
class Projectile {
  constructor(x, y, vx, vy, owner, color, dmg, skillType = null, isBigLaser = false) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    
    // Size based on type
    if (isBigLaser) {
      this.w = 16;
      this.h = 8;
    } else if (skillType === 'laser') {
      this.w = 10;
      this.h = 6;
    } else {
      this.w = 14;
      this.h = 4;
    }
    
    this.owner = owner; // 'player' | 'enemy'
    this.color = color;
    this.dmg = dmg;
    this.alive = true;
    this.trail = [];
    this.skillType = skillType; // null | 'laser' | 'bomb'
    this.isBigLaser = isBigLaser;
  }
  update(dt) {
    this.trail.push({ x: this.x + this.w/2, y: this.y + this.h/2 });
    if (this.trail.length > 6) this.trail.shift();
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
  draw(ctx, cam) {
    const ox = cam.x, oy = cam.y;
    // trail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      ctx.globalAlpha = (i / this.trail.length) * 0.5;
      ctx.fillStyle = this.color;
      ctx.fillRect(t.x - ox - 2, t.y - oy - 1, 4, 2);
    }
    ctx.globalAlpha = 1;
    
    // Laser has extra glow effect
    if (this.skillType === 'laser') {
      const glowSize = this.isBigLaser ? 25 : 20;
      const lineWidth = this.isBigLaser ? 4 : 3;
      
      ctx.shadowBlur = glowSize;
      ctx.shadowColor = this.color;
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      ctx.moveTo(this.x - ox - this.w, this.y - oy);
      ctx.lineTo(this.x - ox + this.w, this.y - oy);
      ctx.stroke();
    } else {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
    }
    
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - ox, this.y - oy, this.w, this.h);
    ctx.shadowBlur = 0;
  }
}
