# 37∞ Conformal Lab — Session Notebook

*A record of the exploration, ideas, and explanations from the session that produced these visualizations. Captures the thinking between the code — the mathematical connections, the metaphorical readings, and the design rationale.*

---

## The Euler Spiral & Deliberate Acceleration

### What is the Euler Spiral?

The **Euler Spiral** (also called the *Cornu spiral* or *clothoid*) is a remarkable mathematical curve defined by the Fresnel integrals. Its parametric form comes from the integral:

```
∫₀ˢ e^(it²) dt
```

The real part gives `x(s) = ∫₀ˢ cos(t²) dt`, and the imaginary part gives `y(s) = ∫₀ˢ sin(t²) dt`. What makes it special is its defining property: **curvature increases linearly with arc length**. At the origin, the curve is essentially a straight line (zero curvature). As you travel along it, it bends more and more — not in jumps, but in perfect proportion to distance traveled.

This is why civil engineers actually use it for highway and railway design. When you drive onto a freeway on-ramp, you don't want to go from straight road to a sharp curve instantly — that would be jarring and dangerous. A clothoid transition eases you in, matching the rate at which a driver naturally turns the steering wheel.

### What "Deliberate Acceleration" Means as a Metaphor

"Deliberate Acceleration" takes the Euler spiral's geometric property and turns it into a philosophy. The idea is: meaningful acceleration isn't about starting fast — it's about starting with intention and letting the rate of change compound naturally. Early on, the curve barely bends. You're building foundation, learning, moving in a nearly straight line. But because the curvature is *always increasing*, each unit of progress adds more turning power than the last. Eventually the spiral tightens into something dense and beautiful — those twin convergence points at `(√(π/2)/2, √(π/2)/2)` and its mirror.

The key tension it captures: from the outside, the early phase looks slow, almost linear. But the structure of acceleration is already embedded. You're not waiting to speed up — you're on a curve that *mathematically guarantees* tightening. Patience and momentum aren't opposites here; they're the same curve.

---

## Visualizations Created

### 1. The Euler Spiral: Deliberate Acceleration (`euler-spiral-visualizations.html`)

A single scrollable page with five sections:

- **Hero** — an animated drawing of the full Euler spiral, starting from the origin and progressively tracing both halves as they tighten toward the two convergence points. The glow at the tips follows the curve as it builds.

- **Technical: Fresnel Integrals** — a graph of C(s) and S(s), the two component functions that form the spiral's x and y coordinates. You can toggle between showing both, just the cosine integral, or just the sine integral. Notice how they oscillate with decreasing amplitude, both converging toward ½.

- **Curvature comparison** — plots the Euler spiral's curvature (κ = 2s, a straight line) against a circle's constant curvature and a logarithmic spiral's exponential curvature. This is the heart of the "deliberate" part: the acceleration is steady and linear, not explosive.

- **Artistic renderings** — four different visual styles you can switch between. "Luminous" layers translucent copies with color gradients. "Ribbons" weaves oscillating parallel curves. "Particles" scatters glowing dots along the path, growing denser and brighter as curvature increases. "Bloom" rotates twelve copies of the spiral into a flower-like mandala.

- **Growth metaphor** — the final diagram maps the *cumulative turning* (s²) against steps taken, making the parabolic nature of the acceleration visible. The left side is labeled "feels slow" and the right side "momentum visible" — the same curve, just further along.

---

## Conformal Maps & Escher's Print Gallery

### The Mathematical Thread

The Euler spiral is `∫e^(it²)dt` — the integrand is a conformal map (the complex exponential with quadratic phase). Escher's Print Gallery is built from the complex exponential `e^z` mapping strips to annuli. The Droste effect is the periodicity of `log(z)`. All of these are conformal maps on the complex plane, all preserve local shape while transforming global structure, and all exhibit the same deep property: *structure-preserving transformation*. That's what connects "deliberate acceleration" to Escher's recursive gallery — they're both about how local faithfulness creates global beauty.

