#!/usr/bin/env node
/* Turns the CMS-editable JSON in content/ into the JavaScript data files the pages load from data/.
   content/site.json  -> data/site.js  (window.SITE, plus derived Google Maps links)
   content/<name>.json -> data/<name>.js  (each top-level key K becomes window.<NAME>_<K in SNAKE_CASE>,
                                           e.g. content/menu.json { isSample, categories, items } -> MENU_IS_SAMPLE, MENU_CATEGORIES, MENU_ITEMS)
   Zero dependencies. Safe to run repeatedly. Netlify runs it on every deploy (see netlify.toml); the generated files are
   also committed, so drag-and-drop deploys and opening the site locally keep working. If the content is invalid it prints
   what is wrong and exits with an error, so a bad edit never replaces a working site. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content"), DATA = path.join(ROOT, "data");
const errors = [], warns = [], outputs = [];
const snake = (k) => k.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
const banner = (f) => `/* GENERATED from content/${f}.json by tools/build-data.mjs. Edit the JSON (or use /admin), not this file. */\n`;

if (!fs.existsSync(CONTENT)) { console.log("build-data: no content/ folder, nothing to do."); process.exit(0); }

for (const file of fs.readdirSync(CONTENT).filter((f) => f.endsWith(".json")).sort()) {
  const name = file.replace(/\.json$/, "");
  let obj;
  try { obj = JSON.parse(fs.readFileSync(path.join(CONTENT, file), "utf8")); }
  catch (e) { errors.push(`content/${file}: not valid JSON (${e.message})`); continue; }

  let code = banner(name);
  if (name === "site") {
    if (obj.mapsQuery) {
      obj.mapsDirections = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(obj.mapsQuery);
      obj.mapsEmbed = "https://www.google.com/maps?q=" + encodeURIComponent(obj.mapsQuery) + "&output=embed";
    } else warns.push("content/site.json: mapsQuery is empty, so there are no directions or map links.");
    for (const [slot, img] of Object.entries(obj.images || {})) if (img && img.src && !img.alt) warns.push(`content/site.json: photo "${slot}" has no alt text.`);
    code += `window.SITE = ${JSON.stringify(obj, null, 2)};\n`;
  } else {
    if (Array.isArray(obj.items) && Array.isArray(obj.categories)) {
      const cats = new Set(obj.categories.map((c) => c.id)), seen = new Set();
      if (cats.size !== obj.categories.length) errors.push(`content/${file}: duplicate or missing category ids.`);
      obj.items.forEach((it, i) => {
        const label = `content/${file}: item ${i + 1}${it && it.name ? ` (${it.name})` : ""}`;
        if (!it || !it.name) errors.push(`${label}: missing name.`);
        if (!it.id || seen.has(it.id)) errors.push(`${label}: missing or duplicate id.`); else seen.add(it.id);
        if (!cats.has(it.category)) errors.push(`${label}: category "${it.category}" does not exist.`);
        if (it.price !== undefined && !(Number.isFinite(it.price) && it.price >= 0)) errors.push(`${label}: price must be a number.`);
      });
    }
    for (const [k, v] of Object.entries(obj)) code += `window.${name.toUpperCase()}_${snake(k)} = ${JSON.stringify(v, null, 2)};\n`;
  }
  outputs.push([path.join(DATA, name + ".js"), code, name]);
}

const cfg = path.join(ROOT, "admin", "config.yml");
if (fs.existsSync(cfg) && /OWNER\/REPO/.test(fs.readFileSync(cfg, "utf8"))) warns.push("admin/config.yml still contains OWNER/REPO. Replace it with the real GitHub repository before using /admin.");

warns.forEach((w) => console.warn("warning: " + w));
if (errors.length) { errors.forEach((e) => console.error("ERROR: " + e)); console.error("build-data: content is invalid; no data files were written."); process.exit(1); }
fs.mkdirSync(DATA, { recursive: true });
for (const [out, code, name] of outputs) {
  const prev = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : null;
  if (prev !== code) { fs.writeFileSync(out, code, "utf8"); console.log(`build-data: wrote data/${name}.js`); }
  else console.log(`build-data: data/${name}.js is up to date`);
}
