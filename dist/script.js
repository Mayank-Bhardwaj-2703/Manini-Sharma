/**
 * Vision 2040 — DPS Mathura Road (Master Hybrid Engine)
 * A Student Academic Proposal & Design System by Manini Sharma (Class 7-C)
 * 
 * Fusion Features:
 * 1. Matter.js Gravity Chamber (Feel the Weight of Today ➔ Gravity Inversion ➔ 3D Academic Slate)
 * 2. 2D Interactive Concept Physics Sandbox (8 bouncy concept spheres: drag, fling, collide, inspect)
 * 3. Full-Screen Graphite Pencil Doodle Canvas Trail (cursor sketch marks & star flecks)
 * 4. Year-Scrubbing Scan Beam Scenes (live laser sweep with 2026 ➔ 2040 year counter & callout pins)
 * 5. Horizontal Sports & Well-being Scroll Track (11 sports & campus facilities)
 * 6. National Mission Clock & Indian Timeline Rail (2030, 2035, 2040, 2047, 2070)
 * 7. Word-by-Word Manifesto Illumination
 * 8. Hand-Drawn Animated SVG Doodles (circles, underlines, stars, ticks)
 * 9. Interactive Before/After Wipe Sliders
 * 10. Web Audio Pentatonic Chime Synthesizer
 */
