// ── Level 4 — The Ice-Cream Planet (The Frozen Moon) ─────────────────────────
// Icy moon surface, crystalline formations, dancing auroras.
// New mechanic: slippery ice physics — momentum carries, stops are slow.
// Cracking platforms that sink after one step.

const L4_PAL = {
  gold:    0xfcd34d,
  teal:    0x67e8f9,
  cyan:    0x22d3ee,
  blue:    0x93c5fd,
  indigo:  0x6366f1,
  violet:  0x7c3aed,
  pink:    0xf9a8d4,
  rose:    0xfb7185,
  lavender:0xa78bfa,
  white:   0xe8edf5,
  iceWhite:0xdbeafe,
  iceBlue: 0xbae6fd,
  dark:    0x030712,
  icePlatform: 0x7dd3fc,
  iceHi:       0xe0f2fe,
  crackPlatform: 0x93c5fd,
};

const L4_W = 3600;
const L4_H = 700;

class Level4 extends Phaser.Scene {
  constructor() {
    super({ key: 'Level4' });
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
    this._checkpointX     = 80;
    this._checkpointY     = 360;
    this._controlsEnabled = true;

    // Rocky flags
    this._welcomeDone      = false;
    this._firstDeathDone   = false;
    this._firstCrackDone   = false;
    this._halfwayDone      = false;

    // Rocky queue
    this._rockyQueue = [];
    this._rockyBusy  = false;

    this.physics.world.setBounds(0, 0, L4_W, L4_H);
    this.cameras.main.setBounds(0, 0, L4_W, L4_H);

    this._buildBackground();
    this._buildPlatforms();
    this._buildGeysers();
    this._buildOrbs();
    this._buildBichilin();
    this._buildJoao();
    this._buildCheckpoints();
    this._buildHUD();
    this._buildRockyPanel();
    this._setupCamera();
    this._setupControls();
    this._setupCollisions();

    this.cameras.main.fadeIn(700, 3, 7, 18);

    this.time.delayedCall(1800, () => {
      if (!this._welcomeDone) {
        this._welcomeDone = true;
        this._queueRocky(
          "Slippery. Cold. Cracking platforms. She better be worth it.",
          4500
        );
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BACKGROUND — dark teal sky, ice planet, auroras, crystal formations
  // ─────────────────────────────────────────────────────────────────────────
  _buildBackground() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Deep navy-teal sky base
    const bg = this.add.graphics().setScrollFactor(0).setDepth(-10);
    bg.fillStyle(0x020b18, 1);
    bg.fillRect(0, 0, W, H);

    // Faint stars
    const stars = this.add.graphics().setScrollFactor(0.06).setDepth(-9);
    for (let i = 0; i < 160; i++) {
      const sx = Phaser.Math.Between(0, L4_W);
      const sy = Phaser.Math.Between(0, L4_H * 0.75);
      stars.fillStyle(0xe0f2fe, Math.random() * 0.5 + 0.1);
      stars.fillCircle(sx, sy, Math.random() * 1.4 + 0.2);
    }

    // The Ice-Cream Planet — huge pale sphere looming in the background
    const planet = this.add.graphics().setScrollFactor(0.04).setDepth(-8);
    // Outer glow
    planet.fillStyle(0xe0f2fe, 0.06); planet.fillCircle(2800, -200, 520);
    planet.fillStyle(0xbae6fd, 0.08); planet.fillCircle(2800, -200, 440);
    // Planet body
    planet.fillStyle(0xf0f9ff, 0.18); planet.fillCircle(2800, -200, 360);
    planet.fillStyle(0xe0f2fe, 0.14); planet.fillCircle(2800, -200, 300);
    // Swirl marks
    planet.fillStyle(0xfcd34d, 0.07); planet.fillEllipse(2720, -280, 260, 100);
    planet.fillStyle(0xf9a8d4, 0.06); planet.fillEllipse(2850, -120, 200, 80);
    planet.fillStyle(0xa78bfa, 0.05); planet.fillEllipse(2760, -200, 180, 60);

    // Aurora curtains — Layer 2 (scrollFactor 0.12)
    const aurora = this.add.graphics().setScrollFactor(0.12).setDepth(-7);
    const auroraData = [
      [400,   0, 60, 380, 0x67e8f9, 0.09],
      [700,   0, 80, 420, 0x34d399, 0.07],
      [1100,  0, 55, 360, 0xa78bfa, 0.08],
      [1500,  0, 70, 400, 0x67e8f9, 0.07],
      [1900,  0, 65, 380, 0xf9a8d4, 0.06],
      [2300,  0, 75, 420, 0x34d399, 0.08],
      [2700,  0, 60, 360, 0xa78bfa, 0.07],
      [3100,  0, 70, 400, 0x67e8f9, 0.09],
    ];
    auroraData.forEach(([x, y, w, h, col, a]) => {
      aurora.fillStyle(col, a);
      aurora.fillRect(x - w/2, y, w, h);
      aurora.fillStyle(col, a * 0.5);
      aurora.fillRect(x - w/2 + w*0.3, y, w * 0.4, h * 0.7);
    });

    // Animate aurora alpha
    this.tweens.add({
      targets: aurora, alpha: 0.45,
      duration: 2800, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Crystal ice formations — Layer 3 (scrollFactor 0.22)
    const crystals = this.add.graphics().setScrollFactor(0.22).setDepth(-6);
    const crystalSpikes = [
      [200,  L4_H - 80,  18, 110],
      [350,  L4_H - 80,  14, 80],
      [800,  L4_H - 80,  22, 140],
      [950,  L4_H - 80,  16, 95],
      [1400, L4_H - 80,  20, 120],
      [1600, L4_H - 80,  15, 85],
      [2000, L4_H - 80,  24, 150],
      [2200, L4_H - 80,  18, 100],
      [2600, L4_H - 80,  20, 125],
      [2800, L4_H - 80,  14, 80],
      [3100, L4_H - 80,  22, 135],
      [3300, L4_H - 80,  16, 90],
    ];
    crystalSpikes.forEach(([x, y, w, h]) => {
      crystals.fillStyle(0xbae6fd, 0.22);
      crystals.fillTriangle(x, y - h, x - w, y, x + w, y);
      crystals.fillStyle(0xe0f2fe, 0.12);
      crystals.fillTriangle(x + 4, y - h * 0.7, x - 4, y - h * 0.2, x + w * 0.6, y);
      crystals.lineStyle(1, 0x7dd3fc, 0.35);
      crystals.strokeTriangle(x, y - h, x - w, y, x + w, y);
    });

    // Icy ground strip
    const ground = this.add.graphics().setScrollFactor(1).setDepth(-5);
    ground.fillStyle(0x0c4a6e, 0.55);
    ground.fillRect(0, L4_H - 30, L4_W, 30);
    ground.fillStyle(0x7dd3fc, 0.18);
    ground.fillRect(0, L4_H - 30, L4_W, 6);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PLATFORMS — solid ice + cracking ice
  // ─────────────────────────────────────────────────────────────────────────
  _buildPlatforms() {
    this._platforms     = this.physics.add.staticGroup();
    this._crackPlatforms = [];   // { body, g, x, y, w, h, cracked }

    // Solid platforms [x, y, w, h]
    const solid = [
      [80,   490, 200, 20],
      [370,  460, 120, 20],
      [620,  420, 110, 20],
      [880,  390, 120, 20],
      [1140, 420, 110, 20],
      [1400, 380, 120, 20],
      [1700, 410, 120, 20],
      [1960, 380, 110, 20],
      [2220, 410, 120, 20],
      [2500, 380, 120, 20],
      [2780, 410, 110, 20],
      [3060, 380, 120, 20],
      [3320, 350, 140, 20],
      [3500, 340, 260, 20],   // final wide platform — Bichilin is here
    ];

    // Crack platforms [x, y, w, h]
    const crack = [
      [490,  440, 100, 18],
      [750,  400, 100, 18],
      [1010, 400, 100, 18],
      [1270, 390, 100, 18],
      [1550, 395, 100, 18],
      [1830, 390, 100, 18],
      [2090, 395, 100, 18],
      [2360, 385, 100, 18],
    ];

    solid.forEach(([x, y, w, h]) => this._drawIcePlatform(x, y, w, h, false));
    crack.forEach(([x, y, w, h])  => this._buildCrackPlatform(x, y, w, h));
  }

  _drawIcePlatform(x, y, w, h, isTransparent) {
    const g = this.add.graphics().setDepth(2);
    const a = isTransparent ? 0.5 : 1;

    // Ice body
    g.fillStyle(0x0e4166, a * 0.85);
    g.fillRect(x - w/2, y - h/2, w, h);

    // Ice shimmer top
    g.fillStyle(0x7dd3fc, a * 0.45);
    g.fillRect(x - w/2 + 3, y - h/2 + 2, w - 6, 5);

    // Deeper blue bottom shadow
    g.fillStyle(0x082f49, a * 0.9);
    g.fillRect(x - w/2, y + h/2 - 5, w, 5);

    // Ice edge glint
    g.lineStyle(1.5, 0xbae6fd, a * 0.6);
    g.strokeRect(x - w/2, y - h/2, w, h);
    g.lineStyle(1, 0xe0f2fe, a * 0.3);
    g.strokeRect(x - w/2 + 2, y - h/2 + 2, w - 4, h - 4);

    const body = this.physics.add.staticImage(x, y, null).setVisible(false);
    body.setDisplaySize(w, h); body.refreshBody();
    this._platforms.add(body);

    return { g, body };
  }

  _buildCrackPlatform(x, y, w, h) {
    const g = this.add.graphics().setDepth(2);
    this._drawCrackGfx(g, x, y, w, h, false);

    // Use a movable physics image (not static) so we can tween it downward
    const body = this.physics.add.image(x, y, null).setVisible(false);
    body.setDisplaySize(w, h);
    body.body.allowGravity = false;
    body.body.immovable    = true;

    const entry = { g, body, x, y, w, h, cracked: false };
    this._crackPlatforms.push(entry);
    return entry;
  }

  _drawCrackGfx(g, x, y, w, h, cracked) {
    g.clear();

    // Ice body — slightly different tint to distinguish from solid
    g.fillStyle(0x164e63, 0.80);
    g.fillRect(x - w/2, y - h/2, w, h);

    // Ice shimmer
    g.fillStyle(0x67e8f9, 0.35);
    g.fillRect(x - w/2 + 3, y - h/2 + 2, w - 6, 5);

    g.fillStyle(0x0c4a6e, 0.85);
    g.fillRect(x - w/2, y + h/2 - 5, w, 5);

    g.lineStyle(1.5, 0x67e8f9, 0.65);
    g.strokeRect(x - w/2, y - h/2, w, h);

    // Crack marks — always visible, more dramatic when cracking
    const crackA = cracked ? 0.95 : 0.35;
    g.lineStyle(1.5, 0xe0f2fe, crackA);
    // Center crack
    g.lineBetween(x - 4, y - h/2 + 2, x + 8,  y + h/2 - 2);
    g.lineBetween(x + 2, y - h/2 + 4, x - 12, y + h/2 - 3);
    if (cracked) {
      g.lineBetween(x - 14, y - h/2 + 3, x - 6, y);
      g.lineBetween(x + 14, y - h/2 + 4, x + 4, y);
    }
  }

  _crackAndSink(entry) {
    if (entry.cracked) return;
    entry.cracked = true;

    this._drawCrackGfx(entry.g, entry.x, entry.y, entry.w, entry.h, true);

    // Micro-shake
    this.cameras.main.shake(180, 0.006);

    if (!this._firstCrackDone) {
      this._firstCrackDone = true;
      this.time.delayedCall(400, () => {
        this._queueRocky("That platform is leaving. Might want to keep moving.", 4000);
      });
    }

    // Brief pause then sink
    this.time.delayedCall(420, () => {
      this.tweens.add({
        targets: [entry.g, entry.body],
        y: `+=${L4_H}`,
        duration: 2800,
        ease: 'Sine.easeIn',
        onUpdate: () => {
          entry.body.refreshBody();
        },
        onComplete: () => {
          entry.g.destroy();
          entry.body.destroy();
        },
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ICE GEYSERS — 6, each with dormant / warning / eruption cycle
  // ─────────────────────────────────────────────────────────────────────────
  _buildGeysers() {
    this._geysers = [];

    const positions = [560, 920, 1320, 1740, 2140, 2640];

    positions.forEach((gx, i) => {
      const gy = L4_H - 30;   // floor level

      // Vent graphic (static, always visible)
      const ventG = this.add.graphics().setDepth(3);
      ventG.fillStyle(0x0c4a6e, 1);
      ventG.fillEllipse(gx, gy - 6, 28, 10);
      ventG.lineStyle(1.5, 0x67e8f9, 0.55);
      ventG.strokeEllipse(gx, gy - 6, 28, 10);

      // Eruption graphic (hidden until eruption)
      const eruptG = this.add.graphics().setDepth(4).setAlpha(0);

      // Hitbox — tall column above vent
      const hitH = 280;
      const body = this.physics.add.staticImage(gx, gy - hitH/2 - 10, null).setVisible(false);
      body.setDisplaySize(22, hitH); body.refreshBody();
      body.setActive(false);

      const entry = { gx, gy, ventG, eruptG, body, phase: 'dormant' };
      this._geysers.push(entry);

      // Stagger start times so they don't all fire together
      this.time.delayedCall(i * 700, () => this._geyserCycle(entry));
    });
  }

  _geyserCycle(entry) {
    if (!this.scene.isActive()) return;

    entry.phase = 'dormant';
    entry.eruptG.setAlpha(0);
    entry.body.setActive(false);

    // Dormant 2.5s → warning
    this.time.delayedCall(2500, () => {
      entry.phase = 'warning';
      // Small wisps appear
      this._drawGeyserWarning(entry);

      // Warning 0.8s → eruption
      this.time.delayedCall(800, () => {
        entry.phase = 'erupting';
        this._drawGeyserErupt(entry);
        entry.body.setActive(true);

        // Flicker during eruption
        const flickerEvent = this.time.addEvent({
          delay: 80, loop: true,
          callback: () => this._drawGeyserErupt(entry),
        });

        // Eruption 1.2s → back to dormant
        this.time.delayedCall(1200, () => {
          flickerEvent.remove(false);
          entry.eruptG.setAlpha(0);
          entry.body.setActive(false);
          this._geyserCycle(entry);
        });
      });
    });
  }

  _drawGeyserWarning(entry) {
    const { eruptG, gx, gy } = entry;
    eruptG.clear();
    eruptG.setAlpha(0.5);
    // Tiny wisps
    eruptG.fillStyle(0xe0f2fe, 0.4);
    eruptG.fillEllipse(gx - 4, gy - 22, 8, 14);
    eruptG.fillEllipse(gx + 5, gy - 28, 6, 12);
    eruptG.fillEllipse(gx,     gy - 32, 7, 10);
  }

  _drawGeyserErupt(entry) {
    const { eruptG, gx, gy } = entry;
    eruptG.clear();
    eruptG.setAlpha(1);

    const h = 280;
    const segments = 7;
    const segH = h / segments;

    // Outer glow column
    eruptG.fillStyle(0x67e8f9, 0.12);
    eruptG.fillRect(gx - 18, gy - h - 10, 36, h + 10);

    // Main column — jagged spikes
    eruptG.fillStyle(0xbae6fd, 0.75);
    eruptG.beginPath();
    eruptG.moveTo(gx - 10, gy);
    for (let s = 0; s < segments; s++) {
      const jitter = Phaser.Math.Between(-5, 5);
      const sy = gy - (s + 1) * segH;
      eruptG.lineTo(gx - 10 + jitter, sy);
    }
    eruptG.lineTo(gx, gy - h - 10);
    for (let s = segments - 1; s >= 0; s--) {
      const jitter = Phaser.Math.Between(-5, 5);
      const sy = gy - (s + 1) * segH;
      eruptG.lineTo(gx + 10 + jitter, sy);
    }
    eruptG.lineTo(gx + 10, gy);
    eruptG.fillPath();

    // White core
    eruptG.fillStyle(0xf0f9ff, 0.55);
    eruptG.fillRect(gx - 5, gy - h, 10, h);

    // Spray at top
    for (let s = 0; s < 5; s++) {
      const angle = (Math.PI / 6) * (s - 2);
      const len   = Phaser.Math.Between(20, 40);
      eruptG.lineStyle(2, 0xe0f2fe, 0.5);
      eruptG.lineBetween(
        gx, gy - h,
        gx + Math.sin(angle) * len, gy - h - Math.cos(angle) * len
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ORBS
  // ─────────────────────────────────────────────────────────────────────────
  _buildOrbs() {
    this._orbGroup = this.physics.add.staticGroup();

    [
      [370,  420],
      [750,  360],
      [1140, 378],
      [1400, 340],
      [1960, 340],
      [2500, 340],
      [3060, 340],
      [3420, 300],
    ].forEach(([x, y]) => {
      const g = this.add.graphics().setDepth(4);
      g.fillStyle(0x67e8f9, 0.20); g.fillCircle(x, y, 18);
      g.fillStyle(0xbae6fd, 0.14); g.fillCircle(x, y, 14);
      g.fillStyle(L4_PAL.gold,  0.92); g.fillCircle(x, y,  8);
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
  // BICHILIN — sitting on final platform, facing left toward Joao
  // ─────────────────────────────────────────────────────────────────────────
  _buildBichilin() {
    const bx = 3460, by = 300;

    if (!this.textures.exists('bichilin')) {
      const rt = this.add.renderTexture(0, 0, 80, 120).setVisible(false);
      const tempG = this.make.graphics({ x: 0, y: 0, add: false });
      this._drawBichilinAstronaut(tempG, 40, 60, 1);
      rt.draw(tempG, 0, 0);
      rt.saveTexture('bichilin');
      tempG.destroy(); rt.destroy();
    }

    this._bichilinSprite = this.add.image(bx, by, 'bichilin')
      .setDisplaySize(52, 78)
      .setFlipX(true)
      .setDepth(9);

    // Glowing ice cream cone floating beside her
    this._buildIceCream(bx + 46, by - 28);

    // Trigger zone — when Joao gets within 120px, ending fires
    this._bichilinTrigger = this.physics.add.staticImage(bx - 60, by, null).setVisible(false);
    this._bichilinTrigger.setDisplaySize(140, 100);
    this._bichilinTrigger.refreshBody();
  }

  _drawBichilinAstronaut(g, cx, cy, s) {
    // Same design as Joao but pink/rose suit, lavender accents, light-blue visor
    const W = 0xfce7f3, B = 0xfbcfe8, V = 0x93c5fd, P = 0xa78bfa;
    g.fillStyle(B,1); g.fillRoundedRect(cx-6*s,cy-14*s,12*s,24*s,3*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx-18*s,cy-18*s,36*s,34*s,6*s);
    g.lineStyle(2*s,B,1); g.strokeRoundedRect(cx-18*s,cy-18*s,36*s,34*s,6*s);
    g.fillStyle(P,1); g.fillRoundedRect(cx-8*s,cy-12*s,16*s,12*s,2*s);
    g.fillStyle(0xfcd34d,1); g.fillCircle(cx-3*s,cy-7*s,2*s);
    g.fillStyle(0xf9a8d4,1); g.fillCircle(cx+3*s,cy-7*s,2*s);
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

  _buildIceCream(x, y) {
    const g = this.add.graphics().setDepth(8);
    // Cone
    g.fillStyle(0xfbbf24, 0.9);
    g.fillTriangle(x, y + 30, x - 14, y, x + 14, y);
    g.lineStyle(1, 0xf59e0b, 0.7); g.strokeTriangle(x, y + 30, x - 14, y, x + 14, y);
    // Waffle pattern
    g.lineStyle(0.8, 0xf59e0b, 0.4);
    g.lineBetween(x - 9, y + 8, x + 9, y + 8);
    g.lineBetween(x - 6, y + 16, x + 6, y + 16);
    // Scoop
    g.fillStyle(0xfce7f3, 0.92); g.fillCircle(x, y - 10, 16);
    g.fillStyle(0xf9a8d4, 0.5);  g.fillCircle(x - 4, y - 14, 9);
    g.fillStyle(0xffffff, 0.5);  g.fillCircle(x - 6, y - 16, 4);
    // Glow
    g.fillStyle(0xfcd34d, 0.14); g.fillCircle(x, y - 10, 26);
    // Float tween
    this.tweens.add({
      targets: g, y: -10, duration: 1800, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this._iceCreamG = g;
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

    this.joao = this.physics.add.sprite(80, 400, 'joao');
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
  // CHECKPOINTS
  // ─────────────────────────────────────────────────────────────────────────
  _buildCheckpoints() {
    this._checkpointGroup = this.physics.add.staticGroup();

    [[620, 400], [1140, 400], [1700, 390], [2220, 390], [3060, 360]].forEach(([x, y]) => {
      const g = this.add.graphics().setDepth(3);
      g.lineStyle(2, L4_PAL.teal,   0.7); g.strokeRect(x-4, y-22, 8, 22);
      g.fillStyle(L4_PAL.cyan, 0.55);     g.fillTriangle(x, y-30, x+12, y-20, x-12, y-20);

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

    this._levelLabel = this.add.text(W / 2, 16, 'LEVEL 4 — THE FROZEN MOON', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#67e8f9',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(30);

    this._deathText = this.add.text(W - 16, 16, '', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#f9a8d4',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(30);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ROCKY PANEL
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

  _queueRocky(text, holdMs, onDone) {
    this._rockyQueue.push({ text, holdMs: holdMs || 5500, onDone });
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
    const W      = this.scale.width;
    const H      = this.scale.height;
    const panelW = Math.min(700, W - 28);
    const panelX = 14;
    const panelH = 130;
    const mcBottom = (window.mobileControls ? window.mobileControls.reservedBottom : 0);
    const panelY = H - panelH - 14 - mcBottom;

    this._rockyPanel.clear();
    this._rockyPanel.fillStyle(0x0f172a, 0.95);
    this._rockyPanel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(2.5, L4_PAL.teal, 0.9);
    this._rockyPanel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(1, L4_PAL.gold, 0.35);
    this._rockyPanel.strokeRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 10);

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
  // ENDING DIALOGUE PANELS — screen-space, auto-sizing bubble
  // ─────────────────────────────────────────────────────────────────────────
  _showEndingDialogue(speaker, text, holdMs, onDone) {
    const W   = this.scale.width;
    const H   = this.scale.height;
    const dpr = window.devicePixelRatio || 1;

    const isBichilin = speaker === 'bichilin';
    const borderCol  = isBichilin ? L4_PAL.pink  : L4_PAL.blue;
    const nameCol    = isBichilin ? '#f9a8d4'     : '#93c5fd';
    const nameStr    = isBichilin ? 'Bichilin:'   : 'Joao:';
    const panelBg    = isBichilin ? 0x1a0d14      : 0x0d1425;

    const AVATAR_AREA = 92;          // pixels reserved on left for avatar
    const PAD_H       = 16;          // horizontal inner padding on text side
    const panelW      = Math.min(620, W - 28);
    const panelX      = W / 2 - panelW / 2;
    const textAreaW   = panelW - AVATAR_AREA - PAD_H;

    // ── Measure how tall the body text will be so the bubble can self-size
    const probe = this.add.text(-9999, -9999, text, {
      fontSize: '16px', fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold', resolution: dpr,
      wordWrap: { width: textAreaW }, lineSpacing: 5,
    }).setScrollFactor(0).setVisible(false);
    const measuredTextH = probe.height;
    probe.destroy();

    // Panel height: top pad (14) + name label (18) + gap (6) + body text + bottom pad (18)
    const panelH  = Math.max(110, 14 + 18 + 6 + measuredTextH + 18);
    const mcBottom = (window.mobileControls ? window.mobileControls.reservedBottom : 0);
    const panelY  = H - panelH - 14 - mcBottom;

    const bg = this.add.graphics().setScrollFactor(0).setDepth(50).setAlpha(0);
    bg.fillStyle(panelBg, 0.95);
    bg.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    bg.lineStyle(2.5, borderCol, 0.9);
    bg.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    bg.lineStyle(1, isBichilin ? 0xfcb8d4 : 0x60a5fa, 0.28);
    bg.strokeRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 10);

    // Avatar — vertically centered in the panel
    const ax = panelX + 46, ay = panelY + panelH / 2 - 4;
    if (isBichilin) {
      bg.fillStyle(0xfce7f3, 0.9); bg.fillCircle(ax, ay - 6, 16);
      bg.lineStyle(1.5, 0xfbcfe8, 0.8); bg.strokeCircle(ax, ay - 6, 16);
      bg.fillStyle(0x93c5fd, 0.85); bg.fillEllipse(ax, ay - 6, 20, 14);
      bg.fillStyle(0xfce7f3, 0.6); bg.fillRoundedRect(ax - 14, ay + 8, 28, 20, 4);
    } else {
      bg.fillStyle(0xe8edf5, 0.9); bg.fillCircle(ax, ay - 6, 16);
      bg.lineStyle(1.5, 0xbdc6d4, 0.8); bg.strokeCircle(ax, ay - 6, 16);
      bg.fillStyle(0xf59e0b, 0.85); bg.fillEllipse(ax, ay - 6, 20, 14);
      bg.fillStyle(0xe8edf5, 0.6); bg.fillRoundedRect(ax - 14, ay + 8, 28, 20, 4);
    }

    const tx = panelX + AVATAR_AREA;
    const nameText = this.add.text(tx, panelY + 14, nameStr, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif',
      color: nameCol, fontStyle: 'bold', resolution: dpr,
    }).setScrollFactor(0).setDepth(51).setAlpha(0);

    const bodyText = this.add.text(tx, panelY + 38, '', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif',
      color: '#e2e8f0', fontStyle: 'bold', resolution: dpr,
      wordWrap: { width: textAreaW }, lineSpacing: 5,
    }).setScrollFactor(0).setDepth(51).setAlpha(0);

    const all = [bg, nameText, bodyText];

    this.tweens.add({
      targets: all, alpha: 1, duration: 260,
      onComplete: () => {
        this._typeWords(bodyText, text, 85, () => {
          this.time.delayedCall(holdMs, () => {
            this.tweens.add({
              targets: all, alpha: 0, duration: 300,
              onComplete: () => {
                all.forEach(o => o.destroy());
                if (onDone) onDone();
              },
            });
          });
        });
      },
    });
  }

  _typeWords(textObj, text, msPerWord, onDone) {
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
  // ENDING SEQUENCE
  // ─────────────────────────────────────────────────────────────────────────
  _triggerEnding() {
    if (this._levelComplete) return;
    this._levelComplete   = true;
    this._controlsEnabled = false;
    if (window.mobileControls) window.mobileControls.hide();
    if (this._iceCreamG) this.tweens.killTweensOf(this._iceCreamG);
    this._runHugCinematic();
  }

  // ── Hug cinematic: run → meet → embrace → hold → dialogue
  _runHugCinematic() {
    const joaoStopX = 3415;
    const bichMoveX = 3440;
    const hugCX     = 3428;
    const hugCY     = 298;

    // Phase 1: disable physics, tween Joao running toward Bichilin
    this.joao.body.enable = false;
    this.joao.setFlipX(false);
    this.tweens.add({
      targets: this.joao,
      x: joaoStopX,
      duration: 950,
      ease: 'Cubic.easeOut',
    });

    // Phase 2: Bichilin steps toward him (350ms in)
    this.time.delayedCall(350, () => {
      this.tweens.add({
        targets: this._bichilinSprite,
        x: bichMoveX,
        duration: 700,
        ease: 'Sine.easeOut',
      });
    });

    // Phase 3: Embrace fires at 1050ms
    this.time.delayedCall(1050, () => {
      // Camera stops following, pans to embrace + zooms in
      this.cameras.main.stopFollow();
      this.cameras.main.pan(hugCX, hugCY, 1100, 'Sine.easeOut');
      this.cameras.main.zoomTo(1.22, 2600, 'Sine.easeInOut');

      // Sprites fade out, hug composite fades in
      this.tweens.add({
        targets: [this.joao, this._bichilinSprite],
        alpha: 0, duration: 220, ease: 'Sine.easeOut',
      });
      this._drawHugComposite(hugCX, hugCY);

      // Aurora intensifies during embrace
      this._intensifyAurora();

      // Floating particles
      this._spawnHugParticles(hugCX, hugCY);
    });

    // Phase 4: Dialogue begins after 3200ms of holding the embrace
    this.time.delayedCall(4250, () => this._runEndingDialogue());
  }

  // ── Draw both astronauts in embrace pose using layered Phaser graphics
  _drawHugComposite(cx, cy) {
    const jx = cx - 18;  // Joao body center x
    const bx = cx + 14;  // Bichilin body center x

    // ── Outer warm glow — radiates behind both figures
    const gGlow = this.add.graphics().setDepth(11).setAlpha(0);
    gGlow.fillStyle(0xfcd34d, 0.13); gGlow.fillCircle(cx, cy, 140);
    gGlow.fillStyle(0xf9a8d4, 0.11); gGlow.fillCircle(cx, cy, 108);
    gGlow.fillStyle(0xa78bfa, 0.09); gGlow.fillCircle(cx, cy,  78);
    gGlow.fillStyle(0xffffff, 0.08); gGlow.fillCircle(cx, cy,  50);
    this.tweens.add({ targets: gGlow, alpha: 1, duration: 700, ease: 'Sine.easeOut' });
    // Breathing pulse
    this.tweens.add({
      targets: gGlow,
      alpha: { from: 0.82, to: 1.0 },
      scaleX: { from: 0.93, to: 1.07 },
      scaleY: { from: 0.93, to: 1.07 },
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // ── Wrap arms — drawn at depth 12 so both bodies (13/14) hide the middle section,
    //    leaving only the forearms + gloves peeking out from each other's far side
    const gArms = this.add.graphics().setDepth(12).setAlpha(0);
    const JW = 0xe8edf5, JB = 0xbdc6d4, JP = 0x6366f1;
    const BW = 0xfce7f3, BB = 0xfbcfe8, BP = 0xa78bfa;

    // Joao's right arm wrapping around Bichilin's back
    gArms.fillStyle(JW, 1);
    gArms.fillRoundedRect(jx + 14, cy - 14, bx - jx + 10, 12, 4); // horizontal across
    gArms.lineStyle(1.5, JB, 1);
    gArms.strokeRoundedRect(jx + 14, cy - 14, bx - jx + 10, 12, 4);
    gArms.fillStyle(JW, 1);
    gArms.fillRoundedRect(bx + 14, cy - 14, 11, 28, 4);             // forearm down
    gArms.lineStyle(1.5, JB, 1);
    gArms.strokeRoundedRect(bx + 14, cy - 14, 11, 28, 4);
    gArms.fillStyle(JP, 1); gArms.fillEllipse(bx + 20, cy + 16, 15, 11); // glove peek

    // Bichilin's left arm wrapping around Joao's back
    gArms.fillStyle(BW, 1);
    gArms.fillRoundedRect(jx - 24, cy - 14, bx - jx + 10, 12, 4); // horizontal across
    gArms.lineStyle(1.5, BB, 1);
    gArms.strokeRoundedRect(jx - 24, cy - 14, bx - jx + 10, 12, 4);
    gArms.fillStyle(BW, 1);
    gArms.fillRoundedRect(jx - 27, cy - 14, 11, 28, 4);             // forearm down
    gArms.lineStyle(1.5, BB, 1);
    gArms.strokeRoundedRect(jx - 27, cy - 14, 11, 28, 4);
    gArms.fillStyle(BP, 1); gArms.fillEllipse(jx - 21, cy + 16, 15, 11); // glove peek

    this.tweens.add({ targets: gArms, alpha: 1, duration: 460, ease: 'Sine.easeOut' });

    // ── Joao's body without his right arm (that's in gArms wrapping behind Bichilin)
    const gJoao = this.add.graphics().setDepth(13).setAlpha(0);
    gJoao.fillStyle(JB, 1); gJoao.fillRoundedRect(jx - 6, cy - 14, 12, 24, 3);  // tank
    gJoao.fillStyle(JW, 1); gJoao.fillRoundedRect(jx - 18, cy - 18, 36, 34, 6); // torso
    gJoao.lineStyle(2, JB, 1); gJoao.strokeRoundedRect(jx - 18, cy - 18, 36, 34, 6);
    gJoao.fillStyle(JP, 1); gJoao.fillRoundedRect(jx - 8, cy - 12, 16, 12, 2);  // chest panel
    gJoao.fillStyle(0xfcd34d, 1); gJoao.fillCircle(jx - 3, cy - 7, 2);
    gJoao.fillStyle(0xf87171, 1); gJoao.fillCircle(jx + 3, cy - 7, 2);
    gJoao.fillStyle(0x6ee7b7, 1); gJoao.fillCircle(jx,     cy - 7, 2);
    gJoao.fillStyle(JW, 1); gJoao.fillRoundedRect(jx - 28, cy - 16, 12, 28, 4); // left arm (outer)
    gJoao.lineStyle(2, JB, 1); gJoao.strokeRoundedRect(jx - 28, cy - 16, 12, 28, 4);
    gJoao.fillStyle(JP, 1); gJoao.fillEllipse(jx - 22, cy + 14, 14, 10);
    gJoao.fillStyle(JW, 1); gJoao.fillRoundedRect(jx - 16, cy + 16, 12, 24, 3); // left leg
    gJoao.lineStyle(2, JB, 1); gJoao.strokeRoundedRect(jx - 16, cy + 16, 12, 24, 3);
    gJoao.fillStyle(JP, 1); gJoao.fillRoundedRect(jx - 19, cy + 38, 18, 8, 3);
    gJoao.fillStyle(JW, 1); gJoao.fillRoundedRect(jx + 4,  cy + 16, 12, 24, 3); // right leg
    gJoao.lineStyle(2, JB, 1); gJoao.strokeRoundedRect(jx + 4,  cy + 16, 12, 24, 3);
    gJoao.fillStyle(JP, 1); gJoao.fillRoundedRect(jx + 1,  cy + 38, 18, 8, 3);
    this.tweens.add({ targets: gJoao, alpha: 1, duration: 460, ease: 'Sine.easeOut' });

    // ── Bichilin's body without her left arm (that's in gArms wrapping behind Joao)
    const gBich = this.add.graphics().setDepth(14).setAlpha(0);
    gBich.fillStyle(BB, 1); gBich.fillRoundedRect(bx - 6, cy - 14, 12, 24, 3);  // tank
    gBich.fillStyle(BW, 1); gBich.fillRoundedRect(bx - 18, cy - 18, 36, 34, 6); // torso
    gBich.lineStyle(2, BB, 1); gBich.strokeRoundedRect(bx - 18, cy - 18, 36, 34, 6);
    gBich.fillStyle(BP, 1); gBich.fillRoundedRect(bx - 8, cy - 12, 16, 12, 2);  // chest panel
    gBich.fillStyle(0xfcd34d, 1); gBich.fillCircle(bx - 3, cy - 7, 2);
    gBich.fillStyle(0xf9a8d4, 1); gBich.fillCircle(bx + 3, cy - 7, 2);
    gBich.fillStyle(0x6ee7b7, 1); gBich.fillCircle(bx,     cy - 7, 2);
    gBich.fillStyle(BW, 1); gBich.fillRoundedRect(bx + 16, cy - 16, 12, 28, 4); // right arm (outer)
    gBich.lineStyle(2, BB, 1); gBich.strokeRoundedRect(bx + 16, cy - 16, 12, 28, 4);
    gBich.fillStyle(BP, 1); gBich.fillEllipse(bx + 22, cy + 14, 14, 10);
    gBich.fillStyle(BW, 1); gBich.fillRoundedRect(bx - 16, cy + 16, 12, 24, 3); // left leg
    gBich.lineStyle(2, BB, 1); gBich.strokeRoundedRect(bx - 16, cy + 16, 12, 24, 3);
    gBich.fillStyle(BP, 1); gBich.fillRoundedRect(bx - 19, cy + 38, 18, 8, 3);
    gBich.fillStyle(BW, 1); gBich.fillRoundedRect(bx + 4,  cy + 16, 12, 24, 3); // right leg
    gBich.lineStyle(2, BB, 1); gBich.strokeRoundedRect(bx + 4,  cy + 16, 12, 24, 3);
    gBich.fillStyle(BP, 1); gBich.fillRoundedRect(bx + 1,  cy + 38, 18, 8, 3);
    this.tweens.add({ targets: gBich, alpha: 1, duration: 460, ease: 'Sine.easeOut' });

    // ── Helmets — on top of everything, helmets almost touching
    const gHelm = this.add.graphics().setDepth(15).setAlpha(0);
    const JV = 0xf59e0b, BV = 0x93c5fd;
    // Joao's helmet (amber visor)
    gHelm.fillStyle(JW, 1); gHelm.fillCircle(jx, cy - 28, 20);
    gHelm.lineStyle(2, JB, 1); gHelm.strokeCircle(jx, cy - 28, 20);
    gHelm.fillStyle(JV, 1); gHelm.fillEllipse(jx, cy - 28, 26, 20);
    gHelm.fillStyle(0xffffff, 0.55); gHelm.fillEllipse(jx - 5, cy - 32, 8, 6);
    // Bichilin's helmet (blue visor)
    gHelm.fillStyle(BW, 1); gHelm.fillCircle(bx, cy - 28, 20);
    gHelm.lineStyle(2, BB, 1); gHelm.strokeCircle(bx, cy - 28, 20);
    gHelm.fillStyle(BV, 1); gHelm.fillEllipse(bx, cy - 28, 26, 20);
    gHelm.fillStyle(0xffffff, 0.55); gHelm.fillEllipse(bx + 5, cy - 32, 8, 6);
    // Sparkle where helmets almost touch
    gHelm.fillStyle(0xffffff, 0.9); gHelm.fillCircle(cx - 2, cy - 30, 2.5);
    gHelm.fillStyle(0xfcd34d, 0.7); gHelm.fillCircle(cx - 2, cy - 30, 6);
    this.tweens.add({ targets: gHelm, alpha: 1, duration: 460, ease: 'Sine.easeOut' });

    // ── Gentle breathing sway on all hug elements (starts after fade-in)
    this.time.delayedCall(600, () => {
      [gArms, gJoao, gBich, gHelm].forEach(g => {
        this.tweens.add({
          targets: g,
          y: { from: 0, to: -3 },
          duration: 1950,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      });
    });
  }

  // ── Aurora intensification overlay — screen-space, fades in during embrace
  _intensifyAurora() {
    const W = this.scale.width;
    const H = this.scale.height;
    const overlay = this.add.graphics().setScrollFactor(0).setDepth(10).setAlpha(0);

    // Vertical curtain bands in palette colors
    const bands = [
      [0,        H * 0.50, W * 0.18, H * 0.50, 0x67e8f9, 0.30],
      [W * 0.10, H * 0.35, W * 0.24, H * 0.65, 0xa78bfa, 0.24],
      [W * 0.32, H * 0.30, W * 0.20, H * 0.70, 0x34d399, 0.22],
      [W * 0.52, H * 0.38, W * 0.26, H * 0.62, 0xf9a8d4, 0.26],
      [W * 0.76, H * 0.48, W * 0.24, H * 0.52, 0x67e8f9, 0.28],
    ];
    bands.forEach(([x, y, w, h, col, a]) => {
      overlay.fillStyle(col, a);
      overlay.fillRect(x, y, w, h);
      overlay.fillStyle(col, a * 0.45);
      overlay.fillRect(x + w * 0.28, y - H * 0.06, w * 0.44, h + H * 0.06);
    });
    // Warm gold bloom at center
    overlay.fillStyle(0xfcd34d, 0.055); overlay.fillRect(W * 0.2, 0, W * 0.6, H);
    overlay.fillStyle(0xf9a8d4, 0.040); overlay.fillRect(W * 0.3, 0, W * 0.4, H);

    this.tweens.add({ targets: overlay, alpha: 1, duration: 1600, ease: 'Sine.easeOut' });
    // Gentle shimmer
    this.tweens.add({
      targets: overlay,
      alpha: { from: 0.82, to: 1.0 },
      duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });
  }

  // ── Floating star / heart particles rising from the embrace
  _spawnHugParticles(cx, cy) {
    const colors = [0xfcd34d, 0xf9a8d4, 0xa78bfa, 0x67e8f9, 0xffffff];

    for (let i = 0; i < 14; i++) {
      this.time.delayedCall(i * 240 + 200, () => {
        const px = cx + Phaser.Math.Between(-55, 55);
        const py = cy + Phaser.Math.Between(-10, 30);
        const col = colors[i % colors.length];
        const r   = Phaser.Math.FloatBetween(2.5, 5);
        const riseH = Phaser.Math.Between(62, 105);

        // Graphics origin at particle position so scale tweens work correctly
        const p = this.add.graphics({ x: px, y: py }).setDepth(16).setAlpha(0);

        if (i % 3 === 0) {
          // Cross / star
          p.fillStyle(col, 0.9);
          p.fillRect(-1, -5, 2, 10);
          p.fillRect(-5, -1, 10, 2);
        } else {
          // Circle
          p.fillStyle(col, 0.85);
          p.fillCircle(0, 0, r);
        }

        // Fade in quickly, then float up and fade out
        this.tweens.add({ targets: p, alpha: 0.9, duration: 200 });
        this.tweens.add({
          targets: p,
          y: py - riseH,
          alpha: 0,
          duration: Phaser.Math.Between(1600, 2500),
          delay: 160,
          ease: 'Sine.easeOut',
          onComplete: () => { try { p.destroy(); } catch (e) {} },
        });
      });
    }
  }

  _runEndingDialogue() {
    // Reset camera zoom to 1.0 so all screen-space panels render at 1:1 scale.
    this.cameras.main.zoomTo(1.0, 550, 'Sine.easeInOut');

    this.time.delayedCall(600, () => {
      // 1. Bichilin
      this._showEndingDialogue('bichilin', "Joao! I saved the ice cream for you.", 1400, () => {
        // 2. Joao
        this._showEndingDialogue('joao', "You should have eaten it, Bichilin...", 1400, () => {
          // 3. Bichilin
          this._showEndingDialogue('bichilin', "...But...we always do it together.", 1400, () => {
            // 4. Joao
            this._showEndingDialogue('joao', "(-3-)", 1400, () => {
              // 5. Bichilin
              this._showEndingDialogue('bichilin', ".....Now...do you want to flight to earth to grab some Macdonalds..?", 1800, () => {
                // 6. Joao
                this._showEndingDialogue('joao', "Bichilin.....", 1800, () => {
                  // Rocky — four messages
                  this._queueRocky(
                    "Four planets. A debris field, a nebula, an ancient Martian structure, a philosophical Chinese man, and an asteroid. All of that — for ice cream and a hug.",
                    5500
                  );
                  this._queueRocky("...Humans are absolutely insane.", 4500);
                  this._queueRocky("...I'd do it again though.", 4000);
                  this._queueRocky(
                    "It is always the best time! When we are together.",
                    4500,
                    () => this._runCredits()
                  );
                });
              });
            });
          });
        });
      });
    });
  }

  _runCredits() {
    const W = this.scale.width;
    const H = this.scale.height;

    const blackout = this.add.graphics().setScrollFactor(0).setDepth(55).setAlpha(0);
    blackout.fillStyle(0x000000, 1);
    blackout.fillRect(0, 0, W, H);

    this.tweens.add({
      targets: blackout,
      alpha: 1,
      duration: 1400,
      ease: 'Sine.easeIn',
      onComplete: () => {
        // Raise Rocky panel above the blackout so it's visible
        this._rockyPanel.setDepth(60);
        this._rockyNameText.setDepth(61);
        this._rockyBodyText.setDepth(61);

        this._showRockyCentered("And, humans.... what is a 'Macdonalds'?", 2000, () => {
          this._showRockyCentered("Is it a kind of Space potato?", 2000, () => {
            // Game ends — stay on black
          });
        });
      },
    });
  }

  // Rocky panel drawn centered on screen — used for post-blackout credits messages
  _showRockyCentered(text, holdMs, onComplete) {
    const W      = this.scale.width;
    const H      = this.scale.height;
    const panelW = Math.min(700, W - 28);
    const panelH = 130;
    const panelX = (W - panelW) / 2;
    const panelY = (H - panelH) / 2;

    this._rockyPanel.clear();
    this._rockyPanel.fillStyle(0x0f172a, 0.95);
    this._rockyPanel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(2.5, L4_PAL.teal, 0.9);
    this._rockyPanel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(1, L4_PAL.gold, 0.35);
    this._rockyPanel.strokeRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 10);

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

  // ─────────────────────────────────────────────────────────────────────────
  // CAMERA, CONTROLS, COLLISIONS
  // ─────────────────────────────────────────────────────────────────────────
  _setupCamera() {
    this.cameras.main.startFollow(this.joao, true, 0.1, 0.1);
  }

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

  _setupCollisions() {
    // Solid platforms
    this.physics.add.collider(this.joao, this._platforms);

    // Crack platforms — collider with callback
    this._crackPlatforms.forEach(entry => {
      this.physics.add.collider(this.joao, entry.body, () => {
        if (this.joao.body.blocked.down) {
          this._crackAndSink(entry);
        }
      });
    });

    // Orbs
    this.physics.add.overlap(this.joao, this._orbGroup, (joao, orbBody) => {
      orbBody.orbGraphic.destroy();
      orbBody.destroy();
      this._orbs++;
      this._orbCountText.setText(`Orbs: ${this._orbs} / ${this._totalOrbs}`);
    });

    // Checkpoints
    this.physics.add.overlap(this.joao, this._checkpointGroup, (joao, cp) => {
      if (cp.cpX > this._checkpointX) {
        this._checkpointX = cp.cpX;
        this._checkpointY = cp.cpY;
      }
    });

    // Bichilin trigger
    this.physics.add.overlap(this.joao, this._bichilinTrigger, () => {
      this._triggerEnding();
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
  // UPDATE
  // ─────────────────────────────────────────────────────────────────────────
  update(time, delta) {
    if (!this._isAlive || this._levelComplete) return;

    const keys     = this._keys;
    const joao     = this.joao;
    const onGround = joao.body.blocked.down;

    // ── ICE PHYSICS — momentum-based movement
    if (this._controlsEnabled) {
      const accel = 380;
      const mc = window.mobileControls;

      if (keys.left.isDown || keys.a.isDown || (mc && mc.left)) {
        // Accelerate left — but cap at max speed
        joao.body.velocity.x = Math.max(joao.body.velocity.x - accel * (delta / 1000) * 4.5, -260);
        joao.setFlipX(true);
      } else if (keys.right.isDown || keys.d.isDown || (mc && mc.right)) {
        joao.body.velocity.x = Math.min(joao.body.velocity.x + accel * (delta / 1000) * 4.5, 260);
        joao.setFlipX(false);
      } else {
        // Ice friction — slow decay instead of instant stop
        joao.body.velocity.x *= onGround ? 0.87 : 0.97;
        // Snap to zero when very slow
        if (Math.abs(joao.body.velocity.x) < 2) joao.body.velocity.x = 0;
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
        joao.setVelocityY(-640);
        this._coyoteTime = 0;
      }
    }

    // ── Rocky position triggers
    if (!this._halfwayDone && joao.x > 1800) {
      this._halfwayDone = true;
      this._queueRocky("...She is, isn't she. Keep going.", 4500);
    }

    // ── Geyser collision check
    const invincible = time < this._invincibleUntil;
    if (!invincible) {
      const joaoBounds = joao.getBounds();
      this._geysers.forEach(({ body, phase }) => {
        if (phase !== 'erupting' || !body.active) return;
        if (Phaser.Geom.Intersects.RectangleToRectangle(joaoBounds, body.getBounds())) {
          this._killJoao();
        }
      });
    }

    // ── Fall off world
    if (joao.y > L4_H + 80) this._killJoao();
  }
}
