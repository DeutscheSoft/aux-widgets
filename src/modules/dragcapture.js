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

import { Module } from './module.js';

/**
 * Base capture state for a single drag interaction.
 *
 * Expects `start` / `current` / `prev` to be DOM events with `clientX` / `clientY`
 * (typically a `PointerEvent`).
 *
 * @template {PointerEvent} TEvent
 */
class CaptureState {
  /**
   * @param {TEvent} start
   */
  constructor(start) {
    /** @type {TEvent} */
    this.start = start;
    /** @type {TEvent} */
    this.prev = start;
    /** @type {TEvent} */
    this.current = start;
  }

  /**
   * Euclidean distance from the starting position in CSS pixels.
   *
   * @returns {number}
   */
  distance() {
    const v = this.vDistance();
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  }

  /**
   * Update the current event.
   *
   * @param {TEvent} ev
   * @returns {boolean} `false` when the capture should be considered ended.
   */
  setCurrent(ev) {
    this.prev = this.current;
    this.current = ev;
    return true;
  }

  /**
   * Vector from the starting position to the current position.
   *
   * @returns {[number, number]} `[dx, dy]`
   */
  vDistance() {
    const start = this.start;
    const current = this.current;
    return [current.clientX - start.clientX, current.clientY - start.clientY];
  }

  /**
   * Vector between the previous and current position.
   *
   * @returns {[number, number]} `[dx, dy]`
   */
  prevDistance() {
    const prev = this.prev;
    const current = this.current;
    return [current.clientX - prev.clientX, current.clientY - prev.clientY];
  }
}

/* general api */
/**
 * Start a new capture if none is currently active.
 *
 * @this {DragCapture}
 * @param {CaptureState} state
 * @param {PointerEvent} ev
 * @returns {boolean|undefined} `true` when this instance captured the drag, `false` to ignore, `undefined` when no handler responded.
 */
function startCapture(state, ev) {
  /* do nothing, let other handlers be called */
  if (this.drag_state) return;

  const v = this.emit('startcapture', state, state.start, ev);

  if (v === true) {
    /* we capture this event */
    this.drag_state = state;
    this.set('state', true);
  }

  return v;
}
/**
 * Advance the current capture using the given event.
 *
 * @this {DragCapture}
 * @param {PointerEvent} ev
 * @returns {boolean|undefined} `false` when the capture was stopped, otherwise `undefined`.
 */
function moveCapture(ev) {
  const d = this.drag_state;

  if (!d.setCurrent(ev) || this.emit('movecapture', d, ev) === false) {
    this.stopCapture(ev);
    return false;
  }
}

/* pointer handling */
/**
 * Capture state for pointer-based drags.
 *
 * @extends {CaptureState<PointerEvent>}
 */
class PointerCaptureState extends CaptureState {
  /**
   * @param {PointerEvent} start
   */
  constructor(start) {
    super(start);
    /** @type {number} */
    this.pointerId = start.pointerId;
    /**
     * Back-reference to the widget that owns this capture.
     *
     * @type {DragCapture|null}
     */
    this._widget = null;
  }

  /**
   * @param {PointerEvent} ev
   * @returns {boolean}
   */
  setCurrent(ev) {
    if (!this.isDraggedBy(ev)) return false;
    return super.setCurrent(ev);
  }

  /**
   * Acquire pointer capture on the widget's node.
   *
   * @param {DragCapture} widget
   */
  init(widget) {
    this._widget = widget;
    const node = widget.options.node || widget.element;
    if (node.setPointerCapture) {
      try {
        node.setPointerCapture(this.pointerId);
      } catch (_e) {
        /* ignore if capture fails */
      }
    }
  }

  /** Release pointer capture if still held. */
  destroy() {
    if (!this._widget) return;
    const node = this._widget.options.node || this._widget.element;
    if (node && node.releasePointerCapture) {
      try {
        node.releasePointerCapture(this.pointerId);
      } catch (_e) {
        /* ignore if release fails or capture already lost */
      }
    }
    this._widget = null;
  }

  /**
   * Check that the given event belongs to this capture.
   *
   * @param {PointerEvent} ev
   * @returns {boolean}
   */
  isDraggedBy(ev) {
    return ev.pointerId === this.pointerId;
  }
}

/**
 * Pointer down handler starting a new drag interaction.
 *
 * @this {DragCapture}
 * @param {PointerEvent} ev
 * @returns {boolean|undefined}
 */
function pointerDown(ev) {
  const s = new PointerCaptureState(ev);
  const v = startCapture.call(this, s, ev);

  /* ignore this event if startCapture didn't return */
  if (v === void 0) return;

  ev.stopPropagation();
  ev.preventDefault();

  /* we did capture */
  if (v === true) s.init(this);

  if (this.options.focus) this.options.focus.focus();

  return false;
}
/**
 * Pointer move handler updating the active drag interaction.
 *
 * @this {DragCapture}
 * @param {PointerEvent} ev
 * @returns {boolean|undefined}
 */
function pointerMove(ev) {
  if (!this.drag_state) return;
  /* if event does not belong to current pointer, ignore */
  if (!this.drag_state.isDraggedBy(ev)) return;
  /* if movecapture returns false, the capture has ended */
  if (moveCapture.call(this, ev) !== false) {
    ev.preventDefault();
    ev.stopPropagation();
    return false;
  }
}
/**
 * Pointer up handler finishing the active drag interaction.
 *
 * @this {DragCapture}
 * @param {PointerEvent} ev
 * @returns {boolean|undefined}
 */
