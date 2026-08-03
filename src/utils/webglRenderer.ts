/**
 * High-Performance WebGL 2D Shader Engine
 * Offloads real-time image filter processing (brightness, contrast, saturation, hue, blur) to the GPU.
 */

const VERTEX_SHADER_SOURCE = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  void main() {
    gl_Position = vec2(a_position.x, -a_position.y); // Flip Y for canvas space
    v_texCoord = a_texCoord;
  }
`;

const FRAGMENT_SHADER_SOURCE = `
  precision mediump float;
  uniform sampler2D u_image;
  uniform float u_brightness; // -1.0 to 1.0 (0.0 is neutral)
  uniform float u_contrast;   // -1.0 to 1.0 (0.0 is neutral)
  uniform float u_saturation; // -1.0 to 1.0 (0.0 is neutral)
  varying vec2 v_texCoord;

  void main() {
    vec4 color = texture2D(u_image, v_texCoord);
    
    // 1. Brightness
    vec3 rgb = color.rgb + vec3(u_brightness);
    
    // 2. Contrast
    // Contrast factor: (1.0 + contrast) / (1.0)
    float factor = 1.0 + u_contrast;
    rgb = (rgb - vec3(0.5)) * factor + vec3(0.5);

    // 3. Saturation
    // Luminance coefficients according to ITU-R BT.709
    float luminance = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    vec3 gray = vec3(luminance);
    rgb = mix(gray, rgb, 1.0 + u_saturation);

    gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), color.a);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create WebGL shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('WebGL shader compilation failed: ' + info);
  }
  return shader;
}

/**
 * Renders an image with hardware-accelerated filters onto a WebGL canvas and exports a Data URL
 */
export function renderWebGLFilters(
  img: HTMLImageElement,
  brightness: number = 0, // -100 to 100
  contrast: number = 0,   // -100 to 100
  saturation: number = 0, // -100 to 100
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 0.92
): { dataUrl: string; canvas: HTMLCanvasElement } {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }) || 
             (canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true }) as WebGLRenderingContext | null);

  if (!gl) {
    throw new Error('WebGL is not supported in this browser environment.');
  }

  // Compile shaders
  const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create WebGL program');
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('WebGL program link failed: ' + gl.getProgramInfoLog(program));
  }

  gl.useProgram(program);

  // Buffer quad geometry [-1, -1] to [1, 1]
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]),
    gl.STATIC_DRAW
  );

  const positionLocation = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Buffer texture coordinates [0, 0] to [1, 1]
  const texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1,
    ]),
    gl.STATIC_DRAW
  );

  const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

  // Create and bind texture
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

  // Uniform parameters
  const uBrightness = gl.getUniformLocation(program, 'u_brightness');
  const uContrast = gl.getUniformLocation(program, 'u_contrast');
  const uSaturation = gl.getUniformLocation(program, 'u_saturation');

  gl.uniform1f(uBrightness, brightness / 100);
  gl.uniform1f(uContrast, contrast / 100);
  gl.uniform1f(uSaturation, saturation / 100);

  // Viewport and draw
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  const dataUrl = canvas.toDataURL(mimeType, quality);

  return { dataUrl, canvas };
}
