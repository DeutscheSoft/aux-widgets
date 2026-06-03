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

  // auto_hold and top

  it('auto_hold > 0', async () => {
    const levelmeter = createMeter({ auto_hold: 100, show_hold: true });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('top'), 24);
    await delay(20);
    levelmeter.set('value', 0);
    assertEqual(levelmeter.get('top'), 24);
    await delay(200);
    assertEqual(levelmeter.get('top'), 0);
  });

  it('resetTop restarts auto_hold timer while top is above base', async () => {
    const levelmeter = createMeter({ auto_hold: 100, show_hold: true });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('top'), 24);
    await delay(20);
    levelmeter.resetTop();
    assertEqual(levelmeter.get('top'), 24);
    levelmeter.set('value', 0);
    await delay(200);
    assertEqual(levelmeter.get('top'), 0);
  });

  it('auto_hold=false stops timer', async () => {
    const levelmeter = createMeter({ auto_hold: 100, show_hold: true });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('top'), 24);
    await delay(20);
    levelmeter.set('auto_hold', false);
    levelmeter.set('value', 0);
    assertEqual(levelmeter.get('top'), 24);
    await delay(200);
    assertEqual(levelmeter.get('top'), 24);
  });

  it('resetting top restarts timer', async () => {
    const levelmeter = createMeter({ auto_hold: 100, show_hold: true });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('top'), 24);
    await delay(60);
    levelmeter.set('value', 25);
    assertEqual(levelmeter.get('top'), 25);
    levelmeter.set('value', 0);
    await delay(60);
    assertEqual(levelmeter.get('top'), 25);
    await delay(60);
    assertEqual(levelmeter.get('top'), 0);
  });

  it('auto_hold with falling keeps updating top until level reaches min', async () => {
    const levelmeter = createMeter({
      auto_hold: 100,
      show_hold: true,
      falling: 42,
      falling_duration: 1000,
      falling_init: 0,
    });

    levelmeter.set('value', 42);
    assertEqual(levelmeter.get('top'), 42);

    await delay(120);
    const topAfterFirstHold = levelmeter.get('top');
    assert(topAfterFirstHold < 42 && topAfterFirstHold > 0);

    await delay(1000);
    assertEqual(levelmeter.get('top'), 0);
  });

  it('auto_hold < 0', async () => {
    const levelmeter = createMeter({ auto_hold: -1, show_hold: true });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('top'), 24);
    await delay(20);
    levelmeter.set('value', 0);
    assertEqual(levelmeter.get('top'), 24);
    await delay(200);
    assertEqual(levelmeter.get('top'), 24);
  });

  it('auto_hold -1 updates top on new peak but never auto-resets downward', async () => {
    const levelmeter = createMeter({ auto_hold: -1, show_hold: true });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('top'), 24);
    levelmeter.set('value', 0);
    await delay(200);
    assertEqual(levelmeter.get('top'), 24);
    levelmeter.set('value', 30);
    assertEqual(levelmeter.get('top'), 30);
    await delay(200);
    assertEqual(levelmeter.get('top'), 30);
  });

  it('auto_hold -1 keeps top at peak while bar falls', async () => {
    const levelmeter = createMeter({
      auto_hold: -1,
      show_hold: true,
      falling: 42,
      falling_duration: 1000,
      falling_init: 0,
    });
    levelmeter.set('value', 42);
    assertEqual(levelmeter.get('top'), 42);
    await delay(1200);
    assertEqual(levelmeter.get('top'), 42);
  });

  it('auto_hold === false', async () => {
    const levelmeter = createMeter({ auto_hold: false, show_hold: true });
    levelmeter.set('top', 23);
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('top'), 23);
    await delay(20);
    levelmeter.set('value', 0);
    assertEqual(levelmeter.get('top'), 23);
    await delay(200);
    assertEqual(levelmeter.get('top'), 23);
  });

  it('show_hold === false', async () => {
    const levelmeter = createMeter({ auto_hold: 100, show_hold: false });
    levelmeter.set('top', 23);
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('top'), 23);
    await delay(20);
    levelmeter.set('value', 0);
    assertEqual(levelmeter.get('top'), 23);
    await delay(200);
    assertEqual(levelmeter.get('top'), 23);
  });

  // auto_hold and bottom

  it('auto_hold > 0', async () => {
    const levelmeter = createMeter({
      auto_hold: 100,
      show_hold: true,
      base: 30,
    });
    levelmeter.set('bottom', 30);
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('bottom'), 24);
    await delay(20);
    levelmeter.set('value', 25);
    assertEqual(levelmeter.get('bottom'), 24);
    await delay(200);
    assertEqual(levelmeter.get('bottom'), 25);
  });

  it('resetBottom restarts auto_hold timer while bottom is below base', async () => {
    const levelmeter = createMeter({
      auto_hold: 100,
      show_hold: true,
      base: 30,
    });
    levelmeter.set('bottom', 30);
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('bottom'), 24);
    await delay(20);
    levelmeter.resetBottom();
    assertEqual(levelmeter.get('bottom'), 24);
    levelmeter.set('value', 25);
    await delay(200);
    assertEqual(levelmeter.get('bottom'), 25);
  });

  it('auto_hold=false sbottoms timer', async () => {
    const levelmeter = createMeter({
      auto_hold: 100,
      show_hold: true,
      base: 30,
    });
    levelmeter.set('bottom', 30);
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('bottom'), 24);
    await delay(20);
    levelmeter.set('auto_hold', false);
    levelmeter.set('value', 23);
    assertEqual(levelmeter.get('bottom'), 24);
    await delay(200);
    assertEqual(levelmeter.get('bottom'), 24);
  });

  it('resetting bottom restarts timer', async () => {
    const levelmeter = createMeter({
      auto_hold: 100,
      show_hold: true,
      base: 30,
    });
    levelmeter.set('bottom', 30);
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('bottom'), 24);
    await delay(60);
    levelmeter.set('value', 23);
    assertEqual(levelmeter.get('bottom'), 23);
    levelmeter.set('value', 25);
    await delay(60);
    assertEqual(levelmeter.get('bottom'), 23);
    await delay(60);
    assertEqual(levelmeter.get('bottom'), 25);
  });

  it('auto_hold < 0', async () => {
    const levelmeter = createMeter({
      auto_hold: -1,
      show_hold: true,
      base: 30,
    });
    levelmeter.set('bottom', 30);
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('bottom'), 24);
    await delay(20);
    levelmeter.set('value', 25);
    assertEqual(levelmeter.get('bottom'), 24);
    await delay(200);
    assertEqual(levelmeter.get('bottom'), 24);
  });

  it('auto_hold -1 updates bottom on new value but never auto-resets upward', async () => {
    const levelmeter = createMeter({
      auto_hold: -1,
      show_hold: true,
      base: 30,
    });
    levelmeter.set('bottom', 30);
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('bottom'), 24);
    levelmeter.set('value', 28);
    await delay(200);
    assertEqual(levelmeter.get('bottom'), 24);
    levelmeter.set('value', 22);
    assertEqual(levelmeter.get('bottom'), 22);
    await delay(200);
    assertEqual(levelmeter.get('bottom'), 22);
  });

  it('auto_hold -1 keeps bottom at value while bar rises with falling', async () => {
    const levelmeter = createMeter({
      auto_hold: -1,
      show_hold: true,
      base: 30,
      falling: 30,
      falling_duration: 1000,
      falling_init: 0,
    });
    levelmeter.set('bottom', 30);
    levelmeter.set('value', 10);
    assertEqual(levelmeter.get('bottom'), 10);
    await delay(1200);
    assertEqual(levelmeter.get('bottom'), 10);
  });

  it('auto_hold === false', async () => {
    const levelmeter = createMeter({
      auto_hold: false,
      show_hold: true,
      base: 30,
    });
    levelmeter.set('bottom', 25);
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('bottom'), 25);
    await delay(20);
    levelmeter.set('value', 23);
    assertEqual(levelmeter.get('bottom'), 25);
    await delay(200);
    assertEqual(levelmeter.get('bottom'), 25);
  });

  it('show_hold === false', async () => {
    const levelmeter = createMeter({
      auto_hold: 100,
      show_hold: false,
      base: 30,
    });
    levelmeter.set('bottom', 25);
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('bottom'), 25);
    await delay(20);
    levelmeter.set('value', 23);
    assertEqual(levelmeter.get('bottom'), 25);
    await delay(200);
    assertEqual(levelmeter.get('bottom'), 25);
  });

  it('auto_hold with falling keeps updating bottom until level reaches base', async () => {
    const levelmeter = createMeter({
      auto_hold: 100,
      show_hold: true,
      base: 30,
      falling: 30,
      falling_duration: 1000,
      falling_init: 0,
    });

    levelmeter.set('bottom', 30);
    levelmeter.set('value', 10);
    assertEqual(levelmeter.get('bottom'), 10);

    await delay(120);
    const bottomAfterFirstHold = levelmeter.get('bottom');
    assert(bottomAfterFirstHold > 10 && bottomAfterFirstHold < 30);

    await delay(1000);
    assertEqual(levelmeter.get('bottom'), 30);
  });

  // peak_value handling
  it('peak_value > 0', async () => {
    const levelmeter = createMeter({ show_value: true, peak_value: 100 });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('value_label'), 24);
    await delay(20);
    levelmeter.set('value', 23);
    assertEqual(levelmeter.get('value_label'), 24);
    await delay(200);
    assertEqual(levelmeter.get('value_label'), 23);
  });

  it('resetValue restarts peak_value timer', async () => {
    const levelmeter = createMeter({ show_value: true, peak_value: 100 });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('value_label'), 24);
    await delay(20);
    levelmeter.resetValue();
    assertEqual(levelmeter.get('value_label'), 24);
    levelmeter.set('value', 23);
    await delay(200);
    assertEqual(levelmeter.get('value_label'), 23);
  });

  it('peak_value captures when value equals value_label', async () => {
    const levelmeter = createMeter({ show_value: true, peak_value: 100 });
    levelmeter.set('value_label', 24);
    levelmeter.set('value', 0);
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('value_label'), 24);
    await delay(20);
    levelmeter.set('value', 23);
    assertEqual(levelmeter.get('value_label'), 24);
    await delay(200);
    assertEqual(levelmeter.get('value_label'), 23);
  });

  it('peak_value with falling keeps updating value_label until level reaches min', async () => {
    const levelmeter = createMeter({
      show_value: true,
      peak_value: 100,
      falling: 42,
      falling_duration: 1000,
      falling_init: 0,
    });

    levelmeter.set('value', 42);
    assertEqual(levelmeter.get('value_label'), 42);

    await delay(120);
    const labelAfterFirstHold = levelmeter.get('value_label');
    assert(labelAfterFirstHold < 42 && labelAfterFirstHold > 0);

    await delay(1000);
    assertEqual(levelmeter.get('value_label'), 0);
  });

  it('peak_value=false resets timer', async () => {
    const levelmeter = createMeter({ show_value: true, peak_value: 100 });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('value_label'), 24);
    await delay(20);
    levelmeter.set('peak_value', false);
    assertEqual(levelmeter.get('value_label'), 24);
    levelmeter.set('value', 23);
    await delay(200);
    assertEqual(levelmeter.get('value_label'), 24);
  });

  it('resetting peak resets timer', async () => {
    const levelmeter = createMeter({ show_value: true, peak_value: 100 });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('value_label'), 24);
    levelmeter.set('value', 23);
    await delay(60);
    assertEqual(levelmeter.get('value_label'), 24);
    levelmeter.set('value', 25);
    assertEqual(levelmeter.get('value_label'), 25);
    levelmeter.set('value', 23);
    assertEqual(levelmeter.get('value_label'), 25);
    await delay(200);
    assertEqual(levelmeter.get('value_label'), 23);
  });

  it('peak_value < 0', async () => {
    const levelmeter = createMeter({ show_value: true, peak_value: -1 });
    levelmeter.set('value', 24);
    assertEqual(levelmeter.get('value_label'), 24);
    levelmeter.set('value', 23);
    assertEqual(levelmeter.get('value_label'), 24);
    await delay(200);
    assertEqual(levelmeter.get('value_label'), 24);
    levelmeter.set('value', 25);
    assertEqual(levelmeter.get('value_label'), 25);
    await delay(200);
    assertEqual(levelmeter.get('value_label'), 25);
  });

  it('peak_value -1 keeps value_label at peak while bar falls', async () => {
    const levelmeter = createMeter({
      show_value: true,
      peak_value: -1,
      falling: 42,
      falling_duration: 1000,
      falling_init: 0,
    });
    levelmeter.set('value', 42);
    assertEqual(levelmeter.get('value_label'), 42);
    await delay(1200);
    assertEqual(levelmeter.get('value_label'), 42);
  });

  it('peak_value !== false resets sync_value', async () => {
    const levelmeter = createMeter({});
    assertEqual(levelmeter.get('sync_value'), true);
    levelmeter.set('peak_value', -1);
    assertEqual(levelmeter.get('sync_value'), false);
    levelmeter.set('peak_value', false);
    assertEqual(levelmeter.get('sync_value'), false);
  });
});
