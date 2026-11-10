/* site-map.js - Malankara Map's own interactive map (replaces the Google My Maps embeds).
 *
 * Data:   malankara.json (every place) + map-extra.json (symbol, Malayalam name, type;
 *         built by generate-map-extra.py).  1906-map.json uses the same shape.
 * Usage:  MalankaraMap.init({ el:'#malankaraMap', data:'malankara.json', extra:'map-extra.json',
 *                              search:true, nearest:true, loader:'#mapLoader' });
 * Needs:  Leaflet + leaflet.markercluster (loaded from cdnjs automatically if the page lacks them).
 * Imagery: Esri World Imagery (+ Esri place labels); Light/Dark use Esri Light/Dark Gray Canvas (no API key needed).
 */
(function () {
  "use strict";
  var T = {"dio":[["thiruvananthapuram","#817713","Thiruvananthapuram","തിരുവനന്തപുരം",1],["kollam","#757575","Kollam","കൊല്ലം",1],["kottarakkara-punalur","#ff5252","Kottarakkara–Punalur","കൊട്ടാരക്കര-പുനലൂർ",1],["adoor-kadampanad","#1a237e","Adoor–Kadampanad","അടൂർ-കടമ്പനാട്",1],["thumpamon","#9c27b0","Thumpamon","തുമ്പമൺ",1],["mavelikara","#e65100","Mavelikara","മാവേലിക്കര",1],["chengannur","#afb42b","Chengannur","ചെങ്ങന്നൂർ",1],["niranam","#000000","Niranam","നിരണം",1],["nilackal","#fbc02d","Nilackal","നിലയ്ക്കൽ",1],["kottayam","#0288d1","Kottayam","കോട്ടയം",1],["kottayam-central","#880e4f","Kottayam Central","കോട്ടയം-സെൻട്രൽ",1],["idukki","#795548","Idukki","ഇടുക്കി",1],["kandanad-east","#673ab7","Kandanad East","കണ്ടനാട്-ഈസ്റ്റ്",1],["kandanad-west","#ffea00","Kandanad West","കണ്ടനാട്-വെസ്റ്റ്",1],["angamaly","#f57c00","Angamaly","അങ്കമാലി",1],["kochi","#558b2f","Kochi","കൊച്ചി",1],["thrissur","#424242","Thrissur","തൃശ്ശൂർ",1],["kunnamkulam","#a52714","Kunnamkulam","കുന്നംകുളം",1],["malabar","#4e342e","Malabar","മലബാർ",1],["sulthan-bathery","#006064","Sulthan Bathery","സുൽത്താൻ ബത്തേരി",1],["brahmavar","#3949ab","Brahmavar","ബ്രഹ്മവാർ",1],["madras","#7cb342","Madras","ചെന്നൈ",1],["bangalore","#f9a825","Bangalore","ബാംഗ്ലൂർ",1],["bombay","#817713","Bombay","മുംബൈ",1],["calcutta","#a52714","Calcutta","കൽക്കട്ട",1],["delhi","#558b2f","Delhi","ഡൽഹി",1],["ahmedabad","#880e4f","Ahmedabad","അഹമ്മദാബാദ്",1],["asia-pacific","#3949ab","Asia–Pacific","ഏഷ്യ-പസഫിക്",1],["northeast-america","#9c27b0","Northeast America","നോർത്ത്-ഈസ്റ്റ് അമേരിക്ക",1],["southwest-america","#f57c00","Southwest America","സൗത്ത്-വെസ്റ്റ് അമേരിക്ക",1],["canada","#0288d1","Canada","കാനഡ",1],["uk-europe-africa","#0f9d58","UK–Europe–Africa","യു.കെ-യൂറോപ്പ്",1],["knanaya","#bdbdbd","Knanaya","ക്നാനായ",1],["evangelistic-association-of-the-east","#c2185b","Evangelistic Assoc. of the East","പൗരസ്ത്യ സുവിശേഷ സമാജം",1],["proprietary-churches","#673ab7","Proprietary Churches","കുടുംബപള്ളികൾ",1]],"leg":{"b":["Episcopal palace","അരമന"],"m":["Monastery or convent","ദയറാ അല്ലെങ്കിൽ കന്യാസ്ത്രീ മഠം"],"a":["Archcathedral","വലിയ ഭദ്രാസനപള്ളി"],"s":["Cathedral","ഭദ്രാസനപള്ളി"],"z":["Church in a secret location (Saudi Arabia)","രഹസ്യ സ്ഥാനത്തുള്ള പള്ളി (സൗദി അറേബ്യ)"],"p":["Church, congregation, community, Catholicate centre, retreat centre, or chapel","പള്ളി, കോൺഗ്രിഗേഷൻ, കമ്യൂണിറ്റി, കാതോലിക്കേറ്റ് കേന്ദ്രം, ധ്യാന കേന്ദ്രം, അല്ലെങ്കിൽ ചാപ്പൽ"],"x":["Dormant or closed church","പ്രവർത്തനരഹിതമോ അടച്ചുപൂട്ടിയതോ ആയ പള്ളി"],"c":["Schismatic-occupied church","വിഘടിത വിഭാഗം കൈവശം വച്ചിരിക്കുന്ന പള്ളി"],"h":["Church of undetermined specific location","കൃത്യമായ സ്ഥാനം നിർണ്ണയിക്കപ്പെടാത്ത പള്ളി"],"e":["Seminary or educational centre","സെമിനാരി അല്ലെങ്കിൽ വിദ്യാഭ്യാസ കേന്ദ്രം"],"o":["Online prayer group","ഓൺലൈൻ പ്രാർത്ഥനാ കൂട്ടം"]}};           // dio: [slug, colour, en, ml, hasPage]  leg: symbol labels
  var CDN = "https://cdnjs.cloudflare.com/ajax/libs/";
  var DIO = {}; T.dio.forEach(function (d) { DIO[d[0]] = d; });
  var ISML = function () { return document.documentElement.getAttribute("lang") === "ml"; };
  var UI = {
    sat: ["Satellite", "ഉപഗ്രഹം"], light: ["Light", "ലൈറ്റ്"], dark: ["Dark", "ഡാർക്ക്"],
    layers: ["Layers", "ലെയറുകൾ"], dioceses: ["Dioceses", "ഭദ്രാസനങ്ങൾ"], symbols: ["Symbols", "ചിഹ്നങ്ങൾ"],
    all: ["Show all", "എല്ലാം കാണിക്കുക"], none: ["Hide all", "എല്ലാം മറയ്ക്കുക"],
    shrines: ["Wayside shrines", "കുരിശടികൾ"], directions: ["Directions", "വഴി കാണിക്കുക"],
    dpage: ["Diocese page", "ഭദ്രാസന പേജ്"], near: ["Near me", "എന്റെ അടുത്ത്"],
    nearhere: ["Nearest parishes here", "ഇവിടെ അടുത്തുള്ള ഇടവകകൾ"], nearTitle: ["Nearest parishes", "അടുത്തുള്ള ഇടവകകൾ"],
    nodesc: ["No written history has yet been recorded for this entry.", "ഈ എൻട്രിയുടെ ചരിത്രം ഇതുവരെ രേഖപ്പെടുത്തിയിട്ടില്ല."],
    endesc: ["Description is in English.", "വിവരണം ഇംഗ്ലീഷിൽ മാത്രം."],
    finding: ["Finding", "തിരയുന്നു"], nf: ["Couldn’t find that place — try adding the country or district.", "ആ സ്ഥലം കണ്ടെത്താനായില്ല; രാജ്യമോ ജില്ലയോ കൂടി ചേർത്ത് ശ്രമിക്കുക."],
    err: ["Something went wrong — please try again.", "എന്തോ പിഴവ് സംഭവിച്ചു; വീണ്ടും ശ്രമിക്കുക."], showing: ["Showing", "കാണിക്കുന്നത്"],
    reset: ["Show the whole map", "മുഴുവൻ മാപ്പും കാണിക്കുക"], whole: ["Showing the whole map.", "മുഴുവൻ മാപ്പും കാണിക്കുന്നു."],
    next: ["Next", "അടുത്തത്"], of: ["of", "/"], matches: ["matches", "ഫലങ്ങൾ"], loc: ["Getting your location…", "നിങ്ങളുടെ സ്ഥാനം കണ്ടെത്തുന്നു…"],
    locDenied: ["Location access was denied — enable it in your browser settings to use this.", "സ്ഥാനം ഉപയോഗിക്കാനുള്ള അനുമതി നിരസിക്കപ്പെട്ടു; ഇത് ഉപയോഗിക്കാൻ ബ്രൗസർ ക്രമീകരണത്തിൽ അനുവദിക്കുക."],
    locFail: ["Couldn’t get your location. Please try again.", "നിങ്ങളുടെ സ്ഥാനം ലഭ്യമായില്ല. വീണ്ടും ശ്രമിക്കുക."],
    you: ["Your location", "നിങ്ങളുടെ സ്ഥാനം"], loading: ["Map could not be loaded.", "ഭൂപടം ലോഡ് ചെയ്യാനായില്ല."]
  };
  var TYPE = { P: ["Episcopal palace", "അരമന"], V: ["Convent", "കന്യാസ്ത്രീ മഠം"], M: ["Monastery", "ദയറ"], C: ["Cathedral", "ഭദ്രാസനപള്ളി"],
    S: ["Seminary", "സെമിനാരി"], T: ["Student centre", "വിദ്യാർത്ഥി കേന്ദ്രം"], N: ["Sunday school", "ഞായർ പള്ളിക്കൂടം"],
    G: ["Prayer group", "പ്രാർത്ഥന യോഗം"], H: ["Wayside shrine", "കുരിശടി"], L: ["Chapel", "ചാപ്പൽ"],
    K: ["Catholicate centre", "കാതോലിക്കേറ്റ് കേന്ദ്രം"], Q: ["Qurbana centre", "പ്രാർത്ഥനാലയം"], O: ["Congregation", "കോൺഗ്രിഗേഷൻ"],
    Y: ["Community", "കമ്മ്യൂണിറ്റി"], X: ["Institution", "സ്ഥാപനം"], F: ["Church", "പള്ളി"] };
  var STATUS = { x: ["Dormant or closed", "പ്രവർത്തനരഹിതം / അടച്ചത്"], c: ["Under schismatic occupation", "വിഘടിത വിഭാഗത്തിന്റെ കൈവശം"],
    h: ["Exact location not fixed", "കൃത്യമായ സ്ഥാനം നിർണ്ണയിച്ചിട്ടില്ല"], a: ["Archcathedral", "വലിയ ഭദ്രാസനപള്ളി"], z: ["Secret location", "രഹസ്യ സ്ഥാനം"] };
  function t(k) { return UI[k][ISML() ? 1 : 0]; }
  function two(a) { return a[ISML() ? 1 : 0]; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function norm(s) { return String(s || "").normalize("NFKC").replace(/\u00a0/g, " ").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9\u0d00-\u0d7f]+/g, " ").trim(); }
  function slugOf(d) { return String(d || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function lum(hex) { var h = hex.replace("#", ""); if (h.length === 3) h = h.replace(/(.)/g, "$1$1"); var r = parseInt(h.substr(0, 2), 16) / 255, g = parseInt(h.substr(2, 2), 16) / 255, b = parseInt(h.substr(4, 2), 16) / 255; return 0.2126 * r + 0.7152 * g + 0.0722 * b; }

  /* ---------- loading ---------- */
  function loadCSS(h) { return new Promise(function (ok) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = h; l.onload = l.onerror = ok; document.head.appendChild(l); }); }
  function loadJS(s) { return new Promise(function (ok, no) { var e = document.createElement("script"); e.src = s; e.onload = ok; e.onerror = no; document.head.appendChild(e); }); }
  function ensureLib() {
    var p = Promise.resolve();
    if (!window.L) p = p.then(function () { return Promise.all([loadCSS(CDN + "leaflet/1.9.4/leaflet.min.css"), loadJS(CDN + "leaflet/1.9.4/leaflet.min.js")]); });
    return p.then(function () {
      if (window.L.markerClusterGroup) return;
      return Promise.all([loadCSS(CDN + "leaflet.markercluster/1.5.3/MarkerCluster.min.css"), loadJS(CDN + "leaflet.markercluster/1.5.3/leaflet.markercluster.min.js")]);
    });
  }

  /* ---------- symbols (same glyphs as the legend on the home page) ---------- */
  var GLYPH = {
    p: '<circle cx="12" cy="12" r="4.4" fill="F" stroke="none"/>',
    b: '<path d="M5 10 L12 5 L19 10"/><path d="M6 10 V19 M18 10 V19 M10 19 V14 H14 V19"/><path d="M4 19 H20"/>',
    m: '<path d="M12 4.5 C12 8 9.8 8.8 9.8 11.8 a2.2 2.2 0 0 0 4.4 0 c0 -3 -2.2 -3.8 -2.2 -7.3Z"/><path d="M7.5 19.5 V15.5 a4.5 4.5 0 0 1 9 0 v4"/>',
    a: '<path d="M12 4.5 L19 12 L12 19.5 L5 12 Z"/>',
    s: '<path d="M12 4.5 L14 9.8 L19.5 10.2 L15.3 13.7 L16.6 19 L12 16 L7.4 19 L8.7 13.7 L4.5 10.2 L10 9.8 Z"/>',
    z: '<rect x="6.5" y="11" width="11" height="8" rx="1.6"/><path d="M8.8 11 V8.7 a3.2 3.2 0 0 1 6.4 0 V11"/><circle cx="12" cy="15" r="0.9" fill="F" stroke="none"/>',
    x: '<path d="M6 18.5 L18 6.5 M18 18.5 L6 6.5"/><circle cx="12" cy="11" r="5.2"/>',
    c: '<path d="M12 4.5 L20 19 H4 Z"/><path d="M12 10.2 V14.5"/><circle cx="12" cy="16.7" r="0.7" fill="F" stroke="none"/>',
    h: '<circle cx="12" cy="12" r="7.5"/><path d="M10.1 10.2 a2 2 0 1 1 3 1.8 c-0.8 0.5 -1.1 0.9 -1.1 1.7"/><circle cx="12" cy="16.3" r="0.7" fill="F" stroke="none"/>',
    e: '<path d="M4 9.5 L12 5.5 L20 9.5 L12 13.5 Z"/><path d="M7.5 11.3 V15.3 C7.5 16.6 9.5 17.8 12 17.8 C14.5 17.8 16.5 16.6 16.5 15.3 V11.3"/><path d="M20 9.5 V14.5"/>',
    o: '<path d="M4 5.5 H20 V15 H4 Z"/><path d="M9 19 H15 M12 15 V19"/>'
  };
  var ICON_CACHE = {};
  function pinSVG(col, ic, w, glyph) {
    var h = Math.round(w * 1.31), fg = lum(col) > 0.55 ? "#1b2117" : "#ffffff";
    var g = glyph ? '<g transform="translate(7.6 6.6) scale(.7)" fill="none" stroke="' + fg + '" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' + GLYPH[ic].replace(/fill="F"/g, 'fill="' + fg + '"') + "</g>" : "";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="' + w + '" height="' + h + '"><path d="M16 40.5C16 40.5 29.4 26.6 29.4 15.4A13.4 13.4 0 0 0 2.6 15.4C2.6 26.6 16 40.5 16 40.5Z" fill="' + col + '" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/>' + g + "</svg>";
  }
  /* Pin width follows what the place IS (its type), never its status: a closed or schismatic-occupied chapel is still chapel-sized.
     Cathedral > Church > Chapel > Other institution > Sunday school = Prayer group > Wayside shrine.
     The status symbol (closed, occupied, unfixed location...) stays on the pin and simply scales down with it. */
  var PIN_W = { C: 30, F: 25, L: 21, X: 19.6, N: 18.2, G: 18.2, H: 17 };
  var OWN_ICON = { a: 1, s: 1, b: 1, m: 1, e: 1 }; /* types whose symbol is the type itself (monastery, palace, seminary...) keep full size */
  function pinWidth(e) { return PIN_W[e.t] || (OWN_ICON[e.icon] ? 30 : 25); }
  function iconFor(e) {
    var w = pinWidth(e), glyph = e.icon !== "p" || w >= 21;
    var key = e.col + "|" + e.icon + "|" + w;
    if (!ICON_CACHE[key]) {
      var h = Math.round(w * 1.31);
      ICON_CACHE[key] = L.divIcon({ className: "mm-pin", html: pinSVG(e.col, e.icon === "p" ? "p" : e.icon, w, glyph), iconSize: [w, h], iconAnchor: [w / 2, h - 1], popupAnchor: [0, -h + 6] });
    }
    return ICON_CACHE[key];
  }

  /* ---------- styles ---------- */
  var CSS = '.mm{position:absolute;inset:0;z-index:0;background:#d9dfd2;font-family:inherit}.dark .mm{background:#111827}' +
    '.mm .leaflet-control-zoom{border:0;box-shadow:0 6px 18px -6px rgba(16,20,13,.5);border-radius:12px;overflow:hidden}.mm .leaflet-control-zoom a{width:34px;height:34px;line-height:34px;background:rgba(247,245,238,.92);color:#2b3326;border:0;backdrop-filter:blur(10px)}.mm .leaflet-control-zoom a:hover{background:#fff}' +
    '.dark .mm .leaflet-control-zoom a{background:rgba(31,41,55,.92);color:#f7f5ee}.dark .mm .leaflet-control-zoom a:hover{background:#374151}' +
    '.mm .leaflet-control-attribution{background:rgba(255,255,255,.65);font-size:9.5px;padding:0 6px;border-radius:8px 0 0 0}.dark .mm .leaflet-control-attribution{background:rgba(17,24,39,.7);color:#cbd5e1}.dark .mm .leaflet-control-attribution a{color:#a5bd92}' +
    '.mm-pin{background:none;border:0}.mm-pin svg{display:block;filter:drop-shadow(0 2px 2.5px rgba(0,0,0,.5));transition:transform .15s}.mm-pin:hover svg{transform:translateY(-2px) scale(1.12)}' +
    '.mm-cl{display:flex;align-items:center;justify-content:center;border-radius:50%;background:#4a5d3d;color:#fff;font:600 13px Inter,system-ui,sans-serif;border:2.5px solid rgba(255,255,255,.92);box-shadow:0 4px 12px rgba(0,0,0,.4),0 0 0 6px rgba(74,93,61,.28)}.dark .mm-cl{background:#6b8259}' +
    '.mm-hl{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#ba9450;color:#10140d;font:700 14px Inter,system-ui,sans-serif;border:3px solid #fff;box-shadow:0 4px 14px rgba(0,0,0,.5)}' +
    '.mm-you{width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 8px rgba(37,99,235,.28)}' +
    '.mm-ctl{position:absolute;top:12px;right:12px;z-index:800;display:flex;gap:8px;align-items:flex-start;pointer-events:none}.mm-ctl>*{pointer-events:auto}' +
    '.mm-seg{display:flex;padding:3px;border-radius:999px;background:rgba(247,245,238,.9);backdrop-filter:blur(12px);box-shadow:0 6px 18px -6px rgba(16,20,13,.5);border:1px solid rgba(255,255,255,.6)}' +
    '.mm-seg button,.mm-btn{font:600 12px Inter,system-ui,sans-serif;color:#3a4333;background:transparent;border:0;border-radius:999px;padding:7px 12px;cursor:pointer;white-space:nowrap;transition:background .2s,color .2s}' +
    '.mm-seg button[aria-pressed=true]{background:#4a5d3d;color:#fff}.mm-seg button:not([aria-pressed=true]):hover{background:rgba(74,93,61,.12)}' +
    '.mm-btn{background:rgba(247,245,238,.9);backdrop-filter:blur(12px);box-shadow:0 6px 18px -6px rgba(16,20,13,.5);border:1px solid rgba(255,255,255,.6);padding:9px 14px}.mm-btn:hover{background:#fff}' +
    '.dark .mm-seg,.dark .mm-btn{background:rgba(31,41,55,.9);border-color:rgba(247,245,238,.12);color:#e5e7eb}.dark .mm-seg button,.dark .mm-btn{color:#e5e7eb}.dark .mm-seg button[aria-pressed=true]{background:#6b8259;color:#fff}.dark .mm-btn:hover{background:#374151}' +
    '.mm-panel{position:absolute;top:58px;right:12px;z-index:800;width:268px;max-height:calc(100% - 150px);overflow:auto;padding:12px 12px 10px;border-radius:16px;background:rgba(250,248,242,.96);backdrop-filter:blur(16px);box-shadow:0 18px 44px -14px rgba(16,20,13,.6);border:1px solid rgba(255,255,255,.7);font:13px/1.35 Inter,system-ui,sans-serif;color:#2b3326}' +
    '.dark .mm-panel{background:rgba(31,41,55,.96);color:#e5e7eb;border-color:rgba(247,245,238,.12)}.mm-panel[hidden]{display:none}' +
    '.mm-panel h4{margin:10px 0 6px;font:700 10.5px Inter,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8a7a5c}.mm-panel h4:first-child{margin-top:2px}html[lang=ml] .mm-panel h4{letter-spacing:normal}' +
    '.mm-row{display:flex;align-items:center;gap:8px;padding:4px 2px;cursor:pointer;border-radius:8px}.mm-row:hover{background:rgba(74,93,61,.1)}.mm-row input{accent-color:#4a5d3d;margin:0}.mm-row i{width:11px;height:11px;border-radius:50%;flex:none;border:1px solid rgba(0,0,0,.2)}.mm-row svg{flex:none}.mm-row span{flex:1;min-width:0}' +
    '.mm-acts{display:flex;gap:6px;margin:2px 0 4px}.mm-acts button{font:600 11px Inter,system-ui,sans-serif;color:#4a5d3d;background:rgba(74,93,61,.1);border:0;border-radius:999px;padding:5px 10px;cursor:pointer}.dark .mm-acts button{color:#a5bd92;background:rgba(165,189,146,.14)}' +
    '.mm-popup .leaflet-popup-content-wrapper{border-radius:16px;padding:0;background:#fffdf8;color:#2b3326;box-shadow:0 18px 44px -12px rgba(16,20,13,.65)}.mm-popup .leaflet-popup-content{margin:0;width:min(320px,calc(100vw - 96px))!important;font:13.5px/1.55 Inter,system-ui,sans-serif}.mm-popup .leaflet-popup-tip{background:#fffdf8}' +
    '.dark .mm-popup .leaflet-popup-content-wrapper,.dark .mm-popup .leaflet-popup-tip{background:#1f2937;color:#e5e7eb}.mm-popup a.leaflet-popup-close-button{top:8px;right:8px;color:#8a8f84}' +
    '.mm-ph{display:flex;gap:10px;align-items:flex-start;padding:16px 36px 8px 16px}.mm-dot{width:12px;height:12px;border-radius:50%;margin-top:6px;flex:none;border:1.5px solid rgba(0,0,0,.18)}.mm-ph h3{margin:0;font:400 19px/1.25 Marcellus,Georgia,serif;color:#10140d}.dark .mm-ph h3{color:#f7f5ee}' +
    '.mm .mm-sub{margin:2px 0 0!important;font:italic 13px/1.4 Marcellus,Georgia,serif;color:#8a7a5c}.mm .mm-ph h3{margin:0!important}.mm .mm-note,.mm .mm-flag{max-width:none}.mm-flag{margin:0 16px 6px;padding:5px 10px;border-radius:8px;background:rgba(186,148,80,.16);color:#7a5c1c;font:600 11.5px Inter,system-ui,sans-serif}.dark .mm-flag{color:#e6c987}' +
    '.mm-body{padding:2px 16px 4px;max-height:230px;overflow:auto;overscroll-behavior:contain;color:#3b4435}.dark .mm-body{color:#cbd5e1}.mm-body img{display:block;width:100%;height:auto;border-radius:10px;margin:8px 0}.mm .mm-body a{color:#4a5d3d;text-decoration:underline}.dark .mm .mm-body a{color:#a5bd92}' +
    '.mm-none{font-style:italic;opacity:.65}.mm-note{font-size:11.5px;opacity:.6;font-style:italic;margin:6px 0 0}' +
    '.mm-pf{display:flex;flex-wrap:wrap;gap:8px;padding:10px 16px 14px}.mm .mm-pf a,.mm .mm-pf button{font:600 12px Inter,system-ui,sans-serif;text-decoration:none;color:#fff;background:#4a5d3d;border:0;border-radius:999px;padding:7px 14px;cursor:pointer}.mm .mm-pf a.o{background:transparent;color:#4a5d3d;border:1px solid #4a5d3d}.dark .mm .mm-pf a.o{color:#a5bd92;border-color:#a5bd92;background:transparent}.dark .mm .mm-pf a:not(.o),.dark .mm .mm-pf button{background:#6b8259;color:#fff}' +
    '.mm-nl{margin:0;padding:6px 8px 12px;list-style:none;max-width:300px}.mm-nl li{display:flex;gap:10px;align-items:baseline;padding:8px;border-radius:10px;cursor:pointer}.mm-nl li:hover{background:rgba(74,93,61,.1)}.mm-nl b{flex:none;width:20px;height:20px;border-radius:50%;background:#ba9450;color:#10140d;font:700 11px/20px Inter,sans-serif;text-align:center}.mm-nl span{flex:1;min-width:0}.mm-nl em{display:block;font:italic 12px Marcellus,Georgia,serif;opacity:.65}.mm-nl small{flex:none;font:12px Inter,sans-serif;opacity:.7}' +
    'html[lang=ml] .mm-popup,html[lang=ml] .mm-panel,html[lang=ml] .mm-ctl{font-family:"Noto Serif Malayalam",serif}html[lang=ml] .mm-ph h3,html[lang=ml] .mm-sub{font-family:"Noto Serif Malayalam",serif}html[lang=ml] .mm-popup *,html[lang=ml] .mm-panel *,html[lang=ml] .mm-ctl *{font-family:Inter,"Noto Serif Malayalam",serif;letter-spacing:normal}html[lang=ml] .mm-ph h3,html[lang=ml] .mm-sub,html[lang=ml] .mm-nl em{font-family:Marcellus,"Noto Serif Malayalam",serif}' +
    '@media(max-width:640px){.mm-ctl{top:8px;right:8px;gap:6px}.mm-seg button{padding:6px 9px;font-size:11.5px}.mm-btn{padding:8px 11px;font-size:11.5px}.mm-panel{top:50px;right:8px;width:min(268px,calc(100% - 16px))}.mm-body{max-height:170px}}';

  /* ---------- sanitise a My Maps description ---------- */
  function cleanDesc(html) {
    var tpl = document.createElement("template"); tpl.innerHTML = html || "";
    var out = document.createElement("div");
    (function walk(src, dst) {
      Array.prototype.forEach.call(src.childNodes, function (n) {
        if (n.nodeType === 3) { dst.appendChild(document.createTextNode(n.nodeValue)); return; }
        if (n.nodeType !== 1) return;
        var tag = n.tagName.toLowerCase();
        if (tag === "br") dst.appendChild(document.createElement("br"));
        else if (tag === "img") {
          var s = n.getAttribute("src") || "";
          if (/^https:\/\//i.test(s)) { var im = document.createElement("img"); im.src = s; im.loading = "lazy"; im.alt = ""; im.referrerPolicy = "no-referrer"; im.onerror = function () { im.remove(); }; dst.appendChild(im); }
        } else if (tag === "a") {
          var h = n.getAttribute("href") || "";
          if (/^https?:\/\//i.test(h)) { var a = document.createElement("a"); a.href = h; a.target = "_blank"; a.rel = "noopener"; walk(n, a); dst.appendChild(a); } else walk(n, dst);
        } else if (/^(b|strong|i|em|u)$/.test(tag)) { var e = document.createElement(tag); walk(n, e); dst.appendChild(e); }
        else walk(n, dst);
      });
    })(tpl.content, out);
    return out.innerHTML.replace(/^(\s|<br>)+|(\s|<br>)+$/g, "");
  }

  /* ---------- the map ---------- */
  function init(cfg) {
    var root = typeof cfg.el === "string" ? document.querySelector(cfg.el) : cfg.el;
    if (!root) return Promise.resolve(null);
    var style = document.createElement("style"); style.textContent = CSS; document.head.appendChild(style);
    var loader = cfg.loader ? document.querySelector(cfg.loader) : null;
    function hideLoader() { if (!loader) return; loader.style.opacity = "0"; setTimeout(function () { loader.style.display = "none"; }, 700); }
    var req = [fetch(cfg.data).then(function (r) { return r.json(); }), cfg.extra ? fetch(cfg.extra).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }) : Promise.resolve({})];
    return Promise.all([ensureLib(), Promise.all(req)]).then(function (res) { return start(root, cfg, res[1][0], res[1][1], hideLoader); })
      .catch(function () { hideLoader(); root.innerHTML = '<p style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;opacity:.7">' + esc(t("loading")) + "</p>"; });
  }

  function start(root, cfg, data, extra, hideLoader) {
    var LBL = cfg.labels || {};
    function dioName(slug) { var l = LBL[slug] || (DIO[slug] && [DIO[slug][2], DIO[slug][3]]); return l ? two(l) : ""; }
    var entries = [];
    data.forEach(function (p, i) {
      var x = extra[p.n] || [], slug = slugOf(p.d), dd = DIO[slug];
      var icon = x[0] || (p.status === "caution" ? "c" : p.status === "death" ? "x" : "p");
      entries.push({ i: i, n: p.n, ml: x[1] || "", t: x[2] || "", icon: icon, slug: slug, col: dd ? dd[1] : "#4a5d3d", ds: p.ds || "", lat: p.lat, lon: p.lon, status: p.status || "",
        shr: x[2] === "H" && icon === "p", k: norm(p.n), kml: x[1] || "" });
    });

    root.classList.add("mm");
    var map = L.map(root, { zoomControl: false, minZoom: 2, maxZoom: 19, worldCopyJump: true, zoomSnap: 0.5, attributionControl: false, preferCanvas: false });
    L.control.zoom({ position: "topleft" }).addTo(map);
    map.createPane("mmLabels").style.zIndex = 250; map.getPane("mmLabels").style.pointerEvents = "none";

    /* base layers */
    var ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/";
    var BASES = {
      sat: function () { return [L.tileLayer(ESRI + "World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: "Imagery © Esri, Maxar, Earthstar Geographics" }),
        L.tileLayer(ESRI + "Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, pane: "mmLabels" })]; },
      light: function () { return [L.tileLayer(ESRI + "Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, maxNativeZoom: 16, attribution: "© Esri" }),
        L.tileLayer(ESRI + "Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, maxNativeZoom: 16, pane: "mmLabels" })]; },
      dark: function () { return [L.tileLayer(ESRI + "Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, maxNativeZoom: 16, attribution: "© Esri" }),
        L.tileLayer(ESRI + "Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, maxNativeZoom: 16, pane: "mmLabels" })]; }
    };
    var isDarkSite = function () { return document.documentElement.classList.contains("dark"); };
    var mode = isDarkSite() ? "dark" : "light", layers = [];
    function setMode(m, persist) {
      layers.forEach(function (l) { map.removeLayer(l); });
      layers = BASES[m](); layers.forEach(function (l) { l.addTo(map); });
      mode = m; segBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-s") === m ? "true" : "false"); });
    }

    /* cluster + markers */
    var cg = L.markerClusterGroup({ chunkedLoading: true, showCoverageOnHover: false, maxClusterRadius: 40, spiderfyOnMaxZoom: true, disableClusteringAtZoom: 16,
      iconCreateFunction: function (c) { var n = c.getChildCount(), s = n < 20 ? 36 : n < 150 ? 44 : 54; return L.divIcon({ html: '<div class="mm-cl" style="width:' + s + "px;height:" + s + 'px">' + n + "</div>", className: "", iconSize: [s, s] }); } });
    map.addLayer(cg);
    var openEntry = null;
    function typeLabel(e) { return e.icon === "a" ? two(STATUS.a) : (TYPE[e.t] ? two(TYPE[e.t]) : ""); }
    function entryName(e) { return ISML() && e.ml ? e.ml : e.n; }
    function popupHTML(e) {
      var dd = DIO[e.slug], dn = dioName(e.slug);
      var sub = [typeLabel(e), dn].filter(Boolean).join(" · ");
      var flag = (e.icon === "x" || e.icon === "c" || e.icon === "h" || e.icon === "z") ? '<div class="mm-flag">' + esc(two(STATUS[e.icon])) + "</div>" : "";
      var d = cleanDesc(e.ds), hasText = d.replace(/<[^>]+>/g, "").trim().length > 0;
      var body = d ? d : '<span class="mm-none">' + esc(t("nodesc")) + "</span>";
      var note = ISML() && hasText && !/[\u0d00-\u0d7f]/.test(d) ? '<p class="mm-note">' + esc(t("endesc")) + "</p>" : "";
      var acts = (e.icon === "z" ? "" : '<a href="https://www.google.com/maps/dir/?api=1&destination=' + e.lat + "," + e.lon + '" target="_blank" rel="noopener">' + esc(t("directions")) + "</a>") +
        (dd && dd[4] && cfg.dioceseLinks !== false ? '<a class="o" href="' + esc(dd[0]) + '">' + esc(t("dpage")) + "</a>" : "");
      return '<div class="mm-ph"><span class="mm-dot" style="background:' + e.col + '"></span><div><h3>' + esc(entryName(e)) + '</h3><p class="mm-sub">' + esc(sub) + "</p></div></div>" + flag +
        '<div class="mm-body">' + body + note + '</div><div class="mm-pf">' + acts + "</div>";
    }
    entries.forEach(function (e) {
      e.m = L.marker([e.lat, e.lon], { icon: iconFor(e), title: e.n, riseOnHover: true });
      e.m.bindPopup(function () { return popupHTML(e); }, { maxWidth: 340, minWidth: 230, className: "mm-popup", autoPanPaddingTopLeft: [20, 70], autoPanPaddingBottomRight: [20, 120] });
      e.m.on("popupopen", function () { openEntry = e; }); e.m.on("popupclose", function () { if (openEntry === e) openEntry = null; });
    });

    /* filters */
    var onDio = {}, onIcon = {}, shrinesOn = true;
    var usedDio = {}, usedIcon = {}; entries.forEach(function (e) { usedDio[e.slug] = (usedDio[e.slug] || 0) + 1; usedIcon[e.icon] = (usedIcon[e.icon] || 0) + 1; });
    Object.keys(usedDio).forEach(function (k) { onDio[k] = true; }); Object.keys(usedIcon).forEach(function (k) { onIcon[k] = true; });
    var applyT = null;
    function applyFilters() { clearTimeout(applyT); applyT = setTimeout(function () { cg.clearLayers(); cg.addLayers(entries.filter(visible).map(function (e) { return e.m; })); }, 30); }
    function visible(e) { return onDio[e.slug] !== false && onIcon[e.icon] !== false && (shrinesOn || !e.shr); }
    cg.addLayers(entries.map(function (e) { return e.m; }));

    /* controls */
    var ctl = document.createElement("div"); ctl.className = "mm-ctl";
    ctl.innerHTML = '<div class="mm-seg" role="group" aria-label="Map style">' + ["sat", "light", "dark"].map(function (k) { return '<button type="button" data-s="' + k + '"></button>'; }).join("") + '</div><button type="button" class="mm-btn" aria-expanded="false"></button>';
    root.appendChild(ctl);
    var segBtns = Array.prototype.slice.call(ctl.querySelectorAll(".mm-seg button")), layersBtn = ctl.querySelector(".mm-btn");
    segBtns.forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-s"), true); }); });
    var panel = document.createElement("div"); panel.className = "mm-panel"; panel.hidden = true; root.appendChild(panel);
    ["mousedown", "dblclick", "wheel", "touchstart"].forEach(function (ev) { L.DomEvent.on(panel, ev, L.DomEvent.stopPropagation); L.DomEvent.on(ctl, ev, L.DomEvent.stopPropagation); });
    layersBtn.addEventListener("click", function () { panel.hidden = !panel.hidden; layersBtn.setAttribute("aria-expanded", String(!panel.hidden)); });
    function glyphSVG(ic) { return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#6b7a5c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + GLYPH[ic].replace(/fill="F"/g, 'fill="#6b7a5c"') + "</svg>"; }
    function renderPanel() {
      var h = '<h4>' + esc(t("dioceses")) + '</h4><div class="mm-acts"><button type="button" data-a="all">' + esc(t("all")) + '</button><button type="button" data-a="none">' + esc(t("none")) + "</button></div>";
      T.dio.forEach(function (d) { if (!usedDio[d[0]]) return; h += '<label class="mm-row"><input type="checkbox" data-d="' + d[0] + '"' + (onDio[d[0]] !== false ? " checked" : "") + '><i style="background:' + d[1] + '"></i><span>' + esc(dioName(d[0])) + "</span></label>"; });
      if (cfg.symbols !== false) {
        h += "<h4>" + esc(t("symbols")) + "</h4>";
        ["p", "b", "m", "a", "s", "z", "e", "o", "h", "c", "x"].forEach(function (k) { if (!usedIcon[k]) return; h += '<label class="mm-row"><input type="checkbox" data-i="' + k + '"' + (onIcon[k] !== false ? " checked" : "") + ">" + glyphSVG(k) + "<span>" + esc(two(T.leg[k])) + "</span></label>"; });
        h += '<label class="mm-row"><input type="checkbox" data-shr="1"' + (shrinesOn ? " checked" : "") + '><svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="4" fill="#6b7a5c"/></svg><span>' + esc(t("shrines")) + "</span></label>";
      }
      panel.innerHTML = h;
    }
    panel.addEventListener("change", function (ev) {
      var i = ev.target; if (i.hasAttribute("data-d")) onDio[i.getAttribute("data-d")] = i.checked; else if (i.hasAttribute("data-i")) onIcon[i.getAttribute("data-i")] = i.checked; else if (i.hasAttribute("data-shr")) shrinesOn = i.checked;
      applyFilters();
    });
    panel.addEventListener("click", function (ev) {
      var a = ev.target.getAttribute && ev.target.getAttribute("data-a"); if (!a) return;
      Object.keys(onDio).forEach(function (k) { onDio[k] = a === "all"; }); Array.prototype.forEach.call(panel.querySelectorAll("[data-d]"), function (c) { c.checked = a === "all"; }); applyFilters();
    });
    function renderUI() {
      segBtns.forEach(function (b) { b.textContent = t(b.getAttribute("data-s")); }); layersBtn.textContent = t("layers"); renderPanel();
      if (openEntry && openEntry.m.isPopupOpen()) openEntry.m.setPopupContent(popupHTML(openEntry));
      if (nearBtn) nearBtn.textContent = t("near");
    }

    /* views */
    var all = L.latLngBounds(entries.map(function (e) { return [e.lat, e.lon]; }));
    function fitAll() { map.fitBounds(all.pad(0.06), { animate: true }); }
    function reveal(e, zoom, cb) {
      map.closePopup();
      var go = function () { e.m.openPopup(); cb && cb(); };
      if (!visible(e)) { onDio[e.slug] = true; onIcon[e.icon] = true; if (e.shr) shrinesOn = true; renderPanel(); cg.clearLayers(); cg.addLayers(entries.filter(visible).map(function (x) { return x.m; })); }
      map.flyTo([e.lat, e.lon], Math.max(map.getZoom(), zoom || 15), { duration: 1.1 });
      map.once("moveend", function () { cg.zoomToShowLayer(e.m, go); });
    }
    function focusEntry(e) { var w = document.getElementById("map") || root; var r = w.getBoundingClientRect(); if (r.top < -60 || r.top > innerHeight * 0.6) w.scrollIntoView({ behavior: "smooth", block: "start" }); reveal(e, 16); }

    /* nearest parishes */
    var hl = L.layerGroup().addTo(map), youMarker = null;
    function dist(a, b, c, d) { var p = Math.PI / 180, x = (c - a) * p, y = (d - b) * p, q = Math.sin(x / 2) * Math.sin(x / 2) + Math.cos(a * p) * Math.cos(c * p) * Math.sin(y / 2) * Math.sin(y / 2); return 12742 * Math.atan2(Math.sqrt(q), Math.sqrt(1 - q)); }
    function highlight(list, origin) {
      hl.clearLayers(); if (youMarker) { map.removeLayer(youMarker); youMarker = null; }
      var pts = [];
      list.forEach(function (e, i) { L.marker([e.lat, e.lon], { icon: L.divIcon({ className: "", html: '<div class="mm-hl">' + (i + 1) + "</div>", iconSize: [30, 30], iconAnchor: [15, 15] }), zIndexOffset: 2000 }).on("click", function () { reveal(e, 16); }).addTo(hl); pts.push([e.lat, e.lon]); });
      if (origin) { youMarker = L.marker(origin, { icon: L.divIcon({ className: "", html: '<div class="mm-you"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 1500, interactive: false }).addTo(map); pts.push(origin); }
      if (pts.length) map.flyToBounds(L.latLngBounds(pts).pad(0.25), { maxZoom: 15, duration: 1.1 });
    }
    function showYou(lat, lon) {
      hl.clearLayers(); if (youMarker) { map.removeLayer(youMarker); youMarker = null; } map.closePopup();
      youMarker = L.marker([lat, lon], { icon: L.divIcon({ className: "", html: '<div class="mm-you"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), zIndexOffset: 1500, interactive: false }).addTo(map);
      map.flyTo([lat, lon], 13, { duration: 1.1 });
    }
    function nearestTo(lat, lon, label) {
      var list = entries.filter(function (e) { return !e.status && /^[psau]$/.test(e.icon) && "HGXSTNPVM".indexOf(e.t || "-") < 0; })
        .map(function (e) { return { e: e, d: dist(lat, lon, e.lat, e.lon) }; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 5);
      highlight(list.map(function (x) { return x.e; }), [lat, lon]);
      var html = '<ul class="mm-nl">' + list.map(function (x, i) { return '<li data-k="' + x.e.i + '"><b>' + (i + 1) + "</b><span>" + esc(entryName(x.e)) + "<em>" + esc(dioName(x.e.slug)) + "</em></span><small>" + x.d.toFixed(1) + " km</small></li>"; }).join("") + "</ul>";
      var pop = L.popup({ className: "mm-popup", maxWidth: 320, autoPanPadding: [20, 70] }).setLatLng([lat, lon]).setContent('<div class="mm-ph"><div><h3>' + esc(t("nearTitle")) + '</h3><p class="mm-sub">' + esc(label || "") + "</p></div></div>" + html);
      setTimeout(function () { pop.openOn(map); }, 1200);
      pop.on("add", function () { Array.prototype.forEach.call(document.querySelectorAll(".mm-nl li"), function (li) { li.addEventListener("click", function () { reveal(entries[+li.getAttribute("data-k")], 16); }); }); });
    }

    /* search + near me */
    var form = cfg.search !== false && document.getElementById("mapSearchForm"), input = document.getElementById("mapSearchInput"), btn = document.getElementById("mapSearchBtn"), meta = document.getElementById("mapSearchMeta"), nearBtn = null;
    function setMeta(msg, buttons) {
      if (!meta) return; meta.textContent = msg;
      (buttons || []).forEach(function (b) { var x = document.createElement("button"); x.type = "button"; x.className = "mapsearch__reset"; x.textContent = b[0]; x.addEventListener("click", b[1]); meta.appendChild(x); });
    }
    function resetView() { hl.clearLayers(); if (youMarker) { map.removeLayer(youMarker); youMarker = null; } map.closePopup(); fitAll(); setMeta(t("whole")); }
    var matches = [], mi = 0;
    function showMatch() {
      var e = matches[mi]; reveal(e, 16);
      var b = [[t("reset"), resetView]]; if (matches.length > 1) b.unshift([t("next") + " →", function () { mi = (mi + 1) % matches.length; showMatch(); }]);
      setMeta(t("showing") + ": " + entryName(e) + (matches.length > 1 ? "  (" + (mi + 1) + " " + t("of") + " " + matches.length + ")" : ""), b);
    }
    function localSearch(q) {
      var n = norm(q), raw = q.trim(); if (n.length < 2) return [];
      var hits = entries.filter(function (e) { return e.k.indexOf(n) > -1 || (e.kml && e.kml.indexOf(raw) > -1); });
      hits.sort(function (a, b) { var as = a.k.indexOf(n) === 0 ? 0 : (" " + a.k).indexOf(" " + n) > -1 ? 1 : 2, bs = b.k.indexOf(n) === 0 ? 0 : (" " + b.k).indexOf(" " + n) > -1 ? 1 : 2; return as - bs || a.k.length - b.k.length; });
      return hits;
    }
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault(); var q = input.value.trim(); if (!q) return;
        matches = localSearch(q); mi = 0;
        if (matches.length && matches.length <= 8) { showMatch(); return; }
        btn.disabled = true; setMeta(t("finding") + " “" + q + "”…");
        fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=" + (ISML() ? "ml,en" : "en") + "&q=" + encodeURIComponent(q)).then(function (r) { return r.json(); }).then(function (r) {
          if (!r || !r.length) { if (matches.length) { showMatch(); return; } setMeta(t("nf")); return; }
          var p = r[0], bb = (p.boundingbox || []).map(parseFloat), lat = parseFloat(p.lat), lon = parseFloat(p.lon);
          hl.clearLayers(); map.closePopup();
          if (bb.length === 4) map.flyToBounds([[bb[0], bb[2]], [bb[1], bb[3]]], { maxZoom: 14, duration: 1.2 }); else map.flyTo([lat, lon], 12, { duration: 1.2 });
          setMeta(t("showing") + ": " + p.display_name.split(",").slice(0, 2).join(",").trim(), [[t("nearhere"), function () { nearestTo(lat, lon, p.display_name.split(",")[0]); }], [t("reset"), resetView]]);
          var m = document.getElementById("map"); if (m && m.getBoundingClientRect().top < -60) m.scrollIntoView({ behavior: "smooth", block: "start" });
        }).catch(function () { setMeta(t("err")); }).then(function () { btn.disabled = false; });
      });
    }
    if (cfg.nearest !== false) {
      var nbtn = document.createElement("button"); nbtn.type = "button"; nbtn.className = "mm-btn"; nearBtn = nbtn; nbtn.textContent = t("near"); ctl.insertBefore(nbtn, layersBtn);
      nbtn.addEventListener("click", function () {
        if (!navigator.geolocation) { setMeta(t("locFail")); return; }
        setMeta(t("loc"));
        navigator.geolocation.getCurrentPosition(function (p) { showYou(p.coords.latitude, p.coords.longitude); setMeta(t("showing") + ": " + t("you"), [[t("reset"), resetView]]); },
          function (er) { setMeta(er && er.code === 1 ? t("locDenied") : t("locFail")); }, { enableHighAccuracy: true, timeout: 10000 });
      });
      /* the "Locate the Nearest Parish" card on the page highlights its five results here too */
      var res = document.getElementById("nearestResults");
      if (res) {
        var byName = {}; entries.forEach(function (e) { if (!e.status) byName[e.k] = byName[e.k] || e; });
        new MutationObserver(function () {
          if (res.classList.contains("hidden")) return;
          var rows = Array.prototype.slice.call(res.children).filter(function (r) { return r.querySelector && r.querySelector(".flex-1"); }), list = [];
          rows.forEach(function (r) {
            var nm = r.querySelector(".flex-1 > span"), e = nm && byName[norm(nm.textContent)];
            if (e) { list.push(e); if (!r.__mm) { r.__mm = 1; r.style.cursor = "pointer"; r.title = ISML() ? "ഭൂപടത്തിൽ കാണുക" : "Show on the map"; r.addEventListener("click", function () { focusEntry(e); }); } }
          });
          if (list.length && res.__sig !== list.map(function (e) { return e.i; }).join()) { res.__sig = list.map(function (e) { return e.i; }).join(); highlight(list, null); }
        }).observe(res, { childList: true });
      }
    }

    /* language + theme */
    new MutationObserver(function () { renderUI(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    var lastDark = isDarkSite();
    new MutationObserver(function () { var d = isDarkSite(); if (d !== lastDark) { lastDark = d; setMode(d ? "dark" : "light", false); } }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    setMode(mode, false); renderUI(); fitAll(); setMeta(t("whole"));
    map.once("load", hideLoader); setTimeout(hideLoader, 1200); hideLoader();
    window.addEventListener("resize", function () { map.invalidateSize(); });
    var api = { map: map, entries: entries, focus: focusEntry, fitAll: fitAll };
    window.MalankaraMap.last = api;
    return api;
  }

  window.MalankaraMap = { init: init, version: 1 };
})();