(() => {
  'use strict';

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const $ = (q) => document.querySelector(q);

  // ==========================================================================
  // 1. WEB AUDIO SYNTHESIZER
  // ==========================================================================
  class AmbientAudio {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.initialized = false;
      this.lastTone = 0;
      this.PENTA = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx({ latencyHint: 'interactive' });
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.12;
        this.master.connect(this.ctx.destination);
        this.initialized = true;
      } catch (_) {}
    }

    resume() {
      if (!this.initialized) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.enabled) this.resume();
      return this.enabled;
    }

    chime(noteIdx = 0, volume = 0.08) {
      if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      if (now - this.lastTone < 0.12) return;
      this.lastTone = now;

      try {
        const freq = this.PENTA[Math.abs(noteIdx) % this.PENTA.length];
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(volume, now + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

        osc.connect(g);
        g.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.55);
      } catch (_) {}
    }

    pop() {
      if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(g);
        g.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.08);
      } catch (_) {}
    }
  }

  const audio = new AmbientAudio();

  const unlockAudio = () => {
    audio.resume();
    window.removeEventListener('scroll', unlockAudio);
    window.removeEventListener('pointerdown', unlockAudio);
  };
  window.addEventListener('scroll', unlockAudio, { passive: true, once: true });
  window.addEventListener('pointerdown', unlockAudio, { passive: true, once: true });

  const soundBtn = document.querySelector('.sound-toggle-btn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      const on = audio.toggle();
      soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      soundBtn.innerHTML = on ? '<span>🔊</span> Sound: ON' : '<span>🔇</span> Sound: MUTE';
    });
  }

  // ==========================================================================
  // 2. GRAPHITE PENCIL DOODLE CANVAS TRAIL (Interactive Student Margins)
  // ==========================================================================
  class PencilDoodleTrail {
    constructor() {
      this.canvas = document.getElementById('pencil-doodle-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.enabled = true;
      this.points = [];
      this.sparkles = [];
      this.lastPos = null;
      this.distanceSinceLastSparkle = 0;

      this.resize();
      window.addEventListener('resize', () => this.resize(), { passive: true });
      window.addEventListener('pointermove', (e) => this.onMove(e), { passive: true });

      const toggleBtn = document.getElementById('pencil-toggle-btn');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          this.enabled = !this.enabled;
          toggleBtn.setAttribute('aria-pressed', this.enabled ? 'true' : 'false');
          toggleBtn.innerHTML = this.enabled ? '<span>✏️</span> Pencil: ON' : '<span>✏️</span> Pencil: OFF';
          if (!this.enabled) {
            this.points = [];
            this.sparkles = [];
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          }
        });
      }

      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
    }

    onMove(e) {
      if (!this.enabled || reducedMotion.matches) return;
      const x = e.clientX;
      const y = e.clientY;

      if (this.lastPos) {
        const dx = x - this.lastPos.x;
        const dy = y - this.lastPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.distanceSinceLastSparkle += dist;

        this.points.push({
          x1: this.lastPos.x,
          y1: this.lastPos.y,
          x2: x,
          y2: y,
          width: Math.max(1.2, Math.min(3.0, 4.0 - dist * 0.05)),
          alpha: 0.65,
          life: 1.0,
          color: '#374151'
        });

        if (this.distanceSinceLastSparkle > 75) {
          this.distanceSinceLastSparkle = 0;
          const types = ['star', 'spark', 'atom', 'dot'];
          const type = types[Math.floor(Math.random() * types.length)];
          this.sparkles.push({
            x: x + (Math.random() - 0.5) * 14,
            y: y + (Math.random() - 0.5) * 14,
            size: 6 + Math.random() * 8,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            alpha: 0.8,
            life: 1.0,
            type: type,
            color: ['#10B981', '#F59E0B', '#8B5CF6', '#EC4899'][Math.floor(Math.random() * 4)]
          });
        }
      }

      this.lastPos = { x, y };
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
    }

    loop() {
      if (this.enabled && (this.points.length > 0 || this.sparkles.length > 0)) {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.scale(this.dpr, this.dpr);

        for (let i = this.points.length - 1; i >= 0; i--) {
          const p = this.points[i];
          p.life -= 0.035;
          if (p.life <= 0) {
            this.points.splice(i, 1);
            continue;
          }

          this.ctx.save();
          this.ctx.strokeStyle = p.color;
          this.ctx.lineWidth = p.width;
          this.ctx.lineCap = 'round';
          this.ctx.lineJoin = 'round';
          this.ctx.globalAlpha = p.alpha * p.life;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x1, p.y1);
          this.ctx.lineTo(p.x2, p.y2);
          this.ctx.stroke();
          this.ctx.restore();
        }

        for (let i = this.sparkles.length - 1; i >= 0; i--) {
          const s = this.sparkles[i];
          s.life -= 0.025;
          s.rotation += s.rotSpeed;
          s.y -= 0.35;
          if (s.life <= 0) {
            this.sparkles.splice(i, 1);
            continue;
          }

          this.ctx.save();
          this.ctx.translate(s.x, s.y);
          this.ctx.rotate(s.rotation);
          this.ctx.globalAlpha = s.alpha * s.life;
          this.ctx.strokeStyle = s.color;
          this.ctx.fillStyle = s.color;
          this.ctx.lineWidth = 1.4;

          if (s.type === 'star') {
            this.drawStar(this.ctx, 0, 0, 4, s.size, s.size * 0.35);
            this.ctx.stroke();
          } else if (s.type === 'spark') {
            this.ctx.beginPath();
            this.ctx.moveTo(-s.size, 0);
            this.ctx.lineTo(s.size, 0);
            this.ctx.moveTo(0, -s.size);
            this.ctx.lineTo(0, s.size);
            this.ctx.stroke();
          } else if (s.type === 'atom') {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, s.size * 0.5, 0, Math.PI * 2);
            this.ctx.stroke();
          } else {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 2, 0, Math.PI * 2);
            this.ctx.fill();
          }

          this.ctx.restore();
        }

        this.ctx.restore();
      }

      requestAnimationFrame(this.loop);
    }
  }

  // ==========================================================================
  // 3. MATTER.JS GRAVITY CHAMBER ("Feel the Weight of Today" ➔ Zero-G Slate)
  // ==========================================================================
  let MatterGravityY = 1;

  function initMatterGravityChamber() {
    if (!window.Matter) return;
    const box = document.getElementById('box');
    if (!box) return;

    const { Engine, Bodies, Composite, Body, Mouse, MouseConstraint } = Matter;
    const eng = Engine.create();
    const W0 = () => box.clientWidth || 800;
    const H0 = () => box.clientHeight || 460;

    const place = (o) => {
      o.el.style.transform = `translate3d(${o.b.position.x - o.w / 2}px, ${o.b.position.y - o.h / 2}px, 0) rotate(${o.b.angle}rad)`;
    };

    const itemsData = [
      ['School bag (12kg)', 140, 150, '#0c1a2b'],
      ['Maths Textbook', 150, 46, '#0e7c4a'],
      ['Heavy Notebooks', 120, 56, '#2554e8'],
      ['Printed Worksheets', 142, 42, '#c77700'],
      ['Exam Term Papers', 112, 58, '#6b7889'],
      ['Metal Geometry Box', 105, 38, '#a3243b'],
      ['Science Textbook', 150, 50, '#0b6b86'],
      ['Cardboard Project File', 124, 62, '#5b3fb8']
    ];

    const its = itemsData.map(([t, w, h, c], i) => {
      const el = document.createElement('div');
      el.className = 'it';
      el.textContent = t;
      el.style.cssText = `width:${w}px;height:${h}px;background:${c}`;
      box.prepend(el);

      const b = Bodies.rectangle(W0() * (0.2 + 0.6 * Math.random()), -80 - i * 110, w, h, {
        restitution: 0.25,
        friction: 0.6,
        angle: Math.random() - 0.5
      });
      Composite.add(eng.world, b);
      const o = { el, b, w, h };
      place(o);
      return o;
    });

    let walls = [];
    const buildWalls = () => {
      Composite.remove(eng.world, walls);
      const w = W0(), h = H0();
      walls = [
        Bodies.rectangle(w / 2, h + 30, w + 200, 60, { isStatic: true }),
        Bodies.rectangle(-30, h / 2 - 300, 60, h + 800, { isStatic: true }),
        Bodies.rectangle(w + 30, h / 2 - 300, 60, h + 800, { isStatic: true })
      ];
      Composite.add(eng.world, walls);
    };
    buildWalls();
    window.addEventListener('resize', buildWalls);

    if (window.matchMedia('(hover:hover)').matches) {
      const m = Mouse.create(box);
      ['mousewheel', 'DOMMouseScroll', 'wheel'].forEach((e) => m.element.removeEventListener(e, m.mousewheel));
      Composite.add(eng.world, MouseConstraint.create(eng, {
        mouse: m,
        constraint: { stiffness: 0.2, render: { visible: false } }
      }));
    }

    let isVisible = false;
    new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }).observe(box);

    (function loop() {
      if (isVisible) {
        eng.gravity.y = MatterGravityY;
        Engine.update(eng, 1000 / 60);
        its.forEach((o) => {
          if (MatterGravityY > 0 && o.b.position.y < -250) {
            Body.setPosition(o.b, { x: W0() * Math.random(), y: -90 });
          }
          place(o);
        });
      }
      requestAnimationFrame(loop);
    })();
  }

  // ==========================================================================
  // 4. LIGHTWEIGHT INTERACTIVE INNOVATION BLUEPRINTS (The 8 Pillars)
  // ==========================================================================
  class InnovationBlueprintHub {
    constructor() {
      this.buttons = document.querySelectorAll('.bp-pill-btn');
      this.card = document.getElementById('sandbox-mission-card');
      if (!this.buttons.length || !this.card) return;

      this.MODULES = {
        'quantum-bio': {
          icon: '⚛️',
          label: 'Quantum Bio Lab',
          color: '#10B981',
          bg: '#E6F4EA',
          problem: 'Textbook diagrams of cells are static and outdated by 10 years.',
          solution: 'CRISPR molecular simulations & 8K digital electron microscopy.',
          why: 'By 2040, India’s bio-economy will require real gene sequencing skills in school, not cookbook recipes with test tubes.',
          teacher: 'Deepti Ma’am & Prableen Ma’am',
          align: 'Viksit Bharat 2047 Bio-Mission'
        },
        'robotics-arm': {
          icon: '🤖',
          label: 'AI Robotics Cell',
          color: '#3B82F6',
          bg: '#EBF5FF',
          problem: 'Standard computer labs only teach basic word processing and typing.',
          solution: '6-axis articulated robot arms with ROS 2 and CAD digital twins.',
          why: 'Automated factories and surgical robots need students who master real spatial kinematics before graduating high school.',
          teacher: 'Richa Ma’am',
          align: 'India AI Mission & Atal Innovation'
        },
        'isro-downlink': {
          icon: '🚀',
          label: 'ISRO Moon Link',
          color: '#F59E0B',
          bg: '#FEF3C7',
          problem: 'Space science is treated as a chapter to memorize for a paper exam.',
          solution: 'Direct orbital telemetry link to ISRO Bharatiya Antariksh Station.',
          why: 'By 2040, India will have manned moon bases. Students analyze real Doppler radio data in physics class.',
          teacher: 'Anuradha Ma’am',
          align: 'ISRO 2040 Manned Lunar Landing'
        },
        'solar-canopy': {
          icon: '☀️',
          label: 'Zero-Carbon Campus',
          color: '#10B981',
          bg: '#ECFDF5',
          problem: 'Delhi heatwaves top 47°C, driving huge AC bills and blackouts.',
          solution: 'Bifacial translucent solar canopies generating 140% of daily energy.',
          why: 'Self-sufficient schools withstand climate stress and teach students practical sustainability.',
          teacher: 'Eco-Club Mentorship',
          align: 'Net-Zero India 2070 & Green Energy'
        },
        'ai-tutor': {
          icon: '🧠',
          label: 'AI Mentor Co-Pilot',
          color: '#8B5CF6',
          bg: '#F5F3FF',
          problem: 'One teacher for 40 students cannot give personal pacing to everyone.',
          solution: 'Neural adaptive tutor explaining concepts in 5 different ways.',
          why: 'No child feels left behind or embarrassed; teachers focus 100% on emotional mentorship and creativity.',
          teacher: 'Richa Ma’am & Anuradha Ma’am',
          align: 'UN SDG 4: Quality Education'
        },
        'bagless-slate': {
          icon: '🎒',
          label: '0kg Bagless Slate',
          color: '#EC4899',
          bg: '#FDF2F8',
          problem: '12kg backpacks cause spinal deformities in 42% of middle schoolers.',
          solution: '320g shatterproof AR Slate holding all textbooks, notebooks, and labs.',
          why: 'Physical health is cognitive health. School should enlighten young minds, not crush their spines.',
          teacher: 'Anuradha Ma’am',
          align: 'National Health Policy & Ergonomics'
        },
        'smart-sports': {
          icon: '🏃🏻‍♂️',
          label: 'Kinematic Sports AI',
          color: '#06B6D4',
          bg: '#ECFEFF',
          problem: 'Teen athletic injuries often go undiagnosed until irreversible damage occurs.',
          solution: 'Pressure-sensing smart turf and Olympic motion capture cameras.',
          why: 'Prepares Indian youth for global athletics while ensuring joint longevity and stress recovery.',
          teacher: 'Usha Ma’am',
          align: 'Khelo India 2040 National Sports'
        },
        'clean-air': {
          icon: '🍃',
          label: 'Delhi AQI Bio-Dome',
          color: '#059669',
          bg: '#D1FAE5',
          problem: 'Delhi smog shuts down schools for 3–4 weeks every single winter.',
          solution: 'Positive-pressure H13 HEPA air circulation corridors (AQI < 20).',
          why: 'Clean air is a fundamental student right. Zero missed school days and peak neurological focus.',
          teacher: 'School Administration & Doctors',
          align: 'National Clean Air Programme'
        }
      };

      this.buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          this.selectModule(id);
        });
      });
    }

    selectModule(id) {
      const mod = this.MODULES[id];
      if (!mod) return;

      this.buttons.forEach(b => {
        const isActive = b.getAttribute('data-id') === id;
        b.classList.toggle('active', isActive);
      });

      if (window.soundFX) window.soundFX.chime();

      this.card.innerHTML = `
        <div class="mission-card-header" style="border-left: 4px solid ${mod.color};">
          <span class="mission-card-icon">${mod.icon}</span>
          <div>
            <h4 class="mission-card-title">${mod.label}</h4>
            <span class="mission-card-pill" style="color: ${mod.color}; background: ${mod.bg};">${mod.align}</span>
          </div>
        </div>
        
        <div class="mission-card-body">
          <div class="mission-intel-row">
            <span class="intel-label">❌ TODAY'S BOTTLENECK</span>
            <p class="intel-text">${mod.problem}</p>
          </div>
          
          <div class="mission-intel-row">
            <span class="intel-label">✨ 2040 SOLUTION</span>
            <p class="intel-text"><strong>${mod.solution}</strong></p>
          </div>
          
          <div class="mission-intel-row">
            <span class="intel-label">🎯 WHY WE NEED THIS BY 2040</span>
            <p class="intel-text">${mod.why}</p>
          </div>
          
          <div class="mission-intel-footer">
            <span class="intel-teacher">👩🏻‍🏫 Spark: <strong>${mod.teacher}</strong></span>
          </div>
        </div>
      `;

      this.card.classList.remove('pulse-in');
      void this.card.offsetWidth;
      this.card.classList.add('pulse-in');
    }
  }

  // ==========================================================================
  // 5. MASTER SCROLL ENGINE (Scan Scenes, Horizontal Track, Rail, Strip)
  // ==========================================================================
  const D = {
    circle: ['0 0 200 90', 'M30 50C20 20 90 6 150 12c40 5 48 32 6 52C110 80 30 80 18 44 12 22 60 8 120 6'],
    under: ['0 0 260 24', 'M3 14C60 6 130 18 200 8c20-3 40 0 56 2M30 21c60-6 120-2 190-6'],
    arrow: ['0 0 130 60', 'M4 52C28 14 76 6 118 30M118 30l-24-2M118 30l-8-22'],
    star: ['0 0 60 60', 'M30 4l7 20 21 1-17 13 6 21-17-12-18 12 6-21L2 25l21-1z'],
    tick: ['0 0 50 40', 'M5 22l14 14L46 5']
  };

  const dd = (k, s, c = '') => `<svg class="dd ${c}" viewBox="${D[k][0]}" preserveAspectRatio="none" style="${s}" aria-hidden="true"><path pathLength="1" d="${D[k][1]}"/></svg>`;

  function setupDoodlesAndManifesto() {
    // 1. Doodles on headlines
    const h40 = $('#h40');
    if (h40) h40.insertAdjacentHTML('beforeend', dd('circle', 'left:-6%;top:-6%;width:112%;height:112%;stroke-width:2.4', 't'));

    const whyH2 = $('#why');
    if (whyH2) whyH2.insertAdjacentHTML('beforeend', dd('under', 'left:0;bottom:-6px;width:100%;height:14px'));

    const phh = $('#phh');
    if (phh) phh.innerHTML = `Feel the <span class="rl">weight${dd('circle', 'left:-8%;top:-12%;width:116%;height:124%;stroke-width:1.6')}</span> of today`;

    const gh = $('#gh');
    if (gh) gh.insertAdjacentHTML('beforeend', dd('under', 'left:0;bottom:-6px;width:70%;height:14px'));

    // 2. Word by word manifesto
    const man = $('#man');
    if (man) {
      const text = `By 2040, every learner at DPS Mathura Road should study with intelligent tools, inside a safe and sustainable campus, ready to help build a developed India.`;
      man.innerHTML = text.split(' ').map(w => `<span>${w}</span>`).join(' ');
    }

    // 3. Populate 2040 Pledge with animated ticks
    const pl = $('#pl');
    if (pl) {
      const PLEDGE = [
        `Every learner studies on one secure slate. No 12kg heavy bag, no paper exam.`,
        `Labs teach by discovery, with AI that adapts to each student's curiosity.`,
        `A campus that watches over everyone and strictly respects student privacy.`,
        `Classrooms open to the world, in person and through holographic presence.`,
        `A paperless, electric, solar-first bio-dome that moves India toward net-zero.`
      ];
      pl.innerHTML = PLEDGE.map(t => `<li>${dd('tick', 'left:12px;top:18px;width:40px;height:32px;stroke-width:2.6')}${t}</li>`).join('');
    }
  }

  function initScrollController() {
    const scenes = [...document.querySelectorAll('.scene')];
    const dds = [...document.querySelectorAll('.dd:not(.t)')];
    const words = [...document.querySelectorAll('#man span')];
    const tis = [...document.querySelectorAll('.ti')];
    const strip = $('#strip');
    const trk = $('#trk');
    const hs = $('#hs');
    const ph = $('#ph');
    const box = $('#box');
    const rl = $('#rl');
    const man = $('#man');
    const rail = $('.rail');
    const progressBar = document.querySelector('.reading-progress span');

    let queued = false;
    let onN = -1;

    function onScrollUpdate() {
      queued = false;
      const vh = window.innerHeight;
      const W = document.documentElement.clientWidth;
      const y = window.scrollY;

      // Top reading progress bar
      if (progressBar) {
        const maxScroll = document.documentElement.scrollHeight - vh;
        progressBar.style.transform = `scaleX(${maxScroll > 0 ? y / maxScroll : 0})`;
      }

      // Marquee strip translation: now pure infinite GPU marquee in CSS

      // Manifesto word-by-word reveal
      if (man && words.length > 0) {
        const mr = man.getBoundingClientRect();
        const n = Math.round(clamp((vh * 0.85 - mr.top) / (vh * 0.4 + mr.height)) * words.length * 1.1);
        if (n !== onN) {
          onN = n;
          words.forEach((w, i) => w.classList.toggle('on', i < n));
        }
      }

      // Matter.js Gravity inversion in #ph box
      if (ph && box) {
        const pr = ph.getBoundingClientRect();
        const pp = clamp(-pr.top / (pr.height - vh));
        MatterGravityY = 1 - clamp((pp - 0.4) / 0.12) * 1.6;
        box.style.setProperty('--f', clamp((pp - 0.52) / 0.18).toFixed(3));
        box.classList.toggle('f', pp > 0.5);
      }

      // Year-Scrubbing Scan Scenes
      scenes.forEach((el) => {
        const r = el.getBoundingClientRect();
        const v = el.querySelector('video');
        if (v) {
          const on = r.bottom > 0 && r.top < vh;
          if (on && v.paused) v.play().catch(() => {});
          else if (!on && !v.paused) v.pause();
        }
        if (r.bottom < -vh || r.top > 2 * vh) return;
        const w = clamp((clamp(-r.top / (r.height - vh)) - 0.1) / 0.6);
        el.style.setProperty('--w', w.toFixed(3));
        el.style.setProperty('--s', w > 0.01 && w < 0.99 ? 1 : 0);
        const yrEl = el.querySelector('.yr');
        if (yrEl) {
          yrEl.textContent = Math.round(2026 + w * 14);
        }
      });

      // Hand-drawn SVG doodle path stroke length on scroll
      dds.forEach((d) => {
        d.style.setProperty('--p', clamp((vh * 0.92 - d.getBoundingClientRect().top) / (vh * 0.3)).toFixed(3));
      });

      // Horizontal Sports & Health Track
      if (hs && trk) {
        const hr = hs.getBoundingClientRect();
        const hp = clamp(-hr.top / (hr.height - vh));
        trk.style.transform = `translate3d(${-hp * Math.max(0, trk.scrollWidth - W + 32)}px, 0, 0)`;
      }

      // National Mission Timeline Rail
      if (rail && rl) {
        const tr = rail.getBoundingClientRect();
        rl.style.setProperty('--p', clamp((vh * 0.6 - tr.top) / tr.height).toFixed(3));
        tis.forEach((t) => {
          t.classList.toggle('on', t.getBoundingClientRect().top < vh * 0.62);
        });
      }
    }

    const queue = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(onScrollUpdate);
      }
    };

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    onScrollUpdate();

    // Trigger hero doodle draw-in
    requestAnimationFrame(() => {
      document.querySelectorAll('.dd.t').forEach((d) => d.style.setProperty('--p', 1));
    });
  }

  // ==========================================================================
  // 6. MISSION TABS & COMPARISON SLIDERS
  // ==========================================================================
  function initMissionTabs() {
    const tabButtons = document.querySelectorAll('.matrix-tab-btn');
    const tabPanels = document.querySelectorAll('.matrix-tab-panel');

    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        tabButtons.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
          targetPanel.classList.add('active');
          audio.chime(2, 0.09);
        }
      });
    });
  }

  function initComparisonSliders() {
    const sliders = document.querySelectorAll('.interactive-wipe-slider');
    sliders.forEach(slider => {
      const afterWrap = slider.querySelector('.wipe-after-wrap');
      const handle = slider.querySelector('.wipe-handle');
      if (!afterWrap || !handle) return;

      let lastPct = 50;

      const setPosition = (clientX) => {
        const rect = slider.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const pct = (offsetX / rect.width) * 100;

        afterWrap.style.clipPath = `inset(0 0 0 ${pct}%)`;
        handle.style.left = `${pct}%`;

        // Subtle chime when passing midpoint
        if ((lastPct < 50 && pct >= 50) || (lastPct > 50 && pct <= 50)) {
          audio.chime(4, 0.08);
        }
        lastPct = pct;
      };

      slider.addEventListener('pointerdown', (e) => {
        if (slider.setPointerCapture) {
          try { slider.setPointerCapture(e.pointerId); } catch (_) {}
        }
        setPosition(e.clientX);
      });

      slider.addEventListener('pointermove', (e) => {
        setPosition(e.clientX);
      });
    });
  }

  // ==========================================================================
  // 7. INITIALIZATION ON DOM READY
  // ==========================================================================
  function init() {
    setupDoodlesAndManifesto();
    new PencilDoodleTrail();
    initMatterGravityChamber();
    new InnovationBlueprintHub();
    initScrollController();
    initMissionTabs();
    initComparisonSliders();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
