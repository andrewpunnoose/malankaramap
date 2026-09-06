# Malankara Map — Change Log (update 2)

## This pass: mobile menu + missing logo, fixed everywhere

You reported two things on pages other than index.html:
1. The logo was invisible in the header.
2. On mobile, tapping the hamburger icon didn't slide in a menu from
   the side like index.html — it just dumped a plain block of links
   below the header.

**Root cause for both:** every page compiles/purges its own copy of
the site's CSS independently. index.html's copy happens to include
everything the header needs. Every other page's copy doesn't
necessarily — so classes like `.text-ink` (the logo's color) or the
whole off-canvas mobile menu system (`.mobile-menu-panel`,
`#mobileMenuBackdrop`, the `.is-open` toggle, body-scroll-lock) could
be silently missing depending on what that individual page happened
to use elsewhere.

**Fix:** `header.html` now carries its own bundled `<style>` block —
every CSS rule the header and mobile menu actually need, extracted
directly from index.html — so the header renders identically no
matter what the host page's own stylesheet does or doesn't have.
`site-common.js` was also rewritten to match index.html's *real*
mobile menu behavior (open/close via `.is-open` + backdrop + body
lock + Escape key + the menu's own duplicate theme/music buttons),
replacing the simplified (and wrong) version from the first pass.

This required re-touching every page that loads the shared header, so
if you're diffing against the previous zip, expect widespread changes
to the `<head>`/script area of most pages — that's expected and is
all mechanical (no page content changed).

## Also: PNGs excluded from this zip

You mentioned the image assets aren't changing, so this zip does not
include any `.png` files — copy this over your existing files rather
than replacing the whole folder, so your existing images stay in
place.

## Note on how this went

While fixing this, an earlier scripted edit ended up deleting real
page content from several files (the automated search for "where does
the old wiring script end" grabbed the wrong boundary on some pages).
I caught it via a size-sanity check against the original files and
restored/redid every affected page individually before packaging this
zip — `1906.html`, `cor-episcopa.html`, `deacons.html`, `martyrs.html`,
`metropolitans.html`, `monks.html`, `myron.html`, `population.html`,
`priests.html`, `record.html`, and `saints.html` were all affected and
are now confirmed restored (content verified, script/body/html tags
balanced, sizes sanity-checked against the originals). Flagging this
plainly rather than glossing over it — worth spot-checking those pages
in particular after you deploy.
