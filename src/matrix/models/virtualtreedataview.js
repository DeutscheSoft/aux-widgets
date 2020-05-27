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

/**
 * @module matrix
 */

import { Events } from '../../events.js';
import {
  initSubscribers,
  addSubscriber,
  removeSubscriber,
  callSubscribers,
} from '../../utils/subscribers.js';
import {
  initSubscriptions,
  addSubscription,
  unsubscribeSubscriptions,
} from '../../utils/subscriptions.js';
import { SubscriberMap } from '../../utils/subscriber_map.js';
import { typecheckFunction } from '../../utils/typecheck.js';

import { GroupData } from './group.js';
import { callContinuationIf } from './helpers.js';

function intervalUnion(a, b) {
  if (a === null) return b;
  if (b === null) return a;

  const start =
    a[0] === void 0 || b[0] === void 0 ? void 0 : Math.min(a[0], b[0]);
  const end =
    a[1] === void 0 || b[1] === void 0 ? void 0 : Math.max(a[1], b[1]);

  return [start, end];
}

function allowAll(node, callback) {
  callback(true);
  return initSubscriptions();
}

class SuperGroup {
  getInterval() {
    return [this.index, this.index + this.size + 1];
  }

  constructor(group, parent, index) {
    this.group = group;
    this.parent = parent;
    this.depth = parent ? parent.depth + 1 : -1;
    this.size = 0;
    this.index = index !== void 0 ? index : -1;
    this.children = [];
    this.treePosition = parent ? parent.treePosition.concat([false]) : [];
  }

  createChildNode(child) {
    if (child instanceof GroupData) {
      return new SuperGroup(child, this);
    } else {
      return child;
    }
  }

  childDistance(index) {
    let offset = 1;

    const list = this.children;

    for (let i = 0; i < index; i++) {
      const child = list[i];

      offset++;

      if (child instanceof SuperGroup) {
        offset += child.size;
      }
    }

    return offset;
  }

  indexOf(child) {
    return this.children.indexOf(child);
  }

  updateSize(diff) {
    this.size += diff;

    const parent = this.parent;

    if (parent !== null) {
      parent.updateSize(diff);
    }
  }

  forEach(cb) {
    this.children.forEach((node) => {
      if (node instanceof SuperGroup) {
        cb(node.group, this);
        node.forEach(cb);
      } else {
        cb(node, this);
      }
    });
  }

  isLastChild(child) {
    const children = this.children;

    return children[children.length - 1] === child;
  }

  getTreePositionFor(child) {
    return this.treePosition.concat([this.isLastChild(child)]);
  }

  updateTreePosition() {
    const parent = this.parent;

    if (parent) {
      this.treePosition = parent.getTreePositionFor(this);
    }

    this.children.forEach((child) => {
      if (child instanceof SuperGroup) {
        child.updateTreePosition();
      }
    });
  }
}

function getChild(node) {
  if (node instanceof SuperGroup) {
    return node.group;
  } else {
    return node;
  }
}

/**
 * The VirtualTreeDataView represents a view of a tree. The view will contain a
 * fixed number of elements (ports and groups). It can be scrolled within the
 * full tree.
 */
export class VirtualTreeDataView extends Events {
  // PRIVATE APIs
  _offsetFromParent(group, index) {
    return this.getSuperGroup(group).childDistance(index);
  }

  _updateSize(parent, diff) {
    parent.updateSize(diff);
    this.emit('sizeChanged', this.root.size);
  }

  _updateIndex(startIndex) {
    const list = this.list;

    for (let i = startIndex; i < list.length; i++) {
      const child = list[i];

      if (!(child instanceof GroupData)) continue;

      const super_group = this.groups.get(child);

      super_group.index = i;
    }
  }

