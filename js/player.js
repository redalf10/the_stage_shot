// ============================================================
// PLAYER
// ============================================================
class Player {
  constructor(x, y, playerSprite) {
    this.x = x; this.y = y;
    this.w = 28; this.h = 42;
    this.vx = 0; this.vy = 0;
    this.speed = 220;
    this.jumpForce = -480;
    this.onGround = false;
    this.facing = 1; // 1=right, -1=left
    this.hp = 600; this.maxHp = 600;
    this.alive = true;
    this.invincible = 0;
    this.shootCooldown = 0;
    this.shootRate = 0.22;
    this.score = 0;
    this.powerup = null; // 'rapid'|'shield'
    this.powerupTimer = 0;
    
    // Skills
    this.skill1Available = true; // Laser Canon
    this.skill1Cooldown = 0;
    this.skill1CooldownMax = 5; // 5 seconds
    this.skill1Active = false;
    this.skill1Timer = 0;
    
    this.skill2Available = true; // Ultra Bomb
    this.skill2Cooldown = 0;
    this.skill2CooldownMax = 8; // 8 seconds
    this.skill2Active = false;
    this.skill2Timer = 0;
    
    this.skill3Available = true; // Dash
    this.skill3Cooldown = 0;
    this.skill3CooldownMax = 3; // 3 seconds
    this.skill3Active = false;
    this.skill3Timer = 0;
    this.dashDistance = 0;
    this.dashDuration = 0.15; // 150ms dash
    
    this.skill4Available = true; // Beam
    this.skill4Cooldown = 0;
    this.skill4CooldownMax = 10; // 10 seconds
    this.skill4Active = false;
    this.skill4Timer = 0;
    
    this.playerSprite = playerSprite;
    this.spriteLoader = new SpriteLoader('player', this);
    this.domElement = document.getElementById('player'); // Reference to DOM element
    this.currentAnimClass = 'idle';
    // Animation state - frame counts based on actual PNG files
    this.anim = new SpriteAnimator({
      idle:           { frames: 1, fps: 1, loop: true },
      run:            { frames: 2, fps: 8, loop: true },
      jump:           { frames: 2, fps: 8, loop: false },
      shoot:          { frames: 1, fps: 1, loop: false },
      'shoot-while-run': { frames: 1, fps: 1, loop: false },
      skill:          { frames: 1, fps: 1, loop: false },
      hit:            { frames: 1, fps: 1, loop: false },
      die:            { frames: 3, fps: 8, loop: false },
    });
    this.anim.play('idle');
    this.flashTimer = 0;
    this.justJumped = false; // Flag for jump effect
  }

  update(dt, input, platforms) {
    if (!this.alive) {
      this.anim.update(dt);
      return;
    }
    // Powerup timer
    if (this.powerupTimer > 0) {
      this.powerupTimer -= dt;
      if (this.powerupTimer <= 0) this.powerup = null;
    }
    // Horizontal
    let moving = false;
    if (input.left) { this.vx = -this.speed; this.facing = -1; moving = true; }
    else if (input.right) { this.vx = this.speed; this.facing = 1; moving = true; }
    else this.vx *= 0.75;
    // Jump
    if (input.jump && this.onGround) {
      this.vy = this.jumpForce;
      this.onGround = false;
      this.justJumped = true;
    }
    // Gravity
    this.vy += 900 * dt;
    this.vy = Math.min(this.vy, 700);
    // Move & collide
    this.x += this.vx * dt;
    this.x = Math.max(0, this.x);
    this.onGround = false;
    const prevY = this.y;
    this.y += this.vy * dt;
    for (const p of platforms) {
      if (this.collides(p)) {
        // Check which side we came from using previous position
        if (prevY + this.h <= p.y && this.vy > 0) {
          // Landed on top from above
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
        } else if (prevY >= p.y + p.h && this.vy < 0) {
          // Hit head on platform from below
          this.y = p.y + p.h;
          this.vy = 0;
        } else {
          // Side collision
          if (this.vx > 0) this.x = p.x - this.w;
          else this.x = p.x + p.w;
          this.vx = 0;
        }
      }
    }
    // Shoot cooldown
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    // Invincibility
    if (this.invincible > 0) this.invincible -= dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;
    
    // Skill cooldowns
    if (this.skill1Cooldown > 0) this.skill1Cooldown -= dt;
    if (this.skill2Cooldown > 0) this.skill2Cooldown -= dt;
    if (this.skill3Cooldown > 0) this.skill3Cooldown -= dt;
    if (this.skill4Cooldown > 0) this.skill4Cooldown -= dt;
    if (this.skill1Timer > 0) this.skill1Timer -= dt;
    if (this.skill2Timer > 0) this.skill2Timer -= dt;
    if (this.skill3Timer > 0) this.skill3Timer -= dt;
    if (this.skill4Timer > 0) this.skill4Timer -= dt;
    
    // Handle dash
    if (this.dashDistance > 0) {
      this.dashDistance -= this.speed * 3 * dt; // Fast dash movement
      this.x += this.facing * this.speed * 3 * dt;
    }
    // Animation — accurate to movement state
    const absVx = Math.abs(this.vx);
    const hasVelocity = absVx > 40; // still "moving" during deceleration
    const isMoving = moving || hasVelocity;
    // Don't override one-shot animations until they finish
    const oneShotPlaying = ['shoot','shoot-while-run','skill','hit','die'].includes(this.anim.current) && !this.anim.done;
    if (!oneShotPlaying) {
      if (!this.onGround) this.anim.play('jump');
      else if (isMoving) {
        this.anim.play('run');
      }
      else this.anim.play('idle');
    }
    this.anim.update(dt);
    
    // Update DOM element class
    this.updateSpriteClass();
  }

