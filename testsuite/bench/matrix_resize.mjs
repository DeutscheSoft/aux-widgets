#!/usr/bin/env node
/*
 * Matrix resize cost harness (Playwright).
 *
 * Serves the repo root, opens the large matrix bench page, instruments from
 * the page, and prints a JSON report. Compare across branches:
 *
 *   npm --prefix testsuite run bench:matrix-resize > /tmp/resize-master.json
 *   # switch / rebase feature branch, then:
 *   npm --prefix testsuite run bench:matrix-resize > /tmp/resize-feature.json
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const REPO_ROOT = path.resolve(import.meta.dirname, '../..');
const BENCH_PATH = '/testsuite/bench/matrix_resize.html';

const FRAMES = Number(process.env.MATRIX_RESIZE_FRAMES || 90);
const SYNC_ROUNDS = Number(process.env.MATRIX_RESIZE_SYNC_ROUNDS || 200);
const GROUPS = Number(process.env.MATRIX_RESIZE_GROUPS || 500);
const PORTS = Number(process.env.MATRIX_RESIZE_PORTS || 12);
const AMOUNT = Number(process.env.MATRIX_RESIZE_AMOUNT || 160);
const VIEWPORT_WIDTH = Number(process.env.MATRIX_RESIZE_VIEWPORT_WIDTH || 3840);
const VIEWPORT_HEIGHT = Number(
  process.env.MATRIX_RESIZE_VIEWPORT_HEIGHT || 2160
);
// Element size oscillates around these values (px).
const BASE_WIDTH = Number(process.env.MATRIX_RESIZE_BASE_WIDTH || 3600);
const BASE_HEIGHT = Number(process.env.MATRIX_RESIZE_BASE_HEIGHT || 2000);
const DELTA = Number(process.env.MATRIX_RESIZE_DELTA || 480);

function contentType(filePath) {
  switch (path.extname(filePath)) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
    case '.mjs':
      return 'text/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.woff':
      return 'font/woff';
    case '.woff2':
      return 'font/woff2';
    case '.json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
}

function startStaticServer(root) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let filePath = path.join(root, urlPath);
    if (urlPath.endsWith('/')) filePath = path.join(filePath, 'index.html');

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(err.code === 'ENOENT' ? 404 : 500);
        res.end(String(err.message));
        return;
      }
      res.writeHead(200, {
        'Content-Type': contentType(filePath),
        'Cache-Control': 'no-store',
      });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port, origin: `http://127.0.0.1:${port}` });
    });
  });
}

/** Runs entirely in the page; keep self-contained (no imports). */
async function measureInPage({ frames, syncRounds, baseWidth, baseHeight, delta }) {
  const matrixEl = document.querySelector('aux-matrix');
  if (!matrixEl?.auxWidget) throw new Error('aux-matrix not ready');
  const matrix = matrixEl.auxWidget;

  function walk(w, acc = []) {
    acc.push(w);
    (w.children || []).forEach((c) => walk(c, acc));
    return acc;
  }

  const all = walk(matrix);
  const byName = {};
  for (const w of all) {
    const n = w.constructor.name;
    byName[n] = (byName[n] || 0) + 1;
  }

  const withResizeSubs = all.filter(
    (w) => w._resize_subscriptions && w._resize_subscriptions.length
  );
  const mode = withResizeSubs.length
    ? 'resize-subscriptions'
    : 'cascade-triggerResize';

  const resizeSubscribers = withResizeSubs.map((w) => ({
    name: w.constructor.name,
    className: (w.element?.className || '').toString().slice(0, 120),
  }));

  // --- continuous element resize -----------------------------------------
  const target = matrix.element;
  const prev = { width: target.style.width, height: target.style.height };
  target.style.boxSizing = 'border-box';
  target.style.width = baseWidth + 'px';
  target.style.height = baseHeight + 'px';
  void target.offsetWidth;
  // Let virtualization settle at the large size before timing.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  await new Promise((r) => setTimeout(r, 100));

  // Re-walk after settle — visible cell count may have grown.
  const allAfter = walk(matrix);
  const byNameAfter = {};
  for (const w of allAfter) {
    const n = w.constructor.name;
    byNameAfter[n] = (byNameAfter[n] || 0) + 1;
  }

  let symbolInvalidations = 0;
  const depCounts = new Map();
  const hooked = [];
  for (const w of allAfter) {
    const orig = w.invalidate;
    hooked.push([w, orig]);
    w.invalidate = function (dep) {
      if (typeof dep === 'symbol') {
        symbolInvalidations++;
        const key = dep.description || String(dep);
        depCounts.set(key, (depCounts.get(key) || 0) + 1);
      }
      return orig.call(this, dep);
    };
  }

  const frameTimes = [];
  const tResize0 = performance.now();
  await new Promise((resolve) => {
    let i = 0;
    let last = performance.now();
    function step(now) {
      if (i > 0) frameTimes.push(now - last);
      last = now;
      // Alternate between base±delta so amount / visible cells keep changing.
      const sign = i % 2 === 0 ? 1 : -1;
      const w = baseWidth + sign * delta + (i % 17);
      const h = baseHeight + sign * delta + (i % 13);
      target.style.width = w + 'px';
      target.style.height = h + 'px';
      void target.offsetWidth;
      i++;
      if (i < frames) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
  await new Promise((r) => setTimeout(r, 50));
  const tResize1 = performance.now();

  for (const [w, orig] of hooked) w.invalidate = orig;
  target.style.width = prev.width;
  target.style.height = prev.height;

  frameTimes.sort((a, b) => a - b);
  const sum = frameTimes.reduce((a, b) => a + b, 0);
  const pct = (p) =>
    frameTimes[
      Math.min(frameTimes.length - 1, Math.floor(p * (frameTimes.length - 1)))
    ] || 0;

  // --- sync invalidate microbench ----------------------------------------
  const subs = withResizeSubs.length ? withResizeSubs : [matrix];
  const N = syncRounds;
  const tree = walk(matrix);

  let t0 = performance.now();
  for (let i = 0; i < N; i++) for (const w of subs) w.triggerResize();
  let t1 = performance.now();
  const subscriberInvalidateMs = t1 - t0;

  t0 = performance.now();
  for (let i = 0; i < N; i++) for (const w of tree) w.triggerResize();
  t1 = performance.now();
  const fullTreeInvalidateMs = t1 - t0;

  await new Promise((r) =>
    requestAnimationFrame(() => requestAnimationFrame(r))
  );

  const topDeps = [...depCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([k, v]) => [k, v]);

  return {
    mode,
    config: window.__matrixBenchConfig || null,
    tree: {
      widgetsAtLoad: all.length,
      byNameAtLoad: byName,
      widgetsAtMeasure: allAfter.length,
      byNameAtMeasure: byNameAfter,
      resizeSubscribers: resizeSubscribers.length,
      resizeSubscriberDetails: resizeSubscribers,
    },
    continuousResize: {
      frames,
      baseWidth,
      baseHeight,
      delta,
      wallMs: +(tResize1 - tResize0).toFixed(1),
      avgFrameMs: frameTimes.length
        ? +(sum / frameTimes.length).toFixed(2)
        : null,
      p50FrameMs: +pct(0.5).toFixed(2),
      p95FrameMs: +pct(0.95).toFixed(2),
      maxFrameMs: frameTimes.length
        ? +frameTimes[frameTimes.length - 1].toFixed(2)
        : null,
      symbolInvalidations,
      symbolInvalidationsPerFrame: +(symbolInvalidations / frames).toFixed(2),
      topDeps,
    },
    syncInvalidate: {
      rounds: N,
      focusWidgets: subs.length,
      focusOnlyMs: +subscriberInvalidateMs.toFixed(2),
      focusPerCallUs: +(
        (subscriberInvalidateMs / (N * subs.length)) *
        1000
      ).toFixed(3),
      fullTreeMs: +fullTreeInvalidateMs.toFixed(2),
      fullTreeWidgets: tree.length,
      fullTreePerCallUs: +(
        (fullTreeInvalidateMs / (N * tree.length)) *
        1000
      ).toFixed(3),
      fullTreeVsFocus:
        subscriberInvalidateMs > 0
          ? +(fullTreeInvalidateMs / subscriberInvalidateMs).toFixed(1) + 'x'
          : null,
    },
  };
}

async function main() {
  const { server, origin } = await startStaticServer(REPO_ROOT);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
  });
  const page = await context.newPage();

  const client = await context.newCDPSession(page);
  await client.send('Network.setCacheDisabled', { cacheDisabled: true });

  const qs = new URLSearchParams({
    groups: String(GROUPS),
    ports: String(PORTS),
    amount: String(AMOUNT),
  });
  const url = `${origin}${BENCH_PATH}?${qs}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__matrixBenchReady === true, null, {
    timeout: 60000,
  });
  await page.waitForFunction(
    () => document.querySelector('aux-matrix')?.auxWidget,
    null,
    { timeout: 30000 }
  );
  await page.waitForTimeout(300);

  const results = await page.evaluate(measureInPage, {
    frames: FRAMES,
    syncRounds: SYNC_ROUNDS,
    baseWidth: BASE_WIDTH,
    baseHeight: BASE_HEIGHT,
    delta: DELTA,
  });

  console.log(JSON.stringify(results, null, 2));

  await browser.close();
  server.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
