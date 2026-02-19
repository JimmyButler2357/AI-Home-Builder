# NeighborhoodWalk

**Status:** Not started
**Priority:** 14 — separate venture
**Time:** Separate venture
**Revenue:** Medium-High — urban analytics platform
**Roadmap value:** Low for HomeMaker directly, shares scoring engine DNA

---

## Core Concept

Enter a street address or navigate an interactive map. The system pulls street-level imagery, satellite data, and GIS information for the surrounding area, then analyzes the neighborhood against Christopher Alexander's patterns that operate at the urban scale. It is Google Maps rebuilt around a single question: how much life does this neighborhood have?

Alexander's *A Pattern Language* devotes its first 94 patterns to scales larger than the individual building — town, community, neighborhood, street, and block. These patterns describe the forces that make neighborhoods walkable, gathering spots feel natural, streets feel like outdoor rooms, and districts feel like coherent places rather than zoned abstractions. No existing tool evaluates neighborhoods against these criteria. NeighborhoodWalk would be the first.

The analysis pipeline:

```
Address or map location
  -> Fetch street-level imagery (Google Street View, Mapillary, etc.)
  -> Fetch satellite/aerial imagery
  -> Fetch GIS data (parcel boundaries, zoning, building footprints, land use, transit)
  -> AI vision extracts urban features (building edges, sidewalk widths, tree canopy, setbacks, facade rhythm)
  -> Scoring engine evaluates Alexander's urban-scale patterns and the 15 properties at neighborhood scale
  -> Results rendered as a map overlay with scored zones, pattern-by-pattern breakdowns, and improvement suggestions
```

This goes well beyond what any single building analysis can do. It captures the context that makes or breaks the experience of living somewhere — the stuff that real estate listings never tell you.

---

## Alexander's Neighborhood & City Patterns

Alexander identified dozens of patterns at the neighborhood and city scale. NeighborhoodWalk would evaluate a location against the most computationally tractable ones.

### Primary Patterns (Most Feasible to Score)

| # | Pattern | What It Asks | Data Sources |
|---|---------|-------------|-------------|
| 14 | **Identifiable Neighborhood** | Does this area feel like a distinct neighborhood with its own character and boundaries? | Building style clustering, land use data, street network topology, natural/built boundary detection |
| 30 | **Activity Nodes** | Are there natural gathering points where paths cross and people linger? | POI density, intersection analysis, commercial cluster detection, transit stop proximity |
| 31 | **Promenade** | Is there a path for strolling that connects major destinations? | Sidewalk network continuity, tree canopy along paths, storefront density along routes |
| 32 | **Shopping Street** | Is there a lively commercial street with small shops at a walkable scale? | Commercial parcel data, storefront width analysis, facade rhythm from street view |
| 51 | **Green Streets** | Do streets have trees and planting that make them pleasant to walk? | Tree canopy analysis from aerial imagery, green space proximity |
| 60 | **Accessible Green** | Can you reach green space easily from any point in the neighborhood? | Park/green space locations, walking distance isochrones |
| 61 | **Small Public Squares** | Are there well-shaped outdoor rooms where people can gather? | Open space analysis, enclosure ratios (building height to space width), figure-ground analysis |
| 100 | **Pedestrian Street** | Are streets designed for walking, not just driving? | Sidewalk width from street view, lane counts, speed limits, pedestrian infrastructure |
| 160 | **Building Edge** | Do buildings create positive street edges, or do they retreat behind parking lots? | Setback analysis, parking lot detection, building-to-street relationship from street view |

### Secondary Patterns (Require Deeper Analysis)

| # | Pattern | What It Asks | Feasibility Challenge |
|---|---------|-------------|----------------------|
| 36 | **Degrees of Publicness** | Is there a gradient from very public to very private spaces? | Requires understanding spatial sequence — public square to commercial street to residential block to private yard |
| 37 | **House Cluster** | Are houses arranged in identifiable clusters of 8-12 with shared outdoor space? | Requires fine-grained building footprint and parcel analysis |
| 53 | **Main Gateways** | Do you experience a clear arrival when entering the neighborhood? | Requires understanding of approach sequences — hard to compute from static data |
| 59 | **Quiet Backs** | Are there calm areas behind the busier streets? | Requires noise modeling or proxy measures (distance from arterials, building shielding) |
| 106 | **Positive Outdoor Space** | Is the outdoor space between buildings well-shaped (convex, enclosed) or leftover residual space? | Figure-ground analysis at urban scale — computationally intensive but feasible |

### The 15 Properties at Neighborhood Scale

