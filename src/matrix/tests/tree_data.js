import { MatrixData } from '../models/matrix.js';
import { assert, test } from './helpers.js';

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

    for (let i = 0; i < tmp.length; i++)
    {
      assert(tmp[i] === ports[i]);
    }
  }

  {
    try
    {
      group.addPort(ports[0]);
      assert(false);
    }
    catch (e) {}
  }

  ports.forEach((port) => group.deletePort(port));
  group.forEachNode((node) => { assert(false, 'Should be empty.'); });
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

  assert(tmp.size == 1);
  assert(tmp.has(port1));

  const port2 = group.addPort({ label: 'port2' });

  assert(tmp.size == 2);
  assert(tmp.has(port2));

  const port3 = group.addPort({ label: 'port3' });

  assert(tmp.size == 3);
  assert(tmp.has(port3));

  const port4 = group.addPort({ label: 'port4' });

  assert(tmp.size == 4);
  assert(tmp.has(port4));

  // remove those ports
  group.deletePort(port4);

  assert(tmp.size == 3);
  assert(!tmp.has(port4));

  group.deletePort(port3);

  assert(tmp.size == 2);
  assert(!tmp.has(port3));

  group.deletePort(port2);

  assert(tmp.size == 1);
  assert(!tmp.has(port2));

  group.deletePort(port1);

  assert(tmp.size == 0);

  // unsubscribe
  sub();

  group.addPort({ label: 'port1' });
  assert(tmp.size == 0);
});
