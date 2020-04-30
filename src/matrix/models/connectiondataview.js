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

function rearrange_array(array, diff)
{
  // would copyWithin be faster?
  if (diff > 0)
  {
    // we remove diff entries at the front and move them to
    // the back
    const tmp = array.slice(0, diff);
    array.splice(0, diff);
    array.splice(array.length, 0, ...tmp);
  }
  else
  {
    // we remove diff entries at the end and move them
    // to the front
    const tmp = array.slice(array.length + diff);
    array.splice(array.length + diff, -diff);
    array.splice(0, 0, ...tmp);
  }
}

export class ConnectionDataView extends Events
{
  _addSubscription(sub)
  {
    this.subscriptions = add_subscription(this.subscriptions, sub);
  }

  _notifyPair(row_element, column_element, connection)
  {
    const i = this.rows.indexOf(row_element);

    if (i === -1) return;

    const j = this.columns.indexOf(column_element);

    if (j === -1) return;

    this.matrix[i][j] = connection;
    call_subscribers(this.subscribers, i, j, connection);
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

    // the start index was changed while scrolling, we want to rearrange rows
    this._addSubscription(listview1.subscribeStartIndexChanged((startIndex, oldStartIndex) => {
      rearrange_array(this.matrix, startIndex - oldStartIndex);
    }));

    // the start index was changed while scrolling, we want to rearrange columns
    this._addSubscription(listview2.subscribeStartIndexChanged((startIndex, oldStartIndex) => {
      this.matrix.forEach((row) => {
        rearrange_array(row, startIndex - oldStartIndex);
      });
    }));

    this._addSubscription(listview1.subscribeElements(
      (index, element) => {
        const n = index - this.listview1.startIndex;
        this.rows[n] = element;
        this.rows_changed[n] = true;
      },
      () => {
        const rows = this.rows;
        const rows_changed = this.rows_changed;
        const matrix = this.matrix;
        const columns = this.columns;

        for (let i = 0; i < rows.length; i++)
        {
          if (rows_changed[i])
          {
            const row_element = rows[i];

            rows_changed[i] = false;

            for (let j = 0; j < columns.length; j++)
            {
              let current_connection = matrix[i][j];

              let connection = this.getConnectionFor(row_element, columns[j]);

              if (current_connection === connection) continue;

              // actually update and tell our subscribers
              matrix[i][j] = connection;

              call_subscribers(subscribers, i, j, connection);
            }
          }
        }
      }
    ));

    this._addSubscription(listview2.subscribeElements(
      (index, element) => {
        const n = index - this.listview2.startIndex;
        this.columns[n] = element;
        this.columns_changed[n] = true;
      },
      () => {
        const columns = this.columns;
        const columns_changed = this.columns_changed;
        const matrix = this.matrix;
        const rows = this.rows;
        const subscribers = this.subscribers;

        for (let i = 0; i < columns.length; i++)
        {
          if (columns_changed[i])
          {
            const column_element = columns[i];

            columns_changed[i] = false;

            for (let j = 0; j < rows.length; j++)
            {
              const current_connection = matrix[j][i];

              const connection = this.getConnectionFor(rows[j], column_element);

              if (current_connection === connection) continue;

              // actually update and tell our subscribers
              matrix[j][i] = connection;

              call_subscribers(subscribers, j, i, connection);
            }
          }
        }
      }
    ));

    this._addSubscription(this._subscribeAllElements(listview1, this.elements1, this.elements2));
    this._addSubscription(this._subscribeAllElements(listview2, this.elements2, this.elements1));

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

    this.matrix.forEach((rows, i) => {
      rows.forEach((connection, j) => {
        call_subscribers(cb, i, j, connection);
      });
    });

    return () => {
      this.subscribers = remove_subscriber(this.subscribers, cb);
    };
  }

  destroy()
  {
    super.destroy();
    this.subscriptions = unsubscribe_subscriptions(this.subscriptions);
  }
}