Alexander's 15 properties apply at every scale, from a doorknob to a city. At the neighborhood scale, they manifest as:

| Property | Neighborhood Manifestation | How to Measure |
|----------|---------------------------|----------------|
| **Not-Separateness** | Does each building merge with its context, or stand as an isolated object on a lawn? | Setback consistency, facade alignment, stylistic coherence from street view |
| **Boundaries** | Are there transition zones between buildings and street (porches, arcades, stoops, hedges)? | Boundary element detection from street view imagery |
| **Levels of Scale** | Is there a hierarchy from sidewalk details (planters, benches) to building mass to skyline? | Element size distribution from multi-scale imagery analysis |
| **Positive Space** | Is the street itself a well-shaped outdoor room, or a leftover gap between buildings? | Street width-to-building height ratio (enclosure ratio), figure-ground analysis |
| **Gradients** | Is there a smooth transition from busy commercial to quiet residential? | Land use gradient analysis, noise/density proxy measures along transects |
| **Strong Centers** | Are there focal points — a clock tower, a distinctive corner building, a public fountain? | Landmark detection, visual prominence analysis |
| **Alternating Repetition** | Do building facades create a rhythm (ABABAB) rather than monotonous repetition (AAAAAA)? | Facade analysis from street view — width variation, color alternation, setback rhythm |
| **Local Symmetries** | Are individual building facades and street segments locally symmetric? | Symmetry detection in street view imagery at multiple scales |
| **Deep Interlock** | Do buildings hook into each other — shared walls, interlocking L-shapes, courtyards that open to the street? | Building footprint topology analysis, shared boundary detection |
| **Contrast** | Are there clear distinctions between zones — a quiet residential block meeting a lively commercial corner? | Land use boundary clarity, visual contrast analysis |
| **Echoes** | Do buildings share a common language — similar proportions, materials, rooflines — without being identical? | Style clustering from street view, proportion analysis across adjacent buildings |
| **Roughness** | Is there human-scale imperfection — slightly uneven facades, hand-laid brick, varied window placement? | Regularity analysis from street view, fractal dimension of facade patterns |
| **The Void** | Is there a calm open space — a park, a green, a plaza — amidst the surrounding complexity? | Largest open space detection, contrast with surrounding density |
| **Simplicity / Inner Calm** | Despite variety, does the neighborhood feel coherent and calm? | Visual entropy measure across street view panoramas |
| **Good Shape** | Are blocks, parks, and plazas well-shaped (compact, convex) rather than fragmented slivers? | Shape compactness analysis of parcels, blocks, and open spaces from GIS data |

---

## Technical Vision

### Data Sources

| Data Type | Sources | What It Provides |
|-----------|---------|-----------------|
| **Street-level imagery** | Google Street View API, Mapillary (open source), Apple Look Around | Building facades, sidewalks, street furniture, boundary conditions, human-scale details |
| **Satellite / aerial imagery** | Google Earth Engine, Sentinel-2, NAIP (US), commercial providers | Building footprints, green coverage, figure-ground relationships, urban morphology |
| **GIS / vector data** | OpenStreetMap, municipal open data portals, TIGER/Line (US Census), Overture Maps | Parcel boundaries, zoning, land use, road network, building footprints, POIs |
| **Elevation data** | USGS 3DEP, SRTM, LiDAR point clouds (where available) | Terrain context, building height estimates, viewshed analysis |
| **Transit data** | GTFS feeds (General Transit Feed Specification) | Transit accessibility, activity node identification |
| **Walk Score / accessibility** | Walk Score API, Mapbox Isochrone API | Baseline walkability for calibration and comparison |

### Analysis Engine

The analysis engine operates at three scales simultaneously:

**Block scale (50-200m):** Analyze individual street segments and blocks. What does it feel like to stand at this corner? Is this block enclosed? Are the facades creating rhythm? Score per-block patterns (Building Edge, Positive Space, Alternating Repetition).

**Neighborhood scale (200m-1km):** Analyze the area around the target address. Is there a coherent neighborhood identity? Are there activity nodes? Can you reach green space? Score neighborhood-level patterns (Identifiable Neighborhood, Activity Nodes, Accessible Green, Degrees of Publicness).

**District / city scale (1-5km):** Analyze the broader urban context. How does this neighborhood connect to adjacent ones? Are there gateways? Is there a gradient from center to edge? Score district-level patterns (Main Gateways, Gradients).

### Output Formats

**Map overlay:** A colored heatmap layer on an interactive map showing "life score" at every point. Red = high life, blue = low life. Click any point for a detailed breakdown. Zoom in for block-scale analysis, zoom out for neighborhood-scale.

