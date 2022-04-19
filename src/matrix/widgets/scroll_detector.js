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

import { Timer } from '../../utils/timers.js';

export class ScrollDetector {
  _recentScrollTo() {
    return performance.now() - this._lastScrollTo < this._interval;
  }

  _recentScrollEvent() {
    return performance.now() - this._lastScrollEvent < this._interval;
  }

  _reset() {
    //console.log('reset');
    this._lastScrollTo = 0.0;
    this._lastScrollEvent = 0.0;
  }

  constructor(interval) {
    this._interval = interval;
    this._reset();
    this._callback = null;
    this._timer = new Timer(() => {
      this._reset();
      const callback = this._callback;
      this._callback = null;
      if (callback) callback();
    });
  }

  maybeScrollEvent(callback) {
    if (this._recentScrollTo()) {
      this._callback = callback;
      //console.log('scroll event suppressed.');
      return false;
    }
    this._lastScrollEvent = performance.now();
    this._timer.restart(this._interval);
    callback();
    //console.log('scroll event accepted.');
    return true;
  }

  /**
   * Executes the callback (which is expected to call scrollTo)
   * if there was not a recent scroll event triggered first. If there was a
   * recent scroll event (signalled by calling maybeScrollEvent), the callback
   * is registered and called when the timer expires.
   *
   * @param {function} callback
   * @returns {boolean}
   *    Returns ``false`` if the callback was not called, ``true`` otherwise.
   */
  maybeScrollTo(callback) {
    if (this._recentScrollEvent()) {
      this._callback = callback;
      return false;
    }
    this._lastScrollTo = performance.now();
    this._timer.restart(this._interval);
    callback();
    return true;
  }

  destroy() {
    this._timer.stop();
  }
}
