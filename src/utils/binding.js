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

/* jshint -W078 */

/**
 * This module contains functions for creating Widget option bindings.
 *
 * @module utils/binding
 */

import { warn } from './log.js';
import { Timer } from './timers.js';
import { Subscriptions } from './subscriptions.js';

function assertOption(widget, name) {
  if (!widget.getOptionType(name) && !String(name).startsWith('_'))
    throw new Error('No such option: ' + name);
}

/**
 * This function subscribes to those changes to option `name`
 * which are initiated by user action. Returns a function
 * which can be called to unsubscribe.
 *
 * @example
 *      const unsubscribe = observeUseraction(fader, 'value', (value) => {
 *        console.log('Fader value changed to %o', value);
 *      });
 *
 *      setTimeout(unsubscribe, 1000);
 */
export function observeUseraction(widget, name, callback) {
  assertOption(widget, name);

  return widget.subscribe('useraction', (key, value) => {
    if (key === name) callback(value);
  });
}

/**
 * This function subscribes to changes to option `name`.
 * Returns a function which can be called to unsubscribe.
 * Unless `replay` is false, the callback is called immediately with the
 * current value, then on each change.
 *
 * @param {Object} widget - The widget.
 * @param {string} name - The option name.
 * @param {function} callback - Called with the option value.
 * @param {boolean} [replay=true] - If true, call callback with the current value immediately.
 *
 * @example
 *      const unsubscribe = observeOption(fader, 'value', (value) => {
 *        console.log('Fader value is %o now.', value);
 *      });
 *
 *      setTimeout(unsubscribe, 1000);
 */
export function observeOption(widget, name, callback, replay) {
  assertOption(widget, name);

  if (replay !== false) callback(widget.get(name));

  return widget.subscribe('set_' + name, (value) => {
    callback(value);
  });
}

export function interceptOption(widget, name, callback) {
  assertOption(widget, name);

  return widget.subscribe('userset', (_name, value) => {
    if (_name !== name) return;
    callback(value);
    return false;
  });
}

/**
 * Holds values while the user is interacting with a widget, then calls
 * `apply` with the last pending value after a grace timeout once interaction
 * ends.
 *
 * Requires the widget to have an `interacting` option.
 *
 * `apply` is required so callers (e.g. {@link bindOption}) can control how
 * values are written — including wrapping writes in a loop guard.
 */
export class InteractionSuppress {
  /**
   * @param {Object} widget - The Widget (for the `interacting` option).
   * @param {function} apply - Called with the value when it should be applied.
   * @param {Number} [time=500] - Grace time in ms after `interacting` becomes
   *    false before applying the pending value.
   */
  constructor(widget, apply, time) {
    if (typeof apply !== 'function')
      throw new TypeError('Expected apply function.');
    if (time === void 0) time = 500;

    this.widget = widget;
    this.time = time;
    this._timer = new Timer(() => {
      this._flush();
    });
    this._subscriptions = new Subscriptions();
    this._subscriptions.add(() => this._timer.stop());
    this._last_value = null;
    this._has_value = false;
    this._interacting = false;
    this._apply = apply;

    if (widget.getOptionType('interacting')) {
      this._interacting = !!widget.get('interacting');
      this._subscriptions.add(
        observeOption(
          widget,
          'interacting',
          (value) => {
            value = !!value;
            if (value === this._interacting) return;
            this._interacting = value;
            if (value) {
              this._timer.stop();
            } else if (this._has_value) {
              if (this.time > 0) this._timer.restart(this.time);
              else this._flush();
            }
          },
          false
        )
      );
    } else {
      warn(
        "%o does not have an 'interacting' option. InteractionSuppress will not suppress.",
        widget
      );
    }
  }

  /**
   * Returns true if values are currently being suppressed.
   */
  isLocked() {
    return this._interacting || this._timer.active;
  }

  _flush() {
    this._timer.stop();
    if (!this._has_value) return;
    if (this._interacting) return;

    this._has_value = false;
    const value = this._last_value;
    this._apply(value);
  }

  /**
   * Receive a value. Unless suppressed by interaction or the grace timer,
   * this calls `apply` immediately.
   */
  set(value) {
    this._last_value = value;
    this._has_value = true;

    if (this.isLocked()) return;

    this._flush();
  }

  /**
   * Remove all event subscriptions. Delayed values are discarded.
   */
  destroy() {
    this._subscriptions.unsubscribe();
    this._has_value = false;
  }
}

/**
 * Install a binding between a widget option and a value stream.
 *
 * @param {Object} widget - The widget.
 * @param {string} name - The option name.
 * @param {Object} source - Object with optional `subscribe` and/or `set`.
 * @param {Object} [options]
 * @param {string} [options.event='useraction'] - `'useraction'`, `'set'`, or `'userset'`.
 * @param {boolean} [options.receive=true] - Apply values from `source.subscribe`.
 * @param {boolean} [options.send=true] - Call `source.set` from widget events.
 * @param {boolean} [options.update=true] - Use `widget.update` for incoming values.
 * @param {boolean} [options.suppressWhileInteracting=false]
 * @param {number} [options.suppressTimeout=500]
 * @returns {function} Unsubscribe function.
 */
export function bindOption(widget, name, source, options) {
  assertOption(widget, name);

  if (!source || typeof source !== 'object')
    throw new TypeError('Expected binding source object.');

  if (!options) options = {};

  const canReceive = typeof source.subscribe === 'function';
  const canSend = typeof source.set === 'function';
  const receive = options.receive !== false && canReceive;
  const send = options.send !== false && canSend;

  if (!receive && !send) {
    throw new Error(
      'Binding needs at least one active direction (subscribe and/or set).'
    );
  }

  const event = options.event || 'useraction';
  const useUpdate = options.update !== false;
  const suppressTimeout =
    options.suppressTimeout === void 0 ? 500 : options.suppressTimeout;
  const suppress =
    !!options.suppressWhileInteracting && !!widget.getOptionType('interacting');

  if (event !== 'useraction' && event !== 'set' && event !== 'userset')
    throw new Error('Invalid binding event: ' + event);

  const subscriptions = new Subscriptions();
  // Assume source.set may synchronously notify subscribe (e.g. a local
  // DynamicValue). When both directions are active, break loops with a shared
  // depth counter like AWML connect(): allow one nested hop, ignore deeper
  // recursion (rec > 1).
  let rec = 0;
  const guardLoop = (fun) => {
    return (value) => {
      if (rec > 1) return;
      rec++;
      try {
        return fun(value);
      } finally {
        rec--;
      }
    };
  };
  const wrap = receive && send ? guardLoop : (fun) => fun;

  if (receive) {
    const apply = wrap(
      useUpdate
        ? (value) => widget.update(name, value)
        : (value) => widget.set(name, value)
    );

    if (suppress) {
      const gate = new InteractionSuppress(widget, apply, suppressTimeout);
      subscriptions.add(
        source.subscribe((value) => {
          gate.set(value);
        })
      );
      subscriptions.add(() => gate.destroy());
    } else {
      subscriptions.add(source.subscribe(apply));
    }
  }

  if (send) {
    const emit = wrap((value) => source.set(value));

    if (event === 'set') {
      subscriptions.add(observeOption(widget, name, emit, false));
    } else if (event === 'useraction') {
      subscriptions.add(observeUseraction(widget, name, emit));
    } else {
      subscriptions.add(interceptOption(widget, name, emit));
    }
  }

  return subscriptions.toUnsubscribe();
}
