// 12/16/14: I decided to start documenting all this code. I want to be able to come back in 4 years and know exactly what's going on. I made it up to sanitizeCells() function, but the plane is getting ready for landing so I have to turn off my computer. I still don't know what activeCells, upCells, and downCells do yet, but will find out! Note to self: download jQuery so that you can do offline testing. Yeah jQuery's repos are optimized or whatever, but you never know when you'll be on a plane again

// c is the id of the canvas within which everything will be placed
var c = document.getElementById('c');
// Set the height and width of canvas
c.height = document.body.clientHeight;
c.width = document.body.clientWidth;

// Get context of canvas (used for drawing)
var ctx = c.getContext('2d');

// Lol not entirely sure what this does yet. Gotta sift through the code
var intervalId = -1;

// Default speed on autorun mode
var speed = 300;

// Autorun mode on?
var running = false;

// Flag for when user is clicking-and-dragging
var dragging = false;

// Colors are organized by indices into the colors array
var currentColor = 0;

// Checks if the user is raving. This is a special case of coloring
var raving = false;

// Size of each box in pixels. IE, 10 x 10
var boxSize = 10;

// Background color of the canvas
var bgcolor = "#000000";

// Color of the gridlines. I don't think gridlines are actually implemented.
var gridcolor = "#FFFFFF";

// The colors array. User changes this by pressing numbers
var colors = ["#FF0000", "#00FF00", "#0000FF", "#F6FF00", "#FF00FF", "#00FFFF", "#FFFFFF", "#89918B"];

// Flag for whether gridlines are on or off
var grids = false;

// LOL literally no idea what this is but seems related to color
var hueDifferential = 70;

// Struct that carries x and y coordinate. Not sure what it does
var currentCoor = {
    _cx: -1,
    _cy: -1
};

// Looks like an object that stores an x and y component. Javascript objects are quite strange.
function Cell(x, y) {
    this.cx = x;
    this.cy = y;
}

// Honestly trying to figure this out. The whole reason I decided to document everything is because I need to know what these are in order to successfully implement the load function. The load function broke after switching from grid style to activeCells style.
var activeCells = new Array();
var downCells = new Array();
var upCells = new Array();

// Looks like array is the main game grid. It's an array of booleans. When array[i][j] is true, that means it's "alive". 
var array = new Array(Math.ceil(screen.width * 3 / boxSize));
for (var x = 0; x < array.length; x++) {
    array[x] = new Array(Math.ceil(screen.height * 3 / boxSize));
    for (var y = 0; y < array[x].length; y++) {
	array[x][y] = false;
    }
}
//o.O
var startX = Math.ceil(array.length / 3);
var startY = Math.ceil(array[0].length / 3);
var endX = startX * 2 - 1;
var endY = startY * 2 - 1;
//Jk I know what these are. The game supports life structures that sail off map. In order to do this, the viewable area is actually only 1/9 of the entire grid. So we define the borders of the viewing area here.


// Fill the viewing area with bgcolor
for (var x = startX; x <= endX; x++) {
    for (var y = startY; y <= endY; y++) {
	ctx.fillStyle = bgcolor;
	ctx.fillRect((x - startX) * boxSize, (y - startY) * boxSize, boxSize, boxSize);	
    }
}

// Jquery functions to handle mouse events. Most of the code is here to support mouse dragging
$("#c").mousedown(function (e) {
    dragging = true;
    var _x = Math.floor((e.pageX) / boxSize) + startX;
    var _y = Math.floor((e.pageY) / boxSize) + startY;
    flip(_x, _y);
    currentCoor._cx = _x;
    currentCoor._cy = _y;
}).mouseup(function (e) {
    // Checks for when dragging ends and "sends the cells to active". Still not sure what that means..
    dragging = false;
    dumpToActive();
}).mousemove(function (e) {
    // This is 100% pure genius. Made this myself :)
    if (dragging === true) {
	var _x = Math.floor((e.pageX) / boxSize) + startX;
	var _y = Math.floor((e.pageY) / boxSize) + startY;
	if (!(currentCoor._cx == (_x) && currentCoor._cy == (_y))) {
	    flip(_x, _y);
	    currentCoor._cx = _x;
	    currentCoor._cy = _y;
	}
    }
});

