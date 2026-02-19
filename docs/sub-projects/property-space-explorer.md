# Property Space Explorer

**Status:** Not started
**Priority:** 4
**Time:** 1-2 weeks (per option; multiple options could be built sequentially)
**Revenue:** Low (research tool, not a direct revenue product)
**Roadmap value:** High — determines the mathematical aggregation model at the heart of HomeMaker's scoring engine

---

## Core Concept

The 15 properties of life are the inputs. The overall Life score is the output. What happens in between? That is the central question this tool exists to answer.

Salingaros proposed L = T x H (Life = Temperature x Harmony), where the 15 properties are collapsed into two intermediate variables before multiplication. But this is not settled. The creator is actively exploring alternatives:

- **Field-based mathematics** where centers reinforce each other. Each center's strength is a function of its own geometry plus weighted contributions from neighboring centers, with strength decaying over distance — analogous to gravitational or electromagnetic fields.
- **Direct integration** of all 15 properties without first reducing to T and H. Perhaps the properties interact with each other directly rather than through intermediaries.
- **Other frameworks** yet to be discovered. The right model might not be any of the above.

The Property Space Explorer is an interactive research tool for testing these hypotheses. It lets you manipulate property values, place centers on a canvas, compare aggregation formulas, and see where real buildings fall in property-space — all to develop intuition about how the 15 properties combine into a single measure of life.

This is not about building a product for end users. It is about building the mathematical heart of HomeMaker. The aggregation formula that emerges from this exploration becomes the engine that powers every score the product ever generates.

---

## Possible Implementations

This tool could take several forms. They are not mutually exclusive — each explores a different facet of the aggregation problem, and building two or three of them would provide converging evidence.

### Option A: Property Interaction Explorer

**What it is:** 15 sliders, one per property. Adjust any slider and see the resulting aggregate score update in real time under multiple proposed formulas simultaneously.

**What it looks like:**
```
 Levels of Scale     ████████░░░░  7.2
 Strong Centers      ██████████░░  8.5
 Boundaries          █████░░░░░░░  4.1
 Alternating Rep.    ███████░░░░░  6.0
 Positive Space      ████████░░░░  7.0
 Good Shape          █████████░░░  7.8
 Local Symmetries    ██████░░░░░░  5.3
 Deep Interlock      ████░░░░░░░░  3.5
 Contrast            ███████░░░░░  6.2
 Gradients           █████░░░░░░░  4.8
 Roughness           ██████░░░░░░  5.0
 Echoes              ████████░░░░  7.1
 The Void            ██████░░░░░░  5.5
 Inner Calm          ███████░░░░░  6.3
 Not-Separateness    ████░░░░░░░░  3.8

 ┌──────────────────────────────────────┐
 │  Additive (mean):           5.87     │
 │  Geometric mean:            5.42     │
 │  T x H (Salingaros):       41.3     │
 │  Minimum (weakest link):    3.5     │
 │  Harmonic mean:             5.08     │
 │  Field-based:               52.7     │
 └──────────────────────────────────────┘
```

**What it answers:**
- Do properties add, multiply, or interact nonlinearly?
- If one property is very low (say Deep Interlock at 3.5), does it tank the overall score? Under an additive model, no. Under a multiplicative or weakest-link model, yes.
- Which formula produces a score distribution that matches intuition? If two configurations "feel" equally alive but one formula scores them 20 points apart, that formula is wrong.
- Are there threshold effects? Does raising a property from 2 to 4 matter more than raising it from 6 to 8?

**Additional features:**
- A scatter plot of pre-scored buildings (gothic cathedral, strip mall, Japanese teahouse, McMansion, Georgian townhouse). Your current slider configuration appears as a moveable point among them.
- Ability to save and name configurations for comparison.
- A "sensitivity analysis" mode: hold all sliders fixed, sweep one property from 0 to 10, and plot the resulting aggregate score curve for each formula. Reveals which formulas treat properties as independent versus interactive.

### Option B: CenterField Simulator

**What it is:** A 2D canvas where you place centers and watch the mutual reinforcement field emerge as a heatmap.

Alexander's core claim is that centers strengthen each other — a center becomes stronger when surrounded by other strong centers. This is not a metaphor. He describes it as a literal field effect, analogous to physics. But nobody has modeled it computationally. This tool does.

**What it looks like:** A blank canvas. Click to place a center. Each center has adjustable properties:
- Size (radius)
- Symmetry strength (how geometrically ordered the center is)
- Boundary thickness (the transition zone around the center)
- Intrinsic intensity (a base "life" value)

