# WholenessReno -- Guided Renovation Through Unfolding

**Status:** Not started
**Priority:** 12
**Time:** 3-4 weeks
**Revenue:** High -- $49-99/plan (people uploading renovation plans are about to spend money; the output saves them from making changes in the wrong order)
**Roadmap value:** Medium -- tests Alexander's unfolding process on existing buildings, builds the "diff" capability needed for Phase 4 branching, proves the core score-identify-propose-select-rescore loop

---

## Core Concept

Upload your current floor plan. The system scores it on the 15 properties and identifies the weakest areas -- not as abstract scores, but as spatial problems a homeowner can see and feel:

- "Your entry has no transition space -- you step from outside directly into the living room, which weakens Boundaries."
- "Your kitchen is the largest room but has no windows on the garden side, creating a weak center."
- "Your bedrooms are all the same size with identical doors in a row down the hallway -- no Alternating Repetition, no Gradients."

Then, instead of presenting a finished renovation plan, the system walks the user through an **unfolding renovation sequence** -- Alexander's same sequential process from *The Nature of Order*, but applied to an existing building. Each step addresses the lowest-scoring property that can be improved within the existing structural constraints.

The critical insight: **you do not redesign the whole house.** You heal it step by step, each intervention preserving and strengthening what is already there. Each change creates a new context that affects what should come next. That is pure Alexander -- sequential unfolding, path-dependent design. The order matters because each intervention reshapes the field of wholeness, making some future interventions more effective and others less necessary.

The output is a renovation plan as a **sequence of changes, ordered by impact on wholeness, each building on the last.** This is directly actionable -- a prioritized list of specific physical changes that a homeowner can hand to a contractor, tackle one weekend at a time, or use to plan a phased renovation budget.

### Setting Up a Whole House From the Ground Up

The same unfolding process works for new construction -- start from an empty site, unfold step by step. But the renovation version is the more compelling product because it starts from an existing condition, which is what most people have. Very few people build from scratch. Almost everyone lives in a house that could be better. WholenessReno meets them where they are.

The new-construction version is HomeMaker's Phase 4 wizard. WholenessReno is the renovation counterpart: same unfolding philosophy, same step-by-step process, but starting from a building that already exists rather than a blank slate. The renovation framing is easier to sell ("improve what you have") and easier to build (the existing floor plan provides constraints that simplify the option space).

---

## The Renovation Unfolding Sequence

This is the core experience. The system analyzes the uploaded floor plan, identifies the weakest property, and presents renovation options that address it. The user selects one. The plan updates. Scores recalculate. The system identifies the next weakest property. Repeat.

### Example Walkthrough

A user uploads the floor plan of a 1960s ranch house: three bedrooms, one bathroom, living room, kitchen, single-car garage. The front door opens directly into the living room. The kitchen faces the street. The backyard is invisible from inside the house.

**Step 1: Boundaries (weakest property, score 2.8/10)**

"Your weakest property is Boundaries. The front entry lacks any transition -- you step from the front porch directly into the living room with no threshold, no change in ceiling height, no narrowing. The boundary between outside and inside is a single plane of drywall with a door in it."

Options:
- **(A) Add a vestibule** by partitioning the first 4 feet of the living room with a half-height wall and a lowered ceiling, creating a defined entry zone. Boundaries score: 2.8 -> 5.4.
- **(B) Add a covered porch** outside the front door, extending the roof 6 feet over a flagstone landing with a low wall on one side. Creates a thick exterior boundary. Boundaries score: 2.8 -> 5.9.
- **(C) Create a half-wall with a built-in shelf** that defines the entry zone without a full partition, paired with a change in flooring material from tile to wood at the threshold. Boundaries score: 2.8 -> 4.7.

User selects **(B) -- covered porch**. The plan updates. All 15 properties recalculate.

**Step 2: Strong Centers (next weakest, score 3.1/10)**

