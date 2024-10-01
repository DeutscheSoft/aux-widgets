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

/**
 * @module matrix
 */

import { typecheckInstance } from '../../utils/typecheck.js';
import {
  initSubscriptions,
  addSubscription,
  unsubscribeSubscriptions,
  combineSubscriptions,
} from '../../utils/subscriptions.js';
import {
  initSubscribers,
  addSubscriber,
  removeSubscriber,
  callSubscribers,
} from '../../utils/subscribers.js';
import { VirtualTreeDataView } from './virtualtreedataview.js';
import { Events } from '../../events.js';
import { callContinuationIf } from './helpers.js';
import { GroupData } from './group.js';

// last argument will be a callback
function subscribeMany(apis, cb) {
  const values = new Array(apis.length);
  const has_value = apis.map(() => false);
  let has_all_values = false;
  let subscriptions = initSubscriptions();

  apis
    .map((api, i) => {
      return api((value) => {
        values[i] = value;
        if (!has_all_values) {
          has_value[i] = true;
          has_all_values = !has_value.includes(false);
          if (!has_all_values) return;
        }

        cb(...values);
      });
    })
    .forEach((sub) => {
      subscriptions = addSubscription(subscriptions, sub);
    });

  return () => {
    subscriptions = unsubscribeSubscriptions(subscriptions);
  };
}

export function resizeArrayMod(array, length, offset, create, remove) {
  if (length === array.length) return;

  const tmp = array.slice();

  array.length = length;

  // copy existing entries from their previous position
  for (let i = 0; i < Math.min(tmp.length, length); i++) {
    const index = offset + i;

    array[index % length] = tmp[index % tmp.length];
  }

  if (tmp.length < length) {
    for (let i = tmp.length; i < length; i++) {
      const index = i + offset;

      array[index % length] = create ? create(index) : void 0;
    }
  } else if (remove) {
    for (let i = length; i < tmp.length; i++) {
      const index = i + offset;

      remove(tmp[index % tmp.length]);
    }
  }
}

function subtractMod(a, b, n) {
  let result = (a - b) % n;

  if (result < 0) result += n;

  return result;
}

/**
 * A dataview for connections.
 */
export class ConnectionDataView extends Events {
  _addSubscription(sub) {
    this.subscriptions = addSubscription(this.subscriptions, sub);
  }

  _notifyPair(row_element, column_element, connection) {
    const rows = this.rows;
    const columns = this.columns;
    const matrix = this.matrix;

    const startIndex1 = this.startIndex1;
    const startIndex2 = this.startIndex2;

    const n = rows.indexOf(row_element);

    if (n === -1) return;

    const m = columns.indexOf(column_element);

    if (m === -1) return;

    matrix[n][m] = connection;

    const index1 = startIndex1 + subtractMod(n, startIndex1, rows.length);
    const index2 = startIndex2 + subtractMod(m, startIndex2, columns.length);

    callSubscribers(
      this.subscribers,
      index1,
      index2,
      connection,
      row_element,
      column_element
    );
  }

  _lowRegisterConnection(row_element, column_element, connection) {
    let connections_for = this.connections.get(row_element);

    if (!connections_for) {
      this.connections.set(row_element, (connections_for = new Map()));
    }

    if (
      row_element instanceof GroupData ||
      column_element instanceof GroupData
    ) {
      let set = connections_for.get(column_element);

      if (!set) {
        connections_for.set(column_element, (set = new Set()));
      }

      set.add(connection);

      this._notifyPair(row_element, column_element, set);
    } else {
      connections_for.set(column_element, connection);

      this._notifyPair(row_element, column_element, connection);
    }
  }

  _lowUnregisterConnection(row_element, column_element, connection) {
    const connections_for = this.connections.get(row_element);

    if (connections_for === void 0) return;

    if (
      row_element instanceof GroupData ||
      column_element instanceof GroupData
    ) {
      let set = connections_for.get(column_element);

      if (set === void 0) return;

      set.delete(connection);

      if (set.size === 0) {
        connections_for.delete(column_element);
        set = void 0;
      }

      this._notifyPair(row_element, column_element, set);
    } else {
      connections_for.delete(column_element);
      this._notifyPair(row_element, column_element, void 0);
    }

    if (connections_for.size === 0) {
      this.connections.delete(row_element);
    }
  }

  _forOrderedElements(a, b, cb) {
    const elements1 = this.elements1;
    const elements2 = this.elements2;

    if (elements1.has(a) && elements2.has(b)) {
      cb(a, b);
    }
    if (elements2.has(a) && elements1.has(b)) {
      cb(b, a);
    }
  }

