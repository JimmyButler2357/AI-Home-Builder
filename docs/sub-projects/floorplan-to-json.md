# FloorplanToJSON

**Status:** Not started
**Priority:** 3
**Time:** 2-3 weeks
**Revenue:** B2B API -- $0.10-0.50/call, $49-299/mo developer tiers (PropTech companies need structured floor plan data)
**Roadmap value:** High -- defines the semantic JSON schema used by every downstream HomeMaker component, builds the Phase 1 V2 image-to-plan extractor, forces early schema validation against real-world floor plans

---

## Core Concept

Upload a floor plan image -- a photo of a hand sketch, a screenshot from Zillow, a scan from a real estate flyer -- and the system returns structured JSON: rooms with names, functions, and dimensions; walls with endpoints and thicknesses; doors and windows with positions and sizes; and adjacency relationships describing how spaces connect.

A visual overlay renders on top of the original image showing exactly what was extracted, so the user can verify the output and catch errors before trusting the data.

The fundamental insight: **floor plans are data trapped in pixels.** Millions of floor plans exist as images -- in listings, in paper archives, in hand sketches on napkins -- and none of them are computable. The moment you bridge that gap, you unlock everything downstream: scoring, comparison, renovation analysis, 3D visualization, code compliance checking. FloorplanToJSON is the universal adapter plug for the entire HomeMaker ecosystem.

Building this sub-project forces you to answer a question that every other component depends on: **what does a floor plan mean as data?** The semantic JSON schema you define here becomes the contract that the scoring engine scores, the 3D viewer renders, the command agent generates, and the validity checker validates. Every gap discovered now -- "how do we represent a half-wall?", "what about open floor plans with implied room boundaries?" -- prevents a crisis when those gaps surface in the full product.

### Absorbed Sub-Projects

This sub-project incorporates the core ideas from two other sub-projects that were evaluated and skipped as standalone builds:

**WallMath (computational geometry on room shapes)** -- Rather than building a separate geometry toolkit, fold the useful analysis modules directly into FloorplanToJSON as a post-extraction step. After the system extracts room polygons from the image, automatically compute geometric properties per room: compactness ratio, convexity, symmetry axes, aspect ratio, area, perimeter. Users see results like: "Your kitchen has compactness 0.72 (good), your hallway has 0.31 (poor -- long and narrow)."

**Is This Room Well-Shaped? (Good Shape property scorer)** -- The original concept required users to draw room polygons by hand. That is unnecessary friction. Instead, implement Good Shape as a per-room analysis that runs automatically on the extracted data. No drawing tools needed. The room polygons come from the floor plan image, and the Good Shape score is computed on each one as part of the output.

Both of these become analysis modules within the FloorplanToJSON pipeline rather than separate products.

---

## Technical Approach

### The Hybrid Pipeline

The key architectural decision is a **two-layer extraction**: computer vision for geometry, LLM for meaning.

```
Floor Plan Image
  |
  v
[Layer 1: Geometry Extraction]
  Open-source CV model (FloorPlanParser or Raster-to-Graph)
  -> wall segments with endpoints
  -> door positions and types
  -> window positions and sizes
  -> room boundary polygons
  |
  v
[Layer 2: Semantic Understanding]
  Claude Vision API
  -> room names and functions ("this is the kitchen")
  -> adjacency relationships ("the kitchen opens to the dining room through an archway")
  -> architectural intent ("the hallway serves as a gallery connecting public and private zones")
  -> ambiguity resolution ("that small room off the master bedroom is a walk-in closet, not a bathroom")
  |
  v
[Layer 3: Geometric Analysis]
  Python analysis modules (from WallMath / Room Well-Shaped)
  -> per-room: compactness ratio, convexity, symmetry axes, aspect ratio
  -> per-room: Good Shape score
  -> overall: circulation graph, adjacency matrix
  |
  v
Structured JSON Output + Visual Overlay
```

