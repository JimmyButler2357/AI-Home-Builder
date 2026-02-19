# WholeHouse Report

**Status:** Not started
**Priority:** 8
**Time:** 2 weeks
**Revenue:** High --- $15-25/report
**Roadmap value:** High --- full Phase 1 Wholeness Analyzer shipped as a premium product; validates willingness-to-pay

---

## Core Concept

Upload a floor plan. Receive a beautiful, professionally designed PDF document: cover page with the building image, executive summary with overall Life score, detailed per-property analysis with annotated diagrams, comparison to benchmark buildings, and 3-5 prioritized improvement suggestions.

The core idea is packaging expertise as a deliverable. An architect charges $500+ for a design review. This tool produces something similar --- not as deep, not as nuanced, but grounded in explicit mathematical theory rather than subjective opinion --- for $15-25. The report is not just a score dump; it is a narrative. "Your home excels at creating strong centers --- the living room is a clear focal point --- but the boundary between public and private zones is weak. Consider adding a transition space at the hallway junction."

This is the full Phase 1 Wholeness Analyzer shipped as a premium product. If people pay for it, the entire business model is validated. If they don't, you learn what is missing.

This builds on WholenessScore.com (the free quick score) as a premium upsell. "Want the full analysis? Get the WholeHouse Report."

---

## What the Report Contains

An 8-10 page professionally designed PDF with the following sections:

### 1. Cover Page
- Building photo or floor plan rendering
- Address or project name
- Overall Life score (large, prominent)
- Date of analysis

### 2. Executive Summary
- Three-sentence overview of the building's strengths and weaknesses
- Sets the narrative tone for the rest of the report --- not clinical, but descriptive and specific
- Example: "This home demonstrates strong spatial hierarchy, with a well-defined living room that anchors the ground floor. Circulation between rooms flows naturally, though the entry sequence lacks a transition zone between the public street and private interior. The most impactful improvement would be creating a thicker boundary at the front door --- a porch, vestibule, or even a change in ceiling height."

### 3. Score Overview
- **Radar chart** of all 15 properties, providing a visual fingerprint of the building's character
- **Overall Life score** with comparative context: "Scores higher than 64% of buildings analyzed"
- Brief interpretation of the shape of the radar chart: "Your building is strongest in spatial organization properties (Strong Centers, Positive Space) but weaker in sensory richness properties (Levels of Scale, Roughness, Contrast)"

### 4. Top Strengths (2-3 pages)
- Detailed analysis of the 2-3 highest-scoring properties
- For each strength:
  - What the property measures and why it matters for livability
  - **Annotated diagram** showing WHERE in the plan the strength manifests --- arrows pointing to the center of the living room, shading showing the positive space, callouts identifying the scale hierarchy
  - Specific architectural explanation: "The kitchen-dining-living sequence creates a gradient from functional to social to restful, with ceiling heights and room sizes decreasing along the path. This gradient gives each zone a distinct character while maintaining flow."

### 5. Key Weaknesses (2-3 pages)
- Detailed analysis of the 2-3 lowest-scoring properties
- For each weakness:
  - What the property measures and what is missing
  - **Annotated diagram** showing WHERE the weakness occurs --- highlighting the abrupt boundary, the missing scale level, the dead-end corridor
  - Specific spatial explanation: "The hallway connecting bedrooms to the living area is a featureless 3-foot-wide corridor with no variation in width, height, or light. It functions as a pipe, not a place. Spaces like this score low on Positive Space because the residual shape has no qualities of its own."

### 6. Improvement Suggestions (1-2 pages)
- 3-5 prioritized, actionable changes ranked by impact
- Each suggestion includes:
  - **What to change** --- specific and concrete, not vague
  - **Why it helps** --- which properties it improves and by how much (estimated)
  - **Before/after concept** --- a description or sketch showing the spatial change
  - **Difficulty estimate** --- cosmetic (paint/furniture), moderate (non-structural renovation), or major (structural change)
