# KBR Cafe Restro & Bar — website

A two-page static website (plain HTML, CSS and JavaScript) for **KBR Cafe Restro & Bar**, P3C2+32, Budhabare, Koshi Province 57200, Nepal. Ready to deploy on Netlify, with a CMS set up so the owner can edit content in a browser.

- `index.html` — homepage (hero, intro, three moods, menu preview, experience, why visit, FAQ, location, final call to action)
- `menu.html` — menu with working category filters, search and a clear empty state
- `admin/` — the CMS (Decap CMS). **It works only after the one-time setup in `CMS.md`.**
- `SEO.md` — SEO guide, domain step and Google Search Console steps. `CMS.md` — CMS setup and owner guide.

## Run it locally
Open `index.html`, or serve the folder (recommended): `python3 -m http.server 8000`, then visit http://localhost:8000

## What is real and what is a placeholder
| Item | Status |
|---|---|
| Name, address (Plus Code P3C2+32), phone 976-8440060, NPR 500–1,000 average spend, Google rating 4.3 (15 reviews) | Provided by the owner, used as given |
| Directions and map | Built from the Plus Code. **Check the pin once** on Google Maps before launch |
| **Menu items and prices** | **SAMPLE.** Every row is tagged "Sample" until you confirm the real menu |
| **Photos** | **Illustrative stock photos from Unsplash, not KBR.** Alt text says so, a footer note says so, and some images carry a "Stock photo" tag. Replace with real KBR photos |
| Opening hours | Not provided. Pages say "please call to confirm" |
| Social links, WhatsApp, reviews, awards, history | Not provided, so not shown |

If a stock photo fails to load, that spot falls back to the built-in placeholder artwork.

## Editing content
Content lives in `content/site.json` (business details, photos) and `content/menu.json` (menu). Two ways to edit:
1. **With the CMS at `/admin`** (after the setup in `CMS.md`): edit in forms, press Publish; Netlify rebuilds the site.
2. **By hand:** edit the JSON, run `node tools/build-data.mjs` (it checks your edits and regenerates `data/site.js` and `data/menu.js`), then deploy. Do not edit the files in `data/` directly; they are generated.

### Replace the stock photos
Upload real photos in `/admin` (Business details, Photos) or put files in `assets/uploads/` and set the `src` and `alt` of each slot in `content/site.json`. Compress photos first (squoosh.app, about 1600px wide for the hero, under about 200 KB). Untick **"Photos are still stock images"** once all are real; the stock notes disappear.

### Optional extras (only if the owner confirms them)
Opening hours, WhatsApp number (digits with country code), verified social links and a "Reserve a table" label if KBR takes reservations. Add hours to the Visit section and the JSON-LD in `index.html` by hand.

## Deploy on Netlify
1. **Recommended:** push this folder to GitHub, then on Netlify choose Add new site, Import an existing project. `netlify.toml` sets everything and runs `node tools/build-data.mjs && node tools/seo-build.mjs` on each deploy.
2. **Drag-and-drop** also works but runs no build: first run `node tools/build-data.mjs` and `node tools/seo-build.mjs https://your-real-domain.com` (needs Node.js).
3. Follow `CMS.md` for the admin login and `SEO.md` for Google Search Console.

## Stock photo sources (Unsplash, free to use; attribution not required but credited here)
| Where | Photo page |
|---|---|
| Hero (dining area with string lights) | https://unsplash.com/photos/restaurant-with-lighted-string-lights-L2ost-ZEmK8 |
| Intro 1 (cup and saucer) | https://unsplash.com/photos/white-ceramic-cup-with-saucer-on-brown-wooden-table-_hnL_961xTk |
| Intro 2 (three plates) | https://unsplash.com/photos/three-plates-of-asian-food-on-wood-table--YHSwy6uqvk |
| Cafe panel (cappuccino) | https://unsplash.com/photos/cappuccino-cup-UMUCQcDdLws |
| Restaurant panel (bowl) | https://unsplash.com/photos/vegetable-and-meat-on-bowl-kcA-c3f_3FE |
| Bar panel (filament bulbs at bar) | https://unsplash.com/photos/turned-on-filament-bulb-lights-at-bar-counter-Zrp9b3PMIy8 |
| Cafe card (cup in coffee beans) | https://unsplash.com/photos/coffee-beans-with-white-cup-S8daAB_nJSg |
| Restaurant card (grilled meat) | https://unsplash.com/photos/grilled-meat-and-vegetable-on-the-table-UC0HZdUitWY |
| Snacks card (sandwich) | https://unsplash.com/photos/sandwich-with-boiled-egg-fdlZBWIP0aM |
| Beverages card (iced coffee) | https://unsplash.com/photos/pouring-cream-into-iced-coffee-F0Wd4djYvSA |
| Bar card (bottle shelf) | https://unsplash.com/photos/brown-wooden-shelf-with-bottles-Lwx-q6OdGAc |
| Atmosphere 1 (rustic cafe interior) | https://unsplash.com/photos/rustic-cafe-interior-with-wooden-furniture-xhKG01FN2uk |
| Atmosphere 2 (table with candles) | https://unsplash.com/photos/a-table-with-plates-and-candles-in-a-restaurant-wO5DwEoyKjI |
| Menu page (pizza) | https://unsplash.com/photos/pizza-on-chopping-board-MqT0asuoIcU |

## Files
```
index.html  menu.html  og-image.jpg  robots.txt  netlify.toml  README.md  SEO.md  CMS.md
admin/index.html  admin/config.yml          (CMS)
content/site.json  content/menu.json       (edit these, or use /admin)
data/site.js  data/menu.js                 (generated, committed)
css/styles.css  js/main.js  js/art.js
tools/build-data.mjs  tools/seo-build.mjs  tools/seo-check.mjs
assets/favicon.svg  assets/apple-touch-icon.png  assets/uploads/
```
