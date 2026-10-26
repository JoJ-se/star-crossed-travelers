// Star Crossed Travelers — Phaser Game Bootstrap

// Shared soft vignette: a smooth radial fade to dark at the screen edges.
// Built once as a canvas texture and stretched to the viewport, so it has
// no hard bands on any screen shape.
window.addVignette = function (scene, depth, strength) {
  const key = 'sct-vignette';
  if (!scene.textures.exists(key)) {
    const S = 512;
    const tex = scene.textures.createCanvas(key, S, S);
    const ctx = tex.getContext();
    const g = ctx.createRadialGradient(S / 2, S / 2, S * 0.28, S / 2, S / 2, S * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.55, 'rgba(0,0,0,0.18)');
    g.addColorStop(1, 'rgba(0,0,0,0.62)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    tex.refresh();
  }
  const W = scene.scale.width, H = scene.scale.height;
  return scene.add.image(W / 2, H / 2, key)
    .setDisplaySize(W, H)
    .setScrollFactor(0)
    .setDepth(depth)
    .setAlpha(strength == null ? 1 : strength);
};

// Shared soft-light textures (built once per game, reused by every scene).
//   sct-glow  — radial white glow, bright core, smooth falloff (tint + ADD)
//   sct-puff  — softer, flatter cloud puff for nebula gas
//   sct-spark — tiny soft dot for drifting dust / sparks
//   sct-flare — 4-point star flare
window.sctTextures = function (scene) {
  const T = scene.textures;
  const radial = (key, size, stops) => {
    if (T.exists(key)) return;
    const t = T.createCanvas(key, size, size), c = t.getContext(), h = size / 2;
    const g = c.createRadialGradient(h, h, 0, h, h, h);
    stops.forEach(([o, a]) => g.addColorStop(o, `rgba(255,255,255,${a})`));
    c.fillStyle = g; c.fillRect(0, 0, size, size); t.refresh();
  };
  radial('sct-glow',  256, [[0, 1], [0.15, 0.7], [0.4, 0.25], [0.7, 0.06], [1, 0]]);
  radial('sct-puff',  256, [[0, 0.55], [0.35, 0.38], [0.65, 0.14], [0.85, 0.04], [1, 0]]);
  radial('sct-spark', 32,  [[0, 1], [0.3, 0.6], [1, 0]]);
  if (!T.exists('sct-flare')) {
    const S = 128, t = T.createCanvas('sct-flare', S, S), c = t.getContext(), h = S / 2;
    let g = c.createRadialGradient(h, h, 0, h, h, h * 0.35);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, S, S);
    [[S, 3], [3, S]].forEach(([w, hh]) => {
      const lg = w > hh ? c.createLinearGradient(0, 0, S, 0) : c.createLinearGradient(0, 0, 0, S);
      lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(0.5, 'rgba(255,255,255,0.9)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = lg; c.fillRect(h - w / 2, h - hh / 2, w, hh);
    });
    t.refresh();
  }
};

// Smooth vertical sky gradient, fixed to the screen. stops: [[offset, css colour], ...]
window.sctSky = function (scene, key, stops, depth) {
  if (!scene.textures.exists(key)) {
    const t = scene.textures.createCanvas(key, 4, 512), c = t.getContext();
    const g = c.createLinearGradient(0, 0, 0, 512);
    stops.forEach(([o, col]) => g.addColorStop(o, col));
    c.fillStyle = g; c.fillRect(0, 0, 4, 512); t.refresh();
  }
  const W = scene.scale.width, H = scene.scale.height;
  return scene.add.image(W / 2, H / 2, key).setDisplaySize(W, H).setScrollFactor(0).setDepth(depth);
};

window.startGame = function () {
  const container = document.getElementById('game-container');
  container.style.display = 'block';

  const dpr = window.devicePixelRatio || 1;

  const config = {
    type: Phaser.AUTO,
    backgroundColor: '#030712',
    parent: 'game-container',
    // In Phaser 3.60+ render properties belong in the render block;
    // resolution here is what actually drives the canvas pixel density.
    render: {
      antialias: true,
      antialiasGL: true,
      pixelArt: false,
      roundPixels: false,
      resolution: dpr,
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 480 },
        debug: false,
      },
    },
    scene: [IntroCutscene, Level1, Level2, Level3, CosmicTeaPlanet, Level4],
  };

  const game = new Phaser.Game(config);

  // Safety net: if the canvas is still at 1× after Phaser finishes booting
  // (can happen when Scale.RESIZE reinitialises before the render resolution
  // is fully committed), force the renderer to re-apply the DPR multiplier.
  if (dpr > 1) {
    game.events.once('ready', () => {
      const W = game.scale.width;
      const H = game.scale.height;
      if (game.canvas.width < Math.round(W * dpr) - 2) {
        game.renderer.resize(W, H);
      }
      // Ensure the CSS size stays at logical pixels so the browser
      // does not apply an extra scaling pass on top of DPR.
      game.canvas.style.width  = W + 'px';
      game.canvas.style.height = H + 'px';
    });
  }
};
