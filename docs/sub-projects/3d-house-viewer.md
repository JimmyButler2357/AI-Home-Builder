# 3D House Viewer

**Status:** Not Started
**Priority:** 10
**Time Estimate:** 2-3 weeks
**Revenue Model:** Low
**Roadmap Value:** High (directly builds Phase 3: 3D Viewer)

---

## Core Concept

Load a building JSON file. See it rendered in 3D in your browser. Orbit around it. Walk through it in first person. Slice it with a section plane to see interior relationships. Toggle between block-level rendering (simple colored volumes) and architectural rendering (materials, shadows, ambient occlusion).

The core idea is turning data into experience. A floor plan is an abstraction -- lines on paper, coordinates in JSON. But architecture is lived in three dimensions. The moment you can walk through a building model in first person, Alexander's Mirror of the Self test becomes possible in a new way: "Does this space feel alive? Would I want to be here?" That requires experiential immersion, not plan analysis.

A 2D floor plan tells you what a room is. A 3D walkthrough tells you what a room *feels like*. That distinction matters because HomeMaker's entire philosophy rests on the idea that architectural quality is something humans perceive directly -- it is not reducible to metrics on a diagram. The scoring engine can rank options numerically. The 3D viewer lets the human verify that ranking with their own embodied judgment. Without this layer, the product is asking people to choose homes the way they choose spreadsheet rows.

---

## Rendering Pipeline

**Semantic JSON -> Three.js Scene**

The pipeline converts each element in the semantic building model into corresponding Three.js geometry:

### Walls

```
Semantic:
  { type: "wall", start: [0, 0], end: [5, 0], height: 3, thickness: 0.15, exterior: true }

Three.js:
  BoxGeometry(length=5, height=3, depth=0.15)
  -> positioned at midpoint of start/end
  -> rotated to align with wall direction
  -> material: flat color (block) or MeshStandardMaterial with roughness (architectural)
```

Wall geometry is straightforward. Compute the length from start/end coordinates. Create a box. Position it at the midpoint. Rotate it by `atan2(dy, dx)` to align with the wall vector. Exterior walls get a distinct material or color to visually separate the building envelope from interior partitions.

### Openings (Doors and Windows)

```
Semantic:
  { type: "opening", wall_id: "w1", kind: "door", position: 1.2, width: 0.9, height: 2.1 }

Three.js:
  1. Create opening volume (BoxGeometry matching opening dimensions)
  2. CSG subtraction: wall_mesh.subtract(opening_volume) -> wall with hole
  3. Add door/window mesh into the hole:
     - Door: thin box with frame geometry, colored differently
     - Window: thin box with glass material (transparent, slight blue tint, reflective)
```

CSG (Constructive Solid Geometry) boolean subtraction is the key operation here. The `three-csg-ts` library handles this. The workflow is: create the wall as a solid box, create the opening as another box positioned where the door/window goes, subtract the opening from the wall, then place a door or window mesh in the resulting hole.

Performance note: CSG operations are expensive. Pre-compute them when the model loads, not on every frame. Cache the resulting geometry. Only recompute when the model changes.

### Roof

```
Semantic:
  { type: "roof", kind: "gable", boundary: [...], pitch: 35 }

Three.js:
  Custom geometry built from roof type:
  - Gable: two tilted planes meeting at a ridge line
  - Hip: four tilted planes meeting at a ridge
  - Shed: single tilted plane
  - Flat: horizontal plane with slight parapet extrusion
```

Roof geometry is the most complex part of the pipeline because each roof type requires different vertex construction. Start with the building footprint polygon (the boundary), then extrude vertices upward according to the pitch angle and roof type. For a gable roof: find the ridge direction, compute the ridge height from `tan(pitch) * half_width`, create two triangulated faces sloping from ridge to eaves.

For the initial implementation, support only the four basic types listed above. Complex roofs (intersecting gables, dormers, valleys) are deferred -- they require a full roof solver and are not needed for the core viewer experience.

### Rooms

```
Semantic:
  { type: "room", name: "Living Room", walls: ["w1", "w2", "w3", "w4"], function: "living" }

Three.js:
  - Colored floor plane matching room boundary polygon
  - Text label (HTML overlay or drei <Text> component) centered on floor
  - Color mapped to room function:
      living -> warm beige
      kitchen -> light yellow
      bedroom -> soft blue
      bathroom -> pale green
      circulation -> light gray
```

