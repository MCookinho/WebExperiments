(() => {
  'use strict';

  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const fpsEl = document.getElementById('fps-counter');
  const pCountEl = document.getElementById('particle-count');
  const modeInfo = document.getElementById('mode-info');
  const modeName = document.getElementById('mode-name');
  const modeDesc = document.getElementById('mode-desc');
  const hint = document.getElementById('hint');
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

  function mouseForce(x, y, radius, strength) {
    const d = dist(x, y, mouseX, mouseY);
    if (d > radius || d < 1) return { fx: 0, fy: 0 };
    const factor = (1 - d / radius) * strength;
    const angle = Math.atan2(y - mouseY, x - mouseX);
    return {
      fx: Math.cos(angle) * factor,
      fy: Math.sin(angle) * factor
    };
  }

  function particleBurst(x, y, count, mode) {
    for (let i = 0; i < count; i++) {
      const angle = rand(0, TAU);
      const speed = rand(1, 4);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      let color, size, life;

      switch (mode) {
        case 'aurora':
          color = { h: rand(120, 300), s: rand(50, 80), l: rand(40, 65) };
          size = rand(1.5, 4);
          life = rand(2, 5);
          break;
        case 'stars':
          color = { h: rand(200, 280), s: rand(20, 50), l: rand(70, 95) };
          size = rand(1, 3);
          life = rand(2, 6);
          break;
        case 'fire':
          color = { h: rand(0, 50), s: 100, l: rand(50, 80) };
          size = rand(2, 5);
          life = rand(1, 3);
          break;
        case 'ocean':
          color = { h: rand(170, 210), s: rand(60, 90), l: rand(50, 70) };
          size = rand(1.5, 4);
          life = rand(3, 7);
          break;
        case 'galaxy':
          color = { h: rand(260, 340), s: rand(40, 80), l: rand(50, 75) };
          size = rand(0.5, 2.5);
          life = rand(4, 10);
          break;
        case 'matrix':
          color = { h: rand(100, 140), s: rand(60, 100), l: rand(40, 70) };
          size = rand(1, 3);
          life = rand(2, 5);
          break;
        case 'lightning':
          color = { h: rand(200, 260), s: rand(60, 100), l: rand(70, 95) };
          size = rand(1, 3);
          life = rand(1, 3);
          break;
        case 'neon':
          const nh = [0, 30, 60, 120, 180, 200, 260, 300, 330][randInt(0, 8)];
          color = { h: nh + rand(-15, 15), s: 100, l: rand(55, 75) };
          size = rand(2, 5);
          life = rand(3, 7);
          break;
        default:
          color = { h: rand(0, 360), s: 70, l: 60 };
          size = rand(1, 3);
          life = rand(2, 5);
      }

      const p = new Particle(x, y, vx, vy, color, size, life);
      p.isBurst = true;
      particles.push(p);
    }
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
      this.isBurst = false;
    }

    get alpha() {
      return clamp(this.life / this.maxLife, 0, 1);
    }

    update(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.age += dt;
      if (this.isBurst) {
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.life -= dt * 0.012;
      } else {
        this.life -= dt * 0.016;
      }
      if (this.life <= 0) this.dead = true;
    }

    wrap() {
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
    }

    bounds() {
      return this.x >= -50 && this.x <= W + 50 && this.y >= -50 && this.y <= H + 50;
    }
  }

  // ==================== AURORA MODE ====================

  const aurora = {
    palettes: [
      { h: 140, s: 70, l: 50 }, { h: 160, s: 80, l: 45 },
      { h: 280, s: 60, l: 55 }, { h: 200, s: 70, l: 40 },
      { h: 120, s: 60, l: 50 }, { h: 300, s: 50, l: 50 },
    ],
    init() {
      particles = [];
      const count = Math.min(1200, Math.floor(W * H / 1200));
      for (let i = 0; i < count; i++) particles.push(this.spawn());
    },
    spawn() {
      const p = this.palettes[randInt(0, this.palettes.length - 1)];
      return new Particle(rand(0, W), rand(0, H), 0, 0,
        { h: p.h + rand(-20, 20), s: p.s + rand(-10, 10), l: p.l + rand(-10, 10) },
        rand(1, 3), rand(3, 8));
    },
    update(dt) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.isBurst) { p.update(dt); if (p.dead) particles.splice(i, 1); continue; }
        const angle = flowAngle(p.x, p.y, time, 0.003);
        p.vx += Math.cos(angle) * 0.08 * dt;
        p.vy += Math.sin(angle) * 0.08 * dt;
        p.vx *= 0.98; p.vy *= 0.98;
        const mf = mouseForce(p.x, p.y, 200, 0.5);
        p.vx += mf.fx; p.vy += mf.fy;
        p.update(dt); p.wrap();
        if (p.dead) particles[i] = this.spawn();
      }
    },
    draw() {
      ctx.globalCompositeOperation = 'screen';
      for (const p of particles) {
        ctx.fillStyle = hslStr(p.color.h, p.color.s, p.color.l, p.alpha * 0.6);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // ==================== STARS MODE ====================

  const stars = {
    bgStars: [], nebulae: [], shootingStars: [],
    init() {
      particles = []; this.bgStars = []; this.nebulae = []; this.shootingStars = [];
      const starCount = Math.min(400, Math.floor(W * H / 3000));
      for (let i = 0; i < starCount; i++) {
        this.bgStars.push({
          x: rand(0, W), y: rand(0, H), size: rand(0.3, 1.5),
          brightness: rand(0.3, 1), twinkleSpeed: rand(1, 4),
          twinkleOffset: rand(0, TAU), depth: rand(0.2, 1),
          hue: rand(200, 260), saturation: rand(5, 30)
        });
      }
      const nebulaCount = Math.min(15, Math.floor(W * H / 80000));
      for (let i = 0; i < nebulaCount; i++) {
        this.nebulae.push({
          x: rand(0, W), y: rand(0, H), radius: rand(80, 250),
          hue: rand(200, 320), alpha: rand(0.02, 0.06),
          drift: { x: rand(-0.1, 0.1), y: rand(-0.05, 0.05) }
        });
      }
    },
    update(dt) {
      for (const s of this.bgStars) {
        s.x += mouseVX * 0.02 * s.depth;
        s.y += mouseVY * 0.02 * s.depth;
        if (s.x < 0) s.x += W; if (s.x > W) s.x -= W;
        if (s.y < 0) s.y += H; if (s.y > H) s.y -= H;
      }
      for (const n of this.nebulae) {
        n.x += n.drift.x; n.y += n.drift.y;
        if (n.x < -n.radius) n.x = W + n.radius;
        if (n.x > W + n.radius) n.x = -n.radius;
        if (n.y < -n.radius) n.y = H + n.radius;
        if (n.y > H + n.radius) n.y = -n.radius;
      }
      if (Math.random() < 0.015) {
        this.shootingStars.push({
          x: rand(0, W), y: rand(0, H * 0.4),
          vx: rand(4, 10) * (Math.random() > 0.5 ? 1 : -1),
          vy: rand(2, 6), life: 1, length: rand(30, 80), hue: rand(180, 280)
        });
      }
      for (let i = this.shootingStars.length - 1; i >= 0; i--) {
        const s = this.shootingStars[i];
        s.x += s.vx * dt; s.y += s.vy * dt;
        s.life -= dt * 0.02;
        if (s.life <= 0) this.shootingStars.splice(i, 1);
      }
    },
    draw() {
      for (const n of this.nebulae) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        g.addColorStop(0, hslStr(n.hue, 60, 30, n.alpha * 2));
        g.addColorStop(0.5, hslStr(n.hue + 20, 50, 20, n.alpha));
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.radius, 0, TAU); ctx.fill();
      }
      for (const s of this.bgStars) {
        const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
        const a = s.brightness * twinkle;
        ctx.fillStyle = hslStr(s.hue, s.saturation, 90, a);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, TAU); ctx.fill();
        if (s.size > 1.2) {
          ctx.fillStyle = hslStr(s.hue, s.saturation + 5, 95, a * 0.3);
          ctx.beginPath(); ctx.arc(s.x, s.y, s.size * 3, 0, TAU); ctx.fill();
        }
      }
      for (const s of this.shootingStars) {
        const angle = Math.atan2(s.vy, s.vx);
        const tailX = s.x - Math.cos(angle) * s.length;
        const tailY = s.y - Math.sin(angle) * s.length;
        const g = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        g.addColorStop(0, 'transparent');
        g.addColorStop(1, hslStr(s.hue, 30, 80, s.life));
        ctx.strokeStyle = g; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(s.x, s.y); ctx.stroke();
        ctx.fillStyle = hslStr(s.hue, 20, 95, s.life);
        ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'screen';
      for (const p of particles) {
        ctx.fillStyle = hslStr(p.color.h, p.color.s, p.color.l, p.alpha * 0.8);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // ==================== FIRE MODE ====================

  const fire = {
    emberParticles: [],
    init() {
      particles = []; this.emberParticles = [];
      const count = Math.min(600, Math.floor(W * 0.8));
      for (let i = 0; i < count; i++) particles.push(this.spawn());
    },
    spawn() {
      return new Particle(cx + rand(-W * 0.3, W * 0.3), H + rand(10, 50),
        rand(-0.5, 0.5), rand(-2, -5),
        { h: rand(0, 50), s: 100, l: rand(50, 70) }, rand(2, 6), rand(1.5, 4));
    },
    spawnEmber(x, y) {
      return {
        x: x + rand(-10, 10), y, vx: rand(-1, 1), vy: rand(-3, -1),
        size: rand(0.5, 2), life: rand(1, 3), maxLife: rand(1, 3),
        hue: rand(20, 50), wobble: rand(0, TAU), wobbleSpeed: rand(2, 6)
      };
    },
    update(dt) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.isBurst) { p.vy -= 0.02 * dt; p.update(dt); if (p.dead) particles.splice(i, 1); continue; }
        p.vx += rand(-0.1, 0.1) * dt;
        p.vy -= 0.08 * dt; p.vy *= 0.99; p.size *= 0.999;
        p.color.l = lerp(20, 70, p.life / p.maxLife);
        p.color.h = lerp(30, 0, p.life / p.maxLife);
        const mf = mouseForce(p.x, p.y, 150, 2);
        p.vx += mf.fx * 0.3; p.vy += mf.fy * 0.3;
        p.update(dt);
        if (p.dead || !p.bounds() || p.size < 0.3) particles[i] = this.spawn();
      }
      if (mouseDown && Math.random() < 0.3) this.emberParticles.push(this.spawnEmber(mouseX, mouseY));
      if (Math.random() < 0.05) this.emberParticles.push(this.spawnEmber(cx + rand(-W * 0.2, W * 0.2), H - rand(0, 100)));
      for (let i = this.emberParticles.length - 1; i >= 0; i--) {
        const e = this.emberParticles[i];
        e.x += e.vx * dt + Math.sin(e.wobble + time * e.wobbleSpeed) * 0.3;
        e.y += e.vy * dt; e.life -= dt * 0.016;
        if (e.life <= 0) this.emberParticles.splice(i, 1);
      }
    },
    draw() {
      const gg = ctx.createLinearGradient(cx, H, cx, H - 200);
      gg.addColorStop(0, 'rgba(255, 80, 0, 0.08)');
      gg.addColorStop(0.5, 'rgba(255, 40, 0, 0.03)');
      gg.addColorStop(1, 'transparent');
      ctx.fillStyle = gg; ctx.fillRect(0, H - 200, W, 200);
      ctx.globalCompositeOperation = 'screen';
      for (const p of particles) {
        const a = p.alpha * 0.7;
        ctx.fillStyle = hslStr(p.color.h, p.color.s, p.color.l, a);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
        if (p.size > 3) {
          ctx.fillStyle = hslStr(p.color.h, 100, 80, a * 0.2);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2, 0, TAU); ctx.fill();
        }
      }
      for (const e of this.emberParticles) {
        const a = clamp(e.life / e.maxLife, 0, 1);
        ctx.fillStyle = hslStr(e.hue, 100, 60, a);
        ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // ==================== OCEAN MODE ====================

  const ocean = {
    bioParticles: [], ripples: [],
    init() {
      particles = []; this.bioParticles = []; this.ripples = [];
      const count = Math.min(800, Math.floor(W * H / 2000));
      for (let i = 0; i < count; i++) particles.push(this.spawn());
      const bioCount = Math.min(50, Math.floor(W * H / 30000));
      for (let i = 0; i < bioCount; i++) {
        this.bioParticles.push({
          x: rand(0, W), y: rand(0, H), size: rand(2, 6),
          glowRadius: rand(20, 60), hue: rand(160, 210),
          pulseSpeed: rand(0.5, 2), pulseOffset: rand(0, TAU),
          vx: rand(-0.2, 0.2), vy: rand(-0.2, 0.2), brightness: 0
        });
      }
    },
    spawn() {
      return new Particle(rand(0, W), rand(0, H), rand(-0.3, 0.3), rand(-0.3, 0.3),
        { h: rand(180, 220), s: rand(50, 80), l: rand(30, 60) }, rand(1, 2.5), rand(4, 10));
    },
    addRipple(x, y) {
      this.ripples.push({ x, y, radius: 0, maxRadius: rand(100, 200), life: 1, speed: rand(2, 4) });
    },
    update(dt) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.isBurst) { p.update(dt); if (p.dead) particles.splice(i, 1); continue; }
        const waveX = Math.sin(p.y * 0.01 + time * 0.5) * 0.3;
        const waveY = Math.cos(p.x * 0.008 + time * 0.3) * 0.2;
        p.vx += (waveX + Math.sin(flowAngle(p.x, p.y, time, 0.002)) * 0.2) * dt * 0.1;
        p.vy += (waveY + Math.cos(flowAngle(p.x, p.y, time, 0.002)) * 0.2) * dt * 0.1;
        p.vx *= 0.97; p.vy *= 0.97;
        for (const r of this.ripples) {
          const d = dist(p.x, p.y, r.x, r.y);
          const ringDist = Math.abs(d - r.radius);
          if (ringDist < 30) {
            const push = (1 - ringDist / 30) * r.life * 0.5;
            const angle = Math.atan2(p.y - r.y, p.x - r.x);
            p.vx += Math.cos(angle) * push; p.vy += Math.sin(angle) * push;
          }
        }
        const mf = mouseForce(p.x, p.y, 120, 0.3);
        p.vx += mf.fx; p.vy += mf.fy;
        p.update(dt); p.wrap();
        if (p.dead) particles[i] = this.spawn();
      }
      for (const b of this.bioParticles) {
        b.x += b.vx * dt; b.y += b.vy * dt;
        b.brightness = 0.3 + 0.7 * Math.sin(time * b.pulseSpeed + b.pulseOffset);
        b.brightness = Math.max(0, b.brightness);
        const md = dist(b.x, b.y, mouseX, mouseY);
        if (md < 150) b.brightness = Math.min(1, b.brightness + (1 - md / 150) * 2);
        if (b.x < -20) b.x = W + 20; if (b.x > W + 20) b.x = -20;
        if (b.y < -20) b.y = H + 20; if (b.y > H + 20) b.y = -20;
      }
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.radius += r.speed * dt; r.life -= dt * 0.015;
        if (r.life <= 0 || r.radius > r.maxRadius) this.ripples.splice(i, 1);
      }
    },
    draw() {
      ctx.globalCompositeOperation = 'screen';
      for (const r of this.ripples) {
        ctx.strokeStyle = hslStr(190, 70, 60, r.life * 0.3);
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.radius, 0, TAU); ctx.stroke();
      }
      for (const p of particles) {
        ctx.fillStyle = hslStr(p.color.h, p.color.s, p.color.l, p.alpha * 0.5);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
      }
      for (const b of this.bioParticles) {
        if (b.brightness < 0.1) continue;
        const a = b.brightness * 0.15;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.glowRadius);
        g.addColorStop(0, hslStr(b.hue, 80, 70, a * 2));
        g.addColorStop(0.4, hslStr(b.hue, 70, 50, a));
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.glowRadius, 0, TAU); ctx.fill();
        ctx.fillStyle = hslStr(b.hue, 60, 80, b.brightness * 0.8);
        ctx.beginPath(); ctx.arc(b.x, b.y, b.size * b.brightness, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // ==================== GALAXY MODE ====================

  const galaxy = {
    coreParticles: [], coreRotation: 0,
    init() {
      particles = []; this.coreParticles = []; this.coreRotation = 0;
      const count = Math.min(1500, Math.floor(W * H / 800));
      for (let i = 0; i < count; i++) particles.push(this.spawn());
      for (let i = 0; i < 30; i++) {
        this.coreParticles.push({
          angle: rand(0, TAU), dist: rand(5, 25),
          speed: rand(0.5, 2), size: rand(1, 3), hue: rand(40, 60)
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
      return new Particle(x, y, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5,
        { h: hue, s: rand(40, 80), l: rand(40, 70) }, rand(0.5, 2), rand(5, 15));
    },
    update(dt) {
      this.coreRotation += 0.005 * dt;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.isBurst) { p.update(dt); if (p.dead) particles.splice(i, 1); continue; }
        const dx = p.x - cx, dy = p.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 1) {
          const angle = Math.atan2(dy, dx);
          const orbitSpeed = 0.3 / Math.max(d * 0.01, 0.5);
          p.vx += (-Math.sin(angle) * orbitSpeed - dx * 0.00005) * dt;
          p.vy += (Math.cos(angle) * orbitSpeed - dy * 0.00005) * dt;
        }
        p.vx *= 0.995; p.vy *= 0.995;
        const mf = mouseForce(p.x, p.y, 200, 1.5);
        p.vx += mf.fx * 0.2; p.vy += mf.fy * 0.2;
        p.update(dt);
        if (p.dead || d > Math.max(W, H)) particles[i] = this.spawn();
      }
      for (const c of this.coreParticles) c.angle += c.speed * 0.02 * dt;
    },
    draw() {
      ctx.globalCompositeOperation = 'screen';
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.3);
      g.addColorStop(0, 'rgba(200, 150, 255, 0.03)');
      g.addColorStop(0.3, 'rgba(100, 50, 200, 0.015)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * 0.3, 0, TAU); ctx.fill();
      for (const p of particles) {
        ctx.fillStyle = hslStr(p.color.h, p.color.s, p.color.l, p.alpha * 0.7);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
      }
      for (const c of this.coreParticles) {
        const x = cx + Math.cos(c.angle + this.coreRotation) * c.dist;
        const y = cy + Math.sin(c.angle + this.coreRotation) * c.dist;
        ctx.fillStyle = hslStr(c.hue, 60, 80, 0.9);
        ctx.beginPath(); ctx.arc(x, y, c.size, 0, TAU); ctx.fill();
      }
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
      cg.addColorStop(0, 'rgba(255, 240, 220, 0.6)');
      cg.addColorStop(0.3, 'rgba(200, 180, 255, 0.3)');
      cg.addColorStop(1, 'transparent');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, 30, 0, TAU); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // ==================== MATRIX MODE ====================

  const matrix = {
    columns: [],
    charGrid: [],
    init() {
      particles = []; this.columns = [];
      const fontSize = 14;
      const colCount = Math.ceil(W / fontSize);
      for (let i = 0; i < colCount; i++) {
        this.columns.push({
          x: i * fontSize,
          y: rand(-H, 0),
          speed: rand(2, 6),
          chars: [],
          length: randInt(8, 25),
          hue: rand(100, 140),
          started: false
        });
        const col = this.columns[i];
        const charLen = col.length;
        for (let j = 0; j < charLen; j++) {
          col.chars.push({
            char: this.randomChar(),
            brightness: j === 0 ? 1 : clamp(1 - j / charLen, 0.1, 0.8),
            changeTimer: 0,
            changeSpeed: rand(0.02, 0.1)
          });
        }
      }
    },
    randomChar() {
      const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return chars[Math.floor(Math.random() * chars.length)];
    },
    update(dt) {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update(dt);
        if (p.dead) particles.splice(i, 1);
      }

      for (const col of this.columns) {
        col.y += col.speed * dt;

        // Mouse attraction
        const d = Math.abs(mouseX - col.x);
        if (d < 100) {
          const pull = (1 - d / 100) * mouseVY * 0.3;
          col.y += pull;
        }

        // Update chars
        for (const ch of col.chars) {
          ch.changeTimer += dt * 0.016;
          if (ch.changeTimer > ch.changeSpeed) {
            ch.char = this.randomChar();
            ch.changeTimer = 0;
          }
        }

        // Reset when off screen
        if (col.y - col.length * 14 > H) {
          col.y = rand(-200, -50);
          col.speed = rand(2, 6);
          col.length = randInt(8, 25);
          col.hue = rand(100, 140);
          col.chars = [];
          for (let j = 0; j < col.length; j++) {
            col.chars.push({
              char: this.randomChar(),
              brightness: j === 0 ? 1 : clamp(1 - j / col.length, 0.1, 0.8),
              changeTimer: 0,
              changeSpeed: rand(0.02, 0.1)
            });
          }
        }
      }
    },
    draw() {
      const fontSize = 14;
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';

      for (const col of this.columns) {
        for (let j = 0; j < col.chars.length; j++) {
          const ch = col.chars[j];
          const y = col.y - j * fontSize;
          if (y < -fontSize || y > H + fontSize) continue;

          const isHead = j === 0;
          const l = isHead ? 90 : 40 + ch.brightness * 30;
          const a = ch.brightness * (isHead ? 1 : 0.7);

          // Glow for head char
          if (isHead) {
            ctx.shadowColor = hslStr(col.hue, 100, 60, 0.8);
            ctx.shadowBlur = 12;
          }

          ctx.fillStyle = hslStr(col.hue, 100, l, a);
          ctx.fillText(ch.char, col.x + fontSize / 2, y);

          if (isHead) {
            ctx.shadowBlur = 0;
          }
        }
      }

      ctx.shadowBlur = 0;

      // Burst particles
      ctx.globalCompositeOperation = 'screen';
      for (const p of particles) {
        ctx.fillStyle = hslStr(p.color.h, p.color.s, p.color.l, p.alpha * 0.8);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // ==================== LIGHTNING MODE ====================

  const lightning = {
    bolts: [],
    branches: [],
    groundGlow: 0,

    init() {
      particles = []; this.bolts = []; this.branches = [];
      this.groundGlow = 0;
    },

    generateBolt(startX, startY, endX, endY, depth, maxDepth) {
      const segments = [];
      const dx = endX - startX;
      const dy = endY - startY;
      const length = Math.sqrt(dx * dx + dy * dy);
      const segmentsCount = Math.max(5, Math.floor(length / 20));

      let x = startX, y = startY;
      for (let i = 0; i < segmentsCount; i++) {
        const t = (i + 1) / segmentsCount;
        const nx = lerp(startX, endX, t) + rand(-30, 30) * (1 - t * 0.5);
        const ny = lerp(startY, endY, t) + rand(-15, 15) * (1 - t * 0.3);
        segments.push({ x: nx, y: ny });
        x = nx; y = ny;
      }

      const bolt = {
        segments: [{ x: startX, y: startY }, ...segments],
        life: 1,
        maxLife: rand(0.3, 0.8),
        width: Math.max(1, 3 - depth),
        hue: rand(200, 260),
        depth
      };

      if (depth < maxDepth) {
        for (let i = 0; i < segments.length; i++) {
          if (Math.random() < 0.15 && depth < 2) {
            const seg = segments[i];
            const branchAngle = rand(-PI / 3, PI / 3) + Math.atan2(dy, dx);
            const branchLen = rand(40, 120) * (1 - depth * 0.3);
            const bx = seg.x + Math.cos(branchAngle) * branchLen;
            const by = seg.y + Math.sin(branchAngle) * branchLen;
            const subBolts = this.generateBolt(seg.x, seg.y, bx, by, depth + 1, maxDepth);
            this.bolts.push(...subBolts);
          }
        }
      }

      return [bolt];
    },

    strike() {
      const startX = mouseX + rand(-100, 100);
      const startY = 0;
      const endX = mouseX + rand(-80, 80);
      const endY = H;
      const maxDepth = 3;
      const newBolts = this.generateBolt(startX, startY, endX, endY, 0, maxDepth);
      this.bolts.push(...newBolts);
      this.groundGlow = 1;

      // Sparks at impact point
      for (let i = 0; i < 20; i++) {
        const angle = rand(-PI, 0);
        const speed = rand(1, 5);
        particles.push(new Particle(
          endX, endY,
          Math.cos(angle) * speed, Math.sin(angle) * speed,
          { h: rand(200, 260), s: 80, l: rand(70, 95) },
          rand(1, 2.5), rand(0.5, 1.5)
        ));
      }
    },

    update(dt) {
      for (let i = this.bolts.length - 1; i >= 0; i--) {
        this.bolts[i].life -= dt * 0.04;
        if (this.bolts[i].life <= 0) this.bolts.splice(i, 1);
      }

      this.groundGlow *= 0.93;

      // Auto strikes
      if (Math.random() < 0.008) {
        mouseX = rand(W * 0.1, W * 0.9);
        mouseY = H;
        this.strike();
      }

      // Mouse click strike
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += 0.1 * dt;
        p.update(dt);
        if (p.dead) particles.splice(i, 1);
      }
    },

    draw() {
      ctx.globalCompositeOperation = 'screen';

      for (const bolt of this.bolts) {
        const a = bolt.life;
        const segs = bolt.segments;

        // Outer glow
        ctx.strokeStyle = hslStr(bolt.hue, 80, 70, a * 0.2);
        ctx.lineWidth = bolt.width * 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(segs[0].x, segs[0].y);
        for (let i = 1; i < segs.length; i++) {
          ctx.lineTo(segs[i].x, segs[i].y);
        }
        ctx.stroke();

        // Mid glow
        ctx.strokeStyle = hslStr(bolt.hue, 70, 80, a * 0.4);
        ctx.lineWidth = bolt.width * 3;
        ctx.beginPath();
        ctx.moveTo(segs[0].x, segs[0].y);
        for (let i = 1; i < segs.length; i++) {
          ctx.lineTo(segs[i].x, segs[i].y);
        }
        ctx.stroke();

        // Core
        ctx.strokeStyle = hslStr(bolt.hue, 30, 95, a * 0.9);
        ctx.lineWidth = bolt.width;
        ctx.beginPath();
        ctx.moveTo(segs[0].x, segs[0].y);
        for (let i = 1; i < segs.length; i++) {
          ctx.lineTo(segs[i].x, segs[i].y);
        }
        ctx.stroke();
      }

      // Ground glow
      if (this.groundGlow > 0.01) {
        const gg = ctx.createRadialGradient(cx, H, 0, cx, H, W * 0.4);
        gg.addColorStop(0, hslStr(230, 60, 50, this.groundGlow * 0.15));
        gg.addColorStop(0.3, hslStr(240, 50, 30, this.groundGlow * 0.08));
        gg.addColorStop(1, 'transparent');
        ctx.fillStyle = gg;
        ctx.fillRect(0, 0, W, H);
      }

      // Spark particles
      for (const p of particles) {
        ctx.fillStyle = hslStr(p.color.h, p.color.s, p.color.l, p.alpha);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // ==================== NEON MODE ====================

  const neon = {
    trails: [],
    maxTrails: 12,
    init() {
      particles = []; this.trails = [];
    },
    update(dt) {
      // Mouse trail
      if (mouseDown || (Math.abs(mouseVX) > 1 || Math.abs(mouseVY) > 1)) {
        const speed = Math.sqrt(mouseVX * mouseVX + mouseVY * mouseVY);
        if (speed > 2) {
          const hue = (time * 30) % 360;
          this.trails.push({
            x: mouseX, y: mouseY,
            prevX: mouseX - mouseVX, prevY: mouseY - mouseVY,
            hue: hue,
            width: clamp(speed * 0.15, 1, 6),
            life: 1,
            decay: rand(0.008, 0.015)
          });

          if (this.trails.length > 500) {
            this.trails.splice(0, this.trails.length - 500);
          }
        }
      }

      // Ambient floating neon orbs
      if (Math.random() < 0.03) {
        particles.push(new Particle(
          rand(0, W), rand(0, H),
          rand(-0.3, 0.3), rand(-0.3, 0.3),
          { h: (time * 50 + rand(0, 120)) % 360, s: 100, l: rand(55, 70) },
          rand(1, 3), rand(5, 12)
        ));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.isBurst) {
          const mf = mouseForce(p.x, p.y, 150, 0.3);
          p.vx += mf.fx; p.vy += mf.fy;
          p.update(dt);
          if (p.dead) particles.splice(i, 1);
          continue;
        }
        const angle = flowAngle(p.x, p.y, time, 0.002);
        p.vx += Math.cos(angle) * 0.02 * dt;
        p.vy += Math.sin(angle) * 0.02 * dt;
        p.vx *= 0.99; p.vy *= 0.99;
        p.update(dt); p.wrap();
        if (p.dead) particles.splice(i, 1);
      }

      // Update trails
      for (let i = this.trails.length - 1; i >= 0; i--) {
        const t = this.trails[i];
        t.life -= t.decay * dt;
        if (t.life <= 0) this.trails.splice(i, 1);
      }
    },
    draw() {
      ctx.globalCompositeOperation = 'screen';

      // Ambient orbs
      for (const p of particles) {
        const a = p.alpha * 0.4;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        g.addColorStop(0, hslStr(p.color.h, 100, 70, a * 0.5));
        g.addColorStop(0.5, hslStr(p.color.h, 100, 50, a * 0.2));
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4, 0, TAU); ctx.fill();

        ctx.fillStyle = hslStr(p.color.h, 100, 80, a);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
      }

      // Draw trails as connected lines with glow
      for (const trail of this.trails) {
        const a = trail.life;

        // Outer glow
        ctx.strokeStyle = hslStr(trail.hue, 100, 50, a * 0.15);
        ctx.lineWidth = trail.width * 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(trail.prevX, trail.prevY);
        ctx.lineTo(trail.x, trail.y);
        ctx.stroke();

        // Mid glow
        ctx.strokeStyle = hslStr(trail.hue, 100, 60, a * 0.3);
        ctx.lineWidth = trail.width * 4;
        ctx.beginPath();
        ctx.moveTo(trail.prevX, trail.prevY);
        ctx.lineTo(trail.x, trail.y);
        ctx.stroke();

        // Core
        ctx.strokeStyle = hslStr(trail.hue, 80, 80, a * 0.8);
        ctx.lineWidth = trail.width;
        ctx.beginPath();
        ctx.moveTo(trail.prevX, trail.prevY);
        ctx.lineTo(trail.x, trail.y);
        ctx.stroke();

        // White hot center
        ctx.strokeStyle = hslStr(trail.hue, 20, 95, a * 0.5);
        ctx.lineWidth = Math.max(0.5, trail.width * 0.3);
        ctx.beginPath();
        ctx.moveTo(trail.prevX, trail.prevY);
        ctx.lineTo(trail.x, trail.y);
        ctx.stroke();
      }

      // Burst particles
      for (const p of particles) {
        if (!p.isBurst) continue;
        ctx.fillStyle = hslStr(p.color.h, p.color.s, p.color.l, p.alpha * 0.8);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
    }
  };

  // ==================== MODE MANAGEMENT ====================

  const modes = { aurora, stars, fire, ocean, galaxy, matrix, lightning, neon };

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

    const btn = document.querySelector(`.mode-btn[data-mode="${name}"]`);
    if (btn) {
      modeName.textContent = btn.dataset.name;
      modeDesc.textContent = btn.dataset.desc;
      modeInfo.classList.add('visible');
      setTimeout(() => modeInfo.classList.remove('visible'), 2500);
    }

    setTimeout(() => {
      currentMode = name;
      initMode(name);
      isTransitioning = false;
    }, 80);
  }

  // ==================== SCREENSHOT ====================

  function takeScreenshot() {
    const link = document.createElement('a');
    link.download = `fluxo-${currentMode}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  // ==================== EVENT HANDLERS ====================

  canvas.addEventListener('mousemove', (e) => {
    prevMouseX = mouseX; prevMouseY = mouseY;
    mouseX = e.clientX; mouseY = e.clientY;
    mouseVX = mouseX - prevMouseX; mouseVY = mouseY - prevMouseY;
  });

  canvas.addEventListener('mousedown', (e) => {
    mouseDown = true;
    if (currentMode === 'ocean') ocean.addRipple(e.clientX, e.clientY);
    if (currentMode === 'lightning') lightning.strike();
    particleBurst(e.clientX, e.clientY, 15, currentMode);
  });

  canvas.addEventListener('mouseup', () => { mouseDown = false; });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    mouseX = t.clientX; mouseY = t.clientY;
    mouseDown = true;
    if (currentMode === 'ocean') ocean.addRipple(t.clientX, t.clientY);
    if (currentMode === 'lightning') lightning.strike();
    particleBurst(t.clientX, t.clientY, 15, currentMode);
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const t = e.touches[0];
    prevMouseX = mouseX; prevMouseY = mouseY;
    mouseX = t.clientX; mouseY = t.clientY;
    mouseVX = mouseX - prevMouseX; mouseVY = mouseY - prevMouseY;
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

  document.getElementById('btn-screenshot').addEventListener('click', takeScreenshot);

  document.addEventListener('keydown', (e) => {
    const modeKeys = {
      '1': 'aurora', '2': 'stars', '3': 'fire', '4': 'ocean',
      '5': 'galaxy', '6': 'matrix', '7': 'lightning', '8': 'neon'
    };
    if (modeKeys[e.key]) switchMode(modeKeys[e.key]);
    if (e.key === 'f' || e.key === 'F') document.getElementById('btn-fullscreen').click();
    if (e.key === 's' || e.key === 'S') takeScreenshot();
    if (e.key === ' ') { e.preventDefault(); document.getElementById('btn-clear').click(); }
    if (e.key === 'Escape' && isTransitioning) isTransitioning = false;
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
      pCountEl.textContent = particles.length + ' particulas';
      fpsAccum = 0;
    }

    time += dt * 0.016;

    // Fade trail effect per mode
    const fadeRates = {
      aurora: 'rgba(7, 7, 14, 0.05)',
      stars: 'rgba(7, 7, 14, 0.3)',
      fire: 'rgba(7, 7, 14, 0.08)',
      ocean: 'rgba(0, 5, 15, 0.04)',
      galaxy: 'rgba(7, 7, 14, 0.06)',
      matrix: 'rgba(0, 0, 0, 0.12)',
      lightning: 'rgba(5, 5, 15, 0.15)',
      neon: 'rgba(5, 5, 12, 0.06)'
    };

    ctx.fillStyle = fadeRates[currentMode] || 'rgba(7, 7, 14, 0.1)';
    ctx.fillRect(0, 0, W, H);

    modes[currentMode].update(dt);
    modes[currentMode].draw();

    mouseVX *= 0.9;
    mouseVY *= 0.9;
  }

  // ==================== INIT ====================

  resize();
  initMode(currentMode);

  // Show hint, then fade
  setTimeout(() => {
    hint.classList.add('visible');
    setTimeout(() => hint.classList.remove('visible'), 6000);
  }, 1500);

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
