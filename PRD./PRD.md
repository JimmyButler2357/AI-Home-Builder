# Homemaker: AI-Assisted Architectural Design Through Calculated Wholeness

## Product Requirements Document (PRD)
**Version:** 1.0  
**Date:** January 2025

---

## Executive Summary

Homemaker is an AI-assisted architectural design tool that generates home designs through a step-by-step unfolding process. Unlike traditional generative design tools that use AI to predict what buildings should look like, Homemaker uses AI to propose variations while evaluating quality through mathematical calculation of "wholeness"—objective measures of architectural life derived from Christopher Alexander's pattern language theory.

The result is a tool where:
- **AI generates** creative variations in response to natural language
- **Math evaluates** the quality of each option objectively
- **Geometry validates** that designs are physically buildable
- **Humans decide** by exploring options in interactive 3D and selecting what feels right

---

## The Problem

### Current State of Home Design

**For homeowners:**
- Hiring an architect is expensive ($15,000-$100,000+)
- Generic plan services produce cookie-cutter results
- No way to explore variations or understand tradeoffs
- Disconnected from the design process

**For the industry:**
- Good design requires years of training and intuition
- Pattern language principles are known but rarely applied
- Software tools focus on documentation, not design generation
- AI tools predict "likely" buildings, not "good" buildings

### The Deeper Problem

Most generative design tools treat architecture as an optimization problem: generate many options, score them against criteria, pick winners. This fundamentally misunderstands how good buildings come into being.

Christopher Alexander demonstrated that living architecture emerges through **sequential unfolding**—each decision creates the conditions for the next. You can't generate a good building randomly and filter for quality; you must grow it step by step, with each step strengthening the whole.

---

## The Philosophy

### Core Insight: Wholeness is Calculable

Alexander and mathematician Nikos Salingaros showed that architectural "life" can be measured through geometric properties:

- **Temperature (T):** Degree of detail, variety, and differentiation
- **Harmony (H):** Degree of coherence and internal symmetry
- **Life (L = T × H):** The felt sense of aliveness in a space

These combine with 15 measurable properties (Levels of Scale, Strong Centers, Boundaries, Good Shape, etc.) to create an objective wholeness score.

This means we can:
1. Generate design variations (AI is good at this)
2. Calculate wholeness mathematically (no learned weights, pure geometry)
3. Present the best options to humans (who make final judgment)

### The Unfolding Process

Design proceeds through Alexander's pattern language—a sequence of 253 patterns from large scale (site, building mass) to small scale (window details, ornament). Each pattern:

- Addresses specific "forces" (light, privacy, movement, connection)
- Builds on decisions made in previous patterns
- Creates conditions for patterns that follow

The user doesn't navigate this complexity directly. The system sequences patterns appropriately and presents clear choices at each step.

### Human-in-the-Loop

The human is essential, not optional. At each step:

- AI proposes variations based on the pattern and user feedback
- Math scores each option for wholeness
- The user **feels** which option is right—in 3D, by spinning the model, by stepping inside

Alexander called this the "Mirror of the Self" test: which option makes you feel more alive? The calculation guides; the human decides.

---

## Product Vision

### The Experience

**Starting a Design:**
```
User provides:
- Site information (address, lot boundaries, or upload survey)
  - Import from GIS data, Google Maps, or other geospatial platforms
  - Satellite/aerial imagery auto-parsed for lot features, topography, orientation
- Basic program (3 bedrooms, 2 baths, ~2,000 SF)
- Budget range
- Style preferences (slider from vernacular to formal)
- Inspiration images (optional)
  - Upload photos of existing homes, interiors, or landscapes (vision AI extracts style cues)
  - Link Pinterest boards, Houzz ideabooks, or Instagram collections for style analysis

System generates initial site analysis and begins pattern sequence.
```

**The Design Loop:**
```
For each step:

1. System presents the current pattern
   "Step 12: Entrance Transition—Create a threshold 
    between public and private"

2. AI generates 3-5 variations using the pattern
   Each is validated for buildability
   Each is scored for wholeness

3. User explores options in 3D
   - Orbit around each option
   - Step inside to feel the space
   - Compare side-by-side
   - Read the wholeness breakdown

4. User selects one (or provides feedback)
   "I like Option B but make it deeper"
   → System regenerates with feedback

5. Selection is committed, next pattern begins
```

**Exploring Branches:**
```
User can "peek ahead" before committing:
- "Show me where Option A leads"
- Browse 3-5 steps into the future
- Compare different branches
- Bookmark interesting directions
- Return and commit when ready
```

**Final Output:**
```
When design is complete:
- Floor plans (PDF, DXF)
- Elevations and sections
- 3D model (glTF for sharing)
- Room schedules and area calculations
- Wholeness report with pattern compliance
- Cost estimate (preliminary)
```

