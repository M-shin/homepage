function GameManager(size, InputManager, Actuator, ScoreManager, HelperFunctions) {
  this.size = size; // Size of the grid
  this.inputManager = new InputManager;
  this.scoreManager = new ScoreManager;
  this.actuator = new Actuator;
  this.helperFunctions = new HelperFunctions;

  this.startTiles = 2;


  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("addToLeaderboard", this.addToLeaderboard.bind(this));
  this.inputManager.on("selectNewMode", this.restartNewMode.bind(this));

  this.helperFunctions.setupInputManagement(this.inputManager);


  /*
     Game Modes: 
     1 - Free play - The Best Spammers
     2 - Hard Mode (Move Gated) - The Efficient Sliders
     3 - Hard Mode (Time Gated) - The Quickest Thinkers
     4 - Rave Mode - The Hardest Partiers
    */
  this.determineGameMode();
}

// Add to the leaderboard
GameManager.prototype.addToLeaderboard = function () {
  this.helperFunctions.addToLeaderboard(this.score, this.gameMode, this.alreadySubmitted, false, this.helperFunctions);
  this.alreadySubmitted = true;
};

GameManager.prototype.restart = function () {
  this.actuator.continue();
  this.setup(this.gameMode);
};

// Restart the game
GameManager.prototype.restartNewMode = function () {
  this.actuator.continue();
  this.determineGameMode();
};

GameManager.prototype.isGameTerminated = function () {
  if (this.over) {
    return true;
  } else {
    return false;
  }
};

// Set up the game
GameManager.prototype.setup = function (gameMode) {

  this.grid = new Grid(this.size);
  this.level = 1;

  this.numMoves = 0;
  this.numMovesByLevel = [0, 15, 15, 20, 25, 25, 30, 30, 30, 30, 30, 30];

  this.elapsedTime = 0;
  this.elapsedTimeByLevel = [0, 15000, 10000, 10000, 10000, 10000, 20000, 10000, 20000, 20000];
  this.timerInterval = 50;
  this.addTime = 0;

  this.score = 0;
  this.nextLevelEXP = [0, 50, 150, 200, 350, 350, 350, 400, 400, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500];

  (function (arrs) {
    for (var h = 0; h < arrs.length; h++) {
      var arr = arrs[h];
      for (var i = 1; i < arr.length; i++) {
        var s = 0;
        for (var j = i - 1; j <= i; j++) {
          s += arr[j];
        }
        arr[i] = s;
      }
    }
  })([this.numMovesByLevel, this.elapsedTimeByLevel, this.nextLevelEXP]);

  this.over = false;
  this.timeout = false;

  this.alreadySubmitted = false;

  this.gameMode = gameMode;
  this.colorStandardsArray = ['#007dff', '#25d500', '#ff7400', '#bf3030', '#ffdf00', '#8805a8', '#ffffff', '#000000'];
  this.colorStandards = {
    r: this.colorStandardsArray[0],
    y: this.colorStandardsArray[1],
    g: this.colorStandardsArray[2],
    b: this.colorStandardsArray[3],
    o: this.colorStandardsArray[4],
    p: this.colorStandardsArray[5],
    w: this.colorStandardsArray[6],
    bl: this.colorStandardsArray[7]
  };
  this.containerOpacity = 0.8;

  this.colorHandler(this);

  if (this.gameMode == 1) {} else if (this.gameMode == 2) {
    this.setupTimer();
  } else if (this.gameMode == 3) {} else if (this.gameMode == 4) {
    this.raveInterval = 300;
    this.enterRaveMode();
  }

  this.addStartTiles();

  this.actuate(true);


};
GameManager.prototype.setupTimer = function () {
  var self = this;
  self.timerIntervalID = setInterval(self.updateTimer, self.timerInterval, self);
}
GameManager.prototype.updateTimer = function (self) {
  if (self.addTime && self.addTime > 0) {
    self.elapsedTime -= self.addTime;
    self.addTime = 0;
  }
  self.elapsedTime += self.timerInterval;
  if (self.elapsedTime >= self.elapsedTimeByLevel[self.level]) {
    self.over = true;
    self.actuate();
  } else {
    self.actuator.updateTimeContainer(self.elapsedTimeByLevel[self.level] - self.elapsedTime, self.actuator);
  }
  //console.log(self.timeFormat(self.currentTime));
}

