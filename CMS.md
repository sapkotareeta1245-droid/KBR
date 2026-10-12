# Content management (Decap CMS) — KBR Cafe Restro & Bar

This site includes a real, working CMS setup, but it only starts working after the one-time setup below (a GitHub repository, a free GitHub OAuth app and Netlify). Until then `/admin` will load but cannot sign in. Nothing here fakes saving: every edit is committed to your GitHub repository and Netlify rebuilds the site.

## How it fits together
- **`content/*.json`** is what the CMS edits (business details, menu or catalog).
- **`tools/build-data.mjs`** turns that JSON into `data/*.js`, which the pages read. Netlify runs it on every deploy. The generated files are also committed, so the site works even without a build.
- **`admin/index.html` + `admin/config.yml`** are the CMS. Visit `https://your-site/admin`. The admin page is set to noindex.
- Uploaded photos go to `assets/uploads/`.
- The CMS edits **content only**, not layout or design.

## One-time setup (about 20 minutes)
Menu labels in GitHub and Netlify change from time to time; if one is missing, check the current Decap CMS "GitHub backend" docs and Netlify's OAuth docs.

1. **Create a GitHub repository** and put this project in it (GitHub's "uploading an existing file" works, or use git).
2. **Edit `admin/config.yml`:** replace `OWNER/REPO` with your repository (for example `yourname/kbr-website`) and check `branch` matches the branch Netlify deploys. Commit.
3. **Netlify:** Add new site, Import an existing project, choose the repository. The build command and publish folder come from `netlify.toml`.
4. **GitHub OAuth app:** GitHub, Settings, Developer settings, OAuth Apps, New OAuth App. Homepage URL: your site address. Authorization callback URL: `https://api.netlify.com/auth/done`. Create it, copy the Client ID and generate a Client Secret.
5. **Netlify OAuth provider:** Site configuration, Access & security (older UI: Access control), OAuth, Install provider, GitHub, paste the Client ID and Secret.
6. **Open `https://your-site/admin`** and choose Login with GitHub.
7. **Give the owner access:** repository Settings, Collaborators, add the owner's GitHub account with write access. Remove access if they stop working with you.

Netlify Identity / Git Gateway is an older alternative that Netlify has been moving away from; this setup avoids it.

## For the owner: editing content
1. Go to `/admin` and log in with GitHub.
2. **Website content, Menu** (or Business details). Edit, add or delete items, upload photos (always fill in the alt text).
3. Press **Publish**. The site updates after Netlify finishes rebuilding, usually a minute or two.
4. When the real menu is complete, untick **"This menu is still SAMPLE data"**.
5. Only enter facts that are true (hours, phone, social links, prices).

## Testing locally (optional)
Run `npx decap-server` in the project folder, serve the folder (`python3 -m http.server 8000`), and open `http://localhost:8000/admin/`. Changes are written to your local files.

## Adapting the content model
`admin/config.yml` ships with Business details and a Menu. For other businesses duplicate the menu block and change fields: salon or clinic services (name, duration, price from), tuition or school courses (level, duration, fee), gym plans (name, price, inclusions) and schedule (day, time, class), consultancy destinations and services. Then add the matching JSON in `content/` (it becomes `window.<NAME>_<KEY>` in `data/<name>.js`) and render it in the page.

## Security notes
No passwords, tokens or API keys are stored in the site. Never paste the OAuth Client Secret anywhere except Netlify's provider form. The admin page and these helper files are marked noindex.