---

## Key Features

### 1. Pattern-Guided Unfolding

The system sequences design decisions according to Alexander's pattern language, ensuring each step builds meaningfully on the last.

- 50-100 key patterns implemented initially (home scale)
- Neighborhood-scale patterns (#1–#94) available for multi-home and community-level design
- Each pattern has a prompt template for AI generation
- Patterns can be skipped or reordered by advanced users
- Custom patterns can be added

### 2. AI Generation with Natural Language

Users communicate in plain English. The AI translates intent into architectural variations.

**Examples:**
- "I want a cozy reading nook near the garden"
- "Make the kitchen more connected to outdoors"
- "This feels too formal, make it warmer"
- "We have two kids under 10"

The AI uses atomic architectural tools (place wall, create opening, define room) to generate variations. It doesn't "know" architecture—it proposes; the math evaluates.

### 3. Calculated Wholeness Scoring

Every option is scored using Salingaros's formulas and Alexander's 15 properties. Scores are:

- **Transparent:** Users see the breakdown
- **Explainable:** "Option A scores higher on Strong Centers because..."
- **Calculated:** Pure geometry, no learned weights
- **Comparable:** Easy to see tradeoffs between options

### 4. Real-Time 3D Visualization

Users explore designs in interactive 3D:

- **Orbit:** Spin the model to see all angles
- **Zoom:** Get close to details or pull back for context
- **Enter:** Step inside and walk through spaces
- **Dollhouse:** Remove roof to see floor plan in 3D
- **Time-of-day:** See how light moves through the space

Visual fidelity progresses with design:
- Early: Simple volumes, diagrammatic
- Middle: Walls, floors, openings with basic materials
- Late: Textures, furniture hints, realistic lighting

### 5. Physical Validity Checking

Every generated option is checked for buildability before the user sees it:

- **Enclosure:** Rooms are fully bounded
- **Connections:** Walls meet properly
- **Dimensions:** Rooms meet minimum sizes
- **Structure:** Spans are reasonable
- **Code:** Basic zoning compliance

Invalid options are rejected and regenerated automatically. Users only see options that could actually be built.

### 6. Branch Exploration

Users can explore "what if" scenarios without committing:

- **Peek:** See where an option leads (3-5 steps ahead)
- **Compare:** Side-by-side branch comparison
- **Scroll:** Rapidly browse variations along one branch
- **Bookmark:** Save interesting directions for later
- **Backtrack:** Return to any previous decision point

### 7. Geospatial & Visual Inputs

Rich site and inspiration inputs that ground the design in real-world context.

**Site Context via GIS / Maps:**
- Import lot boundaries and topography from GIS platforms (ArcGIS, QGIS shapefiles/GeoJSON)
- Pull site context from Google Maps, Apple Maps, or OpenStreetMap (street layout, neighboring buildings, trees)
- Auto-detect solar orientation, slope, views, and access points from geospatial data
- Overlay zoning and setback constraints from municipal GIS feeds where available

**Vision Uploads & Inspiration Linking:**
- Upload photos of existing homes, interiors, landscapes, or hand sketches — vision AI extracts architectural style cues (roof pitch, material palette, massing, window proportions)
- Link Pinterest boards, Houzz ideabooks, or Instagram collections — system analyzes pinned images for recurring patterns, colors, and spatial preferences
- Reference images inform AI generation at each pattern step (e.g., "generate entrance transitions in the style of these pins")
- Users can tag uploaded images to specific patterns or design elements

### 8. Architectural Output

Final designs export to standard formats:

| Output | Format | Purpose |
|--------|--------|---------|
| Floor Plans | PDF, DXF | Construction documents |
| Elevations | PDF, DXF | Exterior views |
| Sections | PDF, DXF | Interior heights, structure |
| 3D Model | glTF, OBJ | Sharing, rendering |
| Schedules | PDF, CSV | Rooms, doors, windows |
| Report | PDF | Wholeness scores, patterns used |

---

## Technical Architecture

### Internal Model

Simple JSON structure representing the design state:

```json
{
  "site": { "boundary": [...], "setbacks": {...} },
  "walls": [{ "id": "w1", "start": [0,0], "end": [5,0], "height": 3, "type": "exterior" }],
  "openings": [{ "id": "o1", "wallId": "w1", "position": 2, "width": 1.2, "type": "window" }],
  "rooms": [{ "id": "r1", "name": "Living", "boundary": [...], "floor": 0 }],
  "centers": [{ "id": "c1", "position": [2.5, 3], "strength": 0.8 }],
  "metadata": { "step": 12, "pattern": "entrance_transition" }
}
```

### System Components

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   USER INPUT    │────▶│  PATTERN        │────▶│  AI GENERATION  │
│                 │     │  SEQUENCER      │     │                 │
│ Text, clicks,   │     │                 │     │ Claude/GPT +    │
│ selections      │     │ Determines next │     │ atomic tools    │
└─────────────────┘     │ pattern based   │     └────────┬────────┘
                        │ on state        │              │
                        └─────────────────┘              ▼
                                               ┌─────────────────┐
┌─────────────────┐     ┌─────────────────┐    │   VALIDITY      │
│   HUMAN        │◀────│  PRESENTATION   │◀───│   GATE          │
│   SELECTION    │     │                 │    │                 │
│                │     │ Three.js 3D     │    │ Geometry checks │
│ Explore, feel, │     │ Scores display  │    │ Rejects invalid │
│ decide         │     │ Comparisons     │    └────────┬────────┘
└───────┬────────┘     └─────────────────┘             │
        │                                              ▼
        │                                    ┌─────────────────┐
        │                                    │   WHOLENESS     │
        │                                    │   CALCULATION   │
        ▼                                    │                 │
┌─────────────────┐                          │ T, H, L = T×H   │
│   COMMIT &      │                          │ 15 properties   │
│   CONTINUE      │                          │ Pure math       │
│                 │                          └─────────────────┘
│ Update state    │
│ Next pattern    │
└─────────────────┘
```

### Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Frontend | React + Three.js | Interactive 3D, large ecosystem |
| 3D Engine | Three.js | WebGL, WebXR-ready, well-documented |
| AI Agent | Claude API | Strong reasoning, tool use |
| Validity | Custom JS (initially) | Simple geometry checks |
| Wholeness | Custom JS | Salingaros formulas |
| 2D Export | SVG → PDF, DXF | Standard drawing formats |
| 3D Export | Three.js exporters | glTF, OBJ |
| Geospatial | Leaflet/Mapbox + GeoJSON | Map display, GIS data import |
| Vision AI | Claude vision / multimodal | Extract style cues from uploaded photos |
| Storage | Local files (JSON) | Agent-native pattern |

---

## User Personas

### Primary: The Engaged Homeowner

**Profile:** Planning to build or significantly renovate. Has opinions about how they want to live but isn't trained in architecture. Budget-conscious but values quality.

**Needs:**
- Understand and participate in design decisions
- See options, not just one answer
- Feel confident the result will work
- Get professional-quality output for contractors

**Quote:** "I know what I want, I just can't draw it. And I want to understand why things are the way they are."

### Secondary: The Design Professional

**Profile:** Architect, designer, or builder who wants to use pattern language principles but doesn't have time to apply them manually.

**Needs:**
- Rapid exploration of options
- Objective evaluation of design quality
- Client communication tool
- Export to professional workflows

**Quote:** "I've read Alexander but applying 253 patterns to every project isn't practical. If software could guide that process..."

### Tertiary: The Developer/Builder

**Profile:** Building spec homes or small developments. Wants quality designs without full architectural services.

**Needs:**
- Generate good designs quickly
- Ensure code compliance
- Cost-effective process
- Differentiate from generic plans

**Quote:** "I'm tired of building the same house over and over. But custom design is too expensive for my margins."

### Quaternary: The Neighborhood Planner

**Profile:** Community developer, land trust, or municipal planner designing multi-home developments or infill neighborhoods. Needs coherent design across multiple lots.

**Needs:**
- Design 10-200+ homes that feel like a neighborhood, not a subdivision
- Import real-world site data from GIS/maps to work with actual terrain and context
- Ensure pattern-language coherence at the neighborhood scale (shared spaces, walkability, strong centers)
- Generate varied yet harmonious home designs across the development

**Quote:** "Every subdivision looks the same because we copy-paste one plan. I want each home to be different but the whole thing to feel like a place."

---

## Success Metrics

### User Engagement
- Completion rate: % of started designs that reach export
- Time per step: Are users exploring or rushing?
- Branch exploration: Are users peeking ahead?
- Return rate: Do users come back to continue designs?

### Design Quality
- Average wholeness score of completed designs
- Pattern compliance rate
- Validity rejection rate (should decrease as AI improves)
- User satisfaction with final design (survey)

### Output Utility
- % of exports used in actual construction
- Feedback from contractors on drawing quality
- Cost estimate accuracy vs. actual build cost

---

## Roadmap

### Phase 1: Foundation (Months 1-3)
- Internal model structure
- Basic Three.js visualization (orbit, zoom, enter)
- 10-15 core patterns with prompts
- Simple validity checking
- Wholeness calculation (T, H, L, 3-5 properties)
- Single-path design flow (no branching yet)

### Phase 2: Core Experience (Months 4-6)
- AI generation with natural language feedback
- 30-50 patterns
- Branch exploration (peek, compare, bookmark)
- Improved visualization (materials, lighting)
- PDF floor plan export

### Phase 3: Full Output (Months 7-9)
- All major exports (plans, elevations, sections, 3D)
- Full 15 properties calculation
- Schedule generation
- Cost estimation integration
- 80-100 patterns

### Phase 4: Polish & Scale (Months 10-12)
- Mobile-friendly interface
- Collaboration features (share designs)
- Template/style libraries
- Performance optimization
- User testing and refinement

### Phase 5: Neighborhood Expansion
- **Neighborhood-scale design:** Extend the pattern language to Alexander's larger-scale patterns (#1–#94), enabling design of clusters, streets, and neighborhoods—not just individual homes
- **GIS & geospatial integration:** Import site context from GIS systems (ArcGIS, QGIS), Google Maps, Apple Maps, OpenStreetMap, or other world-view platforms to understand surrounding terrain, zoning, infrastructure, and solar exposure
- **Multi-parcel planning:** Design multiple homes as a cohesive neighborhood with shared spaces, walkways, and communal centers—each scored for collective wholeness
- **Contextual fitting:** Use satellite/aerial imagery and street-level data to ensure new designs harmonize with existing built environment (setbacks, massing, style vocabulary)
- **Developer/community tools:** Support spec-home developers and planned communities designing 10-200+ units with pattern-language coherence at the neighborhood scale

### Future Considerations
- VR integration (WebXR)
- Multi-unit / site planning
- Renovation mode (existing conditions)
- Contractor marketplace integration
- Permit application assistance

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI generates unbuildable designs | User frustration | Strong validity gate, clear feedback to AI |
| Wholeness scores don't match user perception | Loss of trust | User testing, calibration, transparency about limitations |
| Pattern sequence too rigid | Creative limitation | Allow skipping, reordering, custom patterns |
| 3D performance issues | Poor UX | Level-of-detail system, progressive loading |
| Users overwhelmed by choices | Abandonment | Smart defaults, guided mode, fewer options for beginners |
| Export quality insufficient for construction | Unusable output | Partner with architects for validation, iterate on formats |

---

## Open Questions

1. **Pricing model:** Subscription? Per-design? Freemium?
2. **Professional tier:** What additional features for architects/builders?
3. **Pattern licensing:** Alexander's patterns are published—any IP concerns?
4. **Localization:** How to handle regional building codes, styles, materials?
5. **Liability:** Disclaimers around construction use of outputs?
6. **GIS data sources:** Which municipal/public GIS feeds to integrate first? How to handle varying data quality?
7. **Pinterest/Houzz API access:** Terms of service for scraping or linking inspiration platforms?
8. **Neighborhood scale:** At what project size does the tool need multi-user collaboration features?

---

## Appendix: Key Concepts

### Christopher Alexander's Pattern Language

A system of 253 design patterns ranging from regional planning (#1 Independent Regions) to construction details (#253 Things From Your Life). Each pattern describes:
- A recurring design problem
- The forces at play
- A solution that resolves those forces
- Connections to other patterns

Patterns are meant to be applied in sequence, with large-scale patterns setting context for smaller ones.

### Nikos Salingaros's Wholeness Formulas

Mathematical measures of architectural life based on thermodynamic analogies:
- **Temperature (T):** Variety, detail, differentiation (0-10)
- **Harmony (H):** Coherence, symmetry, organization (0-10)
- **Life (L = T × H):** Overall measure of architectural vitality (0-100)
- **Complexity (C = T × (10-H)):** Where (10-H) is architectural entropy

### The 15 Fundamental Properties

Geometric characteristics that contribute to wholeness:
1. Levels of Scale
2. Strong Centers
3. Boundaries
4. Alternating Repetition
5. Positive Space
6. Good Shape
7. Local Symmetries
8. Deep Interlock and Ambiguity
9. Contrast
10. Gradients
11. Roughness
12. Echoes
13. The Void
14. Simplicity and Inner Calm
15. Not-Separateness

### Agent-Native Architecture

A software design pattern where AI agents use atomic tools to achieve outcomes described in prompts, rather than executing predefined workflows. Key principles:
- **Parity:** Agent can do anything the UI can do
- **Granularity:** Tools are atomic; features are prompt-defined outcomes
- **Composability:** New features = new prompts, not new code
- **Emergent capability:** Agent can accomplish unanticipated tasks

---

## References

- Alexander, C. (1977). *A Pattern Language*
- Alexander, C. (2002-2004). *The Nature of Order*, Volumes 1-4
- Salingaros, N. (1997). "Life and Complexity in Architecture from a Thermodynamic Analogy"
- Salingaros, N. (2006). *A Theory of Architecture*
- Shipper, D. (2025). "Agent-native Architectures"
- Postle, B. homemaker-addon: https://github.com/brunopostle/homemaker-addon

---

*This document represents the product vision as of January 2025. Details will evolve through development and user feedback.*
