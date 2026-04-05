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
    const panelY = H - panelH - 14;

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
  // ENDING DIALOGUE PANELS — two-speaker system, auto-advance
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

    const panelW = Math.min(600, W - 28);
    const panelH = 120;
    const panelX = W / 2 - panelW / 2;
    const panelY = H - panelH - 14;

    const bg = this.add.graphics().setScrollFactor(0).setDepth(50).setAlpha(0);
    bg.fillStyle(panelBg, 0.95);
    bg.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    bg.lineStyle(2.5, borderCol, 0.9);
    bg.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    bg.lineStyle(1, isBichilin ? 0xfcb8d4 : 0x60a5fa, 0.30);
    bg.strokeRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 10);

    // Small avatar
    const ax = panelX + 48, ay = panelY + 58;
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

    const tx = panelX + 88;
    const nameText = this.add.text(tx, panelY + 14, nameStr, {
      fontSize: '14px', fontFamily: 'Arial, sans-serif',
      color: nameCol, fontStyle: 'bold', resolution: dpr,
    }).setScrollFactor(0).setDepth(51).setAlpha(0);

    const bodyText = this.add.text(tx, panelY + 34, '', {
      fontSize: '16px', fontFamily: 'Arial, sans-serif',
      color: '#e2e8f0', fontStyle: 'bold', resolution: dpr,
      wordWrap: { width: panelW - 98 }, lineSpacing: 5,
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

    // Joao slides to a stop
    this.tweens.add({
      targets: this.joao.body.velocity,
      x: 0,
      duration: 900,
      ease: 'Sine.easeOut',
    });

    // Camera stops following, stays on the reunion
    this.cameras.main.stopFollow();

    // Ice cream stops floating, drifts between them
    if (this._iceCreamG) {
      this.tweens.killTweensOf(this._iceCreamG);
    }

    this.time.delayedCall(1200, () => this._runEndingDialogue());
  }

  _runEndingDialogue() {
    // Bichilin line 1
    this._showEndingDialogue('bichilin', "I saved the ice cream for you.", 1400, () => {
      // Joao response
      this._showEndingDialogue('joao', "You could've eaten it, Bichilin.", 1400, () => {
        // Bichilin line 2
        this._showEndingDialogue('bichilin', "...we always do it together.", 2800, () => {
          // Rocky — three messages with pauses
          this._queueRocky(
            "Four planets. A debris field, a nebula, an ancient Martian structure, a philosophical Chinese man, and an asteroid. All of that — for ice cream and a hug.",
            5500
          );
          this._queueRocky(
            "...Humans are absolutely insane.",
            5000
          );
          this._queueRocky(
            "...I'd do it again though.",
            4500,
            () => this._runCredits()
          );
        });
      });
    });
  }

  _runCredits() {
    const W   = this.scale.width;
    const H   = this.scale.height;
    const dpr = window.devicePixelRatio || 1;

    // Fade to dark
    this.cameras.main.fadeOut(1400, 3, 7, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // "The End" text
      const endText = this.add.text(W / 2, H / 2 - 20, 'The End', {
        fontSize: '52px', fontFamily: 'Georgia, serif',
        color: '#fcd34d', fontStyle: 'italic',
        stroke: '#030712', strokeThickness: 4,
        resolution: dpr,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(60).setAlpha(0);

      const subText = this.add.text(W / 2, H / 2 + 40, 'Star Crossed Travelers', {
        fontSize: '18px', fontFamily: 'Arial, sans-serif',
        color: '#93c5fd', fontStyle: 'bold',
        resolution: dpr,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(60).setAlpha(0);

      this.tweens.add({
        targets: [endText, subText],
        alpha: 1,
        duration: 1800,
        ease: 'Sine.easeOut',
      });
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

      if (keys.left.isDown || keys.a.isDown) {
        // Accelerate left — but cap at max speed
        joao.body.velocity.x = Math.max(joao.body.velocity.x - accel * (delta / 1000) * 4.5, -260);
        joao.setFlipX(true);
      } else if (keys.right.isDown || keys.d.isDown) {
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
                       || Phaser.Input.Keyboard.JustDown(keys.space);
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
