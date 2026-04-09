# THE STAGE SHOT - Game Mechanics & Balance Guide

## Table of Contents
1. [Player Stats](#player-stats)
2. [Combat System](#combat-system)
3. [Skills & Abilities](#skills--abilities)
4. [Enemy Types](#enemy-types)
5. [Boss Progression](#boss-progression)
6. [Powerups](#powerups)
7. [Game Mechanics](#game-mechanics)

---

## Player Stats

### Base Stats
| Stat | Value |
|------|-------|
| **Health (HP)** | 600 |
| **Movement Speed** | 220 units/sec |
| **Jump Force** | -480 units/sec |
| **Width** | 28 pixels |
| **Height** | 42 pixels |

---

## Combat System

### Basic Attack (Automatic Shots)
| Property | Value |
|----------|-------|
| **Damage** | 120 |
| **Fire Rate (Normal)** | 0.22 seconds |
| **Fire Rate (Rapid Powerup)** | 0.077 seconds (3.5x faster) |
| **Projectile Speed** | 700 units/sec (horizontal) |
| **Projectile Size** | 14×4 pixels |
| **Projectile Color** | Cyan (#00ffff) |

---

## Skills & Abilities

All skills are available from game start with cooldown-based usage.

### Skill 1: Laser Canon ⚡
**Yellow laser attack that fires 3 powerful projectiles in a spread pattern**

| Property | Value |
|----------|-------|
| **Cooldown** | 5 seconds |
| **Activation Duration (Visual)** | 0.3 seconds |
| **Projectiles Fired** | 3 |
| **Damage per Projectile** | 180 |
| **Total Damage** | 540 |
| **Spread Angle** | -15°, 0°, +15° |
| **Projectile Speed** | 700 units/sec |
| **Projectile Size** | 16×8 pixels (larger than basic) |
| **Color** | Yellow (#ffff00) |
| **Visual Effect** | Glow aura around player |

**Strategy:** Best for clearing multiple enemies or burst damage on bosses.

---

### Skill 2: Ultra Bomb 💣
**Explosive area-of-effect attack dealing massive damage in a radius**

| Property | Value |
|----------|-------|
| **Cooldown** | 8 seconds |
| **Activation Duration (Visual)** | 0.3 seconds |
| **Damage** | 160 |
| **Damage Radius** | 250 pixels |
| **Effect Duration** | 0.5 seconds |
| **Center Position** | Player center |
| **Color** | Orange (#ff6600) |
| **Visual Effect** | Glow aura + Explosion particle effect + Camera shake (8 units) |

**Strategy:** Excellent for crowd control and clearing groups of enemies. Triggers screen shake effect.

---

### Skill 3: Dash 💨
**Quick dash movement with temporary invincibility frames**

| Property | Value |
|----------|-------|
| **Cooldown** | 3 seconds |
| **Activation Duration (Visual)** | 0.3 seconds |
| **Dash Distance** | ~660 pixels (speed × 3 × 0.15) |
| **Dash Duration** | 0.15 seconds (150ms) |
| **Invincibility Duration** | 0.15 seconds |
| **Movement Speed During Dash** | 660 units/sec |
| **Direction** | Same as facing direction (left/right) |
| **Visual Effect** | White glow aura |

**Strategy:** Use for dodging incoming attacks and repositioning quickly.

---

### Skill 4: Beam 🔥
**Horizontal beam attack spanning across the entire level**

| Property | Value |
|----------|-------|
| **Cooldown** | 10 seconds |
| **Activation Duration (Visual)** | 0.3 seconds |
| **Damage** | 200 |
| **Beam Height** | 30 pixels |
| **Beam Width** | Full level width |
| **Direction** | Follows facing direction (left/right) |
| **Effect Duration** | 0.6 seconds |
| **Damage Application** | First frame only (instant hit) |
| **Visual Effect** | Pink/Magenta glow (#ff0088) + Camera shake (6 units) |
| **Particle Effect** | 15 particles spawned at origin |

**Strategy:** Use to clear waves of enemies or deal massive single damage to bosses. Most powerful single-use attack.

---

## Enemy Types

### Small Enemies (Non-Boss)

#### Grunt
| Property | Base Value | +1 Level Scaling |
|----------|-----------|------------------|
| **Health (HP)** | 60 | +30% per level |
| **Damage** | 15 | Base (no scaling) |
| **Movement Speed** | 80 units/sec | +15% per level |
| **Fire Rate** | 2.0 seconds | Base |
| **Projectile Speed** | 300 units/sec | Base |
| **Score Reward** | 100 points | Base |
| **Width** | 26 pixels | Base |
| **Height** | 38 pixels | Base |

#### Sniper
| Property | Base Value | +1 Level Scaling |
|----------|-----------|------------------|
| **Health (HP)** | 40 | +30% per level |
| **Damage** | 30 | Base (no scaling) |
| **Movement Speed** | 40 units/sec | +15% per level |
| **Fire Rate** | 3.5 seconds | Base |
| **Projectile Speed** | 450 units/sec | Base |
| **Score Reward** | 200 points | Base |
| **Width** | 24 pixels | Base |
| **Height** | 36 pixels | Base |

**Notes:**
- Snipers are slower but deal 2× damage and have faster projectiles
- Grunts are more common and spawn in groups
- Both scale with level: every level increases HP by 30% and speed by 15%
- They patrol when player is >350 pixels away
- They actively pursue when player is <350 pixels away
- They stop and shoot when within 150 pixels of player

---

## Boss Progression

### Boss Mechanics
- **Spawn Trigger:** After all small enemies are defeated
- **Boss Count:** 1 per level
- **AI Behavior:** More aggressive than regular enemies
- **Reward:** Significant score points and level progression

### Level-Specific Boss Stats
Each level has a progressively stronger boss with increased difficulty.

| Level | HP | Damage | Speed | Fire Rate | Score | Width | Height |
|-------|-----|--------|-------|-----------|-------|-------|--------|
| 1 | 150 | 20 | 70 | 1.5s | 500 | 50 | 58 |
| 2 | 200 | 22 | 75 | 1.4s | 600 | 52 | 60 |
| 3 | 280 | 24 | 80 | 1.3s | 750 | 54 | 62 |
| 4 | 350 | 26 | 85 | 1.2s | 900 | 56 | 64 |
| 5 | 450 | 28 | 90 | 1.1s | 1,100 | 58 | 66 |
| 6 | 550 | 30 | 95 | 1.0s | 1,250 | 60 | 68 |
| 7 | 650 | 32 | 100 | 0.95s | 1,400 | 62 | 70 |
| 8 | 750 | 34 | 105 | 0.9s | 1,550 | 64 | 72 |
| 9 | 850 | 36 | 110 | 0.85s | 1,700 | 66 | 74 |
| 10 | 950 | 38 | 115 | 0.8s | 1,900 | 68 | 76 |
| 11 | 1,050 | 40 | 120 | 0.75s | 2,100 | 70 | 78 |
| 12 | 1,150 | 42 | 125 | 0.7s | 2,300 | 72 | 80 |
| 13 | 1,250 | 44 | 130 | 0.65s | 2,500 | 74 | 82 |
| 14 | 1,350 | 46 | 135 | 0.6s | 2,700 | 76 | 84 |
| 15 (Megaboss) | 2,000 | 50 | 140 | 0.5s | 5,000 | 90 | 100 |

---

## Powerups

### Powerup Types & Effects

#### Shield 🛡️ (Green)
| Property | Value |
|----------|-------|
| **Duration** | 8 seconds |
| **Effect** | Absorbs one hit-that-would-be fatal |
| **Visuals** | Green glowing ellipse around player |
| **Color** | Green (#00ff88) |
| **Drop Chance** | 30% chance when enemy dies |

**Strategy:** Critical for survival during intense battles.

#### Rapid Fire ⚡ (Orange)
| Property | Value |
|----------|-------|
| **Duration** | 8 seconds |
| **Fire Rate Reduction** | 65% (0.22s → 0.077s) |
| **Damage Multiplier** | None (same 120 damage per shot) |
| **Shots/Second** | ~13 shots/sec (vs 4.5 normal) |
| **DPS Increase** | ~3.5× increase |
| **Visuals** | Orange glowing ellipse around player |
| **Color** | Orange (#ff8800) |
| **Drop Chance** | 30% chance when enemy dies |
| **Audio** | Different shoot sound effect |

**Strategy:** Best for maximizing basic attack damage output during extended fights.

#### Health Pack ♥️ (Pink)
| Property | Value |
|----------|-------|
| **Effect** | +40 HP restored |
| **Max HP Cap** | Player max HP (600) |
| **Visuals** | Pink glowing square |
| **Color** | Pink (#ff0088) |
| **Drop Chance** | 30% chance when enemy dies |

**Notes:** 
- Spawns 3 automatically at level start
- Only applies healing up to max HP
- Critical for sustaining through difficult encounters

---

## Game Mechanics

### Health & Damage
| Property | Value |
|----------|-------|
| **Player Max HP** | 600 |
| **Basic Attack Damage** | 120 |
| **Gravity** | 900 units/sec² |
| **Fall Damage Threshold** | Falls >100 pixels below level = death |
| **Invincibility Frames** | 1.0 second after taking damage |

### Invincibility & Protection
- **Active Shield:** Blocks one attack (removes shield powerup)
- **Dash Invincibility:** 0.15 seconds during dash
- **Post-Hit Invincibility:** 1.0 second flashing state
- **Flash Visual:** Player blinks during invincibility

### Level Mechanics
- **Level Width:** 2400 pixels
- **Level Height:** 500 pixels
- **Ground Level:** 460 pixels (500 - 40)
- **Floating Platforms:** ~10 platforms at varying heights
- **Small Enemies per Level:** 5 + (level × 2)
- **Example:** Level 1 = 7 enemies, Level 5 = 15 enemies
- **Max Levels:** 15 (Megaboss final)

### Enemy Spawning
- **Spawn Conditions:** 
  - Random X position: 300 to (2400 - 700) pixels
  - Random Y position: 100 to 300 pixels
- **Enemy Type Cycling:** 
  - Alternates visuals every level (enemy vs enemy-2 sprites)
  - Levels 1,3,5... use 'enemy' sprites
  - Levels 2,4,6... use 'enemy-2' sprites
- **Enemy Composition:** Random mix of Grunts and Snipers (based on level)
  - Level 1-2: Only Grunts
  - Level 2+: Mix of Grunts and Snipers
  - Level 3+: More Snipers included

### Enemy AI
| Behavior | Trigger | Action |
|----------|---------|--------|
| Patrol | Player >350px away | Walk back & forth slowly (50% speed) |
| Chase | Player <350px away | Walk toward player at full speed |
| Standstill | Player <150px away | Stop moving, prepare to shoot |
| Shoot | Player <400px away + not on cooldown | Fire projectile at player |
| Direction Change | Hit platform wall | Reverse patrol direction |

### Scoring System
- **Grunt Kill:** 100 points
- **Sniper Kill:** 200 points
- **Boss Kills:** Level-dependent (500-5000 points)
- **Total Score:** Accumulated across all kills in progression

### Platform System
- **Ground Platform:** Full level width, 40 pixels tall
- **Floating Platforms:** 10 platforms with varying colors (cyan, magenta, yellow, green)
- **Collision:** Top surface landing, bottom/side blocking
- **Fall Damage:** Only when falling >100 pixels below level

### Camera System
- **Smooth Following:** Camera follows player movement
- **Pan Effect:** Camera pans to boss when revealed
- **Shake Effect:** 
  - 8 units: Ultra Bomb activation
  - 6 units: Beam skill activation
  - 5 units: Enemy hit by projectile
  - 3 units: Enemy hit by explosion
  - 2 units: Small projectile hits

### Visual Time of Day Cycling
- **Level 1, 4, 7, 10, 13:** Morning
- **Level 2, 5, 8, 11, 14:** Afternoon
- **Level 3, 6, 9, 12, 15:** Night

---

## Combat Tips & Strategy

### Effective Enemy Elimination
1. **Grunts:** Use basic attacks or Laser Canon (Skill 1)
2. **Snipers:** Keep moving to avoid accurate shots; use Dash (Skill 3) to dodge
3. **Bosses:** Combine skills strategically - use Beam (Skill 4) for burst damage, Ultra Bomb (Skill 2) for area control

### Skill Usage Priority
1. **Dash (Skill 3):** Use first for mobility/dodging (shortest cooldown: 3s)
2. **Laser Canon (Skill 1):** Use for burst damage on groups (5s cooldown)
3. **Ultra Bomb (Skill 2):** Use for crowd control (8s cooldown)
4. **Beam (Skill 4):** Save for boss battles or critical moments (10s cooldown)

### Powerup Strategy
- **Shield:** Use early in difficult levels as buffer
- **Rapid Fire:** Activate during boss fights for sustained DPS
- **Health:** Collect when low on HP (never waste full heal)

### Damage Output Comparison
- **Basic Attack DPS:** 120 × 4.5/sec = **540 DPS**
- **Rapid Fire DPS:** 120 × 13/sec = **1,560 DPS**
- **Skill 1 Burst:** 540 damage in 0.05s = **10,800 DPS** (instantaneous)
- **Skill 2 Burst:** 160 damage in 0.5s area effect = **320 DPS**
- **Skill 4 Burst:** 200 damage instant = **∞ DPS** (instant hit)

---

## Game State Conditions

### Winning Conditions
- Defeat all small enemies in a level
- Defeat the boss enemy for that level
- Progress to next level
- Defeat level 15 boss to win the game

### Losing Conditions
- Player HP reaches 0 (death animation plays)
- Player falls below level bottom + 100 pixels
- Game returns to menu on loss

### Level Completion
- Automatically triggered after boss death timer expires (0.6 seconds)
- Shows level complete screen
- Advances to next level when player proceeds

---

## Scaling & Difficulty Progression

### Per-Level Difficulty Increase
- **HP Scaling Formula:** Base HP × (1 + (level - 1) × 0.30)
  - Example: Grunt Level 5 = 60 × (1 + 4 × 0.30) = 60 × 2.20 = 132 HP
- **Speed Scaling Formula:** Base Speed × (1 + (level - 1) × 0.15)
  - Example: Grunt Level 5 = 80 × (1 + 4 × 0.15) = 80 × 1.60 = 128 units/sec
- **Score Scaling:** Fixed per enemy type regardless of level
- **Enemy Count Increase Formula:** 5 + (level × 2) small enemies

### Boss Difficulty Scaling
- HP increases 100-200 points per level (linear)
- Speed increases 5-10 units per level
- Fire rate decreases 0.05-0.1 seconds per level (faster shooting)
- Sprite size increases (visual indicator of strength)

---

## Audio Cues
- **Player Shoot:** Variable pitch shoot sound
- **Rapid Fire:** Different sound effect when powerup active
- **Skill Activation:** Unique sound per skill (laser, bomb, dash, laser/beam)
- **Enemy Shoot:** Variable enemy projectile sound
- **Hit Feedback:** Different sounds for player hit vs boss hit
- **Death:** Player death sound, enemy death sound, boss death sound
- **Powerup Pickup:** Health vs shield/rapid different sounds
- **Explosion:** Unique explosion sound for Ultra Bomb
- **Boss Warn:** Warning sound when boss portal approaches

---

*Last Updated: April 2026*
*Game Version: Current Development Build*