// This is a wrapper to flip Cell objects.
function flipObject(o) {
    flip(o._x, o._y);
}

// Ahh finally, something interesting to analyze. It looks like this function takes an x,y coordinate pair and searches the activeCells list for a cell who's coordinates match x,y. I wonder why this would ever be needed.
// Epiphany! This is like an indexOf method on the activeCells list. Essentially, one can ID each cell by it's x and y coordinate. So really this "checkAC" thing is really saying return to me the index of the cell who's coordinates are x and y. 
function checkAC(_x, _y) {
    for (var i = 0; i < activeCells.length; i++) {
	if (activeCells[i].cx === _x && activeCells[i].cy === _y) {
	    return i;
	}
    }
    return -1;
}

// This is a strange function indeed. Initial thoughts, can tell from name what it's going to do, but I'm going to have to read through the code to find out exactly. Read next comment for post analysis report.
// Okay I've now read over this code and have a good grasp on what it does. First, it flips the boolean value at array[x][y] to indicate the status of life there. Then, it pushes all neighboring cells into either the upCells array or the downCells array depending on the value of array[x][y] after the flip. Then a call to sanitizeCells() is made. Need to analyze that function to see exactly what it does. After, it just draws in the appropriate color at the correct coordinate.
function flip(x, y) {
    // So, flip the value in the main game array. Simple enough..
    array[x][y] = !array[x][y];

    // This is where things get a bit tricky. We have two arrays: upCells and downCells. When an x,y coordinate is flipped to true, this pushes onto upCells the x,y cell as well as every neighboring cell (including diagonals). Not sure what exactly this does yet, but will probably find out soon.
    if (array[x][y] === true) {
	upCells.push(new Cell(x, y));
	upCells.push(new Cell(x + 1, y + 1));
	upCells.push(new Cell(x + 1, y));
	upCells.push(new Cell(x + 1, y - 1));
	upCells.push(new Cell(x, y + 1));
	upCells.push(new Cell(x, y - 1));
	upCells.push(new Cell(x - 1, y + 1));
	upCells.push(new Cell(x - 1, y));
	upCells.push(new Cell(x - 1, y - 1));
    } else if (array[x][y] === false) {
	downCells.push(new Cell(x, y));
	downCells.push(new Cell(x + 1, y + 1));
	downCells.push(new Cell(x + 1, y));
	downCells.push(new Cell(x + 1, y - 1));
	downCells.push(new Cell(x, y + 1));
	downCells.push(new Cell(x, y - 1));
	downCells.push(new Cell(x - 1, y + 1));
	downCells.push(new Cell(x - 1, y));
	downCells.push(new Cell(x - 1, y - 1));
    }
    // Ahh, I bet the answer to downCells and upCells purposes lies in this function. We shall see later.
    sanitizeCells();

    // Seems like we're back to simple stuff. This part is just going to either color in the x,y coordinate or change it back to bgColor depending on whether it is true or false.

    // Check that the x,y coordinate pair is within viewable area
    if (x >= startX && x <= endX && y >= startY && y <= endY) {
	// Select a color for the fill that's about to happen
	if (array[x][y] === true) {
	    ctx.fillStyle = colors[currentColor];
	    if (raving === true) {
		ctx.fillStyle = randomColor();
	    }
	} else {
	    ctx.fillStyle = bgcolor;
	}
	// Canvas treats the top left corner of canvas as spot (0,0). As such, we have to subtract startX and startY from the grid coordinates to get the "real coordinates" for where to draw the square.
	x -= startX;
	y -= startY;
	
	// I wonder why we fill and stroke. Maybe it had to do with gridlines.
	ctx.fillRect(x * boxSize, y * boxSize, boxSize, boxSize);
	ctx.strokeRect(x * boxSize, y * boxSize, boxSize, boxSize);
    }
}

