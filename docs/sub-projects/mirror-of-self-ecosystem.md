# Mirror of Self Ecosystem

**Status:** Not started
**Priority:** 1 (start immediately)
**Time:** Ongoing — the Twitter/Instagram accounts run forever; the Calibration Game is a 1-2 week build
**Revenue:** Low-Medium (newsletter sponsorships, audience for upsell)
**Roadmap value:** High — validates scoring engine, builds calibration dataset, grows audience

---

## Core Concept

Christopher Alexander's most fundamental test of architectural quality is the **Mirror of the Self test**, described in *The Nature of Order*, Book 1. The procedure is disarmingly simple: place two things side by side and ask, "Which one has more life?" Don't analyze. Don't think about style or taste. Just feel which one makes you feel more whole, more alive.

Alexander claimed this test is universal — that humans across cultures, when asked honestly, converge on the same answer. A medieval Italian piazza has more life than a strip mall parking lot. A handmade ceramic bowl has more life than a mass-produced plastic one. A weathered oak door has more life than a hollow-core interior door. The agreement rate, Alexander reported, is typically 80-90%.

This ecosystem takes that test and distributes it across every social platform where people vote on visual content. Every vote is a data point. Every data point calibrates the scoring engine. Every post builds an audience that cares about architectural quality.

---

## The Ecosystem: Five Formats

### 1. Twitter/X Account — "@WhichHasMoreLife"

**Format:** Daily post. Two photographs side by side. A poll: "Which has more life? Vote." Minimal caption. No explanation of the theory.

