/* ═══════════════════════════════════════════════
   PHASE SHIFT — Main Application
   ═══════════════════════════════════════════════ */

'use strict';

// ── THEME CONFIG ──────────────────────────────────
const THEMES = [
  { name: 'garden',   label: 'Garden',   fogColor: [250/255, 248/255, 245/255] },
  { name: 'ocean',    label: 'Ocean',    fogColor: [10/255, 22/255, 40/255] },
  { name: 'geometry', label: 'Geometry', fogColor: [240/255, 240/255, 240/255] },
  { name: 'urban',    label: 'Urban',    fogColor: [18/255, 18/255, 18/255] },
];

let currentTheme = 0;

// ── CYCLING WORDS ─────────────────────────────────
const WORDS = ['Build', 'Research', 'Create', 'Design', 'Ship', 'Explore', 'Automate', 'Connect'];
let wordIndex = 0;
let wordCycleTimer = null;

// ── BRAILLE CHARS ─────────────────────────────────
const BRAILLE = ['⠀', '⠄', '⠆', '⠇', '⠧', '⠷', '⠿'];
const BRAILLE_SEGS = 28;
let brailleTimer = null;

// ── STATE ─────────────────────────────────────────
let fog = null;
let lenis = null;

// ═════════════════════════════════════════════════
// INIT
// ═════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initFog();
  initLenis();
  initPhaseShift();
  initHowSteps();
  initManifestoReveal();
  initManifestoStats();
  initRevealCards();
  initSVGPath();
  initOSSGraph();
  initNavScroll();
  startRAF();

  // Page load sequence
  requestAnimationFrame(() => {
    setTimeout(pageLoadSequence, 100);
  });
});

// ── PAGE LOAD SEQUENCE ────────────────────────────
async function pageLoadSequence() {
  // Start fog reveal
  fog.revealPage();

  // Stagger in UI elements
  await wait(500);
  document.getElementById('nav').classList.add('loaded');

  await wait(200);
  document.querySelector('.hero-content').classList.add('loaded');

  // Init cycling word after content is visible
  await wait(100);
  initHeroCycler();

  await wait(300);
  document.querySelector('.hero-bottom').classList.add('loaded');
  document.getElementById('scroll-indicator').classList.add('loaded');

  // Float cards in
  await wait(200);
  document.querySelectorAll('.float-card').forEach((card, i) => {
    setTimeout(() => card.classList.add('loaded'), i * 120);
  });

  // Start braille
  await wait(400);
  initBrailleBar();
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── FOG DISSOLVE ──────────────────────────────────
function initFog() {
  const canvas = document.getElementById('fog-canvas');
  fog = new FogDissolve(canvas);
  fog.setColor(...THEMES[0].fogColor);
  // Start fully opaque
  fog.progress = 0;
  fog.targetProgress = 0;
  fog.opacity = 1;
  fog.targetOpacity = 1;
}

// ── LENIS SMOOTH SCROLL ───────────────────────────
function initLenis() {
  lenis = new Lenis({
    lerp: 0.088,
    wheelMultiplier: 0.96,
    touchMultiplier: 1.5,
    infinite: false,
    smoothTouch: false,
  });

  lenis.on('scroll', ({ scroll }) => {
    onScroll(scroll);
  });
}

// ── RAF LOOP ──────────────────────────────────────
function startRAF() {
  function raf(time) {
    if (lenis) lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

// ─────────────────────────────────────────────────
// SCROLL HANDLER
// ─────────────────────────────────────────────────
function onScroll(scroll) {
  updateNavStyle(scroll);
  updateSVGPath(scroll);
}

function updateNavStyle(scroll) {
  const nav = document.getElementById('nav');
  nav.classList.toggle('scrolled', scroll > 60);
}

// ─────────────────────────────────────────────────
// PHASE SHIFT SYSTEM
// ─────────────────────────────────────────────────
function initPhaseShift() {
  const logo = document.getElementById('logo');
  let clickCount = 0;
  let clickTimer = null;

  logo.addEventListener('click', (e) => {
    e.preventDefault();
    clickCount++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 500);

    if (clickCount >= 3) {
      clickCount = 0;
      clearTimeout(clickTimer);
      advanceTheme();
    }
  });

  // Also allow clicking theme dots
  document.querySelectorAll('.theme-dots .dot').forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (i !== currentTheme) {
        jumpToTheme(i);
      }
    });
    dot.style.cursor = 'pointer';
  });
}

async function advanceTheme() {
  if (fog && fog.transitioning) return;
  const nextTheme = (currentTheme + 1) % THEMES.length;
  const theme = THEMES[nextTheme];

  await fog.transitionTheme(theme.fogColor, () => {
    applyTheme(nextTheme);
  });
}