**Street report card:** For a given address, a detailed report showing:
- Overall neighborhood life score (0-100)
- Per-pattern scores with one-line explanations
- Per-property scores at neighborhood scale
- Top 3 strengths ("This area has excellent Accessible Green — three parks within a 5-minute walk")
- Top 3 weaknesses ("Building Edge is weak — most buildings are set back behind parking lots, creating dead zones along the street")
- Comparison to city average and similar neighborhoods

**Walkability comparison:** Side-by-side comparison of two addresses or neighborhoods. Which one has more urban life? Pattern-by-pattern comparison.

**Improvement suggestions:** For neighborhood associations or planners, actionable suggestions tied to specific low-scoring patterns: "To improve Activity Nodes (currently 3.8/10): The intersection of Main and 3rd has foot traffic from three directions but no reason to linger. A small cafe with outdoor seating, a bench cluster, or a street vendor zone would activate this natural crossing point."

### Tech Stack (Projected)

| Component | Technology | Notes |
|-----------|-----------|-------|
| Frontend | Next.js + Mapbox GL JS or Deck.gl | Interactive map with data overlays |
| Street view analysis | Claude Vision API or fine-tuned vision model | Extract urban features from street-level imagery |
| Aerial analysis | GeoSAM (Meta's SAM3) or custom segmentation | Building footprints, green coverage, figure-ground |
| GIS processing | Python (GeoPandas, Shapely, GDAL) | Vector data processing, spatial analysis |
| Scoring engine | Python (shared with HomeMaker) | Pattern scoring, property scoring at urban scale |
| Data pipeline | PostGIS + tile server | Spatial database, pre-computed tiles for fast map rendering |
| Hosting | Cloud (AWS/GCP) | Compute-intensive imagery analysis requires server-side processing |

---

## Why This Is a Separate Venture

This is not a feature of HomeMaker. It is a distinct product with a distinct market, distinct data requirements, and a distinct development path. The reasons to keep it separate:

**Different users.** HomeMaker serves self-builders and architects designing individual homes. NeighborhoodWalk serves urban planners, city governments, real estate developers, neighborhood associations, and walkability advocates. The overlap is small (self-builders choosing a lot, architects evaluating a site).

**Different data requirements.** HomeMaker needs floor plans and building geometry. NeighborhoodWalk needs street-level imagery, satellite data, GIS layers, transit feeds, and POI databases. The data infrastructure is entirely different.

**Different scale of ambition.** HomeMaker scores one building at a time. NeighborhoodWalk scores entire neighborhoods, potentially entire cities. The computational and data storage requirements are orders of magnitude larger.

**Different revenue model.** HomeMaker is a consumer/prosumer SaaS tool ($29/month). NeighborhoodWalk is an urban analytics platform — think B2B/B2G contracts with planning departments, real estate analytics subscriptions, or a Walk Score competitor. The pricing, sales motion, and go-to-market are fundamentally different.

**Different competitive landscape.** HomeMaker competes with Maket AI and Finch3D. NeighborhoodWalk competes with Walk Score, Urban Footprint, Replica, and potentially Autodesk Forma (ex-Spacemaker). Different competitors, different positioning.

**Shared DNA, separate body.** The scoring engine — the mathematical framework for evaluating the 15 properties — is shared. But the scoring engine is like a heart that could be transplanted into a different body. The "body" of NeighborhoodWalk (data pipelines, map interfaces, urban-scale analysis, B2B sales) has almost nothing in common with HomeMaker.

**Practical implication:** Do not build this as part of the HomeMaker roadmap. Do not let it create scope creep. Document it here so the idea is preserved and so the scoring engine architecture remains general enough to support it someday. When the scoring engine is mature and HomeMaker is shipping, this becomes a candidate for a second product — possibly a second company.

---

## Open Questions

### Feasibility
- How accurate is Claude Vision at extracting urban-scale features (sidewalk widths, setback distances, facade rhythm) from Google Street View imagery? The resolution and angle limitations of street-level photos may make some measurements unreliable.
- Can satellite imagery at publicly available resolutions (Sentinel-2 at 10m, NAIP at ~1m) support meaningful figure-ground analysis? Or does this require commercial high-resolution imagery ($$$)?
- How to handle areas where street-level imagery is unavailable, outdated, or low-quality? Rural areas, developing countries, recently changed neighborhoods.

### Scoring
- How to calibrate neighborhood-scale pattern scores? At building scale, you can compare a cathedral to a strip mall. At neighborhood scale, what are the reference points? Amsterdam's canal district vs. a Houston suburb? Greenwich Village vs. a cul-de-sac subdivision?
- Can the 15 properties be meaningfully evaluated at urban scale from remote sensing data alone, or does it require ground-truth human observation?
- How to handle temporal variation? A neighborhood can feel alive on Saturday morning at the farmers market and dead on Tuesday at 2pm. Do you score the physical infrastructure (permanent) or the lived experience (variable)?

### Data & Legal
- What are the terms of service implications of bulk-processing Google Street View imagery through an AI analysis pipeline? Is this permitted under the Google Maps Platform ToS?
- Are there open-source alternatives to Google Street View that avoid ToS issues? Mapillary is open but has much sparser coverage.
- What municipal open data is reliably available across cities? Building footprints, zoning, and parcel data vary enormously in availability and format from one jurisdiction to another.

### Market
- Who pays for this, and how much? Urban planners have institutional budgets but slow procurement cycles. Real estate developers have money but want ROI-linked pricing. Neighborhood associations are passionate but resource-constrained.
- Is there a consumer version of this (self-builders evaluating lots, homebuyers evaluating neighborhoods) that could launch first and cheaper than the B2B platform?
- How does this relate to Walk Score? Walk Score measures functional walkability (can you walk to a grocery store?). NeighborhoodWalk measures experiential quality (is it pleasant to walk there?). Complementary or competitive?

### Philosophical
- Alexander's urban patterns were written in 1977. Are they still valid for contemporary cities? Have cars, smartphones, delivery apps, and remote work changed what makes a neighborhood feel alive?
- How to handle cultural variation? A vibrant neighborhood in Tokyo looks nothing like a vibrant neighborhood in Barcelona, which looks nothing like a vibrant neighborhood in Marrakech. Are the underlying patterns truly universal, or are they rooted in Western/European urban traditions?

---

## Connection to HomeMaker

### Shared Scoring Engine
The mathematical framework for evaluating the 15 properties is the same whether applied to a floor plan, a building facade, or a neighborhood. The scoring engine should be architected as a general-purpose wholeness evaluator that accepts feature vectors at any scale and returns property scores. NeighborhoodWalk would use the same `score_levels_of_scale()`, `score_positive_space()`, and `score_boundaries()` functions — just with different input features (street widths instead of room widths, block shapes instead of room shapes, building setbacks instead of wall thicknesses).

**Architectural implication for HomeMaker:** Design the scoring engine as a scale-agnostic library from the start. The property computation functions should accept abstract geometric features (sizes, shapes, boundaries, centers) without assuming they come from a floor plan. This costs nothing now and preserves the option to power NeighborhoodWalk later.

### Not-Separateness — The Hardest Property
The 15th property, Not-Separateness, is the hardest to evaluate for a single building because it fundamentally requires context. A building cannot be "not-separate" in isolation — it must merge with something. That something is the neighborhood. NeighborhoodWalk would provide the neighborhood context that makes Not-Separateness computable:

- What are the neighboring buildings' styles, setbacks, heights, and materials?
- What is the prevailing street edge condition?
- What is the local rhythm of facades?
- How does the site relate to nearby green space, commercial areas, and gathering points?

Without neighborhood data, HomeMaker can only approximate Not-Separateness (e.g., boundary permeability, number of inside-outside connections). With NeighborhoodWalk data, it could fully evaluate whether a proposed design merges with or fights against its surroundings.

### Lot Evaluation for Self-Builders
Self-builders choosing where to build face a critical question that no current tool answers well: not just "is this lot buildable?" but "is this a good place to live?" NeighborhoodWalk would let a self-builder evaluate candidate lots on Alexander's criteria before committing:

- Is there a walkable commercial street nearby? (Pattern #32)
- Can I reach green space easily? (Pattern #60)
- Does the street feel like a place, or like a traffic sewer? (Pattern #100)
- Will my future house have a coherent relationship with its neighbors? (Property: Not-Separateness)

This is a natural upsell path: HomeMaker helps you design the house, NeighborhoodWalk helps you pick where to put it.

### Practical Boundary
Despite these connections, NeighborhoodWalk should not be built as part of HomeMaker's roadmap. The connections are:
1. **Scoring engine architecture** — make it general enough (do this now, costs nothing)
2. **Not-Separateness data feed** — a future API integration (do this when both products exist)
3. **Lot evaluation upsell** — a future cross-sell (do this when both products have users)

All three connections are future integrations, not current dependencies. Build HomeMaker first. Build the scoring engine as a general library. Revisit NeighborhoodWalk when HomeMaker is shipping and the scoring engine is proven.
