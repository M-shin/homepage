function HTMLActuator() {
    this.tileContainer    = document.querySelector(".tile-container");
    this.levelContainer   = document.querySelector(".level-container");
    this.nextLevelContainer    = document.querySelector(".next-level-container");
    this.messageContainer = document.querySelector(".game-message");
    this.scoreContainer = document.querySelector(".score-container");
    this.bestScoreContainer = document.querySelector(".best-score-container");
    this.miscContainer = document.getElementById("misc-div");
     
    
    this.score = 0;
    this.level = 1;
    this.nextLevel = 50;
    this.timeLastDelete = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
    var self = this;
    if(metadata.newGame){
        self.gameMode = metadata.gameMode;
        self.setupSpecificGameMode(metadata.gameMode);
    }
    window.requestAnimationFrame(function () {
    if(!metadata.timeout){
        self.clearContainer(self.tileContainer);
        var newTile = [];
        grid.cells.forEach(function (column) {
          column.forEach(function (cell) {
            if (cell && grid.withinBounds(cell) && grid.cellContent(cell)) {
              var tile = grid.cellContent(cell);
                if(grid.justDeleted){ // Check if any tiles were even deleted
                    if(grid.justDeleted.indexOf(tile) == -1){ // Check if this particular tile was deleted
                        if(tile.previousPosition){ // Check if the tile is new
                            self.addTile(tile, metadata.gm, self);
                        }else{
                            newTile.push(tile);
                        }
                    }
                }else{
                    if(tile.previousPosition){ // Check if the cell is new
                        self.addTile(tile, metadata.gm, self);
                    }else {
                        newTile.push(tile);
                    }
                }
            }
          });
        });
        if(grid.justDeleted){
            self.timeLastDelete = 0;
            for(var i = 0; i < grid.justDeleted.length; i++){
                self.addTile(grid.justDeleted[i], metadata.gm, self);
            }
            for(var i = 0; i < grid.justDeleted.length; i++){
                var timeToSlide = 101;
                var timeToDisappear = 301;
                var timeBeforeKill = 80 *  grid.justDeleted[i].justDeletedIndex;
                
                setTimeout(self.addTileDeletePart, timeToSlide + timeBeforeKill, grid.justDeleted[i], self);
                
                setTimeout(self.removeDeletedTile, timeToSlide + timeBeforeKill + timeToDisappear, grid.justDeleted[i], self);
                if(timeToSlide + timeBeforeKill + timeToDisappear > self.timeLastDelete){
                    self.timeLastDelete = timeToSlide + timeBeforeKill + timeToDisappear;
                }
            }
            grid.justDeleted = null;
        }
        setTimeout(function(newTile, self, gameMode, nextTile, callback){
            for(var i = 0; i < newTile.length; i++){
                self.addTile(newTile[i], metadata.gm, self);
            }
            setTimeout(callback, 0, gameMode, nextTile, self);
        }, self.timeLastDelete + 1, newTile, self, metadata.gameMode, metadata.nextTile, function(gameMode, nextTile, self) {
            if(gameMode == 1){
                if(nextTile){
                    self.updateNextTile(nextTile, self);
                }
            }
        });
    
        self.timeLastDelete = 0;
        
        //Timeouts are to make the score addition more in line with tile disappearance
        setTimeout(self.updateLevelArea, 100, metadata.level, metadata.nextLevel, metadata.score, metadata.bestScore, self);
    }
        if (metadata.over) {
            self.message(metadata.score); // You lose
        }
        
        if(metadata.gameMode == 3){
            self.updateMovesRemaining(metadata.movesRemaining, self);
        }
        
    });
};

