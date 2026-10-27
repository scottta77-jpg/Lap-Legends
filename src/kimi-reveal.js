import * as THREE from 'three';

/**
 * Simplex 3D Noise GLSL implementation by Stefan Gustavson & Ian McEwan
 */
const SIMPLEX_3D_GLSL = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v   - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0 );
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uPortrait;
uniform sampler2D uHelmet;

uniform float uTime;
uniform float uCycleDuration;
uniform float uInitialPortraitDuration;
uniform float uActiveSweepDuration;
uniform float uClearPortraitDuration;

uniform float uBandScale;
uniform float uBandCount;
uniform float uWarpStrength;
uniform float uEdgeFeather;
uniform float uSpeed;
uniform float uSeed;

uniform int uViewMode;      // 0 = Composite, 1 = Grayscale Mask, 2 = Portrait, 3 = Helmet
uniform int uReducedMotion; // 1 = static portrait

${SIMPLEX_3D_GLSL}

/**
 * Procedural mask with 3D simplex noise domain warping and broad curved bands
 */
float getAutoMask(vec2 subjectUv, float elapsedSeconds) {
  if (uReducedMotion == 1) {
    return 0.0;
  }

  float cycleTime = mod(elapsedSeconds, uCycleDuration);
  float t1 = uInitialPortraitDuration;
  float t2 = t1 + uActiveSweepDuration;

  // Initial clean portrait interval (default 1.0s) or clear portrait interval (default 2.0s)
  if (cycleTime < t1 || cycleTime >= t2) {
    return 0.0;
  }

  // Active sweep normalized progress: 0.0 -> 1.0 over uActiveSweepDuration (default 5.0s)
  float tau = (cycleTime - t1) / uActiveSweepDuration;

  // Asymmetric sweep envelope: emerges smoothly, peaks, and recedes cleanly
  float envelope = pow(sin(tau * 3.14159265), 0.85);

  // Center coordinate space on the driver's head and helmet region
  // In 1254x1254: head center is at X=0.50, Y=0.72
  vec2 p = (subjectUv - vec2(0.50, 0.72)) * uBandScale;

  // Evolving continuous time for organic fluid breathing
  float flowTime = elapsedSeconds * uSpeed * 0.45 + uSeed * 0.1;

  // Low-frequency noise vector field (Domain Warp Octave 1)
  vec2 q = vec2(
    snoise(vec3(p * 0.95, flowTime)),
    snoise(vec3(p * 0.95 + vec2(4.3, 2.7), flowTime + 1.2))
  );

  // Secondary warp for rich curling ribbon contours (Domain Warp Octave 2)
  vec2 r = vec2(
    snoise(vec3((p + 1.2 * q) * 1.35 + vec2(1.7, 9.2), flowTime * 1.3)),
    snoise(vec3((p + 1.2 * q) * 1.35 + vec2(8.3, 2.8), flowTime * 1.3 + 2.1))
  );

  // Warped coordinates: images stay fixed, only mask field coordinates warp
  vec2 warpedP = p + uWarpStrength * (q * 0.75 + r * 0.25);

  // Aerodynamic sweep angle (~24 degrees)
  const float sweepAngle = 0.42;
  vec2 sweepDir = vec2(cos(sweepAngle), sin(sweepAngle));
  vec2 perpDir = vec2(-sin(sweepAngle), cos(sweepAngle));

  // Coordinate along the sweeping flow direction with non-linear curvature across the head
  float bandCoord = dot(warpedP, sweepDir);
  bandCoord += 0.42 * dot(warpedP, perpDir) * dot(warpedP, perpDir);

  // Sweep phase travels across the helmet as tau progresses from 0.0 to 1.0
  float sweepPhase = (tau - 0.5) * 4.8;
  float ribbonAngle = bandCoord * uBandCount * 3.14159265 - sweepPhase;

  // Broad curved bands wave + subharmonic
  float bandWave = sin(ribbonAngle) + 0.38 * sin(ribbonAngle * 2.0 + 0.8);

  // Add subtle edge turbulence for organic liquid ribbon boundary
  float turbulence = snoise(vec3(warpedP * 2.0, flowTime * 1.5)) * 0.35;
  float fieldVal = bandWave + turbulence;

  // Dynamic coverage threshold driven by sweep envelope
  // As envelope peaks, threshold drops so broad bands emerge and expand
  float threshold = 0.65 - envelope * 0.75;
  float feather = max(0.005, uEdgeFeather);

  // Soft organic feathered edge
  float rawMask = smoothstep(threshold - feather, threshold + feather, fieldVal);

  // Temporal entry and exit smooth gating (zero jump at cycle boundaries)
  float window = smoothstep(0.0, 0.04, tau) * (1.0 - smoothstep(0.96, 1.0, tau));
  rawMask *= window;

  // Confine reveal strictly to the head, visor and helmet (taper above the unchanged suit collar)
  float headWeight = smoothstep(0.40, 0.47, subjectUv.y);
  return rawMask * headWeight;
}

