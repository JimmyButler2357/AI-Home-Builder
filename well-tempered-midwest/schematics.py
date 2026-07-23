"""Generate the two schematic figures (12, 13) for the essay.

These are hand-built rather than sourced: a clean line schematic states the
essay's central mechanical argument better than any stock photo and prints
cleanly in black and white. Output PNGs land in figures/.
"""
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, Rectangle, FancyArrowPatch
from matplotlib.lines import Line2D

HERE = os.path.dirname(os.path.abspath(__file__))
FIGDIR = os.path.join(HERE, "figures")

INK = "#1a1a1a"
AIR = "#e7ddce"      # warm grey — the air stream
AIR_E = "#9c8f76"
WATER = "#cfe0ea"    # cool grey-blue — the water loop
WATER_E = "#5b7d92"
BOX = "#f4f2ee"
plt.rcParams.update({
    "font.family": "serif",
    "font.serif": ["DejaVu Serif"],
    "text.color": INK, "axes.edgecolor": INK,
})


def box(ax, x, y, w, h, label, fc=BOX, ec=INK, fs=10, weight="normal",
        rounded=True, lw=1.4):
    style = "round,pad=0.02,rounding_size=0.12" if rounded else "square,pad=0"
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=style,
                                fc=fc, ec=ec, lw=lw, mutation_scale=1))
    ax.text(x + w / 2, y + h / 2, label, ha="center", va="center",
            fontsize=fs, weight=weight, color=INK, zorder=5)


def arrow(ax, x1, y1, x2, y2, color=INK, lw=2.2, ls="-", ms=18):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2),
                 arrowstyle="-|>", mutation_scale=ms, lw=lw,
                 color=color, linestyle=ls, shrinkA=0, shrinkB=0, zorder=4))


def caption(ax, x, y, s, fs=9, style="italic", ha="center"):
    ax.text(x, y, s, ha=ha, va="center", fontsize=fs, style=style, color="#444")


