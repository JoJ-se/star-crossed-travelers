// ── Level 3 — Mars (The Martians) ─────────────────────────────────────────────
// Towering ancient alien structure at the heart of a gold-and-red Martian landscape.
// This level goes UP, not across.

const L3_PAL = {
  gold:    0xfcd34d,
  amber:   0xf59e0b,
  rust:    0xb45309,
  red:     0xdc2626,
  crimson: 0x7f1d1d,
  indigo:  0x6366f1,
  violet:  0x7c3aed,
  purple:  0xa855f7,
  blue:    0x93c5fd,
  pink:    0xf9a8d4,
  white:   0xe8edf5,
  gray:    0xbdc6d4,
  dark:    0x030712,
  stone:   0x44403c,
  stoneHi: 0x78716c,
  glyph:   0xfbbf24,
};

const L3_W = 1400;
const L3_H = 4200;

class Level3 extends Phaser.Scene {
  constructor() {
    super({ key: 'Level3' });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────
  create() {
    this._deathCount      = 0;
    this._orbs            = 0;
    this._totalOrbs       = 8;
    this._isAlive         = true;
    this._levelComplete   = false;
    this._invincibleUntil = 0;
    this._checkpointX     = 700;
    this._checkpointY     = L3_H - 80;

    // Rocky flags
    this._welcomeDone        = false;
    this._halfwayDone        = false;
    this._firstDeathDone     = false;
    this._bossReachedDone    = false;
    this._firstOrbDone       = false;
    this._dustStormDone      = false;
    this._beijingJokeDone    = false;

    // Rocky queue
    this._rockyQueue = [];
    this._rockyBusy  = false;

    this.physics.world.setBounds(0, 0, L3_W, L3_H);
    this.cameras.main.setBounds(0, 0, L3_W, L3_H);

    this._buildBackground();
    this._buildPlatforms();
    this._buildOrbs();
    this._buildExitBeacon();
    this._buildBoss();
    this._buildJoao();
    this._buildCheckpoints();
    this._buildHUD();
    this._buildRockyPanel();
    this._setupCamera();
    this._setupControls();
    this._setupCollisions();

    this.cameras.main.fadeIn(700, 20, 5, 0);

    this.time.delayedCall(350, () => {
      const W = this.scale.width, H = this.scale.height, dpr = window.devicePixelRatio || 1;
      const card = this.add.text(W / 2, H * 0.38, 'LEVEL 3\nMARS', {
        fontSize: '28px', fontFamily: 'Georgia, serif', fontStyle: 'bold italic',
        color: '#f59e0b', align: 'center', resolution: dpr,
        stroke: '#1a0a00', strokeThickness: 5, lineSpacing: 6,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setAlpha(0);
      this.tweens.add({ targets: card, alpha: 1, duration: 700, onComplete: () => {
        this.time.delayedCall(1600, () => this.tweens.add({ targets: card, alpha: 0, duration: 700, onComplete: () => card.destroy() }));
      }});
    });

    this.time.delayedCall(1800, () => {
      if (!this._welcomeDone) {
        this._welcomeDone = true;
        this._queueRocky(
          "On Erin we don't really have a word for 'missing someone.' We just... move toward them. Which is exactly what you're doing. Keep going.",
          5500
        );
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BACKGROUND — Martian sky, mesas, structure columns
  // ─────────────────────────────────────────────────────────────────────────
  _buildBackground() {
    const W = this.scale.width;
    const H = this.scale.height;
    const rnd = new Phaser.Math.RandomDataGenerator(['mars']);
    const ADD = Phaser.BlendModes.ADD;
    window.sctTextures(this);

    // ── Tall sky: warm dusty haze at the base, deepening to crimson and then
    //    starry space near the summit — you climb out of the atmosphere.
    const SKY_SF = 0.12;
    const skyH = H + (L3_H - H) * SKY_SF;
    if (!this.textures.exists('l3-sky')) {
      const t = this.textures.createCanvas('l3-sky', 4, 1024), c = t.getContext();
      const g = c.createLinearGradient(0, 0, 0, 1024);
      g.addColorStop(0.00, '#05030d'); g.addColorStop(0.22, '#140716');
      g.addColorStop(0.45, '#3a0e12'); g.addColorStop(0.68, '#6e2410');
      g.addColorStop(0.86, '#a4461a'); g.addColorStop(1.00, '#d9813a');
      c.fillStyle = g; c.fillRect(0, 0, 4, 1024); t.refresh();
    }
    this.add.image(W / 2, 0, 'l3-sky').setOrigin(0.5, 0).setDisplaySize(W + 40, skyH)
      .setScrollFactor(0, SKY_SF).setDepth(-10);

    // Stars — only in the upper (thin-atmosphere) part of the sky
    const stars = this.add.graphics().setScrollFactor(0.05, SKY_SF).setDepth(-9.8);
    for (let i = 0; i < 320; i++) {
      const y = rnd.realInRange(0, skyH * 0.55);
      const fade = 1 - y / (skyH * 0.55);
      stars.fillStyle([0xffffff, 0xfde68a, 0xfecaca, 0xc7d2fe][i % 4], rnd.realInRange(0.2, 0.9) * fade);
      stars.fillCircle(rnd.between(-40, W + 120), y, rnd.realInRange(0.3, 1.7));
    }
    for (let i = 0; i < 10; i++) {
      const y = rnd.realInRange(0, skyH * 0.3), sz = rnd.between(14, 30);
      const f = this.add.image(rnd.between(0, W), y, 'sct-flare').setScrollFactor(0.05, SKY_SF).setDepth(-9.7)
        .setBlendMode(ADD).setDisplaySize(sz, sz).setAlpha(0.8);
      this.tweens.add({ targets: f, alpha: 0.25, duration: rnd.between(1000, 2400), yoyo: true, repeat: -1, delay: rnd.between(0, 1500) });
    }

    // Phobos and Deimos — small cratered moons
    if (!this.textures.exists('l3-moon')) {
      const S = 256, t = this.textures.createCanvas('l3-moon', S, S), c = t.getContext(), r = S * 0.42, cx = S / 2;
      c.save(); c.beginPath(); c.arc(cx, cx, r, 0, Math.PI * 2); c.clip();
      let g = c.createRadialGradient(cx - r * 0.4, cx - r * 0.4, r * 0.1, cx, cx, r * 1.1);
      g.addColorStop(0, '#f5e6d3'); g.addColorStop(0.5, '#b8977a'); g.addColorStop(1, '#3d2a20');
      c.fillStyle = g; c.fillRect(0, 0, S, S);
      [[0.3, -0.2, 0.16], [-0.25, 0.3, 0.12], [-0.1, -0.45, 0.08], [0.45, 0.35, 0.1], [0.05, 0.1, 0.06]].forEach(([dx, dy, rr]) => {
        c.fillStyle = 'rgba(60,40,30,0.35)'; c.beginPath(); c.arc(cx + dx * r, cx + dy * r, rr * r, 0, Math.PI * 2); c.fill();
        c.fillStyle = 'rgba(255,240,220,0.18)'; c.beginPath(); c.arc(cx + dx * r - rr * r * 0.25, cx + dy * r - rr * r * 0.25, rr * r * 0.7, 0, Math.PI * 2); c.fill();
      });
      g = c.createLinearGradient(cx - r, cx - r, cx + r, cx + r);
      g.addColorStop(0.45, 'rgba(10,5,10,0)'); g.addColorStop(1, 'rgba(10,5,10,0.85)');
      c.fillStyle = g; c.fillRect(0, 0, S, S); c.restore(); t.refresh();
    }
    [[0.18, 0.30, 70, 0xfde68a], [0.82, 0.16, 40, 0xfca5a5]].forEach(([fx, fy, sz, glow]) => {
      const x = W * fx, y = skyH * fy;
      this.add.image(x, y, 'sct-glow').setScrollFactor(0.04, SKY_SF).setDepth(-9.6).setBlendMode(ADD)
        .setTint(glow).setDisplaySize(sz * 3.2, sz * 3.2).setAlpha(0.35);
      this.add.image(x, y, 'l3-moon').setScrollFactor(0.04, SKY_SF).setDepth(-9.5).setDisplaySize(sz, sz);
    });

    // Martian sunset — the sun sits low with Mars' famous blue halo
    const sunY = skyH - H * 0.32;
    this.add.image(W * 0.62, sunY, 'sct-glow').setScrollFactor(0.04, SKY_SF).setDepth(-9.4).setBlendMode(ADD)
      .setTint(0x60a5fa).setDisplaySize(H * 1.1, H * 0.8).setAlpha(0.45);
    this.add.image(W * 0.62, sunY, 'sct-glow').setScrollFactor(0.04, SKY_SF).setDepth(-9.3).setBlendMode(ADD)
      .setTint(0xe0f2fe).setDisplaySize(90, 90).setAlpha(0.95);

    // ── Distant landscape — jagged ridges, only seen near the bottom of the climb
    const ridge = (sf, yFrac, amp, step, col, alpha, depth, haze) => {
      const g = this.add.graphics().setScrollFactor(sf * 0.3, sf).setDepth(depth);
      const base = H * yFrac + (L3_H - H) * sf;   // where the ridge sits when the camera is at the bottom
      const pts = [{ x: -100, y: base + 600 }];
      let y = base;
      for (let x = -100; x <= W + 300; x += step) {
        y = Phaser.Math.Clamp(y + rnd.between(-amp, amp), base - amp * 2.5, base + amp);
        if (rnd.frac() < 0.15) { pts.push({ x, y: y - amp * 1.6 }); pts.push({ x: x + step * 0.6, y: y - amp * 1.6 }); }
        else pts.push({ x, y });
      }
      pts.push({ x: W + 300, y: base + 600 });
      g.fillStyle(col, alpha); g.fillPoints(pts, true);
      if (haze) {
        this.add.image(W / 2, base - 10, 'sct-puff').setScrollFactor(0, sf).setDepth(depth + 0.05)
          .setTint(haze).setBlendMode(ADD).setDisplaySize(W * 1.6, amp * 7).setAlpha(0.35);
      }
    };
    ridge(0.30, 0.66, 18, 60, 0x7a3418, 1, -9.0, 0xf59e0b);
    ridge(0.45, 0.74, 24, 50, 0x4d1d0c, 1, -8.8, 0xea580c);
    ridge(0.62, 0.84, 30, 44, 0x2a0e06, 1, -8.6, 0xb45309);

    // ── The ancient structure you are climbing — a colossal carved monolith
    this._buildMonolith(W, H, rnd);

    // Blowing dust haze clouds drifting sideways
    for (let i = 0; i < 9; i++) {
      const p = this.add.image(rnd.between(-200, W + 200), rnd.between(0, L3_H), 'sct-puff').setScrollFactor(0.5, 0.5)
        .setDepth(-6).setTint([0xf59e0b, 0xea580c, 0xfcd34d][i % 3]).setBlendMode(ADD)
        .setDisplaySize(rnd.between(500, 900), rnd.between(120, 220)).setAlpha(0.12);
      this.tweens.add({ targets: p, x: p.x + rnd.between(200, 400), duration: rnd.between(14000, 22000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Rising dust motes and sparks
    this.add.particles(0, 0, 'sct-spark', {
      x: { min: 0, max: W }, y: { min: 0, max: H },
      lifespan: { min: 4000, max: 8000 },
      speedX: { min: 6, max: 26 }, speedY: { min: -22, max: -4 },
      scale: { min: 0.1, max: 0.4 }, alpha: { start: 0.7, end: 0 },
      tint: [0xfcd34d, 0xf59e0b, 0xfb923c, 0xfde68a],
      frequency: 110, blendMode: 'ADD',
    }).setScrollFactor(0).setDepth(-4);

    // The old dust system is replaced by the particles above
    this._dustGraphics  = null;
    this._dustPositions = [];

    // Cinematic vignette
    window.addVignette(this, 29, 1);
  }

  _buildMonolith(W, H, rnd) {
    const SF = 0.82;
    const top = L3_H - 3960;                       // the summit sits just above the exit
    const bottom = L3_H + 200;
    const cx = L3_W / 2;
    const halfBase = 420, halfTop = 220;
    const g = this.add.graphics().setScrollFactor(SF, SF).setDepth(-7);
    // Position the monolith so it lines up with the world at the camera's typical offset
    const off = (y) => y * SF + (1 - SF) * (H / 2);   // keeps it aligned vertically as you climb
    const offX = (x) => x * SF + (1 - SF) * (W / 2);
    const yT = off(top), yB = off(bottom);
    const halfAt = (y) => halfTop + (halfBase - halfTop) * ((y - yT) / (yB - yT));
    const X = offX(cx);

    // Main body with a stepped silhouette
    g.fillStyle(0x452617, 1);
    g.fillPoints([{ x: X - halfTop, y: yT }, { x: X + halfTop, y: yT }, { x: X + halfBase, y: yB }, { x: X - halfBase, y: yB }], true);
    // Sun-lit right face
    g.fillStyle(0x6b3a20, 1);
    g.fillPoints([{ x: X + halfTop * 0.55, y: yT }, { x: X + halfTop, y: yT }, { x: X + halfBase, y: yB }, { x: X + halfBase * 0.55, y: yB }], true);
    // Shadowed left face
    g.fillStyle(0x26130b, 1);
    g.fillPoints([{ x: X - halfTop, y: yT }, { x: X - halfTop * 0.6, y: yT }, { x: X - halfBase * 0.6, y: yB }, { x: X - halfBase, y: yB }], true);

    // Carved block courses
    for (let y = yT + 40; y < yB; y += 46) {
      const hw = halfAt(y);
      g.lineStyle(1.5, 0x0d0604, 0.7); g.lineBetween(X - hw, y, X + hw, y);
      const off2 = (Math.floor((y - yT) / 46) % 2) * 40;
      g.lineStyle(1, 0x0d0604, 0.5);
      for (let x = X - hw + off2; x < X + hw; x += 80) g.lineBetween(x, y, x, y + 46);
    }
    // Sun-lit edge on the right face
    g.lineStyle(3, 0xf59e0b, 0.45);
    g.lineBetween(X + halfTop, yT, X + halfBase, yB);

    // Arched niches with glowing glyphs — alternating sides as you climb
    const ADDm = Phaser.BlendModes.ADD;
    for (let y = yT + 300, i = 0; y < yB - 200; y += 300, i++) {
      const hw = halfAt(y);
      const nx = X + (i % 2 ? 0.45 : -0.45) * hw, nw = 64, nh = 120;
      g.fillStyle(0x120804, 1);
      g.fillRect(nx - nw / 2, y - nh / 2 + nw / 2, nw, nh - nw / 2);
      g.slice(nx, y - nh / 2 + nw / 2, nw / 2, Math.PI, 0, false); g.fillPath();
      g.lineStyle(3, 0x7a4424, 1);
      g.strokeRect(nx - nw / 2, y - nh / 2 + nw / 2, nw, nh - nw / 2);
      g.beginPath(); g.arc(nx, y - nh / 2 + nw / 2, nw / 2, Math.PI, 0, false); g.strokePath();
      this.add.image(nx, y + 6, 'sct-glow').setScrollFactor(SF, SF).setDepth(-6.95).setBlendMode(ADDm)
        .setTint(0xf59e0b).setDisplaySize(150, 190).setAlpha(0.5);
      const sym = this.add.graphics().setScrollFactor(SF, SF).setDepth(-6.9);
      sym.lineStyle(2.5, 0xfde68a, 0.95);
      sym.strokeCircle(nx, y + 4, 12);
      sym.lineBetween(nx, y - 22, nx, y + 34);
      sym.lineBetween(nx - 16, y + 4, nx + 16, y + 4);
      this.tweens.add({ targets: sym, alpha: 0.35, duration: 1600 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Warm sunlight washing over the right face, deep shade on the left
    for (let y = yT; y < yB; y += 600) {
      this.add.image(X + halfAt(y) * 0.7, y + 300, 'sct-glow').setScrollFactor(SF, SF).setDepth(-6.98)
        .setBlendMode(ADDm).setTint(0xea580c).setDisplaySize(500, 900).setAlpha(0.22);
    }

    // Capstone / summit spire
    g.fillStyle(0x3d2114, 1);
    g.fillTriangle(X - halfTop, yT, X + halfTop, yT, X, yT - 260);
    g.fillStyle(0x7a4424, 1);
    g.fillTriangle(X, yT - 260, X + halfTop, yT, X + halfTop * 0.4, yT);

    // Glowing glyph channels — the structure is still alive
    const glyphs = this.add.graphics().setScrollFactor(SF, SF).setDepth(-6.9);
    const chans = [-0.75, -0.35, 0.35, 0.75];
    chans.forEach((f, i) => {
      for (let y = yT + 80; y < yB - 60; y += 46 * 3) {
        const hw = halfAt(y), x = X + f * hw;
        glyphs.lineStyle(2, 0xfbbf24, 0.55);
        glyphs.lineBetween(x, y, x, y + 46 * 2);
        if (((y / 46) | 0) % 3 === i % 3) {
          glyphs.fillStyle(0xfcd34d, 0.75);
          glyphs.fillPoints([{ x, y: y + 30 }, { x: x + 9, y: y + 46 }, { x, y: y + 62 }, { x: x - 9, y: y + 46 }], true);
        }
      }
    });
    // Big central eye glyph near the summit
    glyphs.lineStyle(3, 0xfcd34d, 0.8); glyphs.strokeEllipse(X, yT + 120, 120, 50);
    glyphs.fillStyle(0xfbbf24, 0.85); glyphs.fillCircle(X, yT + 120, 14);
    this.tweens.add({ targets: glyphs, alpha: 0.45, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Soft amber glow around the summit
    this.add.image(X, yT - 60, 'sct-glow').setScrollFactor(SF, SF).setDepth(-7.1)
      .setBlendMode(Phaser.BlendModes.ADD).setTint(0xf59e0b).setDisplaySize(900, 700).setAlpha(0.35);
  }

  _redrawDust() {
    if (!this._dustGraphics || !this._dustGraphics.active) return;
    this._dustGraphics.clear();
    this._dustPositions.forEach(({ x, y, s, a }) => {
      this._dustGraphics.fillStyle(L3_PAL.amber, a);
      this._dustGraphics.fillCircle(x, y, s);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PLATFORMS — zigzag tiers ascending from bottom to top
  // ─────────────────────────────────────────────────────────────────────────
  _buildPlatforms() {
    this._platforms = this.physics.add.staticGroup();

    // Layout: [x, y, w, h]
    // Bottom to top — tiers alternate left / center / right
    // Joao starts at x=700, y~4100 (bottom center)
    const layout = [
      // Tier 0 — starting area, wide floor
      [700,  L3_H - 60,  600, 24],

      // Tier 1
      [340,  L3_H - 260, 160, 20],
      [700,  L3_H - 300, 140, 20],
      [1060, L3_H - 260, 160, 20],

      // Tier 2
      [200,  L3_H - 500, 140, 20],
      [700,  L3_H - 540, 160, 20],
      [1200, L3_H - 500, 140, 20],

      // Tier 3
      [400,  L3_H - 740, 140, 20],
      [900,  L3_H - 780, 160, 20],

      // Tier 4
      [250,  L3_H - 980, 140, 20],
      [700,  L3_H - 1020, 180, 20],
      [1150, L3_H - 980, 140, 20],

      // Tier 5
      [500,  L3_H - 1240, 140, 20],
      [950,  L3_H - 1280, 140, 20],

      // Tier 6
      [200,  L3_H - 1480, 140, 20],
      [700,  L3_H - 1520, 180, 20],
      [1200, L3_H - 1480, 140, 20],

      // Tier 7
      [420,  L3_H - 1740, 140, 20],
      [900,  L3_H - 1780, 140, 20],

      // Tier 8
      [180,  L3_H - 1980, 140, 20],
      [700,  L3_H - 2020, 180, 20],
      [1220, L3_H - 1980, 140, 20],

      // Tier 9
      [450,  L3_H - 2260, 140, 20],
      [950,  L3_H - 2300, 140, 20],

      // Tier 10
      [220,  L3_H - 2500, 140, 20],
      [700,  L3_H - 2540, 180, 20],
      [1180, L3_H - 2500, 140, 20],

        // Tier 11
      [420,  L3_H - 2780, 140, 20],
      [900,  L3_H - 2820, 140, 20],

      // Tier 12
      [200,  L3_H - 3020, 140, 20],
      [700,  L3_H - 3060, 200, 20],
      [1200, L3_H - 3020, 140, 20],

      // Tier 13 — pre-boss checkpoint area
      [700,  L3_H - 3340, 320, 22],

      // Step 1 — easy approach
      [400,  L3_H - 3450, 220, 20],

      // Tier 14 — boss arena
      [1200,  L3_H - 3680, 500, 24],

      // Top — exit platform, much easier to reach
      [700,  L3_H - 3820, 320, 22],
    ];

    layout.forEach(([x, y, w, h]) => {
      this._drawStonePlatform(x, y, w, h);
    });
  }

  _drawStonePlatform(x, y, w, h) {
    const g = this.add.graphics().setDepth(2);
    const L = x - w / 2, T = y - h / 2;

    // Rough-cut ends
    g.fillStyle(0x3a2a20, 1);
    g.fillTriangle(L, T + 3, L - 6, T + h * 0.55, L, T + h);
    g.fillTriangle(L + w, T + 3, L + w + 6, T + h * 0.5, L + w, T + h);

    // Sandstone block
    g.fillStyle(0x5a3f2c, 1); g.fillRect(L, T, w, h);
    g.fillStyle(0x7a563a, 1); g.fillRect(L, T, w, h * 0.45);
    g.fillStyle(0xd6a066, 1); g.fillRect(L, T, w, 2);              // sun-lit top lip
    g.fillStyle(0x2a1a10, 1); g.fillRect(L, T + h - 4, w, 4);       // shadowed base

    // Block joints
    g.lineStyle(1, 0x2a1a10, 0.8);
    for (let jx = L + 46; jx < L + w - 10; jx += 46) g.lineBetween(jx, T + 2, jx, T + h - 4);

    // Weathering speckles
    g.fillStyle(0x2a1a10, 0.35);
    for (let i = 0; i < w / 12; i++) g.fillCircle(L + 6 + ((i * 37 + x) % (w - 12)), T + 4 + ((i * 13) % (h - 8)), 1);

    // Inset glowing glyph strip
    g.lineStyle(1.5, L3_PAL.gold, 0.55); g.lineBetween(L + 10, y + 2, L + w - 10, y + 2);
    if (w >= 160) {
      const marks = Math.floor(w / 80);
      for (let m = 0; m < marks; m++) {
        const mx = L + 40 + m * 80;
        g.fillStyle(L3_PAL.glyph, 0.85);
        g.fillPoints([{ x: mx, y: y - 3 }, { x: mx + 5, y: y + 2 }, { x: mx, y: y + 7 }, { x: mx - 5, y: y + 2 }], true);
      }
    }

    const body = this.physics.add.staticImage(x, y, null).setVisible(false);
    body.setDisplaySize(w, h); body.refreshBody();
    this._platforms.add(body);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ENERGY CONDUITS — 5 wall-mounted, must activate in order 1→5
  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  // ORBS
  // ─────────────────────────────────────────────────────────────────────────
  _buildOrbs() {
    this._orbGroup = this.physics.add.staticGroup();

    const positions = [
      [700,  L3_H - 350],   // tier 1 center
      [200,  L3_H - 600],   // tier 2 left detour
      [900,  L3_H - 850],   // tier 3 right
      [700,  L3_H - 1100],  // tier 4 center
      [450,  L3_H - 1370],  // tier 5 left
      [700,  L3_H - 1600],  // tier 6 center
      [450,  L3_H - 2400],  // tier 9 side detour (risky)
      [700,  L3_H - 3730],  // above boss arena (very risky)
    ];

    positions.forEach(([x, y]) => {
      const g = this.add.graphics().setDepth(4);
      g.fillStyle(L3_PAL.rust,  0.07);  g.fillCircle(x, y, 28); // far glow
      g.fillStyle(L3_PAL.amber, 0.13);  g.fillCircle(x, y, 22); // outer bloom
      g.fillStyle(L3_PAL.gold,  0.20);  g.fillCircle(x, y, 16); // mid bloom
      g.fillStyle(L3_PAL.gold,  0.92);  g.fillCircle(x, y,  9); // core
      g.fillStyle(0xffffff,     0.75);  g.fillCircle(x-3, y-3,  4); // highlight
      g.fillStyle(0xffffff,     0.38);  g.fillCircle(x+2,  y+2, 2); // secondary
      this.tweens.add({
        targets: g, alpha: 0.32, duration: 1100, yoyo: true, repeat: -1,
        ease: 'Sine.easeInOut',
      });

      const body = this.physics.add.staticImage(x, y, null).setVisible(false);
      body.setDisplaySize(26, 26); body.refreshBody();
      body.orbGraphic = g;
      this._orbGroup.add(body);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXIT BEACON — top of the structure
  // ─────────────────────────────────────────────────────────────────────────
  _buildExitBeacon() {
    const x = 700, y = L3_H - 4020;
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(L3_PAL.amber, 0.85); g.fillRect(x-8, y+10, 16, 60);
    g.fillStyle(L3_PAL.gold,  0.45); g.fillRect(x-4, y+10,  8, 60);
    g.fillStyle(L3_PAL.gold,  0.06); g.fillRect(x-24, y-240, 48, 250);
    g.lineStyle(2.5, L3_PAL.gold, 0.95); g.strokeCircle(x, y, 22);
    g.fillStyle(L3_PAL.gold,  0.95); g.fillCircle(x, y, 7);
    g.fillStyle(0xffffff, 0.6);     g.fillCircle(x-3, y-3, 3);
    this.tweens.add({ targets: g, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });

    this._exitBeacon = this.physics.add.staticImage(x, y, null).setVisible(false);
    this._exitBeacon.setDisplaySize(50, 100); this._exitBeacon.refreshBody();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BOSS — Gravitational Anomaly
  // ─────────────────────────────────────────────────────────────────────────
  _buildBoss() {
    // Boss patrols the boss arena at tier 14 (y = L3_H - 3640)
    this._bossY     = L3_H - 3740;
    this._bossX     = 700;
    this._bossMinX  = 380;
    this._bossMaxX  = 1020;
    this._bossDir   = 1;
    this._bossSpeed = 58;
    this._bossAlert = false;

    // Boss graphics — dark sphere with pulsing rings
    this._bossG = this.add.graphics().setDepth(8);
    this._bossShockwaves = [];

    this._drawBoss();

    // Shockwave timer — fires every 2.6s once boss is active
    this._shockwaveTimer = this.time.addEvent({
      delay: 2600,
      loop: true,
      callback: this._fireShockwave,
      callbackScope: this,
    });
  }

    _drawBoss() {
    const g = this._bossG;
    const x = this._bossX, y = this._bossY;
    g.clear();

    // Smaller outer glow
    g.fillStyle(0x4c1d95, 0.14); g.fillCircle(x, y, 46);
    g.fillStyle(0x7c3aed, 0.10); g.fillCircle(x, y, 34);

    // One rotating elliptical ring
    const t = this.time.now * 0.001;
    const angle = t * 1.1;
    const rx = Math.cos(angle) * 18;
    const ry = Math.sin(angle) * 6;
    g.lineStyle(2, 0x7c3aed, 0.65);
    g.strokeEllipse(x + rx * 0.1, y + ry * 0.1, 54, 18);

    // Smaller core
    g.fillStyle(0x0f0015, 1); g.fillCircle(x, y, 22);
    g.fillStyle(0x1e003a, 1); g.fillCircle(x, y, 16);

    // Void edge
    g.lineStyle(2.5, 0xa855f7, 0.85); g.strokeCircle(x, y, 22);
    g.lineStyle(1.2, 0xd946ef, 0.5); g.strokeCircle(x, y, 16);

    // Alert eyes
    if (this._bossAlert) {
      g.fillStyle(0xef4444, 0.9); g.fillCircle(x - 6, y - 3, 3.5);
      g.fillStyle(0xef4444, 0.9); g.fillCircle(x + 6, y - 3, 3.5);
      g.fillStyle(0xffffff, 0.9); g.fillCircle(x - 6, y - 3, 1.5);
      g.fillStyle(0xffffff, 0.9); g.fillCircle(x + 6, y - 3, 1.5);
    }
  }

  _fireShockwave() {
    if (!this._isAlive || this._levelComplete) return;
    if (!this._bossReachedDone) return;  // only fires once boss area reached

    const wave = { x: this._bossX, y: this._bossY, r: 10, alive: true };
    this._bossShockwaves.push(wave);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // JOAO
  // ─────────────────────────────────────────────────────────────────────────
  _buildJoao() {
    if (!this.textures.exists('joao')) {
      const rt = this.add.renderTexture(0, 0, 80, 120).setVisible(false);
      const tempG = this.make.graphics({ x: 0, y: 0, add: false });
      this._drawAstronaut(tempG, 40, 60, 1);
      rt.draw(tempG, 0, 0);
      rt.saveTexture('joao');
      tempG.destroy(); rt.destroy();
    }

    this.joao = this.physics.add.sprite(700, L3_H - 120, 'joao');
    this.joao.setDisplaySize(52, 78);
    this.joao.setCollideWorldBounds(true);
    this.joao.body.setSize(32, 66);
    this.joao.body.setOffset(24, 10);
    this.joao.setDepth(10);
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
  // CHECKPOINTS — 5 spread up the tower
  // ─────────────────────────────────────────────────────────────────────────
  _buildCheckpoints() {
    this._checkpointGroup = this.physics.add.staticGroup();

    [
      [700,  L3_H - 320],
      [700,  L3_H - 1060],
      [700,  L3_H - 1560],
      [700,  L3_H - 2580],
      [700,  L3_H - 3100],
    ].forEach(([x, y]) => {
      const g = this.add.graphics().setDepth(3);
      g.lineStyle(2, L3_PAL.amber, 0.75); g.strokeRect(x-4, y-22, 8, 22);
      g.fillStyle(L3_PAL.gold, 0.6);      g.fillTriangle(x, y-30, x+12, y-20, x-12, y-20);

      const body = this.physics.add.staticImage(x, y-10, null).setVisible(false);
      body.setDisplaySize(20, 36); body.refreshBody();
      body.cpX = x; body.cpY = y - 60;
      this._checkpointGroup.add(body);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HUD
  // ─────────────────────────────────────────────────────────────────────────
  _buildHUD() {
    const W   = this.scale.width;
    const dpr = window.devicePixelRatio || 1;

    this._orbCountText = this.add.text(16, 16, 'Orbs: 0 / 8', {
      fontSize: '15px', fontFamily: 'Arial, sans-serif', color: '#fcd34d',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setScrollFactor(0).setDepth(30);

    this._levelLabel = this.add.text(W / 2, W < 600 ? 40 : 16, 'LEVEL 3 — MARS', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#fbbf24',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(30);

    this._deathText = this.add.text(W - 16, 16, '', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#f9a8d4',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(30);

  }

  // ─────────────────────────────────────────────────────────────────────────
  // ROCKY PANEL — identical system
  // ─────────────────────────────────────────────────────────────────────────
  _buildRockyPanel() {
    const ww  = Math.min(this.scale.width - 28, 700);
    const dpr = window.devicePixelRatio || 1;

    this._rockyPanel    = this.add.graphics().setScrollFactor(0).setDepth(40).setAlpha(0);
    this._rockyNameText = this.add.text(0, 0, '', {
      fontSize: '15px', fontFamily: 'Arial, sans-serif', color: '#fcd34d',
      fontStyle: 'bold', resolution: dpr,
    }).setScrollFactor(0).setDepth(41).setAlpha(0);
    this._rockyBodyText = this.add.text(0, 0, '', {
      fontSize: '18px', fontFamily: 'Arial, sans-serif', color: '#e2e8f0',
      fontStyle: 'bold', resolution: dpr,
      wordWrap: { width: ww - 110 }, lineSpacing: 6,
    }).setScrollFactor(0).setDepth(41).setAlpha(0);
  }

  _queueRocky(text, holdMs) {
    this._rockyQueue.push({ text, holdMs: holdMs || 5500 });
    if (!this._rockyBusy) this._processRockyQueue();
  }

  _processRockyQueue() {
    if (this._rockyBusy || this._rockyQueue.length === 0) return;
    this._rockyBusy = true;
    const { text, holdMs } = this._rockyQueue.shift();
    this._showRocky(text, holdMs, () => {
      this._rockyBusy = false;
      this._processRockyQueue();
    });
  }

  _showRocky(text, holdMs, onComplete) {
    const W      = this.scale.width;
    const H      = this.scale.height;
    const isMobile = W < 600;
    const dpr = window.devicePixelRatio || 1;
    const bodyFont = isMobile ? '15px' : '18px';
    const inset = isMobile ? 72 : 110;
    const panelW = Math.min(700, W - 28);
    const panelX = 14;
    const probe = this.add.text(-9999, -9999, text, {
      fontSize: bodyFont, fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold', resolution: dpr,
      wordWrap: { width: panelW - inset }, lineSpacing: 6,
    }).setScrollFactor(0).setVisible(false);
    const panelH = Math.max(isMobile ? 84 : 118, 14 + 20 + 6 + probe.height + 16);
    probe.destroy();
    const mcBottom = (window.mobileControls ? window.mobileControls.reservedBottom : 0);
    const panelY = H - panelH - 14 - mcBottom;

    this._rockyPanel.clear();
    this._rockyPanel.fillStyle(0x0f172a, 0.95);
    this._rockyPanel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(2.5, L3_PAL.amber, 0.9);
    this._rockyPanel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(1, L3_PAL.gold, 0.35);
    this._rockyPanel.strokeRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 10);

    // Rocky avatar
    const ax = panelX + (isMobile ? 36 : 56), ay = panelY + (isMobile ? 44 : 65);
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

    const tx = panelX + (isMobile ? 66 : 104);
    this._rockyBodyText.setFontSize(bodyFont).setWordWrapWidth(panelW - inset).setResolution(dpr);
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
  // CAMERA — follow Joao with upward offset so player can see above
  // ─────────────────────────────────────────────────────────────────────────
  _setupCamera() {
    this.cameras.main.startFollow(this.joao, true, 0.1, 0.08);
    this.cameras.main.setFollowOffset(0, 100);  // shows more above Joao
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONTROLS
  // ─────────────────────────────────────────────────────────────────────────
  _setupControls() {
    this._keys = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      a:     Phaser.Input.Keyboard.KeyCodes.A,
      d:     Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
    this._coyoteTime = 0;

    // Mobile touch controls
    if (window.mobileControls && window.mobileControls.isTouch) {
      window.mobileControls.show(this);
      this.events.once('shutdown', () => window.mobileControls.hide());
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // COLLISIONS
  // ─────────────────────────────────────────────────────────────────────────
  _setupCollisions() {
    this.physics.add.collider(this.joao, this._platforms);

    // Orbs
    this.physics.add.overlap(this.joao, this._orbGroup, (joao, orbBody) => {
      orbBody.orbGraphic.destroy();
      orbBody.destroy();
      this._orbs++;
      this._orbCountText.setText(`Orbs: ${this._orbs} / ${this._totalOrbs}`);

    });

    // Checkpoints
    this.physics.add.overlap(this.joao, this._checkpointGroup, (joao, cp) => {
      if (cp.cpY < this._checkpointY) {
        this._checkpointX = cp.cpX;
        this._checkpointY = cp.cpY;
      }
    });

    // Exit beacon
    this.physics.add.overlap(this.joao, this._exitBeacon, () => {
      if (!this._levelComplete) {
        this._completeLevel();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEATH & RESPAWN
  // ─────────────────────────────────────────────────────────────────────────
  _killJoao() {
    if (!this._isAlive) return;
    this._isAlive = false;
    this._deathCount++;
    this._deathText.setText(`Deaths: ${this._deathCount}`);
    this.cameras.main.flash(250, 200, 0, 0);

    if (this._deathCount === 1 && !this._firstDeathDone) {
      this._firstDeathDone = true;
    }

    this.time.delayedCall(700, () => {
      this.joao.setPosition(this._checkpointX, this._checkpointY);
      this.joao.setVelocity(0, 0);
      this.joao.setAlpha(1);
      this._isAlive = true;

      this._invincibleUntil = this.time.now + 2500;
      this.tweens.add({
        targets: this.joao, alpha: 0.25, duration: 140, yoyo: true, repeat: 8,
        onComplete: () => { this.joao.setAlpha(1); },
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LEVEL COMPLETE
  // ─────────────────────────────────────────────────────────────────────────
  _completeLevel() {
    this._levelComplete = true;
    this._queueRocky(
      "Mars — behind us. Pedro decoded three words so far..he'll get there. Emm eventually. One planet left! Go get her, Joao.",
      6000
    );

    this.time.delayedCall(6800, () => {
      this.cameras.main.fadeOut(900, 20, 5, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('CosmicTeaPlanet'));
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────
  update(time, delta) {
    if (!this._isAlive || this._levelComplete) return;

    const keys     = this._keys;
    const joao     = this.joao;
    const onGround = joao.body.blocked.down;
    const speed    = 240;

    // ── Movement
    const mc = window.mobileControls;
    if (keys.left.isDown || keys.a.isDown || (mc && mc.left)) {
      joao.setVelocityX(-speed);
      joao.setFlipX(true);
    } else if (keys.right.isDown || keys.d.isDown || (mc && mc.right)) {
      joao.setVelocityX(speed);
      joao.setFlipX(false);
    } else {
      joao.setVelocityX(0);
    }

    // ── Coyote time
    if (onGround) {
      this._coyoteTime = 120;
    } else {
      this._coyoteTime -= delta;
    }

    // ── Jump
    const jumpPressed = Phaser.Input.Keyboard.JustDown(keys.up)
                     || Phaser.Input.Keyboard.JustDown(keys.space)
                     || (mc && mc.consumeJump());
    if (jumpPressed && this._coyoteTime > 0) {
      joao.setVelocityY(-660);
      this._coyoteTime = 0;
    }

    // ── Dust drift upward
    this._dustPositions.forEach(p => {
      p.y -= p.spd * delta * 0.06;
      if (p.y < 0) p.y = L3_H;
    });
    this._redrawDust();

    // ── Boss patrol
    if (this._bossG && this._bossG.active) {
      this._bossX += this._bossDir * this._bossSpeed * (delta / 1000);
      if (this._bossX >= this._bossMaxX) { this._bossX = this._bossMaxX; this._bossDir = -1; }
      if (this._bossX <= this._bossMinX) { this._bossX = this._bossMinX; this._bossDir = 1; }

      // Alert when Joao is near
      const distToJoao = Math.abs(joao.x - this._bossX);
      this._bossAlert = distToJoao < 50 && joao.y < this._bossY + 120;

      this._drawBoss();
    }

    // ── Early climb — dust storm warning (y < 3500, first 700 units of ascent)
    if (!this._dustStormDone && joao.y < L3_H - 600) {
      this._dustStormDone = true;
      this._queueRocky("Dust storm coming - hide like you hide from Elina's 'victim jokes'.", 4000);
    }

    // ── Mid-early climb — Beijing joke from Level 2 transition (y < 2800)
    if (!this._beijingJokeDone && joao.y < L3_H - 1400) {
      this._beijingJokeDone = true;
      this._queueRocky("Mars is harsh. But you know what's harsher? Goodbye at Earth airports. At least out here there's no gate number to walk away from", 4000);
    }

    // ── Rocky mid-way trigger
    if (!this._halfwayDone && joao.y < L3_H - 2100) {
      this._halfwayDone = true;
      this._queueRocky(
        "Oh — Pedro tried to reach you. Three times. I intercepted the signal and sent back an encrypted response. He's been trying to decode it for six hours now.",
        4200
      );
    }

    // ── Boss area reached
    if (!this._bossReachedDone && joao.y < L3_H - 3400) {
      this._bossReachedDone = true;
      this._queueRocky(
        "I asked Elina once why she looks over her glasses. She said 'to see what's really there.' Still thinking about that one..Maybe it's an encryption too",
        6500
      );
    }

    // ── Shockwave update — expand and check collision
    const invincible = time < this._invincibleUntil;
    const joaoBounds = joao.getBounds();

    this._bossShockwaves = this._bossShockwaves.filter(wave => {
      wave.r += 160 * (delta / 1000);

      // Draw the ring
      const wg = this._bossG;  // reuse boss graphics layer is tricky; use separate
      // Actually shockwaves need their own graphics — handled below
      if (wave.r > 200) {
        if (wave.gfx) wave.gfx.destroy();
        return false;
      }

      if (!wave.gfx) {
        wave.gfx = this.add.graphics().setDepth(7);
      }
      wave.gfx.clear();
      wave.gfx.lineStyle(2, 0xa855f7, Math.max(0, 1 - wave.r / 220));
      wave.gfx.strokeCircle(wave.x, wave.y, wave.r);
      wave.gfx.lineStyle(1, 0xd946ef, Math.max(0, 0.5 - wave.r / 220));
      wave.gfx.strokeCircle(wave.x, wave.y, wave.r - 3);

      // Collision — thin annulus check
      if (!invincible && wave.alive) {
        const dist = Phaser.Math.Distance.Between(joao.x, joao.y, wave.x, wave.y);
        if (dist >= wave.r - 8 && dist <= wave.r + 8) {
          wave.alive = false;
          this._killJoao();
        }
      }

      return true;
    });

    // ── Fall off world (shouldn't happen much in vertical level but safety net)
    if (joao.y > L3_H + 80) this._killJoao();
  }
}
