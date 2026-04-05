// ── Level 1 — The Wreck ───────────────────────────────────────────────────────
// Debris field orbiting an amber planet — the ruins of Joao and Bichilin's ship.

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

    const bg = this.add.graphics().setScrollFactor(0).setDepth(-10);
    bg.fillStyle(PALETTE.dark, 1);
    bg.fillRect(0, 0, W, H);

    const planet = this.add.graphics().setScrollFactor(0.05).setDepth(-9);
    planet.fillStyle(0xd97706, 0.18); planet.fillCircle(2400, -80, 420);
    planet.fillStyle(0xf59e0b, 0.10); planet.fillCircle(2400, -80, 320);
    planet.fillStyle(0xfbbf24, 0.05); planet.fillCircle(2400, -80, 220);

    const starColors = [0xffffff, 0x93c5fd, 0xfde68a, 0xf9a8d4];
    const stars1 = this.add.graphics().setScrollFactor(0.1).setDepth(-8);
    const stars2 = this.add.graphics().setScrollFactor(0.2).setDepth(-7);
    for (let i = 0; i < 280; i++) {
      const x = Phaser.Math.Between(0, WORLD_W), y = Phaser.Math.Between(0, WORLD_H);
      stars1.fillStyle(starColors[Math.floor(Math.random()*starColors.length)], Math.random()*0.5+0.2);
      stars1.fillCircle(x, y, Math.random()*1.4+0.3);
    }
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, WORLD_W), y = Phaser.Math.Between(0, WORLD_H);
      stars2.fillStyle(starColors[Math.floor(Math.random()*starColors.length)], Math.random()*0.4+0.2);
      stars2.fillCircle(x, y, Math.random()*2+0.5);
    }

    const deco = this.add.graphics().setScrollFactor(0.3).setDepth(-6);
    [[400,480,30,14],[900,120,24,10],[1500,520,40,18],[2100,140,28,12],[2700,460,36,16],[1200,360,22,9]]
      .forEach(([x,y,w,h]) => { deco.fillStyle(PALETTE.hull,0.35); deco.fillRect(x-w/2,y-h/2,w,h); });
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

    layout.forEach(([x, y, w, h]) => {
      const g = this.add.graphics().setDepth(2);
      g.fillStyle(PALETTE.hull,   1); g.fillRect(x-w/2, y-h/2, w, h);
      g.fillStyle(PALETTE.hullHi, 1); g.fillRect(x-w/2+4, y-h/2+3, w-8, 4);
      g.fillStyle(0x1f2937,       1); g.fillRect(x-w/2, y+h/2-5, w, 5);
      g.lineStyle(1.5, 0x6b7280, 0.6); g.strokeRect(x-w/2, y-h/2, w, h);
      g.fillStyle(0x6b7280, 0.8);
      for (let i = 0; i < 3; i++) g.fillCircle(x-w/2+10+i*(w/3), y-h/2+6, 2);

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
      g.fillStyle(0x4b5563, 1); g.fillRect(-size/2, -size/2, size, size);
      g.fillStyle(0x374151, 1); g.fillTriangle(-size/2,-size/2, size/4,-size/2, -size/4,size/3);
      g.fillStyle(0x6b7280, 0.5); g.fillRect(-size/2+4, -size/2+4, size/3, 3);
      g.fillStyle(0x92400e, 0.6); g.fillCircle(size/4, size/4, size/5);
      g.lineStyle(1.5, 0x9ca3af, 0.4); g.strokeRect(-size/2, -size/2, size, size);
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
      g.fillStyle(PALETTE.gold, 0.15);   g.fillCircle(x, y, 18);
      g.fillStyle(PALETTE.indigo, 0.12); g.fillCircle(x, y, 14);
      g.fillStyle(PALETTE.gold, 0.9);    g.fillCircle(x, y, 8);
      g.fillStyle(0xffffff, 0.6);        g.fillCircle(x-2, y-2, 3);
      this.tweens.add({ targets: g, alpha: 0.4, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

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

    this._levelLabel = this.add.text(W/2, 16, 'LEVEL 1 — THE WRECK', {
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
    const panelW = Math.min(700, W - 28);
    const panelX = 14;
    const panelH = 130;
    const panelY = H - panelH - 14;

    // Draw panel background + Rocky avatar
    this._rockyPanel.clear();
    this._rockyPanel.fillStyle(0x0f172a, 0.95);
    this._rockyPanel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(2.5, PALETTE.indigo, 0.9);
    this._rockyPanel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    this._rockyPanel.lineStyle(1, PALETTE.gold, 0.35);
    this._rockyPanel.strokeRoundedRect(panelX + 3, panelY + 3, panelW - 6, panelH - 6, 10);

    // Avatar — stone oval body
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

    // Text positions
    const tx = panelX + 104;
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
            "Glowing orb looks like a tiny moon - that's what Elina would say. Sob sob (-^-) So many cute Space things!",
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

    this.cameras.main.flash(250, 200, 0, 0);

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
      6000
    );

    this.time.delayedCall(6500, () => {
      this.cameras.main.fadeOut(800, 3, 7, 18);
      // this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Level2'));
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
    if (keys.left.isDown || keys.a.isDown) {
      joao.setVelocityX(-speed);
      joao.setFlipX(true);
    } else if (keys.right.isDown || keys.d.isDown) {
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
                     || Phaser.Input.Keyboard.JustDown(keys.space);
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
      this._queueRocky("I heard your human calls you 'Dude'. What is a dude? Is it a type of space potato?", 4500);
    }
    if (!this._starfishDone && joao.x > 2700) {
      this._starfishDone = true;
      this._queueRocky("See? Not hard. Though you looked like a confused starfish doing it. So sad Elina couldn't see it :(", 4500);
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
