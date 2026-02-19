# WholenessScore.com

**Status:** Not started
**Priority:** 2
**Time:** 1-2 weeks for MVP
**Revenue:** Freemium — 3 free scores/month, $5/mo unlimited
**Roadmap value:** High — first real implementation of scoring engine, audience building

---

## Core Concept

Upload a photograph of a building. The system extracts geometric and spatial features from the image, runs mathematical formulas on those features to compute scores for each of Alexander's 15 properties, and presents the results as a score card with an overall Life score and per-property breakdown.

The critical architectural decision: **the scoring is not an LLM opinion**. The LLM is the eyes (extracting features from the photo) and the mouth (explaining the scores in plain language). The math is the brain. This distinction is the product's moat and philosophical core.

The pipeline:
```
Photo
  -> Claude Vision extracts features (geometry, rooms, proportions, elements at different scales)
  -> Python computes scores (Salingaros formulas / 15 property algorithms on extracted data)
  -> Claude text explains scores in plain language
  -> Frontend renders score card
```

This is the embryonic form of HomeMaker's Phase 1 Wholeness Analyzer. The prompts iterated here become the foundation for the real scoring algorithms. Every scored building becomes implicit training data for calibrating the engine.

---

## What the Score Card Shows

- **Overall Life score** (0-100 scale)
- **Per-property breakdown** — radar chart or bar chart showing all 15 properties
- **Top 3 strengths** with one-sentence explanations: "Strong Centers: 8.1/10 — The central dome creates a powerful focal point reinforced by the surrounding colonnade"
- **Top 3 weaknesses** with improvement suggestions: "Boundaries: 3.2/10 — The building meets the sidewalk abruptly with no transition zone. A covered arcade or setback with planting would create a thicker boundary"
- **Shareable result card** — designed for social media: building photo + score + one-line summary

---

## V1 Properties to Implement First

Start with the properties most computable from a single exterior photograph:

| Property | Why Feasible from Photo | Computation Approach |
|----------|------------------------|---------------------|
| Levels of Scale | Visible element sizes (building mass, windows, trim, door hardware) | Extract element sizes, check for geometric progression |
| Strong Centers | Visible focal points (entrances, domes, towers, central windows) | Identify centers, measure how surrounding elements reinforce them |
| Boundaries | Visible transition zones (porches, arcades, setbacks, landscaping) | Measure boundary thickness between building and context |
| Good Shape | Visible building silhouette and window proportions | Compactness ratio, aspect ratio of overall form |
| Positive Space | Visible figure-ground relationship | Is the space around the building also well-shaped? |

Add remaining properties incrementally as the extraction pipeline improves.

---

## Technical Approach

### Feature Extraction (Claude Vision)
Send the photo with a structured prompt requesting specific geometric observations:
- List all visible elements and their approximate scale (building height, window size, door size, trim width, etc.)
- Identify focal points and how surrounding elements relate to them
- Describe boundary conditions (how building meets ground, street, sky, neighbors)
- Assess proportions of major shapes
- Note repetition patterns and whether they alternate

Output: structured JSON of extracted features.

### Score Computation (Python)
For each property, a dedicated function takes the extracted features and returns a score:
```python
def score_levels_of_scale(features: dict) -> PropertyScore:
    """Check if element sizes follow geometric progression (each ~2-3x the next)."""
    sizes = sorted(features["element_sizes"])
    ratios = [sizes[i+1] / sizes[i] for i in range(len(sizes)-1)]
    # Score based on how close ratios are to ideal 2-3x range
    # Penalize gaps in the hierarchy
    ...
```

### Score Explanation (Claude Text)
Send the computed scores + original features to Claude with a prompt requesting plain-language explanations. The LLM interprets what the numbers mean for this specific building.

---

## Open Questions

- How reliable is Claude Vision at extracting precise geometric proportions from photos? Need to test sensitivity.
- What's the minimum photo quality needed for meaningful scoring? Straight-on vs. angled? Day vs. night?
- How to handle interior vs. exterior photos? V1 could be exterior-only.
- Should the score be absolute (0-100) or relative ("scores higher than 68% of buildings in our database")?
- How to handle buildings that score high on some properties and low on others? Is the aggregate meaningful?

---

## Connection to HomeMaker

- **Scoring Engine:** The Python scoring functions become the core of HomeMaker's scoring engine
- **Feature Extraction:** The Claude Vision extraction pipeline becomes Phase 1 V2's image analysis
- **Audience:** Every user becomes aware of wholeness-based quality assessment
- **Calibration:** Scored buildings + user reactions create data for engine refinement
