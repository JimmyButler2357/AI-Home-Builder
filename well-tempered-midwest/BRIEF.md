# Build Brief: Illustrated Edition of *The Well-Tempered Midwest*

**For:** Claude Code
**Input:** `the-well-tempered-midwest.md`
**Output:** `the-well-tempered-midwest.docx` (print-ready, images embedded), optionally uploaded to Google Drive

---

## Task

Take the essay markdown and produce a print-ready illustrated document. Source each figure from the manifest below, download it, embed it at the specified anchor point with a caption and attribution line, and export to DOCX.

Do not alter the essay prose. Only insert figures, captions, and attribution.

---

## Sourcing strategy — read this before writing any code

**Use Wikimedia Commons as the primary source.** This is not a legal hedge, it's the practical engineering choice:

- Commons has a clean API (`https://commons.wikimedia.org/w/api.php`) that returns direct file URLs, resolution, and license metadata in one call
- Files are served from `upload.wikimedia.org` with stable URLs and no hotlink blocking or bot detection
- Licensing is explicit and machine-readable, so attribution can be generated automatically
- Image quality is generally high and architectural coverage is excellent

General web image search will fight you: hotlink protection, Cloudflare, redirects to HTML pages instead of files, and inconsistent or absent licensing.

**Recommended API pattern:**

```
GET https://commons.wikimedia.org/w/api.php
  ?action=query
  &generator=search
  &gsrsearch=<query>
  &gsrnamespace=6            # file namespace only
  &gsrlimit=10
  &prop=imageinfo
  &iiprop=url|size|extmetadata
  &iiurlwidth=1600           # get a sensible thumbnail, not a 40MB original
  &format=json
```

Take `imageinfo[0].thumburl` for the download, and pull `extmetadata.Artist`, `extmetadata.LicenseShortName`, and `extmetadata.Credit` for the attribution line.

**Fallbacks, in order:**
1. Wikimedia Commons (preferred for all photographic figures)
2. The institution's own press/media page — Baumschlager Eberle, Mick Pearce's site, ArchDaily press kits
3. For technical schematics (DOAS, VAV), consider **generating the diagram** rather than sourcing one — a clean matplotlib or SVG schematic will print better and dodge licensing entirely. See the note on Figures 12 and 13.

**Set a real User-Agent** on requests to Wikimedia (they block generic Python defaults):
```python
headers = {"User-Agent": "WellTemperedMidwest-DocBuild/1.0 (personal reading document)"}
```

**Reject anything under about 800px wide.** It will look terrible in print.

---

## Figure manifest

Anchors are unique phrases in the essay. Insert each figure immediately after the paragraph containing its anchor phrase.

| # | Subject | Anchor phrase | Search query | Caption |
|---|---------|--------------|--------------|---------|
| 1 | Monadnock Building, full elevation | `Burnham & Root finished the north half in 1891` | `Monadnock Building Chicago` | **Fig. 1** — Monadnock Building, Burnham & Root, 1891. Sixteen stories of load-bearing brick; note the projecting bays pulling glazing into a narrow floor plate. |
| 2 | Monadnock base / battered wall | `six feet thick` | `Monadnock Building Chicago base` OR `Monadnock Building entrance` | **Fig. 2** — The base course. The wall thickens toward the ground because the masonry is carrying the load — and incidentally forms an enormous thermal flywheel. |
| 3 | Rookery light court | `the Rookery's light court` | `Rookery Building Chicago light court` | **Fig. 3** — The Rookery's light court. Daylight and cross-ventilation were the binding constraints; the light well is the physics showing through. |
| 4 | Larkin Building exterior | `housed in the great corner towers` | `Larkin Administration Building` | **Fig. 4** — Larkin Administration Building, Frank Lloyd Wright, Buffalo, c.1906. The corner towers are the air-handling plant. |
| 5 | Larkin interior atrium | `The environmental system generated the architecture` | `Larkin Building interior` | **Fig. 5** — The top-lit central court. Sealed against the railyard, mechanically ventilated, filtered and tempered. |
| 6 | Unity Temple | `Unity Temple, Oak Park, 1908` | `Unity Temple Oak Park interior` | **Fig. 6** — Unity Temple. Wright working the conservative mode: heavy concrete, top light, ventilation moving through the structure itself. |
| 7 | 2226 Lustenau exterior | `2226 in Lustenau, Austria` | `2226 Lustenau Baumschlager Eberle` | **Fig. 7** — 2226, Baumschlager Eberle, Lustenau, 2013. Deep-set punched windows in an ~80cm plastered brick wall. No heating, no cooling, no mechanical ventilation. |
| 8 | 2226 window / vent detail | `occupant-operated vents alone` | `2226 Lustenau window` | **Fig. 8** — The sensor-controlled ventilation flap. The entire "mechanical system," essentially. |
| 9 | Eastgate Centre, chimneys | `Harare sits at nearly 5,000 feet` | `Eastgate Centre Harare` | **Fig. 9** — Eastgate Centre, Mick Pearce with Arup, Harare, 1996. The rooftop stacks are the buoyancy engine driving night flush through the concrete mass. |
| 10 | Roman hypocaust | `The Romans ran hot flue gas through a raised floor` | `hypocaust` | **Fig. 10** — Hypocaust, Roman. Raised floor on pilae, hot gas circulating beneath, the room heated from its surfaces. |
| 11 | Persian windcatcher | `Badgirs, solar chimneys, and stack ventilation` | `windcatcher Yazd` OR `badgir Iran` | **Fig. 11** — Badgirs at Yazd. Take the tower; leave the qanat. Buoyancy travels to Chicago, evaporative cooling does not. |
| 12 | DOAS schematic | `A dedicated outdoor air system (DOAS)` | *generate — see note below* | **Fig. 12** — Decoupled architecture: DOAS carries ventilation and all latent load; hydronic radiant carries sensible load. |
| 13 | VAV terminal | `plus something on the order of 100 to 200 terminal boxes` | *generate or source* `variable air volume terminal unit` | **Fig. 13** — A VAV terminal box: damper, actuator, controller, flow sensor, reheat coil, valve. Now multiply by 150. |
| 14 | Radiant slab tubing | `That is precisely what a hydronic radiant slab does` | `underfloor heating pipes installation` | **Fig. 14** — Hydronic tubing before pour. The hypocaust with a pump. |

