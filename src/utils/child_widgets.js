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

import { Events } from '../events.js';
import {
  initSubscriptions,
  addSubscription,
  unsubscribeSubscriptions,
} from './subscriptions.js';

function makeFilter(filter) {
  if (typeof filter === 'function') {
    if (filter.prototype) {
      return function (o) {
        return o instanceof filter;
      };
    } else {
      return filter;
    }
  } else if (filter === void 0) {
    return function () {
      return true;
    };
  } else {
    throw new Error('Unsupported filter type: ' + typeof filter);
  }
}

export class ChildWidgets extends Events {
  constructor(widget, options) {
    super();
    if (!options) options = {};
    this.widget = widget;
    this.filter = makeFilter(options.filter);
    this.list = widget.getChildren().filter(this.filter);
    this.subscriptions = [
      widget.subscribe('child_added', (child) => {
        if (!this.filter(child)) return;
        this.list.push(child);
        this.sortByDOM();
        this.emit('child_added', child, this.list.indexOf(child));
        this.emit('changed');
      }),
      widget.subscribe('child_removed', (child) => {
        if (!this.filter(child)) return;
        const position = this.list.indexOf(child);
        this.list = this.list.filter((_child) => _child !== child);
        this.emit('child_removed', child, position);
        this.emit('changed');
      }),
    ];
  }

  sortByDOM() {
    // TODO: this method currently assumes that the children are all
    // children of the same parent. this might not always be the case
    const list = this.list;

    if (!list.length) return;

    const parentNode = list[0].element.parentNode;
    const nodes = Array.from(parentNode.children);

    list.sort(function (child1, child2) {
      if (child1 === child2) return 0;
      return nodes.indexOf(child1.element) < nodes.indexOf(child2.element)
        ? -1
        : 1;
    });
  }

  sort() {
    this.sortByDOM();
    this.emit('changed');
  }

  indexOf(child) {
    return this.list.indexOf(child);
  }

  includes(child) {
    return this.list.indexOf(child) !== -1;
  }

  forEach(cb) {
    this.list.forEach(cb);
  }

  getList() {
    return this.list;
  }

  at(index) {
    return this.list[index];
  }

  destroy() {
    this.subscriptions.forEach((cb) => cb());
    this.widget = null;
  }

  forEachAsync(callback) {
    let subs = initSubscriptions();
    const child_subscriptions = new Map();

    this.getList().forEach((child, position) => {
      child_subscriptions.set(child, callback(child, position) || null);
    });

    subs = addSubscription(
      subs,
      this.subscribe('child_added', (child, position) => {
        child_subscriptions.set(child, callback(child, position) || null);
      })
    );

    subs = addSubscription(
      subs,
      this.subscribe('child_removed', (child, position) => {
        unsubscribeSubscriptions(child_subscriptions.get(child));
        child_subscriptions.delete(child);
      })
    );

    return () => {
      subs = unsubscribeSubscriptions(subs);
      child_subscriptions.forEach((subs) => unsubscribeSubscriptions(subs));
      child_subscriptions.clear();
    };
  }
}
