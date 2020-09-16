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

import { Timer } from '../src/index.js';

function expectTimeout(t, cb) {
  return new Promise((resolve, reject) => {
    const now = performance.now();
    cb(() => {
      if (Math.abs(performance.now - now - t) > 5)
        reject(new Error('Bad Timeout'));
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
