// ── Mobile Touch Controls ─────────────────────────────────────────────────────
// Singleton that creates Phaser-native interactive buttons inside each scene.
// DOM overlays fail on mobile because Phaser's canvas captures all touch events.
// Using Phaser zones + graphics (setScrollFactor(0)) guarantees correct behaviour.
//
// Each level calls: window.mobileControls.show(this)  in _setupControls()
// Each level reads: mc.left / mc.right / mc.consumeJump()  in update()

class MobileControls {
  constructor() {
    this.left        = false;
    this.right       = false;
    this._jumpQueued = false;
    this._objs       = [];
    this._active     = false;
  }

  get isTouch() {
    return navigator.maxTouchPoints > 0 || ('ontouchstart' in window);
  }

  // How many pixels the button row occupies at the bottom of the screen.
  // Panels should add this to their bottom margin so they sit above the buttons.
  get reservedBottom() {
    return this._active ? (22 + 76 + 10) : 0; // PAD + SIZE + gap = 108
  }

  // Pass the active Phaser scene so we can create objects inside it.
  show(scene) {
    if (!this.isTouch) return;
    if (this._active)  return;
    this._active = true;
    this._build(scene);
  }

  hide() {
    if (!this._active) return;
    this._active     = false;
    this.left        = false;
    this.right       = false;
    this._jumpQueued = false;
    this._objs.forEach(o => { try { if (o && o.active) o.destroy(); } catch(e){} });
    this._objs = [];
  }

  // Edge-triggered — returns true once per tap, then resets
  consumeJump() {
    if (this._jumpQueued) { this._jumpQueued = false; return true; }
    return false;
  }

  _build(scene) {
    const W    = scene.scale.width;
    const H    = scene.scale.height;
    const SIZE = 76;          // button diameter
    const PAD  = 22;          // margin from screen edge
    const dpr  = window.devicePixelRatio || 1;

    // Allow up to 3 simultaneous touch points (left + right + jump)
    scene.input.addPointer(2);

    const makeBtn = (cx, cy, label, isJump, onDown, onUp) => {
      const accent = isJump ? 0xfcd34d : 0x6366f1;
      const g = scene.add.graphics().setScrollFactor(0).setDepth(100);

      const draw = (pressed) => {
        g.clear();
        // Background fill
        g.fillStyle(0x030712, pressed ? 0.88 : 0.58);
        g.fillCircle(cx, cy, SIZE / 2);
        // Pressed highlight ring
        if (pressed) {
          g.fillStyle(accent, 0.22);
          g.fillCircle(cx, cy, SIZE / 2 - 2);
        }
        // Border
        g.lineStyle(2.5, accent, pressed ? 1.0 : 0.72);
        g.strokeCircle(cx, cy, SIZE / 2);
        // Subtle inner glow line
        g.lineStyle(1, accent, pressed ? 0.45 : 0.18);
        g.strokeCircle(cx, cy, SIZE / 2 - 6);
      };
      draw(false);

      // Arrow label
      const txt = scene.add.text(cx, cy, label, {
        fontSize: '26px',
        fontFamily: 'Arial, sans-serif',
        color: isJump ? '#fcd34d' : '#e2e8f0',
        resolution: dpr,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

      // Interactive zone — Phaser handles touch→pointer mapping
      const zone = scene.add.zone(cx, cy, SIZE, SIZE)
        .setScrollFactor(0)
        .setDepth(102)
        .setInteractive();

      zone.on('pointerdown',  () => { draw(true);  onDown(); });
      zone.on('pointerup',    () => { draw(false); onUp();   });
      zone.on('pointerout',   () => { draw(false); onUp();   });

      this._objs.push(g, txt, zone);
    };

    // ── Left  (bottom-left)
    makeBtn(
      PAD + SIZE / 2,
      H - PAD - SIZE / 2,
      '←', false,
      () => { this.left = true;  },
      () => { this.left = false; }
    );

    // ── Right  (next to left)
    makeBtn(
      PAD + SIZE + 14 + SIZE / 2,
      H - PAD - SIZE / 2,
      '→', false,
      () => { this.right = true;  },
      () => { this.right = false; }
    );

    // ── Jump  (bottom-right, gold)
    makeBtn(
      W - PAD - SIZE / 2,
      H - PAD - SIZE / 2,
      '↑', true,
      () => { this._jumpQueued = true; },
      () => {}    // jump is one-shot on press; release does nothing
    );
  }
}

window.mobileControls = new MobileControls();
