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
import { assert, test, assertError } from './helpers.js';

test('VirtualTreeDataView basics', () => {
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
    const labela = a.label;
    const labelb = b.label;

    if (labela > labelb) return -1;
    if (labela === labelb) return 0;
    return 1;
  };

  const virtualtreeview = matrix.createVirtualTreeDataView(4, null, sorter);

  let current_size = 0;

  virtualtreeview.subscribeSize((size) => {
    current_size = size;
  });

  const check = () => {
    virtualtreeview.check();
    assert(current_size === virtualtreeview.size);
  };

  assert(virtualtreeview.getSubtreeSize(group) === 4);
  assert(virtualtreeview.getDepth(group) === 0);

  ports.forEach((port) => {
    assert(virtualtreeview.getDepth(port) === 1);
  });

  {
    const tmp = [];

    virtualtreeview.forEach((node) => {
      if (!node.isGroup) tmp.push(node);
    });

    tmp.reverse();

    for (let i = 0; i < tmp.length; i++) {
      assert(tmp[i] === ports[i]);
    }
  }

  {
    let index = 0;
    virtualtreeview.forEach((node) => {
      assert(index === virtualtreeview.indexOf(node));
      index++;
    });
  }

  {
    const size = virtualtreeview.getSubtreeSize(group);

    const port5 = group.addPort({ label: 'port5' });

    check();
    assert(virtualtreeview.getSubtreeSize(group) === size + 1);

    group.deletePort(port5);
    check();

    assert(virtualtreeview.getSubtreeSize(group) === size);
  }

  {
    check();
    const group2 = group.addGroup({ label: 'group2' });
    check();
    assert(virtualtreeview.getSubtreeSize(group) === 5);
    const port = group2.addPort({ label: 'port5' });
    check();
    assert(virtualtreeview.getSubtreeSize(group) === 6);
    assert(virtualtreeview.getDepth(port) == 2);
    group.deleteGroup(group2);
    check();
    assert(virtualtreeview.getSubtreeSize(group) === 4);
  }

  {
    check();
    const group2 = group.addGroup({ label: 'group2' });
    check();
    const group3 = group2.addGroup({ label: 'group3' });
    check();
    group.deleteGroup(group2);
    check();

    assertError(() => virtualtreeview.getGroupInfo(group3));
    assertError(() => virtualtreeview.getGroupInfo(group2));

    assert(virtualtreeview.getSubtreeSize(group) === 4);
  }

  {
    const tmp = [];

    const check_tmp = () => {
      let n = 0;
      virtualtreeview.forEach((node) => {
        const startIndex = virtualtreeview.startIndex;
        const endIndex = startIndex + virtualtreeview.amount;
        if (n >= startIndex && n < endIndex) {
          const child = tmp[n - startIndex];
          //console.log('%d %o %o %o', n, node.label, child.label, node === child);
          assert(child === node);
        }
        n++;
      });

      check();
    };

    const sub = virtualtreeview.subscribeElements((i, element) => {
      tmp[i - virtualtreeview.startIndex] = element;
    });

    check_tmp();

    virtualtreeview.setStartIndex(1);
    check_tmp();

    virtualtreeview.setStartIndex(2);
    check_tmp();

    virtualtreeview.setStartIndex(1);
    check_tmp();
    const group2 = group.addGroup({ label: 'group2' });
    check_tmp();
    const group3 = group2.addGroup({ label: 'group3' });
    check_tmp();
    group.deleteGroup(group2);

    sub();
  }

  virtualtreeview.destroy();
});

test('VirtualTreeDataView.startIndex behavior', () => {
  const matrix = new MatrixData();

  const group1 = matrix.addGroup({ label: 'group1' });

  const ports1 = [
    group1.addPort({ label: 'port1' }),
    group1.addPort({ label: 'port2' }),
    group1.addPort({ label: 'port3' }),
    group1.addPort({ label: 'port4' }),
  ];

  const group2 = matrix.addGroup({ label: 'group2' });

  const ports2 = [
    group2.addPort({ label: 'port1' }),
    group2.addPort({ label: 'port2' }),
    group2.addPort({ label: 'port3' }),
    group2.addPort({ label: 'port4' }),
  ];

  const sorter = (a, b) => {
    const labela = a.label;
    const labelb = b.label;

    if (labela > labelb) return 1;
    if (labela === labelb) return 0;
    return -1;
  };

  const virtualtreeview = matrix.createVirtualTreeDataView(4, null, sorter);

  virtualtreeview.check();

  //console.log(virtualtreeview.list.map((n) => n.label));

  // step over first group + 1
  virtualtreeview.setStartIndex(6);

  const tmp = [];
  const sub = virtualtreeview.subscribeElements((i, element) => {
    tmp[i - virtualtreeview.startIndex] = element;
  });

  ports2.forEach((port, i) => {
    assert(tmp[i] === port);
  });

  {
    let removing = false;
    const tmp_sub = virtualtreeview.subscribeElements(() => {
      assert(!removing);
    });
    removing = true;
    matrix.deleteGroup(group1);
    removing = false;
  }

  assert(virtualtreeview.startIndex === 1);

  sub();
  virtualtreeview.destroy();
});

test('VirtualTreeDataView.setAmount', () => {
  const matrix = new MatrixData();

  const sorter = (a, b) => {
    const labela = a.label;
    const labelb = b.label;

    if (labela > labelb) return 1;
    if (labela === labelb) return 0;
    return -1;
  };

  const virtualtreeview = matrix.createVirtualTreeDataView(4, null, sorter);

  const group1 = matrix.addGroup({ label: 'group1' });

  const ports1 = [
    group1.addPort({ label: 'port1' }),
    group1.addPort({ label: 'port2' }),
    group1.addPort({ label: 'port3' }),
    group1.addPort({ label: 'port4' }),
  ];

  const group2 = matrix.addGroup({ label: 'group2' });

  const ports2 = [
    group2.addPort({ label: 'port1' }),
    group2.addPort({ label: 'port2' }),
    group2.addPort({ label: 'port3' }),
    group2.addPort({ label: 'port4' }),
  ];

  const tmp = [];
  const sub = virtualtreeview.subscribeElements((i, element) => {
    tmp[i - virtualtreeview.startIndex] = element;
  });

  virtualtreeview.setAmount(8);
  assert(tmp.length === 8);
});