  updateSpriteClass() {
    const animName = this.anim.current || 'idle';
    if (this.currentAnimClass !== animName) {
      if (this.domElement) {
        // Remove all animation classes
        this.domElement.classList.remove('idle', 'run', 'jump', 'shoot', 'shoot-while-run', 'skill', 'hit', 'die');
        // Add current animation class
        const cssClass = animName === 'die' ? 'die' : animName;
        this.domElement.classList.add(cssClass);
        // Update direction
        if (this.facing === -1) {
          this.domElement.classList.add('left');
          this.domElement.classList.remove('right');
        } else {
          this.domElement.classList.add('right');
          this.domElement.classList.remove('left');
        }
        this.currentAnimClass = animName;
      }
    }
  }

  collides(r) {
    return this.x < r.x + r.w && this.x + this.w > r.x &&
           this.y < r.y + r.h && this.y + this.h > r.y;
  }

  shoot(projectiles) {
    const rate = this.powerup === 'rapid' ? this.shootRate * 0.35 : this.shootRate;
    if (this.shootCooldown > 0 || !this.alive) return false;
    this.shootCooldown = rate;
    const bx = this.facing === 1 ? this.x + this.w : this.x - 14;
    const by = this.y + this.h / 2 - 2;
    projectiles.push(new Projectile(bx, by, this.facing * 700, 0, 'player', '#00ffff', 120));
    this.anim.play('shoot');
    // Play shoot sound with variation for each shot
    if (this.powerup === 'rapid') {
      soundManager.playWithVariation('rapid-shoot', 0.1, 0.1);
    } else {
      soundManager.playWithVariation('shoot', 0.08, 0.08);
    }
    return true;
  }

  // Skill 1: Laser Canon - Shoots 3 powerful lasers with 50% more damage
  activateSkill1(projectiles) {
    if (this.skill1Cooldown > 0 || !this.alive) return false;
    this.skill1Cooldown = this.skill1CooldownMax;
    this.skill1Active = true;
    this.skill1Timer = 0.3; // Display active for 0.3 seconds
    
    const bx = this.facing === 1 ? this.x + this.w : this.x - 14;
    const by = this.y + this.h / 2 - 2;
    
    // Fire 3 lasers with different angles - spread pattern
    const angles = [-15, 0, 15]; // degrees
    const baseSpeed = 700;
    
    angles.forEach(angle => {
      const rad = (angle * Math.PI) / 180;
      const vx = this.facing * baseSpeed * Math.cos(rad);
      const vy = baseSpeed * Math.sin(rad);
      // 180 damage per shot (30 * 6), bigger size (w:16, h:8)
      projectiles.push(new Projectile(bx, by, vx, vy, 'player', '#ffff00', 150, 'laser', true));
    });
    
    this.anim.play('skill');
    // Play laser skill sound
    soundManager.play('skill-laser');
    return true;
  }

  // Skill 2: Ultra Bomb - Area effect dealing 100% damage to nearby enemies
  activateSkill2() {
    if (this.skill2Cooldown > 0 || !this.alive) return false;
    this.skill2Cooldown = this.skill2CooldownMax;
    this.skill2Active = true;
    this.skill2Timer = 0.3; // Display active for 0.3 seconds
    
    this.anim.play('skill');
    // Play bomb skill sound
    soundManager.play('skill-bomb');
    // Return explosion data to be handled by game
    return {
      x: this.x + this.w / 2,
      y: this.y + this.h / 2,
      radius: 250, // Increased radius for bigger effect
      damage: 150, // 160 damage
      owner: 'player',
      time: 0, // For wave animation
      maxDuration: 0.5 // Duration of wave effect
    };
  }

  // Skill 3: Dash - Quickly move forward and become invincible
  activateDash() {
    if (this.skill3Cooldown > 0 || !this.alive) return false;
    this.skill3Cooldown = this.skill3CooldownMax;
    this.skill3Active = true;
    this.skill3Timer = 0.3; // Display active for 0.3 seconds
    this.dashDistance = this.speed * 3 * this.dashDuration; // Distance to travel
    this.invincible = this.dashDuration; // Invincible during dash
    // Play dash skill sound
    soundManager.play('skill-dash');
    return true;
  }

