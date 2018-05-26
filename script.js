var VSHADER_SRC = 
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'void main() { \n' + 
    '  gl_Position = a_Position;\n' +
    '  gl_PointSize = a_PointSize;\n' +
    "}\n";

var FSHADER_SRC = 
    'void main() {\n' + 
    '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';

// shaders

function initShaders(gl, vshader, fshader) {
    var program = createProgram(gl, vshader, fshader);
    if (!program) {
      console.log('Failed to create program');
      return false;
    }
  
    gl.useProgram(program);
    gl.program = program;
  
    return true;
}

function createProgram(gl, vshader, fshader) {
    var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
    var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
    if (!vertexShader || !fragmentShader) {
      return null;
    }

    var program = gl.createProgram();
    if (!program) {
      return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
  
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
      var error = gl.getProgramInfoLog(program);
      console.log('Failed to link program: ' + error);
      gl.deleteProgram(program);
      gl.deleteShader(fragmentShader);
      gl.deleteShader(vertexShader);
      return null;
    }
    return program;
}

function loadShader(gl, type, source) {
    var shader = gl.createShader(type);
    if (shader == null) {
      console.log('unable to create shader');
      return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      var error = gl.getShaderInfoLog(shader);
      console.log('Failed to compile shader: ' + error);
      gl.deleteShader(shader);
      return null;
    }
  
    return shader;
}

// main

function main() {
    var cnv = document.getElementById("cnv");
    // not css
    cnv.setAttribute('width', '400');
    cnv.setAttribute('height', '400');

    var gl = cnv.getContext("webgl");

    if (!gl) {
        console.error("getContext webgl error");
        return;
    }

    if (!initShaders(gl, VSHADER_SRC, FSHADER_SRC)) {
        console.error("initShaders error");
        return;
    }

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.error("a_Position error");
        return;
    }

    var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    if (a_PointSize < 0) {
        console.error("a_PointSize error");
        return;
    }

    gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
    gl.vertexAttrib1f(a_PointSize, 5.0);

    // draw
    gl.clearColor(0.0, 0.0, 0.0, 0.2);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 1);
}
