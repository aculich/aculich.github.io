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
const CO_WORDS = ['Co‑Build', 'Co‑Research', 'Co‑Create', 'Co‑Design', 'Co‑Ship', 'Co‑Explore', 'Co‑Automate', 'Co‑Connect'];
let wordIndex = 0;
let wordCycleTimer = null;
let cycleCount = 0;
const TRANSITION_AT = 1; // After this many full cycles, start I→We transition
let pronounTransitioned = false;

// ── BRAILLE CHARS ─────────────────────────────────
const BRAILLE = ['⠀', '⠄', '⠆', '⠇', '⠧', '⠷', '⠿'];
const BRAILLE_SEGS = 28;
let brailleTimer = null;

// ── MISCHIEF CONFIG ───────────────────────────────
const MISCHIEF = {
  dwellMin: 2800,       // Minimum hover time before it *might* trigger (ms)
  dwellMax: 6000,       // Max additional random delay on top of min
  cooldownMin: 12000,   // Min cooldown between quadrant shifts
  cooldownMax: 25000,   // Max additional random cooldown
  shuffleEvery: 3,      // Re-shuffle quadrant→theme map every N triggers
  jitterRadius: 0.08,   // How much the quadrant boundaries wobble (0-0.15)
  reluctance: 0.35,     // Probability of *refusing* to shift even when conditions are met
};

let mischiefState = {
  quadrantMap: [0, 1, 2, 3],  // Which quadrant maps to which theme — gets shuffled
  lastShift: 0,               // Timestamp of last quadrant-triggered shift
  triggerCount: 0,             // How many quadrant shifts have occurred
  currentQuadrant: -1,         // Which quadrant the mouse is in
  dwellStart: 0,               // When mouse entered current quadrant
  dwellTimer: null,            // Timer for the delayed trigger
  cooldownUntil: 0,            // Don't trigger until this timestamp
  jitterOffsetX: 0,            // Current boundary jitter
  jitterOffsetY: 0,
  isActive: true,              // Mischief can be paused
  cursorHint: false,           // Whether we've shown the subtle cursor hint
};

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
  initScrollWhispers();
  initRevealCards();
  initSVGPath();
  initOSSGraph();
  initNavScroll();
  initMischief();
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
  updateHeroPhase(scroll);
}

