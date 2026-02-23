# JukaMedical — Production Readiness TODO

Code review findings, grouped by priority. No changes implemented yet.

---

## Critical (Breaks Functionality or Security)

- [x] **XSS via innerHTML** — `script.js` — **FIXED**
  Added `escapeHtml()` and `safeUrl()` helpers. Applied to all text fields and URL attributes
  across `TeamSection`, `ServicesSection`, and `TrainingsSection` templates.

- [x] **`Promise.all` fails silently** — `script.js` — **FIXED**
  Replaced `Promise.all` with `Promise.allSettled`. Each failed section now logs an error
  independently without blocking the other sections from rendering.

- [ ] **OG image & favicons missing** — `index.html:13,21-22` — **CONFIRMED MISSING**
  `/images/` only contains `team/` and `trainings/` subdirectories.
  `favicon.png`, `favicon.svg`, and `og-image.jpg` do not exist.
  Action needed: create and add these three files to `/images/`:
  - `favicon.png` — 32×32px or 64×64px site icon
  - `favicon.svg` — vector version of the site icon
  - `og-image.jpg` — 1200×630px image for social sharing (Facebook, Twitter cards)

---

## High Priority (Affects Real Users)

- [x] **Color contrast fails WCAG AA** — `styles.css` — **FIXED**
  Darkened `--color-sage-dark` from `#8fb872` (2.2:1 on white) to `#4a7030` (5.8:1 on white,
  4.8:1 on sage-light). Both pass WCAG AA. Raised `.footer__copyright` opacity from 0.35 to 0.6
  (now 5.9:1 on dark background).

- [x] **Touch targets too small** — `styles.css` — **FIXED**
  Changed `.team__social-link` from `width/height: 32px` to `min-width/min-height: 44px`.

- [x] **Image error listener race condition** — `script.js` — **FIXED**
  Added `applyFallback` named function + immediate call when `img.complete && img.naturalWidth === 0`.
  Covers the case where the image already failed before the listener was attached. Fixed in both
  `TeamSection` and `TrainingsSection`.

- [x] **No loading state or error message** — `script.js` — **FIXED**
  Each section now renders a `.section__loading` message before fetching and replaces it with
  `.section__error` if data fails to load. Added matching CSS styles for both states.

---

## Medium Priority (Polish & Correctness)

- [ ] **Hardcoded gradient colors in JS** — `script.js:558-565`
  Fallback gradients use hex values unrelated to the CSS variable system.
  Fix: move to `CONFIG.gradients` or derive from CSS custom properties.

- [ ] **Hardcoded colors in CSS** — `styles.css:834-842`
  `.trainings__level--intermediate` uses `#FFF3CD` / `#856404` outside the variable system.
  Fix: add `--color-warning-bg` / `--color-warning-text` to `:root`.

- [ ] **`aspect-ratio` without fallback** — `styles.css:514`
  Safari < 15 doesn't support `aspect-ratio`.
  Fix: wrap in `@supports (aspect-ratio: 1) { ... }` and add `padding-top` fallback outside.

- [ ] **Dead hero shape in CSS** — `styles.css:410`
  `.hero__shape--1 { display: none; }` — element and its CSS block serve no purpose.
  Fix: remove the element from HTML and its CSS rules.

- [ ] **Phone number format inconsistency** — `index.html:41` vs `177`
  JSON-LD uses `+48-22-123-4567`, visible HTML uses `+48 22 123 45 67`.
  Fix: use E.164 (`+48221234567`) in JSON-LD; use human-readable format in visible HTML only.

- [ ] **Sunday hours missing from opening hours** — `index.html:191-195`
  `<dl>` has Mon–Fri and Saturday but no Sunday entry — ambiguous for users.
  Fix: add `<dt>Sunday</dt><dd>Closed</dd>` (or actual hours).

---

## Low Priority (Code Quality / DX)

- [ ] **Duplicate inline SVG icons** — `index.html:167,174,181,188`
  Same SVG shapes repeated multiple times in HTML.
  Fix: define once as `<symbol>` in a hidden SVG sprite at top of `<body>`, reference with `<use href="#icon-phone">`.

- [ ] **Scroll offset hardcoded** — `script.js`
  Smooth scroll header offset is likely a magic number; breaks if header height changes.
  Fix: calculate at runtime: `document.querySelector('[data-header]').offsetHeight`.

- [ ] **`ScrollAnimator.refresh()` never called** — `script.js`
  The method exists but is never invoked after dynamic content renders, so dynamically added cards don't animate in.
  Fix: call `scrollAnimator.refresh()` at the end of `App.loadData()`.

---

## Verification Checklist (after fixes)

- [ ] Lighthouse audit → target 90+ on Performance, Accessibility, SEO
- [ ] WCAG contrast checker on all text/background combinations
- [ ] Disable images in browser → verify initials placeholders appear
- [ ] Throttle to Slow 3G → verify loading states and graceful degradation
- [ ] Test on real iOS Safari (aspect-ratio fallback, `dvh` unit)
- [ ] Validate structured data at https://validator.schema.org
