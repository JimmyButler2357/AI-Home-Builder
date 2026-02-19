# HouseJSON Interactive Editor

**Status:** Not started
**Priority:** 6
**Time:** 2 weeks
**Revenue:** Low -- dev tool
**Roadmap value:** High -- defines and stress-tests the semantic JSON schema that every HomeMaker component depends on

---

## Core Concept

A split-screen browser tool for authoring and visualizing semantic house models. The right side renders a live 2D floor plan that updates in real time. The left side is a structured parameter panel with UI controls -- collapsible sections for each room, sections for the overall house, and configuration for connections between spaces. Change any parameter and the floor plan on the right redraws instantly.

This is **not a raw JSON editor**. The left panel presents meaningful architectural parameters through purpose-built controls: sliders, dropdowns, multi-selects, and collapsible sections. Users work in the language of rooms, connections, and spatial intent. The system handles the translation from those parameters into geometry. A "View Source" toggle exists for power users who want to see and edit the raw JSON directly, but the primary interface is the parameter panel.

This sits halfway between RoomGraph (pure topology -- rooms as nodes, adjacencies as edges) and a full CAD tool (pure geometry -- walls, coordinates, exact dimensions). The user works in meaningful parameters and the system handles spatial math. That is exactly the UX philosophy of the full HomeMaker product: the human thinks in terms of intent and relationships, the machine handles the geometry.

### Why This Is the Most Important Technical Decision

The semantic JSON schema is the language the entire HomeMaker product speaks. Every component reads and writes it:

| Component | Relationship to the Schema |
|-----------|---------------------------|
| LLM Command Agent (Phase 2) | Generates JSON by issuing atomic commands |
| Scoring Engine (Phase 1) | Reads JSON to compute wholeness properties |
| 3D Viewer (Phase 3) | Renders JSON as navigable 3D scenes |
| Validity Checker | Validates JSON for geometric and topological correctness |
| Phase 4 Wizard | Presents and modifies JSON through a guided UI |
| Export Pipeline | Converts JSON to floor plans, elevations, PDF |

If the schema is wrong, every component suffers. If it cannot represent a staircase, the command agent cannot place one. If it has no concept of a double-height space, the 3D viewer cannot render one. If load-bearing walls are invisible to the schema, the validity checker cannot enforce structural rules.

Building the editor forces you to manually author house JSON for dozens of real houses. Every real house you model reveals a schema gap: "I can't represent a staircase," "there's no way to express a double-height space," "how do I say this wall is load-bearing?" Each gap found and fixed here prevents a crisis downstream when the scoring engine, command agent, or 3D viewer encounters the same limitation in production.

---

## The Parameter Panel UX

This is the key innovation over a raw JSON editor. Instead of editing `{"name": "Kitchen", "function": "cooking", "area": 14}` as text, the user interacts with purpose-built controls that make the semantics visible and the editing ergonomic.

### Room Sections (Collapsible)

Each room gets a collapsible section in the left panel. Collapsed, it shows the room name and function icon. Expanded, it contains:

- **Room name** -- text input (e.g., "Kitchen", "Primary Bedroom", "Mudroom")
- **Function dropdown** -- one of: living, cooking, sleeping, bathing, working, outdoor, circulation, storage. This is a semantic classification, not just a label. The scoring engine, validity checker, and command agent all use it.
- **Size preference** -- slider from Small to Large, mapped to a target area range appropriate for the function. The slider labels are human-readable ("Compact", "Standard", "Generous", "Large") but resolve to square-meter ranges internally.
- **Connections** -- multi-select dropdown listing all other rooms. Each connection has a type:
  - "opens to Kitchen" (open floor plan, no wall)
  - "door to Hallway" (standard doorway)
  - "visual connection to Garden" (window or pass-through, not a walkable connection)
- **Floor level** -- which story this room belongs to

### Overall House Section

A persistent section at the top of the panel:

- **Number of stories** -- integer selector (1, 2, 3)
- **Total target area** -- slider or numeric input in square meters / square feet
- **Lot dimensions** -- width and depth inputs, with a simple lot outline shown on the floor plan
- **Style notes** -- free text field for intent that doesn't map to structured parameters yet

### Interaction Model

- Every parameter change triggers an instant re-layout and re-render of the floor plan. No "apply" button. The feedback loop is immediate.
- The layout algorithm (from RoomGraph) resolves the topology (rooms + connections) into geometry (wall positions, room shapes) automatically.
- The user never places walls or sets coordinates. They define *what* they want (a kitchen that opens to the dining room and has a door to the hallway) and the system determines *where* it goes.

### View Source Toggle

A toggle in the panel header switches between the parameter panel and a raw JSON editor showing the underlying semantic model. Edits in either view propagate to the other. This serves two purposes:

1. **Power users** can make precise edits that the parameter panel doesn't expose yet
2. **Developers** can inspect and debug the JSON output of other components (command agent, scoring engine) by pasting it directly

---

## Technical Approach

### Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend framework | Next.js (React) | Consistent with HomeMaker's planned stack |
| Parameter panel | React components | Collapsible sections, controlled inputs, state management |
| Floor plan rendering | HTML Canvas or SVG | 2D only for this sub-project; fast re-render on every parameter change |
| Layout algorithm | TypeScript (client-side) | Adapted from RoomGraph's topology-to-geometry solver |
| JSON schema validation | ajv or zod | Validates the semantic model against the schema on every change |
| State management | React state + URL serialization | Shareable URLs that encode the full house model |
| Persistence | localStorage | Auto-save, no backend required |

### Layout Algorithm

The core technical challenge is converting a topology graph (rooms + connections + size preferences) into a 2D floor plan in real time.

Approach:
1. Build a room adjacency graph from the connection definitions
2. Assign target areas to each room based on function + size preference
3. Use a constraint-based layout solver to position rooms, respecting:
   - Adjacency requirements (connected rooms share a wall or opening)
   - Area targets (rooms approximate their target size)
   - Enclosure (all rooms fit within the lot boundary)
   - Non-overlap (rooms do not intersect)
4. Generate wall geometry from the resolved room positions
5. Place openings (doors, open connections) on shared walls

This algorithm does not need to produce beautiful plans. It needs to produce valid, readable plans fast enough for real-time feedback (target: <100ms per layout). The quality of the layout will improve over time and becomes a core research area for the full product.

### Schema-First Development

The JSON schema itself is the primary deliverable of this sub-project. The editor is the tool for stress-testing it.

Starting point: the draft schema from the PRD (Section 10: Semantic Model Schema). Expected evolution during this project:

- **Room function vocabulary** -- the initial set (living, cooking, sleeping, bathing, working, outdoor, circulation, storage) will need expansion. Garage? Workshop? Pantry? Laundry? Each function discovered here gets added to the canonical vocabulary.
- **Connection types** -- the initial set (opens to, door to, visual connection) will need expansion. Archway? Pocket door? Sliding glass? The connection type affects both scoring and rendering.
- **Multi-story representation** -- how rooms on different levels relate. Staircase placement. Double-height spaces that span levels.
- **Structural metadata** -- load-bearing wall designation, which the validity checker will eventually need.
- **Outdoor spaces** -- patios, decks, gardens, courtyards. Are they rooms? Are they a different entity type?

Every schema change made during editor development gets documented as a changelog, creating a design rationale record for the entire project.

---

## Open Questions

- **Layout algorithm complexity:** How sophisticated does the auto-layout need to be for the editor to feel useful? A naive force-directed graph produces ugly plans. A full constraint solver is a multi-week project on its own. Where is the sweet spot?

- **What is the canonical room function vocabulary?** The initial eight categories (living, cooking, sleeping, bathing, working, outdoor, circulation, storage) are a starting point. Real houses have mudrooms, pantries, laundry rooms, garages, workshops, closets, attics. Do these get their own functions or are they subcategories of the initial eight?

- **How to represent multi-story connections?** A staircase connects two floors. An atrium creates a double-height space. A mezzanine is neither fully one floor nor the other. The 2D editor needs to show these relationships even though it renders one floor at a time.

- **How to handle the gap between topology and geometry?** The parameter panel defines topology (rooms and their connections). The floor plan shows geometry (rooms with shapes and positions). Some topologies have many possible geometric realizations. Should the editor let users influence geometry directly (dragging room positions) or keep it purely topological (the algorithm decides all positions)?

- **Should the editor support undo/redo?** Parameter-level undo is straightforward. But does the user also want to undo layout algorithm decisions? This gets complex quickly.

- **How does this editor relate to the Phase 4 wizard?** The wizard walks users through design decisions in Alexander's unfolding sequence. This editor lets users set all parameters freely in any order. Are these fundamentally different tools, or can the editor become the wizard's "expert mode"?

---

## Connection to HomeMaker

- **Defines and stress-tests the semantic JSON schema.** This is the single most important technical decision in the project. Every component -- scoring engine, command agent, 3D viewer, validity checker -- consumes this schema. Gaps found here prevent crises everywhere else.

- **Becomes the developer console for all later phases.** When the command agent generates a house, paste the JSON into this editor to inspect and debug it. When the scoring engine returns unexpected results, load the model here and see what it looks like. When the 3D viewer renders something wrong, compare against the 2D editor's interpretation of the same JSON.

- **The parameter panel UX informs the Phase 4 wizard interface.** The wizard's room configuration steps will use similar controls: function dropdowns, size sliders, connection selectors. Building and testing these controls here, outside the complexity of the full wizard flow, produces battle-tested components that Phase 4 can adopt directly.

- **Tests the real-time layout algorithm needed for the full product.** The full HomeMaker product must re-layout the floor plan every time the user makes a design decision. This editor is the proving ground for that algorithm -- the simplest context in which to develop and optimize it before the scoring engine, 3D viewer, and AI agent add their own latency.

- **Creates a library of hand-authored house models.** Every real house modeled in this editor becomes a test case for the scoring engine ("does this known-good house score well?"), the command agent ("can the LLM reproduce this house from a description?"), and the 3D viewer ("does this render correctly?"). This library is a permanent project asset.