- Example suggestion: "Widen the hallway at the junction point to create a 5x5-foot landing. Add a skylight or clerestory window. Place a small built-in shelf or bench. This transforms dead circulation into a destination --- a 'room between rooms' that strengthens Boundaries (+1.8 estimated), Positive Space (+1.2), and Strong Centers (+0.8)."

### 7. Benchmark Comparison
- How this building compares to exemplary buildings in the database
- Radar chart overlay: the user's building silhouette against a benchmark building of similar size/type
- Not to shame the user's building, but to show what is possible: "Compared to high-scoring homes of similar size, your building's greatest opportunity is in Levels of Scale --- adding intermediate-sized elements (window trim, a porch column, a garden wall) would bring it closer to the benchmark profile."

### 8. Methodology Note
- Brief, transparent explanation of the scoring approach
- What the scores measure and what they do not
- Attribution to Alexander and Salingaros
- Honesty about limitations: "These scores are computed from 2D floor plan geometry. Properties that depend on 3D form, materiality, or site context (Roughness, Not-Separateness) are approximated and should be interpreted as directional, not precise."
- Link to further reading for users who want to understand the theory

---

## Technical Approach

### Input Pipeline
1. User uploads a floor plan image (photo, scan, screenshot, or architect's drawing)
2. Claude Vision extracts spatial features into structured JSON: rooms, dimensions, walls, openings, adjacencies
3. The extracted model is validated for completeness --- missing data triggers a follow-up prompt or user clarification

### Scoring Pipeline
4. Python scoring engine computes all 15 properties from the extracted model (same engine as WholenessScore.com, but operating on richer floor-plan data rather than a single photo)
5. Aggregate Life score computed (T x H)
6. Comparative percentile computed against the scored building database

### Analysis Generation
7. Claude text API generates the narrative sections --- strengths analysis, weakness explanations, improvement suggestions --- constrained by the computed scores and extracted features
8. The LLM is given explicit instructions: "The scores are the ground truth. Your job is to explain them, not to override them. If a property scores 8.2, explain what about the floor plan produces that high score. Do not invent observations that are not supported by the extracted features."

### Diagram Generation
9. Annotated floor plan diagrams are generated programmatically from the extracted model:
   - Base floor plan rendered from the semantic JSON (SVG or Canvas)
   - Overlays added per section: color-coded regions, arrows, callouts, shading
   - Strength diagrams highlight positive areas; weakness diagrams highlight problem areas
10. This is not AI-generated art --- it is data visualization applied to architecture

### PDF Assembly
11. All sections assembled into a designed PDF template using a Python PDF library (WeasyPrint, ReportLab, or similar)
12. Consistent typography, layout grid, color palette matching HomeMaker brand
13. Cover page uses the original uploaded image; interior pages use the annotated diagrams

### Delivery
14. PDF generated server-side and delivered via download link or email
15. Target generation time: under 60 seconds for the full pipeline
16. User receives a link to a web version of the report as well (for sharing)

### Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Floor plan extraction | Claude Vision API | Same pipeline as FloorplanToJSON sub-project |
| Scoring engine | Python (FastAPI) | Same engine as WholenessScore.com, extended for floor plan input |
| Narrative generation | Claude text API | Structured prompts constrained by computed scores |
| Diagram rendering | SVG generation (Python) | Annotated floor plans with overlays |
| PDF generation | WeasyPrint or ReportLab | Templated, branded layout |
| Payment | Stripe | One-time payment per report |
| Hosting | Vercel (frontend) + Railway/Fly (backend) | Same infrastructure as other sub-projects |

---

## Open Questions

- **Extraction accuracy threshold:** How accurate does the floor plan extraction need to be for the report to feel trustworthy? If the AI misidentifies a closet as a bathroom, the narrative falls apart. What is the minimum viable accuracy, and how do you handle uncertainty? One option: show the extracted model to the user for confirmation before generating the report.
- **Diagram quality expectations:** Users paying $15-25 expect a polished deliverable. How much design effort goes into the PDF template and diagram style? A report that looks like a homework assignment will not command premium pricing. This may require hiring a graphic designer for the template.
- **Narrative voice and tone:** Should the report read like an architectural review, a home inspection report, or a friendly advisor? The tone affects perceived value. Too academic alienates homeowners; too casual undermines credibility.
- **Benchmark database bootstrapping:** The Benchmark Comparison section requires a database of scored buildings. How many buildings need to be scored before the comparison is meaningful? 50? 200? 1,000? The database can be seeded with famous buildings and expanded as users submit floor plans.
- **Improvement suggestion feasibility:** How specific can suggestions be without crossing into professional architectural advice? "Add a transition space" is safe. "Remove this load-bearing wall" is liability territory. Where is the line, and should the report include a disclaimer?
- **Multi-story handling:** Many homes have two or more floors. Does the report score each floor independently, or is there a combined score? How are vertical relationships (staircase placement, double-height spaces) represented in the 2D analysis?
- **Repeat purchases and updates:** If a user makes improvements based on the report, will they buy another one? Should there be a discounted "re-score" option that shows before/after comparison?
- **Manual review option:** Should there be a human-in-the-loop review before delivery (at least initially) to catch egregious extraction errors or nonsensical narratives? This reduces throughput but protects quality during the early phase.

---

## Connection to HomeMaker

This sub-project IS Phase 1 productized. Nearly every component feeds directly into the full HomeMaker platform:

- **Scoring engine:** The Python scoring functions are the same ones that power the Wholeness Analyzer and eventually the design-time scoring in Phase 4. Every bug found and formula refined while generating reports improves the core engine.
- **Floor plan extraction:** The Claude Vision pipeline for converting images to structured JSON is exactly Phase 1 V2's image-to-plan extractor (PRD Section 5.1). Reports generate real-world test cases for extraction accuracy.
- **Narrative generation:** The explanation prompts --- "explain why this building scores 7.3 on Strong Centers" --- become the foundation for the Wholeness Analyzer's AI-Generated Suggestions (PRD Section 5.4) and the design tool's step-by-step explanations.
- **Diagram annotation:** The programmatic floor plan rendering with overlays becomes the heatmap overlay feature (PRD Section 5.5) and the annotated plan views in the full product.
- **PDF generation:** The report layout pipeline can be reused for the design tool's architectural drawing output (PRD Section 8: Output: Architectural Drawings).
- **Business model validation:** This directly answers PRD Business Question #16 ("Willingness-to-pay in target segments?"). Users uploading floor plans have high intent --- they own or are buying a home. If they pay $15-25 for a report, there is a real market for wholeness-based design services. If they don't, the pricing, the value proposition, or the scoring quality needs rethinking.
- **Benchmark database:** Every report generated adds a scored building to the database, which improves the comparative percentile feature, calibrates the scoring engine, and provides training data for future refinements.
- **Upsell path from WholenessScore.com:** The free quick score (WholenessScore.com) becomes the top of the funnel. Users who want more depth purchase the WholeHouse Report. Users who want to actually improve their design eventually graduate to the full HomeMaker tool. This creates a natural revenue ladder: free score -> $15-25 report -> $29/mo design tool.

### Revenue Projections

| Scenario | Reports/Month | Revenue/Month | Notes |
|----------|--------------|---------------|-------|
| Early traction | 50 | $750-1,250 | Meaningful signal, covers infrastructure costs |
| Moderate growth | 100 | $1,500-2,500 | Validates business model, funds continued development |
| Strong product-market fit | 250+ | $3,750-6,250+ | Real income stream while building HomeMaker |

At 100 reports/month, API costs (Claude Vision + Claude text + scoring compute) are estimated at $2-4 per report, yielding $11-23 gross margin per report. This is a healthy margin for a digital product with near-zero marginal cost beyond API calls.
