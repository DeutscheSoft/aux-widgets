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
    if (!(delta >= 0)) throw new TypeError('Expected non-negative number.');

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

/**
 * Leading/trailing debounce based on time since the last successful run.
 *
 * - If at least `delay` ms have passed since the last run (or it never ran),
 *   {@link DebounceTimer#trigger} runs the callback immediately.
 * - Otherwise the call is coalesced: a trailing run is scheduled `delay` ms
 *   after the latest trigger (timer is restarted), and any pending timer is
 *   always cleared on {@link DebounceTimer#destroy}.
 */
export class DebounceTimer {
  /**
   * @param {function(): void} callback - Invoked on leading and trailing runs.
   * @param {number} delay - Debounce interval in milliseconds.
   */
  constructor(callback, delay) {
    typecheckFunction(callback);
    if (!(delay > 0)) throw new TypeError('Expected positive number.');

    this._callback = callback;
    this._delay = delay;
    this._lastRun = Number.NEGATIVE_INFINITY;
    this._timer = new Timer(() => this._run());
  }

  /**
   * Request a run. May invoke the callback immediately (leading) and/or
   * schedule a trailing run.
   */
  trigger() {
    const now = performance.now();

    if (now - this._lastRun >= this._delay) {
      this._timer.stop();
      this._run(now);
    } else {
      this._timer.restart(this._delay);
    }
  }

  /**
   * Stop any pending trailing timer. Does not change `_lastRun`.
   */
  destroy() {
    this._timer.stop();
  }

  _run(now = performance.now()) {
    this._lastRun = now;
    this._callback();
  }
}

export class ProximityTimers {
  /**
   * @param accuracy - Maximum span (milliseconds) within which distinct target
   *   times are merged into one timer. Defaults to 20.
   */
  constructor(accuracy) {
    this._target = 0;
    this._calls = null;
    this._accuracy = accuracy === void 0 ? 20 : accuracy;
  }

  /**
   * Schedule a method to be run at the given absolute time on the same timeline
   * as `performance.now()` (milliseconds).
   *
   * @param callback - The callback to run when the timer fires.
   * @param target - Absolute time in milliseconds (e.g. `performance.now() + delay`).
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
        if (this._calls === calls) {
          this._calls = null;
          this._target = 0;
        }
        calls.forEach((cb) => {
          try {
            cb();
          } catch (err) {
            error(err);
          }
        });
      }, Math.max(0, target - performance.now()));
    }
  }

  /**
   * Schedule a method to be run after the given offset from now.
   *
   * @param callback - The callback to run when the timer fires.
   * @param offset - Delay in milliseconds.
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
