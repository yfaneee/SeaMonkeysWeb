// Dither Effect - Vanilla JavaScript with Three.js
// Converted from React Three Fiber to vanilla Three.js

const DitherEffect = (function() {
  'use strict';

  // Shader code
  const waveVertexShader = `
    precision highp float;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 modelPosition = modelMatrix * vec4(position, 1.0);
      vec4 viewPosition = viewMatrix * modelPosition;
      gl_Position = projectionMatrix * viewPosition;
    }
  `;

  const waveFragmentShader = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    uniform float waveSpeed;
    uniform float waveFrequency;
    uniform float waveAmplitude;
    uniform vec3 waveColor;

    vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

    float cnoise(vec2 P) {
      vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
      vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
      Pi = mod289(Pi);
      vec4 ix = Pi.xzxz;
      vec4 iy = Pi.yyww;
      vec4 fx = Pf.xzxz;
      vec4 fy = Pf.yyww;
      vec4 i = permute(permute(ix) + iy);
      vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
      vec4 gy = abs(gx) - 0.5;
      vec4 tx = floor(gx + 0.5);
      gx = gx - tx;
      vec2 g00 = vec2(gx.x, gy.x);
      vec2 g10 = vec2(gx.y, gy.y);
      vec2 g01 = vec2(gx.z, gy.z);
      vec2 g11 = vec2(gx.w, gy.w);
      vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
      g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
      float n00 = dot(g00, vec2(fx.x, fy.x));
      float n10 = dot(g10, vec2(fx.y, fy.y));
      float n01 = dot(g01, vec2(fx.z, fy.z));
      float n11 = dot(g11, vec2(fx.w, fy.w));
      vec2 fade_xy = fade(Pf.xy);
      vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
      return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
    }

    const int OCTAVES = 4;
    float fbm(vec2 p) {
      float value = 0.0;
      float amp = 1.0;
      float freq = waveFrequency;
      for (int i = 0; i < OCTAVES; i++) {
        value += amp * abs(cnoise(p));
        p *= freq;
        amp *= waveAmplitude;
      }
      return value;
    }

    float pattern(vec2 p) {
      vec2 p2 = p - time * waveSpeed;
      return fbm(p + fbm(p2)); 
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      uv -= 0.5;
      uv.x *= resolution.x / resolution.y;
      float f = pattern(uv);
      vec3 col = mix(vec3(0.0), waveColor, f);
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const ditherFragmentShader = `
    precision highp float;
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float colorNum;
    uniform float pixelSize;
    varying vec2 vUv;

    const float bayerMatrix8x8[64] = float[64](
      0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
      32.0/64.0,16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0,19.0/64.0, 47.0/64.0, 31.0/64.0,
      8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0,59.0/64.0,  7.0/64.0, 55.0/64.0,
      40.0/64.0,24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0,27.0/64.0, 39.0/64.0, 23.0/64.0,
      2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0,49.0/64.0, 13.0/64.0, 61.0/64.0,
      34.0/64.0,18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0,17.0/64.0, 45.0/64.0, 29.0/64.0,
      10.0/64.0,58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0,57.0/64.0,  5.0/64.0, 53.0/64.0,
      42.0/64.0,26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0,25.0/64.0, 37.0/64.0, 21.0/64.0
    );

    vec3 dither(vec2 uv, vec3 color) {
      vec2 scaledCoord = floor(uv * resolution / pixelSize);
      int x = int(mod(scaledCoord.x, 8.0));
      int y = int(mod(scaledCoord.y, 8.0));
      float threshold = bayerMatrix8x8[y * 8 + x] - 0.25;
      float step = 1.0 / (colorNum - 1.0);
      color += threshold * step;
      float bias = 0.2;
      color = clamp(color - bias, 0.0, 1.0);
      return floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
    }

    void main() {
      vec2 normalizedPixelSize = pixelSize / resolution;
      vec2 uvPixel = normalizedPixelSize * floor(vUv / normalizedPixelSize);
      vec4 color = texture2D(tDiffuse, uvPixel);
      color.rgb = dither(vUv, color.rgb);
      gl_FragColor = color;
    }
  `;

  // Dither Pass for post-processing
  class DitherPass {
    constructor(colorNum = 4, pixelSize = 2) {
      this.uniforms = {
        tDiffuse: { value: null },
        resolution: { value: new THREE.Vector2() },
        colorNum: { value: colorNum },
        pixelSize: { value: pixelSize }
      };

      this.material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: ditherFragmentShader
      });

      this.scene = new THREE.Scene();
      this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
      this.scene.add(this.quad);
    }

    render(renderer, writeBuffer, readBuffer) {
      this.uniforms.tDiffuse.value = readBuffer.texture;
      
      if (writeBuffer) {
        renderer.setRenderTarget(writeBuffer);
      } else {
        renderer.setRenderTarget(null);
      }
      
      renderer.render(this.scene, this.camera);
    }

    setSize(width, height) {
      this.uniforms.resolution.value.set(width, height);
    }
  }

  // Main Dither Effect class
  class Dither {
    constructor(containerElement, options = {}) {
      this.container = containerElement;
      this.options = {
        waveSpeed: options.waveSpeed || 0.05,
        waveFrequency: options.waveFrequency || 3,
        waveAmplitude: options.waveAmplitude || 0.3,
        waveColor: options.waveColor || [0.5, 0.5, 0.5],
        colorNum: options.colorNum || 4,
        pixelSize: options.pixelSize || 2,
        disableAnimation: options.disableAnimation || false
      };

      this.clock = new THREE.Clock();
      this.init();
      this.animate();
    }

    init() {
      // Scene
      this.scene = new THREE.Scene();

      // Camera
      this.camera = new THREE.PerspectiveCamera(
        75,
        this.container.clientWidth / this.container.clientHeight,
        0.1,
        1000
      );
      this.camera.position.z = 6;

      // Renderer
      this.renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
      });
      this.renderer.setPixelRatio(1);
      this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
      this.container.appendChild(this.renderer.domElement);

      // Wave Material
      const aspect = this.container.clientWidth / this.container.clientHeight;
      const frustumHeight = 2 * Math.tan((75 * Math.PI / 180) / 2) * 6;
      const frustumWidth = frustumHeight * aspect;

      this.waveUniforms = {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(
          this.container.clientWidth * this.renderer.getPixelRatio(),
          this.container.clientHeight * this.renderer.getPixelRatio()
        )},
        waveSpeed: { value: this.options.waveSpeed },
        waveFrequency: { value: this.options.waveFrequency },
        waveAmplitude: { value: this.options.waveAmplitude },
        waveColor: { value: new THREE.Color(...this.options.waveColor) }
      };

      const waveMaterial = new THREE.ShaderMaterial({
        vertexShader: waveVertexShader,
        fragmentShader: waveFragmentShader,
        uniforms: this.waveUniforms
      });

      // Plane mesh
      const geometry = new THREE.PlaneGeometry(frustumWidth, frustumHeight);
      this.mesh = new THREE.Mesh(geometry, waveMaterial);
      this.scene.add(this.mesh);

      // Post-processing
      this.renderTarget = new THREE.WebGLRenderTarget(
        this.container.clientWidth,
        this.container.clientHeight
      );
      
      this.ditherPass = new DitherPass(
        this.options.colorNum,
        this.options.pixelSize
      );
      this.ditherPass.setSize(
        this.container.clientWidth * this.renderer.getPixelRatio(),
        this.container.clientHeight * this.renderer.getPixelRatio()
      );

      // Handle window resize
      window.addEventListener('resize', () => this.onWindowResize());
    }

    onWindowResize() {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
      this.renderTarget.setSize(width, height);

      const dpr = this.renderer.getPixelRatio();
      this.waveUniforms.resolution.value.set(width * dpr, height * dpr);
      this.ditherPass.setSize(width * dpr, height * dpr);

      // Update mesh scale
      const aspect = width / height;
      const frustumHeight = 2 * Math.tan((75 * Math.PI / 180) / 2) * 6;
      const frustumWidth = frustumHeight * aspect;
      this.mesh.scale.set(frustumWidth, frustumHeight, 1);
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      if (!this.options.disableAnimation) {
        this.waveUniforms.time.value = this.clock.getElapsedTime();
      }

      // Render to render target first
      this.renderer.setRenderTarget(this.renderTarget);
      this.renderer.render(this.scene, this.camera);

      // Apply dither post-processing
      this.ditherPass.render(this.renderer, null, this.renderTarget);
    }

    destroy() {
      window.removeEventListener('resize', this.onWindowResize);
      this.renderer.dispose();
      this.container.removeChild(this.renderer.domElement);
    }
  }

  return Dither;
})();