  _childAdded(parent, node, index) {
    let sub = initSubscriptions();
    const child = getChild(node);

    // increase size by one
    this._updateSize(parent, 1);

    const offset = parent.childDistance(index);
    const list = this.list;

    const list_index = parent.index + offset;

    list.splice(list_index, 0, child);

    if (node instanceof SuperGroup) {
      node.index = list_index;
      this.groups.set(child, node);
    }

    this._updateIndex(list_index + 1);

    let notify_interval = null;

    if (list_index < this.startIndex) {
      this.startIndex++;
      this.emit('startIndexChanged', this.startIndex);
      this.emit('scrollView', 1);
    } else {
      notify_interval = [list_index, void 0];
    }

    if (node instanceof SuperGroup) {
      sub = addSubscription(sub, this._subscribe(node));
    }

    if (parent.children.length === index + 1) {
      parent.updateTreePosition();
      notify_interval = intervalUnion(notify_interval, parent.getInterval());
    } else if (node instanceof SuperGroup) {
      node.updateTreePosition();
    }

    if (notify_interval)
      this._notifyRegion(notify_interval[0], notify_interval[1]);

    this.emit('childAdded', child);

    return sub;
  }

  _childRemoved(parent, node, index) {
    const child = getChild(node);
    // NOTE: the subtree is always empty now, since
    // it is automatically removed before
    const size = node instanceof SuperGroup ? 1 + node.size : 1;

    // decrease size
    this._updateSize(parent, -size);

    const offset = parent.childDistance(index);
    const list = this.list;

    const list_index = parent.index + offset;

    if (list[list_index] !== child) {
      /*
      console.log('list: %o', list.map((n) => n.label));
      console.log('index %d : %o vs. %o',
                  list_index, list[list_index].label,
                  child.label);
      */
      throw new Error('Removing wrong child.');
    }

    list.splice(list_index, size);
    this._updateIndex(list_index);

    let notify_interval = null;

    const startIndex = this.startIndex;

    if (list_index < startIndex) {
      this.startIndex -= size;
      this.emit('startIndexChanged', this.startIndex, startIndex);
      this.emit('scrollView', this.startIndex - startIndex);
    } else if (this.size < startIndex + this.amount && startIndex > 0) {
      this.startIndex = Math.max(0, startIndex - size);
      this.emit('startIndexChanged', this.startIndex, startIndex);
      this.emit('scrollView', this.startIndex - startIndex);
      notify_interval = [this.startIndex, void 0];
    } else {
      notify_interval = [this.startIndex, void 0];
    }

    // if we remove the last child,
    // we have to update the tree positions
    if (index === parent.children.length) {
      parent.updateTreePosition();
      notify_interval = intervalUnion(notify_interval, parent.getInterval());
    }

    this.emit('childRemoved', child);

    if (notify_interval)
      this._notifyRegion(notify_interval[0], notify_interval[1]);
  }

  _subscribe(super_group) {
    const list = super_group.children;
    const group = super_group.group;

    const sub = group.forEachAsync((node) => {
      return this._filter(node, (node) => {
        let sub = initSubscriptions();

        node = super_group.createChildNode(node);

        list.push(node);
        // TODO: needs to be dynamic
        list.sort(this._sorter);

        sub = addSubscription(
          sub,
          this._childAdded(super_group, node, list.indexOf(node))
        );

        sub = addSubscription(sub, () => {
          if (node === null) return;

          const index = list.indexOf(node);

          list.splice(index, 1);

          this._childRemoved(super_group, node, index);

          node = null;
        });

        return sub;
      });
    });

    return sub;
  }

  _forEachWithTreePosition(from, to, callback) {
    const list = this.list;

    let super_group = null;

    for (let i = from; i < to; i++) {
      const element = list[i];
      let treePosition;

      if (element instanceof GroupData) {
        super_group = this.groups.get(element);
        treePosition = super_group.treePosition;
      } else if (element !== void 0) {
        if (!super_group) {
          super_group = this.groups.get(element.parent);
        }
        treePosition = super_group.getTreePositionFor(element);
      }

      callback(i, element, treePosition);
    }
  }

