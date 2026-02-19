# PromptToHouse

**Status:** Not started
**Priority:** 9
**Time:** 2-3 weeks
**Revenue:** Low — research prototype, not directly monetizable
**Roadmap value:** High — validates the riskiest technical bet in the entire HomeMaker product

---

## Core Concept

Type a natural language description of a building:

> "A two-bedroom cottage with a covered porch, the kitchen opening to a back garden, a reading nook by the fireplace."

Watch as the system generates building commands one at a time -- `place_wall`, `create_opening`, `define_room` -- and the floor plan assembles itself step by step on screen. When a command fails validation (wall intersection, unreachable room), it flashes red and the system retries with a corrected command. When it succeeds, the element appears in the growing plan.

The core question this project answers: **can language models think spatially?**

This is the riskiest technical bet in the entire HomeMaker product. LLMs process text. Architecture is spatial. The gap between those two worlds is enormous. Can a text-based intelligence reliably translate "kitchen opening to the garden" into a precise wall-and-door arrangement that is geometrically valid, architecturally coherent, and doesn't create rooms you can only reach through the bathroom?

Nobody knows the answer yet. PromptToHouse is designed to find out.

The visual feedback loop -- watching commands execute and fail in real time -- is not just a demo. It is a research tool. You will see HOW the LLM fails. Does it lose track of coordinates after placing the fifth wall? Does it forget which walls it already placed? Does it create impossibly narrow rooms? Does it put doors in exterior walls that face nowhere? Each failure mode suggests a specific fix, and the real-time visualization makes those failure modes legible.

This directly answers **PRD Open Question #2**: "Will LLM agent command sequences produce coherent buildings?" and tests the PRD target of **>70% validity rate** for generated command sequences.

---

## Technical Approach

### Architecture Overview

```
User prompt ("A two-bedroom cottage with a covered porch...")
  |
  v
LLM Agent (Claude API)
  |-- Receives: user prompt + current building state summary + command vocabulary
  |-- Returns: next command (one at a time) or DONE signal
  |
  v
Command Parser
  |-- Parses the LLM's output into a structured command object
  |-- Rejects malformed commands before they reach validation
  |
  v
Validity Checker
  |-- Geometric: no wall intersections, rooms are closed polygons, minimum dimensions
  |-- Circulation: all rooms reachable, no bedroom-only access paths
  |-- If INVALID: flash red in UI, feed error back to LLM, request retry (max 3 retries)
  |-- If VALID: apply command to building state
  |
  v
Building State (Semantic JSON)
  |-- Accumulated walls, openings, rooms
  |-- Updated after each valid command
  |-- Summary fed back to LLM for next command
  |
  v
2D Renderer (HTML Canvas or SVG)
  |-- Draws the current building state
  |-- Animates each new element appearing
  |-- Highlights failed commands in red before they fade
```

### The Command Vocabulary

Use the PRD's Phase 2 command vocabulary directly. This project is its first real test.

**Site commands:**
- `set_boundary(polygon)` -- define the building footprint boundary
- `set_orientation(degrees)` -- true north for garden/sun references

**Building commands:**
- `place_wall(start, end, height, thickness)` -- the fundamental operation
- `create_opening(wall_id, type[door|window], position, width, height)` -- cut holes in walls
- `define_room(name, boundary_walls[])` -- name a closed set of walls as a room
- `set_floor_level(level, height)` -- for multi-story designs

**Modification commands:**
- `move_wall(wall_id, offset)` -- adjust after placement
- `extend_wall(wall_id, new_endpoint)` -- grow a wall
- `subdivide_room(room_id, wall_placement)` -- split a room in two

### LLM Prompting Strategy

The LLM prompt has three sections that evolve as the building grows:

1. **System prompt (static):** You are an architect generating building commands one at a time. Here is the command vocabulary with syntax. Here are the rules for valid buildings. Always think step by step: first the exterior walls, then interior divisions, then openings, then room definitions.

2. **Building state summary (dynamic, updated after each command):** Current walls with IDs and coordinates. Current openings. Current rooms. Remaining area not yet assigned. Which sides face which direction (for "kitchen opening to the garden" type references).

3. **User intent (static):** The original natural language description, plus any clarifications.

The state summary is the critical innovation. Without it, the LLM will lose track of coordinates by the fifth command. The summary must be concise (to stay within context limits) but complete (so the LLM knows exactly what exists and where).

