import { typecheck_instance } from '../../utils/typecheck.js';
import {
  init_subscriptions, add_subscription, unsubscribe_subscriptions
} from '../../utils/subscriptions.js';
import { init_subscribers, add_subscriber, remove_subscriber, call_subscribers } from '../../utils/subscribers.js';
import { ListDataView } from './listdataview.js';
import { Events } from '../../events.js';
import { call_continuation_if } from './helpers.js';
import { GroupData } from './group.js';

// last argument will be a callback
function subscribe_many(apis, cb)
{
  const values = new Array(apis.length);
  const has_value = values.map(() => false);
  let has_all_values = false;
  let subscriptions = init_subscriptions();

  apis.map((api, i) => {
    return api((value) => {
      values[i] = value;
      if (!has_all_values)
      {
        has_value[i] = true;
        has_all_values = !has_value.includes(false);
        if (!has_all_values) return;
      }

      cb(...values);
    });
  }).forEach((sub) => {
    subscriptions = add_subscription(subscriptions, sub);
  });

  return () => {
    subscriptions = unsubscribe_subscriptions(subscriptions);
  };
}

function resize_array(array, length, create)
{
  while (array.length < length)
  {
    array.push(create ? create() : void(0));
  }

  if (array.length > length)
  {
    array.splice(length, array.length - length);
  }
}

function subtract_mod(a, b, n)
{
  let result = (a - b) % n;

  if (result < 0) result += n;

  return result;
}

export class ConnectionDataView extends Events
{
  _addSubscription(sub)
  {
    this.subscriptions = add_subscription(this.subscriptions, sub);
  }

  _notifyPair(row_element, column_element, connection)
  {
    const rows = this.rows;
    const columns = this.columns;
    const matrix = this.matrix;
    const subscribers = this.subscribers;

    const startIndex1 = this.startIndex1;
    const startIndex2 = this.startIndex2;

    const n = rows.indexOf(row_element);

    if (n === -1) return;

    const m = columns.indexOf(column_element);

    if (m === -1) return;

    matrix[n][m] = connection;

    let index1 = startIndex1 + subtract_mod(n, startIndex1, rows.length);
    let index2 = startIndex2 + subtract_mod(m, startIndex2, columns.length);

    call_subscribers(this.subscribers, index1, index2,
                     connection, row_element, column_element);
  }

  _lowRegisterConnection(row_element, column_element, connection)
  {
    let connections_for = this.connections.get(row_element);

    if (!connections_for)
    {
      this.connections.set(row_element, connections_for = new Map());
    }

    if (row_element instanceof GroupData || column_element instanceof GroupData)
    {
      let set = connections_for.get(column_element);

      if (!set)
      {
        connections_for.set(column_element, set = new Set());
      }

      set.add(connection);

      this._notifyPair(row_element, column_element, set);
    }
    else
    {
      connections_for.set(column_element, connection);

      this._notifyPair(row_element, column_element, connection);
    }
  }

  _lowUnregisterConnection(row_element, column_element, connection)
  {
    let connections_for = this.connections.get(row_element);

    if (connections_for === void(0)) return;

    if (row_element instanceof GroupData || column_element instanceof GroupData)
    {
      let set = connections_for.get(column_element);

      if (set === void(0)) return;

      set.delete(connection);

      if (set.size === 0)
      {
        connections_for.delete(column_element);
        set = void(0);
      }

      this._notifyPair(row_element, column_element, set);
    }
    else
    {
      connections_for.delete(column_element);
      this._notifyPair(row_element, column_element, void(0));
    }

    if (connections_for.size === 0)
    {
      this.connections.delete(row_element);
    }
  }

  _forOrderedElements(a, b, cb)
  {
    const elements1 = this.elements1;
    const elements2 = this.elements2;

    if (elements1.has(a) && elements2.has(b))
    {
      cb(a, b);
    }
    if (elements2.has(a) && elements1.has(b))
    {
      cb(b, a);
    }
  }

  _registerConnection(connection)
  {
    this._forOrderedElements(connection.from, connection.to, (row_element, column_element) => {
      const elements1 = this.elements1;
      const elements2 = this.elements2;

      this._lowRegisterConnection(row_element, column_element, connection);

      for (let group = row_element.parent; elements1.has(group); group = group.parent)
      {
        this._lowRegisterConnection(group, column_element, connection);
      }

      for (let group = column_element.parent; elements2.has(group); group = group.parent)
      {
        this._lowRegisterConnection(row_element, group, connection);
      }
    });
  }

  _unregisterConnection(connection)
  {
    this._forOrderedElements(connection.from, connection.to, (row_element, column_element) => {
      const elements1 = this.elements1;
      const elements2 = this.elements2;

      this._lowUnregisterConnection(row_element, column_element, connection);

      for (let group = row_element.parent; elements1.has(group); group = group.parent)
      {
        this._lowUnregisterConnection(group, column_element, connection);
      }

      for (let group = column_element.parent; elements2.has(group); group = group.parent)
      {
        this._lowUnregisterConnection(row_element, group, connection);
      }
    });
  }

  _registerConnectionFor(node)
  {
    this.listview1.matrix.getConnectionsOf(node).forEach((connection) => {
      this._registerConnection(connection);
    });
  }

  _unregisterConnectionFor(node)
  {
    this.listview1.matrix.getConnectionsOf(node).forEach((connection) => {
      this._unregisterConnection(connection);
    });
  }

  _subscribeAllElements(listview, dst, other)
  {
    const filter = listview.filterFunction;
    const subscribe = (group) => {
      return group.forEachAsync((node) => {
        return call_continuation_if(node, filter, (node) => {
          dst.add(node);

          if ((node instanceof GroupData))
          {
            let subscriptions = subscribe(node);

            return add_subscription(subscriptions, () => dst.delete(node));
          }
          else
          {
            this._registerConnectionFor(node);

            return () => {
              this._unregisterConnectionFor(node);
              dst.delete(node);
            };
          }
        });
      });
    };

    return subscribe(listview.group);
  }

