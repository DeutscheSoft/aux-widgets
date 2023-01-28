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
 * @module utils/timer
 */

import { error } from './log.js';
import { typecheckFunction } from './typecheck.js';

/**
 * This class represents a single timer. It is faster than manual setTimeout
 * in situations in which the timer is regularly delayed while it is running.
 */
export class Timer {
  /**
   *
   * @param callback - The callback to be called when the timer expires.
   */
  constructor(callback) {
    typecheckFunction(callback);
    this.callback = callback;
    this.id = void 0;
    this.time = 0;
    this._cb = () => {
      const delta = this.time - performance.now();

      this.id = void 0;

      if (delta < 1) {
        this.callback();
      } else {
        this.id = setTimeout(this._cb, delta);
      }
    };
  }

  /**
   * Start the timer with a given offset. Same as restart().
   */
  start(delta) {
    this.restart(delta);
  }

  /**
   * Set a new expiry time for the timer at the given number
   * of milliseconds from now.
   *
   * @param delta - Offset in milliseconds.
   */
  restart(delta) {
    if (!(delta >= 0))
      throw new TypeError('Expected non-negative number.');

    const time = performance.now() + delta;
    const id = this.id;

    if (id !== void 0) {
      if (time > this.time) {
        this.time = time;
        return;
      }

      clearTimeout(id);
    }

    this.time = time;
    this.id = setTimeout(this._cb, delta);
  }

  get active() {
    return this.id !== void 0;
  }

  /**
   * Stop the timer.
   */
  stop() {
    const id = this.id;

    if (id === void 0) return;
    this.id = void 0;

    clearTimeout(id);
  }
}

export class ProximityTimers {
  constructor(accuracy) {
    this._target = 0;
    this._calls = null;
    this._accuracy = accuracy === void 0 ? 20 : accuracy;
  }

  /**
   * Schedule a method to be run at the given point
   * in the future.
   */
  scheduleAt(callback, target) {
    if (
      this._calls !== null &&
      Math.abs(this._target - target) < this._accuracy
    ) {
      this._calls.push(callback);
    } else {
      const calls = [callback];

      this._calls = calls;
      this._target = target;
      setTimeout(() => {
        calls.forEach((cb) => {
          try {
            cb();
          } catch (err) {
            error(err);
          }
        });
      }, performance.now() - target);
    }
  }

  /**
   * Schedule a method to be run in the given number of seconds.
   */
  scheduleIn(callback, offset) {
    this.scheduleAt(callback, offset + performance.now());
  }
}

/**
 * Initialize a timer from a given callback. Returns
 * the timer handle.
 */
export function createTimer(callback) {
  typecheckFunction(callback);
  return callback;
}

/**
 * Reschedules the timer for the given timer handle. Returns
 * the new timer handle.
 */
export function startTimer(timer, delta) {
  if (typeof timer === 'function') timer = new Timer(timer);

  timer.start(delta);
  return timer;
}

/**
 * Stops the timer for the given timer handle. Returns
 * the new timer handle.
 */
export function destroyTimer(timer) {
  if (typeof timer === 'function') return timer;

  timer.stop();

  return timer.callback;
}

/**
 * Cancels the timer for the given timer handle. Returns
 * the new timer handle.
 */
export function cancelTimer(timer) {
  if (typeof timer !== 'function') timer.stop();

  return timer;
}
