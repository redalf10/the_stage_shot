// ============================================================
// LEVEL BUILDER
// ============================================================
function buildLevel(num) {
  const W = 2400;
  const H = 500;
  const platforms = [];
  const enemies = [];
  const powerups = [];

  // Ground
  platforms.push(new Platform(0, H - 40, W, 40, '#00ffff'));
  // Random floating platforms
  const layouts = [
    [
      [100, 360, 180, 18], [380, 300, 150, 18], [600, 380, 120, 18],
      [800, 250, 200, 18], [1100, 320, 160, 18], [1350, 380, 140, 18],
      [1600, 270, 180, 18], [1850, 340, 150, 18], [2100, 290, 170, 18],
      [200, 210, 160, 18], [500, 160, 140, 18], [900, 180, 130, 18],
      [1200, 200, 150, 18], [1500, 150, 120, 18], [1800, 200, 140, 18],
      [2100, 160, 130, 18],
    ],
    [
      [150, 380, 200, 18], [430, 310, 120, 18], [650, 360, 100, 18],
      [850, 240, 180, 18], [1100, 310, 140, 18], [1400, 370, 160, 18],
      [1650, 260, 170, 18], [1900, 330, 130, 18], [2150, 280, 150, 18],
      [250, 220, 150, 18], [550, 170, 130, 18], [950, 190, 140, 18],
      [1250, 210, 160, 18], [1550, 160, 130, 18], [1850, 210, 140, 18],
    ],
  ];
  const layout = layouts[(num - 1) % layouts.length];
  const colors = ['#00ffff','#ff00ff','#ffff00','#00ff88'];
  layout.forEach(([x, y, w, h], i) => {
    platforms.push(new Platform(x, y, w, h, colors[i % colors.length]));
  });

  // Enemies
  const count = 5 + num * 2;
  const types = num >= 3 ? ['grunt','grunt','sniper','sniper'] : (num >= 2 ? ['grunt','grunt','sniper'] : ['grunt']);
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const px = 300 + Math.random() * (W - 400);
    enemies.push(new Enemy(px, H - 200, type, num));
  }
  
  // Boss on every level - with unique boss type for each level
  const bossType = `level-${num}`;
  enemies.push(new Enemy(W - 300, H - 200, bossType, num));

  // Powerups
  for (let i = 0; i < 3; i++) {
    const types2 = ['shield','rapid','health'];
    const px = 300 + Math.random() * (W - 400);
    powerups.push(new Powerup(px, 100, types2[i]));
  }

  return { platforms, enemies, powerups, W, H };
}

