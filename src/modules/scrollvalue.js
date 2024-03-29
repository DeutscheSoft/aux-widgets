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

import { addClass, removeClass } from '../utils/dom.js';
import { Module } from './module.js';

function scrollTimeout() {
  /**
   * Is fired when scrolling ended.
   *
   * @event ScrollValue#scrollended
   */
  fireEvent.call(this, 'scrollended');
  this._wheel = false;
  this.__sto = false;
  this.set('scrolling', false);
  removeClass(this.options.classes, 'aux-scrolling');
}
function scrollWheel(e) {
  const O = this.options;
  if (!O.active) return;
  e.preventDefault();
  if (O.focus) O.focus.focus();
  const range = O.range.call(this);
  const DIR = O.scroll_direction;
  const RO = range.options;
  const rev = e.webkitDirectionInvertedFromDevice ? -1 : 1;
  const d = e.deltaX * DIR[0] + e.deltaY * DIR[1] + e.deltaZ * DIR[2];
  let direction = d > 0 ? 1 : -1;
  direction *= rev;
  let v;

  // timeout for resetting the class
  if (this._wheel) {
    v = this._raw_value;
    window.clearTimeout(this.__sto);
  } else {
    this._raw_value = v = O.get.call(this);
    addClass(O.classes, 'aux-scrolling');
    /**
     * Is fired when scrolling starts.
     *
     * @event ScrollValue#scrollstarted
     *
     * @param {DOMEvent} event - The native DOM event.
     */
    fireEvent.call(this, 'scrollstarted', e);
    this._wheel = true;
  }
  this.__sto = window.setTimeout(scrollTimeout.bind(this), 200);

  // calc step depending on options.step, .shift up and .shift down
  let step = (RO.step || 1) * direction;
  if (e.ctrlKey || e.altKey) {
    step *= RO.shift_down;
  } else if (e.shiftKey) {
    step *= RO.shift_up;
  }

  const transformation = range.get('transformation');

  let pos = transformation.valueToPixel(v);

  pos += step;

  v = transformation.pixelToValue(pos);

  if (O.limit) O.set.call(this, Math.min(RO.max, Math.max(RO.min, v)));
  else O.set.call(this, v);

  /**
   * Is fired while scrolling happens.
   *
   * @event ScrollValue#scrolling
   *
   * @param {DOMEvent} event - The native DOM event.
   */
  fireEvent.call(this, 'scrolling', e);

  /* do not remember out of range values */
  if (v > RO.min && v < RO.max) this._raw_value = v;

  return false;
}
function fireEvent(title, event) {
  const O = this.options;
  // fire an event on this drag object and one with more
  // information on the draggified element
  this.emit(title, this, event);
  const e = O.events.call(this);
  if (e)
    e.emit(title, event, O.get.call(this), O.node, this, O.range.call(this));
}
/**
 * ScrollValue enables the scroll wheel for setting a value of an
 * object. For instance, it is used by {@link Knob} to allow turning
 * the knob using the scroll wheel.
 *
 * @class ScrollValue
 *
 * @extends Module
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {HTMLElement} options.node - The element receiving the scroll event.
 * @property {Function} [options.get=function () { return this.parent.options.value; }] - Callback returning the value.
 * @property {Function} [options.set=function (v) { return this.parent.userset("value", v); }] - Callback setting the value.
 * @property {Function} [options.range=function () { return this.parent; }] - A function returning a {@link Range} instance or options for a new one.
 * @property {Function|Boolean} [options.events=false] - A function returning
 *   an element receiving events or <code>false</code> to fire events on the main element.
 * @property {HTMLElement|Boolean} [options.classes=false] - Element receiving
 *   classes or <code>false</code> to set classes on the main element.
 * @property {Boolean} [options.active=true] - Disable the scroll event.
 * @property {Array<Number>} [options.scroll_direction=[0, -1, 0]] - An array
 *   containing values for x, y and z defining the direction of scrolling.
 * @property {Boolean} [options.limit=false] - Limit the returned value to min and max of the range.
 * @property {HTMLElement|Boolean} [options.focus=false] - Focus this element on scroll. Set to `false`
 *   if no focus should be set.
 */
export class ScrollValue extends Module {
  static get _options() {
    return {
      get: 'function',
      set: 'function',
      range: 'function',
      events: 'function',
      classes: 'object|boolean',
      node: 'object|boolean',
      active: 'boolean',
      scroll_direction: 'array',
      limit: 'boolean',
      focus: 'object|boolean',
    };
  }

  static get options() {
    return {
      range: function () {
        return this.parent;
      },
      events: function () {
        return this.parent;
      },
      classes: false,
      get: function () {
        return this.parent.options.value;
      },
      set: function (v) {
        return this.parent.userset('value', v);
      },
      active: true,
      scroll_direction: [0, -1, 0],
      limit: false,
      focus: false,
    };
  }

  initialize(widget, options) {
    super.initialize(widget, options);
    this._wheel = false;
    this._raw_value = 0.0;
    this.set('node', this.options.node);
    this.set('events', this.options.events);
    this.set('classes', this.options.classes);
  }

  static get static_events() {
    return {
      set_node: function (value) {
        this.delegateEvents(value);
        if (value && !this.options.classes) this.set('classes', value);
      },
      wheel: scrollWheel,
    };
  }

  set(key, value) {
    if (key === 'classes' && !value) value = this.options.node;
    return super.set(key, value);
  }
}
