/* ═══════════════════════════════════════════════════════
   PLAYBACK ENGINE — Shared step-based visualizer controls
   Used by: array, stack, queue, tree, hash
   ═══════════════════════════════════════════════════════ */

class PlaybackEngine {
  constructor({ onStep, onFinish, onReset, onRun, defaultSpeed = 600 }) {
    this.steps = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.isFinished = false;
    this.speed = defaultSpeed;
    this.timer = null;
    this._onStep = onStep;
    this._onFinish = onFinish || (() => {});
    this._onReset = onReset || (() => {});
    this._onRun = onRun || null; // Callback that returns steps[] when Play is pressed
  }

  start(steps) {
    this.clearTimer();
    this.steps = steps;
    this.currentIndex = 0;
    this.isFinished = false;
    this.isPlaying = true;
    this._applyCurrentStep();
    this._scheduleNext();
    this.updateUI();
  }

  /** Called when user presses Play */
  play() {
    // If actively playing, pause
    if (this.isPlaying) { this.pause(); return; }

    // If paused mid-animation (not finished), resume
    if (this.hasStarted && !this.isFinished) { this.resume(); return; }

    // Otherwise (no steps, or finished) — build fresh steps via onRun
    if (this._onRun) {
      const steps = this._onRun();
      if (steps && steps.length > 0) {
        this.start(steps);
      }
    }
  }

  pause() {
    this.clearTimer();
    this.isPlaying = false;
    this.updateUI();
  }

  resume() {
    if (this.isFinished) {
      this.currentIndex = 0;
      this.isFinished = false;
      this._applyCurrentStep();
    }
    if (this.currentIndex < this.steps.length - 1) {
      this.isPlaying = true;
      this._scheduleNext();
    }
    this.updateUI();
  }

  stepForward() {
    // If no steps loaded, build them first
    if (!this.hasStarted && this._onRun) {
      const steps = this._onRun();
      if (steps && steps.length > 0) {
        this.clearTimer();
        this.steps = steps;
        this.currentIndex = 0;
        this.isFinished = false;
        this.isPlaying = false;
        this._applyCurrentStep();
        this.updateUI();
        return;
      }
    }
    this.clearTimer();
    this.isPlaying = false;
    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
      this._applyCurrentStep();
    } else {
      this._finish();
    }
    this.updateUI();
  }

  stepBack() {
    this.clearTimer();
    this.isPlaying = false;
    this.isFinished = false;
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this._applyCurrentStep();
    }
    this.updateUI();
  }

  reset() {
    this.clearTimer();
    this.steps = [];
    this.currentIndex = -1;
    this.isPlaying = false;
    this.isFinished = false;
    this._onReset();
    this.updateUI();
  }

  setSpeed(ms) {
    this.speed = ms;
    if (this.isPlaying) { this.clearTimer(); this._scheduleNext(); }
    this.updateUI();
  }

  clearTimer() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
  }

  _applyCurrentStep() {
    if (this.currentIndex >= 0 && this.currentIndex < this.steps.length) {
      this._onStep(this.steps[this.currentIndex], this.currentIndex);
    }
  }

  _scheduleNext() {
    this.timer = setTimeout(() => {
      if (this.currentIndex >= this.steps.length - 1) { this._finish(); return; }
      this.currentIndex++;
      this._applyCurrentStep();
      this._scheduleNext();
      this.updateUI();
    }, this.speed);
  }

  _finish() {
    this.clearTimer();
    this.isPlaying = false;
    this.isFinished = true;
    this._onFinish();
    this.updateUI();
  }

  get hasStarted() { return this.currentIndex >= 0; }
  get totalSteps() { return this.steps.length; }

  // ─── UI UPDATE ───
  updateUI() {
    const container = document.getElementById('playback-controls');
    if (!container) return;

    const btnPlayPause = container.querySelector('#pb-play-pause');
    const btnStepBack = container.querySelector('#pb-step-back');
    const btnStepFwd = container.querySelector('#pb-step-fwd');
    const btnReset = container.querySelector('#pb-reset');
    const progressBar = container.querySelector('#pb-progress-fill');
    const stepLabel = container.querySelector('#pb-step-label');
    const speedLabel = container.querySelector('#pb-speed-label');

    if (btnPlayPause) {
      if (this.isPlaying) {
        btnPlayPause.innerHTML = '⏸ Pause';
      } else if (this.isFinished) {
        btnPlayPause.innerHTML = '↺ Replay';
      } else {
        btnPlayPause.innerHTML = '▶ Play';
      }
      // Play is always enabled (onRun builds steps if needed)
      btnPlayPause.disabled = false;
    }

    if (btnStepBack) btnStepBack.disabled = !this.hasStarted || this.currentIndex <= 0 || this.isPlaying;
    if (btnStepFwd) btnStepFwd.disabled = this.isPlaying;
    if (btnReset) btnReset.disabled = this.isPlaying;

    if (progressBar && this.totalSteps > 1) {
      progressBar.style.width = ((this.currentIndex / (this.totalSteps - 1)) * 100) + '%';
    } else if (progressBar) {
      progressBar.style.width = '0%';
    }

    if (stepLabel) {
      stepLabel.textContent = this.hasStarted ? `${this.currentIndex + 1} / ${this.totalSteps}` : '— / —';
    }

    if (speedLabel) {
      speedLabel.textContent = this.speed < 300 ? 'Fast' : this.speed < 700 ? 'Med' : 'Slow';
    }
  }
}

