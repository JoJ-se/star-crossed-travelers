// ── Level 1 — The Wreck ───────────────────────────────────────────────────────
// Debris field orbiting an amber planet — the ruins of Joao and Bingqilin's ship.

const PALETTE = {
  gold:   0xfcd34d,
  amber:  0xf59e0b,
  indigo: 0x6366f1,
  blue:   0x93c5fd,
  pink:   0xf9a8d4,
  green:  0x6ee7b7,
  white:  0xe8edf5,
  gray:   0xbdc6d4,
  dark:   0x030712,
  hull:   0x374151,
  hullHi: 0x4b5563,
};

const WORLD_W = 3200;
const WORLD_H = 700;

class Level1 extends Phaser.Scene {
  constructor() {
    super({ key: 'Level1' });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────────────
  create() {
    // State
    this._deathCount      = 0;
    this._orbs            = 0;
    this._totalOrbs       = 8;
    this._isAlive         = true;
    this._levelComplete   = false;
    this._invincibleUntil = 0;
    this._checkpointX     = 80;
    this._checkpointY     = 360;   // above first platform — Joao falls in cleanly

    // Rocky joke trigger flags
    this._hasJumped        = false;
    this._firstDebrisHit   = false;
    this._firstOrbDone     = false;
    this._firstDeathDone   = false;
    this._welcomeDone      = false;
    this._dudeJokeDone     = false;
    this._starfishDone     = false;

    // Rocky queue
    this._rockyQueue  = [];
    this._rockyBusy   = false;

    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    this._buildBackground();
    this._buildPlatforms();
    this._buildHazards();
    this._buildOrbs();
    this._buildBeacon();
    this._buildJoao();
    this._buildCheckpoints();
    this._buildHUD();
    this._buildRockyPanel();
    this._setupCamera();
    this._setupControls();
    this._setupCollisions();

    this.cameras.main.fadeIn(600, 3, 7, 18);

    // Cinematic level title card
    this.time.delayedCall(350, () => {
      const W = this.scale.width, H = this.scale.height;
      const dpr = window.devicePixelRatio || 1;
      const card = this.add.text(W / 2, H * 0.38, 'LEVEL 1\nTHE WRECK', {
        fontSize: '28px', fontFamily: 'Georgia, serif', fontStyle: 'bold italic',
        color: '#fcd34d', align: 'center', resolution: dpr,
        stroke: '#030712', strokeThickness: 5, lineSpacing: 6,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setAlpha(0);
      this.tweens.add({ targets: card, alpha: 1, duration: 700, onComplete: () => {
        this.time.delayedCall(1600, () => this.tweens.add({ targets: card, alpha: 0, duration: 700, onComplete: () => card.destroy() }));
      }});
    });

    // Welcome message — fires shortly after level loads
    this.time.delayedCall(1800, () => {
      if (!this._welcomeDone) {
        this._welcomeDone = true;
        this._queueRocky(
          "Welcome to your exploded ship! It's in pieces...Let's make sure you aren't too - okay?",
          3800
        );
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BACKGROUND
  // ─────────────────────────────────────────────────────────────────────────
  _buildBackground() {
    const W = this.scale.width;
    const H = this.scale.height;
    const rnd = new Phaser.Math.RandomDataGenerator(['the-wreck']);
    window.sctTextures(this);

    // Sky — deep indigo overhead, warming to an amber haze near the planet below
    window.sctSky(this, 'l1-sky', [
      [0.00, '#03030c'], [0.40, '#0a0a22'], [0.72, '#1d1030'], [0.90, '#3a1a1c'], [1.00, '#51260e'],
    ], -10);

    // Faint distant nebula wash
    [[0.15, 0.25, 0x4c1d95, 0.20, 900], [0.55, 0.15, 0x3730a3, 0.16, 800], [0.9, 0.3, 0x831843, 0.12, 700]]
      .forEach(([fx, fy, tint, a, size]) => {
        this.add.image(W * fx, H * fy, 'sct-puff').setScrollFactor(0.02).setDepth(-9.5)
          .setTint(tint).setAlpha(a).setDisplaySize(size * 1.6, size).setBlendMode(Phaser.BlendModes.ADD);
      });

    // Stars — two parallax layers plus a few bright twinkling ones
    const starColors = [0xffffff, 0x93c5fd, 0xfde68a, 0xf9a8d4, 0xa78bfa];
    const stars1 = this.add.graphics().setScrollFactor(0.1).setDepth(-9);
    const stars2 = this.add.graphics().setScrollFactor(0.2).setDepth(-9);
    for (let i = 0; i < 380; i++) {
      const x = rnd.between(0, WORLD_W), y = rnd.between(0, WORLD_H);
      stars1.fillStyle(starColors[rnd.between(0, 4)], rnd.realInRange(0.2, 0.8));
      stars1.fillCircle(x, y, rnd.realInRange(0.3, 1.9));
    }
    for (let i = 0; i < 160; i++) {
      const x = rnd.between(0, WORLD_W), y = rnd.between(0, WORLD_H);
      stars2.fillStyle(starColors[rnd.between(0, 4)], rnd.realInRange(0.2, 0.7));
      stars2.fillCircle(x, y, rnd.realInRange(0.6, 2.8));
    }
    for (let i = 0; i < 14; i++) {
      const f = this.add.image(rnd.between(0, WORLD_W * 0.3), rnd.between(10, WORLD_H * 0.55), 'sct-flare')
        .setScrollFactor(0.1).setDepth(-9).setBlendMode(Phaser.BlendModes.ADD)
        .setTint(starColors[rnd.between(0, 4)]).setDisplaySize(rnd.between(18, 34), rnd.between(18, 34)).setAlpha(0.8);
      this.tweens.add({ targets: f, alpha: 0.25, duration: rnd.between(900, 2200), yoyo: true, repeat: -1, delay: rnd.between(0, 1500) });
    }

    // The warm amber planet the wreck is orbiting — rises from the bottom of the screen
    this._buildAmberPlanet(W, H);

    // Ruins of their ship — big broken sections drifting in the mid-distance
    this._buildWreckSilhouettes(W, H, rnd);

    // Drifting embers and metal dust
    this.add.particles(0, 0, 'sct-spark', {
      x: { min: 0, max: W }, y: { min: 0, max: H },
      lifespan: { min: 4000, max: 8000 },
      speedX: { min: -10, max: 10 }, speedY: { min: -14, max: 4 },
      scale: { min: 0.12, max: 0.42 },
      alpha: { start: 0.75, end: 0 },
      tint: [0xfcd34d, 0xf59e0b, 0xfde68a, 0x93c5fd],
      frequency: 140, blendMode: 'ADD',
    }).setScrollFactor(0).setDepth(-4);

    // Foreground debris silhouettes — pass in front, faster than the camera
    this._buildForegroundDebris(rnd);

    // Cinematic vignette
    window.addVignette(this, 29, 1);
  }

  _buildAmberPlanet(W, H) {
    if (!this.textures.exists('l1-planet')) {
      const S = 1024, t = this.textures.createCanvas('l1-planet', S, S), c = t.getContext();
      const cx = S / 2, cy = S / 2, r = S * 0.42;
      // Atmosphere halo
      let g = c.createRadialGradient(cx, cy, r * 0.92, cx, cy, r * 1.18);
      g.addColorStop(0, 'rgba(251,191,36,0.55)'); g.addColorStop(0.35, 'rgba(245,158,11,0.22)'); g.addColorStop(1, 'rgba(245,158,11,0)');
      c.fillStyle = g; c.fillRect(0, 0, S, S);
      c.save(); c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.clip();
      // Lit body
      g = c.createRadialGradient(cx - r * 0.3, cy - r * 0.55, r * 0.05, cx, cy, r * 1.05);
      g.addColorStop(0, '#fef3c7'); g.addColorStop(0.22, '#fbbf24'); g.addColorStop(0.55, '#d97706');
      g.addColorStop(0.82, '#92400e'); g.addColorStop(1, '#3b1404');
      c.fillStyle = g; c.fillRect(0, 0, S, S);
      // Cloud bands
      c.translate(cx, cy); c.rotate(-0.18);
      [[-0.62, 0.05, 'rgba(120,53,15,0.35)'], [-0.48, 0.03, 'rgba(254,243,199,0.18)'], [-0.3, 0.07, 'rgba(146,64,14,0.32)'],
       [-0.1, 0.04, 'rgba(253,230,138,0.20)'], [0.08, 0.08, 'rgba(120,53,15,0.30)'], [0.3, 0.05, 'rgba(254,243,199,0.14)'],
       [0.48, 0.07, 'rgba(120,53,15,0.34)'], [0.66, 0.04, 'rgba(253,230,138,0.12)']]
        .forEach(([fy, fh, col]) => { c.fillStyle = col; c.beginPath(); c.ellipse(0, fy * r, r * 1.2, fh * r, 0, 0, Math.PI * 2); c.fill(); });
      // Storm eye
      c.fillStyle = 'rgba(146,64,14,0.45)'; c.beginPath(); c.ellipse(r * 0.28, -r * 0.2, r * 0.13, r * 0.06, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = 'rgba(254,243,199,0.30)'; c.beginPath(); c.ellipse(r * 0.26, -r * 0.21, r * 0.06, r * 0.025, 0, 0, Math.PI * 2); c.fill();
      c.setTransform(1, 0, 0, 1, 0, 0);
      // Night-side shadow
      g = c.createLinearGradient(cx - r * 0.6, cy - r * 0.9, cx + r * 0.8, cy + r * 0.7);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.55, 'rgba(10,6,25,0.15)'); g.addColorStop(1, 'rgba(10,6,25,0.85)');
      c.fillStyle = g; c.fillRect(0, 0, S, S);
      c.restore();
      // Thin bright rim on the lit edge
      c.strokeStyle = 'rgba(254,243,199,0.5)'; c.lineWidth = 3;
      c.beginPath(); c.arc(cx, cy, r - 1, Math.PI * 1.05, Math.PI * 1.75); c.stroke();
      t.refresh();
    }
    const d  = Math.max(W, H * 1.6) * 1.15;
    const sf = 0.03;
    const px = W * 0.66 + (WORLD_W - W) * sf * 0.5;
    const planet = this.add.image(px, H + d * 0.18, 'l1-planet').setDisplaySize(d, d).setScrollFactor(sf, 0).setDepth(-8);
    this.tweens.add({ targets: planet, angle: 2, duration: 40000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  _buildWreckSilhouettes(W, H, rnd) {
    const HULL = 0x151a2a, HULL2 = 0x1f2638, EDGE = 0x334155, RIM = 0xf59e0b;

    // Broken hull section with a row of windows
    const hullSection = (g, len, ht, lit) => {
      const L = -len / 2, T = -ht / 2;
      const jag = [];
      for (let i = 0; i <= 6; i++) jag.push({ x: len / 2 + (i % 2 ? -14 : 6) + rnd.between(-6, 6), y: T + (ht / 6) * i });
      g.fillStyle(HULL, 1);
      g.fillPoints([{ x: L + 18, y: T }, ...jag, { x: L + 18, y: T + ht }, { x: L, y: T + ht - 18 }, { x: L, y: T + 18 }], true);
      g.fillStyle(HULL2, 1); g.fillRect(L + 10, T + 6, len - 30, ht * 0.22);
      for (let rx = L + 40; rx < len / 2 - 20; rx += 44) { g.lineStyle(2, EDGE, 0.6); g.lineBetween(rx, T + 2, rx, T + ht - 2); }
      for (let wx = L + 26; wx < len / 2 - 30; wx += 22) {
        const on = rnd.frac() < lit;
        g.fillStyle(on ? (rnd.frac() < 0.75 ? 0xfcd34d : 0x93c5fd) : 0x0a0d16, on ? 0.75 : 1);
        g.fillRoundedRect(wx, T + ht * 0.36, 10, 7, 2);
      }
      // Torn beams sticking out of the break
      g.lineStyle(3, EDGE, 0.9);
      for (let i = 0; i < 4; i++) { const y = T + 12 + i * (ht - 24) / 3; g.lineBetween(len / 2 - 8, y, len / 2 + 18 + rnd.between(0, 20), y + rnd.between(-10, 10)); }
      // Amber light from the planet below
      g.lineStyle(2.5, RIM, 0.55); g.lineBetween(L + 18, T + ht, len / 2 - 10, T + ht);
      g.lineStyle(1, 0xfde68a, 0.35); g.lineBetween(L + 2, T + ht - 18, L + 18, T + ht);
    };

    // Engine nacelle with a dying blue glow
    const nacelle = (g, len, ht) => {
      g.fillStyle(HULL, 1); g.fillRoundedRect(-len / 2, -ht / 2, len * 0.75, ht, ht * 0.4);
      g.fillStyle(HULL2, 1); g.fillPoints([{ x: len * 0.25, y: -ht * 0.42 }, { x: len / 2, y: -ht * 0.6 }, { x: len / 2, y: ht * 0.6 }, { x: len * 0.25, y: ht * 0.42 }], true);
      g.fillStyle(0x60a5fa, 0.35); g.fillEllipse(len / 2, 0, ht * 0.35, ht * 1.0);
      g.fillStyle(0xbfdbfe, 0.5); g.fillEllipse(len / 2, 0, ht * 0.15, ht * 0.6);
      g.lineStyle(2, EDGE, 0.7); for (let i = 1; i < 4; i++) g.lineBetween(-len / 2 + i * len * 0.18, -ht / 2 + 3, -len / 2 + i * len * 0.18, ht / 2 - 3);
      g.lineStyle(2.5, RIM, 0.5); g.lineBetween(-len / 2 + ht * 0.4, ht / 2, len * 0.2, ht / 2);
    };

    // Comms dish torn loose
    const dish = (g, r) => {
      g.lineStyle(4, HULL2, 1); g.lineBetween(0, 0, 0, r * 1.1);
      g.fillStyle(HULL, 1); g.slice(0, 0, r, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false); g.fillPath();
      g.lineStyle(2, EDGE, 0.8); g.strokeCircle(0, -r * 0.05, r * 0.15);
      g.lineStyle(2, RIM, 0.45); g.beginPath(); g.arc(0, 0, r, Phaser.Math.DegToRad(205), Phaser.Math.DegToRad(250)); g.strokePath();
    };

    // Truss girder
    const truss = (g, len) => {
      g.lineStyle(3, HULL2, 1); g.lineBetween(-len / 2, -10, len / 2, -10); g.lineBetween(-len / 2, 10, len / 2, 10);
      g.lineStyle(2, EDGE, 0.7);
      for (let x = -len / 2; x < len / 2 - 20; x += 20) g.lineBetween(x, -10, x + 20, 10);
      g.lineStyle(2, RIM, 0.4); g.lineBetween(-len / 2, 11, len / 2, 11);
    };

    const place = (sf, depth, x, y, rot, draw, alpha) => {
      const g = this.add.graphics().setScrollFactor(sf, 0.3).setDepth(depth).setAlpha(alpha);
      g.x = x; g.y = y; g.angle = rot; draw(g);
      this.tweens.add({ targets: g, angle: rot + rnd.realInRange(-4, 4), y: y + rnd.between(-10, 10),
        duration: rnd.between(7000, 12000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      return g;
    };

    // Far layer — smaller and dimmer
    const farSpan = W + (WORLD_W - W) * 0.12;
    for (let x = 120, i = 0; x < farSpan + 200; x += rnd.between(260, 380), i++) {
      const y = rnd.between(H * 0.06, H * 0.30), s = rnd.realInRange(0.4, 0.6);
      const kind = i % 3;
      place(0.12, -7.5, x, y, rnd.between(-30, 30), g => {
        g.setScale(s);
        if (kind === 0) hullSection(g, 240, 70, 0.2); else if (kind === 1) truss(g, 220); else nacelle(g, 160, 50);
      }, 0.4);
    }

    // Main wreck layer — the hull with the ship's name on it, engines, dish, girders
    const midSpan = W + (WORLD_W - W) * 0.25;
    const pieces = [
      [0.06, 0.20, -10, g => hullSection(g, 380, 110, 0.35), true],
      [0.26, 0.86, 16,  g => nacelle(g, 220, 70)],
      [0.40, 0.16, -28, g => dish(g, 60)],
      [0.56, 0.22, 6,   g => hullSection(g, 300, 90, 0.25)],
      [0.70, 0.88, -8,  g => truss(g, 300)],
      [0.86, 0.17, 30,  g => nacelle(g, 190, 60)],
      [1.00, 0.85, 12,  g => hullSection(g, 260, 80, 0.3)],
    ];
    pieces.forEach(([fx, fy, rot, draw, named]) => {
      const x = 160 + fx * (midSpan - 200), y = H * fy;
      const g = place(0.25, -6, x, y, rot, draw, 0.78);
      if (named) {
        const name = this.add.text(x - 120, y - 32, 'STAR CROSSED', {
          fontFamily: 'Arial, sans-serif', fontSize: '15px', fontStyle: 'bold', color: '#94a3b8',
          resolution: window.devicePixelRatio || 1,
        }).setOrigin(0, 0.5).setScrollFactor(0.25, 0.3).setDepth(-5.9).setAlpha(0.5).setAngle(rot);
        this.tweens.add({ targets: name, alpha: 0.32, duration: 2600, yoyo: true, repeat: -1 });
      }
    });
  }

  _buildForegroundDebris(rnd) {
    const sf = 1.3;
    const span = WORLD_W * sf + 400;
    const g = this.add.graphics().setScrollFactor(sf, 1).setDepth(20);
    if (this.scale.width < 600) return;   // phones: the touch controls sit here, keep it clear
    const k = 1;
    for (let x = 200; x < span; x += rnd.between(380, 620)) {
      const w = rnd.between(90, 180) * k, h = rnd.between(40, 80) * k, y = WORLD_H + rnd.between(-6, 30);
      const pts = [];
      const n = 7;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        pts.push({ x: x - w / 2 + t * w, y: y - h * Math.sin(Math.PI * t) * rnd.realInRange(0.6, 1.1) });
      }
      g.fillStyle(0x04050a, 0.96);
      g.fillPoints([{ x: x - w / 2, y: y + 60 }, ...pts, { x: x + w / 2, y: y + 60 }], true);
      g.lineStyle(1.5, 0xf59e0b, 0.35);
      g.strokePoints(pts.slice(1, -1));
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PLATFORMS
  // ─────────────────────────────────────────────────────────────────────────
  _buildPlatforms() {
    this._platforms = this.physics.add.staticGroup();

    const layout = [
      [80,   490, 180, 20],
      [270,  450, 110, 18],
      [420,  420, 100, 18],
      [560,  450, 110, 18],
      [700,  400, 100, 18],
      [840,  430, 110, 18],
      [970,  390, 100, 16],
      [1090, 420, 100, 18],
      [1220, 380, 110, 18],
      [1350, 410, 120, 18],
      [1480, 370, 100, 16],
      [1600, 400, 100, 18],
      [1730, 360, 110, 18],
      [1860, 390, 100, 18],
      [1980, 360, 100, 16],
      [2100, 390, 110, 18],
      [2220, 350, 100, 16],
      [2350, 380, 120, 18],
      [2480, 350, 100, 16],
      [2600, 380, 100, 18],
      [2720, 350, 110, 16],
      [2850, 380, 100, 18],
      [2970, 350, 100, 16],
      [3090, 380, 110, 18],
      [3190, 360, 150, 18],
    ];

    layout.forEach(([x, y, w, h], i) => {
      const g = this.add.graphics().setDepth(2);
      const L = x - w / 2, T = y - h / 2;

      // Soft amber underglow — light bouncing up from the planet below
      g.fillStyle(PALETTE.amber, 0.08); g.fillEllipse(x, y + h * 0.75, w * 0.9, h * 1.3);

      // Torn ends
      g.fillStyle(0x232a37, 1);
      g.fillTriangle(L, T + 2, L - 7, T + h * 0.45, L, T + h - 3);
      g.fillTriangle(L + w, T + 3, L + w + 6, T + h * 0.6, L + w, T + h - 2);

      // Hull plate
      g.fillStyle(0x2b3341, 1); g.fillRect(L, T, w, h);
      g.fillStyle(0x58626f, 1); g.fillRect(L, T, w, 3);              // lit top edge
      g.fillStyle(0x9aa4b2, 0.35); g.fillRect(L + 2, T, w - 4, 1);
      g.fillStyle(0x3a4352, 1); g.fillRect(L + 3, T + 4, w - 6, 4);
      g.fillStyle(0x151a24, 1); g.fillRect(L, T + h - 5, w, 5);      // shadowed underside
      g.lineStyle(1.5, PALETTE.amber, 0.6); g.lineBetween(L + 2, T + h, L + w - 2, T + h); // amber rim light

      // Panel seams + bolts
      g.lineStyle(1, 0x111827, 0.8);
      for (let sx = L + 30; sx < L + w - 12; sx += 30) g.lineBetween(sx, T + 3, sx, T + h - 5);
      g.fillStyle(0x7b8594, 0.9);
      for (let sx = L + 8; sx < L + w - 4; sx += 15) g.fillCircle(sx, T + 6, 1.4);

      // Hazard stripes on some plates
      if (i % 4 === 1) {
        const sw = Math.min(30, w * 0.3), sx0 = L + w - sw - 4;
        g.fillStyle(0xfcd34d, 0.75); g.fillRect(sx0, T + 9, sw, h - 15);
        g.fillStyle(0x111827, 0.85);
        for (let k = 0; k < sw; k += 8) g.fillPoints([{ x: sx0 + k, y: T + 9 }, { x: sx0 + k + 4, y: T + 9 }, { x: sx0 + k, y: T + h - 6 }, { x: sx0 + k - 4, y: T + h - 6 }], true);
      }

      // Scorch marks
      g.fillStyle(0x0b0d12, 0.45); g.fillEllipse(L + w * (0.25 + (i % 3) * 0.2), y + 2, w * 0.24, h * 0.5);
      g.fillStyle(0x92400e, 0.3);  g.fillEllipse(L + w * (0.27 + (i % 3) * 0.2), y + 3, w * 0.12, h * 0.25);

      // Dangling cable
      if (i % 3 === 2) {
        const c = new Phaser.Curves.CubicBezier(
          new Phaser.Math.Vector2(L + w * 0.3, T + h), new Phaser.Math.Vector2(L + w * 0.32, T + h + 26),
          new Phaser.Math.Vector2(L + w * 0.55, T + h + 34), new Phaser.Math.Vector2(L + w * 0.58, T + h + 14));
        g.lineStyle(2, 0x111827, 1); c.draw(g, 16);
        g.fillStyle(0xfcd34d, 0.9); g.fillCircle(L + w * 0.58, T + h + 14, 1.8);
      }

      // Blinking nav light
      if (i % 3 === 0) {
        const lx = L + w - 10, ly = T + 4, col = i % 2 ? 0xf87171 : 0x6ee7b7;
        const light = this.add.graphics().setDepth(2.5);
        light.fillStyle(col, 0.18); light.fillCircle(lx, ly, 7);
        light.fillStyle(col, 1);    light.fillCircle(lx, ly, 2);
        this.tweens.add({ targets: light, alpha: 0.1, duration: 600, yoyo: true, repeat: -1, hold: 500, delay: i * 130 });
      }

      const body = this.physics.add.staticImage(x, y, null).setVisible(false);
      body.setDisplaySize(w, h); body.refreshBody();
      this._platforms.add(body);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HAZARDS
  // ─────────────────────────────────────────────────────────────────────────
  _buildHazards() {
    this._hazardData = [];

    const hazards = [
      [490,  320, 32, 0.20,  'y', 55, 3200],
      [840,  310, 28, -0.22, 'y', 45, 3600],
      [1350, 300, 36, 0.18,  'x', 70, 4000],
      [1860, 290, 30, -0.20, 'y', 50, 3400],
      [2350, 300, 34, 0.18,  'x', 60, 3800],
      [2850, 300, 28, -0.22, 'y', 45, 3200],
    ];

    hazards.forEach(([x, y, size, rotSpd, axis, driftAmt, driftDur]) => {
      const g = this.add.graphics().setDepth(5);
      // Hot glow — this debris is still burning from the storm
      g.fillStyle(0xf59e0b, 0.07); g.fillCircle(0, 0, size * 1.05);
      g.fillStyle(0xf97316, 0.08); g.fillCircle(0, 0, size * 0.75);
      g.fillStyle(0x4b5563, 1); g.fillRect(-size/2, -size/2, size, size);
      g.fillStyle(0x374151, 1); g.fillTriangle(-size/2,-size/2, size/4,-size/2, -size/4,size/3);
      g.fillStyle(0x6b7280, 0.5); g.fillRect(-size/2+4, -size/2+4, size/3, 3);
      g.fillStyle(0x92400e, 0.8); g.fillCircle(size/4, size/4, size/5);
      g.fillStyle(0xfbbf24, 0.75); g.fillCircle(size/4, size/4, size/10);
      g.lineStyle(1.5, 0x9ca3af, 0.4); g.strokeRect(-size/2, -size/2, size, size);
      g.lineStyle(2, 0xf97316, 0.7); g.lineBetween(size/2, -size/2 + 4, size/2, size/2 - 4);
      g.x = x; g.y = y;

      const body = this.physics.add.image(x, y, null).setVisible(false);
      body.setDisplaySize(size * 0.75, size * 0.75);
      body.body.allowGravity = false;
      body.body.immovable = true;

      const tweenProps = axis === 'y' ? { y: `+=${driftAmt}` } : { x: `+=${driftAmt}` };
      this.tweens.add({ targets: [g, body], ...tweenProps, duration: driftDur, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

      this._hazardData.push({ g, body, rotSpd });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ORBS
  // ─────────────────────────────────────────────────────────────────────────
  _buildOrbs() {
    this._orbGroup = this.physics.add.staticGroup();

    const positions = [
      [270,400],[700,360],[1090,370],[1480,320],
      [1730,310],[2100,340],[2600,330],[2970,300],
    ];

    positions.forEach(([x, y]) => {
      const g = this.add.graphics().setDepth(4);
      g.fillStyle(PALETTE.gold,   0.06);  g.fillCircle(x, y, 28); // far glow
      g.fillStyle(PALETTE.gold,   0.12);  g.fillCircle(x, y, 22); // outer bloom
      g.fillStyle(PALETTE.indigo, 0.18);  g.fillCircle(x, y, 16); // mid bloom
      g.fillStyle(PALETTE.gold,   0.92);  g.fillCircle(x, y, 9);  // core
      g.fillStyle(0xffffff,       0.75);  g.fillCircle(x-3, y-3, 4); // highlight
      g.fillStyle(0xffffff,       0.38);  g.fillCircle(x+2,  y+2, 2); // secondary
      this.tweens.add({ targets: g, alpha: 0.32, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

      const body = this.physics.add.staticImage(x, y, null).setVisible(false);
      body.setDisplaySize(26, 26); body.refreshBody();
      body.orbGraphic = g;
      this._orbGroup.add(body);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BEACON
  // ─────────────────────────────────────────────────────────────────────────
  _buildBeacon() {
    const x = 3190, y = 330;
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(PALETTE.indigo, 0.8);  g.fillRect(x-8, y+10, 16, 60);
    g.fillStyle(PALETTE.blue,   0.4);  g.fillRect(x-4, y+10,  8, 60);
    g.fillStyle(PALETTE.indigo, 0.07); g.fillRect(x-22, y-220, 44, 230);
    g.fillStyle(PALETTE.blue,   0.05); g.fillRect(x-11, y-220, 22, 230);
    g.lineStyle(2, PALETTE.gold, 0.9); g.strokeCircle(x, y, 20);
    g.fillStyle(PALETTE.gold, 0.9);    g.fillCircle(x, y, 6);
    this.tweens.add({ targets: g, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });

    // Rescue-beacon glow + expanding signal ring
    const halo = this.add.image(x, y, 'sct-glow').setDepth(2.8).setBlendMode(Phaser.BlendModes.ADD)
      .setTint(PALETTE.gold).setDisplaySize(150, 150).setAlpha(0.55);
    this.tweens.add({ targets: halo, alpha: 0.25, scale: halo.scale * 0.85, duration: 800, yoyo: true, repeat: -1 });
    const ring = this.add.graphics().setDepth(2.9);
    ring.lineStyle(2, PALETTE.gold, 0.8); ring.strokeCircle(0, 0, 20);
    ring.x = x; ring.y = y;
    this.tweens.add({ targets: ring, scale: 4, alpha: 0, duration: 1800, repeat: -1, ease: 'Cubic.easeOut' });

    this._beacon = this.physics.add.staticImage(x, y, null).setVisible(false);
    this._beacon.setDisplaySize(44, 90); this._beacon.refreshBody();
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
    const W=PALETTE.white, B=PALETTE.gray, V=PALETTE.amber, P=PALETTE.indigo;
    g.fillStyle(B,1); g.fillRoundedRect(cx-6*s,cy-14*s,12*s,24*s,3*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx-18*s,cy-18*s,36*s,34*s,6*s);
    g.lineStyle(2*s,B,1); g.strokeRoundedRect(cx-18*s,cy-18*s,36*s,34*s,6*s);
    g.fillStyle(P,1); g.fillRoundedRect(cx-8*s,cy-12*s,16*s,12*s,2*s);
    g.fillStyle(PALETTE.gold,1); g.fillCircle(cx-3*s,cy-7*s,2*s);
    g.fillStyle(0xf87171,1);     g.fillCircle(cx+3*s,cy-7*s,2*s);
    g.fillStyle(PALETTE.green,1);g.fillCircle(cx,    cy-7*s,2*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx-28*s,cy-16*s,12*s,28*s,4*s);
    g.lineStyle(2*s,B,1); g.strokeRoundedRect(cx-28*s,cy-16*s,12*s,28*s,4*s);
    g.fillStyle(P,1); g.fillEllipse(cx-22*s,cy+14*s,14*s,10*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx+16*s,cy-16*s,12*s,28*s,4*s);
    g.lineStyle(2*s,B,1); g.strokeRoundedRect(cx+16*s,cy-16*s,12*s,28*s,4*s);
    g.fillStyle(P,1); g.fillEllipse(cx+22*s,cy+14*s,14*s,10*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx-16*s,cy+16*s,12*s,24*s,3*s);
    g.lineStyle(2*s,B,1); g.strokeRoundedRect(cx-16*s,cy+16*s,12*s,24*s,3*s);
    g.fillStyle(P,1); g.fillRoundedRect(cx-19*s,cy+38*s,18*s,8*s,3*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx+4*s,cy+16*s,12*s,24*s,3*s);
    g.lineStyle(2*s,B,1); g.strokeRoundedRect(cx+4*s,cy+16*s,12*s,24*s,3*s);
    g.fillStyle(P,1); g.fillRoundedRect(cx+1*s,cy+38*s,18*s,8*s,3*s);
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

    [[560,430],[1090,400],[1600,380],[2100,370],[2720,330]].forEach(([x,y]) => {
      const g = this.add.graphics().setDepth(3);
      g.lineStyle(2, PALETTE.indigo, 0.7); g.strokeRect(x-4, y-22, 8, 22);
      g.fillStyle(PALETTE.indigo, 0.5);    g.fillTriangle(x,y-30, x+12,y-20, x-12,y-20);

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
    const W = this.scale.width;

    const dpr = window.devicePixelRatio || 1;

    this._orbCountText = this.add.text(16, 16, 'Orbs: 0 / 8', {
      fontSize: '15px', fontFamily: 'Arial, sans-serif', color: '#fcd34d',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setScrollFactor(0).setDepth(30);

    this._levelLabel = this.add.text(W / 2, W < 600 ? 40 : 16, 'LEVEL 1 — THE WRECK', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#93c5fd',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(30);

    this._deathText = this.add.text(W-16, 16, '', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#f9a8d4',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(30);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ROCKY PANEL — queue-driven, word-by-word
  // ─────────────────────────────────────────────────────────────────────────
  _buildRockyPanel() {
    const ww = Math.min(this.scale.width - 28, 700);
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

  // ── Enqueue a Rocky message
  _queueRocky(text, holdMs) {
    this._rockyQueue.push({ text, holdMs: holdMs || 5500 });
    if (!this._rockyBusy) this._processRockyQueue();
  }

  // ── Drain the queue one message at a time
  _processRockyQueue() {
    if (this._rockyBusy || this._rockyQueue.length === 0) return;
    this._rockyBusy = true;
    const { text, holdMs } = this._rockyQueue.shift();
    this._showRocky(text, holdMs, () => {
      this._rockyBusy = false;
      this._processRockyQueue();
    });
  }

  // ── Draw the panel, type text word-by-word, then dismiss after holdMs
  _showRocky(text, holdMs, onComplete) {
    const W = this.scale.width;
    const H = this.scale.height;
    const isMobile = W < 600;
    const dpr = window.devicePixelRatio || 1;
    const bodyFont = isMobile ? '15px' : '18px';
    const inset = isMobile ? 72 : 110;
    const panelW = Math.min(700, W - 28);
    const panelX = 14;
    // Measure text height before drawing so panel always fits content
    const probe = this.add.text(-9999, -9999, text, {
      fontSize: bodyFont, fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold', resolution: dpr,
      wordWrap: { width: panelW - inset }, lineSpacing: 6,
    }).setScrollFactor(0).setVisible(false);
    const panelH = Math.max(isMobile ? 84 : 118, 14 + 20 + 6 + probe.height + 16);
    probe.destroy();
    const mcBottom = (window.mobileControls ? window.mobileControls.reservedBottom : 0);
    const panelY = H - panelH - 14 - mcBottom;

    // Draw panel background + Rocky avatar
    this._rockyPanel.clear();
    this._rockyPanel.fillStyle(0x0f172a, 0.95);
    this._rockyPanel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(2.5, PALETTE.indigo, 0.9);
    this._rockyPanel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(1, PALETTE.gold, 0.35);
    this._rockyPanel.strokeRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 10);

    // Avatar — stone oval body
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

    // Text positions
    const tx = panelX + (isMobile ? 66 : 104);
    this._rockyBodyText.setFontSize(bodyFont).setWordWrapWidth(panelW - inset).setResolution(dpr);
    this._rockyNameText.setResolution(dpr);
    this._rockyNameText.setText('Rocky:').setPosition(tx, panelY + 14).setAlpha(0);
    this._rockyBodyText.setText('').setPosition(tx, panelY + 36).setAlpha(0);
    this._rockyPanel.setAlpha(0);

    // Fade everything in
    this.tweens.add({
      targets: [this._rockyPanel, this._rockyNameText, this._rockyBodyText],
      alpha: 1, duration: 280,
      onComplete: () => {
        // Type the text word by word
        this._typeRockyText(text, 90, () => {
          // Hold, then fade out
          this.time.delayedCall(holdMs, () => {
            this.tweens.add({
              targets: [this._rockyPanel, this._rockyNameText, this._rockyBodyText],
              alpha: 0, duration: 380,
              onComplete: () => {
                if (onComplete) onComplete();
              },
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
  // CAMERA & CONTROLS
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
    this._wasInAir   = false; // for first-jump-landed detection

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

      // First orb collected
      if (this._orbs === 1 && !this._firstOrbDone) {
        this._firstOrbDone = true;
        this.time.delayedCall(300, () => {
          this._queueRocky(
            "Glowing orb looks like a tiny moon - that's what Elina would say. So many cute Space things!",
            3500
          );
        });
      }
    });

    // Checkpoints
    this.physics.add.overlap(this.joao, this._checkpointGroup, (joao, cp) => {
      if (cp.cpX > this._checkpointX) {
        this._checkpointX = cp.cpX;
        this._checkpointY = cp.cpY;
      }
    });

    // Beacon
    this.physics.add.overlap(this.joao, this._beacon, () => {
      if (!this._levelComplete) this._completeLevel();
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

    this.cameras.main.flash(180, 255, 80, 0);
    this.time.delayedCall(180, () => this.cameras.main.flash(160, 180, 20, 20));

    // Rocky death commentary — queued so it stacks properly with debris comments
    if (this._deathCount === 1 && !this._firstDeathDone) {
      this._firstDeathDone = true;
      this.time.delayedCall(600, () => {
        this._queueRocky("Humans... I swear you have the survival instincts of a space potato.", 3800);
      });
    }

    // Respawn
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
      "Ship wreck survived! Nice one, space potato!",
      5000
    );

    this.time.delayedCall(4700, () => {
      this.cameras.main.fadeOut(800, 3, 7, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Level2'));
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

    // ── Horizontal movement
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
      joao.setVelocityY(-640);
      this._coyoteTime = 0;
      this._wasInAir = true;
    }

    // ── First successful jump — track landing (no Rocky message here)
    if (this._wasInAir && onGround && !this._hasJumped) {
      this._hasJumped = true;
      this._wasInAir  = false;
    } else if (onGround) {
      this._wasInAir = false;
    }

    // ── Position-based Rocky triggers (spread across the level)
    if (!this._dudeJokeDone && joao.x > 1600) {
      this._dudeJokeDone = true;
      this._queueRocky("I heard your human calls you 'Dude'. What is a 'dude'? Is it a type of space potato?", 4500);
    }
    if (!this._starfishDone && joao.x > 2700) {
      this._starfishDone = true;
      this._queueRocky("See? Not hard. Though you looked like a confused starfish doing it. Elina would have laughed. Then hugged you anyway.", 4500);
    }

    // ── Hazard rotation + collision
    const invincible = time < this._invincibleUntil;

    this._hazardData.forEach(({ g, body, rotSpd }) => {
      g.angle += rotSpd;
      body.x = g.x; body.y = g.y; body.refreshBody();

      if (!invincible && Phaser.Geom.Intersects.RectangleToRectangle(
        joao.getBounds(), body.getBounds()
      )) {
        // First debris hit — comment before death triggers
        if (!this._firstDebrisHit) {
          this._firstDebrisHit = true;
          this._queueRocky(
            "Debris chunk – rotating at 3.2 degrees per second. You could've calculated that. Or just... moved.",
            3500
          );
        } else if (this._deathCount >= 2) {
          // Subsequent debris deaths — timing joke (only once)
          if (!this._timingJokeDone) {
            this._timingJokeDone = true;
            this._queueRocky(
              "Timing is everything, Joao. On Erid, we'd use our tentacles to sense movement – you just have to... look where you're going.",
              4000
            );
          }
        }
        this._killJoao();
      }
    });

    // ── Fall off world
    if (joao.y > WORLD_H + 80) {
      this._killJoao();
    }
  }
}
