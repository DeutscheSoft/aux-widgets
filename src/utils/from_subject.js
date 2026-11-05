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
 * Adapt Observable / Subject-like streams to aux value contracts.
 *
 * @module utils/from_subject
 */

/**
 * Normalize an Observable-like `subscribe` teardown to an {@link Unsubscribe}
 * function.
 *
 * @param {(() => void) | { unsubscribe: function } | null | undefined} subscription
 * @returns {() => void}
 */
function toUnsubscribe(subscription) {
  if (subscription == null) return () => {};

  if (typeof subscription === 'function') return subscription;

  if (
    typeof subscription === 'object' &&
    typeof subscription.unsubscribe === 'function'
  ) {
    return () => subscription.unsubscribe();
  }

  throw new TypeError(
    'Expected unsubscribe function or object with unsubscribe().'
  );
}

/**
 * Wraps an {@link ObservableLike} as a {@link ReadableValue} by normalizing
 * `subscribe` teardown to a function (RxJS `{ unsubscribe() }` → `() => …`).
 *
 * @template T
 * @param {{ subscribe: function }} observable
 * @returns {{ subscribe: function }}
 */
export function fromObservable(observable) {
  if (!observable || typeof observable.subscribe !== 'function') {
    throw new TypeError('Expected ObservableLike with subscribe().');
  }

  return {
    subscribe(subscriber) {
      return toUnsubscribe(observable.subscribe(subscriber));
    },
  };
}

/**
 * Wraps a {@link SubjectLike} as a {@link ReadwriteValue} by normalizing
 * subscribe teardown (via {@link fromObservable}) and mapping `set(value)` to
 * `subject.next(value)`.
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

  const readable = fromObservable(subject);

  return {
    subscribe: readable.subscribe,
    set(value) {
      return subject.next(value);
    },
  };
}
