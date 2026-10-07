/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { DebounceTimer } from '../src/index.js';
import { assertEqual } from './helpers.js';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

describe('DebounceTimer', () => {
  it('runs immediately on the first trigger (leading)', () => {
    let n = 0;
    const t = new DebounceTimer(() => {
      n++;
    }, 50);
    t.trigger();
    assertEqual(n, 1);
    t.destroy();
  });

  it('coalesces triggers within the delay into one trailing run', async () => {
    let n = 0;
    const t = new DebounceTimer(() => {
      n++;
    }, 40);

    t.trigger();
    assertEqual(n, 1);

    t.trigger();
    t.trigger();
    t.trigger();
    assertEqual(n, 1);

    await sleep(80);
    assertEqual(n, 2);
    t.destroy();
  });

  it('runs leading again after the delay since the last run', async () => {
    let n = 0;
    const t = new DebounceTimer(() => {
      n++;
    }, 40);

    t.trigger();
    assertEqual(n, 1);

    await sleep(60);
    t.trigger();
    assertEqual(n, 2);

    t.destroy();
  });

  it('rejects a non-positive delay', () => {
    let threw = false;
    try {
      new DebounceTimer(() => {}, 0);
    } catch (err) {
      threw = err instanceof TypeError;
    }
    assertEqual(threw, true);
  });

  it('destroy() cancels a pending trailing run', async () => {
    let n = 0;
    const t = new DebounceTimer(() => {
      n++;
    }, 40);

    t.trigger();
    assertEqual(n, 1);
    t.trigger();
    assertEqual(n, 1);

    t.destroy();
    await sleep(80);
    assertEqual(n, 1);
  });

  it('uses time since last run, not only whether a timer is installed', async () => {
    let n = 0;
    const t = new DebounceTimer(() => {
      n++;
    }, 50);

    t.trigger();
    assertEqual(n, 1);

    // Within the window: coalesced (no immediate second run).
    await sleep(20);
    t.trigger();
    assertEqual(n, 1);

    // After enough time since the leading run, the next trigger is leading
    // again even if a trailing timer might still be around.
    await sleep(40);
    t.trigger();
    assertEqual(n, 2);

    t.destroy();
    await sleep(80);
    // destroy cancelled any trailing from the last coalesced period
    assertEqual(n, 2);
  });
});