  _registerConnection(connection) {
    this._forOrderedElements(
      connection.from,
      connection.to,
      (row_element, column_element) => {
        const elements1 = this.elements1;
        const elements2 = this.elements2;

        this._lowRegisterConnection(row_element, column_element, connection);

        for (
          let group = row_element.parent;
          elements1.has(group);
          group = group.parent
        ) {
          this._lowRegisterConnection(group, column_element, connection);
        }

        for (
          let group = column_element.parent;
          elements2.has(group);
          group = group.parent
        ) {
          this._lowRegisterConnection(row_element, group, connection);
        }
      }
    );
  }

  _unregisterConnection(connection) {
    this._forOrderedElements(
      connection.from,
      connection.to,
      (row_element, column_element) => {
        const elements1 = this.elements1;
        const elements2 = this.elements2;

        this._lowUnregisterConnection(row_element, column_element, connection);

        for (
          let group = row_element.parent;
          elements1.has(group);
          group = group.parent
        ) {
          this._lowUnregisterConnection(group, column_element, connection);
        }

        for (
          let group = column_element.parent;
          elements2.has(group);
          group = group.parent
        ) {
          this._lowUnregisterConnection(row_element, group, connection);
        }
      }
    );
  }

  _registerConnectionFor(node) {
    this.virtualtreeview1.matrix
      .getConnectionsOf(node)
      .forEach((connection) => {
        this._registerConnection(connection);
      });
  }

  _unregisterConnectionFor(node) {
    this.virtualtreeview1.matrix
      .getConnectionsOf(node)
      .forEach((connection) => {
        this._unregisterConnection(connection);
      });
  }

  _subscribeAllElements(virtualtreeview, dst, other) {
    const filter = virtualtreeview.filterFunction;
    const subscribe = (group) => {
      return group.forEachAsync((node) => {
        // jshint -W123
        return callContinuationIf(node, filter, (node) => {
          // jshint +W123
          dst.add(node);

          if (node instanceof GroupData) {
            const subscriptions = subscribe(node);

            return addSubscription(subscriptions, () => dst.delete(node));
          } else {
            this._registerConnectionFor(node);

            return () => {
              this._unregisterConnectionFor(node);
              dst.delete(node);
            };
          }
        });
      });
    };

    return subscribe(virtualtreeview.group);
  }

  get startIndex1() {
    return this.virtualtreeview1.startIndex;
  }

  get startIndex2() {
    return this.virtualtreeview2.startIndex;
  }

  get amount1() {
    return this.virtualtreeview1.amount;
  }

  get amount2() {
    return this.virtualtreeview2.amount;
  }

  constructor(virtualtreeview1, virtualtreeview2) {
    typecheckInstance(virtualtreeview1, VirtualTreeDataView);
    typecheckInstance(virtualtreeview2, VirtualTreeDataView);

    if (virtualtreeview1.matrix !== virtualtreeview2.matrix)
      throw new Error(
        'Can only work with ListDataView instance of the same matrix.'
      );

    super();
    this.virtualtreeview1 = virtualtreeview1;
    this.virtualtreeview2 = virtualtreeview2;

    this.elements1 = new Set();
    this.elements2 = new Set();
    // map of all connections. also contains the list of
    // connections in each group as a set
    this.connections = new Map();
    this.subscriptions = initSubscriptions();

    // subscribers to subscribeElements
    this.subscribers = initSubscribers();

    // matrix of currently visible connections
    this.matrix = [];

    // elements, e.g. ports or groups in the rows
    this.rows = [];

    // elements, e.g. ports or groups in the columns
    this.columns = [];

    // maintain the matrix
    this._addSubscription(
      this.subscribeAmount((rows, columns) => {
        resizeArrayMod(this.rows, rows, this.startIndex1);

        resizeArrayMod(this.columns, columns, this.startIndex2);

        resizeArrayMod(
          this.matrix,
          rows,
          this.startIndex1,
          () => new Array(columns)
        );

        this.matrix.forEach((row) => {
          resizeArrayMod(row, columns, this.startIndex2);
        });
      })
    );

    this._addSubscription(
      virtualtreeview1.subscribeElements((index, row_element) => {
        const rows = this.rows;
        const columns = this.columns;
        const matrix = this.matrix;
        const subscribers = this.subscribers;

        const startIndex2 = this.startIndex2;
        const i = index % rows.length;

        rows[i] = row_element;

        for (let n = 0; n < columns.length; n++) {
          const j = (startIndex2 + n) % columns.length;
          const column_element = columns[j];

          const connection = this.getConnectionFor(row_element, column_element);

          // actually update and tell our subscribers
          matrix[i][j] = connection;

          callSubscribers(
            subscribers,
            index,
            startIndex2 + n,
            connection,
            row_element,
            column_element
          );
        }
      })
    );

    this._addSubscription(
      virtualtreeview2.subscribeElements((index, column_element) => {
        const rows = this.rows;
        const columns = this.columns;
        const matrix = this.matrix;
        const subscribers = this.subscribers;

        const startIndex1 = this.startIndex1;
        const j = index % columns.length;

        columns[j] = column_element;

        for (let n = 0; n < rows.length; n++) {
          const i = (startIndex1 + n) % rows.length;
          const row_element = rows[i];

          const connection = this.getConnectionFor(row_element, column_element);

          // actually update and tell our subscribers
          matrix[i][j] = connection;

          callSubscribers(
            subscribers,
            startIndex1 + n,
            index,
            connection,
            row_element,
            column_element
          );
        }
      })
    );

    this._addSubscription(
      this._subscribeAllElements(
        virtualtreeview1,
        this.elements1,
        this.elements2
      )
    );
    this._addSubscription(
      this._subscribeAllElements(
        virtualtreeview2,
        this.elements2,
        this.elements1
      )
    );

    // collect all connections
    {
      const matrix = this.virtualtreeview1.matrix;

      matrix.forEachConnection((connection) => {
        this._registerConnection(connection);
      });

      this._addSubscription(
        matrix.subscribe('connectionAdded', (connection) => {
          this._registerConnection(connection);
        })
      );

      this._addSubscription(
        matrix.subscribe('connectionRemoved', (connection) => {
          this._unregisterConnection(connection);
        })
      );
    }

    virtualtreeview1.subscribeScrollView((offset) => {
      this.emit('scrollView', offset, 0);
    });

    virtualtreeview2.subscribeScrollView((offset) => {
      this.emit('scrollView', 0, offset);
    });
  }