### What "Conformal" Means

A conformal map is a function `f: C → C` where `f'(z) ≠ 0` — angles are preserved locally. Tiny squares stay approximately square under the transformation, even though the overall picture may warp dramatically. This is why Escher's grid in Print Gallery looks locally regular even though the global composition is wildly spiraling.

### The 3Blue1Brown Connection

3Blue1Brown's videos on Escher's Print Gallery explain how the artwork can be recreated with complex analysis:

- **Conformal maps** from complex analysis preserve local shape — explaining Escher's visual coherence at small scales
- The **complex exponential** `e^z` turns horizontal strips into concentric annuli
- The **complex logarithm** `log(z)` unrolls circles back into lines, revealing periodicity
- **De Smit and Lenstra** showed the distortion in Print Gallery can be described by a complex exponential function, and that the "missing" center can be filled by continuing the conformal structure
- The **Droste effect** — an image embedded within itself — lives on `C*/⟨256z⟩`, a quotient of the complex plane
- The key insight: `log` and `exp` transform between multiplicative (circular/spiral) and additive (linear/periodic) worlds

### The Escher Print Gallery Shader

Laszlo Korte's interactive WebGL implementation transforms cartesian coordinates to polar space, applies rotation, then transforms back to create seamless spiraling recursion. Key parameters:
- `escherAngle` and `escherScale` control the conformal mapping
- Toggle between log-coordinate and Cartesian modes
- Concentric circles become horizontal lines in polar space, allowing image tiling to be unwrapped into rows
- Rotating diagonally in polar space breaks the row separation, creating the spiral when transformed back

---

## Conformal Lab (`conformal-lab.html`)

### Design Rationale

Six interconnected sections, each bridging artistic play and formal math:

1. **Hero — Euler Spiral with Conformal Warp.** The full double-sided Euler spiral overlaid on a faint coordinate grid. Moving your mouse warps the field conformally — you can feel how the spiral's local character (curvature increasing with arc length) is preserved even as the global shape bends. Core intuition: conformal means "locally faithful."

2. **What Conformal Means — Interactive Grid Transforms.** A square grid put through six different conformal maps: identity, e^z, log(z), 1/z, z², and the Euler spiral itself. The transition between maps is animated with cubic easing. The critical thing to notice: at each grid intersection, the lines still cross at 90° — that's conformality.

3. **The Droste Spiral.** The Escher/de Smit/Lenstra connection. Concentric circles and radial spokes get rotated in log-polar space, which is exactly what the complex logarithm does. The "spiral" slider controls the angle parameter that creates the Droste effect — as you increase it, the grid of circles and lines twists into Escher's characteristic looping self-reference. The nested rectangles at center represent the gallery-within-a-gallery recursion.

4. **Euler Spiral + Conformal Compositions.** This is where the playful and the formal reconnect. You can compose the Euler spiral with different conformal maps:
   - `exp ∘ Euler` sends the spiral's convergence points to infinity, creating a blooming flower
   - `1/z ∘ Euler` inverts the whole thing
   - `Droste ∘ Euler` applies the Print Gallery's log-spiral warp to the Euler spiral itself, creating a curve that accelerates deliberately *and* recurses

5. **The Acceleration Field.** Instead of one spiral, every point on a grid sprouts its own Euler spiral, oriented by its position. The "warp" slider smoothly applies e^z to the entire field — watch how each local spiral distorts globally while keeping its essential character. This is the "deliberate acceleration" metaphor made spatial.

6. **The Conformal Rosetta.** Six cards bridging back to the existing Lab concepts:
   - **Euler Spiral ↔ Homotopy**: The spiral is a homotopy between a straight line (s=0) and a circle (s→∞)
   - **Conformal Map ↔ Morphism**: A conformal map is a morphism in the category of Riemann surfaces
   - **Droste Effect ↔ Fixed Point**: Self-similarity as a fixed point of the scaling map
   - **exp(z) ↔ Cobordism**: The exponential maps strips to annuli — a cobordism between additive and multiplicative geometry
   - **log(z) ↔ Boundary**: The logarithm reveals where the smooth world breaks down (at z=0)
   - **Composition ↔ Braid**: Composing conformal maps doesn't always commute — order matters, like braid crossings

