# RoomFlow + Lighting

**Status:** Not started
**Priority:** 7
**Time:** 1-2 weeks
**Revenue:** Low — free tool, audience builder
**Roadmap value:** Medium-High — builds the Validity Checker's circulation module and feeds the scoring engine's lighting analysis

---

## Core Concept

Define a set of rooms and their door/window connections. The system visualizes the circulation graph and runs analysis on two dimensions: **movement** (can you reach every room? are there dead ends?) and **light** (does each room get adequate daylight? from how many sides?).

This is the architectural equivalent of a linter. It does not tell you what your house should look like. It tells you what is structurally wrong with what you have drawn.

The tool makes invisible architectural problems visible. Bad circulation is one of the most common floor plan failures and it is nearly invisible on a static drawing. You have to mentally simulate walking through every path to find dead ends, bathroom-access-only bedrooms, kitchens only reachable through the garage. RoomFlow automates that simulation.

Combined, circulation + lighting + depth turns this from a pure connectivity checker into a spatial quality analyzer: three things computable from a floor plan without 3D.

---

## Circulation Analysis

### Why This Matters

Bad circulation is architectural malpractice that hides in plain sight. A floor plan can look perfectly reasonable as a drawing while containing paths that force you to walk through a bedroom to reach the kitchen, or a bathroom that serves as the only hallway between two wings of the house. These problems are discovered only after construction, when fixing them costs tens of thousands of dollars. RoomFlow catches them in seconds.

### Analysis Outputs

**Graph connectivity:** Can you reach every room from the front door? The system builds a graph where rooms are nodes and doors are edges, then runs a connectivity check from the entry node. Any unreachable rooms are flagged immediately.

**Architectural sin detection:** Are there rooms only accessible through a bedroom or bathroom? Certain adjacencies are near-universal violations of residential design norms:
- A bedroom reachable only by passing through another bedroom
- A kitchen or living room accessible only through a bathroom
- A guest room whose only entrance is through the master suite
- A utility room with no path from the entry that avoids private spaces

The system classifies each room by function (public, private, service) and checks that public rooms are reachable via public paths.

**Maximum depth:** How many doors must you pass through to reach the most remote room from the front door? High depth is not inherently bad (a quiet study at the end of a long sequence can be desirable), but extreme depth in frequently-used rooms (kitchens at depth 5) is a warning sign.

**Bottleneck detection:** Which connections carry the most traffic? If every path between the bedroom wing and the kitchen passes through a single doorway, that doorway is a bottleneck. The system identifies high-betweenness edges in the circulation graph.

**Colored graph visualization:** The output is a node-link diagram where rooms are colored by connectivity quality:
- Green for well-connected rooms with multiple access paths
- Yellow for rooms with only one connection (acceptable for bedrooms, not for kitchens)
- Red for problematic rooms (accessible only through private spaces, unreachable, or creating forced paths through inappropriate rooms)

---

## Lighting Analysis

### Why This Matters

Natural light is the single most important factor in how a room feels to occupy, and it is the most commonly sacrificed quality in floor plan design. Alexander codified this in Pattern 159, "Light on Two Sides of Every Room": a room lit from only one side feels gloomy and depressing regardless of how large the window is, because the contrast between the bright window wall and the dark opposite wall creates visual discomfort. A room with light from two or more sides has balanced, even illumination that makes the space feel alive.

Lighting analysis maps directly to Alexander's pattern and affects multiple scoring properties in HomeMaker's engine.

### Analysis Outputs

**Exterior wall count:** For each room, how many of its walls are exterior walls? Interior rooms with zero exterior walls have no possibility of natural light and must be flagged.

**Window inventory:** How many windows does each room have? On which orientations (N/S/E/W)? North-facing windows provide consistent, cool, indirect light. South-facing windows (in the northern hemisphere) provide warm, direct light that varies dramatically through the day. East windows get morning sun. West windows get harsh afternoon sun. The orientation mix matters as much as the count.

**Room depth analysis:** A room deeper than 2.5 times its window height gets no useful daylight at the back wall. This is a well-established rule of thumb in daylighting design. A room with a 1.2m-tall window only gets meaningful daylight for the first 3m of depth. Anything beyond that is effectively artificially lit during the day. The system computes this ratio for every room and flags rooms that exceed it.

**Light on Two Sides check:** Does this room have windows on at least two different walls? This is the core Alexander pattern check. Rooms with windows on two or more walls receive balanced light; rooms with windows on only one wall are marked for review.

### Visualization

Rooms are colored by daylight quality:
- **Gold** for excellent two-sided light (windows on 2+ walls, room depth within the 2.5x rule, favorable orientations)
- **Blue** for dim single-side light (windows on only one wall, or room depth exceeds the 2.5x threshold)
- **Red** for no natural light (no exterior walls or no windows)

The visualization can overlay on the circulation graph, producing a single diagram that communicates both connectivity and light quality at a glance.

---

## Technical Approach

### Data Model

The input is a lightweight room graph, not a full geometric floor plan:

```
Room:
  - id: string
  - name: string
  - function: "living" | "bedroom" | "bathroom" | "kitchen" | "hallway" | "utility" | "entry" | "garage" | "study" | "dining"
  - exterior_walls: int (count of walls facing outside)
  - windows: [{ wall_orientation: "N" | "S" | "E" | "W", height: float }]
  - depth: float (maximum distance from window wall to opposite wall, meters)
  - area: float (square meters, optional for sizing the graph nodes)

Connection:
  - from_room: room_id
  - to_room: room_id
  - type: "door" | "open" (an open connection like an archway or open-plan boundary)
  - width: float (optional, for bottleneck sizing)
```

