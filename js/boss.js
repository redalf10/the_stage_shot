// ============================================================
// PORTAL - Boss introduction and animation system
// ============================================================
class Portal {
  constructor(x, y, bossType, level) {
    this.x = x;
    this.y = y;
    this.bossType = bossType;
    this.level = level;
    this.radius = 40;
    this.maxRadius = 60;
    this.animate = true;
    this.timer = 0;
    this.duration = 3.0; // Portal appears for 3 seconds
    this.opacity = 0;
    this.bossBossSprite = null;
    this.bossScale = 0; // Scale of boss appearance
    
    // Loading phase (0.5s)
    this.loadingDuration = 0.5;
    this.expandDuration = 0.8; // Expand animation duration
    this.holdDuration = 1.5;   // Hold at full size
    this.collapseDuration = 0.2; // Collapse animation
  }

  update(dt) {
    this.timer += dt;
    
    // Phase calculations
    const elapsed = this.timer;
    
    if (elapsed < this.loadingDuration) {
      // Loading phase - portal appears
      this.opacity = Math.min(1, elapsed / this.loadingDuration);
      this.radius = 10;
      this.bossScale = 0;
    } else if (elapsed < this.loadingDuration + this.expandDuration) {
      // Expand phase - boss appears and grows
      const progress = (elapsed - this.loadingDuration) / this.expandDuration;
      this.opacity = 1;
      this.radius = 10 + (this.maxRadius - 10) * progress;
      this.bossScale = progress; // Boss appears during expansion
    } else if (elapsed < this.loadingDuration + this.expandDuration + this.holdDuration) {
      // Hold phase - boss fully visible
      this.opacity = 1;
      this.radius = this.maxRadius;
      this.bossScale = 1;
    } else if (elapsed < this.duration) {
      // Collapse phase
      const progress = (elapsed - (this.loadingDuration + this.expandDuration + this.holdDuration)) / this.collapseDuration;
      this.opacity = Math.max(0, 1 - progress);
      this.radius = this.maxRadius * (1 - progress * 0.3);
      this.bossScale = 1;
    } else {
      this.animate = false;
    }
  }

  drawBossInPortal(ctx, sx, sy) {
    if (this.bossScale <= 0) return;
    
    ctx.save();
    ctx.translate(sx, sy);
    
    // Boss color based on level
    const isMegaboss = this.level === 15;
    const bodyColor = isMegaboss ? '#cc3333' : '#aa2222';
    const accentColor = isMegaboss ? '#ff8844' : '#ff4444';
    
    // Boss size scales with portal and appearance
    const bossSize = 30 * this.bossScale;
    
    // Draw boss body (torso)
    ctx.globalAlpha = this.opacity * (0.6 + this.bossScale * 0.4);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-bossSize * 0.5, -bossSize * 0.6, bossSize, bossSize * 0.8);
    
    // Draw boss head
    ctx.globalAlpha = this.opacity * (0.7 + this.bossScale * 0.3);
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.arc(0, -bossSize * 0.5, bossSize * 0.35, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw boss eyes (glowing)
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(-bossSize * 0.15, -bossSize * 0.55, bossSize * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(bossSize * 0.15, -bossSize * 0.55, bossSize * 0.12, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw boss arms
    ctx.globalAlpha = this.opacity * (0.6 + this.bossScale * 0.4);
    ctx.fillStyle = bodyColor;
    ctx.fillRect(-bossSize * 0.7, -bossSize * 0.35, bossSize * 0.3, bossSize * 0.25);
    ctx.fillRect(bossSize * 0.4, -bossSize * 0.35, bossSize * 0.3, bossSize * 0.25);
    
    // Draw energy aura around boss
    if (this.bossScale > 0.5) {
      ctx.globalAlpha = this.opacity * (this.bossScale - 0.5) * 0.8;
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, bossSize * 0.8, 0, Math.PI * 2);
      ctx.stroke();
      
      // Pulsing aura rings
      ctx.globalAlpha = this.opacity * Math.sin(this.timer * 6) * 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, bossSize * 1.0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
  }

  draw(ctx, cam) {
    if (!this.animate) return;
    
    const ox = cam.x;
    const oy = cam.y;
    const sx = this.x - ox;
    const sy = this.y - oy;
    
    ctx.save();
    ctx.globalAlpha = this.opacity;
    
    // Portal glow layers
    const colors = ['#0088ff', '#00ffff', '#ff00ff'];
    for (let i = 0; i < colors.length; i++) {
      const layerRadius = this.radius + i * 5;
      const fadeOpacity = 0.6 - i * 0.2;
      ctx.fillStyle = colors[i];
      ctx.globalAlpha = this.opacity * fadeOpacity * (0.4 + Math.sin(this.timer * 8) * 0.3);
      ctx.beginPath();
      ctx.arc(sx, sy, layerRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Draw boss inside portal
    this.drawBossInPortal(ctx, sx, sy);
    
    // Portal center
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = this.opacity * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
    
    // Portal ring
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.globalAlpha = this.opacity * 0.8;
    ctx.beginPath();
    ctx.arc(sx, sy, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Rotating inner ring
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(this.timer * 3);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1;
    ctx.globalAlpha = this.opacity * 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // Boss name text
    if (this.timer > this.loadingDuration && this.timer < this.duration - 0.3) {
      const bossNames = {
        'level-1': 'LEVEL 01 BOSS',
        'level-2': 'LEVEL 02 BOSS',
        'level-3': 'LEVEL 03 BOSS',
        'level-4': 'LEVEL 04 BOSS',
        'level-5': 'LEVEL 05 BOSS',
        'level-6': 'LEVEL 06 BOSS',
        'level-7': 'LEVEL 07 BOSS',
        'level-8': 'LEVEL 08 BOSS',
        'level-9': 'LEVEL 09 BOSS',
        'level-10': 'LEVEL 10 BOSS',
        'level-11': 'LEVEL 11 BOSS',
        'level-12': 'LEVEL 12 BOSS',
        'level-13': 'LEVEL 13 BOSS',
        'level-14': 'LEVEL 14 BOSS',
        'level-15': 'FINAL BOSS',
      };
      
      const bossName = bossNames[this.bossType] || 'UNKNOWN BOSS';
      ctx.font = 'bold 20px "Courier New"';
      ctx.fillStyle = '#00ffff';
      ctx.textAlign = 'center';
      ctx.globalAlpha = this.opacity;
      ctx.shadowColor = '#0088ff';
      ctx.shadowBlur = 15;
      ctx.fillText(bossName, sx, sy + this.radius + 50);
    }
    
    ctx.restore();
  }

  isDone() {
    return !this.animate;
  }
}
