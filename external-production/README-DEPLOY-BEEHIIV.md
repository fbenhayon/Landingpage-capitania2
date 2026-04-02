# Capitania External Production Landing (Beehiiv-Ready)

This folder contains a deploy-ready static landing page for external hosting.

## Files

- `index.html`: Main landing page.
- `styles.css`: Visual system and responsive layout.
- `app.js`: Beehiiv + CTA integration config.
- `assets/capa.jpg`: Hero image.

## 1) Configure Beehiiv in `app.js`

Edit the `CONFIG` object:

- `publicationUrl`: Your Beehiiv publication URL.
  - Example: `https://capitania.beehiiv.com`
- `beehiivIframeSrc`: Iframe src from your Beehiiv embedded subscribe form.
  - Example: `https://subscribe-forms.beehiiv.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- `beehiivEmbedScriptSrc`: Keep default unless Beehiiv changes it.
- `ndaFormUrl`: URL of your NDA/Data Room form.
- `contactEmail`: Investor support email.

## 2) Where to get `beehiivIframeSrc`

Inside Beehiiv:

1. Go to `Audience > Subscribe forms`
2. Open or create your form.
3. Click `Get embed code`.
4. Copy the `iframe src` value and paste into `CONFIG.beehiivIframeSrc`.

## 3) Deploy (Netlify / Vercel / Cloudflare Pages)

Deploy the entire `external-production` folder as a static site.

## 4) Hybrid model in practice

- This external page handles rich UI and scripts.
- Beehiiv handles subscriber capture and lifecycle.
- Newsletter pages in Beehiiv remain lightweight and link here.

## 5) Suggested next step

After deploy, update the CTA links in your Beehiiv posts/snippets to this external page URL.
