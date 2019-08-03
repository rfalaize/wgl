// global variables
const canvas = document.getElementById("scene-canvas");
const gl = canvas.getContext("webgl");

// create vertex shader (glsl syntax to be compiled)
var vertexShaderText = [
  "precision mediump float;",
  "attribute vec2 vertPosition;",
  "attribute vec3 vertColor;",
  "varying vec3 fragColor;",
  "void main(){",
  " fragColor = vertColor;",
  " gl_Position = vec4(vertPosition, 0.0, 1.0);",
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
    // X, Y, R, G, B
    [0.0, 0.5, 1.0, 1.0, 0.0], //
    [-0.5, -0.5, 0.7, 0.0, 1.0], //
    [0.5, -0.5, 0.1, 1.0, 0.6] //
  ].flat();
  var triangleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var positionAttributeLocation = gl.getAttribLocation(program, "vertPosition");
  var colorAttributeLocation = gl.getAttribLocation(program, "vertColor");
  gl.vertexAttribPointer(
    positionAttributeLocation, // attribute location
    2, // number of elements per attribute
    gl.FLOAT, // type of elements
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
    0 // offset from the beginning of a single vertex to this attribute
  );
  gl.vertexAttribPointer(
    colorAttributeLocation, // attribute location
    3, // number of elements per attribute
    gl.FLOAT, // type of elements
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
    2 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute
  );
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(colorAttributeLocation);

  // main render loop
  gl.useProgram(program);
  gl.drawArrays(
    gl.TRIANGLES,
    0, // vertices to skip,
    3 // vertices to draw
  );

  console.log("done!");
}
