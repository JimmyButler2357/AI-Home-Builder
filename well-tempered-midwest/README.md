# The Well-Tempered Midwest — illustrated edition

Build pipeline that turns `the-well-tempered-midwest.md` into a print-ready,
illustrated `the-well-tempered-midwest.docx` (Letter, 1" margins, serif body,
page-break-per-section, page-number footer), per `BRIEF.md`.

## Files

| File | Purpose |
|------|---------|
| `the-well-tempered-midwest.md` | Essay source (unchanged; prose is preserved byte-for-byte) |
| `manifest.py` | The 14-figure manifest: anchors, search queries, captions |
| `schematics.py` | Generates Figs 12 & 13 (matplotlib) → `figures/*.png` |
| `commons_fetch.py` | Sources the 12 photographic figures from Wikimedia Commons |
| `build.py` | Parses the markdown, inserts figures, verifies prose, writes DOCX + PDF proof |
| `build_log.json` / `build_log.txt` | Per-figure embedded/failed status with reasons |
| `the-well-tempered-midwest.docx` | **The deliverable** |
| `the-well-tempered-midwest.pdf` | Print proof (rendered via LibreOffice) |

## How to build

```bash
pip install python-docx matplotlib Pillow requests
python schematics.py      # Figs 12, 13
python commons_fetch.py   # Figs 1–11, 14  (needs network — see below)
python build.py           # assembles DOCX + PDF proof, verifies prose
```

`build.py` is idempotent and caches: it embeds whatever images exist in
`figures/`, and drops a labelled placeholder (also logged in `build_log`)
for any it can't find.

## Current state of the figures

`build.py` embedded **2 of 14** figures:

- **Figs 12 & 13** — the DOAS-vs-VAV and VAV-terminal schematics — are
  generated locally and embedded. (The brief calls these the two where
  generating beats sourcing.)
- **Figs 1–11 and 14** — the photographs — are **not** embedded. This
  session's egress network policy denies outbound HTTPS to
  `commons.wikimedia.org` / `upload.wikimedia.org` (the proxy returns
  `403 Forbidden`), so neither `requests` nor the built-in fetch could
  retrieve image bytes. Each is logged as failed with that reason and shown
  in the DOCX as a labelled placeholder carrying its final caption and the
  exact Commons query to fill it.

## To finish the photographs

The pipeline is complete — only the image bytes are missing. Any of:

1. **Re-run with network (turnkey).** Start a session on this repo/branch in
   an environment whose network policy permits `*.wikimedia.org` (Claude Code
   on the web → an environment with "No network restrictions", or a custom
   allowlist including `wikimedia.org`), then:

   ```bash
   bash well-tempered-midwest/finish.sh
   ```

   That runs `schematics.py` + `commons_fetch.py` + `build.py`. The 12 photos
   download (≥800px enforced), attribution lines are generated automatically
   from Commons license metadata, and every placeholder becomes a real figure.
   Nothing else changes.
2. **Drop images into `figures/`** as `fig01.jpg … fig14.jpg` and add matching
   rows to `figures/attributions.json` (`path`, `caption`, `attribution`),
   then re-run `python build.py`.

Prose is never touched by any of this — `build.py` fails the build if the
essay text is not preserved exactly.
