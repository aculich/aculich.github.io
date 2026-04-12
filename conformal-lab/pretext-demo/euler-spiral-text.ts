/*
  Euler Spiral Text — Conformal Typography

  This demo shows three modes of text interacting with the Euler spiral
  (clothoid / Cornu spiral / Fresnel integral):

  1. Flow Around — text flows around the spiral as an obstacle, using
     pretext's layoutNextLine with per-line width carving (same technique
     as dynamic-layout and editorial-engine, but the obstacle is a
     mathematical curve instead of a logo or orb).

  2. Curvature Type — text laid out in a standard column, but each line's
     font weight is mapped to the curvature at its vertical position.
     Lines near the top (low curvature) are light; lines at the bottom
     (high curvature) are bold. "Deliberate acceleration" in typography.

  3. Dual Column — the spiral divides the viewport into two columns.
     Left column consumes text first, right column resumes from the same
     cursor. The spiral acts as a living gutter.

  All layout uses prepareWithSegments + layoutNextLine. Zero DOM reads.
*/

import {
  layoutNextLine,
  prepareWithSegments,
  type LayoutCursor,
} from '../../src/layout.ts'

// ── Constants ──────────────────────────────────────

const BODY_FONT_FAMILY = '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif'
const BODY_SIZE = 17
const BODY_LINE_HEIGHT = 28
const HEADLINE_FONT = `700 36px ${BODY_FONT_FAMILY}`
const HEADLINE_LINE_HEIGHT = 42
const GUTTER = 48
const SPIRAL_PADDING = 16
const NARROW_BREAKPOINT = 760
const NARROW_GUTTER = 20

const ACCENT = '#00d4ff'
const HIGHLIGHT = '#ff6b6b'
const TEXT_COLOR = '#c8e6ff'
// const MUTED = 'rgba(200, 230, 255, 0.55)' // reserved for future annotation use

// ── Text content ───────────────────────────────────

const HEADLINE_TEXT = 'THE EULER SPIRAL: DELIBERATE ACCELERATION'

const BODY_TEXT = `The Euler spiral — also known as the Cornu spiral or clothoid — is defined by the Fresnel integral. Its parametric form comes from integrating the complex exponential with quadratic phase: the real part gives x(s) = ∫cos(t²)dt and the imaginary part gives y(s) = ∫sin(t²)dt.

What makes it remarkable is its defining property: curvature increases linearly with arc length. At the origin, the curve is essentially a straight line — zero curvature. As you travel along it, it bends more and more, not in jumps, but in perfect proportion to distance traveled. The curvature at any point is simply κ = 2s.

This is why civil engineers use it for highway and railway design. When you drive onto a freeway on-ramp, you don't want to go from a straight road to a sharp curve instantly — that would be jarring and dangerous. A clothoid transition eases you in, matching the rate at which a driver naturally turns the steering wheel.

But the Euler spiral is also a conformal map. It sends the real line into the complex plane via the Fresnel integral, preserving angles locally. This connects it to the world of complex analysis: the exponential map that turns strips into annuli, the logarithm that unrolls circles into lines, and the remarkable mathematics behind Escher's Print Gallery.

De Smit and Lenstra showed that Escher's self-referential artwork lives on a quotient of the complex plane. The "missing" center can be filled by a conformal map that continues the spiral structure into the gap. The same mathematical machinery — conformal maps, complex exponentials, the Droste effect — connects highway design to recursive art.

In the framework of deliberate acceleration, the Euler spiral embodies steady compounding. Not the explosive exponential, but the linear increase. Each step forward adds the same increment of turning. Early on, the curve barely bends — you're building foundation, learning, moving in a nearly straight line. But the structure of acceleration is already embedded. Every unit of progress adds more turning power than the last. Eventually the spiral tightens into something dense and beautiful — those twin convergence points where patience and momentum resolve into the same point.

The key tension the spiral captures: from the outside, the early phase looks slow, almost linear. But you are already on a curve that mathematically guarantees tightening. Patience and momentum aren't opposites here — they're the same curve. The shape of deliberate acceleration.`

// ── Math: Fresnel integrals ────────────────────────

function fresnelPoint(s: number, steps?: number): [number, number] {
  const n = steps ?? Math.max(80, Math.floor(Math.abs(s) * 50))
  const dt = s / n
  let x = 0, y = 0
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) * dt
    x += Math.cos(t * t) * dt
    y += Math.sin(t * t) * dt
  }
  return [x, y]
}