**Why hybrid, not pure LLM?** Claude Vision can identify rooms and name them, but it hallucinates geometry. It will say a room is "approximately 12x14 feet" when it is actually 10x16. Computer vision models trained on floor plans produce precise wall endpoints and room polygons. The LLM adds the semantic layer that no CV model provides: understanding that the room marked "BR3" is actually being used as a home office, or that the unmarked space between the kitchen and dining room is functionally an eating nook.

**Why hybrid, not pure CV?** Open-source CV models stop at pixel masks or raw geometry. They can tell you there is a room with corners at coordinates (0,0), (12,0), (12,14), (0,14). They cannot tell you it is the living room, that it connects to the kitchen through a wide opening, or that the bay window on the south wall creates a natural reading alcove. The semantic layer is where the value lives.

### Geometry Extraction: Model Options

**Primary candidate: FloorPlanParser (TINY-KE)**
- Closest match to the goal out of the box. Image in, JSON out with wall endpoints, windows, doors.
- Has a REST API already built.
- Limitation: accuracy on hand-drawn or low-quality scans is unknown.

**Alternative: Raster-to-Graph (SizheHu, Eurographics 2024)**
- State of the art. Attention transformer that predicts a structural graph from images -- junctions as nodes, walls as edges.
- Graph output aligns naturally with the RoomGraph concept from the PRD.
- More recent research, potentially more accurate, but may require more integration work.

**Fallback: TF2DeepFloorplan**
- Deep learning floor plan segmentation. Flask API and Docker available.
- Output is pixel masks, not structured geometry -- would require a post-processing step to convert masks to polygons and wall segments.
- Well-documented, easy to deploy, but adds pipeline complexity.

### Semantic Understanding: Claude Vision

Send the original floor plan image to Claude Vision with a structured prompt requesting:
- Room identification: name, function, estimated dimensions
- Spatial relationships: which rooms connect to which, through what kind of opening (door, archway, open plan)
- Architectural features: bay windows, built-in elements, fireplaces, staircases
- Ambiguity flags: areas where the plan is unclear or could be interpreted multiple ways

The prompt instructs Claude to output structured JSON that can be merged with the geometry extraction output. Claude provides the "what" and "why"; the CV model provides the "where" and "how big."

### Geometric Analysis Modules

After extraction, run the following computations on each room polygon:

**Compactness ratio:** `4 * pi * area / perimeter^2`. A circle scores 1.0 (maximum compactness). A long narrow rectangle scores low. Tells you how efficiently a room uses its perimeter.

**Convexity:** `area / convex_hull_area`. A convex room scores 1.0. An L-shaped room scores lower. Measures how much of the room's bounding shape is actually usable space.

**Aspect ratio:** `max_dimension / min_dimension` of the minimum bounding rectangle. A square scores 1.0. Values above 2.5 suggest the room is uncomfortably narrow.

**Symmetry axes:** Count the number of approximate symmetry axes. Rooms with more axes of symmetry tend to feel more settled and centered.

**Good Shape score:** A composite score combining compactness, convexity, and recursive decomposability (can the room be broken into good sub-shapes?). This is the direct implementation of Alexander's Good Shape property applied per-room.

These modules produce the per-room analysis that users see: "Your kitchen has compactness 0.72 (good), your hallway has 0.31 (poor -- long and narrow)."

### Output: The JSON Schema

The output JSON schema is a draft of what will become HomeMaker's canonical semantic model. Structure:

