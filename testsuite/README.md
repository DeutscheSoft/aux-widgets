# Setup

Run `npm ci` once to install the test framework. For browser runs, also install
Chromium once:

```
npx playwright install chromium
```

# Running the testsuite

- `npm test` — run all tests under jsdom (CI / console)
- `npm run test:watch` — watch mode under jsdom
- `npm run test:browser` — run all tests in headless Chromium

Use `.only` on `describe` / `it` to focus individual tests in either mode.

# Matrix resize benchmark

Playwright harness that loads a large matrix (`bench/matrix_resize.html`),
resizes it, and prints a JSON report (frame times, SymResize invalidations,
sync `triggerResize` cost). Useful for comparing branches:

```
npm run bench:matrix-resize > /tmp/resize-$(git rev-parse --abbrev-ref HEAD).json
```

Defaults: 3840×2160 viewport, 500 groups × 12 ports, matrix ~3600×2000 with
±480px resize steps. Override with `MATRIX_RESIZE_*` env vars (see
`bench/matrix_resize.mjs`).