  // Skill 4: Beam - Huge horizontal beam that reaches the end of the map
  activateBeam(levelW) {
    if (this.skill4Cooldown > 0 || !this.alive) return false;
    this.skill4Cooldown = this.skill4CooldownMax;
    this.skill4Active = true;
    this.skill4Timer = 0.3;
    
    this.anim.play('skill');
    soundManager.play('skill-laser');
    
    const beamY = this.y + this.h / 2;
    const beamStartX = this.facing === 1 ? this.x + this.w : this.x;
    const beamEndX = this.facing === 1 ? levelW : 0;
    const beamHeight = 30; // Huge thick beam
    
    return {
      x: Math.min(beamStartX, beamEndX),
      y: beamY - beamHeight / 2,
      w: Math.abs(beamEndX - beamStartX),
      h: beamHeight,
      damage: 150,
      owner: 'player',
      facing: this.facing,
      originX: beamStartX,
      originY: beamY,
      time: 0,
      maxDuration: 0.6
    };
  }

  takeDamage(dmg) {
    if (this.invincible > 0) return;
    if (this.powerup === 'shield') { this.powerup = null; this.powerupTimer = 0; return; }
    this.hp = Math.max(0, this.hp - dmg);
    this.invincible = 1.0;
    this.flashTimer = 0.5;
    if (this.hp <= 0) { 
      this.alive = false; 
      this.anim.play('die');
      // Play death sound
      soundManager.play('player-die');
    }
    else {
      this.anim.play('hit');
      // Play hit sound when taking damage
      soundManager.playWithVariation('player-hit', 0.1, 0.05);
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
      sw: spriteImg ? spriteImg.naturalWidth : 150,
      sh: spriteImg ? spriteImg.naturalHeight : 150
    };
  }

  draw(ctx, cam) {
    const ox = cam.x, oy = cam.y;
    const cx = this.x - ox + this.w/2;
    const cy = this.y - oy + this.h/2;
    // Flash on hit
    if (this.flashTimer > 0 && Math.floor(this.flashTimer * 10) % 2 === 0) return;

    ctx.save();
    
    // Draw sprite
    const frame = this.getSpriteFrame();
    if (frame.sprite && frame.sprite.complete) {
      const drawW = this.w * 1.8; // Scale sprite to fit game character size
      const drawH = this.h * 1.8;
      ctx.translate(cx, cy);
      ctx.scale(this.facing, 1);
      ctx.drawImage(
        frame.sprite,
        frame.sx, frame.sy, frame.sw, frame.sh,
        -drawW/2, -drawH/2, drawW, drawH
      );
    } else {
      // Fallback to old rendering if sprite not loaded
      ctx.translate(cx, cy);
      ctx.scale(this.facing, 1);
      const f = this.anim.getFrame();
      const t = Date.now() / 1000;
      const bobY = this.onGround ? Math.sin(t * 8) * 1.5 : 0;
      const glowColor = this.powerup === 'shield' ? '#00ff88' : (this.powerup === 'rapid' ? '#ff8800' : '#ff00ff');
      ctx.shadowBlur = 16;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = '#0d0d1f';
      ctx.fillRect(-10, bobY - 14, 20, 24);
      ctx.fillStyle = '#cc00ff';
      ctx.fillRect(-10, bobY - 14, 20, 4);
    }
    
    ctx.shadowBlur = 0;
    ctx.restore();

    // Shield effect
    if (this.powerup === 'shield') {
      ctx.save();
      ctx.globalAlpha = 0.3 + Math.sin(Date.now()/200) * 0.1;
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00ff88';
      ctx.beginPath();
      ctx.ellipse(cx, cy, this.w/2 + 10, this.h/2 + 10, 0, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }

    // Skill 1 (Laser Canon) glow effect
    if (this.skill1Timer > 0) {
      ctx.save();
      ctx.globalAlpha = this.skill1Timer * 2;
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 1;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffff00';
      ctx.beginPath();
      ctx.ellipse(cx, cy, this.w/2 + 5, this.h/2 + 5, 0, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }

    // Skill 2 (Ultra Bomb) glow effect
    if (this.skill2Timer > 0) {
      ctx.save();
      ctx.globalAlpha = this.skill2Timer * 2;
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff6600';
      ctx.beginPath();
      ctx.ellipse(cx, cy, this.w/2 + 8, this.h/2 + 8, 0, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }

    // Skill 3 (Dash) glow effect
    if (this.skill3Timer > 0) {
      ctx.save();
      ctx.globalAlpha = this.skill3Timer * 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(cx, cy, this.w/2 + 6, this.h/2 + 6, 0, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }

    // Skill 4 (Beam) glow effect
    if (this.skill4Timer > 0) {
      ctx.save();
      ctx.globalAlpha = this.skill4Timer * 2;
      ctx.strokeStyle = '#ff0088';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#ff0088';
      ctx.beginPath();
      ctx.ellipse(cx, cy, this.w/2 + 10, this.h/2 + 10, 0, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }
  }
}
