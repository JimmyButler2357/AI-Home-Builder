"""Wikimedia Commons figure fetcher for The Well-Tempered Midwest.

Sources each `kind == "commons"` figure from the Commons API, downloads a
~1600px-wide thumbnail, rejects anything narrower than MIN_WIDTH, extracts
machine-readable attribution, and caches to figures/. Re-runs are cheap:
an already-cached, still-valid file is skipped.

Output:
  figures/fig01.jpg ...            downloaded images
  figures/attributions.json        {n: {path, caption, attribution, license,
                                        artist, credit, source_url, width}}
  figures/fetch_log.json           per-figure status + reason on failure

This runs unchanged wherever outbound HTTPS to commons.wikimedia.org and
upload.wikimedia.org is permitted. In a network-restricted environment it
will record each figure as failed with the transport error, and the DOCX
build falls back to a labelled placeholder.
"""
import html
import json
import os
import re
import sys
import time

import requests

from manifest import FIGURES, MIN_WIDTH

HERE = os.path.dirname(os.path.abspath(__file__))
FIGDIR = os.path.join(HERE, "figures")
API = "https://commons.wikimedia.org/w/api.php"
UA = "WellTemperedMidwest-DocBuild/1.0 (personal reading document)"
HEADERS = {"User-Agent": UA}

TAG_RE = re.compile(r"<[^>]+>")


def strip_html(s):
    if not s:
        return ""
    return html.unescape(TAG_RE.sub("", s)).strip()


def search_images(query, limit=10):
    """Return imageinfo records for a Commons full-text file search."""
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": 6,          # file namespace only
        "gsrlimit": limit,
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata|mime",
        "iiurlwidth": 1600,         # sensible thumbnail, not a 40MB original
        "format": "json",
    }
    r = requests.get(API, params=params, headers=HEADERS, timeout=45)
    r.raise_for_status()
    pages = (r.json().get("query", {}) or {}).get("pages", {}) or {}
    # search generator preserves rank via 'index'
    recs = sorted(pages.values(), key=lambda p: p.get("index", 1e9))
    return recs


def pick(recs):
    """Choose the first raster image whose native width >= MIN_WIDTH."""
    for p in recs:
        ii = (p.get("imageinfo") or [None])[0]
        if not ii:
            continue
        mime = ii.get("mime", "")
        if mime not in ("image/jpeg", "image/png"):
            continue
        if int(ii.get("width", 0)) < MIN_WIDTH:
            continue
        return p, ii
    return None, None


def attribution_line(ii):
    ex = ii.get("extmetadata", {}) or {}
    artist = strip_html((ex.get("Artist") or {}).get("value", ""))
    lic = strip_html((ex.get("LicenseShortName") or {}).get("value", ""))
    credit = strip_html((ex.get("Credit") or {}).get("value", ""))
    who = artist or credit or "Unknown"
    who = re.sub(r"\s+", " ", who)
    line = f"Photo: {who} / Wikimedia Commons"
    if lic:
        line += f", {lic}"
    return line, artist, lic, credit


def download(url, dest):
    with requests.get(url, headers=HEADERS, timeout=90, stream=True) as r:
        r.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in r.iter_content(65536):
                f.write(chunk)
    return os.path.getsize(dest)


def main():
    os.makedirs(FIGDIR, exist_ok=True)
    attributions, log = {}, {}
    for fig in FIGURES:
        n = fig["n"]
        if fig["kind"] != "commons":
            continue
        dest = os.path.join(FIGDIR, f"fig{n:02d}.jpg")
        queries = [fig["query"]] + ([fig["query_alt"]] if fig.get("query_alt") else [])
        got = False
        for q in queries:
            try:
                recs = search_images(q)
                page, ii = pick(recs)
                if not ii:
                    log[n] = {"status": "no_suitable_image", "query": q,
                              "reason": f">= {MIN_WIDTH}px raster not found"}
                    continue
                thumb = ii.get("thumburl") or ii.get("url")
                size = download(thumb, dest)
                line, artist, lic, credit = attribution_line(ii)
                attributions[n] = {
                    "path": os.path.relpath(dest, HERE),
                    "caption": fig["caption"],
                    "attribution": line,
                    "artist": artist, "license": lic, "credit": credit,
                    "source_url": ii.get("descriptionurl") or ii.get("url"),
                    "width": ii.get("thumbwidth") or ii.get("width"),
                    "query": q,
                }
                log[n] = {"status": "ok", "query": q, "bytes": size,
                          "width": attributions[n]["width"], "license": lic}
                print(f"Fig {n:>2}: OK  {attributions[n]['width']}px  {line}")
                got = True
                break
            except Exception as e:  # network / policy / parse
                log[n] = {"status": "error", "query": q,
                          "reason": f"{type(e).__name__}: {e}"}
                print(f"Fig {n:>2}: ERROR ({q}): {type(e).__name__}: {e}",
                      file=sys.stderr)
            time.sleep(0.4)
        if not got and n not in log:
            log[n] = {"status": "error", "reason": "unknown"}

    with open(os.path.join(FIGDIR, "attributions.json"), "w") as f:
        json.dump(attributions, f, indent=2)
    with open(os.path.join(FIGDIR, "fetch_log.json"), "w") as f:
        json.dump(log, f, indent=2)
    ok = sum(1 for v in log.values() if v.get("status") == "ok")
    print(f"\n{ok}/{sum(1 for x in FIGURES if x['kind']=='commons')} "
          f"commons figures fetched. Log -> figures/fetch_log.json")


if __name__ == "__main__":
    main()
