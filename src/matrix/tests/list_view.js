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

  // sort descending by label
  const sorter = (a, b) => {
    const labela = a.label;
    const labelb = b.label;

    if (labela > labelb) return -1;
    if (labela === labelb) return 0;
    return 1;
  };

  const filter = (node) => true;
  const listview = matrix.createListDataView(4, filter, sorter);

  {
    const tmp = [];

    listview.forEach((node) => {
      if (!node.isGroup)
        tmp.push(node);
    });

    tmp.reverse();

    for (let i = 0; i < tmp.length; i++)
    {
      assert(tmp[i] === ports[i]);
    }
  }

  listview.destroy();
});