As you place centers, a heatmap appears showing the emergent "life field." The field at any point is calculated as the sum of contributions from all centers, where each center's contribution is:

```
contribution(center_i, point_p) = intensity_i * f(properties_i) * decay(distance(center_i, point_p))
```

The decay function could be:
- Inverse square (like gravity): `1 / d^2`
- Exponential: `e^(-d/lambda)` where lambda is related to center size
- Gaussian: `e^(-d^2 / 2*sigma^2)`

And `f(properties)` encodes how the center's own qualities (symmetry, boundary, size) modulate its field contribution.

**What it reveals:**
- Two small centers close together can create a stronger combined field than one large center alone — Alexander's "mutual reinforcement" made visible.
- Clusters of well-bounded centers create field peaks that don't exist at any individual center — emergent wholeness.
- The heatmap reveals "dead zones" where no center's influence reaches — these are the areas that lack life.
- Different decay functions produce qualitatively different field patterns. Which looks most like real architectural experience?

**Why this matters:** This is genuinely novel research. Nobody has built a computational model of Alexander's field concept. If the field model produces results that match human perception (tested via the Mirror of Self dataset), it becomes a candidate for the actual scoring engine — a true alternative to T x H.

**Would look like:** Colored dots of varying sizes on a white canvas, surrounded by a smooth intensity heatmap ranging from cool blue (low life) through warm yellow to bright red (high life). The heatmap updates in real time as you drag centers around.

### Option C: Building Position Map

**What it is:** An XY scatter plot where famous buildings are plotted in "property space." Pre-scored buildings are fixed points. You can explore the space with a crosshair to understand what "lives" in each region.

**What it could look like:**
```
    High Coherence
         ^
         |      Georgian         Gothic
         |      Townhouse        Cathedral
         |                  *
         |    Japanese          Baroque
         |    Teahouse          Palace
         |
         |  Vernacular              ??
         |  Cottage
         |
         |
         |          McMansion
         |   Strip        Brutalist
         |   Mall          Tower
         |
         +--------------------------> High Complexity
```

**Axis choices (configurable):**
- X = Complexity (Temperature), Y = Coherence (Harmony) — the Salingaros-native view
- X = any property, Y = any other property — explore correlations between any pair
- X = first principal component of all 15 properties, Y = second principal component — data-driven axes
- Steve Mouzon's "Vernacular to Classical" spectrum as an axis — ranging from simple village buildings to highly formal classical compositions. This provides a cultural-historical dimension separate from Salingaros's formal measures.

**Pre-scored buildings populate the space:**
- Gothic Cathedral (Notre-Dame, Chartres)
- Georgian Townhouse (Bath, Edinburgh)
- Japanese Teahouse (Katsura Imperial Villa)
- Strip Mall (generic American)
- McMansion (generic American)
- Brutalist Tower (Barbican, Trellick)
- Vernacular Cottage (Cotswolds, New England)
- Baroque Palace (Versailles, Schonbrunn)
- Classical Temple (Parthenon)
- Modernist House (Villa Savoye, Farnsworth)
- Islamic Complex (Alhambra)
- Art Nouveau (Casa Batllo)

**Interactive features:**
- Click any building to see its full 15-property breakdown
- Move a crosshair to explore what "lives" in empty regions of the space — what building would score (High Complexity, Low Coherence)? That is architectural chaos. What about (Low Complexity, High Coherence)? That is elegant minimalism.
- Toggle between different axis pairs to discover which property pairs are correlated, which are independent
- Upload or enter a new building's scores to position it in the map

**Connection to Mouzon:** Steve Mouzon's "Vernacular to Classical" scale describes a spectrum of architectural formality, from simple buildings shaped by local materials and craft traditions (vernacular) to highly ordered buildings governed by explicit compositional rules (classical). This axis captures something the 15 properties individually do not: the cultural and historical register of a building. A Japanese teahouse and a Georgian townhouse might score similarly on many of Alexander's properties but sit at very different points on the Vernacular-Classical spectrum. Including this axis reveals whether the 15 properties are sufficient to capture what humans perceive, or whether additional dimensions of variation exist.

### Option D: Formula Playground

**What it is:** A side-by-side comparison of how different aggregation formulas rank a fixed set of test buildings. The same buildings, the same property scores, but wildly different aggregate results depending on which formula you apply.

**What it looks like:**