This schema is deliberately simple. It does not require wall coordinates, exact geometry, or a full floor plan. A user can describe their plan in 5 minutes by listing rooms and their connections.

### Circulation Algorithm

1. **Build the graph.** Rooms become nodes. Doors and open connections become undirected edges.
2. **Connectivity check.** BFS/DFS from the entry node. Flag any room not reached.
3. **Architectural sin scan.** For each room with function "public" or "service" (kitchen, living, dining, utility), check whether all paths from the entry pass through a room with function "bedroom" or "bathroom." If yes, flag it.
4. **Depth calculation.** BFS from entry, recording depth (number of edges) to each room. Report maximum depth and the room(s) that achieve it.
5. **Bottleneck detection.** Compute edge betweenness centrality across all shortest paths. Edges with high betweenness relative to the graph size are bottlenecks.
6. **Coloring.** Assign each room a color based on its flags: unreachable (red), sin-access-only (red), single-connection non-bedroom (yellow), well-connected (green).

### Lighting Algorithm

1. **Exterior wall check.** Rooms with 0 exterior walls are flagged red immediately (no natural light possible).
2. **Window count and orientation.** Collect window data per room. Rooms with 0 windows are flagged red. Rooms with windows on only 1 orientation are flagged blue.
3. **Depth ratio.** For each room, compute `depth / (max_window_height * 2.5)`. If this ratio exceeds 1.0, the back of the room is beyond useful daylight reach. Flag as blue.
4. **Two-sides check.** Count distinct wall orientations that have windows. If >= 2, the room passes Alexander's pattern. Flag as gold.
5. **Combined score.** Rooms that pass all checks (2+ window orientations, depth within ratio, adequate window area) get gold. Rooms that fail one check get blue. Rooms with no natural light get red.

### Visualization

The graph visualization can be built with a force-directed layout library (D3.js force simulation, or a simpler approach using dagre for a layered layout that reflects the depth hierarchy from the entry). Each node is a rounded rectangle sized by room area, colored by the combined circulation + lighting assessment. Edges are lines, with thickness proportional to estimated traffic (betweenness centrality).

A toggle switches between three views:
- **Circulation view:** nodes colored by connectivity quality
- **Lighting view:** nodes colored by daylight quality
- **Combined view:** nodes show both (split coloring or a bivariate color scheme)

### Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Frontend | Next.js (React) | Consistent with HomeMaker stack |
| Graph visualization | D3.js force layout or dagre | Interactive node-link diagram |
| Graph algorithms | Custom JS/TS or graphlib | BFS, betweenness centrality |
| Input UI | Form-based room/connection editor | Add rooms, set properties, draw connections |
| Persistence | localStorage | Auto-save, no backend needed for V1 |

---

## Open Questions

- **How should the input UI work?** A form-based approach (add room, set properties, connect to other rooms) is simplest. A visual drag-and-drop canvas where you draw rooms as bubbles and drag edges between them is more intuitive but more engineering. The RoomGraph sub-project (Priority 5) overlaps heavily here — should RoomFlow inherit RoomGraph's UI or be built independently?

- **Should the system suggest fixes, or only diagnose?** V1 diagnoses only ("this room is only reachable through a bedroom"). V2 could suggest: "Adding a door between the hallway and this room would resolve the access issue." Fix suggestions require pathfinding through potential new connections.

- **How to handle multi-story plans?** Stairs are connections between rooms on different levels. The graph model supports this naturally (a stair is just an edge between a room on floor 1 and a room on floor 2), but the visualization needs thought — a single flat graph, or a layered 3D-ish view?

- **What about open-plan living?** A kitchen-dining-living open-plan space is technically one room or three rooms with "open" connections. How the user models this affects the circulation analysis significantly. Need clear guidance or conventions.

- **How precise does the lighting data need to be?** The 2.5x window-height rule is a rough heuristic. Real daylighting depends on glass transmittance, exterior obstructions, interior surface reflectance, and latitude. Is the heuristic good enough to be useful, or does imprecision make the tool misleading?

- **Should orientation data be derived or manual?** If the user provides a north arrow (or the system gets it from site data), window orientations can be computed from wall positions. But in the simplified room-graph model, wall positions are not explicit. The user may need to manually tag window orientations.

---

## Connection to HomeMaker

**Validity Checker — Circulation Module:** The PRD's Phase 2 lists "all rooms reachable from entry" and "no rooms accessible only through bedrooms/bathrooms" as V1 circulation validity rules. RoomFlow builds and validates exactly these algorithms. The BFS connectivity check, the architectural sin detection, and the depth analysis all become direct components of the Validity Checker that gates every command the AI agent issues.

**Scoring Engine — Lighting Properties:** The lighting analysis feeds HomeMaker's scoring engine in multiple ways. The "Light on Two Sides" check maps to Alexander's Pattern 159 and influences the Strong Centers, Positive Space, and Contrast properties (a well-lit room creates stronger centers and better spatial quality). The window orientation analysis contributes to the Gradients property (light quality should vary intentionally across the plan). Room depth analysis informs the Good Shape property (rooms too deep for their windows are poorly shaped for human use).

**Audience Building:** RoomFlow is a natural free tool for architecture students learning about circulation and daylighting analysis. It requires no sign-up, no payment, and no expertise beyond knowing what rooms are in a floor plan. Every student who uses it discovers HomeMaker. The "architectural linter" framing is immediately understandable to anyone who has used a code linter — it bridges the gap between software developers and architectural design.

**Semantic Model Validation:** Building RoomFlow forces decisions about how rooms, connections, and spatial properties are represented in data. These decisions directly inform the HomeMaker semantic JSON schema, particularly the `rooms` and `openings` arrays and the room function classification system.
