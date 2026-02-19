# RoomGraph

**Status:** Not started
**Priority:** 5
**Time:** 2-3 weeks
**Revenue:** Low — potential as a free brainstorming tool driving traffic to the main product
**Roadmap value:** Critical — adds the missing topology layer to the semantic model, reframes design as relationships-before-geometry

---

## Core Concept

A tool where you define rooms as nodes and connections as edges, describing the **topology** of a house — what connects to what — without caring about exact geometry. You are working with relationships and boundaries: the Alexandrian qualities of how spaces relate to each other. Draw your rooms as bubbles, drag connections between them, annotate how those connections should feel ("open flow," "thick threshold," "visual only"), then hit "Generate Layout" and the system produces a floor plan that satisfies your adjacency requirements.

The interface is a graph editor. Rooms are draggable nodes with properties (function, size preference, importance). Connections are edges with properties (connection type, boundary quality, transition character). The graph is the design artifact — geometry is derived from it, not the other way around.

This is a tool for thinking about a house before you draw it. It should feel like sketching on a napkin, but with structure underneath.

---

## Why This Is Fundamental

This represents a key conceptual shift for the HomeMaker project.

Alexander's unfolding process is fundamentally about **relationships before geometry**. "The kitchen should connect to the garden" comes before "the kitchen is 4m x 5m at position (3,7)." The current HomeMaker PRD's semantic JSON schema jumps to geometry too quickly — it is all coordinates and wall endpoints. What is missing is the relationship layer that **precedes** geometry.

The insight — which Finch3D built their entire company around — is that the graph is the right abstraction for early design decisions. Geometry is a **consequence** of topology + constraints, not a starting point. Consider the difference:

| Traditional approach | RoomGraph approach |
|---------------------|--------------------|
| "Draw a floor plan" | "Describe relationships" |
| Start with walls and coordinates | Start with rooms and connections |
| Geometry defines adjacency | Adjacency defines geometry |
| Requires spatial reasoning skills | Requires understanding of how you want to live |
| Inaccessible to non-architects | Accessible to anyone who can describe their life |

This reframes the design process from "draw a floor plan" to "describe relationships, then let math resolve them into space." It is much more accessible for non-architects and much more aligned with how Alexander actually thought about design.

Alexander did not start with coordinates. He started with centers and relationships between centers. The 15 properties are about relationships: Boundaries (how centers meet), Deep Interlock (how centers hook into each other), Gradients (how centers transition). The graph is the natural data structure for this way of thinking.

### What the PRD is missing

The current semantic model schema (PRD Section 10) represents a building as levels, walls, openings, and rooms — all defined by coordinates. This is the **output** of design, not the **input**. The relationship graph is the input: it captures design intent at a level of abstraction where non-architects can participate and where Alexander's principles naturally apply.

The unfolding process, properly reframed:
1. **Define centers** — rooms and spaces as graph nodes with qualities
2. **Define relationships** — edges with boundary types and connection qualities
3. **Resolve topology into geometry** — layout algorithm (constraint satisfaction)
4. **Refine geometry** — sizes, proportions, openings, details

Steps 1-2 are RoomGraph. Step 3 is the constraint solver. Step 4 is the detailed editor (Phase 4 of the main product).

---

## The Relationship Graph Schema

This schema is designed to be added to the main PRD as a layer that sits above the geometric semantic model.

```json
{
  "relationships": {
    "nodes": [
      {
        "id": "living",
        "function": "living",
        "size_preference": "large",
        "center_strength": "primary"
      },
      {
        "id": "kitchen",
        "function": "cooking",
        "size_preference": "medium"
      },
      {
        "id": "dining",
        "function": "dining",
        "size_preference": "medium",
        "center_strength": "secondary"
      },
      {
        "id": "garden",
        "function": "outdoor",
        "boundary_type": "permeable"
      },
      {
        "id": "entry",
        "function": "transition",
        "size_preference": "small",
        "boundary_type": "threshold"
      },
      {
        "id": "master_bed",
        "function": "sleeping",
        "size_preference": "large",
        "center_strength": "primary"
      },
      {
        "id": "master_bath",
        "function": "bathing",
        "size_preference": "medium"
      }
    ],
    "edges": [
      {
        "from": "kitchen",
        "to": "living",
        "connection": "open",
        "boundary_quality": "gradient"
      },
      {
        "from": "kitchen",
        "to": "garden",
        "connection": "visual+physical",
        "boundary_quality": "threshold"
      },
      {
        "from": "living",
        "to": "garden",
        "connection": "visual",
        "boundary_quality": "framed_view"
      },
      {
        "from": "living",
        "to": "dining",
        "connection": "open",
        "boundary_quality": "gradient"
      },
      {
        "from": "entry",
        "to": "living",
        "connection": "physical",
        "boundary_quality": "threshold"
      },
      {
        "from": "master_bed",
        "to": "master_bath",
        "connection": "physical",
        "boundary_quality": "gradient"
      }
    ]
  }
}
```