### Validation Rules (V1)

**Geometric validity:**
- Walls must not intersect except at shared endpoints
- Rooms must form closed polygons (every wall connects to the next)
- Minimum room dimension: 6 feet by 6 feet (configurable)
- Openings must fit within the wall they reference (position + width <= wall length)
- Wall thickness must be positive and reasonable (0.1m to 0.5m)

**Circulation validity:**
- All rooms must be reachable from at least one exterior door via a connected graph of doors
- No room accessible only through a bedroom or bathroom (except closets/en-suites attached to that bedroom/bathroom)
- At least one exterior door must exist

**Sanity checks:**
- Total building footprint must be within a reasonable range of the implied size (if "two-bedroom cottage" typically implies 800-1200 sq ft, flag a 5000 sq ft result)
- Room proportions should be reasonable (no 2-foot-wide by 40-foot-long rooms)
- Named rooms should have appropriate sizes (a bathroom should not be 500 sq ft)

### The Real-Time UI

The interface has two panels:

**Left panel: the growing floor plan.** Starts empty. As each command executes, the corresponding element animates into place. Walls draw themselves from start to end. Openings cut into walls with a brief animation. Room labels fade in when defined. Failed commands flash the attempted element in red, then it disappears.

**Right panel: the command log.** A scrolling feed showing each command as it is issued, with status indicators:
- Green checkmark: command validated and applied
- Red X: command failed validation, with the error reason
- Yellow retry: command is being retried with corrections
- Spinner: waiting for next command from LLM

**Top bar: the original prompt** and a progress indicator (commands issued / estimated total).

**Bottom bar: controls.** Pause/resume generation. Speed slider (instant vs. animated). Reset and try again. Edit the prompt and regenerate.

### Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Frontend | Next.js (React) | Consistent with PRD stack |
| 2D Rendering | HTML Canvas or SVG | SVG simpler for individual element animation |
| Backend | Python (FastAPI) | Command validation, state management |
| LLM | Claude API (streaming) | Stream tokens for real-time command display |
| State | In-memory (Python) | No persistence needed for research prototype |

### Streaming Implementation

Use Claude's streaming API to display commands as they are generated, not after. The user sees the LLM "thinking" -- tokens appearing in the command log -- before the command is complete. Once a full command is parsed, it is sent to the validator. This creates the live, watching-it-happen experience.

```
Token stream: p-l-a-c-e-_-w-a-l-l-(-[-0-,-0-]-,- -[-8-,-0-]-,- ...-)
                                                                    ^
                                                          Command complete!
                                                          -> Parse -> Validate -> Render
```

---

## What You Learn From Failures

Each failure mode points to a specific architectural fix. This is why the project is valuable even if (especially if) the LLM struggles.

### Failure Mode: LLM Loses Spatial Tracking

**Symptom:** After 5-10 commands, the LLM starts placing walls that overlap existing walls, or references coordinates that don't connect to anything. The plan becomes a mess of disconnected line segments.

**Diagnosis:** The LLM's internal "mental model" of the building has drifted from reality. It is hallucinating the building state.

**Fix:** Include a complete, structured state summary in every prompt. Not just "you placed some walls" but the exact coordinates and IDs of everything that exists. Test whether a more compact representation (grid-based? room-graph?) helps the LLM maintain coherence.

### Failure Mode: Commands Are Geometrically Invalid

**Symptom:** Most commands fail validation. Walls overshoot, openings are placed outside wall bounds, rooms don't close.

**Diagnosis:** The command vocabulary's coordinate system is too free-form for the LLM. It cannot reliably work in absolute X/Y coordinates.

**Fix:** Consider a different command vocabulary. Instead of `place_wall([0,0], [8,0])` with absolute coordinates, try relative commands: `place_wall(from: "north_wall_of_kitchen", offset: 3m_south, length: 5m, direction: east)`. Or try a grid-snapping system where coordinates must be multiples of 0.5m. Or try a higher-level vocabulary entirely: `create_room(name: "kitchen", width: 4m, depth: 5m, adjacent_to: "dining_room", shared_wall: "south")`.

### Failure Mode: Designs Are Valid But Architecturally Bad

**Symptom:** Commands pass validation. Rooms are reachable. But the resulting plan is ugly, awkward, or ignores the user's intent. The kitchen is nowhere near the garden. The reading nook is in a windowless interior corner. Rooms are all the same size.

