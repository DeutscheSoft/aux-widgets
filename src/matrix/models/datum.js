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
 * @module matrix
 */

import { Events } from '../../events.js';

/**
 * Base class for data model objects.
 */
export class Datum extends Events {
  constructor(o) {
    super();
    this.properties = {};

    if (o) {
      for (const name in o)
        if (Object.prototype.hasOwnProperty.call(o, name)) {
          this.set(name, o[name]);
        }
    }
  }

  set(name, value) {
    this.properties[name] = value;
    this.emit('propertyChanged', name, value);
    return value;
  }

  get(name) {
    return this.properties[name];
  }

  /**
   * Observe a property. The callback will be
   * called immediately with the current value
   * and whenever the property changes.
   *
   * @param {string} name The property name.
   * @param {Function} callback The callback function.
   */
  observe(name, callback) {
    callback(this[name]);

    return this.subscribe('propertyChanged', (key, value) => {
      if (key === name) callback(value);
    });
  }
}
