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
 * Batch management of `widget.bind()` subscriptions with an index-aligned list
 * diff.
 *
 * @module utils/widget_bindings
 */

import { compareObjects } from './compare_objects.js';

const emptyArray = [];

/**
 * True if two binding descriptors are equal (shallow; same `source` identity).
 *
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
export function compareBinding(a, b) {
  return compareObjects(a, b);
}

/**
 * Manages a set of `widget.bind()` subscriptions. `update` diffs the previous
 * and next lists by index: equal descriptors keep their subscription; others
 * are replaced. Multiple bindings may share the same option `name`.
 */
export class WidgetBindings {
  /**
   * @param {object} widget
   *      Widget (or mock) with `bind(name, source, options)` and optionally
   *      `isDestructed()`.
   */
  constructor(widget) {
    this._widget = widget;
    /** @type {{ binding: object, unsubscribe: function }[]} */
    this._list = [];
  }

  /**
   * Install or update bindings.
   *
   * @param {object|object[]|null|undefined} bindings
   *      One or more `{ name, source, …BindingOptions }`. `null`/`undefined`
   *      clears all.
   */
  update(bindings) {
    const widget = this._widget;

    if (!widget || (widget.isDestructed && widget.isDestructed())) {
      this._clear();
      return;
    }

    const next =
      bindings == null
        ? emptyArray
        : Array.isArray(bindings)
        ? bindings
        : [bindings];
    const prev = this._list;
    const shared = Math.min(prev.length, next.length);

    for (let i = 0; i < shared; i++) {
      if (compareBinding(prev[i].binding, next[i])) continue;
      prev[i].unsubscribe();
      prev[i] = install(widget, next[i]);
    }

    if (next.length > prev.length) {
      for (let i = prev.length; i < next.length; i++) {
        prev.push(install(widget, next[i]));
      }
    } else if (prev.length > next.length) {
      for (let i = next.length; i < prev.length; i++) {
        prev[i].unsubscribe();
      }
      prev.length = next.length;
    }
  }

  /**
   * Unsubscribe all bindings and drop the widget reference.
   */
  dispose() {
    this._clear();
    this._widget = null;
  }

  _clear() {
    const list = this._list;
    for (let i = 0; i < list.length; i++) list[i].unsubscribe();
    list.length = 0;
  }
}

function noop() {}

function install(widget, binding) {
  if (!binding || !binding.source) {
    return { binding, unsubscribe: noop };
  }

  const { name, source, ...options } = binding;
  return {
    binding,
    unsubscribe: widget.bind(name, source, options),
  };
}
