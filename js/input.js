// ============================================================
// INPUT
// ============================================================
let game;
let selectedLevel = 1;  // Track selected level from options
let playingFromSelectLevel = false; // Track if game started from "Select Level" mode

function startGame() {
  console.log('[startGame] selectedLevel:', selectedLevel, 'type:', typeof selectedLevel);
  if (!game) {
    game = new Game(document.getElementById('gameCanvas'));
    setupInput();
    setupMobile();
  }
  game.level = selectedLevel;
  game.fromSelectLevel = playingFromSelectLevel; // Set the flag based on how game was started
  console.log('[startGame] game.level set to:', game.level);
  console.log('[startGame] game.fromSelectLevel set to:', game.fromSelectLevel);
  game.score = 0;
  game.player = null;
  game.initLevel();
  console.log('[startGame] Game initialized for level', game.level, 'with', game.enemies.length, 'enemies');
  game.start();
}

function restartGame() {
  // If restarting from victory (game completed), reset to level 1
  // If restarting from death, keep the current level
  if (game.state === 'win') {
    game.level = 1;
    playingFromSelectLevel = false; // Reset the flag on victory
  }
  // For 'dead' state, game.level stays the same - restart at the same stage
  game.score = 0;
  game.player = null;
  game.fromSelectLevel = playingFromSelectLevel; // Update the flag
  game.initLevel();
  game.start();
}

function setupInput() {
  const keys = {};
  document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (['ArrowUp','Space','KeyW','ArrowLeft','ArrowRight','KeyA','KeyD','KeyJ','KeyK','KeyL','KeyU','KeyP'].includes(e.code)) e.preventDefault();
    const inp = game.input;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') inp.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') inp.right = true;
    if ((e.code === 'ArrowUp' || e.code === 'KeyW') && !inp._jumpHeld) {
      inp.jumpPressed = true;
      inp._jumpHeld = true;
    }
    if (e.code === 'Space') inp.shoot = true;
    if (e.code === 'KeyJ') inp.skill1 = true;
    if (e.code === 'KeyK') inp.skill2 = true;
    if (e.code === 'KeyL') inp.skill3 = true;
    if (e.code === 'KeyU') inp.skill4 = true;
    if (e.code === 'KeyP') showShop();
    if (e.code === 'Escape') game.togglePause();
  });
  document.addEventListener('keyup', e => {
    const inp = game.input;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') inp.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') inp.right = false;
    if (e.code === 'ArrowUp' || e.code === 'KeyW') inp._jumpHeld = false;
    if (e.code === 'Space') inp.shoot = false;
    if (e.code === 'KeyJ') inp.skill1 = false;
    if (e.code === 'KeyK') inp.skill2 = false;
    if (e.code === 'KeyL') inp.skill3 = false;
    if (e.code === 'KeyU') inp.skill4 = false;
  });
}

function setupMobile() {
  const mc = document.getElementById('mobileControls');
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    mc.style.display = 'block';
    document.getElementById('pauseBtn').style.pointerEvents = 'all';
  }
  function hold(id, onStart, onEnd) {
    const el = document.getElementById(id);
    el.addEventListener('touchstart', e => { e.preventDefault(); onStart(); }, { passive: false });
    el.addEventListener('touchend', e => { e.preventDefault(); onEnd(); }, { passive: false });
    el.addEventListener('mousedown', onStart);
    el.addEventListener('mouseup', onEnd);
  }
  hold('btnLeft', () => game.input.left = true, () => game.input.left = false);
  hold('btnRight', () => game.input.right = true, () => game.input.right = false);
  hold('btnJump', () => { game.input.jumpPressed = true; }, () => {});
  hold('btnShoot', () => game.input.shoot = true, () => game.input.shoot = false);
  // Skill buttons - one-shot on press
  hold('btnSkill1', () => { game.input.skill1 = true; }, () => {});
  hold('btnSkill2', () => { game.input.skill2 = true; }, () => {});
  hold('btnSkill3', () => { game.input.skill3 = true; }, () => {});
  hold('btnSkill4', () => { game.input.skill4 = true; }, () => {});
}

// Global sound setting
let soundEnabled = true;

function showOptions() {
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('optionsOverlay').style.display = 'flex';
  document.getElementById('soundToggle').checked = soundEnabled;
  document.getElementById('levelSelect').value = selectedLevel;
}

function closeOptions() {
  // Clear any inline z-index from optionsOverlay
  document.getElementById('optionsOverlay').style.display = 'none';
  document.getElementById('optionsOverlay').style.zIndex = '';
  
  // Show overlay
  const overlay = document.getElementById('overlay');
  overlay.style.display = 'flex';
  overlay.style.zIndex = '';
}

function goToGame() {
  // Start game from SELECT LEVEL mode
  playingFromSelectLevel = true;
  // Hide options overlay before starting
  document.getElementById('optionsOverlay').style.display = 'none';
  startGame();
}

function exitGame() {
  // Show confirmation dialog
  document.getElementById('overlay').style.display = 'none';
  document.getElementById('optionsOverlay').style.display = 'none';
  document.getElementById('confirmExitOverlay').style.display = 'flex';
}

function confirmExit() {
  // Close the game tab or redirect
  window.close();
  // If window.close() doesn't work, redirect to a blank page
  if (!window.closed) {
    window.location.href = 'about:blank';
  }
}

function cancelExit() {
  // Return to main menu
  document.getElementById('confirmExitOverlay').style.display = 'none';
  document.getElementById('overlay').style.display = 'flex';
}

