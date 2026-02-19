# HomeMaker Sub-Projects — Stepping Stones & Spinoffs

**Purpose:** Each sub-project builds skills and components needed for HomeMaker while being independently useful or monetizable. They are ordered here by recommended priority, balancing roadmap value against revenue potential.

**Status:** Pre-development. Each idea is documented in its own file for eventual migration to a standalone project repo.

---

## All Projects at a Glance

| # | Project | One-Line Description | Doc |
|---|---------|---------------------|-----|
| 1 | **Mirror of Self Ecosystem** | Twitter/X + Instagram + newsletter + calibration game running Alexander's "which has more life?" test across buildings, pottery, fabric, typefaces — building audience and a human perception dataset | [doc](mirror-of-self-ecosystem.md) |
| 2 | **WholenessScore.com** | Upload a building photo, get mathematical scores on the 15 properties (LLM extracts features, math computes scores, LLM explains results) | [doc](wholeness-score.md) |
| 3 | **FloorplanToJSON** | Upload a floor plan image, get structured semantic JSON back (rooms, walls, doors, dimensions, adjacencies) with per-room geometric analysis | [doc](floorplan-to-json.md) |
| 4 | **Property Space Explorer** | Interactive tools for figuring out how the 15 properties combine into an overall Life score — 4 options: slider explorer, center field simulator, building position map, formula playground | [doc](property-space-explorer.md) |
| 5 | **RoomGraph** | Define rooms as nodes and connections as edges with Alexandrian qualities (boundary type, connection type) — system resolves topology into a floor plan | [doc](room-graph.md) |
| 6 | **HouseJSON Interactive Editor** | Split-screen: parameter panel with sliders/dropdowns on the left, live 2D floor plan rendering on the right — change a room size and watch the plan redraw | [doc](house-json-editor.md) |
| 7 | **RoomFlow + Lighting** | Circulation graph analysis (reachability, dead ends, bottlenecks) plus lighting analysis (Light on Two Sides, daylight depth, window orientation) | [doc](room-flow.md) |
| 8 | **WholeHouse Report** | Upload a floor plan, receive an 8-10 page professional PDF with wholeness scores, per-property analysis, annotated diagrams, and improvement suggestions | [doc](whole-house-report.md) |
| 9 | **PromptToHouse** | Type a building description, watch the LLM generate atomic building commands step by step, see the floor plan assemble in real time with validation feedback | [doc](prompt-to-house.md) |
| 10 | **3D House Viewer** | Load building JSON, render it in browser 3D with orbital, first-person, section-cut, and dollhouse cameras at progressive fidelity levels | [doc](3d-house-viewer.md) |
| 11 | **DwellTune** | 15-20 preference questions translate subjective words ("cozy", "grand") into Alexander's vocabulary, then generate an actual house design matching your profile | [doc](dwell-tune.md) |
| 12 | **WholenessReno** | Upload your current floor plan, get a step-by-step renovation sequence that heals your house through Alexander's unfolding — each step addresses the weakest property | [doc](wholeness-reno.md) |
| 13 | **CodeCheck** | Input room dimensions and layout, check against IRC residential building codes (room sizes, egress windows, hallway widths, stair geometry) | [doc](code-check.md) |
| 14 | **NeighborhoodWalk** | Enter an address, analyze the neighborhood against Alexander's urban-scale patterns using street view, satellite, and GIS data — a separate venture | [doc](neighborhood-walk.md) |

---

## Ranked by Monetization Potential

| Rank | Project | Revenue Model | Why It Makes Money | Est. Revenue |
|------|---------|---------------|--------------------|-------------|
| 1 | **WholeHouse Report** | $15-25/report | Highest intent — someone uploading a floor plan is ready to act. Premium PDF feels like a professional deliverable. | $750-2,500/mo at 50-100 reports |
| 2 | **WholenessReno** | $49-99/plan | Even higher per-unit price — actionable renovation steps save people from wrong-order mistakes. | $500-2,000/mo at 10-20 plans |
| 3 | **FloorplanToJSON API** | $0.10-0.50/call, $49-299/mo dev tiers | B2B recurring. PropTech companies need structured floor plan data. Scales with adoption. | $500-3,000/mo with 10-20 developers |
| 4 | **WholenessScore.com** | Freemium, $5/mo unlimited | High volume, low per-user. Viral sharing ("my house scored 73!"). Gateway to WholeHouse Report upsell. | $250-1,000/mo at 50-200 subscribers |
| 5 | **CodeCheck** | $9.99/mo | Clear value prop for self-builders and small contractors. Mostly a separate product. | $200-1,000/mo |
| 6 | **DwellTune** | $9.99-19.99/generated house | "Personality quiz that gives you a house" is compelling. Requires generation pipeline. | $200-800/mo |
| 7 | **NeighborhoodWalk** | Urban analytics SaaS | Big opportunity but big build. Separate venture with its own funding path. | TBD — separate venture |
| 8 | **Mirror of Self** | Newsletter sponsorships, paid tier | Slow to monetize directly. Real value is audience and dataset for everything above. | $100-500/mo at 5K+ subscribers |
| 9-14 | RoomGraph, Property Space Explorer, HouseJSON Editor, RoomFlow, PromptToHouse, 3D House Viewer | Free tools / demos | No direct revenue. Value is in components built and audience gained. | $0 |

---

## Ranked by HomeMaker Roadmap Value

