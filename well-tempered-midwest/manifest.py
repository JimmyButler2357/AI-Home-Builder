"""Figure manifest for The Well-Tempered Midwest illustrated edition.

Each figure is anchored to a unique phrase in the essay; the figure is
inserted immediately after the paragraph containing that phrase. Figures
12 and 13 are generated locally (see schematics.py) rather than sourced.
"""

# kind: "commons" = source from Wikimedia Commons; "generated" = build locally
FIGURES = [
    dict(n=1, kind="commons",
         anchor="Burnham & Root finished the north half in 1891",
         query="Monadnock Building Chicago",
         caption="**Fig. 1** — Monadnock Building, Burnham & Root, 1891. "
                 "Sixteen stories of load-bearing brick; note the projecting "
                 "bays pulling glazing into a narrow floor plate."),
    dict(n=2, kind="commons",
         anchor="six feet thick",
         query="Monadnock Building Chicago base",
         query_alt="Monadnock Building entrance",
         caption="**Fig. 2** — The base course. The wall thickens toward "
                 "the ground because the masonry is carrying the load — and "
                 "incidentally forms an enormous thermal flywheel."),
    dict(n=3, kind="commons",
         anchor="the Rookery's light court",
         query="Rookery Building Chicago light court",
         caption="**Fig. 3** — The Rookery's light court. Daylight and "
                 "cross-ventilation were the binding constraints; the light "
                 "well is the physics showing through."),
    dict(n=4, kind="commons",
         anchor="housed in the great corner towers",
         query="Larkin Administration Building",
         caption="**Fig. 4** — Larkin Administration Building, Frank Lloyd "
                 "Wright, Buffalo, c.1906. The corner towers are the "
                 "air-handling plant."),
    dict(n=5, kind="commons",
         anchor="The environmental system generated the architecture",
         query="Larkin Building interior",
         caption="**Fig. 5** — The top-lit central court. Sealed against "
                 "the railyard, mechanically ventilated, filtered and tempered."),
    dict(n=6, kind="commons",
         anchor="Unity Temple, Oak Park, 1908",
         query="Unity Temple Oak Park interior",
         caption="**Fig. 6** — Unity Temple. Wright working the "
                 "conservative mode: heavy concrete, top light, ventilation "
                 "moving through the structure itself."),
    dict(n=7, kind="commons",
         anchor="2226 in Lustenau, Austria",
         query="2226 Lustenau Baumschlager Eberle",
         caption="**Fig. 7** — 2226, Baumschlager Eberle, Lustenau, 2013. "
                 "Deep-set punched windows in an ~80cm plastered brick wall. "
                 "No heating, no cooling, no mechanical ventilation."),
    dict(n=8, kind="commons",
         anchor="occupant-operated vents alone",
         query="2226 Lustenau window",
         caption="**Fig. 8** — The sensor-controlled ventilation flap. The "
                 "entire “mechanical system,” essentially."),
    dict(n=9, kind="commons",
         anchor="Harare sits at nearly 5,000 feet",
         query="Eastgate Centre Harare",
         caption="**Fig. 9** — Eastgate Centre, Mick Pearce with Arup, "
                 "Harare, 1996. The rooftop stacks are the buoyancy engine "
                 "driving night flush through the concrete mass."),
    dict(n=10, kind="commons",
         anchor="The Romans ran hot flue gas through a raised floor",
         query="hypocaust",
         caption="**Fig. 10** — Hypocaust, Roman. Raised floor on pilae, "
                 "hot gas circulating beneath, the room heated from its "
                 "surfaces."),
    dict(n=11, kind="commons",
         anchor="Badgirs, solar chimneys, and stack ventilation",
         query="windcatcher Yazd",
         query_alt="badgir Iran",
         caption="**Fig. 11** — Badgirs at Yazd. Take the tower; leave the "
                 "qanat. Buoyancy travels to Chicago, evaporative cooling does "
                 "not."),
    dict(n=12, kind="generated", source="schematic_doas.png",
         anchor="A dedicated outdoor air system (DOAS)",
         caption="**Fig. 12** — Decoupled architecture: DOAS carries "
                 "ventilation and all latent load; hydronic radiant carries "
                 "sensible load.",
         attribution="Diagram prepared for this document"),
    dict(n=13, kind="generated", source="schematic_vav.png",
         anchor="plus something on the order of 100 to 200 terminal boxes",
         caption="**Fig. 13** — A VAV terminal box: damper, actuator, "
                 "controller, flow sensor, reheat coil, valve. Now multiply "
                 "by 150.",
         attribution="Diagram prepared for this document"),
    dict(n=14, kind="commons",
         anchor="That is precisely what a hydronic radiant slab does",
         query="underfloor heating pipes installation",
         caption="**Fig. 14** — Hydronic tubing before pour. The hypocaust "
                 "with a pump."),
]

MIN_WIDTH = 800  # reject anything narrower than this in the source