Room floor planes serve dual purposes: they visually distinguish spaces and they provide the ground surface for the first-person camera. Use `ShapeGeometry` from the room's wall boundary polygon. The floor sits at the level elevation. Labels can use drei's `<Text>` component (renders as SDF text in the 3D scene) or HTML overlays (always faces camera, never occluded).

### Scene Assembly

The full pipeline operates in this sequence:

1. Parse the semantic JSON file
2. For each level, set the base elevation
3. Create wall geometries for all walls on that level
4. Perform CSG subtraction for all openings on each wall
5. Add door/window meshes into the openings
6. Create floor planes for all rooms
7. Generate roof geometry from roof definition
8. Add ground plane, ambient lighting, directional light (sun)
9. Set initial camera position

All geometry should be organized in a Three.js `Group` hierarchy mirroring the semantic structure: `Scene > Building > Level > [Walls, Openings, Rooms, Roof]`. This makes it possible to toggle visibility per level (useful for multi-story buildings and the dollhouse camera mode).

---

## Camera Modes

### Orbital Camera

**Purpose:** Overall form evaluation. See the building as an object, understand its massing, proportions, and relationship to the site.

**Controls:**
- Left-click drag: rotate around the building center
- Right-click drag: pan the view
- Scroll wheel: zoom in/out
- Double-click: reset to default view

**Implementation:** drei's `<OrbitControls>` component. Set `target` to the building centroid. Set min/max distance to prevent zooming inside walls or too far away. Enable damping for smooth deceleration after mouse release.

**Default view:** Positioned at roughly 45 degrees elevation, looking at the building from the southeast (convention for architectural presentation). Distance set so the entire building fits in view with some margin.

### First Person Camera

**Purpose:** Experience the space as an occupant. This is where the Mirror of the Self test happens. Does the entry feel welcoming? Does the living room feel spacious? Is the hallway too narrow? These questions can only be answered by being "inside" the space.

**Controls:**
- WASD: move forward/back/left/right
- Mouse movement: look around (pitch and yaw)
- Space: not needed (single level navigation in v1)
- Click to enter first-person mode, Escape to exit

**Implementation:** drei's `<PointerLockControls>` for mouse look. Custom movement logic using keyboard state + `useFrame` to update camera position each frame. Camera height fixed at 1.6m above floor level (average eye height). Movement speed approximately 3m/s (comfortable walking pace).

**Collision detection:** Basic raycasting from the camera position in the movement direction. If a wall is within 0.3m, block movement in that direction. This prevents walking through walls. Use `Raycaster` against the wall mesh group. Four rays (forward, back, left, right) checked each frame.

**Entry point:** When switching to first-person mode, place the camera at the main entry door position, facing inward. If no entry is defined, place at the centroid of the largest room.

### Section Cut

**Purpose:** Reveal interior spatial relationships that are hidden in a solid 3D view. See how rooms connect vertically. Understand the relationship between floor levels. Examine wall thicknesses and spatial proportions.

**Controls:**
- Drag a horizontal plane up/down through the building
- Everything above the plane is hidden (clipped)
- The cut surface shows a filled section profile
- Toggle between horizontal (plan cut) and vertical (section cut) planes

**Implementation:** Three.js clipping planes (`renderer.clippingPlanes`). One global clipping plane that all materials respect. A visible translucent plane mesh shows where the cut is. A slider or drag handle controls the plane position. For the section profile fill: render the clipped geometry's cross-section edges using `EdgesGeometry` filtered to the clip plane, then fill the resulting polygon.

**Default behavior:** Section plane starts above the building (nothing clipped). Drag it down to progressively reveal the interior. At approximately 1.2m above a floor level, you get a traditional architectural plan cut -- walls are sectioned, doors and windows are visible, room relationships are clear.

### Dollhouse Camera

**Purpose:** Tilted top-down view with walls cut at eye level. Popular in Matterport-style viewers. Gives a "looking into a diorama" feeling -- you see the spatial layout with depth, unlike a flat 2D plan, but without the occlusion problems of a full 3D perspective.

**Controls:**
- Same orbital controls as the orbital camera (rotate, pan, zoom)
- But initial position is high above, tilted at roughly 50-60 degrees from vertical
- Walls are automatically clipped at 1.2m height (just above door height)
- Roof is hidden

**Implementation:** Combine orbital camera controls with an automatic section plane at 1.2m above each floor level. Hide roof geometry. This is essentially a pre-configured combination of the orbital camera and the section cut. The wall clipping height should be adjustable via a slider so users can fine-tune what is visible.

