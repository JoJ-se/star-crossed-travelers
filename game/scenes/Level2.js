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

    this.time.delayedCall(1800, () => {
      if (!this._welcomeDone) {
        this._welcomeDone = true;
        this._queueRocky("This place is beautiful. Don't touch anything.", 4200);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BACKGROUND — 3 parallax cloud layers + light motes
  // ─────────────────────────────────────────────────────────────────────────
  _buildBackground() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Deep indigo base
    const bg = this.add.graphics().setScrollFactor(0).setDepth(-10);
    bg.fillStyle(0x08061a, 1);
    bg.fillRect(0, 0, W, H);

    // Layer 1 — deep background blobs (scrollFactor 0.05)
    const deep = this.add.graphics().setScrollFactor(0.05).setDepth(-9);
    [
      [300,  300, 320, 0x4c1d95, 0.13],
      [900,  200, 270, 0x581c87, 0.11],
      [1500, 350, 340, 0x3730a3, 0.12],
      [2100, 220, 290, 0x4c1d95, 0.10],
      [2700, 310, 310, 0x312e81, 0.13],
      [3300, 210, 270, 0x581c87, 0.11],
      [3800, 300, 290, 0x4c1d95, 0.12],
    ].forEach(([x, y, r, col, a]) => {
      deep.fillStyle(col, a);   deep.fillCircle(x, y, r);
      deep.fillStyle(col, a * 0.55); deep.fillCircle(x + r * 0.4, y + r * 0.3, r * 0.65);
    });

    // Light motes instead of stars
    const motes = this.add.graphics().setScrollFactor(0.08).setDepth(-8);
    const moteColors = [0xf9a8d4, 0xa78bfa, 0x93c5fd, 0xe0e7ff, 0xfcd34d];
    for (let i = 0; i < 200; i++) {
      const mx = Phaser.Math.Between(0, L2_W);
      const my = Phaser.Math.Between(0, L2_H);
      motes.fillStyle(moteColors[i % moteColors.length], Math.random() * 0.5 + 0.1);
      motes.fillCircle(mx, my, Math.random() * 1.8 + 0.3);
    }

    // Layer 2 — mid clouds, pinks / purples / blues (scrollFactor 0.12)
    const mid = this.add.graphics().setScrollFactor(0.12).setDepth(-7);
    [
      [550,  400, 190, 0xdb2777, 0.09],
      [550,  400, 130, 0xec4899, 0.07],
      [1200, 270, 170, 0x7c3aed, 0.09],
      [1200, 270, 115, 0x8b5cf6, 0.07],
      [1900, 390, 200, 0x2563eb, 0.08],
      [1900, 390, 135, 0x3b82f6, 0.06],
      [2500, 250, 180, 0xdb2777, 0.09],
      [2500, 250, 125, 0xec4899, 0.07],
      [3100, 380, 170, 0x7c3aed, 0.08],
      [3100, 380, 115, 0xa78bfa, 0.06],
      [3700, 270, 190, 0x2563eb, 0.08],
    ].forEach(([x, y, r, col, a]) => {
      mid.fillStyle(col, a);
      mid.fillCircle(x, y, r);
    });

    // Layer 3 — foreground wisps (scrollFactor 0.22)
    const fore = this.add.graphics().setScrollFactor(0.22).setDepth(-6);
    [
      [420,  490, 90, 0xf9a8d4, 0.14],
      [950,  380, 70, 0xa78bfa, 0.12],
      [1580, 460, 80, 0x93c5fd, 0.13],
      [2200, 360, 75, 0xf9a8d4, 0.11],
      [2750, 470, 85, 0xa78bfa, 0.14],
      [3350, 380, 70, 0x93c5fd, 0.12],
      [3820, 460, 80, 0xf9a8d4, 0.13],
    ].forEach(([x, y, r, col, a]) => {
      fore.fillStyle(col, a);
      fore.fillEllipse(x, y, r * 3.2, r);
      fore.fillStyle(col, a * 0.6);
      fore.fillEllipse(x + r * 1.1, y + 22, r * 2.1, r * 0.65);
    });
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

    g.fillStyle(L2_PAL.hull,   1); g.fillRect(x - w/2, y - h/2, w, h);
    g.fillStyle(L2_PAL.hullHi, 1); g.fillRect(x - w/2 + 4, y - h/2 + 3, w - 8, 4);
    g.fillStyle(0x1e1040,      1); g.fillRect(x - w/2, y + h/2 - 5, w, 5);
    g.lineStyle(1.5, L2_PAL.purple, 0.65); g.strokeRect(x - w/2, y - h/2, w, h);
    g.lineStyle(1,   L2_PAL.pink,   0.28); g.strokeRect(x - w/2 + 2, y - h/2 + 2, w - 4, h - 4);

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
        this._queueRocky("Light it up. Smart. I was going to suggest the same thing.", 4000);
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
      // Shimmer visual
      const col = pushX > 0 ? 0x93c5fd : 0xf9a8d4;
      const g = this.add.graphics().setDepth(1);
      g.fillStyle(col, 0.06);
      g.fillRect(cx - w/2, cy, w, h);
      g.lineStyle(1, col, 0.18);
      g.strokeRect(cx - w/2, cy, w, h);

      // Arrow hints
      const dir = pushX > 0 ? 1 : -1;
      g.lineStyle(1.5, col, 0.30);
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
      g.fillStyle(L2_PAL.pink,   0.20); g.fillCircle(x, y, 18);
      g.fillStyle(L2_PAL.violet, 0.14); g.fillCircle(x, y, 14);
      g.fillStyle(L2_PAL.gold,   0.92); g.fillCircle(x, y,  8);
      g.fillStyle(0xffffff,      0.65); g.fillCircle(x-2, y-2, 3);
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

    this._levelLabel = this.add.text(W / 2, 16, 'LEVEL 2 — THE NEBULA', {
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
    const panelW = Math.min(700, W - 28);
    const panelX = 14;
    const panelH = 130;
    const panelY = H - panelH - 14;

    this._rockyPanel.clear();
    this._rockyPanel.fillStyle(0x0f172a, 0.95);
    this._rockyPanel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(2.5, L2_PAL.indigo, 0.9);
    this._rockyPanel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(1, L2_PAL.gold, 0.35);
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
      window.mobileControls.show();
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
    this._queueRocky("You made it through a sentient murder cloud. I'm almost proud.", 6000);

    this.time.delayedCall(6800, () => {
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
          this._queueRocky("That push wasn't me. The cloud has opinions.", 4000);
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
    if (!this._midJoke1Done && joao.x > 1200) {
      this._midJoke1Done = true;
      this._queueRocky("These platforms were here the whole time. You just couldn't see them. Bit of a metaphor, really.", 5200);
    }
    if (!this._midJoke2Done && joao.x > 2000) {
      this._midJoke2Done = true;
      this._queueRocky("Halfway. The gas is thicker ahead. And angrier.", 4000);
    }
    if (!this._finalApproachDone && joao.x > 3200) {
      this._finalApproachDone = true;
      this._queueRocky("Almost out. Don't celebrate yet — clouds hold grudges.", 4200);
    }

    // ── Fall off world
    if (joao.y > L2_H + 80) this._killJoao();
  }
}
