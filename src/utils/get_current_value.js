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
 * Synchronously sample the current value of a {@link ReadableValue}.
 *
 * @module utils/get_current_value
 */

/**
 * Returns the value delivered synchronously during `subscribe`, or
 * `initialValue` if the source did not emit before `subscribe` returned.
 *
 * Stateful sources (e.g. AWML `DynamicValue`, RxJS `BehaviorSubject`) emit
 * their current value on subscribe; pure event streams typically do not.
 *
 * @template T
 * @param {{ subscribe: function }} readable
 * @param {T} [initialValue]
 * @returns {T|undefined}
 */
export function getCurrentValue(readable, initialValue) {
  let value = initialValue;

  const unsubscribe = readable.subscribe((next) => {
    value = next;
  });
  unsubscribe();

  return value;
}