```json
{
  "version": "0.1",
  "source": {
    "image_dimensions": [1200, 900],
    "extraction_confidence": 0.85,
    "scale_factor": 0.5,
    "scale_unit": "feet"
  },
  "rooms": [
    {
      "id": "r1",
      "name": "Living Room",
      "function": "living",
      "polygon": [[0, 0], [14, 0], [14, 12], [0, 12]],
      "area_sqft": 168.0,
      "dimensions": {"length": 14, "width": 12},
      "analysis": {
        "compactness": 0.78,
        "convexity": 1.0,
        "aspect_ratio": 1.17,
        "symmetry_axes": 2,
        "good_shape_score": 8.2
      }
    }
  ],
  "walls": [
    {
      "id": "w1",
      "start": [0, 0],
      "end": [14, 0],
      "thickness": 0.5,
      "exterior": true,
      "rooms": ["r1"]
    }
  ],
  "openings": [
    {
      "id": "o1",
      "type": "door",
      "wall_id": "w1",
      "position": 5.0,
      "width": 3.0,
      "height": 6.8,
      "connects": ["r1", "r2"]
    }
  ],
  "adjacencies": [
    {
      "room_a": "r1",
      "room_b": "r2",
      "connection_type": "door",
      "opening_id": "o1",
      "semantic_note": "Living room connects to dining room through a wide cased opening"
    }
  ],
  "circulation": {
    "entry_point": "o5",
    "graph": {
      "nodes": ["r1", "r2", "r3", "r4", "r5"],
      "edges": [["r1", "r2"], ["r2", "r3"], ["r1", "r4"], ["r4", "r5"]]
    },
    "dead_ends": ["r5"],
    "bottlenecks": []
  }
}
```

This schema directly extends the semantic model draft in PRD Section 10. The `rooms[].analysis` block is where the WallMath/Good Shape computations live.

### Visual Overlay

The demo page renders the extracted data on top of the original image:
- Room polygons drawn as colored overlays with labels
- Walls drawn as thick lines
- Doors and windows drawn as standard architectural symbols
- Adjacency connections drawn as dashed lines between room centers
- Per-room analysis scores shown in a sidebar or tooltip on hover

The overlay serves two purposes: it lets the user verify extraction accuracy, and it demonstrates the structured data visually in a way that is immediately understandable.

---

## Competitor Landscape

### Commercial Tools

**CubiCasa** -- Market leader in floor plan digitization. Smartphone video scan produces floor plans in SVG/JPG/PNG. Developer APIs available (Conversion API, Exporter API, Integrate API). Their internal model has 80+ semantic categories, but structured data is not directly exposed to developers -- you get images, not JSON. CubiCasa5K dataset (5,000 annotated floor plans) is publicly available and is the standard benchmark. First scan free, add-on scans $15 each. Key gap: no semantic JSON output, no room relationship data, no analysis layer.

**Matterport** -- 3D digital twin platform. Requires dedicated LiDAR cameras for capture. REST API returns JSON with some dimensional data. $10-309/mo. Produces rich 3D models but is not an image-to-data pipeline -- you cannot upload a photo of a floor plan and get structured output. Fundamentally different use case (3D scanning vs. 2D plan interpretation).

**magicplan** -- AR-based room scanning on smartphones. Richest export suite in the market: JSON, DXF, OBJ, IFC, USDZ. REST API available on PRO plans. $149-600/mo. Targets contractors and insurance adjusters who need measurements on-site. Like Matterport, requires real-world scanning -- cannot interpret existing floor plan images.

**Archilogic** -- Spatial data platform focused on commercial real estate. GraphQL API, GeoJSON and IFC output. Now a Microsoft Places integrator for workspace management. Custom enterprise pricing. The GraphQL API is well-designed but the platform is aimed at office space management, not residential floor plan analysis.

**RasterScan** -- AI-powered raster image to vector conversion. Cloud API and Docker deployment options. Outputs SVG, DWG, and JSON metadata. Closest commercial tool to the image-to-data concept, but focused on general raster-to-vector conversion rather than semantic floor plan understanding. No room naming, no adjacency relationships, no analysis.

**RoomSketcher** -- Recently launched an "AI Convert" feature that turns scanned blueprints into editable projects in approximately 5 seconds. Impressive speed, but no structured data API. The output is an editable project within their proprietary tool, not exportable JSON. Useful for visualization but not for programmatic analysis.

### Open Source

**FloorPlanParser (TINY-KE)** -- Closest existing tool to the FloorplanToJSON goal. Takes an image in, produces JSON out with wall endpoints, windows, and doors. Has a REST API. Primary candidate for the geometry extraction layer. Limitation: documentation is sparse and accuracy on diverse input types is untested.

**TF2DeepFloorplan / DeepFloorplan** -- Deep learning segmentation models for floor plans. Output is pixel masks (room type segmentation, wall detection), not structured JSON. The TF2 version has a Flask API and Docker support. Would require substantial post-processing to convert pixel masks into the structured polygon + relationship data that FloorplanToJSON needs.

