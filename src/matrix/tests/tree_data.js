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

import { MatrixData } from '../models/matrix.js';
import { assert, test, assertError } from './helpers.js';

test('Adding and removing ports', () => {
  const matrix = new MatrixData();

  const group = matrix.addGroup({ label: 'group1' });

  const ports = [
    group.addPort({ label: 'port1' }),
    group.addPort({ label: 'port2' }),
    group.addPort({ label: 'port3' }),
    group.addPort({ label: 'port4' }),
  ];

  {
    const tmp = [];

    group.forEachNode((node, path) => {
      tmp.push(node);

      assert(node === ports[path[0].index]);
    });

    for (let i = 0; i < tmp.length; i++) {
      assert(tmp[i] === ports[i]);
    }
  }

  {
    try {
      group.addPort(ports[0]);
      assert(false);
    } catch {}
  }

  ports.forEach((port) => group.deletePort(port));
  group.forEachNode((node) => {
    assert(false, 'Should be empty.');
  });
});

test('forEachAsync', () => {
  const matrix = new MatrixData();

  const group = matrix.addGroup({ label: 'group1' });

  const tmp = new Set();

  const sub = group.forEachAsync((node) => {
    tmp.add(node);
    return () => {
      tmp.delete(node);
    };
  });

  // add some ports
  const port1 = group.addPort({ label: 'port1' });

  assert(tmp.size === 1);
  assert(tmp.has(port1));

  const port2 = group.addPort({ label: 'port2' });

  assert(tmp.size === 2);
  assert(tmp.has(port2));

  const port3 = group.addPort({ label: 'port3' });

  assert(tmp.size === 3);
  assert(tmp.has(port3));

  const port4 = group.addPort({ label: 'port4' });

  assert(tmp.size === 4);
  assert(tmp.has(port4));

  // remove those ports
  group.deletePort(port4);

  assert(tmp.size === 3);
  assert(!tmp.has(port4));

  group.deletePort(port3);

  assert(tmp.size === 2);
  assert(!tmp.has(port3));

  group.deletePort(port2);

  assert(tmp.size === 1);
  assert(!tmp.has(port2));

  group.deletePort(port1);

  assert(tmp.size === 0);

  // unsubscribe
  sub();

  group.addPort({ label: 'port1' });
  assert(tmp.size === 0);
});

test('Connections', () => {
  const matrix = new MatrixData();
  const group = matrix.addGroup({ label: 'group1' });
  const port1 = group.addPort({ label: 'port1' });
  const port2 = group.addPort({ label: 'port2' });

  // adding and removing
  {
    const connection = matrix.connect(port1, port2);

    assertError(() => {
      matrix.connect(port1, port2);
    });

    matrix.deleteConnection(connection);

    assertError(() => {
      matrix.deleteConnection(connection);
    });
  }

  // connections are removed when ports are deleted
  {
    const connection = matrix.connect(port1, port2);

    group.deletePort(port1);

    assertError(() => {
      matrix.deleteConnection(connection);
    });

    group.addPort(port1);
  }

  {
    const port3 = group.addPort({ label: 'port3' });
    const con1 = matrix.connect(port1, port2);
    const con2 = matrix.connect(port1, port3);
    const tmp = [];

    matrix.forEachConnection((connection) => tmp.push(connection));

    assert(tmp.length === 2);
    assert(tmp.includes(con1));
    assert(tmp.includes(con2));

    matrix.deleteConnection(con1);
    matrix.deleteConnection(con2);

    tmp.length = 0;

    matrix.forEachConnection((connection) => tmp.push(connection));

    assert(tmp.length === 0);
  }
});

test('camelCase events are also emitted in snake_case', () => {
  const matrix = new MatrixData();
  const group = matrix.addGroup({ label: 'group' });
  const children = [];

  group.on('childAdded', (child) => children.push(['childAdded', child]));
  group.on('child_added', (child) => children.push(['child_added', child]));
  group.on('treeChanged', (node) => children.push(['treeChanged', node]));
  group.on('tree_changed', (node) => children.push(['tree_changed', node]));

  const port = group.addPort({ label: 'port' });

  assert(children.length === 4);
  assert(children[0][0] === 'childAdded' && children[0][1] === port);
  assert(children[1][0] === 'child_added' && children[1][1] === port);
  assert(children[2][0] === 'treeChanged' && children[2][1] === group);
  assert(children[3][0] === 'tree_changed' && children[3][1] === group);

  const props = [];

  port.on('propertyChanged', (name, value) => {
    props.push(['propertyChanged', name, value]);
  });
  port.on('property_changed', (name, value) => {
    props.push(['property_changed', name, value]);
  });
  port.set('label', 'renamed');
  assert(props.length === 2);
  assert(props[0][1] === 'label' && props[0][2] === 'renamed');
  assert(props[1][0] === 'property_changed' && props[1][2] === 'renamed');

  const added = [];

  matrix.on('connectionAdded', (connection) => {
    added.push(['connectionAdded', connection]);
  });
  matrix.on('connection_added', (connection) => {
    added.push(['connection_added', connection]);
  });

  const other = group.addPort({ label: 'other' });
  const connection = matrix.connect(port, other);

  assert(added.length === 2);
  assert(added[0][1] === connection);
  assert(added[1][0] === 'connection_added' && added[1][1] === connection);
});