```
Building               Formula A      Formula B       Formula C       Formula D
                       (Mean)         (Geometric)     (Min Prop)      (T x H)
────────────────────────────────────────────────────────────────────────────────
Gothic Cathedral        7.8            7.5             5.2             68.4
Georgian Townhouse      7.2            7.1             6.3             62.1
Japanese Teahouse       7.0            6.8             5.8             58.9
McMansion               4.1            3.2             1.2             18.7
Strip Mall              2.3            1.8             0.8              8.2
Brutalist Tower         5.1            4.3             2.1             31.4
────────────────────────────────────────────────────────────────────────────────
Rank correlation
with intuition:         ???            ???             ???             ???
```

**The key insight this enables:** Look at how dramatically the McMansion's score changes across formulas. Under the mean (Formula A), it scores 4.1 — mediocre. Under the geometric mean (Formula B), it drops to 3.2 — the low properties pull it down harder. Under the minimum property (Formula C), it collapses to 1.2 — one terrible property (say Not-Separateness at 1.2) defines its score entirely. Under T x H, it scores 18.7 — moderate temperature multiplied by low harmony.

Which pattern matches reality? When you look at a McMansion, does it feel like a 4.1, a 3.2, a 1.2, or an 18.7? The formula that best matches gut reaction across many buildings is the formula worth keeping.

**Formulas to compare:**
1. **Arithmetic mean** — all properties weighted equally, linear
2. **Geometric mean** — multiplicative interaction, low scores pull down harder
3. **Harmonic mean** — even more sensitive to low values
4. **Minimum property (weakest link)** — you are only as good as your worst property
5. **T x H (Salingaros)** — two-step: classify properties into Temperature and Harmony groups, then multiply
6. **Weighted mean** — user-adjustable weights per property
7. **Power mean** — parameterized mean that interpolates between min, harmonic, geometric, arithmetic, and max
8. **Field-based** — from Option B, where the aggregate depends on spatial arrangement of centers
9. **Threshold-modified mean** — properties below a threshold (say 3.0) are penalized exponentially, creating a "floor" effect

**Interactive features:**
- Rank the buildings by gut feeling (drag to reorder). The system calculates which formula's ranking most closely matches yours (Spearman rank correlation).
- Load the Mirror of Self dataset (once it exists from the Mirror of Self Ecosystem). The system shows which formula best predicts which building humans choose as having "more life."
- Add custom formulas by typing a Python expression.

---

## Technical Approach

### Shared Infrastructure

All four options share:
- **Frontend:** Next.js (React) — consistent with HomeMaker's planned stack
- **Visualization:** D3.js for charts and scatter plots, HTML Canvas for the CenterField heatmap
- **State management:** React state with URL-encoded parameters (so you can share a specific configuration via link)
- **Pre-scored buildings:** A JSON file of ~20 famous buildings with hand-scored property values (initially scored by the creator using best judgment, later refined as the scoring engine matures)

### Option A: Property Interaction Explorer

- 15 range inputs with real-time state updates
- Aggregate score computed client-side (pure math, no backend needed)
- Formula implementations in TypeScript:
  ```typescript
  const arithmeticMean = (scores: number[]) => scores.reduce((a, b) => a + b) / scores.length;
  const geometricMean = (scores: number[]) => Math.pow(scores.reduce((a, b) => a * b), 1 / scores.length);
  const harmonicMean = (scores: number[]) => scores.length / scores.reduce((sum, s) => sum + 1/s, 0);
  const minimum = (scores: number[]) => Math.min(...scores);
  const txh = (scores: number[], tIndices: number[], hIndices: number[]) => {
    const t = tIndices.reduce((sum, i) => sum + scores[i], 0) / tIndices.length;
    const h = hIndices.reduce((sum, i) => sum + scores[i], 0) / hIndices.length;
    return t * h;
  };
  ```
- Scatter plot overlay using D3.js or Chart.js

### Option B: CenterField Simulator

- HTML Canvas or WebGL for the heatmap (performance matters — recalculating the field for every pixel on every frame)
- Each center stored as `{ x, y, radius, symmetry, boundaryThickness, intensity }`
- Field calculation: for each pixel, sum contributions from all centers
- Optimization: use a grid-based approach — compute field on a coarse grid (e.g., 100x100) and interpolate for display. Recalculate only when centers change.
- Color mapping: a smooth gradient from blue (0) through green and yellow to red (max field value)
- Performance target: real-time updates when dragging a center (recalculate ~60fps on a 100x100 grid with up to 20 centers)

### Option C: Building Position Map

- D3.js scatter plot with pan and zoom
- Buildings as labeled dots, sized by overall score
- Axis selector dropdowns to choose any pair of properties or derived measures
- Crosshair that follows mouse, showing interpolated "expected" score in the current region
- Tooltip on hover showing full property breakdown
- The Mouzon axis: an additional property scored per building (vernacular=0 to classical=10), available as an axis choice

