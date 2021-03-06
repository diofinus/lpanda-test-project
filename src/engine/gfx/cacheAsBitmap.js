const Node = require('./core/Node');
const { Matrix } = require('./core/math');
const RenderTexture = require('./core/textures/RenderTexture');
const Sprite = require('./core/sprites/Sprite');
const _tempMatrix = new Matrix();

Node.prototype._cacheAsBitmap = false;
Node.prototype._originalRenderWebGL = null;
Node.prototype._originalRenderCanvas = null;

Node.prototype._originalUpdateTransform = null;
Node.prototype._originalHitTest = null;
Node.prototype._originalDestroy = null;
Node.prototype._cachedSprite = null;

Object.defineProperties(Node.prototype, {
  /**
   * Set this to true if you want this display object to be cached as a bitmap.
   * This basically takes a snap shot of the display object as it is at that moment. It can provide a performance benefit for complex static displayObjects.
   * To remove simply set this property to 'false'
   *
   * @member {boolean}
   * @memberof Node#
   */
  cacheAsBitmap: {
    get: function() {
      return this._cacheAsBitmap;
    },
    set: function(value) {
      if (this._cacheAsBitmap === value) {
        return;
      }

      this._cacheAsBitmap = value;

      if (value) {
        this._originalRenderWebGL = this.renderWebGL;
        this._originalRenderCanvas = this.renderCanvas;

        this._originalUpdateTransform = this.updateTransform;
        this._originalGetBounds = this.getBounds;

        this._originalDestroy = this.destroy;

        this._originalContainsPoint = this.containsPoint;

        this.renderWebGL = this._renderCachedWebGL;
        this.renderCanvas = this._renderCachedCanvas;

        this.destroy = this._cacheAsBitmapDestroy;

      }
      else {
        if (this._cachedSprite) {
          this._destroyCachedDisplayObject();
        }

        this.renderWebGL = this._originalRenderWebGL;
        this.renderCanvas = this._originalRenderCanvas;
        this.getBounds = this._originalGetBounds;

        this.destroy = this._originalDestroy;

        this.updateTransform = this._originalUpdateTransform;
        this.containsPoint = this._originalContainsPoint;
      }
    },
  },
});
/**
* Renders a cached version of the sprite with WebGL
*
* @param {WebGLRenderer} renderer the WebGL renderer
* @private
*/
Node.prototype._renderCachedWebGL = function(renderer) {
  if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
    return;
  }

  this._initCachedDisplayObject(renderer);

  this._cachedSprite.worldAlpha = this.worldAlpha;

  renderer.setObjectRenderer(renderer.plugins.sprite);
  renderer.plugins.sprite.render(this._cachedSprite);
};

/**
* Prepares the WebGL renderer to cache the sprite
*
* @param {WebGLRenderer} renderer the WebGL renderer
* @private
*/
Node.prototype._initCachedDisplayObject = function(renderer) {
  if (this._cachedSprite) {
    return;
  }

  // first we flush anything left in the renderer (otherwise it would get rendered to the cached texture)
  renderer.currentRenderer.flush();
  // this.filters= [];
  // next we find the dimensions of the untransformed object
  // this function also calls updatetransform on all its children as part of the measuring. This means we don't need to update the transform again in this function
  // TODO pass an object to clone too? saves having to create a new one each time!
  var bounds = this.getLocalBounds().clone();

  // add some padding!
  if (this._filters) {
    var padding = this._filters[0].padding;
    bounds.x -= padding;
    bounds.y -= padding;

    bounds.width += padding * 2;
    bounds.height += padding * 2;
  }

  // for now we cache the current renderTarget that the webGL renderer is currently using.
  // this could be more elegent..
  var cachedRenderTarget = renderer.currentRenderTarget;
  // We also store the filter stack - I will definitely look to change how this works a little later down the line.
  var stack = renderer.filterManager.filterStack;

  // this renderTexture will be used to store the cached Node
  var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0);

  // need to set
  var m = _tempMatrix;

  m.tx = -bounds.x;
  m.ty = -bounds.y;



  // set all properties to there original so we can render to a texture
  this.renderWebGL = this._originalRenderWebGL;

  renderTexture.render(this, m, true, true);

  // now restore the state be setting the new properties
  renderer.setRenderTarget(cachedRenderTarget);
  renderer.filterManager.filterStack = stack;

  this.renderWebGL = this._renderCachedWebGL;
  this.updateTransform = this.displayObjectUpdateTransform;
  this.getBounds = this._getCachedBounds;


  // create our cached sprite
  this._cachedSprite = new Sprite(renderTexture);
  this._cachedSprite.worldTransform = this.worldTransform;
  this._cachedSprite.anchor.x = -(bounds.x / bounds.width);
  this._cachedSprite.anchor.y = -(bounds.y / bounds.height);

  // restore the transform of the cached sprite to avoid the nasty flicker..
  this.updateTransform();

  // map the hit test..
  this.containsPoint = this._cachedSprite.containsPoint.bind(this._cachedSprite);
};

/**
* Renders a cached version of the sprite with canvas
*
* @param {CanvasRenderer} renderer the Canvas renderer
* @private
*/
Node.prototype._renderCachedCanvas = function(renderer) {
  if (!this.visible || this.worldAlpha <= 0 || !this.renderable) {
    return;
  }

  this._initCachedDisplayObjectCanvas(renderer);

  this._cachedSprite.worldAlpha = this.worldAlpha;

  this._cachedSprite.renderCanvas(renderer);
};

// TODO this can be the same as the webGL verison.. will need to do a little tweaking first though..
/**
* Prepares the Canvas renderer to cache the sprite
*
* @param {CanvasRenderer} renderer the Canvas renderer
* @private
*/
Node.prototype._initCachedDisplayObjectCanvas = function(renderer) {
  if (this._cachedSprite) {
    return;
  }

    // get bounds actually transforms the object for us already!
  var bounds = this.getLocalBounds();

  var cachedRenderTarget = renderer.context;

  var renderTexture = new RenderTexture(renderer, bounds.width | 0, bounds.height | 0);

    // need to set //
  var m = _tempMatrix;

  m.tx = -bounds.x;
  m.ty = -bounds.y;

  // set all properties to there original so we can render to a texture
  this.renderCanvas = this._originalRenderCanvas;

  renderTexture.render(this, m, true);

  // now restore the state be setting the new properties
  renderer.context = cachedRenderTarget;

  this.renderCanvas = this._renderCachedCanvas;
  this.updateTransform = this.displayObjectUpdateTransform;
  this.getBounds = this._getCachedBounds;


  // create our cached sprite
  this._cachedSprite = new Sprite(renderTexture);
  this._cachedSprite.worldTransform = this.worldTransform;
  this._cachedSprite.anchor.x = -(bounds.x / bounds.width);
  this._cachedSprite.anchor.y = -(bounds.y / bounds.height);

  this.updateTransform();

  this.containsPoint = this._cachedSprite.containsPoint.bind(this._cachedSprite);
};

/**
* Calculates the bounds of the cached sprite
* @private
* @return {Rectangle} Bounds of this object
*/
Node.prototype._getCachedBounds = function() {
  this._cachedSprite._currentBounds = null;

  return this._cachedSprite.getBounds();
};

/**
* Destroys the cached sprite.
*
* @private
*/
Node.prototype._destroyCachedDisplayObject = function() {
  this._cachedSprite._texture.destroy();
  this._cachedSprite = null;
};

Node.prototype._cacheAsBitmapDestroy = function() {
  this.cacheAsBitmap = false;
  this._originalDestroy();
};