"Boundaries improved from 2.8 to 5.9. Strong Centers is now your weakest property. Your living room has no focal point -- the furniture floats in the middle of the room with no wall, window, or built-in element to anchor it. The room reads as a box with stuff in it, not a space organized around a center."

Options:
- **(A) Add a fireplace wall** on the west side of the living room, creating a focal point that anchors the seating area and provides a Strong Center. Score: 3.1 -> 6.2.
- **(B) Create a built-in bookcase** spanning the south wall, with a recessed reading nook at its center that creates a secondary center within the room. Score: 3.1 -> 5.8.
- **(C) Reposition the main window** to create a light-center -- enlarge the south-facing window and add a window seat below it, so the brightest point in the room becomes its organizing center. Score: 3.1 -> 6.0.

User selects **(A) -- fireplace wall**. Plan updates. Scores recalculate. The fireplace wall has also improved Contrast (the solid masonry wall contrasts with the lighter surrounding walls) and created a secondary effect on Positive Space (the seating area now has a defined "back").

**Step 3: Not-Separateness (next weakest, score 3.4/10)**

"Strong Centers improved from 3.1 to 6.2. Not-Separateness is now your weakest area. Your house turns its back on the garden -- the kitchen faces the street, and the only view of the backyard is through a small bathroom window. The house feels disconnected from its site."

Options:
- **(A) Add a kitchen pass-through window** to the back wall, opening a visual and physical connection to the yard. Score: 3.4 -> 4.8.
- **(B) Replace the back wall of the kitchen with sliding glass doors** opening onto a new patio, making the garden an extension of the kitchen. Score: 3.4 -> 6.1.
- **(C) Add a bay window** to the living room's south wall (next to the new fireplace), framing a garden view and creating a gradient from interior warmth to exterior landscape. Score: 3.4 -> 5.5.

User selects **(B)**. And so on.

**Steps 4-7** continue through the next weakest properties: perhaps Levels of Scale (all the trim, windows, and doors are the same size -- add variation), Gradients (the hallway to the bedrooms is uniform -- create a progression from public to private), Positive Space (the corridor is a dead negative space -- widen it into an alcove gallery), and Alternating Repetition (the three bedroom doors in a row are monotonous -- vary their setbacks and framing).

### The Sequence Matters

The order is not arbitrary. Each change creates a new context:

- The covered porch (Step 1) created an exterior room that now participates in the Not-Separateness analysis (Step 3) -- it is a threshold between house and garden.
- The fireplace wall (Step 2) anchored the living room, which means the bay window option in Step 3 now has a spatial relationship to work with (fireplace as center, bay window as secondary center, creating a gradient of enclosure).
- If the user had chosen the vestibule in Step 1 instead of the porch, the Step 3 options would be different -- the interior entry partition would have changed the living room's proportions, potentially making the fireplace wall less effective and the bookcase nook more appropriate.

This path-dependency is the entire point. A conventional renovation planner gives you a wishlist. WholenessReno gives you a **sequence** -- each step informed by every previous choice, each building on the last, the whole process guided by a single measure of what makes the house more alive.

---

## How It Differs from Cost-Based Renovation

This is NOT about dollars per point. It is not a ROI calculator. It is not "spend $5,000 to improve your Zillow estimate by $8,000." Every renovation tool on the market frames improvements in terms of money: cost per square foot, return on investment, budget allocation.

WholenessReno asks a fundamentally different question: **which change should you make FIRST, and why does the order matter?**

| Conventional renovation tools | WholenessReno |
|-------------------------------|---------------|
| "Here are 20 things you could improve" (unordered wishlist) | "Here is the ONE thing to fix first, and here is why it unlocks everything else" |
| Prioritized by cost/benefit ratio | Prioritized by impact on wholeness |
| Each improvement is independent | Each improvement depends on what came before |
| Output: budget spreadsheet | Output: ordered sequence of changes |
| Goal: maximize property value | Goal: maximize the life of the building |
| Changes can be done in any order | Order matters -- each step creates context for the next |

