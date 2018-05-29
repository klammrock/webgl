var VSHADER_SRC = 
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
    'void main() { \n' + 
    '  gl_Position = a_Position;\n' +
    '  gl_PointSize = a_PointSize;\n' +
    "}\n";

var FSHADER_SRC = 
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' + 
    '  gl_FragColor = u_FragColor;\n' +
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

// mouse

function click(ev, gl, canvas, a_Position) {
    // var x = ev.clientX;
    // var y = ev.clientY;
    // var rect = ev.target.getBoundingClientRect() ;
  
    // x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    // y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    // g_points.push(x); g_points.push(y);
  
    // // draw
    // gl.clear(gl.COLOR_BUFFER_BIT);
  
    // var len = g_points.length;
    // for(var i = 0; i < len; i += 2) {
    //   gl.vertexAttrib3f(a_Position, g_points[i], g_points[i+1], 0.0);

    //   gl.drawArrays(gl.POINTS, 0, 1);
    // }

    console.log(click_count++);

    if (click_count == 2) {
        var n = initVertexBuffers(gl);

        gl.clear(gl.COLOR_BUFFER_BIT);

        // POINTS LINE_STRIP LINE_LOOP LINES TRIANGLE_STRIP TRIANGLE_FAN TRIANGLES
        //gl.drawArrays(gl.POINTS, 0, n);
        gl.drawArrays(gl.TRIANGLES, 0, n);
        // ! draw quad -> gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    } else if (click_count == 3) {
        var n = reInitVertexBuffers(gl);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, n);
    }
}

var g_points = [];

// webgl buffer

var click_count = 1;
var vertexBufferGlobal = null;

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        0.0, 0.5, -0.5, -0.5, 0.5, -0.5
    ]);

    var n = 3;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.error("createBuffer error");
        return;
    }

    vertexBufferGlobal = vertexBuffer;

    // or ELEMENT_ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // STATIC_DRAW or DYNAMIC_DRAW or STREAM_DRAW
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // TODO: error

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(a_Position);

    return n;
}

function reInitVertexBuffers(gl) {
    var vertices2 = new Float32Array([
        0.3, 0.5, -0.5, -0.5, 0.5, -0.5, 0.0, 0.0
    ]);
    var n = 4;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferGlobal);
    gl.bufferData(gl.ARRAY_BUFFER, vertices2, gl.STATIC_DRAW);
    // can't pass more date then offset+length, only change previous w/ gl.STATIC_DRAW !!!
    //gl.bufferSubData(gl.ARRAY_BUFFER, 0, vertices2);

    return n;
}

// main

function main() {
    var canvas = document.getElementById("cnv");
    // not css
    canvas.setAttribute('width', '600');
    canvas.setAttribute('height', '600');

    var gl = canvas.getContext("webgl");

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

    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0) {
        console.error("u_FragColor error");
        return;
    }

    gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
    gl.vertexAttrib1f(a_PointSize, 5.0);
    gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);

    // mouse
    canvas.onmousedown = function(ev) {
        click(ev, gl, canvas, a_Position);
    };

    // draw
    gl.clearColor(0.0, 0.0, 0.0, 0.2);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.POINTS, 0, 1);
}