GameManager.prototype.determineGameMode = function (error) {
  var self = this;
  var mode;
  vex.dialog.buttons.YES.text = "Go";
  vex.dialog.open({
    message: "Please select a <strong>Game Mode</strong>.<br><br>For <strong>first timers</strong>, Free Play mode is recommended." + (error ? '<br><span class="error-message">Please Select a Game Mode!</span>' : '') + '<hr>',
    input: '<label for="rd1"><input type="radio" id="rd1" name="modes" value="1">Free Play</input></label><br>\n' +
      '<label for="rd2"><input type="radio" id="rd2" name="modes" value="2">Hard Mode (Timed)</input></label><br>\n' +
      '<label for="rd3"><input type="radio" id="rd3" name="modes" value="3">Hard Mode (Move Limited)</input></label><br>\n' +
      '<label for="rd4"><input type="radio" id="rd4" name="modes" value="4">Rave Mode</input></label><br>',
    buttons: [vex.dialog.buttons.YES],
    escapeButtonCloses: false,
    overlayClosesOnClick: false,
    callback: function (data) {
      if (data.modes) {
        self.setup(data.modes);
      } else {
        self.determineGameMode(true);
      }
    }
  });
  return mode;
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

GameManager.prototype.addRandomTile = function () {

  if (this.grid.cellsAvailable()) {

    var n = 0;
    var tile = null;
    do {
      if (tile) {
        this.grid.removeTile(tile, true);
      }
      tile = this.getRandomTile(this.nextTile);
      this.grid.insertTile(tile);
      n += 1
    } while (this.threeIARExists(this.grid) && n <= 10);

    this.nextTile = Math.floor(Math.random() * Math.min(2 + this.level, 6)) + 1;
  }
};

GameManager.prototype.getRandomTile = function (val) {
  var cap = Math.min(2 + this.level, 6);
  var value = val || Math.floor(Math.random() * cap) + 1;
  var typeGen = Math.random();
  var type = 0;
  if (typeGen >= 0.1) {
    type = 1;
  } else if (typeGen >= 0.05) {
    type = Math.random() >= 0.5 ? 2 : 3;
  } else if (typeGen >= 0.0125) {
    type = 4;
  } else {
    type = 5;
  }
  var tile = new Tile(this.grid.randomAvailableCell(), value, type);
  return tile;
}

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function (newGame) {
  if (this.scoreManager.get(this.gameMode) < this.score) {
    this.scoreManager.set(this.gameMode, this.score);
  }
  if (this.elapsedTime - this.elapsedTimeByLevel[this.level] === 0) {
    this.timeout = true;
  }
  if (this.timeout || this.over || this.gameMode != 2) {
    clearTimeout(this.timerIntervalID);
  }
  this.actuator.actuate(this.grid, {
    score: this.score,
    over: this.over,
    bestScore: this.scoreManager.get(this.gameMode),
    terminated: this.isGameTerminated(),
    level: this.level,
    nextLevel: (this.nextLevelEXP[this.level] - this.score),
    movesRemaining: (this.numMovesByLevel[this.level] - this.numMoves),
    gameMode: this.gameMode,
    newGame: newGame,
    addTime: this.addTime ? this.addTime : 0,
    timeout: this.timeout,
    nextTile: this.nextTile ? this.colorStandardsArray[this.nextTile - 1] : null,
    gm: this
  });
  this.addTime = 0;
};


// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.savePosition();
    }
  });
};
// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2:down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved = false;

  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = {
        x: x,
        y: y
      };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);

        self.moveTile(tile, positions.farthest);

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }

      }
    });
  });

  var allSpots = [];
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = {
        x: x,
        y: y
      };
      tile = self.grid.cellContent(cell);
      if (tile) {
        var spots = self.threeIAR(tile);
        if (spots) {
          //Add them to array as it goes so it can all be deleted at once. This fixes a bug where a powerup would get one of the tiles in a tiar and it wouldn't register as a tiar any more.
          for (var i = 0; i < spots.length; i++) {
            allSpots.push(spots[i]);
          }
        }

      }
    });
  });
  //this is where all to-be-removed tiles are removed at once.
  if (allSpots) {
    for (var i = 0; i < allSpots.length; i++) {
      self.grid.handleRemove(allSpots[i], true, self, 0);
    }
  }

  if (moved) {
    self.numMoves++;
    self.addRandomTile();
    self.adjustDifficulty();

    if (!self.movesAvailable()) {
      self.over = true; // Game over!
    }

    if (self.gameMode == 2) {
      if (self.elapsedTime >= this.elapsedTimeByLevel[this.level]) {
        self.over = true;
      }
    } else if (self.gameMode == 3) {
      if (self.numMoves >= self.numMovesByLevel[self.level]) {
        self.over = true;
        console.log("done");
      }
    }

    self.actuate();
  }
};

