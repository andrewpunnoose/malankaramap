/* ====================================================================
   site-common.js
   Shared behaviour for the header/footer loaded from header.html and
   footer.html on every page except index.html (which already wires
   all of this up itself). Include this once, after the header
   include, on any page that uses the shared header:

     <script src="site-common.js"></script>

   Handles:
     - theme toggle (dark/light)
     - mobile menu open/close
     - background music toggle
     - language toggle: swaps any manually-translated [data-en]/
       [data-ml] text on the page, and automatically machine-
       translates everything else via Google Translate, so the
       Malayalam button works even on pages with no manual
       translation yet.
     - sitewide search: reads site-search-index.json (every page on
       the site — regenerate it with generate-search-index.py after
       adding a new page) plus malankara.json (every parish/
       institution) and shows matching results in a simple overlay.
   ==================================================================== */
(function () {
  "use strict";

  function initTheme() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    var sun = btn.querySelector(".icon-sun");
    var moon = btn.querySelector(".icon-moon");
    function sync() {
      var isDark = document.documentElement.classList.contains("dark");
      if (sun) sun.classList.toggle("hidden", isDark);
      if (moon) moon.classList.toggle("hidden", !isDark);
    }
    sync();
    btn.addEventListener("click", function () {
      var isDark = document.documentElement.classList.toggle("dark");
      try {
        localStorage.setItem("malankara-theme", isDark ? "dark" : "light");
      } catch (e) {}
      sync();
    });
  }

  function initMobileMenu() {
    var menuBtn = document.getElementById("mobileMenuBtn");
    var menu = document.getElementById("mobileMenu");
    if (!menuBtn || !menu) return;
    menuBtn.addEventListener("click", function () {
      menu.classList.toggle("hidden");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.add("hidden");
      });
    });
    window.__closeMobileMenu = function () {
      menu.classList.add("hidden");
    };
  }

  function initMusic() {
    var music = document.getElementById("bgMusic");
    var mbtn = document.getElementById("musicToggle");
    if (!music || !mbtn) return;
    var onIcon = mbtn.querySelector(".icon-sound-on");
    var offIcon = mbtn.querySelector(".icon-sound-off");
    function sync() {
      var playing = !music.paused;
      if (onIcon) onIcon.classList.toggle("hidden", !playing);
      if (offIcon) offIcon.classList.toggle("hidden", playing);
      mbtn.setAttribute("aria-label", playing ? "Pause background music" : "Play background music");
      mbtn.setAttribute("title", playing ? "Pause background music" : "Play background music");
    }
    music.addEventListener("play", sync);
    music.addEventListener("pause", sync);
    sync();
    mbtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (music.paused) {
        music.play().catch(function () {});
        if (music.volume === 0) music.volume = 0.5;
      } else {
        music.pause();
      }
    });
  }

  /* ---------------- Language toggle ---------------- */
  function initLang() {
    var STORE_KEY = "site-lang";
    var btn = document.getElementById("langToggle");
    var label = document.getElementById("langToggleLabel");
    if (!btn || !label) return;

    window.currentSiteLang = function () {
      return document.documentElement.getAttribute("lang") === "ml" ? "ml" : "en";
    };
    window.formatEraLabel = function (y, lang) {
      var n = parseInt(y, 10);
      if (n < 0) return lang === "ml" ? "ക്രി.മു. " + Math.abs(n) : Math.abs(n) + " BCE";
      return lang === "ml" ? "ക്രി.വ. " + n : n + " CE";
    };

    function applyManual(lang) {
      document.documentElement.setAttribute("lang", lang === "ml" ? "ml" : "en");
      document.querySelectorAll("[data-en][data-ml]").forEach(function (el) {
        el.textContent = lang === "ml" ? el.getAttribute("data-ml") : el.getAttribute("data-en");
        el.style.fontFamily = lang === "ml" ? "'Noto Serif Malayalam', serif" : "";
      });
      document.querySelectorAll("[data-en-html][data-ml-html]").forEach(function (el) {
        el.innerHTML = lang === "ml" ? el.getAttribute("data-ml-html") : el.getAttribute("data-en-html");
        el.style.fontFamily = lang === "ml" ? "'Noto Serif Malayalam', serif" : "";
      });
      document.querySelectorAll("[data-en-placeholder][data-ml-placeholder]").forEach(function (el) {
        el.setAttribute("placeholder", lang === "ml" ? el.getAttribute("data-ml-placeholder") : el.getAttribute("data-en-placeholder"));
      });
      document.querySelectorAll(".tl-year[data-tl-year]").forEach(function (el) {
        el.textContent = window.formatEraLabel(el.getAttribute("data-tl-year"), lang);
      });

      if (lang === "ml") {
        label.textContent = "മ";
        label.style.fontFamily = "'Noto Serif Malayalam', serif";
        label.className = "text-[15px]";
        btn.setAttribute("aria-label", "Switch to English");
        btn.setAttribute("title", "Switch to English");
      } else {
        label.textContent = "Aa";
        label.style.fontFamily = "";
        label.className = "font-serif text-[15px] font-normal";
        btn.setAttribute("aria-label", "Switch to Malayalam");
        btn.setAttribute("title", "Switch to Malayalam");
      }
      var mi = document.getElementById("langToggleMenuIcon");
      var mb = document.getElementById("langToggleMenuItem");
      if (mi) {
        mi.textContent = lang === "ml" ? "മ" : "Aa";
        mi.style.fontFamily = lang === "ml" ? "'Noto Serif Malayalam', serif" : "";
      }
      if (mb) {
        mb.setAttribute("aria-label", lang === "ml" ? "Switch to English" : "Switch to Malayalam");
        mb.setAttribute("title", lang === "ml" ? "Switch to English" : "Switch to Malayalam");
      }
    }

    /* Manually-translated nodes are marked notranslate so the
       Google Translate fallback below leaves them alone and only
       machine-translates whatever the page hasn't hand-translated. */
    function markNoTranslate() {
      document.querySelectorAll("[data-en][data-ml], [data-en-html][data-ml-html]").forEach(function (el) {
        el.classList.add("notranslate");
      });
    }

    var gtLoaded = false,
      gtReady = false,
      gtPending = null;
    function ensureGoogleTranslate(cb) {
      if (gtReady) {
        cb();
        return;
      }
      gtPending = cb;
      if (gtLoaded) return;
      gtLoaded = true;
      var host = document.createElement("div");
      host.id = "google_translate_element";
      host.style.cssText = "position:absolute;left:-9999px;top:-9999px;height:0;width:0;overflow:hidden;";
      document.body.appendChild(host);
      window.googleTranslateElementInit = function () {
        try {
          /* global google */
          new google.translate.TranslateElement({ pageLanguage: "en", includedLanguages: "ml", autoDisplay: false }, "google_translate_element");
        } catch (e) {}
        var tries = 0;
        (function waitForCombo() {
          var combo = document.querySelector("select.goog-te-combo");
          tries++;
          if (combo) {
            gtReady = true;
            if (gtPending) {
              var f = gtPending;
              gtPending = null;
              f();
            }
          } else if (tries < 60) {
            setTimeout(waitForCombo, 250);
          }
        })();
      };
      var s = document.createElement("script");
      s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(s);
    }
    function setGoogleTranslate(lang) {
      ensureGoogleTranslate(function () {
        var combo = document.querySelector("select.goog-te-combo");
        if (!combo) return;
        if (combo.value !== lang) {
          combo.value = lang;
          combo.dispatchEvent(new Event("change"));
        }
      });
    }
    function resetGoogleTranslate() {
      if (!gtReady) return;
      var combo = document.querySelector("select.goog-te-combo");
      if (combo && combo.value !== "en") {
        combo.value = "en";
        combo.dispatchEvent(new Event("change"));
      }
    }

    function apply(lang) {
      markNoTranslate();
      applyManual(lang);
      if (lang === "ml") setGoogleTranslate("ml");
      else resetGoogleTranslate();
    }

    var saved = null;
    try {
      saved = localStorage.getItem(STORE_KEY);
    } catch (e) {}
    var current = saved === "ml" ? "ml" : "en";
    apply(current);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        apply(current);
      });
    }
    window.addEventListener("load", function () {
      apply(current);
    });

    btn.addEventListener("click", function () {
      current = document.documentElement.getAttribute("lang") === "ml" ? "en" : "ml";
      try {
        localStorage.setItem(STORE_KEY, current);
      } catch (e) {}
      apply(current);
    });
  }

  /* ---------------- Sitewide search ---------------- */
  function initSearch() {
    var toggles = [
      document.getElementById("searchToggle"),
      document.getElementById("searchToggleMobile"),
      document.getElementById("searchToggleMenuItem"),
    ].filter(Boolean);
    if (!toggles.length) return;

    var overlay, input, resultsEl, pagesIndex, placesIndex;

    function injectStyles() {
      if (document.getElementById("site-search-styles")) return;
      var css =
        ".ssrch-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:6rem 1rem 2rem;background:rgba(17,20,15,.55);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px);}" +
        ".ssrch-overlay.hidden{display:none;}" +
        ".ssrch-panel{width:100%;max-width:36rem;background:#FAF8F4;border-radius:16px;box-shadow:0 30px 60px -20px rgba(0,0,0,.45);overflow:hidden;font-family:Inter,system-ui,sans-serif;}" +
        "html.dark .ssrch-panel{background:#161B15;}" +
        ".ssrch-input-row{display:flex;align-items:center;gap:.6rem;padding:.9rem 1.1rem;border-bottom:1px solid rgba(0,0,0,.08);}" +
        "html.dark .ssrch-input-row{border-bottom-color:rgba(255,255,255,.1);}" +
        ".ssrch-input{flex:1;border:none;outline:none;background:transparent;font-size:15px;color:#1B1815;min-width:0;}" +
        "html.dark .ssrch-input{color:#F7F5EE;}" +
        ".ssrch-close{border:none;background:none;cursor:pointer;color:rgba(0,0,0,.4);font-size:12px;padding:.25rem .5rem;font-family:inherit;}" +
        "html.dark .ssrch-close{color:rgba(255,255,255,.5);}" +
        ".ssrch-results{max-height:60vh;overflow-y:auto;padding:.5rem;}" +
        ".ssrch-group-label{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:rgba(0,0,0,.45);font-weight:600;padding:.6rem .75rem .3rem;}" +
        "html.dark .ssrch-group-label{color:rgba(255,255,255,.4);}" +
        ".ssrch-row{display:block;padding:.55rem .75rem;border-radius:10px;text-decoration:none;color:#1B1815;}" +
        "html.dark .ssrch-row{color:#F7F5EE;}" +
        ".ssrch-row:hover{background:rgba(107,130,89,.14);}" +
        ".ssrch-row-title{font-size:14px;}" +
        ".ssrch-row-sub{font-size:11.5px;color:rgba(0,0,0,.5);margin-top:1px;}" +
        "html.dark .ssrch-row-sub{color:rgba(255,255,255,.45);}" +
        ".ssrch-empty{padding:1.5rem .75rem;text-align:center;font-size:13px;color:rgba(0,0,0,.45);}" +
        "html.dark .ssrch-empty{color:rgba(255,255,255,.4);}";
      var style = document.createElement("style");
      style.id = "site-search-styles";
      style.textContent = css;
      document.head.appendChild(style);
    }

    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function buildOverlay() {
      if (overlay) return;
      injectStyles();
      overlay = document.createElement("div");
      overlay.className = "ssrch-overlay hidden";
      overlay.innerHTML =
        '<div class="ssrch-panel">' +
        '<div class="ssrch-input-row">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="opacity:.45;flex-shrink:0;"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg>' +
        '<input class="ssrch-input" type="text" placeholder="Search the whole site\u2026" autocomplete="off">' +
        '<button type="button" class="ssrch-close">Esc</button>' +
        "</div>" +
        '<div class="ssrch-results"></div>' +
        "</div>";
      document.body.appendChild(overlay);
      input = overlay.querySelector(".ssrch-input");
      resultsEl = overlay.querySelector(".ssrch-results");

      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) close();
      });
      overlay.querySelector(".ssrch-close").addEventListener("click", close);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && overlay && !overlay.classList.contains("hidden")) close();
      });
      var debounce;
      input.addEventListener("input", function () {
        clearTimeout(debounce);
        debounce = setTimeout(function () {
          runSearch(input.value);
        }, 120);
      });
    }

    function loadData(cb) {
      if (pagesIndex && placesIndex) {
        cb();
        return;
      }
      var remaining = 2;
      function done() {
        remaining--;
        if (remaining === 0) cb();
      }
      fetch("site-search-index.json")
        .then(function (r) {
          return r.ok ? r.json() : [];
        })
        .then(function (d) {
          pagesIndex = d || [];
          done();
        })
        .catch(function () {
          pagesIndex = [];
          done();
        });
      fetch("malankara.json")
        .then(function (r) {
          return r.ok ? r.json() : [];
        })
        .then(function (d) {
          placesIndex = d || [];
          done();
        })
        .catch(function () {
          placesIndex = [];
          done();
        });
    }

    function slugifyDiocese(d) {
      return String(d || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    function emptyState() {
      resultsEl.innerHTML =
        '<div class="ssrch-empty">Start typing to search nations, dioceses, institutions, clergy, directors, statistics, saints, martyrs, and every other page on the site.</div>';
    }

    function runSearch(q) {
      q = (q || "").trim().toLowerCase();
      if (!q) {
        emptyState();
        return;
      }
      var pageMatches = (pagesIndex || [])
        .filter(function (p) {
          return (p.title && p.title.toLowerCase().indexOf(q) !== -1) || (p.description && p.description.toLowerCase().indexOf(q) !== -1);
        })
        .slice(0, 8);
      var placeMatches = (placesIndex || [])
        .filter(function (p) {
          return (p.n && p.n.toLowerCase().indexOf(q) !== -1) || (p.d && p.d.toLowerCase().indexOf(q) !== -1);
        })
        .slice(0, 8);

      if (!pageMatches.length && !placeMatches.length) {
        resultsEl.innerHTML = '<div class="ssrch-empty">No matches for \u201c' + escapeHtml(q) + '.\u201d</div>';
        return;
      }

      var html = "";
      if (pageMatches.length) {
        html += '<div class="ssrch-group-label">Pages</div>';
        pageMatches.forEach(function (p) {
          html +=
            '<a class="ssrch-row" href="' +
            escapeHtml(p.url) +
            '"><div class="ssrch-row-title">' +
            escapeHtml(p.title) +
            "</div>" +
            (p.description ? '<div class="ssrch-row-sub">' + escapeHtml(p.description) + "</div>" : "") +
            "</a>";
        });
      }
      if (placeMatches.length) {
        html += '<div class="ssrch-group-label">Parishes &amp; Institutions</div>';
        placeMatches.forEach(function (p) {
          html +=
            '<a class="ssrch-row" href="' +
            escapeHtml(slugifyDiocese(p.d)) +
            '"><div class="ssrch-row-title">' +
            escapeHtml(p.n) +
            '</div><div class="ssrch-row-sub">' +
            escapeHtml(p.d || "") +
            " Diocese</div></a>";
        });
      }
      resultsEl.innerHTML = html;
    }

    function open() {
      if (window.__closeMobileMenu) window.__closeMobileMenu();
      buildOverlay();
      overlay.classList.remove("hidden");
      input.value = "";
      emptyState();
      loadData(function () {});
      setTimeout(function () {
        input.focus();
      }, 30);
      document.body.style.overflow = "hidden";
    }
    function close() {
      if (!overlay) return;
      overlay.classList.add("hidden");
      document.body.style.overflow = "";
    }

    toggles.forEach(function (t) {
      t.addEventListener("click", function (e) {
        e.preventDefault();
        open();
      });
    });
  }

  function initAll() {
    initTheme();
    initMobileMenu();
    initMusic();
    initLang();
    initSearch();
  }

  function run(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  /* Exposed so a page can pick exactly what it needs: most pages
     already wire their own theme/menu/music toggles inline (to
     avoid double-binding the same button twice), and only need
     SiteCommon.initLang() + SiteCommon.initSearch() added. A page
     with no existing wiring at all can call SiteCommon.initAll(). */
  window.SiteCommon = {
    initTheme: function () { run(initTheme); },
    initMobileMenu: function () { run(initMobileMenu); },
    initMusic: function () { run(initMusic); },
    initLang: function () { run(initLang); },
    initSearch: function () { run(initSearch); },
    initAll: function () { run(initAll); },
  };
})();
