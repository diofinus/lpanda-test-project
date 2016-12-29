const Entity = require('engine/Entity');
const { addCollider, getGroupMask } = require('engine/physics');
const AnimatedSprite = require('engine/gfx/AnimatedSprite');
const { filmstrip } = require('engine/gfx/utils');
const loader = require('engine/loader');

const PlayerGroup = getGroupMask(1);
const CoinGroup = getGroupMask(2);
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
    })

    this.coll = addCollider({
      shape: 'Box',
      width: 20,
      height: 20,
      collisionGroup: PlayerGroup,
      collideAgainst: CoinGroup | SolidGroup,
      collide: (other) => {
        if (other.collisionGroup === CoinGroup) {
          this.collectCoin(1);
          // Return false so this collider with not be push by the coin
          return false;
        }
        else if (other.collisionGroup === SolidGroup) {
          // Always push player back when collide against a "solid" thing
          return true;
        }
      },
    });
  }
}

module.exports = MyPlayer;