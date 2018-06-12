var VSHADER_SRC = 
    'attribute vec4 a_Position;\n' +
    //'attribute float a_PointSize;\n' +
    // uniform -> one for all
    'uniform mat4 u_MVP;\n' +
    //'attribute vec4 a_Color;\n' +
    // to FSHADER
    //'varying vec4 v_Color;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() { \n' + 
    '  gl_Position = u_MVP * a_Position;\n' +
    //'  gl_PointSize = a_PointSize;\n' +
    //'  v_Color = a_Color;\n' +
    '  v_TexCoord = a_TexCoord;\n' +
    "}\n";

var FSHADER_SRC = 
    'precision mediump float;\n' +
    //'uniform vec4 u_FragColor;\n' +
    //'varying vec4 v_Color;\n' +
    'uniform sampler2D u_Sampler;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' + 
    //'  gl_FragColor = v_Color;\n' +
    //'  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    // gl_FragCoord gl_FragDepth
    // .x .y .z .w == .r .g .b .a == .s .t .p .q
    //'  gl_FragColor = vec4(gl_FragCoord.x / 600.0, 0.0, gl_FragCoord.y / 600.0, 1.0);\n' +
    //'  gl_FragColor = vec4(gl_FragCoord.x / 600.0, 0.0, 0.0, 1.0);\n' +
    //'  gl_FragColor = vec4(0.0, 0.0, gl_FragCoord.y / 600.0, 1.0);\n' +
    '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
    '}\n';

// axes
var VAXESSHADER_SRC = 
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_MVP;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' +
    'void main() { \n' + 
    '  gl_Position = u_MVP * a_Position;\n' +
    '  v_Color = a_Color;\n' +
    "}\n";

var FAXESSHADER_SRC = 
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' + 
    '  gl_FragColor = v_Color;\n' +
    '}\n';

// shaders

function initShaders(gl, vshader, fshader) {
    var program = createProgram(gl, vshader, fshader);
    if (!program) {
      console.log('Failed to create program');
      return false;
    }
  
    //gl.useProgram(program);
    gl.program = program;
  
    return true;
}

function initAxesShaders(gl, vshader, fshader) {
    var program = createProgram(gl, vshader, fshader);
    if (!program) {
      console.log('Failed to create Axes program');
      return false;
    }
  
    //gl.useProgram(program);
    gl.programAxes = program;
  
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
var FSIZEGlobal = 0;

var vertexBufferGlobalAxes = null;
var FSIZEGlobalAxes = 0;

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        // // 0.0,  0.5, 1.0, 0.0, 0.0,
        // -0.5,  0.5, 0.0, 1.0, 0.0,
        // 0.5,  0.5, 1.0, 0.0, 0.0,
        // -0.5, -0.5, 0.0, 0.0, 1.0,
        //  0.5, -0.5, 1.0, 1.0, 1.0
        // Vertex coordinates, texture coordinate
        -0.5,  0.5,   0.0, 1.0,
        -0.5, -0.5,   0.0, 0.0,
        0.5,  0.5,   1.0, 1.0,
        0.5, -0.5,   1.0, 0.0,
    ]);

    var n = 4;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.error("createBuffer error");
        return;
    }

    vertexBufferGlobal = vertexBuffer;

    // ARRAY_BUFFER  ELEMENT_ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // STATIC_DRAW DYNAMIC_DRAW STREAM_DRAW
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // TODO: error
    //gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 5, 0);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    // var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    // // TODO: error
    // gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 5, FSIZE * 2);
    // gl.enableVertexAttribArray(a_Color);

    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_TexCoord < 0) {
      console.log('Failed to get the storage location of a_TexCoord');
      return -1;
    }    
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    // gl.a_Position = a_Position;
    // gl.a_Color = a_Color;

    FSIZEGlobal = FSIZE;

    return n;
}

function initAxesVertexBuffers(gl) {
    var vertices = new Float32Array([
        -1.0,  0.0,  0.0, 1.0, 0.0, 0.0,
         1.0,  0.0,  0.0, 1.0, 0.0, 0.0,
         0.0, -1.0,  0.0, 0.0, 1.0, 0.0,
         0.0,  1.0,  0.0, 0.0, 1.0, 0.0,
         0.0,  0.0, -1.0, 0.0, 0.0, 1.0,
         0.0,  0.0,  1.0, 0.0, 0.0, 1.0
    ]);

    var n = 6;

    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.error("createBuffer error");
        return;
    }

    vertexBufferGlobalAxes = vertexBuffer;

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var FSIZE = vertices.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(gl.programAxes, 'a_Position');
    // TODO: error
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(gl.programAxes, 'a_Color');
    // TODO: error
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    // gl.a_PositionAxes = a_Position;
    // gl.a_ColorAxes = a_Color;

    FSIZEGlobalAxes = FSIZE;

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

