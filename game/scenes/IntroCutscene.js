// ── IntroCutscene ─────────────────────────────────────────────────────────────
// Flow:
//   Beat 1  Ship drifts peacefully
//   Beat 2  Cosmic storm — flashes + screen shake
//   Beat 3  Ship cracks and splits, debris scatters
//   Beat 4  Joao floats in alone
//   Story   Cinematic text types word-by-word  →  click/space
//   Rocky   Crawls out, main intro speech  →  click/space
//   Joke    Pre-level joke  →  click/space  →  Level 1

class IntroCutscene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroCutscene' });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DRAW HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  _drawStars(g, count, w, h) {
    const colors = [0xffffff, 0x93c5fd, 0xfde68a, 0xf9a8d4, 0xa78bfa];
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = Phaser.Math.Between(0, h);
      const r = Math.random() * 1.8 + 0.3;
      g.fillStyle(colors[Math.floor(Math.random() * colors.length)], Math.random() * 0.65 + 0.2);
      g.fillCircle(x, y, r);
    }
  }

  _drawAstronaut(g, cx, cy, s) {
    const W = 0xe8edf5, B = 0xbdc6d4, V = 0xf59e0b, P = 0x6366f1;
    g.fillStyle(B, 1);
    g.fillRoundedRect(cx-6*s, cy-14*s, 12*s, 24*s, 3*s);
    g.fillStyle(W, 1);
    g.fillRoundedRect(cx-18*s, cy-18*s, 36*s, 34*s, 6*s);
    g.lineStyle(2*s, B, 1);
    g.strokeRoundedRect(cx-18*s, cy-18*s, 36*s, 34*s, 6*s);
    g.fillStyle(P, 1);
    g.fillRoundedRect(cx-8*s, cy-12*s, 16*s, 12*s, 2*s);
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
    g.fillStyle(W,1); g.fillRoundedRect(cx+4*s,cy+16*s,12*s,24*s,3*s);
    g.lineStyle(2*s,B,1); g.strokeRoundedRect(cx+4*s,cy+16*s,12*s,24*s,3*s);
    g.fillStyle(P,1); g.fillRoundedRect(cx+1*s,cy+38*s,18*s,8*s,3*s);
    g.fillStyle(W,1); g.fillCircle(cx,cy-28*s,20*s);
    g.lineStyle(2*s,B,1); g.strokeCircle(cx,cy-28*s,20*s);
    g.fillStyle(V,1); g.fillEllipse(cx,cy-28*s,26*s,20*s);
    g.fillStyle(0xffffff,0.5); g.fillEllipse(cx-5*s,cy-32*s,8*s,6*s);
  }

  _drawShipPanel(g, cx, cy, w, h) {
    g.fillStyle(0x374151, 1);
    g.fillRect(cx-w/2, cy-h/2, w, h);
    g.fillStyle(0x4b5563, 1);
    g.fillRect(cx-w/2+4, cy-h/2+4, w-8, 5);
    g.fillStyle(0x1f2937, 1);
    g.fillRect(cx-w/2, cy+h/2-6, w, 6);
    g.lineStyle(2, 0x6b7280, 0.8);
    g.strokeRect(cx-w/2, cy-h/2, w, h);
    // Port windows
    g.fillStyle(0x1e3a5f, 1);
    g.fillCircle(cx-18, cy, 6); g.fillCircle(cx+18, cy, 6);
    g.lineStyle(1.5, 0x93c5fd, 0.5);
    g.strokeCircle(cx-18, cy, 6); g.strokeCircle(cx+18, cy, 6);
    // Rivet line
    g.fillStyle(0x6b7280, 0.7);
    for (let i = 0; i < 5; i++) g.fillCircle(cx-w/2+10+i*(w/5), cy-h/2+8, 2.5);
  }

  _drawRocky(g, cx, cy, s) {
    const limbAngles = [30, 90, 150, 210, 270, 330];
    limbAngles.forEach(deg => {
      const rad = Phaser.Math.DegToRad(deg);
      g.fillStyle(0x78716c, 1);
      g.fillEllipse(cx + Math.cos(rad)*18*s, cy + Math.sin(rad)*13*s, 13*s, 7*s);
    });
    g.fillStyle(0x9ca3af, 1); g.fillEllipse(cx, cy, 34*s, 26*s);
    g.fillStyle(0x78716c, 1);
    g.fillCircle(cx-7*s, cy-4*s, 3*s);
    g.fillCircle(cx+6*s, cy+3*s, 2*s);
    g.fillCircle(cx+2*s, cy-6*s, 2*s);
    g.fillStyle(0x1e1b4b, 1);
    g.fillCircle(cx-6*s, cy-2*s, 3.5*s); g.fillCircle(cx+6*s, cy-2*s, 3.5*s);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(cx-5*s, cy-3*s, 1.5*s); g.fillCircle(cx+7*s, cy-3*s, 1.5*s);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WORD-BY-WORD TYPEWRITER
  // ─────────────────────────────────────────────────────────────────────────
  _typeWords(textObj, fullText, msPerWord, onDone) {
    const words = fullText.split(' ');
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
    this.time.delayedCall(50, tick);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CINEMATIC DIALOGUE BOX  (Rocky's speech)
  // ─────────────────────────────────────────────────────────────────────────
  _showDialogue(speaker, text, msPerWord, onDone) {
    const W = this.scale.width;
    const H = this.scale.height;
    const panelW = Math.min(W - 40, 900);
    const panelX = (W - panelW) / 2;
    const panelH = 148;
    const panelY = H - panelH - 16;

    // Outer glow layer
    const glow = this.add.graphics().setDepth(49);
    glow.fillStyle(0x6366f1, 0.08);
    glow.fillRoundedRect(panelX - 4, panelY - 4, panelW + 8, panelH + 8, 13);

    const box = this.add.graphics().setDepth(50);
    box.fillStyle(0x060d1f, 0.96);
    box.fillRoundedRect(panelX, panelY, panelW, panelH, 10);
    // Double border: outer indigo, inner thin gold
    box.lineStyle(2, 0x6366f1, 0.9);
    box.strokeRoundedRect(panelX, panelY, panelW, panelH, 10);
    box.lineStyle(1, 0xfcd34d, 0.25);
    box.strokeRoundedRect(panelX+3, panelY+3, panelW-6, panelH-6, 8);

    const dpr = window.devicePixelRatio || 1;

    const nameText = this.add.text(panelX + 22, panelY + 16, speaker, {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#fcd34d',
      fontStyle: 'bold',
      letterSpacing: 2,
      resolution: dpr,
    }).setDepth(51);

    const bodyText = this.add.text(panelX + 22, panelY + 38, '', {
      fontSize: '17px',
      fontFamily: 'Arial, sans-serif',
      color: '#dde8f5',
      fontStyle: 'bold',
      wordWrap: { width: panelW - 44 },
      lineSpacing: 7,
      resolution: dpr,
    }).setDepth(51);

    const hint = this.add.text(panelX + panelW - 18, panelY + panelH - 14, 'click / space', {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#6366f1',
      alpha: 0,
    }).setOrigin(1, 1).setDepth(51);

    // Slide-up entrance
    const startY = H + 10;
    [box, glow, nameText, bodyText, hint].forEach(obj => { obj.y += (startY - panelY); });
    this.tweens.add({
      targets: [box, glow, nameText, bodyText, hint],
      y: `-=${startY - panelY}`,
      duration: 320, ease: 'Back.easeOut',
      onComplete: () => {
        this._typeWords(bodyText, text, msPerWord, () => {
          this.tweens.add({ targets: hint, alpha: 1, duration: 350 });
          this.tweens.add({ targets: hint, alpha: 0.25, duration: 600, yoyo: true, repeat: -1, delay: 350 });

          // Remove BOTH listeners atomically to prevent double-fire
          const dismiss = () => {
            this.input.off('pointerdown', dismiss);
            this.input.keyboard.off('keydown-SPACE', dismiss);
            [box, glow, nameText, bodyText, hint].forEach(o => o.destroy());
            if (onDone) onDone();
          };
          this.input.on('pointerdown', dismiss);
          this.input.keyboard.on('keydown-SPACE', dismiss);
        });
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CINEMATIC STORY CARD
  // ─────────────────────────────────────────────────────────────────────────
  _showStoryCard(onDone) {
    const W = this.scale.width;
    const H = this.scale.height;

    // Subtle dark veil
    const vignette = this.add.graphics().setDepth(18);
    vignette.fillStyle(0x000000, 0.48);
    vignette.fillRect(0, 0, W, H);

    // Text lives in the RIGHT half so it never lands on Joao (left side)
    const textX  = Math.round(W * 0.52);
    const maxW   = W - textX - 28;
    const dpr    = window.devicePixelRatio || 1;

    const lines = [
  { text: 'A cosmic storm tore through the galaxy without warning.', size: '18px', color: '#94a3b8', y: H * 0.22 },
  { text: "Joao and Elina's ship split in two.", size: '21px', color: '#cbd5e1', y: H * 0.33 },
  { text: 'She drifted toward the legendary Ice-Cream Planet — ice cream in hand, completely unbothered.', size: '16px', color: '#94a3b8', y: H * 0.44 },
  { text: 'Classic Elina.', size: '21px', color: '#cbd5e1', y: H * 0.33 },
  { text: 'He has to find her.', size: '26px', color: '#fcd34d', y: H * 0.67 },
];

    const textObjs = [];
    const typeNextLine = (idx) => {
      if (idx >= lines.length) {
        const hint = this.add.text(textX, H * 0.72, 'click / space to continue', {
          fontSize: '13px', fontFamily: 'Arial, sans-serif', color: '#6366f1',
          resolution: dpr,
        }).setDepth(21).setAlpha(0);
        this.tweens.add({ targets: hint, alpha: 1, duration: 400, delay: 300 });
        this.tweens.add({ targets: hint, alpha: 0.2, duration: 700, yoyo: true, repeat: -1, delay: 700 });

        const dismiss = () => {
          this.input.off('pointerdown', dismiss);
          this.input.keyboard.off('keydown-SPACE', dismiss);
          textObjs.forEach(t => t.destroy());
          vignette.destroy();
          hint.destroy();
          if (onDone) onDone();
        };
        this.input.on('pointerdown', dismiss);
        this.input.keyboard.on('keydown-SPACE', dismiss);
        return;
      }

      const { text, size, color, y } = lines[idx];
      const t = this.add.text(textX, y, '', {
        fontSize: size,
        fontFamily: 'Arial, sans-serif',
        color,
        fontStyle: 'normal',
        wordWrap: { width: maxW },
        lineSpacing: 5,
        resolution: dpr,
      }).setDepth(20).setAlpha(0);
      textObjs.push(t);

      this.tweens.add({ targets: t, alpha: 1, duration: 350 });
      this._typeWords(t, text, 72, () => {
        this.time.delayedCall(180, () => typeNextLine(idx + 1));
      });
    };

    this.time.delayedCall(300, () => typeNextLine(0));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE — set up scene then start beat 1
  // ─────────────────────────────────────────────────────────────────────────
  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Layered starfield
    const stars1 = this.add.graphics().setDepth(0);
    const stars2 = this.add.graphics().setDepth(1);
    this._drawStars(stars1, 180, W, H);
    this._drawStars(stars2, 80, W, H);
    // Twinkle the brighter layer
    this.tweens.add({ targets: stars2, alpha: 0.4, duration: 2200, yoyo: true, repeat: -1 });

    // ── Amber planet — rich glow
    const planet = this.add.graphics().setDepth(2);
    planet.fillStyle(0x92400e, 0.08); planet.fillCircle(W * 0.82, H * 0.22, 340);
    planet.fillStyle(0xd97706, 0.14); planet.fillCircle(W * 0.82, H * 0.22, 240);
    planet.fillStyle(0xf59e0b, 0.09); planet.fillCircle(W * 0.82, H * 0.22, 160);
    planet.fillStyle(0xfbbf24, 0.05); planet.fillCircle(W * 0.82, H * 0.22, 90);

    // ── Ship — two hull panels connected
    this._shipLeft  = this.add.graphics().setDepth(5);
    this._shipRight = this.add.graphics().setDepth(5);
    this._bridge    = this.add.graphics().setDepth(6);

    this._drawShipPanel(this._shipLeft,  W/2 - 62, H/2 - 10, 100, 54);
    this._drawShipPanel(this._shipRight, W/2 + 62, H/2 - 10, 100, 54);

    this._bridge.lineStyle(3, 0x6b7280, 1);
    this._bridge.beginPath();
    this._bridge.moveTo(W/2 - 12, H/2 - 10);
    this._bridge.lineTo(W/2 + 12, H/2 - 10);
    this._bridge.strokePath();
    // Bridge support struts
    this._bridge.lineStyle(1.5, 0x4b5563, 0.8);
    this._bridge.beginPath();
    this._bridge.moveTo(W/2 - 12, H/2 - 25);
    this._bridge.lineTo(W/2 + 12, H/2 - 25);
    this._bridge.strokePath();

    this.cameras.main.fadeIn(900, 3, 7, 18);
    this.time.delayedCall(1000, () => this._beat1());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BEAT 1 — Peaceful drift
  // ─────────────────────────────────────────────────────────────────────────
  _beat1() {
    const all = [this._shipLeft, this._shipRight, this._bridge];
    // Gentle drift + slow bob
    this.tweens.add({
      targets: all, x: '+=22', duration: 1800, ease: 'Sine.easeInOut',
    });
    this.tweens.add({
      targets: all, y: '-=8', duration: 900, ease: 'Sine.easeInOut',
      yoyo: true,
      onComplete: () => this._beat2(),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BEAT 2 — Cosmic storm hits
  // ─────────────────────────────────────────────────────────────────────────
  _beat2() {
    const W = this.scale.width;
    const H = this.scale.height;
    const flash = this.add.graphics().setDepth(70);

    let step = 0;
    const sequence = [
      { color: 0xffffff, alpha: 0.45, dur: 60 },
      { color: 0xffffff, alpha: 0,    dur: 100 },
      { color: 0x93c5fd, alpha: 0.55, dur: 80 },  // blue-white
      { color: 0xffffff, alpha: 0,    dur: 80 },
      { color: 0xffffff, alpha: 0.80, dur: 120 },  // big white flash
      { color: 0xffffff, alpha: 0,    dur: 60 },
      { color: 0xf59e0b, alpha: 0.40, dur: 100 },  // orange – explosion tinge
      { color: 0xffffff, alpha: 0,    dur: 50 },
    ];

    const doStep = () => {
      if (step >= sequence.length) {
        flash.destroy();
        this.cameras.main.shake(500, 0.018);
        this._beat3();
        return;
      }
      const { color, alpha, dur } = sequence[step++];
      flash.clear();
      if (alpha > 0) { flash.fillStyle(color, alpha); flash.fillRect(0, 0, W, H); }
      this.time.delayedCall(dur, doStep);
    };
    doStep();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BEAT 3 — Ship splits, debris scatters
  // ─────────────────────────────────────────────────────────────────────────
  _beat3() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._bridge.destroy();

    // ── Hull panels fly apart dramatically
    this.tweens.add({
      targets: this._shipLeft,
      x: '-=180', y: '-=90', angle: -32, alpha: 0.55,
      duration: 1100, ease: 'Sine.easeOut',
    });
    this.tweens.add({
      targets: this._shipRight,
      x: '+=140', y: '+=100', angle: 22, alpha: 0.55,
      duration: 1100, ease: 'Sine.easeOut',
    });

    // ── Small debris fragments shoot out
    const debrisData = [
      { dx: -220, dy: -130, angle: -55, size: 16 },
      { dx:  180, dy: -80,  angle:  40, size: 12 },
      { dx: -90,  dy:  160, angle: -20, size: 10 },
      { dx:  250, dy:  120, angle:  65, size: 14 },
      { dx: -150, dy:  80,  angle: -80, size: 8  },
      { dx:  60,  dy: -180, angle:  35, size: 9  },
      { dx: -40,  dy:  200, angle: -15, size: 11 },
      { dx:  120, dy: -140, angle:  50, size: 7  },
    ];

    debrisData.forEach(({ dx, dy, angle, size }) => {
      const d = this.add.graphics().setDepth(4);
      d.fillStyle(0x4b5563, 1);
      d.fillRect(-size/2, -size/2, size, size);
      d.fillStyle(0x92400e, 0.5);
      d.fillCircle(size/4, size/4, size/4);
      d.x = W / 2;
      d.y = H / 2 - 10;
      this.tweens.add({
        targets: d,
        x: `+=${dx}`, y: `+=${dy}`,
        angle, alpha: 0,
        duration: Phaser.Math.Between(800, 1400),
        ease: 'Sine.easeOut',
        onComplete: () => d.destroy(),
      });
    });

    // Second shake for the impact
    this.time.delayedCall(200, () => this.cameras.main.shake(400, 0.012));

    // ── After split settles, Joao floats in
    this.time.delayedCall(1200, () => this._beat4());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BEAT 4 — Joao floats in, looks around
  // ─────────────────────────────────────────────────────────────────────────
  _beat4() {
    const W = this.scale.width;
    const H = this.scale.height;

    const joaoG = this.add.graphics().setDepth(10);
    this._drawAstronaut(joaoG, 0, 0, 1.0);
    joaoG.x = -80;
    joaoG.y = H / 2 + 20;

    // Float in from left — settle on LEFT SIDE so story text can occupy the right
    this.tweens.add({
      targets: joaoG, x: Math.round(W * 0.24), duration: 1100, ease: 'Sine.easeOut',
      onComplete: () => {
        // Distant Bichilin appears in background as Joao looks around
        this._showDistantBichilin();

        // Spin left-right — looking for her
        this.tweens.add({
          targets: joaoG, angle: 14, duration: 550, yoyo: true, repeat: 2,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            // Gentle float while story types
            this.tweens.add({ targets: joaoG, y: '-=16', duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.tweens.add({ targets: joaoG, angle: 4, duration: 4000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
            this.time.delayedCall(400, () => this._showStoryCard(() => this._enterRocky(joaoG)));
          },
        });
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DISTANT BICHILIN — tiny figure drifting away in background
  // ─────────────────────────────────────────────────────────────────────────
  _showDistantBichilin() {
    const W = this.scale.width;
    const H = this.scale.height;
    const s = 0.38;  // small scale = looks distant

    const g = this.add.graphics().setDepth(8);
    // Bichilin astronaut body
    this._drawAstronaut(g, 0, 0, s);
    // Pink visor overlay (match landing-page girl)
    g.fillStyle(0xec4899, 0.92);
    g.fillEllipse(0, -28 * s, 26 * s, 20 * s);
    // Glowing ice cream cone to her right (she's reaching for it)
    const icX = 42 * s, icY = -22 * s;
    g.fillStyle(0xfcd34d, 0.95);
    g.fillCircle(icX, icY, 9 * s);
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(icX - 2 * s, icY - 2 * s, 3 * s);  // highlight
    g.fillStyle(0xd97706, 0.9);
    g.fillTriangle(icX - 7 * s, icY + 5 * s, icX + 7 * s, icY + 5 * s, icX, icY + 18 * s);

    g.x = Math.round(W * 0.72);
    g.y = Math.round(H * 0.26);
    g.setAlpha(0);

    // Fade in gently
    this.tweens.add({ targets: g, alpha: 0.58, duration: 1400, ease: 'Sine.easeOut' });
    // Slowly drift further away — upper right
    this.tweens.add({ targets: g, x: Math.round(W * 0.90), y: Math.round(H * 0.18), duration: 9000, ease: 'Sine.easeIn' });
    // Fade out after a while
    this.time.delayedCall(5500, () => {
      this.tweens.add({ targets: g, alpha: 0, duration: 2200, onComplete: () => g.destroy() });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ROCKY ENTERS
  // ─────────────────────────────────────────────────────────────────────────
  _enterRocky(joaoG) {
    const W = this.scale.width;
    const H = this.scale.height;

    // Debris chunk Rocky hides behind
    const debrisG = this.add.graphics().setDepth(8);
    debrisG.fillStyle(0x374151, 1);
    debrisG.fillRoundedRect(W * 0.10, H * 0.74, 100, 66, 7);
    debrisG.lineStyle(2, 0x6b7280, 0.5);
    debrisG.strokeRoundedRect(W * 0.10, H * 0.74, 100, 66, 7);
    // Burn mark
    debrisG.fillStyle(0x92400e, 0.3);
    debrisG.fillCircle(W * 0.10 + 70, H * 0.74 + 20, 18);

    const rockyG = this.add.graphics().setDepth(12);
    this._drawRocky(rockyG, 0, 0, 1.7);
    rockyG.x = W * 0.06;
    rockyG.y = H * 0.82;
    rockyG.alpha = 0;

    // Rocky crawls out
    this.tweens.add({
      targets: rockyG, x: W * 0.20, alpha: 1, duration: 950, ease: 'Sine.easeOut',
      onComplete: () => {
        // Wobble — looks Joao up and down
        this.tweens.add({
          targets: rockyG, y: `-=${H * 0.025}`, duration: 260, yoyo: true, repeat: 2,
          ease: 'Sine.easeInOut',
          onComplete: () => this._rockyMainSpeech(rockyG),
        });
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ROCKY SPEECHES
  // ─────────────────────────────────────────────────────────────────────────
  _rockyMainSpeech(rockyG) {
    this._showDialogue(
      'Rocky',
      "Your person just floated away chasing dessert... Into deep space.... I've seen a lot of things out here — that's a new one.",
      88,
      () => {
        // Brief pause, then second line
        this.time.delayedCall(400, () => {
          this._showDialogue(
            'Rocky',
            "I'm Rocky. I know where the Ice-Cream Planet is. Try not to die and I'll take you there.",
            88,
            () => this._rockyPreLevelJoke(rockyG)
          );
        });
      }
    );
  }

  _rockyPreLevelJoke(rockyG) {
    this.tweens.add({
      targets: rockyG, angle: -12, duration: 200, yoyo: true, repeat: 1,
      onComplete: () => {
        this._showDialogue(
          'Rocky',
          "Also – space has no gravity, but you'll still need to 'jump' over debris. Don't ask why. It's a game thing. Humans love making up rules.",
          90,
          () => this._beginLevel()
        );
      },
    });
  }

  _beginLevel() {
    this.cameras.main.fadeOut(900, 3, 7, 18);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Level1');
    });
  }
}