# ----------------------------------------------------------------------------
def fig12_doas_vs_vav():
    fig, (axL, axR) = plt.subplots(1, 2, figsize=(9.4, 5.9))
    for ax in (axL, axR):
        ax.set_xlim(0, 10); ax.set_ylim(1.7, 12); ax.axis("off")

    # ---- (a) Conventional VAV : one medium, three jobs --------------------
    axL.text(5, 11.5, "(a)  Conventional VAV", ha="center", fontsize=13,
             weight="bold")
    axL.text(5, 10.85, "one medium — air — does three jobs at once",
             ha="center", fontsize=9.5, style="italic", color="#444")
    box(axL, 3.2, 9.2, 3.6, 1.1, "Central air handler", fc=AIR, ec=AIR_E,
        fs=10.5, weight="bold")
    # single fat air stream
    arrow(axL, 5, 9.2, 5, 8.4, color=AIR_E, lw=6, ms=26)
    axL.text(6.35, 8.75, "AIR\n(big duct, big fan)", ha="left", va="center",
             fontsize=8.6, color=AIR_E, weight="bold")
    # supply trunk
    axL.add_patch(Rectangle((1.0, 7.9), 8.0, 0.5, fc=AIR, ec=AIR_E, lw=1.4))
    # drops to VAV boxes across zones
    xs = [1.7, 3.5, 5.3, 7.1, 8.5]
    for i, x in enumerate(xs):
        arrow(axL, x, 7.9, x, 6.9, color=AIR_E, lw=2.4, ms=14)
        box(axL, x - 0.72, 5.7, 1.44, 1.15, "VAV\nbox", fc="#efe7d8",
            ec=AIR_E, fs=8.2)
        # reheat coil tick
        axL.add_patch(Rectangle((x - 0.5, 5.4), 1.0, 0.22, fc="#d9c7a5",
                      ec=AIR_E, lw=1.0))
        arrow(axL, x, 5.4, x, 4.7, color=AIR_E, lw=1.8, ms=11)
        box(axL, x - 0.66, 3.7, 1.32, 0.9, f"zone {i+1}", fc=BOX, fs=8)
    axL.text(5, 2.5,
             "One air stream carries ventilation, sensible heat/cool AND\n"
             "moisture removal. Each of 100–200 boxes: damper, actuator,\n"
             "flow sensor, reheat coil, valve. Plus miles of sheet metal.",
             ha="center", fontsize=9, color=INK)

    # ---- (b) Decoupled DOAS + radiant : split the jobs by medium ----------
    axR.text(5, 11.5, "(b)  Decoupled — DOAS + radiant", ha="center",
             fontsize=13, weight="bold")
    axR.text(5, 10.85, "split the jobs by medium: air for air, water for heat",
             ha="center", fontsize=9.5, style="italic", color="#444")
    # DOAS branch (air): ventilation + latent
    box(axR, 0.5, 9.1, 2.9, 1.2, "DOAS", fc=AIR, ec=AIR_E, fs=11, weight="bold")
    arrow(axR, 1.95, 9.0, 1.95, 7.4, color=AIR_E, lw=2.6, ms=15)
    axR.text(1.5, 8.4, "ventilation +\nALL latent", ha="right", va="center",
             fontsize=8, color=AIR_E)
    axR.text(2.45, 8.4, "small, constant\nairflow, leaving\ndewpoint ≈ 50°F",
             ha="left", va="center", fontsize=7.6, color=AIR_E)
    # thin supply to diffusers
    axR.add_patch(Rectangle((0.7, 7.0), 3.3, 0.32, fc=AIR, ec=AIR_E, lw=1.2))
    for x in (1.2, 2.4, 3.6):
        arrow(axR, x, 7.0, x, 6.4, color=AIR_E, lw=1.4, ms=9)

    # Radiant branch (water): sensible
    box(axR, 6.1, 9.1, 3.3, 1.2, "Plant\nheat pump · chiller", fc=WATER,
        ec=WATER_E, fs=9.2, weight="bold")
    # water loop down to slab (supply falls, return rises)
    arrow(axR, 7.0, 9.1, 7.0, 5.0, color=WATER_E, lw=3.0, ms=15)
    arrow(axR, 8.5, 5.0, 8.5, 9.1, color=WATER_E, lw=3.0, ms=15)
    axR.text(7.75, 6.9, "water\n~3,500×\nthe heat\nof air", ha="center",
             va="center", fontsize=7.8, color=WATER_E, weight="bold")
    # radiant slab with embedded coil
    axR.add_patch(Rectangle((0.7, 3.7), 8.7, 1.15, fc=WATER, ec=WATER_E, lw=1.5))
    axR.text(5.05, 4.55, "radiant slab — SENSIBLE load, no moving parts",
             ha="center", va="center", fontsize=8.8, color=WATER_E,
             weight="bold")
    # serpentine pipe hint, low in the slab so it clears the label
    xs2 = [i * 0.55 + 1.0 for i in range(15)]
    ys = [3.9 if k % 2 == 0 else 4.12 for k in range(15)]
    axR.add_line(Line2D(xs2, ys, color=WATER_E, lw=1.0, alpha=0.7))
    axR.text(5, 2.5,
             "Air moves only the code-driven ventilation minimum\n"
             "(and the humidity). Water moves the heat. The duct\n"
             "collapses; the VAV boxes disappear entirely.",
             ha="center", fontsize=9, color=INK)

    # divider
    fig.subplots_adjust(left=0.02, right=0.98, top=0.98, bottom=0.02,
                        wspace=0.06)
    fig.add_artist(Line2D([0.5, 0.5], [0.06, 0.9], color="#bbb", lw=1.0,
                          transform=fig.transFigure))
    out = os.path.join(FIGDIR, "schematic_doas.png")
    fig.savefig(out, dpi=200, facecolor="white")
    plt.close(fig)
    return out


