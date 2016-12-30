const core = require('engine/core');
const loader = require('engine/loader');
const Game = require('engine/Game');

// Requite any systems
const SystemGfx = require('engine/gfx');
const SystemAnime = require('engine/anime');
const SystemInput = require('engine/input');
const SystemPhysic = require('engine/physics');

// Requite anything else you want to use
const BitmapText = require('engine/gfx/BitmapText');
const AnimatedSprite = require('engine/gfx/AnimatedSprite');
const { filmstrip } = require('engine/gfx/utils');

// Loading screen
const Loading = require('game/Loading');

const collision = require('game/collision');

// Load some resources
loader
  .add('KenPixel.fnt')
  .add('bat', 'bat.png');

// A game acts like a scene/screen or whatever you call
class MyGame extends Game {
  constructor() {
    super();

    // FPS for fixed update
    this.desiredFPS = 30;

    // Add systems you want to have
    this
      .addSystem(new SystemAnime())
      .addSystem(new SystemGfx())
      .addSystem(new SystemInput())
      .addSystem(new SystemPhysic());

    // Create some layers
    this.sysGfx
      .createLayer('background')
      .createLayer('entities')
        .createLayer('actors', 'entities')
        .createLayer('fx', 'entities')
        .createLayer('hud', 'entities')
      .createLayer('ui');

    // Add some gfx elements
    this.text = new collision.MyText();
    this.text.gfx.addTo(this.sysGfx.layers['background']);
    this.text.position.set(core.width / 2 - this.text.gfx.width / 2, core.height / 2 - this.text.gfx.height / 2);
    this.text.gfx.position.set(this.text.position.x, this.text.position.y);

    this.monster = new collision.MyPlayer();
    this.monster.gfx.addTo(this.sysGfx.layers['background']);
    this.monster.position.set(100, 100);
    this.monster.gfx.anchor.set(0.5);
    this.monster.gfx.play('fly');

    console.log(this.monster);

    // Animate something
    // this.sysAnime.tween(this.monster)
    //   .to({ 'position.x': 250 }, 2000)
    //   .to({ 'scale.x': -1 }, 10)
    //   .to({ 'position.x': 50 }, 2000)
    //   .to({ 'scale.x': +1 }, 10)
    //   .repeat(100);

    this.sysInput.bind('SPACE', 'attackAnim');
    this.sysInput.bind('LEFT', 'move_left');
    this.sysInput.bind('RIGHT', 'move_right');
    this.sysInput.bind('UP', 'move_up');
    this.sysInput.bind('DOWN', 'move_down');
  }

  fixedUpdate(dt, sec) {
    if (this.sysInput.pressed('attackAnim')) {
      this.monster.gfx.play('atk').once('finish', () => {
        this.monster.gfx.play('fly');
      });;
    }

    if (this.sysInput.state('move_left')) {
      this.monster.gfx.scale.x = -1;
      this.monster.position.x -= 4;
    }

    if (this.sysInput.state('move_right')) {
      this.monster.gfx.scale.x = 1;
      this.monster.position.x += 4;
    }

    if (this.sysInput.state('move_up')) {
      this.monster.position.y -= 4;
    }

    if (this.sysInput.state('move_down')) {
      this.monster.position.y += 4;
    }

    this.monster.gfx.x = this.monster.position.x;
    this.monster.gfx.y = this.monster.position.y;

    super.fixedUpdate(dt, sec);
  }
}

core.main(MyGame, Loading);