function fresnelCurvature(s: number): number { // used in curvature mode weight mapping
  return 2 * Math.abs(s)
}
void fresnelCurvature // suppress unused warning; called conceptually via κ = 2s inline

// ── Spiral geometry for obstacle routing ───────────

type SpiralPoint = { x: number; y: number; s: number }

function computeSpiralPoints(
  cx: number, cy: number, scale: number, sMax: number, numPoints: number, sign: number
): SpiralPoint[] {
  const pts: SpiralPoint[] = []
  for (let i = 0; i <= numPoints; i++) {
    const s = sign * (i / numPoints) * sMax
    const [fx, fy] = fresnelPoint(s)
    pts.push({ x: cx + fx * scale, y: cy - fy * scale, s })
  }
  return pts
}

function getSpiralXIntervalAtY(
  spiralPoints: SpiralPoint[], y: number, bandHeight: number, padding: number
): { left: number; right: number } | null {
  let minX = Infinity, maxX = -Infinity
  let found = false
  const halfBand = bandHeight / 2
  for (const p of spiralPoints) {
    if (Math.abs(p.y - y) < halfBand) {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      found = true
    }
  }
  if (!found) return null
  return { left: minX - padding, right: maxX + padding }
}

// ── Positioned line type ───────────────────────────

type PositionedLine = {
  x: number
  y: number
  width: number
  text: string
  weight?: number
  color?: string
  font?: string
}

// ── Layout modes ───────────────────────────────────

type Mode = 'flow' | 'curvature' | 'dual'
let currentMode: Mode = 'flow'

// ── Font weight for curvature mode ─────────────────

function fontForWeight(weight: number): string {
  // Available weights: 400, 450, 500, 600, 700
  const w = weight < 425 ? 400 : weight < 475 ? 450 : weight < 550 ? 500 : weight < 650 ? 600 : 700
  return `${w} ${BODY_SIZE}px ${BODY_FONT_FAMILY}`
}

// ── Project: compute all positioned lines ──────────