var ROTATE_ANGLE = 30.0;
var TX = 0.0;
var TY = 0.0;
// deg by sec
var ANGLE_STEP = 45.0;

var CANVAS_W = 0.0;
var CANVAS_H = 0.0;

var viewMatrix = null;

function main() {
    var canvas = document.getElementById("cnv");
    // not css
    canvas.setAttribute('width', '600');
    canvas.setAttribute('height', '600');

    CANVAS_W = canvas.width.toFixed(2);
    CANVAS_H = canvas.height.toFixed(2);

    var gl = canvas.getContext("webgl");

    if (!gl) {
        console.error("getContext webgl error");
        return;
    }

    if (!initShaders(gl, VSHADER_SRC, FSHADER_SRC)) {
        console.error("initShaders error");
        return;
    }

    var n = initVertexBuffers(gl);

    if (!initAxesShaders(gl, VAXESSHADER_SRC, FAXESSHADER_SRC)) {
        console.error("initAxesShaders error");
        return;
    }

    var nAxes = initAxesVertexBuffers(gl);

    // matrix
    // var xformMatrix = new Matrix4();
    // reverse
    // xformMatrix.setRotate(ROTATE_ANGLE, 0, 0, 1);
    // xformMatrix.translate(TX, 0, 0);
    // xformMatrix.setTranslate(TX, 0, 0);
    // xformMatrix.rotate(ROTATE_ANGLE, 0, 0, 1);

    
    

    // shader params
    // var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // if (a_Position < 0) {
    //     console.error("a_Position error");
    //     return;
    // }

    // var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
    // if (a_PointSize < 0) {
    //     console.error("a_PointSize error");
    //     return;
    // }

    // var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    // if (u_FragColor < 0) {
    //     console.error("u_FragColor error");
    //     return;
    // }

    // var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    // if (u_ModelMatrix < 0) {
    //     console.error("u_ModelMatrix error");
    //     return;
    // }

    // var a_Color = gl.getUniformLocation(gl.program, 'a_Color');
    // if (a_Color < 0) {
    //     console.error("a_Color error");
    //     return;
    // }

    //gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
    //gl.vertexAttrib1f(a_PointSize, 5.0);
    //gl.uniform4f(u_FragColor, 1.0, 1.0, 0.0, 1.0);
    //gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix.elements);

    // mouse
    canvas.onmousedown = function(ev) {
        //click(ev, gl, canvas, a_Position);
        mouseDown(ev);
    };
    canvas.onmouseup = function(ev) {
        mouseUp(ev);
    };
    canvas.onmousemove = function(ev) {
        mouseMove(ev);
    };

    var currentAngle = 0.0;
    var modelMatrix = new Matrix4();
    viewMatrix = new Matrix4();
    //viewMatrix.setLookAt(0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
    //viewMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 1.0, -1.0);
    //viewMatrix.setFrustum(-1.0, 1.0, -1.0, 1.0, 1.1, 1.0);
    //viewMatrix.setPerspective(60, 1, 100, 1);

    if (!initTextures(gl, n)) {
        console.error('initTextures error');
        return;
      }

    // draw
    gl.clearColor(0.0, 0.0, 0.0, 0.2);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.drawArrays(gl.POINTS, 0, 1);

    var tick = function() {
        if (is_starting) {
            currentAngle = animate(currentAngle);
        }
        draw(gl, n, nAxes, currentAngle, modelMatrix, viewMatrix/*, u_ModelMatrix*/);
        requestAnimationFrame(tick);
    };

    tick();
}

// anim

var is_starting = false;

function toggle_starting() {
    is_starting = !is_starting;
    document.getElementById("start_button").disabled = is_starting;
    document.getElementById("stop_button").disabled = !is_starting;
}

function start() {
    console.log("start");
    g_last = Date.now();
    toggle_starting();
}

function stop() {
    console.log("stop");
    toggle_starting();
}

var g_last = Date.now();

function animate(angle) {
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;

    var newAngle = angle + (ANGLE_STEP * elapsed / 1000.0);
    return newAngle % 360;
}

function draw(gl, n, nAxes, currentAngle, modelMatrix, viewMatrix/*, u_ModelMatrix*/) {
    //modelMatrix.setRotate(currentAngle, 0, 0, 1);

    modelMatrix.setTranslate(TX, TY, 0.0);
    modelMatrix.rotate(currentAngle, 0, 0, 1);

    gl.clear(gl.COLOR_BUFFER_BIT);
    
    drawAxes(gl, nAxes, viewMatrix);
    drawFigure(gl, n, modelMatrix, viewMatrix);
}

