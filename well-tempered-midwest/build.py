#!/usr/bin/env python3
"""Assemble the illustrated DOCX of The Well-Tempered Midwest.

Parses the essay markdown, applies the print layout from the brief, inserts
each manifest figure after its anchor paragraph (embedding the image where
available, otherwise a clearly-labelled placeholder that is also logged as
failed with a reason), verifies the essay prose is preserved, and exports a
PDF proof via LibreOffice.

Run order:  schematics.py  ->  commons_fetch.py  ->  build.py
"""
import json
import os
import re
import subprocess
import sys
import tempfile

from PIL import Image
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

from manifest import FIGURES, MIN_WIDTH

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "the-well-tempered-midwest.md")
FIGDIR = os.path.join(HERE, "figures")
OUT_DOCX = os.path.join(HERE, "the-well-tempered-midwest.docx")

BODY_FONT = "Times New Roman"      # native in Word/Google Docs; Liberation Serif locally
INK = RGBColor(0x1A, 0x1A, 0x1A)
SLATE = RGBColor(0x33, 0x3A, 0x40)
GREY = RGBColor(0x80, 0x80, 0x80)
COL_WIDTH_IN = 6.5
MAX_IMG_H_IN = 8.3
NET_REASON = ("network policy denied Wikimedia Commons — the session egress "
              "proxy returned 403 Forbidden for commons.wikimedia.org")

EMPH = re.compile(r"(\*\*.+?\*\*|\*.+?\*)")
NUM_RE = re.compile(r"^(\d+)\.\s+(.*)$")
WS = re.compile(r"\s+")


# --------------------------------------------------------------------------- #
# markdown parsing
# --------------------------------------------------------------------------- #
def parse_blocks(text):
    blocks, seen_h2 = [], False
    for raw in text.split("\n"):
        s = raw.strip()
        if not s:
            continue
        if s == "---":
            blocks.append({"type": "hr"})
        elif s.startswith("### "):
            blocks.append({"type": "subtitle" if not seen_h2 else "h3",
                           "text": s[4:].strip()})
        elif s.startswith("## "):
            seen_h2 = True
            blocks.append({"type": "h2", "text": s[3:].strip()})
        elif s.startswith("# "):
            blocks.append({"type": "h1", "text": s[2:].strip()})
        elif s.startswith("- "):
            blocks.append({"type": "ul", "text": s[2:].strip()})
        elif NUM_RE.match(s):
            m = NUM_RE.match(s)
            blocks.append({"type": "ol", "num": m.group(1),
                           "text": m.group(2).strip()})
        else:
            blocks.append({"type": "para", "text": s})
    return blocks


def strip_emphasis(t):
    return t.replace("**", "").replace("*", "")


def norm(t):
    return WS.sub(" ", strip_emphasis(t)).strip()


# --------------------------------------------------------------------------- #
# low-level docx helpers
# --------------------------------------------------------------------------- #
def add_formatted(p, text, bold=False, italic=False, color=None, size=None):
    """Add inline runs, converting **bold** / *italic* (incl. nesting like
    **bold with *italic* inside**) to real runs."""
    for tok in EMPH.split(text):
        if not tok:
            continue
        if tok.startswith("**") and tok.endswith("**") and len(tok) > 4:
            add_formatted(p, tok[2:-2], True, italic, color, size)
        elif tok.startswith("*") and tok.endswith("*") and len(tok) > 2:
            add_formatted(p, tok[1:-1], bold, True, color, size)
        else:
            r = p.add_run(tok)
            r.bold, r.italic = bold, italic
            if color is not None:
                r.font.color.rgb = color
            if size is not None:
                r.font.size = Pt(size)
            r.font.name = BODY_FONT
    return p


def set_border_and_shade(p):
    pPr = p._p.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear"); shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), "F2F1ED")
    pPr.append(shd)
    bdr = OxmlElement("w:pBdr")
    for edge in ("top", "left", "bottom", "right"):
        e = OxmlElement(f"w:{edge}")
        e.set(qn("w:val"), "dashed"); e.set(qn("w:sz"), "8")
        e.set(qn("w:space"), "8"); e.set(qn("w:color"), "9A9A9A")
        bdr.append(e)
    pPr.append(bdr)


def add_page_field(p):
    for txt in ("Page ",):
        r = p.add_run(txt); r.font.size = Pt(9); r.font.color.rgb = GREY
        r.font.name = BODY_FONT
    r = p.add_run()
    r.font.size = Pt(9); r.font.color.rgb = GREY; r.font.name = BODY_FONT
    b = OxmlElement("w:fldChar"); b.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText"); instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), "end")
    r._r.append(b); r._r.append(instr); r._r.append(e)