---

## Pretext: What It Is and Why It Matters Here

### Core Idea

[Pretext](https://github.com/chenglou/pretext) is a pure JavaScript/TypeScript library for multiline text measurement and layout. It side-steps the need for DOM measurements (`getBoundingClientRect`, `offsetHeight`), which trigger layout reflow — one of the most expensive operations in the browser. Instead, it implements its own text measurement logic using the browser's font engine as ground truth via Canvas `measureText()`.

**Two-phase architecture:**
1. **`prepare()`** — one-time work: normalize whitespace, segment text, apply glue rules, measure segments with canvas, return an opaque handle
2. **`layout()`** — the cheap hot path: pure arithmetic over cached widths. No DOM reads, no canvas calls, no string work

### Why This Connects to Conformal Typography

Pretext's demos already show text flowing around obstacles (rotating logos, draggable orbs) using per-line obstacle carving. The connection to conformal/Euler spiral work is almost too perfect:

1. **Text on the spiral** — pretext's per-character positioning places glyphs along the Euler spiral path, with each character rotated to the local tangent. The text *literally* accelerates as curvature increases.

2. **Typographic curvature mapping** — like the variable-typographic-ascii demo maps brightness→weight, we can map *curvature*→weight. Characters tighten as the spiral tightens.

3. **Conformal text grids** — a grid of text blocks that deform under e^z, log(z), 1/z — the text reflows within each warped cell.

4. **Droste text recursion** — text that contains a smaller version of itself, spiraling inward, with each level re-measured for available width.

5. **Euler spiral as obstacle** — text flowing around the spiral curve itself, using pretext's `carveTextLineSlots()` geometry.

### Key Pretext APIs Used

- **`prepareWithSegments(text, font)`** — segments text and caches widths
- **`layoutNextLine(prepared, cursor, maxWidth)`** — streams one line at a time with cursor continuation
- **`walkLineRanges(prepared, maxWidth, callback)`** — walks all lines without materializing strings
- **`LayoutCursor`** — segment/grapheme cursor enabling mid-text resumption between columns

### Key Pretext Demos That Informed Our Work

- **Dynamic Layout** — text flowing around rotatable SVG logos using polygon hull extraction and per-line obstacle carving
- **Editorial Engine** — animated orbs as draggable obstacles, multi-column flow with pull quotes, zero DOM measurements
- **Variable Typographic ASCII** — particle-driven brightness field mapped to font weight/style per character
- **Bubbles** — binary search for minimum width maintaining line count (shrinkwrap)

---

## Conformal Text (`conformal-text.html`)

### Five Sections

1. **Text on the Euler Spiral** — characters placed at their Fresnel integral coordinates, rotated to the tangent at each point. Font weight maps to curvature: light at the origin (κ≈0), bold at convergence (κ=2s). Both halves of the spiral carry text — the positive side reads forward, the negative side reads reversed. Switchable text passages, adjustable spiral length, font size, and curvature→weight strength.

2. **Conformal Text Grid** — a grid of mathematical words (objects, morphisms, functors, cobordism…) deformed under six conformal maps. Font size and opacity scale with the local Jacobian determinant (how much the map stretches space), and each word rotates to align with the map's local orientation. Smooth animated transitions.

3. **Curvature → Typography** — a linear text passage where each character's weight, size, color, and spacing are driven by position along a parabolic curvature profile (s², matching the Euler spiral's cumulative turning). A faint curvature graph runs underneath. Three independent sliders control how strongly curvature drives each typographic parameter.

