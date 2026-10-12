/* Placeholder artwork. These are illustrations, NOT photographs of KBR.
   They keep the layout looking designed until real photos are added in data/site.js. */
(function () {
  "use strict";
  var n = 0;
  function uid(p) { n += 1; return p + n; }
  function rng(seed) {
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
  }
  function bokeh(r, w, h, count, colors) {
    var s = "";
    for (var i = 0; i < count; i++) {
      var x = r() * w, y = r() * h * 0.7, rad = 14 + r() * 46, c = colors[Math.floor(r() * colors.length)];
      s += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + rad.toFixed(0) + '" fill="' + c + '" opacity="' + (0.06 + r() * 0.14).toFixed(2) + '"/>';
    }
    return s;
  }
  function open(vb, id1, stops) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>' +
      '<linearGradient id="' + id1 + '" x1="0" y1="0" x2="0" y2="1">' + stops + "</linearGradient></defs>";
  }

  var scenes = {
    /* hero: arches, moon and hanging lamps, landscape */
    night: function (r) {
      var g = uid("g"), glow = uid("m"), win = uid("w");
      var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false"><defs>' +
        '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1210"/><stop offset=".55" stop-color="#2c1a12"/><stop offset="1" stop-color="#4a2514"/></linearGradient>' +
        '<radialGradient id="' + glow + '"><stop offset="0" stop-color="#f08a45" stop-opacity=".95"/><stop offset=".45" stop-color="#c8602a" stop-opacity=".55"/><stop offset="1" stop-color="#c8602a" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="' + win + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3b36b" stop-opacity=".95"/><stop offset="1" stop-color="#8a3a17" stop-opacity=".85"/></linearGradient></defs>' +
        '<rect width="1600" height="900" fill="url(#' + g + ')"/>' +
        bokeh(r, 1600, 900, 18, ["#f3b36b", "#cbb07a", "#c8602a"]) +
        '<circle cx="1130" cy="400" r="430" fill="url(#' + glow + ')"/>' +
        '<circle cx="1130" cy="400" r="170" fill="#f2a561"/><circle cx="1130" cy="400" r="170" fill="none" stroke="#fbd9a8" stroke-width="2" opacity=".6"/>';
      var xs = [820, 1020, 1220, 1420];
      for (var i = 0; i < xs.length; i++) {
        var x = xs[i], t = 300 + (i % 2) * 40;
        s += '<path d="M' + (x - 70) + ' 900 V' + (t + 70) + ' A70 70 0 0 1 ' + (x + 70) + ' ' + (t + 70) + ' V900 Z" fill="url(#' + win + ')" opacity=".22"/>' +
          '<path d="M' + (x - 70) + ' 900 V' + (t + 70) + ' A70 70 0 0 1 ' + (x + 70) + ' ' + (t + 70) + ' V900" fill="none" stroke="#cbb07a" stroke-width="2.5" opacity=".6"/>';
      }
      var lx = [760, 900, 1060, 1200, 1340, 1480];
      for (var j = 0; j < lx.length; j++) {
        var len = 150 + (j % 3) * 60;
        s += '<line x1="' + lx[j] + '" y1="0" x2="' + lx[j] + '" y2="' + len + '" stroke="#cbb07a" stroke-width="2" opacity=".7"/>' +
          '<path d="M' + (lx[j] - 26) + ' ' + (len + 38) + ' A26 38 0 0 1 ' + (lx[j] + 26) + ' ' + (len + 38) + ' Z" fill="#241a13" stroke="#cbb07a" stroke-width="2"/>' +
          '<circle cx="' + lx[j] + '" cy="' + (len + 44) + '" r="40" fill="url(#' + glow + ')" opacity=".9"/><circle cx="' + lx[j] + '" cy="' + (len + 42) + '" r="9" fill="#ffe3b8"/>';
      }
      s += '<rect y="780" width="1600" height="120" fill="#120c09"/><rect y="776" width="1600" height="6" fill="#cbb07a" opacity=".5"/>' +
        '<g fill="#241a13" stroke="#cbb07a" stroke-width="2" opacity=".95"><rect x="900" y="738" width="64" height="40" rx="6"/><rect x="1140" y="744" width="52" height="34" rx="6"/><rect x="1300" y="730" width="70" height="48" rx="6"/></g>' +
        "</svg>";
      return s;
    },

    /* top-down coffee */
    coffee: function (r) {
      var g = uid("g"), s = open("0 0 800 1000", g, '<stop offset="0" stop-color="#4a2f1f"/><stop offset="1" stop-color="#1f130c"/>');
      s += '<rect width="800" height="1000" fill="url(#' + g + ')"/>' + bokeh(r, 800, 1000, 8, ["#f3b36b", "#cbb07a"]);
      s += '<g transform="translate(400 470)"><circle r="300" fill="#2a1a11" opacity=".6"/><circle r="270" fill="#f1e7d3"/><circle r="236" fill="#e6d9bf"/>' +
        '<circle r="190" fill="#f6efe1"/><circle r="165" fill="#5a3320"/><circle r="150" fill="#7a4a2d"/>' +
        '<path d="M0 -110 C70 -90 95 -20 0 80 C-95 -20 -70 -90 0 -110 Z" fill="#f2e3c8"/><path d="M0 -70 C28 -52 34 -10 0 40 C-34 -10 -28 -52 0 -70 Z" fill="#7a4a2d" opacity=".55"/>' +
        '<rect x="228" y="-8" width="190" height="16" rx="8" fill="#cbb07a" transform="rotate(8)"/><ellipse cx="450" cy="40" rx="26" ry="14" fill="#cbb07a" transform="rotate(8 450 40)"/></g>';
      for (var i = 0; i < 9; i++) {
        var x = 80 + r() * 640, y = 800 + r() * 150, a = Math.floor(r() * 180);
        s += '<g transform="translate(' + x.toFixed(0) + ' ' + y.toFixed(0) + ') rotate(' + a + ')"><ellipse rx="22" ry="14" fill="#2b170d"/><path d="M-20 0 Q0 -6 20 0" stroke="#0f0805" stroke-width="3" fill="none"/></g>';
      }
      return s + "</svg>";
    },

    /* top-down plate with momo */
    plate: function (r) {
      var g = uid("g"), s = open("0 0 800 1000", g, '<stop offset="0" stop-color="#3a3320"/><stop offset="1" stop-color="#1b160d"/>');
      s += '<rect width="800" height="1000" fill="url(#' + g + ')"/>' + bokeh(r, 800, 1000, 7, ["#9aa86a", "#cbb07a"]);
      s += '<g transform="translate(400 470)"><circle r="320" fill="#120d08" opacity=".55"/><circle r="290" fill="#f4ecdb"/><circle r="250" fill="#ece1c9"/>';
      var pos = [[-90, -110, -20], [70, -120, 25], [-150, 20, 10], [10, 5, -8], [150, 30, 30], [-60, 130, 15], [95, 140, -25]];
      for (var i = 0; i < pos.length; i++) {
        s += '<g transform="translate(' + pos[i][0] + ' ' + pos[i][1] + ') rotate(' + pos[i][2] + ')"><path d="M-58 14 Q-58 -52 0 -52 Q58 -52 58 14 Q0 40 -58 14 Z" fill="#fbf5e6" stroke="#d9c9a4" stroke-width="3"/>' +
          '<path d="M-40 -18 Q-20 -30 -8 -18 M-4 -22 Q12 -34 24 -20 M26 -14 Q38 -22 46 -8" stroke="#d9c9a4" stroke-width="3" fill="none"/></g>';
      }
      s += '<circle cx="250" cy="-160" r="56" fill="#f1e4c8"/><circle cx="250" cy="-160" r="42" fill="#b4401d"/><circle cx="238" cy="-170" r="12" fill="#d9663a" opacity=".7"/></g>' +
        '<g fill="#6e7d3f" opacity=".95"><ellipse cx="640" cy="760" rx="60" ry="26" transform="rotate(-30 640 760)"/><ellipse cx="700" cy="800" rx="54" ry="22" transform="rotate(20 700 800)"/><ellipse cx="120" cy="780" rx="56" ry="24" transform="rotate(35 120 780)"/></g>';
      return s + "</svg>";
    },

    /* backlit bar shelf */
    bar: function (r) {
      var g = uid("g"), gl = uid("l");
      var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>' +
        '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150e0a"/><stop offset="1" stop-color="#2b160d"/></linearGradient>' +
        '<linearGradient id="' + gl + '" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f08a45" stop-opacity=".85"/><stop offset="1" stop-color="#c8602a" stop-opacity="0"/></linearGradient></defs>' +
        '<rect width="800" height="1000" fill="url(#' + g + ')"/>';
      var shelves = [330, 560];
      for (var k = 0; k < shelves.length; k++) {
        var y = shelves[k];
        s += '<rect x="0" y="' + (y - 150) + '" width="800" height="150" fill="url(#' + gl + ')" opacity=".55"/>';
        var x = 40;
        while (x < 760) {
          var w = 44 + r() * 38, h = 90 + r() * 90, neck = 18 + r() * 8;
          var col = ["#3f5a35", "#6b3b1c", "#2a3a4a", "#7a2a1a", "#8c6a2a"][Math.floor(r() * 5)];
          s += '<g opacity=".95"><rect x="' + (x + w / 2 - neck / 2).toFixed(0) + '" y="' + (y - h - 34) + '" width="' + neck.toFixed(0) + '" height="40" rx="4" fill="' + col + '"/>' +
            '<rect x="' + x.toFixed(0) + '" y="' + (y - h) + '" width="' + w.toFixed(0) + '" height="' + h.toFixed(0) + '" rx="10" fill="' + col + '"/>' +
            '<rect x="' + (x + 8).toFixed(0) + '" y="' + (y - h + 12) + '" width="6" height="' + (h - 28).toFixed(0) + '" rx="3" fill="#fff" opacity=".18"/></g>';
          x += w + 18 + r() * 14;
        }
        s += '<rect x="0" y="' + y + '" width="800" height="12" fill="#cbb07a" opacity=".55"/>';
      }
      s += '<rect y="800" width="800" height="200" fill="#0e0907"/><rect y="796" width="800" height="6" fill="#cbb07a" opacity=".6"/>' +
        '<g transform="translate(400 780)"><path d="M-70 -170 H70 L50 0 H-50 Z" fill="#f3e6d0" opacity=".16" stroke="#f3e6d0" stroke-width="3"/><path d="M-62 -120 H62 L48 -6 H-48 Z" fill="#c8602a" opacity=".6"/>' +
        '<rect x="-30" y="-100" width="30" height="30" rx="4" fill="#fff" opacity=".35" transform="rotate(14 -15 -85)"/><rect x="6" y="-70" width="28" height="28" rx="4" fill="#fff" opacity=".3" transform="rotate(-10 20 -56)"/></g>';
      return s + "</svg>";
    },

    /* tall drink */
    drink: function (r) {
      var g = uid("g"), s = open("0 0 800 1000", g, '<stop offset="0" stop-color="#23301c"/><stop offset="1" stop-color="#11170c"/>');
      s += '<rect width="800" height="1000" fill="url(#' + g + ')"/>' + bokeh(r, 800, 1000, 10, ["#b9d36a", "#f3e6a8", "#cbb07a"]);
      s += '<g transform="translate(400 540)"><path d="M-130 -330 H130 L100 330 Q98 350 78 350 H-78 Q-98 350 -100 330 Z" fill="#f4efe0" opacity=".14" stroke="#f4efe0" stroke-width="4"/>' +
        '<path d="M-122 -180 H122 L96 322 Q94 338 78 338 H-78 Q-94 338 -96 322 Z" fill="#9bb84a" opacity=".78"/>' +
        '<rect x="-80" y="-150" width="78" height="78" rx="10" fill="#fff" opacity=".34" transform="rotate(12)"/><rect x="10" y="-60" width="70" height="70" rx="10" fill="#fff" opacity=".3" transform="rotate(-9)"/><rect x="-60" y="60" width="66" height="66" rx="10" fill="#fff" opacity=".3" transform="rotate(20)"/>' +
        '<line x1="40" y1="-420" x2="-10" y2="200" stroke="#c8602a" stroke-width="16" stroke-linecap="round"/>' +
        '<g transform="translate(112 -310)"><circle r="68" fill="#e2e86a"/><circle r="58" fill="#f4f6a8"/><path d="M0 0 L0 -58 M0 0 L50 -30 M0 0 L50 30 M0 0 L0 58 M0 0 L-50 30 M0 0 L-50 -30" stroke="#d3d95a" stroke-width="3"/></g>' +
        '<g fill="#6e8a3a"><ellipse cx="-70" cy="-350" rx="42" ry="20" transform="rotate(-30 -70 -350)"/><ellipse cx="-30" cy="-380" rx="40" ry="18" transform="rotate(20 -30 -380)"/></g></g>';
      for (var i = 0; i < 14; i++) s += '<circle cx="' + (300 + r() * 200).toFixed(0) + '" cy="' + (400 + r() * 440).toFixed(0) + '" r="' + (3 + r() * 6).toFixed(0) + '" fill="#fff" opacity=".35"/>';
      return s + "</svg>";
    },

    /* snack basket */
    snack: function (r) {
      var g = uid("g"), s = open("0 0 800 1000", g, '<stop offset="0" stop-color="#4a2a14"/><stop offset="1" stop-color="#1d1008"/>');
      s += '<rect width="800" height="1000" fill="url(#' + g + ')"/>' + bokeh(r, 800, 1000, 8, ["#f3b36b", "#c8602a"]);
      s += '<g transform="translate(400 520)"><path d="M-250 -60 H250 L200 260 Q196 290 166 290 H-166 Q-196 290 -200 260 Z" fill="#a9652f"/><path d="M-250 -60 H250 L244 -20 H-244 Z" fill="#8a4f22"/><path d="M-200 40 H200 M-190 120 H190 M-180 200 H180" stroke="#6b3a17" stroke-width="5" opacity=".6"/></g>';
      for (var i = 0; i < 26; i++) {
        var x = 190 + r() * 420, y = 250 + r() * 180, a = -25 + r() * 50, h = 200 + r() * 110;
        s += '<rect x="' + x.toFixed(0) + '" y="' + y.toFixed(0) + '" width="30" height="' + h.toFixed(0) + '" rx="8" fill="' + (r() > 0.5 ? "#f0b955" : "#e6a43f") + '" transform="rotate(' + a.toFixed(0) + ' ' + x.toFixed(0) + ' ' + (y + 120).toFixed(0) + ')"/>';
      }
      s += '<g transform="translate(400 520)"><path d="M-250 -60 H250 L200 260 Q196 290 166 290 H-166 Q-196 290 -200 260 Z" fill="#a9652f"/><path d="M-250 -60 H250 L244 -20 H-244 Z" fill="#8a4f22"/><path d="M-200 40 H200 M-190 120 H190 M-180 200 H180" stroke="#6b3a17" stroke-width="5" opacity=".6"/></g>' +
        '<g transform="translate(640 830)"><circle r="70" fill="#f1e4c8"/><circle r="54" fill="#b4401d"/></g>';
      return s + "</svg>";
    },

    /* room: arches, lamps, chairs */
    space: function (r) {
      var g = uid("g"), gl = uid("m");
      var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>' +
        '<linearGradient id="' + g + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1c13"/><stop offset="1" stop-color="#140d09"/></linearGradient>' +
        '<radialGradient id="' + gl + '"><stop offset="0" stop-color="#f3b36b" stop-opacity=".9"/><stop offset="1" stop-color="#f3b36b" stop-opacity="0"/></radialGradient></defs>' +
        '<rect width="900" height="1000" fill="url(#' + g + ')"/>';
      for (var i = 0; i < 3; i++) {
        var x = 150 + i * 300;
        s += '<path d="M' + (x - 110) + ' 760 V330 A110 110 0 0 1 ' + (x + 110) + ' 330 V760 Z" fill="#6a3a1c" opacity=".55"/><path d="M' + (x - 110) + ' 760 V330 A110 110 0 0 1 ' + (x + 110) + ' 330 V760" fill="none" stroke="#cbb07a" stroke-width="3" opacity=".7"/>';
      }
      var lx = [200, 450, 700];
      for (var j = 0; j < lx.length; j++) {
        var len = 170 + j * 40;
        s += '<line x1="' + lx[j] + '" y1="0" x2="' + lx[j] + '" y2="' + len + '" stroke="#cbb07a" stroke-width="2"/><circle cx="' + lx[j] + '" cy="' + (len + 40) + '" r="110" fill="url(#' + gl + ')"/>' +
          '<path d="M' + (lx[j] - 34) + ' ' + (len + 48) + ' A34 46 0 0 1 ' + (lx[j] + 34) + ' ' + (len + 48) + ' Z" fill="#1c130d" stroke="#cbb07a" stroke-width="2"/><circle cx="' + lx[j] + '" cy="' + (len + 50) + '" r="10" fill="#fff0cf"/>';
      }
      s += '<rect y="760" width="900" height="240" fill="#0f0a07"/><rect y="756" width="900" height="6" fill="#cbb07a" opacity=".45"/>';
      var tx = [150, 450, 750];
      for (var k = 0; k < tx.length; k++) {
        s += '<g transform="translate(' + tx[k] + ' 800)"><ellipse rx="86" ry="14" cy="62" fill="#000" opacity=".4"/><rect x="-84" y="-6" width="168" height="14" rx="7" fill="#cbb07a" opacity=".8"/><rect x="-6" y="8" width="12" height="62" fill="#cbb07a" opacity=".6"/>' +
          '<rect x="-150" y="-70" width="46" height="100" rx="12" fill="#3b4527"/><rect x="104" y="-70" width="46" height="100" rx="12" fill="#3b4527"/></g>';
      }
      return s + "</svg>";
    }
  };

  window.KBR_ART = {
    kinds: Object.keys(scenes),
    render: function (kind, seed) {
      var fn = scenes[kind] || scenes.space;
      return fn(rng(String(seed || kind)));
    }
  };
})();