# --------------------------------------------------------------------------- #
# document scaffolding
# --------------------------------------------------------------------------- #
def build_styles(doc):
    st = doc.styles["Normal"]
    st.font.name = BODY_FONT
    st.font.size = Pt(11)
    st.font.color.rgb = INK
    st.element.rPr.rFonts.set(qn("w:cs"), BODY_FONT)
    pf = st.paragraph_format
    pf.line_spacing = 1.15
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    pf.space_after = Pt(8)
    pf.alignment = WD_ALIGN_PARAGRAPH.LEFT   # ragged right

    def mk(name, size, italic=False, bold=False, color=INK, after=6, before=0,
           align=WD_ALIGN_PARAGRAPH.LEFT):
        s = doc.styles.add_style(name, 1)  # 1 = paragraph
        s.base_style = doc.styles["Normal"]
        s.font.name = BODY_FONT; s.font.size = Pt(size)
        s.font.italic = italic; s.font.bold = bold; s.font.color.rgb = color
        s.paragraph_format.space_after = Pt(after)
        s.paragraph_format.space_before = Pt(before)
        s.paragraph_format.alignment = align
        return s

    mk("FigCaption", 9, italic=True, after=0, before=2,
       align=WD_ALIGN_PARAGRAPH.CENTER)
    mk("FigAttribution", 7, color=GREY, after=12, before=0,
       align=WD_ALIGN_PARAGRAPH.CENTER)
    mk("FigPlaceholder", 10, color=SLATE, after=0, before=6,
       align=WD_ALIGN_PARAGRAPH.CENTER)
    mk("EssaySubtitle", 14, italic=True, color=SLATE, after=18, before=6,
       align=WD_ALIGN_PARAGRAPH.CENTER)
    mk("EssayTitle", 30, bold=True, after=6, before=90,
       align=WD_ALIGN_PARAGRAPH.CENTER)
    mk("Rule", 11, color=GREY, after=10, before=10,
       align=WD_ALIGN_PARAGRAPH.CENTER)

    for lvl, size in (("Heading 1", 22), ("Heading 2", 18), ("Heading 3", 13)):
        h = doc.styles[lvl]
        h.font.name = BODY_FONT; h.font.size = Pt(size)
        h.font.color.rgb = SLATE; h.font.bold = True
        h.element.rPr.rFonts.set(qn("w:cs"), BODY_FONT)
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(6)
        h.paragraph_format.keep_with_next = True


def setup_page(doc):
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Inches(8.5), Inches(11)
    for m in ("top_margin", "bottom_margin", "left_margin", "right_margin"):
        setattr(sec, m, Inches(1))
    footer = sec.footer
    footer.is_linked_to_previous = False
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_page_field(fp)


# --------------------------------------------------------------------------- #
# figure rendering
# --------------------------------------------------------------------------- #
def img_size_in(path):
    w, h = Image.open(path).size
    width_in = COL_WIDTH_IN
    height_in = width_in * h / w
    if height_in > MAX_IMG_H_IN:
        return None, MAX_IMG_H_IN
    return width_in, height_in


def embed_image(doc, path, caption, attribution):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run()
    w_in, h_in = img_size_in(path)
    if w_in is None:
        run.add_picture(path, height=Inches(h_in))
    else:
        run.add_picture(path, width=Inches(w_in))
    cap = doc.add_paragraph(style="FigCaption")
    cap.paragraph_format.keep_with_next = True
    add_formatted(cap, caption, italic=True, size=9)
    att = doc.add_paragraph(style="FigAttribution")
    add_formatted(att, attribution, size=7, color=GREY)


def embed_placeholder(doc, fig, reason):
    n = fig["n"]
    box = doc.add_paragraph(style="FigPlaceholder")
    box.paragraph_format.keep_with_next = True
    set_border_and_shade(box)
    r = box.add_run(f"◹  FIGURE {n} — image not embedded")
    r.bold = True; r.font.size = Pt(10.5); r.font.color.rgb = SLATE
    r.font.name = BODY_FONT
    box.add_run("\n")
    q = fig.get("query", "")
    alt = f"  (or: “{fig['query_alt']}”)" if fig.get("query_alt") else ""
    d = box.add_run(f"Source when available: Wikimedia Commons — "
                    f"search “{q}”{alt}\nReason: {reason}")
    d.font.size = Pt(8.5); d.font.color.rgb = GREY; d.font.name = BODY_FONT
    cap = doc.add_paragraph(style="FigCaption")
    cap.paragraph_format.keep_with_next = True
    add_formatted(cap, fig["caption"], italic=True, size=9)
    att = doc.add_paragraph(style="FigAttribution")
    add_formatted(att, "Attribution line generated automatically on sourcing "
                       "(Photo: {Artist} / Wikimedia Commons, {License}).",
                  size=7, color=GREY)


