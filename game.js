const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#87CEEB',
  parent: 'gameContainer',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 900 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let platforms;
let spikes;
let stars;
let score = 0;
let scoreText;
let gameOver = false;

let jumpCount = 0;
const maxJumps = 2;

function preload() {
  this.load.image('ground', 'https://i.imgur.com/3p640KC.png');
  this.load.image('platform', 'https://i.imgur.com/3p640KC.png');
  this.load.spritesheet('player', 'https://i.imgur.com/Adb6pKq.png', { frameWidth: 32, frameHeight: 48 });
  this.load.image('spike', 'https://i.imgur.com/UcJy8RY.png');
  this.load.image('star', 'https://i.imgur.com/sz7H6Ag.png');
}

function create() {
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 580, 'ground').setScale(2).refreshBody();
  platforms.create(600, 450, 'platform');
  platforms.create(50, 350, 'platform');
  platforms.create(750, 300, 'platform');
  platforms.create(400, 200, 'platform');

  spikes = this.physics.add.staticGroup();
  spikes.create(300, 565, 'spike');
  spikes.create(500, 565, 'spike');
  spikes.create(700, 565, 'spike');

  stars = this.physics.add.group({
    key: 'star',
    repeat: 5,
    setXY: { x: 12, y: 0, stepX: 140 }
  });

  stars.children.iterate(function(child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.5));
  });

  player = this.physics.add.sprite(100, 450, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.collider(spikes, platforms);

  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.overlap(player, spikes, hitSpike, null, this);

  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  this.anims.create({
    key: 'turn',
    frames: [ { key: 'player', frame: 4 } ],
    frameRate: 20
  });

  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  scoreText = this.add.text(16, 16, 'النقاط: 0', { fontSize: '32px', fill: '#fff' }).setScrollFactor(0);
}

function update() {
  if (gameOver) {
    return;
  }

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('left', true);
  }
  else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('right', true);
  }
  else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  if (player.body.touching.down) {
    jumpCount = 0;
  }

  if (Phaser.Input.Keyboard.JustDown(cursors.up) && jumpCount < maxJumps) {
    player.setVelocityY(-480);
    jumpCount++;
  }

  if (player.y < 100 && !gameOver) {
    gameOver = true;
    scoreText.setText('مبروك! أكملت المستوى، النقاط: ' + score);
    this.physics.pause();
    setTimeout(() => {
      this.scene.restart();
      gameOver = false;
      score = 0;
      scoreText.setText('النقاط: 0');
    }, 4000);
  }
}

function collectStar(player, star) {
  star.disableBody(true, true);
  score += 10;
  scoreText.setText('النقاط: ' + score);
}

function hitSpike(player, spike) {
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play('turn');
  gameOver = true;
  scoreText.setText('خسرت! حاول مرة أخرى.');
  setTimeout(() => {
    this.scene.restart();
    gameOver = false;
    score = 0;
    scoreText.setText('النقاط: 0');
  }, 3000);
}
