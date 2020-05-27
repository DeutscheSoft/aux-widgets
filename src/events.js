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

import { warn } from './utils/log.js';

function addEventHandler(to, event, fun) {
  if (to === null) to = new Map();

  let tmp = to.get(event);

  if (!tmp) {
    tmp = fun;
  } else if (Array.isArray(tmp)) {
    tmp = tmp.concat([fun]);
  } else {
    tmp = [tmp, fun];
  }

  to.set(event, tmp);

  return to;
}

function removeEventHandler(to, event, fun) {
  if (to === null) return null;

  let tmp = to.get(event);

  if (Array.isArray(tmp)) {
    tmp = tmp.filter((f) => f !== fun);
    if (tmp.length === 1) tmp = tmp[0];
    else if (tmp.length === 0) tmp = null;
  } else if (tmp === fun) {
    tmp = null;
  }

  if (tmp === null) {
    to.delete(event);
    if (to.size === 0) to = null;
  } else {
    to.set(event, tmp);
  }

  return to;
}

function hasEventHandler(handlers, name, callback) {
  if (handlers === null) return false;

  const tmp = handlers.get(name);

  if (tmp === void 0) return false;

  if (typeof callback === 'undefined') return true;

  if (typeof callback !== 'function') throw new TypeError('Expected function.');

  if (Array.isArray(tmp)) {
    return tmp.indexOf(callback) !== -1;
  } else {
    return tmp === callback;
  }
}

function callEventHandler(fun, self, args) {
  try {
    return fun.apply(self, args);
  } catch (e) {
    warn('event handler', fun, 'threw', e);
  }
}

function emitEvent(handlers, name, self, args) {
  if (handlers === null) return;

  const tmp = handlers.get(name);

  if (tmp === void 0) return;

  if (Array.isArray(tmp)) {
    for (let i = 0; i < tmp.length; i++) {
      const ret = callEventHandler(tmp[i], self, args);

      if (ret !== void 0) return ret;
    }
    return;
  } else {
    return callEventHandler(tmp, self, args);
  }
}

/**
 * This class implements event handling.
 */
export class Events {
  constructor() {
    this._event_handlers = null;
  }

  /**
   * Register an event handler. If the same event handler is already
   * registered, an exception is thrown.
   *
   * @param {string} name - The event name.
   * @param {Function} callback - The event callback.
   */
  on(name, callback) {
    if (typeof name !== 'string') throw new TypeError('Expected string.');

    if (typeof callback !== 'function')
      throw new TypeError('Expected function.');

    if (this.hasEventListener(name, callback))
      throw new Error('Event handler already registered.');

    this._event_handlers = addEventHandler(
      this._event_handlers,
      name,
      callback
    );
  }

  /**
   * Alias for on.
   */
  addEventListener(name, callback) {
    return this.on(name, callback);
  }

  /**
   * Removes an event handler.
   *
   * @param {string} name - The event name.
   * @param {Function} callback - The event callback.
   */
  off(name, callback) {
    if (typeof name !== 'string') throw new TypeError('Expected string.');

    if (typeof callback !== 'function')
      throw new TypeError('Expected function.');

    this._event_handlers = removeEventHandler(
      this._event_handlers,
      name,
      callback
    );
  }

  /**
   * Alias for off.
   */
  removeEventListener(name, callback) {
    return this.off(name, callback);
  }

  /**
   * Returns true if the specified event handler is registered.
   * If no callback is specified, true is returned if any event
   * handler is installed for the given event name.
   *
   * @param {string} name - The event name.
   * @param {Function} callback - The event callback.
   */
  hasEventListener(name, callback) {
    if (typeof name !== 'string') throw new TypeError('Expected string.');

    const handlers = this._event_handlers;

    return hasEventHandler(handlers, name, callback);
  }

  /**
   * Emit an event.
   *
   * Event processing stops when the first event handler returns
   * anything other than undefined.
   *
   * If an event handler throws an exception, it is logged to the
   * developer console.
   *
   * @params {string} name - The event name.
   * @param {...*} args - Event arguments.
   *
   * @returns - Returns the value returned by the last event handler
   *            called or undefined.
   */
  emit(name, ...args) {
    if (typeof name !== 'string') throw new TypeError('Expected string.');

    return emitEvent(this._event_handlers, name, this, args);
  }

  /**
   * This method is similar to emit() except that it returns false
   * if an event handler stopped event processing.
   *
   * @params {string} name - The event name.
   * @param {...*} args - Event arguments.
   *
   * @returns {boolean} - The return value is false, if an event
   *                      handler cancelled the event processing
   *                      by returning something other than undefined.
   *                      Otherwise, the return value is true.
   */
  dispatchEvent(name, ...args) {
    return this.emit(name, ...args) === void 0;
  }

  /**
   * Register an event handler. If the same event handler is already
   * registered, an exception is thrown.
   *
   * This method returns a function which removes the event handler.
   *
   * @param {string} name - The event name.
   * @param {Function} callback - The event callback.
   *
   * @returns {Function} - The return value is a function which can
   *                       be called to remove the event subscription.
   */
  subscribe(event, func) {
    if (this.hasEventListener(event, func)) {
      throw new Error('Event handler already registered.');
    }

    let active = true;
    this.on(event, func);

    return () => {
      if (!active) return;
      active = false;
      this.off(event, func);
    };
  }

  /**
   * Register an event handler to be executed once.
   *
   * @param {string} name - The event name.
   * @param {Function} callback - The event callback.
   *
   * @returns {Function} - The return value is a function which can
   *                       be called to remove the event subscription.
   */
  once(event, func) {
    const sub = this.subscribe(event, (...args) => {
      sub();
      return func(...args);
    });

    return sub;
  }

  /**
   * Removes all event handlers.
   */
  destroy() {
    this._event_handlers = null;
  }
}