  get startIndex1()
  {
    return this.listview1.startIndex;
  }

  get startIndex2()
  {
    return this.listview2.startIndex;
  }

  constructor(listview1, listview2)
  {
    typecheck_instance(listview1, ListDataView);
    typecheck_instance(listview2, ListDataView);

    if (listview1.matrix !== listview2.matrix)
      throw new Error('Can only work with ListDataView instance of the same matrix.');

    super();
    this.listview1 = listview1;
    this.listview2 = listview2;

    this.elements1 = new Set();
    this.elements2 = new Set();
    // map of all connections. also contains the list of
    // connections in each group as a set
    this.connections = new Map();
    this.subscriptions = init_subscriptions();

    // subscribers to subscribeElements
    this.subscribers = init_subscribers();

    // matrix of currently visible connections
    this.matrix = [];

    // elements, e.g. ports or groups in the rows
    this.rows = [];
    this.rows_changed = [];

    // elements, e.g. ports or groups in the columns
    this.columns = [];
    this.columns_changed = [];

    // maintain the matrix
    this._addSubscription(this.subscribeAmount((rows, columns) => {
      resize_array(this.rows, rows);
      resize_array(this.rows_changed, rows, () => false);

      resize_array(this.columns, columns);
      resize_array(this.columns_changed, columns, () => false);

      resize_array(this.matrix, rows, () => new Array(columns));

      this.matrix.forEach((row) => {
        resize_array(row, columns);
      });
    }));

    this._addSubscription(listview1.subscribeElements(
      (index, row_element) => {
        const rows = this.rows;
        const columns = this.columns;
        const matrix = this.matrix;
        const subscribers = this.subscribers;

        const startIndex2 = this.startIndex2;
        const i = index % rows.length;

        rows[i] = row_element;

        for (let n = 0; n < columns.length; n++)
        {
          const j = (startIndex2 + n) % columns.length;
          const column_element = columns[j];

          let connection = this.getConnectionFor(row_element, column_element);

          // actually update and tell our subscribers
          matrix[i][j] = connection;

          call_subscribers(subscribers, index, startIndex2 + n,
                           connection, row_element, column_element);
        }
      }
    ));

    this._addSubscription(listview2.subscribeElements(
      (index, column_element) => {
        const rows = this.rows;
        const columns = this.columns;
        const matrix = this.matrix;
        const subscribers = this.subscribers;

        const startIndex1 = this.startIndex1;
        const j = index % columns.length;

        columns[j] = column_element;

        for (let n = 0; n < rows.length; n++)
        {
          const i = (startIndex1 + n) % columns.length;
          const row_element = rows[i];

          let connection = this.getConnectionFor(row_element, column_element);

          // actually update and tell our subscribers
          matrix[i][j] = connection;

          call_subscribers(subscribers, startIndex1 + n, index,
                           connection, row_element, column_element);
        }
      },
    ));

    this._addSubscription(this._subscribeAllElements(listview1, this.elements1, this.elements2));
    this._addSubscription(this._subscribeAllElements(listview2, this.elements2, this.elements1));

    // collect all connections
    {
      const matrix = this.listview1.matrix;

      matrix.forEachConnection((connection) => {
        this._registerConnection(connection);
      });

      this._addSubscription(matrix.subscribe('connectionAdded', (connection) => {
        this._registerConnection(connection);
      }));

      this._addSubscription(matrix.subscribe('connectionRemoved', (connection) => {
        this._unregisterConnection(connection);
      }));
    }

    listview1.subscribeScrollView((offset) => {
      this.emit('scrollView', offset, 0);
    });

    listview2.subscribeScrollView((offset) => {
      this.emit('scrollView', 0, offset);
    });
  }

  getConnectionFor(row_element, column_element)
  {
    if (!row_element || !column_element) return void(0);

    const connections_for = this.connections.get(row_element);

    if (!connections_for) return void(0);

    return connections_for.get(column_element);
  }

  subscribeSize(cb)
  {
    const listview1 = this.listview1;
    const listview2 = this.listview2;

    return subscribe_many(
      [
        listview1.subscribeSize.bind(listview1),
        listview2.subscribeSize.bind(listview2)
      ], cb);
  }

  subscribeAmount(cb)
  {
    const listview1 = this.listview1;
    const listview2 = this.listview2;

    return subscribe_many(
      [
        listview1.subscribeAmount.bind(listview1),
        listview2.subscribeAmount.bind(listview2)
      ], cb);
  }

  subscribeElements(cb)
  {
    this.subscribers = add_subscriber(this.subscribers, cb);

    const matrix = this.matrix;
    const rows = this.rows;
    const columns = this.columns;
    const subscribers = this.subscribers;

    const startIndex1 = this.startIndex1;
    const startIndex2 = this.startIndex2;

    for (let n = 0; n < rows.length; n++)
    {
      const i = (startIndex1 + n) % rows.length;
      const row_element = rows[i];

      for (let m = 0; m < columns.length; m++)
      {
        const j = (startIndex2 + m) % columns.length;
        const column_element = columns[j];


        call_subscribers(cb, startIndex1 + n, startIndex2 + m, matrix[i][j],
                         row_element, column_element);
      }
    }

    return () => {
      this.subscribers = remove_subscriber(this.subscribers, cb);
    };
  }

  subscribeScrollView(cb)
  {
    return this.subscribe('scrollView', cb);
  }

  destroy()
  {
    super.destroy();
    this.subscriptions = unsubscribe_subscriptions(this.subscriptions);
  }
}