HTMLActuator.prototype.setupSpecificGameMode = function(gameMode){
    var self = this;
    self.miscContainer.className = "";
    self.miscContainer.textContent = "";
    if(self.timerIntervalID){
        clearTimeout(self.timerIntervalID);
        self.timerIntervalID = null;
    }
    if(gameMode == 1){
        self.miscContainer.textContent = "Next"
        self.miscContainer.classList.add("free-play")
    } else if(gameMode == 2){
        self.miscContainer.classList.add("time-remaining-container");
    } else if(gameMode == 3){
        self.miscContainer.classList.add("moves-remaining-container");
        self.miscContainer.textContent = "Loading...";
    } else if(gameMode == 4){
        self.miscContainer.textContent = "Rave!";
    }
};

HTMLActuator.prototype.timeFormat = function(time){
    var stime = time / 1000.0;
    var m = Math.floor(stime / 60);
    var s = Math.floor(stime % 60);
    
    //Grabs values after the decimal point
    var stimeS = "" + stime;
    var pt = stimeS.indexOf(".");
    if(pt == -1){
        stimeS += ".";
        pt = stimeS.indexOf(".");
    }
    stimeS += "00";
    var ms = stimeS.substring(pt, pt + 2);
    return m + ":" + s + ms;
}

HTMLActuator.prototype.updateLevelArea = function(level, nextLevel, score, bestScore, self){
    self.updateLevel(level, self);
    self.updateNextLevel(nextLevel, self);
    self.updateScore(score, self);
    self.updateBestScore(bestScore, self)
}

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTileDeletePart = function(tile, self){
    var wrapperDivs = self.tileContainer.childNodes;
    for(var i = 0; i < wrapperDivs.length; i++){
        var position = self.positionClass({x: tile.x, y: tile.y});
        if(wrapperDivs[i].className.indexOf(position) != -1){
            //console.log("Adding the tile-delete class to the div that has class: " + position);
            wrapperDivs[i].classList.add("tile-delete");
        }
    }
};

