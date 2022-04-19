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

import { typecheckFunction } from './typecheck.js';
import { subscriberError } from './subscribers.js';

export class EventMultiplexer {
  constructor(activate) {
    this.activate = activate;
    this.deactivate = null;
    this.subscribers = new Set();
    this._call = (...args) => {
      this.subscribers.forEach((cb) => {
        try {
          cb(...args);
        } catch (err) {
          subscriberError(err);
        }
      });
    };
  }

  add(cb) {
    typecheckFunction(cb);

    const subscribers = this.subscribers;
    const do_activate = subscribers.size === 0;

    if (subscribers.has(cb)) throw new Error('Adding subscriber twice.');

    subscribers.add(cb);

    if (!do_activate) return;

    this.deactivate = this.activate(this._call);
  }

  delete(cb) {
    const subscribers = this.subscribers;

    typecheckFunction(cb);

    if (!subscribers.delete(cb)) throw new Error('Unknown subscriber.');

    if (subscribers.size > 0) return;

    this.deactivate();
    this.deactivate = null;
  }
}
