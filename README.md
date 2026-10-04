# TheModuloProject

A static, responsive development studio website for Abu Dhabi and the wider UAE. The existing HTML/CSS/JavaScript architecture is preserved, with shared build-time templates and no production dependencies.

## Run locally

```sh
npm install
npx playwright install chromium
npm run dev
```

Open http://127.0.0.1:3000. The server exposes public pages and assets only, including production-equivalent security headers. Browser verification uses Playwright’s bundled Chromium. Install it with `npx playwright install chromium`; optionally set `MODULO_BROWSER_PATH` to use another Chromium executable for tests and Lighthouse.

## Editing

- `scripts/generate-site.mjs`: page content, services, About, contact and legal copy.
- `scripts/site/shared.mjs`: shared header, mobile menu, logo, footer and metadata.
- `scripts/site/work.mjs`: the Invoiceit project, two studio concepts and their preview stories.
- `scripts/site/hero.html`: the approved homepage hero composition.
- `styles.css`: original design tokens, typography, hero, navigation and theme transitions.
- `pages.css`: editorial layouts, project previews, services, About, form, legal pages and mobile variants.
- `components/`: small reusable modules for navigation, finite motion, modulo, contact and concept interactions.

Run `npm run generate` after changing templates. `npm run build` also generates all pages automatically. Generated HTML remains readable without JavaScript; interaction controls require it.

## Verify and build

```sh
npm run check
npm test
node scripts/capture-pages.mjs
npm run audit
npm run build
```

Run these with the local server active. `npm run verify` runs these checks in sequence and refreshes the QA report. New page screenshots live in `docs/previews/pages/`.

Deploy `dist/` as a static site. The build outputs all 11 pages, self-hosted fonts, the supplied Abu Dhabi stamp (responsive AVIF/WebP), supplied logo geometry (SVG), and a social preview. It generates CSP script hashes and Netlify/Cloudflare-style `_headers`, plus a root Vercel configuration. Configure equivalent headers on other hosts. Source files, tests and development tooling are excluded from `dist/`.

## Site behavior

Light/dark preference follows the device until selected, then persists in `modulo-theme` local storage. The 760ms circular reveal uses the View Transitions API, with color interpolation as fallback and immediate changes for reduced motion. Mobile navigation is a native modal with bespoke reveal, keyboard wrapping and focus restoration.

About's modulo sequence loads when needed, uses a finite animation, stops when hidden and respects reduced motion. It resolves into the supplied geometric logo. No WebGL, large video, smooth-scroll library or perpetual animation loop is shipped.

The project form validates input and prepares an email draft. The visitor reviews the draft and uses “Open email draft” to open their email app, or copies the text. It sends no request to a backend and saves no form data. The address is `hello@themoduloproject.com`, retained from the original website.

Work presents Invoiceit, a live invoicing and business management application, with a user-supplied cover image, public login screenshots and an external link. Its project page is indexable and included in the sitemap. Fieldnotes and Interval remain clearly labeled studio concepts with illustrative previews; their story pages are `noindex` and excluded from the sitemap. No client results or performance metrics are claimed.

Privacy and Terms describe this actual site behavior under the studio name TheModuloProject. Hosting-specific information can be refined when a production host is chosen. See [launch notes](docs/LAUNCH.md) and [verification](docs/QA.md).