### Node Properties

| Property | Values | Meaning |
|----------|--------|---------|
| `id` | string | Unique identifier |
| `function` | living, cooking, dining, sleeping, bathing, working, storage, transition, outdoor, circulation | What the space is for |
| `size_preference` | small, medium, large, flex | Relative size hint for the layout algorithm |
| `center_strength` | primary, secondary, minor | How important this room is as an organizing center (Alexander's Strong Centers) |
| `boundary_type` | solid, permeable, threshold | How the room's outer boundary relates to context |

### Edge Properties

Edges carry Alexandrian qualities. This is how Alexander actually thinks about design — not coordinates, but the character of relationships between spaces.

| Property | Values | Meaning |
|----------|--------|---------|
| `connection` | open, physical, visual, visual+physical | How you move or see between spaces |
| `boundary_quality` | gradient, threshold, framed_view, solid, screen | The experiential quality of the transition |
| `boundary_thickness` | thin, medium, thick | How much space the boundary itself occupies (a hallway is thick; an open archway is thin) |
| `transition_quality` | abrupt, gradual, ceremonial | How the passage between spaces feels |

**Connection types explained:**
- **open** — no wall, continuous flow (kitchen opens to living room)
- **physical** — a door or opening you walk through (hallway to bedroom)
- **visual** — you can see but not walk (window to garden, half-wall)
- **visual+physical** — both sight and movement (glass door to patio)

**Boundary qualities explained:**
- **gradient** — smooth transition, spaces bleed into each other (open plan areas)
- **threshold** — a marked crossing point, you know you are entering a different space (front door, bedroom door)
- **framed_view** — a deliberate window onto another space (picture window to garden, pass-through to kitchen)
- **solid** — no connection, full separation (bathroom to neighbor's property)
- **screen** — partial visual permeability (lattice, curtain, half-wall)

---

## Technical Approach

### Graph Editor UI

- **Library:** React Flow (preferred) or D3.js force-directed graph
  - React Flow provides a polished node/edge editor out of the box with drag-and-drop, zoom/pan, and edge routing
  - D3.js offers more control over force-directed layout visualization but requires more custom UI work
- **Room nodes:** Draggable bubbles sized by `size_preference`, colored by `function`
- **Connection edges:** Lines between nodes with visual encoding of `connection` type (solid line = physical, dashed = visual, thick = open)
- **Property panels:** Click a node or edge to see and edit its properties in a sidebar
- **Add room:** Click canvas or use a toolbar to add a new room node
- **Add connection:** Drag from one node to another to create an edge
- **Templates:** Pre-built graphs for common house types (studio, 2-bed, 3-bed family, courtyard house) as starting points

### Layout Algorithm

The "Generate Layout" button resolves the abstract graph into a concrete 2D floor plan.

**Approach 1: Force-directed with constraints**
- Treat rooms as charged particles that repel each other
- Connected rooms attract (spring force proportional to connection strength)
- Add constraints: rooms should not overlap, total area should be compact, rooms should have reasonable aspect ratios
- Run simulation until stable, then snap to grid and rectangularize
- Fast, produces organic-feeling layouts, but may need post-processing for architectural plausibility

**Approach 2: Constraint satisfaction (CSP)**
- Define rooms as rectangular regions with min/max dimensions derived from `size_preference`
- Adjacency constraints: connected rooms must share a wall segment
- Non-overlap constraints: rooms cannot intersect
- Compactness objective: minimize bounding rectangle area
- Use a solver (e.g., OR-Tools, custom backtracking) to find valid placements
- Slower, but produces architecturally cleaner results

**Approach 3: Hybrid**
- Use force-directed layout to establish approximate positions
- Use constraint satisfaction to snap rooms into clean rectangular geometry
- Best of both: organic topology resolution + clean geometric output

The recommended approach is **Approach 3 (Hybrid)**. The force-directed step handles the topological problem (what goes where relative to what), and the constraint solver handles the geometric problem (how big, what shape, aligned to what).

### Output

- A 2D floor plan rendered as SVG or Canvas, showing room outlines with labels and door/opening indicators
- The floor plan satisfies the adjacency graph: every edge in the graph corresponds to a shared wall or opening in the plan
- The plan optimizes for compactness and reasonable room proportions
- Users can tweak the result (drag walls, resize rooms) and re-run to refine

### Graph Validation

The graph data structure enables structural validation before layout generation:
- **Reachability:** All rooms must be reachable from the entry node via physical connections (no isolated rooms)
- **No bathroom-only access:** No room should be reachable only by passing through a bathroom
- **Outdoor adjacency:** At least one room must connect to the outdoor/garden node
- **Circulation sanity:** Warn if bedrooms are only reachable through other bedrooms
- **Connected components:** The graph must be fully connected (one house, not two separate structures)

These checks run in real time as the user builds the graph, providing immediate feedback.

### Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Graph editor | React Flow | Node/edge editor with drag-and-drop |
| Frontend | Next.js (React) | Consistent with main HomeMaker stack |
| Layout algorithm | Python (FastAPI backend) | Force-directed (NetworkX) + constraint solver (OR-Tools or custom) |
| Floor plan rendering | SVG (browser) | Clean 2D output with room labels |
| Data format | JSON (the relationship graph schema above) | Portable, LLM-readable |

---

## Open Questions

- **How good can the auto-layout get?** Force-directed layouts of room graphs is a known hard problem. The gap between "satisfies adjacency" and "feels like a real house" may be large. Need to prototype and evaluate. Finch3D has spent years on this — what level of quality is achievable in 2-3 weeks?

- **Should the graph support multi-story?** V1 could be single-floor only. Multi-story adds a second dimension to the graph (vertical connections: stairs, double-height spaces) and significantly complicates layout generation.

- **How to handle rooms that should NOT be adjacent?** The graph captures desired connections. But "the master bedroom should NOT be next to the street" is a negative constraint. Should edges support a "must not be adjacent" type?

- **What is the right level of room abstraction?** Is "kitchen" one node, or is it "cooking zone + eating counter + pantry"? Too coarse and the graph cannot capture important sub-relationships. Too fine and it becomes tedious.

- **How does the user go from generated layout to detailed design?** The layout is a starting point, not a finished floor plan. The handoff from RoomGraph output to the detailed editor (walls, windows, dimensions) needs to be seamless. This is the RoomGraph-to-HouseJSON pipeline.

- **Can the graph representation support Alexandrian scoring?** Some of the 15 properties (Boundaries, Deep Interlock, Gradients) can potentially be evaluated on the graph itself, before geometry exists. This would let users get early wholeness feedback at the relationship stage. Worth investigating.

---

## Connection to HomeMaker

This is potentially the most important sub-project for the main product's architecture. It adds the missing topology layer to the semantic model.

### Phase 4 Wizard Integration

The relationship graph should be a core part of the Phase 4 wizard. The unfolding sequence (PRD Section 8) currently jumps from "site" and "building mass" (Steps 1-2) to "rooms" and "circulation" (Steps 4-5) without an explicit topology step. RoomGraph fills this gap:

```
Step 1-2: Site + Building Mass (existing)
Step 3:   Wings & Zones → expressed as a coarse RoomGraph (public zone, private zone, service zone)
Step 4:   Rooms → expressed as a detailed RoomGraph (individual rooms with connections)
Step 4b:  "Generate Layout" → topology resolved into geometry
Step 5+:  Circulation, Openings, Details → refinement of the generated geometry
```

The user describes relationships. The system resolves geometry. This is Alexander's unfolding process implemented computationally.

### Alignment with Competitors and Research

- **Finch3D** built their company around this exact abstraction: rooms as graph nodes, adjacencies as edges, AI-powered layout resolution. Their success validates the approach.
- **SceneCraft** (ICML 2024) uses scene graphs (nodes = objects, edges = spatial relationships) + constraint-based layout optimization — the same pattern applied to general 3D scenes.
- **Snaptrude's** Program Packing Agent solves a similar problem: given a set of rooms with area requirements and adjacency preferences, pack them into a building envelope.

### Semantic Model Extension

The relationship graph schema defined above should become part of the main PRD's semantic model (Section 10). The full model would then have two layers:

```
Layer 1: Relationship Graph (topology)     ← RoomGraph defines this
  - What spaces exist
  - How they relate
  - What qualities the relationships have

Layer 2: Geometric Model (geometry)        ← Current PRD schema
  - Where walls are
  - How big rooms are
  - Where openings go
```

Layer 1 is the input. Layer 2 is the output. The layout algorithm is the bridge between them. This two-layer architecture mirrors how architects actually think: program and relationships first, then floor plan.

### Brainstorming and Sketching Tool

Beyond its role in the main product pipeline, RoomGraph should be fun and usable as a standalone brainstorming tool for early design thinking. Architects, self-builders, and students should be able to open it, sketch a relationship graph in five minutes, generate a layout, and share it. This positions it as a top-of-funnel tool that introduces people to the HomeMaker approach — design as relationships, not just rectangles.
