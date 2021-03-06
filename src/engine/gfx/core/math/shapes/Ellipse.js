var Rectangle = require('./Rectangle'),
  CONST = require('../../../const');

/**
 * The Ellipse object can be used to specify a hit area for displayObjects
 *
 * @class
 */
class Ellipse {
  /**
   * @constructor
   * @param {number} x      The X coordinate of the center of the ellipse
   * @param {number} y      The Y coordinate of the center of the ellipse
   * @param {number} width  The half width of this ellipse
   * @param {number} height The half height of this ellipse
   */
  constructor(x = 0, y = 0, width = 0, height = 0) {
    /**
     * @member {number}
     * @default 0
     */
    this.x = x;

    /**
     * @member {number}
     * @default 0
     */
    this.y = y;

    /**
     * @member {number}
     * @default 0
     */
    this.width = width;

    /**
     * @member {number}
     * @default 0
     */
    this.height = height;

    /**
     * The type of the object, mainly used to avoid `instanceof` checks
     *
     * @member {number}
     */
    this.type = CONST.SHAPES.ELIP;
  }

  /**
   * Creates a clone of this Ellipse instance
   *
   * @return {Ellipse} a copy of the ellipse
   */
  clone() {
    return new Ellipse(this.x, this.y, this.width, this.height);
  }

  /**
   * Checks whether the x and y coordinates given are contained within this ellipse
   *
   * @param {number} x The X coordinate of the point to test
   * @param {number} y The Y coordinate of the point to test
   * @return {boolean} Whether the x/y coords are within this ellipse
   */
  contains(x, y) {
    if (this.width <= 0 || this.height <= 0) {
      return false;
    }

      // normalize the coords to an ellipse with center 0,0
    var normx = ((x - this.x) / this.width),
      normy = ((y - this.y) / this.height);

    normx *= normx;
    normy *= normy;

    return (normx + normy <= 1);
  }

  /**
   * Returns the framing rectangle of the ellipse as a Rectangle object
   *
   * @return {Rectangle} the framing rectangle
   */
  getBounds() {
    return new Rectangle(this.x - this.width, this.y - this.height, this.width, this.height);
  }
}

module.exports = Ellipse;
