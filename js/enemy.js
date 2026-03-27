// ============================================================
// ENEMY
// ============================================================
class Enemy {
  constructor(x, y, type, level, enemySprite) {
    this.x = x; this.y = y;
    this.type = type; // 'grunt'|'sniper'|'boss'|'megaboss'
    const cfg = Enemy.configs[type];
    this.w = cfg.w; this.h = cfg.h;
    this.speed = cfg.speed * (1 + (level - 1) * 0.15);
    this.maxHp = Math.round(cfg.hp * (1 + (level - 1) * 0.3));
    this.hp = this.maxHp;
    this.shootRate = cfg.shootRate;
    this.shootCooldown = Math.random() * cfg.shootRate;
    this.dmg = cfg.dmg;
    this.score = cfg.score;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.facing = -1;
    this.alive = true;
    this.patrolDir = Math.random() > 0.5 ? 1 : -1;
    this.patrolTimer = 0;
    this.flashTimer = 0;
    this.enemySprite = enemySprite;
    this.spriteLoader = new SpriteLoader('enemy', this);
    // Animation state - frame counts based on actual PNG files
    this.anim = new SpriteAnimator({
      idle:   { frames: 1, fps: 1, loop: true },
      run:    { frames: 3, fps: 8, loop: true },
      jump:   { frames: 2, fps: 8, loop: false },
      attack: { frames: 1, fps: 1, loop: false },
      hit:    { frames: 3, fps: 6, loop: false },
      die:    { frames: 3, fps: 8, loop: false },
    });
    this.anim.play('idle');
    this.deathTimer = 0;
  }

  static configs = {
    grunt:  { w: 26, h: 38, speed: 80,  hp: 60,  shootRate: 2.0, dmg: 15, score: 100 },
    sniper: { w: 24, h: 36, speed: 40,  hp: 40,  shootRate: 3.5, dmg: 30, score: 200 },
    boss:   { w: 48, h: 56, speed: 60,  hp: 500, shootRate: 1.0, dmg: 25, score: 1000 },
    megaboss: { w: 80, h: 90, speed: 50, hp: 1200, shootRate: 0.8, dmg: 40, score: 2500 },
    // Level-specific bosses (progressive difficulty)
    'level-1':  { w: 50, h: 58, speed: 70,  hp: 150,  shootRate: 1.5, dmg: 20, score: 500 },
    'level-2':  { w: 52, h: 60, speed: 75,  hp: 200,  shootRate: 1.4, dmg: 22, score: 600 },
    'level-3':  { w: 54, h: 62, speed: 80,  hp: 280,  shootRate: 1.3, dmg: 24, score: 750 },
    'level-4':  { w: 56, h: 64, speed: 85,  hp: 350,  shootRate: 1.2, dmg: 26, score: 900 },
    'level-5':  { w: 58, h: 66, speed: 90,  hp: 450,  shootRate: 1.1, dmg: 28, score: 1100 },
    'level-6':  { w: 60, h: 68, speed: 95,  hp: 550,  shootRate: 1.0, dmg: 30, score: 1250 },
    'level-7':  { w: 62, h: 70, speed: 100, hp: 650,  shootRate: 0.95, dmg: 32, score: 1400 },
    'level-8':  { w: 64, h: 72, speed: 105, hp: 750,  shootRate: 0.9, dmg: 34, score: 1550 },
    'level-9':  { w: 66, h: 74, speed: 110, hp: 850,  shootRate: 0.85, dmg: 36, score: 1700 },
    'level-10': { w: 68, h: 76, speed: 115, hp: 950,  shootRate: 0.8, dmg: 38, score: 1900 },
    'level-11': { w: 70, h: 78, speed: 120, hp: 1050, shootRate: 0.75, dmg: 40, score: 2100 },
    'level-12': { w: 72, h: 80, speed: 125, hp: 1150, shootRate: 0.7, dmg: 42, score: 2300 },
    'level-13': { w: 74, h: 82, speed: 130, hp: 1250, shootRate: 0.65, dmg: 44, score: 2500 },
    'level-14': { w: 76, h: 84, speed: 135, hp: 1350, shootRate: 0.6, dmg: 46, score: 2700 },
    'level-15': { w: 90, h: 100, speed: 140, hp: 2000, shootRate: 0.5, dmg: 50, score: 5000 },
  };

