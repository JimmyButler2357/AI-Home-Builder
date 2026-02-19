# CodeCheck

**Status:** Not started
**Priority:** 13
**Time:** 3-4 weeks for basic version
**Revenue:** Medium -- $9.99/mo subscription
**Roadmap value:** Low-Medium -- mostly a separate product, but a basic version feeds the Validity Checker (PRD Phase 2 "deferred validity" rules)

---

## Core Concept

Input room dimensions and a layout. The system checks against basic residential building codes: minimum room sizes, egress requirements, hallway widths, stair dimensions, bathroom counts. A building can score high on wholeness and still fail code, or pass code and be soulless. This tool handles the legality side.

The core idea is **constraint validation as a standalone value proposition**. Building codes are public information scattered across thousands of pages of legal text that nobody reads until they fail an inspection. A simple "does my floor plan pass basic code?" check is valuable to every self-builder, DIY renovator, and small contractor.

This is the architectural equivalent of a linter for legality. RoomFlow checks whether your circulation makes sense. WholenessScore checks whether your building has life. CodeCheck checks whether your building is legal. Three independent axes of quality, all computable from the same floor plan data.

---

## What It Checks

Basic residential code checks derived from the IRC (International Residential Code):

### Minimum Room Sizes
- Every bedroom must be at least 70 square feet
- At least one bedroom must be at least 120 square feet
- Flag rooms labeled as bedrooms that fall below these thresholds

### Ceiling Heights
- Habitable rooms must have a ceiling height of at least 7 feet
- Flag any habitable room (bedrooms, living rooms, kitchens, dining rooms) below this minimum

### Egress Windows
- Every bedroom requires an egress window
- Egress window must have a minimum opening area of 5.7 square feet
- Window sill height must be no more than 44 inches from the floor
- Flag bedrooms without qualifying egress windows

### Hallway Widths
- Hallways must be at least 36 inches wide
- Flag any hallway segment narrower than 36 inches

### Stair Geometry
- Minimum tread depth: 10 inches
- Maximum riser height: 7.75 inches
- Minimum stair width: 36 inches
- Flag stairs that violate any of these dimensional requirements

### Bathroom Requirements
- Bathroom count relative to bedroom count
- Flag plans where the bathroom-to-bedroom ratio suggests insufficient bathrooms

### Door Widths
- Minimum 32 inches clear opening for accessibility
- Flag doors below this threshold, particularly entry doors and bathroom doors

### Smoke Detector Placement
- One smoke detector per bedroom
- One smoke detector per floor
- One smoke detector in each hallway adjacent to bedrooms
- Flag plans missing required detector locations

### Fire Separation
- Required fire separation between garage and living space
- Fire-rated wall and self-closing door between attached garage and habitable rooms
- Flag garage-to-living-space connections that lack fire separation notation

---

## Why This Is Mostly a Separate Product

Building code compliance is a deep domain. A proper product needs to handle:

- **IRC (International Residential Code) as baseline** -- the default code adopted by most US jurisdictions, but never without amendments
- **State and local amendments** -- which vary significantly across US jurisdictions. California's CBC adds energy and seismic requirements. Florida's code adds hurricane resistance. New York City has its own code entirely. A serious compliance tool must handle thousands of jurisdiction-specific variations.
- **Accessibility requirements (ADA / Fair Housing)** -- accessible routes, bathroom clearances, door hardware height, threshold heights. The Fair Housing Act applies to multifamily but increasingly influences single-family design expectations.
- **Fire safety beyond basics** -- fire sprinkler requirements (now mandatory in IRC for new single-family), fire-rated assemblies, means of egress calculations for multi-story buildings, fire department access.
- **Energy code compliance** -- IECC (International Energy Conservation Code) requirements for insulation values, window U-factors, air sealing, HVAC efficiency. Increasingly stringent and increasingly enforced.