function pointerUp(ev) {
  const s = this.drag_state;
  if (!s || !s.isDraggedBy(ev)) return;
  this.stopCapture(ev);
  ev.stopPropagation();
  ev.preventDefault();
  return false;
}
/**
 * Pointer cancellation handler, e.g. when the OS or browser aborts the drag.
 *
 * @this {DragCapture}
 * @param {PointerEvent} ev
 * @returns {boolean|undefined}
 */
function pointerCancel(ev) {
  return pointerUp.call(this, ev);
}
/**
 * Handle `lostpointercapture` by cancelling the current drag.
 *
 * @this {DragCapture}
 * @param {PointerEvent} ev
 * @returns {boolean|undefined}
 */
function lostPointerCapture(ev) {
  return pointerCancel.call(this, ev);
}
/**
 * Static events wired up by the `Module` base class.
 *
 * @type {{[K in string]: Function}}
 */
const static_events = {
  set_node: function (value) {
    this.delegateEvents(value);
  },
  contextmenu: function () {
    return false;
  },
  delegated: [
    function (element, old_element) {
      /* cancel the current capture */
      if (old_element) this.stopCapture();
    },
  ],
  pointerdown: pointerDown,
  pointermove: pointerMove,
  pointerup: pointerUp,
  pointercancel: pointerCancel,
  lostpointercapture: lostPointerCapture,
};

/**
 * DragCapture is a low-level class for tracking drag interaction using both
 *   touch and mouse events. It can be used for implementing drag'n'drop
 *   functionality as well as value dragging e.g. {@link Fader} or
 *   {@link Knob}. {@link DragValue} derives from DragCapture.
 *
 *   Each drag interaction started by the user begins with the
 *   `startcapture` event. If an event handler returns `true`, the dragging
 *   is started. Otherwise mouse or touch events which belong to the same
 *   drag interaction are ignored.
 *
 *   While the drag interaction is running, the `movecapture` is fired for
 *   each underlying move event. Once the drag interaction completes, the
 *   `stopcapture` event is fired.
 *
 *   While the drag interaction is running, the `state()` method returns a
 *   CaptureState object. This object has methods for calculating current
 *   position, distance from the start position etc.
 *
 *
 * @extends Module
 *
 * @param {Object} widget - The parent widget making use of DragValue.
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {HTMLElement} [options.node] - The DOM element receiving the drag events. If not set the widgets element is used.
 * @property {HTMLElement|Boolean} [options.focus=false] - Focus this element on scroll. Set to `false`
 *   if no focus should be set.
 *
 * @class DragCapture
 */
/**
 * Capturing started.
 *
 * @event DragCapture#startcapture
 *
 * @param {object} state - An internal state object.
 * @param {DOMEvent} start - The event object of the initial event.
 */

/**
 * A movement was captured.
 *
 * @event DragCapture#movecapture
 *
 * @param {DOMEvent} event - The event object of the current move event.
 */

/**
 * Capturing stopped.
 *
 * @event DragCapture#stopcapture
 *
 * @param {object} state - An internal state object.
 * @param {DOMEvent} event - The event object of the current event.
 */
export class DragCapture extends Module {
  /**
   * @typedef {Object} DragCaptureOptions
   * @property {HTMLElement} [node] DOM element receiving pointer events.
   * @property {boolean} [state]
   * @property {HTMLElement|boolean} [focus]
   */

  static get _options() {
    return {
      node: 'object',
      state: 'boolean' /* internal, undocumented */,
      focus: 'object|boolean',
    };
  }

  static get options() {
    return {
      state: false,
      focus: false,
    };
  }

  /**
   * Events used by this module.
   *
   * @returns {typeof static_events}
   */
  static get static_events() {
    return static_events;
  }

  /**
   * @param {import('../widgets/widget.js').Widget} widget
   * @param {DragCaptureOptions} O
   */
  initialize(widget, O) {
    super.initialize(widget, O);
    this.drag_state = null;
    if (O.node === void 0) O.node = widget.element;
    this.set('node', O.node);
  }

  destroy() {
    this.cancelDrag();
    super.destroy();
  }

  /**
   * Stop the current capture, if any.
   *
   * @param {PointerEvent} [ev]
   */
  stopCapture(ev) {
    const s = this.drag_state;
    if (s === null) return;

    this.emit('stopcapture', s, ev);
    this.set('state', false);
    s.destroy();
    this.drag_state = null;
  }

  /**
   * Cancel the current drag interaction, if any.
   *
   * @param {PointerEvent} [ev]
   */
  cancelDrag(ev) {
    this.stopCapture();
  }

  /**
   * Whether a drag interaction is currently active.
   *
   * @returns {boolean}
   */
  dragging() {
    return this.options.state;
  }

  /**
   * Current capture state, if any.
   *
   * @returns {PointerCaptureState|null}
   */
  state() {
    return this.drag_state;
  }

  /**
   * Check whether the given event belongs to the current drag interaction.
   *
   * @param {PointerEvent} ev
   * @returns {boolean}
   */
  isDraggedBy(ev) {
    return this.drag_state !== null && this.drag_state.isDraggedBy(ev);
  }
}