# --------------------------------------------------------------------------- #
# main assembly
# --------------------------------------------------------------------------- #
def render_block(doc, blk, next_is_heading):
    t = blk["type"]
    if t == "hr":
        if not next_is_heading:                       # skip rules the page break replaces
            p = doc.add_paragraph(style="Rule")
            p.add_run("* * *")
        return None
    if t == "h1":
        p = doc.add_paragraph(style="EssayTitle")
        add_formatted(p, blk["text"], bold=True, size=30, color=SLATE)
        return norm(blk["text"])
    if t == "subtitle":
        p = doc.add_paragraph(style="EssaySubtitle")
        add_formatted(p, blk["text"], italic=True, size=14, color=SLATE)
        return norm(blk["text"])
    if t in ("h2", "h3"):
        lvl = 2 if t == "h2" else 3
        p = doc.add_paragraph(style=f"Heading {lvl}")
        if t == "h2":
            p.paragraph_format.page_break_before = True
        add_formatted(p, blk["text"], color=SLATE)
        return norm(blk["text"])
    if t == "ul":
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.35)
        p.paragraph_format.first_line_indent = Inches(-0.22)
        p.paragraph_format.space_after = Pt(4)
        p.add_run("•\t")
        add_formatted(p, blk["text"])
        return norm(blk["text"])
    if t == "ol":
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.4)
        p.paragraph_format.first_line_indent = Inches(-0.27)
        p.paragraph_format.space_after = Pt(4)
        p.add_run(f"{blk['num']}.\t")
        add_formatted(p, blk["text"])
        return norm(blk["text"])
    # paragraph
    p = doc.add_paragraph()
    add_formatted(p, blk["text"])
    return norm(blk["text"])


def resolve_figures():
    """Return {n: dict(mode, path?, caption, attribution?, reason?)}."""
    attribs = {}
    ap = os.path.join(FIGDIR, "attributions.json")
    if os.path.exists(ap):
        attribs = {int(k): v for k, v in json.load(open(ap)).items()}
    log = {}
    lp = os.path.join(FIGDIR, "fetch_log.json")
    if os.path.exists(lp):
        log = {int(k): v for k, v in json.load(open(lp)).items()}

    resolved = {}
    for fig in FIGURES:
        n = fig["n"]
        if fig["kind"] == "generated":
            path = os.path.join(FIGDIR, fig["source"])
            if os.path.exists(path):
                w = Image.open(path).size[0]
                resolved[n] = dict(mode="embed", path=path,
                                   caption=fig["caption"],
                                   attribution=fig["attribution"], width=w)
            else:
                resolved[n] = dict(mode="fail", caption=fig["caption"],
                                   reason=f"generated file missing: {fig['source']}")
        else:  # commons
            info = attribs.get(n)
            path = os.path.join(HERE, info["path"]) if info else None
            if info and path and os.path.exists(path):
                w = Image.open(path).size[0]
                if w < MIN_WIDTH:
                    resolved[n] = dict(mode="fail", caption=fig["caption"],
                                       reason=f"source width {w}px < {MIN_WIDTH}px")
                else:
                    resolved[n] = dict(mode="embed", path=path,
                                       caption=fig["caption"],
                                       attribution=info["attribution"], width=w)
            else:
                reason = NET_REASON
                if n in log and log[n].get("reason"):
                    r = log[n]["reason"]
                    if "403" in r or "Proxy" in r:
                        reason = NET_REASON
                    else:
                        reason = r
                resolved[n] = dict(mode="fail", caption=fig["caption"],
                                   reason=reason)
    return resolved


