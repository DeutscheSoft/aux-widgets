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

/* jshint -W018 */
/* jshint -W086 */

import { DragCapture } from './dragcapture.js';
import { setGlobalCursor, unsetGlobalCursor } from '../utils/global_cursor.js';
import { warn } from '../utils/log.js';
import { addClass, removeClass } from '../utils/dom.js';
import { S } from '../dom_scheduler.js';

function startDrag(value) {
  if (!value) return;
  const O = this.options;
  const ranged = O.range.call(this);
  this.start_pos = ranged.get('transformation').valueToPixel(O.get.call(this));
  this.emit('startdrag', this.drag_state.start);
  if (O.events) O.events.call(this).emit('startdrag', this.drag_state.start);
}

/* This version integrates movements, instead
 * of using the global change since the beginning */
function moveCaptureInt(O, range, state) {
  /* O.direction is always 'polar' here */

  /* movement since last event */
  const v = state.prevDistance();
  const RO = range.options;

  if (!v[0] && !v[1]) return;

  const V = O._direction;

  let dist = Math.sqrt(v[0] * v[0] + v[1] * v[1]);

  const c = (V[0] * v[0] - V[1] * v[1]) / dist;

  if (Math.abs(c) > O._cutoff) return;

  if (v[0] * V[1] + v[1] * V[0] < 0) dist = -dist;

  let multi = RO.step || 1;
  const e = state.current;

  if (e.ctrlKey || e.altKey) {
    multi *= RO.shift_down;
  } else if (e.shiftKey) {
    multi *= RO.shift_up;
  }

  dist *= multi;
  const start_pos = this.start_pos + dist;
  const transformation = range.get('transformation');

  const nval = transformation.pixelToValue(start_pos);
  if (O.limit) O.set.call(this, Math.min(RO.max, Math.max(RO.min, nval)));
  else O.set.call(this, nval);

  if (!O.absolute && (!(nval > RO.min) || !(nval < RO.max))) return;

  this.start_pos = start_pos;
}

function moveCaptureAbs(O, range, state) {
  let dist;
  const RO = range.options;
  switch (O.direction) {
    case 'vertical':
      dist = -state.vDistance()[1];
      break;
    default:
      warn('Unsupported direction:', O.direction);
      break;
    case 'horizontal':
      dist = state.vDistance()[0];
      break;
  }
  if (O.reverse) dist *= -1;

  let multi = RO.step || 1;
  const e = state.current;

  if (e.ctrlKey && e.shiftKey) {
    multi *= RO.shift_down;
  } else if (e.shiftKey) {
    multi *= RO.shift_up;
  }

  dist *= multi;

  const transformation = range.get('transformation');

  const nval = transformation.pixelToValue(this.start_pos + dist);

  if (O.limit) O.set.call(this, Math.min(RO.max, Math.max(RO.min, nval)));
  else O.set.call(this, nval);
}

function moveCapture(state) {
  const O = this.options;

  if (O.active === false) return false;

  state = this.drag_state;
  const range = O.range.call(this);

  if (O.direction === 'polar') {
    moveCaptureInt.call(this, O, range, state);
  } else {
    moveCaptureAbs.call(this, O, range, state);
  }

  this.emit('dragging', state.current);
  if (O.events) O.events.call(this).emit('dragging', state.current);
}

function stopDrag(state, ev) {
  this.emit('stopdrag', ev);
  const O = this.options;
  if (O.events) O.events.call(this).emit('stopdrag', ev);
}

function setCursor() {
  switch (this.options.direction) {
    case 'vertical':
      setGlobalCursor('row-resize');
      break;
    case 'horizontal':
      setGlobalCursor('col-resize');
      break;
    case 'polar':
      setGlobalCursor('move');
      break;
  }
}
function removeCursor() {
  unsetGlobalCursor('row-resize');
  unsetGlobalCursor('col-resize');
  unsetGlobalCursor('move');
}