HTMLActuator.prototype.addTile = function (tile, gamemanager, self) {

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");

  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = self.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  //if (justDeleted) classes.push("tile-delete");

  self.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  if(gamemanager.gameMode == 4){
      if(tile.value == 1){
        $(inner).css("background", gamemanager.colors.r);
      }
      if(tile.value == 2){
        $(inner).css("background", gamemanager.colors.y);
      }
      if(tile.value == 3){
        $(inner).css("background", gamemanager.colors.b);
      }
      if(tile.value == 4){
        $(inner).css("background", gamemanager.colors.g);
      }
      if(tile.value == 5){
        $(inner).css("background", gamemanager.colors.o);
      }
      if(tile.value == 6){
        $(inner).css("background", gamemanager.colors.p);
      }
      
  }

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else {
    classes.push("tile-new");
    self.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  //Check if the tile is new. If it is, wait a little bit before adding power up symbols.
  var flag = false;
  for(var i in classes){
    if(classes[i] == "tile-new"){
        flag = true;
        setTimeout(self.appendTypeInner, 301, inner, tile.type, gamemanager);
    }
  }
  if(!flag) {
        self.appendTypeInner(inner, tile.type, gamemanager);
    }

  // Put the tile on the board
  self.tileContainer.appendChild(wrapper);

};

HTMLActuator.prototype.appendTypeInner = function(wrapper, type, gm){
    var verticalLine = document.createElement("div");
    verticalLine.classList.add("vertical-line");
    $(verticalLine).css('border-left', '10px solid ' + gm.colors.bl);
    
    var horizontalLine = document.createElement("div");
    horizontalLine.classList.add("horizontal-line");
    $(horizontalLine).css('border-top', '10px solid ' + gm.colors.bl);
    
    var circle = document.createElement("div");
    circle.classList.add("circle-middle");
    $(circle).css('background', gm.colors.bl);
    
    var triangleUp = document.createElement("div");
    triangleUp.classList.add("arrow-up");
    $(triangleUp).css('border-bottom', '21px solid ' + gm.colors.bl);
    
    var triangleDown = document.createElement("div");
    triangleDown.classList.add("arrow-down");
    $(triangleDown).css('border-top', '21px solid ' + gm.colors.bl);
    
    var triangleRight = document.createElement("div");
    triangleRight.classList.add("arrow-right");
    $(triangleRight).css('border-left', '21px solid ' + gm.colors.bl);
    
    var triangleLeft = document.createElement("div");
    triangleLeft.classList.add("arrow-left");
    $(triangleLeft).css('border-right', '21px solid ' + gm.colors.bl);
    
    if(type == 1) { 
    } else if(type == 2) {
        wrapper.appendChild(verticalLine);
        wrapper.appendChild(triangleUp);
        wrapper.appendChild(triangleDown);
    } else if(type == 3) {
        wrapper.appendChild(horizontalLine);
        wrapper.appendChild(triangleLeft);
        wrapper.appendChild(triangleRight);
    } else if(type == 4) {
        wrapper.appendChild(horizontalLine);
        wrapper.appendChild(verticalLine);
        wrapper.appendChild(triangleUp);
        wrapper.appendChild(triangleDown);
        wrapper.appendChild(triangleLeft);
        wrapper.appendChild(triangleRight);
    }else if(type == 5){
        wrapper.appendChild(circle); 
    }
}

HTMLActuator.prototype.removeDeletedTile = function(tile, actuator){
    var children = actuator.tileContainer.childNodes;
    for(var i = 0; i< children.length; i++){
        if(children[i].className.indexOf(" " + actuator.positionClass(tile) + " ") != -1){
            if(children[i].className.indexOf("tile-delete") == -1){
                console.log("Something is very wrong right now: " + children[i].className + " doesn't contain tile-delete");
                
            }else{
                //console.log("Removing div with class: " + children[i].className);
                actuator.tileContainer.removeChild(children[i]);
            }
        }
    }
}

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateLevel = function (level, self) {
  self.clearContainer(self.levelContainer);
  var difference = level - self.level
  self.level = level;
  self.levelContainer.textContent = self.level;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("slide-score-text-up");
    addition.textContent = "+1";

    self.levelContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function(bestScore, self){
    self.bestScoreContainer.textContent = bestScore;
}

HTMLActuator.prototype.updateScore = function(score, self) {
    var difference = self.score - score;
    self.score = score;
    
    self.scoreContainer.textContent = self.score;
    
    if(difference < 0){
        var addition = document.createElement("div");
        addition.classList.add("slide-score-text-up");
        addition.textContent="+" + Math.abs(difference);
        
        self.scoreContainer.appendChild(addition);
    }
};
HTMLActuator.prototype.updateNextLevel = function (nextLevel, self) {
  var difference = self.nextLevel - nextLevel;
  self.nextLevel = nextLevel;

  self.nextLevelContainer.textContent = self.nextLevel;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("slide-score-text-up");
    addition.textContent = "-" + difference;

    self.nextLevelContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateMovesRemaining = function(remaining, self) {
    self.miscContainer.textContent = remaining;
};

HTMLActuator.prototype.updateTimeContainer = function(time, self) {
    self.miscContainer.textContent = self.timeFormat(time)
};

HTMLActuator.prototype.updateNextTile = function(nextTile, self) {
    var hexToRGB = function(rgb){
        rgb = rgb.substring(1);
       // console.log(rgb);
        var r = parseInt(rgb.substring(0,2).toUpperCase(), 16);
        var g = parseInt(rgb.substring(2,4).toUpperCase(), 16);
        var b = parseInt(rgb.substring(4,6).toUpperCase(), 16);
        return r + "," + g + "," + b;
    };
    $(self.miscContainer).css("background", 'rgba(' + hexToRGB(nextTile) + ', 0.8)');
    
        self.miscContainer.classList.add("flash");
        setTimeout(function(self){
            self.miscContainer.classList.remove("flash");
        }, 600, self);
};

HTMLActuator.prototype.message = function (score) {
  var type    = "game-over";
  var message = "Final Score: " + score;
    console.log("done2");
  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-over");
};
