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

import { Knob } from '../src/index.js';
import { waitForDrawn, assertEqual } from './helpers.js';

describe('Knob', () => {
  it('destroy while dragging', async () => {
    const knob = new Knob();

    await waitForDrawn(knob);

    knob.svg.dispatchEvent(new CustomEvent('mousedown'));
    knob.destroy();
  });

  it('set() does not clamp', () => {
    const widget = new Knob({
      min: -2,
      max: 2,
      value: 10,
    });

    assertEqual(widget.get('value'), 10);
    widget.set('value', 7);
    assertEqual(widget.get('value'), 7);
  });
});