| Rank | Project | What It Retires | PRD Component Built | PRD Questions Answered |
|------|---------|----------------|--------------------|-----------------------|
| 1 | **FloorplanToJSON** | Schema gaps, extraction accuracy | Semantic Model Schema, Image-to-Plan Extractor | #7 (schema expressiveness), R3 (extraction accuracy) |
| 2 | **RoomGraph** | Missing topology layer | Semantic Model (graph layer), unfolding abstraction | Core architectural gap in PRD |
| 3 | **Mirror of Self** | Scoring perception correlation | Scoring Engine validation, calibration dataset | #3 (do scores match human perception?) |
| 4 | **HouseJSON Editor** | Schema gaps, representation limits | Semantic Model, dev tooling, parameter UX | #7 (schema gaps), #9 (representation limits) |
| 5 | **WholenessScore.com** | Can properties be formalized? | Scoring Engine (first implementation) | #1 (can 15 properties become working code?) |
| 6 | **RoomFlow + Lighting** | Circulation/egress validity rules | Validity Checker | Phase 2 validity rules |
| 7 | **Property Space Explorer** | How to aggregate 15 properties | Scoring Engine (aggregation formula) | #5 (how to weight properties?) |
| 8 | **PromptToHouse** | Can LLMs generate buildings? | Phase 2 Command Agent | #2 (LLM spatial reasoning feasibility) |
| 9 | **3D House Viewer** | 3D rendering feasibility | Phase 3 (rendering layer) | #8 (Three.js multi-model performance) |
| 10 | **WholeHouse Report** | Willingness-to-pay | Phase 1 Analyzer (productized) | #16 (willingness-to-pay) |
| 11 | **DwellTune** | Wizard info gathering approach | Phase 4 Wizard (preference system) | #11 (how much wizard info is enough?) |
| 12 | **WholenessReno** | Unfolding on existing buildings | Phase 4 unfolding (renovation variant) | Tests sequential unfolding process |
| 13 | **CodeCheck** | Basic code compliance checking | Validity Checker (deferred rules module) | R11 (building code databases) |
| 14 | **NeighborhoodWalk** | Not-Separateness property | Future venture, scoring engine generality | Informs scoring engine architecture |

---

## How Sub-Projects Map to HomeMaker Components

```
HomeMaker Component              Sub-Projects That Build It
────────────────────             ──────────────────────────
Scoring Engine                   WholenessScore.com, Property Space Explorer
                                 Mirror of Self Ecosystem (validation data)
Semantic Model                   FloorplanToJSON (schema definition), HouseJSON Editor,
                                 RoomGraph (relationship layer)
3D Viewer                        3D House Viewer
Validity Checker                 RoomFlow + Lighting, CodeCheck (basic module)
AI Command Agent                 PromptToHouse
Image-to-Plan Extractor          FloorplanToJSON
Phase 4 Wizard                   DwellTune (preference system), WholenessReno (unfolding on existing)
Audience & Validation            Mirror of Self Ecosystem, WholenessScore.com, WholeHouse Report
```

---

## Two Tracks

These sub-projects naturally split into two parallel tracks:

### Track A: Architectural Theory & Scoring
Focused on understanding and computing wholeness. More research-oriented, builds the mathematical brain.
- Mirror of Self Ecosystem
- WholenessScore.com
- Property Space Explorer
- WholeHouse Report

### Track B: Building It With Code
Focused on representing, manipulating, and rendering buildings as data. More engineering-oriented, builds the technical infrastructure.
- FloorplanToJSON
- RoomGraph
- HouseJSON Interactive Editor
- RoomFlow + Lighting
- PromptToHouse
- 3D House Viewer

Work both tracks in parallel. Track A validates whether the product is *worth* building. Track B builds the components you'll need *if* it is.

---

## Recommended Build Sequence

Items at the same level can run in parallel.

```
START IMMEDIATELY (parallel, ongoing):
  Mirror of Self Twitter/Instagram account — costs nothing, builds audience from day 1

MONTH 1:
  WholenessScore.com ──────── validates scoring, first revenue
  McMansion or Masterpiece ── calibration dataset, viral growth

MONTH 2:
  FloorplanToJSON ─────────── defines the schema everything depends on
  Property Space Explorer ──── figures out the aggregation math

MONTH 3:
  RoomGraph ───────────────── the conceptual breakthrough (topology before geometry)
  HouseJSON Editor ────────── dev tool + schema stress testing

MONTH 4:
  RoomFlow + Lighting ─────── validity checker component
  WholeHouse Report ────────── monetize what you've built ($15-25/report)

MONTH 5:
  PromptToHouse ───────────── Phase 2 research (riskiest technical bet)

MONTH 6:
  3D House Viewer ─────────── Phase 3 (rendering layer)

LATER:
  DwellTune ───────────────── preference system + generation pipeline
  WholenessReno ───────────── renovation variant of the full product
  CodeCheck ───────────────── separate product, basic module for HomeMaker
  NeighborhoodWalk ────────── separate venture entirely
```

By month 4, you have: a validated scoring engine, a tested schema, an audience, and revenue from WholeHouse Report. By month 6, Phases 1-3 are substantially built as standalone tools. Phase 4 becomes integration, not invention.

---

## Decision Framework

- **Want to validate the core idea?** -> WholenessScore.com or Mirror of Self Ecosystem
- **Want to make money NOW?** -> WholeHouse Report or FloorplanToJSON API
- **Want to build the hardest component?** -> 3D House Viewer or PromptToHouse
- **Want maximum fun?** -> WholenessScore.com, 3D House Viewer, PromptToHouse
- **Want to go viral?** -> Mirror of Self (Twitter/Instagram) or DwellTune
- **Want to build the core engine?** -> FloorplanToJSON (defines the data model everything else depends on)
