# DwellTune -> House Output

**Status:** Not started
**Priority:** 11
**Time:** 2-3 weeks
**Revenue:** Medium — $9.99-19.99 per generated house
**Roadmap value:** Medium — proves the core loop (preferences -> parameters -> design) that becomes the Phase 4 wizard

---

## Core Concept

Answer 15-20 questions about how you want to live. The system maps your answers to property weights and pattern priorities. It generates a house design — a floor plan and ideally a 3D model — that embodies those preferences. You see "your" house.

This is NOT just a personality quiz. The output is an actual architectural design. The quiz IS the preference elicitation system, and the output IS a first-pass design. The personality profile is a means to an end — the end is "here is YOUR house."

Most "what's your style?" quizzes end with a label: "You're a Mid-Century Modernist!" or "Your vibe is Scandinavian Cozy!" DwellTune ends with a floor plan and a 3D model. The quiz questions are carefully designed to extract the spatial and experiential preferences that determine architectural form — not surface style, but the deep structure of how you want to live.

---

## The Preference-to-Design Pipeline

```
15-20 questions about how you want to live
  -> Each answer adjusts weights on Alexander's 15 properties
  -> Each answer selects or deprioritizes patterns from Alexander's pattern language
  -> The weighted property profile + selected patterns become generation parameters
  -> Generation pipeline (RoomGraph -> layout or PromptToHouse command agent) produces a floor plan
  -> 3D House Viewer renders the result as a navigable model
  -> User sees "your house" — not a style label, not a mood board, a building
```

The pipeline has three distinct translation steps:

### Step 1: Subjective Language -> Concrete Tradeoffs

The questions do not ask "Do you like cozy spaces?" — that is too vague. Instead, they present concrete tradeoffs that disambiguate what "cozy" means to this specific person:

- "When you imagine your ideal evening at home, are you in a small room with thick walls and low light, or a large room with tall windows and open views?"
- "Would you rather have fewer, larger rooms or more, smaller rooms?"
- "When you enter your home, do you want to see the whole space at once, or move through a sequence of reveals?"

Each question forces a choice between two architectural conditions. There is no "both" option. The forced tradeoff is what makes the output specific enough to generate a real design.

### Step 2: Tradeoff Answers -> Property Weights and Pattern Selections

Each answer maps to specific adjustments in two systems:

**Property weights** — the 15 properties from Alexander's framework, each weighted 0.0-1.0 based on cumulative answers. Someone who consistently chooses intimate spaces, thick boundaries, and nested rooms ends up with high weights on Boundaries, Deep Interlock, and Gradients. Someone who chooses open views, connected spaces, and dramatic contrasts ends up with high weights on Strong Centers, Contrast, and Levels of Scale.

**Pattern selections** — specific patterns from Alexander's pattern language that are activated or deprioritized. The answer "I want to move through a sequence of reveals when entering" activates patterns like Entrance Transition (#112), Intimacy Gradient (#127), and Sequence of Sitting Spaces (#142). The answer "I want to see the whole space at once" deprioritizes those in favor of Open Plan and Common Areas at the Heart (#129).

### Step 3: Weights and Patterns -> Architectural Design

The weighted property profile and selected patterns are fed as parameters to the generation pipeline:

- **If RoomGraph exists:** The pattern selections determine which rooms to include and how they connect (topology). The property weights influence the layout algorithm's optimization targets — a high Boundaries weight biases toward thicker walls and more transition spaces; a high Positive Space weight biases toward convex rooms with well-shaped leftover spaces.
- **If PromptToHouse exists:** The property weights and pattern selections are compiled into a structured prompt for the LLM command agent. "Generate a 3-bedroom house prioritizing Strong Centers (0.9), Boundaries (0.8), and Gradients (0.7). Include patterns: Entrance Transition, Intimacy Gradient, Alcoves, Light on Two Sides. Deprioritize: Open Plan."
- **Fallback:** Even without either pipeline, the quiz output can be rendered as a constrained prompt to Claude that describes the house in enough detail for the LLM to produce a plausible floor plan as structured JSON, which the 2D renderer draws.

---

## Alexander's Vocabulary as Translation Layer

This is the key innovation. Most people cannot articulate architectural preferences in architectural terms. "I like cozy" could mean smaller rooms, lower ceilings, warmer materials, more enclosure, nesting spaces, or all of these simultaneously. "I want natural light" could mean skylights, floor-to-ceiling windows, light on two sides, or a courtyard. The words are too imprecise to generate architecture from directly.

Alexander's 15 properties and pattern language solve this problem. They provide a precise, measurable vocabulary for spatial qualities that humans experience but cannot name. DwellTune's job is to translate between the language people speak ("cozy," "grand," "connected to nature") and the language architecture computes (property weights, pattern selections, room topologies).

