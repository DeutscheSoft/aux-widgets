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
 * Adapt Subject-like streams to {@link ReadwriteValue}.
 *
 * @module utils/from_subject
 */

/**
 * Wraps a {@link SubjectLike} as a {@link ReadwriteValue} by mapping
 * `set(value)` to `subject.next(value)`. `subscribe` is forwarded unchanged
 * (including Observable-style `{ unsubscribe() }` teardown).
 *
 * @template T
 * @param {{ subscribe: function, next: function }} subject
 * @returns {{ subscribe: function, set: function }}
 */
export function fromSubject(subject) {
  if (
    !subject ||
    typeof subject.subscribe !== 'function' ||
    typeof subject.next !== 'function'
  ) {
    throw new TypeError('Expected SubjectLike with subscribe() and next().');
  }

  return {
    subscribe(subscriber) {
      return subject.subscribe(subscriber);
    },
    set(value) {
      return subject.next(value);
    },
  };
}
