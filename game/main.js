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
