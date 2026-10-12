# SEO guide: KBR Cafe Restro & Bar

This explains what the site already does for search, what is still missing, and the steps you must do yourself in Google Search Console. Nothing here guarantees indexing, rankings or traffic. Google decides that, and it can take days or weeks.

## What is already built in

- **Unique titles and descriptions** on both pages, with the business name and "Budhabare" (and "Koshi Province" on the menu page).
- **One H1 per page** with sensible H2/H3 order, semantic landmarks (`header`, `nav`, `main`, `section`, `address`, `footer`), skip link and labelled navigation.
- **Local business structured data (JSON-LD)** using only verified details: name, address, phone, price range, map link. No ratings, reviews, hours, coordinates or social accounts are included because none are verified for markup.
- **Local content:** address, phone and directions on every page, a "Good to know" section answering real questions, and the Plus Code P3C2+32.
- **Open Graph / Twitter tags** and a 1200×630 share image (`og-image.jpg`).
- **Crawlable content:** all headings and copy are plain HTML. The menu is drawn by JavaScript, so see "Menu" below.
- **Performance basics:** no heavy libraries, lazy-loaded photos, `fetchpriority` on the hero photo, size hints supported (`srcset`, `sizes`, `width`, `height` in `data/site.js`).
- **`robots.txt`** that allows everything, and `netlify.toml` that keeps helper files (`/tools`, `README.md`, `SEO.md`) out of search results.
- **No redirects.** Netlify serves both `/menu` and `/menu.html`; the canonical tag tells Google which one to use (`/menu.html`, and `/` for the homepage).

## The production domain (important)

Canonical URLs, `og:url`, `og:image`, the XML sitemap and the `Sitemap:` line in `robots.txt` all need your **real domain**. I did not invent one, so they are generated once it is known by `tools/seo-build.mjs`:

- **Deploy from Git (GitHub/GitLab) on Netlify:** nothing to do. `netlify.toml` runs `build-data` and then the SEO script on every deploy and Netlify supplies your primary domain (a `*.netlify.app` address first, your custom domain once you set it as primary). To force a specific domain, set an environment variable `SITE_URL` (for example `https://www.yourdomain.com`) in Netlify under Site configuration, Environment variables.
- **Drag-and-drop deploy:** no build runs, so run it yourself first (needs Node.js installed): `node tools/build-data.mjs` and `node tools/seo-build.mjs https://your-real-domain.com`, then deploy the folder.
- Or send me the domain and I will apply it.

Check the result any time with `node tools/seo-check.mjs`.

## Menu: sample versus real

While the menu is marked SAMPLE (`isSample: true` in `content/menu.json`), the menu is **not** pre-rendered into the HTML, so invented dishes and prices cannot appear in search results. After you enter the real menu and untick the sample box, the build script writes a static copy of the menu into `menu.html` for search engines. (The JavaScript menu still works as before.) If you deploy by drag-and-drop, run `node tools/build-data.mjs` and then `node tools/seo-build.mjs` after editing the menu.

## What is still missing from you

1. **The production domain** (and whether to use `www`).
2. **Real photos** (a hero photo, the dining space, food, drinks). Add them in `/admin` (Business details, Photos) or `content/site.json` with honest alt text describing each photo. Compress them first with squoosh.app (WebP, about 1600px wide for the hero and 1000px for others, under about 200 KB each).
3. **The real menu and prices** (edit in `/admin`, Menu, or `content/menu.json`), then untick "This menu is still SAMPLE data".
4. **Opening hours.** When confirmed, add them to the Visit section and footer, and add `openingHours` (or `openingHoursSpecification`) to the JSON-LD in `index.html`.
5. **Verified social links and WhatsApp number** (optional). Add social links to the footer and `sameAs` in the JSON-LD.
6. **A Google Business Profile** (see below), and confirmation that the name, address and phone match exactly.

## Google Search Console (you do this manually)

Do this after the site is live on the real domain.

1. Go to **search.google.com/search-console** and sign in with the Google account that should own the site.
2. **Add property.** Two choices:
   - **Domain property** (recommended): enter `yourdomain.com`. Covers http/https and www/non-www. Verify by adding a **DNS TXT record** Google gives you at wherever the domain's DNS is managed (your registrar, or Netlify DNS under Domains if Netlify manages it). DNS changes can take a while to apply.
   - **URL-prefix property:** enter the full address, for example `https://www.yourdomain.com/`. Verify by one of: uploading Google's HTML file to the site root and redeploying; pasting the `google-site-verification` meta tag in `index.html` where the comment in `<head>` says; or DNS.
3. Click **Verify**. Keep the verification method in place permanently.
4. Open **Indexing → Sitemaps**, enter `sitemap.xml` and press **Submit**. The status should become "Success". (If it fails, open `https://your-domain/sitemap.xml` in a browser to confirm it loads.)
5. Open **URL Inspection**, paste your homepage address, and if it says the page is not on Google use **Request indexing**. Do the same for `/menu.html`. This asks Google to look; it does not guarantee inclusion.
6. After several days check **Indexing → Pages** for problems, and the **Enhancements** section for structured-data warnings.
7. Optional: **Bing Webmaster Tools** can import your site straight from Search Console.

## Google Business Profile (the biggest local lever)

For a restaurant, a verified Google Business Profile usually matters as much as the website for "near me" searches. Claim or create it at business.google.com, verify it, then:

- Make the **name, address and phone exactly match** the website: KBR Cafe Restro & Bar, P3C2+32, Budhabare, Koshi Province 57200, 976-8440060.
- Add the website link, correct categories (for example cafe, restaurant, bar), real photos and confirmed opening hours.
- Ask real customers for honest reviews. Never buy or fake reviews.

## Keep checking

Run `node tools/seo-check.mjs` after any change. It lists titles, descriptions, headings, canonicals, image alt text, broken links, JSON-LD and the sitemap. It checks your files only. It cannot tell you whether you are indexed or how you rank; only Search Console can show that.

## Photos and SEO
The site currently uses illustrative stock photos (Unsplash) with honest alt text that says they are not KBR. Replace them with real photos of KBR as soon as possible: real photos build trust, and descriptive alt text on them helps image search. Keep every photo's alt text accurate.
