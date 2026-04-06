// ── The Detour — Cosmic Tea Planet ───────────────────────────────────────────
// A warm golden planet of paper lanterns, tea, and a very philosophical man.
// No physics. No jumping. Pure narrative and choice.

const CTP_PAL = {
  gold:   0xfcd34d,
  amber:  0xf59e0b,
  rust:   0xb45309,
  red:    0xdc2626,
  indigo: 0x6366f1,
  white:  0xe8edf5,
  dark:   0x030712,
  wood:   0x44180c,
  woodHi: 0x7c2d12,
  robe:   0x1c1408,
  robeHi: 0x3d2a0f,
};

class CosmicTeaPlanet extends Phaser.Scene {
  constructor() {
    super({ key: 'CosmicTeaPlanet' });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────
  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._W = W;
    this._H = H;

    // Rocky queue
    this._rockyQueue = [];
    this._rockyBusy  = false;

    // Choice button objects — tracked for cleanup
    this._choiceBtnObjs = [];

    // Mission-failed overlay objects — tracked for cleanup
    this._missionObjs = [];

    this._buildBackground();
    this._buildLanterns();
    this._buildTeaTable();
    this._buildCalligraphy();
    this._buildGround();
    this._buildJoao();
    this._buildBigBrother();   // starts off-screen left; entrance tween in _startEntrance
    this._buildRockyPanel();
    this._buildHUD();

    this.cameras.main.fadeIn(800, 20, 5, 0);

    // Big Brother walks in after fade
    this.time.delayedCall(1000, () => this._startEntrance());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BACKGROUND
  // ─────────────────────────────────────────────────────────────────────────
  _buildBackground() {
    const W = this._W, H = this._H;
    const g = this.add.graphics().setDepth(-10);

    // Warm amber-gold gradient sky via stacked rects
    const bands = [
      [0x1a0800, 1.00],
      [0x2d1200, 0.95],
      [0x4a1e00, 0.85],
      [0x6b3000, 0.70],
      [0x8b4500, 0.55],
      [0xaa5a00, 0.35],
    ];
    bands.forEach(([col, a], i) => {
      g.fillStyle(col, a);
      g.fillRect(0, i * (H / bands.length), W, H / bands.length + 2);
    });

    // Distant rolling hills silhouette
    g.fillStyle(0x1a0900, 1);
    g.fillEllipse(W * 0.15, H * 0.62, W * 0.55, H * 0.18);
    g.fillEllipse(W * 0.55, H * 0.60, W * 0.70, H * 0.20);
    g.fillEllipse(W * 0.88, H * 0.63, W * 0.50, H * 0.16);

    // Soft ambient glow near horizon
    g.fillStyle(0xfbbf24, 0.06); g.fillRect(0, H * 0.50, W, H * 0.12);
    g.fillStyle(0xf59e0b, 0.04); g.fillRect(0, H * 0.45, W, H * 0.08);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FLOATING PAPER LANTERNS
  // ─────────────────────────────────────────────────────────────────────────
  _buildLanterns() {
    const W = this._W, H = this._H;

    const lanternDefs = [
      [W*0.08, H*0.38, 22, 30, 0xef4444, 2800],
      [W*0.18, H*0.52, 18, 24, 0xfbbf24, 3400],
      [W*0.28, H*0.30, 24, 32, 0xef4444, 2600],
      [W*0.72, H*0.35, 20, 26, 0xfbbf24, 3100],
      [W*0.82, H*0.48, 22, 30, 0xef4444, 2900],
      [W*0.91, H*0.28, 18, 24, 0xfbbf24, 3600],
      [W*0.50, H*0.22, 26, 34, 0xef4444, 3200],
      [W*0.62, H*0.42, 20, 28, 0xfbbf24, 2700],
    ];

    lanternDefs.forEach(([x, y, rw, rh, col, dur]) => {
      const g = this.add.graphics().setDepth(1);

      // Lantern body
      g.fillStyle(col, 0.88);
      g.fillEllipse(x, y, rw, rh);

      // Inner glow
      g.fillStyle(0xfef3c7, 0.55);
      g.fillEllipse(x, y - rh * 0.1, rw * 0.55, rh * 0.45);

      // Top and bottom caps
      g.fillStyle(0x92400e, 1);
      g.fillRect(x - rw * 0.35, y - rh * 0.52, rw * 0.70, rh * 0.10);
      g.fillRect(x - rw * 0.35, y + rh * 0.42, rw * 0.70, rh * 0.10);

      // String
      g.lineStyle(1, 0x78350f, 0.7);
      g.lineBetween(x, y - rh * 0.52, x, y - rh * 0.52 - 16);

      // Glow halo
      g.fillStyle(col, 0.10);
      g.fillEllipse(x, y, rw * 2.2, rh * 1.8);

      // Float upward, loop
      this.tweens.add({
        targets: g,
        y: `-=${Phaser.Math.Between(28, 48)}`,
        duration: dur,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1200),
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEA TABLE
  // ─────────────────────────────────────────────────────────────────────────
  _buildTeaTable() {
    const W = this._W, H = this._H;
    const tx = W * 0.48, ty = H * 0.70;
    const g = this.add.graphics().setDepth(3);

    // Table legs
    g.fillStyle(CTP_PAL.wood, 1);
    g.fillRect(tx - 55, ty + 14, 12, 36);
    g.fillRect(tx + 43, ty + 14, 12, 36);
    g.fillRect(tx - 20, ty + 14,  9, 36);
    g.fillRect(tx + 11, ty + 14,  9, 36);

    // Table top
    g.fillStyle(CTP_PAL.wood, 1);
    g.fillRoundedRect(tx - 70, ty - 10, 140, 28, 6);
    g.fillStyle(CTP_PAL.woodHi, 0.55);
    g.fillRoundedRect(tx - 66, ty - 8, 132, 8, 4);
    g.lineStyle(1.5, 0x7c2d12, 0.6);
    g.strokeRoundedRect(tx - 70, ty - 10, 140, 28, 6);

    // Teapot body
    const px = tx - 22, py = ty - 22;
    g.fillStyle(0x92400e, 1); g.fillEllipse(px, py, 36, 30);
    g.fillStyle(0xa16207, 0.5); g.fillEllipse(px - 4, py - 4, 16, 10);
    // Spout
    g.lineStyle(4, 0x78350f, 1);
    g.lineBetween(px + 14, py - 2, px + 28, py - 10);
    g.lineStyle(2, 0x92400e, 1);
    g.lineBetween(px + 14, py - 2, px + 28, py - 10);
    // Handle
    g.lineStyle(4, 0x78350f, 1);
    g.strokeEllipse(px - 20, py, 10, 18);
    // Lid
    g.fillStyle(0x92400e, 1); g.fillEllipse(px, py - 14, 20, 8);
    g.fillStyle(0xfbbf24, 1); g.fillCircle(px, py - 18, 3);

    // Two cups
    [tx + 20, tx + 46].forEach(cx => {
      const cy = ty - 14;
      g.fillStyle(0xe8edf5, 0.92); g.fillEllipse(cx, cy, 18, 14);
      g.fillStyle(0xfef3c7, 0.7);  g.fillEllipse(cx, cy - 3, 12, 6);
      g.lineStyle(1, 0x92400e, 0.5); g.strokeEllipse(cx, cy, 18, 14);
      // Saucer
      g.fillStyle(0xd6d3d1, 0.6); g.fillEllipse(cx, cy + 8, 22, 6);
    });

    // Steam wisps from teapot
    this._buildSteam(px + 14, py - 14, g);
  }

  _buildSteam(sx, sy, parentG) {
    // Animated steam as separate tweened graphics
    for (let i = 0; i < 3; i++) {
      const sg = this.add.graphics().setDepth(4).setAlpha(0);
      const ox = sx + (i - 1) * 5;
      sg.lineStyle(1.5, 0xe8edf5, 0.45);
      sg.beginPath();
      sg.moveTo(ox, sy);
      sg.lineTo(ox - 4, sy - 10);
      sg.lineTo(ox + 3, sy - 20);
      sg.lineTo(ox - 2, sy - 30);
      sg.strokePath();

      this.tweens.add({
        targets: sg,
        y: -22,
        alpha: { from: 0, to: 0.55 },
        duration: 1600,
        repeat: -1,
        delay: i * 500,
        ease: 'Sine.easeInOut',
        yoyo: false,
        onRepeat: () => { sg.setAlpha(0); sg.y = 0; },
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CALLIGRAPHY SCROLLS
  // ─────────────────────────────────────────────────────────────────────────
  _buildCalligraphy() {
    const W = this._W, H = this._H;
    const g = this.add.graphics().setDepth(2);

    [[W * 0.06, H * 0.38], [W * 0.94, H * 0.38]].forEach(([sx, sy]) => {
      const sw = 28, sh = H * 0.38;

      // Banner
      g.fillStyle(0x991b1b, 0.85);
      g.fillRect(sx - sw/2, sy, sw, sh);
      g.lineStyle(1.5, 0x7f1d1d, 0.7);
      g.strokeRect(sx - sw/2, sy, sw, sh);

      // Top rod
      g.fillStyle(CTP_PAL.wood, 1);
      g.fillRect(sx - sw/2 - 4, sy - 6, sw + 8, 8);

      // Gold glyph marks — abstract but readable as characters
      g.fillStyle(0xfbbf24, 0.70);
      const marks = [
        [sx, sy + sh*0.18],
        [sx, sy + sh*0.38],
        [sx, sy + sh*0.58],
        [sx, sy + sh*0.76],
      ];
      marks.forEach(([mx, my]) => {
        // Horizontal strokes
        g.fillRect(mx - 7, my - 1, 14, 2.5);
        g.fillRect(mx - 5, my - 6, 10, 2);
        g.fillRect(mx - 4, my + 4, 8, 2);
        // Vertical stroke
        g.fillRect(mx - 1, my - 8, 2.5, 16);
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GROUND PLATFORM
  // ─────────────────────────────────────────────────────────────────────────
  _buildGround() {
    const W = this._W, H = this._H;
    const g = this.add.graphics().setDepth(2);

    g.fillStyle(0x3d1800, 1);
    g.fillRect(0, H * 0.78, W, H * 0.22);

    g.fillStyle(0x5c2800, 0.6);
    g.fillRect(0, H * 0.78, W, 6);

    // Subtle tile lines
    g.lineStyle(1, 0x4a1e00, 0.35);
    for (let tx = 0; tx < W; tx += 80) {
      g.lineBetween(tx, H * 0.78, tx, H);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // JOAO — standing right-of-center, facing left
  // ─────────────────────────────────────────────────────────────────────────
  _buildJoao() {
    const W = this._W, H = this._H;

    if (!this.textures.exists('joao')) {
      const rt = this.add.renderTexture(0, 0, 80, 120).setVisible(false);
      const tempG = this.make.graphics({ x: 0, y: 0, add: false });
      this._drawAstronaut(tempG, 40, 60, 1);
      rt.draw(tempG, 0, 0);
      rt.saveTexture('joao');
      tempG.destroy(); rt.destroy();
    }

    this._joaoSprite = this.add.image(W * 0.65, H * 0.68, 'joao')
      .setDisplaySize(52, 78)
      .setFlipX(true)
      .setDepth(6);
  }

  _drawAstronaut(g, cx, cy, s) {
    const W = 0xe8edf5, B = 0xbdc6d4, V = 0xf59e0b, P = 0x6366f1;
    g.fillStyle(B,1); g.fillRoundedRect(cx-6*s,cy-14*s,12*s,24*s,3*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx-18*s,cy-18*s,36*s,34*s,6*s);
    g.lineStyle(2*s,B,1); g.strokeRoundedRect(cx-18*s,cy-18*s,36*s,34*s,6*s);
    g.fillStyle(P,1); g.fillRoundedRect(cx-8*s,cy-12*s,16*s,12*s,2*s);
    g.fillStyle(0xfcd34d,1); g.fillCircle(cx-3*s,cy-7*s,2*s);
    g.fillStyle(0xf87171,1); g.fillCircle(cx+3*s,cy-7*s,2*s);
    g.fillStyle(0x6ee7b7,1); g.fillCircle(cx,    cy-7*s,2*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx-28*s,cy-16*s,12*s,28*s,4*s);
    g.lineStyle(2*s,B,1); g.strokeRoundedRect(cx-28*s,cy-16*s,12*s,28*s,4*s);
    g.fillStyle(P,1); g.fillEllipse(cx-22*s,cy+14*s,14*s,10*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx+16*s,cy-16*s,12*s,28*s,4*s);
    g.lineStyle(2*s,B,1); g.strokeRoundedRect(cx+16*s,cy-16*s,12*s,28*s,4*s);
    g.fillStyle(P,1); g.fillEllipse(cx+22*s,cy+14*s,14*s,10*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx-16*s,cy+16*s,12*s,24*s,3*s);
    g.lineStyle(2*s,B,1); g.strokeRoundedRect(cx-16*s,cy+16*s,12*s,24*s,3*s);
    g.fillStyle(P,1); g.fillRoundedRect(cx-19*s,cy+38*s,18*s,8*s,3*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx+4*s, cy+16*s,12*s,24*s,3*s);
    g.lineStyle(2*s,B,1); g.strokeRoundedRect(cx+4*s,cy+16*s,12*s,24*s,3*s);
    g.fillStyle(P,1); g.fillRoundedRect(cx+1*s, cy+38*s,18*s,8*s,3*s);
    g.fillStyle(W,1); g.fillCircle(cx,cy-28*s,20*s);
    g.lineStyle(2*s,B,1); g.strokeCircle(cx,cy-28*s,20*s);
    g.fillStyle(V,1); g.fillEllipse(cx,cy-28*s,26*s,20*s);
    g.fillStyle(0xffffff,0.5); g.fillEllipse(cx-5*s,cy-32*s,8*s,6*s);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BIG BROTHER — drawn in Phaser shapes, starts off-screen left
  // ─────────────────────────────────────────────────────────────────────────
  _buildBigBrother() {
    const W = this._W, H = this._H;

    this._bbTargetX = W * 0.28;
    this._bbY       = H * 0.64;

    // Container starts off left edge
    this._bbContainer = this.add.container(-120, this._bbY).setDepth(5);

    const g = this.make.graphics({ x: 0, y: 0, add: false });
    this._drawBigBrother(g);
    this._bbContainer.add(g);
    this._bbG = g;
  }

  _drawBigBrother(g) {
    g.clear();
    const cx = 0, cy = 0;   // drawn around container origin

    // ── Wide flowing robes (Hanfu)
    // Main robe body — wide trapezoid
    g.fillStyle(CTP_PAL.robe, 1);
    g.fillTriangle(cx - 44, cy + 80, cx + 44, cy + 80, cx - 18, cy - 20);
    g.fillTriangle(cx - 18, cy - 20, cx + 44, cy + 80, cx + 18, cy - 20);
    g.fillRect(cx - 18, cy - 20, 36, 14);

    // Robe highlight / inner fold
    g.fillStyle(CTP_PAL.robeHi, 0.5);
    g.fillTriangle(cx - 8, cy - 10, cx + 8, cy - 10, cx, cy + 50);
    g.lineStyle(1.5, 0x5c3a1e, 0.4);
    g.lineBetween(cx - 44, cy + 80, cx - 18, cy - 20);
    g.lineBetween(cx + 44, cy + 80, cx + 18, cy - 20);

    // Gold trim on robe collar and edges
    g.lineStyle(2, CTP_PAL.amber, 0.65);
    g.lineBetween(cx - 10, cy - 18, cx - 10, cy + 10);
    g.lineBetween(cx + 10, cy - 18, cx + 10, cy + 10);
    g.lineStyle(1.5, CTP_PAL.gold, 0.40);
    g.lineBetween(cx - 44, cy + 80, cx - 22, cy);
    g.lineBetween(cx + 44, cy + 80, cx + 22, cy);

    // Wide sleeves — horizontal arms outstretched
    // Left sleeve
    g.fillStyle(CTP_PAL.robe, 1);
    g.fillRoundedRect(cx - 72, cy - 12, 56, 18, 5);
    g.lineStyle(1.5, 0x5c3a1e, 0.4);
    g.strokeRoundedRect(cx - 72, cy - 12, 56, 18, 5);
    g.fillStyle(0x78350f, 0.3);
    g.fillEllipse(cx - 72, cy - 3, 16, 12);

    // Right sleeve
    g.fillStyle(CTP_PAL.robe, 1);
    g.fillRoundedRect(cx + 16, cy - 12, 56, 18, 5);
    g.lineStyle(1.5, 0x5c3a1e, 0.4);
    g.strokeRoundedRect(cx + 16, cy - 12, 56, 18, 5);
    g.fillStyle(0x78350f, 0.3);
    g.fillEllipse(cx + 72, cy - 3, 16, 12);

    // ── Neck & head
    g.fillStyle(0xd97706, 1);
    g.fillRect(cx - 6, cy - 32, 12, 14);

    g.fillStyle(0xd97706, 1);
    g.fillCircle(cx, cy - 44, 22);
    g.lineStyle(1.5, 0x92400e, 0.5);
    g.strokeCircle(cx, cy - 44, 22);

    // ── Face — warm expression
    // Eyes — kind, slightly squinting
    g.fillStyle(0x1c0a00, 1);
    g.fillEllipse(cx - 8, cy - 47, 7, 4);
    g.fillEllipse(cx + 8, cy - 47, 7, 4);
    // Eye gleam
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(cx - 7, cy - 48, 1.5);
    g.fillCircle(cx + 9, cy - 48, 1.5);

    // Smile — curved line
    g.lineStyle(2, 0x92400e, 0.9);
    g.beginPath();
    g.moveTo(cx - 7, cy - 36);
    g.lineTo(cx - 3, cy - 33);
    g.lineTo(cx + 3, cy - 33);
    g.lineTo(cx + 7, cy - 36);
    g.strokePath();

    // Moustache
    g.lineStyle(2, 0xe8edf5, 0.85);
    g.beginPath();
    g.moveTo(cx - 2, cy - 39);
    g.lineTo(cx - 10, cy - 37);
    g.lineTo(cx - 14, cy - 33);
    g.strokePath();
    g.beginPath();
    g.moveTo(cx + 2, cy - 39);
    g.lineTo(cx + 10, cy - 37);
    g.lineTo(cx + 14, cy - 33);
    g.strokePath();

    // ── Long white beard
    g.fillStyle(0xe8edf5, 0.9);
    g.fillEllipse(cx, cy - 26, 16, 8);
    g.fillEllipse(cx, cy - 12,  14, 16);
    g.fillEllipse(cx - 4, cy + 4,  10, 14);
    g.fillEllipse(cx + 3, cy + 2,  8, 12);
    g.fillEllipse(cx, cy + 18,  8, 14);
    // Beard tip
    g.fillTriangle(cx - 4, cy + 24, cx + 4, cy + 24, cx, cy + 38);
    g.lineStyle(1, 0xd4d4d4, 0.3);
    g.lineBetween(cx - 2, cy - 20, cx - 4, cy + 38);
    g.lineBetween(cx + 2, cy - 20, cx + 3, cy + 38);

    // ── Traditional round hat (slightly conical)
    g.fillStyle(0x1c0a00, 1);
    // Hat brim
    g.fillEllipse(cx, cy - 62, 54, 12);
    // Hat dome
    g.fillEllipse(cx, cy - 76, 40, 32);
    // Gold band
    g.lineStyle(2.5, CTP_PAL.amber, 0.8);
    g.strokeEllipse(cx, cy - 62, 54, 12);
    // Hat top knot
    g.fillStyle(CTP_PAL.amber, 0.9);
    g.fillCircle(cx, cy - 92, 5);
    g.fillStyle(CTP_PAL.gold, 0.7);
    g.fillCircle(cx, cy - 92, 3);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BIG BROTHER ENTRANCE
  // ─────────────────────────────────────────────────────────────────────────
  _startEntrance() {
    this.tweens.add({
      targets: this._bbContainer,
      x: this._bbTargetX,
      duration: 1300,
      ease: 'Sine.easeOut',
      onComplete: () => {
        // Brief bow — slight y dip
        this.tweens.add({
          targets: this._bbContainer,
          y: this._bbY + 8,
          duration: 300,
          yoyo: true,
          ease: 'Sine.easeInOut',
          onComplete: () => this._phase2Greeting(),
        });
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE 2 — GREETING DIALOGUE
  // ─────────────────────────────────────────────────────────────────────────
  _phase2Greeting() {
    this._showBBDialogue(
      "AH! A traveler falls from the stars and lands at my table! Welcome, young Joao — I am Big Brother. The galaxy's most generous host, and its most patient chess partner.",
      () => {
        this._showBBDialogue(
          "Come — sit. I have oolong tea, fresh dumplings, and a chess set that hasn't been touched in three weeks. I was going to keep you for three years minimum — but perhaps we start with tea.",
          () => this._showChoiceButtons()
        );
      }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHOICE BUTTONS
  // ─────────────────────────────────────────────────────────────────────────
  _showChoiceButtons() {
    const W = this._W, H = this._H;
    const dpr = window.devicePixelRatio || 1;

    const btnW = Math.min(460, W * 0.42);
    const btnH = 62;
    const gap  = 28;
    const totalW = btnW * 2 + gap;
    const startX = W/2 - totalW/2;
    const btnY   = H * 0.52;

    const makeBtn = (x, y, w, h, borderCol, bgCol, label, textCol, onClick) => {
      const g = this.add.graphics().setDepth(20);

      const draw = (hover) => {
        g.clear();
        g.fillStyle(bgCol, hover ? 0.55 : 0.30);
        g.fillRoundedRect(x, y, w, h, 10);
        g.lineStyle(2.5, borderCol, hover ? 1.0 : 0.75);
        g.strokeRoundedRect(x, y, w, h, 10);
        if (hover) {
          g.lineStyle(1, borderCol, 0.35);
          g.strokeRoundedRect(x + 3, y + 3, w - 6, h - 6, 8);
        }
      };

      draw(false);
      g.setInteractive(
        new Phaser.Geom.Rectangle(x, y, w, h),
        Phaser.Geom.Rectangle.Contains
      );
      g.on('pointerover', () => draw(true));
      g.on('pointerout',  () => draw(false));
      g.on('pointerdown', onClick);

      const txt = this.add.text(x + w/2, y + h/2, label, {
        fontSize: '15px', fontFamily: 'Arial, sans-serif',
        color: textCol, fontStyle: 'bold',
        resolution: dpr,
        wordWrap: { width: w - 24 },
        align: 'center',
      }).setOrigin(0.5).setDepth(21);

      this._choiceBtnObjs.push(g, txt);
      return { g, txt };
    };

    makeBtn(
      startX, btnY, btnW, btnH,
      CTP_PAL.gold, 0xfbbf24,
      '"Go to Elina — my leader is waiting!"',
      '#fcd34d',
      () => this._choiceA()
    );

    makeBtn(
      startX + btnW + gap, btnY, btnW, btnH,
      CTP_PAL.red, 0xdc2626,
      '"Stay with Big Brother — we haven\'t caught up in ages!"',
      '#fca5a5',
      () => this._choiceB()
    );

    // Hint text
    const hint = this.add.text(W/2, btnY + btnH + 18, 'Click to choose', {
      fontSize: '12px', fontFamily: 'Arial, sans-serif',
      color: '#a16207', fontStyle: 'italic', resolution: dpr,
    }).setOrigin(0.5).setDepth(20);
    this._choiceBtnObjs.push(hint);
  }

  _destroyChoiceButtons() {
    this._choiceBtnObjs.forEach(o => { if (o && o.active) o.destroy(); });
    this._choiceBtnObjs = [];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHOICE A — "Go to Elina"
  // ─────────────────────────────────────────────────────────────────────────
  _choiceA() {
    this._destroyChoiceButtons();

    this._showBBDialogue(
      "HA! I knew you'd choose wisely — even a blind man could see where your heart truly lies.",
      () => {
        this._showBBDialogue(
          "In the ancient art of Chinese chess, the chariot moves straight across the board — no detours, no second-guessing. That is you today: clear of purpose, steady of path. My door is always open, my dumplings always hot.",
          () => {
            this._showBBDialogue(
              "Go now. The stars are aligned. And Joao? If you're late because you got distracted by space rocks — I'll hear about it. I have eyes everywhere.",
              () => {
                // Rocky reacts, then proceed to Level 4
                this._queueRocky(
                  "This Big Brother speaks in circles — but his heart is in the right place.",
                  4500,
                  () => {
                    this.time.delayedCall(600, () => {
                      this.cameras.main.fadeOut(900, 20, 5, 0);
                      this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('Level4');
                      });
                    });
                  }
                );
              }
            );
          }
        );
      }
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHOICE B — "Stay with Big Brother"
  // ─────────────────────────────────────────────────────────────────────────
  _choiceB() {
    this._destroyChoiceButtons();

    this._showBBDialogue(
      "AH! Now THIS is what I like to see — a young man who knows the value of good company! I was just about to pull out my finest oolong tea and the chess set we've been playing for three years straight.",
      () => {
        this._showBBDialogue(
          "I've even got those pork dumplings you love — the ones with ginger and scallions that make you say 'Big Brother, you're spoiling me!' We could talk for hours about everything and nothing — the stars, philosophy, why Beijing's traffic is both a curse and a blessing…",
          () => {
            // RUMBLE — screen shake + asteroid drop
            this.cameras.main.shake(700, 0.022);

            // Flash
            const flash = this.add.graphics().setDepth(50);
            flash.fillStyle(0xff6600, 0.35);
            flash.fillRect(0, 0, this._W, this._H);
            this.tweens.add({ targets: flash, alpha: 0, duration: 500, onComplete: () => flash.destroy() });

            // Asteroid falls
            this._dropAsteroid(() => {
              // Rocky panics FIRST — he sees it before Big Brother reacts
              this._queueRocky("Human! The asteroid — WE HAVE TO GO!!", 2500, () => {
                // THEN Big Brother looks up in mock horror
                this._showBBDialogue(
                  "…WHAT IN THE NAME OF THE EMPEROR IS THAT?!",
                  () => {
                    this._showBBDialogue(
                      "An asteroid! Direct hit to my tea garden! And the wormhole to Elina's planet just collapsed! Next time, choose faster — or we'll both be buried under asteroid dust and dumpling wrappers!",
                      () => {
                        this._showMissionFailed();
                      }
                    );
                  }
                );
              });
            });
          }
        );
      }
    );
  }

  _dropAsteroid(onLanded) {
    const W = this._W, H = this._H;
    const g = this.add.graphics().setDepth(15);
    const ax = W * 0.55, r = 36;

    const drawRock = (x, y) => {
      g.clear();
      g.fillStyle(0x44403c, 1);
      g.fillCircle(x, y, r);
      g.fillStyle(0x292524, 1);
      g.fillTriangle(x - r*0.6, y - r*0.4, x + r*0.3, y - r*0.5, x - r*0.2, y + r*0.3);
      g.fillStyle(0x57534e, 0.6);
      g.fillCircle(x + r*0.3, y - r*0.2, r*0.28);
      g.lineStyle(2, 0x1c1917, 0.7);
      g.strokeCircle(x, y, r);
      // Impact cracks
      g.lineStyle(1.5, 0xfbbf24, 0.5);
      g.lineBetween(x, y + r, x - 20, y + r + 28);
      g.lineBetween(x, y + r, x + 18, y + r + 22);
      g.lineBetween(x, y + r, x + 4,  y + r + 34);
    };

    drawRock(ax, -60);

    const target = H * 0.62;
    this.tweens.add({
      targets: { y: -60 },
      y: target,
      duration: 900,
      ease: 'Quad.easeIn',
      onUpdate: (tween, obj) => drawRock(ax, obj.y),
      onComplete: () => {
        // Impact flash
        this.cameras.main.shake(300, 0.018);
        const impact = this.add.graphics().setDepth(16);
        impact.fillStyle(0xff6600, 0.5);
        impact.fillCircle(ax, target, 60);
        this.tweens.add({
          targets: impact, alpha: 0, duration: 400,
          onComplete: () => impact.destroy(),
        });
        if (onLanded) onLanded();
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MISSION FAILED OVERLAY
  // ─────────────────────────────────────────────────────────────────────────
  _showMissionFailed() {
    const W = this._W, H = this._H;
    const dpr = window.devicePixelRatio || 1;

    // Dimmer
    const dimmer = this.add.graphics().setDepth(30).setAlpha(0);
    dimmer.fillStyle(0x000000, 0.72);
    dimmer.fillRect(0, 0, W, H);
    this._missionObjs.push(dimmer);

    // Panel
    const panelW = Math.min(520, W - 60);
    const panelH = 200;
    const panelX = W/2 - panelW/2;
    const panelY = H/2 - panelH/2;

    const panel = this.add.graphics().setDepth(31).setAlpha(0);
    panel.fillStyle(0x0f0a00, 0.97);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 14);
    panel.lineStyle(3, CTP_PAL.gold, 0.9);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 14);
    panel.lineStyle(1, CTP_PAL.amber, 0.35);
    panel.strokeRoundedRect(panelX + 4, panelY + 4, panelW - 8, panelH - 8, 11);
    this._missionObjs.push(panel);

    const title = this.add.text(W/2, panelY + 30, 'Big Brother says:', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif',
      color: '#f59e0b', fontStyle: 'bold', resolution: dpr,
    }).setOrigin(0.5).setDepth(32).setAlpha(0);
    this._missionObjs.push(title);

    const body = this.add.text(W/2, panelY + 72, 'Fate has spoken.\nThe dumplings will have to wait.\nTry again?', {
      fontSize: '17px', fontFamily: 'Arial, sans-serif',
      color: '#e2e8f0', fontStyle: 'bold',
      align: 'center', lineSpacing: 6, resolution: dpr,
    }).setOrigin(0.5).setDepth(32).setAlpha(0);
    this._missionObjs.push(body);

    // Try Again button
    const btnW2 = 180, btnH2 = 46;
    const btnX  = W/2 - btnW2/2;
    const btnY2 = panelY + panelH - 62;

    const tryBtn = this.add.graphics().setDepth(32).setAlpha(0);
    const drawTryBtn = (hover) => {
      tryBtn.clear();
      tryBtn.fillStyle(0xfbbf24, hover ? 0.35 : 0.18);
      tryBtn.fillRoundedRect(btnX, btnY2, btnW2, btnH2, 8);
      tryBtn.lineStyle(2, CTP_PAL.gold, hover ? 1.0 : 0.7);
      tryBtn.strokeRoundedRect(btnX, btnY2, btnW2, btnH2, 8);
    };
    drawTryBtn(false);
    tryBtn.setInteractive(
      new Phaser.Geom.Rectangle(btnX, btnY2, btnW2, btnH2),
      Phaser.Geom.Rectangle.Contains
    );
    tryBtn.on('pointerover', () => drawTryBtn(true));
    tryBtn.on('pointerout',  () => drawTryBtn(false));
    tryBtn.on('pointerdown', () => this._tryAgain());
    this._missionObjs.push(tryBtn);

    const tryTxt = this.add.text(W/2, btnY2 + btnH2/2, 'Try again', {
      fontSize: '15px', fontFamily: 'Arial, sans-serif',
      color: '#fcd34d', fontStyle: 'bold', resolution: dpr,
    }).setOrigin(0.5).setDepth(33).setAlpha(0);
    this._missionObjs.push(tryTxt);

    // Fade in overlay
    this.tweens.add({
      targets: [dimmer, panel, title, body, tryBtn, tryTxt],
      alpha: 1,
      duration: 350,
    });
  }

  _tryAgain() {
    // Destroy mission failed overlay
    this._missionObjs.forEach(o => { if (o && o.active) o.destroy(); });
    this._missionObjs = [];

    // Brief pause then show the choice again
    this.time.delayedCall(300, () => this._showChoiceButtons());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BIG BROTHER DIALOGUE PANEL
  // ─────────────────────────────────────────────────────────────────────────
  _showBBDialogue(text, onDone) {
    const W   = this._W, H = this._H;
    const dpr = window.devicePixelRatio || 1;

    const panelW = Math.min(700, W - 28);
    const panelX = 14;
    const panelH = 140;
    const mcBottom = (window.mobileControls ? window.mobileControls.reservedBottom : 0);
    const panelY = H - panelH - 14 - mcBottom;

    const bg = this.add.graphics().setDepth(40).setAlpha(0);
    bg.fillStyle(0x0f0a00, 0.96);
    bg.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    bg.lineStyle(2.5, CTP_PAL.amber, 0.9);
    bg.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    bg.lineStyle(1, CTP_PAL.gold, 0.35);
    bg.strokeRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 10);

    // Big Brother avatar — small portrait in panel
    const ax = panelX + 58, ay = panelY + 70;
    // Robe hint
    bg.fillStyle(CTP_PAL.robe, 0.9);
    bg.fillEllipse(ax, ay + 20, 56, 36);
    // Head
    bg.fillStyle(0xd97706, 1); bg.fillCircle(ax, ay - 10, 18);
    // Hat
    bg.fillStyle(0x1c0a00, 1); bg.fillEllipse(ax, ay - 26, 40, 10);
    bg.fillEllipse(ax, ay - 34, 28, 18);
    bg.lineStyle(2, CTP_PAL.amber, 0.7); bg.strokeEllipse(ax, ay - 26, 40, 10);
    // Beard
    bg.fillStyle(0xe8edf5, 0.85);
    bg.fillEllipse(ax, ay + 2, 14, 20);
    bg.fillTriangle(ax - 5, ay + 10, ax + 5, ay + 10, ax, ay + 22);
    // Eyes
    bg.fillStyle(0x1c0a00, 1);
    bg.fillEllipse(ax - 6, ay - 12, 6, 3);
    bg.fillEllipse(ax + 6, ay - 12, 6, 3);

    const tx = panelX + 108;
    const nameText = this.add.text(tx, panelY + 16, 'Big Brother:', {
      fontSize: '15px', fontFamily: 'Arial, sans-serif',
      color: '#f59e0b', fontStyle: 'bold', resolution: dpr,
    }).setDepth(41).setAlpha(0);

    const bodyText = this.add.text(tx, panelY + 38, '', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif',
      color: '#e2e8f0', fontStyle: 'bold', resolution: dpr,
      wordWrap: { width: panelW - 118 }, lineSpacing: 5,
    }).setDepth(41).setAlpha(0);

    const hint = this.add.text(panelX + panelW - 12, panelY + panelH - 14, 'click / space', {
      fontSize: '11px', fontFamily: 'Arial, sans-serif',
      color: '#78350f', fontStyle: 'italic', resolution: dpr,
    }).setOrigin(1, 1).setDepth(41).setAlpha(0);

    const allObjs = [bg, nameText, bodyText, hint];

    const cleanupAndDone = () => {
      this.tweens.add({
        targets: allObjs, alpha: 0, duration: 280,
        onComplete: () => {
          allObjs.forEach(o => o.destroy());
          if (onDone) onDone();
        },
      });
    };

    // Fade in
    this.tweens.add({
      targets: allObjs, alpha: 1, duration: 260,
      onComplete: () => {
        // Type body text word by word
        this._typeBBText(bodyText, text, 78, () => {
          // Finished typing — wait for dismiss
          const dismiss = () => {
            this.input.off('pointerdown', dismiss);
            this.input.keyboard.off('keydown-SPACE', dismiss);
            cleanupAndDone();
          };
          this.input.on('pointerdown', dismiss);
          this.input.keyboard.on('keydown-SPACE', dismiss);
        });
      },
    });
  }

  _typeBBText(textObj, text, msPerWord, onDone) {
    const words = text.split(' ');
    textObj.setText('');
    let i = 0;
    const tick = () => {
      if (i < words.length) {
        textObj.setText(textObj.text + (i > 0 ? ' ' : '') + words[i]);
        i++;
        this.time.delayedCall(msPerWord, tick);
      } else if (onDone) {
        onDone();
      }
    };
    tick();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ROCKY PANEL — identical system, amber border for Mars-warm feel
  // ─────────────────────────────────────────────────────────────────────────
  _buildRockyPanel() {
    const ww  = Math.min(this._W - 28, 700);
    const dpr = window.devicePixelRatio || 1;

    this._rockyPanel    = this.add.graphics().setDepth(45).setAlpha(0);
    this._rockyNameText = this.add.text(0, 0, '', {
      fontSize: '15px', fontFamily: 'Arial, sans-serif', color: '#fcd34d',
      fontStyle: 'bold', resolution: dpr,
    }).setDepth(46).setAlpha(0);
    this._rockyBodyText = this.add.text(0, 0, '', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#e2e8f0',
      fontStyle: 'bold', resolution: dpr,
      wordWrap: { width: ww - 110 }, lineSpacing: 6,
    }).setDepth(46).setAlpha(0);
  }

  _queueRocky(text, holdMs, onDone) {
    this._rockyQueue.push({ text, holdMs: holdMs || 5000, onDone });
    if (!this._rockyBusy) this._processRockyQueue();
  }

  _processRockyQueue() {
    if (this._rockyBusy || this._rockyQueue.length === 0) return;
    this._rockyBusy = true;
    const { text, holdMs, onDone } = this._rockyQueue.shift();
    this._showRocky(text, holdMs, () => {
      this._rockyBusy = false;
      if (onDone) onDone();
      this._processRockyQueue();
    });
  }

  _showRocky(text, holdMs, onComplete) {
    const W      = this._W, H = this._H;
    const panelW = Math.min(700, W - 28);
    const panelX = 14;
    const panelH = 130;
    const mcBottom = (window.mobileControls ? window.mobileControls.reservedBottom : 0);
    const panelY = H - panelH - 14 - mcBottom;

    this._rockyPanel.clear();
    this._rockyPanel.fillStyle(0x0f0a00, 0.95);
    this._rockyPanel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(2.5, CTP_PAL.amber, 0.9);
    this._rockyPanel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(1, CTP_PAL.gold, 0.35);
    this._rockyPanel.strokeRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 10);

    // Rocky avatar
    const ax = panelX + 56, ay = panelY + 65;
    this._rockyPanel.fillStyle(0x78716c, 1);
    [[ax-18,ay],[ax+18,ay],[ax,ay-14],[ax,ay+14],[ax-14,ay-10],[ax+14,ay+10]].forEach(([lx,ly]) => {
      this._rockyPanel.fillEllipse(lx, ly, 13, 7);
    });
    this._rockyPanel.fillStyle(0x9ca3af, 1); this._rockyPanel.fillEllipse(ax, ay, 34, 26);
    this._rockyPanel.fillStyle(0x78716c, 1);
    this._rockyPanel.fillCircle(ax-7, ay-3, 3); this._rockyPanel.fillCircle(ax+6, ay+3, 2);
    this._rockyPanel.fillStyle(0x1e1b4b, 1);
    this._rockyPanel.fillCircle(ax-6, ay-2, 3.5); this._rockyPanel.fillCircle(ax+6, ay-2, 3.5);
    this._rockyPanel.fillStyle(0xffffff, 0.85);
    this._rockyPanel.fillCircle(ax-5, ay-3, 1.5); this._rockyPanel.fillCircle(ax+7, ay-3, 1.5);

    const tx = panelX + 104;
    this._rockyNameText.setText('Rocky:').setPosition(tx, panelY + 14).setAlpha(0);
    this._rockyBodyText.setText('').setPosition(tx, panelY + 36).setAlpha(0);
    this._rockyPanel.setAlpha(0);

    this.tweens.add({
      targets: [this._rockyPanel, this._rockyNameText, this._rockyBodyText],
      alpha: 1, duration: 280,
      onComplete: () => {
        this._typeRockyText(text, 90, () => {
          this.time.delayedCall(holdMs, () => {
            this.tweens.add({
              targets: [this._rockyPanel, this._rockyNameText, this._rockyBodyText],
              alpha: 0, duration: 380,
              onComplete: () => { if (onComplete) onComplete(); },
            });
          });
        });
      },
    });
  }

  _typeRockyText(text, msPerWord, onDone) {
    const words = text.split(' ');
    this._rockyBodyText.setText('');
    let i = 0;
    const tick = () => {
      if (i < words.length) {
        this._rockyBodyText.setText(
          this._rockyBodyText.text + (i > 0 ? ' ' : '') + words[i]
        );
        i++;
        this.time.delayedCall(msPerWord, tick);
      } else if (onDone) {
        onDone();
      }
    };
    tick();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HUD
  // ─────────────────────────────────────────────────────────────────────────
  _buildHUD() {
    const W   = this._W;
    const dpr = window.devicePixelRatio || 1;
    this.add.text(W / 2, 16, 'THE DETOUR — COSMIC TEA PLANET', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#fbbf24',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setOrigin(0.5, 0).setDepth(30);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE — nothing to update (no physics, no player movement)
  // ─────────────────────────────────────────────────────────────────────────
  update() {}
}