// We've arrived at the sanitizeCells function! Here we go, time to find out what this does. 
function sanitizeCells() {
	for (var i = 0; i < upCells.length; i++) {
		if (upCells[i].cx < 0 || upCells[i].cy < 0) {
			upCells.splice(i, 1);
		}
	}
	for (var i = 0; i < downCells.length; i++) {
		if (downCells[i].cx < 0 || downCells[i].cy < 0) {
			downCells.splice(i, 1);
		}
	}
}
$(document).keydown(function (e) {
	console.log(e.keyCode);
	var pause = 80;
	var speedUp = 38;
	var speedDown = 40;
	var step = 32;
	var save = 83;
	var load = 76;
	var random = 82;
	var clear = 67;
	var colorChange = [49, 50, 51, 52, 53, 54, 55, 56]
	var randColor = 48;
	var raveMode = 57;
	var gridLines = 71;

	if (e.keyCode == pause) {
		running = !running;
	}
	if (e.keyCode == speedUp) {
		speed *= .8;
	}
	if (e.keyCode == speedDown) {
		speed *= 1.2;
	}
	if (e.keyCode == step) {
		tick();
	}
	if (e.keyCode == random) {
		generateRandom();
	}
	if (e.keyCode == clear) {
		clearLife();
	}
	for (var i = 0; i < colorChange.length; i++) {
		if (e.keyCode == colorChange[i]) {
			currentColor = i;
			raving = false;
			update();
		}
	}
	if (e.keyCode == randColor) {
		colors[colors.length - 1] = randomColor();
		currentColor = colors.length - 1;
		raving = false;
		update();
	}
	if (e.keyCode == save) {
		localStorage.data = JSON.stringify(array);
	}
	if (e.keyCode == load) {
		console.log("Loading");
		array = JSON.parse(localStorage.data);
		update();
	}
	if (e.keyCode == raveMode) {
		raving = !raving;
		update();
	}
	if (e.keyCode == gridLines) {
		grids = !grids;
	}
});

function checkBodySize() {
	if (c.height != document.body.clientHeight || c.width != document.body.clientWidth) {
		c.height = document.body.clientHeight;
		c.width = document.body.clientWidth;
		update();
	}
}
window.setInterval("checkBodySize()", 10);

function gameLoop() {
	if (running) {
		tick();
	}

	window.setTimeout("gameLoop()", speed);
}


function clearLife() {
	for (var i = 0; i < activeCells.length; i++) {
		if (array[activeCells[i].cx][activeCells[i].cy] === true) {
			flip(activeCells[i].cx, activeCells[i].cy);
		}
	}
	dumpToActive();
}

function generateRandom() {
	var total = (endX + 1 - startX) * (endY + 1 - startY);
	var amt = Math.floor(Math.random() * total / 2);
	//console.log("a: " + amt);

	for (var i = 0; i < amt; i++) {
		var _x = Math.floor(Math.random() * (endX + 1 - startX)) + startX;
		var _y = Math.floor(Math.random() * (endY + 1 - startY)) + startY;
		//console.log(_x + " " + _y);
		flip(_x, _y);
	}

	dumpToActive();
}

function dumpToActive() {
	for (var i = 0; i < downCells.length; i++) {
		var index = checkAC(downCells[i].cx, downCells[i].cy);
		if (index >= 0 && array[downCells[i].cx][downCells[i].cy] === false) {
			activeCells.splice(index, 1);
		}

	}


	for (var i = 0; i < activeCells.length; i++) {
		var c = activeCells[i];
		if (array[c.cx][c.cy] === true) {
			upCells.push(new Cell(c.cx, c.cy));
			upCells.push(new Cell(c.cx + 1, c.cy + 1));
			upCells.push(new Cell(c.cx + 1, c.cy));
			upCells.push(new Cell(c.cx + 1, c.cy - 1));
			upCells.push(new Cell(c.cx, c.cy + 1));
			upCells.push(new Cell(c.cx, c.cy - 1));
			upCells.push(new Cell(c.cx - 1, c.cy + 1));
			upCells.push(new Cell(c.cx - 1, c.cy));
			upCells.push(new Cell(c.cx - 1, c.cy - 1));
		}
	}
	for (var i = 0; i < upCells.length; i++) {
		var index = checkAC(upCells[i].cx, upCells[i].cy);
		if (index === -1) {
			//console.log("upcell adding: " + upCells[i].cx + " " + upCells[i].cy);
			activeCells.push(new Cell(upCells[i].cx, upCells[i].cy));
		}
	}

	downCells = new Array();
	upCells = new Array();
}