// Auto-initialize if element exists
let initAttempts = 0;
const MAX_ATTEMPTS = 100; // Maximum 5 seconds (100 * 50ms)

function initDither() {
  initAttempts++;
  
  // Check if THREE is available
  if (typeof THREE === 'undefined') {
    if (initAttempts >= MAX_ATTEMPTS) {
      console.error('Failed to load THREE.js after', MAX_ATTEMPTS, 'attempts. Please check your internet connection.');
      return;
    }
    console.log('Waiting for THREE.js to load... (attempt', initAttempts, ')');
    setTimeout(initDither, 50);
    return;
  }

  console.log('THREE.js loaded successfully!', THREE.REVISION);
  
  const ditherContainer = document.getElementById('dither-background');
  if (ditherContainer) {
    console.log('Initializing dither effect...');
    console.log('Container dimensions:', ditherContainer.clientWidth, 'x', ditherContainer.clientHeight);
    
    try {
      window.ditherEffect = new DitherEffect(ditherContainer, {
        waveColor: [0.51, 0.93, 0.99],  
        disableAnimation: false,
        colorNum: 4,
        waveAmplitude: 0.3,
        waveFrequency: 4,
        waveSpeed: 0.01,
        pixelSize: 2
      });
      
    } catch (error) {
      console.error('Error initializing dither effect:', error);
    }
  } else {
    console.error('Dither container not found!');
  }
}

// Wait for both DOM and THREE.js to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDither);
} else {
  initDither();
}