**Note on Figures 12 and 13:** these are the two where generating beats sourcing. A hand-drawn schematic contrasting (a) conventional VAV — one air stream doing three jobs, terminal box per zone — against (b) decoupled DOAS + radiant will communicate the essay's central mechanical argument far better than any stock photo, and prints cleanly in black and white. Build it in matplotlib or as SVG and convert. If that's more work than it's worth on the first pass, source a VAV box photo for 13 and skip 12.

---

## Document build

**Tooling:** `python-docx` for assembly. Avoid pandoc for this — you need per-image sizing and caption control that pandoc's markdown-to-docx path makes awkward.

**Layout spec:**
- Body: serif, 11pt, 1.15 line spacing, ragged right
- Page: Letter, 1" margins — this is going to be printed and read on a train, so it needs to survive a home printer
- Images: full column width (6.5"), centered, with 6pt space above and 12pt below
- Captions: 9pt italic, centered, immediately below the image
- Attribution: 7pt, grey, centered, below the caption — format as `Photo: {Artist} / Wikimedia Commons, {LicenseShortName}`. Strip HTML tags out of the `extmetadata` fields; they come back with markup in them.
- Headings: keep the essay's existing hierarchy (`#`, `##`, `###`)
- Page break before each `##` section — makes it navigable when printed
- Add a footer with page numbers

**Handle the markdown properly:** the essay uses bold, italic, bullet lists, numbered lists, a horizontal rule, and one table-free structure. Convert inline `**bold**` and `*italic*` to actual runs, don't leave asterisks in the output.

---

## Acceptance criteria

1. Every figure in the manifest is either embedded or explicitly logged as failed, with the reason
2. No figure is below 800px source width
3. Every embedded figure has a caption and an attribution line
4. Essay prose is byte-identical to the input apart from figure insertions
5. The DOCX opens cleanly in Word and in Google Docs
6. Print preview shows no orphaned captions — caption must never break to a page separate from its image (set `keep_with_next` on the image paragraph)

Print one copy to PDF as a check before declaring done.

---

## Optional: push to Google Drive

If you want it in Drive, the cleanest path is the Drive API with a service account or OAuth client, uploading the DOCX with `mimeType: application/vnd.google-apps.document` to convert it to a native Google Doc on the way in:

```python
file_metadata = {
    'name': 'The Well-Tempered Midwest',
    'mimeType': 'application/vnd.google-apps.document'  # triggers conversion
}
media = MediaFileUpload('the-well-tempered-midwest.docx',
    mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
```

Be aware the conversion will slightly reflow the layout and may resize images. If print fidelity matters more than editability, skip the conversion and upload the DOCX as-is.

---

## Suggested order of work

1. Write the Commons fetcher and test it on Figure 1 alone. Get one image downloading with correct attribution before building anything else.
2. Run the full manifest, cache downloads to a local `figures/` directory so re-runs don't re-fetch.
3. Build the markdown-to-docx converter with a stub image inserter.
4. Wire the two together.
5. Print to PDF, check, iterate.

Cache aggressively. You will run this more than once.