function tick() {
	var cc = new Array();
	var index = 0;
	for (var i = 0; i < activeCells.length; i++) {
		var x = activeCells[i].cx;
		var y = activeCells[i].cy;
		var n = numNeighbors(x, y);
		if ((array[x][y] && (n <= 1 || n >= 4)) || (!array[x][y] && (n == 3))) {
			cc.push({
				xc: x,
				yc: y
			});
		}
	}
	for (var x = 0; x < cc.length; x++) {
		//console.log(cc[x].xc + " " + cc[x].yc + " these are being flipped");
		flip(cc[x].xc, cc[x].yc);
	}
	dumpToActive();
	if (grids === true) {
		if (raving === true) {
			ctx.strokeStyle = randomColor();
		} else {
			ctx.strokeStyle = negativeColor(colors[currentColor]);
		}
		update();
	} else {
		ctx.strokeStyle = bgcolor;
	}
}

function pad(str, len, replace) {
	var pad_char = typeof replace !== 'undefined' ? replace : '0';
	var pad = new Array(1 + len).join(pad_char);
	return (pad + str).slice(-pad.length);
}

function negativeColor(c) {
	if (c.charAt(0) == "#") {
		c = c.substring(1);
	}
	var r = 255 - parseInt(c.substring(0, 2), 16);
	var g = 255 - parseInt(c.substring(2, 4), 16);
	var b = 255 - parseInt(c.substring(4, 6), 16);

	return "#" + (pad(r.toString(16), 2) + pad(g.toString(16), 2) + pad(b.toString(16), 2)).toUpperCase();
}

function randomColor() {
	var r = Math.floor(Math.random() * (256 - hueDifferential)) + hueDifferential;
	var g = Math.floor(Math.random() * (256 - hueDifferential)) + hueDifferential;
	var b = Math.floor(Math.random() * (256 - hueDifferential)) + hueDifferential;
	return "#" + (pad(r.toString(16), 2) + pad(g.toString(16), 2) + pad(b.toString(16), 2)).toUpperCase();
}

function numNeighbors(x, y) {
	var n = 0;
	if (x > 0 && y > 0 && array[x - 1][y - 1]) {
		n++;
	}
	if (x > 0 && array[x - 1][y]) {
		n++;
	}
	if (x > 0 && y < array[x].length - 1 && array[x - 1][y + 1]) {
		n++;
	}
	if (y < array[x].length - 1 && array[x][y + 1]) {
		n++;
	}
	if (x < array.length - 1 && y < array[x].length - 1 && array[x + 1][y + 1]) {
		n++;
	}
	if (x < array.length - 1 && array[x + 1][y]) {
		n++;
	}
	if (x < array.length - 1 && y > 0 && array[x + 1][y - 1]) {
		n++;
	}
	if (y > 0 && array[x][y - 1]) {
		n++;
	}
	return n;
}
$(window).resize(update());

function update() {
	for (var x = startX; x <= endX; x++) {
		for (var y = startY; y <= endY; y++) {
			if (array[x][y] === true) {
				if (raving === true) {
					ctx.fillStyle = randomColor();
				} else {
					ctx.fillStyle = colors[currentColor];
				}
			} else {
				ctx.fillStyle = bgcolor;
			}
			ctx.fillRect((x - startX) * boxSize, (y - startY) * boxSize, boxSize, boxSize);
			ctx.strokeRect((x - startX) * boxSize, (y - startY) * boxSize, boxSize, boxSize);
		}
	}
	//Send to active Cells
}

gameLoop();