**Content strategy:**
- **Monday:** Buildings (the core use case — houses, churches, commercial buildings)
- **Tuesday:** Non-buildings (pottery, fabric, garden layouts, typefaces, furniture)
- **Wednesday:** Details (doors, windows, staircases, fences, light fixtures)
- **Thursday:** Spaces (rooms, courtyards, streets, plazas, parks)
- **Friday:** Wild card (paintings, musical scores, code, mathematical proofs — testing Alexander's claim of universality)
- **Weekend:** Reveal thread — take the week's most lopsided result and explain *why* the winner has more life, introducing one of the 15 properties

**Why non-buildings matter:** Alexander claimed the 15 properties apply to everything — not just architecture. Testing this across domains (pottery, fabric, typefaces) both validates the universality claim and reaches audiences far beyond architecture. A typographer who discovers that "the font with more Levels of Scale and Alternating Repetition always wins" becomes interested in the theory, even if they never design a building.

**Growth mechanics:**
- Polls get natural engagement (people love voting)
- Controversial results spark discussion ("How did THAT win?")
- Architecture Twitter is active and opinionated
- The "reveal" threads provide educational value that gets bookmarked and shared
- Tagging architects, designers, and building photographers drives discovery

**Operational cost:** ~30 minutes/day to curate pairs and schedule posts. Can be batched weekly.

### 2. Instagram / TikTok Stories

**Format:** Instagram story poll sticker — two images, tap to vote. Results visible in real time. TikTok variant: show Building A for 3 seconds, Building B for 3 seconds, ask "which feels more alive?" in comments or duet format.

**Why this format separately:** Instagram Stories reach a different demographic than Twitter. The visual-first format suits architecture content naturally. TikTok's algorithm can surface content to massive audiences regardless of follower count.

**Content approach:** Same pairs as Twitter, but optimized for mobile vertical format. More emphasis on emotional/visceral impact (close-up details, walkthrough videos) vs. Twitter's side-by-side stills.

### 3. The Mirror Test — Daily Email Newsletter

**Format:** Each email contains one pair. You vote by clicking Image A or Image B (email click tracking captures the vote). The next day's email reveals the result and includes a 200-word explanation of the relevant property.

**Why email:** Builds an owned audience (not platform-dependent). Email subscribers are the highest-intent users — they opted in, they open daily, they're the first people you'd sell WholenessScore.com or WholeHouse Report to. Newsletter monetization (Substack, Beehiiv) kicks in around 1,000-5,000 subscribers through paid tiers or sponsorships.

**Sponsorship potential:** Architecture tool companies, design book publishers, building material brands, online architecture education platforms. "This Mirror Test is sponsored by [brand]" feels natural.

### 4. The Calibration Game (Web App)

**Format:** The gamified web version of the Mirror Test. 30 rounds of A/B pairs. At the end, the system tells you:
- Your overall agreement rate with the mathematical scoring engine
- Which of the 15 properties you're most sensitive to ("You consistently picked the building with stronger Boundaries, even when the other scored higher overall")
- Which properties you're least attuned to ("You tended to overlook Levels of Scale")
- Your "architectural perception profile" — a shareable result card

**Why this matters beyond engagement:** This is the formal validation mechanism for PRD Open Question #3: "Do wholeness scores correlate with human perception of quality?" After 10,000 users play, you have statistically significant data on which properties humans perceive most reliably, which are controversial, and whether the scoring engine's aggregate formula matches human judgment.

**The profile output:** Feeds directly into the DwellTune concept. If someone's perception profile shows high sensitivity to Boundaries and Strong Centers, the HomeMaker wizard can weight those properties higher in their designs. The Calibration Game becomes the preference discovery mechanism.

**Sharing mechanic:** "I scored 87% alignment with architectural wholeness theory. Can you beat me?" — shareable to Twitter/Instagram, driving traffic back to the game.

### 5. The Dataset Play

**Format:** Not a user-facing product — a strategic asset built by the four formats above.

Every vote across every platform is a data point mapping `(building_image_A, building_image_B, human_preference, user_demographics)`. Over time, this becomes:

- **The largest dataset in existence mapping human perception of architectural quality to specific building features.** No academic institution has this at scale.
- **A calibration set for the scoring engine.** Where the engine and humans agree, confidence is high. Where they disagree, the formula needs adjustment.
- **A training set for future ML models.** If you ever want to train a model to predict wholeness scores from images (complementing the formula-based approach), this dataset is the ground truth.
- **A research asset.** Publishable academic papers on cross-cultural perception of architectural quality. Partnership potential with environmental psychology researchers.
- **A competitive moat.** Anyone can implement the 15 properties as formulas. Nobody else has 100,000 human judgments validating those formulas.

**Data to capture per vote:**
- Both images (or image IDs)
- User's choice
- Response time (faster = more instinctive, stronger signal)
- User's country/region (for cross-cultural analysis)
- User's background (architect / student / general public)
- Pre-computed property scores for both images (once the scoring engine exists)

---

## Implementation Notes

### Phase 1: Twitter + Instagram (Week 1)
- Curate 50 image pairs across all categories (buildings, pottery, spaces, details, wild cards)
- Set up accounts, schedule first two weeks of content
- Manual tracking in a spreadsheet: pair, result, margin, which properties are relevant

### Phase 2: Newsletter (Week 2-3)
- Set up Substack or Beehiiv
- Cross-promote from Twitter/Instagram
- Add vote-tracking via email click analytics

### Phase 3: Calibration Game (Week 3-5)
- Web app: Next.js, simple UI
- Image pair database with pre-scored property ratings (initially by LLM, later by formula)
- Result calculation: compare user choices to scoring engine across 30 pairs
- Profile generation and shareable result card (OG image for social sharing)
- Analytics dashboard tracking agreement rates across users and properties

### Image Sourcing
- Wikimedia Commons (CC-licensed architectural photography)
- Unsplash (free high-quality photos)
- Personal photography
- Architecture photography communities (with permission)
- Ensure diverse geographic/cultural representation to test universality claim

---

## Open Questions

- What's the right difficulty curve for the Calibration Game? Start with obvious pairs (cathedral vs. parking garage) and progress to subtle ones (two well-designed houses)?
- How many pairs does a user need to complete for a statistically meaningful profile? 30? 50?
- Should the Twitter account reveal that it's connected to a product (HomeMaker) or remain "pure" as an educational/cultural account?
- How to handle disagreements where experts and general public diverge? Both signals are valuable but mean different things.

---

## Connection to HomeMaker

- **Scoring Engine:** The dataset directly calibrates and validates the mathematical scoring formulas
- **Phase 4 Wizard:** The perception profile maps to property weights for personalized design
- **Audience:** Every follower/subscriber is a potential user of WholenessScore.com, WholeHouse Report, and eventually HomeMaker itself
- **Research:** Answers PRD Open Question #3 definitively