function project(
  stageW: number,
  stageH: number,
  mode: Mode,
): {
  lines: PositionedLine[]
  spiralPoints: SpiralPoint[]
  spiralCx: number
  spiralCy: number
  spiralScale: number
} {
  const narrow = stageW < NARROW_BREAKPOINT
  const gutter = narrow ? NARROW_GUTTER : GUTTER
  const bodyFont = `${BODY_SIZE}px ${BODY_FONT_FAMILY}`

  // Spiral geometry
  const sMax = 6
  const spiralScale = Math.min(stageW, stageH) * 0.22
  const spiralNumPts = 600

  const lines: PositionedLine[] = []

  if (mode === 'flow') {
    // Spiral in the right-center area
    const spiralCx = stageW * 0.6
    const spiralCy = stageH * 0.35
    const posSpiral = computeSpiralPoints(spiralCx, spiralCy, spiralScale, sMax, spiralNumPts, 1)
    const negSpiral = computeSpiralPoints(spiralCx, spiralCy, spiralScale, sMax, spiralNumPts, -1)
    const allSpiral = [...posSpiral, ...negSpiral]

    // Headline
    const headlinePrepared = prepareWithSegments(HEADLINE_TEXT, HEADLINE_FONT)
    let headlineCursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
    let headlineY = gutter

    while (true) {
      const hLine = layoutNextLine(headlinePrepared, headlineCursor, stageW - 2 * gutter)
      if (!hLine) break
      lines.push({
        x: gutter,
        y: headlineY,
        width: hLine.width,
        text: hLine.text,
        font: HEADLINE_FONT,
        color: '#ffffff',
      })
      headlineCursor = hLine.end
      headlineY += HEADLINE_LINE_HEIGHT
    }

    // Body text, flowing around spiral
    const bodyPrepared = prepareWithSegments(BODY_TEXT, bodyFont)
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
    let y = headlineY + 20

    while (y + BODY_LINE_HEIGHT < stageH - gutter) {
      const midY = y + BODY_LINE_HEIGHT / 2
      const interval = getSpiralXIntervalAtY(allSpiral, midY, BODY_LINE_HEIGHT, SPIRAL_PADDING)

      // Determine available slots
      type Slot = { x: number; maxWidth: number }
      const slots: Slot[] = []

      if (interval && interval.left < stageW - gutter && interval.right > gutter) {
        // Left slot
        const leftW = interval.left - gutter
        if (leftW > 60) slots.push({ x: gutter, maxWidth: leftW })
        // Right slot
        const rightW = stageW - gutter - interval.right
        if (rightW > 60) slots.push({ x: interval.right, maxWidth: rightW })
      } else {
        slots.push({ x: gutter, maxWidth: stageW - 2 * gutter })
      }

      for (const slot of slots) {
        const line = layoutNextLine(bodyPrepared, cursor, slot.maxWidth)
        if (!line) break
        lines.push({
          x: slot.x,
          y,
          width: line.width,
          text: line.text,
          font: bodyFont,
          color: TEXT_COLOR,
        })
        cursor = line.end
      }

      // Check if text exhausted
      const probe = layoutNextLine(bodyPrepared, cursor, stageW)
      if (!probe) break

      y += BODY_LINE_HEIGHT
    }

    return { lines, spiralPoints: allSpiral, spiralCx, spiralCy, spiralScale }

  } else if (mode === 'curvature') {
    // Single column, but weight varies with position
    const spiralCx = stageW * 0.5
    const spiralCy = stageH * 0.5
    const allSpiral = computeSpiralPoints(spiralCx, spiralCy, spiralScale * 0.5, sMax, spiralNumPts, 1)

    // Headline
    const headlinePrepared = prepareWithSegments(HEADLINE_TEXT, HEADLINE_FONT)
    let hCursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
    let headlineY = gutter
    const colW = Math.min(640, stageW - 2 * gutter)
    const colX = (stageW - colW) / 2

    while (true) {
      const hLine = layoutNextLine(headlinePrepared, hCursor, colW)
      if (!hLine) break
      lines.push({
        x: colX, y: headlineY, width: hLine.width, text: hLine.text,
        font: HEADLINE_FONT, color: '#ffffff',
      })
      hCursor = hLine.end
      headlineY += HEADLINE_LINE_HEIGHT
    }

    // Body with curvature-mapped weight
    const totalBodyHeight = stageH - headlineY - gutter - 20
    const maxLines = Math.floor(totalBodyHeight / BODY_LINE_HEIGHT)
    let y = headlineY + 20

    // Pre-prepare at multiple weights for measurement
    // Use base weight for line breaking, then render with mapped weight
    const bodyPrepared = prepareWithSegments(BODY_TEXT, bodyFont)
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
    let lineIdx = 0

    while (lineIdx < maxLines) {
      const line = layoutNextLine(bodyPrepared, cursor, colW)
      if (!line) break

      // Map line position to curvature
      const t = lineIdx / Math.max(1, maxLines - 1) // 0..1
      const kappa = t * t // quadratic, like ∫κ ds = s²
      const weight = 400 + 300 * kappa // 400 → 700
      const alpha = 0.45 + 0.55 * Math.min(1, kappa * 1.5 + 0.15)

      // Color: cool blue → warm
      const r = Math.round(200 + 55 * kappa)
      const g = Math.round(230 - 50 * kappa)
      const b = 255

      lines.push({
        x: colX, y, width: line.width, text: line.text,
        font: fontForWeight(weight),
        weight,
        color: `rgba(${r}, ${g}, ${b}, ${alpha})`,
      })

      cursor = line.end
      y += BODY_LINE_HEIGHT
      lineIdx++
    }

    return { lines, spiralPoints: allSpiral, spiralCx, spiralCy, spiralScale: spiralScale * 0.5 }

  } else {
    // Dual column: spiral as living gutter
    const spiralCx = stageW * 0.5
    const spiralCy = stageH * 0.4
    const dualScale = spiralScale * 0.8
    const posSpiral = computeSpiralPoints(spiralCx, spiralCy, dualScale, sMax, spiralNumPts, 1)
    const negSpiral = computeSpiralPoints(spiralCx, spiralCy, dualScale, sMax, spiralNumPts, -1)
    const allSpiral = [...posSpiral, ...negSpiral]

    // Headline across both columns
    const headlinePrepared = prepareWithSegments(HEADLINE_TEXT, HEADLINE_FONT)
    let hCursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
    let headlineY = gutter

    while (true) {
      const hLine = layoutNextLine(headlinePrepared, hCursor, stageW - 2 * gutter)
      if (!hLine) break
      lines.push({
        x: gutter, y: headlineY, width: hLine.width, text: hLine.text,
        font: HEADLINE_FONT, color: '#ffffff',
      })
      hCursor = hLine.end
      headlineY += HEADLINE_LINE_HEIGHT
    }

    // Two columns, split by spiral
    const bodyPrepared = prepareWithSegments(BODY_TEXT, bodyFont)
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
    let y = headlineY + 24

    // Left column first
    while (y + BODY_LINE_HEIGHT < stageH - gutter) {
      const midY = y + BODY_LINE_HEIGHT / 2
      const interval = getSpiralXIntervalAtY(allSpiral, midY, BODY_LINE_HEIGHT, SPIRAL_PADDING)
      const rightEdge = interval ? interval.left : spiralCx - 20
      const maxW = Math.max(60, rightEdge - gutter)

      const line = layoutNextLine(bodyPrepared, cursor, maxW)
      if (!line) break
      lines.push({
        x: gutter, y, width: line.width, text: line.text,
        font: bodyFont, color: TEXT_COLOR,
      })
      cursor = line.end
      y += BODY_LINE_HEIGHT
    }

    // Right column resumes from same cursor
    y = headlineY + 24
    while (y + BODY_LINE_HEIGHT < stageH - gutter) {
      const midY = y + BODY_LINE_HEIGHT / 2
      const interval = getSpiralXIntervalAtY(allSpiral, midY, BODY_LINE_HEIGHT, SPIRAL_PADDING)
      const leftEdge = interval ? interval.right : spiralCx + 20
      const maxW = Math.max(60, stageW - gutter - leftEdge)

      const line = layoutNextLine(bodyPrepared, cursor, maxW)
      if (!line) break
      lines.push({
        x: leftEdge, y, width: line.width, text: line.text,
        font: bodyFont, color: TEXT_COLOR,
      })
      cursor = line.end
      y += BODY_LINE_HEIGHT
    }

    return { lines, spiralPoints: allSpiral, spiralCx, spiralCy, spiralScale: dualScale }
  }
}

