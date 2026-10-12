/* KBR site behaviours. Vanilla JS, no dependencies. Content comes from data/site.js and data/menu.js. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SITE = window.SITE || {};
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- bind verified facts ---------- */
  $$("[data-tel]").forEach(function (a) { if (SITE.phoneTel) a.href = "tel:" + SITE.phoneTel; });
  $$("[data-directions]").forEach(function (a) { if (SITE.mapsDirections) a.href = SITE.mapsDirections; });
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  $$("[data-wa]").forEach(function (a) {
    if (SITE.whatsapp) { a.href = "https://wa.me/" + String(SITE.whatsapp).replace(/\D/g, "") + "?text=" + encodeURIComponent("Hello KBR, I have a question."); a.hidden = false; }
  });

  /* ---------- image slots: real/stock photo if provided, otherwise placeholder artwork ---------- */
  var anyPlaceholder = false;
  var UNSPLASH = /^https:\/\/images\.unsplash\.com\//;
  function srcsetFor(src) {
    // Unsplash serves any width; build a responsive set from the w= parameter. Other hosts/uploads get no srcset.
    if (!UNSPLASH.test(src) || !/[?&]w=\d+/.test(src)) return "";
    return [480, 800, 1200, 1600].map(function (w) { return src.replace(/([?&]w=)\d+/, "$1" + w) + " " + w + "w"; }).join(", ");
  }
  $$("[data-slot]").forEach(function (el) {
    var slot = el.getAttribute("data-slot"), kind = el.getAttribute("data-art") || "space";
    var img = SITE.images && SITE.images[slot];
    function art() {
      el.innerHTML = window.KBR_ART ? window.KBR_ART.render(kind, slot) : "";
      if (el.hasAttribute("data-tag")) el.insertAdjacentHTML("beforeend", '<span class="photo__tag">Placeholder art</span>');
      anyPlaceholder = true;
    }
    if (img && img.src) {
      var im = new Image();
      im.alt = img.alt || "";
      if (!img.alt && window.console) console.warn("Add alt text for image slot '" + slot + "' in content/site.json (or /admin).");
      im.decoding = "async";
      var set = srcsetFor(img.src);
      if (set) { im.srcset = set; im.sizes = el.hasAttribute("data-eager") ? "100vw" : "(max-width: 900px) 100vw, 50vw"; }
      if (el.hasAttribute("data-eager")) im.setAttribute("fetchpriority", "high"); else im.setAttribute("loading", "lazy");
      im.onerror = art;
      im.src = img.src;
      el.innerHTML = "";
      el.appendChild(im);
      if (SITE.stockPhotos && el.hasAttribute("data-tag")) el.insertAdjacentHTML("beforeend", '<span class="photo__tag">Stock photo</span>');
    } else art();
  });
  $$("[data-placeholder-note]").forEach(function (el) { el.hidden = !(anyPlaceholder || SITE.stockPhotos); });
  var sample = window.MENU_IS_SAMPLE !== false;
  $$("[data-sample-note]").forEach(function (el) { el.hidden = !sample; });

  /* ---------- navigation ---------- */
  var nav = $(".nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("is-solid", window.scrollY > 30); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    var btn = $(".nav__toggle", nav), list = $(".nav__links", nav);
    if (btn && list) {
      var setOpen = function (open) {
        list.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
        btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.body.style.overflow = open ? "hidden" : "";
      };
      btn.addEventListener("click", function () { setOpen(btn.getAttribute("aria-expanded") !== "true"); });
      list.addEventListener("click", function (e) { if (e.target.closest("a")) setOpen(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && list.classList.contains("is-open")) { setOpen(false); btn.focus(); } });
      window.addEventListener("resize", function () { if (window.innerWidth > 900) setOpen(false); });
    }
  }

  /* ---------- reveal on scroll ---------- */
  var rev = $$(".reveal");
  if (reduce || !("IntersectionObserver" in window)) rev.forEach(function (el) { el.classList.add("is-in"); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    rev.forEach(function (el) { io.observe(el); });
  }

  /* ---------- count-up (real figures only) ---------- */
  function runCount(el) {
    var end = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (isNaN(end)) return;
    var done = function () { el.textContent = end.toFixed(dec); };
    if (reduce) return done();
    var t0 = performance.now(), dur = 1300;
    (function tick(t) {
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick); else done();
    })(t0);
  }
  var counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else counters.forEach(runCount);

  /* ---------- moods tabs (home) ---------- */
  var tablist = $(".tablist");
  if (tablist) {
    var tabs = $$('[role="tab"]', tablist), panels = $$('[role="tabpanel"]');
    var select = function (i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        if (panels[k]) panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { select(i); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = tabs.length;
        if (k === "ArrowDown" || k === "ArrowRight") { e.preventDefault(); select((i + 1) % n, true); }
        else if (k === "ArrowUp" || k === "ArrowLeft") { e.preventDefault(); select((i - 1 + n) % n, true); }
        else if (k === "Home") { e.preventDefault(); select(0, true); }
        else if (k === "End") { e.preventDefault(); select(n - 1, true); }
      });
    });
    select(0);
  }

  /* ---------- menu page ---------- */
  var mount = $("#menu-list");
  if (mount && window.MENU_ITEMS) {
    var cats = window.MENU_CATEGORIES || [], items = window.MENU_ITEMS;
    var bar = $("#menu-tabs"), search = $("#menu-search"), count = $("#menu-count"), empty = $("#menu-empty"), resetBtn = $("#menu-reset");
    var cat = "all", q = "";
    var fmt = function (n) { return "NPR " + Number(n).toLocaleString("en-IN"); };
    var catLabel = function (id) { var c = cats.filter(function (x) { return x.id === id; })[0]; return c ? c.label : id; };

    var row = function (it) {
      var thumb = it.image ? '<div class="mrow__thumb"><img src="' + esc(it.image) + '" alt="' + esc(it.name) + '" loading="lazy" width="84" height="84" onerror="this.parentNode.remove()"></div>' : "";
      return '<li class="mrow">' + thumb +
        '<div class="mrow__top"><span class="mrow__name">' + esc(it.name) + (sample ? '<span class="tag">Sample</span>' : "") + '</span><span class="mrow__dots" aria-hidden="true"></span><span class="mrow__price">' + esc(fmt(it.price)) + "</span></div>" +
        (it.description ? '<p class="mrow__desc">' + esc(it.description) + "</p>" : "") + "</li>";
    };

    var draw = function () {
      var term = q.toLowerCase();
      var shown = items.filter(function (it) {
        return (cat === "all" || it.category === cat) && (!term || (it.name + " " + (it.description || "")).toLowerCase().indexOf(term) > -1);
      });
      var html = "";
      cats.forEach(function (c) {
        var g = shown.filter(function (it) { return it.category === c.id; });
        if (!g.length) return;
        html += '<section class="mgroup" aria-labelledby="g-' + esc(c.id) + '"><div class="mgroup__h"><h2 id="g-' + esc(c.id) + '">' + esc(c.label) + "</h2><span>" + g.length + (g.length === 1 ? " item" : " items") + '</span></div><ul class="mlist">' + g.map(row).join("") + "</ul></section>";
      });
      mount.innerHTML = html;
      empty.hidden = shown.length > 0;
      if (!shown.length) $("#empty-term").textContent = q ? "“" + q + "”" : "this selection";
      count.textContent = shown.length + (shown.length === 1 ? " item" : " items");
    };

    bar.innerHTML = [{ id: "all", label: "All Items" }].concat(cats).map(function (c) {
      return '<button type="button" data-cat="' + esc(c.id) + '" aria-pressed="' + (c.id === "all") + '">' + esc(c.label) + "</button>";
    }).join("");
    var setCat = function (id, updateHash) {
      cat = (id === "all" || cats.some(function (c) { return c.id === id; })) ? id : "all";
      $$("button", bar).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-cat") === cat)); });
      if (updateHash && window.history && history.replaceState) {
        try { history.replaceState(null, "", cat === "all" ? location.pathname + location.search : "#" + cat); } catch (e) { /* file:// quirks */ }
      }
      draw();
    };
    bar.addEventListener("click", function (e) { var b = e.target.closest("button[data-cat]"); if (b) setCat(b.getAttribute("data-cat"), true); });
    search.addEventListener("input", function () { q = search.value.trim(); draw(); });
    resetBtn.addEventListener("click", function () { q = ""; search.value = ""; setCat("all", true); search.focus(); });
    window.addEventListener("hashchange", function () { setCat(location.hash.replace("#", "") || "all", false); });
    setCat(location.hash.replace("#", "") || "all", false);
  }

  /* ---------- map fallback: hide iframe if it fails to load ---------- */
  var frame = $("#map-frame");
  if (frame && SITE.mapsEmbed) { frame.src = SITE.mapsEmbed; }
})();