GameManager.prototype.adjustDifficulty = function () {
  if (this.score >= this.nextLevelEXP[this.level]) {
    this.level += 1;
    this.addTime = this.elapsedTimeByLevel[this.level];
  }
}

GameManager.prototype.threeIAR = function (tile) {
  var self = this;
  if (tile) {
    var directionArrays = [];
    for (var direction = 0; direction < 2; direction++) {
      var vector = self.getVector(direction);
      var behind = null;
      var front = null;

      var checkPosition = {
        x: tile.x - vector.x,
        y: tile.y - vector.y
      };
      while (self.grid.withinBounds(checkPosition) && self.grid.cellContent(checkPosition) && self.grid.cellContent(checkPosition).value === tile.value) {
        if (!behind) {
          behind = [];
        }
        behind.push(checkPosition);
        checkPosition = {
          x: checkPosition.x - vector.x,
          y: checkPosition.y - vector.y
        };
      }

      checkPosition = {
        x: tile.x + vector.x,
        y: tile.y + vector.y
      };
      while (self.grid.withinBounds(checkPosition) && self.grid.cellContent(checkPosition) && self.grid.cellContent(checkPosition).value === tile.value) {
        if (!front) {
          front = [];
        }
        front.push(checkPosition);
        checkPosition = {
          x: checkPosition.x + vector.x,
          y: checkPosition.y + vector.y
        };
      }
      var positions = [];
      if (behind) {
        for (var i = 0; i < behind.length; i++) {
          if (behind[i]) {
            positions.push({
              x: behind[i].x,
              y: behind[i].y
            });
          } else {
            console.log("Something is really wrong here");
          }
        }
      }
      positions.push({
        x: tile.x,
        y: tile.y
      });
      if (front) {
        for (var i = 0; i < front.length; i++) {
          if (front[i]) {
            positions.push({
              x: front[i].x,
              y: front[i].y
            });
          } else {
            console.log("Something is wrong here");
          }
        }
      }
      if (positions.length >= 3) {
        var returnTiles = [];
        for (i = 0; i < positions.length; i++) {
          var tileToPush = self.grid.cellContent(positions[i]);
          returnTiles.push(tileToPush);
        }
        directionArrays[direction] = returnTiles;
      } else {
        directionArrays[direction] = null;
      }
    }
    var finalTilesToReturn = []
    for (i = 0; i < directionArrays.length; i++) {
      if (directionArrays[i]) {
        for (var j = 0; j < directionArrays[i].length; j++) {
          finalTilesToReturn.push(directionArrays[i][j]);
        }
      }
    }
    if (finalTilesToReturn.length === 0) {
      return false;
    } else {
      return finalTilesToReturn;
    }
  }
  return false;
};
GameManager.prototype.threeIARExists = function (grid) {
  for (var i = 0; i < grid.size; i++) {
    for (var j = 0; j < grid.size; j++) {
      var tile = grid.cellContent({
        x: i,
        y: j
      });
      if (tile) {
        var f1 = grid.cellContent({
          x: i + 1,
          y: j
        });
        var f2 = grid.cellContent({
          x: i + 2,
          y: j
        });
        var d1 = grid.cellContent({
          x: i,
          y: j + 1
        });
        var d2 = grid.cellContent({
          x: i,
          y: j + 2
        });
        if (f1 && f2 && f1.value === tile.value && f2.value === f1.value || d1 && d2 && d1.value === tile.value && d2.value === d1.value) {
          return true;
        }
      }
    }
  }
  return false;
}

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: {
      x: 0,
      y: -1
    }, // up
    1: {
      x: 1,
      y: 0
    }, // right
    2: {
      x: 0,
      y: 1
    }, // down
    3: {
      x: -1,
      y: 0
    } // left
  };

  return map[direction];
};

GameManager.prototype.getOppositeVector = function (direction) {
  var map = {
    0: {
      x: 0,
      y: -1
    }, // up
    1: {
      x: 1,
      y: 0
    }, // right
    2: {
      x: 0,
      y: 1
    }, // down
    3: {
      x: -1,
      y: 0
    } // left
  };

  return map[(direction + 2) % 4];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = {
    x: [],
    y: []
  };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell = {
      x: previous.x + vector.x,
      y: previous.y + vector.y
    };
  } while (this.grid.withinBounds(cell) &&
    this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable();
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};

