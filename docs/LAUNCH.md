# Launch notes

The site is implemented and locally reviewable. It has not been published.

## Content

The studio name TheModuloProject, placeholder portfolio projects and email-draft enquiry flow were confirmed by the user. The Abu Dhabi stamp and geometric mark were supplied by the user. The mark has been reconstructed as scalable SVG geometry for clean rendering in both themes, the hero, favicon and social image.

Replace the three explicitly labeled studio concepts with verified client work when available. Their story pages are noindex and excluded from the sitemap until then. No fake project results, metrics or testimonials are present.

The canonical and sitemap origin is `https://themoduloproject.com`, retained from the initial implementation. Confirm the production domain and that the existing `hello@themoduloproject.com` mailbox is available when publishing. No messages have been sent.

## Privacy and terms

Public pages use TheModuloProject as requested. Their text describes local theme storage, an email draft prepared in the browser, correspondence if an enquiry is sent, and possible hosting logs. There are no analytics, advertising cookies or external embedded assets in the implementation. A user's email provider handles an email only when they choose to open and send it.

Refine service-provider and registered-entity details once those are established. The pages do not assert a legal-compliance certification, introduce invented corporate information or promise a fixed legal outcome. A separate project agreement defines scope, prices, schedule and project intellectual property.

Official background sources consulted for the privacy text:

- [UAE government data protection information](https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws.)
- [Federal Decree-Law No. 45 of 2021 concerning personal data protection](https://uaelegislation.gov.ae/en/legislations/1972/download)
- [Abu Dhabi Department of Economic Development privacy notice](https://www.added.gov.ae/en/privacy-notice)

These references informed the restrained request/contact wording. The policy principally documents implemented behavior.

## Deployment

Use `npm run build`, then deploy `dist/`. Generated `_headers` works on hosts that support it; `vercel.json` is also generated. Other hosts must apply the equivalent CSP and security headers. HTTPS should be enabled by the host. Rebuild after editing inline scripts or structured data so the generated CSP hashes remain accurate.

Run Lighthouse against the actual deployed URL and real infrastructure after launch. Local Lighthouse scores are lab measurements; field INP and real UAE-network LCP need real visitor measurements. Arabic interface readiness is described as a development capability; the website itself currently has English content only.