The quiz accomplishes this translation by presenting concrete spatial tradeoffs — not asking people to label their preferences, but to choose between embodied alternatives. Each choice maps cleanly onto Alexander's vocabulary because the alternatives were designed from that vocabulary in the first place.

---

## Example Translations

### "Cozy"

When a user's answers consistently select for intimacy, enclosure, and warmth, the system produces:

| Alexander Property | Weight Adjustment | Mechanism |
|---|---|---|
| Boundaries | High (0.8-0.9) | Thicker walls, layered transitions between spaces |
| Deep Interlock | High (0.7-0.8) | Nesting spaces — alcoves, window seats, inglenooks |
| Gradients | Medium-High (0.6-0.7) | Smooth progression from public to very private |
| Levels of Scale | Medium-High (0.7) | Many small-scale elements (shelves, niches, trim details) |
| Strong Centers | Medium (0.5-0.6) | Centers at human scale, not monumental |

**Patterns activated:** Alcoves (#179), Window Place (#180), Thick Walls (#197), Ceiling Height Variety (#190), Intimacy Gradient (#127), Half-Open Wall (#193)

**Architectural result:** Smaller rooms with varying ceiling heights. Thick boundary zones with built-in seating. Nesting spaces — a reading alcove off the living room, a window seat in the bedroom. Fewer and smaller openings, placed to frame specific views rather than flood with light. Warm materials in the rendering.

### "Grand"

When a user's answers consistently select for drama, scale, and formal hierarchy:

| Alexander Property | Weight Adjustment | Mechanism |
|---|---|---|
| Strong Centers | Very High (0.9) | Dominant primary center in main space |
| Levels of Scale | Very High (0.9) | Full range from large volumes to fine details |
| Contrast | High (0.8) | Sharp differences between main space and supporting spaces |
| Local Symmetries | High (0.7-0.8) | Formal symmetry in major rooms |
| The Void | Medium-High (0.6-0.7) | A calm, expansive center amidst surrounding richness |

**Patterns activated:** Main Entrance (#110), Entrance Transition (#112), Staircase as a Stage (#133), Ceiling Height Variety (#190), The Flow Through Rooms (#131), Common Areas at the Heart (#129)

**Architectural result:** A clear primary gathering space with high ceilings, surrounded by smaller supporting spaces at lower ceiling heights. Strong axis from entry through main space. Formal symmetry in the primary rooms. A staircase as a prominent spatial feature, not hidden. High contrast between the scale of the main living space and intimate bedrooms.

### "Connected to Nature"

When a user's answers consistently select for outdoor connection, light, and permeable boundaries:

| Alexander Property | Weight Adjustment | Mechanism |
|---|---|---|
| Boundaries | Reconfigured — permeable, not thick | Transition zones that blur inside/outside (porches, courtyards, covered terraces) |
| Not-Separateness | Very High (0.9) | Building merges with landscape rather than standing as an object |
| Gradients | High (0.8) | Smooth transition from fully enclosed to fully outside |
| Deep Interlock | High (0.7) | Indoor and outdoor spaces hook into each other |
| Positive Space | High (0.7) | Outdoor rooms are as well-shaped as indoor rooms |

**Patterns activated:** Light on Two Sides (#159), Indoor Sunlight (#128), Garden Growing Wild (#172), Connection to the Earth (#168), Outdoor Room (#163), Courtyards Which Live (#115), Half-Open Wall (#193)

**Architectural result:** Light on two sides in every major room. Large openings facing garden/landscape. A gradient from inside to outside: living room -> covered terrace -> garden patio -> open garden. Outdoor spaces designed as rooms with defined edges, not leftover gaps. Courtyard or garden that hooks into the building's L- or U-shaped plan.

### "Private"

When a user's answers consistently select for retreat, separation, and controlled access:

| Alexander Property | Weight Adjustment | Mechanism |
|---|---|---|
| Boundaries | Very High (0.9) | Strong thresholds at every scale |
| Gradients | Very High (0.9) | Deep intimacy gradient — many layers from public to private |
| Deep Interlock | Medium (0.5) | Spaces nest deeply but don't blend openly |
| Contrast | High (0.7) | Clear separation between public and private zones |
| Strong Centers | Medium (0.5) | Private centers — personal retreats, not gathering hubs |

**Patterns activated:** Intimacy Gradient (#127), Entrance Transition (#112), A Room of One's Own (#141), Couple's Realm (#136), Dressing Room (#189), Private Terrace on the Street (#140), Hierarchy of Open Space (#114)

**Architectural result:** A deep plan with many layers from the front door to the most private space. Strong thresholds: covered entry, then vestibule, then hallway, then family room, then private corridor, then bedroom, then dressing area. Each person gets a personal retreat space. The bedroom wing is physically separated from the social wing. Soundproofing between zones. Small, high windows in private areas.

### "Social / Entertaining"

When a user's answers consistently select for gathering, visibility, and flow between spaces:

| Alexander Property | Weight Adjustment | Mechanism |
|---|---|---|
| Strong Centers | Very High (0.9) | A powerful gathering center that draws people |
| Positive Space | High (0.8) | Open, well-shaped spaces that accommodate groups |
| Local Symmetries | Medium (0.5) | Relaxed, not overly formal |
| Boundaries | Reconfigured — social thresholds | Wide openings between entertaining spaces, strong boundary only at the public/private divide |
| Contrast | Medium-High (0.6) | Lively variation between spaces but easy flow between them |

**Patterns activated:** Common Areas at the Heart (#129), The Flow Through Rooms (#131), Cooking Layout (#184), Open Shelves (#200), Sitting Circle (#185), Sequence of Sitting Spaces (#142), Half-Open Wall (#193)

**Architectural result:** Kitchen, dining, and living form a connected hub with visual and physical flow between them. Kitchen positioned so the cook faces the gathering space. A strong center in the living area — a fireplace, a prominent window, a ceiling height change — that organizes the social space. Wide openings (no doors) between entertaining rooms. A hard boundary (door, hallway, level change) between the social hub and the private bedroom wing.

---

## Technical Approach

### Quiz Engine

**15-20 questions, each a forced binary choice between two illustrated spatial conditions.**

Example question format:
```
Question 7 of 18: Your ideal living room

[Image A: Small room with           [Image B: Large room with
thick walls, low ceiling,            high ceiling, large windows,
built-in window seat, warm           open to dining area, lots
lamplight]                           of natural light]

        [Choose A]                          [Choose B]
```

Each question is tagged with the properties and patterns it discriminates between. The question order can be adaptive — early answers narrow the preference space, and later questions probe the remaining ambiguities.

**Question design principles:**
- Always show, don't tell. Images or spatial descriptions, never abstract labels.
- Each question must disambiguate at least two properties.
- No neutral options. The forced choice is what makes the output specific.
- Questions should feel like real decisions, not a test. "Where would you rather sit right now?" not "Rate your preference for enclosed spaces on a scale of 1-5."

### Mapping Engine

A matrix maps each question's answers to property weight adjustments and pattern activations:

```python
QUESTION_MAP = {
    "q7_living_room": {
        "option_a": {
            "property_adjustments": {
                "boundaries": +0.15,
                "deep_interlock": +0.10,
                "levels_of_scale": +0.05,
                "strong_centers": -0.05,
            },
            "pattern_activations": ["alcoves", "thick_walls", "ceiling_height_variety"],
            "pattern_deactivations": ["open_plan"],
        },
        "option_b": {
            "property_adjustments": {
                "strong_centers": +0.10,
                "positive_space": +0.10,
                "contrast": +0.05,
                "boundaries": -0.10,
            },
            "pattern_activations": ["light_on_two_sides", "common_areas_at_heart"],
            "pattern_deactivations": ["alcoves"],
        },
    },
    # ... 14-19 more questions
}
```

After all questions are answered, property weights are normalized to 0.0-1.0 and pattern activations are tallied. Patterns activated by multiple answers get higher priority.

### Generation Pipeline

The output of the mapping engine is a structured generation brief:

```json
{
    "property_weights": {
        "strong_centers": 0.72,
        "boundaries": 0.85,
        "levels_of_scale": 0.61,
        "gradients": 0.78,
        "deep_interlock": 0.69,
        "positive_space": 0.55,
        "contrast": 0.42,
        "local_symmetries": 0.38,
        "alternating_repetition": 0.50,
        "good_shape": 0.60,
        "echoes": 0.50,
        "the_void": 0.35,
        "roughness": 0.50,
        "simplicity_inner_calm": 0.55,
        "not_separateness": 0.65
    },
    "active_patterns": [
        {"name": "Intimacy Gradient", "priority": 0.9},
        {"name": "Alcoves", "priority": 0.8},
        {"name": "Thick Walls", "priority": 0.75},
        {"name": "Light on Two Sides", "priority": 0.7},
        {"name": "Entrance Transition", "priority": 0.65}
    ],
    "constraints": {
        "bedrooms": 3,
        "target_area_sqm": 150,
        "stories": 2
    }
}
```

This brief is consumed by whichever generation pipeline is available:

1. **Best case (RoomGraph + PromptToHouse + 3D House Viewer all exist):** Brief -> PromptToHouse generates a command sequence guided by the property weights and patterns -> RoomGraph resolves topology to geometry -> 3D House Viewer renders the result. Full pipeline. User gets a navigable 3D house.

2. **Middle case (RoomGraph + 2D renderer exist):** Brief -> Pattern selections determine room list and adjacencies -> Property weights configure the layout algorithm -> 2D floor plan rendered and displayed.

3. **Minimum viable case (nothing else exists yet):** Brief -> Compiled into a detailed prompt for Claude -> LLM generates semantic house JSON directly -> Simple 2D renderer draws the floor plan from the JSON.

Even the minimum viable case produces an actual house design, not just a text profile. The difference between cases is fidelity and quality, not whether the user sees a building.

### Rendering Output

The user should see:

- **A 2D floor plan** with room labels, approximate dimensions, and door/opening placements. Styled to feel like an architect's sketch, not a CAD drawing.
- **A 3D model** (if the 3D House Viewer exists) with orbital and first-person cameras. Block-level fidelity is fine — extruded volumes with flat colors. The point is spatial experience, not photorealism.
- **A brief narrative** explaining how the quiz answers shaped the design: "Your home has an unusually deep entrance sequence (three thresholds from outside to living area) because you consistently chose spaces with strong boundaries. The living room has a built-in window seat and alcove because you favored nesting spaces over open plans."

---

## Open Questions

- **How many questions is the right number?** 15 is the minimum to cover the major property dimensions. 20 starts to feel long. Can adaptive ordering reduce the count for users whose preferences are strongly directional (all answers pointing the same way)?

- **How to source the question images?** Each question needs two compelling images illustrating the spatial alternatives. Stock photography may not be specific enough. AI-generated images (Midjourney, DALL-E) could work but introduce style bias. Photographs of real spaces are most authentic but hard to find pairs that isolate the right variable.

- **How good does the generated house need to be?** A first-pass design from a 20-question quiz will not be an optimized floor plan. It will be a rough approximation. Is that enough to delight users, or will "your house" feel disappointing if the layout is awkward? The quality floor needs testing.

- **Should the quiz include household-specific questions?** "How many bedrooms?" and "Do you work from home?" are not preference questions — they are constraints. But they are necessary for generating a realistic house. Should they be asked in the quiz or as a separate step before it?

- **How to handle couples who disagree?** Two people take the quiz and get different profiles. The system needs to either merge the profiles (weighted average?), show two separate houses, or present the disagreements as explicit tradeoffs the couple needs to resolve together. The couple-negotiation version could be a premium feature.

- **What is the minimum viable generation pipeline?** If neither RoomGraph nor PromptToHouse exists when DwellTune is built, can a single Claude API call with a well-structured prompt produce a plausible semantic house JSON from the generation brief? Need to test this early.

- **How to price it?** $9.99-19.99 per generated house positions this as a premium quiz result, not a free personality test. Is the output good enough to justify that price? Could a free tier show a low-fidelity result (text description + simplified plan) while the paid tier unlocks the full floor plan and 3D model?

---

## Connection to HomeMaker

This sub-project is a direct prototype for the Phase 4 wizard's front end.

- **The quiz questions become the wizard's "Tell me about your household" and "What matters most to you?" steps.** The Phase 4 wizard (PRD Section 8) begins with a guided interview that collects initial information before the unfolding begins. DwellTune's quiz IS that interview, refined through user testing and iteration. Every question that works well in DwellTune gets promoted directly into the wizard.

- **The preference-to-parameter mapping is directly reusable.** The mapping engine that translates quiz answers into property weights and pattern selections is the same engine the wizard uses to configure the unfolding sequence. The code, the data structures, and the tuning all transfer.

- **If you can build this, you have proven the core loop: preferences -> parameters -> design.** This is the central claim of the entire HomeMaker product — that you can start with subjective human preferences, translate them through Alexander's vocabulary into measurable parameters, and generate architecture that embodies those preferences. DwellTune is the smallest possible test of that claim. If the generated houses feel right to the people who answered the quiz, the core loop works. If they do not, you know before investing in the full Phase 4 build.

- **The generation brief format becomes a standard interface.** The JSON brief (property weights + active patterns + constraints) that DwellTune outputs is a clean contract between the preference system and the generation system. Any generation pipeline that can consume this brief — RoomGraph, PromptToHouse, a future evolutionary solver, a future fine-tuned model — can be swapped in without changing the quiz or the mapping engine. This separation of concerns is architecturally valuable for the full product.

- **User data from DwellTune calibrates the wizard.** Every DwellTune session produces a (quiz answers, property weights, generated house, user satisfaction) tuple. Analyzing which property weight profiles produce houses that users like tells you which mappings are correct and which need adjustment — before the Phase 4 wizard ships.