GameManager.prototype.enterRaveMode = function () {
  var self = this;
  if (this.gameMode == 4) {
    self.raveIntervalID = setInterval(self.colorHandler, self.raveInterval, self);
  } else {
    clearInterval(self.raveIntervalID);
    self.colorHandler(self);
  }
};

GameManager.prototype.colorHandler = function (self) {
  if (self.gameMode == 4) {
    self.raveUpColors();
  } else {
    self.restoreOriginalColors();
  }
  self.applyColors();
};

GameManager.prototype.raveUpColors = function () {
  var pad = function (s) {
    while (s.length < 6) {
      s = "0" + s;
    }
    return s;
  };
  var randColors = [];
  for (var i = 0; i < 8; i++) {
    randColors.push('#' + pad((Math.floor(Math.random() * Math.pow(16, 6)).toString(16))));
  }
  this.colors = {
    r: randColors[0],
    y: randColors[1],
    g: randColors[2],
    b: randColors[3],
    o: randColors[4],
    p: randColors[5],
    w: randColors[6],
    bl: randColors[7]
  };
};

GameManager.prototype.restoreOriginalColors = function () {
  this.colors = {
    r: this.colorStandards.r,
    y: this.colorStandards.y,
    g: this.colorStandards.g,
    b: this.colorStandards.b,
    o: this.colorStandards.o,
    p: this.colorStandards.p,
    w: this.colorStandards.w,
    bl: this.colorStandards.bl
  };
};

GameManager.prototype.applyColors = function (colorElements, backgroundElements, specialElements) {
  var self = this;
  self.makeColorQuerySelector(document.querySelector('.level-container'), this.colors.r);
  self.makeColorQuerySelector(document.querySelector('.next-level-container'), this.colors.b);
  self.makeColorQuerySelector(document.querySelector('.score-container'), this.colors.y);
  self.makeColorQuerySelector(document.querySelector('.best-score-container'), this.colors.g);
  if (self.gameMode != 1) {
    self.makeColorQuerySelector(document.querySelector('#misc-div'), this.colors.o);
  }
  self.makeColorQuerySelector(document.querySelector('.display-welcome-message-container'), this.colors.p);
  self.makeColorQuerySelector(document.querySelector('.leaderboard-container'), this.colors.r);
  self.makeColorQuerySelector(document.querySelector('.submit-feedback-container'), this.colors.y);
  self.makeColorQuerySelector(document.querySelector('.credits-container'), this.colors.b);
  self.makeColorQuerySelector(document.querySelector('.start-over-button-container'), this.colors.g);
  $('.circle-middle').css('background', this.colors.bl);
  $('.horizontal-line').css('border-top', "10px solid " + this.colors.bl);
  $('.vertical-line').css('border-left', "10px solid " + this.colors.bl);

  $('.arrow-up').css('border-bottom', "21px solid " + this.colors.bl);
  $('.arrow-right').css('border-left', "21px solid " + this.colors.bl);
  $('.arrow-left').css('border-right', "21px solid " + this.colors.bl);
  $('.arrow-down').css('border-top', "21px solid " + this.colors.bl);

  $('.tile-1 > .tile-inner').css('background', this.colors.r);
  $('.tile-2 > .tile-inner').css('background', this.colors.y);
  $('.tile-3 > .tile-inner').css('background', this.colors.g);
  $('.tile-4 > .tile-inner').css('background', this.colors.b);
  $('.tile-5 > .tile-inner').css('background', this.colors.o);
  $('.tile-6 > .tile-inner').css('background', this.colors.p);

  $('.red-letter').css('color', this.colors.r);
  $('.yellow-letter').css('color', this.colors.y);
  $('.blue-letter').css('color', this.colors.b);
  $('.orange-letter').css('color', this.colors.o);
  $('.purple-letter').css('color', this.colors.p);
  $('.white-letter').css('color', this.colors.w);
};

GameManager.prototype.makeColorQuerySelector = function (element, color) {
  var hexToRGB = function (rgb) {
    rgb = rgb.substring(1);
    // console.log(rgb);
    var r = parseInt(rgb.substring(0, 2).toUpperCase(), 16);
    var g = parseInt(rgb.substring(2, 4).toUpperCase(), 16);
    var b = parseInt(rgb.substring(4, 6).toUpperCase(), 16);
    return r + "," + g + "," + b;
  }
  if (element) {
    //console.log(color);
    //    console.log('rgba(' + rgbToHex(color) + ', ' + this.containerOpacity + ')');
    $(element).css('background-color', 'rgba(' + hexToRGB(color) + ', ' + this.containerOpacity + ')');
  }
};