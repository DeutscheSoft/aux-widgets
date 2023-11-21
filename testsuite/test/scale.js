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

import { Scale } from '../src/index.js';
import { waitForDrawn, assert, compare, objectMinus } from './helpers.js';

describe('Scale', () => {
  it('#306 - Infinite loop', async () => {
    // This combination of scales will trigger an infinite loop
    // in the scale rendering.
    const scale = new Scale({
      min: -50,
      max: -0,
      levels: [1, 5, 10],
      layout: 'right',
      scale: 'linear',
    });
    scale.setStyles({
      height: '200px',
      width: '50px',
    });

    await waitForDrawn(scale);
  });
});
