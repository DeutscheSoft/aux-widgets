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

import { ProximityTimers, Timer } from '../src/index.js';

import { assertEqual } from './helpers.js';

function expectTimeout(t, cb) {
  return new Promise((resolve, reject) => {
    const now = performance.now();
    cb(() => {
      const elapsed = performance.now() - now;
      if (Math.abs(elapsed - t) > 10) {
        reject(new Error(`Bad Timeout: expected ~${t} ms, got ${elapsed.toFixed(1)} ms`));
        return;
      }
      resolve();
    });
  });
}

describe('Timers', () => {
  it('restart() with increasing time', () => {
    return expectTimeout(40, (cb) => {
      const t = new Timer(cb);
      t.restart(10);
      t.restart(20);
      t.restart(30);
      t.restart(40);
    });
  });
  it('restart() with decreasing time', () => {
    return expectTimeout(40, (cb) => {
      const t = new Timer(cb);
      t.restart(100);
      t.restart(80);
      t.restart(60);
      t.restart(40);
    });
  });
  it('restart() with both', () => {
    return expectTimeout(40, (cb) => {
      const t = new Timer(cb);
      t.restart(10);
      t.restart(20);
      t.restart(30);
      t.restart(40);
      t.restart(100);
      t.restart(80);
      t.restart(60);
      t.restart(40);
    });
  });
  it('stop()', (done) => {
    const t = new Timer(done);
    t.restart(40);
    setTimeout(() => {
      done();
      t.stop();
    }, 20);
  });
});

describe('ProximityTimers', () => {
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  it('scheduleAt() invokes the callback after the target time, not immediately', () => {
    const timers = new ProximityTimers();
    const delayMs = 60;
    return expectTimeout(delayMs, (cb) => {
      timers.scheduleAt(cb, performance.now() + delayMs);
    });
  });

  it('scheduleIn() invokes the callback after the offset', () => {
    const timers = new ProximityTimers();
    const delayMs = 60;
    return expectTimeout(delayMs, (cb) => {
      timers.scheduleIn(cb, delayMs);
    });
  });

  it('scheduleAt() runs every callback merged into the same proximity batch', async () => {
    const timers = new ProximityTimers(50);
    const ran = [];
    const base = performance.now() + 30;
    timers.scheduleAt(() => ran.push('a'), base);
    timers.scheduleAt(() => ran.push('b'), base + 10);
    timers.scheduleAt(() => ran.push('c'), base + 5);

    await sleep(120);
    assertEqual(ran, ['a', 'b', 'c']);
  });

  it('scheduleAt() uses separate batches when targets differ by at least accuracy', async () => {
    const accuracy = 25;
    const timers = new ProximityTimers(accuracy);
    const ran = [];
    const t0 = performance.now();
    timers.scheduleAt(() => ran.push(1), t0 + 40);
    timers.scheduleAt(() => ran.push(2), t0 + 40 + accuracy);

    await sleep(120);
    assertEqual(ran, [1, 2]);
  });

  it('scheduleAt() still runs later callbacks if an earlier one throws', async () => {
    const timers = new ProximityTimers(40);
    const ran = [];
    const base = performance.now() + 20;
    timers.scheduleAt(() => {
      ran.push('throw');
      throw new Error('first');
    }, base);
    timers.scheduleAt(() => ran.push('ok'), base + 5);

    await sleep(80);
    assertEqual(ran, ['throw', 'ok']);
  });

  it('scheduleAt() schedules a new timer after a previous batch has fired', async () => {
    const accuracy = 50;
    const timers = new ProximityTimers(accuracy);
    const ran = [];
    const anchor = performance.now() + 35;
    timers.scheduleAt(() => ran.push('first'), anchor);

    await sleep(120);

    timers.scheduleAt(() => ran.push('second'), anchor + 10);

    await sleep(80);
    assertEqual(ran, ['first', 'second']);
  });
});
