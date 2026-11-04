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
 * @module utils/global_events
 */

import { typecheckFunction } from './typecheck.js';

/**
 * Installs and removes DOM event listeners on a global (or other shared)
 * target. Call {@link GlobalEventHandler#activate} / {@link GlobalEventHandler#deactivate}
 * to arm and disarm the listener(s), and {@link GlobalEventHandler#destroy} from
 * widget `destroy()` so nothing is left attached after teardown.
 *
 * Typical use: outside-click / outside-pointer handlers that must not stay
 * registered when the widget is gone.
 */
export class GlobalEventHandler {
  /**
   * @param {EventTarget} target - Element or document to listen on.
   * @param {string|string[]} type - Event type, or list of types sharing one callback.
   * @param {EventListener} callback - Listener callback.
   * @param {boolean|AddEventListenerOptions} [options] - Options passed to
   *   `addEventListener` / `removeEventListener`.
   */
  constructor(target, type, callback, options) {
    typecheckFunction(callback);
    this._target = target;
    this._types = Array.isArray(type) ? type.slice() : [type];
    this._callback = callback;
    this._options = options;
    this._active = false;
  }

  /** Whether the listener(s) are currently installed. */
  get active() {
    return this._active;
  }

  /** Install the listener(s) if not already active. */
  activate() {
    if (this._active) return;
    this._active = true;
    const target = this._target;
    const callback = this._callback;
    const options = this._options;
    for (let i = 0; i < this._types.length; i++) {
      target.addEventListener(this._types[i], callback, options);
    }
  }

  /** Remove the listener(s) if currently active. */
  deactivate() {
    if (!this._active) return;
    this._active = false;
    const target = this._target;
    const callback = this._callback;
    const options = this._options;
    for (let i = 0; i < this._types.length; i++) {
      target.removeEventListener(this._types[i], callback, options);
    }
  }

  /**
   * Activate or deactivate to match `on`.
   * @param {boolean} on
   */
  setActive(on) {
    if (on) this.activate();
    else this.deactivate();
  }

  /** Deactivate. Safe to call more than once. */
  destroy() {
    this.deactivate();
  }
}
