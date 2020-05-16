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
 * Utilities for handling subscriptions.
 *
 * @module utils/subscriptions
 */

import { warn } from './log.js';
import { typecheck_function } from './typecheck.js';

export function init_subscriptions() {
  return null;
}

function copy(sub) {
  if (Array.isArray(sub)) return sub.slice(0);
  return sub;
}

/**
 * Adds the Subscription(s) subscription to the Subscriptions subscriptions.
 * This function returns the new subscriptions. It may modify the first
 * argument.
 */
export function add_subscription(subscriptions, subscription) {
  if (subscriptions === null) {
    return copy(subscription);
  } else if (Array.isArray(subscriptions)) {
    if (Array.isArray(subscription)) {
      return subscriptions.concat(subscription);
    }

    if (subscription !== null) {
      typecheck_function(subscription);
      subscriptions.push(subscription);
    }

    return subscriptions;
  } else {
    typecheck_function(subscriptions);

    if (Array.isArray(subscription)) {
      return [subscriptions].concat(subscription);
    }

    if (subscription !== null) {
      typecheck_function(subscription);
      return [subscriptions, subscription];
    }

    return subscriptions;
  }
}

function safe_call(cb) {
  try {
    cb();
  } catch (err) {
    warn('Unsubscription handler threw an exception: %o', err);
  }
}

/**
 * Unsubscribe all subscriptions.
 */
export function unsubscribe_subscriptions(subscriptions) {
  if (subscriptions === null) return null;

  if (Array.isArray(subscriptions)) {
    for (let i = 0; i < subscriptions.length; i++) {
      safe_call(subscriptions[i]);
    }
  } else {
    safe_call(subscriptions);
  }

  return null;
}

/**
 * Represents a Subscription.
 */
export class Subscription {
  constructor(subscription) {
    if (subscription !== void 0) {
      if (subscription instanceof Subscription) {
        subscription = subscription.sub;
      }
    } else {
      subscription = init_subscriptions();
    }

    this.sub = subscription;
  }

  /**
   * Unsubscribe from all subscriptions.
   */
  unsubscribe() {
    this.sub = unsubscribe_subscriptions(this.sub);
  }

  /**
   * A binary flag which indicates that this subscription has
   * already been unsubscribed.
   */
  get closed() {
    return this.sub === null;
  }
}

/**
 * Represents a set of Subscriptions.
 */
export class Subscriptions extends Subscription {
  /**
   * Add a subscription.
   */
  add(subscription) {
    if (subscription instanceof Subscription) {
      subscription = subscription.sub;
    } else {
      this.sub = add_subscription(this.sub, subscription);
    }
  }
}