4. **Droste Text** — recursive self-containing text blocks, each measured and word-wrapped at the correct scale, rotating and shrinking inward. Adjustable recursion depth, rotation, and scale factor.

5. **Text Flowing Around the Spiral** — the Euler spiral as an editorial obstacle. Text reflows line by line, each line carved by the spiral's bounding x-interval at that y-coordinate. This is exactly pretext's `carveTextLineSlots` technique, but the obstacle is `∫₀ˢ e^(it²) dt`.

---

## Pretext Fork Demo (`euler-spiral-text.ts`)

### Architecture

TypeScript demo using pretext's real API — no Canvas `measureText` shortcuts. Three modes:

- **Flow Around**: The spiral is computed as a set of points, then for each line, `getSpiralXIntervalAtY()` finds where the spiral crosses that y-band (same technique as `getPolygonIntervalForBand` from `wrap-geometry.ts`). The line width is carved, and `layoutNextLine` fills the available slots. Text flows around both halves of the spiral.

- **Curvature Type**: Single column, each line rendered with font weight mapped from vertical position through a quadratic curvature profile. Line 0 gets weight 400; the last line gets 700. Color shifts from cool blue to warm amber. Pretext handles line breaking at base weight, then DOM spans use the mapped weight.

- **Dual Column**: The spiral acts as a living, curved gutter. Left column gets text first (width carved by spiral's left boundary), right column resumes from the same `LayoutCursor` (width carved by spiral's right boundary). Same cursor-continuation technique as pretext's dynamic-layout and editorial-engine demos.

Type-checks clean against the pretext codebase. Bundles to 102KB.

---

## Key References

- [3Blue1Brown: Escher's most mathematically interesting piece](https://3blue1brown.substack.com/p/eschers-most-mathematically-interesting) — video using Print Gallery to introduce conformal maps and complex logarithm
- [3Blue1Brown video: "This picture broke my brain"](https://www.youtube.com/watch?v=Y7ImxZ_YhJk) — the Droste/conformal mapping exploration
- [3Blue1Brown video: Escher's Print Gallery](https://www.youtube.com/watch?v=ldxFjLJ3rVY) — deeper math behind the construction
- [De Smit & Lenstra: Conformal Grid behind Escher's Division](https://pub.math.leidenuniv.nl/~smitbde//rianne.pdf) — the original mathematical analysis
- [Laszlo Korte: Interactive Escher Print Gallery Shader](https://static.laszlokorte.de/escher/) — WebGL implementation of the Droste conformal mapping
- [Jürgen Richter-Gebert: Interactive Print Gallery](https://mathvisuals.org/PrintGallery/) — another interactive conformal explorer
- [Complex Analysis: Conformal Mapping](https://complex-analysis.com/content/conformal_mapping.html) — mathematical reference
- [chenglou/pretext](https://github.com/chenglou/pretext) — the text measurement & layout library
- [aculich/pretext](https://github.com/aculich/pretext) — fork with Euler spiral demo
- [37∞ Lab](https://aculich.github.io/lab.html) — the 24 topology-inspired variations
- [37∞ Playground](https://aculich.github.io/playground.html) — the poetical mirror with interactive distortions

---

## File Inventory

| File | Size | What It Is |
|------|------|------------|
| `index.html` | 7.8K | Navigation hub for conformal-lab |
| `euler-spiral-visualizations.html` | 24K | 5-section Euler spiral deep dive |
| `conformal-lab.html` | 33K | Interactive conformal map explorer |
| `conformal-text.html` | 34K | Typography on the curve |
| `pretext-demo/euler-spiral-text.html` | 3.4K | HTML shell for pretext demo |
| `pretext-demo/euler-spiral-text.ts` | 18K | Pretext API demo (TypeScript) |
| `NOTEBOOK.md` | — | This file |

---

*Generated during an exploratory session connecting the Euler spiral, conformal maps, Escher's Print Gallery, and programmatic text layout via pretext. The math is real. The meaning is ours to make.*
