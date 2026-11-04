#!/usr/bin/env python3
"""
Builds map-extra.json for the interactive map (site-map.js).

malankara.json stays the single source of truth for places (name, diocese,
description, coordinates, status). This script adds what it does not carry:

    "<place name>": ["<icon key>", "<Malayalam name>", "<type code>"]

  * icon key  - which map symbol the place gets (see the legend on the home page).
                Read from the Google My Maps export (Malankara_Map.kmz) when it is
                in this folder; otherwise guessed from the place's type / status.
  * Malayalam - the hand-written name from the type-*.html pages.
  * type code - P palace  V convent  M monastery  C cathedral  S seminary
                T student centre  N sunday school  G prayer group  H shrine
                L chapel  K catholicate centre  Q qurbana centre  O congregation
                Y community  X other institution  F church

Icon keys: p pin (church, congregation, community, centre, shrine, chapel...)
           b episcopal palace   m monastery or convent   a archcathedral
           s cathedral          u church under the Catholicos (UDC)
           x dormant or closed  c schismatic-occupied    h undetermined location
           e seminary or educational centre   o online prayer group

Run whenever malankara.json, a type-*.html page or the KMZ changes, then commit
map-extra.json next to them:

    python3 generate-map-extra.py
"""
import collections, html, json, os, re, unicodedata, zipfile
from xml.etree import ElementTree as ET

PAGES = [  # (file, type code) - first match wins when a name is on several pages
    ("type-palaces.html", "P"), ("type-convents.html", "V"), ("type-monasteries.html", "M"),
    ("type-cathedrals.html", "C"), ("type-seminaries.html", "S"), ("type-student-centres.html", "T"),
    ("type-sunday-schools.html", "N"), ("type-prayer-groups.html", "G"), ("type-shrines.html", "H"),
    ("type-chapels.html", "L"), ("type-catholicate-centres.html", "K"), ("type-qurbana-centres.html", "Q"),
    ("type-congregations.html", "O"), ("type-communities.html", "Y"), ("type-other-institutions.html", "X"),
    ("type-parish-churches.html", "F"),
]
# Google My Maps icon code -> our icon key
KMZ_ICON = {"1899": "p", "1541": "c", "1676": "m", "1594": "h", "1502": "s", "1598": "b",
            "1556": "x", "1682": "e", "1628": "u", "1820": "o", "1501": "a"}
TYPE_ICON = {"P": "b", "V": "m", "M": "m", "C": "s", "S": "e", "T": "e", "N": "e", "G": "o"}

def norm(s):
    s = unicodedata.normalize("NFKC", html.unescape(s or "")).replace("\xa0", " ")
    return re.sub(r"\s+", " ", s).strip().lower()

def kmz_icons(path):
    """[(normalised name, lat, lon, icon key)] from the My Maps export."""
    ns = {"k": "http://www.opengis.net/kml/2.2"}
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read("doc.kml"))
    doc = root.find("k:Document", ns)
    smap = {}
    for sm in doc.findall("k:StyleMap", ns):
        for p in sm.findall("k:Pair", ns):
            if p.find("k:key", ns).text == "normal":
                smap[sm.get("id")] = p.find("k:styleUrl", ns).text.lstrip("#")
    out = []
    for pm in doc.iter("{%s}Placemark" % ns["k"]):
        su = pm.find("k:styleUrl", ns)
        sid = su.text.lstrip("#") if su is not None else ""
        m = re.match(r"icon-(\d+)-", smap.get(sid, sid))
        co = pm.find(".//k:coordinates", ns).text.strip().split(",")
        n = pm.find("k:name", ns)
        out.append((norm(n.text if n is not None else ""), float(co[1]), float(co[0]),
                    KMZ_ICON.get(m.group(1), "p") if m else "p"))
    return out

def main():
    places = json.load(open("malankara.json", encoding="utf-8"))
    names = {p["n"] for p in places}
    typ = {}
    for fname, code in PAGES:
        try:
            s = open(fname, encoding="utf-8", errors="replace").read()
        except OSError:
            continue
        for en, ml in re.findall(r'data-en="([^"]+)"\s+data-ml="([^"]*)"', s):
            en, ml = html.unescape(en), html.unescape(ml).strip()
            if en in names and en not in typ:
                typ[en] = (code, ml if ml and ml != en else "")
    kmz = []
    for cand in ("Malankara_Map.kmz", "Malankara Map.kmz"):
        if os.path.exists(cand):
            kmz = kmz_icons(cand); break
    byname = collections.defaultdict(list)
    for k in kmz:
        byname[k[0]].append(k)
    out, from_kmz = {}, 0
    for p in places:
        n = p["n"]
        if n in out:
            continue
        code, ml = typ.get(n, ("", ""))
        icon = None
        cands = byname.get(norm(n)) or [k for k in kmz if abs(k[1] - p["lat"]) + abs(k[2] - p["lon"]) < 2e-4]
        if cands:
            k = min(cands, key=lambda k: abs(k[1] - p["lat"]) + abs(k[2] - p["lon"]))
            icon = k[3]; from_kmz += 1
        if icon is None:
            icon = {"caution": "c", "death": "x"}.get(p.get("status")) or TYPE_ICON.get(code) or "p"
            if re.search(r"archcathedral", n, re.I): icon = "a"
        out[n] = [icon, ml, code]
    json.dump(out, open("map-extra.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("map-extra.json: %d places (%d icons from the KMZ, %d with a Malayalam name)"
          % (len(out), from_kmz, sum(1 for v in out.values() if v[1])))
    print("icons:", dict(collections.Counter(v[0] for v in out.values())))

if __name__ == "__main__":
    main()