// ============================================================
// GAME
// ============================================================
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = canvas.width;
    this.H = canvas.height;
    this.state = 'menu'; // menu|playing|paused|dead|win
    this.level = 1;
    this.score = 0;
    this.particles = [];
    this.input = { left:false, right:false, jump:false, shoot:false, jumpPressed:false, skill1:false, skill2:false, skill3:false };
    this.explosions = []; // For area effects like Ultra Bomb
    this.soundEnabled = true; // Sound toggle
    this.levelCompletedShown = false; // Track if level complete message has been shown
    this.portal = null; // Boss portal animation
    this.camera = new Camera(this.W, this.H);
    this.timeOfDay = 'night'; // 'morning', 'afternoon', 'night'
    this.bgStars = Array.from({length:100}, () => ({
      x: Math.random()*4000, y: Math.random()*500,
      s: Math.random()*2+0.5, b: Math.random()
    }));
    // Load sprite images
    // this.playerSprite = new Image();
    // this.playerSprite.src = 'assets/sprites/player.png';
    // this.enemySprite = new Image();
    // this.enemySprite.src = 'assets/sprites/enemy.png';
    this.initLevel();
  }

  getTimeOfDay() {
    // Cycle through morning, afternoon, night based on level
    const cycle = (this.level - 1) % 3;
    if (cycle === 0) return 'morning';
    if (cycle === 1) return 'afternoon';
    return 'night';
  }

  initLevel() {
    this.timeOfDay = this.getTimeOfDay(); // Set time of day based on level
    const level = buildLevel(this.level);
    this.platforms = level.platforms;
    this.enemies = level.enemies;
    this.powerups = level.powerups;
    this.levelW = level.W;
    this.levelH = level.H;
    this.projectiles = [];
    this.explosions = [];
    this.levelCompletedShown = false; // Reset level complete flag
    this.portalShown = false; // Track if portal has been shown
    
    // Portal will be created when player gets close to boss
    this.portal = null;
    
    if (!this.player) {
      this.player = new Player(100, 400, this.playerSprite);
    } else {
      this.player.x = 100;
      this.player.y = 400;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.hp = this.player.maxHp;
      this.player.alive = true;
      this.player.anim.play('idle');
    }
    // Add sprite reference to enemies
    this.enemies.forEach(enemy => {
      enemy.enemySprite = this.enemySprite;
    });
    this.player.score = this.score;
    this.camera.x = 0;
    this.camera.y = 0;
  }

  start() {
    this.state = 'playing';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('shopBtn').style.display = 'block';
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      document.getElementById('pauseOverlay').style.display = 'flex';
    }
    else if (this.state === 'paused') {
      this.state = 'playing';
      document.getElementById('pauseOverlay').style.display = 'none';
    }
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.state = 'menu';
    document.getElementById('shopBtn').style.display = 'none';
  }

  loop(ts) {
    this.rafId = requestAnimationFrame(t => this.loop(t));
    const dt = Math.min((ts - this.lastTime) / 1000, 0.05);
    this.lastTime = ts;
    if (this.state === 'playing') this.update(dt);
    this.draw();
  }

  update(dt) {
    const { player, platforms, enemies, projectiles, particles, powerups } = this;

    // Handle jumpPressed
    if (this.input.jumpPressed) {
      this.input.jumpPressed = false;
      this.input.jump = true;
    } else {
      this.input.jump = false;
    }

    player.update(dt, this.input, platforms);

    // Spawn jump effect particles
    if (player.justJumped) {
      this.spawnParticles(player.x + player.w / 2, player.y + player.h, '#00ffff', 30);
      player.justJumped = false;
    }

    // Check if player is approaching boss and create portal
    if (!this.portalShown && player.alive) {
      const bossLocationX = this.levelW - 300;
      const distToBoss = bossLocationX - player.x;
      // Show portal when player is within 600 pixels of boss location
      if (distToBoss < 600 && distToBoss > 0) {
        const bossType = `level-${this.level}`;
        this.portal = new Portal(bossLocationX, this.levelH / 2 - 50, bossType, this.level);
        this.portalShown = true;
        // Play warning sound
        soundManager.play('boss-die'); // Placeholder - could be a different sound
      }
    }

    // Update portal animation
    if (this.portal) {
      this.portal.update(dt);
    }

    // Shoot
    if (this.input.shoot && player.alive) {
      player.shoot(projectiles);
    }

    // Skills
    if (this.input.skill1 && player.alive) {
      player.activateSkill1(projectiles);
      this.input.skill1 = false;
    }

    if (this.input.skill2 && player.alive) {
      const explosion = player.activateSkill2();
      if (explosion) {
        this.explosions.push(explosion);
        this.spawnParticles(explosion.x, explosion.y, '#ff6600', 20);
        this.camera.addShake(8);
        // Play explosion sound
        soundManager.playExplosion();
      }
      this.input.skill2 = false;
    }

    if (this.input.skill3 && player.alive) {
      player.activateDash();
      this.input.skill3 = false;
    }

    // Enemies
    for (const e of enemies) {
      e.update(dt, player, platforms, projectiles);
    }

    // Projectiles
    for (const p of projectiles) {
      p.update(dt);
      // Out of bounds
      if (p.x < 0 || p.x > this.levelW || p.y < 0 || p.y > this.levelH) {
        p.alive = false; continue;
      }
      // Platform collision
      for (const pl of platforms) {
        if (p.x < pl.x+pl.w && p.x+p.w > pl.x && p.y < pl.y+pl.h && p.y+p.h > pl.y) {
          p.alive = false;
          this.spawnParticles(p.x, p.y, p.color, 3);
          break;
        }
      }
      if (!p.alive) continue;
      // Hit check
      if (p.owner === 'player') {
        for (const e of enemies) {
          if (!e.alive) continue;
          if (p.x < e.x+e.w && p.x+p.w > e.x && p.y < e.y+e.h && p.y+p.h > e.y) {
            e.takeDamage(p.dmg);
            p.alive = false;
            this.spawnParticles(p.x, p.y, '#ff4400', 6);
            this.camera.addShake(3);
            if (!e.alive) {
              this.score += e.score;
              player.score = this.score;
              this.spawnParticles(e.x + e.w/2, e.y + e.h/2, '#ff8800', 12);
              // Chance to drop powerup
              if (Math.random() < 0.3) {
                const types = ['shield','rapid','health'];
                powerups.push(new Powerup(e.x, e.y, types[Math.floor(Math.random()*3)]));
              }
            }
            break;
          }
        }
      } else if (p.owner === 'enemy') {
        if (player.alive && p.x < player.x+player.w && p.x+p.w > player.x &&
            p.y < player.y+player.h && p.y+p.h > player.y) {
          player.takeDamage(p.dmg);
          p.alive = false;
          this.camera.addShake(5);
          this.spawnParticles(p.x, p.y, '#ff00ff', 5);
        }
      }
    }
    this.projectiles = projectiles.filter(p => p.alive);

    // Explosions (Area effects like Ultra Bomb)
    for (const exp of this.explosions) {
      exp.time += dt; // Update animation time
      for (const e of enemies) {
        if (!e.alive) continue;
        const dx = e.x + e.w/2 - exp.x;
        const dy = e.y + e.h/2 - exp.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < exp.radius) {
          e.takeDamage(exp.damage);
          this.spawnParticles(e.x + e.w/2, e.y + e.h/2, '#ff6600', 5);
          this.camera.addShake(2);
          if (!e.alive) {
            this.score += e.score;
            player.score = this.score;
            this.spawnParticles(e.x + e.w/2, e.y + e.h/2, '#ff8800', 12);
            if (Math.random() < 0.3) {
              const types = ['shield','rapid','health'];
              powerups.push(new Powerup(e.x, e.y, types[Math.floor(Math.random()*3)]));
            }
          }
        }
      }
    }
    this.explosions = this.explosions.filter(exp => exp.time < (exp.maxDuration || 0.5)); // Remove expired explosions

    // Powerups
    for (const pw of powerups) {
      if (!pw.alive) continue;
      pw.update(dt, platforms);
      if (player.alive && player.x < pw.x+pw.w && player.x+player.w > pw.x &&
          player.y < pw.y+pw.h && player.y+player.h > pw.y) {
        pw.alive = false;
        if (pw.type === 'health') {
          player.hp = Math.min(player.maxHp, player.hp + 40);
          soundManager.play('health-pickup');
        } else {
          player.powerup = pw.type;
          player.powerupTimer = 8;
          soundManager.play('powerup-pickup');
        }
      }
    }
    this.powerups = powerups.filter(p => p.alive);

    // Particles
    for (const p of particles) p.update(dt);
    this.particles = particles.filter(p => p.life > 0);

    // Camera
    this.camera.follow(player, this.levelW, this.levelH);

    // Fall death
    if (player.y > this.levelH + 100 && player.alive) {
      player.hp = 0;
      player.alive = false;
      player.anim.play('death');
    }

    // Check level clear
    const allDead = enemies.every(e => !e.alive || e.deathTimer > 0.5);
    if (allDead && enemies.length > 0 && !this.levelCompletedShown) {
      this.levelCompletedShown = true;
      // Play level complete sound
      soundManager.playLevelComplete();
      // Show level complete message
      const levelNum = this.level;
      const levelCompletedOverlay = document.getElementById('levelCompletedOverlay');
      const levelCompletedText = document.getElementById('levelCompletedText');
      levelCompletedText.textContent = `LEVEL ${levelNum} COMPLETED`;
      levelCompletedOverlay.style.display = 'flex';
      
      setTimeout(() => {
        levelCompletedOverlay.style.display = 'none';
        
        // Check if player won (completed level 15)
        if (this.level >= 15) {
          this.showWinScreen();
        } else {
          this.level++;
          this.score += this.level * 500;
          this.initLevel();
        }
      }, 1500);
      enemies.length = 0; // prevent re-trigger
    }

    // Player dead
    if (!player.alive && player.anim.done) {
      this.state = 'dead';
      document.getElementById('shopBtn').style.display = 'none';
      this.showDeathScreen();
    }

    // Update HUD
    document.getElementById('healthFill').style.width = (player.hp / player.maxHp * 100) + '%';
    document.getElementById('scoreVal').textContent = String(this.score).padStart(6, '0');
    document.getElementById('levelVal').textContent = String(this.level).padStart(2, '0');
    
    // Update skill cooldown display
    const skill1Ready = player.skill1Cooldown <= 0;
    const skill2Ready = player.skill2Cooldown <= 0;
    const skill3Ready = player.skill3Cooldown <= 0;
    document.getElementById('skill1CoolVal').textContent = skill1Ready ? 'RDY' : player.skill1Cooldown.toFixed(1);
    document.getElementById('skill1CoolVal').style.color = skill1Ready ? '#00ff00' : '#ff8800';
    document.getElementById('skill2CoolVal').textContent = skill2Ready ? 'RDY' : player.skill2Cooldown.toFixed(1);
    document.getElementById('skill2CoolVal').style.color = skill2Ready ? '#00ff00' : '#ff8800';
    document.getElementById('skill3CoolVal').textContent = skill3Ready ? 'RDY' : player.skill3Cooldown.toFixed(1);
    document.getElementById('skill3CoolVal').style.color = skill3Ready ? '#00ff00' : '#ff8800';
  }

  spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 150;
      this.particles.push(new Particle(x, y, Math.cos(angle)*speed, Math.sin(angle)*speed - 50, color, 0.4 + Math.random()*0.4));
    }
  }

  showDeathScreen() {
    // Play game over sound
    soundManager.playGameOver();
    const ov = document.getElementById('overlay');
    ov.innerHTML = `
      <h1 style="color:#ff0044;text-shadow:0 0 20px #ff0044">FLATLINED</h1>
      <div class="sub" style="color:#ff00ff">SIGNAL LOST</div>
      <div style="color:#888;font-size:14px;margin-bottom:30px">SCORE: <span style="color:#00ffff">${this.score}</span></div>
      <button class="startBtn" style="border-color:#ff0044;color:#ff0044" onclick="restartGame()">[ RECONNECT ]</button>
    `;
    ov.style.display = 'flex';
  }

  showWinScreen() {
    // Play victory sound
    soundManager.playLevelComplete();
    const ov = document.getElementById('overlay');
    ov.innerHTML = `
      <h1 style="color:#00ff88;text-shadow:0 0 30px #00ff88, 0 0 60px #00ff88">VICTORY</h1>
      <div class="sub" style="color:#00ffff">ALL STAGES CLEARED</div>
      <div style="color:#888;font-size:14px;margin-bottom:30px">FINAL SCORE: <span style="color:#00ffff">${this.score}</span></div>
      <button class="startBtn" style="border-color:#00ff88;color:#00ff88" onclick="restartGame()">[ PLAY AGAIN ]</button>
    `;
    ov.style.display = 'flex';
    document.getElementById('shopBtn').style.display = 'none';
    this.state = 'win';
  }

  draw() {
    const { ctx, W, H, camera } = this;
    const cam = camera.getOffset();
    ctx.clearRect(0, 0, W, H);

    // Background
    this.drawBackground(ctx, cam);

    // Platforms
    for (const p of this.platforms) p.draw(ctx, cam);

    // Powerups
    for (const pw of this.powerups) pw.draw(ctx, cam);

    // Update player DOM element position based on camera
    if (this.player.domElement) {
      const screenX = this.player.x - cam.x;
      const screenY = this.player.y - cam.y;
      this.player.domElement.style.left = screenX + 'px';
      this.player.domElement.style.top = screenY + 'px';
    }

    // Player
    this.player.draw(ctx, cam);

    // Enemies
    for (const e of this.enemies) e.draw(ctx, cam);

    // Projectiles
    for (const p of this.projectiles) p.draw(ctx, cam);

    // Portal animation (boss intro)
    if (this.portal) {
      this.portal.draw(ctx, cam);
    }

    // Explosions (Ultra Bomb effect)
    for (const exp of this.explosions) {
      const px = exp.x - cam.x;
      const py = exp.y - cam.y;
      
      // Get animation progress (0 to 1)
      const progress = exp.time / (exp.maxDuration || 0.5);
      
      // Draw main explosion circle with expanding effect
      const expandedRadius = exp.radius * (1 + progress * 0.3);
      ctx.globalAlpha = 0.5 * (1 - progress);
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.arc(px, py, expandedRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw multiple wave rings for ripple effect
      const waveCount = 4;
      for (let i = 0; i < waveCount; i++) {
        const waveProgress = (progress + i / waveCount) % 1;
        const waveRadius = exp.radius * waveProgress;
        const waveAlpha = 0.8 * (1 - waveProgress);
        
        ctx.globalAlpha = waveAlpha;
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3 + waveProgress * 2;
        ctx.shadowBlur = 20 + waveProgress * 10;
        ctx.shadowColor = '#ff6600';
        ctx.beginPath();
        ctx.arc(px, py, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Draw outer ring
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff6600';
      ctx.beginPath();
      ctx.arc(px, py, exp.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Particles
    for (const p of this.particles) p.draw(ctx, cam);

    // Pause overlay
    if (this.state === 'paused') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 48px monospace';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00ffff';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', W/2, H/2);
      ctx.shadowBlur = 0;
    }
  }

  drawBackground(ctx, cam) {
    const { W, H } = this;
    const time = this.timeOfDay;
    
    // Color palettes for different times of day
    let skyTop, skyMid, skyBottom, starColor, starAlphaMult, buildingColor, windowDarkColor, gridColor;
    
    if (time === 'morning') {
      // Morning: warm oranges, pinks, and light blues
      skyTop = '#ff9966';
      skyMid = '#ffcc99';
      skyBottom = '#99ddff';
      starColor = '#ffffff';
      starAlphaMult = 0.1; // Stars barely visible in morning
      buildingColor = '#ff6633';
      windowDarkColor = '#ff9966';
      gridColor = '#ffffff44';
    } else if (time === 'afternoon') {
      // Afternoon: bright blues and yellows
      skyTop = '#0066ff';
      skyMid = '#3399ff';
      skyBottom = '#99ccff';
      starColor = '#ffffff';
      starAlphaMult = 0.05; // Stars nearly invisible
      buildingColor = '#0066aa';
      windowDarkColor = '#0033aa';
      gridColor = '#00ffff11';
    } else {
      // Night: dark blues and purples (original theme)
      skyTop = '#000010';
      skyMid = '#0a001a';
      skyBottom = '#000005';
      starColor = '#ffffff';
      starAlphaMult = 1; // Full star visibility
      buildingColor = '#330066';
      windowDarkColor = '#2a1a3a';
      gridColor = '#00ffff11';
    }
    
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(0.6, skyMid);
    grad.addColorStop(1, skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const t = Date.now() / 1000;
    // Parallax stars (layer 1 - far)
    for (const s of this.bgStars) {
      const px = ((s.x - cam.x * 0.1) % (this.levelW + 200));
      const py = s.y;
      const alpha = (0.4 + Math.sin(t * 2 + s.b * 10) * 0.3) * starAlphaMult;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = starColor;
      ctx.fillRect(px, py, s.s, s.s);
    }
    ctx.globalAlpha = 1;

    // Parallax city silhouette (layer 2)
    const cityOff = -(cam.x * 0.3) % (W * 2);
    for (let i = 0; i < 20; i++) {
      const bx = cityOff + i * 170 - 200;
      const bh = 120 + (i * 50 % 100);
      // Building
      ctx.fillStyle = buildingColor;
      ctx.fillRect(bx % (W * 2 + 400) - 400, H - 40 - bh, 130, bh);
      // Windows
      for (let wy = H - 40 - bh + 10; wy < H - 50; wy += 15) {
        for (let wx = bx + 8; wx < bx + 120; wx += 18) {
          if (Math.random() > 0.4) {
            ctx.fillStyle = windowDarkColor;
            ctx.fillRect(wx % (W * 2 + 400) - 400, wy, 8, 6);
          }
        }
      }
    }

    // Scanlines
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#000';
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);
    ctx.globalAlpha = 1;

    // Grid floor
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const gridOff = -(cam.x * 0.5) % 80;
    for (let gx = gridOff; gx < W; gx += 80) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
  }
}
