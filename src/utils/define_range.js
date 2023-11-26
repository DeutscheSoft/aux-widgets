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

import { Range } from '../modules/range.js';

/**
 * Add a new {@link Range} to the given widget. If <code>name</code> is set and
 * <code>this.options[name]</code> exists, is an object and <code>from</code>
 * is an object, too, both are merged before a range is created.
 *
 * @function defineRange
 *
 * @param {Widget} widget - The widget to define the range on.
 * @param {Function|Object} args - A function returning a {@link Range}
 *   instance or an object containing options for a new {@link Range}.
 * @param {string} name - Designator of the {@link Range}.
 *   If a name is set a new set function is added to the item to
 *   set the options of the {@link Range}. Use the set function like this:
 *   <code>this.set(name, {key: value});</code>
 *
 * @emits rangeadded
 *
 * @returns {Range} The new {@link Range}.
 */
export function defineRange(widget, args, name) {
  const rangeChanged = () => {
    widget.invalidate(name);
  };

  const rangeOptionChanged = (value, name) => {
    const range = widget[name];

    if (value === range) return;

    if (value instanceof Range) {
      range.off('set', rangeChanged);
      widget[name] = value;
      value.on('set', rangeChanged);
    } else {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key))
          range.set(key, value[key]);
      }
    }
  };

  let range;
  if (typeof args === 'function') {
    range = args();
  } else if (args instanceof Range) {
    range = args;
  } else {
    const currentRange = widget.getDefault(name);
    args = Object.assign({}, currentRange || {}, args || {});
    range = new Range(args);
  }
  if (name) {
    widget.set(name, range);
    widget[name] = range;
    widget.on('set_' + name, rangeOptionChanged);
  }
  /**
   * Gets fired when a new range is added
   *
   * @event Ranges#rangeadded
   *
   * @param {Range} range - The {@link Range} that was added.
   */
  widget.emit('rangeadded', range);
  range.on('set', rangeChanged);
  return range;
}
