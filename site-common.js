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
     - language toggle: swaps the manually-translated [data-en]/
       [data-ml] text on the page (no machine translation).
     - sitewide search: a search box that, on Enter, opens the full
       results page on the homepage (index.html?q=...). The results
       themselves are built there from site-search-index.json (every
       page — regenerate with generate-search-index.py), malankara.json
       (every parish/institution pin) and search-extras.json (places
       that have no pin of their own; they link to their diocese page).
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
      syncThemeMenuItem();
    });

    var ti = document.getElementById("themeToggleMenuItem");
    function syncThemeMenuItem() {
      if (!ti) return;
      var isDark = document.documentElement.classList.contains("dark");
      var su = ti.querySelector(".icon-sun");
      var mo = ti.querySelector(".icon-moon");
      if (su) su.classList.toggle("hidden", isDark);
      if (mo) mo.classList.toggle("hidden", !isDark);
    }
    if (ti) {
      syncThemeMenuItem();
      ti.addEventListener("click", function () {
        btn.click();
        syncThemeMenuItem();
      });
    }
  }

  function initMobileMenu() {
    var menuBtn = document.getElementById("mobileMenuBtn");
    var menu = document.getElementById("mobileMenu");
    var backdrop = document.getElementById("mobileMenuBackdrop");
    var closeBtn = document.getElementById("mobileMenuCloseBtn");
    if (!menuBtn || !menu) return;

    function openMenu() {
      menu.classList.add("is-open");
      if (backdrop) backdrop.classList.add("is-open");
      document.body.classList.add("mobile-menu-locked");
      menuBtn.setAttribute("aria-expanded", "true");
    }
    function closeMenu() {
      menu.classList.remove("is-open");
      if (backdrop) backdrop.classList.remove("is-open");
      document.body.classList.remove("mobile-menu-locked");
      menuBtn.setAttribute("aria-expanded", "false");
    }
    menuBtn.addEventListener("click", function () {
      if (menu.classList.contains("is-open")) closeMenu();
      else openMenu();
    });
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    if (backdrop) backdrop.addEventListener("click", closeMenu);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    window.__closeMobileMenu = closeMenu;
  }

  function initMusic() {
    var music = document.getElementById("bgMusic");
    var mbtn = document.getElementById("musicToggle");
    if (!mbtn) return;
    if (!music) {
      /* Pages without their own <audio> get one on demand, so the music
         button works everywhere. Nothing loads or plays until pressed. */
      music = document.createElement("audio");
      music.id = "bgMusic";
      music.loop = true;
      music.preload = "none";
      music.src = "audio.mp3";
      document.body.appendChild(music);
    }
    var onIcon = mbtn.querySelector(".icon-sound-on");
    var offIcon = mbtn.querySelector(".icon-sound-off");
    var fadeTimer = null;

    function sync() {
      var playing = !music.paused;
      if (onIcon) onIcon.classList.toggle("hidden", !playing);
      if (offIcon) offIcon.classList.toggle("hidden", playing);
      mbtn.setAttribute("aria-label", playing ? "Pause background music" : "Play background music");
      mbtn.setAttribute("title", playing ? "Pause background music" : "Play background music");
      syncMusicMenuItem();
    }
    music.addEventListener("play", sync);
    music.addEventListener("pause", sync);
    sync();
    mbtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (music.paused) {
        music.volume = 0;
        music.play().catch(function () {});
        if (!fadeTimer) {
          var v = music.volume || 0;
          var step = 0.5 / 420;
          fadeTimer = setInterval(function () {
            v += step;
            if (v >= 0.5) {
              v = 0.5;
              clearInterval(fadeTimer);
              fadeTimer = null;
            }
            music.volume = v;
          }, 100);
        }
      } else {
        if (fadeTimer) {
          clearInterval(fadeTimer);
          fadeTimer = null;
        }
        music.pause();
      }
    });

    var mi = document.getElementById("musicToggleMenuItem");
    function syncMusicMenuItem() {
      if (!mi) return;
      var playing = mbtn.getAttribute("aria-label") === "Pause background music";
      var on = mi.querySelector(".icon-sound-on");
      var off = mi.querySelector(".icon-sound-off");
      if (on) on.classList.toggle("hidden", !playing);
      if (off) off.classList.toggle("hidden", playing);
    }
    if (mi) {
      syncMusicMenuItem();
      mi.addEventListener("click", function () {
        mbtn.click();
        setTimeout(syncMusicMenuItem, 30);
      });
    }
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
        el.style.fontFamily = lang === "ml" ? "Arima, serif" : "";
      });
      document.querySelectorAll("[data-en-html][data-ml-html]").forEach(function (el) {
        el.innerHTML = lang === "ml" ? el.getAttribute("data-ml-html") : el.getAttribute("data-en-html");
        el.style.fontFamily = lang === "ml" ? "Arima, serif" : "";
      });
      document.querySelectorAll("a.skip-link:not([data-en])").forEach(function (el) {
        el.textContent = lang === "ml" ? "ഉള്ളടക്കത്തിലേക്ക് പോകുക" : "Skip to content";
      });
      document.querySelectorAll("[data-en-placeholder][data-ml-placeholder]").forEach(function (el) {
        el.setAttribute("placeholder", lang === "ml" ? el.getAttribute("data-ml-placeholder") : el.getAttribute("data-en-placeholder"));
      });
      document.querySelectorAll(".tl-year[data-tl-year]").forEach(function (el) {
        el.textContent = window.formatEraLabel(el.getAttribute("data-tl-year"), lang);
      });

      if (lang === "ml") {
        label.textContent = "മ";
        label.style.fontFamily = "Arima, serif";
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
        mi.style.fontFamily = lang === "ml" ? "Arima, serif" : "";
      }
      if (mb) {
        mb.setAttribute("aria-label", lang === "ml" ? "Switch to English" : "Switch to Malayalam");
        mb.setAttribute("title", lang === "ml" ? "Switch to English" : "Switch to Malayalam");
      }
    }

    function apply(lang) {
      applyManual(lang);
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

    var liMenuItem = document.getElementById("langToggleMenuItem");
    if (liMenuItem) {
      liMenuItem.addEventListener("click", function () {
        btn.click();
      });
    }
  }

  /* ---------------- Sitewide search ---------------- */
  function initSearch() {
    var toggles = [
      document.getElementById("searchToggle"),
      document.getElementById("searchToggleMobile"),
      document.getElementById("searchToggleMenuItem"),
    ].filter(Boolean);
    if (!toggles.length) return;

    var overlay, input;

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
        ".ssrch-row.has-thumb{display:flex;align-items:center;gap:.75rem;}" +
        ".ssrch-thumb{flex:none;width:64px;aspect-ratio:4/3;height:auto;object-fit:cover;border-radius:8px;background:rgba(107,130,89,.15);}" +
        ".ssrch-row-text{min-width:0;flex:1;}" +
        ".ssrch-empty{padding:1.5rem .75rem;text-align:center;font-size:13px;color:rgba(0,0,0,.45);}" +
        "html.dark .ssrch-empty{color:rgba(255,255,255,.4);}" +
        ".ssrch-go{border:none;background:none;cursor:pointer;color:rgba(0,0,0,.45);padding:.25rem;display:flex;align-items:center;}" +
        ".ssrch-go:hover{color:#6B8259;}" +
        "html.dark .ssrch-go{color:rgba(255,255,255,.5);}" +
        ".ssrch-hint{padding:1rem 1.1rem 1.1rem;font-size:12.5px;color:rgba(0,0,0,.45);}" +
        "html.dark .ssrch-hint{color:rgba(255,255,255,.4);}";
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
        '<button type="button" class="ssrch-go" aria-label="View all results" title="View all results (Enter)"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></button>' +
        '<button type="button" class="ssrch-close">Esc</button>' +
        "</div>" +
        '<div class="ssrch-hint">Type what you are looking for and press Enter to see all results.</div>' +
        "</div>";
      document.body.appendChild(overlay);
      input = overlay.querySelector(".ssrch-input");

      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) close();
      });
      overlay.querySelector(".ssrch-close").addEventListener("click", close);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && overlay && !overlay.classList.contains("hidden")) close();
      });
      // No results appear while typing: pressing Enter (or the arrow)
      // opens the full results page, the same one the homepage search uses.
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          goSearch();
        }
      });
      overlay.querySelector(".ssrch-go").addEventListener("click", goSearch);
    }

    function goSearch() {
      var q = (input.value || "").trim();
      if (!q) return;
      window.location.href = "index.html?q=" + encodeURIComponent(q);
    }

    function applyOverlayLang() {
      if (!overlay) return;
      var ml = document.documentElement.getAttribute("lang") === "ml";
      input.setAttribute("placeholder", ml ? "സൈറ്റിൽ മുഴുവൻ തിരയുക…" : "Search the whole site\u2026");
      overlay.querySelector(".ssrch-hint").textContent = ml
        ? "നിങ്ങൾ തിരയുന്നത് ടൈപ്പ് ചെയ്ത് എല്ലാ ഫലങ്ങളും കാണാൻ Enter അമർത്തുക."
        : "Type what you are looking for and press Enter to see all results.";
      overlay.querySelector(".ssrch-close").textContent = ml ? "ഒഴിവാക്കുക" : "Esc";
      var go = overlay.querySelector(".ssrch-go");
      go.setAttribute("aria-label", ml ? "എല്ലാ ഫലങ്ങളും കാണുക" : "View all results");
      go.setAttribute("title", ml ? "എല്ലാ ഫലങ്ങളും കാണുക (Enter)" : "View all results (Enter)");
      overlay.style.fontFamily = ml ? "Arima, serif" : "";
    }

    function open() {
      if (window.__closeMobileMenu) window.__closeMobileMenu();
      buildOverlay();
      applyOverlayLang();
      if (window.MutationObserver && !overlay.__langWatch) {
        overlay.__langWatch = true;
        new MutationObserver(applyOverlayLang).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
      }
      overlay.classList.remove("hidden");
      input.value = "";
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

/* "-ാം" ordinals: wrap the ending in a span that uses a tiny font with a blank dotted-circle glyph */
(function(){
  var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,NOSCRIPT:1,TITLE:1,OPTION:1};
  function mFont(el){try{var f=(getComputedStyle(el).fontFamily||"").replace(/^\s*["']?MMNum["']?,?\s*/,"");return /^\s*["']?Arima/i.test(f);}catch(e){return false;}}
  function wrap(tn){
    var p=tn.parentNode;if(!p||SKIP[p.nodeName]||(p.classList&&p.classList.contains("mo")))return;
    var t=tn.nodeValue;if(!t||t.indexOf("\u0d3e\u0d02")<0||!/\d-\u0d3e\u0d02/.test(t))return;
    var re=/(\d-)\u0d3e\u0d02/g,last=0,m,frag=document.createDocumentFragment(),mf=mFont(p);
    while((m=re.exec(t))){
      frag.appendChild(document.createTextNode(t.slice(last,m.index)+m[1]));
      var sp=document.createElement("span");sp.className="mo"+(mf?" mo-m":"");sp.textContent="\u0d3e\u0d02";frag.appendChild(sp);
      last=m.index+m[0].length;
    }
    frag.appendChild(document.createTextNode(t.slice(last)));p.replaceChild(frag,tn);
  }
  function scan(r){
    if(!r)return;if(r.nodeType===3){wrap(r);return;}if(r.nodeType!==1||SKIP[r.nodeName])return;
    var w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT,null),l=[],n;
    while((n=w.nextNode()))if(n.nodeValue.indexOf("\u0d3e\u0d02")>-1)l.push(n);
    l.forEach(wrap);
  }
  var q=[],sch=false;
  function flush(){sch=false;var l=q;q=[];l.forEach(scan);}
  new MutationObserver(function(ms){
    ms.forEach(function(m){if(m.type==="characterData")q.push(m.target);else for(var i=0;i<m.addedNodes.length;i++)q.push(m.addedNodes[i]);});
    if(!sch){sch=true;(window.requestAnimationFrame||setTimeout)(flush);}
  }).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  function first(){scan(document.body);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",first);else first();
})();
/* One stays singular: a stat box that says 1 reads "Deacon", not "Deacons" (0 and 2+ stay plural).
   Runs on the finished page, so it holds for anything the Studio publishes. */
(function () {
  var S = {
    "Cathedrals": ["Cathedral", "ഭദ്രാസനപള്ളി"], "Catholicate Centres": ["Catholicate Centre", "കാതോലിക്കേറ്റ് കേന്ദ്രം"],
    "Chapels": ["Chapel", "കുരിശുപള്ളി"], "Churches": ["Church", "പള്ളി"], "Communities": ["Community", "കമ്മ്യൂണിറ്റി"],
    "Congregations": ["Congregation", "കോൺഗ്രിഗേഷൻ"], "Convents": ["Convent", "കന്യാസ്ത്രീ മഠം"],
    "Cor-Episcopi": ["Cor-Episcopa", "കോറെപ്പിസ്കോപ്പ"], "Deacons": ["Deacon", "ശെമ്മാശൻ"],
    "Independent Prayer Groups": ["Independent Prayer Group", "സ്വതന്ത്ര പ്രാർത്ഥന യോഗം"],
    "Independent Sunday Schools": ["Independent Sunday School", "സ്വതന്ത്ര ഞായർ പള്ളിക്കൂടം"],
    "Institutions": ["Institution", "സ്ഥാപനം"], "Monasteries": ["Monastery", "ദയറാ"], "Monks": ["Monk", "റമ്പാൻ"],
    "Other Institutions": ["Other Institution", "മറ്റ് സ്ഥാപനം"], "Palaces": ["Palace", "അരമന"], "Priests": ["Priest", "വൈദികൻ"],
    "Qurbana Centres": ["Qurbana Centre", "പ്രാർത്ഥനാലയം"], "Seminaries": ["Seminary", "സെമിനാരി"],
    "Student Centres": ["Student Centre", "വിദ്യാർത്ഥി കേന്ദ്രം"], "Metropolitans": ["Metropolitan", "മെത്രാപ്പോലീത്ത"]
  };
  function fix() {
    var ml = document.documentElement.getAttribute("lang") === "ml";
    document.querySelectorAll("span[data-en][data-ml]").forEach(function (l) {
      var s = S[l.getAttribute("data-en")], p = l.previousElementSibling;
      if (!s || !p) return;
      var n = parseInt(String(p.getAttribute("data-count") || p.textContent).replace(/[^0-9]/g, ""), 10);
      if (n !== 1) return;
      l.setAttribute("data-en", s[0]); l.setAttribute("data-ml", s[1]);
      l.textContent = ml ? s[1] : s[0];
    });
  }
  function go() { fix(); setTimeout(fix, 400); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
  window.addEventListener("load", go);
})();
/* Arrows (← →) stay in the English (Inter) font inside Malayalam text, not Arima */
(function () {
  var AR = /[\u2190-\u21ff]+/g, SK = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, SVG: 1, NOSCRIPT: 1 };
  var CSS = "font-family:Inter,Arial,Helvetica,sans-serif!important;font-style:normal";
  function wrap(n) {
    var t = n.nodeValue, last = 0, m, f = document.createDocumentFragment();
    AR.lastIndex = 0;
    while ((m = AR.exec(t))) {
      if (m.index > last) f.appendChild(document.createTextNode(t.slice(last, m.index)));
      var s = document.createElement("span"); s.className = "mm-arw"; s.setAttribute("style", CSS); s.textContent = m[0]; f.appendChild(s);
      last = m.index + m[0].length;
    }
    if (last < t.length) f.appendChild(document.createTextNode(t.slice(last)));
    n.parentNode.replaceChild(f, n);
  }
  function scan() {
    if (document.documentElement.getAttribute("lang") !== "ml" || !document.body) return;
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false), n, l = [];
    while ((n = w.nextNode())) {
      var p = n.parentNode;
      if (!p || SK[(p.nodeName || "").toUpperCase()] || (p.classList && p.classList.contains("mm-arw")) || (p.closest && p.closest("svg"))) continue;
      AR.lastIndex = 0; if (AR.test(n.nodeValue)) l.push(n);
    }
    l.forEach(wrap);
  }
  var sch = false;
  function later() { if (!sch) { sch = true; (window.requestAnimationFrame || setTimeout)(function () { sch = false; scan(); }); } }
  new MutationObserver(later).observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["lang"] });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", later); else later();
})();