**Diagnosis:** The command vocabulary and validation are working. The problem is in the prompting. The LLM lacks architectural knowledge about what makes a good plan.

**Fix:** Inject architectural knowledge into the system prompt. Add Alexander's patterns as context: "kitchens should connect to outdoor space" (Pattern 139: Kitchen Garden), "every room should have light from two sides" (Pattern 159). Add rules of thumb: "public rooms near the entry, private rooms further away," "the kitchen-dining-living triangle should be compact." This is prompt engineering, not a vocabulary change.

### Failure Mode: Designs Are Repetitive

**Symptom:** Running the same prompt five times produces essentially the same plan every time. No variety.

**Diagnosis:** The LLM has found one "safe" solution and is not exploring alternatives.

**Fix:** Temperature/variation strategies. Increase temperature parameter. Add explicit variation instructions: "generate a plan that is DIFFERENT from the following previous attempts: [previous plans]." Seed with different starting moves: "start by placing the living room in the northeast corner" vs. "start by placing the living room in the center."

### Failure Mode: The LLM Generates Too Many Commands

**Symptom:** The LLM keeps generating commands long after the plan is complete. It adds unnecessary walls, extra rooms not in the prompt, or starts modifying what it already placed in an endless loop.

**Diagnosis:** The LLM does not have a clear sense of "done."

**Fix:** Add an explicit completion check. After each command, ask: "Is the building complete? Are all rooms from the user's description present and connected?" Include a `DONE` command in the vocabulary. Add a hard cap on command count relative to the building complexity.

---

## Test Protocol

Directly implements the PRD's Phase 2 test protocol:

### Test Prompts (Simple to Complex)

| # | Prompt | Expected Complexity |
|---|--------|-------------------|
| 1 | "A single room, 12 feet by 15 feet, with a door on the south wall and a window on the east wall." | Trivial -- 4 walls, 2 openings |
| 2 | "A one-bedroom studio apartment, 500 square feet, with a bathroom and kitchenette." | Simple -- 3-4 rooms |
| 3 | "A two-bedroom cottage with a covered porch, the kitchen opening to a back garden, a reading nook by the fireplace." | Medium -- 5-6 rooms, spatial intent |
| 4 | "A three-bedroom family home with open-plan living, dining, and kitchen. Master bedroom with en-suite. 1800 square feet." | Medium-complex -- 7-8 rooms, open plan |
| 5 | "An L-shaped house wrapping around a courtyard, with the living areas opening to the courtyard and bedrooms in the quiet wing. 2400 square feet." | Complex -- non-rectangular footprint, spatial relationships |
| 6 | "A two-story home with living spaces downstairs and bedrooms upstairs. Central staircase. Covered front porch." | Complex -- multi-level |
| 7 | "A narrow rowhouse, 16 feet wide and 50 feet deep, with a rear garden. Three bedrooms, two bathrooms." | Constrained -- unusual proportions |
| 8 | "A house with a large central kitchen that connects to the dining room, living room, and back patio. The entry should feel welcoming with a transition from public to private." | Intent-heavy -- architectural qualities, not just rooms |
| 9 | "A house for a family of five with a home office that is acoustically separated from children's play areas. Two children share a room, one has their own." | Programmatic -- functional requirements beyond geometry |
| 10 | "A courtyard house inspired by Mediterranean tradition. All rooms open to the central courtyard. Thick walls. Deep window reveals." | Stylistic -- cultural/aesthetic intent |

### Measurement Protocol

Run each prompt 5 times. For each run, record:

1. **Command count:** How many commands were issued before completion or failure
2. **Validity rate:** Percentage of commands that passed validation on first attempt
3. **Retry success rate:** Of failed commands, how many succeeded after retry
4. **Final plan validity:** Does the completed plan pass all geometric and circulation checks?
5. **Architectural coherence (human judgment, 1-5 scale):**
   - 1 = Nonsensical (rooms in wrong places, inaccessible spaces)
   - 2 = Technically valid but poor (awkward proportions, ignored intent)
   - 3 = Acceptable (reasonable plan, mostly matches intent)
   - 4 = Good (well-organized, matches intent, pleasant proportions)
   - 5 = Impressive (creative, fully matches intent, architecturally thoughtful)
