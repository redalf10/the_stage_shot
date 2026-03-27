// ============================================================
// INPUT
// ============================================================
let game;
let selectedLevel = 1;  // Track selected level from options

function startGame() {
  if (!game) {
    game = new Game(document.getElementById('gameCanvas'));
    setupInput();
    setupMobile();
  }
  game.level = selectedLevel;
  game.score = 0;
  game.player = null;
  game.initLevel();
  game.start();
}

function restartGame() {
  // If restarting from victory (game completed), reset to level 1
  // If restarting from death, keep the current level
  if (game.state === 'win') {
    game.level = 1;
  }
  // For 'dead' state, game.level stays the same - restart at the same stage
  game.score = 0;
  game.player = null;
  game.initLevel();
  game.start();
}

function setupInput() {
  const keys = {};
  document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (['ArrowUp','Space','KeyZ','KeyX','ArrowLeft','ArrowRight','KeyQ','KeyE','KeyR','KeyS'].includes(e.code)) e.preventDefault();
    const inp = game.input;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') inp.left = true;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') inp.right = true;
    if ((e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') && !inp._jumpHeld) {
      inp.jumpPressed = true;
      inp._jumpHeld = true;
    }
    if (e.code === 'KeyZ' || e.code === 'KeyX' || e.code === 'ControlLeft') inp.shoot = true;
    if (e.code === 'KeyQ') inp.skill1 = true;
    if (e.code === 'KeyE') inp.skill2 = true;
    if (e.code === 'KeyR') inp.skill3 = true;
    if (e.code === 'KeyS') showShop();
    if (e.code === 'Escape') game.togglePause();
  });
  document.addEventListener('keyup', e => {
    const inp = game.input;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') inp.left = false;
    if (e.code === 'ArrowRight' || e.code === 'KeyD') inp.right = false;
    if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') inp._jumpHeld = false;
    if (e.code === 'KeyZ' || e.code === 'KeyX' || e.code === 'ControlLeft') inp.shoot = false;
    if (e.code === 'KeyQ') inp.skill1 = false;
    if (e.code === 'KeyE') inp.skill2 = false;
    if (e.code === 'KeyR') inp.skill3 = false;
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
  document.getElementById('optionsOverlay').style.display = 'none';
  document.getElementById('overlay').style.display = 'flex';
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
      selectedLevel = parseInt(levelSelect.value);
      console.log('Level selected:', selectedLevel);
    });
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
function resumeGame() {
  if (game) {
    game.togglePause();
  }
}

function pauseBackToMenu() {
  // Hide pause overlay
  document.getElementById('pauseOverlay').style.display = 'none';
  
  // Reset game state
  if (game) {
    game.state = 'menu';
    game.stop();
  }
  
  // Show main menu overlay
  document.getElementById('overlay').style.display = 'flex';
}

