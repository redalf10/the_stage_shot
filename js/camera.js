// ============================================================
// CAMERA
// ============================================================
class Camera {
  constructor(w, h) {
    this.x = 0; this.y = 0;
    this.w = w; this.h = h;
    this.targetX = 0; this.targetY = 0;
    this.shake = 0;
    
    // Pan system for boss reveal
    this.isPanning = false;
    this.panStartX = 0; this.panStartY = 0;
    this.panTargetX = 0; this.panTargetY = 0;
    this.panDuration = 0;
    this.panTimer = 0;
    this.panCallback = null; // Called when pan completes
    this.shouldFollowTarget = true; // Resume following target after pan
  }
  
  follow(target, levelW, levelH) {
    if (this.isPanning) return; // Don't follow while panning
    
    this.targetX = target.x + target.w / 2 - this.w / 2;
    this.targetY = target.y + target.h / 2 - this.h / 2;
    this.targetX = Math.max(0, Math.min(this.targetX, levelW - this.w));
    this.targetY = Math.max(0, Math.min(this.targetY, levelH - this.h));
    this.x += (this.targetX - this.x) * 0.08;
    this.y += (this.targetY - this.y) * 0.08;
  }
  
  // Pan camera to a specific position over duration (in seconds)
  panTo(targetX, targetY, duration, callback = null) {
    this.isPanning = true;
    this.panStartX = this.x;
    this.panStartY = this.y;
    this.panTargetX = targetX;
    this.panTargetY = targetY;
    this.panDuration = duration;
    this.panTimer = 0;
    this.panCallback = callback;
    this.shouldFollowTarget = false;
  }
  
  // Resume following target after pan
  resumeFollowing() {
    this.shouldFollowTarget = true;
  }
  
  update(dt) {
    if (this.isPanning) {
      this.panTimer += dt;
      const progress = Math.min(1, this.panTimer / this.panDuration);
      
      // Smooth interpolation using easing
      const easeProgress = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress; // ease-in-out
      
      this.x = this.panStartX + (this.panTargetX - this.panStartX) * easeProgress;
      this.y = this.panStartY + (this.panTargetY - this.panStartY) * easeProgress;
      
      if (progress >= 1) {
        this.isPanning = false;
        this.x = this.panTargetX;
        this.y = this.panTargetY;
        if (this.panCallback) {
          this.panCallback();
        }
      }
    }
  }
  
  addShake(amt) { this.shake = Math.max(this.shake, amt); }
  getOffset() {
    let sx = 0, sy = 0;
    if (this.shake > 0) {
      sx = (Math.random() - 0.5) * this.shake * 2;
      sy = (Math.random() - 0.5) * this.shake * 2;
      this.shake *= 0.85;
      if (this.shake < 0.5) this.shake = 0;
    }
    return { x: Math.round(this.x + sx), y: Math.round(this.y + sy) };
  }
}