### Camera Mode Switching

A toolbar with four icons (or labeled buttons) lets the user switch between modes. The transition should be animated -- smoothly interpolate camera position and rotation from the current view to the new mode's default view over approximately 0.5 seconds. Abrupt camera jumps are disorienting.

State that should persist across mode switches: the current building model, the current fidelity level, any UI selections. State that should reset: camera position (each mode has its own default), control bindings.

---

## Progressive Fidelity

The viewer supports three fidelity levels. The user can toggle between them. The purpose is to match visual complexity to the task at hand.

### Block Level

**Visual quality:** Extruded volumes, flat colors, no shadows, no detail. Every room is a colored box. Walls are gray slabs. No window or door geometry -- just the volumes.

**When used:** Quick comparison of 3-5 design options side by side. At this fidelity, rendering is cheap enough to show multiple models simultaneously in a grid layout. The user is evaluating overall massing, room proportions, and spatial organization -- not materials or details.

**Implementation:**
- `MeshBasicMaterial` (unlit) for all geometry
- No shadow maps
- No ambient occlusion
- Simplified geometry: skip CSG operations entirely, just render walls as solid boxes
- Room volumes as extruded `ShapeGeometry` with flat colors mapped to room function
- No door/window meshes

**Performance target:** 60fps with 3-5 models rendering simultaneously on mid-range hardware (integrated GPU, 2020-era laptop). Each model is approximately 50-200 polygons at this level.

### Architectural Level

**Visual quality:** Basic materials, cast shadows from a directional light (sun), ambient occlusion for depth cues. Walls have a matte plaster-like material. Floors have subtle material differentiation. Windows are transparent with slight reflection. Doors are visible as distinct elements.

**When used:** Evaluating a selected design option in detail. The user has narrowed down from the block-level comparison and wants to understand one option more deeply. Single model on screen.

**Implementation:**
- `MeshStandardMaterial` with `roughness` and `metalness` properties
- Directional light with shadow mapping (`DirectionalLight` with `castShadow: true`)
- Shadow map resolution: 2048x2048 (balance of quality and performance)
- Screen-space ambient occlusion (SSAO) via drei's `<EffectComposer>` + `<SSAO>` from `@react-three/postprocessing`
- CSG operations active: doors and windows cut into walls
- Basic material differentiation: walls are white/cream, floors are warm wood tone, glass is transparent with `opacity: 0.3`

**Performance target:** 60fps with one model on screen. Model is approximately 2,000-10,000 polygons depending on complexity.

### Detailed Level (Future)

**Visual quality:** PBR textures on all surfaces (wood grain floors, brick/stone/stucco walls, tile bathrooms). Vegetation around the building (simple tree and shrub meshes). Site context (ground plane with grass texture, neighboring buildings as simple volumes). Soft ambient lighting. Potentially sky environment map for reflections.

**When used:** Final design review. The user has committed to a design and wants to see it as close to reality as possible before making real-world decisions.

