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
 * Utilities for handling subscribers.
 *
 * @module utils/subscribers
 */

import { warn } from './log.js';

// Grow into a Set once the list is large enough that array remove gets
// expensive. Shrink back to an array at a lower size so a list near the
// boundary does not convert on every add and remove.
const TO_SET = 32;
const TO_ARRAY = 16;

function expectedSubscribers() {
  throw new TypeError('Expected list of subscribers.');
}

/**
 * Initialize a list of subscribers.
 */
export function initSubscribers() {
  return null;
}

/**
 * Returns true if the given subscribers are empty.
 */
export function subscribersIsEmpty(subscribers) {
  return subscribers === null;
}

/**
 * Returns true if the given callback is in the list of subscribers.
 */
export function hasSubscriber(subscribers, cb) {
  if (typeof cb !== 'function') throw new TypeError('Expected function.');

  if (subscribers === null) {
    return false;
  } else if (typeof subscribers === 'function') {
    return subscribers === cb;
  } else if (Array.isArray(subscribers)) {
    return subscribers.includes(cb);
  } else if (subscribers instanceof Set) {
    return subscribers.has(cb);
  } else expectedSubscribers();
}

/**
 * Call callback for each subscriber.
 *
 * If callback returns a value other than undefined, iteration stops and that
 * value is returned.
 */
export function forEachSubscriber(subscribers, callback) {
  if (subscribers === null) return;

  if (typeof subscribers === 'function') {
    return callback(subscribers);
  } else if (Array.isArray(subscribers)) {
    for (let i = 0; i < subscribers.length; i++) {
      const result = callback(subscribers[i]);

      if (result !== void 0) return result;
    }
  } else if (subscribers instanceof Set) {
    for (const cb of subscribers) {
      const result = callback(cb);

      if (result !== void 0) return result;
    }
  } else expectedSubscribers();
}

function subscriberAlreadyAdded() {
  throw new Error('Adding subscriber twice.');
}

/**
 * Add a subscriber to the given subscribers. Returns the new subscribers.
 */
export function addSubscriber(subscribers, cb) {
  if (typeof cb !== 'function') throw new TypeError('Expected function.');

  if (subscribers === null) {
    return cb;
  } else if (typeof subscribers === 'function') {
    if (subscribers === cb) subscriberAlreadyAdded();

    return [subscribers, cb];
  } else if (Array.isArray(subscribers)) {
    if (subscribers.includes(cb)) subscriberAlreadyAdded();

    subscribers.push(cb);
    return subscribers.length >= TO_SET ? new Set(subscribers) : subscribers;
  } else if (subscribers instanceof Set) {
    if (subscribers.has(cb)) subscriberAlreadyAdded();

    subscribers.add(cb);
    return subscribers;
  } else expectedSubscribers();
}

function subscriberNotFound() {
  throw new Error('Subscriber not found.');
}

function subscribersFromSet(subscribers) {
  const size = subscribers.size;

  if (size === 0) return null;
  if (size === 1) return subscribers.values().next().value;
  if (size <= TO_ARRAY) return Array.from(subscribers);

  return subscribers;
}

function cloneSubscribers(subscribers) {
  if (subscribers === null) {
    return null;
  } else if (typeof subscribers === 'function') {
    return subscribers;
  } else if (Array.isArray(subscribers)) {
    return subscribers.slice();
  } else if (subscribers instanceof Set) {
    return new Set(subscribers);
  } else expectedSubscribers();
}

/**
 * Merge two subscriber lists. Returns a new list with the subscribers from
 * `a` followed by any subscribers from `b` that are not already present.
 * Neither argument is modified.
 */
export function mergeSubscribers(a, b) {
  if (a == null) return cloneSubscribers(b ?? null);
  if (b == null) return cloneSubscribers(a);

  let result = cloneSubscribers(a);

  forEachSubscriber(b, (cb) => {
    if (!hasSubscriber(result, cb)) result = addSubscriber(result, cb);
  });

  return result;
}

/**
 * Removes a subscriber callback from the list of subscribers and
 * returns the resulting list of subscribers.
 */
export function removeSubscriber(subscribers, cb) {
  if (typeof cb !== 'function') throw new TypeError('Expected function.');

  if (subscribers === null) {
    subscriberNotFound();
  } else if (typeof subscribers === 'function') {
    if (subscribers !== cb) subscriberNotFound();

    return null;
  } else if (Array.isArray(subscribers)) {
    const tmp = subscribers.filter((_cb) => _cb !== cb);

    if (tmp.length === subscribers.length) subscriberNotFound();

    return tmp.length === 1 ? tmp[0] : tmp;
  } else if (subscribers instanceof Set) {
    if (!subscribers.delete(cb)) subscriberNotFound();

    return subscribersFromSet(subscribers);
  } else expectedSubscribers();
}

export function subscriberError(err) {
  warn('Subscriber generated an exception:', err);
}

/**
 * Call the list of subscribers.
 */
export function callSubscribers(subscribers, ...args) {
  if (subscribers === null) return;

  if (typeof subscribers === 'function') {
    try {
      subscribers(...args);
    } catch (err) {
      subscriberError(err);
    }
  } else if (Array.isArray(subscribers)) {
    for (let i = 0; i < subscribers.length; i++) {
      try {
        subscribers[i](...args);
      } catch (err) {
        subscriberError(err);
      }
    }
  } else if (subscribers instanceof Set) {
    for (const cb of subscribers) {
      try {
        cb(...args);
      } catch (err) {
        subscriberError(err);
      }
    }
  } else expectedSubscribers();
}

/**
 * A class for representing a list of subscribers.
 */
export class Subscribers {
  constructor() {
    this.subscribers = initSubscribers();
  }

  /**
   * Add a subscriber.
   *
   * @param {Function} cb
   */
  add(cb) {
    this.subscribers = addSubscriber(this.subscribers, cb);
  }

  /**
   * Remove a subscriber.
   *
   * @param {Function} cb
   */
  remove(cb) {
    this.subscribers = removeSubscriber(this.subscribers, cb);
  }

  /**
   * Call the subscribers.
   */
  call(...args) {
    callSubscribers(this.subscribers, ...args);
  }

  /**
   * Subscribe a new subscriber.
   *
   * @returns {Function} A subscriptions. Call to function to unsubscribe.
   */
  subscribe(cb) {
    this.add(cb);

    return () => {
      this.remove(cb);
    };
  }

  /**
   * Delete all subscribers.
   */
  destroy() {
    this.subscribers = initSubscribers();
  }
}