  _notifyRegion(start, end) {
    const startIndex = this.startIndex;
    const endIndex = startIndex + this.amount;

    if (end === void 0) end = endIndex;

    if (end <= startIndex) return;
    if (start >= endIndex) return;

    const from = Math.max(start, startIndex);
    const to = Math.min(end, endIndex);
    const subscribers = this.subscribers;

    this._forEachWithTreePosition(from, to, (i, element, treePosition) => {
      callSubscribers(subscribers, i, element, treePosition);
    });
    this.emit('elementsChanged');
  }

  _filterCollapsed(node, continuation) {
    return callContinuationIf(
      node,
      (node, callback) => {
        return this.subscribeCollapsed(node.parent, (is_collapsed) =>
          callback(!is_collapsed)
        );
      },
      continuation
    );
  }

  _filter(node, continuation) {
    return this._filterCollapsed(node, (node) => {
      return callContinuationIf(node, this.filterFunction, continuation);
    });
  }

  // PUBLIC APIs

  /**
   * Return the corresponding matrix object.
   */
  get matrix() {
    return this.root.group.matrix;
  }

  /**
   * Return the corresponding root group.
   */
  get group() {
    return this.root.group;
  }

  /**
   * Constructor.
   *
   * @param {GroupData} group - The group this view represents. Note that only
   *    the children of this group but not this group itself will be part of
   *    the view.
   * @param {number} amount - The amount of elements to view.
   * @param {Function} filterFunction - The function used to filter the tree.
   * @param {Function} sortFunction - The function used to sort nodes within
   *    each level of the tree.
   */
  constructor(group, amount, filterFunction, sortFunction) {
    super();
    this.root = new SuperGroup(group, null);
    this.startIndex = 0;
    this.amount = amount;
    this.filterFunction = filterFunction || allowAll;
    this.sortFunction = sortFunction;
    this.subscribers = initSubscribers();

    this._sorter = (node1, node2) => {
      return this.sortFunction(getChild(node1), getChild(node2));
    };

    // global flat list
    this.list = [];

    // set of collapsed groups
    this.collapsed = new WeakSet();

    // list of subscribers for an element being collapsed
    this.collapsedSubscribers = new SubscriberMap();

    // index in the flat list where each group
    this.groups = new Map([[group, this.root]]);

    // subscribers
    this.subscriptions = this._subscribe(this.root);
  }

  get size() {
    return this.root.size;
  }

  getSuperGroup(group) {
    if (!(group instanceof GroupData)) {
      throw new TypeError('Expected GroupData instance as argument.');
    }

    const super_group = this.groups.get(group);

    if (!super_group) {
      throw new Error('No group info available for this group.');
    }

    return super_group;
  }

  getDepth(child) {
    const info = this.getSuperGroup(child.parent);

    return info.depth + 1;
  }

  getSubtreeSize(group) {
    const info = this.getSuperGroup(group);

    return info.size;
  }

  setStartIndex(index) {
    this.startIndex = index;
    this._notifyRegion(index, index + this.amount);
  }

  indexOf(child) {
    if (child instanceof GroupData) {
      const super_group = this.getSuperGroup(child);

      return super_group.index;
    } else {
      const super_group = this.getSuperGroup(child.parent);

      return (
        super_group.index +
        super_group.childDistance(super_group.indexOf(child))
      );
    }
  }

  setAmount(amount) {
    const oldAmount = this.amount;
    this.amount = amount;

    this.emit('amountChanged', amount);

    if (amount <= oldAmount) return;

    const startIndex = this.startIndex;
    const size = this.size;

    this._notifyRegion(startIndex + oldAmount, startIndex + amount);

    if (size < startIndex + this.amount && startIndex > 0) {
      this.startIndex = Math.max(0, size - this.amount);
      this.emit('startIndexChanged', this.startIndex, startIndex);
      this.emit('scrollView', this.startIndex - startIndex);
    }
  }

