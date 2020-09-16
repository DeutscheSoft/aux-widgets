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

import { Chart, Graph } from '../src/index.js';
import { waitForDrawn, assert, compare, objectMinus } from './helpers.js';

describe('Regressions', () => {
  it('#230', () => {
    const chart = new Chart();
    chart.addHandle();

    chart.set('show_handles', true);
  });

  it('#246', async () => {
    const chart = new Chart();
    const graph = new Graph({ dots: [] });

    chart.addChild(graph);

    await waitForDrawn(chart);
  });
});