**Implementation (deferred):**
- PBR texture maps (albedo, normal, roughness) from a curated material library
- Instanced vegetation meshes (drei's `<Instances>` for performance)
- Environment map for reflections and ambient lighting (`<Environment>` from drei)
- Possibly tone mapping and bloom for cinematic quality

**Not in scope for initial build.** This level requires a material library, texture asset pipeline, and significant art direction. It is a future enhancement once the block and architectural levels are proven.

### Fidelity Toggle

A simple control (segmented button or dropdown) switches between Block / Architectural / Detailed. The transition should swap materials and toggle post-processing effects without rebuilding the scene graph. Geometry stays the same (except for CSG operations that are skipped at block level).

---

## Technical Approach

### Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| 3D engine | React Three Fiber (R3F) | Declarative Three.js scene management in React |
| Helpers | @react-three/drei | Camera controls, text, loaders, SSAO, environment |
| Post-processing | @react-three/postprocessing | SSAO, tone mapping for architectural fidelity |
| CSG | three-csg-ts | Boolean subtraction for door/window openings |
| UI framework | React | Toolbar, file loading, fidelity toggle, mode buttons |
| Build tool | Vite | Fast dev server, production build |
| Language | TypeScript | Type safety for the JSON schema and scene graph |

### Project Structure

```
3d-house-viewer/
  src/
    components/
      Viewer.tsx            # Main R3F Canvas + scene setup
      Building.tsx          # Converts semantic JSON -> Three.js groups
      Wall.tsx              # Single wall with optional CSG openings
      Room.tsx              # Floor plane + label
      Roof.tsx              # Roof geometry by type
      CameraControls.tsx    # Mode switching + camera management
      SectionPlane.tsx      # Clipping plane UI + logic
      FidelityToggle.tsx    # Block / Architectural / Detailed switch
      Toolbar.tsx           # Camera mode buttons + other controls
    lib/
      parser.ts             # JSON schema validation + parsing
      geometry.ts           # Wall positioning, rotation, CSG helpers
      materials.ts          # Material definitions per fidelity level
      camera-presets.ts     # Default positions/configs per camera mode
    types/
      building.ts           # TypeScript types matching semantic JSON schema
    App.tsx
    main.tsx
  public/
    samples/                # Sample building JSON files for testing
  index.html
  package.json
  tsconfig.json
  vite.config.ts
```

### Semantic JSON Schema (Input Format)

The viewer consumes the same semantic JSON format defined in the HomeMaker PRD (Section 10). A minimal example:

```json
{
  "version": "0.1",
  "site": {
    "boundary": [[0, 0], [20, 0], [20, 15], [0, 15]]
  },
  "levels": [
    {
      "name": "Ground Floor",
      "elevation": 0,
      "height": 3.0,
      "walls": [
        { "id": "w1", "start": [2, 2], "end": [12, 2], "thickness": 0.2, "exterior": true },
        { "id": "w2", "start": [12, 2], "end": [12, 10], "thickness": 0.2, "exterior": true },
        { "id": "w3", "start": [12, 10], "end": [2, 10], "thickness": 0.2, "exterior": true },
        { "id": "w4", "start": [2, 10], "end": [2, 2], "thickness": 0.2, "exterior": true },
        { "id": "w5", "start": [7, 2], "end": [7, 10], "thickness": 0.15, "exterior": false }
      ],
      "openings": [
        { "id": "o1", "wall_id": "w1", "type": "door", "position": 4.0, "width": 0.9, "height": 2.1 },
        { "id": "o2", "wall_id": "w2", "type": "window", "position": 3.0, "width": 1.5, "height": 1.2, "sill_height": 0.9 },
        { "id": "o3", "wall_id": "w5", "type": "door", "position": 3.0, "width": 0.9, "height": 2.1 }
      ],
      "rooms": [
        { "id": "r1", "name": "Living Room", "walls": ["w1", "w5", "w3", "w4"], "function": "living" },
        { "id": "r2", "name": "Bedroom", "walls": ["w5", "w2", "w3"], "function": "bedroom" }
      ]
    }
  ],
  "roof": {
    "type": "gable",
    "pitch": 30,
    "ridge_direction": "east-west"
  }
}
```

The viewer should validate this JSON on load and display clear error messages if required fields are missing or malformed. Use the TypeScript types from `types/building.ts` for compile-time checking and a runtime validator (Zod or a simple hand-written checker) for user-provided files.

### Key Implementation Details

**Coordinate system:** The semantic JSON uses a 2D coordinate system (x, y) for plan positions. In Three.js, map these to (x, z) with y as the vertical axis (Three.js convention). Heights and elevations map to the y axis. This means `start: [2, 5]` becomes `position.x = 2, position.z = 5` in Three.js.

**Units:** All dimensions in the semantic JSON are in meters. Three.js scene units are also meters. No conversion needed. The viewer should display dimensions in the user's preferred unit system (metric or imperial) in the UI, but internally everything is meters.

**Wall positioning math:**
```
Given wall start: [x1, z1], end: [x2, z2], height: h, thickness: t

length = sqrt((x2-x1)^2 + (z2-z1)^2)
angle = atan2(z2-z1, x2-x1)
center_x = (x1 + x2) / 2
center_z = (z1 + z2) / 2
center_y = elevation + h/2

BoxGeometry(length, h, t)
position.set(center_x, center_y, center_z)
rotation.y = -angle
```

**CSG performance strategy:** Boolean operations are computed once when the model loads or changes. The resulting geometry is cached. A loading indicator shows during CSG computation. For a typical house (20-40 openings), CSG computation takes approximately 100-500ms -- acceptable as a one-time cost, not acceptable per frame.

**Multi-model rendering (block level):** For the side-by-side comparison use case, render each model in a separate viewport (or separate R3F Canvas instances). Each viewport gets its own camera and controls. The viewports are synchronized so rotating one rotates all of them. This lets the user compare massing from the same angle.

---

## Open Questions

### Technical

1. **CSG library reliability.** `three-csg-ts` is the most maintained CSG library for Three.js, but CSG in JavaScript has a history of edge cases (non-manifold geometry, coplanar faces causing artifacts). How robust is it with the wall/opening combinations that real house models produce? Needs testing with 10+ sample models to find failure modes.

2. **Multi-model performance ceiling.** The PRD asks whether Three.js can render 3-5 simultaneous block-level models at 60fps (Open Question #8). This viewer is the place to answer that question definitively. Build it, measure it, report the numbers. What GPU tier is the floor? What polygon budget per model keeps us at 60fps x 5 models?

3. **Section plane rendering.** Three.js clipping planes hide geometry but do not fill the cut surface with a solid color. Architecturally, a section cut should show a "poche" (filled wall section). Achieving this requires either: (a) rendering the clipped geometry's back faces with a solid material, or (b) computing the cross-section polygon and rendering it as a filled shape. Which approach is more robust and performant?

4. **First-person collision fidelity.** Simple raycasting works for rectangular rooms but may fail at corners, narrow passages, or near openings. Is a physics engine (like Rapier via @react-three/rapier) needed for reliable collision, or can raycasting be made robust enough with careful implementation?

5. **Mobile performance.** Should the viewer target mobile browsers at all? First-person controls require a mouse (or touch joystick UI). Orbital and dollhouse modes work with touch. What is the polygon budget on mobile GPUs?

### Design

6. **What sample buildings to ship with?** The viewer needs built-in sample JSON files so users can try it immediately without creating their own. What buildings make good demos? A simple single-room structure (minimum viable test). A 3-bedroom house (typical use case). A courtyard house (tests L-shaped and complex room relationships). An Alexander-inspired design (connects to the project philosophy).

7. **How to handle multi-story buildings?** The current approach stacks levels vertically, but navigating between floors in first-person mode requires stairs -- which are not yet in the semantic model. Options: (a) teleport between levels via UI button, (b) defer multi-story to a later version, (c) add a stair primitive to the schema.

8. **Label readability.** Room labels in 3D space suffer from perspective distortion and occlusion. Should labels be 3D text (part of the scene, can be occluded by walls) or HTML overlays (always readable, always on top, but can overlap each other)? Matterport uses HTML overlays. Architectural conventions use 3D text.

---

## Connection to HomeMaker

This sub-project **IS** Phase 3 of the HomeMaker PRD roadmap. Building it as a standalone project means the rendering layer exists, is tested, and is proven before the full Phase 4 product integration.

### What This Proves

- **PRD Technical Question #8:** "Can Three.js render 3-5 simultaneous block-level models at 60fps?" Building the multi-model comparison view answers this directly with measured benchmarks.
- **PRD Research Area R8:** "What level of geometric complexity can Three.js / R3F handle at 60fps?" The viewer provides concrete numbers.
- **Rendering pipeline viability:** The semantic JSON -> Three.js conversion is either straightforward or it surfaces hidden complexity. Better to discover that now than during Phase 4 integration.

### What This Produces for Phase 4

- A tested `Building.tsx` component (and its children) that converts semantic JSON to a Three.js scene. This component drops directly into the Phase 4 product.
- Camera mode implementations (orbital, first-person, section, dollhouse) ready for reuse.
- Progressive fidelity switching logic.
- TypeScript types for the semantic JSON schema, validated against real building models.
- Performance benchmarks that inform the Phase 4 card-based comparison UI design.

### What This Does NOT Cover

- Wholeness scoring (Phase 1 responsibility).
- AI-generated building commands (Phase 2 responsibility).
- The step-by-step unfolding wizard UI (Phase 4 responsibility).
- Real-time model editing (the viewer is read-only; it loads a JSON file and displays it).

The viewer is a pure rendering component. It takes data in, it shows a 3D scene out. That clean boundary is intentional -- it means the component has no dependencies on the scoring engine, the AI agent, or the wizard UI. It can be developed, tested, and shipped independently.

### Integration Path

When Phase 4 begins, the integration looks like this:

1. The wizard UI generates semantic JSON as the user makes decisions at each step.
2. That JSON is passed to the 3D House Viewer component.
3. The viewer renders the current building state in real time.
4. For comparison cards: 3-5 variant JSON objects are each rendered in a small viewport using block-level fidelity.
5. When the user clicks a card to expand it: switch to architectural fidelity in a full-screen viewer with all four camera modes available.

No new rendering code is needed for this integration. The viewer component is already built and tested. Phase 4's job is to wire it into the product flow.