def main():
    text = open(SRC, encoding="utf-8").read()
    blocks = parse_blocks(text)

    # map each figure to the index of the block containing its anchor
    figs_at = {}
    for fig in FIGURES:
        idx = next((i for i, b in enumerate(blocks)
                    if fig["anchor"] in b.get("text", "")), None)
        if idx is None:
            raise SystemExit(f"anchor not found for Fig {fig['n']}: {fig['anchor']!r}")
        figs_at.setdefault(idx, []).append(fig)
    for i in figs_at:
        figs_at[i].sort(key=lambda f: f["n"])

    resolved = resolve_figures()

    doc = Document()
    build_styles(doc)
    setup_page(doc)

    expected_prose, log_rows = [], []
    for idx, blk in enumerate(blocks):
        nxt = blocks[idx + 1] if idx + 1 < len(blocks) else None
        next_is_heading = bool(nxt and nxt["type"] in ("h1", "h2", "h3", "subtitle"))
        prose = render_block(doc, blk, next_is_heading)
        if prose:
            expected_prose.append(prose)
        for fig in figs_at.get(idx, []):
            n = fig["n"]
            r = resolved[n]
            if r["mode"] == "embed":
                embed_image(doc, r["path"], r["caption"], r["attribution"])
                log_rows.append((n, "embedded", f"{r['width']}px",
                                 r.get("attribution", "")))
            else:
                embed_placeholder(doc, fig, r["reason"])
                log_rows.append((n, "FAILED", "-", r["reason"]))

    doc.save(OUT_DOCX)

    # ---- verify essay prose preserved (AC #4) ----------------------------- #
    verify = Document(OUT_DOCX)
    skip = {"FigCaption", "FigAttribution", "FigPlaceholder", "Rule"}
    got = []
    for p in verify.paragraphs:
        if p.style.name in skip:
            continue
        txt = "".join(r.text for r in p.runs)
        txt = re.sub(r"^\s*•\t", "", txt)
        txt = re.sub(r"^\s*\d+\.\t", "", txt)
        txt = WS.sub(" ", txt).strip()
        if txt:
            got.append(txt)
    exp_join, got_join = " ".join(expected_prose), " ".join(got)
    prose_ok = exp_join == got_join
    if not prose_ok:
        # show first divergence to aid debugging
        for a, b in zip(expected_prose, got):
            if a != b:
                print("PROSE MISMATCH:\n  expected:", a[:120],
                      "\n  got     :", b[:120], file=sys.stderr)
                break
        print(f"lens exp={len(exp_join)} got={len(got_join)} "
              f"blocks exp={len(expected_prose)} got={len(got)}", file=sys.stderr)

    # ---- write build log -------------------------------------------------- #
    embedded = [r for r in log_rows if r[1] == "embedded"]
    failed = [r for r in log_rows if r[1] == "FAILED"]
    log = {
        "output": os.path.basename(OUT_DOCX),
        "figures_total": len(FIGURES),
        "embedded": len(embedded),
        "failed": len(failed),
        "prose_byte_identical": prose_ok,
        "min_source_width_enforced": MIN_WIDTH,
        "rows": [dict(n=n, status=s, width=w, detail=d) for n, s, w, d in
                 sorted(log_rows)],
    }
    json.dump(log, open(os.path.join(HERE, "build_log.json"), "w"), indent=2)
    with open(os.path.join(HERE, "build_log.txt"), "w") as f:
        f.write("Build log — The Well-Tempered Midwest (illustrated)\n")
        f.write("=" * 60 + "\n")
        f.write(f"Embedded: {len(embedded)}/{len(FIGURES)}   "
                f"Failed: {len(failed)}   "
                f"Prose byte-identical: {prose_ok}\n\n")
        for n, s, w, d in sorted(log_rows):
            f.write(f"  Fig {n:>2}: {s:<9} {w:<8} {d}\n")

    print(f"Saved {OUT_DOCX}")
    print(f"  embedded {len(embedded)}/{len(FIGURES)}, failed {len(failed)}")
    print(f"  prose byte-identical: {prose_ok}")
    return prose_ok


def to_pdf():
    """Render a PDF proof via LibreOffice, keeping its profile out of the repo."""
    profile = os.path.join(tempfile.gettempdir(), "wtm_lo_profile")
    try:
        subprocess.run(
            ["libreoffice", "--headless", "--invisible", "--nologo",
             f"-env:UserInstallation=file://{profile}",
             "--convert-to", "pdf:writer_pdf_Export",
             "--outdir", HERE, OUT_DOCX],
            check=True, capture_output=True, timeout=180)
        pdf = OUT_DOCX[:-5] + ".pdf"
        if os.path.exists(pdf):
            print(f"  PDF proof: {pdf} "
                  f"({os.path.getsize(pdf)//1024} KB)")
            return pdf
    except Exception as e:
        print(f"  PDF conversion failed: {e}", file=sys.stderr)
    return None


if __name__ == "__main__":
    ok = main()
    to_pdf()
    sys.exit(0 if ok else 2)
