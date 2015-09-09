var uniqueTileID = 0;
function Tile(position, value, type) {
  this.x                = position.x;
  this.y                = position.y;
  
  this.uniqueID = uniqueTileID++;
  
  /*
      1 - Red
      2 - Blue
      3 - Yellow
      4 - Green
      5 - Orange
      6 - Purple
  */
  this.value            = value || 1;
  
  /*
      1 - Regular
      2 - UpDown Clear
      3 - LeftRight Clear
      4 - Cross
      5 - Hyper
      6 - Clear
  */
  this.type             = type || 1;
  
  this.previousPosition = null;
  this.justDeletedIndex = null;
}

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};
