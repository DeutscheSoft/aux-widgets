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

import { define_class } from './../widget_helpers.js';
import { Range } from './range.js';
import { DragValue } from './dragvalue.js';
import { Base } from '../implements/base.js';

function dragstart(e) {
  var O = this.options;
  if (!O.active) return;
  var E = O.node;
  this._xstart = e.pageX;
  this._ystart = e.pageY;
  this._xsize = E.offsetWidth;
  this._ysize = E.offsetHeight;
  this._xpos = E.offsetLeft;
  this._ypos = E.offsetTop;
  /**
   * Is fired when resizing starts.
   *
   * @event Resize#resizestart
   *
   * @param {DOMEvent} event - The native DOM event.
   */
  this.emit('resizestart', e);
}
function dragend(e) {
  if (!this.options.active) return;
  /**
   * Is fired when resizing stops.
   *
   * @event Resize#resizestop
   *
   * @param {DOMEvent} event - The native DOM event.
   */
  this.emit('resizestop', e);
}
function dragging(e) {
  var O = this.options;
  if (!O.active) return;
  var w = this._xsize + e.pageX - this._xstart;
  var h = this._ysize + e.pageY - this._ystart;
  if (O.min.x >= -1) w = Math.max(O.min.x, w);
  if (O.max.x >= -1) w = Math.min(O.max.x, w);
  if (O.min.y >= -1) h = Math.max(O.min.y, h);
  if (O.max.y >= -1) h = Math.min(O.max.y, h);
  O.node.style.width = w + 'px';
  O.node.style.height = h + 'px';

  /**
   * Is fired when resizing is in progress.
   *
   * @event Resize#resizing
   *
   * @param {DOMEvent} event - The native DOM event.
   * @param {int} width - The new width of the element.
   * @param {int} height - The new height of the element.
   */
  this.emit('resizing', e, w, h);
}
function set_handle() {
  var h = this.options.handle;
  if (this.drag) this.drag.destroy();
  var range = new Range({});
  this.drag = new DragValue(this, {
    node: h,
    range: function () {
      return range;
    },
    onStartdrag: dragstart.bind(this),
    onStopdrag: dragend.bind(this),
    onDragging: dragging.bind(this),
  });
}
/**
 * Resize allows resizing of elements. It does that by continuously resizing an
 * element while the user drags a handle.
 *
 * @class Resize
 *
 * @extends Base
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {HTMLElement} options.node - The element to resize.
 * @property {HTMLElement} [options.handle] - A DOM node used as handle.
 *   If none set the element is used.
 * @property {Boolean} [active=true] - Set to false to disable resizing.
 * @property {Object} [options.min={x: -1, y: -1}] - Object containing x
 *   and y determining minimum size. A value of -1 means no minimum.
 * @property {Object} [options.max={x: -1, y: -1}] - Object containing x
 *   and y determining maximum size. A value of -1 means no maximum.
 */
export const Resize = define_class({
  // Resize enables resizing of elements on the screen.
  Extends: Base,
  _options: {
    handle: 'object',
    active: 'boolean',
    min: 'object',
    max: 'object',
    node: 'object',
  },
  options: {
    node: null,
    handle: null,
    active: true,
    min: { x: -1, y: -1 },
    max: { x: -1, y: -1 },
  },
  initialize: function (options) {
    Base.prototype.initialize.call(this, options);
    this.set('handle', this.options.handle);
  },
  // GETTERS & SETTERS
  set: function (key, value) {
    if (key === 'handle') {
      if (!value) value = this.options.node;
      set_handle.call(this);
    }
    Base.prototype.set.call(this, key, value);
  },
});
