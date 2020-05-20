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

import { MatrixDatum } from './matrixdatum.js';

/**
 * Base class for matrix tree objects, e.g. groups and ports.
 */
export class TreeNodeData extends MatrixDatum {
  /**
   * Is true if this object is a group.
   */
  get isGroup() {
    return false;
  }

  constructor(matrix, o) {
    super(matrix, o);
    this.parent = null;
  }

  /**
   * The tree node label.
   */
  set label(value) {
    return this.set('label', value);
  }
  get label() {
    return this.get('label');
  }

  /**
   * The tree node icon.
   */
  set icon(value) {
    return this.set('icon', value);
  }
  get icon() {
    return this.get('icon');
  }

  /**
   * The tree node id.
   */
  get id() {
    return this.get('id');
  }

  setParent(parent) {
    if (parent !== null && this.parent !== null) {
      throw new Error('Node already has a parent.');
    }

    if (parent !== null && !parent.isGroup)
      throw new TypeError('Parent node must be a group.');

    this.parent = parent;
  }

  /**
   * Returns true if this node is a child of the given node.
   *
   * @param {TreeNodeData} node
   */
  isChildOf(node) {
    for (let _node = this.parent; _node; _node = _node.parent) {
      if (_node === node) return true;
    }

    return false;
  }

  getPath() {
    const parent = this.parent;

    if (!parent) return [];

    return parent.getPath().concat([parent]);
  }
}
