// global variables
const canvas = document.getElementById("scene-canvas");
const gl = canvas.getContext("webgl");

// create vertex shader (glsl syntax to be compiled)
var vertexShaderText = [
  "precision mediump float;",
  "attribute vec2 vertPosition;",
  "attribute vec3 vertColor;",
  "varying vec3 fragColor;",
  "uniform mat4 mWorld;", // matrix for rotation
  "uniform mat4 mView;", // matrix for camera
  "uniform mat4 mProj;", // matrix to project in 2d

  "void main(){",
  " fragColor = vertColor;",
  " gl_Position = mProj * mView * mWorld * vec4(vertPosition, 0.0, 1.0);",
  "}"
].join("\n");

// create fragment shader
var fragmentShaderText = [
  "precision mediump float;",
  "varying vec3 fragColor;",
  "void main(){",
  " gl_FragColor = vec4(fragColor, 1.0);",
  "}"
].join("\n");

function compileShader(shader, shaderName) {
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(
      "error compiling",
      shaderName,
      ":",
      gl.getShaderInfoLog(shader)
    );
  }
}

function init() {
  console.log("initializing scene...");

  gl.clearColor(0.75, 0.85, 0.8, 1.0); // set paint color
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // paint using color buffer

  // create shaders
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  gl.shaderSource(vertexShader, vertexShaderText);
  gl.shaderSource(fragmentShader, fragmentShaderText);

  // compile
  compileShader(vertexShader, "vertexShader");
  compileShader(fragmentShader, "fragmentShader");

  // create graphics program and attach shaders
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("error linking program:", gl.getProgramInfoLog(program));
  }
  gl.validateProgram(program);
  if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
    console.error("error validating program:", gl.getProgramInfoLog(program));
  }

  // ********************************************************
  // create buffer
  // ********************************************************

  // create vertices and pass it to the program
  // vertices coordinates are (x,y) in (-1.0, 1.0), centered around (0,0)
  var vertices = [
    //X,    Y,    Z,   R,   G,   B
    [+0.0, +0.5, +0.0, 1.0, 1.0, 0.0],
    [-0.5, -0.5, +0.0, 0.7, 0.0, 1.0],
    [+0.5, -0.5, +0.0, 0.1, 1.0, 0.6]
  ].flat();
  var triangleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var positionAttributeLocation = gl.getAttribLocation(program, "vertPosition");
  var colorAttributeLocation = gl.getAttribLocation(program, "vertColor");
  gl.vertexAttribPointer(
    positionAttributeLocation, // attribute location
    3, // number of elements per attribute
    gl.FLOAT, // type of elements
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
    0 // offset from the beginning of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttributeLocation, // attribute location
    3, // number of elements per attribute
    gl.FLOAT, // type of elements
    gl.FALSE,
    6 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
    3 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute
  );

  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(colorAttributeLocation);

  // tell opengl state machine which program should be active.
  gl.useProgram(program);

  var matWorldUniformLocation = gl.getUniformLocation(program, "mWorld");
  var matViewUniformLocation = gl.getUniformLocation(program, "mView");
  var matProjUniformLocation = gl.getUniformLocation(program, "mProj");

  var matrixWorld = new Float32Array(16);
  var matrixView = new Float32Array(16);
  var matrixProj = new Float32Array(16);
  glMatrix.mat4.identity(matrixWorld);
  glMatrix.mat4.lookAt(matrixView, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
  glMatrix.mat4.perspective(
    matrixProj,
    glMatrix.glMatrix.toRadian(45),
    canvas.width / canvas.clientHeight,
    0.1,
    1000.0
  );

  // send matrices from cpu to gpu
  //gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matrixWorld);
  gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, matrixView);
  gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, matrixProj);

  // **************************************************************
  // main render loop
  // **************************************************************
  var angle = 0;
  var identityMatrix = new Float32Array(16);
  glMatrix.mat4.identity(identityMatrix);

  var loop = function() {
    // get number of seconds since window started
    // one full rotation every 6 seconds
    angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
    glMatrix.mat4.rotate(matrixWorld, identityMatrix, angle, [0, 1, 0]);
    // pass to gpu
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, matrixWorld);

    // clear screen
    //gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // call function again once screen is ready to display
    // usually 60 times per second
    // note: won't be called by browser if current tab is not active.
    requestAnimationFrame(loop);
  };

  // start animation
  requestAnimationFrame(loop);

  console.log("done!");
}
