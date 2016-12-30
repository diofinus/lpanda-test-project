const Entity = require('engine/Entity');
const { getGroupMask } = require('engine/physics');
const BitmapText = require('engine/gfx/BitmapText');
const AnimatedSprite = require('engine/gfx/AnimatedSprite');
const { filmstrip } = require('engine/gfx/utils');
const loader = require('engine/loader');
const Collider = require('engine/physics/Collider');

const PlayerGroup = getGroupMask(1);
const SolidGroup = getGroupMask(3);

class MyPlayer extends Entity {
  constructor(x, y, s) {
    super(x, y, s);

    this.gfx = AnimatedSprite({
      textures: filmstrip(loader.resources['bat'].texture, 51, 57),
      anims: [
        ['fly', [0,1,2,3,4], { speed: 10 }],
        ['atk', [5,6,7], { speed: 8, loop: false }],
        ['hurt', [8,9,8,9,8,9], { speed: 8, loop: false }],
        ['kill', [10,11,12,13], { speed: 8, loop: false }],
      ],
    });

    this.coll = Collider({
      shape: 'Box',
      width: 51,
      height: 57,
      collisionGroup: PlayerGroup,
      collideAgainst: SolidGroup,
      collide: (other) => {
        console.log(other.collisionGroup);
        if (other.collisionGroup === SolidGroup) {
          // Always push player back when collide against a "solid" thing
          return true;
        }
      }
    });
  }
}

class MyText extends Entity {
  constructor(x, y, s) {
    super(x, y, s);

    this.gfx = BitmapText({
      text: 'It Works! GG!',
      font: '32px KenPixel',
    });

    this.coll = Collider({
      shape: 'Box',
      width: this.gfx.width,
      height: this.gfx.height,
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

module.exports = {MyPlayer, MyText};