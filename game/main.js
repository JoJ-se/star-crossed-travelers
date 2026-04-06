// Star Crossed Travelers — Phaser Game Bootstrap

window.startGame = function () {
  const container = document.getElementById('game-container');
  container.style.display = 'block';

  const config = {
    type: Phaser.AUTO,
    backgroundColor: '#030712',
    parent: 'game-container',
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

  new Phaser.Game(config);
};
