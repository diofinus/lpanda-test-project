const core = require('engine/core');
const loader = require('engine/loader');
const Game = require('engine/Game');

// Requite any systems
const SystemGfx = require('engine/gfx');
const SystemAnime = require('engine/anime');
const SystemInput = require('engine/input');
const SystemPhysic = require('engine/physics');
const AABBSolver = require('engine/physics/AABBSolver');

// Requite anything else you want to use
const BitmapText = require('engine/gfx/BitmapText');
const AnimatedSprite = require('engine/gfx/AnimatedSprite');
const { filmstrip } = require('engine/gfx/utils');

// Loading screen
const Loading = require('game/Loading');

const Entity = require('engine/Entity');
const { getGroupMask } = require('engine/physics');
const Collider = require('engine/physics/Collider');
const Graphics = require('engine/gfx/Graphics');

const PlayerGroup = getGroupMask(0);
const SolidGroup = getGroupMask(1);

// Load some resources
loader
  .add('KenPixel.fnt')
  .add('bat', 'bat.png');

class MyPlayer extends Entity {
  constructor(x, y, s) {
    super(x, y, null);

    this.gfx = AnimatedSprite({
      textures: filmstrip(loader.resources['bat'].texture, 51, 57),
      anims: [
        ['fly', [0,1,2,3,4], { speed: 10 }],
        ['atk', [5,6,7], { speed: 8, loop: false }],
        ['hurt', [8,9,8,9,8,9], { speed: 8, loop: false }],
        ['kill', [10,11,12,13], { speed: 8, loop: false }],
      ],
    });

    console.log(SolidGroup);

    this.coll = Collider({
      shape: 'Box',
      width: this.gfx.width,
      height: this.gfx.width,
      collisionGroup: PlayerGroup,
      collideAgainst: SolidGroup,
      collide: (other) => {
        if (other.collisionGroup === SolidGroup) {
          // Always push player back when collide against a "solid" thing
          return true;
        }
      }
    });
  }
}

class MyBox extends Entity {
  constructor(x, y, s = {}) {
    super(x, y, null);

    this.gfx = Graphics({
      shape: 'Box',
      width: s.width || 100,
      height: s.height || 50,
      color: s.color || 0xff2f62,
    });

    this.coll = Collider({
      shape: 'Box',
      width: this.gfx.width,
      height: this.gfx.height,
      isStatic: true,
      collisionGroup: SolidGroup,
      collideAgainst: PlayerGroup,
      collide: (other) => {
        if (other.collisionGroup === PlayerGroup) {
          // Always push player back when collide against a "solid" thing
          return true;
        }
      }
    });
  }
}

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
      .addSystem(new SystemPhysic({
        // Physics always requires a collision solver
        solver: new AABBSolver()
      }));

    // Create some layers
    this.sysGfx
      .createLayer('background')
      .createLayer('entities')
        .createLayer('actors', 'entities')
      .createLayer('ui');

    // Add some gfx elements
    this.text = this.spawnEntity(MyBox, core.width / 2, core.height / 2, 'actors');

    this.monster = this.spawnEntity(MyPlayer, 100, 100, 'actors');
    this.monster.gfx.anchor.set(0.5);
    this.monster.gfx.play('fly');

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