Archistar, from HomeMaker's competitor analysis, built a whole company around automated compliance checking for Australian building codes. Doing this properly for the US market -- with 50 states, thousands of municipalities, and continuous code cycle updates -- is a separate venture. It requires a legal and regulatory team maintaining a database, not just an engineering team writing rules.

---

## The Minimal HomeMaker Version

For HomeMaker's Validity Checker, build **only the 10 most common code violations in residential design**. Do not try to be comprehensive. The goal is catching obvious problems ("your hallway is 28 inches wide, code requires 36 inches") not replacing a code review.

The 10 checks listed in the "What It Checks" section above are the minimal set. They cover the violations that account for the vast majority of residential inspection failures:

1. Bedroom too small
2. Ceiling too low
3. Missing or undersized egress window
4. Hallway too narrow
5. Stair treads too shallow or risers too tall
6. Stair too narrow
7. Not enough bathrooms
8. Doors too narrow
9. Missing smoke detectors
10. No fire separation from garage

This minimal version can be a module within the Validity Checker rather than a standalone product. It runs as part of the validation gate after each command the AI agent issues, alongside the geometric validity checks (no wall intersections, rooms form closed polygons) and the circulation checks (all rooms reachable, no bedrooms-only access).

The output is a simple pass/fail checklist with specific violations called out: "FAIL: Bedroom 2 is 62 sqft (minimum 70 sqft)" or "PASS: All hallways meet 36-inch minimum width." No attempt to handle jurisdiction-specific amendments. No attempt to handle energy code or accessibility beyond basic door widths. Just the IRC baseline for the 10 most common violations.

---

## Technical Approach

### Data Requirements

CodeCheck operates on the same semantic JSON model used by every other HomeMaker component. The required fields:

```json
{
  "rooms": [
    {
      "id": "r1",
      "name": "Bedroom 1",
      "function": "bedroom",
      "area_sqft": 142.0,
      "dimensions": {"length": 12.5, "width": 11.3},
      "ceiling_height": 8.0
    }
  ],
  "walls": [
    {
      "id": "w1",
      "start": [0, 0],
      "end": [12.5, 0],
      "thickness": 0.5,
      "rooms": ["r1"],
      "fire_rated": false
    }
  ],
  "openings": [
    {
      "id": "o1",
      "type": "window",
      "wall_id": "w1",
      "width": 3.0,
      "height": 2.5,
      "sill_height": 2.0,
      "opening_area_sqft": 6.0,
      "egress_qualified": true
    },
    {
      "id": "o2",
      "type": "door",
      "wall_id": "w2",
      "width": 2.8,
      "clear_opening": 2.67
    }
  ],
  "stairs": [
    {
      "id": "s1",
      "tread_depth": 10.5,
      "riser_height": 7.5,
      "width": 36,
      "connects_levels": ["Ground Floor", "Second Floor"]
    }
  ],
  "hallways": [
    {
      "id": "h1",
      "min_width": 38,
      "rooms": ["r1", "r2", "r3"]
    }
  ]
}
```

Most of these fields already exist in the PRD's semantic model (Section 10). The additions needed for CodeCheck: `ceiling_height` per room, `sill_height` and `opening_area_sqft` per window, `clear_opening` per door, `fire_rated` per wall, and explicit `stairs` and `hallways` arrays.

### Validation Engine

Each code check is a pure function: takes the semantic model, returns a list of violations.

