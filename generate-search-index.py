#!/usr/bin/env python3
"""
Regenerates site-search-index.json from every .html page in this folder.

Run this whenever a new page is added to the site (or a page's
<title>/<meta description> changes), then commit the updated
site-search-index.json alongside your other changes:

    python3 generate-search-index.py

The sitewide search (wired up in site-common.js, used by every page
via the shared header) reads this file, so a page becomes searchable
as soon as it's listed here.

Pages excluded on purpose:
  - header.html / footer.html (not real pages, just includes)
  - 404.html (not a real content page)
  - diocese-*.html (a legacy, unlinked set of pages superseded by
    the current per-diocese pages, e.g. malabar.html)

If you retire the legacy diocese-*.html pages entirely, or rename
any page, just re-run this script — it always reflects whatever
.html files are actually present.
"""
import re
import os
import json

EXCLUDE_PREFIXES = ("diocese-",)
EXCLUDE_FILES = {"header.html", "footer.html", "404.html"}


def main():
    pages = []
    for fname in sorted(os.listdir(".")):
        if not fname.endswith(".html"):
            continue
        if fname in EXCLUDE_FILES or fname.startswith(EXCLUDE_PREFIXES):
            continue
        slug = fname[:-5]
        try:
            with open(fname, encoding="utf-8", errors="ignore") as fh:
                content = fh.read(6000)
        except OSError:
            continue
        m = re.search(r"<title>(.*?)</title>", content, re.S)
        title = m.group(1).strip() if m else slug
        title = re.sub(r"\s+—\s*Malankara Map\s*$", "", title).strip()
        md = re.search(r'<meta name="description" content="(.*?)">', content, re.S)
        desc = md.group(1).strip() if md else ""
        url = "" if slug == "index" else slug
        display_title = "Malankara Map — Home" if slug == "index" else title
        pages.append({"title": display_title, "url": url, "description": desc[:160]})

    with open("site-search-index.json", "w", encoding="utf-8") as fh:
        json.dump(pages, fh, ensure_ascii=False, indent=0)
    print(f"Wrote {len(pages)} pages to site-search-index.json")


if __name__ == "__main__":
    main()
