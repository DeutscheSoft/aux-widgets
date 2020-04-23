import { MatrixData } from '../models/matrix.js';
import { assert, test, assert_error } from './helpers.js';

test('ListDataView', () => {
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

  const listview = matrix.createListDataView(4, null, sorter);

  let current_size = 0;

  listview.subscribeSize((size) => {
    current_size = size;
  });

  const check = () => {
    listview.check();
    assert(current_size === listview.size);
  };

  assert(listview.getSubtreeSize(group) === 4);
  assert(listview.getDepth(group) === 0);

  ports.forEach((port) => {
    assert(listview.getDepth(port) === 1);
  });

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


  {
    const size = listview.getSubtreeSize(group);

    const port5 = group.addPort({ label: 'port5' });

    check();
    assert(listview.getSubtreeSize(group) === size + 1);

    group.deletePort(port5);
    check();

    assert(listview.getSubtreeSize(group) === size);
  }

  {
    check();
    const group2 = group.addGroup({ label: 'group2' });
    check();
    assert(listview.getSubtreeSize(group) === 5);
    const port = group2.addPort({ label: 'port5' });
    check();
    assert(listview.getSubtreeSize(group) === 6);
    assert(listview.getDepth(port) == 2);
    group.deleteGroup(group2);
    check();
    assert(listview.getSubtreeSize(group) === 4);
  }

  {
    check();
    const group2 = group.addGroup({ label: 'group2' });
    check();
    const group3 = group2.addGroup({ label: 'group3' });
    check();
    group.deleteGroup(group2);
    check();

    assert_error(() => listview.getGroupInfo(group3));
    assert_error(() => listview.getGroupInfo(group2));

    assert(listview.getSubtreeSize(group) === 4);
  }

  {
    const tmp = [];

    const check_tmp = () => {
      let n = 0;
      listview.forEach((node) => {
        const startIndex = listview.startIndex;
        const endIndex = startIndex + listview.amount;
        if (n >= startIndex && n < endIndex)
        {
          const child = tmp[n - startIndex];
          //console.log('%d %o %o %o', n, node.label, child.label, node === child);
          assert(child === node);
        }
        n++;
      });

      check();
    };

    const sub = listview.subscribeElements((i, element) => {
      tmp[i - listview.startIndex] = element;
    });

    check_tmp();

    listview.setStartIndex(1);
    check_tmp();

    listview.setStartIndex(2);
    check_tmp();

    listview.setStartIndex(1);
    check_tmp();
    const group2 = group.addGroup({ label: 'group2' });
    check_tmp();
    const group3 = group2.addGroup({ label: 'group3' });
    check_tmp();
    group.deleteGroup(group2);

    sub();
  }

  listview.destroy();
});