### Option D: Formula Playground

- Table component with sortable columns
- Formula implementations matching Option A
- Drag-to-rank interface for the "match my intuition" feature
- Spearman rank correlation calculated client-side
- Custom formula input: a text field accepting a JavaScript expression where `p[0]` through `p[14]` represent the 15 property scores

### Build Order Recommendation

1. **Start with Option A** (1 week). It is the simplest and immediately useful for developing intuition.
2. **Add Option D** (3-4 days). It reuses Option A's formula implementations and adds the crucial "which formula matches intuition?" test.
3. **Build Option C** (3-4 days). Requires the pre-scored building dataset but is otherwise straightforward.
4. **Build Option B last** (1 week). It is the most technically novel and computationally demanding, but also the most intellectually exciting.

Total for all four: ~3-4 weeks. But any single option is useful on its own in under a week.

---

## Open Questions

### Mathematical
- **Which properties belong to Temperature vs. Harmony?** Salingaros provides some guidance, but the classification is debatable. The T x H formula's validity depends entirely on this grouping.
- **Is there a minimum threshold below which one property tanks the whole score?** The weakest-link model says yes — always. A threshold-modified model says yes — below 3.0. The mean says no — never. Which matches perception?
- **Are some properties correlated?** If Strong Centers and Local Symmetries are highly correlated (buildings that have one tend to have the other), they should not be double-counted in the aggregate. PCA or factor analysis on the scored building dataset could reveal this.
- **Is the field-based model tractable?** It requires spatial information (where centers are), not just property scores. This makes it fundamentally different from the other formulas, which operate on 15 numbers. Is the added complexity justified by better predictions?
- **What is the right decay function for the field model?** Inverse square, exponential, and Gaussian produce qualitatively different results. Is there a theoretical reason to prefer one?

### Practical
- **How to score the pre-loaded buildings?** The initial dataset of ~20 buildings with 15 property scores needs to be created. Options: (a) the creator scores them by hand using best judgment, (b) use Claude to provide initial scores and then manually adjust, (c) gather scores from multiple raters and average. Option (a) is fastest; option (c) is most rigorous.
- **How to present this tool to others?** It is a research tool, not a consumer product. Should it be a public web app, a private internal tool, or eventually a blog post with interactive embeds?
- **How does the Mouzon axis relate to the 15 properties?** Is "Vernacular to Classical" a summary of certain properties (e.g., high Levels of Scale + high Alternating Repetition = more classical), or is it an independent dimension that the 15 properties cannot capture?

### Philosophical
- **Can wholeness be reduced to a single number at all?** Maybe the 15-property radar chart IS the score, and any single aggregate is a lossy compression that destroys useful information.
- **Does the aggregation model need to be universal, or could it vary by building type?** Perhaps the "right" formula for a cathedral is different from the "right" formula for a cottage. If so, how does the system know which formula to apply?

---

## Connection to HomeMaker

### Scoring Engine (Direct)
This tool directly determines how HomeMaker's scoring engine aggregates 15 property scores into an overall Life score. The formula chosen here becomes the `compute_life_score()` function at the heart of the product. Every score displayed in the Wholeness Analyzer, every ranking of design options in the Phase 4 wizard, every number on a WholeHouse Report — all flow through this aggregation model.

### Mirror of Self Integration
The Formula Playground (Option D) can import data from the Mirror of Self Ecosystem. When thousands of humans have voted on which building has "more life," the system can test which aggregation formula best predicts those human judgments. This is the empirical validation loop: theory (formula) -> prediction (which building scores higher) -> observation (which building humans choose) -> refinement (adjust formula).

### CenterField as Scoring Engine Candidate
If the CenterField Simulator (Option B) produces field patterns that correlate with human perception, the field-based model could replace T x H as the scoring engine's core algorithm. This would make HomeMaker's scoring engine genuinely novel — not just implementing Salingaros's published formulas but advancing the theory with a new mathematical framework.

### Educational Content
Each option generates compelling visual content for blog posts explaining wholeness theory:
- "Here's why a McMansion scores 18 and a Georgian townhouse scores 62 — and why the formula matters"
- "Watch what happens to the life field when you move two centers closer together"
- "Where does your house sit on the map of architectural quality?"

These blog posts build the audience that eventually uses HomeMaker.

### Research Foundation
The open questions listed above (property correlations, threshold effects, formula validity) are not just academic. They determine whether HomeMaker's scores are meaningful. Building this tool is doing the research that makes the product credible.