async function jumpToTheme(idx) {
  if (fog && fog.transitioning) return;
  const theme = THEMES[idx];

  await fog.transitionTheme(theme.fogColor, () => {
    applyTheme(idx);
  });
}

function applyTheme(idx) {
  currentTheme = idx;
  const theme = THEMES[idx];

  document.documentElement.setAttribute('data-theme', theme.name);

  // Update all theme dot groups
  document.querySelectorAll('.theme-dots').forEach(group => {
    group.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === idx);
    });
  });

  // Update nav label
  const label = document.getElementById('nav-theme-label');
  if (label) label.textContent = theme.label.toUpperCase();

  // Toast
  showPhaseToast(`Phase ${['I', 'II', 'III', 'IV'][idx]}: ${theme.label}`);

  // Re-build OSS graph
  setTimeout(() => buildOSSGraph(), 50);
}

function showPhaseToast(msg) {
  const toast = document.getElementById('phase-toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─────────────────────────────────────────────────
// HERO WORD CYCLER
// ─────────────────────────────────────────────────
function initHeroCycler() {
  const container = document.getElementById('cycling-word');
  // Render first word
  renderWord(container, WORDS[0]);
  scheduleNextWord(container);
}

function renderWord(container, word) {
  container.innerHTML = '';
  container.classList.remove('exit');
  [...word].forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = char === ' ' ? '\u00a0' : char;
    span.style.animationDelay = `${i * 35}ms`;
    container.appendChild(span);
  });
}

function scheduleNextWord(container) {
  wordCycleTimer = setTimeout(() => {
    wordIndex = (wordIndex + 1) % WORDS.length;

    // Exit animation
    container.classList.add('exit');
    const exitDelay = 350;

    setTimeout(() => {
      renderWord(container, WORDS[wordIndex]);
    }, exitDelay);

    scheduleNextWord(container);
  }, 3000);
}

// ─────────────────────────────────────────────────
// BRAILLE PROGRESS BAR
// ─────────────────────────────────────────────────
function initBrailleBar() {
  const container = document.getElementById('braille-bar');
  container.innerHTML = '';
  for (let i = 0; i < BRAILLE_SEGS; i++) {
    const span = document.createElement('span');
    span.className = 'braille-seg';
    span.textContent = BRAILLE[0];
    container.appendChild(span);
  }
  runBrailleAnimation();
}

function runBrailleAnimation() {
  const segments = document.querySelectorAll('.braille-seg');
  if (!segments.length) return;
  let filled = 0;

  segments.forEach(s => {
    s.classList.remove('filled');
    s.textContent = BRAILLE[0];
  });

  function fillNext() {
    if (filled >= BRAILLE_SEGS) {
      brailleTimer = setTimeout(() => runBrailleAnimation(), 400);
      return;
    }
    const seg = segments[filled];
    if (seg) {
      seg.textContent = BRAILLE[BRAILLE.length - 1];
      seg.classList.add('filled');
    }
    filled++;
    brailleTimer = setTimeout(fillNext, 30);
  }

  fillNext();
}

// ─────────────────────────────────────────────────
// HOW I WORK — step visibility
// ─────────────────────────────────────────────────
function initHowSteps() {
  const steps = document.querySelectorAll('.how-step');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  }, { threshold: 0.35 });

  steps.forEach(step => observer.observe(step));
}

