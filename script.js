console.log("hello js");

var cnv = document.getElementById("cnv");
// not css
cnv.setAttribute('width', '400');
cnv.setAttribute('height', '400');
var ctx = cnv.getContext("2d");
ctx.fillStyle = 'rgba(0, 0, 255, 1.0)';
ctx.fillRect(120, 10, 150, 150);