6. **Intent fulfillment:** Does the plan actually have the features described? (kitchen near garden, reading nook, etc.)
7. **Variety score:** Across 5 runs of the same prompt, how different are the results? (1 = identical, 5 = very different)

### Success Criteria

These map to the PRD's Phase 2 targets:

- **>70% of command sequences produce geometrically valid final plans** (PRD target)
- **>50% of valid plans score 3+ on architectural coherence** (PRD target)
- **>60% intent fulfillment** across test prompts that specify spatial relationships
- **Variety score averages >2.5** across all prompts (the LLM produces meaningfully different plans on repeated runs)
- **Average retry success rate >50%** (the LLM can self-correct when told a command failed)

---

## Open Questions

### Command Vocabulary Design
- Is the PRD's command vocabulary the right level of abstraction? Should commands be lower-level (place individual wall segments) or higher-level (create room with dimensions and adjacency)?
- Should coordinates be absolute (X/Y) or relative to existing elements ("3 meters south of the kitchen's north wall")?
- How should the vocabulary handle open-plan spaces where "rooms" share walls or have no wall between them?
- Does the LLM perform better with imperial or metric units? (Seems trivial, but the LLM's training data distribution matters.)

### LLM Behavior
- How large can the building state summary be before it degrades the LLM's command quality?
- Is one-command-at-a-time the right granularity, or should the LLM generate batches of related commands (all exterior walls, then all interior walls)?
- Does few-shot prompting with example command sequences significantly improve validity rates?
- Which Claude model performs best? Does Opus produce better spatial reasoning than Sonnet? Is the quality difference worth the cost and latency for a research prototype?

### Validation
- How strict should validation be? Rejecting every minor geometric imprecision will frustrate the LLM. Being too lenient produces sloppy plans.
- Should the validator suggest corrections ("wall overshoots by 0.3m, truncating") or just reject ("invalid, wall extends beyond room boundary")?
- How to handle ambiguous cases where the plan is geometrically valid but architecturally questionable (a bedroom with no window)?

### UX and Research
- Should the user be able to intervene mid-generation? ("Stop, move that wall over, then continue.")
- How to present the results for non-technical observers? The command log is a research tool, but a demo audience wants to see the house build itself, not read JSON.
- Should the system save and compare multiple runs of the same prompt side by side?

---

## Connection to HomeMaker

PromptToHouse is not a side project. It IS Phase 2's research prototype.

**What it validates:**
- The **command agent approach** -- whether LLMs can drive building generation through atomic commands at all. If this fails, HomeMaker Phase 4 needs a fundamentally different generation strategy (constrained parametric, evolutionary search, or manual-only design).
- The **command vocabulary** -- whether the PRD's proposed commands are expressive enough, at the right abstraction level, and parseable by the LLM. Every gap discovered here informs the vocabulary revision.
- The **validity checker** -- the geometric and circulation rules that will be reused directly in the full product. Every edge case found here is a rule that gets added.
- The **state representation** -- whether the semantic JSON model is sufficient as working memory for the LLM. If the model is too verbose or too sparse, the schema needs revision.

**What it produces:**
- A **failure taxonomy** -- documented categories of LLM spatial reasoning failures, each with a corresponding mitigation strategy. This is the most valuable research output.
- **Demo content** -- "watch a house build itself from a text description" is a highly shareable, visually compelling demonstration. This is marketing material for HomeMaker before HomeMaker exists.
- **Calibration data** -- generated plans with known prompts, scored for validity and coherence. This becomes test data for the scoring engine (Phase 1) and benchmark data for future model improvements.
- **Prompt engineering knowledge** -- what system prompts, state representations, and instruction styles produce the best results. This transfers directly to Phase 4's LLM orchestrator.

**Where it sits in the dependency graph:**
```
PromptToHouse (this project)
  |
  |-- validates -> Command Agent approach (Phase 2)
  |-- tests     -> Command Vocabulary (Phase 2)
  |-- builds    -> Validity Checker (reused in Phase 4)
  |-- informs   -> Semantic JSON schema (Phase 2/4)
  |-- produces  -> Demo content (marketing)
  |-- feeds     -> Scoring engine test data (Phase 1)
  |
  v
Phase 4: Full Product
  (uses validated command agent + vocabulary + validator)
```

If PromptToHouse succeeds (>70% validity), HomeMaker's AI generation layer is feasible. If it fails, you know exactly why and what to try next. Either outcome is progress.
