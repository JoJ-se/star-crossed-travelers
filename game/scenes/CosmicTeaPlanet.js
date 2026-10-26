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
    const ADD = Phaser.BlendModes.ADD;
    const rnd = new Phaser.Math.RandomDataGenerator(['tea-planet']);
    window.sctTextures(this);

    // Golden-hour sky: violet dusk overhead, glowing amber at the horizon
    window.sctSky(this, 'ctp-sky', [
      [0.00, '#100826'], [0.28, '#35123f'], [0.50, '#8a2c33'], [0.64, '#d9692c'],
      [0.74, '#f6b552'], [0.80, '#f9cf73'], [1.00, '#c4622a'],
    ], -10);

    // Stars in the high dusk sky
    const stars = this.add.graphics().setDepth(-9.8);
    for (let i = 0; i < 140; i++) {
      const y = rnd.realInRange(0, H * 0.4);
      stars.fillStyle([0xffffff, 0xfde68a, 0xf9a8d4][i % 3], rnd.realInRange(0.2, 0.85) * (1 - y / (H * 0.4)));
      stars.fillCircle(rnd.between(0, W), y, rnd.realInRange(0.3, 1.6));
    }
    for (let i = 0; i < 7; i++) {
      const sz = rnd.between(14, 28);
      const f = this.add.image(rnd.between(0, W), rnd.between(10, H * 0.25), 'sct-flare').setDepth(-9.7)
        .setBlendMode(ADD).setDisplaySize(sz, sz).setAlpha(0.8);
      this.tweens.add({ targets: f, alpha: 0.2, duration: rnd.between(1200, 2600), yoyo: true, repeat: -1, delay: rnd.between(0, 1500) });
    }

    // A pale crescent moon
    const mx = W * 0.8, my = H * 0.15, mr = Math.min(W, H) * 0.045;
    this.add.image(mx, my, 'sct-glow').setDepth(-9.6).setBlendMode(ADD).setTint(0xfde68a).setDisplaySize(mr * 7, mr * 7).setAlpha(0.35);
    if (!this.textures.exists('ctp-moon')) {
      const S = 128, t = this.textures.createCanvas('ctp-moon', S, S), c = t.getContext();
      c.fillStyle = '#fef3c7'; c.beginPath(); c.arc(S / 2, S / 2, S * 0.45, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = 'destination-out';
      c.beginPath(); c.arc(S / 2 + S * 0.19, S / 2 - S * 0.08, S * 0.41, 0, Math.PI * 2); c.fill();
      t.refresh();
    }
    this.add.image(mx, my, 'ctp-moon').setDepth(-9.5).setDisplaySize(mr * 2.2, mr * 2.2);

    // The setting sun, huge and soft, sinking behind the mountains
    const sunX = W * 0.5, sunY = H * 0.6;
    this.add.image(sunX, sunY, 'sct-glow').setDepth(-9.4).setBlendMode(ADD).setTint(0xf59e0b).setDisplaySize(W * 1.2, H * 0.9).setAlpha(0.55);
    this.add.image(sunX, sunY, 'sct-glow').setDepth(-9.3).setBlendMode(ADD).setTint(0xfde68a).setDisplaySize(H * 0.5, H * 0.5).setAlpha(0.8);
    const sun = this.add.graphics().setDepth(-9.2);
    sun.fillStyle(0xfff7d6, 0.95); sun.fillCircle(sunX, sunY, H * 0.075);

    // Karst mountains in three misty layers — like a classical ink painting
    const peaks = (count, baseY, minH, maxH, minW, maxW, col, depth) => {
      const g = this.add.graphics().setDepth(depth);
      g.fillStyle(col, 1);
      g.fillRect(0, baseY, W, H - baseY);
      // Tall karst spires: wide base, sides curving in, softly rounded tip
      for (let i = 0; i < count; i++) {
        const x = (i + rnd.realInRange(0.1, 0.9)) * (W / count);
        const h = rnd.between(minH, maxH), w = rnd.between(minW, maxW) * 1.6;
        const lean = rnd.realInRange(-0.12, 0.12) * w;
        const left = [], right = [];
        for (let k = 0; k <= 12; k++) {
          const t = k / 12;                                   // 0 = base, 1 = tip
          const hw = (w / 2) * (1 - Math.pow(t, 0.7) * 0.72) * (t > 0.9 ? Math.sqrt((1 - t) / 0.1) : 1);
          const cx = x + lean * t * t, y = baseY - h * t;
          left.push({ x: cx - hw, y }); right.unshift({ x: cx + hw, y });
        }
        g.fillPoints([...left, ...right], true);
      }
      return g;
    };
    const mist = (y, alpha) => this.add.image(W / 2, y, 'sct-puff').setDepth(-8.45 + alpha * 0.01)
      .setTint(0xffe4b5).setBlendMode(ADD).setDisplaySize(W * 1.5, H * 0.14).setAlpha(alpha);

    peaks(10, H * 0.6, H * 0.14, H * 0.32, H * 0.07, H * 0.11, 0xc46a43, -9.0);
    this.add.image(W / 2, H * 0.6, 'sct-puff').setDepth(-8.95).setTint(0xffd8a0).setBlendMode(ADD).setDisplaySize(W * 1.6, H * 0.18).setAlpha(0.5);
    peaks(7, H * 0.66, H * 0.1, H * 0.24, H * 0.08, H * 0.12, 0x7d3326, -8.8);
    this.add.image(W / 2, H * 0.66, 'sct-puff').setDepth(-8.75).setTint(0xffc27a).setBlendMode(ADD).setDisplaySize(W * 1.6, H * 0.16).setAlpha(0.4);
    peaks(6, H * 0.74, H * 0.04, H * 0.1, H * 0.12, H * 0.2, 0x3d1612, -8.6);

    // A tiny pagoda on a distant ridge, windows lit
    this._buildPagoda(W * 0.84, H * 0.665, Math.max(0.6, H / 900));

    // Sky lanterns rising far away, and drifting golden petals
    if (!this.textures.exists('ctp-skylantern')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xfb923c, 1); g.fillRoundedRect(2, 1, 8, 11, 3);
      g.fillStyle(0xfef3c7, 1); g.fillRoundedRect(4, 4, 4, 6, 2);
      g.generateTexture('ctp-skylantern', 12, 14); g.destroy();
    }
    if (!this.textures.exists('ctp-petal')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xffffff, 1); g.fillEllipse(6, 4, 11, 6);
      g.generateTexture('ctp-petal', 12, 8); g.destroy();
    }
    this.add.particles(0, 0, 'ctp-skylantern', {
      x: { min: 0, max: W }, y: H * 0.72,
      lifespan: 16000, speedY: { min: -32, max: -18 }, speedX: { min: -6, max: 6 },
      scale: { min: 0.5, max: 1.1 }, alpha: { start: 0.95, end: 0 },
      frequency: 900,
    }).setDepth(-8.5);
    this.add.particles(0, 0, 'ctp-petal', {
      x: { min: -40, max: W }, y: { min: -20, max: H * 0.5 },
      lifespan: 9000, speedX: { min: 20, max: 50 }, speedY: { min: 18, max: 40 },
      rotate: { min: 0, max: 360 }, scale: { min: 0.6, max: 1.2 },
      alpha: { start: 0.85, end: 0 }, tint: [0xfde68a, 0xfbcfe8, 0xfcd34d, 0xf9a8d4],
      frequency: 260,
    }).setDepth(14);

    // Cinematic vignette
    window.addVignette(this, 28, 0.9);
  }

  _buildPagoda(x, y, s) {
    const g = this.add.graphics().setDepth(-8.7);
    g.fillStyle(0x5a2218, 1);
    let ty = y, w = 46 * s;
    for (let i = 0; i < 4; i++) {
      const th = 16 * s;
      g.fillRect(x - w * 0.32, ty - th, w * 0.64, th);                   // tier wall
      g.fillStyle(0xfde68a, 0.9);
      g.fillRect(x - w * 0.12, ty - th * 0.7, w * 0.08, th * 0.4);       // lit windows
      g.fillRect(x + w * 0.04, ty - th * 0.7, w * 0.08, th * 0.4);
      g.fillStyle(0x3d1612, 1);
      g.fillPoints([{ x: x - w * 0.62, y: ty - th - 2 * s }, { x: x + w * 0.62, y: ty - th - 2 * s },   // upturned eave
        { x: x + w * 0.42, y: ty - th - 8 * s }, { x: x - w * 0.42, y: ty - th - 8 * s }], true);
      g.fillStyle(0x5a2218, 1);
      ty -= th + 8 * s; w *= 0.8;
    }
    g.lineStyle(2 * s, 0x3d1612, 1); g.lineBetween(x, ty, x, ty - 16 * s);
    this.add.image(x, y - 30 * s, 'sct-glow').setDepth(-8.72).setBlendMode(Phaser.BlendModes.ADD)
      .setTint(0xfbbf24).setDisplaySize(120 * s, 140 * s).setAlpha(0.4);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FLOATING PAPER LANTERNS
  // ─────────────────────────────────────────────────────────────────────────
  _buildLanterns() {
    const W = this._W, H = this._H;
    const ADD = Phaser.BlendModes.ADD;

    const drawLantern = (g, rw, rh, col) => {
      g.fillStyle(col, 0.92); g.fillEllipse(0, 0, rw, rh);
      g.fillStyle(0xfef3c7, 0.55); g.fillEllipse(0, -rh * 0.05, rw * 0.55, rh * 0.6);
      g.lineStyle(1, 0x7f1d1d, 0.55);
      g.lineBetween(-rw * 0.25, -rh * 0.46, -rw * 0.25, rh * 0.46);
      g.lineBetween(rw * 0.25, -rh * 0.46, rw * 0.25, rh * 0.46);
      g.lineBetween(0, -rh * 0.5, 0, rh * 0.5);
      g.fillStyle(0xb45309, 1);
      g.fillRect(-rw * 0.32, -rh * 0.56, rw * 0.64, rh * 0.12);
      g.fillRect(-rw * 0.32, rh * 0.44, rw * 0.64, rh * 0.12);
      g.lineStyle(1.5, 0xfbbf24, 0.9);                                  // tassel
      g.lineBetween(0, rh * 0.56, 0, rh * 0.9);
      g.lineBetween(-2, rh * 0.62, -3, rh * 0.95); g.lineBetween(2, rh * 0.62, 3, rh * 0.95);
    };

    // Hanging garland across the top, between the two banners
    const rope = this.add.graphics().setDepth(1);
    const x0 = W * 0.06, x1 = W * 0.94, ry = H * 0.1, sag = H * 0.09;
    const ropeY = (x) => ry + sag * (1 - Math.pow((x - (x0 + x1) / 2) / ((x1 - x0) / 2), 2));
    rope.lineStyle(2, 0x3d1612, 0.9); rope.beginPath(); rope.moveTo(x0, ry);
    for (let x = x0; x <= x1; x += 10) rope.lineTo(x, ropeY(x));
    rope.strokePath();
    const n = 9;
    for (let i = 0; i < n; i++) {
      const x = x0 + (i + 0.5) * (x1 - x0) / n, y = ropeY(x) + 24, col = i % 2 ? 0xfbbf24 : 0xdc2626;
      const c = this.add.container(x, y).setDepth(1);
      const glow = this.add.image(0, 0, 'sct-glow').setBlendMode(ADD).setTint(col).setDisplaySize(90, 90).setAlpha(0.45);
      const str = this.add.graphics(); str.lineStyle(1, 0x3d1612, 0.9); str.lineBetween(0, -24, 0, -12);
      const g = this.add.graphics(); drawLantern(g, 18, 24, col);
      c.add([glow, str, g]);
      this.tweens.add({ targets: c, angle: { from: -4, to: 4 }, duration: 2000 + i * 130, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.tweens.add({ targets: glow, alpha: 0.25, duration: 1400 + i * 90, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Free-floating lanterns drifting in the warm air
    const lanternDefs = [
      [W*0.08, H*0.40, 22, 30, 0xef4444, 2800],
      [W*0.18, H*0.52, 18, 24, 0xfbbf24, 3400],
      [W*0.30, H*0.32, 24, 32, 0xef4444, 2600],
      [W*0.72, H*0.36, 20, 26, 0xfbbf24, 3100],
      [W*0.82, H*0.48, 22, 30, 0xef4444, 2900],
      [W*0.92, H*0.30, 18, 24, 0xfbbf24, 3600],
      [W*0.62, H*0.42, 20, 28, 0xfbbf24, 2700],
    ];
    lanternDefs.forEach(([x, y, rw, rh, col, dur]) => {
      const c = this.add.container(x, y).setDepth(1);
      const glow = this.add.image(0, 0, 'sct-glow').setBlendMode(ADD).setTint(col).setDisplaySize(rw * 5, rh * 4.2).setAlpha(0.5);
      const g = this.add.graphics(); drawLantern(g, rw, rh, col);
      c.add([glow, g]);
      this.tweens.add({ targets: c, y: `-=${Phaser.Math.Between(28, 48)}`, duration: dur, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut', delay: Phaser.Math.Between(0, 1200) });
      this.tweens.add({ targets: c, angle: { from: -5, to: 5 }, duration: dur * 0.8, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
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
    const ADD = Phaser.BlendModes.ADD;
    const top = H * 0.78;
    const g = this.add.graphics().setDepth(2);

    // Polished wooden terrace
    g.fillStyle(0x4a1d0c, 1); g.fillRect(0, top, W, H - top);
    const rows = 6;
    for (let r = 0; r < rows; r++) {
      const y0 = top + (H - top) * Math.pow(r / rows, 1.4), y1 = top + (H - top) * Math.pow((r + 1) / rows, 1.4);
      g.fillStyle(r % 2 ? 0x5a240f : 0x522010, 1); g.fillRect(0, y0, W, y1 - y0);
      g.lineStyle(1, 0x2a0e06, 0.7); g.lineBetween(0, y0, W, y0);
      const step = 90 + r * 30, off = (r % 2) * step / 2;
      for (let x = off; x < W; x += step) g.lineBetween(x, y0, x, y1);
    }
    // Red lacquered edge beam with gold trim
    g.fillStyle(0x991b1b, 1); g.fillRect(0, top - 4, W, 10);
    g.fillStyle(0xfbbf24, 0.85); g.fillRect(0, top - 4, W, 2);
    g.fillStyle(0x450a0a, 1); g.fillRect(0, top + 6, W, 3);

    // Warm sunset reflection on the wood + lantern light pools
    this.add.image(W * 0.5, top + 8, 'sct-glow').setDepth(2.1).setBlendMode(ADD).setTint(0xf59e0b)
      .setDisplaySize(W * 1.1, (H - top) * 0.7).setAlpha(0.35);
    [[W * 0.28, 0xfbbf24], [W * 0.48, 0xfcd34d], [W * 0.65, 0xfbbf24]].forEach(([x, tint]) =>
      this.add.image(x, top + 14, 'sct-glow').setDepth(2.2).setBlendMode(ADD).setTint(tint)
        .setDisplaySize(260, 50).setAlpha(0.45));

    // Low railing posts along the front edge
    const rail = this.add.graphics().setDepth(7);
    const ry = H * 0.95;
    rail.fillStyle(0x7f1d1d, 1); rail.fillRect(0, ry - 6, W, 6);
    rail.fillStyle(0xfbbf24, 0.7); rail.fillRect(0, ry - 6, W, 1.5);
    for (let x = 30; x < W; x += 120) {
      rail.fillStyle(0x7f1d1d, 1); rail.fillRect(x - 4, ry - 22, 8, H - ry + 22);
      rail.fillStyle(0xfbbf24, 0.9); rail.fillCircle(x, ry - 24, 4);
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
      "AH! A traveler falls from the stars and lands at my table! Welcome, young Zhong — I am Big Brother. The galaxy's most generous host, and its most patient chess partner.",
      () => {
        this._showBBDialogue(
          "Come — sit. I have oolong tea, fresh dumplings, and a chess set that hasn't been touched in years.",
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
          "Let me tell you something, Zhong. In the ancient art of Chinese chess, the chariot moves straight across the board — no detours, no second-guessing. That is you today: clear of purpose, steady of path.",
          () => {
            this._showBBDialogue(
              "Go now. The stars are aligned. And Zhong? Sister in law says 'You two should eat less ice-cream'. You know, she has eyes everywhere..",
              () => {
                // Rocky reacts, then proceed to Level 4
                this._queueRocky(
                  "This Big Brother speaks in riddles — but his heart is in the right place.",
                  1900,
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
      "AH! Now THIS is what I like to see — a young man who knows the value of good company! I was just about to pull out my finest oolong tea set i've prepared for you.",
      () => {
        this._showBBDialogue(
          "I've even got those pork dumplings you love! We could talk for hours about everything and nothing — the stars, philosophy, why Beijing's traffic is both a curse and a blessing…",
          () => {
            // RUMBLE — screen shake + asteroid drop
            this.cameras.main.shake(700, 0.022);

            // Flash
            const flash = this.add.graphics().setDepth(50);
            flash.fillStyle(0xff6600, 0.35);
            flash.fillRect(0, 0, this._W, this._H);
            this.tweens.add({ targets: flash, alpha: 0, duration: 500, onComplete: () => flash.destroy() });

            // Asteroid falls immediately (visual only — no callback drives the sequence)
            this._dropAsteroid(null);

            // 1. Rocky appears immediately, holds for exactly 2 seconds
            // 2. Only after Rocky clears → Big Brother reacts
            this._queueRocky("Human! The asteroid — WE HAVE TO GO!!", 2000, () => {
              this._showBBDialogue(
                "…WHAT IN THE NAME OF THE EMPEROR IS THAT?!",
                () => {
                  this._showBBDialogue(
                    "AN ASTEROID! Direct hit to my tea garden! And the shortcut to Elina's planet just collapsed! Next time, choose wisely — or we'll both be buried under tea dust and dumpling wrappers!",
                    () => {
                      this._showMissionFailed();
                    }
                  );
                }
              );
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
    const isMobile = W < 600;
    const bodyFont = isMobile ? '15px' : '16px';

    const panelW = Math.min(700, W - 28);
    const panelX = 14;
    // Dynamic panel height based on text content
    const probe = this.add.text(-9999, -9999, text, {
      fontSize: bodyFont, fontFamily: 'Georgia, serif',
      fontStyle: 'bold', resolution: dpr,
      wordWrap: { width: panelW - 118 }, lineSpacing: 5,
    }).setVisible(false);
    const panelH = Math.max(130, 16 + 20 + 6 + probe.height + 22);
    probe.destroy();
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
      fontSize: bodyFont, fontFamily: 'Georgia, serif',
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
    const isMobile = W < 600;
    const dpr = window.devicePixelRatio || 1;
    const bodyFont = isMobile ? '16px' : '18px';
    const panelW = Math.min(700, W - 28);
    const panelX = 14;
    const probe = this.add.text(-9999, -9999, text, {
      fontSize: bodyFont, fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold', resolution: dpr,
      wordWrap: { width: panelW - 110 }, lineSpacing: 6,
    }).setVisible(false);
    const panelH = Math.max(118, 14 + 20 + 6 + probe.height + 16);
    probe.destroy();
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
    this._rockyBodyText.setFontSize(bodyFont).setWordWrapWidth(panelW - 110).setResolution(dpr);
    this._rockyNameText.setResolution(dpr);
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
