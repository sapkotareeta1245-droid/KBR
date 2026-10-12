#!/usr/bin/env node
/* SEO self-check. Zero dependencies. Run: node tools/seo-check.mjs
   Reports titles, descriptions, headings, canonicals, Open Graph, image alt text, broken local links, JSON-LD, sitemap and robots.
   It reports facts about your files only. It cannot tell you whether Google has indexed anything or how you will rank. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const exists = (f) => fs.existsSync(path.join(ROOT, f));
let fails = 0, warns = 0;
const seen = new Set();
const out = (lvl, page, msg) => { const k = lvl + page + msg; if (seen.has(k)) return; seen.add(k); if (lvl === "FAIL") fails++; if (lvl === "WARN") warns++; console.log(`${lvl.padEnd(4)}  ${page.padEnd(12)} ${msg}`); };
const attr = (tag, name) => (tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i")) || [, null])[1];
const un = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"');

const files = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
const info = {};
for (const f of files) {
  const html = read(f), body = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "");
  const ids = new Set([...body.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]));
  info[f] = { html, body, ids, noindex: /<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html),
    canonical: (html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i) || [""])[0] };
}
const titles = {};
for (const f of files) {
  const { html, body } = info[f];
  const title = un((html.match(/<title>([\s\S]*?)<\/title>/i) || [, ""])[1].trim());
  if (!title) out("FAIL", f, "missing <title>");
  else { out(title.length > 65 || title.length < 15 ? "WARN" : "OK", f, `title (${title.length} chars): ${title}`); (titles[title] = titles[title] || []).push(f); }
  const d = (html.match(/<meta[^>]+name=["']description["'][^>]*>/i) || [""])[0];
  const desc = un(attr(d, "content") || "");
  if (!desc) out("FAIL", f, "missing meta description"); else out(desc.length > 165 || desc.length < 70 ? "WARN" : "OK", f, `meta description (${desc.length} chars)`);
  const h1 = (body.match(/<h1[\s>]/gi) || []).length;
  out(h1 === 1 ? "OK" : "FAIL", f, `${h1} <h1>`);
  const levels = [...body.matchAll(/<h([1-6])[\s>]/gi)].map((m) => +m[1]);
  for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) { out("WARN", f, `heading level jumps h${levels[i - 1]} to h${levels[i]}`); break; }
  if (!/<html[^>]+lang=/i.test(html)) out("FAIL", f, "missing lang on <html>");
  if (!/name=["']viewport["']/i.test(html)) out("FAIL", f, "missing viewport meta");
  for (const k of ["og:title", "og:description", "og:type"]) if (!new RegExp(`property=["']${k}["']`).test(html)) out("WARN", f, `missing ${k}`);
  if (info[f].noindex) out("WARN", f, "page is set to noindex");
  if (!info[f].canonical) out("WARN", f, "no canonical yet (needs your production domain: run tools/seo-build.mjs)");
  else { const href = attr(info[f].canonical, "href") || ""; out(/^https:\/\//.test(href) ? "OK" : "FAIL", f, `canonical ${href}`); }
  if (/property=["']og:image["']/.test(html) && !/property=["']og:image["'][^>]+content=["']https?:\/\//.test(html)) out("FAIL", f, "og:image must be an absolute URL");
  for (const m of body.matchAll(/<img\b[^>]*>/gi)) if (!/\balt\s*=/.test(m[0])) out("FAIL", f, `img without alt: ${m[0].slice(0, 60)}`);
  // links and assets
  for (const m of html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)) {
    const u = m[1];
    if (/^(https?:|tel:|mailto:|data:|\/\/)/i.test(u) || u === "#") continue;
    const [p, frag] = u.split("#");
    const target = p === "" ? f : p.replace(/^\//, "") || "index.html";
    if (!exists(target) || fs.statSync(path.join(ROOT, target)).isDirectory() && !exists(path.join(target, "index.html"))) { out("FAIL", f, `broken link/asset: ${u}`); continue; }
    if (frag && info[target] && !info[target].ids.has(frag)) out("WARN", f, `fragment #${frag} not in static HTML of ${target} (fine if handled by JavaScript)`);
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const j = JSON.parse(m[1]); out("OK", f, `JSON-LD ${JSON.stringify(j["@type"])} parses`);
      if (/aggregateRating|"review"/.test(m[1])) out("WARN", f, "JSON-LD contains rating/review data: only keep it if it is verified and eligible"); }
    catch (e) { out("FAIL", f, "JSON-LD does not parse"); }
  }
}
for (const [t, fs_] of Object.entries(titles)) if (fs_.length > 1) out("FAIL", fs_.join(","), `duplicate title: ${t}`);

if (exists("robots.txt")) {
  const r = read("robots.txt");
  out(/^\s*Disallow:\s*\/\s*$/im.test(r) ? "FAIL" : "OK", "robots.txt", /^\s*Disallow:\s*\/\s*$/im.test(r) ? "blocks the whole site" : "does not block the site");
  if (exists("sitemap.xml") && !/^Sitemap:/im.test(r)) out("WARN", "robots.txt", "no Sitemap line");
} else out("WARN", "robots.txt", "missing");
if (exists("sitemap.xml")) {
  const s = read("sitemap.xml"), locs = [...s.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => un(m[1]));
  const canon = files.filter((f) => !info[f].noindex).map((f) => un(attr(info[f].canonical, "href") || ""));
  out("OK", "sitemap.xml", `${locs.length} URL(s)`);
  for (const l of locs) if (!canon.includes(l)) out("WARN", "sitemap.xml", `URL does not match any page canonical: ${l}`);
} else out("WARN", "sitemap.xml", "not generated yet (needs your production domain: run tools/seo-build.mjs)");
console.log(`\n${fails} failure(s), ${warns} warning(s).`);
process.exit(fails ? 1 : 0);
