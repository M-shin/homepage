function Grid(size) {
  this.size = size;

  this.cells = [];
  this.justDeleted = null;
  this.build();
}

// Build a grid of the specified size
Grid.prototype.build = function () {
  for (var x = 0; x < this.size; x++) {
    var row = this.cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(null);
    }
  }
};

// Find the first available random position
Grid.prototype.randomAvailableCell = function () {
  var cells = this.availableCells();

  if (cells.length) {
    return cells[Math.floor(Math.random() * cells.length)];
  } else {
      return null;
  }
  
};

Grid.prototype.availableCells = function () {
  var cells = [];

  this.eachCell(function (x, y, tile) {
    if (!tile) {
      cells.push({ x: x, y: y });
    }
  });

  return cells;
};

// Call callback for every cell
Grid.prototype.eachCell = function (callback) {
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      callback(x, y, this.cells[x][y]);
    }
  }
};

// Check if there are any cells available
Grid.prototype.cellsAvailable = function () {
  return !!this.availableCells().length;
};

// Check if the specified cell is taken
Grid.prototype.cellAvailable = function (cell) {
  return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function (cell) {
  return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {
  if (this.withinBounds(cell)) {
    return this.cells[cell.x][cell.y];
  } else {
    return null;
  }
};

// Inserts a tile at its position
Grid.prototype.insertTile = function (tile) {
  this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.handleRemove = function(tile, process, manager, scoreMultiplier, index) {
    index = index || 0;
    scoreMultiplier = scoreMultiplier || 1;
    var powerUpMultipliers = [1.3, 1.4, 1.5, 1.7];
    var baseWorth = 3;
    if(tile.type == 1 || process === false){        //Normal Tile or Already has been processed
        this.removeTile(tile, false, index);
        manager.score += Math.floor(baseWorth * scoreMultiplier)
    } else if(tile.type == 2){                      //Up Down Tile
        this.handleRemove(tile, false, manager, scoreMultiplier * powerUpMultipliers[0], index);
        for(var row = tile.y+1; row < this.size; row++){
            if(this.cells[tile.x][row]) {
                this.handleRemove(this.cells[tile.x][row], true, manager, scoreMultiplier * powerUpMultipliers[0], index + row - tile.y);
            }
        }
        for(var row = tile.y-1; row >= 0; row--){
            if(this.cells[tile.x][row]) {
                this.handleRemove(this.cells[tile.x][row], true, manager, scoreMultiplier * powerUpMultipliers[0], index + tile.y - row);
            }
        }
    } else if(tile.type == 3){                      //Left Right Tile
        this.handleRemove(tile, false, manager, scoreMultiplier * powerUpMultipliers[0], index);
        for(var col = tile.x + 1; col < this.size; col++){
            if(this.cells[col][tile.y]){
                this.handleRemove(this.cells[col][tile.y], true, manager, scoreMultiplier * powerUpMultipliers[0], index + col - tile.x);
            }
        }
        for(var col = tile.x - 1; col >= 0; col--){
            if(this.cells[col][tile.y]){
                this.handleRemove(this.cells[col][tile.y], true, manager, scoreMultiplier * powerUpMultipliers[0], index + tile.x - col);
            }
        }
    } else if(tile.type == 4){                      //Up Down Left Right Tile
        this.handleRemove(tile, false, manager, scoreMultiplier * powerUpMultipliers[1], index);
        for(var row = tile.y+1; row < this.size; row++){
            if(this.cells[tile.x][row]) {
                this.handleRemove(this.cells[tile.x][row], true, manager, scoreMultiplier * powerUpMultipliers[0], index + row - tile.y);
            }
        }
        for(var row = tile.y-1; row >= 0; row--){
            if(this.cells[tile.x][row]) {
                this.handleRemove(this.cells[tile.x][row], true, manager, scoreMultiplier * powerUpMultipliers[0], index + tile.y - row);
            }
        }
        for(var col = tile.x + 1; col < this.size; col++){
            if(this.cells[col][tile.y]){
                this.handleRemove(this.cells[col][tile.y], true, manager, scoreMultiplier * powerUpMultipliers[0], index + col - tile.x);
            }
        }
        for(var col = tile.x - 1; col >= 0; col--){
            if(this.cells[col][tile.y]){
                this.handleRemove(this.cells[col][tile.y], true, manager, scoreMultiplier * powerUpMultipliers[0], index + tile.x - col);
            }
        }
    } else if(tile.type == 5){                      //Remove all of this value tile (Hyper Tile)
        var iCount = 1;
        this.handleRemove(tile, false, manager, scoreMultiplier * powerUpMultipliers[2], index);
        for(var row = 0; row < this.size; row++){
            for(var col = 0; col < this.size; col++){
                if(this.cells[row][col] && tile.value === this.cells[row][col].value){
                    this.handleRemove(this.cells[row][col], true, manager, scoreMultiplier *powerUpMultipliers[2], index + iCount);
                    iCount++;
                }
            }
        }
    }
}

Grid.prototype.removeTile = function(tile, actual, index) {
    var self = this;
    if(tile){
        //Check if the justDeleted array is null. If it is, then create new one.
      if(!self.justDeleted){
          self.justDeleted = [];
      }
      
      //Checks if the program wants an animation for the tile remove. When actual is true, it means no animation
      if(!actual) {
          if(self.justDeleted.indexOf(tile) == -1){
            self.justDeleted.push(tile);
            tile.justDeletedIndex = index;
          }else{
              tile.justDeletedIndex = tile.justDeletedIndex < index ? index : tile.justDeletedIndex;
          }
      }
      
      
      self.cells[tile.x][tile.y] = null;
    }
};

Grid.prototype.removeColumn = function(column) {
  for(var row = 0; row < this.size; row++){
      if(this.cells[column][row]){
          this.removeTile(this.cells[column][row]);
      }
  }  
};

Grid.prototype.removeRow = function(row) {
    for(var column = 0; column < this.size; column++){
        if(this.cells[column][row]){
            this.removeTile(this.cells[column][row]);
        }
    }
};

Grid.prototype.purgeJustDeleted = function(){
    this.justDeleted = [];
}

Grid.prototype.withinBounds = function (position) {
  return position.x >= 0 && position.x < this.size &&
         position.y >= 0 && position.y < this.size;
};