function drawFigure(gl, n, modelMatrix, viewMatrix) {
    gl.useProgram(gl.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferGlobal);

    var mvp = new Matrix4();
    mvp.set(modelMatrix);
    mvp.multiply(viewMatrix);

    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_MVP');
    gl.uniformMatrix4fv(u_ModelMatrix, false, mvp.elements);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // TODO: error
    //gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZEGlobal * 5, 0);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZEGlobal * 4, 0);
    gl.enableVertexAttribArray(a_Position);

    // var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    // // TODO: error
    // gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZEGlobal * 5, FSIZEGlobal * 2);
    // gl.enableVertexAttribArray(a_Color);

    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZEGlobal * 4, FSIZEGlobal * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

function drawAxes(gl, nAxes, viewMatrix) {
    gl.useProgram(gl.programAxes);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferGlobalAxes);

    var u_ModelMatrix = gl.getUniformLocation(gl.programAxes, 'u_MVP');
    gl.uniformMatrix4fv(u_ModelMatrix, false, viewMatrix.elements);

    var a_Position = gl.getAttribLocation(gl.programAxes, 'a_Position');
    // TODO: error
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZEGlobalAxes * 6, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Color = gl.getAttribLocation(gl.programAxes, 'a_Color');
    // TODO: error
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZEGlobalAxes * 6, FSIZEGlobalAxes * 3);
    gl.enableVertexAttribArray(a_Color);

    gl.drawArrays(gl.LINES, 0, nAxes);
}

var is_drag = false;
var drag_start_pos_x = 0;
var drag_start_pos_y = 0;

function mouseDown(ev) {
    if (ev.which === 1) {
        // not work in chrome
        if (ev.target.setCapture) ev.target.setCapture();
        console.log("mouseDown");
        is_drag = true;
        drag_start_pos_x = ev.clientX;
        drag_start_pos_y = ev.clientY;
    }
}

function mouseUp(ev) {
    if (ev.which === 1) {
        console.log("mouseUp");
        is_drag = false;
    }
}

function mouseMove(ev) {
    if (is_drag) {
        console.log("mouseMove");
        var x = ev.clientX;
        var y = ev.clientY;

        // * 2 => -1.0..1.0
        TX += (x - drag_start_pos_x) / CANVAS_W * 2;
        TY += (drag_start_pos_y - y) / CANVAS_H * 2;

        drag_start_pos_x = x;
        drag_start_pos_y = y;
    }
}

// translate
function translate_m_x_button() {
    viewMatrix.translate(-0.1, 0.0, 0.0);
}

function translate_p_x_button() {
    viewMatrix.translate(0.1, 0.0, 0.0);
}

function translate_m_y_button() {
    viewMatrix.translate(0.0, -0.1, 0.0);
}

function translate_p_y_button() {
    viewMatrix.translate(0.0, 0.1, 0.0);
}

function translate_m_z_button() {
    viewMatrix.translate(0.0, 0.0, -0.1);
}

function translate_p_z_button() {
    viewMatrix.translate(0.0, 0.0, 0.1);
}

// rotate
function rotate_m_x_button() {
    viewMatrix.rotate(-10, 1.0, 0.0, 0.0);
}

function rotate_p_x_button() {
    viewMatrix.rotate(10, 1.0, 0.0, 0.0);
}

function rotate_m_y_button() {
    viewMatrix.rotate(-10, 0.0, 1.0, 0.0);
}

function rotate_p_y_button() {
    viewMatrix.rotate(10, 0.0, 1.0, 0.0);
}

function rotate_m_z_button() {
    viewMatrix.rotate(-10, 0.0, 0.0, 1.0);
}

function rotate_p_z_button() {
    viewMatrix.rotate(10, 0.0, 0.0, 1.0);
}

// texture
function initTextures(gl, n) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
      console.log('Failed to create the texture object');
      return false;
    }

    // Get the storage location of u_Sampler
    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
    if (!u_Sampler) {
      console.log('Failed to get the storage location of u_Sampler');
      return false;
    }
    var image = new Image();  // Create the image object
    if (!image) {
      console.log('Failed to create the image object');
      return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function(){ loadTexture(gl, n, texture, u_Sampler, image); };
    // Tell the browser to load an image
    image.src = 'res/sky.jpg';
  
    return true;
}

  function loadTexture(gl, n, texture, u_Sampler, image) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler, 0);
    
    gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
  
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  }
