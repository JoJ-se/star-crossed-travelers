// ── Level 2 — The Nebula ─────────────────────────────────────────────────────
// Dense colorful gas cloud — pinks, purples, blues.

const L2_PAL = {
  gold:   0xfcd34d,
  indigo: 0x6366f1,
  violet: 0x7c3aed,
  purple: 0xa855f7,
  blue:   0x93c5fd,
  pink:   0xf9a8d4,
  green:  0x6ee7b7,
  white:  0xe8edf5,
  gray:   0xbdc6d4,
  dark:   0x030712,
  hull:   0x3b2d6e,
  hullHi: 0x5b3d9e,
};

const L2_W = 4000;
const L2_H = 700;

class Level2 extends Phaser.Scene {
  constructor() {
    super({ key: 'Level2' });
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

    // Rocky flags
    this._welcomeDone       = false;
    this._firstBeaconDone   = false;
    this._zapDeathDone      = false;
    this._firstCurrentDone  = false;
    this._midJoke1Done      = false;
    this._midJoke2Done      = false;
    this._finalApproachDone = false;
    this._firstOrbDone      = false;

    // Rocky queue
    this._rockyQueue = [];
    this._rockyBusy  = false;

    this.physics.world.setBounds(0, 0, L2_W, L2_H);
    this.cameras.main.setBounds(0, 0, L2_W, L2_H);

    this._buildBackground();
    this._buildPlatforms();
    this._buildBeacons();
    this._buildCurrentZones();
    this._buildDischarges();
    this._buildOrbs();
    this._buildExitBeacon();
    this._buildJoao();
    this._buildCheckpoints();
    this._buildHUD();
    this._buildRockyPanel();
    this._setupCamera();
    this._setupControls();
    this._setupCollisions();

    this.cameras.main.fadeIn(600, 3, 7, 18);

    this.time.delayedCall(350, () => {
      const W = this.scale.width, H = this.scale.height, dpr = window.devicePixelRatio || 1;
      const card = this.add.text(W / 2, H * 0.38, 'LEVEL 2\nTHE NEBULA', {
        fontSize: '28px', fontFamily: 'Georgia, serif', fontStyle: 'bold italic',
        color: '#a78bfa', align: 'center', resolution: dpr,
        stroke: '#08061a', strokeThickness: 5, lineSpacing: 6,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(50).setAlpha(0);
      this.tweens.add({ targets: card, alpha: 1, duration: 700, onComplete: () => {
        this.time.delayedCall(1600, () => this.tweens.add({ targets: card, alpha: 0, duration: 700, onComplete: () => card.destroy() }));
      }});
    });

    this.time.delayedCall(1800, () => {
      if (!this._welcomeDone) {
        this._welcomeDone = true;
        this._queueRocky("This place is beautiful. Reminds me of a place where Elina used to live... you know..Before her ship crashed on Earth.", 4200);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BACKGROUND — 3 parallax cloud layers + light motes
  // ─────────────────────────────────────────────────────────────────────────
  _buildBackground() {
    const W = this.scale.width;
    const H = this.scale.height;
    const rnd = new Phaser.Math.RandomDataGenerator(['the-nebula']);
    const ADD = Phaser.BlendModes.ADD;
    window.sctTextures(this);

    // Sky — deep violet that warms to magenta near the bottom
    window.sctSky(this, 'l2-sky', [
      [0.00, '#06041a'], [0.35, '#120a35'], [0.70, '#230c45'], [1.00, '#3a0f45'],
    ], -10);

    // Span a parallax layer needs to cover the whole level
    const span = sf => W + (L2_W - W) * sf + 300;
    const puff = (sf, depth, x, y, w, h, tint, alpha, blend = ADD, key = 'sct-puff') =>
      this.add.image(x, y, key).setScrollFactor(sf, 0.25).setDepth(depth)
        .setTint(tint).setAlpha(alpha).setDisplaySize(w, h).setBlendMode(blend);

    // Distant stars, some with soft flares
    const starColors = [0xffffff, 0xf9a8d4, 0x93c5fd, 0xe0e7ff, 0xfcd34d];
    const stars = this.add.graphics().setScrollFactor(0.04, 0.2).setDepth(-9.6);
    for (let i = 0; i < 260; i++) {
      stars.fillStyle(starColors[i % 5], rnd.realInRange(0.15, 0.7));
      stars.fillCircle(rnd.between(-100, span(0.04)), rnd.between(-50, H + 50), rnd.realInRange(0.3, 1.6));
    }

    // Layer 1 — vast gas clouds (the nebula itself)
    const big = [0x6d28d9, 0x3730a3, 0xbe185d, 0x1d4ed8, 0x7e22ce, 0xdb2777];
    for (let x = -200, i = 0; x < span(0.04); x += rnd.between(380, 560), i++) {
      const y = i % 2 ? rnd.between(H * 0.0, H * 0.35) : rnd.between(H * 0.6, H * 1.0);
      puff(0.04, -9.4, x, y, rnd.between(800, 1150), rnd.between(500, 700), big[i % big.length], rnd.realInRange(0.38, 0.5))
        .setAngle(rnd.between(-20, 20));
    }

    // Dark dust lanes cutting through the glow — gives the clouds shape
    for (let x = 0; x < span(0.06); x += rnd.between(380, 560)) {
      puff(0.06, -9.2, x, rnd.between(H * 0.1, H * 0.9), rnd.between(650, 1000), rnd.between(160, 280),
        0x030109, rnd.realInRange(0.75, 0.95), Phaser.BlendModes.NORMAL).setAngle(rnd.between(-25, 25));
    }

    // Bright stars embedded in the gas, twinkling
    for (let i = 0; i < 22; i++) {
      const f = puff(0.07, -9.0, rnd.between(0, span(0.07)), rnd.between(H * 0.05, H * 0.9),
        1, 1, starColors[i % 5], 0.9, ADD, 'sct-flare');
      const sz = rnd.between(16, 40); f.setDisplaySize(sz, sz);
      this.tweens.add({ targets: f, alpha: 0.3, duration: rnd.between(900, 2400), yoyo: true, repeat: -1, delay: rnd.between(0, 2000) });
      puff(0.07, -9.05, f.x, f.y, sz * 3, sz * 3, starColors[i % 5], 0.25, ADD, 'sct-glow');
    }

    // Layer 2 — luminous cores: pink, violet, cyan, breathing slowly
    const mid = [0xec4899, 0xa855f7, 0x22d3ee, 0xf472b6, 0x8b5cf6, 0x60a5fa];
    for (let x = 0, i = 0; x < span(0.12); x += rnd.between(300, 460), i++) {
      const cx = x, cy = i % 2 ? rnd.between(H * 0.08, H * 0.4) : rnd.between(H * 0.6, H * 0.92);
      const tint = mid[i % mid.length];
      for (let k = 0; k < 3; k++) {
        const p = puff(0.12, -8.6, cx + rnd.between(-120, 120), cy + rnd.between(-60, 60),
          rnd.between(260, 440), rnd.between(160, 300), k === 2 ? mid[(i + 2) % mid.length] : tint,
          rnd.realInRange(0.28, 0.42), ADD, k === 0 ? 'sct-glow' : 'sct-puff').setAngle(rnd.between(-30, 30));
        this.tweens.add({ targets: p, alpha: p.alpha * 0.6, scaleX: p.scaleX * 1.08, scaleY: p.scaleY * 1.08,
          duration: rnd.between(3000, 6000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: rnd.between(0, 3000) });
      }
    }

    // Layer 3 — closer wisps, long and thin
    const wisp = [0xf9a8d4, 0xc4b5fd, 0x93c5fd];
    for (let x = 0, i = 0; x < span(0.25); x += rnd.between(200, 320), i++) {
      puff(0.25, -7, x, rnd.between(H * 0.15, H * 0.95), rnd.between(380, 620), rnd.between(60, 110),
        wisp[i % 3], rnd.realInRange(0.16, 0.26)).setAngle(rnd.between(-12, 12));
    }

    // Drifting light motes
    this.add.particles(0, 0, 'sct-spark', {
      x: { min: 0, max: W }, y: { min: 0, max: H },
      lifespan: { min: 5000, max: 9000 },
      speedX: { min: -12, max: 12 }, speedY: { min: -10, max: 6 },
      scale: { min: 0.12, max: 0.5 },
      alpha: { start: 0.8, end: 0 },
      tint: [0xf9a8d4, 0xa78bfa, 0x93c5fd, 0xe0e7ff, 0xfcd34d],
      frequency: 110, blendMode: 'ADD',
    }).setScrollFactor(0).setDepth(-5);

    // Foreground wisps drifting past in front of everything
    for (let x = 300, i = 0; x < L2_W * 1.35 + 600; x += rnd.between(500, 800), i++) {
      const p = this.add.image(x, rnd.between(80, L2_H - 60), 'sct-puff').setScrollFactor(1.35, 1).setDepth(20)
        .setTint(wisp[i % 3]).setAlpha(rnd.realInRange(0.07, 0.11)).setBlendMode(ADD)
        .setDisplaySize(rnd.between(420, 640), rnd.between(80, 140));
      this.tweens.add({ targets: p, x: p.x + rnd.between(40, 90), duration: rnd.between(6000, 10000), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Cinematic vignette
    window.addVignette(this, 29, 1);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PLATFORMS — 14 solid + 8 hidden (revealed by beacons)
  // ─────────────────────────────────────────────────────────────────────────
  _buildPlatforms() {
    this._platforms       = this.physics.add.staticGroup();
    this._hiddenPlatforms = [];   // { g, body }

    // Solid platforms — purple-tinted nebula hull
    [
      [80,   490, 200, 20],  // start — wide
      [380,  460, 110, 18],
      [650,  420, 110, 18],
      [1000, 400, 120, 18],
      [1320, 370, 120, 18],
      [1560, 395, 110, 18],
      [1880, 370, 120, 18],
      [2120, 395, 110, 18],
      [2460, 370, 120, 18],
      [2700, 395, 110, 18],
      [3150, 370, 120, 18],
      [3880, 360, 260, 20],  // final — wide
    ].forEach(([x, y, w, h]) => {
      this._drawNebulaPlatform(x, y, w, h, false);
    });

    // Hidden platforms — start invisible, fade in when beacon activated
    [
      [820,  375, 90, 16],   // near beacon on s3 [650]
      [1145, 345, 90, 16],   // near beacon on s4 [1000]
      [1710, 340, 90, 16],   // near beacon on s6 [1560]
      [2280, 348, 90, 16],   // near beacon on s8 [2120]
      [2858, 340, 90, 16],   // near beacon on s10 [2700]
      [2998, 350, 90, 16],   // near beacon on s10 [2700]
      [3320, 345, 90, 16],   // near beacon on s11 [3150]
      [3460, 355, 90, 16],   // near beacon on s11 [3150]
    ].forEach(([x, y, w, h]) => {
      const { g, body } = this._drawNebulaPlatform(x, y, w, h, true);
      this._hiddenPlatforms.push({ g, body, x });
    });
  }

  _drawNebulaPlatform(x, y, w, h, isHidden) {
    const a = isHidden ? 0 : 1;
    const g = this.add.graphics().setDepth(2).setAlpha(a);
    const L = x - w / 2, T = y - h / 2;

    // Soft glow pooled beneath the platform
    g.fillStyle(L2_PAL.purple, 0.10); g.fillEllipse(x, y + h * 0.9, w * 1.2, h * 2.6);
    g.fillStyle(L2_PAL.pink,   0.08); g.fillEllipse(x, y + h * 0.7, w * 0.8, h * 1.6);

    // Crystal shards hanging underneath
    const n = Math.max(3, Math.round(w / 26));
    for (let i = 0; i < n; i++) {
      const sx = L + 8 + (i + 0.5) * ((w - 16) / n);
      const len = 8 + ((i * 7 + Math.round(x)) % 5) * 4;
      g.fillStyle(0x4c1d95, 0.95); g.fillTriangle(sx - 6, T + h - 1, sx + 6, T + h - 1, sx + 1, T + h + len);
      g.fillStyle(0xc4b5fd, 0.35); g.fillTriangle(sx - 1, T + h - 1, sx + 5, T + h - 1, sx + 1, T + h + len);
    }

    // Body — layered violet crystal
    g.fillStyle(0x24164f, 1); g.fillRoundedRect(L, T, w, h, 4);
    g.fillStyle(0x3b2584, 1); g.fillRoundedRect(L + 2, T + 2, w - 4, h * 0.55, 3);
    g.fillStyle(0x160c33, 1); g.fillRect(L + 3, T + h - 4, w - 6, 3);

    // Facets
    g.lineStyle(1, 0xa78bfa, 0.3);
    for (let fx = L + 14; fx < L + w - 10; fx += 22) g.lineBetween(fx, T + 3, fx + 8, T + h - 3);

    // Glowing top edge
    g.lineStyle(4, L2_PAL.violet, 0.35); g.lineBetween(L + 3, T + 1, L + w - 3, T + 1);
    g.lineStyle(1.5, 0xf5d0fe, 0.9);     g.lineBetween(L + 4, T + 1, L + w - 4, T + 1);
    g.lineStyle(1, L2_PAL.pink, 0.45);   g.strokeRoundedRect(L, T, w, h, 4);

    // Diamond end caps
    [L, L + w].forEach(ex => {
      g.fillStyle(0xe9d5ff, 0.85);
      g.fillPoints([{ x: ex, y: y - 5 }, { x: ex + 4, y }, { x: ex, y: y + 5 }, { x: ex - 4, y }], true);
    });

    const body = this.physics.add.staticImage(x, y, null).setVisible(false);
    body.setDisplaySize(w, h); body.refreshBody();

    if (!isHidden) {
      this._platforms.add(body);
    }

    return { g, body };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LIGHT BEACONS — 6 pillars; stepping near one reveals hidden platforms
  // ─────────────────────────────────────────────────────────────────────────
  _buildBeacons() {
    this._beaconBodies = [];   // physics bodies for overlap detection

    // Each beacon: [x, y on platform surface]
    const defs = [
      [650,  400],   // on s3 → reveals h0 [820]
      [1000, 380],   // on s4 → reveals h1 [1145]
      [1560, 375],   // on s6 → reveals h2 [1710]
      [2120, 375],   // on s8 → reveals h3 [2280]
      [2700, 375],   // on s10 → reveals h4 [2858] + h5 [2998]
      [3150, 350],   // on s11 → reveals h6 [3320] + h7 [3460]
    ];

    defs.forEach(([bx, by], i) => {
      const g = this.add.graphics().setDepth(3);

      // Pillar
      g.fillStyle(L2_PAL.indigo, 0.85);
      g.fillRect(bx - 6, by - 42, 12, 42);
      g.fillStyle(L2_PAL.violet, 0.45);
      g.fillRect(bx - 3, by - 42, 6, 42);

      // Upward glow beam
      g.fillStyle(L2_PAL.blue, 0.04);
      g.fillRect(bx - 20, by - 260, 40, 220);

      // Gem
      g.lineStyle(2, L2_PAL.gold, 0.9);
      g.strokeCircle(bx, by - 52, 18);
      g.fillStyle(L2_PAL.blue, 0.85);
      g.fillCircle(bx, by - 52, 10);
      g.fillStyle(0xffffff, 0.75);
      g.fillCircle(bx - 3, by - 56, 4);

      this.tweens.add({
        targets: g,
        alpha: 0.45,
        duration: 700 + i * 90,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      const body = this.physics.add.staticImage(bx, by - 52, null).setVisible(false);
      body.setDisplaySize(44, 80); body.refreshBody();
      body._activated = false;
      body._beaconGraphic = g;

      this._beaconBodies.push(body);
    });
  }

  _activateBeacon(body) {
    if (body._activated) return;
    body._activated = true;

    // Flash the gem bright
    this.tweens.killTweensOf(body._beaconGraphic);
    body._beaconGraphic.setAlpha(1);
    body._beaconGraphic.clear();
    const bx = body.x;
    const by = body.y + 52;   // back to platform surface y
    body._beaconGraphic.fillStyle(0xffffff, 0.9);
    body._beaconGraphic.fillCircle(bx, by - 52, 14);
    body._beaconGraphic.fillStyle(L2_PAL.gold, 1);
    body._beaconGraphic.fillCircle(bx, by - 52, 8);

    // Reveal hidden platforms within 320px
    const RADIUS = 320;
    this._hiddenPlatforms.forEach(({ g, body: pb, x: px }) => {
      if (pb._revealed) return;
      if (Math.abs(px - bx) <= RADIUS) {
        pb._revealed = true;
        this._platforms.add(pb);
        pb.refreshBody();
        this.tweens.add({ targets: g, alpha: 1, duration: 600, ease: 'Sine.easeOut' });
      }
    });

    if (!this._firstBeaconDone) {
      this._firstBeaconDone = true;
      this.time.delayedCall(200, () => {
        this._queueRocky("Light it up. Smart. Perfectionista.", 4000);
      });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NEBULA CURRENT ZONES — 4 invisible push zones
  // ─────────────────────────────────────────────────────────────────────────
  _buildCurrentZones() {
    this._currentZones = [];   // { rect (Phaser.Geom.Rectangle), pushX }

    [
      // [cx, cy, w, h, pushX]
      [505,  320, 130, 280,  85],
      [1230, 310, 120, 260, -85],
      [2360, 320, 130, 280,  85],
      [3580, 310, 120, 260, -85],
    ].forEach(([cx, cy, w, h, pushX]) => {
      // Flowing current: a soft column of light with streaks racing through it
      const col = pushX > 0 ? 0x93c5fd : 0xf9a8d4;
      const dir = pushX > 0 ? 1 : -1;
      const glow = this.add.image(cx, cy + h / 2, 'sct-puff').setDepth(1).setTint(col)
        .setBlendMode(Phaser.BlendModes.ADD).setDisplaySize(w * 1.6, h * 1.15).setAlpha(0.35);
      this.tweens.add({ targets: glow, alpha: 0.18, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

      this.add.particles(0, 0, 'sct-spark', {
        x: { min: cx - dir * w / 2 - 4, max: cx - dir * w / 2 + 4 },
        y: { min: cy + 10, max: cy + h - 10 },
        speedX: { min: 150 * dir, max: 230 * dir }, speedY: { min: -8, max: 8 },
        lifespan: { min: (w / 230) * 1000, max: (w / 150) * 1000 },
        scaleX: { min: 1.2, max: 2.4 }, scaleY: { min: 0.12, max: 0.22 },
        alpha: { start: 0.9, end: 0 }, tint: [col, 0xffffff],
        frequency: 70, blendMode: 'ADD',
      }).setDepth(1.5);

      // Faint arrow hints (gameplay readability)
      const g = this.add.graphics().setDepth(1);
      g.lineStyle(1.5, col, 0.35);
      for (let ay = cy + 50; ay < cy + h - 50; ay += 60) {
        g.lineBetween(cx - dir * 12, ay, cx + dir * 14, ay);
        g.lineBetween(cx + dir * 14, ay, cx + dir * 6, ay - 7);
        g.lineBetween(cx + dir * 14, ay, cx + dir * 6, ay + 7);
      }
      this.tweens.add({
        targets: g,
        alpha: 0.38,
        duration: 1300,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      const rect = new Phaser.Geom.Rectangle(cx - w/2, cy, w, h);
      this._currentZones.push({ rect, pushX });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ELECTRICAL DISCHARGES — 5 vertical arcs that flicker ON/OFF
  // ─────────────────────────────────────────────────────────────────────────
  _buildDischarges() {
    this._discharges = [];    // { g, body, y1, y2, isOn }

    [
      [525,  240, 470],
      [1170, 225, 455],
      [1660, 238, 462],
      [2198, 225, 455],
      [3650, 238, 462],
    ].forEach(([x, y1, y2], i) => {
      const midY = (y1 + y2) / 2;
      const len  = y2 - y1;
      const entry = { g: null, body: null, x, y1, y2, isOn: false };

      const g = this.add.graphics().setDepth(6).setAlpha(0);
      entry.g = g;

      const body = this.physics.add.staticImage(x, midY, null).setVisible(false);
      body.setDisplaySize(30, len);
      body.refreshBody();
      body.setActive(false);
      entry.body = body;

      const redraw = () => {
        g.clear();
        const segs = 9;
        const segH = len / segs;

        // Outer glow
        g.lineStyle(7, 0x6366f1, 0.18);
        g.beginPath(); g.moveTo(x, y1);
        for (let s = 1; s <= segs; s++) {
          g.lineTo(x + Phaser.Math.Between(-24, 24), y1 + s * segH);
        }
        g.strokePath();

        // Mid glow
        g.lineStyle(3.5, 0x93c5fd, 0.55);
        g.beginPath(); g.moveTo(x, y1);
        for (let s = 1; s <= segs; s++) {
          g.lineTo(x + Phaser.Math.Between(-16, 16), y1 + s * segH);
        }
        g.strokePath();

        // Core white
        g.lineStyle(1.5, 0xffffff, 0.92);
        g.beginPath(); g.moveTo(x, y1);
        for (let s = 1; s <= segs; s++) {
          g.lineTo(x + Phaser.Math.Between(-10, 10), y1 + s * segH);
        }
        g.strokePath();

        // End nodes
        g.fillStyle(0xffffff, 0.7); g.fillCircle(x, y1, 4); g.fillCircle(x, y2, 4);
      };

      let flickerEvent = null;

      const toggle = () => {
        entry.isOn = !entry.isOn;
        if (entry.isOn) {
          redraw();
          g.setAlpha(1);
          body.setActive(true);
          flickerEvent = this.time.addEvent({ delay: 80, callback: redraw, loop: true });
          this.time.delayedCall(1200, toggle);
        } else {
          if (flickerEvent) { flickerEvent.remove(false); flickerEvent = null; }
          g.setAlpha(0);
          body.setActive(false);
          this.time.delayedCall(800, toggle);
        }
      };

      this.time.delayedCall(i * 380, toggle);
      this._discharges.push(entry);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ORBS
  // ─────────────────────────────────────────────────────────────────────────
  _buildOrbs() {
    this._orbGroup = this.physics.add.staticGroup();

    [
      [380,  422],
      [820,  338],
      [1145, 308],
      [1560, 356],
      [1880, 330],
      [2460, 330],
      [2998, 312],
      [3150, 330],
    ].forEach(([x, y]) => {
      const g = this.add.graphics().setDepth(4);
      g.fillStyle(L2_PAL.pink,   0.07);  g.fillCircle(x, y, 28); // far glow
      g.fillStyle(L2_PAL.pink,   0.14);  g.fillCircle(x, y, 22); // outer bloom
      g.fillStyle(L2_PAL.violet, 0.20);  g.fillCircle(x, y, 16); // mid bloom
      g.fillStyle(L2_PAL.gold,   0.92);  g.fillCircle(x, y,  9); // core
      g.fillStyle(0xffffff,      0.75);  g.fillCircle(x-3, y-3,  4); // highlight
      g.fillStyle(0xffffff,      0.38);  g.fillCircle(x+2,  y+2, 2); // secondary
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
  // EXIT BEACON
  // ─────────────────────────────────────────────────────────────────────────
  _buildExitBeacon() {
    const x = 3880, y = 330;
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(L2_PAL.indigo, 0.8);  g.fillRect(x-8, y+10, 16, 60);
    g.fillStyle(L2_PAL.violet, 0.42); g.fillRect(x-4, y+10,  8, 60);
    g.fillStyle(L2_PAL.blue,   0.05); g.fillRect(x-22, y-220, 44, 230);
    g.lineStyle(2, L2_PAL.gold, 0.9); g.strokeCircle(x, y, 20);
    g.fillStyle(L2_PAL.gold,   0.9);  g.fillCircle(x, y, 6);
    this.tweens.add({ targets: g, alpha: 0.5, duration: 800, yoyo: true, repeat: -1 });

    this._exitBeacon = this.physics.add.staticImage(x, y, null).setVisible(false);
    this._exitBeacon.setDisplaySize(44, 90); this._exitBeacon.refreshBody();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // JOAO — reuse 'joao' texture if Level1 already created it
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
    g.fillStyle(B,1); g.fillRoundedRect(cx-6*s, cy-14*s, 12*s, 24*s, 3*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx-18*s, cy-18*s, 36*s, 34*s, 6*s);
    g.lineStyle(2*s, B, 1); g.strokeRoundedRect(cx-18*s, cy-18*s, 36*s, 34*s, 6*s);
    g.fillStyle(P,1); g.fillRoundedRect(cx-8*s, cy-12*s, 16*s, 12*s, 2*s);
    g.fillStyle(0xfcd34d, 1); g.fillCircle(cx-3*s, cy-7*s, 2*s);
    g.fillStyle(0xf87171, 1); g.fillCircle(cx+3*s, cy-7*s, 2*s);
    g.fillStyle(0x6ee7b7, 1); g.fillCircle(cx,     cy-7*s, 2*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx-28*s, cy-16*s, 12*s, 28*s, 4*s);
    g.lineStyle(2*s, B, 1); g.strokeRoundedRect(cx-28*s, cy-16*s, 12*s, 28*s, 4*s);
    g.fillStyle(P,1); g.fillEllipse(cx-22*s, cy+14*s, 14*s, 10*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx+16*s, cy-16*s, 12*s, 28*s, 4*s);
    g.lineStyle(2*s, B, 1); g.strokeRoundedRect(cx+16*s, cy-16*s, 12*s, 28*s, 4*s);
    g.fillStyle(P,1); g.fillEllipse(cx+22*s, cy+14*s, 14*s, 10*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx-16*s, cy+16*s, 12*s, 24*s, 3*s);
    g.lineStyle(2*s, B, 1); g.strokeRoundedRect(cx-16*s, cy+16*s, 12*s, 24*s, 3*s);
    g.fillStyle(P,1); g.fillRoundedRect(cx-19*s, cy+38*s, 18*s, 8*s, 3*s);
    g.fillStyle(W,1); g.fillRoundedRect(cx+4*s,  cy+16*s, 12*s, 24*s, 3*s);
    g.lineStyle(2*s, B, 1); g.strokeRoundedRect(cx+4*s, cy+16*s, 12*s, 24*s, 3*s);
    g.fillStyle(P,1); g.fillRoundedRect(cx+1*s, cy+38*s, 18*s, 8*s, 3*s);
    g.fillStyle(W,1); g.fillCircle(cx, cy-28*s, 20*s);
    g.lineStyle(2*s, B, 1); g.strokeCircle(cx, cy-28*s, 20*s);
    g.fillStyle(V,1); g.fillEllipse(cx, cy-28*s, 26*s, 20*s);
    g.fillStyle(0xffffff, 0.5); g.fillEllipse(cx-5*s, cy-32*s, 8*s, 6*s);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHECKPOINTS
  // ─────────────────────────────────────────────────────────────────────────
  _buildCheckpoints() {
    this._checkpointGroup = this.physics.add.staticGroup();

    [[650, 400], [1320, 350], [1880, 350], [2460, 350], [3150, 350]].forEach(([x, y]) => {
      const g = this.add.graphics().setDepth(3);
      g.lineStyle(2, L2_PAL.indigo, 0.7); g.strokeRect(x-4, y-22, 8, 22);
      g.fillStyle(L2_PAL.violet, 0.55);   g.fillTriangle(x, y-30, x+12, y-20, x-12, y-20);

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

    this._levelLabel = this.add.text(W / 2, W < 600 ? 40 : 16, 'LEVEL 2 — THE NEBULA', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#a78bfa',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(30);

    this._deathText = this.add.text(W - 16, 16, '', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif', color: '#f9a8d4',
      fontStyle: 'bold', stroke: '#030712', strokeThickness: 3, resolution: dpr,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(30);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ROCKY PANEL — identical queue-driven system as Level 1
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
    this._rockyPanel.lineStyle(2.5, L2_PAL.indigo, 0.9);
    this._rockyPanel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(1, L2_PAL.gold, 0.35);
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
          this._queueRocky("Glowing orb. Nice. Elina would call it 'galaxy candy'. She's not wrong.", 3800);
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

    // Beacons
    this._beaconBodies.forEach(body => {
      this.physics.add.overlap(this.joao, body, () => {
        this._activateBeacon(body);
      });
    });

    // Exit beacon
    this.physics.add.overlap(this.joao, this._exitBeacon, () => {
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
    this.cameras.main.flash(250, 200, 0, 0);

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
    this._queueRocky("Made it through! You know what she'd sign to you,right? Let me try - How was it..'We were just kids when we fell in love..I will not give you up this time' - yeah, that one. Go get her.", 8000);

    this.time.delayedCall(8300, () => {
      this.cameras.main.fadeOut(800, 3, 7, 18);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Level3'));
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
      joao.setVelocityY(-640);
      this._coyoteTime = 0;
    }

    // ── Pre-checkpoint fall guard (before first checkpoint at 650)
    if (this._isAlive && !this._levelComplete && this._checkpointX === 80 && joao.y > 530) {
      joao.setPosition(this._checkpointX, this._checkpointY);
      joao.setVelocity(0, 0);
    }

    // ── Nebula currents — push Joao sideways
    const joaoBounds = joao.getBounds();
    this._currentZones.forEach(({ rect, pushX }) => {
      if (Phaser.Geom.Intersects.RectangleToRectangle(joaoBounds, rect)) {
        joao.body.velocity.x = Phaser.Math.Clamp(
          joao.body.velocity.x + pushX * delta * 0.14,
          -340, 340
        );
        if (!this._firstCurrentDone) {
          this._firstCurrentDone = true;
        }
      }
    });

    // ── Electrical discharges
    const invincible = time < this._invincibleUntil;
    if (!invincible) {
      this._discharges.forEach(({ body, isOn }) => {
        if (!isOn || !body.active) return;
        if (Phaser.Geom.Intersects.RectangleToRectangle(joaoBounds, body.getBounds())) {
          if (!this._zapDeathDone) {
            this._zapDeathDone = true;
            this.time.delayedCall(500, () => {
              this._queueRocky("You got zapped by a cloud. A CLOUD, Joao.", 4200);
            });
          }
          this._killJoao();
        }
      });
    }

    // ── Position-based Rocky triggers
    if (!this._midJoke2Done && joao.x > 2000) {
      this._midJoke2Done = true;
      this._queueRocky("Cool move! Picked that up in jiujitsu?", 4000);
    }
   
    // ── Fall off world
    if (joao.y > L2_H + 80) this._killJoao();
  }
}
