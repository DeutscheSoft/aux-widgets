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

import { Panorama } from '../../src/index.js';
import { assert, assertEqual } from './utils/helpers.js';

describe('Panorama', () => {
  it('balance handle2 userset maps x to parent y', () => {
    const panorama = new Panorama({ mode: 'balance', x: -10, y: 0 });
    const userset = [];
    const useraction = [];

    panorama.on('userset', (key, value) => {
      userset.push([key, value]);
    });
    panorama.on('useraction', (key, value) => {
      useraction.push([key, value]);
    });

    panorama.handle2.userset('x', 25);

    assertEqual(panorama.get('y'), 25);
    assertEqual(panorama.get('x'), -10);
    assertEqual(panorama.handle2.get('x'), 25);
    assertEqual(panorama.handle1.get('y'), 25);
    assertEqual(userset, [['y', 25]]);
    assertEqual(useraction, [['y', 25]]);
  });

  it('balance handle2 userset y stays on the child', () => {
    const panorama = new Panorama({ mode: 'balance' });
    const userset = [];

    panorama.on('userset', (key, value) => {
      userset.push([key, value]);
    });

    panorama.handle2.userset('y', 12);

    assertEqual(panorama.get('y'), 0);
    assertEqual(panorama.handle2.get('y'), 12);
    assertEqual(userset, [['handle2.y', 12]]);
  });

  it('cancelled parent y userset leaves handle2 unchanged', () => {
    const panorama = new Panorama({ mode: 'balance', y: 4 });

    panorama.on('userset', (key) => {
      if (key === 'y') return false;
    });

    const applied = panorama.handle2.userset('x', 40);

    assertEqual(applied, false);
    assertEqual(panorama.get('y'), 4);
    assertEqual(panorama.handle2.get('x'), 4);
  });

  it('handle1 userset still delegates x and y', () => {
    const panorama = new Panorama({ mode: 'balance' });
    const userset = [];

    panorama.on('userset', (key, value) => {
      userset.push([key, value]);
    });

    panorama.handle1.userset('x', -8);
    panorama.handle1.userset('y', 6);

    assertEqual(panorama.get('x'), -8);
    assertEqual(panorama.get('y'), 6);
    assertEqual(panorama.handle1.get('x'), -8);
    assertEqual(panorama.handle2.get('x'), 6);
    assert(userset.length === 2);
    assertEqual(userset[0], ['x', -8]);
    assertEqual(userset[1], ['y', 6]);
  });
});