The output is not a finished renovation plan that a contractor builds all at once. It is a **path through renovation space** -- a sequence of interventions that can be executed one at a time, each making the house measurably more whole, each setting up the conditions for the next improvement to be maximally effective.

A homeowner could do Step 1 this spring, Step 2 next fall, Step 3 the following year -- and at every point along the way, the house is in a better state than before. The sequence ensures that no step undoes the good of a previous step, and that each step creates the strongest possible foundation for future work.

This is Alexander's contribution: the insight that design is path-dependent, that the order of operations matters as much as the operations themselves, and that you build wholeness through sequential differentiation rather than simultaneous optimization.

---

## Technical Approach

### Pipeline

```
Floor Plan Image (or structured JSON from FloorplanToJSON)
  |
  v
[Feature Extraction]
  Extract rooms, walls, openings, adjacencies
  (Reuse FloorplanToJSON pipeline if built; otherwise Claude Vision extraction)
  |
  v
[Wholeness Scoring]
  Score all 15 properties on the existing plan
  Identify the lowest-scoring property
  Diagnose the spatial problem causing the low score
  (Reuse WholenessScore.com scoring engine)
  |
  v
[Option Generation]
  For the weakest property, generate 3-5 renovation options
  Each option is a JSON diff against the current semantic model
  Claude generates options informed by:
    - The property definition and what improves it
    - Structural constraints (load-bearing walls, plumbing stacks, exterior walls)
    - The specific geometry of the existing plan
    - Budget-awareness tags (light: paint/furniture, medium: partition/opening, heavy: structural)
  |
  v
[Option Scoring]
  Apply each JSON diff to the current model
  Re-score all 15 properties for each variant
  Compute delta scores (what improved, what got worse, net change)
  Rank options by net wholeness improvement
  |
  v
[Presentation]
  Show the user:
    - The diagnosed problem in plain language
    - 3 ranked options with before/after scores
    - 2D plan overlays showing the proposed change highlighted
    - One-line explanation of why each option helps
  |
  v
[User Selects] --> [Plan Updates] --> [Loop back to Wholeness Scoring]
```

### The JSON Diff

Each renovation option is represented as a diff against the current semantic model. This is the same data structure that Phase 4's branching system will need -- a compact representation of "what changed."

```json
{
  "step": 1,
  "property_addressed": "boundaries",
  "option": "B",
  "description": "Add covered porch extending 6ft from front door",
  "additions": [
    {
      "type": "room",
      "id": "r_porch",
      "name": "Covered Porch",
      "function": "transition",
      "polygon": [[0, -6], [12, -6], [12, 0], [0, 0]]
    },
    {
      "type": "wall",
      "id": "w_porch_1",
      "start": [0, -6],
      "end": [0, 0],
      "thickness": 0.3,
      "exterior": true
    }
  ],
  "modifications": [
    {
      "type": "opening",
      "id": "o_front_door",
      "change": {"connects": ["r_porch", "r_living"]}
    }
  ],
  "removals": [],
  "score_deltas": {
    "boundaries": +3.1,
    "not_separateness": +0.4,
    "positive_space": +0.2,
    "strong_centers": 0,
    "overall_life": +2.8
  }
}
```

This diff format is reusable. Every branch point in Phase 4 is a diff. Every "what if" exploration is a diff. Building the diff system now, in the simpler context of renovation (where changes are incremental rather than generative), creates the infrastructure for the full product.

### Structural Constraints

Renovation is constrained in ways that new construction is not. The system must understand what can and cannot change:

- **Load-bearing walls** cannot be removed (though they can receive openings with proper headers)
- **Plumbing stacks** constrain bathroom and kitchen locations (moving plumbing is expensive)
- **Exterior walls** define the building envelope (additions are possible but are a different category of intervention)
- **Foundation** constrains floor-level changes
- **Roof structure** constrains ceiling modifications

