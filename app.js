/* =====================================================================
   YASAR ❤ KHUSHI — LUXURY ROMANTIC EXPERIENCE
   ===================================================================== */
gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------------------
   0. UTILITIES
--------------------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const rand = (a, b) => a + Math.random() * (b - a);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvas(canvas) {
  canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
  canvas.height = window.innerHeight * (window.devicePixelRatio || 1);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  return ctx;
}

/* ---------------------------------------------------------------------
   1. STARRY NIGHT SKY + SHOOTING STARS  (#stars-canvas)
--------------------------------------------------------------------- */
(function starsField() {
  const canvas = $('#stars-canvas');
  let ctx = resizeCanvas(canvas);
  let stars = [];
  const STAR_COUNT = window.innerWidth < 768 ? 110 : 220;

  function makeStars() {
    stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: rand(0.4, 1.8),
      tw: rand(0, Math.PI * 2),
      speed: rand(0.01, 0.03),
    }));
  }
  makeStars();

  let shootingStars = [];
  function spawnShootingStar() {
    shootingStars.push({
      x: rand(0, window.innerWidth * 0.7),
      y: rand(0, window.innerHeight * 0.3),
      vx: rand(6, 11),
      vy: rand(2, 4),
      life: 1,
      len: rand(80, 140),
    });
  }
  setInterval(() => { if (Math.random() < 0.6) spawnShootingStar(); }, 3500);

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // twinkling stars
    stars.forEach(s => {
      s.tw += s.speed;
      const alpha = 0.4 + Math.sin(s.tw) * 0.4;
      ctx.beginPath();
      ctx.fillStyle = `rgba(248,246,242,${Math.max(0, alpha)})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    // shooting stars
    shootingStars.forEach(st => {
      ctx.save();
      ctx.globalAlpha = st.life;
      const grad = ctx.createLinearGradient(st.x, st.y, st.x - st.len, st.y - st.len * 0.35);
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(st.x - st.len, st.y - st.len * 0.35);
      ctx.stroke();
      ctx.restore();
      st.x += st.vx; st.y += st.vy; st.life -= 0.012;
    });
    shootingStars = shootingStars.filter(s => s.life > 0);
    requestAnimationFrame(draw);
  }
  if (!reduceMotion) draw(); else { stars.forEach(s=>{}); ctx.clearRect(0,0,9999,9999); }

  window.addEventListener('resize', () => { ctx = resizeCanvas(canvas); makeStars(); });
})();

/* ---------------------------------------------------------------------
   2. FALLING ROSE PETALS  (#petals-canvas) — thousands, performant via pooling
--------------------------------------------------------------------- */
const PetalSystem = (function petalSystem() {
  const canvas = $('#petals-canvas');
  let ctx = resizeCanvas(canvas);
  let petals = [];
  let active = true;
  const MAX_PETALS = window.innerWidth < 768 ? 70 : 160;

  function petalPath(ctx, size) {
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.bezierCurveTo(size * 0.8, -size * 0.6, size * 0.8, size * 0.6, 0, size);
    ctx.bezierCurveTo(-size * 0.8, size * 0.6, -size * 0.8, -size * 0.6, 0, -size);
    ctx.closePath();
  }

  function spawnPetal() {
    return {
      x: rand(0, window.innerWidth),
      y: rand(-100, -10),
      size: rand(6, 14),
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.02, 0.02),
      vy: rand(0.6, 1.6),
      vx: rand(-0.6, 0.6),
      sway: rand(0, Math.PI * 2),
      swaySpeed: rand(0.01, 0.03),
      swayAmp: rand(0.5, 1.6),
      hue: Math.random() > 0.3 ? '139,0,0' : '183,110,121',
      opacity: rand(0.55, 0.92),
    };
  }

  function ensurePetals(n) {
    while (petals.length < n) petals.push(spawnPetal());
    petals.length = n;
  }
  ensurePetals(MAX_PETALS);

  function draw() {
    if (!active) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    petals.forEach(p => {
      p.sway += p.swaySpeed;
      p.x += p.vx + Math.sin(p.sway) * p.swayAmp * 0.05;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      if (p.y > window.innerHeight + 20) {
        Object.assign(p, spawnPetal(), { y: rand(-50, -10) });
      }
      if (p.x < -20) p.x = window.innerWidth + 20;
      if (p.x > window.innerWidth + 20) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
      ctx.shadowColor = `rgba(${p.hue},0.4)`;
      ctx.shadowBlur = 4;
      petalPath(ctx, p.size);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  if (!reduceMotion) draw();

  window.addEventListener('resize', () => { ctx = resizeCanvas(canvas); });

  return {
    burst(n = 300) {
      // temporary extra petals for big celebration moments
      const extra = Array.from({ length: n }, () => {
        const p = spawnPetal();
        p.y = rand(-200, -10);
        p.vy = rand(1.5, 3.5);
        return p;
      });
      petals = petals.concat(extra);
      setTimeout(() => { petals = petals.slice(0, MAX_PETALS); }, 9000);
    },
    setActive(v) { active = v; }
  };
})();

/* ---------------------------------------------------------------------
   3. MOUSE-FOLLOWING GOLDEN SPARKLES (#sparkle-canvas)
--------------------------------------------------------------------- */
(function sparkleTrail() {
  const canvas = $('#sparkle-canvas');
  let ctx = resizeCanvas(canvas);
  let sparkles = [];
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let lastSpawn = 0;

  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    const now = performance.now();
    if (now - lastSpawn > 30) {
      lastSpawn = now;
      for (let i = 0; i < 2; i++) {
        sparkles.push({
          x: mouse.x + rand(-6, 6),
          y: mouse.y + rand(-6, 6),
          size: rand(1.5, 3.5),
          life: 1,
          vx: rand(-0.4, 0.4),
          vy: rand(-0.8, -0.2),
        });
      }
    }
  }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    sparkles.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.life -= 0.02;
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = '#D4AF37';
      ctx.shadowColor = '#F7E7CE';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    sparkles = sparkles.filter(s => s.life > 0);
    requestAnimationFrame(draw);
  }
  if (!reduceMotion) draw();
  window.addEventListener('resize', () => { ctx = resizeCanvas(canvas); });
})();

/* ---------------------------------------------------------------------
   4. LOADING SCREEN — rose bloom + heart pulse, then reveal site
--------------------------------------------------------------------- */
(function loaderSeq() {
  const loaderBar = $('#loader-bar');
  const loader = $('#loader');
  let pct = 0;
  const tick = setInterval(() => {
    pct += rand(4, 12);
    if (pct >= 100) { pct = 100; clearInterval(tick); }
    loaderBar.style.width = pct + '%';
  }, 180);

  window.addEventListener('load', () => {
    setTimeout(() => {
      gsap.to(loader, {
        opacity: 0, duration: 1.2, onComplete: () => { loader.style.display = 'none'; startOpeningSequence(); }
      });
    }, 1600);
  });
  // fallback in case load event already fired
  setTimeout(() => {
    if (loader.style.display !== 'none') {
      gsap.to(loader, { opacity: 0, duration: 1.2, onComplete: () => { loader.style.display = 'none'; startOpeningSequence(); } });
    }
  }, 4500);
})();

/* ---------------------------------------------------------------------
   5. OPENING SCENE SEQUENCE — heartbeat, lines, name reveal
--------------------------------------------------------------------- */
let openingStarted = false;
function startOpeningSequence() {
  if (openingStarted) return;
  openingStarted = true;
  init3DOpeningRose();

  const tl = gsap.timeline({ delay: 0.3 });
  tl.to('#line1', { opacity: 1, y: -10, duration: 1.4, ease: 'power2.out' })
    .to('#line1', { opacity: 0, y: -30, duration: 1, ease: 'power1.in' }, '+=1.6')
    .to('#line2', { opacity: 1, y: -10, duration: 1.4, ease: 'power2.out' }, '-=0.4')
    .to('#line2', { opacity: 0, y: -30, duration: 1 }, '+=1.6')
    .to('#names-reveal', { opacity: 1, scale: 1, duration: 1.6, ease: 'back.out(1.4)' }, '-=0.3')
    .from('#names-reveal', { scale: 0.8 }, '<')
    .to('#scroll-hint', { opacity: 1, duration: 1 }, '+=0.4');
}

/* ---------------------------------------------------------------------
   6. THREE.js — OPENING 3D ROSE (rotating, blooming red rose)
--------------------------------------------------------------------- */
function init3DOpeningRose() {
  const container = $('#opening-rose-3d');
  if (!container || typeof THREE === 'undefined') return;
  const width = container.clientWidth || 220, height = container.clientHeight || 220;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0.6, 5.2);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const roseGroup = new THREE.Group();
  scene.add(roseGroup);

  // Petals built from layered torus/lathe-ish shapes using simple curved planes
  const petalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x8B0000, emissive: 0x330000, roughness: 0.35, metalness: 0.1,
    clearcoat: 0.6, side: THREE.DoubleSide,
  });
  const goldMaterial = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.3, metalness: 0.8 });

  function makePetal(scale, angle, heightOffset, layerColor) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.5, 0.3, 0.6, 1, 0, 1.4);
    shape.bezierCurveTo(-0.6, 1, -0.5, 0.3, 0, 0);
    const geo = new THREE.ShapeGeometry(shape, 8);
    const mat = petalMaterial.clone();
    mat.color = new THREE.Color(layerColor);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.setScalar(scale);
    mesh.rotation.x = -0.5 + heightOffset;
    mesh.position.y = heightOffset * 0.3;
    mesh.rotation.y = angle;
    const pivot = new THREE.Group();
    pivot.add(mesh);
    mesh.position.z = 0.05;
    pivot.rotation.y = angle;
    return pivot;
  }

  const layers = [
    { count: 5, scale: 0.55, height: 1.0, color: 0x6e0000 },
    { count: 6, scale: 0.8, height: 0.55, color: 0x8B0000 },
    { count: 7, scale: 1.05, height: 0.15, color: 0xa30d0d },
    { count: 8, scale: 1.3, height: -0.15, color: 0xb53030 },
  ];
  layers.forEach(layer => {
    for (let i = 0; i < layer.count; i++) {
      const angle = (i / layer.count) * Math.PI * 2;
      const petal = makePetal(layer.scale, angle, layer.height, layer.color);
      petal.scale.setScalar(0.001);
      roseGroup.add(petal);
      gsap.to(petal.scale, {
        x: 1, y: 1, z: 1, duration: 1.6, delay: 0.3 + layer.height * -0.3 + i * 0.04,
        ease: 'back.out(2)'
      });
    }
  });

  // small gold accent sphere center
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), goldMaterial);
  roseGroup.add(center);

  // stem
  const stemGeo = new THREE.CylinderGeometry(0.04, 0.05, 2, 8);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x1a3d1a, roughness: 0.6 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = -1.9;
  roseGroup.add(stem);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const pl = new THREE.PointLight(0xD4AF37, 1.4, 10);
  pl.position.set(2, 2, 3);
  scene.add(pl);
  const pl2 = new THREE.PointLight(0x8B0000, 0.8, 10);
  pl2.position.set(-2, -1, 2);
  scene.add(pl2);

  roseGroup.position.y = -0.3;
  roseGroup.rotation.x = 0.15;

  function animate() {
    requestAnimationFrame(animate);
    roseGroup.rotation.y += 0.006;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    const w = container.clientWidth || 220, h = container.clientHeight || 220;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
}

/* ---------------------------------------------------------------------
   7. NAV scroll state
--------------------------------------------------------------------- */
window.addEventListener('scroll', () => {
  $('#nav').classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

/* ---------------------------------------------------------------------
   8. HERO — animated rose bouquet (CSS/SVG layered roses) + reveal
--------------------------------------------------------------------- */
(function buildHeroBouquet() {
  const wrap = $('#hero-bouquet');
  if (!wrap) return;
  const roseSVG = (color, size, x, y, delay, rot) => `
    <div style="position:absolute; left:${x}%; top:${y}%; width:${size}px; height:${size}px; transform:translate(-50%,-50%) rotate(${rot}deg); animation: bloomIn 1.6s ${delay}s cubic-bezier(.16,1,.3,1) both, sway 6s ${delay}s ease-in-out infinite;">
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <g fill="${color}">
          <circle cx="50" cy="50" r="10" opacity="0.9"/>
          ${Array.from({length:8}).map((_,i)=>{
            const a = (i/8)*Math.PI*2;
            const cx = 50+Math.cos(a)*22, cy=50+Math.sin(a)*22;
            return `<ellipse cx="${cx}" cy="${cy}" rx="13" ry="18" transform="rotate(${a*180/Math.PI} ${cx} ${cy})" opacity="0.85"/>`;
          }).join('')}
        </g>
      </svg>
    </div>`;
  const roses = [
    roseSVG('#8B0000', 160, 50, 48, 0.1, 0),
    roseSVG('#a30d0d', 110, 30, 60, 0.3, -15),
    roseSVG('#b53030', 110, 70, 60, 0.45, 15),
    roseSVG('#6e0000', 90, 38, 35, 0.6, 10),
    roseSVG('#6e0000', 90, 62, 35, 0.7, -10),
  ];
  wrap.innerHTML = `<style>
    @keyframes bloomIn{ from{ transform:translate(-50%,-50%) scale(0) rotate(0deg); opacity:0;} to{ transform:translate(-50%,-50%) scale(1) rotate(var(--r,0deg)); opacity:1;} }
    @keyframes sway{ 0%,100%{ margin-top:0px;} 50%{ margin-top:-8px;} }
  </style>${roses.join('')}`;
})();

gsap.utils.toArray('[data-anim="hero-text"]').forEach(el => {
  gsap.fromTo(el, { opacity: 0, y: 60 }, {
    opacity: 1, y: 0, duration: 1.4, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 85%' }
  });
});

/* ---------------------------------------------------------------------
   9. LOVE STORY TIMELINE — build cards + rose-bloom scroll reveal
--------------------------------------------------------------------- */
const timelineData = [
  { icon: '✨', title: 'The Day We Met', text: 'Two strangers, one room, and a moment that quietly rewrote both our futures.' },
  { icon: '✨', title: 'The First Smile', text: 'A smile so warm it felt like sunlight finding its way through a window.' },
  { icon: '✨', title: 'The First Conversation', text: 'Hours felt like minutes — I had never wanted a conversation to never end.' },
  { icon: '✨', title: 'The First Memory', text: 'A moment so small, yet etched so deep, that I still return to it on quiet nights.' },
  { icon: '✨', title: 'Every Special Moment', text: 'A thousand little memories, stitched together into the story of us.' },
  { icon: '✨', title: 'Today', text: 'Every day with you still feels like the best one yet.' },
  { icon: '✨', title: 'Forever', text: 'Not an ending — a promise. Wherever life goes, I am going there with you.' },
];

(function buildTimeline() {
  const container = $('#timeline-items');
  timelineData.forEach((item, i) => {
    const isLeft = i % 2 === 0;
    const card = document.createElement('div');
    card.className = `timeline-card relative flex flex-col md:flex-row items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6`;
    card.innerHTML = `
      <div class="md:w-1/2 ${isLeft ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} text-center pl-14 md:pl-0">
        <div class="glass inline-block p-6 rounded-lg relative overflow-hidden">
          <div class="timeline-rose absolute -top-4 ${isLeft ? '-right-4' : '-left-4'} w-16 h-16 opacity-70 pointer-events-none"></div>
          <p class="text-2xl mb-1">${item.icon}</p>
          <h3 class="font-display text-xl md:text-2xl gold-text">${item.title}</h3>
          <p class="mt-2 text-sm md:text-base" style="color:var(--rose-gold-light)">${item.text}</p>
        </div>
      </div>
      <div class="absolute md:relative left-[12px] md:left-auto top-2 md:top-auto timeline-dot pulse-glow"></div>
      <div class="hidden md:block md:w-1/2"></div>
    `;
    container.appendChild(card);
  });

  // small bloom rose svg inside each card decoration
  $$('.timeline-rose').forEach(el => {
    el.innerHTML = `<svg viewBox="0 0 100 100" width="100%" height="100%"><g fill="#8B0000" opacity="0.5">
      <circle cx="50" cy="50" r="8"/>
      ${Array.from({length:6}).map((_,i)=>{const a=(i/6)*Math.PI*2; const cx=50+Math.cos(a)*18, cy=50+Math.sin(a)*18; return `<ellipse cx="${cx}" cy="${cy}" rx="10" ry="14" transform="rotate(${a*180/Math.PI} ${cx} ${cy})"/>`}).join('')}
    </g></svg>`;
  });

  $$('.timeline-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, y: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: card, start: 'top 82%' }
    });
    const rose = card.querySelector('.timeline-rose');
    if (rose) {
      gsap.fromTo(rose, { scale: 0, rotate: -30, opacity: 0 }, {
        scale: 1, rotate: 0, opacity: 0.7, duration: 1.4, ease: 'back.out(2)',
        scrollTrigger: { trigger: card, start: 'top 80%' }
      });
    }
  });
})();

/* ---------------------------------------------------------------------
   10. LOVE LETTER ENVELOPE — open/close interaction + petal burst
--------------------------------------------------------------------- */
(function envelopeInteraction() {
  const env = $('#envelope');
  if (!env) return;
  let opened = false;
  function toggle() {
    opened = !opened;
    env.classList.toggle('opened', opened);
    if (opened) PetalSystem.burst(120);
  }
  env.addEventListener('click', toggle);
  env.addEventListener('keypress', (e) => { if (e.key === 'Enter' || e.key === ' ') toggle(); });
})();

/* ---------------------------------------------------------------------
   11. 100 REASONS — flip cards generation
--------------------------------------------------------------------- */
const reasonsList = [
  "Your smile is my favorite sunrise","You make ordinary days feel magical","Your laugh is my favorite sound",
  "You believe in me even when I doubt myself","Your hugs feel like home","You listen with your whole heart",
  "You make me a better person","Your eyes tell stories I never tire of","You are endlessly kind",
  "You make tea like it's an act of love","Your patience with me is a gift","You dance like no one's watching",
  "You remember the little things","You forgive so easily","Your strength inspires me daily",
  "You make our house feel alive","You always know what to say","Your hands fit perfectly in mine",
  "You make me laugh until I cry","Your honesty grounds me","You chase your dreams fearlessly",
  "You care for everyone around you","Your voice calms every storm in me","You make Mondays bearable",
  "You love fiercely and completely","You make every place feel like home","Your curiosity is contagious",
  "You never give up on us","You make the best memories with me","Your kindness to strangers humbles me",
  "You hum when you're happy","You make our future feel exciting","You are my favorite person to talk to",
  "You make me feel safe","Your ambition motivates me","You give the best advice",
  "You make plans just to surprise me","Your warmth melts my worries","You celebrate my small wins",
  "You make our home smell like comfort","You write the sweetest notes","You make grocery runs feel romantic",
  "Your loyalty is unmatched","You always choose us","You make me want to be better",
  "Your gratitude for small things","You sing in the shower","You make me feel chosen every day",
  "You hold my hand in crowded places","Your faith in 'us' never wavers","You make rainy days cozy",
  "You remember how I take my coffee","You apologize first, always","Your wit keeps me sharp",
  "You make every birthday unforgettable","You love my family like your own","You never let me sleep angry",
  "Your hugs fix bad days","You make playlists just for me","You dream big and include me in them",
  "You make sacrifices quietly","Your softness balances my edges","You make Sundays sacred",
  "You text 'thinking of you' randomly","Your support never has conditions","You make me proud constantly",
  "You forgive my worst days","You make traditions feel new","Your trust in me is humbling",
  "You make distance feel smaller","You light up every room","Your hope is contagious",
  "You make me feel handsome/beautiful","You remember our anniversary of everything","Your prayers include me",
  "You make budgeting feel like teamwork","Your jokes are terrible and perfect","You make me feel needed",
  "You hold space for my emotions","Your hands make the best food","You make long drives fun",
  "You never stop choosing kindness","Your resilience after hard days","You make our love feel timeless",
  "You always say 'we', never just 'I'","Your eyes light up seeing me","You make every goodbye softer",
  "Your heart has endless room","You make me believe in forever","You stay even when it's hard",
  "Your presence is my peace","You make small moments sacred","You love without keeping score",
  "Your dreams include growing old together","You make me feel like enough","Your voice is the last thing I want to hear at night",
  "You are my best friend","You are my safest place","You are my favorite chapter",
  "You are my today and all my tomorrows","You are simply, completely, irreplaceable","You are the reason I believe in love",
];
(function buildReasons() {
  const grid = $('#reasons-grid');
  const frag = document.createDocumentFragment();
  reasonsList.slice(0, 100).forEach((reason, i) => {
    const card = document.createElement('div');
    card.className = 'flip-card reveal';
    card.innerHTML = `
      <div class="flip-inner">
        <div class="flip-face flip-front">
          <div>
            <div class="text-xs tracking-widest mb-1" style="color:var(--champagne-gold)">REASON</div>
            <div class="font-display text-2xl gold-text">${String(i + 1).padStart(2, '0')}</div>
            <div class="text-[10px] mt-1" style="color:var(--rose-gold-light)">tap / hover</div>
          </div>
        </div>
        <div class="flip-face flip-back">
          <p class="text-sm" style="color:var(--champagne)">${reason}</p>
        </div>
      </div>`;
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    frag.appendChild(card);
  });
  grid.appendChild(frag);

  gsap.utils.toArray('#reasons-grid .flip-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1, y: 0, duration: 0.7, delay: (i % 10) * 0.03, ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 95%' }
    });
  });
})();

/* ---------------------------------------------------------------------
   12. GALLERY — golden frames with placeholder romantic imagery
--------------------------------------------------------------------- */
const galleryCaptions = [
  "The Day We Met", "Stolen Glances", "Laughter We Keep",
  "Quiet Evenings", "Hand in Hand", "Forever Beginning"
];
(function buildGallery() {
  const grid = $('#gallery-grid');
  galleryCaptions.forEach((cap, i) => {
    const div = document.createElement('div');
    div.className = 'frame reveal';
    div.innerHTML = `
      <div class="frame-inner" style="aspect-ratio:4/5;">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#2a0a0d,#150508);">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" opacity="0.5">
            <path d="M12 21s-8-5.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-8 11-8 11z" fill="#8B0000"/>
          </svg>
        </div>
        <div class="frame-glow absolute inset-0"></div>
      </div>
      <p class="text-center mt-3 font-display italic text-sm md:text-base" style="color:var(--champagne-gold)">${cap}</p>
    `;
    grid.appendChild(div);
  });

  gsap.utils.toArray('#gallery-grid .frame').forEach((frame, i) => {
    gsap.to(frame, {
      opacity: 1, y: 0, duration: 1, delay: (i % 3) * 0.15, ease: 'power3.out',
      scrollTrigger: { trigger: frame, start: 'top 85%' }
    });
  });
})();

/* ---------------------------------------------------------------------
   13. THREE.js — PROPOSAL: 3D CRYSTAL HEART + surrounding petals
--------------------------------------------------------------------- */
(function crystalHeart() {
  const wrap = $('#crystal-heart-wrap');
  if (!wrap || typeof THREE === 'undefined') return;
  const width = window.innerWidth, height = window.innerHeight * 1.3;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  wrap.appendChild(renderer.domElement);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';

  // heart shape extrusion
  function heartShape() {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x, y + 0.4);
    shape.bezierCurveTo(x, y + 0.4, x - 0.6, y - 0.2, x - 1.1, y + 0.4);
    shape.bezierCurveTo(x - 1.7, y + 1.1, x - 0.9, y + 1.7, x, y + 1.0);
    shape.bezierCurveTo(x + 0.9, y + 1.7, x + 1.7, y + 1.1, x + 1.1, y + 0.4);
    shape.bezierCurveTo(x + 0.6, y - 0.2, x, y + 0.4, x, y + 0.4);
    return shape;
  }
  const extrudeSettings = { depth: 0.5, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.12, bevelSegments: 6, curveSegments: 24 };
  const geo = new THREE.ExtrudeGeometry(heartShape(), extrudeSettings);
  geo.center();
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xB76E79, transmission: 0.9, roughness: 0.05, thickness: 1.5,
    ior: 1.6, reflectivity: 0.8, clearcoat: 1, metalness: 0,
    emissive: 0x8B0000, emissiveIntensity: 0.15,
  });
  const heart = new THREE.Mesh(geo, mat);
  heart.rotation.z = Math.PI;
  heart.scale.setScalar(1.5);
  scene.add(heart);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const l1 = new THREE.PointLight(0xD4AF37, 2.5, 20); l1.position.set(4, 3, 5); scene.add(l1);
  const l2 = new THREE.PointLight(0x8B0000, 1.6, 20); l2.position.set(-4, -2, 4); scene.add(l2);
  const l3 = new THREE.PointLight(0xffffff, 1, 20); l3.position.set(0, 0, 6); scene.add(l3);

  // surrounding particles (rose petal sprites as simple planes)
  const petalGeo = new THREE.PlaneGeometry(0.18, 0.24);
  const petalMat = new THREE.MeshBasicMaterial({ color: 0x8B0000, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
  const particles = [];
  const PCOUNT = window.innerWidth < 768 ? 40 : 90;
  for (let i = 0; i < PCOUNT; i++) {
    const m = new THREE.Mesh(petalGeo, petalMat.clone());
    const radius = rand(2.2, 4.5);
    const angle = rand(0, Math.PI * 2);
    const yAngle = rand(0, Math.PI * 2);
    m.position.set(Math.cos(angle) * radius, rand(-2.5, 2.5), Math.sin(angle) * radius * 0.6);
    m.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    m.userData = { speed: rand(0.002, 0.006), radius, angle, baseY: m.position.y, floatSpeed: rand(0.5,1.2), floatOff: rand(0,10) };
    scene.add(m);
    particles.push(m);
  }

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;
    heart.rotation.y += 0.008;
    heart.position.y = Math.sin(t * 1.2) * 0.15;
    particles.forEach(p => {
      p.userData.angle += p.userData.speed;
      p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
      p.position.z = Math.sin(p.userData.angle) * p.userData.radius * 0.6;
      p.position.y = p.userData.baseY + Math.sin(t * p.userData.floatSpeed + p.userData.floatOff) * 0.3;
      p.rotation.x += 0.01; p.rotation.y += 0.008;
    });
    renderer.render(scene, camera);
  }
  if (!reduceMotion) animate(); else renderer.render(scene, camera);

  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight * 1.3;
    renderer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  });

  window.__crystalHeart = { scene, camera, renderer, heart };
})();

/* ---------------------------------------------------------------------
   14. "FOREVER YOURS" BUTTON — massive celebration
--------------------------------------------------------------------- */
(function celebrationSequence() {
  const btn = $('#forever-btn');
  const overlay = $('#celebration');
  const canvas = $('#celebration-canvas');
  const namesEl = $('#celebration-names');
  if (!btn) return;

  let ctx;
  function fitCanvas() { ctx = resizeCanvas(canvas); }
  fitCanvas();
  window.addEventListener('resize', fitCanvas);

  function heartFirework(x, y, hue) {
    const particles = [];
    const n = 60;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const speed = rand(2, 5);
      particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 1,
        life: 1,
        color: hue,
      });
    }
    return particles;
  }

  let allParticles = [];
  let running = false;

  function renderLoop() {
    if (!running) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    allParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.life -= 0.012;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      // draw heart-ish particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    allParticles = allParticles.filter(p => p.life > 0);
    requestAnimationFrame(renderLoop);
  }

  function launchFireworks() {
    running = true;
    renderLoop();
    const colors = ['#8B0000', '#D4AF37', '#B76E79', '#F7E7CE'];
    let bursts = 0;
    const interval = setInterval(() => {
      bursts++;
      const x = rand(window.innerWidth * 0.2, window.innerWidth * 0.8);
      const y = rand(window.innerHeight * 0.2, window.innerHeight * 0.6);
      allParticles = allParticles.concat(heartFirework(x, y, colors[bursts % colors.length]));
      if (bursts >= 10) clearInterval(interval);
    }, 280);
    setTimeout(() => { running = false; }, 8000);
  }

  btn.addEventListener('click', () => {
    gsap.to(overlay, { opacity: 1, duration: 0.8, pointerEvents: 'auto' });
    PetalSystem.burst(400);
    launchFireworks();
    gsap.to(namesEl, { opacity: 1, scale: 1.05, duration: 1.4, delay: 0.6, ease: 'back.out(1.6)' });

    setTimeout(() => {
      gsap.to(namesEl, { opacity: 0, duration: 1 });
      gsap.to(overlay, { opacity: 0, duration: 1.4, delay: 0.3, pointerEvents: 'none' });
    }, 6500);
  });
})();

/* ---------------------------------------------------------------------
   15. FINAL ENDING — stars forming a heart + fade text
--------------------------------------------------------------------- */
(function endingScene() {
  const canvas = $('#ending-stars-canvas');
  const heartDiv = $('#ending-heart');
  if (!canvas) return;
  let ctx = resizeCanvas(canvas);

  // generate heart-shape points using parametric heart curve
  function heartPoints(n, scale) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push({ x: x * scale, y: y * scale });
    }
    return pts;
  }

  let stars = [];
  let formed = false;

  function initStars() {
    const n = window.innerWidth < 768 ? 90 : 160;
    const cx = window.innerWidth / 2, cy = window.innerHeight * 0.42;
    const targets = heartPoints(n, Math.min(window.innerWidth, 700) / 38);
    stars = targets.map(t => ({
      x: rand(0, window.innerWidth),
      y: rand(0, window.innerHeight),
      tx: cx + t.x,
      ty: cy + t.y,
      r: rand(1, 2.6),
      tw: rand(0, Math.PI * 2),
    }));
  }
  initStars();

  let progress = 0;
  ScrollTrigger.create({
    trigger: '#ending',
    start: 'top 70%',
    onEnter: () => {
      if (formed) return;
      formed = true;
      gsap.to({}, {
        duration: 3, onUpdate: function () { progress = this.progress(); }, ease: 'power2.inOut'
      });
      gsap.to('#ending-names', { opacity: 1, duration: 1.5, delay: 2.6 });
      gsap.to('#ending-tagline', { opacity: 1, duration: 2, delay: 3.4 });
    }
  });

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    stars.forEach(s => {
      s.tw += 0.02;
      const cx = s.x + (s.tx - s.x) * progress;
      const cy = s.y + (s.ty - s.y) * progress;
      const alpha = 0.5 + Math.sin(s.tw) * 0.4;
      ctx.beginPath();
      ctx.fillStyle = `rgba(248,246,242,${Math.max(0.2, alpha)})`;
      ctx.shadowColor = '#D4AF37';
      ctx.shadowBlur = progress > 0.5 ? 8 : 0;
      ctx.arc(cx, cy, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  if (!reduceMotion) draw();

  window.addEventListener('resize', () => { ctx = resizeCanvas(canvas); initStars(); });
})();

/* ---------------------------------------------------------------------
   16. MUSIC TOGGLE
--------------------------------------------------------------------- */
(function musicControl() {
  const audio = $('#bg-music');
  const btn = $('#music-toggle');
  const playIcon = $('#music-icon-play');
  const pauseIcon = $('#music-icon-pause');
  if (!audio || !btn) return;
  audio.volume = 0.35;
  let playing = false;

  btn.addEventListener('click', async () => {
    try {
      if (!playing) {
        await audio.play();
        playing = true;
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
      } else {
        audio.pause();
        playing = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
      }
    } catch (e) {
      console.warn('Audio playback unavailable:', e);
    }
  });
})();

/* ---------------------------------------------------------------------
   17. LENIS-LIKE SMOOTH SCROLL (lightweight, no external dependency needed
       since Lenis CDN can be flaky) — native smooth-scroll already set via CSS.
       For extra smoothness we ease scroll on wheel for desktop.
--------------------------------------------------------------------- */
(function smoothScrollPolish() {
  if (reduceMotion) return;
  if (window.innerWidth < 768) return; // keep native on mobile for perf
  let targetY = window.scrollY;
  let currentY = window.scrollY;
  let ticking = false;

  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetY += e.deltaY * 0.9;
    targetY = Math.max(0, Math.min(targetY, document.body.scrollHeight - window.innerHeight));
    if (!ticking) { ticking = true; requestAnimationFrame(loop); }
  }, { passive: false });

  function loop() {
    currentY += (targetY - currentY) * 0.12;
    window.scrollTo(0, currentY);
    if (Math.abs(targetY - currentY) > 0.5) {
      requestAnimationFrame(loop);
    } else {
      ticking = false;
    }
  }
})();

/* ---------------------------------------------------------------------
   18. ScrollTrigger refresh after layout settles
--------------------------------------------------------------------- */
window.addEventListener('load', () => setTimeout(() => ScrollTrigger.refresh(), 800));