**Raster-to-Graph (SizheHu, Eurographics 2024)** -- State of the art. An attention transformer that predicts a structural graph directly from floor plan images: junctions become nodes, walls become edges. The graph output format aligns naturally with the RoomGraph concept from the HomeMaker PRD. Published in a top computer graphics venue, suggesting strong peer review. Most promising research-grade option.

**CubiCasa5K dataset** -- 5,000 floor plan images with annotations across 80+ semantic categories, provided as SVG. The standard benchmark dataset for floor plan analysis. Essential for testing and validating any extraction pipeline.

**MLSTRUCT-FP** -- 954 floor plans with wall annotations in JSON format. Smaller than CubiCasa5K but the JSON annotation format is directly useful for training or validation.

**FloorplanTransformation (ICCV 2017)** -- Raster-to-vector floor plan conversion using integer programming. Older approach but well-cited and architecturally interesting. Combines deep learning (for detection) with optimization (for clean geometry).

### The Gap

Nobody outputs semantic JSON with rooms, relationships, adjacencies, and architectural meaning in a single pipeline.

Commercial tools either require special hardware (Matterport, magicplan, CubiCasa) or target enterprise customers at enterprise prices (Archilogic). The ones that do accept images (RasterScan, RoomSketcher) stop at geometry -- they do not understand what the rooms are or how they relate to each other.

Open source tools stop at pixel masks (DeepFloorplan) or raw geometry (FloorPlanParser). The Raster-to-Graph model outputs a structural graph, which is closer, but still lacks semantic labels and architectural relationships.

FloorplanToJSON fills the gap by combining open-source geometry extraction with Claude Vision's semantic understanding. Computer vision tells you where the walls are. The LLM tells you that the space between those walls is a kitchen that opens to the dining room through an archway and has a bay window overlooking the backyard. Nobody else produces this combination.

The additional geometric analysis layer (compactness, convexity, Good Shape scoring) is entirely absent from every competitor and open-source tool. No existing product tells you whether your rooms are well-shaped or poorly proportioned.

---

## Implementation Plan

### Week 1: Geometry + Semantics

**Days 1-2: Geometry extraction pipeline**
- Deploy FloorPlanParser (or Raster-to-Graph) locally via Docker
- Test on 10 diverse floor plan images: hand sketches, Zillow screenshots, professional scans, real estate flyer scans
- Evaluate accuracy: are wall endpoints correct? Are rooms properly bounded? Are doors and windows detected?
- If FloorPlanParser fails on too many inputs, switch to TF2DeepFloorplan + polygon extraction post-processing

**Days 3-4: Semantic layer**
- Write the Claude Vision prompt for floor plan interpretation
- Test on the same 10 images, requesting room names, functions, relationships, and ambiguity flags
- Iterate on prompt until output is consistently structured and accurate
- Build the merge logic that combines CV geometry with LLM semantics into a single JSON output

**Day 5: Schema definition**
- Formalize the output JSON schema based on what the extraction pipeline actually produces
- Document every field, its type, its source (CV model or LLM), and its confidence level
- Compare against the PRD's semantic model draft (Section 10) and note differences

### Week 2: Analysis + Demo

**Days 6-7: Geometric analysis modules**
- Implement per-room computations: compactness, convexity, aspect ratio, symmetry axes
- Implement Good Shape composite score
- Implement circulation graph extraction from adjacency data
- Test on extracted room polygons from Week 1

**Days 8-9: Visual overlay and demo page**
- Build a web page: upload image, see JSON output, see visual overlay
- Overlay renders room polygons, walls, openings, adjacency lines on top of original image
- Sidebar shows per-room analysis scores
- Handle error cases: what if the CV model fails? What if Claude disagrees with the CV model about room boundaries?

**Day 10: API endpoint**
- Wrap the pipeline in a FastAPI endpoint: POST image, receive JSON
- Add rate limiting, error handling, input validation (file type, file size)
- Document the API

### Week 3: Validation + Polish