For V1, the system infers constraints from the floor plan:
- Exterior walls are marked as structural
- Interior walls running the full width or length of the house are flagged as potentially load-bearing
- Rooms with plumbing (kitchen, bathrooms) are flagged as plumbing-constrained

The user can override these inferences: "This wall is not load-bearing" or "I am willing to move plumbing."

Each renovation option is tagged with an intervention level:
- **Light** -- paint, furniture, shelving, lighting. No permits needed. Under $1,000.
- **Medium** -- non-structural partitions, new openings in non-bearing walls, built-ins. May need permits. $1,000-10,000.
- **Heavy** -- structural changes, additions, plumbing relocation. Permits required. $10,000+.

The system can filter options by intervention level: "Show me only changes I can do myself this weekend" vs. "Show me everything, including additions."

### Scoring Engine Integration

WholenessReno reuses the same scoring engine as WholenessScore.com and the Phase 1 Wholeness Analyzer. The key addition is **incremental re-scoring**: after each renovation step, the engine must efficiently recompute scores rather than scoring from scratch.

For V1, full re-scoring after each step is acceptable (the plan is small enough that scoring is fast). For later versions, incremental scoring -- only recomputing properties affected by the change -- becomes important for responsiveness.

### 2D Visualization

Each renovation option is shown as a 2D plan overlay:
- Current plan in light gray
- Proposed changes highlighted in color (additions in green, modifications in blue, removals in red)
- Before/after toggle to see the full plan in each state
- Per-property score bars showing deltas

No 3D viewer needed for V1. The 2D overlay is sufficient for renovation planning and significantly simpler to build. If the 3D House Viewer sub-project is built first, it can be integrated as an optional enhancement.

---

## Revenue Model

**$49-99 per renovation plan.** One-time purchase, not subscription.

The pricing is justified by the user's context: someone uploading a floor plan for renovation analysis is about to spend real money on construction. The median US home renovation costs $15,000-75,000. A $49-99 plan that tells them which changes to make first -- and which changes to skip -- saves them from the most expensive renovation mistake: doing things in the wrong order.

Common renovation disasters that WholenessReno prevents:
- Opening up the kitchen before addressing the entry sequence, leaving the house with no spatial hierarchy
- Adding a master suite before fixing circulation, creating a dead-end floor plan
- Installing expensive finishes in a room that will later need structural modification
- Making cosmetic changes that mask deeper spatial problems

### Pricing Tiers

| Tier | Price | Includes |
|------|-------|---------|
| **Quick Scan** | $49 | Upload plan, get top 5 weaknesses diagnosed with explanations. No renovation sequence. |
| **Full Sequence** | $79 | Complete unfolding renovation sequence (5-7 steps) with options at each step. Downloadable PDF report. |
| **Interactive** | $99 | Full sequence plus the ability to re-run with different choices, explore branches, and filter by intervention level. |

### Why People Will Pay

- **Timing:** They are already spending money. $79 is trivial compared to a $30,000 kitchen remodel.
- **Specificity:** The output is not generic advice ("consider better lighting"). It is specific to their floor plan ("add a 4-foot vestibule by partitioning here, which will improve Boundaries from 2.8 to 5.4").
- **Sequencing:** No other tool tells them what order to renovate in. Every other tool gives them a flat list. The sequence is the unique value.
- **Confidence:** The mathematical scoring gives homeowners confidence that their renovation priorities are grounded in something more rigorous than a contractor's opinion or a Pinterest mood board.

---

## Open Questions

- **How accurate does floor plan extraction need to be for renovation scoring to be meaningful?** If the system misidentifies a load-bearing wall, it could suggest removing it. If room dimensions are off by 2 feet, do the property scores change significantly? Need to run sensitivity analysis on extracted plans vs. ground truth.

- **How to handle the gap between spatial advice and construction reality?** The system might suggest "add a vestibule by partitioning the first 4 feet of the living room," but it cannot produce construction drawings. How much detail is enough for the user to act on? Is a dimensioned 2D sketch sufficient, or do users need more?

