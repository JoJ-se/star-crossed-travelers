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

  // Elina's astronaut — white suit, pink visor, pink accents (matches landing page girl)
  _drawElinaAstronaut(g, cx, cy, s) {
    const W = 0xe8edf5, B = 0xbdc6d4, V = 0xec4899, P = 0xf9a8d4;
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

  // ── ENGINE / REAR HALF — drawn in local coords (0,0 = ship split center) ──
  _drawShipLeftHull(g, S) {
    // Main rear hull shadow
    g.fillStyle(0x8b95a8, 1);
    g.fillRoundedRect(-149*S, -34*S, 153*S, 72*S, 9*S);
    // Main rear hull face
    g.fillStyle(0xe8edf5, 1);
    g.fillRoundedRect(-149*S, -38*S, 153*S, 76*S, 9*S);
    // Metallic top sheen
    g.fillStyle(0xf4f7fb, 0.50);
    g.fillRoundedRect(-147*S, -36*S, 147*S, 20*S, 6*S);

    // Upper engine nacelle
    g.fillStyle(0x7c8ea0, 1);
    g.fillRoundedRect(-153*S, -63*S, 126*S, 27*S, 7*S); // shadow
    g.fillStyle(0xa0aec0, 1);
    g.fillRoundedRect(-153*S, -64*S, 126*S, 27*S, 7*S);
    g.fillStyle(0xbdc6d4, 0.60);
    g.fillRoundedRect(-151*S, -62*S, 120*S, 10*S, 4*S); // top highlight

    // Lower engine nacelle
    g.fillStyle(0x7c8ea0, 1);
    g.fillRoundedRect(-153*S, 38*S, 126*S, 27*S, 7*S); // shadow
    g.fillStyle(0xa0aec0, 1);
    g.fillRoundedRect(-153*S, 37*S, 126*S, 27*S, 7*S);
    g.fillStyle(0xbdc6d4, 0.45);
    g.fillRoundedRect(-151*S, 37*S, 120*S, 8*S, 3*S);

    // Wing struts connecting hull to nacelles
    g.fillStyle(0x6b7a8d, 1);
    g.fillRoundedRect(-131*S, -38*S, 38*S, 26*S, 4*S); // upper strut
    g.fillRoundedRect(-131*S, 12*S,  38*S, 26*S, 4*S); // lower strut

    // Engine nozzle outer rings
    g.fillStyle(0x374151, 1);
    g.fillEllipse(-148*S, -51*S, 24*S, 19*S);
    g.fillEllipse(-148*S,  51*S, 24*S, 19*S);
    // Nozzle inner dark cavities
    g.fillStyle(0x080c12, 1);
    g.fillEllipse(-149*S, -51*S, 13*S, 10*S);
    g.fillEllipse(-149*S,  51*S, 13*S, 10*S);

    // Panel lines (indigo)
    g.lineStyle(1.5*S, 0x6366f1, 0.60);
    g.lineBetween(-3*S, -38*S, -3*S, 38*S);       // split seam
    g.lineBetween(-146*S, 0, -4*S, 0);              // horizontal center seam
    g.lineBetween(-78*S, -38*S, -78*S, 38*S);      // panel line 1
    g.lineBetween(-114*S, -38*S, -114*S, 38*S);    // panel line 2

    // Gold + indigo trim stripes
    g.fillStyle(0xfcd34d, 0.88);
    g.fillRect(-144*S, 27*S, 141*S, 4*S);
    g.fillStyle(0x6366f1, 0.50);
    g.fillRect(-144*S, 23*S, 141*S, 3*S);

    // Rear dark end plate
    g.fillStyle(0x2d3748, 1);
    g.fillRoundedRect(-149*S, -38*S, 11*S, 76*S, 3*S);
    g.lineStyle(1*S, 0x818cf8, 0.32);
    g.strokeRoundedRect(-149*S, -38*S, 11*S, 76*S, 3*S);
  }

  // ── ENGINE EXHAUST GLOW — drawn in same local coords as left hull ──────
  _drawEngineGlow(g, S) {
    // Upper exhaust trail (4 layers, outermost → core)
    g.fillStyle(0xf59e0b, 0.09); g.fillEllipse(-180*S, -51*S, 65*S, 38*S);
    g.fillStyle(0xfbbf24, 0.22); g.fillEllipse(-170*S, -51*S, 44*S, 26*S);
    g.fillStyle(0xfde68a, 0.52); g.fillEllipse(-158*S, -51*S, 24*S, 15*S);
    g.fillStyle(0xfef9c3, 0.88); g.fillEllipse(-151*S, -51*S, 13*S,  9*S);
    // Lower exhaust trail
    g.fillStyle(0xf59e0b, 0.09); g.fillEllipse(-180*S,  51*S, 65*S, 38*S);
    g.fillStyle(0xfbbf24, 0.22); g.fillEllipse(-170*S,  51*S, 44*S, 26*S);
    g.fillStyle(0xfde68a, 0.52); g.fillEllipse(-158*S,  51*S, 24*S, 15*S);
    g.fillStyle(0xfef9c3, 0.88); g.fillEllipse(-151*S,  51*S, 13*S,  9*S);
  }

  // ── NOSE / FRONT HALF — drawn in local coords (0,0 = split center) ─────
  _drawShipRightHull(g, S) {
    // Main front hull shadow
    g.fillStyle(0x8b95a8, 1);
    g.fillRoundedRect(-3*S, -34*S, 124*S, 72*S, 9*S);
    // Main front hull face
    g.fillStyle(0xe8edf5, 1);
    g.fillRoundedRect(-3*S, -38*S, 124*S, 76*S, 9*S);
    // Metallic top sheen
    g.fillStyle(0xf4f7fb, 0.50);
    g.fillRoundedRect(-1*S, -36*S, 118*S, 20*S, 6*S);

    // Nose cone (tapered triangle pointing right)
    g.fillStyle(0xcdd5e0, 1);
    g.fillTriangle(101*S, -38*S, 101*S, 38*S, 164*S, 0);
    // Nose upper highlight (brighter upper surface)
    g.fillStyle(0xe8edf5, 0.78);
    g.fillTriangle(101*S, -38*S, 101*S, -7*S, 151*S, -20*S);

    // Cockpit window outer frame
    g.fillStyle(0x152742, 1);
    g.fillRoundedRect(13*S, -29*S, 66*S, 38*S, 8*S);
    // Cockpit glass
    g.fillStyle(0x0d1e38, 1);
    g.fillRoundedRect(16*S, -26*S, 60*S, 32*S, 6*S);
    // Blue atmospheric glow
    g.fillStyle(0x1d4ed8, 0.28);
    g.fillRoundedRect(16*S, -26*S, 60*S, 32*S, 6*S);
    // Main cockpit reflection
    g.fillStyle(0x93c5fd, 0.58);
    g.fillEllipse(33*S, -18*S, 28*S, 11*S);
    // Small bright highlight
    g.fillStyle(0xe0f2fe, 0.40);
    g.fillEllipse(22*S, -22*S, 11*S,  5*S);

    // Main antenna
    g.lineStyle(2*S, 0xbdc6d4, 0.85);
    g.lineBetween(90*S, -38*S, 90*S, -60*S);
    g.fillStyle(0xfcd34d, 1); g.fillCircle(90*S, -62*S, 4*S);
    // Secondary antenna
    g.lineStyle(1.5*S, 0x818cf8, 0.75);
    g.lineBetween(74*S, -38*S, 74*S, -54*S);
    g.fillStyle(0x818cf8, 1); g.fillCircle(74*S, -56*S, 3*S);
    // Tertiary short sensor
    g.lineStyle(1*S, 0x9ca3af, 0.55);
    g.lineBetween(56*S, -38*S, 56*S, -48*S);
    g.fillCircle(56*S, -49*S, 2*S);

    // Panel lines (indigo)
    g.lineStyle(1.5*S, 0x6366f1, 0.60);
    g.lineBetween(0, 0, 99*S, 0);              // horizontal center seam
    g.lineBetween(68*S, -38*S, 68*S, 38*S);   // vertical panel break
    g.lineBetween(4*S, -38*S, 4*S, 38*S);     // split edge seam

    // Gold + indigo trim stripes
    g.fillStyle(0xfcd34d, 0.88);
    g.fillRect(2*S, 27*S, 97*S, 4*S);
    g.fillStyle(0x6366f1, 0.50);
    g.fillRect(2*S, 23*S, 97*S, 3*S);

    // Docking port
    g.fillStyle(0x374151, 1);    g.fillCircle(9*S, 10*S, 10*S);
    g.fillStyle(0x4b5563, 0.7);  g.fillCircle(9*S, 10*S,  6*S);
    g.lineStyle(1*S, 0x9ca3af, 0.45); g.strokeCircle(9*S, 10*S, 10*S);
    // Docking port detail ring
    g.fillStyle(0x6b7280, 0.38);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      g.fillCircle(9*S + Math.cos(a)*7*S, 10*S + Math.sin(a)*7*S, 2*S);
    }

    // Rivet row along top edge
    g.fillStyle(0x6b7280, 0.58);
    for (let i = 0; i < 5; i++) g.fillCircle((8 + i * 18)*S, -32*S, 2.5*S);
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
    const dpr = window.devicePixelRatio || 1;
    const isMobile = W < 600;
    const bodyFont = isMobile ? '15px' : '17px';
    const panelW = Math.min(W - 40, 900);
    const panelX = (W - panelW) / 2;
    // Dynamic panel height
    const probe = this.add.text(-9999, -9999, text, {
      fontSize: bodyFont, fontFamily: 'Georgia, serif',
      fontStyle: 'bold', resolution: dpr,
      wordWrap: { width: panelW - 44 }, lineSpacing: 7,
    }).setVisible(false);
    const panelH = Math.max(120, 16 + 18 + 8 + probe.height + 22);
    probe.destroy();
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

    const nameText = this.add.text(panelX + 22, panelY + 16, speaker + ':', {
      fontSize: isMobile ? '12px' : '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#fcd34d',
      fontStyle: 'bold',
      letterSpacing: 2,
      resolution: dpr,
    }).setDepth(51);

    const bodyText = this.add.text(panelX + 22, panelY + 38, '', {
      fontSize: bodyFont,
      fontFamily: 'Georgia, serif',
      color: '#dde8f5',
      fontStyle: 'bold',
      wordWrap: { width: panelW - 44 },
      lineSpacing: 7,
      resolution: dpr,
    }).setDepth(51);

    const hint = this.add.text(panelX + panelW - 18, panelY + panelH - 14, 'tap / space', {
      fontSize: '11px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#6366f1',
      resolution: dpr,
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
    const W   = this.scale.width;
    const H   = this.scale.height;
    const dpr = window.devicePixelRatio || 1;
    // Broad mobile detection — covers large phones and touch tablets
    const isMobile = W < 768 || (window.navigator.maxTouchPoints > 0 && W < 1024);

    // ── Card area (right half on desktop, full width on mobile)
    const cardX = isMobile ? 10 : Math.round(W * 0.48);
    const cardW = isMobile ? W - 20 : W - cardX - 16;
    const textX = cardX + 20;
    const maxW  = cardW - 40;

    // ── Semi-transparent card — slightly more opaque on mobile for contrast
    const firstY  = H * 0.20;
    const lastY   = H * 0.69 + (isMobile ? 36 : 38);
    const cardPad = isMobile ? 20 : 18;
    const card = this.add.graphics().setDepth(18);
    card.fillStyle(0x030712, isMobile ? 0.78 : 0.65);
    card.fillRoundedRect(cardX, firstY - cardPad, cardW, lastY - firstY + cardPad * 2, 12);

    // ── Font config — mobile: larger + bold italic, no shadow (shadow blur causes mobile blur)
    //                  desktop: italic, gold glow shadow
    const FONT        = "'Palatino Linotype', Palatino, serif";
    const bodySize    = isMobile ? '17px' : '18px';
    const finalSize   = isMobile ? '22px' : '24px';
    const bodyStyle   = isMobile ? 'bold italic' : 'italic';
    const finalStyle  = isMobile ? 'bold' : 'italic';
    // Shadow only on desktop — blur smears text on mobile high-DPI canvas
    const textShadow  = isMobile
      ? undefined
      : { offsetX: 0, offsetY: 0, color: 'rgba(252,211,77,0.30)', blur: 10, fill: true };

    const lines = [
      { text: 'A cosmic storm tore through the galaxy without warning.',                                       y: H * 0.20 },
      { text: "Joao and Elina's ship split in two.",                                                           y: H * 0.32 },
      { text: 'She drifted toward the legendary Ice-Cream Planet — ice cream in hand, completely unbothered.', y: H * 0.44 },
      { text: 'Classic Elina.',                                                                                y: H * 0.58 },
      { text: 'He has to find her.',                                                                           y: H * 0.69, isFinal: true },
    ];

    const textObjs = [card];

    const typeNextLine = (idx) => {
      if (idx >= lines.length) {
        const hint = this.add.text(textX, H * 0.82, 'tap / space to continue', {
          fontSize: isMobile ? '14px' : '13px',
          fontFamily: FONT,
          fontStyle: isMobile ? 'bold italic' : 'italic',
          color: '#818cf8',
          letterSpacing: 1,
          resolution: dpr,
        }).setDepth(21).setAlpha(0);
        this.tweens.add({ targets: hint, alpha: 1, duration: 400, delay: 300 });
        this.tweens.add({ targets: hint, alpha: 0.2, duration: 700, yoyo: true, repeat: -1, delay: 700 });

        const dismiss = () => {
          this.input.off('pointerdown', dismiss);
          this.input.keyboard.off('keydown-SPACE', dismiss);
          textObjs.forEach(t => { if (t && t.destroy) t.destroy(); });
          hint.destroy();
          if (onDone) onDone();
        };
        this.input.on('pointerdown', dismiss);
        this.input.keyboard.on('keydown-SPACE', dismiss);
        return;
      }

      const { text, y, isFinal } = lines[idx];
      const cfg = {
        fontSize:     isFinal ? finalSize : bodySize,
        fontFamily:   FONT,
        fontStyle:    isFinal ? finalStyle : bodyStyle,
        color:        isFinal ? '#fcd34d' : '#ffffff',
        letterSpacing: isFinal ? (isMobile ? 1 : 3) : 0,
        wordWrap:     { width: maxW },
        lineSpacing:  isMobile ? 8 : 6,
        resolution:   dpr,
      };
      if (textShadow) cfg.shadow = textShadow;
      const t = this.add.text(textX, y, '', cfg).setDepth(21).setAlpha(0);
      textObjs.push(t);

      this.tweens.add({ targets: t, alpha: 1, duration: 300 });
      this._typeWords(t, text, 65, () => {
        this.time.delayedCall(140, () => typeNextLine(idx + 1));
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

    // ── Deep-space background
    const bg = this.add.graphics().setDepth(0);
    bg.fillStyle(0x010614, 1);
    bg.fillRect(0, 0, W, H);

    // ── Distant nebula wisps (subtle atmosphere behind everything)
    const nebula = this.add.graphics().setDepth(1);
    nebula.fillStyle(0x1e1b4b, 0.22); nebula.fillEllipse(W * 0.15, H * 0.5, W * 0.55, H * 0.65);
    nebula.fillStyle(0x312e81, 0.12); nebula.fillEllipse(W * 0.25, H * 0.35, W * 0.40, H * 0.50);
    nebula.fillStyle(0x4c1d95, 0.09); nebula.fillEllipse(W * 0.70, H * 0.70, W * 0.45, H * 0.40);
    nebula.fillStyle(0x831843, 0.07); nebula.fillEllipse(W * 0.60, H * 0.20, W * 0.35, H * 0.30);
    // Slow nebula breathe
    this.tweens.add({ targets: nebula, alpha: 0.55, duration: 5000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // ── Layered starfield — more stars, 3 depth layers
    const stars1 = this.add.graphics().setDepth(2);
    const stars2 = this.add.graphics().setDepth(3);
    const stars3 = this.add.graphics().setDepth(4);
    this._drawStars(stars1, 280, W, H);   // deep background stars
    this._drawStars(stars2, 140, W, H);   // mid-layer
    this._drawStars(stars3, 60,  W, H);   // bright foreground specks
    // Offset twinkle phases so layers cycle independently
    this.tweens.add({ targets: stars2, alpha: 0.45, duration: 2200, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: stars3, alpha: 0.30, duration: 3100, yoyo: true, repeat: -1, delay: 800 });

    // ── Amber planet — rich glow
    const planet = this.add.graphics().setDepth(5);
    planet.fillStyle(0x92400e, 0.08); planet.fillCircle(W * 0.82, H * 0.22, 340);
    planet.fillStyle(0xd97706, 0.14); planet.fillCircle(W * 0.82, H * 0.22, 240);
    planet.fillStyle(0xf59e0b, 0.09); planet.fillCircle(W * 0.82, H * 0.22, 160);
    planet.fillStyle(0xfbbf24, 0.05); planet.fillCircle(W * 0.82, H * 0.22, 90);

    // ── Cinematic ship — scale responds to screen width ────────────────────
    const shipX = Math.round(W / 2);
    const shipY = Math.round(H / 2 - 10);
    const S     = Math.max(0.52, Math.min(1.0, W / 820));
    this._shipS = S;

    // Engine glow (depth 6 — behind the hull so it shows through nozzles)
    this._engineGlow = this.add.graphics().setDepth(6);
    this._engineGlow.x = shipX;
    this._engineGlow.y = shipY;
    this._drawEngineGlow(this._engineGlow, S);

    // Left half — engine / rear section (depth 7)
    this._shipLeft = this.add.graphics().setDepth(7);
    this._shipLeft.x = shipX;
    this._shipLeft.y = shipY;
    this._drawShipLeftHull(this._shipLeft, S);

    // Right half — nose / cockpit section (depth 7)
    this._shipRight = this.add.graphics().setDepth(7);
    this._shipRight.x = shipX;
    this._shipRight.y = shipY;
    this._drawShipRightHull(this._shipRight, S);

    // Bridge — invisible placeholder; destroyed at explosion to remove the seam
    this._bridge = this.add.graphics().setDepth(8);

    // Engine glow pulses softly while ship drifts
    this.tweens.add({
      targets: this._engineGlow, alpha: 0.50, duration: 900,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    this.cameras.main.fadeIn(900, 3, 7, 18);
    this.time.delayedCall(1000, () => this._beat1());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BEAT 1 — Peaceful drift
  // ─────────────────────────────────────────────────────────────────────────
  _beat1() {
    const all     = [this._shipLeft, this._shipRight, this._engineGlow];
    const allFull = [...all, this._bridge];
    // Gentle rightward drift
    this.tweens.add({ targets: allFull, x: '+=22', duration: 1800, ease: 'Sine.easeInOut' });
    // Slow vertical bob — onComplete drives the sequence forward
    this.tweens.add({
      targets: allFull, y: '-=8', duration: 900, ease: 'Sine.easeInOut',
      yoyo: true, onComplete: () => this._beat2(),
    });
    // Subtle angle wobble — ship feels alive, engines running
    this.tweens.add({
      targets: all, angle: 1.8, duration: 1700,
      yoyo: true, ease: 'Sine.easeInOut',
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
    const S  = this._shipS || 1.0;
    // Ship center in world space after beat1 drift (x drifted +22, y returned)
    const sx = this._shipLeft.x;
    const sy = this._shipLeft.y;

    // ── Explosion flash at the crack point ─────────────────────────────────
    const boom = this.add.graphics().setDepth(20);
    boom.fillStyle(0x7c3aed, 0.18); boom.fillCircle(sx, sy, 62*S);
    boom.fillStyle(0xf59e0b, 0.52); boom.fillCircle(sx, sy, 40*S);
    boom.fillStyle(0xffffff, 0.95); boom.fillCircle(sx, sy, 22*S);
    this.tweens.add({ targets: boom, alpha: 0, duration: 420, onComplete: () => boom.destroy() });

    this._bridge.destroy();

    // ── Left half (engine) tumbles upper-left ──────────────────────────────
    this.tweens.add({
      targets: [this._shipLeft, this._engineGlow],
      x: '-=290', y: '-=135', angle: -54, alpha: 0.56,
      duration: 1250, ease: 'Sine.easeOut',
    });
    // ── Right half (nose) tumbles lower-right ──────────────────────────────
    this.tweens.add({
      targets: this._shipRight,
      x: '+=230', y: '+=145', angle: 34, alpha: 0.56,
      duration: 1250, ease: 'Sine.easeOut',
    });

    // ── Debris scatter — mix of hull fragments and hot spark debris ─────────
    const debrisData = [
      { dx: -235, dy: -148, angle: -62, size: 18, hot: false },
      { dx:  198, dy:  -94, angle:  46, size: 14, hot: true  },
      { dx: -108, dy:  174, angle: -24, size: 11, hot: false },
      { dx:  272, dy:  132, angle:  74, size: 16, hot: false },
      { dx: -168, dy:   90, angle: -85, size:  9, hot: true  },
      { dx:   70, dy: -196, angle:  39, size: 10, hot: false },
      { dx:  -52, dy:  218, angle: -19, size: 12, hot: false },
      { dx:  138, dy: -152, angle:  54, size:  8, hot: true  },
      { dx: -288, dy:   44, angle: -40, size:  7, hot: false },
      { dx:  166, dy:  192, angle:  80, size:  6, hot: false },
    ];

    debrisData.forEach(({ dx, dy, angle, size, hot }) => {
      const d = this.add.graphics().setDepth(4);
      if (hot) {
        d.fillStyle(0xf59e0b, 1); d.fillCircle(0, 0, size * 0.55);
        d.fillStyle(0xfef3c7, 0.80); d.fillCircle(0, 0, size * 0.25);
      } else {
        d.fillStyle(0x4b5563, 1); d.fillRect(-size/2, -size/2, size, size);
        d.fillStyle(0x92400e, 0.42); d.fillCircle(size/4, size/4, size / 3.5);
      }
      d.x = sx; d.y = sy;
      this.tweens.add({
        targets: d, x: `+=${dx}`, y: `+=${dy}`, angle, alpha: 0,
        duration: Phaser.Math.Between(720, 1450), ease: 'Sine.easeOut',
        onComplete: () => d.destroy(),
      });
    });

    this.time.delayedCall(200, () => this.cameras.main.shake(400, 0.012));
    this.time.delayedCall(1300, () => this._beat4());
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
    // Elina — white suit, pink visor, pink accents (exact landing page match)
    this._drawElinaAstronaut(g, 0, 0, s);
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
          "Also – space has no gravity, but you'll still need to 'jump' over debris. Don't ask why. It's a game thing... Humans love making up rules.",
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
