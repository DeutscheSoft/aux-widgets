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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
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

function expected_subscribers() {
  throw new TypeError('Expected list of subscribers.');
}

/**
 * Initialize a list of subscribers.
 */
export function init_subscribers() {
  return null;
}

/**
 * Returns true if the given subscribers are empty.
 */
export function subscribers_is_empty(subscribers) {
  return subscribers === null;
}

/**
 * Add a subscriber to the given subscribers. Returns the new subscribers.
 */
export function add_subscriber(subscribers, cb) {
  if (typeof cb !== 'function') throw new TypeError('Expected function.');

  if (subscribers === null) {
    return cb;
  } else if (typeof subscribers === 'function') {
    return [subscribers, cb];
  } else if (Array.isArray(subscribers)) {
    return subscribers.concat([cb]);
  } else expected_subscribers();
}

function subscriber_not_found() {
  throw new Error('Subscriber not found.');
}

/**
 * Removes a subscriber callback from the list of subscribers and
 * returns the resulting list of subscribers.
 */
export function remove_subscriber(subscribers, cb) {
  if (typeof cb !== 'function') throw new TypeError('Expected function.');

  if (subscribers === null) {
    subscriber_not_found();
  } else if (typeof subscribers === 'function') {
    if (subscribers !== cb) subscriber_not_found();

    return null;
  } else if (Array.isArray(subscribers)) {
    const tmp = subscribers.filter((_cb) => _cb !== cb);

    if (tmp.length === subscribers.length) subscriber_not_found();

    return tmp.length === 1 ? tmp[0] : tmp;
  } else expected_subscribers();
}

function subscriber_error(err) {
  warn('Subscriber generated an exception:', err);
}

/**
 * Call the list of subscribers.
 */
export function call_subscribers(subscribers, ...args) {
  if (subscribers === null) return;

  if (typeof subscribers === 'function') {
    try {
      subscribers(...args);
    } catch (err) {
      subscriber_error(err);
    }
  } else if (Array.isArray(subscribers)) {
    for (let i = 0; i < subscribers.length; i++) {
      try {
        subscribers[i](...args);
      } catch (err) {
        subscriber_error(err);
      }
    }
  } else expected_subscribers();
}

/**
 * A class for representing a list of subscribers.
 */
export class Subscribers {
  constructor() {
    this.subscribers = init_subscribers();
  }

  /**
   * Add a subscriber.
   *
   * @param {Function} cb
   */
  add(cb) {
    this.subscribers = add_subscriber(this.subscribers, cb);
  }

  /**
   * Remove a subscriber.
   *
   * @param {Function} cb
   */
  remove(cb) {
    this.subscribers = remove_subscriber(this.subscribers, cb);
  }

  /**
   * Call the subscribers.
   */
  call(...args) {
    call_subscribers(this.subscribers, ...args);
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
    this.subscribers = init_subscribers();
  }
}
