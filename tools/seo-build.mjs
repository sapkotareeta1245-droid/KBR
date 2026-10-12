#!/usr/bin/env node
/* SEO build step. Zero dependencies, safe to run many times (idempotent).

   WHAT IT DOES
   1. Needs the real production domain. It reads, in this order:
        --domain=https://example.com   |   first argument   |   env SITE_URL   |   env URL (Netlify sets this to your primary domain)
      If no domain is available it does NOT guess one: it skips the domain-dependent files and says so.
   2. With a domain it writes: canonical + og:url + og:image into each page's <!--seo:start-->...<!--seo:end--> block,
      the "url"/"hasMenu" fields in the JSON-LD, a BreadcrumbList on inner pages, sitemap.xml, and the Sitemap line in robots.txt.
   3. Menu: if data/menu.js has MENU_IS_SAMPLE = false, a static copy of the menu is written into menu.html for crawlers.
      While the menu is a SAMPLE nothing is written, so sample dishes and prices are never indexed.

   USAGE   node tools/seo-build.mjs https://your-real-domain.com     (or let Netlify run it, see netlify.toml) */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = process.argv.slice(2).find((a) => a.startsWith("--domain=") || /^https?:\/\//i.test(a)) || "";
const raw = (arg.replace(/^--domain=/, "") || process.env.SITE_URL || process.env.URL || "").trim().replace(/\/+$/, "");
const site = /^https?:\/\/[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:\d+)?$/i.test(raw) ? raw : "";
if (raw && !site) console.warn(`SEO: "${raw}" is not a valid site origin (expected https://example.com). Ignoring it.`);

const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const write = (f, t) => fs.writeFileSync(path.join(ROOT, f), t, "utf8");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"))
  .filter((f) => !/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(read(f)))
  .map((f) => ({ file: f, urlPath: f === "index.html" ? "/" : "/" + f }));

/* ---------- 1. domain-dependent SEO ---------- */
if (!site) {
  console.log("SEO: no production domain provided, so canonical URLs, og:url, og:image, sitemap.xml and the robots.txt Sitemap line were NOT generated.");
  console.log("     Run again with your real domain, e.g.  node tools/seo-build.mjs https://your-domain.com");
} else {
  const hasOg = fs.existsSync(path.join(ROOT, "og-image.jpg"));
  const hasMenuPage = pages.some((p) => p.file === "menu.html");
  for (const p of pages) {
    let html = read(p.file);
    const url = site + p.urlPath;
    const siteName = (html.match(/<meta property="og:site_name" content="([^"]*)"/) || [, ""])[1];
    let block = `<link rel="canonical" href="${esc(url)}">\n<meta property="og:url" content="${esc(url)}">`;
    if (hasOg) {
      block += `\n<meta property="og:image" content="${esc(site)}/og-image.jpg">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">` +
        `\n<meta property="og:image:alt" content="${siteName}">\n<meta name="twitter:image" content="${esc(site)}/og-image.jpg">`;
    }
    if (p.urlPath !== "/") {
      const crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site + "/" },
        { "@type": "ListItem", position: 2, name: (html.match(/<title>([^<|]*)/) || [, p.file])[1].trim().replace(/&amp;/g, "&"), item: url } ] };
      block += `\n<script type="application/ld+json">${JSON.stringify(crumbs)}</script>`;
    }
    if (!/<!--seo:start-->[\s\S]*?<!--seo:end-->/.test(html)) { console.warn(`SEO: ${p.file} has no <!--seo:start--> marker; skipped.`); continue; }
    html = html.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, () => `<!--seo:start-->\n${block}\n<!--seo:end-->`);
    html = html.replace(/(<script type="application\/ld\+json" id="ld-main">)([\s\S]*?)(<\/script>)/, (m, a, json, c) => {
      try {
        const o = JSON.parse(json);
        o.url = url;
        if (p.urlPath === "/" && hasMenuPage && JSON.stringify(o["@type"]).includes("Restaurant")) o.hasMenu = site + "/menu.html";
        return a + JSON.stringify(o) + c;
      } catch (e) { console.warn(`SEO: could not parse JSON-LD in ${p.file}`); return m; }
    });
    write(p.file, html);
  }
  write("sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages.map((p) => `  <url><loc>${esc(site + p.urlPath)}</loc></url>`).join("\n") + `\n</urlset>\n`);
  let robots = fs.existsSync(path.join(ROOT, "robots.txt")) ? read("robots.txt") : "User-agent: *\nAllow: /\n";
  robots = robots.replace(/^Sitemap:.*\r?\n?/gim, "").replace(/\s+$/, "") + `\n\nSitemap: ${site}/sitemap.xml\n`;
  write("robots.txt", robots);
  console.log(`SEO: applied domain ${site} to ${pages.length} page(s); wrote sitemap.xml and robots.txt.`);
}

/* ---------- 2. static menu for crawlers (only when the menu is real) ---------- */
try {
  const ctx = { window: {} }; vm.createContext(ctx);
  vm.runInContext(read("data/menu.js"), ctx);
  const w = ctx.window, items = w.MENU_ITEMS || [], cats = w.MENU_CATEGORIES || [];
  const real = w.MENU_IS_SAMPLE === false && items.length > 0;
  let html = read("menu.html");
  let block = "";
  if (real) {
    const price = (n) => "NPR " + Number(n).toLocaleString("en-IN");
    block = cats.map((c) => {
      const g = items.filter((i) => i.category === c.id);
      if (!g.length) return "";
      return `<section class="mgroup"><div class="mgroup__h"><h2>${esc(c.label)}</h2></div><ul class="mlist">` +
        g.map((i) => `<li class="mrow"><div class="mrow__top"><span class="mrow__name">${esc(i.name)}</span><span class="mrow__dots" aria-hidden="true"></span><span class="mrow__price">${esc(price(i.price))}</span></div>` +
          (i.description ? `<p class="mrow__desc">${esc(i.description)}</p>` : "") + `</li>`).join("") + `</ul></section>`;
    }).join("");
  }
  const next = html.replace(/<!--menu:start-->[\s\S]*?<!--menu:end-->/, () => `<!--menu:start-->${block}<!--menu:end-->`);
  if (next !== html) write("menu.html", next);
  console.log(real ? `SEO: pre-rendered ${items.length} real menu items into menu.html.` : "SEO: menu is still SAMPLE data, so it was not pre-rendered (sample dishes and prices stay out of search results).");
} catch (e) { console.warn("SEO: menu pre-render skipped:", e.message); }