  update(dt, player, platforms, projectiles) {
    if (!this.alive) {
      this.deathTimer += dt;
      this.anim.update(dt);
      return;
    }
    if (this.flashTimer > 0) this.flashTimer -= dt;
    // AI
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    this.facing = dx > 0 ? 1 : -1;
    // Patrol
    this.patrolTimer -= dt;
    if (this.patrolTimer <= 0) {
      this.patrolTimer = 1.5 + Math.random() * 2;
      this.patrolDir *= -1;
    }
    if (dist < 350) {
      this.vx = this.facing * this.speed;
      if (dist < 150) this.vx = 0; // stand and shoot
    } else {
      this.vx = this.patrolDir * this.speed * 0.5;
    }
    // Gravity
    this.vy += 900 * dt;
    this.vy = Math.min(this.vy, 700);
    this.y += this.vy * dt;
    this.x += this.vx * dt;
    this.onGround = false;
    for (const p of platforms) {
      if (this.collides(p)) {
        if (this.vy > 0) {
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
        } else if (this.vy < 0) {
          this.y = p.y + p.h;
          this.vy = 0;
        } else {
          this.patrolDir *= -1;
          this.vx = 0;
        }
      }
    }
    // Shoot
    this.shootCooldown -= dt;
    if (this.shootCooldown <= 0 && dist < 400 && player.alive) {
      this.shootCooldown = this.shootRate;
      const angle = Math.atan2(dy, dx);
      const speed = this.type === 'sniper' ? 450 : 300;
      const bx = this.x + this.w / 2 - 7;
      const by = this.y + this.h * 0.4;
      projectiles.push(new Projectile(bx, by, Math.cos(angle)*speed, Math.sin(angle)*speed*0.4, 'enemy', '#ff4400', this.dmg));
      this.anim.play('attack');
      // Play enemy shoot sound
      soundManager.playWithVariation('enemy-shoot', 0.15, 0.1);
    }
    // Anim
    if (!this.onGround) this.anim.play('jump');
    else if (Math.abs(this.vx) > 5) this.anim.play('run');
    else if (this.anim.current !== 'attack') this.anim.play('idle');
    this.anim.update(dt);
  }

  collides(r) {
    return this.x < r.x + r.w && this.x + this.w > r.x &&
           this.y < r.y + r.h && this.y + this.h > r.y;
  }

  takeDamage(dmg) {
    this.hp -= dmg;
    this.flashTimer = 0.2;
    this.anim.play('hit');
    const isBoss = this.type.includes('boss') || this.type.includes('level-');
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.anim.play('die');
      // Play death sound based on enemy type
      if (isBoss) {
        soundManager.play('boss-die');
      } else {
        soundManager.playWithVariation('enemy-die', 0.15, 0.1);
      }
    } else {
      // Play hit sound
      if (isBoss) {
        soundManager.playWithVariation('boss-hit', 0.1, 0.05);
      } else {
        soundManager.playWithVariation('enemy-hit', 0.12, 0.08);
      }
    }
  }

  getSpriteFrame() {
    const animName = this.anim.current || 'idle';
    const frameIndex = this.anim.getFrame();
    
    // Get the loaded sprite image for this animation frame
    const spriteImg = this.spriteLoader.getSprite(animName, frameIndex);
    
    // Return frame info with the sprite image
    return {
      sprite: spriteImg,
      sx: 0,
      sy: 0,
      sw: spriteImg ? spriteImg.naturalWidth : 128,
      sh: spriteImg ? spriteImg.naturalHeight : 128
    };
  }

  draw(ctx, cam) {
    if (this.deathTimer > 0.6) return;
    const ox = cam.x, oy = cam.y;
    const cx = this.x - ox + this.w/2;
    const cy = this.y - oy + this.h/2;
    const t = Date.now() / 1000;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(this.facing, 1);
    if (!this.alive) ctx.globalAlpha = Math.max(0, 1 - this.deathTimer * 2.5);
    if (this.flashTimer > 0) { ctx.globalAlpha = 0.4; }

    // Draw sprite
    const frame = this.getSpriteFrame();
    if (frame.sprite && frame.sprite.complete) {
      const drawW = this.w * 1.8;
      const drawH = this.h * 1.8; // Scales sprite further for megaboss
      ctx.drawImage(
        frame.sprite,
        frame.sx, frame.sy, frame.sw, frame.sh,
        -drawW/2, -drawH/2, drawW, drawH
      );
    } else {
      // Fallback to old rendering if sprite not loaded
      const isBoss = this.type.includes('boss') || this.type.includes('level-');
      const isMegaboss = this.type === 'megaboss' || this.type === 'level-15';
      const bodyColor = isMegaboss ? '#660000' : (isBoss ? '#4a0000' : (this.type === 'sniper' ? '#001a3a' : '#1a1a00'));
      const accentColor = isMegaboss ? '#ff6600' : (isBoss ? '#ff2200' : (this.type === 'sniper' ? '#0088ff' : '#ffcc00'));
      const legA = Math.abs(this.vx) > 5 ? Math.sin(t * 16) * 8 : 0;
      ctx.fillStyle = '#111122';
      ctx.fillRect(-this.w/2+2, this.h/4, this.w/2-3, this.h/4 + legA);
      ctx.fillStyle = bodyColor;
      ctx.fillRect(-this.w/2, -this.h/2 + 4, this.w, this.h * 0.7);
      ctx.fillStyle = accentColor + '88';
      ctx.fillRect(-this.w/2, -this.h/2 + 4, this.w, 5);
    }

    ctx.restore();

    // Health bar
    if (this.alive) {
      const bw = this.w + 10;
      const bx = this.x - ox + this.w/2 - bw/2;
      const by2 = this.y - oy - 10;
      ctx.fillStyle = '#1a0000';
      ctx.fillRect(bx, by2, bw, 5);
      const pct = this.hp / this.maxHp;
      const hColor = pct > 0.5 ? '#ff4400' : '#ff0000';
      ctx.fillStyle = hColor;
      ctx.shadowBlur = 4;
      ctx.shadowColor = hColor;
      ctx.fillRect(bx, by2, bw * pct, 5);
      ctx.shadowBlur = 0;
    }
  }
}