// Sound control
function toggleSound() {
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundManager.enabled = soundToggle.checked;
  }
}

// Listen for sound toggle changes
document.addEventListener('DOMContentLoaded', () => {
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.addEventListener('change', toggleSound);
    // Initialize sound manager with current setting
    soundManager.enabled = soundToggle.checked;
  }

  // Handle level selector
  const levelSelect = document.getElementById('levelSelect');
  if (levelSelect) {
    levelSelect.addEventListener('change', () => {
      const newLevel = parseInt(levelSelect.value);
      console.log('[levelSelect change] New level selected:', newLevel, 'Value:', levelSelect.value);
      selectedLevel = newLevel;
    });
    // Also log the initial value
    console.log('[levelSelect init] Initial value:', levelSelect.value, 'selectedLevel:', selectedLevel);
  }
});

// Shop functions
function showShop() {
  if (!game || !game.state === 'playing') return;
  game.state = 'paused';
  const shopOverlay = document.getElementById('shopOverlay');
  const shopScoreDisplay = document.getElementById('shopScoreDisplay');
  shopScoreDisplay.textContent = String(game.player.score).padStart(6, '0');
  shopOverlay.style.display = 'flex';
}

function closeShop() {
  const shopOverlay = document.getElementById('shopOverlay');
  shopOverlay.style.display = 'none';
  if (game) game.state = 'playing';
}

function buyPowerup(type) {
  if (!game || !game.player) return;
  
  const costs = { shield: 500, rapid: 500, health: 300 };
  const cost = costs[type] || 0;
  
  if (game.player.score >= cost) {
    game.player.score -= cost;
    game.score = game.player.score;
    
    // Apply powerup
    if (type === 'health') {
      game.player.hp = Math.min(game.player.maxHp, game.player.hp + 40);
    } else {
      game.player.powerup = type;
      game.player.powerupTimer = 8;
    }
    
    // Update display
    const shopScoreDisplay = document.getElementById('shopScoreDisplay');
    shopScoreDisplay.textContent = String(game.player.score).padStart(6, '0');
  }
}

// Pause menu functions
function reviveGame() {
  if (game) {
    // Hide pause overlay
    document.getElementById('pauseOverlay').style.display = 'none';
    
    // Reset current level from the start
    game.state = 'playing';
    game.score = 0;
    game.player = null;
    game.initLevel();
    game.start();
  }
}

function pauseBackToMenu() {
  // Hide pause overlay
  document.getElementById('pauseOverlay').style.display = 'none';
  
  // Reset game state
  if (game) {
    game.state = 'menu';
    if (game.rafId) cancelAnimationFrame(game.rafId);
    game.rafId = null;
  }
  
  // Hide shop button
  document.getElementById('shopBtn').style.display = 'none';
  
  // Reset the flag when pausing and going back to menu
  playingFromSelectLevel = false;
  
  // Show main menu overlay
  document.getElementById('overlay').style.display = 'flex';
  document.getElementById('overlay').innerHTML = `
    <h1>THE STAGE SHOT</h1>
    <div class="sub">A 2D Shooting Video Game</div>
    
    <div class="menuBox">
      <div class="menuContent">
        <div class="instructionsSection">
          <div class="instructionsHeader">INSTRUCTIONS</div>
          <div class="instructionsText">
            Have level 15 stages<br>and finish it to win.
          </div>
        </div>
        <div class="avatarCircle"></div>
      </div>
    </div>

    <div class="buttonContainer">
      <button class="menuBtn" onclick="startGame()">START GAME</button>
      <button class="menuBtn" onclick="showOptions()">OPTIONS</button>
      <button class="menuBtn" onclick="exitGame()">EXIT</button>
    </div>
  `;
}

function goToMainMenu() {
  // Reset game state
  if (game) {
    game.state = 'menu';
    if (game.rafId) cancelAnimationFrame(game.rafId);
    game.rafId = null;
  }
  
  // Hide shop button
  document.getElementById('shopBtn').style.display = 'none';
  
  // Reset the flag when going back to main menu
  playingFromSelectLevel = false;
  
  // Show main menu overlay
  document.getElementById('overlay').style.display = 'flex';
  document.getElementById('overlay').innerHTML = `
    <h1>THE STAGE SHOT</h1>
    <div class="sub">A 2D Shooting Video Game</div>
    
    <div class="menuBox">
      <div class="menuContent">
        <div class="instructionsSection">
          <div class="instructionsHeader">INSTRUCTIONS</div>
          <div class="instructionsText">
            Have level 15 stages<br>and finish it to win.
          </div>
        </div>
        <div class="avatarCircle"></div>
      </div>
    </div>

    <div class="buttonContainer">
      <button class="menuBtn" onclick="startGame()">START GAME</button>
      <button class="menuBtn" onclick="showOptions()">OPTIONS</button>
      <button class="menuBtn" onclick="exitGame()">EXIT</button>
    </div>
  `;
}

function selectAnotherLevel() {
  // Go back to options overlay to select another level
  const overlay = document.getElementById('overlay');
  const optionsOverlay = document.getElementById('optionsOverlay');
  
  // Clear inline styles from overlay
  overlay.style.display = 'none';
  overlay.style.zIndex = '';
  overlay.style.alignItems = '';
  overlay.style.justifyContent = '';
  
  // Show options overlay with proper z-index
  optionsOverlay.style.display = 'flex';
  optionsOverlay.style.zIndex = '999';
  
  document.getElementById('levelSelect').value = selectedLevel;
}

