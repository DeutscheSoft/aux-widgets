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

import { Range } from './range.js';
import { DragValue } from './dragvalue.js';
import { Base } from '../implements/base.js';
import { addClass, removeClass } from '../utils/dom.js';

function extractMatrix(t) {
  const a = t.indexOf('matrix(');
  if (a < 0) return;
  t = t.substring(a + 7);
  return t
    .split(')')[0]
    .split(',')
    .map(function (v) {
      return parseInt(v.trim());
    });
}

function xyFromTransform(t) {
  const mx = extractMatrix(t);
  return !mx || !mx.length ? [0, 0] : [mx[4], mx[5]];
}

function startDrag(e) {
  this._dragged = 0;
  const O = this.options;
  if (!O.active) return;
  if (e.button !== void 0 && e.button > 0) return;
  this._xstart = this._xlast = e.pageX;
  this._ystart = this._ylast = e.pageY;
  if (O.transform) {
    const xy = xyFromTransform(this._style.transform);
    this._xpos = xy[0];
    this._ypos = xy[1];
  } else {
    this._xpos = O.node.offsetLeft;
    this._ypos = O.node.offsetTop;
  }
  addClass(O.node, 'aux-dragging');
}
function stopDrag(e) {
  if (!this.options.active) return;
  if (e.button !== void 0 && e.button > 0) return;
  removeClass(this.options.node, 'aux-dragging');
}
function dragging(e) {
  const O = this.options;
  if (!O.active) return;
  if (e.button !== void 0 && e.button > 0) return;
  this._dragged +=
    (Math.abs(e.pageX - this._xlast) + Math.abs(e.pageY - this._ylast)) / 2;
  if (this._dragged < O.initial) return;
  this._xlast = e.pageX;
  this._ylast = e.pageY;
  let x = this._xpos + e.pageX - this._xstart;
  let y = this._ypos + e.pageY - this._ystart;
  if (O.min.x !== false) x = Math.max(O.min.x, x);
  if (O.max.x !== false) x = Math.min(O.max.x, x);
  if (O.min.y !== false) y = Math.max(O.min.y, y);
  if (O.max.y !== false) y = Math.min(O.max.y, y);
  if (O.transform) {
    const t = this._style.transform;
    const mx = extractMatrix(t);
    mx[4] = x;
    mx[5] = y;
    const nt = t.replace(/matrix\([0-9 ,]*\)/, 'matrix(' + mx.join(',') + ')');
    O.node.style.transform = nt;
  } else {
    O.node.style.top = y + 'px';
    O.node.style.left = x + 'px';
  }
}
function setHandle() {
  const h = this.options.handle;
  if (this.drag) this.drag.destroy();
  const range = new Range({});
  this.drag = new DragValue(this, {
    node: h,
    range: function () {
      return range;
    },
    get: function () {
      return 0;
    },
    set: function () {
      return;
    },
  });
}
/**
 * Drag enables dragging of elements on the screen positioned absolutely or by CSS transformation.
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {HTMLElement|SVGElement} options.node - The element to drag.
 * @property {HTMLElement|SVGElement} [options.handle] A DOM node to be used as a handle. If not set, <code>options.node</code> is used.
 * @property {Boolean} [options.active=true] - Enable or disable dragging
 * @property {Object|Boolean} [options.min={x: false, y: false}] - Object containing the minimum positions for x and y. A value of <code>false</code> is interpreted as no minimum.
 * @property {Object|Boolean} [options.max={x: false, y: false}] - Object containing the maximum positions for x and y. A value of <code>false</code> is interpreted as no maximum.
 * @property {Number} [options.initial=2] - Number of pixels the user has to move until dragging starts.
 * @property {Boolean} [options.transform=false] - Use CSS transformations instead of absolute positioning.
 *
 * @extends Base
 *
 * @class Drag
 */
/**
 * The user is dragging this item.
 *
 * @event Drag#dragging
 *
 * @param {DOMEvent} event - The native DOM event.
 */
/**
 * The user started dragging this item.
 *
 * @event Drag#startdrag
 *
 * @param {DOMEvent} event - The native DOM event.
 */
/**
 * The user stopped dragging this item.
 *
 * @event Drag#stopdrag
 *
 * @param {DOMEvent} event - The native DOM event.
 */
export class Drag extends Base {
  static get _options() {
    return {
      node: 'object',
      handle: 'object',
      active: 'boolean',
      min: 'object',
      max: 'object',
      initial: 'number',
      transform: 'boolean',
    };
  }

  static get options() {
    return {
      node: null,
      handle: null,
      active: true,
      min: { x: false, y: false },
      max: { x: false, y: false },
      initial: 2,
      transform: false,
    };
  }

  static get static_events() {
    return {
      startdrag: startDrag,
      dragging: dragging,
      stopdrag: stopDrag,
    };
  }

  initialize(options) {
    super.initialize(options);
    this.set('handle', this.options.handle);
    this.set('node', this.options.node);
  }

  // GETTERS & SETTERS
  set(key, value) {
    if (key === 'node') this._style = window.getComputedStyle(value);
    if (key === 'handle' && !value) value = this.options.node;

    super.set(key, value);

    if (key === 'handle') setHandle.call(this);
    if (key === 'initial' && this.drag) this.drag.set('initial', value);
  }
}