// ─── INJECT PLAYBACK CONTROLS HTML ───
function injectPlaybackControls(targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const html = `
    <div id="playback-controls" class="card" style="margin-top:1rem; padding: 0.75rem 1rem;">
      <div style="height:4px; background:var(--border); border-radius:2px; overflow:hidden; margin-bottom:0.75rem;">
        <div id="pb-progress-fill" style="height:100%; width:0%; background:var(--accent); border-radius:2px; transition: width 0.3s ease;"></div>
      </div>
      <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
        <button class="btn" id="pb-step-back" disabled style="padding:0.4rem 0.6rem; font-size:0.75rem;">⏮</button>
        <button class="btn btn-primary" id="pb-play-pause" style="padding:0.4rem 0.8rem; font-size:0.75rem;">▶ Play</button>
        <button class="btn" id="pb-step-fwd" style="padding:0.4rem 0.6rem; font-size:0.75rem;">⏭</button>
        <button class="btn" id="pb-reset" style="padding:0.4rem 0.6rem; font-size:0.75rem;">↺</button>
        <span id="pb-step-label" style="font-family:var(--font-mono); font-size:0.75rem; color:var(--fg-muted); margin-left:0.25rem;">— / —</span>
        <div style="margin-left:auto; display:flex; align-items:center; gap:0.375rem;">
          <span style="font-size:0.7rem; color:var(--fg-muted);">Speed</span>
          <input type="range" id="pb-speed" min="1" max="20" value="10" style="width:70px; cursor:pointer;">
          <span id="pb-speed-label" style="font-size:0.65rem; color:var(--fg-muted); width:2rem;">Med</span>
        </div>
      </div>
    </div>
  `;
  target.insertAdjacentHTML('afterend', html);
}

// ─── WIRE UP CONTROLS ───
function wirePlaybackControls(engine) {
  const container = document.getElementById('playback-controls');
  if (!container) return;

  container.querySelector('#pb-play-pause').addEventListener('click', () => {
    engine.play(); // Uses the new play() method that handles all states
  });
  container.querySelector('#pb-step-back').addEventListener('click', () => engine.stepBack());
  container.querySelector('#pb-step-fwd').addEventListener('click', () => engine.stepForward());
  container.querySelector('#pb-reset').addEventListener('click', () => engine.reset());
  container.querySelector('#pb-speed').addEventListener('input', (e) => {
    const v = parseInt(e.target.value);
    engine.setSpeed(Math.max(100, 1600 - v * 70));
  });

  engine.updateUI();
}
