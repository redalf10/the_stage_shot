// ============================================================
// PLATFORM
// ============================================================
class Platform {
  constructor(x, y, w, h, color) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.color = color || '#00ffff';
  }
  draw(ctx, cam) {
    const ox = cam.x, oy = cam.y;
    const x = this.x - ox, y = this.y - oy;
    // Platform body
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(x, y, this.w, this.h);
    // Top edge glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.w, this.h);
    // Grid lines
    ctx.shadowBlur = 0;
    ctx.strokeStyle = this.color + '33';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < this.w; gx += 20) {
      ctx.beginPath();
      ctx.moveTo(x + gx, y);
      ctx.lineTo(x + gx, y + this.h);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }
}

// ============================================================
// PARTICLE SYSTEM
// ============================================================
class Particle {
  constructor(x, y, vx, vy, color, life) {
    this.x = x; this.y = y;
    this.vx = vx; this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = Math.random() * 4 + 1;
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 200 * dt;
    this.life -= dt;
  }
  draw(ctx, cam) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.fillRect(this.x - cam.x - this.size/2, this.y - cam.y - this.size/2, this.size, this.size);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}