```python
@dataclass
class Violation:
    rule: str           # "minimum_bedroom_size"
    severity: str       # "fail" or "warning"
    element_id: str     # "r3"
    message: str        # "Bedroom 3 is 62 sqft (minimum 70 sqft)"
    code_reference: str # "IRC R304.1"
    actual_value: float # 62.0
    required_value: float # 70.0

def check_bedroom_sizes(model: dict) -> list[Violation]:
    violations = []
    bedrooms = [r for r in model["rooms"] if r["function"] == "bedroom"]
    for room in bedrooms:
        if room["area_sqft"] < 70:
            violations.append(Violation(
                rule="minimum_bedroom_size",
                severity="fail",
                element_id=room["id"],
                message=f"{room['name']} is {room['area_sqft']} sqft (minimum 70 sqft)",
                code_reference="IRC R304.1",
                actual_value=room["area_sqft"],
                required_value=70.0
            ))
    # Check that at least one bedroom >= 120 sqft
    if bedrooms and max(r["area_sqft"] for r in bedrooms) < 120:
        violations.append(Violation(
            rule="primary_bedroom_size",
            severity="fail",
            element_id=bedrooms[0]["id"],
            message="No bedroom meets 120 sqft minimum for primary bedroom",
            code_reference="IRC R304.1",
            actual_value=max(r["area_sqft"] for r in bedrooms),
            required_value=120.0
        ))
    return violations

def run_all_checks(model: dict) -> list[Violation]:
    checks = [
        check_bedroom_sizes,
        check_ceiling_heights,
        check_egress_windows,
        check_hallway_widths,
        check_stair_geometry,
        check_bathroom_count,
        check_door_widths,
        check_smoke_detectors,
        check_fire_separation,
    ]
    violations = []
    for check in checks:
        violations.extend(check(model))
    return violations
```

Each check function is independent. Adding new checks does not require modifying existing ones. The full CodeCheck product would be the same architecture with hundreds of check functions instead of nine.

### Output Format

The output is a code compliance report:

```
CodeCheck Report
================

Overall: 7/9 checks passed, 2 violations found

PASS  Minimum room sizes .............. All bedrooms >= 70 sqft
PASS  Primary bedroom size ............ Master bedroom is 142 sqft (>= 120 sqft)
PASS  Ceiling heights ................. All habitable rooms >= 7 ft
FAIL  Egress windows .................. Bedroom 3 has no qualifying egress window
      -> IRC R310.1: Every sleeping room requires an egress window
         with >= 5.7 sqft opening and sill <= 44" from floor
PASS  Hallway widths .................. All hallways >= 36"
PASS  Stair geometry .................. Treads, risers, and width within limits
PASS  Bathroom count .................. 2 bathrooms for 3 bedrooms
FAIL  Door widths ..................... Bathroom 2 door is 28" clear (minimum 32")
      -> IRC R311.2: Doors must provide >= 32" clear opening
PASS  Smoke detectors ................. All required locations covered
PASS  Fire separation ................. Garage-to-living wall is fire-rated
```

### Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| Validation engine | Python | Pure functions, no dependencies beyond the semantic model |
| API endpoint | FastAPI | POST semantic JSON, receive violation list |
| Frontend | Next.js (React) | Consistent with HomeMaker stack |
| Input | Form-based room/dimension entry or JSON upload | V1 is manual input; V2 accepts FloorplanToJSON output |
| Persistence | localStorage | Auto-save, no backend needed for V1 |

### Integration with Validity Checker

In HomeMaker's Phase 2, the CodeCheck module runs as one layer of the validation gate:

```
Command issued by AI agent
  |
  v
[Layer 1: Geometric validity]  -- no wall intersections, rooms form closed polygons
  |
  v
[Layer 2: Circulation validity] -- all rooms reachable, no bedroom-only access (RoomFlow)
  |
  v
[Layer 3: Code compliance]     -- basic IRC checks (CodeCheck minimal module)
  |
  v
[Layer 4: Wholeness scoring]   -- Salingaros formulas (scoring engine)
  |
  v
Accept or reject the command
```

Code violations at Layer 3 do not necessarily reject the command (the user may have design reasons for a small bedroom), but they produce a warning annotation that appears in the step UI. The user decides whether to accept a design that violates code.

---

## Open Questions