  getConnectionFor(row_element, column_element) {
    if (!row_element || !column_element) return void 0;

    const connections_for = this.connections.get(row_element);

    if (!connections_for) return void 0;

    return connections_for.get(column_element);
  }

  subscribeSize(cb) {
    const virtualtreeview1 = this.virtualtreeview1;
    const virtualtreeview2 = this.virtualtreeview2;

    return subscribeMany(
      [
        virtualtreeview1.subscribeSize.bind(virtualtreeview1),
        virtualtreeview2.subscribeSize.bind(virtualtreeview2),
      ],
      cb
    );
  }

  subscribeAmount(cb) {
    const virtualtreeview1 = this.virtualtreeview1;
    const virtualtreeview2 = this.virtualtreeview2;

    return subscribeMany(
      [
        virtualtreeview1.subscribeAmount.bind(virtualtreeview1),
        virtualtreeview2.subscribeAmount.bind(virtualtreeview2),
      ],
      cb
    );
  }

  subscribeElements(cb) {
    this.subscribers = addSubscriber(this.subscribers, cb);

    const matrix = this.matrix;
    const rows = this.rows;
    const columns = this.columns;

    const startIndex1 = this.startIndex1;
    const startIndex2 = this.startIndex2;

    for (let n = 0; n < rows.length; n++) {
      const i = (startIndex1 + n) % rows.length;
      const row_element = rows[i];

      for (let m = 0; m < columns.length; m++) {
        const j = (startIndex2 + m) % columns.length;
        const column_element = columns[j];

        callSubscribers(
          cb,
          startIndex1 + n,
          startIndex2 + m,
          matrix[i][j],
          row_element,
          column_element
        );
      }
    }

    return () => {
      this.subscribers = removeSubscriber(this.subscribers, cb);
    };
  }

  subscribeScrollView(cb) {
    return this.subscribe('scrollView', cb);
  }

  destroy() {
    super.destroy();
    this.subscriptions = unsubscribeSubscriptions(this.subscriptions);
  }

  _observeConnectionsFor(element, list1, list2, callback) {
    const matrix = list1.matrix;

    if (!list1.includes(element)) throw new Error('Could not find child.');

    const result = new Set();

    matrix.getConnectionsOf(element).forEach((connection) => {
      const other = connection.to === element ? connection.from : connection.to;

      if (!list2.includes(other)) return;
      result.add(connection);
    });

    callSubscribers(callback, result);

    return combineSubscriptions(
      matrix.subscribe('connectionRemoved', (connection) => {
        if (connection.to !== element && connection.from !== element) return;

        const other =
          connection.to === element ? connection.from : connection.to;
        if (!list2.includes(other)) return;

        result.delete(connection);
        callSubscribers(callback, result);
      }),
      matrix.subscribe('connectionAdded', (connection) => {
        if (connection.to !== element && connection.from !== element) return;

        const other =
          connection.to === element ? connection.from : connection.to;
        if (!list2.includes(other)) return;

        result.add(connection);
        callSubscribers(callback, result);
      })
    );
  }

  observeConnectionsForRow(row_element, callback) {
    return this._observeConnectionsFor(
      row_element,
      this.listview1,
      this.listview2,
      callback
    );
  }

  observeConnectionsForColumn(column_element, callback) {
    return this._observeConnectionsFor(
      column_element,
      this.listview2,
      this.listview1,
      callback
    );
  }
}