**Days 11-13: Real-world validation**
- Process 50 diverse floor plans through the pipeline
- Categorize failures: geometry errors, semantic errors, merge conflicts
- Improve prompts and post-processing based on failure patterns
- Measure accuracy: what percentage of rooms are correctly identified, named, and bounded?

**Day 14: Schema gap analysis**
- Document every case where the schema could not represent what was in the floor plan
- Examples: half-walls, split-level floors, outdoor rooms, lofts, rooms within rooms, curved walls
- These gaps become known issues for the HomeMaker semantic model

---

## Open Questions

- **Accuracy threshold:** How accurate does extraction need to be for downstream scoring to be meaningful? If a wall is off by 1 foot, does it meaningfully change the Good Shape score? Need to run sensitivity analysis on the geometric analysis modules.

- **Scale detection:** How does the system determine real-world dimensions from the image? Some floor plans include scale bars or dimension annotations. Others provide no scale reference. Can Claude Vision estimate scale from known objects (standard door width = 3 feet)?

- **Open floor plans:** How to represent spaces that are architecturally one room but functionally multiple zones? A great room that contains living, dining, and kitchen areas with no walls between them. Is it one room or three? The schema needs to handle both interpretations.

- **Multi-story plans:** Floor plans for multi-story buildings often show each floor separately. How does the system associate rooms across floors? How are stairs represented -- as openings, as rooms, as connections?

- **CV model reliability:** FloorPlanParser and Raster-to-Graph were developed in academic settings and tested on curated datasets. How do they perform on the messy, low-resolution, variably-formatted images that real users will upload? This is unknown until tested.

- **Merge conflicts:** What happens when the CV model and Claude Vision disagree? The CV model says there are 6 rooms, Claude says there are 7 (because it interprets a large closet as a separate room). Need a conflict resolution strategy.

- **Confidence scoring:** How to communicate extraction confidence to the user? A clean professional floor plan should produce high-confidence output. A blurry photo of a napkin sketch should produce low-confidence output with explicit uncertainty markers.

- **Good Shape calibration:** What compactness and convexity thresholds correspond to "good" vs. "poor" room shapes? Need to analyze a corpus of rooms that architects consider well-proportioned and establish empirical benchmarks.

---

## Connection to HomeMaker

**Defines the semantic JSON schema.** Every HomeMaker component -- the scoring engine, the 3D viewer, the command agent, the validity checker -- needs to agree on what a building looks like as data. FloorplanToJSON forces you to define that schema against real floor plans, not in the abstract. The schema produced here becomes the canonical format.

**Builds the Phase 1 V2 image-to-plan extractor.** The PRD explicitly calls for V2 of the Wholeness Analyzer to accept image uploads (Section 5.1). FloorplanToJSON is that capability, extracted as a standalone product. Build it once, use it in the Analyzer, sell it as an API.

**Forces real-world schema validation.** Processing 50+ real floor plans through the pipeline will expose every gap in the semantic model. Does the schema handle split-level homes? Bay windows? Rooms with multiple doors? Open-plan kitchens? Outdoor covered porches? Each gap found during FloorplanToJSON development prevents a schema redesign later when the full product depends on it.

**Provides the geometric analysis engine.** The per-room compactness, convexity, and Good Shape computations built for FloorplanToJSON become scoring engine components. When the Wholeness Analyzer needs to score the Good Shape property, it calls the same functions that FloorplanToJSON uses for its per-room analysis. The WallMath and Room Well-Shaped sub-projects are delivered as part of FloorplanToJSON rather than as separate builds.

**Generates training and calibration data.** Every floor plan processed through the pipeline becomes a data point: a real-world building represented in the semantic schema. This corpus is essential for calibrating the scoring engine (do high-scoring plans correspond to buildings that feel good to live in?) and for testing the command agent (can the LLM generate plans that look like real buildings?).

**Revenue bridge.** The B2B API provides revenue while the full HomeMaker product is still in development. PropTech companies, real estate platforms, and renovation apps all need structured floor plan data. A clean API at $0.10-0.50/call with developer tiers at $49-299/mo is a viable business independent of HomeMaker's timeline.
