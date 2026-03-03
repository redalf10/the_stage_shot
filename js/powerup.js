// ============================================================
// POWERUP
// ============================================================
class Powerup {
  constructor(x, y, type) {
    this.x = x; this.y = y; this.w = 20; this.h = 20;
    this.type = type;
    this.alive = true;
    this.vy = 0;
    this.bob = Math.random() * Math.PI * 2;
    const colors = { shield: '#00ff88', rapid: '#ff8800', health: '#ff0088' };
    this.color = colors[type];
  }
  update(dt, platforms) {
    this.vy += 900 * dt;
    this.y += this.vy * dt;
    for (const p of platforms) {
      if (this.x < p.x+p.w && this.x+this.w > p.x && this.y < p.y+p.h && this.y+this.h > p.y) {
        if (this.vy > 0) { this.y = p.y - this.h; this.vy = 0; }
      }
    }
    this.bob += dt * 3;
  }
  draw(ctx, cam) {
    if (!this.alive) return;
    const x = this.x - cam.x;
    const y = this.y - cam.y + Math.sin(this.bob) * 4;
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.w, this.h);
    ctx.fillStyle = this.color + '44';
    ctx.fillRect(x, y, this.w, this.h);
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 0;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons = { shield: '⬡', rapid: '⚡', health: '♥' };
    ctx.fillText(icons[this.type], x + this.w/2, y + this.h/2 + 1);
  }
}
