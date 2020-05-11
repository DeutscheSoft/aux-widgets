import { MatrixData } from '../models/matrix.js';
import { ConnectionDataView } from '../models/connectiondataview.js';
import { assert, test, assert_error } from './helpers.js';

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

    console.log('sorting %o and %o', labela, labelb);

    if (labela > labelb) return -1;
    if (labela === labelb) return 0;
    return 1;
  };

  const listview = matrix.createListDataView(4, null, sorter);

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

    for (let i = 0; i < 4; i++)
    {
      for (let j = 0; j < 4; j++)
      {
        assert(tmp[i][j] === void(0));
      }
    }

    const connection = matrix.connect(ports[2], ports[1]);

    console.log(tmp);

    assert(tmp[0][1] === connection);
  }

  connectionview.destroy();
});
