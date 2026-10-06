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
