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

    // Conduit mechanic
    this._nextConduit     = 1;   // next expected activation index (1-based)
    this._conduitsLit     = 0;
    this._allConduitsDone = false;
    this._finalGateOpen   = false;

    // Rocky flags
    this._welcomeDone        = false;
    this._firstConduitDone   = false;
    this._wrongOrderDone     = false;
    this._allConduitsDone2   = false;
    this._halfwayDone        = false;
    this._firstDeathDone     = false;
    this._bossReachedDone    = false;
    this._firstOrbDone       = false;

    // Rocky queue
    this._rockyQueue = [];
    this._rockyBusy  = false;

    this.physics.world.setBounds(0, 0, L3_W, L3_H);
    this.cameras.main.setBounds(0, 0, L3_W, L3_H);

    this._buildBackground();
    this._buildPlatforms();
    this._buildConduits();
    this._buildGates();
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

    this.time.delayedCall(1800, () => {
      if (!this._welcomeDone) {
        this._welcomeDone = true;
        this._queueRocky(
          "Someone built this a very long time ago. I'm not saying it was my people. But it was my people.",
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

    // Sky gradient base — deep amber-red
    const sky = this.add.graphics().setScrollFactor(0).setDepth(-10);
    // Simulate gradient with stacked rects
    const skyBands = [
      [0x1a0a00, 1.0],
      [0x2d1200, 0.9],
      [0x3d1a00, 0.7],
      [0x5c2800, 0.5],
      [0x7c3a00, 0.3],
    ];
    skyBands.forEach(([col, a], i) => {
      sky.fillStyle(col, a);
      sky.fillRect(0, i * (H / skyBands.length), W, H / skyBands.length + 2);
    });

    // Distant mesa silhouettes — layer 1 (scrollFactor 0.04)
    const mesas = this.add.graphics().setScrollFactor(0.04).setDepth(-9);
    mesas.fillStyle(0x1c0a00, 1);
    // Wide mesa shapes drawn as polygons across the full world height
    [
      [0,    L3_H - 600,  200, 220],
      [180,  L3_H - 480,  280, 200],
      [500,  L3_H - 700,  220, 250],
      [750,  L3_H - 550,  300, 230],
      [1050, L3_H - 620,  240, 210],
      [1250, L3_H - 490,  200, 200],
    ].forEach(([x, y, w, h]) => {
      // Flat-top mesa trapezoid
      mesas.fillTriangle(x, y + h, x + w * 0.15, y, x + w, y + h);
      mesas.fillRect(x + w * 0.15, y, w * 0.7, h);
      mesas.fillTriangle(x + w * 0.85, y, x + w, y + h, x + w * 0.15, y);
    });

    // Mid-distance rock formations — layer 2 (scrollFactor 0.10)
    const rocks = this.add.graphics().setScrollFactor(0.10).setDepth(-8);
    rocks.fillStyle(0x3d1800, 0.8);
    [
      [50,   L3_H - 350, 80,  120],
      [300,  L3_H - 280, 60,   90],
      [600,  L3_H - 400, 100, 150],
      [900,  L3_H - 320, 75,  110],
      [1150, L3_H - 370, 90,  130],
    ].forEach(([x, y, w, h]) => {
      rocks.fillRect(x, y, w, h);
      rocks.fillTriangle(x + w * 0.5, y - h * 0.3, x, y, x + w, y);
    });

    // Two Martian moons — layer 1 (scrollFactor 0.04)
    const moons = this.add.graphics().setScrollFactor(0.04).setDepth(-8);
    moons.fillStyle(0xfde68a, 0.22); moons.fillCircle(200, 300, 55);
    moons.fillStyle(0xfbbf24, 0.12); moons.fillCircle(200, 300, 45);
    moons.fillStyle(0xdc6d00, 0.18); moons.fillCircle(1100, 180, 38);
    moons.fillStyle(0xf59e0b, 0.10); moons.fillCircle(1100, 180, 30);

    // Ancient structure background columns — layer 3 (scrollFactor 0.18)
    // These run the full height of the world to give the sense of being inside a giant structure
    const cols = this.add.graphics().setScrollFactor(0.18).setDepth(-7);
    // Two flanking background columns
    [120, 1280].forEach(cx => {
      cols.fillStyle(0x292524, 0.9);
      cols.fillRect(cx - 30, 100, 60, L3_H - 200);
      cols.fillStyle(0x44403c, 0.5);
      cols.fillRect(cx - 18, 100, 12, L3_H - 200);
      // Carved glyphs along the column — geometric diamond shapes
      for (let gy = 300; gy < L3_H - 300; gy += 280) {
        cols.fillStyle(L3_PAL.glyph, 0.25);
        cols.fillTriangle(cx, gy - 18, cx - 12, gy, cx, gy + 18);
        cols.fillTriangle(cx, gy - 18, cx + 12, gy, cx, gy + 18);
      }
    });

    // Vertical energy lines along the structure walls (scrollFactor 0.18)
    const energyLines = this.add.graphics().setScrollFactor(0.18).setDepth(-6);
    [200, 1200].forEach(ex => {
      energyLines.lineStyle(2, L3_PAL.amber, 0.2);
      energyLines.lineBetween(ex, 80, ex, L3_H - 100);
      energyLines.lineStyle(1, L3_PAL.gold, 0.12);
      energyLines.lineBetween(ex + 10, 80, ex + 10, L3_H - 100);
    });

    // Ambient dust motes drifting upward (static dots — animated in update)
    // We'll use a simple graphics layer for initial placement
    this._dustGraphics = this.add.graphics().setScrollFactor(0.06).setDepth(-5);
    this._dustPositions = [];
    for (let i = 0; i < 60; i++) {
      const dx = Phaser.Math.Between(80, L3_W - 80);
      const dy = Phaser.Math.Between(0, L3_H);
      const ds = Math.random() * 1.8 + 0.4;
      const da = Math.random() * 0.35 + 0.08;
      const spd = Math.random() * 0.3 + 0.1;
      this._dustPositions.push({ x: dx, y: dy, s: ds, a: da, spd });
    }
    this._redrawDust();
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

    // Stone base
    g.fillStyle(L3_PAL.stone, 1);
    g.fillRect(x - w/2, y - h/2, w, h);

    // Highlight top edge
    g.fillStyle(L3_PAL.stoneHi, 1);
    g.fillRect(x - w/2 + 3, y - h/2 + 2, w - 6, 4);

    // Shadow bottom edge
    g.fillStyle(0x1c1917, 1);
    g.fillRect(x - w/2, y + h/2 - 5, w, 5);

    // Gold energy trim
    g.lineStyle(1.5, L3_PAL.amber, 0.55);
    g.strokeRect(x - w/2, y - h/2, w, h);

    // Small glyph marks on wider platforms
    if (w >= 160) {
      g.fillStyle(L3_PAL.glyph, 0.30);
      const marks = Math.floor(w / 80);
      for (let m = 0; m < marks; m++) {
        const mx = x - w/2 + 40 + m * 80;
        g.fillTriangle(mx, y - h/2 + 3, mx - 5, y - h/2 + 10, mx + 5, y - h/2 + 10);
      }
    }

    const body = this.physics.add.staticImage(x, y, null).setVisible(false);
    body.setDisplaySize(w, h); body.refreshBody();
    this._platforms.add(body);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ENERGY CONDUITS — 5 wall-mounted, must activate in order 1→5
  // ─────────────────────────────────────────────────────────────────────────
  _buildConduits() {
    this._conduitData = [];  // { body, g, index, activated }

    // [x, y, conduitIndex (1-based)]
    // Placed near platforms, numbered so some require going slightly off direct path
    const defs = [
      [200,  L3_H - 360,  1],   // near tier 1 left
      [1200, L3_H - 740,  2],   // near tier 3 right wall
      [280,  L3_H - 1540, 3],   // near tier 6 left
      [1120, L3_H - 2060, 4],   // near tier 8 right
      [420,  L3_H - 2840, 5],   // near tier 11 left
    ];

    defs.forEach(([cx, cy, idx]) => {
      const g = this.add.graphics().setDepth(4);
      this._drawConduit(g, cx, cy, idx, false);

      const body = this.physics.add.staticImage(cx, cy, null).setVisible(false);
      body.setDisplaySize(52, 80); body.refreshBody();
      body._conduitIndex = idx;
      body._activated    = false;
      body._conduitG     = g;
      body._cx           = cx;
      body._cy           = cy;

      this._conduitData.push({ body, g, index: idx, activated: false });
    });
  }

  _drawConduit(g, cx, cy, idx, activated, wrongFlash) {
    g.clear();

    const col = wrongFlash ? 0xef4444
              : activated  ? L3_PAL.gold
              : 0x4338ca;   // dim indigo when inactive
    const innerCol = wrongFlash ? 0xfca5a5
                   : activated  ? L3_PAL.amber
                   : 0x818cf8;
    const glowA = activated ? 0.3 : 0.1;

    // Wall mount bracket
    g.fillStyle(L3_PAL.stone, 1);
    g.fillRect(cx - 20, cy - 36, 40, 72);
    g.lineStyle(1.5, L3_PAL.stoneHi, 0.7);
    g.strokeRect(cx - 20, cy - 36, 40, 72);

    // Glow halo
    g.fillStyle(col, glowA);
    g.fillCircle(cx, cy, 28);

    // Gem ring
    g.lineStyle(2.5, col, 0.9);
    g.strokeCircle(cx, cy, 18);

    // Gem fill
    g.fillStyle(innerCol, 0.85);
    g.fillCircle(cx, cy, 11);
    g.fillStyle(0xffffff, activated ? 0.7 : 0.3);
    g.fillCircle(cx - 3, cy - 3, activated ? 5 : 3);

    // Number glyph above gem
    const numCol = activated ? '#fcd34d' : wrongFlash ? '#fca5a5' : '#818cf8';
    // We'll draw the number as a separate text object if not already done
    // (graphics can't render text — handled via _conduitTexts)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GATES — stone blocks that slide open when conduits are all lit
  // ─────────────────────────────────────────────────────────────────────────
  _buildGates() {
    this._gates = [];

    // Two gate blocks flanking the tier-14 entrance (just below boss arena)
    const gateY = L3_H - 3500;
    const defs = [
      [490, gateY, 120, 26],
      [910, gateY, 120, 26],
    ];

    defs.forEach(([x, y, w, h]) => {
      const g = this.add.graphics().setDepth(3);
      g.fillStyle(0x1c1917, 1);  g.fillRect(x - w/2, y - h/2, w, h);
      g.fillStyle(0x292524, 1);  g.fillRect(x - w/2 + 4, y - h/2 + 4, w - 8, h - 8);
      g.lineStyle(2, 0xef4444, 0.7); g.strokeRect(x - w/2, y - h/2, w, h);
      // Red X marks — gate is locked
      g.lineStyle(2, 0xef4444, 0.5);
      g.lineBetween(x - w/2 + 8, y - h/2 + 4, x + w/2 - 8, y + h/2 - 4);
      g.lineBetween(x - w/2 + 8, y + h/2 - 4, x + w/2 - 8, y - h/2 + 4);

      const body = this.physics.add.staticImage(x, y, null).setVisible(false);
      body.setDisplaySize(w, h); body.refreshBody();
      this._platforms.add(body);

      this._gates.push({ g, body, x, y, w, h });
    });
  }

  _openGates() {
    if (this._finalGateOpen) return;
    this._finalGateOpen = true;

    this._gates.forEach(({ g, body, x, y, w, h }) => {
      // Flash gold then slide upward off screen
      this.tweens.add({
        targets: g,
        alpha: 0,
        duration: 600,
        ease: 'Sine.easeIn',
        onStart: () => {
          g.clear();
          g.fillStyle(L3_PAL.gold, 0.9); g.fillRect(x - w/2, y - h/2, w, h);
        },
        onComplete: () => {
          g.clear();
          body.destroy();
        },
      });
    });

    // Pulse ripple from gate area
    const gateY = L3_H - 3500;
    const pulse = this.add.graphics().setDepth(5);
    this.tweens.add({
      targets: { r: 10 },
      r: 200,
      duration: 600,
      ease: 'Sine.easeOut',
      onUpdate: (tween, target) => {
        pulse.clear();
        pulse.lineStyle(3, L3_PAL.gold, 1 - tween.progress);
        pulse.strokeCircle(700, gateY, target.r);
      },
      onComplete: () => pulse.destroy(),
    });
  }

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
      g.fillStyle(L3_PAL.rust,  0.20); g.fillCircle(x, y, 18);
      g.fillStyle(L3_PAL.amber, 0.14); g.fillCircle(x, y, 14);
      g.fillStyle(L3_PAL.gold,  0.92); g.fillCircle(x, y,  8);
      g.fillStyle(0xffffff,     0.65); g.fillCircle(x-2, y-2, 3);
      this.tweens.add({
        targets: g, alpha: 0.42, duration: 900, yoyo: true, repeat: -1,
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

    this._levelLabel = this.add.text(W / 2, 16, 'LEVEL 3 — MARS', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#fbbf24',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(30);

    this._deathText = this.add.text(W - 16, 16, '', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#f9a8d4',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(30);

    // Conduit progress — top right
    const dpr2 = window.devicePixelRatio || 1;
    this._conduitHUD = this.add.text(W - 16, 42, 'Conduits: 0 / 5', {
      fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#818cf8',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr2,
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
    const panelW = Math.min(700, W - 28);
    const panelX = 14;
    const panelH = 130;
    const panelY = H - panelH - 14;

    this._rockyPanel.clear();
    this._rockyPanel.fillStyle(0x0f172a, 0.95);
    this._rockyPanel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(2.5, L3_PAL.amber, 0.9);
    this._rockyPanel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(1, L3_PAL.gold, 0.35);
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
      window.mobileControls.show();
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

      if (this._orbs === 1 && !this._firstOrbDone) {
        this._firstOrbDone = true;
        this.time.delayedCall(300, () => {
          this._queueRocky("The builders left these. Either as offerings or they forgot them. Either way — yours now.", 4000);
        });
      }
    });

    // Checkpoints
    this.physics.add.overlap(this.joao, this._checkpointGroup, (joao, cp) => {
      if (cp.cpY < this._checkpointY) {
        this._checkpointX = cp.cpX;
        this._checkpointY = cp.cpY;
      }
    });

    // Conduits
    this._conduitData.forEach(entry => {
      this.physics.add.overlap(this.joao, entry.body, () => {
        this._touchConduit(entry);
      });
    });

    // Exit beacon
    this.physics.add.overlap(this.joao, this._exitBeacon, () => {
      if (!this._levelComplete && this._allConduitsDone) {
        this._completeLevel();
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONDUIT ACTIVATION LOGIC
  // ─────────────────────────────────────────────────────────────────────────
  _touchConduit(entry) {
    if (entry.activated) return;

    if (entry.index === this._nextConduit) {
      // Correct order — activate
      entry.activated    = true;
      entry.body._activated = true;
      this._nextConduit++;
      this._conduitsLit++;
      this._conduitHUD.setText(`Conduits: ${this._conduitsLit} / 5`);

      // Redraw lit
      this._drawConduit(entry.g, entry.body._cx, entry.body._cy, entry.index, true, false);

      // Pulse ripple
      this._pulseConduit(entry.body._cx, entry.body._cy, L3_PAL.gold);

      if (!this._firstConduitDone) {
        this._firstConduitDone = true;
        this.time.delayedCall(400, () => {
          this._queueRocky(
            "The energy is still running through this place. Whatever built it — they planned to come back.",
            4500
          );
        });
      }

      if (this._conduitsLit === 5) {
        this._allConduitsDone = true;
        this.time.delayedCall(600, () => {
          this._openGates();
          if (!this._allConduitsDone2) {
            this._allConduitsDone2 = true;
            this._queueRocky(
              "All five. The old builders would be... mildly impressed. Emphasis on mildly.",
              4800
            );
          }
        });
      }

    } else {
      // Wrong order — flash red
      this._drawConduit(entry.g, entry.body._cx, entry.body._cy, entry.index, false, true);
      this._pulseConduit(entry.body._cx, entry.body._cy, 0xef4444);

      this.time.delayedCall(500, () => {
        this._drawConduit(entry.g, entry.body._cx, entry.body._cy, entry.index, false, false);
      });

      if (!this._wrongOrderDone) {
        this._wrongOrderDone = true;
        this._queueRocky(
          "That's the wrong sequence. There's an order to these things. Try reading the room.",
          4200
        );
      }
    }
  }

  _pulseConduit(cx, cy, color) {
    const pulse = this.add.graphics().setDepth(5);
    const obj = { r: 20 };
    this.tweens.add({
      targets: obj,
      r: 90,
      duration: 500,
      ease: 'Sine.easeOut',
      onUpdate: (tween) => {
        pulse.clear();
        pulse.lineStyle(2.5, color, 1 - tween.progress);
        pulse.strokeCircle(cx, cy, obj.r);
      },
      onComplete: () => pulse.destroy(),
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
      this.time.delayedCall(600, () => {
        this._queueRocky("Humans... I swear you have the survival instincts of a space potato.", 4000);
      });
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
      "Top of an ancient alien tower on Mars. Most humans don't make it past the gift shop.",
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

    // ── Rocky mid-way trigger
    if (!this._halfwayDone && joao.y < L3_H - 2100) {
      this._halfwayDone = true;
      this._queueRocky(
        "We're halfway up. Don't look down. Actually — do. It'll motivate you.",
        4200
      );
    }

    // ── Boss area reached
    if (!this._bossReachedDone && joao.y < L3_H - 3400) {
      this._bossReachedDone = true;
      this._queueRocky(
        "Okay. That thing is between us and the next planet. Any ideas? ...That's what I thought. I'll distract it, you run.",
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
