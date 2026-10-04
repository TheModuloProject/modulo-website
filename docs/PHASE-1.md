# Phase 1: visual direction

## Audit

The original repository contained a static index, stylesheet, global cursor script, canvas modulo visual and three images. It had no package manifest, application framework, build pipeline or tests. Agency positioning included strategy, editorial identity and launch campaigns. Navigation pointed at conventional full-page sections. The global pointer script updated layout properties and the canvas ran an ongoing animation.

The new entry point preserves the static stack and replaces all rendered positioning with websites, web applications and custom software for UAE businesses. Previous images and `modulo-orbit.js` remain in the source workspace for reference, but are neither loaded nor included in the production build.

## Direction

- An oversized, asymmetric wordmark establishes scale; the chrome modulo operator occupies the space left by the shorter second line.
- Warm ivory and cobalt are precise and editorial. Dark mode layers gunmetal, graphite and flowing indigo shapes behind cool silver typography.
- The modulo metaphor appears as structured alignment, repetition, a remainder in the composition and the percent operator used for modulo in programming.
- The mobile layout integrates the operator into the wordmark, then places the proposition, readable service description and enquiry actions below it.
- Motion is finite: masked title entrance for orientation, link/icon movement for feedback, circular theme transformation for orientation. No constant animation loop.

References informed principles, not copied layouts: [Uzzy](https://www.uzzy.studio/), [Core-A](https://www.coreastudios.com/), [Artemii Lebedev](https://artemiilebedev.com/), [Pear](https://pear.no/), [Monolog](https://bymonolog.com/).

The marbled reference mentioned in the brief was not attached or present in the workspace. The current material treatment is an original gradient/SVG approximation that can be tuned against the reference later.

## Interaction

The theme is initialized before the stylesheet, avoiding a wrong-theme first paint. It follows the system preference until explicitly selected, then persists in localStorage. Cross-tab changes synchronize. A 760ms circular View Transition begins at the toggle's centre and reaches the viewport's furthest corner. Browsers without View Transitions interpolate colors and material opacity over the same duration. Reduced motion makes the change immediate and removes entrance/menu motion. This implementation follows the [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using).

Mobile/tablet navigation uses a native modal dialog, custom reveal, scroll lock, focus containment, Escape dismissal and focus restoration. Resizing to desktop closes the menu. All active controls have at least a 44px target height.

Later navigation destinations are disabled until their content exists. Project enquiry uses the existing mailto address. The review build contains only the hero and navigation; no unapproved sections were implemented.

## Verification

Final measurements and screenshot references are recorded in `QA.md`. Lighthouse scores are local lab results, not claims about deployed performance. A hosted production check is needed once the full site and hosting are ready.

## Review refinement

Removed all directional arrows, geographic coordinates, decorative indexes, status/location labels, operator caption, peripheral philosophy copy, repeated service labels and the selected-work boundary slogans. Navigation and actions now use readable body typography. The hero contains the wordmark, proposition, one description and the project/work actions. The mobile menu contains its navigation and project action without numbering or extra slogans.
