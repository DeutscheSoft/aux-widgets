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

import { TreeNodeData } from './treenode.js';
import { PortData } from './port.js';
import {
  init_subscriptions,
  add_subscription,
  unsubscribe_subscriptions,
} from '../../utils/subscriptions.js';

function on_child_treechanged() {
  this.parent.emit('treeChanged');
}

/**
 * The data model of a group.
 */
export class GroupData extends TreeNodeData {
  /**
   * This property is true.
   */
  get isGroup() {
    return true;
  }

  constructor(matrix, o) {
    super(matrix, o);
    this.children = new Set();
  }

  /**
   * Add a child to this group.
   *
   * @emits childAdded
   * @emits treeChanged
   */
  addChild(child) {
    if (!(child instanceof TreeNodeData))
      throw new TypeError('Expected TreeDataNode');

    if (this.isChildOf(child))
      throw new Error('Creating graphs is not allowed.');

    this.matrix.registerNode(child);

    const children = this.children;

    child.setParent(this);
    children.add(child);

    this.emit('childAdded', child);
    this.emit('treeChanged', this);

    child.on('treeChanged', on_child_treechanged);
  }

  /**
   * Removed a child node.
   *
   * @emits childRemoved
   * @emits treeChanged
   */
  deleteChild(child) {
    if (!(child instanceof TreeNodeData))
      throw new TypeError('Expected TreeDataNode');

    const children = this.children;

    if (!children.has(child)) throw new Error('Unknown child.');

    this.matrix.unregisterNode(child);

    child.setParent(null);
    children.delete(child);

    child.off('treeChanged', on_child_treechanged);

    this.emit('childRemoved', child);
    this.emit('treeChanged', this);
  }

  /**
   * Adds a port to this group.
   */
  addPort(port) {
    if (!(port instanceof PortData)) port = this.matrix.createPort(port);

    this.addChild(port);
    return port;
  }

  /**
   * Removes a port from this group.
   */
  deletePort(port) {
    this.deleteChild(port);
  }

  /**
   * Adds a group to this group.
   */
  addGroup(group) {
    if (!(group instanceof GroupData)) group = this.matrix.createGroup(group);

    this.addChild(group);
    return group;
  }

  /**
   * Removes a group from this group.
   */
  deleteGroup(group) {
    this.deleteChild(group);
  }

  /**
   * Iterates all children of this group.
   *
   * @param {Function} cb - The callback function to invoke with each child
   *  node.
   */
  forEach(cb) {
    this.children.forEach(cb);
  }

  /**
   * Iterates all children of this group and all their children recursively.
   * Will descend into group nodes if the callback returns either undefined or
   * a trueish value.
   *
   * @param cb {Function} - A callback function to be called for each node in
   *  this subtree. The arguments are the node and the path description. The
   *  path description is an Array of objects with 3 properties `parent`,
   *  `index` and `length`. Parent is the parent node, `index` the index of
   *  the node in the list of children and `length` is the number of siblings.
   * @param sorter {Function} - An optional sort function. Will be used as an
   *  argument to Array.prototype.sort for each list of child nodes.
   */
  forEachNode(cb, sorter, path) {
    const children = Array.from(this.children);

    if (sorter) {
      children.sort(sorter);
    }

    if (!Array.isArray(path)) {
      path = [];
    }

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const current_path = path.concat([
        {
          parent: this,
          index: i,
          length: children.length,
        },
      ]);

      const retval = cb(child, current_path);

      if (retval !== void 0 && !retval) continue;

      if (child instanceof GroupData) {
        child.forEachNode(cb, sorter, current_path);
      }
    }
  }

  /**
   * Call a function for each child node asynchronously. Will subscribe to
   * new children being added and call the callback. The callback function
   * may return a subscription which is removed once the corresponding child
   * node is removed from this group.
   *
   * @returns {Function} - A subscription. Call this function to unsubscribe.
   */
  forEachAsync(callback) {
    let subs = init_subscriptions();
    const child_subscriptions = new Map();

    this.children.forEach((node) => {
      child_subscriptions.set(node, callback(node) || null);
    });

    subs = add_subscription(
      subs,
      this.subscribe('childAdded', (child) => {
        child_subscriptions.set(child, callback(child) || null);
      })
    );

    subs = add_subscription(
      subs,
      this.subscribe('childRemoved', (child) => {
        unsubscribe_subscriptions(child_subscriptions.get(child));
        child_subscriptions.delete(child);
      })
    );

    return () => {
      subs = unsubscribe_subscriptions(subs);
      child_subscriptions.forEach((subs) => unsubscribe_subscriptions(subs));
      child_subscriptions.clear();
    };
  }
}