// ─────────────────────────────────────────────────
// MANIFESTO WORD REVEAL
// ─────────────────────────────────────────────────
function initManifestoReveal() {
  const el = document.getElementById('manifesto-text');
  if (!el) return;

  const text = el.textContent.trim();
  const words = text.split(/\s+/);
  el.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');

  const wordEls = el.querySelectorAll('.word');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        wordEls.forEach((w, i) => {
          setTimeout(() => w.classList.add('visible'), i * 60);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  observer.observe(el);
}

// ─────────────────────────────────────────────────
// PROJECT CARD REVEALS
// ─────────────────────────────────────────────────
function initRevealCards() {
  const cards = document.querySelectorAll('.project-card.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

  cards.forEach(card => observer.observe(card));
}

// ─────────────────────────────────────────────────
// SVG PATH DRAW (Everything Connects)
// ─────────────────────────────────────────────────
let pathTotalLength = 0;
let pathLabels = [];

function initSVGPath() {
  const pathEl = document.getElementById('path-draw');
  if (!pathEl) return;

  pathTotalLength = pathEl.getTotalLength();
  pathEl.style.strokeDasharray = pathTotalLength;
  pathEl.style.strokeDashoffset = pathTotalLength;

  pathLabels = document.querySelectorAll('#connects-svg .path-label');
}

function updateSVGPath(scroll) {
  const section = document.getElementById('connects');
  const pathEl = document.getElementById('path-draw');
  const dotEl = document.getElementById('path-dot');
  if (!section || !pathEl || pathTotalLength === 0) return;

  const rect = section.getBoundingClientRect();
  const viewH = window.innerHeight;
  const start = rect.top - viewH;
  const end = rect.bottom;
  const range = end - start;
  const progress = Math.max(0, Math.min(1, -start / range));

  const drawn = pathTotalLength * progress;
  pathEl.style.strokeDashoffset = pathTotalLength - drawn;

  // Move dot
  if (pathTotalLength > 0 && dotEl) {
    const pt = pathEl.getPointAtLength(Math.min(drawn, pathTotalLength - 1));
    dotEl.setAttribute('cx', pt.x);
    dotEl.setAttribute('cy', pt.y);
    dotEl.style.opacity = progress > 0.02 ? 1 : 0;
  }

  // Show labels progressively
  pathLabels.forEach((label, i) => {
    const threshold = (i + 1) / (pathLabels.length + 1);
    label.classList.toggle('visible', progress >= threshold - 0.04);
  });
}

// ─────────────────────────────────────────────────
// OSS NODE GRAPH
// ─────────────────────────────────────────────────
function initOSSGraph() {
  buildOSSGraph();
}

function buildOSSGraph() {
  const container = document.getElementById('geo-oss');
  if (!container) return;
  container.innerHTML = '';

  const W = 200, H = 160;
  const nodes = [
    { x: 50, y: 50, hub: true },
    { x: 20, y: 25 }, { x: 80, y: 25 },
    { x: 15, y: 70 }, { x: 85, y: 68 },
    { x: 50, y: 12 }, { x: 50, y: 88 },
    { x: 28, y: 50 }, { x: 72, y: 50 },
  ];

  const connections = [
    [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],
    [1,5],[2,5],[3,7],[4,8],[6,7],[6,8],
  ];

  // Draw lines first
  connections.forEach(([a, b]) => {
    const n1 = nodes[a], n2 = nodes[b];
    const line = document.createElement('div');
    line.className = 'oss-line';

    const x1 = (n1.x / 100) * W;
    const y1 = (n1.y / 100) * H;
    const x2 = (n2.x / 100) * W;
    const y2 = (n2.y / 100) * H;

    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    line.style.cssText = `left:${x1}px;top:${y1}px;width:${length}px;transform:rotate(${angle}deg);`;
    container.appendChild(line);
  });

  // Draw nodes
  nodes.forEach((n, i) => {
    const dot = document.createElement('div');
    dot.className = `oss-node${n.hub ? ' hub' : ''}`;
    dot.style.cssText = `left:${n.x}%;top:${n.y}%;`;
    if (n.hub) {
      dot.style.animation = `pulse 2s ease-in-out infinite`;
    }
    container.appendChild(dot);
  });
}

// ─────────────────────────────────────────────────
// NAV SCROLL STYLE
// ─────────────────────────────────────────────────
function initNavScroll() {
  // Handled by onScroll — but also set up smooth scroll for nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target && lenis) {
        lenis.scrollTo(target, { offset: -80 });
      }
    });
  });
}

// ─────────────────────────────────────────────────
// MANIFESTO STATS — Animated sequence
// 37 → ∞ → 1, pause, then 0 appears → morphs to 37 "friends"
// then 37^∞ exponentiation reveal
// ─────────────────────────────────────────────────
function initManifestoStats() {
  const statsContainer = document.getElementById('manifesto-stats');
  if (!statsContainer) return;

  const stats = statsContainer.querySelectorAll('.stat-animated');
  const friendsStat = statsContainer.querySelector('.stat-friends');
  const friendsNum = document.getElementById('stat-friends');
  const friendsLabel = document.getElementById('stat-friends-label');
  const expSection = document.getElementById('manifesto-exp');
  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        observer.unobserve(entry.target);
        runStatsSequence(stats, friendsStat, friendsNum, friendsLabel, expSection);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsContainer);
}

async function runStatsSequence(stats, friendsStat, friendsNum, friendsLabel, expSection) {
  // Step 1: Reveal "37 projects"
  await wait(200);
  stats[0].classList.add('visible');

  // Step 2: Reveal "∞ ideas"
  await wait(400);
  stats[1].classList.add('visible');

  // Step 3: Reveal "1 builder"
  await wait(400);
  stats[2].classList.add('visible');

  // Step 4: Pause, then "0" fades in — "not alone"
  await wait(1200);
  stats[3].classList.add('visible');

  // Step 5: After a beat, "0" morphs into "37" with "friends" label
  await wait(1800);
  friendsStat.classList.add('morphing');

  await wait(150);
  friendsNum.textContent = '37';

  await wait(450);
  friendsStat.classList.remove('morphing');
  friendsStat.classList.add('morphed');
  friendsLabel.textContent = 'friends';

  // Step 6: After friends settle, reveal the exponentiation 37^∞
  await wait(1200);
  if (expSection) {
    expSection.classList.add('visible');
  }
}
