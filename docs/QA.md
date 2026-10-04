# Website verification

Checked on 4 October 2026 with Playwright, axe-core and Lighthouse. The final complete browser run passed **64 applicable tests**; 12 duplicate or inapplicable scenarios were skipped. After refining Work heading order, link names and the responsive stamp, all six affected desktop/mobile accessibility and asset checks passed again. Syntax checks and the static production build passed.

## Mobile Lighthouse

The reports use simulated mobile settings on the local server. Audits ran without concurrent browser testing or screenshot capture.

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | Blocking time |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [/](audits/home-mobile.json) | 100 | 100 | 100 | 100 | 1.4 s | 0 | 20 ms |
| [/work/](audits/work-mobile.json) | 100 | 100 | 100 | 100 | 1.5 s | 0 | 0 ms |
| [/services/](audits/services-mobile.json) | 100 | 100 | 100 | 100 | 1.5 s | 0 | 0 ms |
| [/about/](audits/about-mobile.json) | 100 | 100 | 100 | 100 | 1.6 s | 0 | 0 ms |
| [/contact/](audits/contact-mobile.json) | 100 | 100 | 100 | 100 | 1.5 s | 0 | 0 ms |
| [/privacy/](audits/privacy-mobile.json) | 100 | 100 | 100 | 100 | 1.6 s | 0 | 0 ms |
| [/terms/](audits/terms-mobile.json) | 100 | 100 | 100 | 100 | 1.5 s | 0 | 0 ms |
| [/work/fieldnotes/](audits/work-fieldnotes-mobile.json) | 100 | 100 | 100 | 69 | 1.5 s | 0 | 0 ms |
| [/work/common-ground/](audits/work-common-ground-mobile.json) | 100 | 100 | 100 | 69 | 1.5 s | 0 | 0 ms |
| [/work/interval/](audits/work-interval-mobile.json) | 100 | 100 | 100 | 69 | 1.5 s | 0 | 0 ms |

The three placeholder concept stories intentionally use noindex, which reduces Lighthouse's SEO score. Their indexing restriction is deliberate; all seven main pages are indexable and included in the sitemap. Remove the restriction when replacing concepts with verified client case studies.

These local lab measurements do not establish field INP or production-host performance. Real visitor and UAE-network measurements, plus real iOS Safari/Android hardware testing, belong to the deployed site.

## Browser coverage

- Desktop 1440×960, tablet 834×1194, mobile 390×844 and compact mobile 320×700.
- All page routes, self-hosted assets, semantic headings, canonical metadata, internal links and legal navigation.
- WCAG A/AA checks across every page in both themes on desktop and mobile: no detected violations.
- Circular 760ms theme reveal, rapid-click protection, saved preference, system appearance changes, reduced motion and a forced API fallback.
- Mobile modal keyboard wrapping, Escape and close-button behavior, repeated opening, focus restoration and scroll unlock.
- Keyboard-operable service details, modulo input/remainder resolution, reduced-motion logo transition and touch-operable concept previews.
- Contact validation, safe encoding of draft text, fixed recipient, no POST request, no form persistence and a usable JavaScript-disabled fallback.
- Security headers, denied private/configuration files and unsupported HTTP methods.
- Hero layout sweep at 14 widths from 320 to 2560px, without overflow or title/mark/proposition overlap.

All 30 complete page captures across desktop, tablet and mobile recorded **CLS 0** and **no horizontal overflow**. [Measurements](pages-measurements.json). Each capture has a light and dark variant. The supplied stamp uses 160px/280px AVIF sources with WebP fallback and explicit dimensions; selected AVIF files are approximately 5KB and 16KB.

## Review images

| Page | Desktop light | Mobile light | Mobile dark |
| --- | --- | --- | --- |
| / | [Preview](previews/pages/desktop-home-light.webp) | [Preview](previews/pages/mobile-home-light.webp) | [Preview](previews/pages/mobile-home-dark.webp) |
| /work/ | [Preview](previews/pages/desktop-work-light.webp) | [Preview](previews/pages/mobile-work-light.webp) | [Preview](previews/pages/mobile-work-dark.webp) |
| /services/ | [Preview](previews/pages/desktop-services-light.webp) | [Preview](previews/pages/mobile-services-light.webp) | [Preview](previews/pages/mobile-services-dark.webp) |
| /about/ | [Preview](previews/pages/desktop-about-light.webp) | [Preview](previews/pages/mobile-about-light.webp) | [Preview](previews/pages/mobile-about-dark.webp) |
| /contact/ | [Preview](previews/pages/desktop-contact-light.webp) | [Preview](previews/pages/mobile-contact-light.webp) | [Preview](previews/pages/mobile-contact-dark.webp) |
| /privacy/ | [Preview](previews/pages/desktop-privacy-light.webp) | [Preview](previews/pages/mobile-privacy-light.webp) | [Preview](previews/pages/mobile-privacy-dark.webp) |
| /terms/ | [Preview](previews/pages/desktop-terms-light.webp) | [Preview](previews/pages/mobile-terms-light.webp) | [Preview](previews/pages/mobile-terms-dark.webp) |
| /work/fieldnotes/ | [Preview](previews/pages/desktop-work-fieldnotes-light.webp) | [Preview](previews/pages/mobile-work-fieldnotes-light.webp) | [Preview](previews/pages/mobile-work-fieldnotes-dark.webp) |
| /work/common-ground/ | [Preview](previews/pages/desktop-work-common-ground-light.webp) | [Preview](previews/pages/mobile-work-common-ground-light.webp) | [Preview](previews/pages/mobile-work-common-ground-dark.webp) |
| /work/interval/ | [Preview](previews/pages/desktop-work-interval-light.webp) | [Preview](previews/pages/mobile-work-interval-light.webp) | [Preview](previews/pages/mobile-work-interval-dark.webp) |

Tablet and desktop-dark variants are also in docs/previews/pages/. The live Chrome preview was inspected separately.