function updateHeroPhase(scroll) {
  const threshold = window.innerHeight * 0.35;
  const iPhase = document.querySelector('.hero-i-phase');
  const wePhase = document.querySelector('.hero-we-phase');
  const tagline = document.getElementById('hero-tagline');

  if (!iPhase || !wePhase) return;

  if (scroll > threshold) {
    iPhase.classList.add('is-hidden');
    wePhase.classList.add('is-visible');
    if (tagline) tagline.textContent = '37 projects. Never alone.';
  } else {
    iPhase.classList.remove('is-hidden');
    wePhase.classList.remove('is-visible');
    if (tagline) tagline.textContent = '37 projects. One builder.';
  }
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

function triggerPronounTransition() {
  if (pronounTransitioned) return;
  pronounTransitioned = true;

  const wordI = document.getElementById('word-i');
  const wordWe = document.getElementById('word-we-emerge');

  if (!wordI || !wordWe) return;

  // Step 1: Strikethrough the "I"
  wordI.classList.add('striking');

  // Step 2: After strike completes, show "We" and fade "I"
  setTimeout(() => {
    wordWe.classList.add('visible');
    wordI.classList.add('fading');
  }, 700);

  // Step 3: After "I" fully fades, remove it from flow
  setTimeout(() => {
    wordI.style.width = '0';
    wordI.style.overflow = 'hidden';
    wordI.style.margin = '0';
    wordI.style.padding = '0';
    // Make "We" position relative now that I is gone
    wordWe.style.position = 'relative';
  }, 2000);
}

function scheduleNextWord(container) {
  wordCycleTimer = setTimeout(() => {
    wordIndex = (wordIndex + 1) % WORDS.length;

    // Track full cycles
    if (wordIndex === 0) cycleCount++;

    // Determine which word list to use
    const useCoWords = cycleCount >= TRANSITION_AT;
    const currentWords = useCoWords ? CO_WORDS : WORDS;

    // Trigger the I→We transition at the moment we switch to Co-words
    if (useCoWords && !pronounTransitioned) {
      triggerPronounTransition();
    }

    // Exit animation
    container.classList.add('exit');
    const exitDelay = 350;

    setTimeout(() => {
      renderWord(container, currentWords[wordIndex]);
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
// MISCHIEVOUS QUADRANT HOVER
// The page watches where your mouse lingers.
// If you dwell in one quadrant long enough, it
// *might* decide to shift the theme. But not always.
// And the mapping between quadrants and themes
// shuffles periodically, so you can't memorize it.
// ─────────────────────────────────────────────────
function initMischief() {
  // Shuffle the initial quadrant map
  shuffleQuadrantMap();
  // Randomize initial boundary jitter
  wobbleBoundaries();

  document.addEventListener('mousemove', onMischiefMove);
  document.addEventListener('mouseleave', onMischiefLeave);
}

function shuffleQuadrantMap() {
  // Fisher-Yates shuffle
  const arr = [0, 1, 2, 3];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  mischiefState.quadrantMap = arr;
}

function wobbleBoundaries() {
  const jr = MISCHIEF.jitterRadius;
  mischiefState.jitterOffsetX = (Math.random() - 0.5) * 2 * jr;
  mischiefState.jitterOffsetY = (Math.random() - 0.5) * 2 * jr;
}

function getQuadrant(clientX, clientY) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Boundaries wobble slightly so the quadrants aren't perfectly centered
  const cx = (0.5 + mischiefState.jitterOffsetX) * vw;
  const cy = (0.5 + mischiefState.jitterOffsetY) * vh;
  
  if (clientX < cx && clientY < cy) return 0; // top-left
  if (clientX >= cx && clientY < cy) return 1; // top-right
  if (clientX < cx && clientY >= cy) return 2; // bottom-left
  return 3; // bottom-right
}

function onMischiefMove(e) {
  if (!mischiefState.isActive) return;
  if (fog && fog.transitioning) return;
  
  const quadrant = getQuadrant(e.clientX, e.clientY);
  
  if (quadrant !== mischiefState.currentQuadrant) {
    // Entered a new quadrant — reset dwell
    mischiefState.currentQuadrant = quadrant;
    mischiefState.dwellStart = Date.now();
    clearTimeout(mischiefState.dwellTimer);
    
    // Set a new timer with randomized delay
    const delay = MISCHIEF.dwellMin + Math.random() * MISCHIEF.dwellMax;
    mischiefState.dwellTimer = setTimeout(() => {
      attemptMischiefShift(quadrant);
    }, delay);
  }
}

function onMischiefLeave() {
  mischiefState.currentQuadrant = -1;
  clearTimeout(mischiefState.dwellTimer);
}

function attemptMischiefShift(quadrant) {
  const now = Date.now();
  
  // Check cooldown
  if (now < mischiefState.cooldownUntil) return;
  
  // Check if still in same quadrant
  if (quadrant !== mischiefState.currentQuadrant) return;
  
  // Check if fog is busy
  if (fog && fog.transitioning) return;
  
  // Roll for reluctance — sometimes it just refuses
  if (Math.random() < MISCHIEF.reluctance) {
    // Refused! But give a tiny visual hint that something *almost* happened
    showMischiefGhost();
    // Try again with a shorter delay
    mischiefState.dwellTimer = setTimeout(() => {
      attemptMischiefShift(quadrant);
    }, 1500 + Math.random() * 2000);
    return;
  }
  
  // Determine target theme from quadrant map
  const targetTheme = mischiefState.quadrantMap[quadrant];
  
  // Don't shift to the same theme
  if (targetTheme === currentTheme) {
    // Wobble the boundaries and try a different mapping next time
    wobbleBoundaries();
    return;
  }
  
  // Execute the shift!
  mischiefState.triggerCount++;
  mischiefState.lastShift = now;
  
  // Set cooldown
  const cooldown = MISCHIEF.cooldownMin + Math.random() * MISCHIEF.cooldownMax;
  mischiefState.cooldownUntil = now + cooldown;
  
  // Every N triggers, reshuffle the map so they can't predict it
  if (mischiefState.triggerCount % MISCHIEF.shuffleEvery === 0) {
    shuffleQuadrantMap();
    wobbleBoundaries();
  }
  
  // Shift with a playful toast
  jumpToTheme(targetTheme);
  showMischiefToast();
}

function showMischiefGhost() {
  // A barely-perceptible flicker — the page almost shifted but changed its mind
  const ghost = document.getElementById('mischief-ghost');
  if (!ghost) return;
  ghost.classList.add('flicker');
  setTimeout(() => ghost.classList.remove('flicker'), 600);
}

function showMischiefToast() {
  const phrases = [
    'Did the light just change?',
    'Hmm.',
    'You lingered.',
    'Phase drift detected.',
    'The page noticed you.',
    'Curious, isn\'t it?',
    '…was that you?',
    'Something shifted.',
    'Pay attention.',
    'Not everything stays.',
  ];
  const msg = phrases[Math.floor(Math.random() * phrases.length)];
  showPhaseToast(msg);
}

// ─────────────────────────────────────────────────
// MANIFESTO STATS — Animated sequence
// ∞ ideas → 1 builder → 0 alone → then 37^∞ reveal
// ─────────────────────────────────────────────────
function initManifestoStats() {
  const statsContainer = document.getElementById('manifesto-stats');
  if (!statsContainer) return;

  const stats = statsContainer.querySelectorAll('.stat-animated');
  const expSection = document.getElementById('manifesto-exp');
  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        observer.unobserve(entry.target);
        runStatsSequence(stats, expSection);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsContainer);
}

async function runStatsSequence(stats, expSection) {
  // Step 1: Reveal "∞ ideas"
  await wait(300);
  if (stats[0]) stats[0].classList.add('visible');

  // Step 2: Reveal "1 builder"
  await wait(500);
  if (stats[1]) stats[1].classList.add('visible');

  // Step 3: Reveal "0 alone" — a beat of stillness
  await wait(800);
  if (stats[2]) stats[2].classList.add('visible');

  // Step 4: After a longer pause, reveal the exponentiation 37^∞
  await wait(1500);
  if (expSection) {
    expSection.classList.add('visible');
  }
}

// ─────────────────────────────────────────────────
// SCROLL WHISPERS — manifesto fragments
// ─────────────────────────────────────────────────
function initScrollWhispers() {
  const whispers = document.querySelectorAll('.scroll-whisper');
  if (!whispers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.4, rootMargin: '0px 0px -60px 0px' });

  whispers.forEach(w => observer.observe(w));
}