- **Jurisdiction handling:** Even the minimal version should acknowledge that building codes vary by jurisdiction. Should the output include a disclaimer ("based on IRC baseline; your local jurisdiction may have different requirements")? Or should V1 let users select a state to apply known state-level amendments? Starting with a disclaimer and IRC-only is simpler. State-level amendments are a V2 feature or a standalone product feature.

- **How to handle room function classification?** The checks depend on knowing whether a room is a bedroom, a hallway, a bathroom. If the user labels a room "study" but it has a closet and could be classified as a bedroom by an inspector, should CodeCheck flag it? Inspectors often reclassify rooms based on features (closet + window + minimum size = bedroom regardless of label). This is a judgment call that could be deferred or handled with a warning.

- **Smoke detector placement accuracy:** Computing optimal smoke detector placement requires knowing ceiling geometry, wall positions, and HVAC duct locations. The simplified check ("one per bedroom, one per floor, one per hallway") catches the most common violations but does not handle spacing requirements (detectors must be within a certain distance of each other). Is the simplified version useful enough, or does the imprecision make it misleading?

- **Fire separation specifics:** The check for garage fire separation is binary (present or absent). A real code review evaluates the fire rating of the wall assembly, the door type (self-closing, fire-rated), and whether penetrations (ducts, pipes) are properly sealed. The binary check catches the most egregious violation (no separation at all) but misses the details. Is this sufficient?

- **Integration with FloorplanToJSON:** If the user uploads a floor plan image and FloorplanToJSON extracts the semantic model, can CodeCheck run automatically on the extracted data? This depends on FloorplanToJSON extracting ceiling heights, window sill heights, and door widths -- data that may not be visible in a typical floor plan image. The input requirements for CodeCheck may exceed what image extraction can reliably provide.

- **Liability:** If CodeCheck says a plan passes and it actually does not, is there liability risk? The tool should be clearly positioned as an educational aid, not a substitute for professional code review. Legal disclaimer language is essential.

---

## Connection to HomeMaker

**Validity Checker -- Code Compliance Module:** The PRD's Phase 2 lists "building code compliance (egress, accessibility)" under "deferred validity" rules (Section 6, Validity Checker). CodeCheck's minimal version delivers exactly this deferred capability. The nine check functions slot directly into the validation gate as Layer 3, running after geometric and circulation validation, before wholeness scoring.

**Trustworthiness through completeness:** The combination of "your design is beautiful AND buildable AND legal" is more trustworthy than any single dimension alone. A design tool that scores high on wholeness but produces buildings that fail inspection undermines the user's confidence in the entire system. CodeCheck closes that gap. When HomeMaker tells a self-builder their design is ready, it means ready on all three axes: aesthetic (wholeness), functional (circulation and lighting), and legal (code compliance).

**Semantic model enrichment:** Building CodeCheck forces additions to the semantic JSON schema that benefit other components. Ceiling height data feeds the 3D viewer's room rendering. Window sill height data feeds the scoring engine's Boundaries property (transition between inside and outside). Door width data feeds the circulation analysis (bottleneck sizing). Fire-rated wall data feeds the structural feasibility checks planned for future validity layers.

**Future spinoff opportunity:** The full CodeCheck product -- handling jurisdiction-specific amendments, accessibility requirements, energy code, and fire safety -- is noted in the PRD as a future opportunity. The minimal HomeMaker module proves the concept, builds the validation architecture, and identifies the hardest problems (jurisdiction handling, room reclassification) before committing to the full product. If the minimal version proves valuable to users, it validates the market for a standalone code compliance tool.

**Audience crossover:** Self-builders and DIY renovators who use CodeCheck to verify their plans against basic code are the same users who would benefit from HomeMaker's wholeness scoring and design guidance. CodeCheck as a free or low-cost tool brings users into the HomeMaker ecosystem who might not have found it through the architectural quality angle alone. "Is my floor plan legal?" is a more urgent question than "Is my floor plan beautiful?" for many self-builders.
