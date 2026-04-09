// Star Crossed Travelers — Phaser Game Bootstrap

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