# ----------------------------------------------------------------------------
def fig13_vav_box():
    fig, ax = plt.subplots(figsize=(9.4, 4.4))
    ax.set_xlim(0, 20); ax.set_ylim(0, 9.4); ax.axis("off")
    ax.text(10, 8.8, "A single VAV terminal box", ha="center", fontsize=13,
            weight="bold")
    ax.text(10, 8.1, "one of 100–200 in a typical 100,000 sf school",
            ha="center", fontsize=9.5, style="italic", color="#444")

    # main casing
    ax.add_patch(FancyBboxPatch((3.0, 2.7), 11.0, 3.2,
                 boxstyle="round,pad=0.02,rounding_size=0.15",
                 fc=BOX, ec=INK, lw=1.6))
    # inlet duct + primary air
    ax.add_patch(Rectangle((0.4, 3.6), 2.6, 1.4, fc=AIR, ec=AIR_E, lw=1.3))
    arrow(ax, 0.7, 4.3, 2.9, 4.3, color=AIR_E, lw=3.2, ms=18)
    ax.text(1.6, 5.35, "primary air in", ha="center", fontsize=8.5,
            color=AIR_E)

    # damper blade + actuator
    ax.add_line(Line2D([4.3, 5.3], [3.3, 5.3], color=INK, lw=3))
    ax.add_patch(plt.Circle((4.8, 4.3), 0.16, color=INK, zorder=6))
    box(ax, 4.0, 6.1, 1.7, 0.95, "actuator", fc="#e9e9e9", fs=8)
    ax.add_line(Line2D([4.8, 4.8], [5.3, 6.1], color=INK, lw=1.1, ls=":"))
    ax.text(4.8, 2.35, "damper", ha="center", fontsize=8.4)

    # flow sensor (averaging cross)
    ax.add_patch(plt.Circle((7.0, 4.3), 0.42, fc="white", ec=INK, lw=1.4))
    ax.add_line(Line2D([6.65, 7.35], [4.3, 4.3], color=INK, lw=1.1))
    ax.add_line(Line2D([7.0, 7.0], [3.95, 4.65], color=INK, lw=1.1))
    ax.text(7.0, 2.35, "flow sensor", ha="center", fontsize=8.4)

    # reheat coil (hot-water) with serpentine
    cx = 10.4
    ax.add_patch(Rectangle((cx - 1.0, 3.2), 2.0, 2.2, fc="#f0e3cf",
                 ec="#b08a4a", lw=1.4))
    sx = [cx - 0.75 + i * 0.3 for i in range(6)]
    ys = [3.7 if k % 2 == 0 else 4.9 for k in range(6)]
    ax.add_line(Line2D(sx, ys, color="#b08a4a", lw=1.6))
    ax.text(cx, 2.35, "reheat coil", ha="center", fontsize=8.4)
    # hot water valve
    ax.add_line(Line2D([cx, cx], [5.4, 6.3], color="#b08a4a", lw=1.8))
    ax.add_patch(plt.Polygon([[cx - 0.28, 6.3], [cx + 0.28, 6.3],
                 [cx - 0.28, 6.9], [cx + 0.28, 6.9]], closed=True,
                 fc="white", ec="#b08a4a", lw=1.4))
    ax.text(cx + 0.55, 6.6, "hot-water valve", ha="left", fontsize=8.2,
            color="#8a6a2a")

    # outlet
    arrow(ax, 14.0, 4.3, 16.1, 4.3, color=AIR_E, lw=3.2, ms=18)
    ax.text(15.6, 5.35, "to zone diffuser", ha="center", fontsize=8.5,
            color=AIR_E)

    # controller box wired to everything
    box(ax, 15.0, 1.0, 4.4, 1.5, "controller\n(DDC, wired to all of the above)",
        fc="#e9e9e9", fs=8.4)
    for px in (4.8, 7.0, cx):
        ax.add_line(Line2D([px, 17.2], [2.7, 2.5], color="#888", lw=0.7,
                    ls=":"))

    ax.text(10, 0.5,
            "Every box: a damper, an actuator, a controller, a flow sensor, "
            "and very often a reheat coil with its own valve — each a device "
            "with a service life, a failure mode, and a line in the capital plan.",
            ha="center", fontsize=8.6, color=INK, wrap=True)

    fig.subplots_adjust(left=0.02, right=0.98, top=0.98, bottom=0.02)
    out = os.path.join(FIGDIR, "schematic_vav.png")
    fig.savefig(out, dpi=200, facecolor="white")
    plt.close(fig)
    return out


if __name__ == "__main__":
    os.makedirs(FIGDIR, exist_ok=True)
    print("wrote", fig12_doas_vs_vav())
    print("wrote", fig13_vav_box())
