// ── Mobile Touch Controls ─────────────────────────────────────────────────────
// Singleton that renders on-screen D-pad buttons for touch devices.
// Each Phaser scene calls window.mobileControls.show() in _setupControls()
// and reads .left / .right / .consumeJump() in update().

class MobileControls {
  constructor() {
    this.left       = false;
    this.right      = false;
    this._jumpQueued = false;
    this._el        = null;
    this._active    = false;
  }

  get isTouch() {
    return navigator.maxTouchPoints > 0;
  }

  // Call from each scene's _setupControls()
  show() {
    if (!this.isTouch) return;
    if (this._active) return;   // already visible
    this._active = true;
    this._build();
  }

  // Call on scene shutdown (controls disappear between non-gameplay scenes)
  hide() {
    if (!this._active) return;
    this._active = false;
    this.left        = false;
    this.right       = false;
    this._jumpQueued = false;
    if (this._el && this._el.parentNode) {
      this._el.parentNode.removeChild(this._el);
    }
    this._el = null;
  }

  // Edge-triggered jump — returns true once per press, then resets
  consumeJump() {
    if (this._jumpQueued) {
      this._jumpQueued = false;
      return true;
    }
    return false;
  }

  _build() {
    const container = document.createElement('div');
    container.id = 'mobile-controls';
    container.style.cssText = [
      'position:fixed',
      'inset:0',
      'pointer-events:none',
      'z-index:500',
    ].join(';');

    // ── Shared button base style
    const base = [
      'position:absolute',
      'width:74px',
      'height:74px',
      'border-radius:50%',
      'background:rgba(3,7,18,0.60)',
      'border:2.5px solid rgba(99,102,241,0.75)',
      'box-shadow:0 0 14px rgba(99,102,241,0.25),inset 0 0 8px rgba(99,102,241,0.10)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'font-size:30px',
      'color:rgba(252,211,77,0.92)',
      'pointer-events:all',
      'touch-action:none',
      'user-select:none',
      '-webkit-user-select:none',
      'transition:background 0.08s,border-color 0.08s',
    ].join(';');

    const jumpStyle = [
      'position:absolute',
      'width:80px',
      'height:80px',
      'border-radius:50%',
      'background:rgba(3,7,18,0.60)',
      'border:2.5px solid rgba(252,211,77,0.80)',
      'box-shadow:0 0 16px rgba(252,211,77,0.25),inset 0 0 8px rgba(252,211,77,0.10)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'font-size:32px',
      'color:rgba(252,211,77,0.95)',
      'pointer-events:all',
      'touch-action:none',
      'user-select:none',
      '-webkit-user-select:none',
      'transition:background 0.08s,border-color 0.08s',
    ].join(';');

    const pressStyle  = 'background:rgba(99,102,241,0.35);border-color:rgba(252,211,77,0.95);';
    const jumpPressStyle = 'background:rgba(252,211,77,0.30);border-color:rgba(252,211,77,1.0);';

    // ── Helper: create a button
    const makeBtn = (html, extraStyle, onDown, onUp) => {
      const b = document.createElement('div');
      b.style.cssText = extraStyle;
      b.innerHTML = html;

      const down = (e) => {
        e.preventDefault();
        b.style.cssText = extraStyle + (extraStyle === jumpStyle ? jumpPressStyle : pressStyle);
        onDown();
      };
      const up = (e) => {
        e.preventDefault();
        b.style.cssText = extraStyle;
        onUp();
      };

      b.addEventListener('touchstart',  down, { passive: false });
      b.addEventListener('touchend',    up,   { passive: false });
      b.addEventListener('touchcancel', up,   { passive: false });
      return b;
    };

    // ── Left button — bottom-left
    const leftBtn = makeBtn(
      '&#8592;',
      base + ';bottom:28px;left:20px;',
      () => { this.left = true; },
      () => { this.left = false; }
    );

    // ── Right button — next to left
    const rightBtn = makeBtn(
      '&#8594;',
      base + ';bottom:28px;left:106px;',
      () => { this.right = true; },
      () => { this.right = false; }
    );

    // ── Jump button — bottom-right, slightly larger, gold border
    const jumpBtn = makeBtn(
      '&#8593;',
      jumpStyle + ';bottom:26px;right:24px;',
      () => { this._jumpQueued = true; },
      () => {}   // jump is edge-triggered on press, not hold
    );

    container.appendChild(leftBtn);
    container.appendChild(rightBtn);
    container.appendChild(jumpBtn);
    document.body.appendChild(container);
    this._el = container;
  }
}

window.mobileControls = new MobileControls();
