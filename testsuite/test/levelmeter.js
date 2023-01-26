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

import { LevelMeter } from '../src/index.js';
import { waitForDrawn, assert, assertEqual, delay } from './helpers.js';

describe('LevelMeter', () => {
  const createMeter = (options) => {
    return new LevelMeter({
      clipping: 23,
      min: 0,
      max: 42,
      ...options,
    });
  };

  it('auto_clip > 0 resets clip', async () => {
    // check that clip resets after 100ms
    const levelmeter = createMeter({ auto_clip: 100 });
    assertEqual(levelmeter.get('clip'), false);
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('clip'), true);
    await delay(120);
    assertEqual(levelmeter.get('clip'), false);
  });

  it('resetClip stops timer', async () => {
    // check that resetClip stops the timer
    const levelmeter = createMeter({ auto_clip: 100 });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('clip'), true);
    await delay(20);
    levelmeter.resetClip();
    assertEqual(levelmeter.get('clip'), false);
    levelmeter.set('clip', true);
    await delay(200);
    assertEqual(levelmeter.get('clip'), true);
  });

  it('auto_clip=false stops timer', async () => {
    // check that setting auto_clip to false stops the timer
    const levelmeter = createMeter({ auto_clip: 100 });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('clip'), true);
    await delay(20);
    levelmeter.set('auto_clip', false);
    assertEqual(levelmeter.get('clip'), true);
    await delay(200);
    assertEqual(levelmeter.get('clip'), true);
  });

  it('clipping again resets timer', async () => {
    const levelmeter = createMeter({ auto_clip: 100 });
    // check that setting value again to clipping resets the timer
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('clip'), true);
    await delay(60);
    levelmeter.set('value', 25);
    assertEqual(levelmeter.get('clip'), true);
    await delay(60);
    assertEqual(levelmeter.get('clip'), true);
    await delay(60);
    assertEqual(levelmeter.get('clip'), false);
  });

  it('auto_clip < 0', async () => {
    // check that auto_clip < 0 does not set the timer
    const levelmeter = createMeter({ auto_clip: -1 });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('clip'), true);
    await delay(200);
    assertEqual(levelmeter.get('clip'), true);
  });
});
