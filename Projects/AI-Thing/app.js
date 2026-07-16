(() => {
  'use strict';

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const fpsEl = document.getElementById('fps-counter');
  const modeInfo = document.getElementById('mode-info');
  const modeName = document.getElementById('mode-name');
  const modeDesc = document.getElementById('mode-desc');
  const modeBtns = document.querySelectorAll('.mode-btn');

  let W, H, cx, cy;
  let mouseX = 0, mouseY = 0;
  let mouseVX = 0, mouseVY = 0;
  let prevMouseX = 0, prevMouseY = 0;
  let mouseDown = false;
  let time = 0;
  let currentMode = 'aurora';
  let particles = [];
  let transitionAlpha = 0;
  let isTransitioning = false;

  const PI = Math.PI;
  const TAU = PI * 2;
  const HALF_PI = PI / 2;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cx = W / 2;
    cy = H / 2;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', () => {
    resize();
    initMode(currentMode);
  });

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function rand(a, b) { return Math.random() * (b - a) + a; }
  function randInt(a, b) { return Math.floor(rand(a, b + 1)); }

  function hslStr(h, s, l, a) {
    if (a !== undefined) return `hsla(${h},${s}%,${l}%,${a})`;
    return `hsl(${h},${s}%,${l}%)`;
  }

  function hexToHSL(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return [h * 360, s * 100, l * 100];
  }

  function hslDistance(h1, h2) {
    let d = Math.abs(h1 - h2);
    return d > 180 ? 360 - d : d;
  }

  // Simple noise based on sine combinations
  function noise2D(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  function smoothNoise(x, y, t) {
    return (
      Math.sin(x * 0.003 + t * 0.2) * 0.5 +
      Math.cos(y * 0.004 + t * 0.15) * 0.3 +
      Math.sin((x + y) * 0.002 + t * 0.1) * 0.2 +
      Math.cos(x * 0.007 - t * 0.08) * Math.sin(y * 0.005 + t * 0.12) * 0.4
    );
  }

  function flowAngle(x, y, t, scale) {
    return smoothNoise(x * scale, y * scale, t) * TAU;
  }

  function dist(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function mouseDist(x, y) {
    return dist(x, y, mouseX, mouseY);
  }

  function mouseForce(x, y, radius, strength) {
    const d = mouseDist(x, y);
    if (d > radius || d < 1) return { fx: 0, fy: 0 };
    const factor = (1 - d / radius) * strength;
    const angle = Math.atan2(y - mouseY, x - mouseX);
    return {
      fx: Math.cos(angle) * factor,
      fy: Math.sin(angle) * factor
    };
  }

  // ==================== PARTICLE BASE ====================

  class Particle {
    constructor(x, y, vx, vy, color, size, life) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.color = color;
      this.size = size;
      this.life = life || 1;
      this.maxLife = this.life;
      this.age = 0;
      this.dead = false;
    }

    get alpha() {
      return clamp(this.life / this.maxLife, 0, 1);
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.age += dt;
      this.life -= dt * 0.016;
      if (this.life <= 0) this.dead = true;
    }

    wrap() {
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
    }

    bounds() {
      return this.x >= -20 && this.x <= W + 20 && this.y >= -20 && this.y <= H + 20;
    }
  }

  // ==================== AURORA MODE ====================

  const aurora = {
    palettes: [
      { h: 140, s: 70, l: 50 },
      { h: 160, s: 80, l: 45 },
      { h: 280, s: 60, l: 55 },
      { h: 200, s: 70, l: 40 },
      { h: 120, s: 60, l: 50 },
      { h: 300, s: 50, l: 50 },
    ],
    init() {
      particles = [];
      const count = Math.min(1200, Math.floor(W * H / 1200));
      for (let i = 0; i < count; i++) {
        particles.push(this.spawn());
      }
    },
    spawn() {
      const p = this.palettes[randInt(0, this.palettes.length - 1)];
      return new Particle(
        rand(0, W),
        rand(0, H),
        0, 0,
        { h: p.h + rand(-20, 20), s: p.s + rand(-10, 10), l: p.l + rand(-10, 10) },
        rand(1, 3),
        rand(3, 8)
      );
    },
    update(dt) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const angle = flowAngle(p.x, p.y, time, 0.003);
        const speed = 0.8;
        p.vx += Math.cos(angle) * speed * dt * 0.1;
        p.vy += Math.sin(angle) * speed * dt * 0.1;
        p.vx *= 0.98;
        p.vy *= 0.98;

        const mf = mouseForce(p.x, p.y, 200, 0.5);
        p.vx += mf.fx;
        p.vy += mf.fy;

        p.update(dt);
        p.wrap();
        if (p.dead) {
          particles[i] = this.spawn();
        }
      }
    },
    draw() {
      ctx.globalCompositeOperation = 'screen';
      for (const p of particles) {
        const a = p.alpha * 0.6;
        ctx.fillStyle = hslStr(p.color.h, p.color.s, p.color.l, a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // ==================== STARS MODE ====================

  const stars = {
    bgStars: [],
    nebulae: [],
    shootingStars: [],

    init() {
      particles = [];
      this.bgStars = [];
      this.nebulae = [];
      this.shootingStars = [];

      const starCount = Math.min(400, Math.floor(W * H / 3000));
      for (let i = 0; i < starCount; i++) {
        this.bgStars.push({
          x: rand(0, W), y: rand(0, H),
          size: rand(0.3, 1.5),
          brightness: rand(0.3, 1),
          twinkleSpeed: rand(1, 4),
          twinkleOffset: rand(0, TAU),
          depth: rand(0.2, 1),
          hue: rand(200, 260),
          saturation: rand(5, 30)
        });
      }

      const nebulaCount = Math.min(15, Math.floor(W * H / 80000));
      for (let i = 0; i < nebulaCount; i++) {
        this.nebulae.push({
          x: rand(0, W), y: rand(0, H),
          radius: rand(80, 250),
          hue: rand(200, 320),
          alpha: rand(0.02, 0.06),
          drift: { x: rand(-0.1, 0.1), y: rand(-0.05, 0.05) }
        });
      }
    },
    update(dt) {
      for (const s of this.bgStars) {
        s.x += mouseVX * 0.02 * s.depth;
        s.y += mouseVY * 0.02 * s.depth;
        if (s.x < 0) s.x += W;
        if (s.x > W) s.x -= W;
        if (s.y < 0) s.y += H;
        if (s.y > H) s.y -= H;
      }

      for (const n of this.nebulae) {
        n.x += n.drift.x;
        n.y += n.drift.y;
        if (n.x < -n.radius) n.x = W + n.radius;
        if (n.x > W + n.radius) n.x = -n.radius;
        if (n.y < -n.radius) n.y = H + n.radius;
        if (n.y > H + n.radius) n.y = -n.radius;
      }

      if (Math.random() < 0.015) {
        this.shootingStars.push({
          x: rand(0, W), y: rand(0, H * 0.4),
          vx: rand(4, 10) * (Math.random() > 0.5 ? 1 : -1),
          vy: rand(2, 6),
          life: 1,
          length: rand(30, 80),
          hue: rand(180, 280)
        });
      }

      for (let i = this.shootingStars.length - 1; i >= 0; i--) {
        const s = this.shootingStars[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt * 0.02;
        if (s.life <= 0) this.shootingStars.splice(i, 1);
      }

      if (mouseDown) {
        const mf = mouseForce(cx, cy, 300, 0);
        for (const n of this.nebulae) {
          const d = dist(n.x, n.y, mouseX, mouseY);
          if (d < 300) {
            n.x += (mouseX - n.x) * 0.001;
            n.y += (mouseY - n.y) * 0.001;
          }
        }
      }
    },
    draw() {
      // Nebulae
      for (const n of this.nebulae) {
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        gradient.addColorStop(0, hslStr(n.hue, 60, 30, n.alpha * 2));
        gradient.addColorStop(0.5, hslStr(n.hue + 20, 50, 20, n.alpha));
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, TAU);
        ctx.fill();
      }

      // Stars
      for (const s of this.bgStars) {
        const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
        const a = s.brightness * twinkle;
        ctx.fillStyle = hslStr(s.hue, s.saturation, 90, a);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, TAU);
        ctx.fill();

        if (s.size > 1.2) {
          ctx.fillStyle = hslStr(s.hue, s.saturation + 5, 95, a * 0.3);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 3, 0, TAU);
          ctx.fill();
        }
      }

      // Shooting stars
      for (const s of this.shootingStars) {
        const angle = Math.atan2(s.vy, s.vx);
        const tailX = s.x - Math.cos(angle) * s.length;
        const tailY = s.y - Math.sin(angle) * s.length;
        const gradient = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, hslStr(s.hue, 30, 80, s.life));
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        ctx.fillStyle = hslStr(s.hue, 20, 95, s.life);
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, TAU);
        ctx.fill();
      }
    }
  };

  // ==================== FIRE MODE ====================

  const fire = {
    emberParticles: [],

    init() {
      particles = [];
      this.emberParticles = [];
      const count = Math.min(600, Math.floor(W * 0.8));
      for (let i = 0; i < count; i++) {
        particles.push(this.spawn());
      }
    },
    spawn() {
      const x = cx + rand(-W * 0.3, W * 0.3);
      return new Particle(
        x,
        H + rand(10, 50),
        rand(-0.5, 0.5),
        rand(-2, -5),
        { h: rand(0, 50), s: 100, l: rand(50, 70) },
        rand(2, 6),
        rand(1.5, 4)
      );
    },
    spawnEmber(x, y) {
      return {
        x: x + rand(-10, 10),
        y: y,
        vx: rand(-1, 1),
        vy: rand(-3, -1),
        size: rand(0.5, 2),
        life: rand(1, 3),
        maxLife: rand(1, 3),
        hue: rand(20, 50),
        wobble: rand(0, TAU),
        wobbleSpeed: rand(2, 6)
      };
    },
    update(dt) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx += rand(-0.1, 0.1) * dt;
        p.vy -= 0.08 * dt;
        p.vy *= 0.99;
        p.size *= 0.999;
        p.color.l = lerp(20, 70, p.life / p.maxLife);
        p.color.h = lerp(30, 0, p.life / p.maxLife);

        const mf = mouseForce(p.x, p.y, 150, 2);
        p.vx += mf.fx * 0.3;
        p.vy += mf.fy * 0.3;

        p.update(dt);
        if (p.dead || !p.bounds() || p.size < 0.3) {
          particles[i] = this.spawn();
        }
      }

      // Embers
      if (mouseDown && Math.random() < 0.3) {
        this.emberParticles.push(this.spawnEmber(mouseX, mouseY));
      }
      if (Math.random() < 0.05) {
        this.emberParticles.push(this.spawnEmber(cx + rand(-W * 0.2, W * 0.2), H - rand(0, 100)));
      }

      for (let i = this.emberParticles.length - 1; i >= 0; i--) {
        const e = this.emberParticles[i];
        e.x += e.vx * dt + Math.sin(e.wobble + time * e.wobbleSpeed) * 0.3;
        e.y += e.vy * dt;
        e.life -= dt * 0.016;
        if (e.life <= 0) this.emberParticles.splice(i, 1);
      }
    },
    draw() {
      // Glow at bottom
      const glowGrad = ctx.createLinearGradient(cx, H, cx, H - 200);
      glowGrad.addColorStop(0, 'rgba(255, 80, 0, 0.08)');
      glowGrad.addColorStop(0.5, 'rgba(255, 40, 0, 0.03)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, H - 200, W, 200);

      ctx.globalCompositeOperation = 'screen';

      for (const p of particles) {
        const a = p.alpha * 0.7;
        ctx.fillStyle = hslStr(p.color.h, p.color.s, p.color.l, a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();

        if (p.size > 3) {
          ctx.fillStyle = hslStr(p.color.h, 100, 80, a * 0.2);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, TAU);
          ctx.fill();
        }
      }

      for (const e of this.emberParticles) {
        const a = clamp(e.life / e.maxLife, 0, 1);
        ctx.fillStyle = hslStr(e.hue, 100, 60, a);
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, TAU);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // ==================== OCEAN MODE ====================

  const ocean = {
    bioParticles: [],
    ripples: [],

    init() {
      particles = [];
      this.bioParticles = [];
      this.ripples = [];

      const count = Math.min(800, Math.floor(W * H / 2000));
      for (let i = 0; i < count; i++) {
        particles.push(this.spawn());
      }

      const bioCount = Math.min(50, Math.floor(W * H / 30000));
      for (let i = 0; i < bioCount; i++) {
        this.bioParticles.push({
          x: rand(0, W),
          y: rand(0, H),
          size: rand(2, 6),
          glowRadius: rand(20, 60),
          hue: rand(160, 210),
          pulseSpeed: rand(0.5, 2),
          pulseOffset: rand(0, TAU),
          vx: rand(-0.2, 0.2),
          vy: rand(-0.2, 0.2),
          brightness: 0
        });
      }
    },
    spawn() {
      const h = rand(180, 220);
      return new Particle(
        rand(0, W),
        rand(0, H),
        rand(-0.3, 0.3),
        rand(-0.3, 0.3),
        { h: h, s: rand(50, 80), l: rand(30, 60) },
        rand(1, 2.5),
        rand(4, 10)
      );
    },
    addRipple(x, y) {
      this.ripples.push({
        x, y, radius: 0, maxRadius: rand(100, 200),
        life: 1, speed: rand(2, 4)
      });
    },
    update(dt) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const waveX = Math.sin(p.y * 0.01 + time * 0.5) * 0.3;
        const waveY = Math.cos(p.x * 0.008 + time * 0.3) * 0.2;
        p.vx += (waveX + Math.sin(flowAngle(p.x, p.y, time, 0.002)) * 0.2) * dt * 0.1;
        p.vy += (waveY + Math.cos(flowAngle(p.x, p.y, time, 0.002)) * 0.2) * dt * 0.1;
        p.vx *= 0.97;
        p.vy *= 0.97;

        for (const r of this.ripples) {
          const d = dist(p.x, p.y, r.x, r.y);
          const ringDist = Math.abs(d - r.radius);
          if (ringDist < 30) {
            const push = (1 - ringDist / 30) * r.life * 0.5;
            const angle = Math.atan2(p.y - r.y, p.x - r.x);
            p.vx += Math.cos(angle) * push;
            p.vy += Math.sin(angle) * push;
          }
        }

        const mf = mouseForce(p.x, p.y, 120, 0.3);
        p.vx += mf.fx;
        p.vy += mf.fy;

        p.update(dt);
        p.wrap();
        if (p.dead) particles[i] = this.spawn();
      }

      for (const b of this.bioParticles) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.brightness = 0.3 + 0.7 * Math.sin(time * b.pulseSpeed + b.pulseOffset);
        b.brightness = Math.max(0, b.brightness);

        const md = dist(b.x, b.y, mouseX, mouseY);
        if (md < 150) {
          b.brightness = Math.min(1, b.brightness + (1 - md / 150) * 2);
        }

        if (b.x < -20) b.x = W + 20;
        if (b.x > W + 20) b.x = -20;
        if (b.y < -20) b.y = H + 20;
        if (b.y > H + 20) b.y = -20;
      }

      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.radius += r.speed * dt;
        r.life -= dt * 0.015;
        if (r.life <= 0 || r.radius > r.maxRadius) {
          this.ripples.splice(i, 1);
        }
      }
    },
    draw() {
      // Deep ocean gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, 'rgba(0, 10, 30, 0.1)');
      bgGrad.addColorStop(1, 'rgba(0, 5, 20, 0.1)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'screen';

      // Ripples
      for (const r of this.ripples) {
        const a = r.life * 0.3;
        ctx.strokeStyle = hslStr(190, 70, 60, a);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, TAU);
        ctx.stroke();
      }

      // Particles
      for (const p of particles) {
        const a = p.alpha * 0.5;
        ctx.fillStyle = hslStr(p.color.h, p.color.s, p.color.l, a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
      }

      // Bioluminescent
      for (const b of this.bioParticles) {
        if (b.brightness < 0.1) continue;
        const a = b.brightness * 0.15;
        const glow = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.glowRadius);
        glow.addColorStop(0, hslStr(b.hue, 80, 70, a * 2));
        glow.addColorStop(0.4, hslStr(b.hue, 70, 50, a));
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.glowRadius, 0, TAU);
        ctx.fill();

        ctx.fillStyle = hslStr(b.hue, 60, 80, b.brightness * 0.8);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size * b.brightness, 0, TAU);
        ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // ==================== GALAXY MODE ====================

  const galaxy = {
    coreParticles: [],
    coreRotation: 0,

    init() {
      particles = [];
      this.coreParticles = [];
      this.coreRotation = 0;

      const count = Math.min(1500, Math.floor(W * H / 800));
      for (let i = 0; i < count; i++) {
        particles.push(this.spawn());
      }

      for (let i = 0; i < 30; i++) {
        this.coreParticles.push({
          angle: rand(0, TAU),
          dist: rand(5, 25),
          speed: rand(0.5, 2),
          size: rand(1, 3),
          hue: rand(40, 60)
        });
      }
    },
    spawn() {
      const arm = Math.floor(rand(0, 3));
      const armAngle = (arm / 3) * TAU;
      const d = rand(20, Math.min(W, H) * 0.45);
      const spread = d * 0.15;
      const angle = armAngle + d * 0.005 + rand(-spread / d, spread / d) * 2;
      const x = cx + Math.cos(angle) * d + rand(-spread, spread);
      const y = cy + Math.sin(angle) * d + rand(-spread, spread) * 0.4;

      const hue = d < 60 ? rand(30, 60) : (d < 200 ? rand(240, 300) : rand(280, 340));
      return new Particle(
        x, y,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        { h: hue, s: rand(40, 80), l: rand(40, 70) },
        rand(0.5, 2),
        rand(5, 15)
      );
    },
    update(dt) {
      this.coreRotation += 0.005 * dt;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);

        if (d > 1) {
          const angle = Math.atan2(dy, dx);
          const orbitSpeed = 0.3 / Math.max(d * 0.01, 0.5);
          p.vx += (-Math.sin(angle) * orbitSpeed - dx * 0.00005) * dt;
          p.vy += (Math.cos(angle) * orbitSpeed - dy * 0.00005) * dt;
        }

        p.vx *= 0.995;
        p.vy *= 0.995;

        const mf = mouseForce(p.x, p.y, 200, 1.5);
        p.vx += mf.fx * 0.2;
        p.vy += mf.fy * 0.2;

        p.update(dt);
        if (p.dead || d > Math.max(W, H)) {
          particles[i] = this.spawn();
        }
      }

      for (const c of this.coreParticles) {
        c.angle += c.speed * 0.02 * dt;
      }
    },
    draw() {
      ctx.globalCompositeOperation = 'screen';

      // Outer glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.3);
      glow.addColorStop(0, 'rgba(200, 150, 255, 0.03)');
      glow.addColorStop(0.3, 'rgba(100, 50, 200, 0.015)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(W, H) * 0.3, 0, TAU);
      ctx.fill();

      // Particles
      for (const p of particles) {
        const a = p.alpha * 0.7;
        ctx.fillStyle = hslStr(p.color.h, p.color.s, p.color.l, a);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
      }

      // Core
      for (const c of this.coreParticles) {
        const x = cx + Math.cos(c.angle + this.coreRotation) * c.dist;
        const y = cy + Math.sin(c.angle + this.coreRotation) * c.dist;
        ctx.fillStyle = hslStr(c.hue, 60, 80, 0.9);
        ctx.beginPath();
        ctx.arc(x, y, c.size, 0, TAU);
        ctx.fill();
      }

      // Core glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      coreGrad.addColorStop(0, 'rgba(255, 240, 220, 0.6)');
      coreGrad.addColorStop(0.3, 'rgba(200, 180, 255, 0.3)');
      coreGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, TAU);
      ctx.fill();

      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // ==================== MODE MANAGEMENT ====================

  const modes = { aurora, stars, fire, ocean, galaxy };

  function initMode(name) {
    particles = [];
    modes[name].init();
  }

  function switchMode(name) {
    if (name === currentMode && !isTransitioning) return;

    isTransitioning = true;
    transitionAlpha = 0;

    modeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === name);
    });

    // Show mode info
    const btn = document.querySelector(`.mode-btn[data-mode="${name}"]`);
    if (btn) {
      modeName.textContent = btn.dataset.name;
      modeDesc.textContent = btn.dataset.desc;
      modeInfo.classList.add('visible');
      setTimeout(() => modeInfo.classList.remove('visible'), 2500);
    }

    const fadeIn = () => {
      transitionAlpha += 0.02;
      if (transitionAlpha >= 1) {
        transitionAlpha = 1;
        currentMode = name;
        isTransitioning = false;
        return;
      }
      requestAnimationFrame(fadeIn);
    };

    setTimeout(() => {
      currentMode = name;
      initMode(name);
      fadeIn();
    }, 100);
  }

  // ==================== EVENT HANDLERS ====================

  canvas.addEventListener('mousemove', (e) => {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    mouseVX = mouseX - prevMouseX;
    mouseVY = mouseY - prevMouseY;
  });

  canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
    if (currentMode === 'ocean') {
      ocean.addRipple(e.clientX, e.clientY);
    }
  });

  canvas.addEventListener('mouseup', () => { mouseDown = false; });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    mouseX = t.clientX;
    mouseY = t.clientY;
    mouseDown = true;
    if (currentMode === 'ocean') {
      ocean.addRipple(t.clientX, t.clientY);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX = t.clientX;
    mouseY = t.clientY;
    mouseVX = mouseX - prevMouseX;
    mouseVY = mouseY - prevMouseY;
  }, { passive: false });

  canvas.addEventListener('touchend', () => { mouseDown = false; });

  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  });

  document.getElementById('btn-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  });

  document.getElementById('btn-clear').addEventListener('click', () => {
    initMode(currentMode);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    const modeKeys = { '1': 'aurora', '2': 'stars', '3': 'fire', '4': 'ocean', '5': 'galaxy' };
    if (modeKeys[e.key]) {
      switchMode(modeKeys[e.key]);
    }
    if (e.key === 'f' || e.key === 'F') {
      document.getElementById('btn-fullscreen').click();
    }
    if (e.key === ' ') {
      e.preventDefault();
      document.getElementById('btn-clear').click();
    }
    if (e.key === 'Escape' && isTransitioning) {
      isTransitioning = false;
    }
  });

  // ==================== RENDER LOOP ====================

  let lastTime = performance.now();
  let frameCount = 0;
  let fpsAccum = 0;

  function render(now) {
    requestAnimationFrame(render);

    const rawDt = (now - lastTime) / 16.667;
    const dt = Math.min(rawDt, 3);
    lastTime = now;

    frameCount++;
    fpsAccum += dt;
    if (frameCount % 20 === 0) {
      const fps = Math.round(20 / (fpsAccum * 0.016667));
      fpsEl.textContent = clamp(fps, 1, 120) + ' FPS';
      fpsAccum = 0;
    }

    time += dt * 0.016;

    // Fade trail effect
    if (currentMode === 'aurora') {
      ctx.fillStyle = 'rgba(7, 7, 14, 0.05)';
      ctx.fillRect(0, 0, W, H);
    } else if (currentMode === 'stars') {
      ctx.fillStyle = 'rgba(7, 7, 14, 0.3)';
      ctx.fillRect(0, 0, W, H);
    } else if (currentMode === 'fire') {
      ctx.fillStyle = 'rgba(7, 7, 14, 0.08)';
      ctx.fillRect(0, 0, W, H);
    } else if (currentMode === 'ocean') {
      ctx.fillStyle = 'rgba(0, 5, 15, 0.04)';
      ctx.fillRect(0, 0, W, H);
    } else if (currentMode === 'galaxy') {
      ctx.fillStyle = 'rgba(7, 7, 14, 0.06)';
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = 'rgba(7, 7, 14, 0.25)';
      ctx.fillRect(0, 0, W, H);
    }

    modes[currentMode].update(dt);
    modes[currentMode].draw();

    // Smooth mouse velocity decay
    mouseVX *= 0.9;
    mouseVY *= 0.9;
  }

  // ==================== INIT ====================

  resize();
  initMode(currentMode);

  // Show initial mode name
  setTimeout(() => {
    const btn = document.querySelector('.mode-btn.active');
    if (btn) {
      modeName.textContent = btn.dataset.name;
      modeDesc.textContent = btn.dataset.desc;
      modeInfo.classList.add('visible');
      setTimeout(() => modeInfo.classList.remove('visible'), 3000);
    }
  }, 800);

  requestAnimationFrame(render);

})();
