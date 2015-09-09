var ctx;
var canvas;

function submit(){
    canvas.width = canvas.width;
    if(ctx){
        var ins = [];
        for(var i = 1; i <= 3; i++){
            ins.push(parseInt($("#i" + i).val(), 10));
        }
        ctx.fillStyle = "#FF0000";
        var ah = canvas.height/2;
        var aw = canvas.width/2;
        
        var pos = [];
        pos.push({x: aw, y: ah});
        pos.push({x: aw, y: ah - ins[0]});
        var theta = Math.acos((ins[0] * ins[0] + ins[2] * ins[2] - ins[1] * ins[1])/(2 * ins[0] * ins[2]));
        pos.push({x: pos[0].x + Math.cos(Math.PI/2 - theta) * ins[2], y: pos[1].y + Math.sin(Math.PI/2 - theta) * ins[2]});
        for(var i = 0; i < pos.length; i++){
            circle(pos[i].x, pos[i].y);
            console.log(pos[i].x + " " + pos[i].y);
        }
    }
}
function circle (x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
}

$(document).ready(function(){
    canvas = $("#canvas")[0];
    ctx = canvas.getContext("2d");
});