- **How to represent constraints the system cannot see?** The floor plan does not show load-bearing walls, plumbing locations, electrical panels, HVAC ductwork, or foundation type. Should the system ask the user to annotate these? Should it assume worst-case (all interior walls are load-bearing) and let the user relax constraints?

- **How many renovation steps is the right number?** Too few (2-3) and the sequence does not demonstrate path-dependency. Too many (10+) and the user loses interest. The current target of 5-7 steps is a hypothesis that needs testing.

- **Should the system account for budget?** The current design ignores cost entirely, focusing on wholeness. But a user who can only afford $5,000 in renovations does not want to see a sequence that starts with a $15,000 addition. Should there be a budget filter, or does that compromise the purity of the wholeness-driven sequence?

- **Can the LLM generate structurally plausible renovation options?** The options need to be physically buildable, not just geometrically valid. "Add a vestibule" is easy. "Remove this wall and replace with a steel beam" requires structural knowledge. How much structural reasoning can the LLM provide, and where does it need guardrails?

- **How to handle historic or architecturally significant homes?** Some houses have qualities worth preserving that the scoring engine might not recognize. A Craftsman bungalow's low ceilings score poorly on some properties but are part of its character. Should the system have a "preserve character" mode?

---

## Connection to HomeMaker

WholenessReno is not a detour from the main product. It tests and builds four specific capabilities that HomeMaker needs.

### Tests Alexander's Unfolding Process on Existing Buildings

The HomeMaker PRD describes unfolding as starting from an empty site. WholenessReno tests whether the same process works in reverse -- starting from an existing building and unfolding improvements. If the score-diagnose-propose-select-rescore loop produces renovation sequences that feel right to users, it validates the core process for new construction too. If it fails -- if the suggested sequences feel arbitrary or the order does not matter -- that is a signal that the unfolding implementation needs work before Phase 4.

### Builds the "Diff" Capability for Phase 4 Branching

Phase 4's branch-and-compare system (PRD Section 8) requires representing design changes as diffs against a base state. WholenessReno forces this capability to be built in a simpler context: renovation diffs are small (one room changed, one wall added) compared to new-construction diffs (entire floor plan different). Building the diff format, the diff-application logic, and the diff-visualization now means Phase 4 can inherit a tested system rather than building it from scratch under the pressure of a more complex product.

### The Step-by-Step Renovation UI Is a Simplified Phase 4 Wizard

The WholenessReno user experience -- present a problem, show options with scores, let user choose, update and repeat -- is exactly the Phase 4 wizard's core interaction pattern, but with fewer variables. The renovation UI does not need to handle site orientation, building mass, or multi-story layouts. It starts from a known floor plan and makes incremental changes. This simpler version lets the UI patterns be tested and refined before they are applied to the full design wizard.

### Proves the Core Loop

The entire HomeMaker product rests on a single loop:

```
Score the current state
  -> Identify the weakest property
    -> Propose options that address it
      -> User selects one
        -> Re-score
          -> Repeat
```

WholenessReno is the purest test of this loop. If the loop produces renovation sequences that homeowners find valuable and actionable, the core product works. If the loop produces sequences that feel random or unhelpful, the scoring engine or the option generation needs fundamental rethinking -- and it is better to discover that in a 3-4 week sub-project than in the middle of Phase 4 development.

### Component Reuse Map

| WholenessReno Component | Reused In |
|--------------------------|-----------|
| Floor plan extraction pipeline | Phase 1 Wholeness Analyzer (image upload) |
| 15-property scoring engine | Every HomeMaker phase |
| JSON diff format | Phase 4 branching system |
| Option generation prompts | Phase 4 step options |
| Step-by-step UI pattern | Phase 4 wizard |
| Incremental re-scoring | Phase 4 real-time scoring |
| Constraint representation (structural, plumbing) | Phase 4 validity checker |
| Before/after visualization | Phase 4 branch comparison |