  scrollStartIndex(offset) {
    if (offset === 0) return;

    this.startIndex += offset;

    this.emit('startIndexChanged', this.startIndex, this.startIndex - offset);
    this.emit('scrollView', offset);

    if (offset > 0) {
      const end = this.startIndex + this.amount;
      const start = Math.max(this.startIndex, end - offset);
      this._notifyRegion(start, end);
    } else if (offset < 0) {
      const start = this.startIndex;
      const end = start + Math.min(this.amount, -offset);
      this._notifyRegion(start, end);
    }
  }

  collapseGroup(group, is_collapsed) {
    if (typeof is_collapsed !== 'boolean')
      throw new TypeError('Expected boolean.');

    if (!(group instanceof GroupData))
      throw new TypeError('Expected GroupData.');

    const collapsed = this.collapsed;

    if (is_collapsed) {
      collapsed.add(group);
    } else {
      collapsed.delete(group);
    }

    this.collapsedSubscribers.call(group, is_collapsed);
  }

  isCollapsed(group) {
    if (!(group instanceof GroupData))
      throw new TypeError('Expected GroupData.');

    return this.collapsed.has(group);
  }

  destroy() {
    super.destroy();
    this.subscriptions = unsubscribeSubscriptions(this.subscriptions);
  }

  check() {
    this.forEach((child) => {
      if (child instanceof GroupData) {
        const index = this.getSuperGroup(child).index;

        if (this.list[index] !== child) {
          console.error(
            'Found group at position %d. Found %o vs. %o.\n',
            index,
            child.label,
            this.list[index].label
          );
          throw new Error('Group is not at right position.');
        }
      } else if (child instanceof SuperGroup) {
        throw new TypeError('Discovered unexpected node SuperGroup.');
      } else {
        const super_group = this.getSuperGroup(child.parent);
        const index = super_group.children.indexOf(child);
        const distance = super_group.childDistance(index);

        if (this.list[super_group.index + distance] !== child) {
          console.error(
            'Found group at position %d. Found %o vs. %o.\n',
            index,
            child.label,
            this.list[index].label
          );
        }
      }
    });
  }

  forEach(cb) {
    const rec = (super_group) => {
      super_group.children.forEach((node) => {
        cb(getChild(node));
        if (node instanceof SuperGroup) rec(node);
      });
    };

    rec(this.root);
  }

  subscribeElements(cb, done_cb) {
    typecheckFunction(cb);

    if (done_cb) typecheckFunction(done_cb);

    this.subscribers = addSubscriber(this.subscribers, cb);

    const from = this.startIndex;
    const to = from + this.amount;
    const list = this.list;
    let subscriptions = initSubscriptions();

    subscriptions = addSubscription(subscriptions, () => {
      this.subscribers = removeSubscriber(this.subscribers, cb);
    });

    this._forEachWithTreePosition(from, to, (i, element, treePosition) => {
      callSubscribers(cb, i, element, treePosition);
    });

    if (done_cb) {
      callSubscribers(done_cb);

      subscriptions = addSubscription(
        subscriptions,
        this.subscribe('elementsChanged', done_cb)
      );
    }

    return () => {
      subscriptions = unsubscribeSubscriptions(subscriptions);
    };
  }

  /**
   * Emits the size of the list.
   */
  subscribeSize(cb) {
    callSubscribers(cb, this.root.size);

    return this.subscribe('sizeChanged', cb);
  }

  subscribeAmount(cb) {
    callSubscribers(cb, this.amount);

    return this.subscribe('amountChanged', cb);
  }

  /**
   * Triggers when the startIndex changed but the view remained the same. This
   * may happen when data is being removed which is entirely _before_ the
   * current view.
   */
  subscribeStartIndexChanged(cb) {
    return this.subscribe('startIndexChanged', cb);
  }

  subscribeScrollView(cb) {
    return this.subscribe('scrollView', cb);
  }

  subscribeCollapsed(group, cb) {
    cb(this.collapsed.has(group));

    return this.collapsedSubscribers.subscribe(group, cb);
  }

  at(index) {
    return this.list[index];
  }

  get(offset) {
    return this.list[this.startIndex + offset];
  }

  forEachElement(cb) {
    this.list.forEach(cb);
  }
}