void main() {
  // Sample registered 1254x1254 textures
  vec4 portrait = texture2D(uPortrait, vUv);
  vec4 helmet = texture2D(uHelmet, vUv);

  // Explicit Premultiplied Alpha Conversion
  // Guarantees zero halo, zero dark borders, and zero brightness shift on the suit
  vec4 p_pre = vec4(portrait.rgb * portrait.a, portrait.a);
  vec4 h_pre = vec4(helmet.rgb * helmet.a, helmet.a);

  // Developer View: 2 = Portrait Only
  if (uViewMode == 2) {
    gl_FragColor = p_pre;
    return;
  }

  // Developer View: 3 = Helmet Only
  if (uViewMode == 3) {
    gl_FragColor = h_pre;
    return;
  }

  // Calculate procedural automatic mask scalar field
  float mask = getAutoMask(vUv, uTime);

  // Developer View: 1 = Grayscale Automatic Mask
  if (uViewMode == 1) {
    gl_FragColor = vec4(vec3(mask), 1.0);
    return;
  }

  // Developer View: 0 = Final Composite (Default)
  // Linear blend between premultiplied registered states preserves wider helmet silhouette
  vec4 comp_pre = mix(p_pre, h_pre, mask);
  gl_FragColor = comp_pre;
}
`;

/**
 * Default tuning values loaded from phase-1-settings.json
 */
export const PHASE_1_DEFAULTS = {
  cycleSeconds: 8.0,
  initialPortraitSeconds: 1.0,
  activeSweepSeconds: 5.0,
  clearPortraitSeconds: 2.0,
  bandScale: 2.0,
  bandCount: 2.0,
  warpStrength: 0.38,
  edgeFeather: 0.08,
  speed: 1.0,
  seed: 42.0,
};

export class KimiRevealStage {
  constructor(options = {}) {
    this.container = options.container;
    this.stageElement = options.stageElement;
    this.onProgress = options.onProgress || (() => {});
    this.onStateChange = options.onStateChange || (() => {});

    // Animation & Tuning State
    this.settings = { ...PHASE_1_DEFAULTS };
    this.elapsedSeconds = 0.0;
    this.lastTimestamp = null;
    this.isPaused = false;
    this.isScrubbing = false;
    this.viewMode = 0; // 0=Composite, 1=Mask, 2=Portrait, 3=Helmet
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Driver metadata for compatibility
    this.currentIndex = 0;

    this.init();
  }

  async init() {
    this.setupThreeScene();
    this.setupEventListeners();
    await this.loadTextures();
    // HERO DEV debug panel removed per user request
    // this.setupDebugPanel();

    // Start render loop
    requestAnimationFrame(this.render.bind(this));
  }

  setupThreeScene() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.canvas = this.renderer.domElement;
    this.canvas.className = 'hero-webgl-canvas kimi-webgl-canvas';
    this.stageElement.innerHTML = '';
    this.stageElement.appendChild(this.canvas);

    this.scene = new THREE.Scene();

    // Orthographic Camera for pixel-perfect 1:1 square quad registration
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, 0, 0, 10);
    this.camera.position.z = 1;

    // Unit square geometry (0,0) to (1,1)
    const geometry = new THREE.PlaneGeometry(1, 1);

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      uniforms: {
        uPortrait: { value: null },
        uHelmet: { value: null },
        uTime: { value: 0.0 },
        uCycleDuration: { value: this.settings.cycleSeconds },
        uInitialPortraitDuration: { value: this.settings.initialPortraitSeconds },
        uActiveSweepDuration: { value: this.settings.activeSweepSeconds },
        uClearPortraitDuration: { value: this.settings.clearPortraitSeconds },
        uBandScale: { value: this.settings.bandScale },
        uBandCount: { value: this.settings.bandCount },
        uWarpStrength: { value: this.settings.warpStrength },
        uEdgeFeather: { value: this.settings.edgeFeather },
        uSpeed: { value: this.settings.speed },
        uSeed: { value: this.settings.seed },
        uViewMode: { value: this.viewMode },
        uReducedMotion: { value: this.reducedMotion ? 1 : 0 },
      },
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    this.onResize();
  }

  async loadTextures() {
    const loader = new THREE.TextureLoader();
    const loadTex = (url) =>
      new Promise((resolve) => {
        loader.load(url, (tex) => {
          tex.generateMipmaps = false;
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          resolve(tex);
        });
      });

    const [portraitTex, helmetTex] = await Promise.all([
      loadTex('/assets/lap-legends/kimi/portrait.png'),
      loadTex('/assets/lap-legends/kimi/helmet-on-aligned.png'),
    ]);

    this.material.uniforms.uPortrait.value = portraitTex;
    this.material.uniforms.uHelmet.value = helmetTex;

    // Trigger loaded notification
    if (this.debugBadge) {
      this.debugBadge.classList.add('is-ready');
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this));

    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      if (this.material) {
        this.material.uniforms.uReducedMotion.value = this.reducedMotion ? 1 : 0;
      }
    });

    // Keyboard shortcut 'D' to toggle Developer Debug Panel
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'd' || e.key === 'D') {
        this.toggleDebugPanel();
      }
    });
  }

  onResize() {
    const width = this.stageElement.offsetWidth || window.innerWidth;
    const height = this.stageElement.offsetHeight || window.innerHeight;

    if (width <= 0 || height <= 0) return;

    this.renderer.setSize(width, height);

    const aspect = width / height;

    // Frame the 1:1 subject square quad:
    // Centered horizontally, anchored to the bottom of the viewport
    // On desktop, the quad height fills ~94% of stage height.
    // On mobile (narrow aspect), quad fills stage width and anchors to bottom.
    this.camera.left = -aspect / 2;
    this.camera.right = aspect / 2;
    this.camera.top = 1.0;
    this.camera.bottom = 0.0;
    this.camera.updateProjectionMatrix();

    // Quad size in normalized height units [0.0 to 1.0]:
    let quadHeight = 0.95;
    let quadWidth = quadHeight;

    if (aspect < 1.0) {
      // Mobile portrait mode: width becomes the bounding factor
      quadWidth = Math.min(aspect * 1.15, 1.25);
      quadHeight = quadWidth;
    }

    this.mesh.scale.set(quadWidth, quadHeight, 1);
    // Position: X=0 (horizontal center), Y anchored to the bottom
    this.mesh.position.set(0, quadHeight / 2, 0);
  }

  render(timestamp) {
    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestamp;
    }
    const dt = (timestamp - this.lastTimestamp) / 1000.0;
    this.lastTimestamp = timestamp;

    if (!this.isPaused && !this.isScrubbing) {
      this.elapsedSeconds += dt;
      this.material.uniforms.uTime.value = this.elapsedSeconds;
      this.updateDebugScrubber();
    }

    // Report normalized cycle progress for UI bars
    const cycleTime = this.elapsedSeconds % this.settings.cycleSeconds;
    const progress = cycleTime / this.settings.cycleSeconds;
    this.onProgress(0, progress);

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }

  pause() {
    this.isPaused = true;
    if (this.pauseBtn) this.pauseBtn.textContent = 'RESUME';
  }

  resume() {
    this.isPaused = false;
    if (this.pauseBtn) this.pauseBtn.textContent = 'PAUSE';
  }

  restart() {
    this.elapsedSeconds = 0.0;
    this.material.uniforms.uTime.value = 0.0;
    this.updateDebugScrubber();
  }

  setTime(seconds) {
    this.elapsedSeconds = Math.max(0, seconds);
    this.material.uniforms.uTime.value = this.elapsedSeconds;
    this.updateDebugScrubber();
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.material.uniforms.uViewMode.value = mode;

    if (this.debugPanel) {
      this.debugPanel.querySelectorAll('.debug-mode-btn').forEach((btn) => {
        const btnMode = parseInt(btn.dataset.mode, 10);
        btn.classList.toggle('is-active', btnMode === mode);
      });
    }
  }

  switchToDriver(index) {
    // Phase 1 is strictly single-driver Kimi Antonelli prototype
    this.restart();
  }

  /**
   * Developer Debug UI Overlay (?heroDebug=1 or 'D' key)
   */
  setupDebugPanel() {
    // 1. Discreet toggle badge in bottom corner
    const badge = document.createElement('button');
    badge.className = 'kimi-debug-badge';
    badge.id = 'kimiDebugBadge';
    badge.setAttribute('aria-label', 'Open Developer Tuning Panel (Press D)');
    badge.innerHTML = `
      <span class="badge-dot"></span>
      <span class="badge-text">HERO DEV</span>
    `;
    badge.addEventListener('click', () => this.toggleDebugPanel());
    document.body.appendChild(badge);
    this.debugBadge = badge;

    // 2. Full Developer Panel
    const panel = document.createElement('aside');
    panel.className = 'kimi-debug-panel is-hidden';
    panel.id = 'kimiDebugPanel';
    panel.setAttribute('aria-label', 'Kimi Helmet Reveal Tuning Controls');

    panel.innerHTML = `
      <div class="debug-panel-header">
        <div class="debug-panel-title">
          <span class="debug-pill">PHASE 1</span>
          <strong>HELMET REVEAL DEV</strong>
        </div>
        <button class="debug-close-btn" id="debugCloseBtn" aria-label="Close Debug Panel">&times;</button>
      </div>

      <div class="debug-section">
        <label class="debug-label">VIEW MODE</label>
        <div class="debug-btn-group">
          <button class="debug-btn debug-mode-btn is-active" data-mode="0">COMPOSITE</button>
          <button class="debug-btn debug-mode-btn" data-mode="1">MASK</button>
          <button class="debug-btn debug-mode-btn" data-mode="2">PORTRAIT</button>
          <button class="debug-btn debug-mode-btn" data-mode="3">HELMET</button>
        </div>
      </div>

      <div class="debug-section">
        <div class="debug-row-between">
          <label class="debug-label">TIME SCRUBBER</label>
          <span class="debug-readout" id="debugTimeReadout">0.00s / 8.00s</span>
        </div>
        <div class="debug-scrubber-track">
          <input type="range" class="debug-slider" id="debugScrubber" min="0" max="8.0" step="0.01" value="0" />
        </div>
        <div class="debug-phase-indicator" id="debugPhaseIndicator">
          PHASE: CLEAN PORTRAIT (1.0s)
        </div>
        <div class="debug-btn-group debug-playback-group">
          <button class="debug-btn" id="debugPauseBtn">PAUSE</button>
          <button class="debug-btn" id="debugRestartBtn">RESTART (t=0)</button>
        </div>
      </div>

      <div class="debug-section debug-tuning-section">
        <label class="debug-label">CYCLE & SWEEP TIMING</label>

        <div class="debug-control-row">
          <span>Cycle Duration</span>
          <input type="range" class="debug-slider js-tune" data-param="cycleSeconds" min="4.0" max="16.0" step="0.5" value="${this.settings.cycleSeconds}" />
          <span class="debug-val" id="val-cycleSeconds">${this.settings.cycleSeconds.toFixed(1)}s</span>
        </div>

        <div class="debug-control-row">
          <span>Clean Portrait</span>
          <input type="range" class="debug-slider js-tune" data-param="initialPortraitSeconds" min="0.0" max="3.0" step="0.25" value="${this.settings.initialPortraitSeconds}" />
          <span class="debug-val" id="val-initialPortraitSeconds">${this.settings.initialPortraitSeconds.toFixed(2)}s</span>
        </div>

        <div class="debug-control-row">
          <span>Active Sweep</span>
          <input type="range" class="debug-slider js-tune" data-param="activeSweepSeconds" min="1.0" max="10.0" step="0.5" value="${this.settings.activeSweepSeconds}" />
          <span class="debug-val" id="val-activeSweepSeconds">${this.settings.activeSweepSeconds.toFixed(1)}s</span>
        </div>

        <div class="debug-control-row">
          <span>Clear Portrait</span>
          <input type="range" class="debug-slider js-tune" data-param="clearPortraitSeconds" min="0.5" max="5.0" step="0.5" value="${this.settings.clearPortraitSeconds}" />
          <span class="debug-val" id="val-clearPortraitSeconds">${this.settings.clearPortraitSeconds.toFixed(1)}s</span>
        </div>
      </div>

      <div class="debug-section debug-tuning-section">
        <label class="debug-label">CURVED BANDS & NOISE WARP</label>

        <div class="debug-control-row">
          <span>Band Scale</span>
          <input type="range" class="debug-slider js-tune" data-param="bandScale" min="0.8" max="4.5" step="0.1" value="${this.settings.bandScale}" />
          <span class="debug-val" id="val-bandScale">${this.settings.bandScale.toFixed(2)}</span>
        </div>

        <div class="debug-control-row">
          <span>Band Count</span>
          <input type="range" class="debug-slider js-tune" data-param="bandCount" min="1.0" max="4.0" step="0.5" value="${this.settings.bandCount}" />
          <span class="debug-val" id="val-bandCount">${this.settings.bandCount.toFixed(1)}</span>
        </div>

        <div class="debug-control-row">
          <span>Warp Strength</span>
          <input type="range" class="debug-slider js-tune" data-param="warpStrength" min="0.0" max="0.9" step="0.02" value="${this.settings.warpStrength}" />
          <span class="debug-val" id="val-warpStrength">${this.settings.warpStrength.toFixed(2)}</span>
        </div>

        <div class="debug-control-row">
          <span>Edge Feather</span>
          <input type="range" class="debug-slider js-tune" data-param="edgeFeather" min="0.01" max="0.25" step="0.01" value="${this.settings.edgeFeather}" />
          <span class="debug-val" id="val-edgeFeather">${this.settings.edgeFeather.toFixed(2)}</span>
        </div>

        <div class="debug-control-row">
          <span>Speed Multiplier</span>
          <input type="range" class="debug-slider js-tune" data-param="speed" min="0.2" max="3.0" step="0.1" value="${this.settings.speed}" />
          <span class="debug-val" id="val-speed">${this.settings.speed.toFixed(1)}x</span>
        </div>

        <div class="debug-control-row">
          <span>Noise Seed</span>
          <input type="range" class="debug-slider js-tune" data-param="seed" min="1" max="100" step="1" value="${this.settings.seed}" />
          <span class="debug-val" id="val-seed">${this.settings.seed}</span>
        </div>
      </div>

      <div class="debug-section debug-footer-section">
        <button class="debug-btn debug-reset-btn" id="debugResetBtn">RESET DEFAULTS</button>
      </div>
    `;

    document.body.appendChild(panel);
    this.debugPanel = panel;

    // Connect Debug Elements
    this.pauseBtn = panel.querySelector('#debugPauseBtn');
    this.timeReadout = panel.querySelector('#debugTimeReadout');
    this.phaseIndicator = panel.querySelector('#debugPhaseIndicator');
    this.scrubber = panel.querySelector('#debugScrubber');

    // View mode handlers
    panel.querySelectorAll('.debug-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const mode = parseInt(btn.dataset.mode, 10);
        this.setViewMode(mode);
      });
    });

    // Playback handlers
    this.pauseBtn.addEventListener('click', () => {
      if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    });

    panel.querySelector('#debugRestartBtn').addEventListener('click', () => {
      this.restart();
    });

    panel.querySelector('#debugCloseBtn').addEventListener('click', () => {
      this.toggleDebugPanel(false);
    });

    // Scrubber interaction
    this.scrubber.addEventListener('input', (e) => {
      this.isScrubbing = true;
      const t = parseFloat(e.target.value);
      this.setTime(t);
    });

    this.scrubber.addEventListener('change', () => {
      this.isScrubbing = false;
    });

    // Tuning Sliders
    panel.querySelectorAll('.js-tune').forEach((slider) => {
      slider.addEventListener('input', (e) => {
        const param = e.target.dataset.param;
        const val = parseFloat(e.target.value);
        this.settings[param] = val;

        // Update Uniform
        if (param === 'cycleSeconds') {
          this.material.uniforms.uCycleDuration.value = val;
          this.scrubber.max = val;
        } else if (param === 'initialPortraitSeconds') {
          this.material.uniforms.uInitialPortraitDuration.value = val;
        } else if (param === 'activeSweepSeconds') {
          this.material.uniforms.uActiveSweepDuration.value = val;
        } else if (param === 'clearPortraitSeconds') {
          this.material.uniforms.uClearPortraitDuration.value = val;
        } else if (param === 'bandScale') {
          this.material.uniforms.uBandScale.value = val;
        } else if (param === 'bandCount') {
          this.material.uniforms.uBandCount.value = val;
        } else if (param === 'warpStrength') {
          this.material.uniforms.uWarpStrength.value = val;
        } else if (param === 'edgeFeather') {
          this.material.uniforms.uEdgeFeather.value = val;
        } else if (param === 'speed') {
          this.material.uniforms.uSpeed.value = val;
        } else if (param === 'seed') {
          this.material.uniforms.uSeed.value = val;
        }

        // Update readout label
        const readout = panel.querySelector(`#val-${param}`);
        if (readout) {
          if (param.includes('Seconds')) readout.textContent = `${val.toFixed(2)}s`;
          else if (param === 'speed') readout.textContent = `${val.toFixed(1)}x`;
          else if (param === 'seed') readout.textContent = `${val}`;
          else readout.textContent = val.toFixed(2);
        }
      });
    });

    // Reset Defaults
    panel.querySelector('#debugResetBtn').addEventListener('click', () => {
      this.settings = { ...PHASE_1_DEFAULTS };
      Object.keys(this.settings).forEach((param) => {
        const slider = panel.querySelector(`[data-param="${param}"]`);
        if (slider) {
          slider.value = this.settings[param];
          slider.dispatchEvent(new Event('input'));
        }
      });
    });

    // Check URL query string for auto-opening
    if (window.location.search.includes('heroDebug=1')) {
      this.toggleDebugPanel(true);
    }
  }

  toggleDebugPanel(forceState) {
    if (!this.debugPanel) return;
    const shouldShow =
      typeof forceState === 'boolean'
        ? forceState
        : this.debugPanel.classList.contains('is-hidden');

    this.debugPanel.classList.toggle('is-hidden', !shouldShow);
    this.debugBadge.classList.toggle('is-active', shouldShow);
  }

  updateDebugScrubber() {
    if (!this.scrubber) return;

    const cycleTotal = this.settings.cycleSeconds;
    const t = this.elapsedSeconds % cycleTotal;

    if (!this.isScrubbing) {
      this.scrubber.value = t;
    }

    if (this.timeReadout) {
      this.timeReadout.textContent = `${t.toFixed(2)}s / ${cycleTotal.toFixed(2)}s`;
    }

    if (this.phaseIndicator) {
      const t1 = this.settings.initialPortraitSeconds;
      const t2 = t1 + this.settings.activeSweepSeconds;

      if (t < t1) {
        this.phaseIndicator.textContent = `PHASE: CLEAN PORTRAIT [0.0s – ${t1.toFixed(1)}s]`;
        this.phaseIndicator.style.color = '#B4BCB0';
      } else if (t < t2) {
        const sweepProgress = ((t - t1) / this.settings.activeSweepSeconds) * 100;
        this.phaseIndicator.textContent = `PHASE: ACTIVE SWEEP REVEAL (${sweepProgress.toFixed(0)}%) [${t1.toFixed(1)}s – ${t2.toFixed(1)}s]`;
        this.phaseIndicator.style.color = '#D2FF00';
      } else {
        this.phaseIndicator.textContent = `PHASE: CLEAR TO PORTRAIT [${t2.toFixed(1)}s – ${cycleTotal.toFixed(1)}s]`;
        this.phaseIndicator.style.color = '#8A9482';
      }
    }
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    if (this.debugPanel) this.debugPanel.remove();
    if (this.debugBadge) this.debugBadge.remove();
    if (this.renderer) this.renderer.dispose();
  }
}