/**
 * DragValue enables dragging an element and setting a
 * value according to the dragged distance. DragValue is for example
 * used in {@link Knob} and {@link ValueButton}.
 *
 * @class DragValue
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Element} options.node - The DOM node used for dragging.
 *   All DOM events are registered with this Element.
 * @property {Function} [options.range] - A function returning a
 *  {@link Ranged} object for
 *  calculating the value. Returns its parent (usually having
 *  {@link Ranged}-features) by default.
 * @property {Function} [options.events] - Returns an element firing the
 *   events <code>startdrag</code>, <code>dragging</code> and <code>stopdrag</code>.
 *   By default it returns <code>this.parent</code>.
 * @property {Element|boolean} [options.classes=false] - While dragging, the class
 *   <code>.aux-dragging</code> will be added to this element. If set to <code>false</code>
 *   the class will be set on <code>options.node</code>.
 * @property {Function} [options.get] - Callback function returning the value to drag.
 *   By default it returns <code>this.parent.options.value</code>.
 * @property {Function} [options.set] - Callback function for setting the value.
 *   By default it calls <code>this.parent.userset("value", [value]);</code>.
 * @property {String} [options.direction="polar"] - Direction for changing the value.
 *   Can be <code>polar</code>, <code>vertical</code> or <code>horizontal</code>.
 * @property {Boolean} [options.active=true] - If false, dragging is deactivated.
 * @property {Boolean} [options.cursor=false] - If true, a global cursor is set while dragging.
 * @property {Number} [options.blind_angle=20] - If options.direction is <code>polar</code>,
 *   this is the angle of separation between positive and negative value changes
 * @property {Number} [options.rotation=45] - Defines the angle of the center of the positive value
 *   changes. 0 means straight upward. For instance, a value of 45 leads to increasing value when
 *   moving towards top and right.
 * @property {Boolean} [options.reverse=false] - If true, the difference of pointer travel is inverted.
 * @property {Boolean} [options.limit=false] - Limit the returned value to min and max of the range.
 *
 * @extends DragCapture
 */
/**
 * Is fired while a user is dragging.
 *
 * @event DragValue#dragging
 *
 * @param {DOMEvent} event - The native DOM event.
 */
/**
 * Is fired when a user starts dragging.
 *
 * @event DragValue#startdrag
 *
 * @param {DOMEvent} event - The native DOM event.
 */
/**
 * Is fired when a user stops dragging.
 *
 * @event DragValue#stopdrag
 *
 * @param {DOMEvent} event - The native DOM event.
 */
export class DragValue extends DragCapture {
  static get _options() {
    return {
      get: 'function',
      set: 'function',
      range: 'function',
      events: 'function',
      classes: 'object|boolean',
      direction: 'string',
      active: 'boolean',
      cursor: 'boolean',
      blind_angle: 'number',
      rotation: 'number',
      reverse: 'boolean',
      limit: 'boolean',
      absolute: 'boolean',
    };
  }

  static get options() {
    return {
      range: function () {
        return this.parent;
      },
      classes: false,
      get: function () {
        return this.parent.options.value;
      },
      set: function (v) {
        this.parent.userset('value', v);
      },
      events: function () {
        return this.parent;
      },
      direction: 'polar',
      active: true,
      cursor: false,
      blind_angle: 20,
      rotation: 45,
      reverse: false,
      limit: false,
      absolute: false,
    };
  }

  static get static_events() {
    return {
      set_state: startDrag,
      stopcapture: stopDrag,
      startcapture: function () {
        if (this.options.active) return true;
      },
      set_rotation: function (v) {
        v *= Math.PI / 180;
        this.set('_direction', [-Math.sin(v), Math.cos(v)]);
      },
      set_blind_angle: function (v) {
        v *= Math.PI / 360;
        this.set('_cutoff', Math.cos(v));
      },
      movecapture: moveCapture,
      startdrag: function () {
        S.add(
          function () {
            const O = this.options;
            addClass(O.classes || O.node, 'aux-dragging');
            if (O.cursor) {
              setCursor.call(this);
            }
          }.bind(this),
          1
        );
      },
      stopdrag: function () {
        S.add(
          function () {
            const O = this.options;
            removeClass(O.classes || O.node, 'aux-dragging');
            if (O.cursor) {
              removeCursor.call(this);
            }
          }.bind(this),
          1
        );
      },
    };
  }

  initialize(widget, options) {
    super.initialize(widget, options);
    this.start_pos = 0;
    const O = this.options;
    this.set('rotation', O.rotation);
    this.set('blind_angle', O.blind_angle);
  }
}
