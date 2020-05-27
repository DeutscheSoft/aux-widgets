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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { MatrixData } from '../models/matrix.js';
import { ConnectionDataView } from '../models/connectiondataview.js';
import { assert, test, assertError } from './helpers.js';

test('ConnectionDataView basics', () => {
  const matrix = new MatrixData();

  const group = matrix.addGroup({ label: 'group1' });

  const ports = [
    group.addPort({ label: 'port1' }),
    group.addPort({ label: 'port2' }),
    group.addPort({ label: 'port3' }),
    group.addPort({ label: 'port4' }),
  ];

  // sort descending by label
  const sorter = (a, b) => {
    if (a === b) return 0;

    const labela = a.label;
    const labelb = b.label;

    if (labela > labelb) return -1;
    if (labela === labelb) return 0;
    return 1;
  };

  const listview = matrix.createVirtualTreeDataView(4, null, sorter);

  const connectionview = new ConnectionDataView(listview, listview);

  {
    // internals
    assert(connectionview.matrix.length === 4);
    assert(connectionview.rows.length === 4);
    assert(connectionview.columns.length === 4);

    connectionview.matrix.forEach((row) => {
      assert(row.length === 4);
    });

    listview.setAmount(3);

    assert(connectionview.matrix.length === 3);

    connectionview.matrix.forEach((row) => {
      assert(row.length === 3);
    });

    listview.setAmount(4);
  }

  {
    connectionview.rows.forEach((element, i) => {
      assert(listview.at(i) === element);
    });
    connectionview.columns.forEach((element, i) => {
      assert(listview.at(i) === element);
    });
  }

  {
    const tmp = [];

    connectionview.subscribeElements((i, j, connection) => {
      if (!tmp[i]) tmp[i] = [];

      tmp[i][j] = connection;
    });

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        assert(tmp[i][j] === void 0);
      }
    }

    const connection = matrix.connect(ports[2], ports[1]);

    assert(tmp[2][3] === connection);
    assert(tmp[3][2] === connection);
  }

  connectionview.destroy();
});
