import * as THREE from 'three';
import { DRIVERS, CONFIG } from './drivers.js';

/**
 * WebGL Shaders for organic liquid reveal and seamless driver crossfade
 */
const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uCurrentFace;
uniform sampler2D uCurrentHelmet;
uniform sampler2D uNextFace;
uniform sampler2D uNextHelmet;
uniform sampler2D uMaskTexture;

uniform float uTransition; // 0.0 to 1.0
uniform float uTime;

uniform vec2 uFaceScale;
uniform vec2 uFaceOffset;
uniform vec2 uHelmetScale;
uniform vec2 uHelmetOffset;

uniform vec2 uNextFaceScale;
uniform vec2 uNextFaceOffset;
uniform vec2 uNextHelmetScale;
uniform vec2 uNextHelmetOffset;

// 2D Simplex Noise for organic dripping/fluid mask edge
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  // Flip Y for WebGL texture UVs
  vec2 maskUv = vec2(vUv.x, 1.0 - vUv.y);
  float rawMask = texture2D(uMaskTexture, maskUv).r;

  // Multi-frequency organic liquid distortion for dripping contours
  float n1 = snoise(vUv * 6.5 + vec2(0.0, uTime * 0.15)) * 0.22;
  float n2 = snoise(vUv * 16.0 - vec2(uTime * 0.1, 0.0)) * 0.09;
  float liquidOffset = (n1 + n2) * smoothstep(0.02, 0.45, rawMask);
  float liquidVal = rawMask + liquidOffset;

  // Soft organic feathered threshold
  float reveal = smoothstep(0.12, 0.48, liquidVal);

  // Coordinate mappings for current driver with zoom factor for monumental framing
  vec2 baseFaceUv = (vUv - vec2(0.5)) * uFaceScale + vec2(0.5) + uFaceOffset;
  vec2 baseHelmetUv = (vUv - vec2(0.5)) * uHelmetScale + vec2(0.5) + uHelmetOffset;

  // Next driver coordinate mappings
  vec2 nxtFaceUv = (vUv - vec2(0.5)) * uNextFaceScale + vec2(0.5) + uNextFaceOffset;
  vec2 nxtHelmetUv = (vUv - vec2(0.5)) * uNextHelmetScale + vec2(0.5) + uNextHelmetOffset;

  vec3 bgIvory = vec3(0.968627, 0.960784, 0.925490); // #F7F5EC

  bool inFace = (baseFaceUv.x >= 0.002 && baseFaceUv.x <= 0.998 && baseFaceUv.y >= 0.002 && baseFaceUv.y <= 0.998);
  bool inHelmet = (baseHelmetUv.x >= 0.002 && baseHelmetUv.x <= 0.998 && baseHelmetUv.y >= 0.002 && baseHelmetUv.y <= 0.998);
  bool inNxtFace = (nxtFaceUv.x >= 0.002 && nxtFaceUv.x <= 0.998 && nxtFaceUv.y >= 0.002 && nxtFaceUv.y <= 0.998);
  bool inNxtHelmet = (nxtHelmetUv.x >= 0.002 && nxtHelmetUv.x <= 0.998 && nxtHelmetUv.y >= 0.002 && nxtHelmetUv.y <= 0.998);

  vec4 cFace = inFace ? texture2D(uCurrentFace, baseFaceUv) : vec4(bgIvory, 1.0);
  vec4 cHelmet = inHelmet ? texture2D(uCurrentHelmet, baseHelmetUv) : vec4(bgIvory, 1.0);
  vec4 nFace = inNxtFace ? texture2D(uNextFace, nxtFaceUv) : vec4(bgIvory, 1.0);
  vec4 nHelmet = inNxtHelmet ? texture2D(uNextHelmet, nxtHelmetUv) : vec4(bgIvory, 1.0);

  // If pixel is background ivory, snap exactly to bgIvory
  if (length(cFace.rgb - bgIvory) < 0.045) cFace.rgb = bgIvory;
  if (length(cHelmet.rgb - bgIvory) < 0.045) cHelmet.rgb = bgIvory;
  if (length(nFace.rgb - bgIvory) < 0.045) nFace.rgb = bgIvory;
  if (length(nHelmet.rgb - bgIvory) < 0.045) nHelmet.rgb = bgIvory;

  // Smooth crossfade between drivers
  vec4 face = mix(cFace, nFace, uTransition);
  vec4 helmet = mix(cHelmet, nHelmet, uTransition);

  // Restrict reveal strictly to the subject body and head
  float distToBgFace = length(face.rgb - bgIvory);
  float isSubject = smoothstep(0.015, 0.06, distToBgFace);

  // Confined reveal ensures clean background with zero spill
  reveal = reveal * isSubject;

  // Composite helmet over face
  vec4 color = mix(face, helmet, reveal);

  // Electric Lime boundary glow (#D2FF00) along the dripping contour edge
  float edge = smoothstep(0.06, 0.22, reveal) * (1.0 - smoothstep(0.25, 0.52, reveal));
  vec3 limeGlow = vec3(0.824, 1.0, 0.0); // #D2FF00
  color.rgb = mix(color.rgb, limeGlow, edge * 0.48 * smoothstep(0.08, 0.5, rawMask));

  // Seamless backdrop blend: if close to background ivory, set pure #F7F5EC
  float finalBgDist = length(color.rgb - bgIvory);
  if (finalBgDist < 0.045) {
    color.rgb = bgIvory;
  }

  gl_FragColor = color;
}
`;

export class HeroRevealStage {
  constructor(options) {
    this.container = options.container;
    this.stageElement = options.stageElement;
    this.onDriverChange = options.onDriverChange || (() => {});
    this.onProgress = options.onProgress || (() => {});

    this.currentIndex = CONFIG.defaultDriverIndex;
    this.nextIndex = (this.currentIndex + 1) % DRIVERS.length;

    this.textures = new Map();
    this.textureLoader = new THREE.TextureLoader();

    // Interaction state
    this.isInteracting = false;
    this.isPaused = false;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.mouse = {
      x: 0.5,
      y: 0.42,
      targetX: 0.5,
      targetY: 0.42,
      prevX: 0.5,
      prevY: 0.42,
      speed: 0,
      isOverStage: false,
      dwell: 0,
    };

    this.parallax = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
    };

    // Auto-cycle timer
    this.cycleTimer = 0;
    this.cycleDuration = CONFIG.cycleDurationMs;
    this.lastTimestamp = performance.now();
    this.inactivityTimer = null;

    // Transition state
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.transitionDuration = CONFIG.transitionDurationMs;

    // Auto demo reveal pulse on entry / slide change
    this.demoReveal = {
      active: false,
      startTime: 0,
    };

    this.init();
  }

  async init() {
    this.setupMaskCanvas();
    this.setupThreeScene();
    this.setupEventListeners();
    await this.preloadDriver(this.currentIndex);
    await this.preloadDriver(this.nextIndex);

    this.updateUniformsForDriver(this.currentIndex, 'current');
    this.updateUniformsForDriver(this.nextIndex, 'next');

    // Trigger brief initial demo reveal so users discover the effect
    this.triggerDemoReveal();

    // Start render loop
    requestAnimationFrame(this.render.bind(this));
  }

  setupMaskCanvas() {
    this.maskCanvas = document.createElement('canvas');
    this.maskCanvas.width = 512;
    this.maskCanvas.height = 683;
    this.maskCtx = this.maskCanvas.getContext('2d', { willReadFrequently: false });

    // Initial clear
    this.maskCtx.fillStyle = '#000000';
    this.maskCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);

    this.maskTexture = new THREE.CanvasTexture(this.maskCanvas);
    this.maskTexture.minFilter = THREE.LinearFilter;
    this.maskTexture.magFilter = THREE.LinearFilter;
    this.maskTexture.generateMipmaps = false;
  }

  setupThreeScene() {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.canvas = this.renderer.domElement;
    this.canvas.className = 'hero-webgl-canvas';
    this.stageElement.appendChild(this.canvas);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -1, -1, 0,
       1, -1, 0,
      -1,  1, 0,
      -1,  1, 0,
       1, -1, 0,
       1,  1, 0
    ]);
    const uvs = new Float32Array([
      0, 0,
      1, 0,
      0, 1,
      0, 1,
      1, 0,
      1, 1
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      uniforms: {
        uCurrentFace: { value: null },
        uCurrentHelmet: { value: null },
        uNextFace: { value: null },
        uNextHelmet: { value: null },
        uMaskTexture: { value: this.maskTexture },
        uTransition: { value: 0.0 },
        uTime: { value: 0.0 },
        uFaceScale: { value: new THREE.Vector2(0.92, 0.92) },
        uFaceOffset: { value: new THREE.Vector2(0.0, 0.0) },
        uHelmetScale: { value: new THREE.Vector2(0.92, 0.92) },
        uHelmetOffset: { value: new THREE.Vector2(0.0, 0.0) },
        uNextFaceScale: { value: new THREE.Vector2(0.92, 0.92) },
        uNextFaceOffset: { value: new THREE.Vector2(0.0, 0.0) },
        uNextHelmetScale: { value: new THREE.Vector2(0.92, 0.92) },
        uNextHelmetOffset: { value: new THREE.Vector2(0.0, 0.0) },
      }
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    this.onResize();
  }

  async loadTexture(url) {
    if (this.textures.has(url)) {
      return this.textures.get(url);
    }
    return new Promise((resolve) => {
      this.textureLoader.load(url, (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        this.textures.set(url, texture);
        resolve(texture);
      }, undefined, () => {
        console.warn('Failed to load texture:', url);
        resolve(null);
      });
    });
  }

  async preloadDriver(index) {
    const driver = DRIVERS[index];
    if (!driver) return;
    const [faceTex, helmetTex] = await Promise.all([
      this.loadTexture(driver.portrait),
      this.loadTexture(driver.helmet),
    ]);
    return { faceTex, helmetTex };
  }

  updateUniformsForDriver(index, slot = 'current') {
    const driver = DRIVERS[index];
    if (!driver) return;

    const faceTex = this.textures.get(driver.portrait);
    const helmetTex = this.textures.get(driver.helmet);
    const align = driver.alignment;

    // Base zoom multiplier so portraits are monumental and impactful
    const zoom = 0.90;

    if (slot === 'current') {
      if (faceTex) this.material.uniforms.uCurrentFace.value = faceTex;
      if (helmetTex) this.material.uniforms.uCurrentHelmet.value = helmetTex;
      this.material.uniforms.uFaceScale.value.set(align.scale * zoom, align.scale * zoom);
      this.material.uniforms.uFaceOffset.value.set(align.offsetX, align.offsetY);
      this.material.uniforms.uHelmetScale.value.set(align.helmetScale * zoom, align.helmetScale * zoom);
      this.material.uniforms.uHelmetOffset.value.set(align.helmetOffsetX, align.helmetOffsetY);
    } else {
      if (faceTex) this.material.uniforms.uNextFace.value = faceTex;
      if (helmetTex) this.material.uniforms.uNextHelmet.value = helmetTex;
      this.material.uniforms.uNextFaceScale.value.set(align.scale * zoom, align.scale * zoom);
      this.material.uniforms.uNextFaceOffset.value.set(align.offsetX, align.offsetY);
      this.material.uniforms.uNextHelmetScale.value.set(align.helmetScale * zoom, align.helmetScale * zoom);
      this.material.uniforms.uNextHelmetOffset.value.set(align.helmetOffsetX, align.helmetOffsetY);
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this));

    // Global pointer tracking for 3D parallax
    window.addEventListener('pointermove', (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      this.parallax.targetX = nx;
      this.parallax.targetY = ny;
    });

    const updatePointerCoords = (clientX, clientY) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;

      this.mouse.targetX = THREE.MathUtils.clamp(x, 0, 1);
      this.mouse.targetY = THREE.MathUtils.clamp(y, 0, 1);
      this.mouse.isOverStage = (x >= 0 && x <= 1 && y >= 0 && y <= 1);

      if (this.mouse.isOverStage) {
        this.markInteraction();
      }
    };

    this.container.addEventListener('pointermove', (e) => {
      updatePointerCoords(e.clientX, e.clientY);
    });

    this.container.addEventListener('pointerenter', (e) => {
      updatePointerCoords(e.clientX, e.clientY);
    });

    this.container.addEventListener('pointerleave', () => {
      this.mouse.isOverStage = false;
      this.mouse.dwell = 0;
    });

    // Touch support over the portrait stage
    this.stageElement.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerCoords(touch.clientX, touch.clientY);
        this.mouse.x = this.mouse.targetX;
        this.mouse.y = this.mouse.targetY;
      }
    }, { passive: true });

    this.stageElement.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        updatePointerCoords(touch.clientX, touch.clientY);
      }
    }, { passive: true });

    this.stageElement.addEventListener('touchend', () => {
      this.mouse.isOverStage = false;
      this.mouse.dwell = 0;
    });

    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
    });
  }

  onResize() {
    const width = this.stageElement.offsetWidth;
    const height = this.stageElement.offsetHeight;

    if (width > 0 && height > 0) {
      this.renderer.setSize(width, height);
    }
  }

  markInteraction() {
    this.isInteracting = true;
    clearTimeout(this.inactivityTimer);
    this.inactivityTimer = setTimeout(() => {
      this.isInteracting = false;
    }, CONFIG.inactivityResumeDelayMs);
  }

  triggerDemoReveal() {
    this.demoReveal.active = true;
    this.demoReveal.startTime = performance.now();
  }

  updateMask(delta) {
    const ctx = this.maskCtx;
    const w = this.maskCanvas.width;
    const h = this.maskCanvas.height;

    // Organic decay - smooth fade trail back to portrait
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.045)';
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'source-over';

    const lerpFactor = 0.25;
    const prevX = this.mouse.x;
    const prevY = this.mouse.y;
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * lerpFactor;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * lerpFactor;

    const dx = this.mouse.x - prevX;
    const dy = this.mouse.y - prevY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.mouse.speed = this.mouse.speed * 0.82 + dist * 0.18;

    const currentDriver = DRIVERS[this.currentIndex];
    const visorY = currentDriver.alignment.visorCenter.y;

    if (this.mouse.isOverStage) {
      this.mouse.dwell = Math.min(this.mouse.dwell + delta * 0.9, 1.0);

      const px = this.mouse.x * w;
      const py = this.mouse.y * h;

      // Restrict reveal to subject head and shoulders
      const distFromHead = Math.hypot(this.mouse.x - 0.5, this.mouse.y - visorY);
      const isNearSubject = distFromHead < 0.44 || (this.mouse.y > visorY && Math.abs(this.mouse.x - 0.5) < 0.40);

      if (isNearSubject) {
        const baseRadius = 90;
        const dwellBonus = this.mouse.dwell * 70;
        const speedBonus = Math.min(this.mouse.speed * 200, 50);
        const radius = baseRadius + dwellBonus + speedBonus;

        const brushAlpha = Math.min(0.24 + this.mouse.dwell * 0.28, 0.58);

        // Core soft radial brush
        const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${brushAlpha})`);
        grad.addColorStop(0.35, `rgba(255, 255, 255, ${brushAlpha * 0.85})`);
        grad.addColorStop(0.7, `rgba(255, 255, 255, ${brushAlpha * 0.35})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();

        // Trailing liquid drop satellites
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        const satDist = radius * 0.38;
        const satX = px + Math.cos(angle) * satDist;
        const satY = py + Math.sin(angle) * satDist;
        const satRadius = radius * 0.65;

        const satGrad = ctx.createRadialGradient(satX, satY, 0, satX, satY, satRadius);
        satGrad.addColorStop(0, `rgba(255, 255, 255, ${brushAlpha * 0.5})`);
        satGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = satGrad;
        ctx.beginPath();
        ctx.arc(satX, satY, satRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Auto demo reveal wave on driver transition
    if (this.demoReveal.active) {
      const now = performance.now();
      const elapsed = (now - this.demoReveal.startTime) / 1000;
      const duration = 1.35;

      if (elapsed < duration) {
        const t = elapsed / duration;
        const sweepProgress = Math.sin(t * Math.PI);
        const arcX = (0.36 + Math.sin(t * Math.PI * 1.5) * 0.12) * w;
        const arcY = (visorY + Math.cos(t * Math.PI * 1.2) * 0.08) * h;
        const arcRadius = 120 * sweepProgress;
        const alpha = sweepProgress * 0.5;

        if (arcRadius > 5) {
          const demoGrad = ctx.createRadialGradient(arcX, arcY, 0, arcX, arcY, arcRadius);
          demoGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
          demoGrad.addColorStop(0.5, `rgba(255, 255, 255, ${alpha * 0.6})`);
          demoGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = demoGrad;
          ctx.beginPath();
          ctx.arc(arcX, arcY, arcRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        this.demoReveal.active = false;
      }
    }

    this.maskTexture.needsUpdate = true;
  }

  updateParallax() {
    if (this.reducedMotion) {
      this.stageElement.style.transform = 'none';
      return;
    }

    const lerp = 0.07;
    this.parallax.x += (this.parallax.targetX - this.parallax.x) * lerp;
    this.parallax.y += (this.parallax.targetY - this.parallax.y) * lerp;

    const tiltMaxDeg = 3.5;
    const shiftMaxPx = 9;

    const rotY = this.parallax.x * tiltMaxDeg;
    const rotX = -this.parallax.y * tiltMaxDeg;
    const transX = this.parallax.x * shiftMaxPx;
    const transY = this.parallax.y * (shiftMaxPx * 0.6);

    this.stageElement.style.transform = `perspective(1100px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg) translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 0)`;
  }

  switchToDriver(targetIndex) {
    if (targetIndex === this.currentIndex || this.isTransitioning) {
      return;
    }

    this.isTransitioning = true;
    this.nextIndex = targetIndex;
    this.transitionProgress = 0;
    this.cycleTimer = 0;

    this.updateUniformsForDriver(this.nextIndex, 'next');
    this.onDriverChange(this.nextIndex);

    // Smoothly dissolve mask during crossfade
    this.maskCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.maskCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);

    const startTime = performance.now();

    const animateTransition = (time) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / this.transitionDuration, 1.0);

      // Smooth cubic ease-in-out
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      this.material.uniforms.uTransition.value = eased;

      if (t < 1.0) {
        requestAnimationFrame(animateTransition);
      } else {
        this.currentIndex = this.nextIndex;
        this.updateUniformsForDriver(this.currentIndex, 'current');
        this.material.uniforms.uTransition.value = 0.0;
        this.isTransitioning = false;

        this.maskCtx.fillStyle = '#000000';
        this.maskCtx.fillRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);

        this.triggerDemoReveal();

        const upcomingIndex = (this.currentIndex + 1) % DRIVERS.length;
        this.preloadDriver(upcomingIndex);
      }
    };

    requestAnimationFrame(animateTransition);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
    setTimeout(() => {
      this.onResize();
    }, 60);
  }

  render(timestamp) {
    if (this.isPaused) {
      requestAnimationFrame(this.render.bind(this));
      return;
    }

    const delta = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    this.material.uniforms.uTime.value = timestamp * 0.001;

    this.updateMask(delta);
    this.updateParallax();

    // Auto-cycling management
    if (!this.reducedMotion && !this.isInteracting && !this.isTransitioning) {
      this.cycleTimer += delta * 1000;

      const progress = Math.min(this.cycleTimer / this.cycleDuration, 1.0);
      this.onProgress(this.currentIndex, progress);

      if (this.cycleTimer >= this.cycleDuration) {
        const next = (this.currentIndex + 1) % DRIVERS.length;
        this.switchToDriver(next);
      }
    } else if (this.isInteracting) {
      const progress = Math.min(this.cycleTimer / this.cycleDuration, 1.0);
      this.onProgress(this.currentIndex, progress);
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