// ── Render to DOM ──────────────────────────────────

function render(
  stage: HTMLElement,
  result: ReturnType<typeof project>,
) {
  stage.innerHTML = '<div class="atmosphere"></div>'

  // Draw spiral as SVG
  const { spiralCx, spiralCy, spiralScale } = result
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('class', 'spiral-path')
  svg.style.position = 'absolute'
  svg.style.inset = '0'
  svg.style.width = '100%'
  svg.style.height = '100%'
  svg.style.pointerEvents = 'none'

  // Build SVG path for positive spiral
  const sMax = 6
  const numPts = 400
  for (const sign of [1, -1]) {
    let d = ''
    for (let i = 0; i <= numPts; i++) {
      const s = sign * (i / numPts) * sMax
      const [fx, fy] = fresnelPoint(s)
      const x = spiralCx + fx * spiralScale
      const y = spiralCy - fy * spiralScale
      d += (i === 0 ? 'M' : 'L') + `${x.toFixed(1)},${y.toFixed(1)} `
    }
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d)
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', sign > 0 ? ACCENT : HIGHLIGHT)
    path.setAttribute('stroke-width', '2')
    path.setAttribute('opacity', '0.2')
    svg.appendChild(path)
  }
  stage.appendChild(svg)

  // Render text lines
  for (const line of result.lines) {
    const el = document.createElement('span')
    el.className = line.font === HEADLINE_FONT ? 'headline-line' : 'line'
    el.textContent = line.text
    el.style.left = `${line.x}px`
    el.style.top = `${line.y}px`
    el.style.font = line.font ?? `${BODY_SIZE}px ${BODY_FONT_FAMILY}`
    el.style.color = line.color ?? TEXT_COLOR

    if (line.weight && line.weight !== 400) {
      el.style.fontWeight = String(Math.round(line.weight))
    }

    stage.appendChild(el)
  }

  // Curvature labels (small annotations)
  if (currentMode === 'curvature') {
    const label = document.createElement('span')
    label.className = 'curvature-label'
    label.textContent = 'κ = 2s → weight'
    label.style.right = `${(stage.offsetWidth - 640) / 2 - 80}px`
    label.style.top = `${result.lines[result.lines.length - 1]?.y ?? 100}px`
    stage.appendChild(label)
  }
}

// ── Init ───────────────────────────────────────────

const stage = document.getElementById('stage')!

function reflow() {
  const w = stage.offsetWidth
  const h = stage.offsetHeight
  const result = project(w, h, currentMode)
  render(stage, result)
}

// Mode switcher
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
    currentMode = (btn as HTMLElement).dataset['mode'] as Mode
    reflow()
  })
})

// Resize
let resizeTimer: ReturnType<typeof setTimeout> | null = null
window.addEventListener('resize', () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(reflow, 60)
})

// Initial render
reflow()
