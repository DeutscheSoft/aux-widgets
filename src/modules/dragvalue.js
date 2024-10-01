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
import { toggleClass } from '../utils/dom.js';
import { domScheduler } from '../dom_scheduler.js';
import { MASK_RENDER } from '../scheduler/scheduler.js';

function startDrag(value) {
  if (!value) return;
  const O = this.options;
  const ranged = O.range.call(this);
  this._position = ranged.get('transformation').valueToPixel(O.get.call(this));
  this.emit('startdrag', this.drag_state.start);
  if (O.events) O.events.call(this).emit('startdrag', this.drag_state.start);
}

function applyPosition(O, range, position) {
  const { transformation } = range.options;
  const { limit, set } = O;

  let value = transformation.pixelToValue(position);
  let clamped = false;

  if (limit) {
    const clampedValue = transformation.clampValue(value);
    if (clampedValue !== value) {
      clamped = true;
      value = clampedValue;
    }
  }

  set.call(this, value);
  return clamped;
}

/* This version integrates movements, instead
 * of using the global change since the beginning */
function moveCaptureInt(O, range, state) {
  /* O.direction is always 'polar' here */

  /* movement since last event */
  const v = state.prevDistance();
  const rangeOptions = range.options;
  const { _direction, absolute, _cutoff } = O;

  if (!v[0] && !v[1]) return;

  let distance = Math.sqrt(v[0] * v[0] + v[1] * v[1]);

  const c = (_direction[0] * v[0] - _direction[1] * v[1]) / distance;

  if (Math.abs(c) > _cutoff) return;

  if (v[0] * _direction[1] + v[1] * _direction[0] < 0) distance = -distance;

  const { step } = rangeOptions;

  distance *= step || 1;

  const e = state.current;

  if (e.ctrlKey || e.altKey) {
    distance *= rangeOptions.shift_down;
  } else if (e.shiftKey) {
    distance *= rangeOptions.shift_up;
  }

  const position = this._position + distance;

  const clamped = applyPosition.call(this, O, range, position);

  if (!absolute && clamped) return;

  this._position = position;
}

function moveCaptureAbs(O, range, state) {
  const { direction, reverse } = O;
  const rangeOptions = range.options;
  const { step } = rangeOptions;
  const vDistance = state.vDistance();

  let distance = direction === 'vertical' ? -vDistance[1] : vDistance[0];

  if (reverse) distance = -distance;

  distance *= step || 1;

  const e = state.current;

  if (e.ctrlKey && e.shiftKey) {
    distance *= rangeOptions.shift_down;
  } else if (e.shiftKey) {
    distance *= rangeOptions.shift_up;
  }

  applyPosition.call(this, O, range, this._position + distance);
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
      dragging: 'boolean',
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
      dragging: false,
    };
  }

  static get static_events() {
    return {
      set_state: startDrag,
      set_dragging: function () {
        domScheduler.schedule(MASK_RENDER, () => {
          if (this.isDestructed()) return;
          const O = this.options;
          const node = O.classes || O.node;
          const dragging = O.dragging;

          toggleClass(node, 'aux-dragging', dragging);

          if (dragging) {
            setCursor.call(this);
          } else {
            removeCursor();
          }
        });
      },
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
        this.set('dragging', true);
      },
      stopdrag: function () {
        this.set('dragging', false);
      },
    };
  }

  initialize(widget, options) {
    super.initialize(widget, options);
    this._position = 0;
    const O = this.options;
    this.set('rotation', O.rotation);
    this.set('blind_angle', O.blind_angle);
  }
}
