var variables =
	[
		["i", "j", "matrix.length - 1 - i", "matrix[0].length - 1 - j"],
		["i", "j", "matrix.length - 1 - i", "matrix[0].length - 1 - j"],
		["i", "j", "(i + 1)", "(j + 1)", "(i + j)"],
		[" + ", " - ", " * ", /*" / ", " % "*/ ],
		["i", "j", "(i + 1)", "(j + 1)", "(i + j)"],
	];

var matrixLen = 5;
var qm;


$(function () {
	beginLevel();
});

function beginLevel() {
	$("#adiv").html("");
	var m = [];
	for (var i = 0; i < variables.length; i++) {
		m.push(variables[i][Math.floor(Math.random() * variables[i].length)]);
	}
	var matrix = [];
	matrix.length = matrixLen;
	for (var i = 0; i < matrix.length; i++) {
		matrix[i] = [];
		for (var j = 0; j < matrixLen; j++) {
			matrix[i][j] = 0;
		}
	}
	var evalString = "";
	evalString += "for (var i = 0; i < matrix.length; i++) {" + "\n";
	evalString += "for (var j = 0; j < matrix[i].length; j++) {" + "\n";
	evalString += "matrix[" + m[0] + "][" + m[1] + "] = Math.floor((" + m[2] + m[3] + m[4] + ") * 100)/100;" + "\n";
	evalString += "}" + "\n";
	evalString += "}";
	console.log(evalString);

	eval(evalString);

	qm = matrix;
	display(matrix, "#q_tb");

	var form = "";
	for (var i = 0; i < variables.length; i++) {
		var elem = '';
		elem += '<select id="s' + i + '">' + '\n';
		for (var j = 0; j < variables[i].length; j++) {
			elem += '<option value="' + variables[i][j] + '">' + variables[i][j] + '</option>' + '\n';
		}
		elem += '</select>' + '\n';
		form += elem;
	}
	form += '<input type="button" value="Go" onclick="attempt()"></input>';
	form += '<input type="button" value="&#8635;" onclick="beginLevel()"></input';
	$("#selects").html(form);
}

function attempt() {
	console.log("attempted");

	var matrix = [];
	matrix.length = matrixLen;
	for (var i = 0; i < matrix.length; i++) {
		matrix[i] = [];
		for (var j = 0; j < matrixLen; j++) {
			matrix[i][j] = 0;
		}
	}
	var evalString = "";
	evalString += "for (var i = 0; i < matrix.length; i++) {" + "\n";
	evalString += "for (var j = 0; j < matrix[i].length; j++) {" + "\n";
	evalString += "matrix[" + $("#s0").val() + "][" + $("#s1").val() + "] = Math.floor((" + $("#s2").val() + $("#s3").val() + $("#s4").val() + ") * 100)/100;" + "\n";
	evalString += "}" + "\n";
	evalString += "}";
	console.log(evalString);
	eval(evalString);

	var attemptable = '<table id="a_table">' + '\n';
	attemptable += '<tbody id="a_tb">' + '\n';
	for (var i = 0; i < matrix.length; i++) {
		attemptable += '<tr>' + '\n';
		for (var j = 0; j < matrix[i].length; j++) {
			attemptable += '<td></td>' + '\n';
		}
		attemptable += '</tr>' + '\n';
	}
	$("#adiv").append(attemptable);
	display(matrix, "#a_tb");

	if (checkSolution(qm, matrix)) {
		$("#adiv").append("<p>Nice Job!</p>");
	}
}

function display(matrix, tb) {
	var table = $(tb);
	table.children().each(function (index1) {
		var row = $(this);
		// console.log("row " + index1 + ": ");
		// console.log(row);
		row.children().each(function (index2) {
			var cell = $(this);
			// console.log(cell);
			cell.html(matrix[index1][index2]);
			// console.log(index2 + ": " + matrix[index1][index2]);
		})
	});
	/*
	for (var i = 0; i < matrix.length; i++) {
		var s = "";
		for (var j = 0; j < matrix[i].length; j++) {
			s += (Math.round(matrix[i][j] * 100) / 100) + "   ";
		}
		console.log(s);
	}
	*/
}

function checkSolution(qm, am) {
	for (var i = 0; i < qm.length; i++) {
		for (var j = 0; j < qm[i].length; j++) {
			if (qm[i][j] !== am[i][j]) {
				return false;
			}
		}
	}
	return true;
}